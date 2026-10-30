"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { BedDouble, ShowerHead, Sun, Wifi, Utensils, Droplet, UserCheck, Plane, GlassWater, Waves, Anchor } from "lucide-react";
import Tilt3D from "@/components/ui/Tilt3D";

const amenities = [
  { name: "Infinity Pool", icon: <Waves size={36} strokeWidth={1} /> },
  { name: "Private Wellness", icon: <Droplet size={36} strokeWidth={1} /> },
  { name: "24/7 Butler", icon: <UserCheck size={36} strokeWidth={1} /> },
  { name: "Helipad Chauffeur", icon: <Plane size={36} strokeWidth={1} /> },
  { name: "Michelin Dining", icon: <Utensils size={36} strokeWidth={1} /> },
  { name: "Sommelier Cellar", icon: <GlassWater size={36} strokeWidth={1} /> },
  { name: "Private Beach", icon: <Anchor size={36} strokeWidth={1} /> },
  { name: "High-Speed Fiber", icon: <Wifi size={36} strokeWidth={1} /> },
];

export default function SignatureAmenities() {
  const sectionRef = useRef<HTMLElement>(null);

  // Vertical Scroll Parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  const yHeader = useTransform(smoothProgress, [0, 1], [25, -25]);
  const yGrid = useTransform(smoothProgress, [0, 1], [35, -20]);

  return (
    <section 
      ref={sectionRef} 
      className="py-14 sm:py-20 md:py-28 px-4 bg-canvas relative overflow-hidden"
      style={{ perspective: 1200 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading with 3D Entrance */}
        <motion.div 
          style={{ y: yHeader }}
          initial={{ opacity: 0, y: 30, rotateX: 12 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8 sm:mb-12 md:mb-16 will-change-transform"
        >
          <span className="font-vogue text-[#d7b56d] tracking-[0.24em] uppercase text-[11px] sm:text-[12px] font-bold block mb-2 sm:mb-3">
            Pure Indulgence
          </span>
          <h2 className="font-marcellus text-3xl sm:text-4xl md:text-[52px] lg:text-[60px] text-primary">
            Signature Amenities
          </h2>
          <div className="w-14 sm:w-16 h-[2px] bg-[#d7b56d] mx-auto mt-3 sm:mt-4" />
        </motion.div>
        
        {/* 3D Interactive Cards Grid */}
        <motion.div 
          style={{ y: yGrid }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 will-change-transform"
        >
          {amenities.map((amenity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Tilt3D maxTilt={8} scale={1.03} glare={true} glareColor="rgba(215, 181, 109, 0.18)">
                <div 
                  className="group flex flex-col items-center justify-center p-6 sm:p-8 md:p-9 bg-white border border-[#EAEAEA] rounded-xl hover:border-[#d7b56d] shadow-sm hover:shadow-[0_16px_36px_rgba(215,181,109,0.18)] transition-all duration-300"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div 
                    style={{ transform: "translateZ(25px)" }}
                    className="text-[#d7b56d] group-hover:text-black mb-3 sm:mb-4 group-hover:scale-110 transition-all duration-300"
                  >
                    {amenity.icon}
                  </div>
                  <h4 
                    style={{ transform: "translateZ(18px)" }}
                    className="font-jost text-[15px] sm:text-[17px] text-body text-center font-medium group-hover:text-primary transition-colors duration-300"
                  >
                    {amenity.name}
                  </h4>
                </div>
              </Tilt3D>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
