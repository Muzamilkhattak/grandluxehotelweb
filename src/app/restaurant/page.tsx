import { Metadata } from "next";
import { getRestaurantData } from "@/app/actions/admin-restaurant";
import RestaurantClient from "./RestaurantClient";

export const metadata: Metadata = {
  title: "Restaurant & Fine Dining Menu | Signature Art Hotel",
  description:
    "Explore the culinary menu at Signature Art Hotel Islamabad. Featuring lavish breakfast selections, authentic Pakistani Karahi, Continental grills, and artisanal beverages.",
  alternates: {
    canonical: "/restaurant",
  },
  openGraph: {
    title: "Restaurant & Fine Dining Menu | Signature Art Hotel",
    description:
      "Explore the culinary menu at Signature Art Hotel Islamabad. Featuring lavish breakfast selections, authentic Pakistani Karahi, Continental grills, and artisanal beverages.",
    url: "/restaurant",
  },
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Signature Art Hotel Restaurant & Dining",
  description: "Fine dining featuring breakfast spreads, Pakistani Karahi specialties, Chinese dishes, Continental grills, and handcrafted beverages in Islamabad.",
  url: "https://signaturearthotel.com/restaurant",
  telephone: "+92 51 8899888",
  priceRange: "$$$",
  servesCuisine: ["Pakistani", "Continental", "Chinese", "Grill"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Islamabad Club Road",
    addressLocality: "Islamabad",
    postalCode: "44000",
    addressCountry: "PK",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "07:00",
      closes: "23:59",
    },
  ],
};

export default async function RestaurantPage() {
  const data = await getRestaurantData();

  return (
    <main className="flex-1 flex flex-col relative w-full overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
      <RestaurantClient 
        initialSettings={data.settings}
        initialItems={data.items}
      />
    </main>
  );
}
