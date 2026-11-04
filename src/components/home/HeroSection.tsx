"use client";

import { useRef, MouseEvent } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";

interface HeroSectionProps {
  children?: React.ReactNode;
}

export default function HeroSection({ children }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);

  // Window scroll (no target ref needed, 100% hydration-safe)
  const { scrollY } = useScroll();

  // Video parallax: moves slightly downward, scales gently, and dims
  const yVideo = useTransform(scrollY, [0, 800], ["0%", "28%"]);
  const scaleVideo = useTransform(scrollY, [0, 800], [1, 1.08]);
  const opacityVideo = useTransform(scrollY, [0, 600], [1, 0.35]);

  // Content parallax: moves upward faster, fades out gracefully
  const yContent = useTransform(scrollY, [0, 800], ["0%", "-35%"]);
  const opacityContent = useTransform(scrollY, [0, 450], [1, 0]);

  // Interactive 3D Mouse Depth
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 25 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35, rotateX: 25 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      suppressHydrationWarning 
      className="relative min-h-[58vh] sm:min-h-[65vh] md:min-h-[70vh] lg:min-h-screen w-full flex flex-col justify-between overflow-hidden"
      style={{ perspective: 1200 }}
    >
      {/* Background Video with Vertical Scroll Parallax */}
      <motion.div 
        style={{ y: yVideo, scale: scaleVideo, opacity: opacityVideo }}
        className="absolute inset-0 z-0 bg-black will-change-transform"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          suppressHydrationWarning
          className="w-full h-full object-cover"
          src="/for-website.webm"
        />
        {/* Cinematic dark luxury gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10 pointer-events-none" />
      </motion.div>

      {/* Hero Content with 3D Tilt & Scroll Parallax */}
      <motion.div
        style={{ 
          y: yContent, 
          opacity: opacityContent,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-28 sm:pt-36 pb-12 max-w-5xl mx-auto will-change-transform"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 3D Headline */}
        <motion.h1
          variants={itemVariants}
          style={{ transform: "translateZ(50px)" }}
          className="font-marcellus text-4xl sm:text-5xl md:text-[76px] lg:text-[90px] text-white font-light leading-[1.08] md:leading-[0.95] drop-shadow-[0_12px_32px_rgba(0,0,0,0.7)]"
        >
          A Signature OF <br className="hidden md:block" /> Luxury Living
        </motion.h1>
      </motion.div>

      {/* Centered Hero Booking Form Bar (Desktop only: lg and up) */}
      {children && (
        <div className="hidden lg:flex relative z-20 w-full justify-center px-4 pb-8 sm:pb-12 md:pb-14 mt-auto">
          {children}
        </div>
      )}
    </section>
  );
}
