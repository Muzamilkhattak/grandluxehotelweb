"use client";

import { useState } from "react";
import { Search, ChevronDown, CheckCircle2, Clock, CalendarX, User } from "lucide-react";
import Image from "next/image";
import { updateBookingStatus } from "@/app/actions/admin-bookings";

export default function RecentBookingsTable({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const tabs = ["All", "Confirmed", "Pending", "Cancelled"];

  const filteredBookings = bookings.filter((b) => {
    if (filter !== "All" && b.status.toLowerCase() !== filter.toLowerCase() && !(filter === "Pending" && b.status === "pending")) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = b.guest_name.toLowerCase().includes(q);
      const matchRoom = b.rooms?.title?.toLowerCase().includes(q);
      const matchId = b.id.toLowerCase().includes(q);
      if (!matchName && !matchRoom && !matchId) return false;
    }
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    setProcessingId(id);
    const result = await updateBookingStatus(id, newStatus);
    if (result.success) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      setToast(`Booking status updated to ${newStatus}`);
      setTimeout(() => setToast(null), 3000);
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-16 right-6 z-50 bg-white border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Toolbar: Segmented Controls & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Segmented Filter Pills */}
        <div className="inline-flex p-1 bg-zinc-100 rounded-lg self-start">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === tab
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search guests or suites..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-white border border-zinc-200 rounded-lg pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-zinc-200/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 border-b border-zinc-200/80 text-zinc-500 font-medium">
              <tr>
                <th className="px-4 py-3">Guest details</th>
                <th className="px-4 py-3">Accommodation</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80 bg-white">
              {filteredBookings.map((booking) => {
                const checkIn = new Date(booking.check_in);
                const checkOut = new Date(booking.check_out);
                const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
                
                const statusStyle = 
                  booking.status === 'confirmed' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                    : booking.status === 'pending'
                    ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200/60';

                return (
                  <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors">
                    {/* Guest Name & Phone */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 text-[11px] font-semibold shrink-0">
                          {booking.guest_name ? booking.guest_name.charAt(0).toUpperCase() : "G"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-900 truncate">{booking.guest_name}</div>
                          <div className="text-[11px] text-zinc-500 tabular-nums">{booking.guest_phone || booking.guest_email || "Direct Booking"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Suite Booked */}
                    <td className="px-4 py-3.5 text-zinc-700">
                      <div className="font-medium text-zinc-900">{booking.rooms?.title || "Luxury Suite"}</div>
                      <div className="text-[11px] text-zinc-500">{booking.guests_count || 2} Guests</div>
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-3.5 text-zinc-600">
                      <div className="font-medium text-zinc-900 tabular-nums">
                        {checkIn.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – {checkOut.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[11px] text-zinc-500 tabular-nums">{nights} {nights === 1 ? 'night' : 'nights'}</div>
                    </td>

                    {/* Revenue Total */}
                    <td className="px-4 py-3.5 text-right font-medium text-zinc-900 tabular-nums">
                      PKR {Number(booking.total_amount || 0).toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border capitalize ${statusStyle}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-emerald-500' : booking.status === 'pending' ? 'bg-amber-500' : 'bg-zinc-400'
                        }`} />
                        {booking.status}
                      </span>
                    </td>

                    {/* Quick Status Action */}
                    <td className="px-4 py-3.5 text-right">
                      <select
                        value={booking.status}
                        disabled={processingId === booking.id}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className="h-7 text-xs bg-white border border-zinc-200 rounded-md px-2 text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer disabled:opacity-50"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400 text-xs">
                    No reservations found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
