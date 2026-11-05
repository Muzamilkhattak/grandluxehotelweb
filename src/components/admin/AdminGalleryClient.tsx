"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Trash2, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
        setStatusMsg({ type: "success", text: "Image uploaded successfully." });
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
        setStatusMsg({ type: "error", text: res.error || "Upload failed." });
      }
    });
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm("Are you sure you want to delete this gallery photo?")) return;

    startTransition(async () => {
      const res = await deleteGalleryImageAction(fileName);
      if (res.success) {
        setImages((prev) => prev.filter((img) => img.name !== fileName));
        setStatusMsg({ type: "success", text: "Image deleted successfully." });
      } else {
        setStatusMsg({ type: "error", text: res.error || "Failed to delete image." });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">
            Media gallery
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Photographs displayed in the homepage luxury gallery section.
          </p>
        </div>
        <div className="text-xs px-2.5 py-1 bg-zinc-100 text-zinc-700 font-medium rounded-md border border-zinc-200 self-start sm:self-auto tabular-nums">
          {images.length} {images.length === 1 ? "image" : "images"} in gallery
        </div>
      </div>

      {/* Alert Status Banner */}
      {statusMsg && (
        <div
          className={`p-3 rounded-lg flex items-center justify-between text-xs border ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="text-emerald-600 shrink-0" size={15} />
            ) : (
              <AlertCircle className="text-rose-600 shrink-0" size={15} />
            )}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-zinc-500 hover:text-zinc-800 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Card */}
      <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">Upload photo</h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Custom Drag & Drop / Upload Box */}
            <label className="flex-1 w-full border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50 rounded-xl p-6 transition-colors cursor-pointer flex flex-col items-center justify-center text-center group">
              <Upload className="text-zinc-400 group-hover:text-zinc-600 mb-2 transition-colors" size={24} />
              <span className="text-xs font-medium text-zinc-800">
                {selectedFile ? selectedFile.name : "Select or drag image file here"}
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">JPG, PNG, WEBP up to 10MB</span>
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
              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-zinc-200 shadow-xs shrink-0 bg-zinc-100">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[10px] text-center py-0.5 rounded-sm">
                  Preview
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {selectedFile && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                disabled={isPending}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={!selectedFile || isPending}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={13} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={13} />
                  <span>Upload photo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Images Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900">Current gallery photos</h2>

        {images.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-zinc-200 text-zinc-400">
            <ImageIcon className="mx-auto mb-2 text-zinc-300" size={36} />
            <p className="text-xs font-medium text-zinc-700">No images uploaded yet</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Upload a photo above to populate the gallery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white p-2 rounded-xl shadow-xs border border-zinc-200/80 flex flex-col group hover:border-zinc-300 transition-colors"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-zinc-100 mb-2">
                  <Image
                    src={img.url}
                    alt={img.name}
                    fill
                    className="object-cover"
                    unoptimized={img.url.startsWith("/uploads/")}
                  />
                </div>

                <div className="mt-auto">
                  <p className="text-[11px] text-zinc-500 font-mono truncate mb-1.5 px-0.5">{img.name}</p>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.name)}
                    disabled={isPending}
                    className="w-full py-1 px-2.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 size={12} />
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
