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

export const metadata: Metadata = {
  title: "Grand Luxe Hotel & Suites",
  description: "A bespoke, high-performance, SEO-optimized luxury hotel booking platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${marcellus.variable} ${jost.variable} ${playfair.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-jost bg-background text-foreground" suppressHydrationWarning>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
