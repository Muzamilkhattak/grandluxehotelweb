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
import BookingEngineBar from "@/components/home/BookingEngineBar";
import SignatureAmenities from "@/components/home/SignatureAmenities";
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
      
      {/* 1. Hero Section with Scroll Parallax & 3D Tilt */}
      <HeroSection />

      {/* 2. CRO Booking Engine with 3D Tilt & Float */}
      <BookingEngineBar
        checkin={checkin}
        checkout={checkout}
        adults={adults}
        children={children}
        todayStr={todayStr}
      />

      {/* 3. Animated About Section with Multi-Layer Scroll Parallax & 3D Imagery */}
      <AboutSection />

      {/* 4. Curated Accommodations Showcase with 3D Arched Cards */}
      <div id="rooms" className="scroll-mt-24">
        <RoomsSection 
          rooms={rooms || []} 
          unavailableRoomIds={unavailableRoomIds}
          searchedDates={checkin && checkout ? { checkin, checkout } : undefined}
        />
      </div>

      {/* 5. Why Signature Art Hotel Special (3D Bento Grid & Parallax) */}
      <WhySpecialSection />

      {/* 6. Haute Cuisine & Restaurant Section (Scroll Parallax Ambiance & 3D Dishes) */}
      <RestaurantSection 
        settings={restaurantData.settings} 
        items={restaurantData.items} 
      />

      {/* 7. Exclusive Services & Privileges (3D Privileges Swiper) */}
      <ServicesCarousel />

      {/* 8. Modern Animated Gallery with 3D Image Cards */}
      <HomeGallery />

      {/* 9. Curated Hotel Amenities Grid with 3D Interactive Tiles */}
      <SignatureAmenities />

      {/* 10. Automated Testimonial Slider with 3D Perspective Rotation & Background Parallax */}
      <TestimonialSection />

    </main>
  );
}
