"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Lock body scroll when drawer menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Navigation links for pages that exist on the website
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Suites & Accommodations", href: "/rooms" },
    { name: "Fine Dining & Bar", href: "/restaurant" },
    { name: "Curated Experiences", href: "/services" },
    { name: "Gallery & Architecture", href: "/gallery" },
    { name: "About Us", href: "/about" },
    { name: "Contact & Concierge", href: "/contact" },
  ];

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const isHomePage = pathname === "/";
  // On home page, background appears on scroll. On all other pages, background is always visible.
  const showBackground = !isHomePage || isScrolled;

  return (
    <>
      <header suppressHydrationWarning className="fixed top-0 inset-x-0 z-50 transition-all duration-300 pointer-events-none">
        
        {/* Header Background Layer - Always active on inner pages, appears on scroll on home page */}
        <div 
          className={`absolute inset-0 bg-[#000000]/95 backdrop-blur-md border-b border-[#d7b56d]/30 shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-500 pointer-events-auto ${
            showBackground ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Main Navbar Content */}
        <div className="relative w-full h-[82px] sm:h-[90px] md:h-[96px] max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between pointer-events-none">
          
          {/* Left Side: Hamburger Toggle Icon & Menu Label */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto flex-1">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-[#FFFFFF] hover:text-[#d7b56d] transition-all duration-300 group py-1.5 px-2 rounded-full hover:bg-white/5 active:scale-95 cursor-pointer"
              aria-label="Toggle Navigation Menu"
              aria-expanded={menuOpen}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#d7b56d]/60 flex items-center justify-center bg-[#2C1D12]/70 group-hover:border-[#d7b56d] transition-colors shadow-sm shrink-0">
                <Menu size={20} className="text-[#FFFFFF] group-hover:text-[#d7b56d] transition-colors" />
              </div>
              <span className="hidden sm:inline font-jost text-[13px] sm:text-[14px] uppercase tracking-[0.22em] font-medium text-[#FFFFFF]/90 group-hover:text-[#d7b56d] transition-colors">
                Menu
              </span>
            </button>
          </div>

          {/* Center Logo - Clean, Vertically & Horizontally Centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10 flex flex-col items-center">
            <Link 
              href="/" 
              className="group flex items-center transition-all duration-300 hover:scale-105 active:scale-95 py-1"
              aria-label="Signature Art Hotel Home"
            >
              <Image
                src="/images/logo/signaturearthotellogo.webp"
                alt="Signature Art Hotel"
                width={260}
                height={150}
                priority
                className="h-[64px] sm:h-[76px] md:h-[84px] w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] group-hover:brightness-110 transition-all duration-300"
              />
            </Link>
          </div>

          {/* Right Side: Contact Us (md+) & Check Availability / Book Now (responsive) */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 md:gap-6 pointer-events-auto flex-1">
            <Link 
              href="/contact" 
              className="hidden md:inline-block font-jost text-[12.5px] sm:text-[13.5px] uppercase tracking-[0.18em] text-[#FFFFFF]/90 hover:text-white font-medium py-1.5 transition-colors relative group whitespace-nowrap"
            >
              Contact Us
              <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#d7b56d] origin-center transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
            </Link>

            <Link 
              href={user ? "/profile" : "/login"} 
              className="hidden lg:flex items-center gap-1.5 font-jost text-[12.5px] uppercase tracking-[0.16em] text-[#FFFFFF]/90 hover:text-[#d7b56d] font-medium py-1.5 transition-colors whitespace-nowrap"
              title={user ? "My Profile" : "Sign In"}
            >
              <div className="w-6 h-6 rounded-full border border-[#d7b56d]/60 flex items-center justify-center">
                <User size={12} className="text-[#d7b56d]" />
              </div>
              <span>{user ? "Profile" : "Sign In"}</span>
            </Link>

            <Link 
              href="/rooms"
              className="bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white font-jost uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[11px] sm:text-[12.5px] font-semibold px-3.5 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full shadow-md transition-all duration-300 active:scale-95 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Check Availability</span>
              <span className="sm:hidden">Book Now</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer Menu (Raffles Hotel Luxury Aesthetic, Full Height No-Scroll) */}
      <div 
        className={`fixed inset-0 z-[60] overflow-hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop overlay */}
        <div 
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-700 cursor-pointer"
        />

        {/* Side Drawer Panel: Slides slowly and gracefully from RIGHT to LEFT */}
        <aside 
          className={`absolute top-0 bottom-0 left-0 w-[310px] sm:w-[360px] md:w-[390px] max-w-[92vw] h-screen h-[100dvh] bg-[#000000] text-[#FFFFFF] border-r border-[#d7b56d]/35 shadow-[15px_0_50px_rgba(0,0,0,0.85)] z-10 flex flex-col justify-between px-7 sm:px-10 py-7 sm:py-8 transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] select-none overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#d7b56d_transparent] ${
            menuOpen ? "translate-x-0" : "translate-x-[100vw]"
          }`}
        >
          {/* Top Section: Close Button & Grand Brand Title */}
          <div className="flex flex-col">
            <button 
              onClick={() => setMenuOpen(false)}
              className="w-8 h-8 -ml-1 text-[#FFFFFF]/80 hover:text-[#d7b56d] transition-colors cursor-pointer flex items-center justify-start focus:outline-none"
              aria-label="Close navigation"
            >
              <X size={26} strokeWidth={1.3} />
            </button>

            <div className="mt-5 sm:mt-6">
              <Link 
                href="/" 
                onClick={handleLinkClick}
                className="inline-block group transition-transform duration-300 hover:scale-105 active:scale-95"
                aria-label="Signature Art Hotel Home"
              >
                <Image
                  src="/images/logo/signaturearthotellogo.webp"
                  alt="Signature Art Hotel"
                  width={240}
                  height={120}
                  className="h-[52px] sm:h-[62px] w-auto object-contain drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] group-hover:brightness-115 transition-all duration-300"
                />
              </Link>
            </div>
          </div>

          {/* Main Navigation Links: Perfectly spaced to fill vertical height naturally without scrolling */}
          <nav className="flex flex-col justify-center gap-2 sm:gap-2.5 my-auto py-2">
            {navLinks.map((link) => {
              const isActive = link.href === "/" 
                ? pathname === "/" 
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`font-jost text-[17px] sm:text-[19px] lg:text-[20px] font-light tracking-[0.02em] transition-all duration-200 py-0.5 block ${
                    isActive 
                      ? "text-[#d7b56d] font-normal translate-x-1" 
                      : "text-[#FFFFFF]/90 hover:text-[#d7b56d] hover:translate-x-1.5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section: Legal Pages, Divider & Language/Account */}
          <div className="flex flex-col pt-3 shrink-0">
            {/* Secondary / Legal Links Row */}
            <div className="flex items-center justify-between text-[12px] sm:text-[13px] font-light tracking-[0.05em] text-[#FFFFFF]/70 font-jost">
              <Link 
                href="/privacy" 
                onClick={handleLinkClick} 
                className={`transition-colors hover:text-[#d7b56d] ${
                  pathname === "/privacy" ? "text-[#d7b56d] font-medium" : ""
                }`}
              >
                Privacy Policy
              </Link>
              <span className="text-[#d7b56d]/50">•</span>
              <Link 
                href="/terms" 
                onClick={handleLinkClick} 
                className={`transition-colors hover:text-[#d7b56d] ${
                  pathname === "/terms" ? "text-[#d7b56d] font-medium" : ""
                }`}
              >
                Terms & Conditions
              </Link>
            </div>

            {/* Subtle Divider */}
            <div className="w-full h-[1px] bg-[#d7b56d]/35 my-3 sm:my-3.5" />

            {/* Bottom Row: Language Selector & User Account */}
            <div className="flex items-center justify-between text-[13px] sm:text-[14px] text-white font-jost">
              <span className="font-semibold tracking-[0.12em] text-[#FFFFFF]/90 cursor-default">
                EN
              </span>
              <Link 
                href={user ? "/profile" : "/login"} 
                onClick={handleLinkClick} 
                className={`flex items-center gap-2 text-[#FFFFFF]/90 hover:text-[#d7b56d] transition-colors ${
                  (pathname === "/profile" || pathname === "/login") ? "text-[#d7b56d]" : ""
                }`}
              >
                <div className="w-5 h-5 rounded-full border border-[#d7b56d]/60 flex items-center justify-center">
                  <User size={12} strokeWidth={2} className="text-[#d7b56d]" />
                </div>
                <span className="font-light tracking-[0.04em]">{user ? "My Profile" : "Sign In"}</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
