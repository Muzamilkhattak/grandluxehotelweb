"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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

function optimizeImageUrl(url: string, width = 680): string {
  if (!url) return url;
  try {
    if (url.includes("images.unsplash.com")) {
      const u = new URL(url);
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", "75");
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    }
  } catch {
    return url;
  }
  return url;
}

const DEFAULT_PREVIEW_IMAGES = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=75&w=680&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=75&w=680&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=75&w=680&auto=format&fit=crop",
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
    list = DEFAULT_PREVIEW_IMAGES;
  }
  return list.map((src) => optimizeImageUrl(src, 680));
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

const RoomCardItem = React.memo(function RoomCardItem({
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
  const isVisible = Math.abs(diff) <= 2;

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSlideshow = () => {
    if (!isCenter) return;
    if (images.length > 1 && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx((prev) => (prev + 1) % images.length);
      }, 2500);
    }
  };

  const stopSlideshow = () => {
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

  // For non-center cards, only mount 1 image to eliminate image decoding overhead
  const displayImages = isCenter ? images : images.slice(0, 1);

  return (
    <div
      onClick={!isCenter ? onSelect : undefined}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transformOrigin: "0% 100%",
        zIndex: Math.max(1, Math.round(zIndex * 10)),
        opacity: opacity,
        visibility: isVisible ? "visible" : "hidden",
        pointerEvents: opacity <= 0.05 ? "none" : "auto",
        transform: `translate3d(${xPercent}%, ${yPercent}%, 0) rotate(${rotDeg}deg)`,
        willChange: isVisible ? "transform, opacity" : "auto",
        transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease-out",
      }}
      className={`w-[285px] sm:w-[320px] md:w-[345px] h-[415px] sm:h-[435px] md:h-[455px] -ml-[142px] sm:-ml-[160px] md:-ml-[172px] -mt-[207px] sm:-mt-[217px] md:-mt-[227px] select-none ${
        !isCenter ? "cursor-pointer" : ""
      }`}
    >
      <article 
        onMouseEnter={startSlideshow}
        onMouseLeave={stopSlideshow}
        className="group relative w-full h-full bg-[#0d0d0e] border border-neutral-800 hover:border-[#d7b56d]/40 rounded-[24px] sm:rounded-[28px] p-3 sm:p-3.5 pb-3.5 sm:pb-4 shadow-[0_16px_36px_rgba(0,0,0,0.75)] transition-colors duration-300 flex flex-col justify-between overflow-hidden"
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
          className="relative block w-full aspect-[16/10.5] rounded-[18px] overflow-hidden bg-neutral-900 border border-white/5 cursor-pointer shrink-0"
          aria-label={`View ${room.title}`}
        >
          {displayImages.length > 0 ? (
            displayImages.map((imgSrc, idx) => {
              const isNear = idx === 0 || idx === currentIdx || Math.abs(idx - currentIdx) <= 1;
              if (!isNear) return null;

              return (
                <Image 
                  key={imgSrc + idx}
                  src={imgSrc} 
                  alt={`${room.title} photo ${idx + 1}`} 
                  fill 
                  loading={idx === 0 && isCenter ? "eager" : "lazy"}
                  priority={idx === 0 && isCenter}
                  className={`object-cover group-hover:scale-105 transition-transform duration-500 ease-out rounded-[20px] ${
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
        <div className="flex flex-col flex-1 justify-between pt-2.5 sm:pt-3 text-left">
          <div>
            {/* Room Title in Luxury Gold */}
            <h3 className="font-marcellus text-[#d7b56d] text-base sm:text-lg md:text-[21px] font-normal leading-snug tracking-wide group-hover:text-[#e8be74] transition-colors truncate">
              {isCenter ? (
                <Link href={`/rooms/${room.slug || room.id}`}>
                  {room.title}
                </Link>
              ) : (
                <span>{room.title}</span>
              )}
            </h3>

            {/* Capacity & Bed Type Pill Row */}
            <div className="flex items-center gap-2 my-1.5 sm:my-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1b1c20] border border-white/5 text-white">
                <User size={11} className="text-white/80 shrink-0" />
                <span className="font-jost text-[11px] sm:text-xs font-medium tracking-wide">
                  {getRoomPersons(room)}
                </span>
              </div>
              {room.bed_type && (
                <span className="font-jost text-white/50 text-[11px] sm:text-xs tracking-wide truncate">
                  • {room.bed_type}
                </span>
              )}
            </div>

            {/* Price per night */}
            <div className="flex items-baseline mt-0.5 mb-1.5">
              <span className="font-jost font-bold text-white text-xl sm:text-2xl md:text-[26px] tracking-tight leading-none">
                {formatRoomPrice(room.price_per_night)}
              </span>
              <span className="font-jost text-white/60 text-xs sm:text-[13px] font-normal ml-1.5">
                / night
              </span>
            </div>
          </div>

          {/* Bottom Row Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full pt-1">
            {/* Explore Now Button (Outline Gold) */}
            {isCenter ? (
              <Link
                href={`/rooms/${room.slug || room.id}`}
                className="flex-1 border border-[#d7b56d] hover:bg-[#d7b56d] text-[#d7b56d] hover:text-black font-jost font-semibold text-xs sm:text-[13px] h-[38px] sm:h-[40px] rounded-xl transition-all duration-300 flex items-center justify-center text-center shadow-xs cursor-pointer active:scale-[0.98]"
              >
                Explore Now
              </Link>
            ) : (
              <button
                onClick={onSelect}
                className="flex-1 border border-[#d7b56d]/60 text-[#d7b56d] font-jost font-semibold text-xs sm:text-[13px] h-[38px] sm:h-[40px] rounded-xl flex items-center justify-center text-center cursor-pointer"
              >
                Explore Now
              </button>
            )}

            {/* Book Now Button (Solid Gold) */}
            {!isUnavailable ? (
              isCenter ? (
                <Link
                  href={`/booking?roomId=${room.id}${searchedDates?.checkin ? `&checkin=${searchedDates.checkin}&checkout=${searchedDates.checkout}` : ""}`}
                  className="flex-1 bg-[#d7b56d] hover:bg-[#c9a65d] text-black font-jost font-semibold text-xs sm:text-[13px] h-[38px] sm:h-[40px] rounded-xl transition-all duration-300 flex items-center justify-center text-center shadow-md cursor-pointer active:scale-[0.98]"
                >
                  Book Now
                </Link>
              ) : (
                <button
                  onClick={onSelect}
                  className="flex-1 bg-[#d7b56d] text-black font-jost font-semibold text-xs sm:text-[13px] h-[38px] sm:h-[40px] rounded-xl flex items-center justify-center text-center cursor-pointer"
                >
                  Book Now
                </button>
              )
            ) : (
              <span className="flex-1 bg-red-950/80 border border-red-700/50 text-red-300 font-jost font-semibold text-xs sm:text-[13px] h-[38px] sm:h-[40px] rounded-xl flex items-center justify-center text-center">
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
});

export default function RoomsSection({ 
  rooms, 
  unavailableRoomIds = [], 
  searchedDates 
}: RoomsSectionProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const displayRooms = rooms || [];
  const totalCards = displayRooms.length;

  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const wheelAccumulator = useRef(0);
  const isThrottled = useRef(false);

  // Navigate to specific card index
  const goToCard = useCallback((targetIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(totalCards - 1, targetIndex));
    setActiveIndex(clampedIndex);
  }, [totalCards]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (activeIndexRef.current > 0) {
      goToCard(activeIndexRef.current - 1);
    }
  }, [goToCard]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (activeIndexRef.current < totalCards - 1) {
      goToCard(activeIndexRef.current + 1);
    }
  }, [totalCards, goToCard]);

  // Mouse Wheel scroll listener:
  // Pins the section and smoothly moves card-by-card on scroll wheel.
  // Until all cards have slid through, it prevents scrolling down to the next section!
  useEffect(() => {
    if (totalCards <= 1) return;

    const onWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top <= 80 && rect.bottom >= window.innerHeight * 0.45;

      // If the section is not actively framed in the viewport, let normal page scroll happen
      if (!inView) {
        return;
      }

      // Horizontal gestures (e.g. horizontal trackpad scroll) should not be captured
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || Math.abs(e.deltaY) < 10) {
        return;
      }

      const isScrollingDown = e.deltaY > 0;
      const currentIdx = activeIndexRef.current;

      if (isScrollingDown) {
        // Scrolling down:
        // If we haven't reached the last card yet, PREVENT page scroll to next section and slide to next card!
        if (currentIdx < totalCards - 1) {
          e.preventDefault();

          if (!isThrottled.current) {
            wheelAccumulator.current += e.deltaY;
            if (wheelAccumulator.current >= 25) {
              isThrottled.current = true;
              wheelAccumulator.current = 0;
              if (Math.abs(rect.top) > 15) {
                sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
              goToCard(currentIdx + 1);

              setTimeout(() => {
                isThrottled.current = false;
              }, 420);
            }
          }
        } else {
          // We ARE on the last card! All rooms have slid through.
          // Allow normal scroll so user can scroll down to the next section!
        }
      } else {
        // Scrolling up:
        // If we haven't reached the first card yet, PREVENT page scroll up and slide to previous card!
        if (currentIdx > 0) {
          e.preventDefault();

          if (!isThrottled.current) {
            wheelAccumulator.current += e.deltaY;
            if (wheelAccumulator.current <= -25) {
              isThrottled.current = true;
              wheelAccumulator.current = 0;
              if (Math.abs(rect.top) > 15) {
                sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
              goToCard(currentIdx - 1);

              setTimeout(() => {
                isThrottled.current = false;
              }, 420);
            }
          }
        } else {
          // We ARE on the first card!
          // Allow normal scroll so user can scroll up to previous section!
        }
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [totalCards, goToCard]);

  // Keyboard navigation when section is in view
  useEffect(() => {
    if (totalCards <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top <= 80 && rect.bottom >= window.innerHeight * 0.45;
      if (!inView) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (activeIndexRef.current < totalCards - 1) {
          e.preventDefault();
          goToCard(activeIndexRef.current + 1);
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (activeIndexRef.current > 0) {
          e.preventDefault();
          goToCard(activeIndexRef.current - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [totalCards, goToCard]);

  // Touch Swipe for mobile devices
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative bg-black w-full h-screen min-h-[640px] max-h-[960px] py-3 sm:py-4 md:py-6 flex flex-col justify-between items-center overflow-hidden px-3 sm:px-4 select-none"
    >
      {/* Section Heading */}
      <div className="text-center max-w-2xl z-20 pt-1 sm:pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-[#d7b56d]/10 border border-[#d7b56d]/25 mb-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d7b56d]" />
          <span className="font-jost text-[#d7b56d] tracking-[0.22em] uppercase text-[10.5px] sm:text-[11.5px] font-bold">
            Accommodations
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#d7b56d]" />
        </div>
        <h2 className="font-marcellus text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] text-white leading-tight font-normal">
          Curated Suites
        </h2>
        <div className="w-12 sm:w-16 h-[2px] bg-[#d7b56d] mx-auto mt-1.5" />
      </div>
      
      {/* Search Dates Banner */}
      {searchedDates?.checkin && searchedDates?.checkout && (
        <div className="bg-neutral-900/90 border border-[#d7b56d]/30 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-center font-jost text-[12px] sm:text-[13px] text-white/90 shadow-sm z-20 -mt-1">
          <span>Availability checked for: </span>
          <strong className="text-[#d7b56d] font-semibold">{searchedDates.checkin}</strong> to <strong className="text-[#d7b56d] font-semibold">{searchedDates.checkout}</strong>
          {unavailableRoomIds.length > 0 && (
            <span className="block sm:inline sm:ml-2.5 text-red-400 font-medium text-[11px] sm:text-[12px]">
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
        <div className="relative w-full flex-1 flex items-center justify-center max-w-[1400px] my-2 sm:my-3">
          
          {/* Left Chevron Button: High Z-Index, Guaranteed Clickable */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="Previous suite"
            className={`absolute left-2 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 z-[100] w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-[#d7b56d] flex items-center justify-center shadow-2xl transition-all duration-300 pointer-events-auto ${
              activeIndex === 0
                ? "opacity-35 cursor-not-allowed bg-black/70 text-[#d7b56d]"
                : "bg-[#d7b56d] hover:bg-white text-black cursor-pointer active:scale-95"
            }`}
          >
            <ChevronLeft size={22} className="sm:w-6 sm:h-6" />
          </button>

          {/* Right Chevron Button: High Z-Index, Guaranteed Clickable */}
          <button
            type="button"
            onClick={handleNext}
            disabled={activeIndex === totalCards - 1}
            aria-label="Next suite"
            className={`absolute right-2 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 z-[100] w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-[#d7b56d] flex items-center justify-center shadow-2xl transition-all duration-300 pointer-events-auto ${
              activeIndex === totalCards - 1
                ? "opacity-35 cursor-not-allowed bg-black/70 text-[#d7b56d]"
                : "bg-[#d7b56d] hover:bg-white text-black cursor-pointer active:scale-95"
            }`}
          >
            <ChevronRight size={22} className="sm:w-6 sm:h-6" />
          </button>

          {/* 3D Curved Fanned Carousel Stage with touch swipe */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full h-[450px] sm:h-[480px] md:h-[510px] flex items-center justify-center overflow-visible select-none"
          >
            {displayRooms.map((room, idx) => {
              const isUnavailable = unavailableRoomIds.includes(room.id);
              return (
                <RoomCardItem
                  key={room.id}
                  room={room}
                  index={idx}
                  active={activeIndex}
                  totalItems={totalCards}
                  isUnavailable={isUnavailable}
                  searchedDates={searchedDates}
                  onSelect={() => goToCard(idx)}
                />
              );
            })}
          </div>

        </div>
      )}

      {/* Bottom Interactive Progress & Scroll Guidance */}
      {totalCards > 1 && (
        <div className="flex flex-col items-center gap-2.5 pb-2 sm:pb-3 z-20">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {displayRooms.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => goToCard(i)}
                aria-label={`Jump to suite ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === i 
                    ? "w-8 bg-[#d7b56d] shadow-sm" 
                    : "w-2 bg-neutral-700 hover:bg-neutral-500"
                }`}
              />
            ))}
          </div>

          {/* Active Counter & Scroll Guidance */}
          <div className="flex items-center gap-3 text-xs font-jost text-neutral-400">
            <span className="text-[#d7b56d] font-semibold tracking-wider">
              Suite {String(activeIndex + 1).padStart(2, "0")} of {String(totalCards).padStart(2, "0")}
            </span>
            <span className="opacity-30">•</span>
            <span className="inline-flex items-center gap-1.5 text-neutral-400 tracking-wide">
              <span>
                {activeIndex === totalCards - 1 
                  ? "Scroll down to continue" 
                  : "Scroll down to explore all suites"}
              </span>
              <ArrowDown size={12} className={activeIndex === totalCards - 1 ? "animate-bounce text-[#d7b56d]" : "animate-pulse"} />
            </span>
          </div>
        </div>
      )}

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
