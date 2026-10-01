"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <section suppressHydrationWarning className="relative h-[90vh] w-full flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          suppressHydrationWarning
          className="w-full h-full object-cover"
          src="/for-website.webm"
        />
        {/* Subtle black gradient fade with low opacity */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/10 z-10"></div>
      </div>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4 mt-20 max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={itemVariants}
          className="font-marcellus text-[50px] md:text-[88px] text-white font-light leading-[1.1] md:leading-[0.95]"
        >
          The Art Of <br className="hidden md:block" /> Elite Hospitality
        </motion.h1>
      </motion.div>
    </section>
  );
}
