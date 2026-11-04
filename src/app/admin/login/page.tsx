"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdminAction } from "@/app/actions/admin-auth";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, Sparkles, Building2, KeyRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Active countdown timer for lockout
  useEffect(() => {
    if (lockoutCountdown <= 0) {
      if (isLocked) setIsLocked(false);
      return;
    }
    const timer = setInterval(() => {
      setLockoutCountdown((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setErrorMessage("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutCountdown, isLocked]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocked) return;
    setErrorMessage("");

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    startTransition(async () => {
      try {
        const result = await loginAdminAction(formData);
        if (result.success) {
          router.push(redirectPath);
          router.refresh();
        } else {
          setErrorMessage(result.error || "Authentication failed. Please check credentials.");
          if (result.isLocked && result.retryAfterSeconds) {
            setIsLocked(true);
            setLockoutCountdown(result.retryAfterSeconds);
          }
        }
      } catch (err: any) {
        setErrorMessage("A network or server error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Image Layer with Luxury Dark Overlay */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/images/about/about-hero.jpg"
          alt="Signature Art Hotel Atmosphere"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090c]/92 via-[#0a0d12]/85 to-[#07090c]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(215,181,109,0.2)_0%,rgba(215,181,109,0.05)_45%,transparent_75%)]" />
      </div>

      {/* Main container */}
      <div className="w-full max-w-[450px] relative z-10">
        
        {/* Top Hotel Brand Badge */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Link href="/" className="inline-block group mb-3">
            <Image
              src="/images/logo/signaturearthotellogo.webp"
              alt="Signature Art Hotel"
              width={240}
              height={130}
              priority
              className="h-20 w-auto object-contain drop-shadow-[0_4px_24px_rgba(215,181,109,0.3)] transition-transform group-hover:scale-105 duration-300"
            />
          </Link>
          <p className="text-[11.5px] tracking-[0.28em] uppercase text-[#d7b56d] font-semibold bg-[#d7b56d]/10 border border-[#d7b56d]/30 px-3.5 py-1 rounded-full">
            Executive Admin Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#0f1319] border border-[#d7b56d]/35 rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(215,181,109,0.12)] overflow-hidden relative">
          {/* Top Gold Accent Highlight */}
          <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#d7b56d] to-transparent shadow-[0_0_12px_rgba(215,181,109,0.8)]" />
          
          <div className="p-7 md:p-9">
          
          <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#d7b56d]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/90">
                Secure Authentication
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Protected
            </span>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/70 uppercase tracking-wider">
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-white/40 pointer-events-none">
                  <User size={17} />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#181e25] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-white/70 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-white/40 pointer-events-none">
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#181e25] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 text-white/40 hover:text-white/80 p-1 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending || isLocked}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#d7b56d] to-[#997a4d] hover:from-[#d2b68e] hover:to-[#a88755] active:scale-[0.99] text-[#111] font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#d7b56d]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <>
                  <Loader2 size={17} className="animate-spin text-[#111]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isLocked ? (
                <>
                  <Lock size={16} className="text-red-950" />
                  <span>Temporarily Locked ({lockoutCountdown}s)</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Info & Help */}
          <div className="mt-7 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#d7b56d]/70" />
              <span>Encrypted Session</span>
            </div>
            <Link
              href="/"
              className="text-[#d7b56d] hover:text-white transition-colors flex items-center gap-1"
            >
              <Building2 size={13} />
              <span>Back to Public Site</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Security footer note */}
      <p className="text-center text-[11px] text-white/30 mt-6 tracking-wide">
        Signature Art Hotel Management System &bull; Authorized Personnel Only
      </p>
    </div>
  </div>
);
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#0a0d10] flex items-center justify-center text-white/60">
          <Loader2 className="w-8 h-8 animate-spin text-[#d7b56d]" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
