import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import GuestsManager, { GuestProfile } from "@/components/admin/GuestsManager";

export const dynamic = "force-dynamic";

export default async function AdminGuestsPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      rooms ( title, image_url )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-white border-l-4 border-[#d63638] text-[#1d2327] shadow-sm text-sm">
        Failed to load guests data: {error.message}
      </div>
    );
  }

  // Aggregate bookings into unique Guest Profiles
  const guestMap = new Map<string, GuestProfile>();

  (bookings || []).forEach((b: any) => {
    // Key by email if available, otherwise by name
    const key = (b.guest_email?.trim().toLowerCase() || b.guest_name?.trim().toLowerCase() || b.id);

    if (!guestMap.has(key)) {
      guestMap.set(key, {
        id: b.id,
        name: b.guest_name || "Anonymous Guest",
        email: b.guest_email || "",
        phone: b.guest_phone || "",
        totalBookings: 0,
        totalSpent: 0,
        firstStay: b.check_in,
        lastStay: b.check_in,
        status: "New",
        notes: [],
        bookings: [],
      });
    }

    const guest = guestMap.get(key)!;
    guest.totalBookings += 1;
    if (b.status !== "cancelled") {
      guest.totalSpent += Number(b.total_amount || 0);
    }

    if (b.notes && b.notes.trim() && !guest.notes.includes(b.notes.trim())) {
      guest.notes.push(b.notes.trim());
    }

    // Date range comparisons
    if (new Date(b.check_in).getTime() > new Date(guest.lastStay).getTime()) {
      guest.lastStay = b.check_in;
    }
    if (new Date(b.check_in).getTime() < new Date(guest.firstStay).getTime()) {
      guest.firstStay = b.check_in;
    }

    guest.bookings.push({
      id: b.id,
      roomTitle: b.rooms?.title || "Luxury Suite",
      checkIn: b.check_in,
      checkOut: b.check_out,
      totalNights: b.total_nights || 1,
      totalAmount: b.total_amount || 0,
      status: b.status || "confirmed",
      notes: b.notes || undefined,
      createdAt: b.created_at || b.check_in,
    });
  });

  // Calculate Loyalty Tiers
  const guests: GuestProfile[] = Array.from(guestMap.values()).map((g) => {
    let status: "VIP" | "Returning" | "New" = "New";
    if (g.totalSpent >= 1500 || g.totalBookings >= 3) {
      status = "VIP";
    } else if (g.totalBookings > 1) {
      status = "Returning";
    }
    return { ...g, status };
  });

  return <GuestsManager guests={guests} />;
}
