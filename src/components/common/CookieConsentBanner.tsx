"use client";

import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, X, ChevronDown, ChevronUp, Check } from "lucide-react";

const CONSENT_KEY = "oslo_cookie_consent_v2";
const DETAILS_KEY = "oslo_cookie_consent_details_v2";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference switches
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(true);

  // Helper to read cookie by name
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
    return match ? decodeURIComponent(match[3]) : null;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user already decided
    let savedConsent: string | null = null;
    try {
      savedConsent = localStorage.getItem(CONSENT_KEY) || getCookie(CONSENT_KEY);
    } catch {
      // In case localStorage is blocked by browser security
      savedConsent = getCookie(CONSENT_KEY);
    }

    if (!savedConsent) {
      // First time visitor - show immediately with smooth fade
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 150);
      return () => clearTimeout(timer);
    }

    // Listener to re-open settings from Footer or links
    const handleOpenSettings = () => {
      setIsRendered(true);
      setIsVisible(true);
      setShowPreferences(true);
    };

    const handleHashChange = () => {
      if (window.location.hash === "#cookies") {
        handleOpenSettings();
      }
    };

    window.addEventListener("open-cookie-settings", handleOpenSettings);
    window.addEventListener("hashchange", handleHashChange);

    // Initial hash check
    if (window.location.hash === "#cookies") {
      handleOpenSettings();
    }

    // Expose dev/testing reset helper on window
    (window as any).__resetCookieConsent = () => {
      try {
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(DETAILS_KEY);
        localStorage.removeItem("oslo_cookie_consent");
        document.cookie = `${CONSENT_KEY}=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `oslo_cookie_consent=; path=/; max-age=0; SameSite=Lax`;
      } catch {}
      setIsRendered(true);
      setIsVisible(true);
      console.log("Cookie consent reset. Reloading or showing banner.");
    };

    return () => {
      window.removeEventListener("open-cookie-settings", handleOpenSettings);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const saveConsent = (choice: string, details?: Record<string, boolean>) => {
    const consentDetails = details || {
      essential: true,
      analytics: choice === "accepted",
      marketing: choice === "accepted",
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(CONSENT_KEY, choice);
        localStorage.setItem(DETAILS_KEY, JSON.stringify(consentDetails));
        localStorage.setItem("oslo_cookie_consent_date_v2", new Date().toISOString());
      }
    } catch {}

    // Also persist via standard 1-year browser cookie
    try {
      const oneYear = 60 * 60 * 24 * 365;
      document.cookie = `${CONSENT_KEY}=${choice}; path=/; max-age=${oneYear}; SameSite=Lax`;
    } catch {}

    // Animate out gracefully
    setIsVisible(false);
    setTimeout(() => setIsRendered(false), 300);
  };

  const handleAcceptAll = () => {
    saveConsent("accepted", { essential: true, analytics: true, marketing: true });
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

  if (!isRendered) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and Privacy Consent"
      className={`fixed bottom-4 sm:bottom-6 left-4 right-4 sm:right-auto sm:left-6 z-[99999] max-w-[calc(100vw-32px)] sm:max-w-[440px] md:max-w-[480px] font-jost select-none print:hidden transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-[#000000]/95 backdrop-blur-md border border-[#d7b56d]/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 text-white flex flex-col gap-3.5 relative overflow-hidden">
        {/* Subtle decorative gold glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#d7b56d]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#d7b56d]/25 border border-[#d7b56d]/50 flex items-center justify-center text-[#e6ca9f] shrink-0 shadow-inner">
              <Cookie size={18} />
            </div>
            <div>
              <h4 className="font-marcellus text-sm sm:text-base text-[#f7e7ce] tracking-wide font-medium">
                Bespoke Experience & Privacy
              </h4>
              <span className="text-[10px] text-[#d7b56d] uppercase tracking-widest font-semibold flex items-center gap-1">
                <ShieldCheck size={11} />
                Oslo Elite Privacy Standard
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEssentialOnly}
            className="text-zinc-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            title="Decline non-essential cookies"
            aria-label="Close and decline non-essential cookies"
          >
            <X size={16} />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-300 leading-relaxed font-normal relative z-10">
          We use refined cookies and secure technologies to remember your suite reservation choices, tailor bespoke concierge recommendations, and ensure optimal website performance.
        </p>

        {/* Expandable Preferences Drawer */}
        {showPreferences && (
          <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#d7b56d]/25 space-y-3 text-xs relative z-10 animate-in fade-in duration-200">
            {/* Essential Cookies */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-white block text-[11.5px]">Essential & Security</span>
                <span className="text-[10px] text-zinc-400 block">Required for room bookings and secure authentication.</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#d7b56d] px-2 py-0.5 bg-[#d7b56d]/10 rounded border border-[#d7b56d]/30 shrink-0">
                Always Active
              </span>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
              <div>
                <span className="font-semibold text-white block text-[11.5px]">Performance & Analytics</span>
                <span className="text-[10px] text-zinc-400 block">Helps us refine loading speeds and booking flow.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#d7b56d]"></div>
              </label>
            </div>

            {/* Marketing & Personalization */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
              <div>
                <span className="font-semibold text-white block text-[11.5px]">Concierge Personalization</span>
                <span className="text-[10px] text-zinc-400 block">Tailors suite offers and dining recommendations.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#d7b56d]"></div>
              </label>
            </div>
          </div>
        )}

        {/* Buttons and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#d7b56d]/20 relative z-10">
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-[11px] text-[#d7b56d] hover:text-white flex items-center gap-1 transition-colors font-medium py-1 cursor-pointer"
          >
            <span>{showPreferences ? "Hide Details" : "Preferences"}</span>
            {showPreferences ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {showPreferences ? (
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-3.5 py-1.5 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-[#d7b56d]/50 text-[#f7e7ce] text-xs font-semibold transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-white/10 border border-zinc-600 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Essential Only
              </button>
            )}

            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#d7b56d] via-[#e5cfa3] to-[#b3914a] text-[#000000] text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1 cursor-pointer"
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
