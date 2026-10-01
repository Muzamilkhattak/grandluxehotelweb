"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getGalleryImages } from "@/app/actions/admin-gallery";

interface GalleryItem {
  id: string;
  name: string;
  url: string;
}

export default function HomeGallery() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function loadGallery() {
      const userUploaded = await getGalleryImages();
      if (userUploaded && userUploaded.length > 0) {
        setImages(userUploaded);
      } else {
        setImages([]);
      }
    }
    loadGallery();
  }, []);

  if (images.length === 0) {
    return null; // Don't show section if no dynamic images uploaded yet
  }

  return (
    <section className="py-24 bg-[#FAF8F5] text-[#1A1A1A] relative overflow-hidden border-t border-[#EAEAEA]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 max-w-7xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#362618]/5 border border-[#362618]/10 mb-3">
              <Sparkles size={14} className="text-[#C97A4F]" />
              <span className="font-vogue text-[#7E652E] tracking-[0.25em] uppercase text-[11px] font-bold">
                Visual Journey
              </span>
              <Sparkles size={14} className="text-[#C97A4F]" />
            </div>
            
            <h2 className="font-marcellus text-[36px] md:text-[48px] text-[#362618] leading-[1.15] font-medium tracking-wide">
              Our Luxury Gallery
            </h2>
          </div>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                id="gallery-prev"
                className="w-12 h-12 rounded-full border border-[#362618]/20 bg-white text-[#362618] flex items-center justify-center hover:bg-[#362618] hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                id="gallery-next"
                className="w-12 h-12 rounded-full border border-[#362618]/20 bg-white text-[#362618] flex items-center justify-center hover:bg-[#362618] hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Auto-sliding Gallery Swiper */}
        <div className="max-w-7xl mx-auto">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop={images.length > 3}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: "#gallery-prev",
              nextEl: "#gallery-next",
            }}
            pagination={{
              clickable: true,
              bulletActiveClass: "!bg-[#C97A4F] !w-6",
              bulletClass: "inline-block w-2.5 h-2.5 rounded-full bg-gray-300 transition-all duration-300 cursor-pointer mx-1",
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            className="pb-14"
          >
            {images.map((img, i) => (
              <SwiperSlide key={img.id || img.url + i}>
                <div
                  onClick={() => setSelectedImage(img)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-[#EAEAEA] shadow-sm hover:shadow-xl aspect-[4/3] transition-all duration-500 hover:-translate-y-1.5"
                >
                  <Image
                    src={img.url}
                    alt="Oslo Elite Hotel Gallery"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    unoptimized={img.url.startsWith('/uploads/')}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-[#362618]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Zoom Button */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md text-[#362618] border border-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#C97A4F] hover:text-white hover:scale-110 shadow-lg">
                    <Maximize2 size={18} />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Modal Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div
              className="relative max-w-5xl w-full max-h-[85vh] aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.url}
                alt="Oslo Elite Hotel Gallery"
                fill
                className="object-contain bg-black"
                unoptimized={selectedImage.url.startsWith('/uploads/')}
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
