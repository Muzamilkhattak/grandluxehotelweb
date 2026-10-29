"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BookingModal from "@/components/booking/BookingModal";
import { ChevronLeft, ChevronRight, CalendarX } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";

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
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const displayRooms = rooms || [];

  return (
    <section className="py-14 sm:py-20 md:py-28 bg-[#FFFFFF] relative px-3 sm:px-4 overflow-hidden">
      <div className="max-w-[1380px] mx-auto flex flex-col items-center">
        
        {/* Section Heading */}
        <div className="text-center mb-10 sm:mb-14 md:mb-16 max-w-2xl">
          <span className="font-vogue text-[#d7b56d] tracking-[0.26em] uppercase text-[11px] sm:text-[12px] font-bold block mb-2 sm:mb-3">
            Accommodations
          </span>
          <h2 className="font-marcellus text-3xl sm:text-4xl md:text-[52px] lg:text-[60px] text-primary leading-tight font-normal">
            Curated Suites
          </h2>
          <div className="w-14 sm:w-16 h-[2px] bg-[#d7b56d] mx-auto mt-3 sm:mt-4" />
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
          <div className="relative w-full px-6 sm:px-8 md:px-12">
            
            {/* Left Chevron Button */}
            <button
              onClick={() => swiperInstance?.slidePrev()}
              aria-label="Previous suite"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border border-[#d7b56d]"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Right Chevron Button */}
            <button
              onClick={() => swiperInstance?.slideNext()}
              aria-label="Next suite"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border border-[#d7b56d]"
            >
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Arched Rooms Carousel */}
            <Swiper
              onSwiper={setSwiperInstance}
              modules={[Navigation, Autoplay]}
              spaceBetween={28}
              slidesPerView={1}
              loop={displayRooms.length > 3}
              autoplay={{
                delay: 5500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 32,
                },
              }}
              className="w-full !py-2"
            >
              {displayRooms.map((room) => {
                const isUnavailable = unavailableRoomIds.includes(room.id);

                return (
                  <SwiperSlide key={room.id} className="!h-auto">
                    <div 
                      className="group relative w-full h-[390px] sm:h-[430px] md:h-[460px] rounded-t-[150px] sm:rounded-t-[180px] md:rounded-t-[200px] overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl bg-neutral-900 border border-[#d7b56d]/20"
                    >
                      {/* Full-bleed Room Image with Arched Top */}
                      {room.image_url ? (
                        <Image 
                          src={room.image_url} 
                          alt={room.title} 
                          fill 
                          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                            isUnavailable ? "grayscale-[40%]" : ""
                          }`}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-jost">
                          No Image Available
                        </div>
                      )}

                      {/* Unavailable Overlay Badge */}
                      {isUnavailable && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#78231C]/95 text-white border border-red-500/50 px-4 py-1.5 rounded-full font-jost text-[12px] font-semibold tracking-wider flex items-center gap-1.5 shadow-lg z-20 whitespace-nowrap">
                          <CalendarX size={13} />
                          <span>Booked on Selected Dates</span>
                        </div>
                      )}

                      {/* Bottom Gradient Overlay (Normal State - Matches Reference) */}
                      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#000000]/95 via-[#000000]/55 to-transparent pointer-events-none" />

                      {/* Room Details Inside Arched Card Bottom (Normal State) */}
                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col items-center text-center z-10">
                        {/* Title */}
                        <h3 className="font-marcellus text-white text-[22px] sm:text-[25px] md:text-[28px] font-normal leading-tight mb-1.5 tracking-wide drop-shadow-md">
                          {room.title}
                        </h3>

                        {/* Specs (2 Guests, Size sqft) */}
                        <div className="font-jost text-[#FFFFFF]/90 text-[13px] sm:text-[14px] font-light tracking-widest flex items-center justify-center gap-3">
                          <span>{room.bed_type || "2 Guests"}</span>
                          <span className="opacity-40">•</span>
                          <span>{room.size_sqft ? `${room.size_sqft} ft` : "30 ft"}</span>
                        </div>
                      </div>

                      {/* Sliding Black Hover Overlay (Low Opacity Transparent) */}
                      <div className="absolute inset-0 bg-[#000000]/75 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-auto">
                        <span className="font-jost text-white/80 text-[13px] sm:text-[14px] uppercase tracking-[0.22em] font-medium mb-1">
                          From
                        </span>

                        <div className="font-marcellus text-[#d7b56d] text-[32px] sm:text-[40px] leading-none mb-5 drop-shadow-md font-normal">
                          {room.price_per_night ? `PKR ${room.price_per_night.toLocaleString()}` : "Price on Request"}
                        </div>

                        {/* Instant Reserve & Explore Suite Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full max-w-[260px]">
                          {!isUnavailable ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedRoom(room);
                              }}
                              className="w-full sm:w-auto bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white text-[10px] sm:text-[11px] font-jost font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full transition-all duration-300 shadow-md cursor-pointer border border-[#d7b56d] hover:border-white"
                            >
                              Instant Reserve
                            </button>
                          ) : (
                            <span className="bg-[#78231C]/95 text-white text-[10px] sm:text-[11px] font-jost font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full shadow-md">
                              Booked
                            </span>
                          )}

                          <Link
                            href={`/rooms/${room.slug || room.id}`}
                            className="w-full sm:w-auto bg-white/15 hover:bg-white text-white hover:text-[#000000] border border-white/60 text-[10px] sm:text-[11px] font-jost font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full transition-all duration-300 shadow-md text-center"
                          >
                            Explore Suite
                          </Link>
                        </div>
                      </div>

                    </div>
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
