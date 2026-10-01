"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Trash2, Star, CheckCircle, AlertCircle } from "lucide-react";
import { createRoomAction } from "@/app/actions/admin-rooms";

export default function NewRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Image upload handling
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);

      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    
    // Clear out default file input entry and append state files
    formData.delete("images");
    files.forEach(file => {
      formData.append("images", file);
    });

    const res = await createRoomAction(formData);

    if (res.success) {
      router.push("/admin/rooms");
    } else {
      setErrorMsg(res.error || "Failed to create room accommodation");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 font-sans">
      {/* Top Action Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#c3c4c7]">
        <div className="flex items-center gap-3">
          <Link href="/admin/rooms" className="text-[#2271b1] hover:text-[#135e96] transition-colors p-1">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-[#1d2327] font-semibold tracking-tight">Add New Accommodation</h1>
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
          <div className="bg-white border border-[#c3c4c7] p-4 shadow-sm rounded-sm">
            <input 
              name="title" 
              type="text" 
              required 
              placeholder="Add Accommodation Title (e.g., Deluxe Oceanfront Suite)" 
              className="w-full text-xl font-medium text-[#1d2327] border border-[#8c8f94] rounded-[3px] px-3.5 py-2.5 focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] placeholder:text-[#646970]"
            />
          </div>

          {/* Description Editor Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327]">
              Accommodation Description
            </div>
            <div className="p-3">
              <textarea 
                name="description" 
                rows={7} 
                required 
                placeholder="Enter detailed room description, architectural features, and luxury specifications..."
                className="w-full bg-white border border-[#8c8f94] rounded-[3px] p-3 text-[14px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] leading-relaxed resize-y"
              ></textarea>
            </div>
          </div>

          {/* Room Data / Specifications Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327]">
              Room Data & Pricing
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#1d2327]">Nightly Rate ($)</label>
                <input 
                  name="price_per_night" 
                  type="number" 
                  required 
                  min={0}
                  placeholder="e.g. 850"
                  className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#1d2327]">Guest Capacity (Max Persons)</label>
                <input 
                  name="capacity" 
                  type="number" 
                  required 
                  min={1}
                  defaultValue={2}
                  className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#1d2327]">Bed Configuration</label>
                <select 
                  name="bed_type"
                  className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                >
                  <option value="King">King Size Bed</option>
                  <option value="Queen">Queen Size Bed</option>
                  <option value="Twin">Twin Beds</option>
                  <option value="Double">Double Bed</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#1d2327]">Floor Area (sqft)</label>
                <input 
                  name="size_sqft" 
                  type="number" 
                  required 
                  min={1}
                  placeholder="e.g. 750"
                  className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                />
              </div>

              {/* NEW FIELD: Total Available Quantity in Hotel */}
              <div className="flex flex-col gap-1.5 col-span-full border-t border-[#c3c4c7] pt-4 mt-2">
                <label className="text-[13px] font-semibold text-[#2271b1] flex items-center gap-1.5">
                  Total Physical Rooms of this Type in Hotel (Inventory Quantity)
                </label>
                <input 
                  name="total_rooms" 
                  type="number" 
                  required 
                  min={1}
                  defaultValue={1}
                  placeholder="e.g. 5 (Number of rooms of this category in hotel)"
                  className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[14px] text-[#1d2327] font-semibold focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
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
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327]">
              Publish Settings
            </div>
            <div className="p-3 bg-white">
              <div className="flex items-center gap-2 mb-3 text-[13px] text-[#50575e]">
                <span className="font-semibold text-[#1d2327]">Status:</span> Draft
              </div>
              <div className="flex items-center gap-2 mb-4 text-[13px] text-[#50575e]">
                <span className="font-semibold text-[#1d2327]">Visibility:</span> Public
              </div>
            </div>
            <div className="p-3 bg-[#f6f7f7] border-t border-[#c3c4c7] flex items-center justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#2271b1] hover:bg-[#135e96] border border-[#2271b1] text-white text-[13px] px-5 py-2 rounded-[3px] font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? "Publishing..." : "Publish Accommodation"}
              </button>
            </div>
          </div>

          {/* Amenities Metabox */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327]">
              Amenities & Tags
            </div>
            <div className="p-3">
              <textarea 
                name="amenities" 
                rows={3}
                placeholder="Oceanfront, Jacuzzi, Private Balcony, Mini Bar (comma separated)"
                className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] resize-none"
              ></textarea>
              <p className="text-[12px] text-[#646970] mt-1 italic">Separate amenities with commas.</p>
            </div>
          </div>

          {/* Room Gallery / Images Metabox */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327] flex justify-between items-center">
              <span>Room Images & Gallery</span>
              <span className="text-[11px] font-normal bg-[#2271b1] text-white px-2 py-0.5 rounded-full">
                {files.length} {files.length === 1 ? 'image' : 'images'}
              </span>
            </div>
            
            <div className="p-3 space-y-3">
              {/* Image Preview Grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto p-1 border border-[#c3c4c7] rounded-[3px] bg-gray-50">
                  {previews.map((src, index) => (
                    <div key={index} className="relative group aspect-square rounded-[3px] overflow-hidden border border-gray-300 bg-white">
                      <img 
                        src={src} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-[#2271b1] text-white text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 shadow-sm">
                          <Star size={10} className="fill-white" /> Featured
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
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
              <div className="border-2 border-dashed border-[#8c8f94] bg-[#f6f7f7] p-4 text-center rounded-[3px] relative overflow-hidden group hover:bg-[#f0f0f1] hover:border-[#2271b1] transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <ImagePlus size={24} className="text-[#2271b1]" />
                  <span className="text-[13px] text-[#2271b1] font-medium underline">
                    {previews.length === 0 ? "Upload Room Images" : "Add More Images"}
                  </span>
                  <span className="text-[11px] text-[#646970]">
                    PNG, JPG, WEBP (Multiple allowed)
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
