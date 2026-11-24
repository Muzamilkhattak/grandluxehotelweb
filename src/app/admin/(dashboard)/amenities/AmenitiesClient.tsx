"use client";

import React, { useState, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Upload, 
  Sparkles, 
  Loader2, 
  Edit3, 
  Check, 
  Search, 
  AlertCircle,
  X
} from "lucide-react";
import { 
  HotelAmenity, 
  createHotelAmenityAction, 
  updateHotelAmenityAction, 
  deleteHotelAmenityAction 
} from "@/app/actions/admin-amenities";
import { createClient } from "@/utils/supabase/client";

interface AmenitiesClientProps {
  initialAmenities: HotelAmenity[];
}

export default function AmenitiesClient({ initialAmenities }: AmenitiesClientProps) {
  const [amenities, setAmenities] = useState<HotelAmenity[]>(initialAmenities);
  const [name, setName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const uploadIconToStorage = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `amenities/icon-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error("Storage upload error:", error);
        return null;
      }

      if (data) {
        const { data: pubData } = supabase.storage.from('room-images').getPublicUrl(data.path);
        return pubData.publicUrl;
      }
      return null;
    } catch (err) {
      console.error("Icon upload exception:", err);
      return null;
    }
  };

  const handleCreateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter an amenity name.");
      return;
    }

    if (!iconFile) {
      setErrorMsg("Please select an icon image file (SVG, PNG, or WebP).");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadIconToStorage(iconFile);
      if (!uploadedUrl) {
        throw new Error("Failed to upload the icon image to storage.");
      }

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("iconUrl", uploadedUrl);

      const res = await createHotelAmenityAction(formData);
      if (res.success && res.amenity) {
        setAmenities([res.amenity, ...amenities]);
        setName("");
        setIconFile(null);
        setIconPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setSuccessMsg(`Amenity "${res.amenity.name}" uploaded successfully!`);
      } else {
        setErrorMsg(res.error || "Failed to create amenity.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while uploading amenity.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAmenity = async (id: string, amenityName: string) => {
    if (!confirm(`Are you sure you want to delete "${amenityName}"?`)) return;

    try {
      const res = await deleteHotelAmenityAction(id);
      if (res.success) {
        setAmenities(amenities.filter(a => a.id !== id));
        setSuccessMsg(`Amenity "${amenityName}" removed.`);
      } else {
        setErrorMsg(res.error || "Failed to delete amenity.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    }
  };

  const startEdit = (amenity: HotelAmenity) => {
    setEditingId(amenity.id);
    setEditName(amenity.name);
    setEditPreview(amenity.iconUrl);
    setEditFile(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    setIsEditing(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      let iconUrl = "";
      if (editFile) {
        const uploaded = await uploadIconToStorage(editFile);
        if (uploaded) iconUrl = uploaded;
      }

      const formData = new FormData();
      formData.append("name", editName.trim());
      if (iconUrl) formData.append("iconUrl", iconUrl);

      const res = await updateHotelAmenityAction(editingId, formData);
      if (res.success && res.amenity) {
        setAmenities(amenities.map(a => a.id === editingId ? res.amenity! : a));
        setEditingId(null);
        setSuccessMsg("Amenity updated successfully.");
      } else {
        setErrorMsg(res.error || "Failed to update amenity.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update amenity.");
    } finally {
      setIsEditing(false);
    }
  };

  const filteredAmenities = amenities.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto pb-16 font-jost">
      {/* Header */}
      <div className="mb-8 pb-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Sparkles size={22} className="text-[#d7b56d]" />
            Hotel Amenities Catalog
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Upload and manage your hotel's master amenities with custom icons. You can select these for any room.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Form Box */}
      <div className="bg-white border border-zinc-200/90 rounded-lg p-6 shadow-xs mb-10">
        <h2 className="text-[16px] font-semibold text-zinc-900 mb-1 flex items-center gap-2">
          <Plus size={18} className="text-[#d7b56d]" />
          Upload New Amenity & Icon
        </h2>
        <p className="text-[13px] text-zinc-500 mb-5">
          Enter the amenity title and upload its icon image (SVG or PNG recommended with transparent background).
        </p>

        <form onSubmit={handleCreateAmenity} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          {/* Amenity Title */}
          <div className="md:col-span-6 flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-zinc-800">
              Amenity Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Free High-Speed Wi-Fi, Private Terrace, Jacuzzi, Mini Bar"
              className="bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-[14px] text-zinc-900 focus:outline-none focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d]"
              required
            />
          </div>

          {/* Icon Upload Button & Preview */}
          <div className="md:col-span-3 flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-zinc-800">
              Icon Image (SVG / PNG) <span className="text-red-500">*</span>
            </label>
            <input 
              type="file"
              accept="image/*"
              ref={fileInputRef}
              id="amenity-icon-upload-main"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setIconFile(file);
                  setIconPreview(URL.createObjectURL(file));
                }
              }}
            />
            <label 
              htmlFor="amenity-icon-upload-main"
              className="flex items-center justify-between border-2 border-dashed border-zinc-300 hover:border-[#d7b56d] bg-zinc-50 hover:bg-[#FAF9F5] px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                {iconPreview ? (
                  <img src={iconPreview} alt="Preview" className="w-6 h-6 object-contain" />
                ) : (
                  <Upload size={16} className="text-[#d7b56d]" />
                )}
                <span className="text-[13px] text-zinc-700 font-medium truncate">
                  {iconFile ? iconFile.name : "Choose Icon File"}
                </span>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={isUploading || !name.trim() || !iconFile}
              className="w-full bg-[#000000] hover:bg-zinc-800 text-white rounded-lg py-2.5 px-4 text-[13.5px] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#d7b56d]" />
                  <span>Uploading Amenity...</span>
                </>
              ) : (
                <>
                  <Upload size={16} className="text-[#d7b56d]" />
                  <span>Upload & Save Amenity</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Catalog Section */}
      <div className="bg-white border border-zinc-200/90 rounded-lg p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-semibold text-zinc-900">Available Amenities</h3>
            <span className="bg-zinc-900 text-[#d7b56d] text-[12px] font-bold px-2.5 py-0.5 rounded-full">
              {amenities.length}
            </span>
          </div>

          {/* Search */}
          {amenities.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search amenities..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-1.5 text-[13px] text-zinc-900 focus:outline-none focus:border-[#d7b56d]"
              />
            </div>
          )}
        </div>

        {amenities.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
            <Sparkles size={32} className="text-[#d7b56d] mx-auto mb-3" />
            <h4 className="text-[15px] font-semibold text-zinc-800 mb-1">No amenities uploaded yet</h4>
            <p className="text-[13px] text-zinc-500 max-w-md mx-auto">
              Use the upload form above to add your first hotel amenity with its icon.
            </p>
          </div>
        ) : filteredAmenities.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-[13px]">
            No amenities match "{searchTerm}".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAmenities.map((amenity) => (
              <div 
                key={amenity.id}
                className="flex items-center justify-between p-4 bg-zinc-50/70 border border-zinc-200 rounded-lg hover:border-[#d7b56d] transition-all hover:bg-white group"
              >
                {/* Icon & Title */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-white border border-[#d7b56d]/30 flex items-center justify-center shrink-0 p-2 shadow-xs group-hover:border-[#d7b56d]">
                    <img 
                      src={amenity.iconUrl} 
                      alt={amenity.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    {editingId === amenity.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-white border border-zinc-300 rounded px-2 py-1 text-[13px] text-zinc-900 w-full"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={isEditing}
                          className="p-1 bg-[#d7b56d] text-black rounded hover:opacity-90"
                          title="Save"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 text-zinc-500 hover:text-black"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-[14px] font-semibold text-zinc-900 truncate" title={amenity.name}>
                          {amenity.name}
                        </h4>
                        <span className="text-[11px] text-zinc-500">
                          Uploaded icon
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {editingId !== amenity.id && (
                  <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => startEdit(amenity)}
                      title="Edit Amenity Name"
                      className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-md transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAmenity(amenity.id, amenity.name)}
                      title="Delete Amenity"
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
