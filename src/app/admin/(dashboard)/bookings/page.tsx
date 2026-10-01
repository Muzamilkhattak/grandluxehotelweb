import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import RecentBookingsTable from "@/components/admin/RecentBookingsTable";

export default async function BookingsPage() {
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
    return <div className="text-red-500 font-jost">Failed to load bookings: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="font-marcellus text-[44px] text-[#362618] mb-8">All Reservations</h1>
      <RecentBookingsTable initialBookings={bookings || []} />
    </div>
  );
}
