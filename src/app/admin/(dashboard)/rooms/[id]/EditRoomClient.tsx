"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Trash2, Star, CheckCircle, AlertCircle, RefreshCw, AlertTriangle, X, Loader2 } from "lucide-react";
import { updateRoomAction, deleteRoomAction } from "@/app/actions/admin-rooms";
import { syncRoomIcalAction } from "@/app/actions/ical";
import { createClient } from "@/utils/supabase/client";

export default function EditRoomClient({ initialRoom }: { initialRoom: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(initialRoom.image_url || null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>((initialRoom.images || []).slice(1)); // First element is usually the featured image

  const existingIcalTag = Array.isArray(initialRoom.amenities)
    ? initialRoom.amenities.find((a: string) => a.startsWith('ical_url:'))
    : null;
  const initialIcalUrl = existingIcalTag ? existingIcalTag.replace('ical_url:', '') : '';

  const [icalUrl, setIcalUrl] = useState(initialIcalUrl);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleSyncIcal = async () => {
    if (!icalUrl) {
      setSyncMessage("Please provide an iCal URL.");
      return;
    }
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await syncRoomIcalAction(initialRoom.id, icalUrl);
      if (res.success) {
        setSyncMessage(res.message || "Synced successfully!");
      } else {
        setSyncMessage("Error: " + res.error);
      }
    } catch (e: any) {
      setSyncMessage("Error: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const getRoomTotalCount = (room: any) => {
    if (!room?.amenities || !Array.isArray(room.amenities)) return 1;
    const countTag = room.amenities.find((a: string) => a.startsWith('total_rooms:'));
    if (countTag) return parseInt(countTag.split(':')[1], 10) || 1;
    return 1;
  };

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
    const urlToRemove = galleryPreviews[index];
    const updatedPreviews = galleryPreviews.filter((_, i) => i !== index);
    
    const fileIndex = galleryFiles.findIndex(f => URL.createObjectURL(f) === urlToRemove || f.name === urlToRemove);
    if (fileIndex !== -1) {
      const updatedFiles = galleryFiles.filter((_, i) => i !== fileIndex);
      setGalleryFiles(updatedFiles);
    }
    
    setGalleryPreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    
    // We start with existing images that are still in previews
    let featuredUrl = featuredPreview && featuredPreview.startsWith('http') ? featuredPreview : "";
    let galleryUrls: string[] = galleryPreviews.filter(p => p.startsWith('http'));
    
    try {
      // Upload new Featured Image if changed
      if (featuredFile) {
        const fileExt = featuredFile.name.split('.').pop();
        const fileName = `${Date.now()}-feat-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('room-images').upload(fileName, featuredFile);
        if (error) throw new Error("Failed to upload featured image");
        if (data) {
          const { data: publicUrlData } = supabase.storage.from('room-images').getPublicUrl(data.path);
          featuredUrl = publicUrlData.publicUrl;
        }
      }

      // Upload new Gallery Images
      for (const file of galleryFiles) {
        if (file.size > 0) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-gal-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data, error } = await supabase.storage.from('room-images').upload(fileName, file);
          
          if (error) throw new Error(`Failed to upload gallery image: ${file.name}`);
          
          if (data) {
            const { data: publicUrlData } = supabase.storage.from('room-images').getPublicUrl(data.path);
            galleryUrls.push(publicUrlData.publicUrl);
          }
        }
      }
      
      const combinedUrls = featuredUrl ? [featuredUrl, ...galleryUrls] : galleryUrls;
      
      formData.delete("images");
      formData.delete("featured");
      formData.append("imageUrls", JSON.stringify(combinedUrls));

      const res = await updateRoomAction(initialRoom.id, formData);

      if (res.success) {
        router.push("/admin/rooms");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to update room accommodation");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during room update.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteRoom = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteRoomAction(initialRoom.id);
      if (res.success) {
        router.push("/admin/rooms");
        router.refresh();
      } else {
        setDeleteError(res.error || "Failed to delete room. Please try again.");
      }
    } catch (err: any) {
      setDeleteError(err.message || "An unexpected error occurred while deleting the room.");
    } finally {
      setDeleting(false);
    }
  };

  const amenitiesString = (initialRoom.amenities || [])
    .filter((a: string) => !a.startsWith("total_rooms:") && !a.startsWith("ical_url:"))
    .join(", ");

  return (
    <div className="max-w-5xl mx-auto pb-12 font-sans">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#c3c4c7]">
        <div className="flex items-center gap-3">
          <Link href="/admin/rooms" className="text-[#2271b1] hover:text-[#135e96] transition-colors p-1">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-[#1d2327] font-semibold tracking-tight">Edit Accommodation</h1>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white border border-[#c3c4c7] p-4 shadow-sm rounded-sm">
            <input 
              name="title" 
              type="text" 
              required 
              defaultValue={initialRoom.title}
              placeholder="Add Accommodation Title (e.g., Deluxe Oceanfront Suite)" 
              className="w-full text-xl font-medium text-[#1d2327] border border-[#8c8f94] rounded-[3px] px-3.5 py-2.5 focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] placeholder:text-[#646970]"
            />
          </div>

          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327]">
              Accommodation Description
            </div>
            <div className="p-3">
              <textarea 
                name="description" 
                rows={7} 
                required 
                defaultValue={initialRoom.description}
                placeholder="Enter detailed room description, architectural features, and luxury specifications..."
                className="w-full bg-white border border-[#8c8f94] rounded-[3px] p-3 text-[14px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] leading-relaxed resize-y"
              ></textarea>
            </div>
          </div>

          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327]">
              Room Data & Pricing
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#1d2327]">Nightly Rate (PKR)</label>
                <input 
                  name="price_per_night" 
                  type="number" 
                  required 
                  min={0}
                  defaultValue={initialRoom.price_per_night}
                  placeholder="e.g. 15000"
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
                  defaultValue={initialRoom.capacity}
                  className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-full border-t border-[#c3c4c7] pt-4 mt-2">
                <label className="text-[13px] font-semibold text-[#2271b1] flex items-center gap-1.5">
                  Total Physical Rooms of this Type in Hotel (Inventory Quantity)
                </label>
                <input 
                  name="total_rooms" 
                  type="number" 
                  required 
                  min={1}
                  defaultValue={getRoomTotalCount(initialRoom)}
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

        <div className="w-full lg:w-[320px] flex flex-col gap-5">
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327]">
              Publish Settings
            </div>
            <div className="p-3 bg-[#f6f7f7] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => { setDeleteError(null); setShowDeleteModal(true); }}
                disabled={deleting || loading}
                className="text-red-600 hover:text-red-800 text-[12px] underline cursor-pointer disabled:opacity-50 flex items-center gap-1 font-medium"
              >
                <Trash2 size={13} />
                <span>Delete Room</span>
              </button>
              <button 
                type="submit" 
                disabled={loading || deleting}
                className="bg-[#2271b1] hover:bg-[#135e96] border border-[#2271b1] text-white text-[13px] px-4 py-2 rounded-[3px] font-medium transition-colors disabled:opacity-70 shadow-sm cursor-pointer"
              >
                {loading ? "Updating..." : "Update Accommodation"}
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327]">
              Amenities & Tags
            </div>
            <div className="p-3">
              <textarea 
                name="amenities" 
                rows={3}
                defaultValue={amenitiesString}
                placeholder="Oceanfront, Jacuzzi, Private Balcony, Mini Bar (comma separated)"
                className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] resize-none"
              ></textarea>
              <p className="text-[12px] text-[#646970] mt-1 italic">Separate amenities with commas.</p>
              <input type="hidden" name="ical_url" value={icalUrl} />
            </div>
          </div>

          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327]">
              iCal Sync (External Channels)
            </div>
            <div className="p-3">
              <label className="text-[12px] font-semibold text-[#1d2327] mb-1 block">Import Booking.com / Airbnb iCal URL</label>
              <input 
                type="url"
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] mb-2"
              />
              <button 
                type="button"
                onClick={handleSyncIcal}
                disabled={syncing || !icalUrl}
                className="w-full flex items-center justify-center gap-1.5 bg-[#f6f7f7] hover:bg-[#f0f0f1] border border-[#c3c4c7] text-[#2271b1] text-[13px] px-3 py-1.5 rounded-[3px] font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                {syncing ? "Syncing..." : "Sync Bookings Now"}
              </button>
              {syncMessage && (
                <p className={`mt-2 text-[12px] font-medium leading-tight ${syncMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {syncMessage}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327]">
              Featured Image
            </div>
            <div className="p-3 space-y-3">
              {featuredPreview && (
                <div className="relative aspect-video rounded-[3px] overflow-hidden border border-gray-300 bg-white">
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
                <div className="border-2 border-dashed border-[#8c8f94] bg-[#f6f7f7] p-4 text-center rounded-[3px] relative overflow-hidden group hover:bg-[#f0f0f1] hover:border-[#2271b1] transition-colors cursor-pointer">
                  <input 
                    name="featured"
                    type="file" 
                    accept="image/*"
                    onChange={handleFeaturedSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required={!initialRoom.image_url}
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <ImagePlus size={24} className="text-[#2271b1]" />
                    <span className="text-[13px] text-[#2271b1] font-medium underline">
                      Set Featured Image
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[14px] font-semibold text-[#1d2327] flex justify-between items-center">
              <span>Room Gallery</span>
              <span className="text-[11px] font-normal bg-[#2271b1] text-white px-2 py-0.5 rounded-full">
                {galleryPreviews.length} {galleryPreviews.length === 1 ? 'image' : 'images'}
              </span>
            </div>
            
            <div className="p-3 space-y-3">
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto p-1 border border-[#c3c4c7] rounded-[3px] bg-gray-50">
                  {galleryPreviews.map((src, index) => (
                    <div key={index} className="relative group aspect-square rounded-[3px] overflow-hidden border border-gray-300 bg-white">
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

              <div className="border-2 border-dashed border-[#8c8f94] bg-[#f6f7f7] p-4 text-center rounded-[3px] relative overflow-hidden group hover:bg-[#f0f0f1] hover:border-[#2271b1] transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleGallerySelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <ImagePlus size={24} className="text-[#2271b1]" />
                  <span className="text-[13px] text-[#2271b1] font-medium underline">
                    {galleryPreviews.length === 0 ? "Upload Gallery Images" : "Add More Images"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>

      {/* In-DOM Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => { if (!deleting) setShowDeleteModal(false); }}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              disabled={deleting}
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Accommodation</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Permanent removal from database
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Are you sure you want to completely delete{" "}
              <strong className="text-gray-900 font-semibold">
                &quot;{initialRoom.title}&quot;
              </strong>?
              All associated bookings, calendar schedules, and uploaded media will be permanently removed.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteRoom}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Room</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
