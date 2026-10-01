"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, ShowerHead, Sun, Wifi } from "lucide-react";
import BookingModal from "@/components/booking/BookingModal";

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

export default function RoomsSection({ rooms }: { rooms: Room[] }) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const displayRooms = rooms || [];

  return (
    <section className="py-[48px] bg-canvas relative px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="font-marcellus text-[60px] text-primary text-center mb-12">Curated Suites</h2>
        
        {displayRooms.length === 0 ? (
          <div className="text-center text-muted font-jost text-xl py-12">
            No suites are currently available matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {displayRooms.map((room) => (
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
                    <div className="w-full h-full bg-[#f0f0f1] flex items-center justify-center text-gray-400">No Image</div>
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
                      className="w-full bg-primary text-white font-jost font-medium text-[16px] h-[56px] rounded-full hover:bg-[#323232] transition-colors"
                    >
                      Instant Reserve
                    </button>
                    <Link href={`/rooms/${room.slug || room.id}`} className="w-full bg-[#FAF5F1] text-primary font-jost font-medium text-[16px] h-[56px] rounded-full hover:bg-[#EAEAEA] transition-colors flex items-center justify-center">
                      Explore Suite
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRoom && (
        <BookingModal 
          room={selectedRoom} 
          isOpen={!!selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
        />
      )}
    </section>
  );
}
