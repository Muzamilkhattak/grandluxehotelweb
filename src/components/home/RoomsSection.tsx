"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import BookingModal from "@/components/booking/BookingModal";
import { ChevronLeft, ChevronRight, CalendarX, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";

export type Room = {
  id: string;
  title: string;
  slug?: string;
  price_per_night: number;
  bed_type: string;
  size_sqft: number;
  amenities: string[];
  image_url?: string;
  description?: string;
};

export type RoomsSectionProps = {
  rooms: Room[];
  unavailableRoomIds?: string[];
  searchedDates?: { checkin: string; checkout: string };
};

export default function RoomsSection({ 
  rooms, 
  unavailableRoomIds = [], 
  searchedDates 
}: RoomsSectionProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Vertical Scroll Parallax for Section Header
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  const yHeader = useTransform(smoothProgress, [0, 1], [30, -30]);

  const displayRooms = rooms || [];

  // Expand list to at least 5 items for continuous 3D coverflow
  const items: Room[] = displayRooms.length > 0
    ? displayRooms.length >= 5
      ? displayRooms
      : displayRooms.length >= 3
        ? [...displayRooms, ...displayRooms]
        : [...displayRooms, ...displayRooms, ...displayRooms, ...displayRooms]
    : [];

  const total = items.length;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Autoplay
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Compute 3D offset distance relative to active index
  const getOffset = (index: number) => {
    let diff = index - activeIndex;
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;
    return diff;
  };

  // Drag / Swipe handler
  const handleDragEnd = (_: any, info: { offset: { x: number; y: number }; velocity: { x: number } }) => {
    if (info.offset.x < -45 || info.velocity.x < -300) {
      handleNext();
    } else if (info.offset.x > 45 || info.velocity.x > 300) {
      handlePrev();
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="py-14 sm:py-20 md:py-28 bg-[#FFFFFF] relative px-3 sm:px-4 overflow-hidden"
    >
      <div className="max-w-[1380px] mx-auto flex flex-col items-center">
        
        {/* Section Heading with 3D Entrance & Parallax */}
        <motion.div 
          style={{ y: yHeader }}
          initial={{ opacity: 0, y: 35, rotateX: 12 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8 sm:mb-12 md:mb-14 max-w-2xl will-change-transform"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8f6618]/10 border border-[#8f6618]/25 mb-3 sm:mb-4 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8f6618]" />
            <span className="font-jost text-[#8f6618] tracking-[0.22em] uppercase text-[12px] sm:text-[13px] font-bold">
              Accommodations
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8f6618]" />
          </div>
          <h2 className="font-marcellus text-3xl sm:text-4xl md:text-[52px] lg:text-[60px] text-primary leading-tight font-normal">
            Curated Suites
          </h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-14 sm:w-16 h-[2px] bg-[#d7b56d] mx-auto mt-3 sm:mt-4 origin-center" 
          />
        </motion.div>
        
        {/* Search Dates Banner */}
        {searchedDates?.checkin && searchedDates?.checkout && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-10 bg-[#FFFFFF] border border-[#d7b56d]/30 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-center font-jost text-[13px] sm:text-[14.5px] text-[#000000] shadow-xs"
          >
            <span>Availability checked for: </span>
            <strong className="text-[#d7b56d]">{searchedDates.checkin}</strong> to <strong className="text-[#d7b56d]">{searchedDates.checkout}</strong>
            {unavailableRoomIds.length > 0 && (
              <span className="block sm:inline sm:ml-2.5 text-red-700 font-medium text-[12px] sm:text-[13.5px]">
                ({unavailableRoomIds.length} suite{unavailableRoomIds.length > 1 ? "s" : ""} booked on these dates)
              </span>
            )}
          </motion.div>
        )}

        {displayRooms.length === 0 ? (
          <div className="text-center text-muted font-jost text-xl py-12">
            No suites are currently available matching your criteria.
          </div>
        ) : (
          <div 
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="w-full relative flex flex-col items-center select-none"
          >
            
            {/* 3D Cinematic Slider Stage */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={handleDragEnd}
              className="relative w-full h-[470px] sm:h-[520px] md:h-[570px] flex items-center justify-center overflow-visible cursor-grab active:cursor-grabbing touch-pan-y"
              style={{
                perspective: isMobile ? 1200 : 1600,
                transformStyle: "preserve-3d",
              }}
            >
              {items.map((room, i) => {
                const offset = getOffset(i);
                const isCenter = offset === 0;
                const isVisible = Math.abs(offset) <= 2;
                const isUnavailable = unavailableRoomIds.includes(room.id);

                if (!isVisible) return null;

                // 3D positioning calculations for cinematic depth
                let xTranslate = "0%";
                let zTranslate = 0;
                let yRotate = 0;
                let scaleVal = 1;
                let opacityVal = 1;
                let zIndexVal = 10;
                let brightnessVal = 1;

                if (isCenter) {
                  xTranslate = "0%";
                  zTranslate = isMobile ? 40 : 80;
                  yRotate = 0;
                  scaleVal = isMobile ? 1.02 : 1.06;
                  opacityVal = 1;
                  zIndexVal = 30;
                  brightnessVal = 1;
                } else if (offset === -1) {
                  xTranslate = isMobile ? "-58%" : "-74%";
                  zTranslate = isMobile ? -100 : -140;
                  yRotate = isMobile ? 32 : 38;
                  scaleVal = isMobile ? 0.86 : 0.88;
                  opacityVal = 0.78;
                  zIndexVal = 20;
                  brightnessVal = 0.7;
                } else if (offset === 1) {
                  xTranslate = isMobile ? "58%" : "74%";
                  zTranslate = isMobile ? -100 : -140;
                  yRotate = isMobile ? -32 : -38;
                  scaleVal = isMobile ? 0.86 : 0.88;
                  opacityVal = 0.78;
                  zIndexVal = 20;
                  brightnessVal = 0.7;
                } else if (offset === -2) {
                  xTranslate = isMobile ? "-90%" : "-124%";
                  zTranslate = isMobile ? -200 : -270;
                  yRotate = isMobile ? 45 : 52;
                  scaleVal = isMobile ? 0.72 : 0.74;
                  opacityVal = isMobile ? 0 : 0.4;
                  zIndexVal = 10;
                  brightnessVal = 0.45;
                } else if (offset === 2) {
                  xTranslate = isMobile ? "90%" : "124%";
                  zTranslate = isMobile ? -200 : -270;
                  yRotate = isMobile ? -45 : -52;
                  scaleVal = isMobile ? 0.72 : 0.74;
                  opacityVal = isMobile ? 0 : 0.4;
                  zIndexVal = 10;
                  brightnessVal = 0.45;
                }

                return (
                  <motion.div
                    key={`${room.id}-${i}`}
                    onClick={() => {
                      if (!isCenter) setActiveIndex(i);
                    }}
                    animate={{
                      x: xTranslate,
                      z: zTranslate,
                      rotateY: yRotate,
                      scale: scaleVal,
                      opacity: opacityVal,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 240,
                      damping: 26,
                    }}
                    style={{
                      zIndex: zIndexVal,
                      transformStyle: "preserve-3d",
                    }}
                    className={`absolute w-[260px] sm:w-[310px] md:w-[350px] h-[390px] sm:h-[450px] md:h-[490px] rounded-t-[140px] sm:rounded-t-[170px] md:rounded-t-[190px] overflow-hidden bg-neutral-900 transition-shadow duration-500 will-change-transform ${
                      isCenter
                        ? "border-2 border-[#d7b56d] shadow-[0_30px_70px_rgba(215,181,109,0.35)] cursor-default"
                        : "border border-[#d7b56d]/30 shadow-[0_20px_45px_rgba(0,0,0,0.5)] cursor-pointer hover:border-[#d7b56d]/70"
                    }`}
                  >
                    {/* Full Room Image */}
                    <div 
                      className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out"
                      style={{
                        transform: isCenter ? "scale(1.04)" : "scale(1)",
                        filter: `brightness(${brightnessVal}) ${isUnavailable ? "grayscale(40%)" : ""}`,
                      }}
                    >
                      {room.image_url ? (
                        <Image
                          src={room.image_url}
                          alt={room.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 260px, (max-width: 1024px) 310px, 350px"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-jost">
                          No Image Available
                        </div>
                      )}
                    </div>

                    {/* Dark Dramatic Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />
                    
                    {/* Dim Overlay on Side Cards to Draw Attention to Centerpiece */}
                    {!isCenter && (
                      <div className="absolute inset-0 bg-black/35 pointer-events-none backdrop-blur-[0.5px] transition-opacity duration-500" />
                    )}

                    {/* Unavailable Badge */}
                    {isUnavailable && (
                      <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-[#78231C]/95 text-white border border-red-500/50 px-3.5 py-1 rounded-full font-jost text-[11px] font-semibold tracking-wider flex items-center gap-1.5 shadow-lg z-20 whitespace-nowrap">
                        <CalendarX size={12} />
                        <span>Booked on Dates</span>
                      </div>
                    )}

                    {/* Card Content Footer */}
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col items-center text-center z-10 pointer-events-auto">
                      
                      {/* Price Tag with Luxury Crown Accent */}
                      <span className="font-jost text-white/80 text-[11px] sm:text-[12px] uppercase tracking-[0.2em] font-medium mb-0.5">
                        From
                      </span>
                      <div className="font-marcellus text-[#d7b56d] text-[22px] sm:text-[26px] md:text-[28px] leading-tight mb-2 drop-shadow-md font-normal">
                        {room.price_per_night ? `PKR ${room.price_per_night.toLocaleString()}` : "Price on Request"}
                      </div>

                      {/* Title */}
                      <h3 className="font-marcellus text-white text-[19px] sm:text-[22px] md:text-[24px] font-normal leading-snug mb-1 drop-shadow-md truncate max-w-full px-2">
                        {room.title}
                      </h3>

                      {/* Specs */}
                      <div className="font-jost text-[#FFFFFF]/85 text-[12px] sm:text-[13px] font-light tracking-wider flex items-center justify-center gap-2.5 mb-3.5 sm:mb-4">
                        <span>{room.bed_type || "2 Guests"}</span>
                        <span className="opacity-40">•</span>
                        <span>{room.size_sqft ? `${room.size_sqft} ft` : "30 ft"}</span>
                      </div>

                      {/* Action Buttons for Central Card */}
                      <div 
                        className={`flex items-center justify-center gap-2.5 w-full max-w-[250px] transition-opacity duration-300 ${
                          isCenter ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                        }`}
                      >
                        {!isUnavailable ? (
                          <Link
                            href={`/booking?roomId=${room.id}${searchedDates?.checkin ? `&checkin=${searchedDates.checkin}&checkout=${searchedDates.checkout}` : ""}`}
                            className="flex-1 bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white text-[10.5px] sm:text-[11.5px] font-jost font-semibold uppercase tracking-[0.14em] py-2 px-3.5 rounded-full transition-all duration-300 shadow-md text-center border border-[#d7b56d] hover:border-white active:scale-95"
                          >
                            Book Now
                          </Link>
                        ) : (
                          <span className="flex-1 bg-[#78231C]/95 text-white text-[10.5px] sm:text-[11.5px] font-jost font-semibold uppercase tracking-[0.14em] py-2 px-3.5 rounded-full text-center shadow-md">
                            Booked
                          </span>
                        )}

                        <Link
                          href={`/rooms/${room.slug || room.id}`}
                          className="flex-1 bg-white/15 hover:bg-white text-white hover:text-black border border-white/60 text-[10.5px] sm:text-[11.5px] font-jost font-semibold uppercase tracking-[0.14em] py-2 px-3.5 rounded-full transition-all duration-300 shadow-md text-center active:scale-95"
                        >
                          Explore
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Side Vignettes for Cinematic Depth Edge Fade */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-24 md:w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-25" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-24 md:w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-25" />

            {/* Left Chevron Button */}
            <button
              onClick={handlePrev}
              aria-label="Previous suite"
              className="absolute left-2 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 z-35 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border border-[#d7b56d]"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Right Chevron Button */}
            <button
              onClick={handleNext}
              aria-label="Next suite"
              className="absolute right-2 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 z-35 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border border-[#d7b56d]"
            >
              <ChevronRight size={20} />
            </button>

            {/* Navigation Dots / Pills Indicator */}
            <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6 z-30">
              {displayRooms.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`transition-all duration-500 rounded-full cursor-pointer ${
                    (activeIndex % displayRooms.length) === idx
                      ? "w-8 h-1.5 bg-[#8f6618] shadow-[0_0_10px_rgba(143,102,24,0.6)]"
                      : "w-2.5 h-1.5 bg-gray-300 hover:bg-[#8f6618]/60"
                  }`}
                  aria-label={`Go to suite ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        )}
      </div>

      {selectedRoom && (
        <BookingModal 
          room={selectedRoom} 
          isOpen={!!selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
          initialCheckIn={searchedDates?.checkin}
          initialCheckOut={searchedDates?.checkout}
        />
      )}
    </section>
  );
}
