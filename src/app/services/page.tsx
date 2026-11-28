import { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = {
  title: "Tailored Privileges & Services",
  description:
    "Explore our signature hotel services: Online Room Booking, In-House Fine Dining, 24/7 Butler Assistance, Curated Housekeeping, and Private Valet & Parking at Signature Art Hotel.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Tailored Privileges & Services | Signature Art Hotel",
    description:
      "Explore our signature hotel services: Online Room Booking, In-House Fine Dining, 24/7 Butler Assistance, Curated Housekeeping, and Private Valet & Parking at Signature Art Hotel.",
    url: "/services",
  },
};

export default function ServicesPage() {
  return (
    <main className="flex-1 flex flex-col relative w-full overflow-hidden bg-[#FFFFFF]">
      <ServicesClient />
    </main>
  );
}
