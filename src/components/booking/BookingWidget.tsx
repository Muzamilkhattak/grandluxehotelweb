"use client";

import { useState, useRef } from "react";
import { createBookingAction } from "@/app/actions/booking";
import { 
  CheckCircle, 
  Calendar as CalendarIcon, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Loader2,
  Lock
} from "lucide-react";

export default function BookingWidget({ room }: { room: any }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkInRef = useRef<HTMLInputElement>(null);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalAmount = nights > 0 ? nights * room.price_per_night : 0;
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!checkIn || !checkOut || nights <= 0) {
      setError("Please select both check-in and check-out dates.");
      checkInRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      roomId: room.id,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
    };

    const result = await createBookingAction(payload);
    
    if (result.success) {
      setSuccess(true);
      setCheckIn("");
      setCheckOut("");
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
    } else {
      setError(result.error || "Failed to create booking.");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="bg-white border-2 border-[#362618] p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C97A4F]" />
        
        <div className="w-16 h-16 bg-[#F0FDF4] border-2 border-[#22C55E]/30 rounded-full flex items-center justify-center mx-auto mb-5 text-[#16A34A] shadow-inner">
          <CheckCircle size={34} strokeWidth={2.5} />
        </div>
        <h3 className="font-marcellus text-3xl text-[#362618] mb-2 font-medium">Reservation Secured</h3>
        <p className="font-jost text-[#4A4036] text-[15px] mb-8 max-w-xs mx-auto leading-relaxed">
          Your luxury suite has been reserved. A confirmation email and booking folio have been sent to your address.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="w-full bg-[#362618] hover:bg-[#C97A4F] text-[#FAF8F5] font-jost uppercase tracking-[0.2em] text-[13px] font-semibold py-4 transition-all duration-300 shadow-md cursor-pointer"
        >
          Book Another Room
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-[#362618] shadow-[0_12px_40px_rgba(54,38,24,0.12)] relative overflow-hidden">
      {/* Luxury Brand Top Accent */}
      <div className="h-1.5 bg-gradient-to-r from-[#362618] via-[#C97A4F] to-[#362618]" />

      <div className="p-6 md:p-8">
        {/* Header with Pricing & Best Rate Guarantee */}
        <div className="border-b-2 border-[#362618]/10 pb-6 mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4EBE1] text-[#A0522D] border border-[#C97A4F]/30 text-[11px] font-jost font-semibold uppercase tracking-widest rounded-none">
              <Sparkles size={12} className="text-[#C97A4F]" /> Direct Booking Rate
            </span>
            <span className="text-[12px] font-jost font-semibold text-[#008060] flex items-center gap-1">
              <ShieldCheck size={14} /> Best Price Guarantee
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[40px] font-marcellus text-[#362618] font-medium leading-none">
              ${room.price_per_night}
            </span>
            <span className="text-[14px] font-jost font-semibold text-[#66584B] uppercase tracking-wider">
              / Night
            </span>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B] text-[13.5px] font-jost p-3.5 mb-6 flex items-start gap-2 shadow-xs">
            <span className="font-bold text-[#DC2626]">✕</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Guest Full Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold font-jost uppercase tracking-wider text-[#2A1D13] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-[#C97A4F]" />
                Guest Full Name <span className="text-[#C97A4F] text-[14px]">*</span>
              </span>
            </label>
            <input 
              required 
              type="text" 
              name="guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="w-full bg-[#FCFBF9] border-2 border-[#362618]/25 hover:border-[#362618]/60 focus:border-[#C97A4F] focus:bg-white px-4 py-3 text-[14.5px] font-jost text-[#1D1712] font-medium placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#C97A4F] transition-all rounded-none" 
            />
          </div>
          
          {/* Email and Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold font-jost uppercase tracking-wider text-[#2A1D13] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-[#C97A4F]" />
                  Email Address <span className="text-[#C97A4F] text-[14px]">*</span>
                </span>
              </label>
              <input 
                required 
                type="email" 
                name="guestEmail"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="eleanor@example.com"
                className="w-full bg-[#FCFBF9] border-2 border-[#362618]/25 hover:border-[#362618]/60 focus:border-[#C97A4F] focus:bg-white px-4 py-3 text-[14.5px] font-jost text-[#1D1712] font-medium placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#C97A4F] transition-all rounded-none" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold font-jost uppercase tracking-wider text-[#2A1D13] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-[#C97A4F]" />
                  Phone Number <span className="text-[#C97A4F] text-[14px]">*</span>
                </span>
              </label>
              <input 
                required 
                type="tel" 
                name="guestPhone"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+47 22 00 00 00"
                className="w-full bg-[#FCFBF9] border-2 border-[#362618]/25 hover:border-[#362618]/60 focus:border-[#C97A4F] focus:bg-white px-4 py-3 text-[14.5px] font-jost text-[#1D1712] font-medium placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#C97A4F] transition-all rounded-none" 
              />
            </div>
          </div>

          {/* Check-In / Check-Out Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold font-jost uppercase tracking-wider text-[#2A1D13] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-[#C97A4F]" />
                  Check-In <span className="text-[#C97A4F] text-[14px]">*</span>
                </span>
              </label>
              <input 
                ref={checkInRef}
                required 
                type="date" 
                min={today} 
                value={checkIn} 
                onChange={(e) => setCheckIn(e.target.value)} 
                className="w-full bg-[#FCFBF9] border-2 border-[#362618]/25 hover:border-[#362618]/60 focus:border-[#C97A4F] focus:bg-white px-4 py-3 text-[14.5px] font-jost text-[#1D1712] font-semibold focus:outline-none focus:ring-1 focus:ring-[#C97A4F] transition-all rounded-none cursor-pointer" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold font-jost uppercase tracking-wider text-[#2A1D13] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-[#C97A4F]" />
                  Check-Out <span className="text-[#C97A4F] text-[14px]">*</span>
                </span>
              </label>
              <input 
                required 
                type="date" 
                min={checkIn || today} 
                value={checkOut} 
                onChange={(e) => setCheckOut(e.target.value)} 
                className="w-full bg-[#FCFBF9] border-2 border-[#362618]/25 hover:border-[#362618]/60 focus:border-[#C97A4F] focus:bg-white px-4 py-3 text-[14.5px] font-jost text-[#1D1712] font-semibold focus:outline-none focus:ring-1 focus:ring-[#C97A4F] transition-all rounded-none cursor-pointer" 
              />
            </div>
          </div>

          {/* Pricing Calculation Summary Box */}
          {nights > 0 ? (
            <div className="bg-[#FAF7F2] border-2 border-[#C97A4F]/30 p-4 mt-2 transition-all">
              <div className="flex justify-between font-jost text-[14px] text-[#4A4036] font-medium mb-2">
                <span>${room.price_per_night} &times; {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span className="font-semibold text-[#2A1D13]">${totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-jost text-[14px] text-[#4A4036] font-medium mb-3 pb-3 border-b border-[#362618]/15">
                <span>Taxes & Service Fees</span>
                <span className="text-[#008060] font-semibold">Included</span>
              </div>
              <div className="flex justify-between items-baseline font-marcellus text-[22px] text-[#362618]">
                <span>Total Stay Cost</span>
                <span className="text-[24px] font-bold text-[#C97A4F]">${totalAmount.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF7F2] border border-dashed border-[#362618]/25 p-3.5 text-center text-[12.5px] font-jost text-[#66584B]">
              Select check-in & check-out dates to calculate total reservation cost
            </div>
          )}

          {/* Primary Action Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4.5 px-6 font-jost uppercase tracking-[0.18em] text-[14px] font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 rounded-none mt-2 cursor-pointer ${
              nights > 0
                ? "bg-[#C97A4F] hover:bg-[#362618] text-white hover:shadow-lg active:scale-[0.99]"
                : "bg-[#362618] hover:bg-[#C97A4F] text-white"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin text-white" />
                <span>Securing Your Suite...</span>
              </>
            ) : nights > 0 ? (
              <>
                <span>Confirm & Reserve Suite</span>
                <ArrowRight size={17} />
              </>
            ) : (
              <>
                <span>Select Dates & Reserve</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>

          {/* Trust Badges & Highlights */}
          <div className="pt-2 border-t border-[#362618]/10 flex flex-col gap-1.5 text-center text-[11px] font-jost font-medium text-[#66584B] tracking-wide">
            <div className="flex items-center justify-center gap-4 text-[#362618]">
              <span className="flex items-center gap-1"><Lock size={12} className="text-[#C97A4F]" /> 256-Bit SSL Secure</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Sparkles size={12} className="text-[#C97A4F]" /> Free Valet Included</span>
            </div>
            <span className="text-[#8C827A] text-[10.5px]">No credit card pre-charge required • Pay upon arrival</span>
          </div>
        </form>
      </div>
    </div>
  );
}
