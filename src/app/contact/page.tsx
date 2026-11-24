import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact & Concierge Desk",
  description:
    "Contact the 24/7 concierge and reservations team at Signature Art Hotel. Located at Plot # 3 Street 64, F-8/4, Islamabad, Pakistan (Phone: 0333 1942884). Inquire about suites, dining, and private events.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact & Concierge Reservations | Signature Art Hotel",
    description:
      "Get in touch with the 24/7 concierge desk at Signature Art Hotel, Plot # 3 Street 64, F-8/4, Islamabad, Pakistan. Call 0333 1942884.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
