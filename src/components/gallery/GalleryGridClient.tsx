"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export interface GalleryPhoto {
  id: string;
  url: string;
}

/* ─── Default hotel images (fallback when admin hasn't uploaded yet) ─── */
const DEFAULT_IMAGES: GalleryPhoto[] = [
  { id: "d1", url: "/uploads/gallery/1793168068564-Golden_Hotel_Bedroom_Peek.png" },
  { id: "d2", url: "/images/resturantherobg.webp" },
  { id: "d3", url: "/uploads/gallery/1793168155467-OE_0303-01.jpg" },
  { id: "d4", url: "/images/about-main.webp" },
  { id: "d5", url: "/images/pool-bg.webp" },
  { id: "d6", url: "/images/lobby-bg.webp" },
  { id: "d7", url: "/images/suite-bg.webp" },
  { id: "d8", url: "/images/dining-bg.webp" },
];

/* Grid slot definitions: area name + initial translate offsets */
const SLOTS = [
  { area: "one",   x: "-500%", y: "-200%" },
  { area: "two",   x: "-75%",  y: "-200%" },
  { area: "three", x: "200%",  y: "0"     },
  { area: "four",  x: "500%",  y: "-200%" },
  { area: "five",  x: "-500%", y: "100%"  },
  { area: "six",   x: "-200%", y: "0"     },
  { area: "seven", x: "75%",   y: "200%"  },
  { area: "eight", x: "500%",  y: "200%"  },
];

/* ─── Inline CSS injected once into <head> via <style> tag ─── */
const GALLERY_CSS = `
@property --gap {
  syntax: "<length>";
  inherits: true;
  initial-value: 0px;
}
@property --scale {
  syntax: "<number>";
  inherits: true;
  initial-value: 1;
}
@property --x-val {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}
@property --y-val {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}
@property --text-opacity {
  syntax: "<number>";
  inherits: true;
  initial-value: 1;
}
@property --mouse-rotate {
  syntax: "<angle>";
  inherits: true;
  initial-value: 0deg;
}
@property --mouse-w {
  syntax: "<length>";
  inherits: true;
  initial-value: 520px;
}
@property --center-x {
  syntax: "<length>";
  inherits: true;
  initial-value: -210px;
}
@property --center-y {
  syntax: "<length>";
  inherits: true;
  initial-value: -210px;
}

.oslo-gallery-scroll-wrapper {
  min-height: 500svh;
  background: #0a0a0a;
}

.oslo-gallery-grid {
  --gap-base: 10px;
  --size-base: 100px;
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100svh;
  display: grid;
  grid-template-columns: 1fr 2fr var(--size-base) 2fr 1fr;
  grid-template-rows: 1fr var(--size-base) 1fr;
  grid-template-areas:
    "one   two   two    three  four"
    "one   six   center three  eight"
    "five  six   seven  seven  eight";
  gap: 8px;
  background: #0a0a0a;
}

.oslo-gallery-grid .oslo-slot {
  background-size: cover;
  background-position: center;
  animation-name: oslo-animate-boxes;
  animation-timing-function: linear;
  animation-fill-mode: both;
  animation-timeline: scroll();
  animation-duration: 1ms;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.oslo-gallery-grid .oslo-slot::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0);
  transition: background 0.4s ease;
}

.oslo-gallery-grid .oslo-slot:hover::after {
  background: rgba(215,181,109,0.18);
}

.oslo-slot-zoom-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  z-index: 2;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.oslo-gallery-grid .oslo-slot:hover .oslo-slot-zoom-icon {
  opacity: 1;
}

.oslo-gallery-grid .oslo-center {
  grid-area: center;
  background-color: #000;
  border: 1px solid rgba(215,181,109,0.35);
  color: #d7b56d;
  display: grid;
  place-content: center;
  text-align: center;
  width: var(--mouse-w, 520px);
  aspect-ratio: 1;
  translate: var(--center-x) var(--center-y);
  animation-name: oslo-animate-center;
  animation-timing-function: linear;
  animation-fill-mode: both;
  animation-timeline: scroll();
  animation-duration: 1ms;
  overflow: hidden;
  z-index: 5;
  pointer-events: none;
}

.oslo-center-text {
  opacity: var(--text-opacity, 1);
  display: var(--text-display, flex);
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 1rem;
  pointer-events: none;
  user-select: none;
}

@keyframes oslo-animate-boxes {
  0%, 15% {
    translate: var(--slot-x, 0%) var(--slot-y, 0%);
  }
  55%, 100% {
    translate: 0% 0%;
  }
}

@keyframes oslo-animate-center {
  25%, 65% {
    --mouse-w: 260px;
    --center-x: -80px;
    --center-y: -80px;
    --text-opacity: 0;
  }
  100% {
    --mouse-w: calc(var(--size-base, 100px));
    --center-x: 0px;
    --center-y: 0px;
    --text-opacity: 0;
  }
}

/* Area assignments */
.oslo-area-one   { grid-area: one;   }
.oslo-area-two   { grid-area: two;   }
.oslo-area-three { grid-area: three; }
.oslo-area-four  { grid-area: four;  }
.oslo-area-five  { grid-area: five;  }
.oslo-area-six   { grid-area: six;   }
.oslo-area-seven { grid-area: seven; }
.oslo-area-eight { grid-area: eight; }

/* Scroll indicator */
.oslo-scroll-hint {
  position: fixed;
  bottom: 28px;
  left: 50%;
  translate: -50% 0;
  z-index: 10;
  color: rgba(215,181,109,0.7);
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-family: inherit;
  animation: oslo-scroll-bounce 2s ease-in-out infinite;
  pointer-events: none;
  animation-timeline: scroll();
  animation-name: oslo-scroll-hint-fade;
  animation-duration: 1ms;
  animation-fill-mode: both;
  animation-timing-function: linear;
}

@keyframes oslo-scroll-hint-fade {
  0%   { opacity: 1; }
  20%, 100% { opacity: 0; }
}

@supports not (animation-timeline: scroll()) {
  .oslo-no-support-msg {
    display: block !important;
  }
  .oslo-gallery-scroll-wrapper {
    min-height: unset;
  }
  .oslo-gallery-grid {
    position: relative;
    height: auto;
    min-height: 100svh;
  }
  .oslo-gallery-grid .oslo-slot,
  .oslo-gallery-grid .oslo-center {
    animation: none !important;
    translate: 0 0 !important;
    width: auto !important;
  }
}
`;

