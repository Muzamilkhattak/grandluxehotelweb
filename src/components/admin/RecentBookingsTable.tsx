"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
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
      setToast(`Booking status updated to ${newStatus}.`);
      setTimeout(() => setToast(null), 3000);
    }
    setProcessingId(null);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-white border-l-4 border-[#00a32a] text-[#1d2327] px-4 py-3 shadow-md text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white flex flex-col">
        {/* Toolbar */}
        <div className="p-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex gap-4 text-[13px]">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`relative transition-colors ${filter === tab ? 'text-[#1d2327] font-semibold' : 'text-[#2271b1] hover:text-[#0a4b78]'}`}
              >
                {tab}
                {filter !== tab && <span className="text-[#a7aaad] ml-4">|</span>}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] transition-all text-[#3c434a]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#c3c4c7]">
          <table className="w-full text-left text-[13px] text-[#3c434a]">
            <thead className="bg-[#f6f7f7] border-b border-[#c3c4c7]">
              <tr>
                <th className="px-3 py-2 font-semibold">Guest Name</th>
                <th className="px-3 py-2 font-semibold">Suite Booked</th>
                <th className="px-3 py-2 font-semibold">Check In/Out</th>
                <th className="px-3 py-2 font-semibold">Revenue</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c4c7] bg-white">
              <AnimatePresence mode="popLayout">
                {filteredBookings.map((booking, idx) => {
                  const checkIn = new Date(booking.check_in);
                  const checkOut = new Date(booking.check_out);
                  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));

                  return (
                    <motion.tr 
                      layout
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#f6f7f7]'} hover:bg-[#f0f0f1] transition-colors group`}
                    >
                      <td className="px-3 py-3 align-top">
                        <strong className="text-[#1d2327] block mb-1">{booking.guest_name}</strong>
                        <div className="flex gap-2 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                          {booking.status === 'confirmed' ? (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              disabled={processingId === booking.id}
                              className="text-[#d63638] hover:underline disabled:opacity-50"
                            >
                              {processingId === booking.id ? "Wait..." : "Cancel"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              disabled={processingId === booking.id}
                              className="text-[#2271b1] hover:underline disabled:opacity-50"
                            >
                              {processingId === booking.id ? "Wait..." : "Confirm"}
                            </button>
                          )}
                          <span className="text-[#a7aaad]">|</span>
                          <span className="text-[#2271b1] hover:underline cursor-pointer">View</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <span className="text-[#2271b1] font-medium">{booking.rooms?.title || "N/A"}</span>
                      </td>
                      <td className="px-3 py-3 align-top">
                        {booking.check_in} <br/> 
                        <span className="text-[#50575e]">{nights} nights</span>
                      </td>
                      <td className="px-3 py-3 align-top">
                        ${booking.total_amount?.toLocaleString() || 0}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <span className={`inline-block px-2 py-0.5 text-[12px] rounded-[3px] font-medium border ${
                          booking.status === 'confirmed'
                            ? 'bg-[#edfaef] text-[#00a32a] border-[#00a32a]/20'
                            : booking.status === 'pending'
                            ? 'bg-[#fcf0e0] text-[#d16400] border-[#d16400]/20'
                            : 'bg-[#f6f7f7] text-[#50575e] border-[#c3c4c7]'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              
              {filteredBookings.length === 0 && (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td colSpan={5} className="px-3 py-6 text-[#50575e]">
                    No reservations found.
                  </td>
                </motion.tr>
              )}
            </tbody>
            <tfoot className="bg-[#f6f7f7] border-t border-[#c3c4c7]">
              <tr>
                <th className="px-3 py-2 font-semibold">Guest Name</th>
                <th className="px-3 py-2 font-semibold">Suite Booked</th>
                <th className="px-3 py-2 font-semibold">Check In/Out</th>
                <th className="px-3 py-2 font-semibold">Revenue</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
