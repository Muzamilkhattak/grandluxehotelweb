"use client";

import { motion } from "framer-motion";
import { 
  Car, 
  ShieldCheck, 
  UtensilsCrossed, 
  Sparkles, 
  Mountain, 
  Dumbbell, 
  Wifi, 
  ConciergeBell, 
  Coffee, 
  AirVent 
} from "lucide-react";

interface AmenityItem {
  id: string;
  name: string;
  tag: string;
  description: string;
  icon: React.ElementType;
}

const row1Amenities: AmenityItem[] = [
  {
    id: "parking",
    name: "Dedicated On-Site Parking",
    tag: "Free & Secured",
    description: "Private secured guest parking with 24/7 dedicated surveillance and valet access.",
    icon: Car,
  },
  {
    id: "security",
    name: "24/7 Monitored Security",
    tag: "Gated Protection",
    description: "Round-the-clock CCTV surveillance, biometric access & trained security personnel.",
    icon: ShieldCheck,
  },
  {
    id: "restaurant",
    name: "In-House Gourmet Dining",
    tag: "Haute Cuisine",
    description: "Chef-curated seasonal dishes, all-day dining and intimate fine dining ambiance.",
    icon: UtensilsCrossed,
  },
  {
    id: "housekeeping",
    name: "Daily Luxury Housekeeping",
    tag: "Pristine Care",
    description: "Daily deep sanitization, fresh crisp Egyptian linens & evening turndown service.",
    icon: Sparkles,
  },
  {
    id: "terrace",
    name: "Margalla Scenic Terrace",
    tag: "Panoramic View",
    description: "Open-air rooftop terrace overlooking the majestic Margalla Hills and city skyline.",
    icon: Mountain,
  },
];

const row2Amenities: AmenityItem[] = [
  {
    id: "gym",
    name: "Modern Fitness Gym",
    tag: "Active Wellness",
    description: "Fully equipped fitness studio featuring cardio machines, free weights & yoga mats.",
    icon: Dumbbell,
  },
  {
    id: "wifi",
    name: "High-Speed Fiber Wi-Fi",
    tag: "Gigabit Speed",
    description: "Ultra-fast optical fiber broadband accessible across all rooms and public lounges.",
    icon: Wifi,
  },
  {
    id: "concierge",
    name: "24/7 Front Desk Concierge",
    tag: "Always Available",
    description: "Express check-in/out, luggage assistance and personalized city itinerary recommendations.",
    icon: ConciergeBell,
  },
  {
    id: "breakfast",
    name: "Artisan Breakfast Buffet",
    tag: "Fresh Daily",
    description: "Freshly roasted coffee, continental bakeries, fresh fruits & hot breakfast spread.",
    icon: Coffee,
  },
  {
    id: "climate",
    name: "Whisper Climate Control",
    tag: "Smart Comfort",
    description: "Individual in-room cooling & heating thermostats for year-round personalized comfort.",
    icon: AirVent,
  },
];

function AmenityCard({ item }: { item: AmenityItem }) {
  const Icon = item.icon;
  return (
    <div className="group relative min-w-[310px] sm:min-w-[350px] max-w-[350px] p-5 sm:p-6 bg-white border border-[#EAEAEA] hover:border-[#d7b56d] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(215,181,109,0.18)] transition-all duration-300 flex flex-col justify-between select-none">
      <div className="flex items-start justify-between gap-3 mb-4">
        {/* Solid Readable Icon Container */}
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#000000] text-[#d7b56d] flex items-center justify-center shadow-md border border-[#d7b56d]/30 group-hover:bg-[#d7b56d] group-hover:text-black group-hover:scale-105 transition-all duration-300 shrink-0">
          <Icon size={26} strokeWidth={2.2} />
        </div>

        {/* Solid Luxury Tag */}
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#d7b56d]/12 border border-[#d7b56d]/35 text-[#8f6618] font-jost text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider">
          {item.tag}
        </span>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-marcellus text-[#111111] text-[18px] sm:text-[19.5px] font-normal tracking-wide group-hover:text-[#8f6618] transition-colors leading-snug">
          {item.name}
        </h3>
        <p className="font-jost text-[#555E63] text-[13px] sm:text-[13.5px] leading-relaxed line-clamp-2">
          {item.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
        <span className="font-jost text-[11.5px] text-[#8f6618] font-semibold tracking-wide uppercase">
          Signature Hotel Privilege
        </span>
        <span className="w-2 h-2 rounded-full bg-[#d7b56d] group-hover:scale-125 transition-transform" />
      </div>
    </div>
  );
}

export default function SignatureAmenities() {
  // Duplicating items 3 times ensures seamless infinite marquee on ultra-wide screens
  const duplicatedRow1 = [...row1Amenities, ...row1Amenities, ...row1Amenities];
  const duplicatedRow2 = [...row2Amenities, ...row2Amenities, ...row2Amenities];

  return (
    <section 
      id="amenities"
      className="py-16 sm:py-24 md:py-28 bg-[#FFFFFF] relative overflow-hidden border-t border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 mb-10 sm:mb-14 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8f6618]/10 border border-[#8f6618]/25 mb-3 sm:mb-4 shadow-xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#8f6618]" />
          <span className="font-jost text-[#8f6618] tracking-[0.22em] uppercase text-[12px] sm:text-[13px] font-bold">
            Tailored Comfort
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8f6618]" />
        </motion.div>

        {/* Heading */}
        <motion.h2 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-marcellus text-3xl sm:text-4xl md:text-[48px] lg:text-[54px] text-primary leading-tight font-normal"
        >
          Signature Amenities
        </motion.h2>
        <div className="w-14 sm:w-16 h-[2px] bg-[#d7b56d] mx-auto mt-3 sm:mt-4 mb-4" />
        <p className="font-jost text-[#555E63] text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
          Thoughtfully curated services and amenities designed to make your stay effortless, secure, and truly memorable.
        </p>
      </div>

      {/* Marquee Wrapper with Smooth Left & Right Gradient Masks */}
      <div className="marquee-container relative w-full overflow-hidden space-y-5 sm:space-y-6">
        
        {/* Left & Right Elegant Edge Fade Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 md:w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 md:w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />

        {/* Row 1: Sliding Left */}
        <div className="animate-marquee-left flex items-center gap-4 sm:gap-6">
          {duplicatedRow1.map((amenity, idx) => (
            <AmenityCard key={`row1-${amenity.id}-${idx}`} item={amenity} />
          ))}
        </div>

        {/* Row 2: Sliding Right (Opposite Direction) */}
        <div className="animate-marquee-right flex items-center gap-4 sm:gap-6">
          {duplicatedRow2.map((amenity, idx) => (
            <AmenityCard key={`row2-${amenity.id}-${idx}`} item={amenity} />
          ))}
        </div>

        {/* Interactive Hint */}
        <div className="text-center pt-2">
          <span className="font-jost text-[12px] sm:text-[13px] text-zinc-400 tracking-wide inline-flex items-center gap-1.5">
            <span>Hover on any amenity to pause & inspect</span>
          </span>
        </div>
      </div>
    </section>
  );
}
