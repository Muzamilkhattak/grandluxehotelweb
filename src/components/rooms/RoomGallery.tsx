"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, Sparkles } from "lucide-react";

interface RoomGalleryProps {
  images: string[];
  title: string;
}

export default function RoomGallery({ images, title }: RoomGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const fallbackImages = [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop"
  ];

  const galleryImages = images && images.length > 0 ? images : fallbackImages;
  const currentImage = galleryImages[activeIndex] || galleryImages[0];

  function handleNext() {
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  }

  function handlePrev() {
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative w-full h-[450px] md:h-[550px] bg-black/5 rounded-none overflow-hidden group border border-[#7E652E]/20 shadow-lg">
        <Image
          src={currentImage}
          alt={`${title} - Photo ${activeIndex + 1}`}
          fill
          className="object-cover transition-all duration-700 ease-out"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Counter Badge */}
        <div className="absolute top-4 left-4 bg-[#362618]/80 backdrop-blur-md text-[#FAF8F5] text-[11px] font-jost uppercase tracking-[0.2em] px-4 py-2 border border-[#7E652E]/30 flex items-center gap-2">
          <Sparkles size={12} className="text-[#C97A4F]" />
          <span>Photo {activeIndex + 1} of {galleryImages.length}</span>
        </div>

        {/* Prev / Next Controls */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#362618]/70 hover:bg-[#362618] text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105 border border-[#7E652E]/40"
              aria-label="Previous Image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#362618]/70 hover:bg-[#362618] text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105 border border-[#7E652E]/40"
              aria-label="Next Image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row / Grid */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-[#7E652E]/30">
          {galleryImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative flex-shrink-0 w-24 h-20 md:w-32 md:h-24 overflow-hidden border-2 transition-all cursor-pointer ${
                activeIndex === index
                  ? "border-[#C97A4F] scale-[1.02] shadow-md ring-2 ring-[#C97A4F]/20"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
              {activeIndex === index && (
                <div className="absolute inset-0 bg-[#C97A4F]/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
