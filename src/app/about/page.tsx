import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us | Where Art Meets Hospitality | Signature Art Hotel",
  description:
    "Signature Art Hotel is a place where comfort and creativity come together. Discover warm hospitality, handcrafted comfort, and cultural elegance in Islamabad.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Where Art Meets Hospitality | Signature Art Hotel",
    description:
      "Signature Art Hotel is a place where comfort and creativity come together. Discover warm hospitality, handcrafted comfort, and cultural elegance in Islamabad.",
    url: "/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
