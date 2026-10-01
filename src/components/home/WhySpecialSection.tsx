"use client";
import { motion } from "framer-motion";
import { MapPin, UtensilsCrossed, Sparkles, Building2 } from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "Prime Location",
    description: "Situated in the most prestigious enclave of Islamabad, offering serenity while remaining minutes away from the diplomatic enclave and city center.",
    icon: <MapPin strokeWidth={1} size={32} />,
    image: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1200&auto=format&fit=crop",
    colSpan: "md:col-span-2",
  },
  {
    title: "Michelin Dining",
    description: "Culinary masterpieces crafted by globally acclaimed chefs, served in immersive, panoramic settings.",
    icon: <UtensilsCrossed strokeWidth={1} size={32} />,
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
    colSpan: "md:col-span-1",
  },
  {
    title: "Bespoke Concierge",
    description: "From private jet transfers to exclusive local access, our 24/7 butler service anticipates your every desire before you even articulate it.",
    icon: <Sparkles strokeWidth={1} size={32} />,
    image: "https://images.unsplash.com/photo-1562790351-d273a961e0e9?q=80&w=800&auto=format&fit=crop",
    colSpan: "md:col-span-1",
  },
  {
    title: "Architectural Mastery",
    description: "A harmonious blend of contemporary design and timeless luxury, featuring curated art collections and sustainable, sensory-rich materials.",
    icon: <Building2 strokeWidth={1} size={32} />,
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1200&auto=format&fit=crop",
    colSpan: "md:col-span-2",
  }
];

export default function WhySpecialSection() {
  return (
    <section className="py-32 bg-[#362618] text-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h4 className="font-vogue text-[#C97A4F] tracking-[0.2em] uppercase text-[12px] mb-6">The Oslo Standard</h4>
            <h2 className="font-marcellus text-[40px] md:text-[56px] leading-[1.1]">
              Why Oslo Elite is Special?
            </h2>
            <p className="font-jost text-[#FAF8F5]/70 text-[18px] mt-6 font-light leading-[1.6]">
              We transcend traditional hospitality by mastering the invisible art of anticipation. Every detail is an orchestrated performance, designed to elevate your stay from ordinary to extraordinary.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.15, ease: "easeOut" }}
              className={`group relative h-[420px] overflow-hidden bg-black rounded-none shadow-[0_24px_48px_rgba(0,0,0,0.3)] ${feature.colSpan}`}
            >
              <Image 
                src={feature.image} 
                alt={feature.title} 
                fill 
                className="object-cover opacity-60 group-hover:scale-110 group-hover:opacity-30 transition-all duration-1000 ease-[0.16,1,0.3,1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              
              {/* Card Content - Animations trigger on hover of the parent group */}
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="text-[#C97A4F] mb-6 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  {feature.icon}
                </div>
                <h3 className="font-marcellus text-[32px] text-[#FAF8F5] mb-3 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  {feature.title}
                </h3>
                
                {/* Expandable description wrapper */}
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                  <div className="overflow-hidden">
                    <p className="font-jost text-[#FAF8F5]/80 text-[16px] leading-[1.6] pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Right Decorative corner */}
              <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-[#FAF8F5]/20 group-hover:border-[#C97A4F]/60 transition-colors duration-500"></div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
