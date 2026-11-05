"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Trash2, Star, CheckCircle, AlertCircle } from "lucide-react";
import { createRoomAction } from "@/app/actions/admin-rooms";
import { createClient } from "@/utils/supabase/client";

export default function NewRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const handleFeaturedSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFeaturedFile(file);
      setFeaturedPreview(URL.createObjectURL(file));
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setGalleryFiles([...galleryFiles, ...selectedFiles]);
      setGalleryPreviews([...galleryPreviews, ...selectedFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  const compressImageFile = async (file: File): Promise<File | Blob> => {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
            } else {
              const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
                type: "image/webp",
              });
              resolve(compressed);
            }
          },
          "image/webp",
          0.82
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    let imageUrls: string[] = [];
    
    try {
      // Safely ensure bucket exists (if client has permissions; otherwise created via SQL)
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        if (buckets && !buckets.find(b => b.name === 'room-images')) {
          await supabase.storage.createBucket('room-images', { public: true });
        }
      } catch (bucketErr) {
        // Ignored: bucket is provisioned via Supabase SQL setup
      }

      // Upload Featured Image
      let featuredUrl = "";
      if (featuredFile) {
        const fileToUpload = await compressImageFile(featuredFile);
        const fileExt = fileToUpload instanceof File ? fileToUpload.name.split('.').pop() : "webp";
        const fileName = `${Date.now()}-feat-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('room-images').upload(fileName, fileToUpload);
        if (error) throw new Error("Failed to upload featured image");
        if (data) {
          const { data: publicUrlData } = supabase.storage.from('room-images').getPublicUrl(data.path);
          featuredUrl = publicUrlData.publicUrl;
        }
      }

      // Upload Gallery Images
      let galleryUrls: string[] = [];
      for (const file of galleryFiles) {
        if (file.size > 0) {
          const fileToUpload = await compressImageFile(file);
          const fileExt = fileToUpload instanceof File ? fileToUpload.name.split('.').pop() : "webp";
          const fileName = `${Date.now()}-gal-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data, error } = await supabase.storage.from('room-images').upload(fileName, fileToUpload);
          
          if (error) throw new Error(`Failed to upload gallery image: ${file.name}`);
          
          if (data) {
            const { data: publicUrlData } = supabase.storage.from('room-images').getPublicUrl(data.path);
            galleryUrls.push(publicUrlData.publicUrl);
          }
        }
      }
      
      const combinedUrls = featuredUrl ? [featuredUrl, ...galleryUrls] : galleryUrls;
      
      // Clear out default file input entry and append imageUrls JSON string
      formData.delete("images");
      formData.delete("featured");
      formData.append("imageUrls", JSON.stringify(combinedUrls));

      const res = await createRoomAction(formData);

      if (res.success) {
        router.push("/admin/rooms");
      } else {
        setErrorMsg(res.error || "Failed to create room accommodation");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during room creation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 font-jost">
      {/* Top Action Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200/80">
        <div className="flex items-center gap-3">
          <Link href="/admin/rooms" className="text-zinc-600 hover:text-zinc-900 transition-colors p-1 rounded-lg hover:bg-zinc-100">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">Add accommodation</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Create a new suite with inventory, pricing, and photography.</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content Column */}
        <div className="flex-1 flex flex-col gap-5">
          
          {/* Title Input */}
          <div className="bg-white border border-zinc-200/80 p-4 shadow-sm rounded-sm">
            <input 
              name="title" 
              type="text" 
              required 
              placeholder="Add Accommodation Title (e.g., Deluxe Oceanfront Suite)" 
              className="w-full text-xl font-medium text-zinc-900 border border-zinc-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 placeholder:text-[#646970]"
            />
          </div>

          {/* Description Editor Box */}
          <div className="bg-white border border-zinc-200/80 shadow-sm rounded-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-200/80 px-3 py-2 text-[14px] font-semibold text-zinc-900">
              Accommodation Description
            </div>
            <div className="p-3">
              <textarea 
                name="description" 
                rows={7} 
                required 
                placeholder="Enter detailed room description, architectural features, and luxury specifications..."
                className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-[14px] text-zinc-700 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 leading-relaxed resize-y"
              ></textarea>
            </div>
          </div>

          {/* Room Data / Specifications Box */}
          <div className="bg-white border border-zinc-200/80 shadow-sm rounded-sm">
            <div className="bg-zinc-50 border-b border-zinc-200/80 px-3 py-2 text-[14px] font-semibold text-zinc-900">
              Room Data & Pricing
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-900">Nightly Rate (PKR)</label>
                <input 
                  name="price_per_night" 
                  type="number" 
                  required 
                  min={0}
                  placeholder="e.g. 15000"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-900">Guest Capacity (Max Persons)</label>
                <input 
                  name="capacity" 
                  type="number" 
                  required 
                  min={1}
                  defaultValue={2}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* NEW FIELD: Total Available Quantity in Hotel */}
              <div className="flex flex-col gap-1.5 col-span-full border-t border-zinc-200/80 pt-4 mt-2">
                <label className="text-[13px] font-semibold text-zinc-700 flex items-center gap-1.5">
                  Total Physical Rooms of this Type in Hotel (Inventory Quantity)
                </label>
                <input 
                  name="total_rooms" 
                  type="number" 
                  required 
                  min={1}
                  defaultValue={1}
                  placeholder="e.g. 5 (Number of rooms of this category in hotel)"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 font-semibold focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
                <p className="text-[12px] text-[#646970] leading-normal">
                  Specify how many physical rooms of this accommodation category exist in the hotel (e.g., 5 Deluxe Suites). The booking engine will allow up to this quantity of overlapping bookings for the same dates.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="w-full lg:w-[320px] flex flex-col gap-5">
          
          {/* Publish Metabox */}
          <div className="bg-white border border-zinc-200/80 shadow-sm rounded-sm">
            <div className="bg-zinc-50 border-b border-zinc-200/80 px-3 py-2 text-[14px] font-semibold text-zinc-900">
              Publish Settings
            </div>
            <div className="p-3 bg-white">
              <div className="flex items-center gap-2 mb-3 text-[13px] text-[#50575e]">
                <span className="font-semibold text-zinc-900">Status:</span> Draft
              </div>
              <div className="flex items-center gap-2 mb-4 text-[13px] text-[#50575e]">
                <span className="font-semibold text-zinc-900">Visibility:</span> Public
              </div>
            </div>
            <div className="p-3 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-zinc-900 hover:bg-zinc-800 border border-[#2271b1] text-white text-[13px] px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? "Publishing..." : "Publish Accommodation"}
              </button>
            </div>
          </div>

          {/* Amenities Metabox */}
          <div className="bg-white border border-zinc-200/80 shadow-sm rounded-sm">
            <div className="bg-zinc-50 border-b border-zinc-200/80 px-3 py-2 text-[14px] font-semibold text-zinc-900">
              Amenities & Tags
            </div>
            <div className="p-3">
              <textarea 
                name="amenities" 
                rows={3}
                placeholder="Oceanfront, Jacuzzi, Private Balcony, Mini Bar (comma separated)"
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 resize-none"
              ></textarea>
              <p className="text-[12px] text-[#646970] mt-1 italic">Separate amenities with commas.</p>
            </div>
          </div>

          {/* Featured Image Metabox */}
          <div className="bg-white border border-zinc-200/80 shadow-sm rounded-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-200/80 px-3 py-2 text-[14px] font-semibold text-zinc-900">
              Featured Image
            </div>
            <div className="p-3 space-y-3">
              {featuredPreview && (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-300 bg-white">
                  <img src={featuredPreview} alt="Featured Preview" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-[#2271b1] text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 shadow-sm">
                    <Star size={12} className="fill-white" /> Featured
                  </span>
                  <button
                    type="button"
                    onClick={() => { setFeaturedFile(null); setFeaturedPreview(null); }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors shadow-md"
                    title="Remove Image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
              
              {!featuredPreview && (
                <div className="border-2 border-dashed border-zinc-200 bg-zinc-50 p-4 text-center rounded-lg relative overflow-hidden group hover:bg-[#f0f0f1] hover:border-[#2271b1] transition-colors cursor-pointer">
                  <input 
                    name="featured"
                    type="file" 
                    accept="image/*"
                    onChange={handleFeaturedSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <ImagePlus size={24} className="text-zinc-700" />
                    <span className="text-[13px] text-zinc-700 font-medium underline">
                      Set Featured Image
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Room Gallery / Images Metabox */}
          <div className="bg-white border border-zinc-200/80 shadow-sm rounded-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-200/80 px-3 py-2 text-[14px] font-semibold text-zinc-900 flex justify-between items-center">
              <span>Room Gallery</span>
              <span className="text-[11px] font-normal bg-[#2271b1] text-white px-2 py-0.5 rounded-full">
                {galleryFiles.length} {galleryFiles.length === 1 ? 'image' : 'images'}
              </span>
            </div>
            
            <div className="p-3 space-y-3">
              {/* Image Preview Grid */}
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto p-1 border border-zinc-200/80 rounded-lg bg-gray-50">
                  {galleryPreviews.map((src, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-300 bg-white">
                      <img 
                        src={src} 
                        alt={`Gallery ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded transition-colors opacity-90 group-hover:opacity-100 shadow-md"
                        title="Remove Image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-zinc-200 bg-zinc-50 p-4 text-center rounded-lg relative overflow-hidden group hover:bg-[#f0f0f1] hover:border-[#2271b1] transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleGallerySelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <ImagePlus size={24} className="text-zinc-700" />
                  <span className="text-[13px] text-zinc-700 font-medium underline">
                    {galleryPreviews.length === 0 ? "Upload Gallery Images" : "Add More Images"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
