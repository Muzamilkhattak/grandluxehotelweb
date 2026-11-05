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
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
        Failed to load bookings: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">Reservations</h1>
        <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
          View, search, and update all guest stays, revenue, and check-in schedules.
        </p>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs p-5">
        <RecentBookingsTable initialBookings={bookings || []} />
      </div>
    </div>
  );
}
