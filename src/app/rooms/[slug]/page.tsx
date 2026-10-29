import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Coffee, Bath, Shield, Wind, Maximize, Users, BedDouble } from "lucide-react";
import RoomGallery from "@/components/rooms/RoomGallery";
import BookingWidget from "@/components/booking/BookingWidget";
import { getAmenityIcon } from "@/components/ui/AmenityIcon";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: room } = await supabase.from("rooms").select("*").eq("slug", resolvedParams.slug).single();

  if (!room) return { title: "Suite Not Found | Signature Art Hotel" };

  const roomTitle = room.title;
  const roomDesc = room.description || `Book your stay at ${room.title} at Signature Art Hotel with best rate guaranteed and personalized butler care.`;
  const roomImage = room.image_url || "/signaturearthotellogo.webp";
  const canonicalUrl = `/rooms/${room.slug}`;

  return {
    title: roomTitle,
    description: roomDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: roomTitle,
      description: roomDesc,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: roomImage,
          width: 1200,
          height: 800,
          alt: room.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: roomTitle,
      description: roomDesc,
      images: [roomImage],
    },
  };
}

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (error || !room) {
    notFound();
  }

  const rawAmenities = Array.isArray(room.amenities) 
    ? room.amenities 
    : (typeof room.amenities === 'string' ? JSON.parse(room.amenities) : ["Luxury Bedding", "Mini Bar", "Room Service"]);

  const amenitiesList = rawAmenities.filter((a: string) => !a.startsWith('total_rooms:'));

  const roomImages: string[] = Array.isArray(room.images) && room.images.length > 0 
    ? room.images 
    : (room.image_url ? [room.image_url] : []);

  const roomJsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.title,
    description: room.description,
    image: roomImages,
    bed: {
      "@type": "BedDetails",
      numberOfBeds: room.bed_count || 1,
      typeOfBed: room.bed_type || "King Size",
    },
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: room.capacity || 2,
    },
    amenityFeature: amenitiesList.map((a: string) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    })),
    offers: {
      "@type": "Offer",
      price: room.price_per_night,
      priceCurrency: "NOK",
      availability: "https://schema.org/InStock",
      url: `https://osloelitehotel.com/rooms/${room.slug}`,
    },
  };

  return (
    <main className="bg-[#FFFFFF] min-h-screen font-jost text-[#000000]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(roomJsonLd) }}
      />
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#d7b56d] hover:text-[#000000] transition-colors mb-6 text-[11px] uppercase tracking-widest font-medium">
          <ArrowLeft size={14} /> Return to Suites Collection
        </Link>
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#000000]/60 flex items-center">
          <Link href="/" className="hover:text-[#000000] transition-colors">Home</Link> <span className="mx-3">/</span>
          <Link href="/rooms" className="hover:text-[#000000] transition-colors">Suites</Link> <span className="mx-3">/</span>
          <span className="text-[#000000] font-medium">{room.title}</span>
        </div>
      </div>

      {/* Dynamic Multi-Image Media Showcase */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <RoomGallery images={roomImages} title={room.title} />
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-32 grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
        
        {/* Left Column - Room Story */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Header & Specs Ribbon */}
          <div className="border-b border-[#d7b56d]/15 pb-10">
            <h1 className="font-marcellus text-[48px] md:text-[64px] leading-[1.1] text-[#000000] mb-8">{room.title}</h1>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2.5 bg-white border border-[#d7b56d]/20 px-5 py-2.5 text-[12px] uppercase tracking-[0.1em] text-[#000000] shadow-sm">
                <Users size={16} className="text-[#d7b56d]" /> Up to {room.capacity} Guests
              </div>
            </div>
          </div>

          {/* Descriptive Narrative */}
          <div className="prose prose-lg text-[#000000]/80 font-jost font-light leading-[1.8] max-w-none">
            <p className="text-[18px]">{room.description || "Immerse yourself in unparalleled luxury. This meticulously curated suite offers floor-to-ceiling panoramic views, bespoke designer furnishings, and an ambient tranquility that instantly isolates you from the bustling world outside."}</p>
          </div>

          {/* Highlights Grid */}
          <div>
            <h3 className="font-marcellus text-[32px] text-[#000000] mb-8">Signature Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Bath size={32} strokeWidth={1} />, label: "Marble Bath" },
                { icon: <Shield size={32} strokeWidth={1} />, label: "24/7 Butler" },
                { icon: <Coffee size={32} strokeWidth={1} />, label: "Espresso Bar" },
                { icon: <Wind size={32} strokeWidth={1} />, label: "Acoustic Privacy" }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-8 bg-white border border-[#d7b56d]/10 text-center hover:border-[#d7b56d]/40 hover:shadow-[0_8px_24px_rgba(126,101,46,0.05)] transition-all duration-500 group">
                  <div className="text-[#d7b56d] mb-5 group-hover:scale-110 transition-transform duration-500">{feature.icon}</div>
                  <span className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#000000]">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Amenities List */}
          <div>
            <h3 className="font-marcellus text-[32px] text-[#000000] mb-8">Suite Amenities</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
              {amenitiesList.map((amenity: string, i: number) => (
                <li key={i} className="flex items-center gap-4 text-[#000000]/70 text-[16px]">
                  <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#d7b56d]/20 flex items-center justify-center flex-shrink-0 text-[#d7b56d]">
                    {getAmenityIcon(amenity, 12)}
                  </div>
                  {amenity}
                </li>
              ))}
            </ul>
          </div>

          {/* Stay Policies */}
          <div className="bg-white p-10 border border-[#d7b56d]/15 shadow-sm">
            <h3 className="font-marcellus text-[28px] text-[#000000] mb-8">Stay Policies</h3>
            <div className="space-y-6 text-[#000000]/80 text-[15px]">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#d7b56d]/10 pb-6">
                <span className="uppercase tracking-[0.15em] text-[12px] font-medium text-[#000000] mb-2 sm:mb-0">Check-in</span>
                <span>After 3:00 PM</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#d7b56d]/10 pb-6">
                <span className="uppercase tracking-[0.15em] text-[12px] font-medium text-[#000000] mb-2 sm:mb-0">Check-out</span>
                <span>Before 11:00 AM</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between pb-2">
                <span className="uppercase tracking-[0.15em] text-[12px] font-medium text-[#000000] mb-2 sm:mb-0">Cancellation</span>
                <span className="sm:text-right leading-relaxed text-[#000000]/70">Free cancellation up to 48 hours prior.<br/>100% charge applies thereafter.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sticky Reservation Folio */}
        <div className="lg:col-span-1">
          <div className="sticky top-10">
            <BookingWidget room={room} />
          </div>
        </div>

      </div>
    </main>
  );
}
