"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Calendar as CalendarIcon, 
  BedDouble, 
  Maximize, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Clock, 
  SlidersHorizontal 
} from "lucide-react";

export type SearchRoom = {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  price_per_night: number;
  capacity?: number;
  capacity_guests?: number;
  bed_type?: string;
  size_sqft?: number;
  image_url?: string;
  gallery_urls?: string[];
  amenities?: string[];
  total_rooms?: number;
};

interface SearchResultsClientProps {
  initialCheckIn: string;
  initialCheckOut: string;
  initialAdults: number;
  initialChildren: number;
  recommendedRooms: SearchRoom[];
  otherRooms: SearchRoom[];
  bookedRooms: SearchRoom[];
}

export default function SearchResultsClient({
  initialCheckIn,
  initialCheckOut,
  initialAdults,
  initialChildren,
  recommendedRooms,
  otherRooms,
  bookedRooms,
}: SearchResultsClientProps) {
  const router = useRouter();

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getNextDayStr = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return getTodayStr();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();
  const safeInitialIn = initialCheckIn && initialCheckIn >= todayStr ? initialCheckIn : todayStr;
  const safeInitialOut = initialCheckOut && initialCheckOut > safeInitialIn ? initialCheckOut : getNextDayStr(safeInitialIn);

  const [checkIn, setCheckIn] = useState(safeInitialIn);
  const [checkOut, setCheckOut] = useState(safeInitialOut);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);

  const totalGuests = adults + children;

  const calculateNights = (inDate: string, outDate: string) => {
    if (!inDate || !outDate) return 1;
    const start = new Date(inDate);
    const end = new Date(outDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 1;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const nights = calculateNights(checkIn, checkOut);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    params.set("adults", adults.toString());
    params.set("children", children.toString());
    router.push(`/search?${params.toString()}`);
  };

  const getBookingUrl = (roomId: string) => {
    const params = new URLSearchParams();
    params.set("roomId", roomId);
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    params.set("adults", adults.toString());
    params.set("children", children.toString());
    return `/booking?${params.toString()}`;
  };

  const renderRoomCard = (room: SearchRoom, isRecommended = false, isBooked = false) => {
    const roomCapacity = room.capacity || room.capacity_guests || 2;
    const totalStayPrice = room.price_per_night * nights;

    return (
      <div
        key={room.id}
        className={`bg-white border-2 transition-all duration-300 rounded-lg overflow-hidden flex flex-col lg:flex-row shadow-md hover:shadow-xl ${
          isRecommended
            ? "border-[#d7b56d] ring-1 ring-[#d7b56d]/30"
            : isBooked
            ? "border-gray-200 opacity-75"
            : "border-gray-200 hover:border-gray-400"
        }`}
      >
        {/* Left: Room Image with Badges */}
        <div className="relative w-full lg:w-[42%] min-h-[260px] sm:min-h-[300px] lg:min-h-[340px] bg-neutral-900 shrink-0">
          {room.image_url ? (
            <Image
              src={room.image_url}
              alt={room.title}
              fill
              className={`object-cover ${isBooked ? "grayscale-[60%]" : ""}`}
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 font-jost text-sm">
              Signature Art Hotel
            </div>
          )}

          {/* Recommended Pill Badge */}
          {isRecommended && (
            <div className="absolute top-4 left-4 z-10 bg-[#000000] text-[#d7b56d] border border-[#d7b56d] px-3.5 py-1.5 rounded-full text-[12px] font-jost font-semibold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#d7b56d]" />
              Recommended for your party ({totalGuests} Guests)
            </div>
          )}

          {isBooked && (
            <div className="absolute top-4 left-4 z-10 bg-red-700 text-white px-3.5 py-1.5 rounded-full text-[12px] font-jost font-semibold uppercase tracking-wider shadow-lg">
              Booked for Selected Dates
            </div>
          )}

          {/* Bottom Shadow Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          
          <div className="absolute bottom-3 left-4 text-white font-jost text-[13px] flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users size={14} className="text-[#d7b56d]" /> Up to {roomCapacity} Guests
            </span>
            {room.bed_type && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BedDouble size={14} className="text-[#d7b56d]" /> {room.bed_type}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Room Details, Pricing & Action CTA */}
        <div className="p-5 sm:p-7 flex flex-col justify-between flex-1 gap-5">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[11.5px] font-jost uppercase tracking-[0.2em] text-[#d7b56d] font-semibold block mb-1">
                  Exclusive Luxury Suite
                </span>
                <h3 className="font-marcellus text-2xl sm:text-3xl text-gray-900 font-medium leading-tight">
                  {room.title}
                </h3>
              </div>

              {/* Price block */}
              <div className="text-right">
                <span className="text-xs font-jost text-gray-500 uppercase tracking-wider block">Daily Rate</span>
                <div className="font-marcellus text-2xl sm:text-3xl text-gray-900 font-bold">
                  PKR {room.price_per_night?.toLocaleString()}
                </div>
                <span className="text-[12.5px] font-jost text-[#8f6618] font-semibold block mt-0.5">
                  Total for {nights} {nights === 1 ? 'day' : 'days'}: PKR {totalStayPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {room.description && (
              <p className="font-jost text-gray-600 text-[14.5px] leading-relaxed line-clamp-2 mt-2">
                {room.description}
              </p>
            )}

            {/* Room Features Pills */}
            <div className="mt-4 flex flex-wrap gap-2 text-[13px] font-jost text-gray-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-md">
                <Users size={13} className="text-[#d7b56d]" /> Max Capacity: {roomCapacity} {roomCapacity === 1 ? 'Guest' : 'Guests'}
              </span>
              {room.size_sqft && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-md">
                  <Maximize size={13} className="text-[#d7b56d]" /> {room.size_sqft} sq ft
                </span>
              )}
              {room.amenities && Array.isArray(room.amenities) && room.amenities.slice(0, 3).map((amenity, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md">
                  <Check size={12} className="text-green-600" /> {amenity}
                </span>
              ))}
            </div>

            {/* Included Perks */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-jost text-gray-600">
              <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                <ShieldCheck size={14} className="text-[#d7b56d]" /> Free Cancellation 48h
              </span>
              <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                <Clock size={14} className="text-[#d7b56d]" /> 24/7 Concierge & Room Service
              </span>
              <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                <Sparkles size={14} className="text-[#d7b56d]" /> High-speed Premium Wi-Fi
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              href={`/rooms/${room.slug || room.id}`}
              className="font-jost text-sm text-gray-700 hover:text-black font-semibold underline underline-offset-4 transition-colors"
            >
              View Suite Details & Photos
            </Link>

            {isBooked ? (
              <button
                disabled
                className="w-full sm:w-auto bg-gray-200 text-gray-500 font-jost font-semibold text-[13px] uppercase tracking-wider px-6 py-3 rounded-md cursor-not-allowed"
              >
                Unavailable for dates
              </button>
            ) : (
              <Link
                href={getBookingUrl(room.id)}
                className="w-full sm:w-auto bg-[#000000] hover:bg-[#d7b56d] text-white hover:text-black font-jost font-semibold text-[13px] uppercase tracking-[0.14em] px-7 py-3.5 rounded-md transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                Book This Suite
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Search Controls Bar */}
      <div className="bg-white border-2 border-gray-200 shadow-lg p-5 sm:p-6 rounded-lg mb-10">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#d7b56d]" />
            <h2 className="font-marcellus text-lg sm:text-xl text-gray-900 font-medium">
              Adjust Stay Dates & Guests
            </h2>
          </div>
          <span className="font-jost text-xs sm:text-sm text-gray-500">
            {nights} {nights === 1 ? "Night" : "Nights"} Stay • {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-end gap-3.5 w-full">
          <div className="flex-1 w-full">
            <label className="block text-[13px] sm:text-[14px] font-jost text-gray-700 font-medium mb-1.5">
              Check-in Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={checkIn}
              onChange={(e) => {
                const newIn = e.target.value;
                setCheckIn(newIn);
                if (checkOut && newIn >= checkOut) {
                  setCheckOut(getNextDayStr(newIn));
                }
              }}
              required
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[48px] focus:outline-none focus:border-black transition-colors text-[14px]"
            />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-[13px] sm:text-[14px] font-jost text-gray-700 font-medium mb-1.5">
              Check-out Date
            </label>
            <input
              type="date"
              min={checkIn ? getNextDayStr(checkIn) : getNextDayStr(todayStr)}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[48px] focus:outline-none focus:border-black transition-colors text-[14px]"
            />
          </div>

          <div className="w-full md:w-[130px]">
            <label className="block text-[13px] sm:text-[14px] font-jost text-gray-700 font-medium mb-1.5">
              Adults
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
              required
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[48px] focus:outline-none focus:border-black transition-colors text-[14px]"
            />
          </div>

          <div className="w-full md:w-[130px]">
            <label className="block text-[13px] sm:text-[14px] font-jost text-gray-700 font-medium mb-1.5">
              Children
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
              required
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[48px] focus:outline-none focus:border-black transition-colors text-[14px]"
            />
          </div>

          <div className="w-full md:w-auto">
            <button
              type="submit"
              className="w-full md:w-auto bg-[#000000] hover:bg-[#d7b56d] text-white hover:text-black font-jost font-semibold text-[13px] uppercase tracking-[0.14em] px-6 rounded-md transition-all duration-300 h-[48px] shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={15} />
              Update Search
            </button>
          </div>
        </form>
      </div>

      {/* Results Header Notice */}
      <div className="mb-8">
        <h1 className="font-marcellus text-3xl sm:text-4xl text-gray-900 font-normal mb-2">
          Suites Available for {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
        </h1>
        <p className="font-jost text-gray-600 text-base">
          {checkIn && checkOut ? (
            <>
              Showing availability for <span className="font-semibold text-gray-900">{checkIn}</span> to{" "}
              <span className="font-semibold text-gray-900">{checkOut}</span> ({nights}{" "}
              {nights === 1 ? "night" : "nights"}).
            </>
          ) : (
            "Showing luxury rooms matching your requested guest capacity."
          )}
        </p>
      </div>

      {/* SECTION 1: RECOMMENDED ROOMS (Matched by Capacity & Available) */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-6 pb-2 border-b border-gray-200">
          <span className="w-2.5 h-6 bg-[#d7b56d] rounded-xs" />
          <div>
            <h2 className="font-marcellus text-2xl text-gray-900 font-medium">
              Recommended For Your Party
            </h2>
            <p className="font-jost text-sm text-gray-500">
              Suites with capacity for {totalGuests}+ guests that are fully available for your stay dates.
            </p>
          </div>
        </div>

        {recommendedRooms.length > 0 ? (
          <div className="flex flex-col gap-6">
            {recommendedRooms.map((room) => renderRoomCard(room, true, false))}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center font-jost">
            <p className="text-amber-800 font-medium text-base mb-1">
              No single suite matches your party size of {totalGuests} guests for these dates.
            </p>
            <p className="text-amber-700 text-sm">
              Please consider booking multiple suites from our available collection below or adjusting your party size.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: OTHER AVAILABLE ROOMS */}
      {otherRooms.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-2.5 mb-6 pb-2 border-b border-gray-200">
            <span className="w-2.5 h-6 bg-gray-400 rounded-xs" />
            <div>
              <h2 className="font-marcellus text-2xl text-gray-900 font-medium">
                Other Available Suites
              </h2>
              <p className="font-jost text-sm text-gray-500">
                Alternative suites available for your selected dates with different guest capacities.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {otherRooms.map((room) => renderRoomCard(room, false, false))}
          </div>
        </section>
      )}

      {/* SECTION 3: BOOKED / UNAVAILABLE ROOMS */}
      {bookedRooms.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-2.5 mb-6 pb-2 border-b border-gray-200">
            <span className="w-2.5 h-6 bg-red-400 rounded-xs" />
            <div>
              <h2 className="font-marcellus text-2xl text-gray-900 font-medium text-gray-600">
                Unavailable For Selected Dates
              </h2>
              <p className="font-jost text-sm text-gray-500">
                These suites are fully reserved for {checkIn} to {checkOut}.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {bookedRooms.map((room) => renderRoomCard(room, false, true))}
          </div>
        </section>
      )}
    </div>
  );
}
