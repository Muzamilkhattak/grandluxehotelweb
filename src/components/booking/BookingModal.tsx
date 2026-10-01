"use client";

import { useState } from "react";
import { createBookingAction } from "@/app/actions/booking";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar as CalendarIcon, 
  Sparkles, 
  ArrowRight,
  Loader2,
  Lock,
  CheckCircle
} from "lucide-react";

type Room = {
  id: string;
  title: string;
  price_per_night: number;
};

type BookingModalProps = {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
};

export default function BookingModal({ room, isOpen, onClose }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      roomId: room.id,
      guestName: formData.get("guestName") as string,
      guestEmail: formData.get("guestEmail") as string,
      guestPhone: formData.get("guestPhone") as string,
      checkIn: formData.get("checkIn") as string,
      checkOut: formData.get("checkOut") as string,
    };

    const res = await createBookingAction(payload);

    if (res.success) {
      setMessage({ type: "success", text: "Reservation Confirmed. Preparing your luxury suite..." });
      setTimeout(() => {
        onClose();
        setLoading(false);
        setMessage(null);
      }, 2200);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to create booking." });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-white border-2 border-[#362618] shadow-2xl rounded-none overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Luxury Accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#362618] via-[#C97A4F] to-[#362618]" />

        <div className="p-6 md:p-8">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-[#362618]/60 hover:text-[#362618] p-1.5 transition-colors cursor-pointer"
          >
            <X size={22} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F4EBE1] text-[#A0522D] border border-[#C97A4F]/30 text-[11px] font-jost font-semibold uppercase tracking-widest">
              <Sparkles size={11} className="text-[#C97A4F]" /> Oslo Elite Reservation
            </span>
          </div>

          <h2 className="font-marcellus text-2xl md:text-3xl text-[#362618] font-medium leading-tight mb-1">
            Reserve {room.title}
          </h2>
          <p className="font-jost text-[#66584B] font-semibold text-[15px] mb-6">
            ${room.price_per_night} <span className="text-[13px] font-normal text-[#8C827A] uppercase">/ night</span>
          </p>

          {message && (
            <div className={`p-4 mb-6 text-[14px] font-jost border-2 flex items-center gap-2.5 ${
              message.type === 'success' 
                ? 'bg-[#F0FDF4] text-[#166534] border-[#22C55E]' 
                : 'bg-[#FEF2F2] text-[#991B1B] border-[#EF4444]'
            }`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <span>✕</span>}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-[#2A1D13] flex items-center gap-1.5">
                <User size={13} className="text-[#C97A4F]" />
                Guest Full Name <span className="text-[#C97A4F]">*</span>
              </label>
              <input 
                name="guestName" 
                type="text" 
                required 
                placeholder="e.g. Eleanor Vance"
                className="w-full bg-[#FCFBF9] border-2 border-[#362618]/25 hover:border-[#362618]/60 focus:border-[#C97A4F] focus:bg-white px-4 py-3 text-[14.5px] font-jost text-[#1D1712] font-medium placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#C97A4F] transition-all rounded-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-[#2A1D13] flex items-center gap-1.5">
                  <Mail size={13} className="text-[#C97A4F]" />
                  Email Address <span className="text-[#C97A4F]">*</span>
                </label>
                <input 
                  name="guestEmail" 
                  type="email" 
                  required 
                  placeholder="eleanor@example.com"
                  className="w-full bg-[#FCFBF9] border-2 border-[#362618]/25 hover:border-[#362618]/60 focus:border-[#C97A4F] focus:bg-white px-4 py-3 text-[14.5px] font-jost text-[#1D1712] font-medium placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#C97A4F] transition-all rounded-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-[#2A1D13] flex items-center gap-1.5">
                  <Phone size={13} className="text-[#C97A4F]" />
                  Phone Number <span className="text-[#C97A4F]">*</span>
                </label>
                <input 
                  name="guestPhone" 
                  type="tel" 
                  required 
                  placeholder="+47 22 00 00 00"
                  className="w-full bg-[#FCFBF9] border-2 border-[#362618]/25 hover:border-[#362618]/60 focus:border-[#C97A4F] focus:bg-white px-4 py-3 text-[14.5px] font-jost text-[#1D1712] font-medium placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#C97A4F] transition-all rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-[#2A1D13] flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-[#C97A4F]" />
                  Check-In <span className="text-[#C97A4F]">*</span>
                </label>
                <input 
                  name="checkIn" 
                  type="date" 
                  required 
                  min={today}
                  className="w-full bg-[#FCFBF9] border-2 border-[#362618]/25 hover:border-[#362618]/60 focus:border-[#C97A4F] focus:bg-white px-4 py-3 text-[14px] font-jost text-[#1D1712] font-semibold focus:outline-none focus:ring-1 focus:ring-[#C97A4F] transition-all rounded-none cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-[#2A1D13] flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-[#C97A4F]" />
                  Check-Out <span className="text-[#C97A4F]">*</span>
                </label>
                <input 
                  name="checkOut" 
                  type="date" 
                  required 
                  min={today}
                  className="w-full bg-[#FCFBF9] border-2 border-[#362618]/25 hover:border-[#362618]/60 focus:border-[#C97A4F] focus:bg-white px-4 py-3 text-[14px] font-jost text-[#1D1712] font-semibold focus:outline-none focus:ring-1 focus:ring-[#C97A4F] transition-all rounded-none cursor-pointer"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-3 w-full bg-[#C97A4F] hover:bg-[#362618] text-white font-jost font-bold uppercase tracking-[0.18em] text-[13.5px] py-4.5 transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer rounded-none disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Confirming Suite...</span>
                </>
              ) : (
                <>
                  <span>Confirm Reservation</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div className="mt-2 text-center text-[11px] font-jost text-[#8C827A] flex items-center justify-center gap-2">
              <Lock size={12} className="text-[#C97A4F]" />
              <span>Instant Confirmation • No Booking Fees</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