// ─── CSS custom prop type augmentation ───────────────────────────────
type SlotStyle = React.CSSProperties & {
  "--slot-x"?: string;
  "--slot-y"?: string;
  backgroundImage?: string;
};

export default function GalleryGridClient({ dynamicImages = [] }: { dynamicImages?: any[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /* Merge: dynamic images first, fill rest with defaults up to 8 */
  const rawDyn: GalleryPhoto[] = dynamicImages.map((img, idx) => ({
    id: img.id || `dyn-${idx}`,
    url: img.url,
  }));

  const combined: GalleryPhoto[] = rawDyn.length >= 8
    ? rawDyn.slice(0, 8)
    : [
        ...rawDyn,
        ...DEFAULT_IMAGES.slice(0, 8 - rawDyn.length),
      ];

  /* Lightbox helpers */
  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const currentPhoto = lightboxIndex !== null ? combined[lightboxIndex] : null;

  const showNext = useCallback(() => {
    if (lightboxIndex !== null)
      setLightboxIndex((prev) => (prev! + 1) % combined.length);
  }, [lightboxIndex, combined.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex !== null)
      setLightboxIndex((prev) => (prev! - 1 + combined.length) % combined.length);
  }, [lightboxIndex, combined.length]);

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

  return (
    <>
      {/* Inject gallery styles once */}
      <style dangerouslySetInnerHTML={{ __html: GALLERY_CSS }} />

      {/* Browser support warning (hidden when scroll timeline supported) */}
      <p
        className="oslo-no-support-msg"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 9999,
          color: "white",
          background: "#7c3f00",
          margin: 0,
          padding: "0.75rem 1rem",
          textAlign: "center",
          fontSize: "13px",
        }}
      >
        Your browser does not support CSS Scroll-Driven Animations. Please use Chrome 115+.
      </p>

      {/* Outer scrollable shell */}
      <div className="oslo-gallery-scroll-wrapper">
        {/* Fixed 3×5 grid */}
        <div className="oslo-gallery-grid">
          {/* 8 image slots */}
          {SLOTS.map((slot, i) => {
            const photo = combined[i];
            const slotStyle: SlotStyle = {
              "--slot-x": slot.x,
              "--slot-y": slot.y,
              backgroundImage: photo ? `url(${photo.url})` : undefined,
              backgroundColor: !photo ? "#1a1a1a" : undefined,
            };

            return (
              <div
                key={slot.area}
                className={`oslo-slot oslo-area-${slot.area}`}
                style={slotStyle}
                onClick={() => photo && openLightbox(i)}
                role={photo ? "button" : undefined}
                aria-label={photo ? `Open image ${i + 1}` : undefined}
              >
                {/* Zoom icon on hover */}
                {photo && (
                  <span className="oslo-slot-zoom-icon">
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                      }}
                    >
                      <Maximize2 size={18} />
                    </span>
                  </span>
                )}
              </div>
            );
          })}

          {/* Center element — shrinks on scroll */}
          <div className="oslo-center">
            <div className="oslo-center-text">
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(215,181,109,0.7)",
                  fontFamily: "inherit",
                }}
              >
                Visual Gallery
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  color: "#d7b56d",
                  textTransform: "uppercase",
                }}
              >
                Oslo Elite
              </span>
              <svg
                width="32"
                height="2"
                viewBox="0 0 32 2"
                fill="none"
                style={{ margin: "4px 0" }}
              >
                <rect width="32" height="2" fill="#d7b56d" opacity="0.5" />
              </svg>
              <span
                style={{
                  fontSize: "8px",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "rgba(215,181,109,0.5)",
                }}
              >
                Scroll to Explore
              </span>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="oslo-scroll-hint">↓ Scroll</div>
      </div>

      {/* ─── Full-Screen Lightbox ─── */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-8 select-none"
          style={{ animation: "fadeIn 0.25s ease" }}
          onClick={closeLightbox}
        >
          <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>

          {/* Close */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-[#d7b56d]/80 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Prev */}
          {combined.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); showPrev(); }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-[#d7b56d] text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next */}
          {combined.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); showNext(); }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-[#d7b56d] text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[75vh] sm:h-[80vh]">
              <Image
                src={currentPhoto.url}
                alt="Gallery Preview"
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
            {/* Counter */}
            <div
              style={{
                position: "absolute",
                bottom: -32,
                left: "50%",
                translate: "-50% 0",
                color: "rgba(215,181,109,0.7)",
                fontSize: 12,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              {(lightboxIndex ?? 0) + 1} / {combined.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
