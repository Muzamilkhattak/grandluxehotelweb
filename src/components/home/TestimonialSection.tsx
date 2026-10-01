"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote: "An absolute masterpiece of hospitality. The attention to detail in the suite and the anticipatory service from the butler exceeded every expectation we had for a luxury stay.",
    name: "Eleanor Vance",
    title: "Diplomat, UK"
  },
  {
    id: 2,
    quote: "The Michelin dining experience while overlooking the skyline was unforgettable. Oslo Elite has set a new standard for luxury. Every interaction was flawlessly executed.",
    name: "Marcus Sterling",
    title: "CEO, Sterling Global"
  },
  {
    id: 3,
    quote: "A true sanctuary. The acoustic privacy allowed for complete relaxation, while the curated art and architectural mastery provided endless inspiration. Simply flawless.",
    name: "Sophia Laurent",
    title: "International Architect"
  }
];

export default function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoplay]);

  const handleNext = () => {
    setAutoplay(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setAutoplay(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative py-32 w-full overflow-hidden flex items-center justify-center min-h-[800px]">
      {/* Background Image & Overlays */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop" 
          alt="Luxury Hotel Lobby" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#362618]/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full flex flex-col items-center">
        
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-vogue text-[#C97A4F] tracking-[0.2em] uppercase text-[12px] mb-4"
          >
            Guest Chronicles
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-marcellus text-[40px] md:text-[56px] text-[#FAF8F5] leading-tight"
          >
            Whispers of Excellence
          </motion.h2>
        </div>

        <div className="relative w-full max-w-4xl mx-auto">
          {/* Quote Icon Background */}
          <div className="absolute -top-16 -left-12 text-[#C97A4F]/10 z-0 hidden md:block">
            <Quote size={180} className="transform rotate-180" strokeWidth={0.5} />
          </div>

          {/* Slider Container */}
          <div className="relative h-[350px] md:h-[300px] w-full perspective-[1000px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50, rotateY: -10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -50, rotateY: 10 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-14 flex flex-col items-center justify-center text-center shadow-[0_32px_64px_rgba(0,0,0,0.4)]"
              >
                <div className="flex gap-1 text-[#C97A4F] mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="font-marcellus text-[20px] md:text-[28px] leading-[1.6] text-[#FAF8F5] mb-8 italic">
                  "{testimonials[currentIndex].quote}"
                </p>
                <div className="flex flex-col items-center">
                  <h4 className="font-jost font-medium text-[16px] uppercase tracking-[0.2em] text-[#FAF8F5]">
                    {testimonials[currentIndex].name}
                  </h4>
                  <span className="font-vogue text-[10px] uppercase tracking-[0.2em] text-[#C97A4F] mt-3">
                    {testimonials[currentIndex].title}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-16 relative z-20">
            <button 
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#362618] transition-colors"
            >
              <ChevronLeft size={20} strokeWidth={1} />
            </button>
            <div className="flex gap-3">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAutoplay(false);
                    setCurrentIndex(idx);
                  }}
                  className={`transition-all duration-500 rounded-full ${
                    idx === currentIndex ? "w-8 h-1 bg-[#C97A4F]" : "w-2 h-1 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#362618] transition-colors"
            >
              <ChevronRight size={20} strokeWidth={1} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
