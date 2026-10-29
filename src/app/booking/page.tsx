import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getHotelSettings } from "@/app/actions/admin-settings";
import BookingPageClient from "@/components/booking/BookingPageClient";
import { Sparkles, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Complete Your Reservation | Signature Art Hotel",
  description: "Secure your luxury suite reservation with official hotel payment and booking verification.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const roomId = resolvedParams.roomId as string;
  if (!roomId) {
    redirect("/search");
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // 1. Fetch Room Details
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    // If not found by ID, try searching by slug
    const { data: slugRoom } = await supabase
      .from("rooms")
      .select("*")
      .eq("slug", roomId)
      .single();

    if (!slugRoom) {
      notFound();
    }
  }

  const targetRoom = room;

  // 2. Fetch Admin Hotel Settings (Bank details, policy, contact)
  const settings = await getHotelSettings();

  // 3. Fetch current user session (for pre-filling form)
  const { data: { user } } = await supabase.auth.getUser();

  let userInfo: { id?: string; email?: string; name?: string; phone?: string } | null = null;
  if (user) {
    userInfo = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      phone: user.user_metadata?.phone || "",
    };
  }

  // 4. Default dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2);

  const defaultCheckIn = today.toISOString().split("T")[0];
  const defaultCheckOut = tomorrow.toISOString().split("T")[0];

  const checkin = (resolvedParams.checkin as string) || defaultCheckIn;
  const checkout = (resolvedParams.checkout as string) || defaultCheckOut;
  const adults = parseInt((resolvedParams.adults as string) || "2", 10) || 2;
  const children = parseInt((resolvedParams.children as string) || "0", 10) || 0;

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#000000]">
      {/* Top Banner */}
      <section className="relative bg-[#0F141C] text-white py-14 sm:py-20 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/85 z-10" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#d7b56d]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-4">
            <Sparkles size={14} className="text-[#d7b56d]" />
            <span className="font-vogue text-[#d7b56d] tracking-[0.22em] uppercase text-[11px] font-semibold">
              Secure Checkout
            </span>
            <Sparkles size={14} className="text-[#d7b56d]" />
          </div>

          <h1 className="font-marcellus text-3xl sm:text-5xl text-white font-normal mb-2">
            Reservation & Payment
          </h1>
          <p className="font-jost text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
            Review your stay details, transfer to the official hotel account, and confirm your booking.
          </p>
        </div>
      </section>

      {/* Booking Form Client Component */}
      <Suspense
        fallback={
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 size={36} className="animate-spin text-[#d7b56d] mb-4" />
            <p className="font-jost text-gray-600">Loading reservation details...</p>
          </div>
        }
      >
        <BookingPageClient
          room={targetRoom}
          settings={settings}
          user={userInfo}
          initialCheckIn={checkin}
          initialCheckOut={checkout}
          initialAdults={adults}
          initialChildren={children}
        />
      </Suspense>
    </main>
  );
}
