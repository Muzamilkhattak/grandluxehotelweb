"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MousePointerClick,
  CalendarRange,
  UtensilsCrossed,
  MonitorCog,
  BedDouble,
  CarFront,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ServiceCard {
  id: string;
  tag: string;
  title: string;
  description: string;
  href: string;
  image: string;
  icon: React.ElementType;
}

const tailoredServices: ServiceCard[] = [
  {
    id: "online-room-booking",
    tag: "01 / RESERVATIONS",
    title: "Online Room Booking",
    description:
      "Book luxury suites effortlessly with real-time room availability, instant confirmation, and transparent guaranteed rates.",
    href: "/rooms",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
    icon: MousePointerClick,
  },
  {
    id: "event-conference-room",
    tag: "02 / SUMMITS & GALAS",
    title: "Event & Conference Rooms",
    description:
      "Reserve state-of-the-art corporate venues and bespoke banquet halls equipped with premium acoustics and custom catering.",
    href: "/contact",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80",
    icon: CalendarRange,
  },
  {
    id: "in-house-restaurant",
    tag: "03 / HAUTE CUISINE",
    title: "In-House Fine Dining",
    description:
      "Discover an exquisite culinary journey crafted by master chefs, featuring seasonal Nordic delicacies and fine vintage pairings.",
    href: "/restaurant",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80",
    icon: UtensilsCrossed,
  },
  {
    id: "24-7-guest-assistance",
    tag: "04 / WHITE GLOVE",
    title: "24/7 Butler Assistance",
    description:
      "Our dedicated concierge and butler team is at your command around the clock to ensure an effortless and tailored residency.",
    href: "/contact",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    icon: MonitorCog,
  },
  {
    id: "daily-housekeeping",
    tag: "05 / IMPECCABLE CARE",
    title: "Curated Housekeeping",
    description:
      "Experience discrete daily turndown service, organic Egyptian cotton linens, and meticulous attention to every sensorial detail.",
    href: "/rooms",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
    icon: BedDouble,
  },
  {
    id: "secure-parking",
    tag: "06 / PRIVATE VALET",
    title: "Private Valet & Parking",
    description:
      "Discreet on-site underground parking featuring 24/7 security surveillance and complimentary EV supercharging facilities.",
    href: "/contact",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80",
    icon: CarFront,
  },
];

export default function ServicesClient() {
  return (
    <div className="w-full bg-[#FFFFFF] text-[#000000]">
      
      {/* Header Section - Clean Solid Luxury (No Gradients, No Dull Colors) */}
      <section className="pt-32 sm:pt-40 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Solid Badge Matching Home Page */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#000000] border border-[#d7b56d]/40 mb-5 shadow-sm"
        >
          <Sparkles size={13} className="text-[#d7b56d]" />
          <span className="font-vogue text-[#FFFFFF] tracking-[0.24em] uppercase text-[11px] font-bold">
            Tailored Privileges & Services
          </span>
        </motion.div>

        {/* Title Matching Home Page */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-marcellus text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-tight leading-[1.1] mb-5"
        >
          Every Detail, Thoughtfully Curated
        </motion.h1>

        {/* Subtitle Matching Home Page */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-jost text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed"
        >
          From seamless reservations to Michelin-standard dining and round-the-clock white-glove butler assistance, immerse yourself in our signature hospitality.
        </motion.p>

      </section>

      {/* Services Grid - Arched Shape Matching Rooms Cards */}
      <section className="pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {tailoredServices.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative w-full h-[420px] sm:h-[450px] md:h-[480px] rounded-t-[150px] sm:rounded-t-[180px] md:rounded-t-[200px] overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl bg-neutral-900 border border-[#d7b56d]/25"
              >
                {/* Full-bleed Service Image with Arched Top */}
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Bottom Gradient Overlay (Normal State) */}
                <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#000000]/95 via-[#000000]/55 to-transparent pointer-events-none" />

                {/* Normal State Details (Bottom) */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center z-10">
                  <span className="font-vogue text-[#d7b56d] text-[11px] uppercase tracking-[0.22em] font-bold mb-1.5 block">
                    {service.tag}
                  </span>
                  <h3 className="font-marcellus text-white text-[22px] sm:text-[25px] font-normal leading-tight mb-2 tracking-wide drop-shadow-md">
                    {service.title}
                  </h3>
                  <p className="font-jost text-[#FFFFFF]/80 text-[13px] font-light line-clamp-2 max-w-[280px] mx-auto leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Sliding Black Hover Overlay (Low Opacity Transparent - Same as Rooms Cards) */}
                <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-auto">
                  {/* Icon Block */}
                  <div className="w-12 h-12 rounded-full bg-[#d7b56d]/20 border border-[#d7b56d]/50 flex items-center justify-center text-[#d7b56d] mb-3 shadow-md">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>

                  <span className="font-vogue text-[#d7b56d] text-[11px] uppercase tracking-[0.22em] font-bold mb-1">
                    {service.tag}
                  </span>

                  <h3 className="font-marcellus text-white text-[22px] sm:text-[24px] font-normal leading-snug mb-3 drop-shadow-sm">
                    {service.title}
                  </h3>

                  <p className="font-jost text-white/85 text-[13px] leading-relaxed mb-6 max-w-[280px] font-light">
                    {service.description}
                  </p>

                  {/* Explore Button */}
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-2 bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white border border-[#d7b56d] hover:border-white text-[11px] font-jost font-semibold uppercase tracking-[0.16em] px-5 py-2.5 rounded-full transition-all duration-300 shadow-md"
                  >
                    <span>Explore Privilege</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

    </div>
  );
}
