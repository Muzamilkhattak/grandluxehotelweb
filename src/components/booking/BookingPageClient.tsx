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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 font-jost text-black">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[14px] sm:text-[15px] text-black font-bold hover:text-[#9e7422] transition-colors cursor-pointer bg-white px-4 py-2 rounded-lg border-2 border-black/70 shadow-xs"
        >
          <ArrowLeft size={18} className="text-black" />
          Back to Suites
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Booking & Payment Form (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Header */}
          <div>
            <span className="text-[13px] uppercase tracking-[0.25em] text-[#8f6618] font-extrabold block mb-1">
              Finalize Your Reservation
            </span>
            <h1 className="font-marcellus text-3xl sm:text-4xl md:text-5xl text-black font-bold leading-tight">
              Book {room.title}
            </h1>
            <p className="text-black font-medium text-[15px] sm:text-[16px] mt-1.5">
              Complete your guest information and transfer payment to confirm your luxury stay.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4 flex items-start gap-3 text-red-950 shadow-md">
              <AlertTriangle size={22} className="text-red-600 shrink-0 mt-0.5" />
              <span className="text-[15px] font-bold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1: DATES & PARTY BREAKDOWN */}
            <div className="bg-white border-2 border-black/80 rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b-2 border-gray-200">
                <span className="w-8 h-8 rounded-full bg-black text-[#d7b56d] border border-[#d7b56d] text-sm flex items-center justify-center font-extrabold shadow-sm">1</span>
                <div>
                  <h2 className="font-marcellus text-2xl text-black font-bold">
                    Stay Dates & Guests
                  </h2>
                  <p className="text-[13px] font-medium text-black/75">
                    Select your arrival and departure dates and party size.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-black mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#8f6618]" /> Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-black/80 hover:border-black focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/30 text-black font-bold text-[15px] h-[52px] px-4 rounded-lg shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-black mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#8f6618]" /> Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-black/80 hover:border-black focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/30 text-black font-bold text-[15px] h-[52px] px-4 rounded-lg shadow-sm transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-black mb-2 flex items-center gap-2">
                    <Users size={16} className="text-[#8f6618]" /> Adults *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                    required
                    className="w-full bg-white border-2 border-black/80 hover:border-black focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/30 text-black font-bold text-[15px] h-[52px] px-4 rounded-lg shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-black mb-2 flex items-center gap-2">
                    <Users size={16} className="text-[#8f6618]" /> Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                    required
                    className="w-full bg-white border-2 border-black/80 hover:border-black focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/30 text-black font-bold text-[15px] h-[52px] px-4 rounded-lg shadow-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: GUEST INFORMATION */}
            <div className="bg-white border-2 border-black/80 rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b-2 border-gray-200">
                <span className="w-8 h-8 rounded-full bg-black text-[#d7b56d] border border-[#d7b56d] text-sm flex items-center justify-center font-extrabold shadow-sm">2</span>
                <div>
                  <h2 className="font-marcellus text-2xl text-black font-bold">
                    Guest Contact Details
                  </h2>
                  <p className="text-[13px] font-medium text-black/75">
                    We will send reservation confirmation and updates to this contact.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-black mb-2 flex items-center gap-2">
                    <User size={16} className="text-[#8f6618]" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-white border-2 border-black/80 hover:border-black focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/30 text-black font-bold text-[15px] h-[52px] px-4 rounded-lg shadow-sm transition-colors placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-black mb-2 flex items-center gap-2">
                      <Mail size={16} className="text-[#8f6618]" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-white border-2 border-black/80 hover:border-black focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/30 text-black font-bold text-[15px] h-[52px] px-4 rounded-lg shadow-sm transition-colors placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-black mb-2 flex items-center gap-2">
                      <Phone size={16} className="text-[#8f6618]" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +92 300 1234567"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-white border-2 border-black/80 hover:border-black focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/30 text-black font-bold text-[15px] h-[52px] px-4 rounded-lg shadow-sm transition-colors placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-black mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any special accommodations, late check-in notice, or preferences..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-white border-2 border-black/80 hover:border-black focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/30 text-black font-semibold text-[15px] p-4 rounded-lg shadow-sm transition-colors resize-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: PAYMENT DETAILS & ACCOUNTS (EasyPaisa, JazzCash, Bank Accounts) */}
            <div className="bg-white border-2 border-[#9e7422] rounded-xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b-2 border-gray-200">
                <span className="w-8 h-8 rounded-full bg-[#9e7422] text-black text-sm flex items-center justify-center font-black shadow-sm">3</span>
                <div>
                  <h2 className="font-marcellus text-2xl text-black font-bold">
                    Payment & Transfer Accounts
                  </h2>
                  <p className="text-[13px] font-bold text-black/80">
                    Pay via EasyPaisa, JazzCash, or online Bank Transfer to any active official account below. Zero booking fees.
                  </p>
                </div>
              </div>

              {/* Payment Instructions banner */}
              {settings.paymentInstructions && (
                <div className="mb-6 bg-amber-100/90 border-2 border-amber-400 rounded-lg p-4 text-[14px] text-black font-bold leading-relaxed flex items-start gap-3 shadow-xs">
                  <Sparkles size={18} className="text-[#8f6618] shrink-0 mt-0.5" />
                  <span>{settings.paymentInstructions}</span>
                </div>
              )}

              {/* Dynamic Payment Accounts List */}
              <div className="space-y-5 mb-8">
                {activeAccounts.map((account) => {
                  const isEasyPaisa = account.type === "easypaisa";
                  const isJazzCash = account.type === "jazzcash";
                  const isBank = account.type === "bank";

                  return (
                    <div
                      key={account.id}
                      className="bg-[#0B0F15] text-white rounded-xl p-5 sm:p-6 shadow-2xl border-2 border-[#d7b56d] relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-[#d7b56d]/15 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-white/15">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md ${
                              isEasyPaisa
                                ? "bg-[#00A859]"
                                : isJazzCash
                                ? "bg-[#ED1C24]"
                                : isBank
                                ? "bg-[#d7b56d] text-black"
                                : "bg-blue-600"
                            }`}
                          >
                            {isBank ? <Landmark size={16} /> : <Smartphone size={16} />}
                          </div>
                          <span className="font-marcellus text-lg sm:text-xl text-white font-bold tracking-wide">
                            {account.providerName}
                          </span>
                        </div>
                        <span className="text-[11.5px] font-black uppercase tracking-wider px-3 py-1 rounded shadow-sm bg-[#d7b56d] text-black">
                          {account.type === "bank" ? "Bank Account" : account.providerName}
                        </span>
                      </div>

                      <div className="space-y-3.5 text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm sm:text-base">
                          <span className="text-amber-200/90 font-bold uppercase tracking-wider text-xs">Account Title / Holder Name:</span>
                          <span className="font-extrabold text-white text-base sm:text-lg">{account.accountTitle}</span>
                        </div>

                        {/* Account Number Box with 1-click Copy */}
                        <div className="flex items-center justify-between bg-black/90 p-3 sm:p-4 rounded-lg border-2 border-[#d7b56d]/70 shadow-inner">
                          <div>
                            <span className="text-[#d7b56d] text-xs block uppercase tracking-wider font-extrabold mb-0.5">
                              {isBank ? "Official Account Number" : "Mobile Account Number"}
                            </span>
                            <span className="font-mono font-black text-white text-lg sm:text-2xl tracking-wider select-all">
                              {account.accountNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(account.accountNumber, `num-${account.id}`)}
                            className="flex items-center gap-1.5 text-xs font-black bg-[#d7b56d] hover:bg-white text-black uppercase tracking-wider px-4 py-2.5 rounded-md shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                          >
                            {copiedKey === `num-${account.id}` ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} className="stroke-[2.5]" />}
                            {copiedKey === `num-${account.id}` ? "Copied!" : "Copy"}
                          </button>
                        </div>

                        {/* IBAN Box if available */}
                        {account.iban && (
                          <div className="flex items-center justify-between bg-black/90 p-3 sm:p-4 rounded-lg border-2 border-[#d7b56d]/70 shadow-inner">
                            <div>
                              <span className="text-[#d7b56d] text-xs block uppercase tracking-wider font-extrabold mb-0.5">
                                IBAN (Raast / IBFT)
                              </span>
                              <span className="font-mono font-black text-white text-sm sm:text-base tracking-wider select-all">
                                {account.iban}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(account.iban || "", `iban-${account.id}`)}
                              className="flex items-center gap-1.5 text-xs font-black bg-[#d7b56d] hover:bg-white text-black uppercase tracking-wider px-4 py-2.5 rounded-md shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                            >
                              {copiedKey === `iban-${account.id}` ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} className="stroke-[2.5]" />}
                              {copiedKey === `iban-${account.id}` ? "Copied!" : "Copy IBAN"}
                            </button>
                          </div>
                        )}

                        {account.notes && (
                          <div className="pt-2 text-xs sm:text-[13px] text-amber-100 font-semibold bg-white/5 p-3 rounded-md border border-white/10">
                            💡 {account.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-black mb-2.5 flex items-center gap-2">
                  <UploadCloud size={18} className="text-[#8f6618]" /> Upload Payment Screenshot / Receipt *
                </label>

                <div className="border-2 border-dashed border-black/70 hover:border-black rounded-xl p-6 sm:p-8 text-center transition-all bg-amber-50/50 hover:bg-amber-50/80 relative cursor-pointer shadow-sm">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  {receiptPreview ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-black mb-3 shadow-md">
                        <Image
                          src={receiptPreview}
                          alt="Receipt preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-green-800 bg-green-100 px-3.5 py-1.5 rounded-full border border-green-400">
                        {isUploadingReceipt ? (
                          <>
                            <Loader2 size={16} className="animate-spin text-[#8f6618]" />
                            Uploading receipt to server...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} className="text-green-700 stroke-[2.5]" />
                            Receipt uploaded successfully! Click box to change file
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-14 h-14 bg-black text-[#d7b56d] rounded-full flex items-center justify-center mb-3 shadow-md">
                        <UploadCloud size={28} />
                      </div>
                      <p className="text-[16px] font-bold text-black">
                        Click or drag & drop payment screenshot here
                      </p>
                      <p className="text-xs sm:text-[13px] text-black/80 font-semibold mt-1">
                        PNG, JPG, JPEG, WEBP or PDF (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {receiptUploadError && (
                  <p className="text-[13px] text-red-700 font-extrabold mt-2.5 bg-red-50 p-2 rounded border border-red-300">
                    {receiptUploadError}
                  </p>
                )}
              </div>
            </div>

            {/* STEP 4: TERMS ACCEPTANCE & SUBMIT */}
            <div className="bg-white border-2 border-black/80 rounded-xl p-6 sm:p-8 shadow-lg">
              <label className="flex items-start gap-3.5 cursor-pointer select-none bg-gray-50 p-4 rounded-lg border-2 border-black/30 hover:border-black transition-colors">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="w-5 h-5 mt-0.5 rounded border-2 border-black accent-black cursor-pointer shrink-0"
                />
                <span className="text-[13.5px] sm:text-[14.5px] text-black font-bold leading-snug">
                  I have read and accept all hotel policies, <Link href="/terms" target="_blank" className="text-[#8f6618] hover:text-black font-extrabold underline underline-offset-4">terms & conditions</Link>, and the free cancellation policy up to 48 hours prior to check-in.
                </span>
              </label>

              <div className="mt-6 pt-6 border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-xs font-black uppercase tracking-wider text-black/80 block mb-0.5">Total Amount Payable</span>
                  <div className="font-marcellus text-3xl sm:text-4xl font-black text-black">
                    PKR {totalAmount.toLocaleString()}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingReceipt}
                  className="w-full sm:w-auto bg-[#000000] hover:bg-[#8f6618] text-white hover:text-black font-extrabold text-[14px] uppercase tracking-[0.16em] px-10 py-4 rounded-xl transition-all duration-300 shadow-2xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-[#d7b56d]" />
                      Processing Reservation...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
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
          <div className="bg-white border-2 border-black/80 rounded-xl shadow-2xl overflow-hidden">
            
            {/* Room Image */}
            <div className="relative w-full h-52 bg-neutral-900">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[11px] uppercase tracking-widest text-[#d7b56d] font-black block mb-0.5">
                  Your Selected Suite
                </span>
                <h3 className="font-marcellus text-2xl font-bold leading-tight text-white drop-shadow-md">
                  {room.title}
                </h3>
              </div>
            </div>

            {/* Summary Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-[14px] py-2.5 border-b border-gray-200">
                <span className="text-black font-bold flex items-center gap-2">
                  <Calendar size={16} className="text-[#8f6618]" /> Dates:
                </span>
                <span className="font-extrabold text-black text-right">
                  {checkIn || "—"} to {checkOut || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[14px] py-2.5 border-b border-gray-200">
                <span className="text-black font-bold flex items-center gap-2">
                  <Users size={16} className="text-[#8f6618]" /> Guests:
                </span>
                <span className="font-extrabold text-black">
                  {adults} {adults === 1 ? "Adult" : "Adults"}{children > 0 ? `, ${children} Children` : ""}
                </span>
              </div>

              <div className="flex items-center justify-between text-[14px] py-2.5 border-b border-gray-200">
                <span className="text-black font-bold">Total Nights:</span>
                <span className="font-extrabold text-black">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
              </div>

              <div className="flex items-center justify-between text-[14px] py-2.5 border-b border-gray-200">
                <span className="text-black font-bold">Rate Per Night:</span>
                <span className="font-extrabold text-black">PKR {room.price_per_night?.toLocaleString()}</span>
              </div>

              <div className="pt-3 flex items-center justify-between text-base">
                <span className="font-black text-black uppercase tracking-wider text-sm">Total Payable:</span>
                <span className="font-marcellus text-2xl sm:text-3xl font-black text-black">
                  PKR {totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Guarantees */}
              <div className="pt-5 mt-3 border-t-2 border-gray-200 space-y-2.5 text-xs sm:text-[13px] text-black font-bold">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-green-700 shrink-0" />
                  <span>Free cancellation up to 48 hours prior to arrival</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-[#8f6618] shrink-0" />
                  <span>Complimentary breakfast and high-speed Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={16} className="text-[#8f6618] shrink-0" />
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
