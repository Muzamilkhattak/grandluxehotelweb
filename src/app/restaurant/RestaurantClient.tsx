"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { RestaurantSettings, MenuItemData } from "@/app/actions/admin-restaurant";

interface Props {
  initialSettings?: RestaurantSettings;
  initialItems?: MenuItemData[];
}

const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "starters", label: "Starters" },
  { id: "mains", label: "Mains" },
  { id: "desserts", label: "Desserts" },
  { id: "drinks", label: "Drinks & Cocktails" },
];

export default function RestaurantClient({ initialSettings, initialItems }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const items = initialItems || [];
  const settings = initialSettings || {
    tagline: "Restaurant & Dining",
    heading: "Our Restaurant Menu",
    subheading: "Crafted with fresh seasonal Nordic ingredients and woodfire mastery.",
    backgroundImage: "/restaurant/interior.jpg",
    buttonText: "Explore Full Menu & Book Table"
  };

  const heroBgImage = settings.backgroundImage || "/restaurant/interior.jpg";

  const filteredItems = activeCategory === "all"
    ? items
    : items.filter((item) => item.category === activeCategory);

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#000000]">
      {/* Restaurant Hero Section with Background Image */}
      <section className="relative bg-[#000000] text-white py-28 md:py-36 overflow-hidden border-b border-white/10">
        {/* Background Image with subtle zoom on load */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroBgImage}
            alt="Oslo Elite Restaurant & Cellar"
            fill
            priority
            sizes="100vw"
            quality={90}
            className="object-cover object-center"
          />
        </div>

        {/* Dark Luxury Gradient Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-black/60 to-black/75 z-10" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-[#000000]/90 z-10" />
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#d7b56d]/15 rounded-full blur-[150px] pointer-events-none z-10" />

        {/* Hero Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
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
                {settings.tagline}
              </span>
              <Sparkles size={14} className="text-[#d7b56d]" />
            </div>
          </div>

          <h1 className="font-marcellus text-4xl sm:text-5xl md:text-6xl text-white tracking-tight mb-4 drop-shadow-md">
            {settings.heading}
          </h1>
          <p className="font-jost text-[16px] sm:text-[18px] md:text-[20px] text-gray-200 leading-relaxed max-w-2xl mx-auto font-light drop-shadow">
            {settings.subheading}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full font-jost text-[13px] uppercase tracking-[0.15em] font-medium transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#000000] text-white shadow-md scale-105"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-[#000000] hover:text-[#000000]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Clean Menu Items List with Rounded Image for Each Item */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-4 sm:gap-5 p-4 rounded-xl bg-white border border-gray-200 hover:border-[#d7b56d] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {/* Circular Picture */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden border-2 border-[#d7b56d]/60 group-hover:border-[#d7b56d] shadow-md group-hover:scale-105 transition-all duration-300">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Menu Details: Name & Price */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h3 className="font-marcellus text-[18px] sm:text-[20px] text-[#000000] group-hover:text-[#d7b56d] transition-colors truncate">
                    {item.name}
                  </h3>
                  
                  {/* Subtle dotted line */}
                  <span className="flex-1 border-b border-dotted border-gray-300 hidden sm:inline-block mx-1" />

                  <span className="font-marcellus text-[17px] sm:text-[19px] text-[#d7b56d] shrink-0 font-semibold">
                    {item.price}
                  </span>
                </div>

                <p className="font-jost text-[13px] sm:text-[13.5px] text-gray-500 leading-snug line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
