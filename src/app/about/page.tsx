import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Our Heritage & Hospitality",
  description:
    "Discover the legacy, architectural design, and 5-star Nordic hospitality philosophy of Oslo Elite Hotel & Suites in Oslo, Norway.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Our Heritage & Hospitality | Oslo Elite Hotel & Suites",
    description:
      "Discover the story, architectural elegance, and world-class hospitality of Oslo Elite Hotel & Suites.",
    url: "/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
