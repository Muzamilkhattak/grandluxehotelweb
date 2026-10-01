"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, ShowerHead, Sun, Wifi, Search, SlidersHorizontal, Users } from "lucide-react";
import BookingModal from "@/components/booking/BookingModal";

export type Room = {
  id: string;
  title: string;
  slug?: string;
  price_per_night: number;
  bed_type: string;
  size_sqft: number;
  capacity?: number;
  amenities: any;
  image_url?: string;
  description?: string;
};

export default function AccommodationsClient({ initialRooms }: { initialRooms: Room[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minGuests, setMinGuests] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high">("featured");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Filter logic
  let filtered = (initialRooms || []).filter((room) => {
    const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGuests = minGuests === 0 || (room.capacity && room.capacity >= minGuests);
    return matchesSearch && matchesGuests;
  });

  // Sort logic
  if (sortBy === "price-low") {
    filtered.sort((a, b) => a.price_per_night - b.price_per_night);
  } else if (sortBy === "price-high") {
    filtered.sort((a, b) => b.price_per_night - a.price_per_night);
  }

  return (
    <div className="space-y-12">
      {/* Filter Bar */}
      <div className="bg-canvas p-6 md:p-8 rounded-none border border-faint flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search suites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#FAF5F1] border border-faint rounded-none font-jost text-[16px] text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Guests Filter */}
          <div className="flex items-center gap-2 bg-[#FAF5F1] border border-faint px-4 py-3 rounded-none font-jost text-[15px] text-primary">
            <Users size={16} className="text-accent" />
            <select
              value={minGuests}
              onChange={(e) => setMinGuests(Number(e.target.value))}
              className="bg-transparent focus:outline-none cursor-pointer font-jost"
            >
              <option value={0}>Any Guests</option>
              <option value={1}>1+ Guests</option>
              <option value={2}>2+ Guests</option>
              <option value={4}>4+ Guests</option>
              <option value={6}>6+ Guests</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 bg-[#FAF5F1] border border-faint px-4 py-3 rounded-none font-jost text-[15px] text-primary">
            <SlidersHorizontal size={16} className="text-accent" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer font-jost"
            >
              <option value="featured">Featured Collection</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

      </div>

      {/* Accommodations Grid (Exact same design & content structure as Home Page RoomsSection) */}
      {filtered.length === 0 ? (
        <div className="text-center text-muted font-jost text-xl py-16 border border-faint bg-canvas">
          No suites are currently available matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {filtered.map((room) => (
            <div key={room.id} className="group flex flex-col bg-canvas border border-faint rounded-none overflow-hidden transition-colors">
              <div className="relative h-[300px] w-full overflow-hidden rounded-none">
                {room.image_url ? (
                  <Image 
                    src={room.image_url} 
                    alt={room.title} 
                    fill 
                    className="object-cover rounded-none" 
                  />
                ) : (
                  <div className="w-full h-full bg-[#f0f0f1] flex items-center justify-center text-gray-400 font-jost">No Image</div>
                )}
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 font-jost text-[14px]">
                  {room.bed_type || "Luxury Suite"}
                </div>
              </div>
              <div className="p-[32px] flex flex-col flex-1">
                <div className="font-jost text-[16px] text-muted mb-2">From ${room.price_per_night} / night • {room.size_sqft || 80} sqm</div>
                <h3 className="font-marcellus text-[32px] text-primary mb-4 leading-[1.3]">{room.title}</h3>
                <p className="font-jost text-[18px] text-muted mb-8 leading-[1.66] line-clamp-3">
                  {room.description || "Experience refined elegance and modern comfort in our signature luxury suites."}
                </p>
                <div className="flex flex-wrap items-center gap-5 text-accent mb-10">
                  <BedDouble size={24} strokeWidth={1} />
                  <ShowerHead size={24} strokeWidth={1} />
                  <Sun size={24} strokeWidth={1} />
                  <Wifi size={24} strokeWidth={1} />
                </div>
                <div className="mt-auto flex flex-col gap-4">
                  <button 
                    onClick={() => setSelectedRoom(room)}
                    className="w-full bg-primary text-white font-jost font-medium text-[16px] h-[56px] rounded-full hover:bg-[#323232] transition-colors cursor-pointer"
                  >
                    Instant Reserve
                  </button>
                  <Link href={`/rooms/${room.slug || room.id}`} className="w-full bg-[#FAF5F1] text-primary font-jost font-medium text-[16px] h-[56px] rounded-full hover:bg-[#EAEAEA] transition-colors flex items-center justify-center font-jost font-medium text-[16px]">
                    Explore Suite
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRoom && (
        <BookingModal 
          room={selectedRoom} 
          isOpen={!!selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
        />
      )}
    </div>
  );
}
