"use client";
import { motion, useInView, animate } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

function AnimatedCounter({ from, to, duration = 2 }: { from: number, to: number, duration?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const node = nodeRef.current;
      if (!node) return;
      const controls = animate(from, to, {
        duration,
        ease: "easeOut",
        onUpdate(value) {
          node.textContent = Math.round(value).toString();
        },
      });
      return () => controls.stop();
    }
  }, [from, to, inView, duration]);

  return <span ref={nodeRef} />;
}

export default function AboutSection() {
  return (
    <section className="py-32 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-20">
        
        {/* Text Content */}
        <div className="w-full lg:w-1/2 space-y-10 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h4 className="font-vogue text-[#7E652E] tracking-[0.2em] uppercase text-[12px] mb-6">Our Legacy</h4>
            <h2 className="font-marcellus text-[48px] md:text-[56px] text-[#362618] leading-[1.1]">
              Your perfect stay <br className="hidden md:block"/> experience starts here
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="font-jost text-[18px] leading-[1.8] text-[#362618]/70 space-y-6"
          >
            <p>
              Experience refined hospitality at Oslo Elite, where elegant rooms, exceptional service, and modern comforts create unforgettable stays for every business and leisure traveler.
            </p>
            <ul className="list-none space-y-3 font-medium text-[#362618]/80 text-[16px]">
              <li className="flex items-start gap-3">
                <span className="text-[#C97A4F] mt-1 text-[12px]">◆</span> 
                Discover exceptional hospitality in the heart of Islamabad
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#C97A4F] mt-1 text-[12px]">◆</span> 
                Luxury accommodations for unforgettable travel moments
              </li>
            </ul>
          </motion.div>

          {/* Animated Counters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex items-center gap-16 pt-8 border-t border-[#7E652E]/15"
          >
            <div className="flex flex-col">
              <div className="font-marcellus text-[56px] text-[#362618] flex items-center leading-none mb-2">
                <AnimatedCounter from={0} to={24} duration={1.5} />
              </div>
              <span className="font-vogue uppercase tracking-[0.15em] text-[11px] text-[#7E652E]">Hours Guest Support</span>
            </div>
            <div className="flex flex-col">
              <div className="font-marcellus text-[56px] text-[#362618] flex items-center leading-none mb-2">
                <AnimatedCounter from={0} to={855} duration={2} />
                <span className="text-[#C97A4F] ml-1">+</span>
              </div>
              <span className="font-vogue uppercase tracking-[0.15em] text-[11px] text-[#7E652E]">Satisfied Customers</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="pt-4"
          >
            <Link href="/about" className="inline-block border-b border-[#7E652E] text-[#362618] font-vogue uppercase tracking-[0.15em] text-[12px] pb-2 hover:text-[#7E652E] hover:border-[#362618] transition-all">
              Discover Our History
            </Link>
          </motion.div>
        </div>

        {/* Animated Image Composition */}
        <div className="w-full lg:w-1/2 relative min-h-[650px] flex items-center justify-center mt-10 lg:mt-0">
          
          {/* Main Large Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-4/5 h-[550px] z-10 shadow-[0_32px_80px_rgba(54,38,24,0.15)]"
          >
            <Image 
              src="https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?q=80&w=1200&auto=format&fit=crop" 
              alt="Hotel Exterior" 
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Overlapping Smaller Image */}
          <motion.div
            initial={{ opacity: 0, x: 60, y: 60 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 right-0 w-[55%] h-[400px] z-20 border-[12px] border-[#FAF8F5] shadow-[0_24px_64px_rgba(54,38,24,0.12)]"
          >
            <Image 
              src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop" 
              alt="Lobby Details" 
              fill
              className="object-cover"
            />
          </motion.div>
          
          {/* Decorative Gold Accents */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            whileInView={{ opacity: 1, height: "160px" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="absolute -top-12 -left-8 w-[1px] bg-[#7E652E] z-0 hidden lg:block"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "160px" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="absolute -top-12 -left-8 h-[1px] bg-[#7E652E] z-0 hidden lg:block"
          ></motion.div>
        </div>

      </div>
    </section>
  );
}
