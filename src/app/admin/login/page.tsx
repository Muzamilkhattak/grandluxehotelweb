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
              width={220}
              height={120}
              priority
              className="h-16 w-auto object-contain transition-opacity group-hover:opacity-90"
            />
          </Link>
          <span className="text-[11px] tracking-wider uppercase text-[#d7b56d] font-medium bg-[#d7b56d]/10 border border-[#d7b56d]/25 px-3 py-0.5 rounded-full">
            Executive Admin Portal
          </span>
        </div>

        {/* Login Box */}
        <div className="bg-[#0c0d0e] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden relative">
          {/* Top Gold Accent Highlight */}
          <div className="h-[2px] w-full bg-[#d7b56d]" />
          
          <div className="p-7 md:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#d7b56d]" />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-300">
                  Secure Authentication
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Protected
              </span>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 text-xs flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    autoComplete="username"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] transition-colors"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-10 pr-11 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d7b56d] focus:ring-1 focus:ring-[#d7b56d] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 text-zinc-500 hover:text-zinc-300 p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isPending || isLocked}
                className="w-full mt-2 py-2.5 px-4 bg-[#d7b56d] hover:bg-[#c9a65c] text-zinc-950 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-zinc-950" />
                    <span>Verifying credentials...</span>
                  </>
                ) : isLocked ? (
                  <>
                    <Lock size={15} className="text-zinc-950" />
                    <span>Temporarily locked ({lockoutCountdown}s)</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={15} />
                    <span>Sign in to admin panel</span>
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Info & Help */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#d7b56d]" />
                <span>Encrypted session</span>
              </div>
              <Link
                href="/"
                className="text-[#d7b56d] hover:underline transition-colors flex items-center gap-1"
              >
                <Building2 size={12} />
                <span>Back to public site</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Security footer note */}
        <p className="text-center text-[11px] text-zinc-500 mt-6 tracking-wide">
          Signature Art Hotel management system &bull; Authorized personnel only
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
