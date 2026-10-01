import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Users, Maximize, BedDouble, ArrowRight, Check } from "lucide-react";
import AccommodationsClient from "@/components/rooms/AccommodationsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Accommodations & Private Suites | Oslo Elite Hotel",
  description: "Browse all luxury suites, penthouses, and private villas at Oslo Elite Hotel. Book your stay with guaranteed best rates.",
};

export default async function RoomsPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .order("price_per_night", { ascending: false });

  return (
    <main className="bg-[#FAF8F5] min-h-screen text-[#362618]">
      {/* Hero Banner Header */}
      <section className="relative bg-[#0F141C] text-white py-28 md:py-36 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80 z-10" />
        
        {/* Background Decorative Glows */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#C97A4F]/15 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-6">
            <Sparkles size={14} className="text-[#C97A4F]" />
            <span className="font-vogue text-[#D4AF37] tracking-[0.25em] uppercase text-[11px] font-semibold">
              The Collection
            </span>
            <Sparkles size={14} className="text-[#C97A4F]" />
          </div>

          <h1 className="font-marcellus text-[44px] md:text-[68px] leading-[1.1] font-normal mb-6 tracking-wide text-white">
            Accommodations & Suites
          </h1>
          <p className="font-jost text-[17px] md:text-[20px] text-gray-300 leading-relaxed max-w-2xl mx-auto font-light">
            Discover an extraordinary collection of private suites, sky penthouses, and seaside villas crafted for unforgettable stays.
          </p>
        </div>
      </section>

      {/* Accommodations Filterable Grid */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
        <AccommodationsClient initialRooms={rooms || []} />
      </section>
    </main>
  );
}
