"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop",
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000); // Slide every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={src}
            alt={`Luxury Hotel View ${index + 1}`}
            fill
            className={`object-cover transition-transform duration-[15000ms] ease-linear ${
              index === currentIndex ? "scale-110" : "scale-100"
            }`}
            priority={index === 0}
          />
        </div>
      ))}
      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/50 via-black/20 to-background/95"></div>
      
      {/* Slider Indicators */}
      <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-500 rounded-full ${
              idx === currentIndex ? "w-8 h-1.5 bg-gold" : "w-2 h-1.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
