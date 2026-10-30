import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { getGalleryImages } from "@/app/actions/admin-gallery";
import GalleryGridClient from "@/components/gallery/GalleryGridClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Visual Gallery & Architectural Showcase",
  description:
    "Immerse yourself in the visual splendor of Oslo Elite Hotel & Suites. View our grand colonnades, serene reflection pools, luxury suites, and curated hospitality.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Visual Gallery & Architectural Showcase | Oslo Elite Hotel & Suites",
    description:
      "Explore the visual splendor of Oslo Elite Hotel & Suites. From palatial colonnades and reflection pools to bespoke suites and fine dining.",
    url: "/gallery",
  },
};

export default async function GalleryPage() {
  const dynamicImages = await getGalleryImages();

  return (
    <main className="bg-[#0a0a0a] min-h-screen text-white">
      {/* Header Banner */}
      <section className="relative bg-[#000000] text-white py-28 md:py-36 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80 z-10" />
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#d7b56d]/15 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#d7b56d] hover:text-white transition-colors mb-6 text-[12px] uppercase tracking-widest font-medium"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <Sparkles size={14} className="text-[#d7b56d]" />
              <span className="font-vogue text-[#d7b56d] tracking-[0.25em] uppercase text-[11px] font-semibold">
                Visual Anthology
              </span>
            </div>
          </div>

          <h1 className="font-marcellus text-[42px] sm:text-[54px] md:text-[68px] leading-[1.1] font-normal mb-6 tracking-wide text-white">
            The Architectural Gallery
          </h1>
          <p className="font-jost text-[16px] sm:text-[18px] md:text-[20px] text-gray-300 leading-relaxed max-w-2xl mx-auto font-light">
            An immersive visual voyage through our signature suites, palatial white colonnades, serene reflection pools, and timeless Nordic architectural splendor.
          </p>
        </div>
      </section>

      {/* Exact Reference 3-Column Gallery Grid */}
      <GalleryGridClient dynamicImages={dynamicImages} />
    </main>
  );
}
