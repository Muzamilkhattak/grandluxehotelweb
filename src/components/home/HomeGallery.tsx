"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Sparkles, X, ChevronLeft, ChevronRight, Maximize2, MapPin, Compass, ArrowDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getGalleryImages } from "@/app/actions/admin-gallery";

interface GalleryPhoto {
  id: string;
  name: string;
  url: string;
  category: "Suites" | "Architecture" | "Dining" | "Interior" | "Scenic";
  aspect: string;
}

const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "g1",
    name: "The Presidential Suite Sanctuary",
    url: "/uploads/gallery/1793168068564-Golden_Hotel_Bedroom_Peek.png",
    category: "Suites",
    aspect: "aspect-[4/5]",
  },
  {
    id: "g2",
    name: "Grand Architectural Colonnade Facade",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    category: "Architecture",
    aspect: "aspect-[16/10]",
  },
  {
    id: "g3",
    name: "Ambassador Master Bedroom",
    url: "/uploads/gallery/1793168094138-Warm_Golden_Hotel_Bedroom.png",
    category: "Suites",
    aspect: "aspect-[1/1]",
  },
  {
    id: "g4",
    name: "The Hearth Culinary Atelier",
    url: "/images/resturantherobg.webp",
    category: "Dining",
    aspect: "aspect-[16/9]",
  },
  {
    id: "g5",
    name: "Curated Art & Artisan Lounge",
    url: "/uploads/gallery/1793168155467-OE_0303-01.jpg",
    category: "Interior",
    aspect: "aspect-[4/5]",
  },
  {
    id: "g6",
    name: "Atrium Reflection Pool & Skylight",
    url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop",
    category: "Architecture",
    aspect: "aspect-[1/1]",
  },
  {
    id: "g7",
    name: "Bespoke Nordic Furnishings",
    url: "/uploads/gallery/1793168174775-OE_0303-02.jpg",
    category: "Interior",
    aspect: "aspect-[4/3]",
  },
  {
    id: "g8",
    name: "Margalla Hills Panoramic Vista",
    url: "/images/why-oslo/margalla-hills-view.jpg",
    category: "Scenic",
    aspect: "aspect-[16/10]",
  },
  {
    id: "g9",
    name: "Executive Reading Chamber",
    url: "/uploads/gallery/1793168204717-OE_0303-03.jpg",
    category: "Interior",
    aspect: "aspect-[4/5]",
  },
  {
    id: "g10",
    name: "Veranda Sunset Terrace",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
    category: "Architecture",
    aspect: "aspect-[16/9]",
  },
  {
    id: "g11",
    name: "Private Dining Atelier",
    url: "/images/why-oslo/hotel-restaurant.jpg",
    category: "Dining",
    aspect: "aspect-[1/1]",
  },
  {
    id: "g12",
    name: "Capital Sector F-8 Skyline",
    url: "/images/why-oslo/heart-of-islamabad-f7.jpg",
    category: "Scenic",
    aspect: "aspect-[4/3]",
  },
];

