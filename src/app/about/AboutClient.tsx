"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, HeartHandshake, Leaf, ArrowRight, Utensils, GlassWater, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutClient() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: 30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  return (
    <main className="bg-[#FFFFFF] min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src="/images/about/about-hero.jpg"
            alt="Signature Art Hotel Grand Lobby"
            fill
            sizes="100vw"
            quality={90}
            className="object-cover"
            priority
          />
        </motion.div>
        {/* Black Fade Overlays on Hero BG Image */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/75 to-transparent" />
        
        <motion.div 
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.p variants={fadeInUp} className="text-[#d7b56d] uppercase tracking-[0.3em] text-[13px] font-medium mb-4">Discover</motion.p>
          <motion.h1 variants={fadeInUp} className="text-white font-marcellus text-5xl md:text-7xl mb-6 leading-tight">
            The Signature Art Hotel Experience
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-white/90 font-jost text-lg md:text-xl font-light max-w-2xl mx-auto">
            A sanctuary of refined luxury where timeless elegance meets exceptional modern hospitality.
          </motion.p>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInRight}
            className="relative h-[600px] w-full"
          >
            <Image
              src="/images/about/our-heritage.jpg"
              alt="Signature Art Hotel Heritage Architecture"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
              className="object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#d7b56d]/10 -z-10"></div>
            <div className="absolute -top-6 -left-6 w-48 h-48 border border-[#d7b56d]/20 -z-10"></div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col"
          >
            <motion.p variants={fadeInUp} className="text-[#d7b56d] uppercase tracking-[0.2em] text-[13px] font-medium mb-4">Our Heritage</motion.p>
            <motion.h2 variants={fadeInUp} className="text-[#000000] font-marcellus text-4xl md:text-5xl mb-8 leading-tight">
              A Legacy of Unparalleled Elegance
            </motion.h2>
            <motion.div variants={fadeInUp} className="prose prose-lg text-[#000000]/70 font-jost font-light leading-[1.8]">
              <p>
                Founded on the principles of uncompromising quality and meticulous attention to detail, Signature Art Hotel has stood as a beacon of luxury hospitality. Our journey began with a simple vision: to create a sanctuary where every guest feels both deeply revered and entirely at home.
              </p>
              <p className="mt-4">
                Our architecture pays homage to classical grandeur while seamlessly integrating avant-garde design. From the hand-picked artisanal furnishings in our suites to the curated culinary masterpieces in our dining halls, every element of Signature Art Hotel has been crafted to inspire awe and provide total comfort.
              </p>
              <p className="mt-4">
                We believe that true luxury is defined by the unseen—the quiet anticipation of your needs, the seamless choreography of our staff, and the lingering sense of peace that follows you long after your departure.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-[#000000] text-white px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d7b56d]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d7b56d]/10 rounded-full blur-3xl"></div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <motion.h2 variants={fadeInUp} className="font-marcellus text-4xl md:text-5xl mb-6 text-[#FFFFFF]">Our Core Pillars</motion.h2>
            <motion.p variants={fadeInUp} className="font-jost text-[#FFFFFF]/70 text-lg font-light leading-relaxed">
              The foundational values that guide our unwavering commitment to exceeding your expectations.
            </motion.p>
          </div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Value 1 */}
            <motion.div variants={fadeInUp} className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors duration-300">
              <Star size={40} className="text-[#d7b56d] mb-6" fill="currentColor" />
              <h3 className="font-marcellus text-2xl mb-4">Five-Star Service</h3>
              <p className="font-jost text-white/70 font-light leading-relaxed text-sm">
                Anticipatory, intuitive, and discreet. Our concierge and staff are dedicated to curating a flawless experience tailored exclusively to you.
              </p>
            </motion.div>

            {/* Value 2 */}
            <motion.div variants={fadeInUp} className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors duration-300">
              <ShieldCheck size={40} className="text-[#d7b56d] mb-6" fill="currentColor" />
              <h3 className="font-marcellus text-2xl mb-4">Absolute Privacy</h3>
              <p className="font-jost text-white/70 font-light leading-relaxed text-sm">
                Your tranquility is our priority. We maintain stringent security measures and design our spaces to ensure your complete peace of mind.
              </p>
            </motion.div>

            {/* Value 3 */}
            <motion.div variants={fadeInUp} className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors duration-300">
              <Utensils size={40} className="text-[#d7b56d] mb-6" fill="currentColor" />
              <h3 className="font-marcellus text-2xl mb-4">Culinary Mastery</h3>
              <p className="font-jost text-white/70 font-light leading-relaxed text-sm">
                Savor exceptional gastronomy crafted by world-renowned chefs, using only the finest globally sourced and local artisanal ingredients.
              </p>
            </motion.div>

            {/* Value 4 */}
            <motion.div variants={fadeInUp} className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors duration-300">
              <Leaf size={40} className="text-[#d7b56d] mb-6" fill="currentColor" />
              <h3 className="font-marcellus text-2xl mb-4">Sustainable Luxury</h3>
              <p className="font-jost text-white/70 font-light leading-relaxed text-sm">
                We blend opulence with responsibility, implementing eco-conscious practices that preserve our beautiful environment without compromising luxury.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Visual Break Section */}
      <section className="py-24 px-4 bg-white overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12"
        >
          <motion.div variants={fadeInRight} className="w-full md:w-1/2">
            <h2 className="text-[#000000] font-marcellus text-4xl mb-6">Designed for the Discerning</h2>
            <p className="text-[#000000]/70 font-jost text-lg font-light leading-relaxed mb-8">
              Whether you are traveling for a crucial business summit or seeking a tranquil escape from the ordinary, Signature Art Hotel offers an environment meticulously calibrated for your lifestyle.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <GlassWater size={24} className="text-[#d7b56d]" fill="currentColor" />
                <span className="font-jost text-[#000000] font-medium text-sm uppercase tracking-wide">Mixology Bars</span>
              </div>
              <div className="flex items-center gap-3">
                <Bell size={24} className="text-[#d7b56d]" fill="currentColor" />
                <span className="font-jost text-[#000000] font-medium text-sm uppercase tracking-wide">24/7 Concierge</span>
              </div>
              <div className="flex items-center gap-3">
                <HeartHandshake size={24} className="text-[#d7b56d]" fill="currentColor" />
                <span className="font-jost text-[#000000] font-medium text-sm uppercase tracking-wide">Personalized Care</span>
              </div>
            </div>
            
            <Link href="/rooms" className="inline-flex items-center gap-2 mt-10 text-[#d7b56d] font-jost uppercase tracking-[0.15em] text-sm font-medium hover:text-[#000000] transition-colors">
              Explore Our Suites <ArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.div variants={fadeInLeft} className="w-full md:w-1/2 grid grid-cols-2 gap-4">
            <div className="relative h-[300px] mt-8">
              <Image 
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80" 
                alt="Hotel Details" 
                fill 
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover" 
              />
            </div>
            <div className="relative h-[300px]">
              <Image 
                src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80" 
                alt="Luxury Suite" 
                fill 
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover" 
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

    </main>
  );
}
