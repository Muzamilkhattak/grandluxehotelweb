"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowLeft, UtensilsCrossed, Clock, Phone, CalendarCheck, Flame } from "lucide-react";
import { RestaurantSettings, MenuItemData } from "@/app/actions/admin-restaurant";

interface Props {
  initialSettings?: RestaurantSettings;
  initialItems?: MenuItemData[];
}

const CATEGORIES = [
  { id: "all", label: "All Curations" },
  { id: "starters", label: "Starters & Raw Bar" },
  { id: "mains", label: "Woodfire Mains" },
  { id: "desserts", label: "Artisan Desserts" },
  { id: "drinks", label: "Cellar & Cocktails" },
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

  const getCategoryCount = (catId: string) => {
    if (catId === "all") return items.length;
    return items.filter((item) => item.category === catId).length;
  };

  const getCategoryBadgeLabel = (cat: string) => {
    switch (cat) {
      case "starters":
        return "Starter";
      case "mains":
        return "Main Course";
      case "desserts":
        return "Dessert";
      case "drinks":
        return "Drink & Cellar";
      default:
        return "Signature";
    }
  };

  return (
    <div className="bg-[#000000] min-h-screen text-white selection:bg-[#d7b56d] selection:text-black">
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

        {/* Dark Luxury Gradient Overlays for optimal readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-black/65 to-black/80 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(215,181,109,0.15)_0%,transparent_75%)] z-10" />
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#d7b56d]/40 backdrop-blur-md shadow-lg">
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
          <p className="font-jost text-[16px] sm:text-[18px] md:text-[20px] text-gray-200 leading-relaxed max-w-2xl mx-auto font-light drop-shadow mb-8">
            {settings.subheading}
          </p>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-300 font-jost">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Clock size={14} className="text-[#d7b56d]" />
              <span>Daily: 06:30 – 23:30</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Flame size={14} className="text-[#d7b56d]" />
              <span>Birch Woodfire & Fresh Fjord Catches</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Phone size={14} className="text-[#d7b56d]" />
              <span>Reservations: +47 22 00 55 00</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(215,181,109,0.08)_0%,transparent_70%)] pointer-events-none" />

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16 relative z-10">
          {CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.id);
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full font-jost text-[12.5px] sm:text-[13px] uppercase tracking-[0.15em] font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-[#d7b56d] text-[#000000] font-bold shadow-[0_4px_20px_rgba(215,181,109,0.35)] scale-105 border border-[#d7b56d]"
                    : "bg-[#0a0a0a] text-gray-300 border border-white/15 hover:border-[#d7b56d] hover:text-[#d7b56d] hover:bg-[#111111]"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-black/20 text-black font-semibold"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clean Luxury Menu Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 relative z-10">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-[#0a0a0a]/90 hover:bg-[#111111] border border-white/10 hover:border-[#d7b56d] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(215,181,109,0.22)] backdrop-blur-sm"
            >
              {/* Circular Picture with Rich Gold Ring */}
              <div className="relative w-18 h-18 sm:w-22 sm:h-22 shrink-0 rounded-full overflow-hidden border-2 border-[#d7b56d] group-hover:border-[#d7b56d] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(215,181,109,0.25)] group-hover:scale-105 transition-all duration-300">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Menu Details: Category Tag, Name, Price & Description */}
              <div className="flex-1 min-w-0">
                {/* Category Pill Tag */}
                <div className="mb-1">
                  <span className="text-[10px] uppercase font-vogue tracking-[0.2em] text-[#d7b56d] font-bold bg-[#d7b56d]/15 px-2 py-0.5 rounded border border-[#d7b56d]/30 inline-block">
                    {getCategoryBadgeLabel(item.category)}
                  </span>
                </div>

                {/* Name & Price with Dotted Leader */}
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <h3 className="font-marcellus text-[18px] sm:text-[20px] text-white group-hover:text-[#d7b56d] transition-colors duration-200 truncate font-normal">
                    {item.name}
                  </h3>
                  
                  {/* Subtle dotted line */}
                  <span className="flex-1 border-b border-dotted border-white/20 hidden sm:inline-block mx-1" />

                  <span className="font-marcellus text-[17px] sm:text-[19px] text-[#d7b56d] group-hover:text-[#d7b56d] shrink-0 font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(215,181,109,0.35)]">
                    {item.price}
                  </span>
                </div>

                {/* Crisp High-Visibility Description */}
                <p className="font-jost text-[13.5px] sm:text-[14px] text-gray-300 group-hover:text-white/90 leading-snug font-light line-clamp-2 transition-colors duration-200">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State if filter yields no items */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-jost">
            <UtensilsCrossed size={36} className="mx-auto text-[#d7b56d]/60 mb-3" />
            <p className="text-lg">No culinary items found in this section.</p>
          </div>
        )}

        {/* Elegant Table Reservation Banner at Bottom */}
        <div className="mt-16 sm:mt-24 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#000000] via-[#0a0a0a] to-[#000000] border border-[#d7b56d]/40 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-[#d7b56d] font-vogue uppercase tracking-[0.25em] text-[11px] font-bold mb-2">
              <Sparkles size={12} />
              <span>Private Dining & Tasting Reservations</span>
            </div>
            <h2 className="font-marcellus text-2xl sm:text-3xl text-white mb-2 font-normal">
              Reserve Your Table for a Michelin-Standard Journey
            </h2>
            <p className="font-jost text-sm sm:text-base text-gray-300 font-light">
              We welcome walk-ins for cocktails and raw bar dining. For multi-course hearth tasting menus and private celebrations, advance booking is recommended.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#d7b56d] hover:bg-white text-black font-jost uppercase tracking-[0.18em] text-[12.5px] font-bold px-6 py-3.5 rounded-full shadow-lg transition-all duration-300"
            >
              <CalendarCheck size={16} />
              <span>Reserve Table</span>
            </Link>
            <a
              href="tel:+4722005500"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#d7b56d] font-jost uppercase tracking-[0.18em] text-[12.5px] font-semibold px-6 py-3.5 rounded-full transition-all duration-300"
            >
              <Phone size={16} className="text-[#d7b56d]" />
              <span>Call Cellar</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
