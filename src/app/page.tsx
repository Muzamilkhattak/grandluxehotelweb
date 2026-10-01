import Image from "next/image";
import { BedDouble, ShowerHead, Sun, Wifi, Utensils, Droplet, UserCheck, Plane, GlassWater, Waves, Anchor } from "lucide-react";


import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import RoomsSection from "@/components/home/RoomsSection";
import AboutSection from "@/components/home/AboutSection";
import WhySpecialSection from "@/components/home/WhySpecialSection";
import ServicesCarousel from "@/components/home/ServicesCarousel";
import TestimonialSection from "@/components/home/TestimonialSection";
import HeroSection from "@/components/home/HeroSection";
import HomeGallery from "@/components/home/HomeGallery";

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  
  const resolvedParams = await searchParams;
  const adults = parseInt((resolvedParams.adults as string) || "2");
  const children = parseInt((resolvedParams.children as string) || "0");
  const checkin = (resolvedParams.checkin as string) || "";
  const checkout = (resolvedParams.checkout as string) || "";

  // Fetch real rooms from DB
  let { data: rooms } = await supabase.from('rooms').select('*').order('price_per_night', { ascending: false });

  if (rooms) {
    const totalGuests = adults + children;
    rooms = rooms.filter(room => room.capacity >= totalGuests);
  }

  return (
    <main suppressHydrationWarning className="flex-1 flex flex-col relative w-full overflow-hidden">
      
      <HeroSection />

      {/* CRO Booking Engine */}
      <div className="relative z-30 max-w-6xl w-full mx-auto px-4 -mt-24 mb-[48px]">
        <div className="bg-white border-2 border-[#362618]/20 shadow-2xl p-8 flex flex-col rounded-lg">
          <form action="/#rooms" method="GET" className="flex flex-col md:flex-row items-end gap-4 w-full">
            <div className="flex-1 w-full relative">
              <label className="block text-[15px] font-jost text-gray-800 font-medium mb-2">Check-in</label>
              <input name="checkin" defaultValue={checkin} type="date" required className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[56px] focus:outline-none focus:border-[#362618] transition-colors" />
            </div>
            <div className="flex-1 w-full relative">
              <label className="block text-[15px] font-jost text-gray-800 font-medium mb-2">Check-out</label>
              <input name="checkout" defaultValue={checkout} type="date" required className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[56px] focus:outline-none focus:border-[#362618] transition-colors" />
            </div>
            <div className="w-full md:w-[120px] relative">
              <label className="block text-[15px] font-jost text-gray-800 font-medium mb-2">Adults</label>
              <input name="adults" defaultValue={adults} type="number" min="1" required className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[56px] focus:outline-none focus:border-[#362618] transition-colors" />
            </div>
            <div className="w-full md:w-[120px] relative">
              <label className="block text-[15px] font-jost text-gray-800 font-medium mb-2">Children</label>
              <input name="children" defaultValue={children} type="number" min="0" required className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[56px] focus:outline-none focus:border-[#362618] transition-colors" />
            </div>
            <div className="w-full md:w-auto mt-6 md:mt-0">
              <button type="submit" className="w-full md:w-auto bg-[#362618] text-white font-jost font-medium text-[16px] px-[24px] py-[19px] rounded-md hover:bg-[#2a1e12] transition-colors h-[56px] shadow-md whitespace-nowrap">
                Search Availability
              </button>
            </div>
          </form>
          
          <div className="mt-8 flex flex-wrap items-center justify-start gap-8 text-[14px] font-jost text-gray-600 font-medium">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#C97A4F]"></span> Best Rate Guaranteed</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#C97A4F]"></span> Complimentary Late Checkout</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#C97A4F]"></span> Zero Booking Fees</span>
          </div>
        </div>
      </div>

      {/* Animated About Section */}
      <AboutSection />

      {/* 4. Curated Accommodations Showcase (Rooms & Suites) */}
      <div id="rooms" className="scroll-mt-24">
        <RoomsSection rooms={rooms || []} />
      </div>

      {/* 5. Why Oslo Elite Special? (Animated Bento Grid) */}
      <WhySpecialSection />

      {/* 6. Exclusive Services & Privileges (Modern Cards Swiper / Carousel) */}
      <ServicesCarousel />

      {/* Modern Animated Gallery */}
      <HomeGallery />

      {/* 7. Curated Hotel Amenities Grid */}
      <section className="py-[48px] px-4 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-[48px]">
            <h2 className="font-marcellus text-[60px] text-primary">Signature Amenities</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
            {[
              { name: "Infinity Pool", icon: <Waves size={40} strokeWidth={1} /> },
              { name: "Private Wellness", icon: <Droplet size={40} strokeWidth={1} /> },
              { name: "24/7 Butler", icon: <UserCheck size={40} strokeWidth={1} /> },
              { name: "Helipad Chauffeur", icon: <Plane size={40} strokeWidth={1} /> },
              { name: "Michelin Dining", icon: <Utensils size={40} strokeWidth={1} /> },
              { name: "Sommelier Cellar", icon: <GlassWater size={40} strokeWidth={1} /> },
              { name: "Private Beach", icon: <Anchor size={40} strokeWidth={1} /> },
              { name: "High-Speed Fiber", icon: <Wifi size={40} strokeWidth={1} /> },
            ].map((amenity, i) => (
              <div key={i} className="group flex flex-col items-center justify-center p-[32px] bg-canvas border border-faint rounded-none hover:border-primary transition-colors duration-300">
                <div className="text-primary mb-[16px]">
                  {amenity.icon}
                </div>
                <h4 className="font-jost text-[18px] text-body text-center">{amenity.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Automated Testimonial Slider */}
      <TestimonialSection />

      {/* 7. Social Proof & Trust Architecture */}
      <section className="py-[48px] bg-[#FAF5F1] border-y border-faint">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h4 className="font-jost text-[18px] text-muted mb-[32px]">Internationally Acclaimed By</h4>
          <div className="flex flex-wrap justify-center items-center gap-[48px] opacity-70 grayscale">
            <span className="font-marcellus text-[32px] text-primary">Architectural Digest</span>
            <span className="font-vogue text-[28px] text-primary uppercase">Condé Nast</span>
            <span className="font-marcellus text-[32px] text-primary italic">Forbes Travel</span>
            <span className="font-vogue text-[36px] text-primary uppercase">Vogue</span>
          </div>
        </div>
      </section>

    </main>
  );
}
