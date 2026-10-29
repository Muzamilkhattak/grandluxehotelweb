import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Review the privacy policy and data protection practices of Oslo Elite Hotel & Suites. Committed to GDPR compliance and guest confidentiality.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Oslo Elite Hotel & Suites",
    description: "Learn about how Oslo Elite Hotel & Suites protects your personal information and privacy.",
    url: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck size={14} className="text-[#d7b56d]" />
            <span className="font-jost text-xs uppercase tracking-widest font-semibold text-[#000000]">
              Data Protection & GDPR
            </span>
          </div>
          <h1 className="font-marcellus text-4xl sm:text-5xl text-[#000000] mb-4">
            Privacy Policy
          </h1>
          <p className="font-jost text-sm text-gray-500">
            Last updated: October 2026 • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 font-jost text-gray-700 leading-relaxed font-light text-base">
          <section>
            <h2 className="font-marcellus text-2xl text-[#000000] mb-3 font-normal">
              1. Our Commitment to Your Confidentiality
            </h2>
            <p>
              At Oslo Elite Hotel & Suites, safeguarding the confidentiality and integrity of your personal information is foundational to our philosophy of white-glove hospitality. This Privacy Policy details how we collect, process, and protect your information when booking suites, dining in our restaurants, or utilizing our concierge services.
            </p>
          </section>

          <section>
            <h2 className="font-marcellus text-2xl text-[#000000] mb-3 font-normal">
              2. Information We Collect
            </h2>
            <p className="mb-2">We collect only information necessary to ensure a bespoke residency:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              <li><strong>Reservation Data:</strong> Full name, billing address, contact phone, email, arrival and departure dates.</li>
              <li><strong>Residency Preferences:</strong> Dietary requirements, pillow selection, room temperature preferences, and flight arrival details.</li>
              <li><strong>Payment Information:</strong> Encrypted transaction tokens processed through certified PCI-DSS Level 1 payment gateways.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-marcellus text-2xl text-[#000000] mb-3 font-normal">
              3. Purpose and Legal Basis for Processing
            </h2>
            <p>
              In compliance with the General Data Protection Regulation (GDPR) and Norwegian data protection statutes, we process personal information under the following lawful bases:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600 mt-2">
              <li>Fulfillment of contractual obligations for your lodging, dining, and transfer reservations.</li>
              <li>Compliance with statutory reporting obligations under Norwegian hospitality registration laws.</li>
              <li>Legitimate business interests to enhance our security, guest safety, and bespoke service quality.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-marcellus text-2xl text-[#000000] mb-3 font-normal">
              4. Data Retention and Security Protocols
            </h2>
            <p>
              Your personal data is encrypted in transit using TLS 1.3 cryptographic protocols and stored in secure data facilities within the European Economic Area (EEA). We maintain diplomatic-grade access restrictions, ensuring only authorized concierge and management personnel can access guest dossiers.
            </p>
          </section>

          <section>
            <h2 className="font-marcellus text-2xl text-[#000000] mb-3 font-normal">
              5. Your Rights as a Data Subject
            </h2>
            <p>
              Under GDPR, you retain complete rights regarding your data:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600 mt-2">
              <li>The right to access, rectify, or request deletion of your residency record.</li>
              <li>The right to restrict or object to automated profile processing.</li>
              <li>The right to data portability and immediate withdrawal of consent.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact our Data Protection Officer directly at <strong className="text-[#000000]">privacy@osloelitehotel.com</strong>.
            </p>
          </section>

          <section className="pt-6 border-t border-[#EAEAEA]">
            <h2 className="font-marcellus text-xl text-[#000000] mb-2 font-normal">
              Contact Us Regarding Privacy
            </h2>
            <p className="text-sm text-gray-600">
              Oslo Elite Hotel & Suites • Karl Johans gate 37, 0162 Oslo, Norway • Telephone: +47 22 00 55 00
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}
