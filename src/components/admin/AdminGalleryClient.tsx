"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Trash2, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { uploadGalleryImageAction, deleteGalleryImageAction } from "@/app/actions/admin-gallery";

interface GalleryImage {
  id: string;
  name: string;
  url: string;
  isUserUploaded?: boolean;
}

export default function AdminGalleryClient({ initialImages }: { initialImages: GalleryImage[] }) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatusMsg(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setStatusMsg(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await uploadGalleryImageAction(formData);

      if (res.success && res.fileName) {
        setStatusMsg({ type: "success", text: "Image uploaded successfully!" });
        setImages((prev) => [
          {
            id: res.fileName!,
            name: res.fileName!,
            url: `/uploads/gallery/${res.fileName}`,
            isUserUploaded: true,
          },
          ...prev,
        ]);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setStatusMsg({ type: "error", text: res.error || "Upload failed" });
      }
    });
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return;

    startTransition(async () => {
      const res = await deleteGalleryImageAction(fileName);
      if (res.success) {
        setImages((prev) => prev.filter((img) => img.name !== fileName));
        setStatusMsg({ type: "success", text: "Image deleted successfully." });
      } else {
        setStatusMsg({ type: "error", text: res.error || "Failed to delete image" });
      }
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="text-[#2271b1]" size={26} />
            Gallery Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload new photos or remove existing images from the home page luxury gallery section.
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 font-medium rounded-full border border-blue-200 self-start sm:self-auto">
          {images.length} Image{images.length !== 1 ? "s" : ""} Available
        </div>
      </div>

      {/* Alert Status Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle className="text-emerald-600 shrink-0" size={20} />
          ) : (
            <AlertCircle className="text-red-600 shrink-0" size={20} />
          )}
          <span className="text-sm font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* Upload Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Image</h2>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Custom Drag & Drop / Upload Box */}
            <label className="flex-1 w-full border-2 border-dashed border-gray-300 hover:border-[#2271b1] bg-gray-50 hover:bg-blue-50/50 rounded-xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group">
              <Upload className="text-gray-400 group-hover:text-[#2271b1] mb-2 transition-colors" size={32} />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#2271b1]">
                {selectedFile ? selectedFile.name : "Click to select or drop image file"}
              </span>
              <span className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WEBP, GIF</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isPending}
              />
            </label>

            {/* Preview Box */}
            {previewUrl && (
              <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-gray-200 shadow-sm shrink-0 bg-gray-100">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[10px] text-center py-0.5 rounded">
                  Preview
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {selectedFile && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={!selectedFile || isPending}
              className="bg-[#2271b1] hover:bg-[#1a5b92] text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload Image</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Images Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Current Gallery Photos</h2>

        {images.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
            <ImageIcon className="mx-auto mb-3 text-gray-300" size={48} />
            <p className="font-medium">No images uploaded yet.</p>
            <p className="text-xs text-gray-400 mt-1">Upload an image above to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 flex flex-col group hover:shadow-md transition-shadow relative"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <Image
                    src={img.url}
                    alt={img.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={img.url.startsWith("/uploads/")}
                  />
                </div>

                <div className="mt-auto">
                  <p className="text-xs text-gray-500 font-mono truncate mb-2 px-1">{img.name}</p>
                  <button
                    onClick={() => handleDelete(img.name)}
                    disabled={isPending}
                    className="w-full py-1.5 px-3 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
