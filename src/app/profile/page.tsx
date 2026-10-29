import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { LogOut, User, CalendarDays, Settings, Trash2 } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "My Profile | Grand Luxe Hotel & Suites",
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="pt-[140px] pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-marcellus text-3xl mb-4">Please log in to view your profile</h1>
          <Link href="/login" className="bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white px-6 py-2 uppercase tracking-widest text-sm font-jost transition-all duration-300">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Fetch bookings for this user using either their account ID or their email address
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, rooms(title, price_per_night, image_url)")
    .or(`user_id.eq.${user.id},guest_email.eq.${user.email || ""}`)
    .order("created_at", { ascending: false });

  return (
    <main className="pt-[140px] pb-24 min-h-screen bg-[#FFFFFF]">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h1 className="font-marcellus text-4xl text-[#000000] mb-10 border-b border-[#d7b56d] pb-6 flex items-center gap-3">
          <User className="text-[#d7b56d]" size={36} />
          My Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar / User Info */}
          <div className="md:col-span-1">
            <ProfileClient initialUser={user} />
          </div>

          {/* Main Content - Bookings */}
          <div className="md:col-span-2">
            <h2 className="font-marcellus text-2xl text-[#000000] mb-6 flex items-center gap-2">
              <CalendarDays className="text-[#d7b56d]" size={24} />
              My Reservations
            </h2>

            {!bookings || bookings.length === 0 ? (
              <div className="bg-white border border-[#d7b56d] p-10 text-center flex flex-col items-center justify-center">
                <CalendarDays size={48} className="text-[#d7b56d]/30 mb-4" />
                <h3 className="font-marcellus text-xl text-[#000000] mb-2">No reservations found</h3>
                <p className="font-jost text-[#000000] mb-6">You haven't booked any rooms with us yet.</p>
                <Link href="/rooms" className="bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white px-8 py-3 uppercase tracking-[0.15em] text-[13px] font-jost font-semibold transition-all duration-300">
                  Explore Rooms
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white border border-[#d7b56d] p-6 flex flex-col sm:flex-row gap-6 shadow-sm group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] uppercase font-jost font-bold tracking-widest px-2 py-1 rounded-sm ${
                          booking.status === 'confirmed' ? 'bg-[#F0FDF4] text-[#166534] border border-[#22C55E]/30' :
                          booking.status === 'cancelled' ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#EF4444]/30' :
                          'bg-[#FFFFFF] text-[#d7b56d] border border-[#d7b56d]/30'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-[12px] font-jost text-[#000000]">
                          Booked on {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-marcellus text-xl text-[#000000] mb-1">
                        {booking.rooms?.title || 'Luxury Suite'}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-[11px] font-jost uppercase tracking-widest text-[#000000] mb-1">Check-in</p>
                          <p className="font-jost text-[14px] text-[#000000] font-medium">{new Date(booking.check_in).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-jost uppercase tracking-widest text-[#000000] mb-1">Check-out</p>
                          <p className="font-jost text-[14px] text-[#000000] font-medium">{new Date(booking.check_out).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#FFFFFF] p-4 border border-[#d7b56d]/50 sm:w-40 flex flex-col justify-center items-center text-center">
                      <p className="text-[11px] font-jost uppercase tracking-widest text-[#000000] mb-1">Total</p>
                      <p className="font-marcellus text-2xl text-[#d7b56d]">${booking.total_amount}</p>
                      <p className="text-[12px] font-jost text-[#000000] mt-1">{booking.total_nights} night{booking.total_nights > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
