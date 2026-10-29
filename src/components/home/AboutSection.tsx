"use client";
import { motion, useInView, animate } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

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
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(textRef.current, {
        backgroundPosition: "0% 0%",
        ease: "none",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 80%",
          end: "bottom 35%",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="py-16 sm:py-24 md:py-32 bg-[#FFFFFF] relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Text Content: On mobile order-2 (appears below images), on desktop lg:order-1 (left column) */}
        <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8 md:space-y-10 z-10 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start w-full"
          >
            <div className="w-full flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-4">
              <span className="w-7 sm:w-10 h-[2px] bg-[#9e7422] shrink-0" />
              <h4 className="font-marcellus text-[#8f6618] tracking-[0.2em] sm:tracking-[0.22em] uppercase text-[14px] sm:text-[17px] md:text-[18px] font-bold">
                Our Legacy
              </h4>
            </div>
            <h2 
              ref={textRef}
              className="reveal-text font-marcellus text-[28px] sm:text-4xl md:text-[50px] lg:text-[56px] leading-[1.15] w-full block mt-1"
            >
              Your perfect stay <br className="hidden md:block"/> experience starts here
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="font-jost text-[16px] sm:text-[18px] leading-[1.8] text-[#000000]/70 space-y-4 sm:space-y-6"
          >
            <p>
              Experience refined hospitality at Signature Art Hotel, where elegant rooms, exceptional service, and modern comforts create unforgettable stays for every business and leisure traveler.
            </p>
            <ul className="list-none space-y-2.5 sm:space-y-3 font-medium text-[#000000]/80 text-[14px] sm:text-[16px]">
              <li className="flex items-start gap-2.5 sm:gap-3">
                <span className="text-[#8f6618] mt-1 text-[11px] sm:text-[12px]">◆</span> 
                Discover exceptional hospitality in the heart of Islamabad
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <span className="text-[#8f6618] mt-1 text-[11px] sm:text-[12px]">◆</span> 
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
            className="flex items-center gap-8 sm:gap-14 md:gap-16 pt-6 sm:pt-8 border-t border-[#d7b56d]/20"
          >
            <div className="flex flex-col">
              <div className="font-marcellus text-4xl sm:text-[50px] md:text-[54px] font-normal text-[#000000] flex items-center leading-none mb-2">
                <AnimatedCounter from={0} to={24} duration={1.5} />
              </div>
              <span className="font-jost uppercase tracking-[0.16em] text-[11px] sm:text-[12px] md:text-[13px] font-semibold text-[#8f6618]">
                Hours Guest Support
              </span>
            </div>
            <div className="flex flex-col">
              <div className="font-marcellus text-4xl sm:text-[50px] md:text-[54px] font-normal text-[#000000] flex items-center leading-none mb-2">
                <AnimatedCounter from={0} to={855} duration={2} />
                <span className="text-[#8f6618] ml-1 font-normal">+</span>
              </div>
              <span className="font-jost uppercase tracking-[0.16em] text-[11px] sm:text-[12px] md:text-[13px] font-semibold text-[#8f6618]">
                Satisfied Customers
              </span>
            </div>
          </motion.div>

          {/* Luxury CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="pt-2 sm:pt-4"
          >
            <Link 
              href="/about" 
              className="inline-flex items-center gap-3 bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white font-jost uppercase tracking-[0.18em] text-[12.5px] sm:text-[13.5px] font-semibold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 group active:scale-95 border border-[#d7b56d] hover:border-[#000000]"
            >
              <span>Discover Our History</span>
              <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        {/* Animated Image Composition: On mobile order-1 (appears before content), on desktop lg:order-2 */}
        <div className="w-full lg:w-1/2 relative min-h-[380px] sm:min-h-[500px] lg:min-h-[650px] flex items-center justify-center mt-2 lg:mt-0 mb-8 sm:mb-12 lg:mb-0 order-1 lg:order-2">
          
          {/* Main Large Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[85%] sm:w-[75%] h-[380px] sm:h-[480px] lg:h-[550px] z-10 shadow-[0_32px_80px_rgba(54,38,24,0.15)] ml-auto"
          >
            <Image 
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop" 
              alt="Hotel Exterior" 
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Overlapping Smaller Image (Bottom Right) */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[-10px] sm:bottom-[-20px] right-0 sm:right-[-10px] w-[55%] sm:w-[50%] h-[260px] sm:h-[350px] z-20 border-[6px] sm:border-[10px] border-[#FFFFFF] shadow-[0_24px_64px_rgba(54,38,24,0.12)]"
          >
            <Image 
              src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop" 
              alt="Lobby Details" 
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Third Image (Top Left) */}
          <motion.div
            initial={{ opacity: 0, x: -40, y: -40 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[20px] sm:top-[40px] left-0 w-[40%] h-[200px] sm:h-[280px] z-20 border-[6px] sm:border-[10px] border-[#FFFFFF] shadow-[0_24px_64px_rgba(54,38,24,0.12)] hidden sm:block"
          >
            <Image 
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop" 
              alt="Luxury Amenities" 
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
            className="absolute -top-12 -left-8 w-[1px] bg-[#d7b56d] z-0 hidden lg:block"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "160px" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="absolute -top-12 -left-8 h-[1px] bg-[#d7b56d] z-0 hidden lg:block"
          ></motion.div>
        </div>

      </div>
    </section>
  );
}
