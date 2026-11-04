"use client";

import Image from "next/image";
import { Utensils, Phone } from "lucide-react";

export default function RestaurantDiningIntro() {
  return (
    <section className="bg-[#FAF8F5] py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-12 border-b border-[#EAE5DE] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Text & Service Information */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Tag Badge */}
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-[#E5E0D8] text-[11px] sm:text-[12px] font-vogue font-bold tracking-[0.22em] uppercase text-[#1B1B1B] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                MEAL WITH US
              </span>
            </div>

            {/* Main Heading (Website's signature Marcellus font) */}
            <h2 className="font-marcellus text-3xl sm:text-4xl md:text-[46px] lg:text-[50px] font-normal text-[#111111] leading-[1.18] tracking-tight mb-6">
              A Hotel <span className="text-[#d7b56d]">Restaurant</span>
              <br className="hidden sm:inline" /> Serves Meals to Both
              <br className="hidden sm:inline" /> <span className="text-[#d7b56d]">Guests</span> and <span className="text-[#d7b56d]">Visitors</span>
            </h2>

            {/* Descriptive Paragraphs (Website's Jost font) */}
            <div className="space-y-4 text-[#555555] font-jost text-[15px] sm:text-[16px] leading-relaxed mb-8 max-w-xl font-normal">
              <p>
                The Mist introduces guests to a memorable experience in dining out, fast becoming a preferred choice in dining out.
              </p>
              <p>
                The Mist offers a choice of dining options available to our guests with a zest for the good life. Unwind at our wellness center or explore nearby attractions easily.
              </p>
            </div>

            {/* Timings and Reservation Call Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2 max-w-xl">
              
              {/* Service Timings */}
              <div className="space-y-3 font-jost">
                <div>
                  <span className="text-[12px] font-medium text-gray-400 block leading-tight font-jost uppercase tracking-wider">
                    Breakfast:
                  </span>
                  <span className="text-[16px] sm:text-[17px] font-marcellus font-normal text-[#111111] mt-0.5 block">
                    7.00am – 10.30am
                  </span>
                </div>
                <div>
                  <span className="text-[12px] font-medium text-gray-400 block leading-tight font-jost uppercase tracking-wider">
                    Lunch:
                  </span>
                  <span className="text-[16px] sm:text-[17px] font-marcellus font-normal text-[#111111] mt-0.5 block">
                    11.00am – 3.00pm
                  </span>
                </div>
                <div>
                  <span className="text-[12px] font-medium text-gray-400 block leading-tight font-jost uppercase tracking-wider">
                    Dinner:
                  </span>
                  <span className="text-[16px] sm:text-[17px] font-marcellus font-normal text-[#111111] mt-0.5 block">
                    7.00pm – 11.00pm
                  </span>
                </div>
              </div>

              {/* Call for Reservation Box */}
              <div className="bg-white border border-[#EAE5DE] shadow-[0_10px_30px_rgba(0,0,0,0.06)] rounded-[22px] px-5 py-4 flex items-center gap-3.5 self-start sm:self-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF5EB] border border-[#d7b56d]/30 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#d7b56d]" />
                </div>
                <div>
                  <span className="text-[11px] sm:text-[12px] font-medium text-gray-400 block leading-tight font-jost uppercase tracking-wider">
                    Call for Reservation:
                  </span>
                  <a
                    href="tel:+0604445346"
                    className="text-[17px] sm:text-[18px] font-marcellus font-bold text-[#111111] hover:text-[#d7b56d] transition-colors leading-snug block tracking-tight mt-0.5"
                  >
                    (+060) 444 5346
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Stacked Rounded Photos & Circular Rotating Badge */}
          <div className="lg:col-span-6 relative pt-4 lg:pt-0">
            <div className="relative flex flex-col gap-4 sm:gap-5 max-w-[540px] mx-auto lg:max-w-none">
              
              {/* Top Image: Restaurant Dining Hall Interior */}
              <div className="relative h-[240px] sm:h-[280px] md:h-[310px] w-full rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-md">
                <Image
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop"
                  alt="Hotel Restaurant Dining Room"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Overlapping Center Badge: Circular Seal with Cutlery */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-1.5 flex items-center justify-center border border-[#EAE5DE] relative">
                  
                  {/* Rotating Circular Text SVG (Website's vogue font) */}
                  <svg
                    className="w-full h-full animate-[spin_20s_linear_infinite]"
                    viewBox="0 0 100 100"
                  >
                    <path
                      id="eatBetterPath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                      fill="transparent"
                    />
                    <text className="text-[9px] uppercase font-bold tracking-[0.24em] fill-[#d7b56d] font-vogue">
                      <textPath href="#eatBetterPath" startOffset="0%">
                        • EAT BETTER • FEEL FULLER
                      </textPath>
                    </text>
                  </svg>

                  {/* Golden Center Disc with Cutlery Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#d7b56d] flex items-center justify-center shadow-inner">
                    <Utensils className="w-5 h-5 text-white" />
                  </div>

                </div>
              </div>

              {/* Bottom Image: Gourmet Chefs Serving Meals */}
              <div className="relative h-[240px] sm:h-[280px] md:h-[310px] w-full rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-md">
                <Image
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1200&auto=format&fit=crop"
                  alt="Hotel Chefs Preparing Meals"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
