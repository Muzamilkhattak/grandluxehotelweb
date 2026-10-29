import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact & Concierge Desk",
  description:
    "Contact the 24/7 concierge and reservations team at Signature Art Hotel. Located in F-8, Islamabad, Pakistan. Inquire about suites, dining, and private events.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact & Concierge Reservations | Signature Art Hotel",
    description:
      "Get in touch with the 24/7 concierge desk at Signature Art Hotel in F-8, Islamabad, Pakistan.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
