"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RestaurantSettings, MenuItemData } from "@/app/actions/admin-restaurant";
import Tilt3D from "@/components/ui/Tilt3D";

interface Props {
  settings?: RestaurantSettings;
  items?: MenuItemData[];
}

export default function RestaurantSection({ settings: propSettings, items: propItems }: Props) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const settings = propSettings || {
    tagline: "Restaurant & Dining",
    heading: "Our Restaurant",
    subheading: "Discover a curated symphony of wild coastal catches, birch hearth woodfire cuts, and handcrafted Nordic patisserie.",
    backgroundImage: "/restaurant/interior.jpg",
    buttonText: "Explore Full Menu & Book Table"
  };

  const allItems = propItems && propItems.length > 0 ? propItems : [
    {
      id: "1",
      name: "Hitra Sea Scallop & Royal Caviar",
      category: "starters" as const,
      price: "NOK 380",
      description: "Pan-seared Arctic scallops, royal caviar, sweet pea reduction & sea water emulsion.",
      image: "/restaurant/starter.jpg",
    },
    {
      id: "2",
      name: "Hardangerfjord Wild King Salmon",
      category: "mains" as const,
      price: "NOK 460",
      description: "Crispy-skin wild salmon, cold-pressed dill oil emulsion, smoked parsnip puree & gold leaf.",
      image: "/restaurant/salmon.jpg",
    },
    {
      id: "3",
      name: "Birch-Charred Wagyu Tenderloin",
      category: "mains" as const,
      price: "NOK 620",
      description: "45-day dry-aged Wagyu tenderloin over birch coals, winter truffle glaze & king oyster.",
      image: "/restaurant/wagyu.jpg",
    },
    {
      id: "4",
      name: "Barents Red King Crab Consommé",
      category: "starters" as const,
      price: "NOK 390",
      description: "Arctic king crab cluster steamed over seaweed broth with golden saffron & sea fennel.",
      image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "5",
      name: "Smoked Valrhona Cloudberry Sphere",
      category: "desserts" as const,
      price: "NOK 240",
      description: "Valrhona dark chocolate dome, wild Arctic cloudberry sorbet, warm raspberry coulis & gold.",
      image: "/restaurant/dessert.jpg",
    },
    {
      id: "6",
      name: "Smoked Fjord Old Fashioned",
      category: "drinks" as const,
      price: "NOK 220",
      description: "Sherry-cask Linie Aquavit & single malt, torched rosemary, monogram hand-carved ice.",
      image: "/restaurant/cocktail.jpg",
    },
  ];

  const displayedItems = activeTab === "all" 
    ? allItems.slice(0, 8) 
    : allItems.filter((item) => item.category === activeTab).slice(0, 8);

  return (
    <section 
      className="relative py-16 sm:py-24 md:py-36 overflow-hidden"
      style={{ perspective: 1200 }}
    >
      
      {/* 1. Background Image */}
      <div 
        className="absolute inset-0 z-0"
      >
        <Image
          src={settings.backgroundImage || "/restaurant/interior.jpg"}
          alt="Signature Art Hotel Restaurant Ambiance"
          fill
          priority
          className="object-cover"
        />
        {/* Dark Luxury Gradient Overlays */}
        <div className="absolute inset-0 bg-[#000000]/90 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-[#000000]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(215,181,109,0.15)_0%,transparent_75%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2. Top Header with 3D Entrance */}
        <motion.div 
          initial={{ opacity: 0, y: 35, rotateX: 12 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 text-[#d7b56d] font-jost text-[12px] sm:text-[14px] uppercase tracking-[0.25em] font-semibold mb-2 sm:mb-3">
            <Sparkles size={14} />
            <span>{settings.tagline}</span>
          </div>

          <h2 className="font-marcellus text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-3 sm:mb-5">
            {settings.heading}
          </h2>

          <p className="font-jost text-[15px] sm:text-[18px] text-[#FFFFFF]/80 font-light leading-relaxed">
            {settings.subheading}
          </p>

          {/* Simple Clean Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
            {[
              { id: "all", label: "All Curations" },
              { id: "starters", label: "Starters & Raw Bar" },
              { id: "mains", label: "Signature Mains" },
              { id: "desserts", label: "Desserts & Cellar" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 sm:px-5 py-2 text-[12px] sm:text-[13px] font-jost uppercase tracking-[0.16em] transition-all duration-300 rounded-full font-medium cursor-pointer active:scale-95 ${
                  activeTab === tab.id
                    ? "bg-[#d7b56d] text-[#000000] shadow-md shadow-[#d7b56d]/30 scale-105"
                    : "bg-white/10 hover:bg-[#000000] text-[#FFFFFF]/90 border border-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 3. Menu Items List with 3D Tilt Cards & Staggered Reveal */}
        <motion.div 
          layout
          className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 mb-16"
        >
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, delay: idx * 0.05, ease: "easeOut" }}
                className="w-full"
              >
                <Tilt3D maxTilt={5} scale={1.02} glare={true} glareColor="rgba(215, 181, 109, 0.16)">
                  <div className="group flex items-center gap-4 sm:gap-5 p-4 rounded-xl bg-[#000000]/70 hover:bg-[#000000]/95 border border-white/15 hover:border-[#d7b56d] transition-all duration-300 shadow-lg hover:shadow-[0_8px_25px_rgba(215,181,109,0.2)] backdrop-blur-sm">
                    {/* Rounded Picture with smooth zoom on hover */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden border-2 border-[#d7b56d] group-hover:border-[#d7b56d] shadow-[0_0_12px_rgba(215,181,109,0.3)] transition-colors duration-300">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      {/* Name & Price with Dotted Leader */}
                      <div className="flex items-baseline justify-between gap-3 mb-1.5">
                        <h3 className="font-marcellus text-[18px] sm:text-[21px] text-white group-hover:text-[#d7b56d] transition-colors truncate">
                          {item.name}
                        </h3>
                        
                        <span className="flex-1 border-b border-dotted border-white/25 hidden sm:inline-block mx-1" />

                        <span className="font-marcellus text-[18px] sm:text-[20px] text-[#d7b56d] group-hover:text-[#d7b56d] shrink-0 font-bold drop-shadow-[0_2px_8px_rgba(215,181,109,0.35)]">
                          {item.price}
                        </span>
                      </div>

                      {/* Clean Description */}
                      <p className="font-jost text-[13.5px] sm:text-[14px] text-gray-300 group-hover:text-white/90 leading-snug line-clamp-2 transition-colors">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Tilt3D>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 4. Simple Clean CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <Link
            href="/restaurant"
            className="inline-flex items-center gap-3 bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white font-jost uppercase tracking-[0.18em] text-[13.5px] font-semibold px-8 py-4 rounded-full shadow-xl transition-all duration-300 group active:scale-95 border border-[#d7b56d] hover:border-[#000000] hover:-translate-y-0.5"
          >
            <span>{settings.buttonText}</span>
            <ArrowRight size={16} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
