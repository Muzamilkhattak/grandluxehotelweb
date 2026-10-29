"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { 
  createBookingAction, 
  checkRoomAvailabilityAction, 
  getRoomBookedDatesAction 
} from "@/app/actions/booking";
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
  CheckCircle,
  AlertTriangle
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
  initialCheckIn?: string;
  initialCheckOut?: string;
};

export default function BookingModal({ 
  room, 
  isOpen, 
  onClose,
  initialCheckIn = "",
  initialCheckOut = ""
}: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [isCheckingDates, setIsCheckingDates] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [availability, setAvailability] = useState<{ checked: boolean; available: boolean; message?: string } | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<{ check_in: string; check_out: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        setSessionLoaded(true);
      });

      if (room?.id) {
        getRoomBookedDatesAction(room.id).then((dates) => {
          if (dates && dates.length > 0) {
            setUpcomingBookings(dates);
          }
        });
      }

      if (initialCheckIn && initialCheckOut) {
        setCheckIn(initialCheckIn);
        setCheckOut(initialCheckOut);
        verifyDates(initialCheckIn, initialCheckOut);
      }
    }
  }, [isOpen, room?.id, initialCheckIn, initialCheckOut]);

  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];

  const verifyDates = async (inVal: string, outVal: string) => {
    if (!inVal || !outVal) {
      setAvailability(null);
      return;
    }
    const start = new Date(inVal);
    const end = new Date(outVal);
    if (end <= start) {
      setAvailability(null);
      return;
    }

    setIsCheckingDates(true);
    try {
      const res = await checkRoomAvailabilityAction(room.id, inVal, outVal);
      if (!res.available) {
        setAvailability({ checked: true, available: false, message: res.error });
      } else {
        setAvailability({ checked: true, available: true, message: "Suite is available for your dates!" });
      }
    } catch {
      // fallback
    } finally {
      setIsCheckingDates(false);
    }
  };

  const handleDateChange = (type: "in" | "out", value: string) => {
    let newIn = checkIn;
    let newOut = checkOut;

    if (type === "in") {
      newIn = value;
      setCheckIn(value);
      if (checkOut && new Date(value) >= new Date(checkOut)) {
        newOut = "";
        setCheckOut("");
        setAvailability(null);
      }
    } else {
      newOut = value;
      setCheckOut(value);
    }

    setMessage(null);

    if (newIn && newOut && new Date(newOut) > new Date(newIn)) {
      verifyDates(newIn, newOut);
    } else {
      setAvailability(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const guestName = formData.get("guestName") as string;
    const guestEmail = formData.get("guestEmail") as string;
    const guestPhone = formData.get("guestPhone") as string;
    const currentIn = checkIn || (formData.get("checkIn") as string);
    const currentOut = checkOut || (formData.get("checkOut") as string);

    if (!currentIn || !currentOut) {
      setMessage({ type: "error", text: "Please select both check-in and check-out dates." });
      setLoading(false);
      return;
    }

    if (new Date(currentOut) <= new Date(currentIn)) {
      setMessage({ type: "error", text: "Check-out date must be strictly after the check-in date." });
      setLoading(false);
      return;
    }

    // Verify availability one last time before submitting
    const checkRes = await checkRoomAvailabilityAction(room.id, currentIn, currentOut);
    if (!checkRes.available) {
      setAvailability({ checked: true, available: false, message: checkRes.error });
      setMessage({ 
        type: "error", 
        text: checkRes.error || `This room is not available for ${currentIn} to ${currentOut}. It is already booked.` 
      });
      setLoading(false);
      return;
    }

    const payload = {
      roomId: room.id,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: currentIn,
      checkOut: currentOut,
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
      if (res.error?.toLowerCase().includes("booked") || res.error?.toLowerCase().includes("not available")) {
        setAvailability({ checked: true, available: false, message: res.error });
      }
      setLoading(false);
    }
  };

  const isUnavailable = availability?.checked && !availability?.available;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-white border-2 border-[#000000] shadow-2xl rounded-none overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Luxury Accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#000000] via-[#d7b56d] to-[#000000]" />

        <div className="p-6 md:p-8">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-[#000000]/60 hover:text-[#000000] p-1.5 transition-colors cursor-pointer"
          >
            <X size={22} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FFFFFF] text-[#d7b56d] border border-[#d7b56d]/30 text-[11px] font-jost font-semibold uppercase tracking-widest">
              <Sparkles size={11} className="text-[#d7b56d]" /> Signature Art Hotel Reservation
            </span>
          </div>

          <h2 className="font-marcellus text-2xl md:text-3xl text-[#000000] font-medium leading-tight mb-1">
            Reserve {room.title}
          </h2>
          <p className="font-jost text-[#000000] font-semibold text-[15px] mb-6">
            ${room.price_per_night} <span className="text-[13px] font-normal text-[#000000] uppercase">/ night</span>
          </p>

          {message && (
            <div className={`p-4 mb-6 text-[14px] font-jost border-2 flex items-center gap-2.5 ${
              message.type === 'success' 
                ? 'bg-[#F0FDF4] text-[#166534] border-[#22C55E]' 
                : 'bg-[#FEF2F2] text-[#991B1B] border-[#EF4444]'
            }`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} className="text-[#EF4444] shrink-0" />}
              <span className="leading-snug">{message.text}</span>
            </div>
          )}

          {!sessionLoaded ? (
            <div className="py-12 flex justify-center">
              <Loader2 size={24} className="animate-spin text-[#d7b56d]" />
            </div>
          ) : !user ? (
            <div className="py-10 text-center border-t border-[#d7b56d]">
              <Lock size={32} className="mx-auto text-[#d7b56d] mb-4 opacity-70" />
              <h3 className="font-marcellus text-xl text-[#000000] mb-2">Login Required</h3>
              <p className="font-jost text-[#000000] mb-6 text-[14px]">You must be logged in to your account to reserve a suite.</p>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 bg-[#000000] hover:bg-[#d7b56d] text-white font-jost font-semibold uppercase tracking-[0.18em] text-[13px] py-3.5 px-8 transition-colors duration-300"
              >
                Sign In / Create Account
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
                <User size={13} className="text-[#d7b56d]" />
                Guest Full Name <span className="text-[#d7b56d]">*</span>
              </label>
              <input 
                name="guestName" 
                type="text" 
                required 
                defaultValue={user.user_metadata?.full_name || ""}
                placeholder="e.g. Eleanor Vance"
                className="w-full bg-[#FFFFFF] border-2 border-[#000000]/25 hover:border-[#000000]/60 focus:border-[#d7b56d] focus:bg-white px-4 py-3 text-[14.5px] font-jost text-[#000000] font-medium placeholder:text-[#000000] focus:outline-none focus:ring-1 focus:ring-[#d7b56d] transition-all rounded-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
                  <Mail size={13} className="text-[#d7b56d]" />
                  Email Address <span className="text-[#d7b56d]">*</span>
                </label>
                <input 
                  name="guestEmail" 
                  type="email" 
                  required 
                  defaultValue={user.email || ""}
                  readOnly
                  placeholder="eleanor@example.com"
                  className="w-full bg-[#FFFFFF] border-2 border-[#000000]/15 px-4 py-3 text-[14.5px] font-jost text-[#000000] font-medium focus:outline-none rounded-none cursor-not-allowed opacity-80"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
                  <Phone size={13} className="text-[#d7b56d]" />
                  Phone Number <span className="text-[#d7b56d]">*</span>
                </label>
                <input 
                  name="guestPhone" 
                  type="tel" 
                  required 
                  defaultValue={user.user_metadata?.phone || ""}
                  placeholder="+47 22 00 00 00"
                  className="w-full bg-[#FFFFFF] border-2 border-[#000000]/25 hover:border-[#000000]/60 focus:border-[#d7b56d] focus:bg-white px-4 py-3 text-[14.5px] font-jost text-[#000000] font-medium placeholder:text-[#000000] focus:outline-none focus:ring-1 focus:ring-[#d7b56d] transition-all rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-[#d7b56d]" />
                  Check-In <span className="text-[#d7b56d]">*</span>
                </label>
                <input 
                  name="checkIn" 
                  type="date" 
                  required 
                  min={today}
                  value={checkIn}
                  onChange={(e) => handleDateChange("in", e.target.value)}
                  className={`w-full bg-[#FFFFFF] border-2 ${
                    isUnavailable ? "border-red-500 bg-red-50/50" : "border-[#000000]/25"
                  } hover:border-[#000000]/60 focus:border-[#d7b56d] focus:bg-white px-4 py-3 text-[14px] font-jost text-[#000000] font-semibold focus:outline-none focus:ring-1 focus:ring-[#d7b56d] transition-all rounded-none cursor-pointer`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-[#d7b56d]" />
                  Check-Out <span className="text-[#d7b56d]">*</span>
                </label>
                <input 
                  name="checkOut" 
                  type="date" 
                  required 
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => handleDateChange("out", e.target.value)}
                  className={`w-full bg-[#FFFFFF] border-2 ${
                    isUnavailable ? "border-red-500 bg-red-50/50" : "border-[#000000]/25"
                  } hover:border-[#000000]/60 focus:border-[#d7b56d] focus:bg-white px-4 py-3 text-[14px] font-jost text-[#000000] font-semibold focus:outline-none focus:ring-1 focus:ring-[#d7b56d] transition-all rounded-none cursor-pointer`}
                />
              </div>
            </div>

            {/* Availability Status Indicators */}
            {isCheckingDates && (
              <div className="flex items-center gap-2 text-[12.5px] font-jost text-[#000000]/70 py-1">
                <Loader2 size={14} className="animate-spin text-[#d7b56d]" />
                <span>Checking room availability...</span>
              </div>
            )}

            {isUnavailable && (
              <div className="bg-[#FEF2F2] border-2 border-[#EF4444] p-3 text-[13px] font-jost text-[#991B1B] rounded-none flex items-start gap-2 shadow-xs">
                <AlertTriangle size={17} className="text-[#EF4444] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[13.5px]">Not Available on Selected Dates</strong>
                  <p className="text-[12.5px] text-[#7F1D1D] mt-0.5 leading-snug">
                    This suite is already booked for <strong>{checkIn}</strong> to <strong>{checkOut}</strong>. Please select different dates.
                  </p>
                </div>
              </div>
            )}

            {availability?.checked && availability.available && (
              <div className="bg-[#F0FDF4] border border-[#22C55E]/40 p-2.5 text-[12.5px] font-jost text-[#166534] rounded-none flex items-center gap-2">
                <CheckCircle size={15} className="text-[#16A34A] shrink-0" />
                <span>Suite is available for your dates!</span>
              </div>
            )}

            {/* Upcoming Booked Ranges Notice */}
            {upcomingBookings.length > 0 && (
              <div className="bg-[#FFFFFF] border border-[#d7b56d] p-2.5 text-[11px] font-jost text-[#000000]">
                <span className="font-semibold text-[#000000] block mb-1 uppercase tracking-wider text-[10px]">
                  Upcoming Booked Dates:
                </span>
                <div className="flex flex-wrap gap-1">
                  {upcomingBookings.slice(0, 3).map((b, i) => (
                    <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 text-[10.5px]">
                      {b.check_in} &rarr; {b.check_out}
                    </span>
                  ))}
                  {upcomingBookings.length > 3 && (
                    <span className="text-[10px] text-gray-500 self-center">
                      +{upcomingBookings.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || isCheckingDates || isUnavailable}
              className={`mt-2 w-full font-jost font-bold uppercase tracking-[0.18em] text-[13.5px] py-4.5 transition-all duration-300 shadow-md flex items-center justify-center gap-2 rounded-none ${
                isUnavailable
                  ? "bg-[#991B1B]/80 text-white cursor-not-allowed opacity-80"
                  : "bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white cursor-pointer disabled:opacity-70"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Confirming Suite...</span>
                </>
              ) : isUnavailable ? (
                <span>Not Available on Selected Dates</span>
              ) : (
                <>
                  <span>Confirm Reservation</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div className="mt-2 text-center text-[11px] font-jost text-[#000000] flex items-center justify-center gap-2">
              <Lock size={12} className="text-[#d7b56d]" />
              <span>Instant Confirmation • No Booking Fees</span>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
