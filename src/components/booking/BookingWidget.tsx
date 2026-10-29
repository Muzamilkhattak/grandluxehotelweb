"use client";

import { useState, useRef, useEffect } from "react";
import { 
  createBookingAction, 
  checkRoomAvailabilityAction, 
  getRoomBookedDatesAction 
} from "@/app/actions/booking";
import { 
  CheckCircle, 
  AlertTriangle,
  Calendar as CalendarIcon, 
  User, 
  Mail, 
  Phone, 
  ChevronDown,
  Loader2,
  Sparkles,
  Lock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingWidget({ room }: { room: any }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState("1");
  const [childrenCount, setChildrenCount] = useState("0");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [showGuestDetails, setShowGuestDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCheckingDates, setIsCheckingDates] = useState(false);
  const [availability, setAvailability] = useState<{ checked: boolean; available: boolean; message?: string } | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<{ check_in: string; check_out: string }[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkInRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (room?.id) {
      getRoomBookedDatesAction(room.id).then((dates) => {
        if (dates && dates.length > 0) {
          setUpcomingBookings(dates);
        }
      });
    }
  }, [room?.id]);

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

  const verifyAvailability = async (inVal: string, outVal: string) => {
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
    setError(null);
    try {
      const res = await checkRoomAvailabilityAction(room.id, inVal, outVal);
      if (!res.available) {
        setAvailability({ checked: true, available: false, message: res.error });
        setError(res.error || "This room is not available for the selected dates.");
        setShowGuestDetails(false);
      } else {
        setAvailability({ checked: true, available: true, message: "Suite is available for your dates!" });
        setError(null);
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
    setError(null);

    if (newIn && newOut && new Date(newOut) > new Date(newIn)) {
      verifyAvailability(newIn, newOut);
    } else {
      setAvailability(null);
    }
  };

  const handleCheckAvailability = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates.");
      checkInRef.current?.focus();
      return;
    }
    if (nights <= 0) {
      setError("Check-out date must be strictly after the check-in date.");
      return;
    }

    setIsCheckingDates(true);
    const res = await checkRoomAvailabilityAction(room.id, checkIn, checkOut);
    setIsCheckingDates(false);

    if (!res.available) {
      setAvailability({ checked: true, available: false, message: res.error });
      setError(res.error || "This room is not available for the selected dates.");
      setShowGuestDetails(false);
      return;
    }

    setAvailability({ checked: true, available: true, message: "Suite is available for your dates!" });
    setError(null);
    setShowGuestDetails(true);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!checkIn || !checkOut || nights <= 0) {
      setError("Please select both check-in and check-out dates.");
      checkInRef.current?.focus();
      return;
    }

    // Final availability gate
    setIsCheckingDates(true);
    const checkRes = await checkRoomAvailabilityAction(room.id, checkIn, checkOut);
    setIsCheckingDates(false);

    if (!checkRes.available) {
      setAvailability({ checked: true, available: false, message: checkRes.error });
      setError(checkRes.error || "This room is not available for the selected dates. Please choose different dates.");
      setShowGuestDetails(false);
      return;
    }

    if (!showGuestDetails) {
      setShowGuestDetails(true);
      return;
    }

    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setError("Please fill in your name, email, and phone number to secure the reservation.");
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
      notes: `Adults: ${adults}, Children: ${childrenCount}`,
    };

    const result = await createBookingAction(payload);
    
    if (result.success) {
      setSuccess(true);
      setCheckIn("");
      setCheckOut("");
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setShowGuestDetails(false);
      setAvailability(null);
    } else {
      setError(result.error || "Failed to create booking.");
      if (result.error?.toLowerCase().includes("booked") || result.error?.toLowerCase().includes("not available")) {
        setAvailability({ checked: true, available: false, message: result.error });
        setShowGuestDetails(false);
      }
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="bg-[#000000] border border-[#d7b56d]/30 rounded-[24px] p-8 text-center shadow-[0_20px_50px_rgba(25,16,10,0.35)] relative overflow-hidden text-[#FFFFFF]">
        <div className="w-16 h-16 bg-[#FFFFFF]/10 border border-[#d7b56d]/40 rounded-full flex items-center justify-center mx-auto mb-5 text-[#d7b56d] shadow-inner">
          <CheckCircle size={36} strokeWidth={2.2} />
        </div>
        <h3 className="font-marcellus text-3xl text-[#FFFFFF] mb-2 font-normal">Reservation Confirmed</h3>
        <p className="font-jost text-[#FFFFFF]/80 text-[15px] mb-8 max-w-xs mx-auto leading-relaxed">
          Your luxury suite has been reserved. A confirmation email and booking details have been sent to your email.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="w-full bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white font-jost text-[15px] font-semibold py-3.5 rounded-[20px] transition-all duration-300 shadow-md cursor-pointer"
        >
          Book Another Room
        </button>
      </div>
    );
  }

  const isUnavailable = availability?.checked && !availability?.available;

  return (
    <div className="bg-[#000000] border border-[#d7b56d]/30 rounded-[24px] shadow-[0_20px_50px_rgba(25,16,10,0.35)] p-6 md:p-8 text-[#FFFFFF] relative">
      {/* Form Header */}
      <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-[#FFFFFF]/10">
        <div>
          <h3 className="font-marcellus text-[24px] md:text-[26px] text-[#FFFFFF] font-normal leading-tight">
            Reservation Form
          </h3>
          <p className="text-[12px] font-jost text-[#FFFFFF]/60 mt-1">
            Best rate guaranteed • Free cancellation
          </p>
        </div>
        <div className="text-right">
          <div className="font-marcellus text-[26px] md:text-[28px] text-[#FFFFFF] leading-none">
            ${room.price_per_night}
          </div>
          <div className="text-[11px] font-jost uppercase tracking-wider text-[#FFFFFF]/60 mt-1">
            / night
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#5A231F] border border-[#EF4444]/60 text-[#FEE2E2] text-[13px] font-jost p-3.5 rounded-[12px] mb-5 flex items-start gap-2.5 shadow-sm">
          <AlertTriangle size={18} className="text-[#F87171] shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Real-time Availability Feedback */}
      {isCheckingDates && (
        <div className="bg-[#000000] border border-[#d7b56d]/30 text-[#d7b56d] text-[12.5px] font-jost px-3.5 py-2.5 rounded-[12px] mb-4 flex items-center gap-2">
          <Loader2 size={15} className="animate-spin text-[#d7b56d]" />
          <span>Verifying room schedule availability...</span>
        </div>
      )}

      {availability?.checked && availability.available && (
        <div className="bg-[#14532D]/90 border border-[#4ADE80]/50 text-[#DCFCE7] text-[13px] font-jost px-3.5 py-2.5 rounded-[12px] mb-4 flex items-center gap-2 shadow-xs">
          <CheckCircle size={16} className="text-[#4ADE80] shrink-0" />
          <span className="font-medium">Room is available for {checkIn} to {checkOut}!</span>
        </div>
      )}

      {isUnavailable && (
        <div className="bg-[#78231C] border-2 border-[#EF4444] text-[#FEE2E2] text-[13px] font-jost p-4 rounded-[14px] mb-4 shadow-md">
          <div className="flex items-center gap-2 font-semibold text-white text-[14px] mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
            Not Available on Selected Dates
          </div>
          <p className="text-[#FEE2E2]/90 leading-relaxed text-[12.5px]">
            This suite is already reserved from <strong>{checkIn}</strong> to <strong>{checkOut}</strong>. Please select different dates or explore other suites.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Check-in Date */}
        <div>
          <label className="block text-[13.5px] font-jost font-medium text-[#FFFFFF] mb-1.5">
            Check-in Date <span className="text-[#d7b56d] ml-0.5">*</span>
          </label>
          <div className="relative">
            <input 
              ref={checkInRef}
              required 
              type="date" 
              min={today} 
              value={checkIn} 
              onChange={(e) => handleDateChange("in", e.target.value)} 
              className={`w-full bg-white text-[#000000] font-jost text-[14.5px] px-4 py-3 rounded-[12px] border ${
                isUnavailable ? "border-red-500 ring-2 ring-red-400" : "border-[#d7b56d]"
              } focus:outline-none focus:ring-2 focus:ring-[#d7b56d] shadow-xs cursor-pointer font-medium`}
              placeholder="Check-in Date"
            />
          </div>
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-[13.5px] font-jost font-medium text-[#FFFFFF] mb-1.5">
            Check-out Date <span className="text-[#d7b56d] ml-0.5">*</span>
          </label>
          <div className="relative">
            <input 
              required 
              type="date" 
              min={checkIn || today} 
              value={checkOut} 
              onChange={(e) => handleDateChange("out", e.target.value)} 
              className={`w-full bg-white text-[#000000] font-jost text-[14.5px] px-4 py-3 rounded-[12px] border ${
                isUnavailable ? "border-red-500 ring-2 ring-red-400" : "border-[#d7b56d]"
              } focus:outline-none focus:ring-2 focus:ring-[#d7b56d] shadow-xs cursor-pointer font-medium`}
              placeholder="Check-out Date"
            />
          </div>
        </div>

        {/* Upcoming Booked Ranges (Convenience info for guest) */}
        {upcomingBookings.length > 0 && (
          <div className="bg-[#000000]/80 border border-[#FFFFFF]/10 rounded-[12px] p-3 text-[11.5px] font-jost text-[#FFFFFF]/70">
            <span className="font-semibold text-[#d7b56d] block mb-1.5 uppercase tracking-wider text-[10.5px]">
              Currently Reserved Dates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {upcomingBookings.slice(0, 4).map((b, i) => (
                <span key={i} className="bg-red-950/70 text-red-200 border border-red-800/40 px-2 py-0.5 rounded text-[11px]">
                  {b.check_in} &rarr; {b.check_out}
                </span>
              ))}
              {upcomingBookings.length > 4 && (
                <span className="text-[10px] text-[#FFFFFF]/50 self-center">
                  +{upcomingBookings.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Adults Dropdown */}
        <div>
          <label className="block text-[13.5px] font-jost font-medium text-[#FFFFFF] mb-1.5">
            Adults
          </label>
          <div className="relative">
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full bg-white text-[#000000] font-jost text-[14.5px] px-4 py-3 pr-10 rounded-[12px] border border-[#d7b56d] focus:outline-none focus:ring-2 focus:ring-[#d7b56d] shadow-xs cursor-pointer appearance-none font-medium"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d7b56d] pointer-events-none" />
          </div>
        </div>

        {/* Children Dropdown */}
        <div>
          <label className="block text-[13.5px] font-jost font-medium text-[#FFFFFF] mb-1.5">
            Children
          </label>
          <div className="relative">
            <select
              value={childrenCount}
              onChange={(e) => setChildrenCount(e.target.value)}
              className="w-full bg-white text-[#000000] font-jost text-[14.5px] px-4 py-3 pr-10 rounded-[12px] border border-[#d7b56d] focus:outline-none focus:ring-2 focus:ring-[#d7b56d] shadow-xs cursor-pointer appearance-none font-medium"
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3+</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d7b56d] pointer-events-none" />
          </div>
        </div>

        {/* Nights & Price Calculation Summary */}
        {nights > 0 && !isUnavailable && (
          <div className="bg-[#000000] border border-[#d7b56d]/30 rounded-[14px] p-4 my-1">
            <div className="flex justify-between items-center text-[13.5px] font-jost text-[#FFFFFF]/80 mb-1.5">
              <span>${room.price_per_night} &times; {nights} {nights === 1 ? 'night' : 'nights'}</span>
              <span className="font-semibold text-[#FFFFFF]">${totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] font-jost text-[#FFFFFF]/70 mb-2 pb-2 border-b border-[#FFFFFF]/10">
              <span>Taxes & Fees</span>
              <span className="text-[#86EFAC] font-medium">Included</span>
            </div>
            <div className="flex justify-between items-baseline font-marcellus">
              <span className="text-[17px] text-[#FFFFFF]">Total Cost:</span>
              <span className="text-[22px] font-semibold text-[#d7b56d]">${totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Guest Details Section (Expands smoothly when dates are selected and available) */}
        <AnimatePresence>
          {(showGuestDetails && !isUnavailable) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3.5 pt-2 border-t border-[#FFFFFF]/10 overflow-hidden"
            >
              <div className="flex items-center justify-between text-[12px] font-jost uppercase tracking-wider text-[#d7b56d] font-medium">
                <span>Guest Information</span>
                <span>Pay Upon Arrival</span>
              </div>

              <div>
                <label className="block text-[13px] font-jost font-medium text-[#FFFFFF] mb-1">
                  Guest Full Name <span className="text-[#d7b56d] ml-0.5">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-white text-[#000000] font-jost text-[14px] px-4 py-3 rounded-[12px] border border-[#d7b56d] focus:outline-none focus:ring-2 focus:ring-[#d7b56d] shadow-xs placeholder:text-stone-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-jost font-medium text-[#FFFFFF] mb-1">
                  Email Address <span className="text-[#d7b56d] ml-0.5">*</span>
                </label>
                <input 
                  required 
                  type="email" 
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="eleanor@example.com"
                  className="w-full bg-white text-[#000000] font-jost text-[14px] px-4 py-3 rounded-[12px] border border-[#d7b56d] focus:outline-none focus:ring-2 focus:ring-[#d7b56d] shadow-xs placeholder:text-stone-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-jost font-medium text-[#FFFFFF] mb-1">
                  Phone Number <span className="text-[#d7b56d] ml-0.5">*</span>
                </label>
                <input 
                  required 
                  type="tel" 
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+47 22 00 00 00"
                  className="w-full bg-white text-[#000000] font-jost text-[14px] px-4 py-3 rounded-[12px] border border-[#d7b56d] focus:outline-none focus:ring-2 focus:ring-[#d7b56d] shadow-xs placeholder:text-stone-400 font-medium"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <button 
          type="submit"
          onClick={!showGuestDetails ? handleCheckAvailability : undefined}
          disabled={loading || isCheckingDates || isUnavailable}
          className={`w-full mt-2 py-3.5 px-6 rounded-[22px] font-jost font-medium text-[16px] tracking-wide shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
            isUnavailable
              ? "bg-[#5A231F] text-[#FEE2E2]/70 cursor-not-allowed opacity-80 border border-red-700/50"
              : "bg-[#d7b56d] hover:bg-[#000000] active:scale-[0.99] text-[#000000] hover:text-white cursor-pointer"
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin text-white" />
              <span>Securing Reservation...</span>
            </>
          ) : isCheckingDates ? (
            <>
              <Loader2 size={18} className="animate-spin text-white" />
              <span>Checking Availability...</span>
            </>
          ) : isUnavailable ? (
            <span>Not Available on Selected Dates</span>
          ) : showGuestDetails ? (
            <>
              <span>Reserve Suite</span>
              <ArrowRight size={17} />
            </>
          ) : (
            <span>Check Availability</span>
          )}
        </button>

        {/* Security & Guarantees Footer */}
        <div className="pt-2 text-center text-[11px] font-jost text-[#FFFFFF]/60 flex items-center justify-center gap-2">
          <Lock size={12} className="text-[#d7b56d]" />
          <span>256-Bit SSL Secure • No advance payment required</span>
        </div>
      </form>
    </div>
  );
}
