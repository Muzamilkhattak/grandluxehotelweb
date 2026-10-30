"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Sparkles, X, ChevronLeft, ChevronRight, Maximize2, Compass, ArrowDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getGalleryImages } from "@/app/actions/admin-gallery";
import pakistanPaths from "@/data/pakistan-map-paths.json";

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
    let isMounted = true;
    async function loadUserGallery() {
      try {
        const userUploaded = await getGalleryImages();
        if (isMounted && userUploaded && userUploaded.length > 0) {
          const dynamicPhotos: GalleryPhoto[] = userUploaded.map((u: any, idx: number) => ({
            id: u.id || `uploaded-${idx}`,
            name: "Signature Gallery Exhibit",
            url: u.url,
            category: "Architecture",
            aspect: idx % 3 === 0 ? "aspect-[4/5]" : idx % 3 === 1 ? "aspect-[16/10]" : "aspect-[1/1]",
          }));
          // Prepend user uploads to the editorial gallery
          if (isMounted) {
            setPhotos([...dynamicPhotos, ...DEFAULT_GALLERY_PHOTOS]);
          }
        }
      } catch (err) {
        console.error("Gallery loading error:", err);
      }
    }
    loadUserGallery();
    return () => {
      isMounted = false;
    };
  }, []);

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
      const capitalPath = introSVG.querySelector<SVGPathElement>("#PKIS");
      const nonCapitalPaths = introSVG.querySelectorAll<SVGPathElement>(".map-path:not(#PKIS)");
      const beacon = introSVG.querySelector<SVGGElement>("#islamabad-beacon");
      const introTextChars = introText ? introText.querySelectorAll<HTMLSpanElement>(".char-span") : [];

      // Initial state setup for timeline: strokeDasharray & offset
      introPaths.forEach((path) => {
        let len = 2500;
        try {
          len = Math.ceil(path.getTotalLength()) || 2500;
        } catch {}
        gsap.set(path, { strokeDasharray: len + 30, strokeDashoffset: len + 30, fill: "transparent" });
      });

      if (beacon) gsap.set(beacon, { opacity: 0, scale: 0.3, transformOrigin: "center center" });

      // Staggered even/odd character offsets matching the reference CodePen
      introTextChars.forEach((char, i) => {
        gsap.set(char, {
          opacity: 0,
          y: i % 2 === 0 ? 40 : -40,
        });
      });

      gsap.set(cityContent, { scale: 0.88, opacity: 0.3 });

      // Master Timeline matching the Scroll-Driven Map Editorial pattern
      const tl = gsap.timeline();

      // 1. Initial Title fades out and scrolls away
      if (title) {
        tl.to(title, {
          y: -80,
          opacity: 0,
          duration: 1.8,
          ease: "power2.inOut",
        }, "intro");
      }

      // Scroll hint fades
      if (scrollIndicator) {
        tl.to(scrollIndicator, {
          y: 40,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
        }, "intro");
      }

      // 2. SVG Pakistan Map enters and provincial vector boundaries draw
      tl.fromTo(
        introSVG,
        { scale: 0.92, opacity: 0.15 },
        { scale: 1, opacity: 1, duration: 2, ease: "power2.out" },
        "intro+=0.2"
      );

      tl.to(
        introPaths,
        {
          strokeDashoffset: 0,
          stagger: 0.08,
          fill: "rgba(215, 181, 109, 0.03)",
          duration: 3,
          ease: "power2.inOut",
        },
        "intro+=0.4"
      );

      // 3. Highlight Islamabad Capital Territory (#PKIS) in Hotel Brand Gold #d7b56d
      if (capitalPath) {
        tl.to(
          capitalPath,
          {
            duration: 2.5,
            stroke: "#d7b56d",
            strokeWidth: 3,
            fill: "rgba(215, 181, 109, 0.45)",
            ease: "power2.out",
          },
          "highlight"
        );
      }

      // 4. Pinpoint Beacon & Coordinate Callout illumination
      if (beacon) {
        tl.to(
          beacon,
          {
            opacity: 1,
            scale: 1,
            duration: 1.8,
            ease: "back.out(2)",
          },
          "highlight+=0.1"
        );
      }

      // 5. Staggered character reveal of "ISLAMABAD • PAKISTAN"
      if (introTextChars.length > 0) {
        tl.to(
          introTextChars,
          {
            y: 0,
            opacity: 1,
            stagger: 0.035,
            duration: 1.6,
            ease: "power2.out",
          },
          "highlight-=0.1"
        );
      }

      // 6. Dim surrounding provincial paths to make Islamabad stand out
      tl.to(
        nonCapitalPaths,
        {
          opacity: 0.35,
          duration: 2.5,
        },
        "highlight-=0.1"
      );

      // 7. Gallery panel glides smoothly into view and scales up
      tl.to(
        cityContent,
        {
          scale: 1,
          opacity: 1,
          duration: 3.5,
          ease: "power2.out",
        },
        "content"
      );

      if (introText) {
        tl.to(
          introText,
          {
            y: -120,
            opacity: 0.9,
            scale: 0.85,
            duration: 3,
          },
          "content"
        );
      }

      // ScrollTrigger instance pinning the intro presentation smoothly
      ScrollTrigger.create({
        animation: tl,
        trigger: introStage,
        start: "top top",
        end: "+=120%",
        scrub: 1.2,
        pin: true,
        pinSpacing: false,
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Intersection Observer for photographic items: Smooth grayscale-to-color & float entrance
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".editorial-card");
    if (!cards || cards.length === 0) return;

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
      { 
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [photos]);

  // Lightbox Navigation
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! + 1) % photos.length);
    }
  }, [lightboxIndex, photos.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! - 1 + photos.length) % photos.length);
    }
  }, [lightboxIndex, photos.length]);

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

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <section 
      ref={sectionRef} 
      id="gallery" 
      className="bg-[#000000] text-[#FFFFFF] relative overflow-hidden scroll-mt-20 selection:bg-[#d7b56d] selection:text-black"
    >
      {/* =========================================================================
          STAGE 1: CINEMATIC SCROLL-DRIVEN SVG MAP INTRO (PAKISTAN VECTOR MAP)
          ========================================================================= */}
      <div 
        ref={introStageRef}
        className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6"
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
              Visual Journey • Geographic Edition
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

        {/* 3. Authentic Geographic Vector SVG Map of Pakistan with Islamabad Highlight */}
        <div className="relative w-full max-w-4xl h-[72vh] flex items-center justify-center z-10">
          <svg
            ref={introSVGRef}
            viewBox="0 0 1000 959"
            className="w-full h-full max-h-[660px] will-change-transform drop-shadow-[0_0_40px_rgba(0,0,0,0.95)]"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d7b56d" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#d7b56d" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#d7b56d" stopOpacity="0" />
              </radialGradient>
              <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Pakistan Real Geographic Vector Map */}
            <g id="pakistan-provinces">
              {pakistanPaths.map((province) => (
                <path
                  key={province.id}
                  id={province.id}
                  d={province.d}
                  className={`map-path ${province.id === "PKIS" ? "capital-path" : "province-path"}`}
                  stroke={province.id === "PKIS" ? "#d7b56d" : "rgba(255, 255, 255, 0.45)"}
                  strokeWidth={province.id === "PKIS" ? "2.5" : "1.8"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="transparent"
                />
              ))}
            </g>

            {/* Authentic Islamabad Location Pinpoint Beacon (PKIS center: 730, 278) */}
            <g id="islamabad-beacon" transform="translate(730, 278)" filter="url(#goldGlow)">
              {/* Outer Pulsing Beacon Circles */}
              <circle r="42" fill="url(#beaconGlow)" className="animate-ping" style={{ animationDuration: "2.5s" }} />
              <circle r="20" fill="none" stroke="#d7b56d" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle r="7" fill="#d7b56d" />

              {/* Pin Needle */}
              <path 
                d="M 0,-30 C -7,-30 -13,-24 -13,-17 C -13,-5 0,0 0,0 C 0,0 13,-5 13,-17 C 13,-24 7,-30 0,-30 Z" 
                fill="#d7b56d" 
                stroke="#000000" 
                strokeWidth="1.5" 
              />
              <circle cx="0" cy="-17" r="3.5" fill="#000000" />

              {/* Crosshair target lines */}
              <line x1="-28" y1="0" x2="28" y2="0" stroke="#d7b56d" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="0" y1="-28" x2="0" y2="28" stroke="#d7b56d" strokeWidth="0.8" strokeDasharray="3 3" />

              {/* Landmark Callout Card */}
              <g transform="translate(22, -38)">
                <rect x="0" y="0" width="168" height="42" rx="6" fill="#0a0a0a" stroke="#d7b56d" strokeWidth="1.5" />
                <text x="12" y="17" fill="#d7b56d" fontSize="9.5" fontWeight="bold" letterSpacing="2" fontFamily="sans-serif">
                  ISLAMABAD • F-8
                </text>
                <text x="12" y="32" fill="#FFFFFF" fontSize="8" fontFamily="monospace" opacity="0.85">
                  33.7182° N, 73.0445° E
                </text>
              </g>
            </g>

            {/* Authentic Architectural Compass */}
            <g className="compass-rose opacity-60" transform="translate(890, 860)">
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
          className="absolute bottom-14 sm:bottom-18 z-20 text-center w-full px-4 pointer-events-none transition-transform"
        >
          <div className="font-marcellus text-2xl sm:text-3xl md:text-5xl tracking-widest text-[#d7b56d] flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            {"ISLAMABAD • PAKISTAN".split("").map((char, index) => (
              <span 
                key={index} 
                className="char-span inline-block will-change-transform drop-shadow-[0_2px_12px_rgba(215,181,109,0.4)]"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
          <p className="font-jost text-[11px] sm:text-[13px] text-white/60 tracking-[0.3em] uppercase mt-2">
            Signature Art Hotel &bull; Sector F-8
          </p>
        </div>
      </div>

      {/* =========================================================================
          STAGE 2: SCROLL-REVEALED EDITORIAL MASONRY PHOTOGRAPHIC GALLERY
          ========================================================================= */}
      <div 
        ref={contentPanelRef}
        className="relative z-30 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24"
      >
        {/* Subtle Ambient Top Fade into Gallery */}
        <div className="w-full h-12 -mt-6 mb-4 bg-gradient-to-b from-transparent to-[#000000] pointer-events-none" />

        {/* 3-Column Editorial Masonry Grid — Pure Imagery With Staggered Reveal Animation */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 md:gap-6 space-y-5 md:space-y-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id + index}
              onClick={() => openLightbox(index)}
              className="editorial-card group break-inside-avoid relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/10 hover:border-[#d7b56d] cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_40px_rgba(215,181,109,0.25)]"
              style={{
                transitionDelay: `${(index % 3) * 90}ms`,
              }}
            >
              {/* Pure Photographic Image Frame with Smooth Grayscale to Color & Hover Zoom */}
              <div className={`relative w-full ${photo.aspect} overflow-hidden`}>
                <Image
                  src={photo.url}
                  alt="Oslo Elite Hotel Gallery Exhibit"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  unoptimized={photo.url.startsWith("/uploads/")}
                />

                {/* Subtle Luxury Darkening on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />

                {/* Centered Expand Action Pill on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-black/80 border border-[#d7b56d] text-[#d7b56d] flex items-center justify-center shadow-2xl backdrop-blur-md transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Maximize2 size={18} />
                  </div>
                </div>

                {/* Luxury Gold Corner Accents on Hover */}
                <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t border-r border-[#d7b56d]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b border-l border-[#d7b56d]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Empty state safeguard */}
        {photos.length === 0 && (
          <div className="text-center py-20 text-white/60 font-jost">
            <Compass size={40} className="mx-auto text-[#d7b56d] mb-3 opacity-60" />
            <p className="text-lg">No photos found in gallery.</p>
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
              <span className="font-vogue text-[11px] uppercase tracking-[0.25em] text-[#d7b56d] bg-black/80 px-3.5 py-1.5 rounded-full border border-[#d7b56d]/40">
                Signature Gallery
              </span>
              <span className="text-white/60 font-jost text-xs tracking-wider">
                {lightboxIndex! + 1} / {photos.length}
              </span>
            </div>

            <button
              onClick={closeLightbox}
              className="p-2.5 rounded-full bg-white/10 hover:bg-[#d7b56d] hover:text-black text-white transition-colors cursor-pointer border border-white/15"
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
            <div className="relative w-full h-full max-h-[78vh] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/15">
              <Image
                src={currentPhoto.url}
                alt="Oslo Elite Hotel Gallery Photograph"
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

          {/* Bottom Minimal Indicator */}
          <div className="z-10 text-center max-w-xl mx-auto">
            <p className="font-jost text-xs text-[#d7b56d] uppercase tracking-[0.25em] font-medium">
              Signature Art Hotel &bull; Sector F-8, Islamabad
            </p>
          </div>
        </div>
      )}

      {/* Global Embedded Styles for Intersection Observer Smooth Grayscale to Color Reveal */}
      <style jsx global>{`
        .editorial-card {
          opacity: 0;
          filter: grayscale(100%);
          transform: translateY(32px) scale(0.97);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
                      filter 1.2s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 1s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.4s ease,
                      box-shadow 0.4s ease;
          will-change: opacity, filter, transform;
        }
        .editorial-card.is-visible {
          opacity: 1;
          filter: grayscale(0%);
          transform: translateY(0) scale(1);
        }
      `}</style>
    </section>
  );
}
