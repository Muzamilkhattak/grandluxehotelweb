"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  createBookingAction, 
  uploadReceiptAction, 
  checkRoomAvailabilityAction 
} from "@/app/actions/booking";
import { HotelSettings } from "@/app/actions/admin-settings";
import { 
  Building2, 
  CreditCard, 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Users, 
  BedDouble, 
  Copy, 
  Check, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  FileText,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Smartphone,
  Landmark,
  Wallet
} from "lucide-react";

interface BookingPageClientProps {
  room: {
    id: string;
    title: string;
    slug?: string;
    price_per_night: number;
    image_url?: string;
    bed_type?: string;
    capacity?: number;
    capacity_guests?: number;
    size_sqft?: number;
  };
  settings: HotelSettings;
  user: {
    id?: string;
    email?: string;
    name?: string;
    phone?: string;
  } | null;
  initialCheckIn: string;
  initialCheckOut: string;
  initialAdults: number;
  initialChildren: number;
}

export default function BookingPageClient({
  room,
  settings,
  user,
  initialCheckIn,
  initialCheckOut,
  initialAdults,
  initialChildren,
}: BookingPageClientProps) {
  const router = useRouter();

  // Form Fields
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);

  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState(user?.phone || "");
  const [specialRequests, setSpecialRequests] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // File Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptUploadError, setReceiptUploadError] = useState<string | null>(null);

  // Submission & UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Multi-Account Copy Helpers
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Active Payment Accounts (EasyPaisa, JazzCash, Bank Accounts)
  const activeAccounts = (settings.paymentAccounts && settings.paymentAccounts.length > 0)
    ? settings.paymentAccounts.filter((a) => a.isActive)
    : [
        {
          id: "default-bank",
          type: "bank" as const,
          providerName: settings.bankName || "Meezan Bank",
          accountTitle: settings.accountTitle || "Signature Art Hotel",
          accountNumber: settings.accountNumber || "01020304050607",
          iban: settings.iban || "PK36MEZN0001020304050607",
          notes: "Direct bank transfer / Raast",
          isActive: true,
        },
      ];

  // Calculate Nights & Total
  const calculateNights = (inDate: string, outDate: string) => {
    if (!inDate || !outDate) return 1;
    const start = new Date(inDate);
    const end = new Date(outDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 1;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const nights = calculateNights(checkIn, checkOut);
  const subtotal = room.price_per_night * nights;
  const totalAmount = subtotal;
  const totalGuests = adults + children;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    setReceiptUploadError(null);

    // Create local object URL for preview
    const previewUrl = URL.createObjectURL(file);
    setReceiptPreview(previewUrl);

    // Auto upload to Supabase storage
    setIsUploadingReceipt(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadReceiptAction(formData);
    setIsUploadingReceipt(false);

    if (res.success && res.url) {
      setUploadedReceiptUrl(res.url);
    } else {
      setReceiptUploadError(res.error || "Failed to upload payment screenshot. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!termsAccepted) {
      setErrorMsg("Please accept the terms and conditions to proceed with your booking.");
      return;
    }

    if (!checkIn || !checkOut) {
      setErrorMsg("Check-in and check-out dates are required.");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setErrorMsg("Check-out date must be after check-in date.");
      return;
    }

    if (!uploadedReceiptUrl && !receiptFile) {
      setErrorMsg("Please upload your payment screenshot/receipt to confirm your reservation.");
      return;
    }

    setIsSubmitting(true);

    try {
      // If file selected but not yet uploaded
      let finalReceiptUrl = uploadedReceiptUrl;
      if (!finalReceiptUrl && receiptFile) {
        setIsUploadingReceipt(true);
        const formData = new FormData();
        formData.append("file", receiptFile);
        const uploadRes = await uploadReceiptAction(formData);
        setIsUploadingReceipt(false);
        if (!uploadRes.success || !uploadRes.url) {
          setErrorMsg(uploadRes.error || "Failed to upload receipt. Please try again.");
          setIsSubmitting(false);
          return;
        }
        finalReceiptUrl = uploadRes.url;
      }

      // Check room availability
      const availRes = await checkRoomAvailabilityAction(room.id, checkIn, checkOut);
      if (!availRes.available) {
        setErrorMsg(availRes.error || "This suite is not available for the selected dates. Please adjust your dates.");
        setIsSubmitting(false);
        return;
      }

      // Create Booking
      const bookingPayload = {
        roomId: room.id,
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        adults,
        children,
        receiptUrl: finalReceiptUrl || undefined,
        notes: specialRequests,
      };

      const result = await createBookingAction(bookingPayload);

      if (result.success && result.booking) {
        setConfirmedBooking(result.booking);
      } else {
        setErrorMsg(result.error || "Could not complete booking. Please try again.");
      }
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (confirmedBooking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 font-jost">
        <div className="bg-white border-2 border-[#d7b56d] shadow-2xl rounded-lg p-6 sm:p-10 text-center">
          <div className="w-16 h-16 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-5 text-green-600 shadow-md">
            <CheckCircle size={36} />
          </div>

          <span className="text-[12px] uppercase tracking-[0.25em] text-[#d7b56d] font-bold block mb-1">
            Reservation Confirmed
          </span>
          <h1 className="font-marcellus text-3xl sm:text-5xl text-gray-900 font-normal mb-3">
            Thank You, {guestName}!
          </h1>
          <p className="text-gray-600 text-base max-w-lg mx-auto mb-8">
            Your reservation for <strong className="text-gray-900 font-semibold">{room.title}</strong> has been received and your payment screenshot is being verified by our concierge team.
          </p>

          {/* Booking Summary Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-xl mx-auto text-left mb-8 space-y-3.5 text-sm sm:text-base">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-500 text-xs sm:text-sm uppercase tracking-wider">Booking ID</span>
              <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm">{confirmedBooking.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Selected Suite:</span>
              <span className="font-semibold text-gray-900">{room.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-semibold text-gray-900">{checkIn}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-semibold text-gray-900">{checkOut}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duration & Guests:</span>
              <span className="font-semibold text-gray-900">{nights} {nights === 1 ? 'Night' : 'Nights'} • {totalGuests} Guests</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Total Amount:</span>
              <span className="font-marcellus text-xl font-bold text-gray-900">PKR {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600 text-sm">Payment Status:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 font-semibold text-xs rounded-full">
                Receipt Submitted (Pending Verification)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/profile"
              className="w-full sm:w-auto bg-[#000000] hover:bg-[#d7b56d] text-white hover:text-black font-semibold text-[13px] uppercase tracking-[0.16em] px-8 py-4 rounded-md transition-all duration-300 shadow-md"
            >
              View My Bookings
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[13px] uppercase tracking-[0.16em] px-8 py-4 rounded-md transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 font-jost text-gray-900">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[13.5px] sm:text-[14px] text-gray-800 font-bold hover:text-black transition-colors cursor-pointer bg-white px-3.5 py-1.5 rounded-md border border-neutral-300 shadow-xs"
        >
          <ArrowLeft size={16} />
          Back to Suites
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Booking & Payment Form (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Header */}
          <div>
            <span className="text-[12px] uppercase tracking-[0.22em] text-[#8f6618] font-bold block mb-1">
              Finalize Your Reservation
            </span>
            <h1 className="font-marcellus text-3xl sm:text-4xl text-gray-950 font-semibold leading-tight">
              Book {room.title}
            </h1>
            <p className="text-gray-700 font-medium text-[15px] mt-1">
              Complete your guest details and transfer payment to confirm your luxury stay.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3 text-red-900 shadow-sm">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <span className="text-[14px] font-bold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1: DATES & PARTY BREAKDOWN */}
            <div className="bg-white border-2 border-neutral-300 rounded-xl p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-200">
                <span className="w-7 h-7 rounded-full bg-black text-[#d7b56d] border border-[#d7b56d] text-xs flex items-center justify-center font-bold shadow-xs">1</span>
                <div>
                  <h2 className="font-marcellus text-xl sm:text-2xl text-gray-950 font-semibold">
                    Stay Dates & Guests
                  </h2>
                  <p className="text-xs text-gray-600 font-medium">
                    Select your arrival and departure dates and party size.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={15} className="text-[#8f6618]" /> Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-neutral-400/80 hover:border-black focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] text-gray-950 font-semibold text-[15px] h-[48px] px-3.5 rounded-lg shadow-xs transition-colors focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={15} className="text-[#8f6618]" /> Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-neutral-400/80 hover:border-black focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] text-gray-950 font-semibold text-[15px] h-[48px] px-3.5 rounded-lg shadow-xs transition-colors focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <Users size={15} className="text-[#8f6618]" /> Adults *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                    required
                    className="w-full bg-white border-2 border-neutral-400/80 hover:border-black focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] text-gray-950 font-semibold text-[15px] h-[48px] px-3.5 rounded-lg shadow-xs transition-colors focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <Users size={15} className="text-[#8f6618]" /> Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                    required
                    className="w-full bg-white border-2 border-neutral-400/80 hover:border-black focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] text-gray-950 font-semibold text-[15px] h-[48px] px-3.5 rounded-lg shadow-xs transition-colors focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: GUEST INFORMATION */}
            <div className="bg-white border-2 border-neutral-300 rounded-xl p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-200">
                <span className="w-7 h-7 rounded-full bg-black text-[#d7b56d] border border-[#d7b56d] text-xs flex items-center justify-center font-bold shadow-xs">2</span>
                <div>
                  <h2 className="font-marcellus text-xl sm:text-2xl text-gray-950 font-semibold">
                    Guest Contact Details
                  </h2>
                  <p className="text-xs text-gray-600 font-medium">
                    We will send reservation confirmation and updates to this contact.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <User size={15} className="text-[#8f6618]" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-white border-2 border-neutral-400/80 hover:border-black focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] text-gray-950 font-semibold text-[15px] h-[48px] px-3.5 rounded-lg shadow-xs transition-colors focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <Mail size={15} className="text-[#8f6618]" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-white border-2 border-neutral-400/80 hover:border-black focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] text-gray-950 font-semibold text-[15px] h-[48px] px-3.5 rounded-lg shadow-xs transition-colors focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <Phone size={15} className="text-[#8f6618]" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +92 300 1234567"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-white border-2 border-neutral-400/80 hover:border-black focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] text-gray-950 font-semibold text-[15px] h-[48px] px-3.5 rounded-lg shadow-xs transition-colors focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-900 mb-1.5">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any special accommodations, late check-in notice, or preferences..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-white border-2 border-neutral-400/80 hover:border-black focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] text-gray-950 font-medium text-[14.5px] p-3 rounded-lg shadow-xs transition-colors focus:outline-none resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: PAYMENT DETAILS & ACCOUNTS (EasyPaisa, JazzCash, Bank Accounts) */}
            <div className="bg-white border-2 border-neutral-300 rounded-xl p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-200">
                <span className="w-7 h-7 rounded-full bg-black text-[#d7b56d] border border-[#d7b56d] text-xs flex items-center justify-center font-bold shadow-xs">3</span>
                <div>
                  <h2 className="font-marcellus text-xl sm:text-2xl text-gray-950 font-semibold">
                    Payment & Transfer Accounts
                  </h2>
                  <p className="text-xs text-gray-600 font-medium">
                    Pay via EasyPaisa, JazzCash, or online Bank Transfer to any official account below. Zero booking fees.
                  </p>
                </div>
              </div>

              {/* Payment Instructions banner */}
              {settings.paymentInstructions && (
                <div className="mb-5 bg-amber-50/90 border-2 border-amber-300/80 rounded-lg p-3.5 text-xs sm:text-[13.5px] text-amber-950 font-medium leading-relaxed flex items-start gap-2.5 shadow-xs">
                  <Sparkles size={16} className="text-[#8f6618] shrink-0 mt-0.5" />
                  <span>{settings.paymentInstructions}</span>
                </div>
              )}

              {/* Dynamic Payment Accounts List */}
              <div className="space-y-4 mb-6">
                {activeAccounts.map((account) => {
                  const isEasyPaisa = account.type === "easypaisa";
                  const isJazzCash = account.type === "jazzcash";
                  const isBank = account.type === "bank";

                  return (
                    <div
                      key={account.id}
                      className="bg-[#0c1017] text-white rounded-xl p-4 sm:p-5 shadow-md border-2 border-[#d7b56d]/60 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-36 h-36 bg-[#d7b56d]/15 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/15">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs ${
                              isEasyPaisa
                                ? "bg-[#00A859]"
                                : isJazzCash
                                ? "bg-[#ED1C24]"
                                : isBank
                                ? "bg-[#d7b56d] text-black"
                                : "bg-blue-600"
                            }`}
                          >
                            {isBank ? <Landmark size={15} /> : <Smartphone size={15} />}
                          </div>
                          <span className="font-marcellus text-lg sm:text-xl text-white font-semibold">
                            {account.providerName}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-black/60 border border-[#d7b56d]/50 px-2.5 py-1 rounded text-[#e3c47e]">
                          {account.type === "bank" ? "Bank Account" : account.providerName}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                          <span className="text-gray-300 font-medium">Account Title:</span>
                          <span className="font-bold text-white text-[14.5px] sm:text-[15px]">{account.accountTitle}</span>
                        </div>

                        {/* Account Number Box with 1-click Copy */}
                        <div className="flex items-center justify-between bg-black/85 p-3 rounded-lg border border-[#d7b56d]/50 shadow-inner">
                          <div>
                            <span className="text-gray-300 text-[11px] block uppercase tracking-wider font-semibold">
                              {isBank ? "Account Number" : "Mobile Account Number"}
                            </span>
                            <span className="font-mono font-bold text-amber-300 text-base sm:text-lg tracking-wider select-all">
                              {account.accountNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(account.accountNumber, `num-${account.id}`)}
                            className="flex items-center gap-1.5 text-xs bg-[#d7b56d] hover:bg-white text-black font-bold uppercase tracking-wider px-3.5 py-2 rounded-md transition-colors cursor-pointer shrink-0 shadow-sm"
                          >
                            {copiedKey === `num-${account.id}` ? <Check size={14} /> : <Copy size={14} />}
                            {copiedKey === `num-${account.id}` ? "Copied" : "Copy"}
                          </button>
                        </div>

                        {/* IBAN Box if available */}
                        {account.iban && (
                          <div className="flex items-center justify-between bg-black/85 p-3 rounded-lg border border-[#d7b56d]/50 shadow-inner">
                            <div>
                              <span className="text-gray-300 text-[11px] block uppercase tracking-wider font-semibold">
                                IBAN
                              </span>
                              <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm tracking-wider select-all">
                                {account.iban}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(account.iban || "", `iban-${account.id}`)}
                              className="flex items-center gap-1.5 text-xs bg-[#d7b56d] hover:bg-white text-black font-bold uppercase tracking-wider px-3.5 py-2 rounded-md transition-colors cursor-pointer shrink-0 shadow-sm"
                            >
                              {copiedKey === `iban-${account.id}` ? <Check size={14} /> : <Copy size={14} />}
                              {copiedKey === `iban-${account.id}` ? "Copied" : "Copy IBAN"}
                            </button>
                          </div>
                        )}

                        {account.notes && (
                          <div className="pt-1 text-[12px] text-amber-200/90 font-medium italic">
                            {account.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-gray-900 mb-2 flex items-center gap-1.5">
                  <UploadCloud size={16} className="text-[#8f6618]" /> Upload Payment Screenshot / Receipt *
                </label>

                <div className="border-2 border-dashed border-neutral-400 hover:border-black rounded-xl p-6 text-center transition-all bg-amber-50/30 hover:bg-amber-50/60 relative cursor-pointer shadow-xs">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  {receiptPreview ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-28 h-28 rounded-md overflow-hidden border-2 border-[#d7b56d] mb-3 shadow">
                        <Image
                          src={receiptPreview}
                          alt="Receipt preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-green-800 bg-green-50 px-3.5 py-1.5 rounded-full border border-green-300">
                        {isUploadingReceipt ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-[#8f6618]" />
                            Uploading receipt to server...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} className="text-green-700" />
                            Receipt uploaded successfully! Click to change
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-3">
                      <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center text-gray-800 mb-2 shadow-xs">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-[14px] font-bold text-gray-900">
                        Click or drag & drop payment screenshot here
                      </p>
                      <p className="text-xs text-gray-600 font-medium mt-1">
                        PNG, JPG, JPEG, WEBP or PDF (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {receiptUploadError && (
                  <p className="text-xs text-red-600 font-bold mt-2">
                    {receiptUploadError}
                  </p>
                )}
              </div>
            </div>

            {/* STEP 4: TERMS ACCEPTANCE & SUBMIT */}
            <div className="bg-white border-2 border-neutral-300 rounded-xl p-5 sm:p-7 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="w-5 h-5 mt-0.5 rounded border-2 border-neutral-400 text-black focus:ring-[#d7b56d] cursor-pointer"
                />
                <span className="text-[13.5px] sm:text-[14px] text-gray-900 font-medium leading-snug">
                  I have read and accept all hotel policies, <Link href="/terms" target="_blank" className="text-black font-bold underline underline-offset-2 hover:text-[#8f6618]">terms & conditions</Link>, and the free cancellation policy up to 48 hours prior to check-in.
                </span>
              </label>

              <div className="mt-5 pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-xs text-gray-600 font-bold uppercase tracking-wider block">Total Amount Payable</span>
                  <div className="font-marcellus text-2xl sm:text-3xl font-bold text-gray-950">
                    PKR {totalAmount.toLocaleString()}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingReceipt}
                  className="w-full sm:w-auto bg-black hover:bg-[#d7b56d] text-white hover:text-black font-bold text-[13px] uppercase tracking-[0.14em] px-9 py-4 rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-[#d7b56d]" />
                      Processing Reservation...
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      Book Now & Confirm
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary & Room Preview Sticky Card (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
          <div className="bg-white border-2 border-neutral-300 rounded-xl shadow-sm overflow-hidden">
            
            {/* Room Image */}
            <div className="relative w-full h-48 bg-neutral-900">
              {room.image_url ? (
                <Image
                  src={room.image_url}
                  alt={room.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 30vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
                  Signature Art Hotel
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[11px] uppercase tracking-widest text-[#d7b56d] font-bold block">
                  Your Selected Suite
                </span>
                <h3 className="font-marcellus text-xl font-bold leading-tight text-white drop-shadow">
                  {room.title}
                </h3>
              </div>
            </div>

            {/* Summary Details */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-sm py-2.5 border-b border-gray-200">
                <span className="text-gray-700 font-bold flex items-center gap-1.5 text-[13.5px]">
                  <Calendar size={14} className="text-[#8f6618]" /> Dates
                </span>
                <span className="font-bold text-gray-950 text-right">
                  {checkIn || "—"} to {checkOut || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm py-2.5 border-b border-gray-200">
                <span className="text-gray-700 font-bold flex items-center gap-1.5 text-[13.5px]">
                  <Users size={14} className="text-[#8f6618]" /> Guests
                </span>
                <span className="font-bold text-gray-950">
                  {adults} {adults === 1 ? "Adult" : "Adults"}{children > 0 ? `, ${children} Children` : ""}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm py-2.5 border-b border-gray-200">
                <span className="text-gray-700 font-bold text-[13.5px]">Total Nights</span>
                <span className="font-bold text-gray-950">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
              </div>

              <div className="flex items-center justify-between text-sm py-2.5 border-b border-gray-200">
                <span className="text-gray-700 font-bold text-[13.5px]">Rate Per Night</span>
                <span className="font-bold text-gray-950">PKR {room.price_per_night?.toLocaleString()}</span>
              </div>

              <div className="pt-2 flex items-center justify-between text-base">
                <span className="font-bold text-gray-950 text-base">Total Payable:</span>
                <span className="font-marcellus text-2xl sm:text-3xl font-bold text-gray-950">
                  PKR {totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Guarantees */}
              <div className="pt-4 mt-2 border-t border-gray-200 space-y-2.5 text-xs text-gray-800 font-semibold">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-green-700 shrink-0 font-bold" />
                  <span>Free cancellation up to 48 hours prior to arrival</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#8f6618] shrink-0" />
                  <span>Complimentary breakfast and high-speed Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-[#8f6618] shrink-0" />
                  <span>Zero booking or hidden transaction fees</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
