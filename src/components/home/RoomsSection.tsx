"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BookingModal from "@/components/booking/BookingModal";
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarX, 
  BedDouble, 
  Maximize, 
  Users, 
  Star, 
  Sparkles,
  ArrowRight 
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Tilt3D from "@/components/ui/Tilt3D";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  capacity_guests?: number;
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
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const displayRooms = rooms || [];

  // Calculate nights for dynamic total pricing
  const calculateNights = (checkin?: string, checkout?: string) => {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights(searchedDates?.checkin, searchedDates?.checkout);

  return (
    <section className="py-14 sm:py-20 md:py-28 bg-[#FFFFFF] relative px-3 sm:px-4 overflow-hidden">
      <div className="max-w-[1380px] mx-auto flex flex-col items-center">
        
        {/* Section Heading with High Contrast Gold Badge */}
        <div className="text-center mb-10 sm:mb-14 md:mb-16 max-w-2xl">
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
          <div className="w-14 sm:w-16 h-[2px] bg-[#d7b56d] mx-auto mt-3 sm:mt-4 origin-center" />
        </div>
        
        {/* Search Dates Banner */}
        {searchedDates?.checkin && searchedDates?.checkout && (
          <div className="mb-8 sm:mb-10 bg-[#FFFFFF] border border-[#d7b56d]/30 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-center font-jost text-[13px] sm:text-[14.5px] text-[#000000] shadow-xs">
            <span>Availability checked for: </span>
            <strong className="text-[#d7b56d]">{searchedDates.checkin}</strong> to <strong className="text-[#d7b56d]">{searchedDates.checkout}</strong>
            {unavailableRoomIds.length > 0 && (
              <span className="block sm:inline sm:ml-2.5 text-red-700 font-medium text-[12px] sm:text-[13.5px]">
                ({unavailableRoomIds.length} suite{unavailableRoomIds.length > 1 ? "s" : ""} booked on these dates)
              </span>
            )}
          </div>
        )}

        {displayRooms.length === 0 ? (
          <div className="text-center text-muted font-jost text-xl py-12">
            No suites are currently available matching your criteria.
          </div>
        ) : (
          <div className="relative w-full px-4 sm:px-6 md:px-10">
            
            {/* Left Chevron Button */}
            <button
              onClick={() => swiperInstance?.slidePrev()}
              aria-label="Previous suite"
              className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#000000] text-gray-900 hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border border-gray-200 hover:border-black"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Right Chevron Button */}
            <button
              onClick={() => swiperInstance?.slideNext()}
              aria-label="Next suite"
              className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#000000] text-gray-900 hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border border-gray-200 hover:border-black"
            >
              <ChevronRight size={20} />
            </button>

            {/* Modern Interactive Suite Cards Carousel */}
            <Swiper
              onSwiper={setSwiperInstance}
              modules={[Navigation, Autoplay, Pagination]}
              spaceBetween={28}
              slidesPerView={1}
              loop={displayRooms.length > 3}
              autoplay={{
                delay: 6000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{
                clickable: true,
                bulletActiveClass: "!bg-[#8f6618] !w-7",
                bulletClass: "inline-block w-2.5 h-1.5 rounded-full bg-gray-300 transition-all duration-300 cursor-pointer mx-1",
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 28,
                },
              }}
              className="w-full !pb-14 !pt-2"
            >
              {displayRooms.map((room) => {
                const isUnavailable = unavailableRoomIds.includes(room.id);

                return (
                  <SwiperSlide key={room.id} className="!h-auto !py-2">
                    <Tilt3D maxTilt={4} scale={1.015} glare={true} glareColor="rgba(215, 181, 109, 0.12)" className="h-full">
                      <div className="group flex flex-col h-full bg-white rounded-2xl md:rounded-3xl border border-gray-200/90 hover:border-[#d7b56d]/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_50px_rgba(143,102,24,0.18)] transition-all duration-400 overflow-hidden">
                        
                        {/* 1. Suite Image Container */}
                        <div className="relative h-[230px] sm:h-[250px] md:h-[265px] w-full overflow-hidden bg-gray-900">
                          {room.image_url ? (
                            <Image
                              src={room.image_url}
                              alt={room.title}
                              fill
                              className={`object-cover transition-transform duration-700 ease-out group-hover:scale-108 ${
                                isUnavailable ? "grayscale-[40%]" : ""
                              }`}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-jost">
                              No Image Available
                            </div>
                          )}

                          {/* Gradient Vignette over image */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

                          {/* Category Badge (Top Left) */}
                          <div className="absolute top-3.5 left-3.5 bg-black/70 backdrop-blur-md text-[#d7b56d] border border-[#d7b56d]/40 px-3 py-1 rounded-full text-[11px] font-jost font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                            <Sparkles size={11} className="text-[#d7b56d]" />
                            <span>Boutique Luxury</span>
                          </div>

                          {/* Top Right: Status or 5-Star Rating */}
                          {isUnavailable ? (
                            <div className="absolute top-3.5 right-3.5 bg-[#78231C]/95 text-white border border-red-500/50 px-3 py-1 rounded-full font-jost text-[11px] font-semibold tracking-wider flex items-center gap-1 shadow-md">
                              <CalendarX size={12} />
                              <span>Booked</span>
                            </div>
                          ) : (
                            <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md text-gray-900 border border-gray-200/80 px-2.5 py-1 rounded-full text-[11px] font-jost font-semibold flex items-center gap-1 shadow-xs">
                              <Star size={12} className="text-[#8f6618] fill-[#8f6618]" />
                              <span>5.0</span>
                            </div>
                          )}
                        </div>

                        {/* 2. Suite Content & Details Body */}
                        <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between bg-white">
                          
                          <div>
                            {/* Title */}
                            <h3 className="font-marcellus text-gray-900 group-hover:text-[#8f6618] text-[21px] sm:text-[23px] font-normal leading-snug mb-2.5 transition-colors duration-300">
                              {room.title}
                            </h3>

                            {/* Key Specs Icons Row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] font-jost text-gray-600 mb-3 pb-3 border-b border-gray-100">
                              <span className="flex items-center gap-1.5">
                                <Users size={14} className="text-[#8f6618]" />
                                <span>{room.capacity_guests || 2} Guests</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <BedDouble size={14} className="text-[#8f6618]" />
                                <span>{room.bed_type || "King Bed"}</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Maximize size={14} className="text-[#8f6618]" />
                                <span>{room.size_sqft ? `${room.size_sqft} sq ft` : "350 sq ft"}</span>
                              </span>
                            </div>

                            {/* Short Description */}
                            <p className="font-jost text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-4">
                              {room.description || "Experience refined comfort, handcrafted furnishings, and signature bespoke hospitality in our boutique suites."}
                            </p>
                          </div>

                          {/* 3. Pricing & Call To Action Row */}
                          <div className="pt-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-auto">
                            
                            {/* Price Breakdown */}
                            <div>
                              <span className="text-[10.5px] font-jost uppercase tracking-[0.16em] text-gray-400 font-medium block">
                                Starting From
                              </span>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="font-marcellus text-[22px] sm:text-[25px] text-gray-950 font-medium leading-none">
                                  {room.price_per_night ? `PKR ${room.price_per_night.toLocaleString()}` : "Price on Request"}
                                </span>
                                <span className="font-jost text-[12px] text-gray-500 font-light">/ night</span>
                              </div>
                              
                              {/* Dynamic pricing for searched dates */}
                              {nights > 0 && room.price_per_night && (
                                <span className="text-[11.5px] font-jost text-[#8f6618] font-semibold block mt-1">
                                  PKR {(room.price_per_night * nights).toLocaleString()} total ({nights} night{nights > 1 ? "s" : ""})
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              {!isUnavailable ? (
                                <Link
                                  href={`/booking?roomId=${room.id}${searchedDates?.checkin ? `&checkin=${searchedDates.checkin}&checkout=${searchedDates.checkout}` : ""}`}
                                  className="flex-1 sm:flex-initial bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white text-[11px] font-jost font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap active:scale-95 border border-[#d7b56d] hover:border-black text-center"
                                >
                                  Book Now
                                </Link>
                              ) : (
                                <span className="flex-1 sm:flex-initial bg-gray-100 text-gray-400 text-[11px] font-jost font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-full text-center">
                                  Booked
                                </span>
                              )}

                              <Link
                                href={`/rooms/${room.slug || room.id}`}
                                className="flex-1 sm:flex-initial text-gray-700 hover:text-black border border-gray-200 hover:border-black text-[11px] font-jost font-semibold uppercase tracking-[0.14em] px-3.5 py-2.5 rounded-full transition-all duration-300 text-center whitespace-nowrap flex items-center justify-center gap-1 group/btn"
                              >
                                <span>Details</span>
                                <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>

                          </div>

                        </div>

                      </div>
                    </Tilt3D>
                  </SwiperSlide>
                );
              })}
            </Swiper>
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
