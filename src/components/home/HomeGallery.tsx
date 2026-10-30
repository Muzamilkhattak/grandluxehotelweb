"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Sparkles, X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getGalleryImages } from "@/app/actions/admin-gallery";
import Tilt3D from "@/components/ui/Tilt3D";

interface GalleryItem {
  id: string;
  name: string;
  url: string;
}

export default function HomeGallery() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Vertical Scroll Parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  const yHeader = useTransform(smoothProgress, [0, 1], [25, -25]);
  const yGallery = useTransform(smoothProgress, [0, 1], [35, -20]);

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
    return null;
  }

  return (
    <section 
      ref={sectionRef}
      id="gallery" 
      className="py-14 sm:py-20 md:py-24 bg-[#FFFFFF] text-[#1A1A1A] relative overflow-hidden border-t border-[#EAEAEA] scroll-mt-20"
      style={{ perspective: 1200 }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header with 3D Entrance & Parallax */}
        <motion.div 
          style={{ y: yHeader }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-7xl mx-auto will-change-transform"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 12 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8f6618]/10 border border-[#8f6618]/25 mb-2.5 sm:mb-3.5 shadow-xs">
              <Sparkles size={13} className="text-[#8f6618]" />
              <span className="font-jost text-[#8f6618] tracking-[0.22em] uppercase text-[12px] sm:text-[13px] font-bold">
                Visual Journey
              </span>
              <Sparkles size={13} className="text-[#8f6618]" />
            </div>
            
            <h2 className="font-marcellus text-2xl sm:text-3xl md:text-[48px] text-[#000000] leading-[1.15] font-medium tracking-wide">
              Our Luxury Gallery
            </h2>
          </motion.div>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                id="gallery-prev"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#000000]/20 bg-white text-[#000000] flex items-center justify-center hover:bg-[#000000] hover:text-white transition-all duration-300 shadow-sm cursor-pointer active:scale-95"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button
                id="gallery-next"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#000000]/20 bg-white text-[#000000] flex items-center justify-center hover:bg-[#000000] hover:text-white transition-all duration-300 shadow-sm cursor-pointer active:scale-95"
                aria-label="Next Slide"
              >
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Auto-sliding Gallery Swiper with 3D Tilt Cards */}
        <motion.div 
          style={{ y: yGallery }}
          className="max-w-7xl mx-auto will-change-transform"
        >
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
              bulletActiveClass: "!bg-[#d7b56d] !w-6",
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
            className="pb-14 !py-4"
          >
            {images.map((img, i) => (
              <SwiperSlide key={img.id || img.url + i} className="!h-auto !py-2">
                <Tilt3D maxTilt={6} scale={1.02} glare={true} glareColor="rgba(215, 181, 109, 0.15)">
                  <div
                    onClick={() => setSelectedImage(img)}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-[#EAEAEA] shadow-md hover:shadow-2xl aspect-[4/3] transition-all duration-500"
                  >
                    <Image
                      src={img.url}
                      alt="Signature Art Hotel Gallery"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      unoptimized={img.url.startsWith('/uploads/')}
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-[#000000]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Zoom Button with 3D Pop */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md text-[#000000] border border-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#d7b56d] hover:text-black hover:scale-110 shadow-xl">
                      <Maximize2 size={18} />
                    </div>
                  </div>
                </Tilt3D>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Modal Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <div 
              className="relative w-full max-w-5xl h-[70vh] max-h-[750px] rounded-2xl overflow-hidden shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.url}
                alt="Signature Art Hotel Full View"
                fill
                className="object-contain"
                unoptimized={selectedImage.url.startsWith('/uploads/')}
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
