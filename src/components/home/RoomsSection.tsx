"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import BookingModal from "@/components/booking/BookingModal";
import { ChevronLeft, ChevronRight, CalendarX, User, ArrowDown } from "lucide-react";

export type Room = {
  id: string;
  title: string;
  slug?: string;
  price_per_night: number;
  bed_type?: string;
  size_sqft?: number;
  capacity?: number;
  amenities?: string[];
  image_url?: string;
  images?: string[];
  description?: string;
};

export type RoomsSectionProps = {
  rooms: Room[];
  unavailableRoomIds?: string[];
  searchedDates?: { checkin: string; checkout: string };
};

const DEFAULT_PREVIEW_IMAGES = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop",
];

function getRoomPreviewImages(room: Room): string[] {
  let list: string[] = [];
  if (Array.isArray(room.images) && room.images.length > 0) {
    list = room.images.filter(Boolean);
  }
  if (room.image_url && !list.includes(room.image_url)) {
    list = [room.image_url, ...list];
  }

  if (list.length === 0) {
    return DEFAULT_PREVIEW_IMAGES;
  }
  return list;
}

function getRoomPersons(room: Room): string {
  if (room.capacity) {
    return `${room.capacity} Person${room.capacity > 1 ? "s" : ""}`;
  }
  const titleLower = (room.title || "").toLowerCase();
  if (titleLower.includes("family") || titleLower.includes("presidential") || titleLower.includes("penthouse")) {
    return "4 Persons";
  }
  if (titleLower.includes("executive") || titleLower.includes("triple") || titleLower.includes("suite")) {
    return "3 Persons";
  }
  return "2 Persons";
}

function formatRoomPrice(price: number | undefined | null): string {
  if (price === undefined || price === null) return "PKR 0";
  const num = typeof price === "number" ? price : Number(String(price).replace(/[^0-9.]/g, "")) || 0;
  return `PKR ${num.toLocaleString()}`;
}

interface RoomCardItemProps {
  room: Room;
  index: number;
  active: number;
  totalItems: number;
  isUnavailable: boolean;
  searchedDates?: { checkin: string; checkout: string };
  onSelect: () => void;
}

