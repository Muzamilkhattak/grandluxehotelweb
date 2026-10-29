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
    description: "Book luxury suites effortlessly with real-time room availability, instant confirmation, and transparent guaranteed rates.",
    href: "/#rooms",
    icon: MousePointerClick,
  },
  {
    id: "event-conference-room",
    tag: "02 / SUMMITS & GALAS",
    title: "Event & Conference Rooms",
    description: "Reserve state-of-the-art corporate venues and bespoke banquet halls equipped with premium acoustics and custom catering.",
    href: "/services",
    icon: CalendarRange,
  },
  {
    id: "in-house-restaurant",
    tag: "03 / HAUTE CUISINE",
    title: "In-House Fine Dining",
    description: "Discover an exquisite culinary journey crafted by master chefs, featuring seasonal Nordic delicacies and fine vintage pairings.",
    href: "/restaurant",
    icon: UtensilsCrossed,
  },
  {
    id: "24-7-guest-assistance",
    tag: "04 / WHITE GLOVE",
    title: "24/7 Butler Assistance",
    description: "Our dedicated concierge and butler team is at your command around the clock to ensure an effortless and tailored residency.",
    href: "/services",
    icon: MonitorCog,
  },
  {
    id: "daily-housekeeping",
    tag: "05 / IMPECCABLE CARE",
    title: "Curated Housekeeping",
    description: "Experience discrete daily turndown service, organic Egyptian cotton linens, and meticulous attention to every sensorial detail.",
    href: "/services",
    icon: BedDouble,
  },
  {
    id: "secure-parking",
    tag: "06 / PRIVATE VALET",
    title: "Private Valet & Parking",
    description: "Discreet on-site underground parking featuring 24/7 security surveillance and complimentary EV supercharging facilities.",
    href: "/services",
    icon: CarFront,
  }
];

export default function ServicesCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-16 sm:py-24 md:py-36 bg-[#000000] relative overflow-hidden text-[#FFFFFF]">
      {/* Ambient Luxury Lighting Accents */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[350px] bg-[#d7b56d]/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[550px] h-[350px] bg-[#d7b56d]/20 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.97)_100%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-16 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#000000] border border-[#d7b56d]/35 mb-3 sm:mb-4 shadow-sm">
              <Sparkles size={13} className="text-[#d7b56d]" />
              <span className="font-vogue text-[#d7b56d] tracking-[0.24em] uppercase text-[10.5px] sm:text-[11px] font-bold">
                Tailored Privileges & Services
              </span>
            </div>
            <h2 className="font-marcellus text-3xl sm:text-4xl md:text-[52px] lg:text-[58px] text-[#FFFFFF] leading-[1.1] font-normal tracking-wide">
              Every Detail, <br className="hidden sm:block" />
              Thoughtfully Curated
            </h2>
            <p className="mt-3 sm:mt-5 font-jost text-[15px] sm:text-[17px] md:text-[19px] text-[#EAD8C3]/80 leading-relaxed max-w-xl font-light">
              From seamless reservations to Michelin-standard dining and round-the-clock white-glove butler assistance, immerse yourself in our signature hospitality.
            </p>
          </div>

          {/* Navigation Controls & View All Link */}
          <div className="flex items-center gap-2.5 sm:gap-4 self-start md:self-end">
            <Link
              href="/services"
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-[#d7b56d]/60 text-[#d7b56d] hover:bg-[#d7b56d] hover:text-white font-jost text-[12px] sm:text-[13px] uppercase tracking-[0.16em] font-semibold transition-all duration-300 mr-1 sm:mr-2"
            >
              All Services
            </Link>
            <button
              className="swiper-button-prev-custom w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-[#d7b56d]/40 flex items-center justify-center text-[#FFFFFF] bg-[#000000] hover:bg-[#d7b56d] hover:border-[#d7b56d] transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed group shadow-lg cursor-pointer"
              aria-label="Previous service"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              className="swiper-button-next-custom w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-[#d7b56d]/40 flex items-center justify-center text-[#FFFFFF] bg-[#000000] hover:bg-[#d7b56d] hover:border-[#d7b56d] transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed group shadow-lg cursor-pointer"
              aria-label="Next service"
            >
              <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
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
              delay: 4500,
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
                  className="bg-[#000000]/90 backdrop-blur-md rounded-[24px] flex flex-col group shadow-[0_16px_40px_rgba(15,9,5,0.4)] hover:shadow-[0_24px_60px_rgba(201,122,79,0.22)] border border-[#d7b56d]/30 hover:border-[#d7b56d]/60 transition-all duration-500 hover:-translate-y-2 h-full p-6 sm:p-8 md:p-10 relative overflow-hidden"
                >
                  {/* Glowing Top Accent Bar */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#d7b56d] via-[#d7b56d] to-[#d7b56d] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  
                  {/* Tag */}
                  <span className="font-vogue text-[11px] tracking-[0.24em] uppercase text-[#d7b56d] font-bold mb-6 block">
                    {service.tag}
                  </span>

                  {/* Modern Icon Block */}
                  <div className="mb-8">
                    <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-[#000000] to-[#111111] border border-[#d7b56d]/35 flex items-center justify-center text-[#d7b56d] group-hover:from-[#d7b56d] group-hover:to-[#d7b56d] group-hover:text-white group-hover:border-[#d7b56d]/80 group-hover:scale-105 transition-all duration-500 shadow-md">
                      <service.icon strokeWidth={1.6} className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Content Layout */}
                  <div className="flex flex-col flex-1">
                    <h3 className="font-marcellus text-[26px] md:text-[28px] text-[#FFFFFF] mb-4 group-hover:text-[#d7b56d] transition-colors leading-snug font-normal">
                      {service.title}
                    </h3>
                    
                    <p className="font-jost text-[15.5px] leading-[1.75] text-[#EAD8C3]/80 mb-10 font-light">
                      {service.description}
                    </p>

                    {/* Action Link */}
                    <div className="mt-auto pt-6 border-t border-[#FFFFFF]/10">
                      <Link
                        href={service.href}
                        className="inline-flex items-center gap-3 font-jost text-[13px] uppercase tracking-[0.18em] font-semibold text-[#d7b56d] group-hover:text-white transition-colors"
                      >
                        <span>Explore Privilege</span>
                        <ArrowRight size={16} className="text-[#d7b56d] group-hover:translate-x-1.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Progress & Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="swiper-pagination-custom flex items-center justify-center gap-2"></div>
        </div>

      </div>

      <style jsx global>{`
        .services-swiper {
          width: 100%;
        }

        .custom-bullet {
          width: 9px;
          height: 9px;
          background-color: rgba(126, 101, 46, 0.45);
          opacity: 1;
          margin: 0 4px !important;
          transition: all 0.35s ease;
          border-radius: 9999px;
          display: inline-block;
          cursor: pointer;
        }
        
        .custom-bullet:hover {
          background-color: #d7b56d;
        }
        
        .swiper-pagination-custom .swiper-pagination-bullet-active {
          width: 34px;
          background-color: #d7b56d;
          box-shadow: 0 0 14px rgba(201, 122, 79, 0.6);
        }

        .swiper-button-disabled {
          opacity: 0.25;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}