export default function HomeGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_GALLERY_PHOTOS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // References for GSAP ScrollTrigger timeline
  const sectionRef = useRef<HTMLElement>(null);
  const introStageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const introSVGRef = useRef<SVGSVGElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const contentPanelRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  // Load user uploaded gallery images if any exist
  useEffect(() => {
    async function loadUserGallery() {
      try {
        const userUploaded = await getGalleryImages();
        if (userUploaded && userUploaded.length > 0) {
          const dynamicPhotos: GalleryPhoto[] = userUploaded.map((u: any, idx: number) => ({
            id: u.id || `uploaded-${idx}`,
            name: "Signature Gallery Exhibit",
            url: u.url,
            category: "Architecture",
            aspect: idx % 3 === 0 ? "aspect-[4/5]" : idx % 3 === 1 ? "aspect-[16/10]" : "aspect-[1/1]",
          }));
          // Prepend user uploads to the editorial gallery
          setPhotos([...dynamicPhotos, ...DEFAULT_GALLERY_PHOTOS]);
        }
      } catch (err) {
        console.error("Gallery loading error:", err);
      }
    }
    loadUserGallery();
  }, []);

  // Filter photos based on category
  const filteredPhotos = selectedCategory === "All"
    ? photos
    : photos.filter((p) => p.category === selectedCategory);

  // GSAP Scroll-Driven SVG Map & Editorial Animation
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const introStage = introStageRef.current;
      const title = titleRef.current;
      const introSVG = introSVGRef.current;
      const introText = introTextRef.current;
      const cityContent = contentPanelRef.current;
      const scrollIndicator = scrollIndicatorRef.current;

      if (!introStage || !introSVG || !cityContent) return;

      const introPaths = introSVG.querySelectorAll<SVGPathElement>(".map-path");
      const hotelSectorPath = introSVG.querySelector<SVGPathElement>("#hotel-sector");
      const hotelPin = introSVG.querySelector<SVGGElement>("#hotel-pin");
      const introTextChars = introText ? introText.querySelectorAll<HTMLSpanElement>(".char-span") : [];

      // Initial state setup for timeline
      gsap.set(introPaths, { strokeDasharray: 900, strokeDashoffset: 900, fill: "transparent" });
      gsap.set(hotelSectorPath, { strokeDasharray: 600, strokeDashoffset: 600, fill: "transparent" });
      if (hotelPin) gsap.set(hotelPin, { opacity: 0, scale: 0.2, transformOrigin: "center center" });
      if (introTextChars.length > 0) gsap.set(introTextChars, { opacity: 0, y: 35 });
      gsap.set(cityContent, { scale: 0.9, opacity: 0.3, y: 80 });

      // Master Timeline
      const tl = gsap.timeline();

      // 1. Initial Title fades out and scrolls away
      if (title) {
        tl.to(title, {
          y: -60,
          opacity: 0,
          duration: 1.6,
          ease: "power2.inOut",
        }, "intro");
      }

      // Scroll hint fades
      if (scrollIndicator) {
        tl.to(scrollIndicator, {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
        }, "intro");
      }

      // 2. SVG Map enters and paths draw with vector precision
      tl.fromTo(
        introSVG,
        { scale: 0.92, opacity: 0.1 },
        { scale: 1, opacity: 1, duration: 2, ease: "power2.out" },
        "intro+=0.2"
      );

      tl.to(
        introPaths,
        {
          strokeDashoffset: 0,
          stagger: 0.04,
          fill: "rgba(215, 181, 109, 0.02)",
          duration: 3,
          ease: "power2.inOut",
        },
        "intro+=0.4"
      );

      // 3. Highlight Sector F-8 in Hotel Brand Gold #d7b56d
      if (hotelSectorPath) {
        tl.to(
          hotelSectorPath,
          {
            strokeDashoffset: 0,
            duration: 2.2,
            stroke: "#d7b56d",
            fill: "rgba(215, 181, 109, 0.22)",
            ease: "power2.out",
          },
          "highlight"
        );
      }

      if (hotelPin) {
        tl.to(
          hotelPin,
          {
            opacity: 1,
            scale: 1,
            duration: 1.8,
            ease: "back.out(2)",
          },
          "highlight+=0.2"
        );
      }

      // 4. Staggered character reveal of "ISLAMABAD • SECTOR F-8"
      if (introTextChars.length > 0) {
        tl.to(
          introTextChars,
          {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 1.4,
            ease: "power2.out",
          },
          "highlight+=0.1"
        );
      }

      // Dim non-highlighted paths slightly to make Sector F-8 stand out
      tl.to(
        introPaths,
        {
          opacity: 0.35,
          duration: 2,
        },
        "highlight+=0.3"
      );

      // 5. The Editorial Photographic Gallery scales up and glides seamlessly into view
      tl.to(
        cityContent,
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 3.5,
          ease: "power3.out",
        },
        "content"
      );

      if (introText) {
        tl.to(
          introText,
          {
            y: -40,
            opacity: 0.85,
            duration: 2.5,
          },
          "content"
        );
      }

      // ScrollTrigger instance pinning the intro presentation
      ScrollTrigger.create({
        animation: tl,
        trigger: introStage,
        start: "top top",
        end: "+=130%",
        scrub: 1.2,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Intersection Observer for photographic items (Greyscale to full-color reveal)
  useEffect(() => {
    const images = document.querySelectorAll<HTMLElement>(".editorial-img-reveal");
    if (!images || images.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    images.forEach((img) => observer.observe(img));

    return () => observer.disconnect();
  }, [filteredPhotos]);

  // Lightbox Navigation
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! + 1) % filteredPhotos.length);
    }
  }, [lightboxIndex, filteredPhotos.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  }, [lightboxIndex, filteredPhotos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  const currentPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section 
      ref={sectionRef} 
      id="gallery" 
      className="bg-[#000000] text-[#FFFFFF] relative overflow-hidden scroll-mt-20 selection:bg-[#d7b56d] selection:text-black"
    >
      {/* =========================================================================
          STAGE 1: CINEMATIC SCROLL-DRIVEN SVG MAP INTRO
          ========================================================================= */}
      <div 
        ref={introStageRef}
        className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6"
      >
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,rgba(215,181,109,0.12)_0%,transparent_75%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.98)_100%)] pointer-events-none" />

        {/* 1. Introductory Big Hero Title */}
        <div 
          ref={titleRef}
          className="absolute z-30 text-center max-w-4xl mx-auto px-4 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a0a0a]/90 border border-[#d7b56d]/40 mb-4 shadow-xl backdrop-blur-md">
            <Sparkles size={13} className="text-[#d7b56d]" />
            <span className="font-vogue text-[#d7b56d] tracking-[0.25em] uppercase text-[11px] sm:text-[12px] font-semibold">
              Visual Journey • Vector Map Edition
            </span>
            <Sparkles size={13} className="text-[#d7b56d]" />
          </div>

          <h2 className="font-marcellus text-4xl sm:text-6xl md:text-7xl lg:text-[84px] text-white leading-[1.05] tracking-tight drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]">
            Signature Art Hotel
          </h2>

          <p className="font-jost text-[15px] sm:text-[18px] md:text-[20px] text-white/75 mt-3 tracking-widest uppercase font-light">
            Architectural Anthology &bull; Islamabad F-8
          </p>
        </div>

        {/* 2. Scroll Prompt Indicator */}
        <div 
          ref={scrollIndicatorRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none text-[#d7b56d]"
        >
          <span className="font-jost text-[10.5px] uppercase tracking-[0.25em] text-[#d7b56d]/90 font-semibold">
            Scroll To Explore Map
          </span>
          <div className="animate-bounce">
            <ArrowDown size={18} className="text-[#d7b56d]" />
          </div>
        </div>

        {/* 3. Architectural Vector SVG Map of Islamabad Capital Grid */}
        <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center z-10">
          <svg
            ref={introSVGRef}
            viewBox="0 0 1000 600"
            className="w-full h-full max-h-[620px] will-change-transform drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d7b56d" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#d7b56d" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#d7b56d" stopOpacity="0" />
              </radialGradient>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Margalla Hills Ridge Contours */}
            <g className="margalla-contours opacity-45">
              <path d="M 40,110 Q 250,55 520,85 T 960,65" className="map-path" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
              <path d="M 60,145 Q 290,95 560,125 T 940,95" className="map-path" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" />
              <path d="M 90,180 Q 340,135 610,165 T 910,135" className="map-path" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
              <text x="120" y="100" fill="rgba(215,181,109,0.4)" fontSize="10" fontFamily="sans-serif" letterSpacing="4">
                MARGALLA HILLS RIDGELINE
              </text>
            </g>

            {/* Primary Sector Arterial Roads */}
            <g className="arteries">
              {/* Margalla Road (Khayaban-e-Iqbal) */}
              <path d="M 120,200 L 890,165" className="map-path" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" fill="none" />
              {/* Jinnah Avenue */}
              <path d="M 160,295 L 870,260" className="map-path" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" fill="none" />
              {/* Srinagar / Kashmir Highway */}
              <path d="M 80,420 L 920,420" className="map-path" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />

              {/* Faisal Avenue (Central Spine) */}
              <path d="M 520,100 L 520,570" className="map-path" stroke="rgba(255,255,255,0.35)" strokeWidth="3" fill="none" />
              {/* 7th Avenue */}
              <path d="M 680,110 L 680,570" className="map-path" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" />
              {/* 9th Avenue */}
              <path d="M 360,130 L 360,570" className="map-path" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" />
            </g>

            {/* Capital Sector Blocks */}
            <g className="sector-blocks">
              {/* Sector E-7 */}
              <path d="M 540,210 L 660,200 L 660,278 L 540,288 Z" className="map-path" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
              <text x="585" y="250" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="sans-serif">E-7</text>

              {/* Sector E-8 */}
              <path d="M 380,224 L 500,214 L 500,292 L 380,302 Z" className="map-path" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
              <text x="425" y="264" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="sans-serif">E-8</text>

              {/* Sector F-6 */}
              <path d="M 700,278 L 840,268 L 840,378 L 700,388 Z" className="map-path" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
              <text x="755" y="335" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="sans-serif">F-6</text>

              {/* Sector F-7 */}
              <path d="M 540,298 L 660,288 L 660,398 L 540,408 Z" className="map-path" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
              <text x="585" y="355" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="sans-serif">F-7</text>

              {/* Sector F-9 (Fatima Jinnah Park) */}
              <path d="M 220,332 L 340,322 L 340,432 L 220,442 Z" className="map-path" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
              <text x="255" y="388" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="sans-serif">F-9 PARK</text>

              {/* Sector G-6, G-7, G-8 */}
              <path d="M 700,430 L 840,430 L 840,540 L 700,540 Z" className="map-path" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <text x="755" y="490" fill="rgba(255,255,255,0.25)" fontSize="11" fontFamily="sans-serif">G-6</text>

              <path d="M 540,430 L 660,430 L 660,540 L 540,540 Z" className="map-path" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <text x="585" y="490" fill="rgba(255,255,255,0.25)" fontSize="11" fontFamily="sans-serif">G-7</text>

              <path d="M 380,430 L 500,430 L 500,540 L 380,540 Z" className="map-path" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <text x="425" y="490" fill="rgba(255,255,255,0.25)" fontSize="11" fontFamily="sans-serif">G-8</text>

              {/* =========================================================
                  TARGET HIGHLIGHT: SECTOR F-8 (SIGNATURE ART HOTEL)
                  ========================================================= */}
              <path 
                id="hotel-sector" 
                d="M 380,312 L 500,302 L 500,412 L 380,422 Z" 
                stroke="#d7b56d" 
                strokeWidth="2.5" 
                fill="none" 
              />
              <text x="425" y="338" fill="#d7b56d" fontSize="12" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">
                SECTOR F-8
              </text>
            </g>

            {/* TARGET HOTEL LOCATION PIN & ILLUMINATION BEACON */}
            <g id="hotel-pin" filter="url(#goldGlow)">
              {/* Outer Pulsing Beacon Circles */}
              <circle cx="440" cy="372" r="34" fill="url(#beaconGlow)" className="animate-ping" style={{ animationDuration: "3s" }} />
              <circle cx="440" cy="372" r="18" fill="none" stroke="#d7b56d" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="440" cy="372" r="8" fill="#d7b56d" />

              {/* Pinpoint Needle */}
              <path 
                d="M 440,350 C 433,350 428,355 428,362 C 428,373 440,387 440,387 C 440,387 452,373 452,362 C 452,355 447,350 440,350 Z" 
                fill="#d7b56d" 
                stroke="#000" 
                strokeWidth="1.5" 
              />
              <circle cx="440" cy="360" r="3" fill="#000" />

              {/* Crosshair target lines */}
              <line x1="410" y1="372" x2="470" y2="372" stroke="#d7b56d" strokeWidth="0.75" strokeDasharray="2 2" />
              <line x1="440" y1="342" x2="440" y2="402" stroke="#d7b56d" strokeWidth="0.75" strokeDasharray="2 2" />

              {/* Landmark Callout Card */}
              <rect x="460" y="340" width="175" height="42" rx="6" fill="#0a0a0a" stroke="#d7b56d" strokeWidth="1.2" />
              <text x="472" y="356" fill="#d7b56d" fontSize="9" fontWeight="bold" letterSpacing="1.5" fontFamily="sans-serif">
                SIGNATURE ART HOTEL
              </text>
              <text x="472" y="372" fill="#FFFFFF" fontSize="8" fontFamily="monospace" opacity="0.8">
                33.7182° N, 73.0445° E
              </text>
            </g>

            {/* Architectural Compass in Bottom Right */}
            <g className="compass-rose opacity-60" transform="translate(860, 480)">
              <circle cx="0" cy="0" r="30" stroke="rgba(215,181,109,0.3)" strokeWidth="1" fill="none" />
              <circle cx="0" cy="0" r="24" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" strokeDasharray="2 2" fill="none" />
              <polygon points="0,-22 4,-6 0,0 -4,-6" fill="#d7b56d" />
              <polygon points="0,22 4,6 0,0 -4,6" fill="rgba(255,255,255,0.3)" />
              <text x="-4" y="-26" fill="#d7b56d" fontSize="9" fontWeight="bold" fontFamily="sans-serif">N</text>
            </g>
          </svg>
        </div>

        {/* 4. Character-by-Character Staggered Headline */}
        <div 
          ref={introTextRef}
          className="absolute bottom-16 sm:bottom-20 z-20 text-center w-full px-4 pointer-events-none"
        >
          <div className="font-marcellus text-2xl sm:text-3xl md:text-5xl tracking-widest text-[#d7b56d] flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            {"ISLAMABAD • SECTOR F-8".split("").map((char, index) => (
              <span 
                key={index} 
                className="char-span inline-block will-change-transform drop-shadow-[0_2px_12px_rgba(215,181,109,0.4)]"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
          <p className="font-jost text-[12px] sm:text-[14px] text-white/60 tracking-[0.3em] uppercase mt-2">
            The Pinnacle Of Hospitality &bull; Coordinates Verified
          </p>
        </div>
      </div>

      {/* =========================================================================
          STAGE 2: SCROLL-REVEALED EDITORIAL MASONRY PHOTOGRAPHIC GALLERY
          ========================================================================= */}
      <div 
        ref={contentPanelRef}
        className="relative z-30 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
      >
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-[#d7b56d] font-jost text-[12px] uppercase tracking-[0.25em] font-semibold mb-2">
              <Sparkles size={14} />
              <span>Curated Photographic Chronicles</span>
            </div>
            <h2 className="font-marcellus text-3xl sm:text-4xl md:text-5xl text-white tracking-wide">
              Editorial Visual Gallery
            </h2>
          </div>

          {/* Luxury Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["All", "Suites", "Architecture", "Dining", "Interior", "Scenic"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full font-jost text-[12px] uppercase tracking-[0.15em] font-medium transition-all duration-300 cursor-pointer active:scale-95 ${
                  selectedCategory === cat
                    ? "bg-[#d7b56d] text-black font-bold shadow-[0_4px_16px_rgba(215,181,109,0.3)] scale-105"
                    : "bg-[#0a0a0a] text-white/70 border border-white/10 hover:border-[#d7b56d] hover:text-[#d7b56d]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Editorial Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 md:gap-6 space-y-5 md:space-y-6">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id + index}
              onClick={() => openLightbox(index)}
              className="group break-inside-avoid relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/10 hover:border-[#d7b56d] transition-all duration-500 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_40px_rgba(215,181,109,0.22)]"
            >
              {/* Image Frame with Editorial Reveal Animation */}
              <div className={`relative w-full ${photo.aspect} overflow-hidden`}>
                <Image
                  src={photo.url}
                  alt={photo.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="editorial-img-reveal object-cover group-hover:scale-108 transition-all duration-700 ease-out"
                  unoptimized={photo.url.startsWith("/uploads/")}
                />

                {/* Dark Luxury Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />

                {/* Category Pill Tag */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="font-vogue text-[9.5px] uppercase tracking-[0.2em] text-[#d7b56d] bg-black/80 px-2.5 py-1 rounded-full border border-[#d7b56d]/40 backdrop-blur-md shadow-md">
                    {photo.category}
                  </span>
                </div>

                {/* Hover Maximize Action Icon */}
                <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 border border-white/20 text-white group-hover:bg-[#d7b56d] group-hover:text-black group-hover:border-[#d7b56d] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl group-hover:scale-110">
                  <Maximize2 size={15} />
                </div>

                {/* Bottom Editorial Caption */}
                <div className="absolute bottom-0 inset-x-0 p-5 z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-marcellus text-[18px] sm:text-[20px] text-white group-hover:text-[#d7b56d] transition-colors leading-snug drop-shadow-md">
                    {photo.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-jost uppercase tracking-widest text-white/60">
                    <MapPin size={11} className="text-[#d7b56d]" />
                    <span>Sector F-8, Islamabad</span>
                  </div>
                </div>

                {/* Luxury Gold Corner Accents */}
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#d7b56d]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#d7b56d]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Empty state safeguard */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-20 text-white/60 font-jost">
            <Compass size={40} className="mx-auto text-[#d7b56d] mb-3 opacity-60" />
            <p className="text-lg">No photos found in this category.</p>
          </div>
        )}
      </div>

      {/* =========================================================================
          STAGE 3: FULLSCREEN LUXURY LIGHTBOX MODAL
          ========================================================================= */}
      {currentPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 md:p-8 animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between z-10 w-full max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="font-vogue text-[11px] uppercase tracking-[0.25em] text-[#d7b56d] bg-black/80 px-3 py-1 rounded-full border border-[#d7b56d]/40">
                {currentPhoto.category}
              </span>
              <span className="text-white/60 font-jost text-xs tracking-wider">
                {lightboxIndex! + 1} / {filteredPhotos.length}
              </span>
            </div>

            <button
              onClick={closeLightbox}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15"
              aria-label="Close Lightbox"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Photo Container with Navigation Arrows */}
          <div 
            className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              onClick={showPrev}
              className="absolute left-2 sm:left-4 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/75 hover:bg-[#d7b56d] text-white hover:text-black border border-white/20 hover:border-[#d7b56d] flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl active:scale-95"
              aria-label="Previous Image"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Lightbox Image */}
            <div className="relative w-full h-full max-h-[75vh] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/15">
              <Image
                src={currentPhoto.url}
                alt={currentPhoto.name}
                fill
                priority
                className="object-contain"
                unoptimized={currentPhoto.url.startsWith("/uploads/")}
              />
            </div>

            {/* Next Button */}
            <button
              onClick={showNext}
              className="absolute right-2 sm:right-4 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/75 hover:bg-[#d7b56d] text-white hover:text-black border border-white/20 hover:border-[#d7b56d] flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl active:scale-95"
              aria-label="Next Image"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Bottom Caption Bar */}
          <div className="z-10 text-center max-w-xl mx-auto">
            <h4 className="font-marcellus text-xl sm:text-2xl text-white drop-shadow">
              {currentPhoto.name}
            </h4>
            <p className="font-jost text-xs text-[#d7b56d] uppercase tracking-[0.2em] mt-1 font-medium">
              Signature Art Hotel &bull; Sector F-8, Islamabad
            </p>
          </div>
        </div>
      )}

      {/* Global Embedded Styles for Intersection Observer Smooth Grayscale Reveal */}
      <style jsx global>{`
        .editorial-img-reveal {
          filter: grayscale(85%) contrast(105%);
          opacity: 0.35;
          transition: filter 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s ease-out;
        }
        .editorial-img-reveal.is-visible {
          filter: grayscale(0%) contrast(100%);
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