function RoomCardItem({
  room,
  index,
  active,
  totalItems,
  isUnavailable,
  searchedDates,
  onSelect,
}: RoomCardItemProps) {
  const diff = index - active;
  const isCenter = diff === 0;

  // CodePen fanned carousel math with calibrated step per card:
  // Each step away shifts by 85% X, 22% Y, and 13° rotation
  const xPercent = diff * 85;
  const yPercent = diff * 22;
  const rotDeg = diff * 13;
  const zIndex = totalItems - Math.abs(diff);
  const rawOpacity = (zIndex / totalItems) * 3 - 2;
  const opacity = Math.max(0, Math.min(1, rawOpacity));

  // Hover slideshow for room photos
  const images = getRoomPreviewImages(room);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSlideshow = () => {
    if (!isCenter) return;
    setIsHovered(true);
    if (images.length > 1 && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx((prev) => (prev + 1) % images.length);
      }, 2500);
    }
  };

  const stopSlideshow = () => {
    setIsHovered(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      onClick={!isCenter ? onSelect : undefined}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transformOrigin: "0% 100%",
        zIndex: Math.max(1, zIndex),
        opacity: opacity,
        pointerEvents: opacity <= 0.05 ? "none" : "auto",
        transform: `translate(${xPercent}%, ${yPercent}%) rotate(${rotDeg}deg)`,
        transition: "transform 0.8s cubic-bezier(0, 0.02, 0, 1), opacity 0.8s cubic-bezier(0, 0.02, 0, 1)",
      }}
      className={`w-[280px] sm:w-[315px] md:w-[340px] h-[430px] sm:h-[455px] md:h-[475px] -ml-[140px] sm:-ml-[157px] md:-ml-[170px] -mt-[215px] sm:-mt-[227px] md:-mt-[237px] select-none ${
        !isCenter ? "cursor-pointer" : ""
      }`}
    >
      <article 
        onMouseEnter={startSlideshow}
        onMouseLeave={stopSlideshow}
        className="group relative w-full h-full bg-[#0d0d0e] border border-neutral-800 hover:border-[#d7b56d]/40 rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 pb-5 sm:pb-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
      >
        {/* Top Inset Image Box with Hover Rotation */}
        <Link 
          href={isCenter ? `/rooms/${room.slug || room.id}` : "#"}
          onClick={(e) => {
            if (!isCenter) {
              e.preventDefault();
              onSelect();
            }
          }}
          className="relative block w-full aspect-[16/10.2] rounded-[20px] overflow-hidden bg-neutral-900 border border-white/5 cursor-pointer"
          aria-label={`View ${room.title}`}
        >
          {images.length > 0 ? (
            images.map((imgSrc, idx) => {
              // Preload active, first, and adjacent slides for instant loading without heavy network bottleneck
              const isNear = idx === 0 || idx === currentIdx || Math.abs(idx - currentIdx) <= 1;
              if (!isNear) return null;

              return (
                <Image 
                  key={imgSrc + idx}
                  src={imgSrc} 
                  alt={`${room.title} photo ${idx + 1}`} 
                  fill 
                  unoptimized
                  loading={idx === 0 && isCenter ? "eager" : "lazy"}
                  priority={idx === 0 && isCenter}
                  className={`object-cover group-hover:scale-105 transition-all duration-700 ease-out rounded-[20px] ${
                    isUnavailable ? "grayscale-[40%]" : ""
                  } ${
                    idx === currentIdx ? "opacity-100 z-1" : "opacity-0 z-0 pointer-events-none"
                  }`}
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 315px, 340px"
                />
              );
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-jost text-sm">
              No Image Available
            </div>
          )}

          {/* Unavailable Tag if booked */}
          {isUnavailable && (
            <div className="absolute top-3 left-3 bg-red-900/90 text-white border border-red-500/50 px-3 py-1 rounded-full font-jost text-[11px] font-semibold tracking-wider flex items-center gap-1.5 shadow-md z-10 pointer-events-none">
              <CalendarX size={12} />
              <span>Booked</span>
            </div>
          )}

          {/* Mini Arrow Controls on Card for Multi-Images */}
          {images.length > 1 && isCenter && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/75 hover:bg-black text-[#d7b56d] border border-[#d7b56d]/50 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/75 hover:bg-black text-[#d7b56d] border border-[#d7b56d]/50 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Slide Indicators on Card (interactive dots) */}
          {images.length > 1 && isCenter && (
            <div 
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md transition-opacity duration-300"
            >
              {images.map((_, dotIdx) => (
                <button
                  type="button"
                  key={dotIdx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIdx(dotIdx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === currentIdx 
                      ? "w-4 bg-[#d7b56d]" 
                      : "w-1.5 bg-white/40 hover:bg-white/90"
                  }`}
                  aria-label={`View photo ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
        </Link>

        {/* Card Content */}
        <div className="flex flex-col flex-1 pt-3.5 sm:pt-4 text-left">
          {/* Room Title in Luxury Gold */}
          <h3 className="font-marcellus text-[#d7b56d] text-lg sm:text-xl md:text-[22px] font-normal leading-snug tracking-wide group-hover:text-[#e8be74] transition-colors truncate">
            {isCenter ? (
              <Link href={`/rooms/${room.slug || room.id}`}>
                {room.title}
              </Link>
            ) : (
              <span>{room.title}</span>
            )}
          </h3>

          {/* Capacity / Persons Pill Badge */}
          <div className="my-2.5 sm:my-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full bg-[#1b1c20] border border-white/5 text-white">
              <User size={12} className="text-white/80 shrink-0" />
              <span className="font-jost text-xs sm:text-[12.5px] font-medium tracking-wide">
                {getRoomPersons(room)}
              </span>
            </div>
          </div>

          {/* Price per night */}
          <div className="flex items-baseline mb-4 sm:mb-5 mt-0.5">
            <span className="font-jost font-bold text-white text-2xl sm:text-[28px] md:text-[30px] tracking-tight leading-none">
              {formatRoomPrice(room.price_per_night)}
            </span>
            <span className="font-jost text-white/60 text-xs sm:text-sm font-normal ml-1.5">
              / night
            </span>
          </div>

          {/* Bottom Row Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full mt-auto pt-0.5">
            {/* Explore Now Button (Outline Gold) */}
            {isCenter ? (
              <Link
                href={`/rooms/${room.slug || room.id}`}
                className="flex-1 border border-[#d7b56d] hover:bg-[#d7b56d] text-[#d7b56d] hover:text-black font-jost font-semibold text-xs sm:text-sm h-[42px] sm:h-[44px] rounded-xl transition-all duration-300 flex items-center justify-center text-center shadow-xs cursor-pointer active:scale-[0.98]"
              >
                Explore Now
              </Link>
            ) : (
              <button
                onClick={onSelect}
                className="flex-1 border border-[#d7b56d]/60 text-[#d7b56d] font-jost font-semibold text-xs sm:text-sm h-[42px] sm:h-[44px] rounded-xl flex items-center justify-center text-center cursor-pointer"
              >
                Explore Now
              </button>
            )}

            {/* Book Now Button (Solid Gold) */}
            {!isUnavailable ? (
              isCenter ? (
                <Link
                  href={`/booking?roomId=${room.id}${searchedDates?.checkin ? `&checkin=${searchedDates.checkin}&checkout=${searchedDates.checkout}` : ""}`}
                  className="flex-1 bg-[#d7b56d] hover:bg-[#c9a65d] text-black font-jost font-semibold text-xs sm:text-sm h-[42px] sm:h-[44px] rounded-xl transition-all duration-300 flex items-center justify-center text-center shadow-md cursor-pointer active:scale-[0.98]"
                >
                  Book Now
                </Link>
              ) : (
                <button
                  onClick={onSelect}
                  className="flex-1 bg-[#d7b56d] text-black font-jost font-semibold text-xs sm:text-sm h-[42px] sm:h-[44px] rounded-xl flex items-center justify-center text-center cursor-pointer"
                >
                  Book Now
                </button>
              )
            ) : (
              <span className="flex-1 bg-red-950/80 border border-red-700/50 text-red-300 font-jost font-semibold text-xs sm:text-sm h-[42px] sm:h-[44px] rounded-xl flex items-center justify-center text-center">
                Booked
              </span>
            )}
          </div>
        </div>

        {/* Backdrop overlay on non-centered cards to focus attention on active */}
        {!isCenter && (
          <div className="absolute inset-0 bg-black/35 hover:bg-black/15 transition-colors pointer-events-none rounded-[28px] sm:rounded-[32px]" />
        )}
      </article>
    </div>
  );
}

export default function RoomsSection({ 
  rooms, 
  unavailableRoomIds = [], 
  searchedDates 
}: RoomsSectionProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const displayRooms = rooms || [];
  const totalCards = displayRooms.length;

  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Scroll listener: detects user scroll position inside section and maps to cards
  const handleScroll = useCallback(() => {
    if (!sectionRef.current || totalCards <= 1) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const scrollableHeight = sectionRef.current.offsetHeight - window.innerHeight;
    if (scrollableHeight <= 0) return;

    // How far has top of section scrolled past top of viewport?
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

    // Map progress smoothly into card indexes
    const newActive = Math.min(totalCards - 1, Math.floor(progress * totalCards));
    setActive(newActive);
  }, [totalCards]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Smooth programmatic scroll when clicking a card or chevron
  const scrollToCard = useCallback((targetIndex: number) => {
    if (!sectionRef.current || totalCards <= 1) {
      setActive(targetIndex);
      return;
    }
    const rect = sectionRef.current.getBoundingClientRect();
    const scrollableHeight = sectionRef.current.offsetHeight - window.innerHeight;
    const containerTopDoc = window.scrollY + rect.top;
    
    // Position comfortably inside target card's scroll segment
    const targetProgress = (targetIndex + 0.45) / totalCards;
    const targetScrollY = containerTopDoc + Math.min(scrollableHeight, targetProgress * scrollableHeight);

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth"
    });
  }, [totalCards]);

  const handlePrev = () => {
    scrollToCard(Math.max(0, active - 1));
  };

  const handleNext = () => {
    scrollToCard(Math.min(totalCards - 1, active + 1));
  };

  // Outer scroll track height: gives enough scroll space for each card before releasing to next section
  // e.g. 4 cards = 320vh (each card gets ~70-80vh of scroll before advancing)
  const trackHeightVh = totalCards > 1 ? Math.max(240, totalCards * 80) : 100;

  return (
    <section 
      ref={sectionRef}
      style={{ height: `${trackHeightVh}vh` }}
      className="relative bg-black w-full"
    >
      {/* Pinned Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between items-center overflow-hidden bg-black px-3 sm:px-4 py-6 sm:py-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl z-20 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#d7b56d]/10 border border-[#d7b56d]/25 mb-2 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d7b56d]" />
            <span className="font-jost text-[#d7b56d] tracking-[0.22em] uppercase text-[11px] sm:text-[12px] font-bold">
              Accommodations
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#d7b56d]" />
          </div>
          <h2 className="font-marcellus text-2xl sm:text-3xl md:text-[44px] lg:text-[48px] text-white leading-tight font-normal">
            Curated Suites
          </h2>
          <div className="w-12 sm:w-16 h-[2px] bg-[#d7b56d] mx-auto mt-2" />
        </div>
        
        {/* Search Dates Banner */}
        {searchedDates?.checkin && searchedDates?.checkout && (
          <div className="bg-neutral-900/90 border border-[#d7b56d]/30 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-center font-jost text-[12px] sm:text-[13.5px] text-white/90 shadow-sm z-20 -mt-2">
            <span>Availability checked for: </span>
            <strong className="text-[#d7b56d] font-semibold">{searchedDates.checkin}</strong> to <strong className="text-[#d7b56d] font-semibold">{searchedDates.checkout}</strong>
            {unavailableRoomIds.length > 0 && (
              <span className="block sm:inline sm:ml-2.5 text-red-400 font-medium text-[11px] sm:text-[12.5px]">
                ({unavailableRoomIds.length} booked)
              </span>
            )}
          </div>
        )}

        {totalCards === 0 ? (
          <div className="text-center text-zinc-400 font-jost text-xl py-12">
            No suites are currently available matching your criteria.
          </div>
        ) : (
          <div className="relative w-full flex-1 flex items-center justify-center max-w-[1400px]">
            
            {/* Left Chevron Button */}
            <button
              onClick={handlePrev}
              disabled={active === 0}
              aria-label="Previous suite"
              className={`absolute left-2 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#d7b56d] flex items-center justify-center shadow-2xl transition-all duration-300 ${
                active === 0 
                  ? "opacity-30 cursor-not-allowed bg-black/60 text-[#d7b56d]" 
                  : "bg-[#d7b56d] hover:bg-white text-black cursor-pointer active:scale-95"
              }`}
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Right Chevron Button */}
            <button
              onClick={handleNext}
              disabled={active === totalCards - 1}
              aria-label="Next suite"
              className={`absolute right-2 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#d7b56d] flex items-center justify-center shadow-2xl transition-all duration-300 ${
                active === totalCards - 1 
                  ? "opacity-30 cursor-not-allowed bg-black/60 text-[#d7b56d]" 
                  : "bg-[#d7b56d] hover:bg-white text-black cursor-pointer active:scale-95"
              }`}
            >
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* 3D Curved Fanned Carousel Stage */}
            <div className="relative w-full h-[470px] sm:h-[500px] md:h-[530px] flex items-center justify-center overflow-visible select-none">
              {displayRooms.map((room, idx) => {
                const isUnavailable = unavailableRoomIds.includes(room.id);
                return (
                  <RoomCardItem
                    key={room.id}
                    room={room}
                    index={idx}
                    active={active}
                    totalItems={totalCards}
                    isUnavailable={isUnavailable}
                    searchedDates={searchedDates}
                    onSelect={() => scrollToCard(idx)}
                  />
                );
              })}
            </div>

          </div>
        )}

        {/* Bottom Interactive Progress & Scroll Guidance */}
        {totalCards > 1 && (
          <div className="flex flex-col items-center gap-2 pb-2 sm:pb-3 z-20">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {displayRooms.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToCard(i)}
                  aria-label={`Jump to suite ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    active === i 
                      ? "w-8 bg-[#d7b56d] shadow-sm" 
                      : "w-2 bg-neutral-700 hover:bg-neutral-500"
                  }`}
                />
              ))}
            </div>

            {/* Active Counter & Scroll Hint */}
            <div className="flex items-center gap-3 text-xs font-jost text-neutral-400">
              <span className="text-[#d7b56d] font-semibold tracking-wider">
                Suite 0{active + 1} of 0{totalCards}
              </span>
              <span className="opacity-30">•</span>
              <span className="inline-flex items-center gap-1 text-neutral-400 tracking-wide">
                <span>{active === totalCards - 1 ? "Scroll down to continue" : "Scroll to explore"}</span>
                <ArrowDown size={12} className={active === totalCards - 1 ? "animate-bounce text-[#d7b56d]" : "animate-pulse"} />
              </span>
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
