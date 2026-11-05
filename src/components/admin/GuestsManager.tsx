"use client";

import { useState, useMemo } from "react";
import { 
  Users, 
  Crown, 
  Repeat, 
  Search, 
  Download, 
  Mail, 
  Phone, 
  Calendar, 
  X, 
  Eye, 
  BedDouble, 
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
    const headers = ["Name", "Email", "Phone", "Status", "Total Stays", "Total Spent (PKR)", "First Stay", "Last Stay"];
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">Guest directory</h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Registered guest profiles, VIP recognition, and stay history.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total profiles</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center shrink-0">
              <Users size={15} className="text-zinc-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-zinc-900 tracking-tight tabular-nums">{totalGuestsCount}</div>
            <div className="text-xs mt-1 text-zinc-500 font-medium">Verified hotel guests</div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">VIP guests</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
              <Crown size={15} className="text-amber-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-zinc-900 tracking-tight tabular-nums">{vipCount}</div>
            <div className="text-xs mt-1 text-amber-600 font-medium">Top-tier loyalty tier</div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Repeat guest rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0">
              <Repeat size={15} className="text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-zinc-900 tracking-tight tabular-nums">{repeatRate}%</div>
            <div className="text-xs mt-1 text-emerald-600 font-medium">{returningCount} returning guests</div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Average spend</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-zinc-600">PKR</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-zinc-900 tracking-tight tabular-nums">PKR {avgLtv.toLocaleString()}</div>
            <div className="text-xs mt-1 text-zinc-500 font-medium">Per guest profile</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs">
        {/* Toolbar & Filter Bar */}
        <div className="p-4 border-b border-zinc-200/80 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Status Tabs */}
          <div className="inline-flex p-1 bg-zinc-100 rounded-lg self-start">
            {(["All", "VIP", "Returning", "New"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  statusFilter === tab
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-white border border-zinc-200 rounded-lg pl-9 pr-7 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 bg-white border border-zinc-200 rounded-lg px-2.5 text-xs text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer"
            >
              <option value="recent">Sort: Most recent</option>
              <option value="spent">Sort: Highest spend</option>
              <option value="bookings">Sort: Most stays</option>
              <option value="name">Sort: Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Guests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 border-b border-zinc-200/80 text-zinc-500 font-medium">
              <tr>
                <th className="px-4 py-3">Guest profile</th>
                <th className="px-4 py-3">Contact details</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Total stays</th>
                <th className="px-4 py-3 text-right">Lifetime spend</th>
                <th className="px-4 py-3">Last stay</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80 bg-white">
              {filteredGuests.map((guest) => {
                const tierStyle = 
                  guest.status === "VIP" 
                    ? "bg-amber-50 text-amber-800 border-amber-200/70"
                    : guest.status === "Returning"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200/70"
                    : "bg-zinc-100 text-zinc-700 border-zinc-200/70";

                return (
                  <tr
                    key={guest.id}
                    className="hover:bg-zinc-50/60 transition-colors cursor-pointer group"
                    onClick={() => setSelectedGuest(guest)}
                  >
                    {/* Guest Name & Avatar */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center font-medium text-[11px] shrink-0">
                          {getInitials(guest.name)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-zinc-900 group-hover:text-zinc-950 transition-colors block truncate">
                            {guest.name}
                          </span>
                          {guest.notes.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium mt-0.5">
                              <FileText size={11} /> {guest.notes.length} {guest.notes.length > 1 ? "notes" : "note"}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact info */}
                    <td className="px-4 py-3.5 align-middle text-zinc-600">
                      <div className="space-y-0.5 text-[11.5px]">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-zinc-400 shrink-0" />
                          <span className="truncate">{guest.email || "No email"}</span>
                        </div>
                        {guest.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-500 tabular-nums">
                            <Phone size={12} className="text-zinc-400 shrink-0" />
                            <span>{guest.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 align-middle">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md font-medium border ${tierStyle}`}>
                        {guest.status === "VIP" && <Crown size={11} className="text-amber-600" />}
                        {guest.status}
                      </span>
                    </td>

                    {/* Total Stays */}
                    <td className="px-4 py-3.5 align-middle font-medium text-zinc-900 tabular-nums">
                      {guest.totalBookings} {guest.totalBookings === 1 ? "stay" : "stays"}
                    </td>

                    {/* Total Spend */}
                    <td className="px-4 py-3.5 align-middle text-right font-medium text-zinc-900 tabular-nums">
                      PKR {guest.totalSpent.toLocaleString()}
                    </td>

                    {/* Last Stay */}
                    <td className="px-4 py-3.5 align-middle text-zinc-500 tabular-nums">
                      {guest.lastStay ? new Date(guest.lastStay).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3.5 align-middle text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGuest(guest);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 font-medium px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                    No guest profiles match the current filter or search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest Details Modal */}
      {selectedGuest && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedGuest(null)}
        >
          <div 
            className="bg-white w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl border border-zinc-200 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-medium text-xs">
                  {getInitials(selectedGuest.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-zinc-900">{selectedGuest.name}</h2>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700">
                      {selectedGuest.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">Guest profile & history</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuest(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Contact info grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">Email</div>
                  <div className="font-medium text-zinc-900 mt-0.5 truncate">{selectedGuest.email || "N/A"}</div>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">Phone</div>
                  <div className="font-medium text-zinc-900 mt-0.5 tabular-nums">{selectedGuest.phone || "N/A"}</div>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">Lifetime revenue</div>
                  <div className="font-medium text-zinc-900 mt-0.5 tabular-nums">PKR {selectedGuest.totalSpent.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">Total stays</div>
                  <div className="font-medium text-zinc-900 mt-0.5 tabular-nums">{selectedGuest.totalBookings}</div>
                </div>
              </div>

              {/* Guest Notes */}
              {selectedGuest.notes.length > 0 && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <FileText size={13} />
                    <span>Special requests & guest notes</span>
                  </div>
                  <ul className="list-disc list-inside text-amber-800 space-y-0.5 pl-1">
                    {selectedGuest.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reservation History */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-900">
                  Reservation history ({selectedGuest.bookings.length})
                </h3>
                <div className="border border-zinc-200/80 rounded-lg divide-y divide-zinc-200/80 overflow-hidden text-xs">
                  {selectedGuest.bookings.map((booking) => (
                    <div key={booking.id} className="p-3 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-between">
                      <div>
                        <div className="font-medium text-zinc-900">{booking.roomTitle}</div>
                        <div className="text-[11px] text-zinc-500 tabular-nums">
                          {booking.checkIn} &rarr; {booking.checkOut} ({booking.totalNights} {booking.totalNights === 1 ? "night" : "nights"})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-zinc-900 tabular-nums">PKR {Number(booking.totalAmount || 0).toLocaleString()}</div>
                        <span className="text-[10px] text-zinc-500 capitalize">{booking.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedGuest(null)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
