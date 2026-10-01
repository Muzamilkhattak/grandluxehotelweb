"use client";

import { useState, useMemo } from "react";
import { 
  Users, 
  Crown, 
  DollarSign, 
  Repeat, 
  Search, 
  Download, 
  Mail, 
  Phone, 
  Calendar, 
  X, 
  Eye, 
  BedDouble, 
  Clock, 
  ChevronRight,
  FileText
} from "lucide-react";

export interface GuestProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  firstStay: string;
  lastStay: string;
  status: "VIP" | "Returning" | "New";
  notes: string[];
  bookings: Array<{
    id: string;
    roomTitle: string;
    checkIn: string;
    checkOut: string;
    totalNights: number;
    totalAmount: number;
    status: string;
    notes?: string;
    createdAt: string;
  }>;
}

export default function GuestsManager({ guests }: { guests: GuestProfile[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "VIP" | "Returning" | "New">("All");
  const [sortBy, setSortBy] = useState<"recent" | "spent" | "bookings" | "name">("recent");
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null);

  // Analytics
  const totalGuestsCount = guests.length;
  const vipCount = guests.filter((g) => g.status === "VIP").length;
  const returningCount = guests.filter((g) => g.totalBookings > 1).length;
  const repeatRate = totalGuestsCount > 0 ? Math.round((returningCount / totalGuestsCount) * 100) : 0;
  const totalRevenue = guests.reduce((sum, g) => sum + g.totalSpent, 0);
  const avgLtv = totalGuestsCount > 0 ? Math.round(totalRevenue / totalGuestsCount) : 0;

  // Filtered and Sorted Guests
  const filteredGuests = useMemo(() => {
    return guests
      .filter((g) => {
        if (statusFilter !== "All" && g.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = g.name.toLowerCase().includes(q);
          const matchEmail = g.email.toLowerCase().includes(q);
          const matchPhone = g.phone.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchPhone) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "spent") return b.totalSpent - a.totalSpent;
        if (sortBy === "bookings") return b.totalBookings - a.totalBookings;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.lastStay).getTime() - new Date(a.lastStay).getTime();
      });
  }, [guests, statusFilter, searchQuery, sortBy]);

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Status", "Total Stays", "Total Spent ($)", "First Stay", "Last Stay"];
    const rows = filteredGuests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.email.replace(/"/g, '""')}"`,
      `"${g.phone.replace(/"/g, '""')}"`,
      `"${g.status}"`,
      g.totalBookings,
      g.totalSpent,
      `"${g.firstStay}"`,
      `"${g.lastStay}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hotel_guests_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "G";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[23px] font-normal text-[#1d2327]">Guests Directory</h1>
          <p className="text-[13px] text-[#50575e] mt-0.5">
            Manage guest profiles, loyalty status, preferences, and booking history.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-[13px] font-medium rounded-[3px] shadow-sm transition-colors self-start sm:self-auto"
        >
          <Download size={15} />
          <span>Export Guests (CSV)</span>
        </button>
      </div>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#c3c4c7] shadow-sm">
          <div className="px-4 py-2.5 border-b border-[#c3c4c7] flex justify-between items-center bg-[#f6f7f7]">
            <h3 className="text-[13px] font-semibold text-[#1d2327]">Total Guests</h3>
            <Users size={18} className="text-[#2271b1]" />
          </div>
          <div className="p-4">
            <div className="text-[26px] font-normal text-[#1d2327] mb-1">{totalGuestsCount}</div>
            <div className="text-[12px] text-[#50575e]">Registered hotel profiles</div>
          </div>
        </div>

        <div className="bg-white border border-[#c3c4c7] shadow-sm">
          <div className="px-4 py-2.5 border-b border-[#c3c4c7] flex justify-between items-center bg-[#f6f7f7]">
            <h3 className="text-[13px] font-semibold text-[#1d2327]">VIP Guests</h3>
            <Crown size={18} className="text-[#dba617]" />
          </div>
          <div className="p-4">
            <div className="text-[26px] font-normal text-[#1d2327] mb-1">{vipCount}</div>
            <div className="text-[12px] text-[#dba617] font-medium">Top tier frequent travelers</div>
          </div>
        </div>

        <div className="bg-white border border-[#c3c4c7] shadow-sm">
          <div className="px-4 py-2.5 border-b border-[#c3c4c7] flex justify-between items-center bg-[#f6f7f7]">
            <h3 className="text-[13px] font-semibold text-[#1d2327]">Repeat Guest Rate</h3>
            <Repeat size={18} className="text-[#00a32a]" />
          </div>
          <div className="p-4">
            <div className="text-[26px] font-normal text-[#1d2327] mb-1">{repeatRate}%</div>
            <div className="text-[12px] text-[#00a32a] font-medium">{returningCount} returning guests</div>
          </div>
        </div>

        <div className="bg-white border border-[#c3c4c7] shadow-sm">
          <div className="px-4 py-2.5 border-b border-[#c3c4c7] flex justify-between items-center bg-[#f6f7f7]">
            <h3 className="text-[13px] font-semibold text-[#1d2327]">Avg. Lifetime Value</h3>
            <DollarSign size={18} className="text-[#2271b1]" />
          </div>
          <div className="p-4">
            <div className="text-[26px] font-normal text-[#1d2327] mb-1">${avgLtv.toLocaleString()}</div>
            <div className="text-[12px] text-[#50575e]">Total ${totalRevenue.toLocaleString()} volume</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm">
        {/* Toolbar & Filter Bar */}
        <div className="p-3 border-b border-[#c3c4c7] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-[#f6f7f7]">
          {/* Status Tabs */}
          <div className="flex items-center gap-3 text-[13px] overflow-x-auto pb-1 md:pb-0">
            {(["All", "VIP", "Returning", "New"] as const).map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? "text-[#1d2327] font-semibold"
                    : "text-[#2271b1] hover:text-[#135e96]"
                }`}
              >
                {tab} {tab === "All" ? `(${guests.length})` : `(${guests.filter((g) => g.status === tab).length})`}
                {idx < 3 && <span className="text-[#a7aaad] ml-3">|</span>}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c8f94]" />
              <input
                type="text"
                placeholder="Search guest by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#8c8f94] rounded-[3px] pl-8 pr-3 py-1.5 text-[13px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8c8f94] hover:text-[#1d2327]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#8c8f94] rounded-[3px] px-2 py-1.5 text-[13px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="spent">Sort: Highest Spend</option>
              <option value="bookings">Sort: Most Stays</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Guests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#3c434a]">
            <thead className="bg-[#f6f7f7] border-b border-[#c3c4c7]">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-[#1d2327]">Guest</th>
                <th className="px-4 py-2.5 font-semibold text-[#1d2327]">Contact Details</th>
                <th className="px-4 py-2.5 font-semibold text-[#1d2327]">Tier Status</th>
                <th className="px-4 py-2.5 font-semibold text-[#1d2327]">Total Stays</th>
                <th className="px-4 py-2.5 font-semibold text-[#1d2327]">Total Spend</th>
                <th className="px-4 py-2.5 font-semibold text-[#1d2327]">Last Check-in</th>
                <th className="px-4 py-2.5 font-semibold text-right text-[#1d2327]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c4c7]">
              {filteredGuests.map((guest, idx) => {
                return (
                  <tr
                    key={guest.id}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-[#f6f7f7]"} hover:bg-[#f0f0f1] transition-colors group cursor-pointer`}
                    onClick={() => setSelectedGuest(guest)}
                  >
                    {/* Guest Name & Avatar */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1d2327] text-white flex items-center justify-center font-semibold text-[12px] shrink-0 shadow-sm">
                          {getInitials(guest.name)}
                        </div>
                        <div>
                          <strong className="text-[#1d2327] hover:text-[#2271b1] transition-colors block text-[13.5px]">
                            {guest.name}
                          </strong>
                          {guest.notes.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#dba617] font-medium mt-0.5">
                              <FileText size={11} /> {guest.notes.length} note{guest.notes.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact info */}
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-0.5 text-[12.5px]">
                        <div className="flex items-center gap-1.5 text-[#50575e]">
                          <Mail size={12} className="text-[#8c8f94] shrink-0" />
                          <span className="text-[#2271b1] hover:underline" onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${guest.email}`; }}>
                            {guest.email || "No email"}
                          </span>
                        </div>
                        {guest.phone && (
                          <div className="flex items-center gap-1.5 text-[#50575e]">
                            <Phone size={12} className="text-[#8c8f94] shrink-0" />
                            <span>{guest.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11.5px] rounded-[3px] font-medium border ${
                          guest.status === "VIP"
                            ? "bg-[#fcf8e3] text-[#8a6d3b] border-[#faebcc]"
                            : guest.status === "Returning"
                            ? "bg-[#e5f5fa] text-[#006ba1] border-[#bce8f1]"
                            : "bg-[#f0f0f1] text-[#50575e] border-[#c3c4c7]"
                        }`}
                      >
                        {guest.status === "VIP" && <Crown size={11} className="text-[#dba617]" />}
                        {guest.status}
                      </span>
                    </td>

                    {/* Total Stays */}
                    <td className="px-4 py-3 align-top font-medium text-[#1d2327]">
                      {guest.totalBookings} {guest.totalBookings === 1 ? "booking" : "bookings"}
                    </td>

                    {/* Total Spend */}
                    <td className="px-4 py-3 align-top font-semibold text-[#1d2327]">
                      ${guest.totalSpent.toLocaleString()}
                    </td>

                    {/* Last Stay */}
                    <td className="px-4 py-3 align-top text-[#50575e]">
                      {guest.lastStay ? new Date(guest.lastStay).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGuest(guest);
                        }}
                        className="inline-flex items-center gap-1 text-[12px] text-[#2271b1] hover:text-[#135e96] hover:underline font-medium"
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[#50575e]">
                    <Users size={32} className="mx-auto mb-2 text-[#c3c4c7]" />
                    <p className="text-[14px] font-medium text-[#1d2327]">No guests matching your criteria</p>
                    <p className="text-[12px] text-[#8c8f94] mt-0.5">Try clearing the search query or changing filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-[#f6f7f7] border-t border-[#c3c4c7]">
              <tr>
                <td colSpan={7} className="px-4 py-2 text-[12px] text-[#50575e]">
                  Showing {filteredGuests.length} of {guests.length} guest records
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Guest Details Modal / Drawer */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-[#c3c4c7] rounded-none overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#1d2327] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2271b1] text-white flex items-center justify-center font-bold text-base shadow">
                  {getInitials(selectedGuest.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">{selectedGuest.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-[3px] font-medium ${
                        selectedGuest.status === "VIP"
                          ? "bg-[#dba617] text-black"
                          : selectedGuest.status === "Returning"
                          ? "bg-[#72aee6] text-[#1d2327]"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {selectedGuest.status === "VIP" && <Crown size={11} />}
                      {selectedGuest.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-white/70">Guest Profile & Stay Timeline</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuest(null)}
                className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Contact & Lifetime Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#f6f7f7] border border-[#c3c4c7] p-3.5 space-y-2">
                  <h4 className="text-[12px] font-semibold uppercase text-[#50575e] tracking-wider">Contact Information</h4>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex items-center gap-2 text-[#3c434a]">
                      <Mail size={14} className="text-[#8c8f94]" />
                      <a href={`mailto:${selectedGuest.email}`} className="text-[#2271b1] hover:underline">
                        {selectedGuest.email || "N/A"}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-[#3c434a]">
                      <Phone size={14} className="text-[#8c8f94]" />
                      <span>{selectedGuest.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f6f7f7] border border-[#c3c4c7] p-3.5 space-y-2">
                  <h4 className="text-[12px] font-semibold uppercase text-[#50575e] tracking-wider">Lifetime Statistics</h4>
                  <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <div>
                      <span className="text-[#8c8f94] block text-[11px]">Total Revenue</span>
                      <strong className="text-[#00a32a] text-[15px]">${selectedGuest.totalSpent.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[#8c8f94] block text-[11px]">Total Stays</span>
                      <strong className="text-[#1d2327] text-[15px]">{selectedGuest.totalBookings}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Guest Notes & Preferences */}
              {selectedGuest.notes.length > 0 && (
                <div className="bg-[#fff8e5] border-l-4 border-[#dba617] p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#8a6d3b] font-semibold text-[13px]">
                    <FileText size={15} />
                    <span>Special Requests & Guest Notes</span>
                  </div>
                  <ul className="list-disc list-inside text-[13px] text-[#66512c] space-y-1 pl-1">
                    {selectedGuest.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Booking History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#1d2327] flex items-center gap-2">
                    <Calendar size={16} className="text-[#2271b1]" />
                    <span>Complete Reservation History ({selectedGuest.bookings.length})</span>
                  </h3>
                </div>

                <div className="border border-[#c3c4c7] divide-y divide-[#c3c4c7]">
                  {selectedGuest.bookings.map((booking) => (
                    <div key={booking.id} className="p-3.5 bg-white hover:bg-[#f9f9f9] transition-colors space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-[13.5px] text-[#1d2327] flex items-center gap-2">
                            <BedDouble size={14} className="text-[#2271b1]" />
                            <span>{booking.roomTitle}</span>
                          </div>
                          <div className="text-[12px] text-[#50575e] mt-0.5">
                            {booking.checkIn} &rarr; {booking.checkOut} ({booking.totalNights} {booking.totalNights === 1 ? "night" : "nights"})
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-semibold text-[14px] text-[#1d2327] block">
                            ${booking.totalAmount?.toLocaleString() || 0}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.2 text-[10.5px] rounded-[2px] font-medium uppercase border ${
                              booking.status === "confirmed"
                                ? "bg-[#edfaef] text-[#00a32a] border-[#00a32a]/20"
                                : booking.status === "cancelled"
                                ? "bg-[#fcf0f1] text-[#d63638] border-[#d63638]/20"
                                : "bg-[#fcf0e0] text-[#d16400] border-[#d16400]/20"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      {booking.notes && (
                        <p className="text-[12px] text-[#646970] italic bg-[#f0f0f1] px-2.5 py-1 rounded-[2px]">
                          Note: &ldquo;{booking.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#f6f7f7] border-t border-[#c3c4c7] px-6 py-3 flex items-center justify-between">
              <span className="text-[12px] text-[#50575e]">
                Guest ID: <code className="bg-white px-1.5 py-0.5 border border-[#c3c4c7] text-[#1d2327]">{selectedGuest.id.slice(0, 8)}</code>
              </span>
              <button
                onClick={() => setSelectedGuest(null)}
                className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-[13px] font-medium rounded-[3px] transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
