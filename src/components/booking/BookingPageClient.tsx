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
  Phone
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

  // Copy helpers
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

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

  const copyToClipboard = (text: string, type: "account" | "iban") => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    if (type === "account") {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    }
  };

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
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black font-medium transition-colors cursor-pointer"
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
            <span className="text-[12px] uppercase tracking-[0.22em] text-[#d7b56d] font-bold block mb-1">
              Finalize Your Reservation
            </span>
            <h1 className="font-marcellus text-3xl sm:text-4xl text-gray-900 font-normal">
              Book {room.title}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Complete the guest and payment details below to confirm your stay.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3 text-red-800">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <span className="text-sm font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1: DATES & PARTY BREAKDOWN */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#000000] text-white text-xs flex items-center justify-center font-bold">1</span>
                <h2 className="font-marcellus text-xl text-gray-900 font-medium">
                  Stay Dates & Guests
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#d7b56d]" /> Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#d7b56d]" /> Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Users size={14} className="text-[#d7b56d]" /> Adults *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                    required
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Users size={14} className="text-[#d7b56d]" /> Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                    required
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: GUEST INFORMATION */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#000000] text-white text-xs flex items-center justify-center font-bold">2</span>
                <h2 className="font-marcellus text-xl text-gray-900 font-medium">
                  Guest Contact Details
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <User size={14} className="text-[#d7b56d]" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Mail size={14} className="text-[#d7b56d]" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Phone size={14} className="text-[#d7b56d]" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +92 300 1234567"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-md px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any special accommodations, late check-in notice, or preferences..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-md p-3 text-sm text-gray-900 focus:outline-none focus:border-black transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: PAYMENT DETAILS & BANK TRANSFER */}
            <div className="bg-white border-2 border-[#d7b56d] rounded-lg p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#d7b56d] text-black text-xs flex items-center justify-center font-bold">3</span>
                <div>
                  <h2 className="font-marcellus text-xl text-gray-900 font-medium">
                    Payment & Bank Transfer Details
                  </h2>
                  <p className="text-xs text-gray-500">
                    Direct bank transfer to hotel official account. Zero booking fees.
                  </p>
                </div>
              </div>

              {/* Bank Details Display Card */}
              <div className="bg-[#0F141C] text-white rounded-lg p-5 sm:p-6 mb-6 shadow-md border border-[#d7b56d]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d7b56d]/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-[#d7b56d]" />
                    <span className="font-marcellus text-lg text-white font-medium">
                      {settings.bankName || "Meezan Bank"}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#d7b56d] uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded">
                    Official Account
                  </span>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs block uppercase tracking-wider">Account Title</span>
                    <span className="font-semibold text-white text-base">
                      {settings.accountTitle || "Signature Art Hotel"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/10">
                    <div>
                      <span className="text-gray-400 text-xs block uppercase tracking-wider">Account Number</span>
                      <span className="font-mono font-bold text-white text-sm sm:text-base tracking-wider">
                        {settings.accountNumber || "01020304050607"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings.accountNumber || "01020304050607", "account")}
                      className="flex items-center gap-1.5 text-xs bg-[#d7b56d] hover:bg-white text-black font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
                    >
                      {copiedAccount ? <Check size={13} /> : <Copy size={13} />}
                      {copiedAccount ? "Copied" : "Copy"}
                    </button>
                  </div>

                  {settings.iban && (
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/10">
                      <div>
                        <span className="text-gray-400 text-xs block uppercase tracking-wider">IBAN</span>
                        <span className="font-mono font-bold text-white text-xs sm:text-sm tracking-wider">
                          {settings.iban}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.iban || "", "iban")}
                        className="flex items-center gap-1.5 text-xs bg-[#d7b56d] hover:bg-white text-black font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
                      >
                        {copiedIban ? <Check size={13} /> : <Copy size={13} />}
                        {copiedIban ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}

                  <div className="pt-2 text-xs text-gray-300 leading-relaxed italic border-t border-white/10">
                    {settings.paymentInstructions || "Please transfer the reservation total amount to the account above and upload the screenshot below."}
                  </div>
                </div>
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
                  <UploadCloud size={15} className="text-[#d7b56d]" /> Upload Payment Screenshot / Receipt *
                </label>

                <div className="border-2 border-dashed border-gray-300 hover:border-[#d7b56d] rounded-lg p-5 text-center transition-colors bg-gray-50 relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                        {isUploadingReceipt ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-[#d7b56d]" />
                            Uploading receipt to server...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} className="text-green-600" />
                            Receipt uploaded successfully! Click to change
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 mb-2">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        Click or drag & drop payment screenshot here
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG, WEBP or PDF (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {receiptUploadError && (
                  <p className="text-xs text-red-600 font-semibold mt-2">
                    {receiptUploadError}
                  </p>
                )}
              </div>
            </div>

            {/* STEP 4: TERMS ACCEPTANCE & SUBMIT */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-5 sm:p-7 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-black focus:ring-[#d7b56d] cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-gray-700 leading-snug">
                  I have read and accept all hotel policies, <Link href="/terms" target="_blank" className="text-black font-semibold underline underline-offset-2">terms & conditions</Link>, and the free cancellation policy up to 48 hours prior to check-in.
                </span>
              </label>

              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Total Amount Payable</span>
                  <div className="font-marcellus text-2xl sm:text-3xl font-bold text-gray-900">
                    PKR {totalAmount.toLocaleString()}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingReceipt}
                  className="w-full sm:w-auto bg-[#000000] hover:bg-[#d7b56d] text-white hover:text-black font-semibold text-[13px] uppercase tracking-[0.16em] px-10 py-4 rounded-md transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
            
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[11px] uppercase tracking-widest text-[#d7b56d] font-bold block">
                  Your Selected Suite
                </span>
                <h3 className="font-marcellus text-xl font-medium leading-tight text-white drop-shadow">
                  {room.title}
                </h3>
              </div>
            </div>

            {/* Summary Details */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#d7b56d]" /> Dates
                </span>
                <span className="font-semibold text-gray-900 text-right">
                  {checkIn || "—"} to {checkOut || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Users size={14} className="text-[#d7b56d]" /> Guests
                </span>
                <span className="font-semibold text-gray-900">
                  {adults} {adults === 1 ? "Adult" : "Adults"}{children > 0 ? `, ${children} Children` : ""}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Nights</span>
                <span className="font-semibold text-gray-900">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
              </div>

              <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600">Rate Per Night</span>
                <span className="font-semibold text-gray-900">PKR {room.price_per_night?.toLocaleString()}</span>
              </div>

              <div className="pt-2 flex items-center justify-between text-base">
                <span className="font-bold text-gray-900">Total Payable:</span>
                <span className="font-marcellus text-2xl font-bold text-gray-900">
                  PKR {totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Guarantees */}
              <div className="pt-4 mt-2 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-green-600 shrink-0" />
                  <span>Free cancellation up to 48 hours prior to arrival</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#d7b56d] shrink-0" />
                  <span>Complimentary breakfast and high-speed Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-[#d7b56d] shrink-0" />
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
