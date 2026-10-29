"use client";

import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, X, ChevronDown, ChevronUp, Check } from "lucide-react";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference switches
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user has already made a cookie choice
    const savedConsent = localStorage.getItem("oslo_cookie_consent");
    if (!savedConsent) {
      // Small graceful delay for luxury entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (choice: string, details?: Record<string, boolean>) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("oslo_cookie_consent", choice);
      localStorage.setItem(
        "oslo_cookie_consent_details",
        JSON.stringify(details || { essential: true, analytics: choice === "accepted", marketing: choice === "accepted" })
      );
      localStorage.setItem("oslo_cookie_consent_date", new Date().toISOString());
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent("accepted");
  };

  const handleEssentialOnly = () => {
    saveConsent("essential_only", { essential: true, analytics: false, marketing: false });
  };

  const handleSavePreferences = () => {
    saveConsent("custom", {
      essential: true,
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-40 max-w-[calc(100vw-32px)] sm:max-w-[440px] md:max-w-[480px] font-jost select-none print:hidden animate-slideUp">
      <div className="bg-[#000000]/95 backdrop-blur-md border border-[#d7b56d]/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] p-5 text-white flex flex-col gap-3.5 relative overflow-hidden">
        {/* Subtle decorative gold glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d7b56d]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#d7b56d]/30 border border-[#d7b56d]/50 flex items-center justify-center text-[#e6ca9f] shrink-0 shadow-inner">
              <Cookie size={18} />
            </div>
            <div>
              <h4 className="font-marcellus text-sm sm:text-base text-[#f7e7ce] tracking-wide font-medium">
                Bespoke Digital Experience & Privacy
              </h4>
              <span className="text-[10px] text-[#d7b56d]/90 uppercase tracking-widest font-semibold flex items-center gap-1">
                <ShieldCheck size={11} />
                Oslo Elite Privacy Standard
              </span>
            </div>
          </div>

          <button
            onClick={handleEssentialOnly}
            className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
            title="Decline non-essential cookies"
          >
            <X size={15} />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-300 leading-relaxed font-normal">
          We use refined cookies and secure technologies to remember your suite reservation choices, tailor bespoke concierge recommendations, and ensure optimal website performance.
        </p>

        {/* Expandable Preferences Drawer */}
        {showPreferences && (
          <div className="p-3 rounded-xl bg-[#000000]/80 border border-[#d7b56d]/20 space-y-2.5 text-xs animate-fadeIn">
            {/* Essential Cookies */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block text-[11.5px]">Essential & Security</span>
                <span className="text-[10px] text-zinc-400 block">Required for room bookings and secure authentication.</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#d7b56d] px-2 py-0.5 bg-[#d7b56d]/10 rounded border border-[#d7b56d]/30">
                Always Active
              </span>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div>
                <span className="font-semibold text-white block text-[11.5px]">Performance & Analytics</span>
                <span className="text-[10px] text-zinc-400 block">Helps us refine loading speeds and booking flow.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.value === "true" || e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#d7b56d]"></div>
              </label>
            </div>

            {/* Marketing & Personalization */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div>
                <span className="font-semibold text-white block text-[11.5px]">Concierge Personalization</span>
                <span className="text-[10px] text-zinc-400 block">Tailors suite offers and dining recommendations.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.value === "true" || e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#d7b56d]"></div>
              </label>
            </div>
          </div>
        )}

        {/* Buttons and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#d7b56d]/15">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-[11px] text-[#d7b56d] hover:text-white flex items-center gap-1 transition-colors font-medium py-1"
          >
            <span>{showPreferences ? "Hide Details" : "Preferences"}</span>
            {showPreferences ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {showPreferences ? (
              <button
                onClick={handleSavePreferences}
                className="px-3.5 py-1.5 rounded-lg bg-[#000000] hover:bg-[#4a301e] border border-[#d7b56d]/40 text-[#f7e7ce] text-xs font-semibold transition-colors"
              >
                Save Preferences
              </button>
            ) : (
              <button
                onClick={handleEssentialOnly}
                className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-white/5 border border-zinc-500/50 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
              >
                Essential Only
              </button>
            )}

            <button
              onClick={handleAcceptAll}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#d7b56d] via-[#dfc49c] to-[#9c7d49] text-[#1c130b] text-xs font-bold uppercase tracking-wider hover:opacity-95 active:scale-98 transition-all shadow-md flex items-center gap-1"
            >
              <Check size={13} strokeWidth={3} />
              <span>Accept All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
