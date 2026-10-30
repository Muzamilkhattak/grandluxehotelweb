import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import SearchResultsClient, { SearchRoom } from "@/components/search/SearchResultsClient";
import { getRoomTotalCount } from "@/utils/room-inventory";
import { Sparkles, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search Suites & Check Availability | Signature Art Hotel",
  description: "Find and book available luxury rooms and suites matching your exact dates and party size.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const defaultCheckIn = `${year}-${month}-${day}`;

  const nextDay = new Date(today);
  nextDay.setDate(nextDay.getDate() + 2);
  const nextYear = nextDay.getFullYear();
  const nextMonth = String(nextDay.getMonth() + 1).padStart(2, "0");
  const nextDate = String(nextDay.getDate()).padStart(2, "0");
  const defaultCheckOut = `${nextYear}-${nextMonth}-${nextDate}`;

  const rawCheckin = (resolvedParams.checkin as string) || "";
  const rawCheckout = (resolvedParams.checkout as string) || "";

  const checkin = (rawCheckin && rawCheckin >= defaultCheckIn) ? rawCheckin : defaultCheckIn;
  const checkout = (rawCheckout && rawCheckout > checkin) ? rawCheckout : defaultCheckOut;
  const adults = parseInt((resolvedParams.adults as string) || "2", 10) || 2;
  const children = parseInt((resolvedParams.children as string) || "0", 10) || 0;
  const totalGuests = adults + children;

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // 1. Fetch all active rooms
  const { data: rawRooms } = await supabase
    .from("rooms")
    .select("*")
    .order("price_per_night", { ascending: false });

  const rooms: SearchRoom[] = rawRooms || [];

  // 2. Fetch overlapping bookings for date range
  let unavailableRoomIds = new Set<string>();

  if (checkin && checkout && new Date(checkout) > new Date(checkin)) {
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

      rooms.forEach((r) => {
        const capacityRooms = getRoomTotalCount(r);
        if ((counts[r.id] || 0) >= capacityRooms) {
          unavailableRoomIds.add(r.id);
        }
      });
    }
  }

  // 3. Classify rooms into Recommended, Other Available, and Booked
  const recommendedRooms: SearchRoom[] = [];
  const otherRooms: SearchRoom[] = [];
  const bookedRooms: SearchRoom[] = [];

  rooms.forEach((room) => {
    const isBooked = unavailableRoomIds.has(room.id);
    if (isBooked) {
      bookedRooms.push(room);
      return;
    }

    const roomCapacity = room.capacity || room.capacity_guests || 2;
    if (roomCapacity >= totalGuests) {
      recommendedRooms.push(room);
    } else {
      otherRooms.push(room);
    }
  });

  // Sort recommended rooms so the closest fit (or highest value) comes first
  recommendedRooms.sort((a, b) => {
    const capA = a.capacity || a.capacity_guests || 2;
    const capB = b.capacity || b.capacity_guests || 2;
    return capA - capB;
  });

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#000000]">
      {/* Top Hero Banner */}
      <section className="relative bg-[#0F141C] text-white py-16 sm:py-24 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80 z-10" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#d7b56d]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-4">
            <Sparkles size={14} className="text-[#d7b56d]" />
            <span className="font-vogue text-[#d7b56d] tracking-[0.22em] uppercase text-[11px] font-semibold">
              Live Availability
            </span>
            <Sparkles size={14} className="text-[#d7b56d]" />
          </div>

          <h1 className="font-marcellus text-3xl sm:text-5xl md:text-6xl text-white font-normal mb-3">
            Available Suites & Accommodations
          </h1>
          <p className="font-jost text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
            Personalized suite recommendations matched to your travel dates and party size with guaranteed best rates.
          </p>
        </div>
      </section>

      {/* Main Search Results Component */}
      <Suspense
        fallback={
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 size={36} className="animate-spin text-[#d7b56d] mb-4" />
            <p className="font-jost text-gray-600">Finding the best suites for your stay...</p>
          </div>
        }
      >
        <SearchResultsClient
          initialCheckIn={checkin}
          initialCheckOut={checkout}
          initialAdults={adults}
          initialChildren={children}
          recommendedRooms={recommendedRooms}
          otherRooms={otherRooms}
          bookedRooms={bookedRooms}
        />
      </Suspense>
    </main>
  );
}
