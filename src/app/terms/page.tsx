import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Review the reservation terms, cancellation policies, and residency guidelines for staying at Oslo Elite Hotel & Suites in Oslo, Norway.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms & Conditions | Oslo Elite Hotel & Suites",
    description: "Reservation terms, check-in policies, and cancellation guidelines for Oslo Elite Hotel & Suites.",
    url: "/terms",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="bg-[#FFFFFF] min-h-screen text-[#000000] pt-32 sm:pt-40 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d7b56d] hover:text-[#000000] transition-colors mb-8 font-semibold"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Header */}
        <div className="border-b border-[#EAEAEA] pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EAEAEA] mb-4 shadow-sm">
            <FileText size={14} className="text-[#d7b56d]" />
            <span className="font-jost text-xs uppercase tracking-widest font-semibold text-[#000000]">
              Residency Agreement
            </span>
          </div>
          <h1 className="font-marcellus text-4xl sm:text-5xl text-[#000000] mb-4">
            Terms & Conditions
          </h1>
          <p className="font-jost text-sm text-gray-500">
            Last updated: October 2026 • Oslo Elite Hotel & Suites
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 font-jost text-gray-700 leading-relaxed font-light text-base">
          <section>
            <h2 className="font-marcellus text-2xl text-[#000000] mb-3 font-normal">
              1. Reservations & Direct Booking Guarantee
            </h2>
            <p>
              When booking directly through our website or concierge desk, you are guaranteed our most favorable rates, priority suite placement, and complimentary early check-in subject to availability. A valid credit card authorization is required at the time of reservation to secure your suite.
            </p>
          </section>

          <section>
            <h2 className="font-marcellus text-2xl text-[#000000] mb-3 font-normal">
              2. Check-In & Check-Out Times
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              <li><strong>Check-in:</strong> Beginning at 15:00 CET. Early arrival requests are accommodated whenever suites are prepared.</li>
              <li><strong>Check-out:</strong> Up to 12:00 CET. Complimentary late check-out is extended to Executive Suite guests subject to availability.</li>
              <li>A valid government-issued photographic ID or passport must be presented upon arrival.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-marcellus text-2xl text-[#000000] mb-3 font-normal">
              3. Cancellation & Modification Policies
            </h2>
            <p>
              Standard reservations may be modified or cancelled without penalty up to 48 hours prior to 15:00 CET on the scheduled date of arrival. Cancellations made within 48 hours, or failure to arrive without prior notification, incur a fee equivalent to one night&apos;s suite rate and applicable taxes.
            </p>
          </section>

          <section>
            <h2 className="font-marcellus text-2xl text-[#000000] mb-3 font-normal">
              4. Property Guidelines & Guest Etiquette
            </h2>
            <p>
              To ensure all guests enjoy an atmosphere of serene refinement:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600 mt-2">
              <li>Our property is 100% smoke-free throughout all interior rooms, corridors, and suites.</li>
              <li>Quiet hours are observed across all guest residential wings between 22:30 and 07:00.</li>
              <li>Well-behaved small companion animals are welcome in designated suites upon advance concierge notification.</li>
            </ul>
          </section>

          <section className="pt-6 border-t border-[#EAEAEA]">
            <h2 className="font-marcellus text-xl text-[#000000] mb-2 font-normal">
              Questions Regarding Terms
            </h2>
            <p className="text-sm text-gray-600">
              Please direct any inquiries regarding reservation terms to <strong className="text-[#000000]">reservations@osloelitehotel.com</strong> or call our front desk at +47 22 00 55 00.
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}
