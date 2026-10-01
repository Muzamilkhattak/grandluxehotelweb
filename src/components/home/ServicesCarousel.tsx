"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles,
  MousePointerClick,
  CalendarRange,
  UtensilsCrossed,
  MonitorCog,
  BedDouble,
  CarFront
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface ServiceItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

const servicesData: ServiceItem[] = [
  {
    id: "online-room-booking",
    tag: "01 / RESERVATIONS",
    title: "Online Room Booking",
    description: "Book rooms effortlessly with real-time updates, instant confirmation, and secure pricing for a smooth travel experience.",
    href: "/#rooms",
    icon: MousePointerClick,
  },
  {
    id: "event-conference-room",
    tag: "02 / EVENTS & SUMMITS",
    title: "Event & Conference Room",
    description: "Reserve professional spaces for meetings or events with instant confirmation, scheduling, and transparent cost details.",
    href: "/service-details",
    icon: CalendarRange,
  },
  {
    id: "in-house-restaurant",
    tag: "03 / HAUTE CUISINE",
    title: "In-House Restaurant",
    description: "Discover a refined dining experience with freshly prepared meals, authentic flavours, and exceptional service every day.",
    href: "/in-house-restaurant",
    icon: UtensilsCrossed,
  },
  {
    id: "24-7-guest-assistance",
    tag: "04 / WHITE GLOVE",
    title: "24/7 Guest Assistance",
    description: "Our dedicated team is available around the clock to ensure a comfortable and seamless stay for all our esteemed guests.",
    href: "/24-7-guest-assistance",
    icon: MonitorCog,
  },
  {
    id: "daily-housekeeping",
    tag: "05 / IMPECCABLE CARE",
    title: "Daily Housekeeping",
    description: "Enjoy professionally cleaned rooms, fresh linens, and thoughtful attention to every detail every day.",
    href: "/daily-housekeeping",
    icon: BedDouble,
  },
  {
    id: "secure-parking",
    tag: "06 / PRIVATE VALET",
    title: "Secure Parking",
    description: "Enjoy safe and convenient on-site parking for complete peace of mind throughout your visit.",
    href: "/secure-parking",
    icon: CarFront,
  }
];

export default function ServicesCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-28 bg-[#F4F4F5] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-[#C97A4F]" />
              <span className="font-vogue text-[#7E652E] tracking-[0.25em] uppercase text-[11px] font-bold">
                Tailored Privileges & Services
              </span>
            </div>
            <h2 className="font-marcellus text-[40px] md:text-[56px] text-[#1A1A1A] leading-[1.1] font-medium">
              Every Detail, <br className="hidden sm:block" />
              Thoughtfully Curated
            </h2>
            <p className="mt-5 font-jost text-[17px] md:text-[19px] text-[#4A4A4A] leading-relaxed max-w-xl">
              From seamless online reservations to Michelin dining and round-the-clock butler assistance, immerse yourself in our signature hospitality.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 self-start md:self-end">
            <button
              className="swiper-button-prev-custom w-14 h-14 rounded-full border border-[#D1D1D6] flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm bg-white"
              aria-label="Previous service"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              className="swiper-button-next-custom w-14 h-14 rounded-full border border-[#D1D1D6] flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm bg-white"
              aria-label="Next service"
            >
              <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Clean Modern Carousel */}
        <div className="w-full pb-16 max-w-7xl mx-auto">
          <Swiper
            grabCursor={true}
            slidesPerView={1}
            spaceBetween={24}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
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
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{
              el: '.swiper-pagination-custom',
              clickable: true,
              renderBullet: function (index, className) {
                return `<span class="${className} custom-bullet"></span>`;
              },
            }}
            modules={[Pagination, Navigation, Autoplay]}
            className="services-swiper !py-4"
          >
            {servicesData.map((service, index) => (
              <SwiperSlide key={service.id} className="!h-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl flex flex-col group shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 h-full p-8 md:p-10 border border-gray-100 relative overflow-hidden"
                >
                  {/* Modern Accent Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C97A4F] to-[#7E652E] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  
                  {/* Tag */}
                  <span className="font-vogue text-[10px] tracking-[0.2em] uppercase text-[#7E652E] font-bold mb-6 block">
                    {service.tag}
                  </span>

                  {/* Clean Icon Block */}
                  <div className="mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] flex items-center justify-center text-[#C97A4F] group-hover:bg-[#C97A4F] group-hover:text-white transition-colors duration-500 shadow-sm border border-[#7E652E]/10">
                      <service.icon strokeWidth={1.5} className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Content Layout */}
                  <div className="flex flex-col flex-1">
                    <h3 className="font-marcellus text-[26px] text-[#1A1A1A] mb-4 group-hover:text-[#C97A4F] transition-colors leading-tight">
                      {service.title}
                    </h3>
                    
                    <p className="font-jost text-[16px] leading-[1.7] text-[#4A4A4A] mb-10">
                      {service.description}
                    </p>

                    {/* Learn More Button */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                      <Link
                        href={service.href}
                        className="inline-flex items-center gap-3 font-vogue text-[12px] uppercase tracking-[0.15em] font-bold text-[#1A1A1A] group-hover:text-[#C97A4F] transition-colors"
                      >
                        <span>Explore Detail</span>
                        <ArrowRight size={16} className="text-[#C97A4F] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Progress & Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="swiper-pagination-custom flex items-center justify-center gap-2"></div>
        </div>

      </div>

      <style jsx global>{`
        .services-swiper {
          width: 100%;
        }

        .custom-bullet {
          width: 8px;
          height: 8px;
          background-color: #D1D1D6;
          opacity: 1;
          margin: 0 4px !important;
          transition: all 0.3s ease;
          border-radius: 9999px;
          display: inline-block;
          cursor: pointer;
        }
        
        .custom-bullet:hover {
          background-color: #A1A1AA;
        }
        
        .swiper-pagination-custom .swiper-pagination-bullet-active {
          width: 32px;
          background-color: #C97A4F;
        }

        .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}
