"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import BookingModal from "@/components/booking/BookingModal";
import { ChevronLeft, ChevronRight, CalendarX, MoveHorizontal } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

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

const TOTAL_SLOTS = 10;
const ANGLE_STEP = 360 / TOTAL_SLOTS; // 36 degrees per card

export default function RoomsSection({ 
  rooms, 
  unavailableRoomIds = [], 
  searchedDates 
}: RoomsSectionProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const draggerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isDraggingRef = useRef(false);

  // Responsive ring geometry
  const [dimensions, setDimensions] = useState({
    cardWidth: 300,
    cardHeight: 460,
    radius: 500,
    containerHeight: 560,
    perspective: 2000,
  });

  // Vertical Scroll Parallax for Section Header
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  const yHeader = useTransform(smoothProgress, [0, 1], [30, -30]);

  const displayRooms = rooms || [];

  // Generate continuous items for the ring
  const ringRooms = displayRooms.length > 0 
    ? Array.from({ length: TOTAL_SLOTS }).map((_, i) => displayRooms[i % displayRooms.length])
    : [];

  // Handle screen resize for responsive 3D ring radius
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setDimensions({
          cardWidth: 230,
          cardHeight: 380,
          radius: 350,
          containerHeight: 470,
          perspective: 1300,
        });
      } else if (w < 1024) {
        setDimensions({
          cardWidth: 270,
          cardHeight: 420,
          radius: 430,
          containerHeight: 520,
          perspective: 1650,
        });
      } else {
        setDimensions({
          cardWidth: 300,
          cardHeight: 460,
          radius: 500,
          containerHeight: 560,
          perspective: 2000,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update parallax background position for each image in the ring
  const updateBgPositions = useCallback(() => {
    if (!ringRef.current) return;
    const currentRot = gsap.getProperty(ringRef.current, "rotationY") as number;

    cardsRef.current.forEach((cardEl, i) => {
      if (!cardEl) return;
      const imgEl = cardEl.querySelector<HTMLElement>(".ring-card-bg");
      if (!imgEl) return;

      // Calculate smooth wrapped relative angle around camera
      const wrapped = gsap.utils.wrap(-180, 180, currentRot - 180 - i * ANGLE_STEP);
      // Counter parallax translation in pixels
      const xOffset = -(wrapped / 180) * 140;
      imgEl.style.backgroundPosition = `calc(50% + ${xOffset}px) center`;
    });
  }, []);

  // Initialize Draggable 3D Ring with GSAP
  useEffect(() => {
    if (typeof window === "undefined" || ringRooms.length === 0) return;

    gsap.registerPlugin(Draggable);

    const ring = ringRef.current;
    const dragger = draggerRef.current;
    const container = stageRef.current;
    if (!ring || !dragger || !container) return;

    const currentRadius = dimensions.radius;

    // Set initial ring rotation
    gsap.set(dragger, { opacity: 0 });
    gsap.set(ring, { rotationY: 180 });

    // Position each card along the 3D ring cylinder
    cardsRef.current.forEach((cardEl, i) => {
      if (!cardEl) return;
      gsap.set(cardEl, {
        rotateY: i * -ANGLE_STEP,
        transformOrigin: `50% 50% ${currentRadius}px`,
        z: -currentRadius,
        backfaceVisibility: "hidden",
      });
    });

    updateBgPositions();

    // Cinematic entrance animation: cards rise into 3D formation
    gsap.from(cardsRef.current.filter(Boolean), {
      duration: 1.4,
      y: 180,
      opacity: 0,
      stagger: 0.08,
      ease: "expo.out",
    });

    let xPos = 0;
    let startX = 0;

    const draggableInstances = Draggable.create(dragger, {
      type: "x",
      trigger: container,
      allowContextMenu: true,
      onDragStart: function(e) {
        isDraggingRef.current = false;
        const clientX = "touches" in e && e.touches ? e.touches[0].clientX : (e as MouseEvent).clientX;
        xPos = Math.round(clientX);
        startX = xPos;
      },
      onDrag: function(e) {
        const clientX = "touches" in e && e.touches ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const currentX = Math.round(clientX);
        const diff = currentX - xPos;

        if (Math.abs(currentX - startX) > 6) {
          isDraggingRef.current = true;
        }

        // Rotate ring with cursor tracking
        gsap.to(ring, {
          rotationY: "+=" + (diff * 0.75),
          duration: 0.1,
          ease: "none",
          overwrite: "auto",
          onUpdate: updateBgPositions,
        });

        xPos = currentX;
      },
      onDragEnd: function() {
        const currentRot = gsap.getProperty(ring, "rotationY") as number;
        const snappedRot = Math.round(currentRot / ANGLE_STEP) * ANGLE_STEP;

        gsap.to(ring, {
          rotationY: snappedRot,
          duration: 0.7,
          ease: "power2.out",
          onUpdate: updateBgPositions,
        });

        gsap.set(dragger, { x: 0, y: 0 });

        setTimeout(() => {
          isDraggingRef.current = false;
        }, 120);
      },
    });

    return () => {
      draggableInstances.forEach(d => d.kill());
    };
  }, [dimensions.radius, ringRooms.length, updateBgPositions]);

  // Rotate ring via chevron controls
  const rotateRing = (direction: "prev" | "next") => {
    if (!ringRef.current) return;
    const currentRot = gsap.getProperty(ringRef.current, "rotationY") as number;
    const delta = direction === "next" ? -ANGLE_STEP : ANGLE_STEP;
    const target = Math.round((currentRot + delta) / ANGLE_STEP) * ANGLE_STEP;

    gsap.to(ringRef.current, {
      rotationY: target,
      duration: 0.75,
      ease: "power2.out",
      onUpdate: updateBgPositions,
    });
  };

  // Click card to bring to front if clicked on a side card
  const handleCardClick = (index: number) => {
    if (isDraggingRef.current || !ringRef.current) return;
    const currentRot = gsap.getProperty(ringRef.current, "rotationY") as number;
    const relativeAngle = gsap.utils.wrap(-180, 180, currentRot - 180 - index * ANGLE_STEP);

    if (Math.abs(relativeAngle) > 10) {
      const target = currentRot - relativeAngle;
      gsap.to(ringRef.current, {
        rotationY: target,
        duration: 0.75,
        ease: "power2.out",
        onUpdate: updateBgPositions,
      });
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
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
          <div className="w-full relative flex flex-col items-center">
            
            {/* Draggable 3D Parallax Image Ring Container */}
            <div 
              ref={stageRef}
              className="relative w-full overflow-hidden select-none flex items-center justify-center cursor-grab active:cursor-grabbing"
              style={{
                height: `${dimensions.containerHeight}px`,
                perspective: `${dimensions.perspective}px`,
                touchAction: "pan-y",
              }}
            >
              {/* Invisible GSAP Drag Layer */}
              <div 
                ref={draggerRef} 
                id="dragger"
                className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
              />

              {/* 3D Ring */}
              <div 
                ref={ringRef} 
                id="ring"
                className="relative"
                style={{
                  width: `${dimensions.cardWidth}px`,
                  height: `${dimensions.cardHeight}px`,
                  transformStyle: "preserve-3d",
                }}
              >
                {ringRooms.map((room, i) => {
                  const isUnavailable = unavailableRoomIds.includes(room.id);

                  return (
                    <div
                      key={`${room.id}-${i}`}
                      ref={(el) => { cardsRef.current[i] = el; }}
                      onClick={() => handleCardClick(i)}
                      className="ring-card group absolute inset-0 rounded-t-[130px] sm:rounded-t-[160px] md:rounded-t-[180px] overflow-hidden bg-neutral-900 border border-[#d7b56d]/35 shadow-[0_24px_50px_rgba(0,0,0,0.35)] cursor-pointer select-none"
                      style={{
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {/* Parallax Background Image Window */}
                      <div
                        className="ring-card-bg absolute inset-0 w-full h-full rounded-t-[130px] sm:rounded-t-[160px] md:rounded-t-[180px] will-change-transform"
                        style={{
                          backgroundImage: `url(${room.image_url || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop"})`,
                          backgroundSize: "160% 100%",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center center",
                          filter: isUnavailable ? "grayscale(40%)" : "none",
                        }}
                      />

                      {/* Dark Atmospheric Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none rounded-t-[130px] sm:rounded-t-[160px] md:rounded-t-[180px]" />
                      <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-t-[130px] sm:rounded-t-[160px] md:rounded-t-[180px]" />

                      {/* Unavailable Overlay Badge */}
                      {isUnavailable && (
                        <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-[#78231C]/95 text-white border border-red-500/50 px-3.5 py-1 rounded-full font-jost text-[11px] font-semibold tracking-wider flex items-center gap-1.5 shadow-lg z-20 whitespace-nowrap">
                          <CalendarX size={12} />
                          <span>Booked on Dates</span>
                        </div>
                      )}

                      {/* Room Card Information Inside 3D Frame */}
                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col items-center text-center z-10 pointer-events-auto">
                        
                        {/* Rate / Price Tag */}
                        <span className="font-jost text-white/75 text-[11px] sm:text-[12px] uppercase tracking-[0.2em] font-medium mb-0.5">
                          From
                        </span>
                        <div className="font-marcellus text-[#d7b56d] text-[22px] sm:text-[26px] leading-tight mb-2 drop-shadow-md font-normal">
                          {room.price_per_night ? `PKR ${room.price_per_night.toLocaleString()}` : "Price on Request"}
                        </div>

                        {/* Title */}
                        <h3 className="font-marcellus text-white text-[19px] sm:text-[22px] font-normal leading-snug mb-1 drop-shadow-md truncate max-w-full px-2">
                          {room.title}
                        </h3>

                        {/* Specs */}
                        <div className="font-jost text-[#FFFFFF]/85 text-[12px] sm:text-[13px] font-light tracking-wider flex items-center justify-center gap-2.5 mb-3.5">
                          <span>{room.bed_type || "2 Guests"}</span>
                          <span className="opacity-40">•</span>
                          <span>{room.size_sqft ? `${room.size_sqft} ft` : "30 ft"}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-2 w-full max-w-[240px]">
                          {!isUnavailable ? (
                            <Link
                              href={`/booking?roomId=${room.id}${searchedDates?.checkin ? `&checkin=${searchedDates.checkin}&checkout=${searchedDates.checkout}` : ""}`}
                              onClick={handleLinkClick}
                              className="flex-1 bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white text-[10px] sm:text-[11px] font-jost font-semibold uppercase tracking-[0.12em] py-2 px-3 rounded-full transition-all duration-300 shadow-md text-center border border-[#d7b56d] hover:border-white active:scale-95"
                            >
                              Book Now
                            </Link>
                          ) : (
                            <span className="flex-1 bg-[#78231C]/95 text-white text-[10px] sm:text-[11px] font-jost font-semibold uppercase tracking-[0.12em] py-2 px-3 rounded-full text-center">
                              Booked
                            </span>
                          )}

                          <Link
                            href={`/rooms/${room.slug || room.id}`}
                            onClick={handleLinkClick}
                            className="flex-1 bg-white/15 hover:bg-white text-white hover:text-black border border-white/60 text-[10px] sm:text-[11px] font-jost font-semibold uppercase tracking-[0.12em] py-2 px-3 rounded-full transition-all duration-300 shadow-md text-center active:scale-95"
                          >
                            Explore
                          </Link>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Side Vignettes for cinematic edge fade */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-36 md:w-56 bg-gradient-to-r from-white via-white/85 to-transparent z-20" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-36 md:w-56 bg-gradient-to-l from-white via-white/85 to-transparent z-20" />

              {/* Left Chevron Button */}
              <button
                onClick={(e) => { e.stopPropagation(); rotateRing("prev"); }}
                aria-label="Previous suite"
                className="absolute left-2 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border border-[#d7b56d]"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Right Chevron Button */}
              <button
                onClick={(e) => { e.stopPropagation(); rotateRing("next"); }}
                aria-label="Next suite"
                className="absolute right-2 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border border-[#d7b56d]"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Drag to Spin 3D Hint */}
            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-gray-500 font-jost text-[12px] sm:text-[13px] tracking-widest uppercase">
              <MoveHorizontal size={14} className="text-[#8f6618] animate-pulse" />
              <span>Drag or swipe to spin in 3D</span>
              <MoveHorizontal size={14} className="text-[#8f6618] animate-pulse" />
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
