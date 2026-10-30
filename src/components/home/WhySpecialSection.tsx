"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, UtensilsCrossed, Mountain, ShieldCheck } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Tilt3D from "@/components/ui/Tilt3D";

const features = [
  {
    title: "Located in Heart of Islamabad F-7",
    description: "Ideally situated in the prestigious F-7 sector, combining unbeatable central convenience with tranquil proximity and stunning views of the Margalla Hills.",
    icon: <MapPin strokeWidth={1} size={32} />,
    image: "/images/why-oslo/heart-of-islamabad-f7.jpg",
    colSpan: "md:col-span-2",
  },
  {
    title: "Restaurant in Hotel",
    description: "Savor exquisite in-house dining with chef-crafted gourmet specialties, morning breakfasts, and culinary sophistication in an intimate ambiance.",
    icon: <UtensilsCrossed strokeWidth={1} size={32} />,
    image: "/images/why-oslo/hotel-restaurant.jpg",
    colSpan: "md:col-span-1",
  },
  {
    title: "Beautiful View of Margalla Hills",
    description: "Immerse yourself in breathtaking panoramic vistas of the lush Margalla Hills, mist-kissed mornings, and picturesque golden hour sunsets.",
    icon: <Mountain strokeWidth={1} size={32} />,
    image: "/images/why-oslo/margalla-hills-view.jpg",
    colSpan: "md:col-span-1",
  },
  {
    title: "Security & Dedicated Parking",
    description: "Enjoy effortless peace of mind with 24/7 security surveillance, gated access control, and dedicated private on-site parking for all guests.",
    icon: <ShieldCheck strokeWidth={1} size={32} />,
    image: "/images/why-oslo/security-and-parking.jpg",
    colSpan: "md:col-span-2",
  }
];

export default function WhySpecialSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        const curtain = card.querySelector<HTMLElement>(".curtain-reveal-wrap");
        const image = card.querySelector<HTMLElement>(".curtain-reveal-img");

        if (curtain && image) {
          gsap.fromTo(
            curtain,
            { clipPath: "inset(0% 100% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.4,
              ease: "power3.inOut",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "top 35%",
                toggleActions: "play none none reverse",
              },
            }
          );

          gsap.fromTo(
            image,
            { scale: 1.28 },
            {
              scale: 1.08,
              duration: 1.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "top 35%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-16 sm:py-24 md:py-32 bg-[#000000] text-[#FFFFFF] relative overflow-hidden"
      style={{ perspective: 1200 }}
    >
      {/* Ambient Parallax Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#d7b56d]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#d7b56d]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header with 3D Entrance */}
        <div 
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 md:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 12 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <h4 className="font-vogue text-[#d7b56d] tracking-[0.2em] uppercase text-[11px] sm:text-[12px] mb-4 sm:mb-6">
              The Signature Standard
            </h4>
            <h2 className="font-marcellus text-3xl sm:text-4xl md:text-[52px] lg:text-[56px] leading-[1.12]">
              Why Signature Art Hotel is Special?
            </h2>
            <p className="font-jost text-[#FFFFFF]/70 text-[15px] sm:text-[18px] mt-4 sm:mt-6 font-light leading-[1.6]">
              We transcend traditional hospitality by mastering the invisible art of anticipation. Every detail is an orchestrated performance, designed to elevate your stay from ordinary to extraordinary.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid with 3D Tilt Cards & Preserved Depth */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
        >
          {features.map((feature, idx) => (
            <div key={idx} className={feature.colSpan}>
              <Tilt3D maxTilt={6} scale={1.015} glare={true} glareColor="rgba(215, 181, 109, 0.16)">
                <div
                  ref={(el) => { cardsRef.current[idx] = el; }}
                  className="group relative h-[340px] sm:h-[380px] md:h-[420px] overflow-hidden bg-black rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] border border-white/10 hover:border-[#d7b56d]/50 transition-colors duration-500"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Horizontal Curtain Reveal Wrap with CSS clipPath */}
                  <div 
                    className="curtain-reveal-wrap absolute inset-0 w-full h-full overflow-hidden"
                    style={{ clipPath: "inset(0% 100% 0% 0%)" }}
                  >
                    <div className="curtain-reveal-img relative w-full h-full transform will-change-transform">
                      <Image 
                        src={feature.image} 
                        alt={feature.title} 
                        fill 
                        className="object-cover opacity-65 group-hover:scale-110 group-hover:opacity-40 transition-all duration-1000 ease-[0.16,1,0.3,1]"
                      />
                    </div>
                  </div>

                  {/* Ambient overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />
                  
                  {/* Card Content with 3D Z-Depth Pop */}
                  <div 
                    className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-end pointer-events-none"
                    style={{ transform: "translateZ(30px)" }}
                  >
                    <div className="text-[#d7b56d] mb-4 sm:mb-6 transform translate-y-0 md:translate-y-6 md:group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      {feature.icon}
                    </div>
                    <h3 className="font-marcellus text-2xl sm:text-[28px] md:text-[32px] text-[#FFFFFF] mb-2 sm:mb-3 transform translate-y-0 md:translate-y-6 md:group-hover:translate-y-0 transition-transform duration-500 ease-out drop-shadow-md">
                      {feature.title}
                    </h3>
                    
                    {/* Expandable description wrapper */}
                    <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                      <div className="overflow-hidden">
                        <p className="font-jost text-[#FFFFFF]/80 text-[13.5px] sm:text-[15px] md:text-[16px] leading-[1.5] sm:leading-[1.6] pt-1.5 sm:pt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3 md:line-clamp-none">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Decorative corner */}
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-6 sm:w-8 h-6 sm:h-8 border-t border-r border-[#FFFFFF]/25 group-hover:border-[#d7b56d]/80 transition-colors duration-500 pointer-events-none" />
                </div>
              </Tilt3D>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
