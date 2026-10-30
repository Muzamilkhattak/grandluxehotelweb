"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import Tilt3D from "@/components/ui/Tilt3D";

const testimonials = [
  {
    id: 1,
    quote: "Hands down the best hotel in Islamabad F-8. We stayed for four nights during a corporate conference and Signature Art Hotel exceeded every expectation. Spotless executive suites, peaceful sector F-8 location, and the concierge hospitality is truly second to none.",
    name: "Hamza Tariq",
    title: "Corporate Director, Karachi"
  },
  {
    id: 2,
    quote: "Finding a calm, aesthetic sanctuary in the capital can be difficult, but Signature Art Hotel in F-8 Islamabad is a true masterclass. Beautifully curated art decor, ultra-comfortable beds, and delicious dining. Undoubtedly the best hotel in Islamabad F-8 for luxury stays.",
    name: "Dr. Ayesha Malik",
    title: "Healthcare Consultant, Islamabad"
  },
  {
    id: 3,
    quote: "I travel frequently between Dubai and Islamabad, and Signature Art Hotel has become my permanent address in the city. Located right in prime F-8 Islamabad with scenic Margalla Hills views nearby. Easily the best hotel in Islamabad F-8 with genuine 5-star personalized hospitality.",
    name: "Bilal & Zainab Farooq",
    title: "Overseas Residents, Dubai (UAE)"
  },
  {
    id: 4,
    quote: "From the seamless online booking to the 24/7 attentive room service, our family stay at Signature Art Hotel was pure perfection. The security in F-8 is top notch, and the rooms feel like a luxury art gallery. The best hotel in Islamabad F-8 by a mile.",
    name: "Omer Sheikh",
    title: "Tech Entrepreneur, Lahore"
  }
];

export default function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  // Vertical Scroll Parallax for Background Image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });
  const yBg = useTransform(smoothProgress, [0, 1], ["-10%", "10%"]);
  const scaleBg = useTransform(smoothProgress, [0, 1], [1.08, 1.18]);
  const yQuote = useTransform(smoothProgress, [0, 1], [-40, 40]);

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
    <section 
      ref={sectionRef}
      className="relative py-16 sm:py-24 md:py-32 w-full overflow-hidden flex items-center justify-center min-h-[580px] sm:min-h-[680px] md:min-h-[750px]"
      style={{ perspective: 1200 }}
    >
      {/* Background Image with Vertical Scroll Parallax */}
      <motion.div 
        style={{ y: yBg, scale: scaleBg }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        <Image 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop" 
          alt="Luxury Hotel Lobby" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#000000]/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/75" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full flex flex-col items-center">
        
        {/* Header with 3D Entrance */}
        <div className="text-center mb-10 sm:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 25, rotateX: 12 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="font-vogue text-[#d7b56d] tracking-[0.2em] uppercase text-[11px] sm:text-[12px] mb-3 sm:mb-4"
          >
            Guest Chronicles
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 25, rotateX: 12 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-marcellus text-3xl sm:text-4xl md:text-[56px] text-[#FFFFFF] leading-tight"
          >
            Whispers of Excellence
          </motion.h2>
        </div>

        <div className="relative w-full max-w-4xl mx-auto">
          {/* Quote Icon Background with Counter Parallax */}
          <motion.div 
            style={{ y: yQuote }}
            className="absolute -top-16 -left-12 text-[#d7b56d]/15 z-0 hidden md:block will-change-transform pointer-events-none"
          >
            <Quote size={180} className="transform rotate-180" strokeWidth={0.5} />
          </motion.div>

          {/* 3D Perspective Slider Container */}
          <div className="relative min-h-[420px] sm:min-h-[340px] md:min-h-[320px] w-full" style={{ perspective: 1200 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 70, rotateY: -16, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, x: -70, rotateY: 16, scale: 0.94 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                <Tilt3D maxTilt={5} scale={1.01} glare={true} glareColor="rgba(215, 181, 109, 0.14)">
                  <div className="bg-white/5 backdrop-blur-md border border-white/15 hover:border-[#d7b56d]/50 p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-[0_32px_64px_rgba(0,0,0,0.5)] rounded-2xl transition-colors duration-500">
                    <div className="flex gap-1.5 text-[#d7b56d] mb-4 sm:mb-6">
                      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="font-marcellus text-[16px] sm:text-[20px] md:text-[26px] leading-[1.6] text-[#FFFFFF] mb-6 sm:mb-8 italic drop-shadow-sm">
                      "{testimonials[currentIndex].quote}"
                    </p>
                    <div className="flex flex-col items-center">
                      <h4 className="font-jost font-medium text-[14px] sm:text-[16px] uppercase tracking-[0.2em] text-[#FFFFFF]">
                        {testimonials[currentIndex].name}
                      </h4>
                      <span className="font-vogue text-[10px] uppercase tracking-[0.2em] text-[#d7b56d] mt-2 sm:mt-3">
                        {testimonials[currentIndex].title}
                      </span>
                    </div>
                  </div>
                </Tilt3D>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-16 relative z-20">
            <button 
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#000000] transition-all duration-300 active:scale-95 cursor-pointer shadow-md"
              aria-label="Previous testimonial"
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
                  className={`transition-all duration-500 rounded-full cursor-pointer ${
                    idx === currentIndex ? "w-8 h-1.5 bg-[#d7b56d] shadow-[0_0_10px_rgba(215,181,109,0.8)]" : "w-2.5 h-1.5 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#000000] transition-all duration-300 active:scale-95 cursor-pointer shadow-md"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} strokeWidth={1} />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
