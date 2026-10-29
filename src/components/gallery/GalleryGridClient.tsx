"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Sparkles, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export interface GalleryPhoto {
  id: string;
  url: string;
}

export default function GalleryGridClient({ dynamicImages = [] }: { dynamicImages?: any[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Show ONLY dynamic images uploaded via admin panel
  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>(() =>
    dynamicImages.map((img, idx) => ({
      id: img.id || `dyn-${idx}`,
      url: img.url,
    }))
  );

  useEffect(() => {
    setAllPhotos(
      dynamicImages.map((img, idx) => ({
        id: img.id || `dyn-${idx}`,
        url: img.url,
      }))
    );
  }, [dynamicImages]);

  // Open Lightbox
  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const currentPhoto = lightboxIndex !== null ? allPhotos[lightboxIndex] : null;

  const showNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! + 1) % allPhotos.length);
    }
  }, [lightboxIndex, allPhotos.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! - 1 + allPhotos.length) % allPhotos.length);
    }
  }, [lightboxIndex, allPhotos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  if (allPhotos.length === 0) {
    return (
      <section className="py-24 max-w-[1440px] mx-auto px-4 text-center">
        <div className="max-w-md mx-auto py-16 px-6 bg-white rounded-2xl border border-[#000000]/10 shadow-sm">
          <Sparkles className="mx-auto text-[#d7b56d] mb-4" size={32} />
          <h2 className="font-marcellus text-2xl text-[#000000] mb-2">No Images Yet</h2>
          <p className="font-jost text-sm text-[#000000]/70">
            Admin panel se abhi tak koi images upload nahi ki gayi hain. Admin panel se images upload karein taake woh yahan show hon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
      {/* Clean Responsive Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {allPhotos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-[#000000]/10 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-all duration-500 cursor-pointer"
          >
            <Image
              src={photo.url}
              alt="Gallery Showcase"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                <Maximize2 size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-Screen Lightbox Modal */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-300 select-none"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X size={22} />
          </button>

          {/* Previous Button */}
          {allPhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-[#d7b56d] text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
              aria-label="Previous Photo"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next Button */}
          {allPhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-[#d7b56d] text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
              aria-label="Next Photo"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[75vh] sm:h-[80vh]">
              <Image
                src={currentPhoto.url}
                alt="Gallery Showcase Preview"
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
