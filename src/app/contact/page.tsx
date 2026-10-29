import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact & Concierge Desk",
  description:
    "Contact the 24/7 concierge and reservations team at Oslo Elite Hotel & Suites. Located on Karl Johans gate in central Oslo, Norway. Inquire about suites, dining, and private events.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact & Concierge Reservations | Oslo Elite Hotel & Suites",
    description:
      "Get in touch with the 24/7 concierge desk at Oslo Elite Hotel & Suites in Oslo, Norway.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
