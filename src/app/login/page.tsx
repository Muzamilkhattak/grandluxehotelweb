"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, signupAction } from "@/app/actions/auth";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function LoginFormContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [formTs, setFormTs] = useState<number>(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  // Initialize anti-bot timestamp upon mount
  useEffect(() => {
    setFormTs(Date.now());
  }, []);

  // Active lockout countdown
  useEffect(() => {
    if (lockoutSeconds <= 0) {
      if (isLocked) setIsLocked(false);
      return;
    }
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds, isLocked]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocked) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);

    let res;
    if (isLogin) {
      res = await loginAction(formData);
    } else {
      res = await signupAction(formData);
    }

    if (res.success) {
      if (res.message) {
        setSuccessMessage(res.message);
        setLoading(false);
      } else {
        setSuccessMessage(
          isLogin
            ? "Signed in successfully! Redirecting..."
            : "Account created successfully! Redirecting..."
        );
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 500);
      }
    } else {
      setError(res.error || "An unexpected error occurred. Please try again.");
      if (res.isLocked && res.retryAfterSeconds) {
        setIsLocked(true);
        setLockoutSeconds(res.retryAfterSeconds);
      }
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden">
      {/* Background Image Layer with Luxury Overlay */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/images/Roomsherosectionbg.webp"
          alt="Signature Art Hotel Atmosphere"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
        {/* Soft luxury multi-stop dark wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090c]/92 via-[#0a0d12]/85 to-[#07090c]/95" />
        {/* Ambient radial gold glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(215,181,109,0.22)_0%,rgba(215,181,109,0.06)_45%,transparent_75%)]" />
      </div>

      {/* Main Solid Luxury Form Card */}
      <div className="relative z-10 w-full max-w-[460px] bg-[#0f1319] border border-[#d7b56d]/35 rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(215,181,109,0.12)] overflow-hidden">
        {/* Top Gold Accent Highlight */}
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#d7b56d] to-transparent shadow-[0_0_12px_rgba(215,181,109,0.8)]" />

        <div className="p-6 sm:p-9">
          {/* Top Bar: Back to Home & SSL Security Badge */}
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[12px] font-jost uppercase tracking-wider text-white/70 hover:text-[#d7b56d] transition-colors group"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-[#d7b56d]" />
              <span>Back to Home</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-[#d7b56d] font-jost font-semibold bg-[#d7b56d]/10 border border-[#d7b56d]/30 px-2.5 py-0.5 rounded-full">
              <ShieldCheck size={12} className="text-[#d7b56d]" /> 256-Bit SSL
            </span>
          </div>

          {/* Hotel Brand Logo & Title */}
          <div className="text-center mb-6 flex flex-col items-center">
            <Link href="/" className="inline-block group mb-2" aria-label="Signature Art Hotel Home">
              <Image
                src="/images/logo/signaturearthotellogo.webp"
                alt="Signature Art Hotel"
                width={260}
                height={120}
                priority
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_4px_24px_rgba(215,181,109,0.3)] transition-transform group-hover:scale-105 duration-300"
              />
            </Link>
            <h1 className="font-marcellus text-2xl sm:text-[26px] text-white tracking-wide mt-1">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="font-jost text-white/70 text-[13px] sm:text-[13.5px] mt-1 max-w-[340px]">
              {isLogin
                ? "Sign in to access your luxury suite reservations & profile."
                : "Join Signature Art Hotel for exclusive suite booking privileges."}
            </p>
          </div>

          {/* Segmented Mode Selector: Sign In / Create Account */}
          <div className="grid grid-cols-2 p-1 bg-[#07090d] rounded-xl border border-white/10 mb-6 text-[13px] font-jost font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccessMessage(null);
                setFormTs(Date.now());
              }}
              className={`py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                isLogin
                  ? "bg-gradient-to-r from-[#d7b56d] via-[#eddab2] to-[#c59e4e] text-[#0a0a0a] font-bold shadow-md shadow-[#d7b56d]/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccessMessage(null);
                setFormTs(Date.now());
              }}
              className={`py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                !isLogin
                  ? "bg-gradient-to-r from-[#d7b56d] via-[#eddab2] to-[#c59e4e] text-[#0a0a0a] font-bold shadow-md shadow-[#d7b56d]/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="bg-rose-950/80 border border-rose-500/60 text-rose-200 px-4 py-3 text-[13px] font-jost mb-5 flex items-start gap-2.5 rounded-xl shadow-lg animate-in fade-in">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 px-4 py-3 text-[13px] font-jost mb-5 flex items-start gap-2.5 rounded-xl shadow-lg animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-snug">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Anti-Bot Invisible Honeypot Trap */}
            <div
              style={{
                position: "absolute",
                left: "-9999px",
                top: "-9999px",
                opacity: 0,
                pointerEvents: "none",
              }}
              aria-hidden="true"
            >
              <label htmlFor="hotel_hp_field">Security Verification</label>
              <input
                id="hotel_hp_field"
                name="hotel_hp_field"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Time-To-Submit Verification Token */}
            <input type="hidden" name="_form_ts" value={formTs} />

            {!isLogin && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <User size={13} className="text-[#d7b56d]" /> Full Name *
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    maxLength={70}
                    placeholder="Eleanor Vance"
                    className="w-full bg-[#151922] hover:bg-[#191e28] focus:bg-[#161b25] border border-white/15 focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/25 px-3.5 py-2.5 rounded-xl text-[14px] font-jost text-white placeholder:text-white/30 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <Phone size={13} className="text-[#d7b56d]" /> Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    maxLength={25}
                    placeholder="+47 22 00 00 00"
                    className="w-full bg-[#151922] hover:bg-[#191e28] focus:bg-[#161b25] border border-white/15 focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/25 px-3.5 py-2.5 rounded-xl text-[14px] font-jost text-white placeholder:text-white/30 outline-none transition-all"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                <Mail size={13} className="text-[#d7b56d]" /> Email Address *
              </label>
              <input
                name="email"
                type="email"
                required
                maxLength={128}
                placeholder="name@example.com"
                className="w-full bg-[#151922] hover:bg-[#191e28] focus:bg-[#161b25] border border-white/15 focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/25 px-3.5 py-2.5 rounded-xl text-[14px] font-jost text-white placeholder:text-white/30 outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11.5px] font-semibold font-jost uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                  <Lock size={13} className="text-[#d7b56d]" /> Password *
                </label>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder={isLogin ? "••••••••" : "Minimum 8 characters"}
                  className="w-full bg-[#151922] hover:bg-[#191e28] focus:bg-[#161b25] border border-white/15 focus:border-[#d7b56d] focus:ring-2 focus:ring-[#d7b56d]/25 px-3.5 py-2.5 pr-10 rounded-xl text-[14px] font-jost text-white placeholder:text-white/30 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#d7b56d] transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {!isLogin && (
                <span className="text-[11px] font-jost text-white/50 mt-0.5">
                  Must be at least 8 characters
                </span>
              )}
            </div>

            {/* Solid Luxury Submit Button */}
            <button
              type="submit"
              disabled={loading || isLocked}
              className="mt-2 w-full bg-gradient-to-r from-[#d7b56d] via-[#eddab2] to-[#c59e4e] hover:brightness-110 active:scale-[0.99] text-[#0a0a0a] font-jost font-bold uppercase tracking-[0.16em] text-[13px] py-3.5 rounded-xl shadow-[0_4px_22px_rgba(215,181,109,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-[#0a0a0a]" />
              ) : isLocked ? (
                <>
                  <Lock size={15} />
                  <span>Locked ({lockoutSeconds}s)</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center border-t border-white/10 pt-4">
            <p className="font-jost text-[13.5px] text-white/70">
              {isLogin ? "Don't have an account yet?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMessage(null);
                  setFormTs(Date.now());
                }}
                className="ml-2 text-[#d7b56d] font-semibold hover:underline cursor-pointer"
              >
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#07090c]">
          <Loader2 size={32} className="animate-spin text-[#d7b56d]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
