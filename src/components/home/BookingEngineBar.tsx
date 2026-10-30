"use client";

import { motion } from "framer-motion";
import Tilt3D from "@/components/ui/Tilt3D";

interface BookingEngineBarProps {
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  todayStr: string;
}

export default function BookingEngineBar({
  checkin,
  checkout,
  adults,
  children,
  todayStr,
}: BookingEngineBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-30 max-w-6xl w-full mx-auto px-4 -mt-12 sm:-mt-16 md:-mt-24 mb-10 sm:mb-12 will-change-transform"
      style={{ perspective: 1200 }}
    >
      <Tilt3D maxTilt={4} scale={1.01} glare={true} glareColor="rgba(215, 181, 109, 0.12)">
        <div className="bg-white/95 backdrop-blur-md border border-[#000000]/15 hover:border-[#d7b56d]/60 shadow-[0_24px_60px_rgba(0,0,0,0.18)] hover:shadow-[0_32px_80px_rgba(215,181,109,0.22)] p-5 sm:p-8 flex flex-col rounded-2xl transition-all duration-500">
          <form action="/search" method="GET" className="flex flex-col md:flex-row items-end gap-3.5 sm:gap-4 w-full">
            <div className="flex-1 w-full relative">
              <label className="block text-[14px] sm:text-[15px] font-jost text-gray-800 font-medium mb-1.5 sm:mb-2">
                Check-in
              </label>
              <input
                name="checkin"
                defaultValue={checkin}
                min={todayStr}
                type="date"
                required
                className="w-full bg-gray-50/90 border-2 border-gray-200 rounded-lg px-3.5 text-gray-900 font-jost h-[50px] sm:h-[56px] focus:outline-none focus:border-[#d7b56d] focus:bg-white transition-all text-[14px] sm:text-[15px] shadow-xs"
              />
            </div>
            
            <div className="flex-1 w-full relative">
              <label className="block text-[14px] sm:text-[15px] font-jost text-gray-800 font-medium mb-1.5 sm:mb-2">
                Check-out
              </label>
              <input
                name="checkout"
                defaultValue={checkout}
                min={checkin || todayStr}
                type="date"
                required
                className="w-full bg-gray-50/90 border-2 border-gray-200 rounded-lg px-3.5 text-gray-900 font-jost h-[50px] sm:h-[56px] focus:outline-none focus:border-[#d7b56d] focus:bg-white transition-all text-[14px] sm:text-[15px] shadow-xs"
              />
            </div>

            <div className="w-full md:w-[120px] relative">
              <label className="block text-[14px] sm:text-[15px] font-jost text-gray-800 font-medium mb-1.5 sm:mb-2">
                Adults
              </label>
              <input
                name="adults"
                defaultValue={adults}
                type="number"
                min="1"
                required
                className="w-full bg-gray-50/90 border-2 border-gray-200 rounded-lg px-3.5 text-gray-900 font-jost h-[50px] sm:h-[56px] focus:outline-none focus:border-[#d7b56d] focus:bg-white transition-all text-[14px] sm:text-[15px] shadow-xs"
              />
            </div>

            <div className="w-full md:w-[120px] relative">
              <label className="block text-[14px] sm:text-[15px] font-jost text-gray-800 font-medium mb-1.5 sm:mb-2">
                Children
              </label>
              <input
                name="children"
                defaultValue={children}
                type="number"
                min="0"
                required
                className="w-full bg-gray-50/90 border-2 border-gray-200 rounded-lg px-3.5 text-gray-900 font-jost h-[50px] sm:h-[56px] focus:outline-none focus:border-[#d7b56d] focus:bg-white transition-all text-[14px] sm:text-[15px] shadow-xs"
              />
            </div>

            <div className="w-full md:w-auto mt-2 md:mt-0">
              <button
                type="submit"
                className="w-full md:w-auto bg-[#000000] hover:bg-[#d7b56d] text-white hover:text-[#000000] font-jost font-semibold text-[14px] sm:text-[15px] uppercase tracking-[0.14em] px-7 py-3.5 sm:py-[18px] rounded-lg transition-all duration-300 h-[50px] sm:h-[56px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap cursor-pointer active:scale-95"
              >
                Search Availability
              </button>
            </div>
          </form>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-start gap-4 sm:gap-8 text-[13px] sm:text-[14px] font-jost text-gray-600 font-medium border-t border-gray-100 pt-5">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d7b56d] animate-pulse" /> Best Rate Guaranteed
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d7b56d] animate-pulse" /> Complimentary Late Checkout
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d7b56d] animate-pulse" /> Zero Booking Fees
            </span>
          </div>
        </div>
      </Tilt3D>
    </motion.div>
  );
}
