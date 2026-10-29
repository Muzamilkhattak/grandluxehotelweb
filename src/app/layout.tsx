import type { Metadata } from "next";
import { Marcellus, Jost, Playfair_Display } from "next/font/google";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import "./globals.css";

const marcellus = Marcellus({
  weight: "400",
  variable: "--font-marcellus",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-vogue",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://osloelitehotel.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Signature Art Hotel | Luxury 5-Star Boutique Hotel",
    template: "%s | Signature Art Hotel",
  },
  description:
    "Experience bespoke luxury and unmatched comfort at Signature Art Hotel. Opulent rooms, fine dining, and tailored concierge services.",
  keywords: [
    "Signature Art Hotel",
    "luxury hotel",
    "boutique hotel",
    "5-star hotel",
    "luxury suites",
    "hotel booking",
  ],
  authors: [{ name: "Signature Art Hotel" }],
  creator: "Signature Art Hotel",
  publisher: "Signature Art Hotel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Signature Art Hotel",
    title: "Signature Art Hotel | Luxury 5-Star Boutique Hotel",
    description:
      "Experience bespoke luxury and unmatched comfort at Signature Art Hotel. Opulent suites, fine dining, and tailored concierge services.",
    images: [
      {
        url: "/signaturearthotellogo.webp",
        width: 800,
        height: 600,
        alt: "Signature Art Hotel Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Signature Art Hotel | Luxury 5-Star Boutique Hotel",
    description:
      "Experience bespoke luxury at Signature Art Hotel. Opulent suites, fine dining, and white-glove hospitality.",
    images: ["/signaturearthotellogo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/signaturearthotellogo.webp",
    apple: "/signaturearthotellogo.webp",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Hotel",
      "@id": `${siteUrl}/#hotel`,
      name: "Signature Art Hotel",
      description:
        "A bespoke 5-star luxury boutique hotel offering executive suites, fine dining, and personalized concierge hospitality.",
      url: siteUrl,
      logo: `${siteUrl}/signaturearthotellogo.webp`,
      image: `${siteUrl}/signaturearthotellogo.webp`,
      telephone: "+47 22 00 55 00",
      email: "signaturearthotel@gmail.com",
      priceRange: "$$$$",
      currenciesAccepted: "PKR, NOK, EUR, USD, GBP",
      paymentAccepted: "Credit Card, Debit Card",
      checkinTime: "15:00",
      checkoutTime: "12:00",
      starRating: {
        "@type": "Rating",
        ratingValue: "5",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "348",
        bestRating: "5",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "F-8",
        addressLocality: "Islamabad",
        addressCountry: "PK",
      },
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "24/7 Butler Service", value: true },
        { "@type": "LocationFeatureSpecification", name: "High-Speed Wi-Fi", value: true },
        { "@type": "LocationFeatureSpecification", name: "Fine Dining Restaurant", value: true },
        { "@type": "LocationFeatureSpecification", name: "Thermal Spa & Wellness", value: true },
        { "@type": "LocationFeatureSpecification", name: "Private Valet Parking", value: true },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Signature Art Hotel",
      description: "Official booking website for Signature Art Hotel.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/rooms?query={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${marcellus.variable} ${jost.variable} ${playfair.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-jost bg-background text-foreground" suppressHydrationWarning>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
