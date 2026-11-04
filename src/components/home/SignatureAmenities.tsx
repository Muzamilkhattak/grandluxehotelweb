"use client";

// Signature Hotel Amenities - Single-Line Smooth Infinite Marquee
import { motion } from "framer-motion";
import { 
  Car, 
  ShieldCheck, 
  UtensilsCrossed, 
  Sparkles, 
  Mountain, 
  Dumbbell, 
  Wifi, 
  ConciergeBell 
} from "lucide-react";

interface Amenity {
  id: string;
  name: string;
  icon: React.ElementType;
}

const amenities: Amenity[] = [
  { id: "parking", name: "Dedicated Parking", icon: Car },
  { id: "security", name: "24/7 Monitored Security", icon: ShieldCheck },
  { id: "restaurant", name: "In-House Restaurant", icon: UtensilsCrossed },
  { id: "housekeeping", name: "Daily Housekeeping", icon: Sparkles },
  { id: "terrace", name: "Margalla Terrace View", icon: Mountain },
  { id: "gym", name: "Fitness Gym", icon: Dumbbell },
  { id: "wifi", name: "High-Speed Wi-Fi", icon: Wifi },
  { id: "frontdesk", name: "24/7 Front Desk", icon: ConciergeBell },
];

export default function SignatureAmenities() {
  // Duplicating items 4 times creates a seamless infinite marquee on any screen resolution
  const marqueeItems = [...amenities, ...amenities, ...amenities, ...amenities];

  return (
    <section 
      id="amenities"
      className="py-14 sm:py-18 md:py-22 bg-[#FFFFFF] relative overflow-hidden border-t border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 mb-8 sm:mb-10 text-center">
        {/* Subtle Luxury Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8f6618]/10 border border-[#8f6618]/25 mb-2.5 shadow-xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#8f6618]" />
          <span className="font-jost text-[#8f6618] tracking-[0.22em] uppercase text-[11px] sm:text-[12px] font-bold">
            Tailored Comfort
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8f6618]" />
        </motion.div>

        {/* Heading */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-marcellus text-2xl sm:text-3xl md:text-[42px] text-primary leading-tight font-normal"
        >
          Signature Amenities
        </motion.h2>
        <div className="w-12 sm:w-14 h-[2px] bg-[#d7b56d] mx-auto mt-2.5 sm:mt-3" />
      </div>

      {/* One-Line Infinite Marquee with Smooth Fade Masks */}
      <div className="marquee-container relative w-full overflow-hidden py-3">
        
        {/* Left & Right Elegant Edge Fade Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 md:w-36 bg-gradient-to-r from-white via-white/85 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 md:w-36 bg-gradient-to-l from-white via-white/85 to-transparent z-20 pointer-events-none" />

        {/* Single Line Marquee Track (Icon + Title Only) */}
        <div className="animate-marquee-left flex items-center gap-3 sm:gap-4.5">
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.id}-${idx}`}
                className="group inline-flex items-center gap-3 sm:gap-3.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white border border-[#EAEAEA] hover:border-[#d7b56d] shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_24px_rgba(215,181,109,0.22)] transition-all duration-300 select-none shrink-0 cursor-default"
              >
                {/* Solid High-Contrast Icon Container */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#000000] text-[#d7b56d] flex items-center justify-center shrink-0 border border-[#d7b56d]/30 group-hover:bg-[#d7b56d] group-hover:text-black group-hover:scale-105 transition-all duration-300">
                  <Icon size={18} strokeWidth={2.4} />
                </div>

                {/* Clean, Bold, Readable Title */}
                <span className="font-marcellus text-[#111111] text-[15px] sm:text-[16.5px] font-normal tracking-wide whitespace-nowrap group-hover:text-[#8f6618] transition-colors">
                  {item.name}
                </span>

                {/* Subtle Luxury Dot Accent */}
                <span className="w-1.5 h-1.5 rounded-full bg-[#d7b56d]/60 group-hover:bg-[#d7b56d] ml-1 transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
