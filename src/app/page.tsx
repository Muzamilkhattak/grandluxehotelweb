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
import RestaurantSection from "@/components/home/RestaurantSection";
import type { Metadata } from "next";
import { getRestaurantData } from "@/app/actions/admin-restaurant";
import { getRoomTotalCount } from "@/utils/room-inventory";

export const metadata: Metadata = {
  title: "Signature Art Hotel | Luxury 5-Star Boutique Hotel",
  description:
    "Experience 5-star luxury at Signature Art Hotel. Book boutique rooms, fine dining, and white-glove concierge services with best rates guaranteed.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Signature Art Hotel | Luxury 5-Star Boutique Hotel",
    description:
      "Book your stay at Signature Art Hotel. Opulent accommodations, fine dining, and white-glove hospitality.",
    url: "/",
  },
};

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  
  const resolvedParams = await searchParams;
  const adults = parseInt((resolvedParams.adults as string) || "2");
  const children = parseInt((resolvedParams.children as string) || "0");

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextYear = tomorrow.getFullYear();
  const nextMonth = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const nextDate = String(tomorrow.getDate()).padStart(2, "0");
  const tomorrowStr = `${nextYear}-${nextMonth}-${nextDate}`;

  const rawCheckin = (resolvedParams.checkin as string) || "";
  const rawCheckout = (resolvedParams.checkout as string) || "";
  const checkin = (rawCheckin && rawCheckin >= todayStr) ? rawCheckin : todayStr;
  const checkout = (rawCheckout && rawCheckout > checkin) ? rawCheckout : tomorrowStr;

  // Fetch real rooms from DB
  let { data: rooms } = await supabase.from('rooms').select('*').order('price_per_night', { ascending: false });

  let unavailableRoomIds: string[] = [];
  if (checkin && checkout && new Date(checkout) > new Date(checkin) && rooms) {
    const { data: overlappingBookings } = await supabase
      .from("bookings")
      .select("room_id")
      .neq("status", "cancelled")
      .lt("check_in", checkout)
      .gt("check_out", checkin);

    if (overlappingBookings) {
      const counts: Record<string, number> = {};
      overlappingBookings.forEach((b) => {
        counts[b.room_id] = (counts[b.room_id] || 0) + 1;
      });

      unavailableRoomIds = rooms
        .filter((r) => (counts[r.id] || 0) >= getRoomTotalCount(r))
        .map((r) => r.id);
    }
  }

  const restaurantData = await getRestaurantData();

  return (
    <main suppressHydrationWarning className="flex-1 flex flex-col relative w-full overflow-hidden">
      
      <HeroSection />

      {/* CRO Booking Engine */}
      <div className="relative z-30 max-w-6xl w-full mx-auto px-4 -mt-12 sm:-mt-16 md:-mt-24 mb-10 sm:mb-12">
        <div className="bg-white border-2 border-[#000000]/20 shadow-2xl p-5 sm:p-8 flex flex-col rounded-lg">
          <form action="/search" method="GET" className="flex flex-col md:flex-row items-end gap-3.5 sm:gap-4 w-full">
            <div className="flex-1 w-full relative">
              <label className="block text-[14px] sm:text-[15px] font-jost text-gray-800 font-medium mb-1.5 sm:mb-2">Check-in</label>
              <input name="checkin" defaultValue={checkin} min={todayStr} type="date" required className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[50px] sm:h-[56px] focus:outline-none focus:border-[#000000] transition-colors text-[14px] sm:text-[15px]" />
            </div>
            <div className="flex-1 w-full relative">
              <label className="block text-[14px] sm:text-[15px] font-jost text-gray-800 font-medium mb-1.5 sm:mb-2">Check-out</label>
              <input name="checkout" defaultValue={checkout} min={checkin || todayStr} type="date" required className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[50px] sm:h-[56px] focus:outline-none focus:border-[#000000] transition-colors text-[14px] sm:text-[15px]" />
            </div>
            <div className="w-full md:w-[120px] relative">
              <label className="block text-[14px] sm:text-[15px] font-jost text-gray-800 font-medium mb-1.5 sm:mb-2">Adults</label>
              <input name="adults" defaultValue={adults} type="number" min="1" required className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[50px] sm:h-[56px] focus:outline-none focus:border-[#000000] transition-colors text-[14px] sm:text-[15px]" />
            </div>
            <div className="w-full md:w-[120px] relative">
              <label className="block text-[14px] sm:text-[15px] font-jost text-gray-800 font-medium mb-1.5 sm:mb-2">Children</label>
              <input name="children" defaultValue={children} type="number" min="0" required className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 text-gray-900 font-jost h-[50px] sm:h-[56px] focus:outline-none focus:border-[#000000] transition-colors text-[14px] sm:text-[15px]" />
            </div>
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <button type="submit" className="w-full md:w-auto bg-[#000000] hover:bg-[#d7b56d] text-white hover:text-[#000000] font-jost font-semibold text-[14px] sm:text-[15px] uppercase tracking-[0.14em] px-6 py-3.5 sm:py-[18px] rounded-md transition-all duration-300 h-[50px] sm:h-[56px] shadow-md whitespace-nowrap cursor-pointer">
                Search Availability
              </button>
            </div>
          </form>
          
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-start gap-4 sm:gap-8 text-[13px] sm:text-[14px] font-jost text-gray-600 font-medium">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d7b56d]"></span> Best Rate Guaranteed</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d7b56d]"></span> Complimentary Late Checkout</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d7b56d]"></span> Zero Booking Fees</span>
          </div>
        </div>
      </div>

      {/* Animated About Section */}
      <AboutSection />

      {/* 4. Curated Accommodations Showcase (Rooms & Suites) */}
      <div id="rooms" className="scroll-mt-24">
        <RoomsSection 
          rooms={rooms || []} 
          unavailableRoomIds={unavailableRoomIds}
          searchedDates={checkin && checkout ? { checkin, checkout } : undefined}
        />
      </div>

      {/* 5. Why Signature Art Hotel Special? (Animated Bento Grid) */}
      <WhySpecialSection />

      {/* Haute Cuisine & Restaurant Section */}
      <RestaurantSection 
        settings={restaurantData.settings} 
        items={restaurantData.items} 
      />

      {/* 6. Exclusive Services & Privileges (Modern Cards Swiper / Carousel) */}
      <ServicesCarousel />

      {/* Modern Animated Gallery */}
      <HomeGallery />

      {/* 7. Curated Hotel Amenities Grid */}
      <section className="py-14 sm:py-20 md:py-[48px] px-4 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-[48px]">
            <h2 className="font-marcellus text-3xl sm:text-4xl md:text-[52px] lg:text-[60px] text-primary">
              Signature Amenities
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-[16px]">
            {[
              { name: "Infinity Pool", icon: <Waves size={36} strokeWidth={1} /> },
              { name: "Private Wellness", icon: <Droplet size={36} strokeWidth={1} /> },
              { name: "24/7 Butler", icon: <UserCheck size={36} strokeWidth={1} /> },
              { name: "Helipad Chauffeur", icon: <Plane size={36} strokeWidth={1} /> },
              { name: "Michelin Dining", icon: <Utensils size={36} strokeWidth={1} /> },
              { name: "Sommelier Cellar", icon: <GlassWater size={36} strokeWidth={1} /> },
              { name: "Private Beach", icon: <Anchor size={36} strokeWidth={1} /> },
              { name: "High-Speed Fiber", icon: <Wifi size={36} strokeWidth={1} /> },
            ].map((amenity, i) => (
              <div key={i} className="group flex flex-col items-center justify-center p-5 sm:p-7 md:p-[32px] bg-canvas border border-faint rounded-none hover:border-primary transition-colors duration-300">
                <div className="text-primary mb-3 sm:mb-[16px]">
                  {amenity.icon}
                </div>
                <h4 className="font-jost text-[15px] sm:text-[18px] text-body text-center">{amenity.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Automated Testimonial Slider */}
      <TestimonialSection />

      {/* 8. Social Proof & Trust Architecture */}
      <section className="py-12 sm:py-16 md:py-[48px] bg-[#FFFFFF] border-y border-faint">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h4 className="font-jost text-[14px] sm:text-[16px] md:text-[18px] text-muted mb-6 sm:mb-8 md:mb-[32px] uppercase tracking-wider">
            Internationally Acclaimed By
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-[48px] opacity-70 grayscale">
            <span className="font-marcellus text-xl sm:text-2xl md:text-[32px] text-primary">Architectural Digest</span>
            <span className="font-vogue text-lg sm:text-xl md:text-[28px] text-primary uppercase">Condé Nast</span>
            <span className="font-marcellus text-xl sm:text-2xl md:text-[32px] text-primary italic">Forbes Travel</span>
            <span className="font-vogue text-xl sm:text-2xl md:text-[36px] text-primary uppercase">Vogue</span>
          </div>
        </div>
      </section>

    </main>
  );
}
