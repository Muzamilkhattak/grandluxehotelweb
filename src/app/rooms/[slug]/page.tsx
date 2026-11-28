import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Coffee, Bath, Shield, Wind, Maximize, Users, BedDouble } from "lucide-react";
import RoomGallery from "@/components/rooms/RoomGallery";
import BookingWidget from "@/components/booking/BookingWidget";
import { AmenityIcon, parseAmenity, AmenityItem } from "@/components/ui/AmenityIcon";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedParams.slug);
  let room = null;
  if (isUuid) {
    const { data } = await supabase.from("rooms").select("*").eq("id", resolvedParams.slug).maybeSingle();
    room = data;
  }
  if (!room) {
    const { data } = await supabase.from("rooms").select("*").eq("slug", resolvedParams.slug).maybeSingle();
    room = data;
  }

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

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedParams.slug);
  let room = null;
  if (isUuid) {
    const { data } = await supabase.from("rooms").select("*").eq("id", resolvedParams.slug).maybeSingle();
    room = data;
  }
  if (!room) {
    const { data } = await supabase.from("rooms").select("*").eq("slug", resolvedParams.slug).maybeSingle();
    room = data;
  }

  if (!room) {
    notFound();
  }

  const rawAmenities = Array.isArray(room.amenities) 
    ? room.amenities 
    : (typeof room.amenities === 'string' 
        ? (room.amenities.startsWith('[') ? JSON.parse(room.amenities) : room.amenities.split(',').map((s: string) => s.trim()))
        : []);

  const amenitiesList: AmenityItem[] = (rawAmenities || [])
    .filter((a: any) => typeof a === 'string' ? (!a.startsWith('total_rooms:') && !a.startsWith('ical_url:')) : true)
    .map(parseAmenity)
    .filter((a: AmenityItem) => a.name && a.name.trim().length > 0);

  let roomImages: string[] = Array.isArray(room.images) && room.images.length > 0 
    ? [...room.images.filter(Boolean)] 
    : [];
  if (room.image_url && !roomImages.includes(room.image_url)) {
    roomImages.unshift(room.image_url);
  }

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
    amenityFeature: amenitiesList.map((a: AmenityItem) => ({
      "@type": "LocationFeatureSpecification",
      name: a.name,
      value: true,
    })),
    offers: {
      "@type": "Offer",
      price: room.price_per_night,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://signaturearthotel.com"}/rooms/${room.slug}`,
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

          {/* Dynamic Room Amenities Section */}
          {amenitiesList.length > 0 && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#d7b56d]/20">
                <h3 className="font-marcellus text-[26px] md:text-[32px] text-[#000000]">
                  Suite Amenities & Features
                </h3>
                <span className="text-[11.5px] uppercase tracking-[0.2em] font-semibold text-[#d7b56d] bg-black px-4 py-1.5 rounded-full">
                  {amenitiesList.length} Included
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-7 gap-x-12">
                {amenitiesList.map((amenity, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-5"
                  >
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border border-black/15 flex items-center justify-center shrink-0 p-3 shadow-xs">
                      <AmenityIcon amenity={amenity} size={88} className="w-full h-full object-contain" strokeWidth={1.5} />
                    </div>
                    <span className="text-[18px] md:text-[20px] font-jost font-medium text-[#000000] tracking-wide leading-snug">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
