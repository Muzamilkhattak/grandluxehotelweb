"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="relative mt-24 md:mt-32 bg-[#0A0A0A] text-white/90 overflow-hidden border-t border-white/10 select-none">
      
      {/* Background Image with Low Fade & Vignette */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/about/about-hero.jpg"
          alt="Signature Art Hotel Atmosphere"
          fill
          className="object-cover object-center opacity-15"
          sizes="100vw"
        />
        {/* Soft dark gradient overlays for seamless low fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/75 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_0%,#0A0A0A_85%)]" />
      </div>

      {/* 1. Ambient Center Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(201,122,79,0.12)_0%,rgba(126,101,46,0.06)_50%,transparent_80%)] pointer-events-none z-0" />

      {/* 2. City Skyline Silhouette Backdrop */}
      <div className="absolute inset-x-0 bottom-0 h-44 sm:h-56 md:h-64 pointer-events-none z-0 overflow-hidden opacity-30">
        <svg 
          viewBox="0 0 1440 220" 
          preserveAspectRatio="none" 
          className="w-full h-full text-white/10 fill-current"
        >
          {/* Far background silhouettes */}
          <path 
            d="M0,220 L0,110 L35,110 L35,80 L75,80 L75,130 L110,130 L110,70 L145,70 L145,140 L190,140 L190,95 L230,95 L230,120 L270,120 L270,60 L295,45 L320,60 L320,135 L370,135 L370,85 L415,85 L415,115 L460,115 L460,50 L480,30 L500,50 L500,125 L555,125 L555,75 L600,75 L600,110 L645,110 L645,65 L690,65 L690,130 L740,130 L740,80 L785,80 L785,120 L830,120 L830,55 L850,35 L870,55 L870,140 L920,140 L920,70 L965,70 L965,115 L1010,115 L1010,85 L1055,85 L1055,130 L1100,130 L1100,60 L1130,40 L1160,60 L1160,125 L1210,125 L1210,75 L1255,75 L1255,110 L1300,110 L1300,85 L1345,85 L1345,135 L1390,135 L1390,95 L1440,95 L1440,220 Z" 
            opacity="0.45"
          />
          {/* Near foreground silhouettes */}
          <path 
            d="M0,220 L0,140 L45,140 L45,115 L90,115 L90,150 L140,150 L140,105 L180,105 L180,135 L225,135 L225,90 L260,90 L260,145 L310,145 L310,120 L355,120 L355,160 L400,160 L400,100 L445,100 L445,140 L490,140 L490,110 L535,110 L535,155 L580,155 L580,95 L625,95 L625,135 L670,135 L670,115 L715,115 L715,150 L760,150 L760,105 L805,105 L805,140 L850,140 L850,95 L895,95 L895,130 L940,130 L940,110 L985,110 L985,150 L1030,150 L1030,100 L1075,100 L1075,135 L1120,135 L1120,115 L1165,115 L1165,155 L1210,155 L1210,105 L1255,105 L1255,140 L1300,140 L1300,95 L1345,95 L1345,145 L1390,145 L1390,120 L1440,120 L1440,220 Z" 
            opacity="0.85"
          />
        </svg>
      </div>

      {/* 3. Main Footer Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 md:pt-20 pb-8 md:pb-10 flex flex-col items-center">
        
        {/* Top Tagline */}
        <p className="font-jost text-[14px] sm:text-[16px] md:text-[17px] text-[#d7b56d] font-medium tracking-wide mb-2 sm:mb-3 text-center">
          Affordable Comfort, Unforgettable Stay
        </p>

        {/* Centerpiece Logo */}
        <Link 
          href="/" 
          className="inline-flex items-center justify-center group my-2 sm:my-3 transition-transform duration-300 hover:scale-105 active:scale-95"
          aria-label="Signature Art Hotel Home"
        >
          <Image
            src="/images/logo/signaturearthotellogo.webp"
            alt="Signature Art Hotel"
            width={380}
            height={200}
            priority
            className="h-[75px] sm:h-[90px] md:h-[105px] lg:h-[115px] w-auto object-contain drop-shadow-[0_4px_24px_rgba(201,122,79,0.3)] group-hover:brightness-115 transition-all duration-300"
          />
        </Link>

        {/* Middle Navigation Strip: Privacy Policy | Nav Links | Terms & Conditions */}
        <div className="w-full mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 text-[13.5px] md:text-[14.5px] font-jost font-medium text-white/70">
          
          {/* Left: Privacy Policy */}
          <div className="w-full md:w-auto text-center md:text-left order-2 md:order-1">
            <Link 
              href="/privacy" 
              className="hover:text-[#d7b56d] transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Center: Main Nav Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10 order-1 md:order-2">
            <Link href="/" className="hover:text-[#d7b56d] transition-colors">
              Home
            </Link>
            <Link href="/about" className="hover:text-[#d7b56d] transition-colors">
              About Us
            </Link>
            <Link href="/rooms" className="hover:text-[#d7b56d] transition-colors">
              Rooms
            </Link>
            <Link href="/services" className="hover:text-[#d7b56d] transition-colors">
              Services
            </Link>
            <Link href="/restaurant" className="hover:text-[#d7b56d] transition-colors">
              Dining
            </Link>
            <Link href="/gallery" className="hover:text-[#d7b56d] transition-colors">
              Gallery
            </Link>
            <Link href="/contact" className="hover:text-[#d7b56d] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right: Terms & Conditions */}
          <div className="w-full md:w-auto text-center md:text-right order-3">
            <Link 
              href="/terms" 
              className="hover:text-[#d7b56d] transition-colors underline-offset-4 hover:underline"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>

        {/* Clean Divider Line */}
        <div className="w-full h-[1px] bg-white/10 my-4 sm:my-5 md:my-6" />

        {/* Bottom Bar: Privacy / Cookies / Legal | Copyright | Social Icons in circles */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] md:text-[12.5px] font-jost text-white/50">
          
          {/* Left: Sub-links */}
          <div className="flex items-center gap-4 sm:gap-5 text-white/50 order-2 sm:order-1">
            <Link href="/privacy" className="hover:text-[#d7b56d] transition-colors">
              Privacy
            </Link>
            <Link href="#cookies" className="hover:text-[#d7b56d] transition-colors">
              Cookies
            </Link>
            <Link href="/admin" className="hover:text-[#d7b56d] transition-colors">
              Legal
            </Link>
          </div>

          {/* Center: Copyright */}
          <p className="text-center font-normal text-white/50 order-3 sm:order-2">
            © {new Date().getFullYear()} Signature Art Hotel. All Rights Reserved.
          </p>

          {/* Right: 5 Circular Social Media Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 order-1 sm:order-3">
            {/* YouTube */}
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-[#d7b56d] hover:text-white hover:border-[#d7b56d] transition-all duration-200" 
              aria-label="YouTube"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            {/* TikTok */}
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-[#d7b56d] hover:text-white hover:border-[#d7b56d] transition-all duration-200" 
              aria-label="TikTok"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-[#d7b56d] hover:text-white hover:border-[#d7b56d] transition-all duration-200" 
              aria-label="LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-[#d7b56d] hover:text-white hover:border-[#d7b56d] transition-all duration-200" 
              aria-label="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-[#d7b56d] hover:text-white hover:border-[#d7b56d] transition-all duration-200" 
              aria-label="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
