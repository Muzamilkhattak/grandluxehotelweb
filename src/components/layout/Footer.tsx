"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Sparkles } from "lucide-react";

export default function Footer() {
  const [localTime, setLocalTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setLocalTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Oslo",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-[#24180E] text-[#FAF8F5] border-t-2 border-[#C97A4F] relative mt-20">
      {/* Subtle Warm Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#362618]/60 to-[#1A110A] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Simple & Elegant Centered Hotel Branding */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#C97A4F]/15 border border-[#C97A4F]/40 text-[#E5A882] text-[11.5px] font-jost font-semibold uppercase tracking-[0.2em]">
            <Sparkles size={12} className="text-[#C97A4F]" /> Oslo, Norway
          </div>

          <Link href="/" className="font-marcellus text-3xl md:text-4xl text-[#FFFFFF] tracking-[0.25em] uppercase hover:text-[#E5A882] transition-colors">
            Grand Luxe
          </Link>

          <p className="font-jost text-[#D8CFC4] text-[14.5px] tracking-wide max-w-md">
            Nordic elegance, bespoke comfort, and timeless hospitality in the heart of Oslo.
          </p>

          {/* Contact & Location Strip */}
          <div className="flex flex-wrap justify-center items-center gap-y-2 gap-x-6 text-[13.5px] font-jost text-[#EFEBE4] pt-2">
            <span className="flex items-center gap-1.5 hover:text-[#E5A882] transition-colors">
              <MapPin size={14} className="text-[#C97A4F] shrink-0" /> Karl Johans gate 37, Oslo
            </span>
            <span className="text-[#C97A4F]/60 hidden sm:inline">•</span>
            <a href="tel:+4722000000" className="flex items-center gap-1.5 hover:text-[#E5A882] transition-colors">
              <Phone size={14} className="text-[#C97A4F] shrink-0" /> +47 22 00 00 00
            </a>
            <span className="text-[#C97A4F]/60 hidden sm:inline">•</span>
            <a href="mailto:concierge@grandluxe.com" className="flex items-center gap-1.5 hover:text-[#E5A882] transition-colors">
              <Mail size={14} className="text-[#C97A4F] shrink-0" /> concierge@grandluxe.com
            </a>
          </div>
        </div>

        {/* Bottom Bar: Clean & Minimal */}
        <div className="mt-12 pt-6 border-t border-[#FAF8F5]/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-[12.5px] font-jost text-[#C4B9AD]">
          <p>© {new Date().getFullYear()} Grand Luxe Hotel & Suites. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-[#1A110A] px-3 py-1 border border-[#C97A4F]/30 text-[#FAF8F5]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <Clock size={13} className="text-[#C97A4F]" />
              <span className="font-medium">{localTime ? `${localTime} (Oslo Time)` : "Europe/Oslo"}</span>
            </div>

            <Link 
              href="/admin" 
              className="text-[#C4B9AD] hover:text-[#E5A882] transition-colors underline-offset-4 hover:underline"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
