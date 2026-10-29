import { Metadata } from "next";
import { getRestaurantData } from "@/app/actions/admin-restaurant";
import RestaurantClient from "./RestaurantClient";

export const metadata: Metadata = {
  title: "Michelin-Inspired Nordic Restaurant & Cellar",
  description:
    "Experience Michelin-inspired Nordic gastronomy, woodfire hearth specialties, and fine vintage cellar pairings at Oslo Elite Hotel in Oslo, Norway.",
  alternates: {
    canonical: "/restaurant",
  },
  openGraph: {
    title: "Michelin-Inspired Nordic Restaurant & Cellar | Oslo Elite Hotel & Suites",
    description:
      "Savor artisanal Scandinavian gastronomy, woodfire dishes, and sommelier-curated wine flights at Oslo Elite Hotel.",
    url: "/restaurant",
  },
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Oslo Elite Hearth & Cellar",
  description: "Michelin-inspired Nordic dining featuring wild seasonal ingredients, woodfire hearth preparations, and rare European vintage pairings.",
  url: "https://osloelitehotel.com/restaurant",
  telephone: "+47 22 00 55 00",
  priceRange: "$$$$",
  servesCuisine: ["Nordic", "Scandinavian", "Modern European"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Karl Johans gate 37",
    addressLocality: "Oslo",
    postalCode: "0162",
    addressCountry: "NO",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "06:30",
      closes: "23:30",
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
