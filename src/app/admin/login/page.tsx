"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdminAction } from "@/app/actions/admin-auth";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, Sparkles, Building2, KeyRound } from "lucide-react";
import Link from "next/link";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        }
      } catch (err: any) {
        setErrorMessage("A network or server error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0d10] text-[#e1e4e8] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#c5a880]/12 via-[#997a4d]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-[#2271b1]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main container */}
      <div className="w-full max-w-[440px] relative z-10">
        
        {/* Top Hotel Brand Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2a2319] via-[#1a1714] to-[#12100e] border border-[#c5a880]/40 shadow-[0_0_25px_rgba(197,168,128,0.15)] mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#e7d7be] via-[#c5a880] to-[#997a4d] bg-clip-text text-transparent font-serif">
              Ø
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-wider text-white font-serif">
            OSLO ELITE HOTEL
          </h1>
          <p className="text-[12px] tracking-[0.22em] uppercase text-[#c5a880] font-medium mt-1">
            Executive Admin Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#12161b]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-7 md:p-9 shadow-2xl shadow-black/80 relative">
          
          <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#c5a880]" />
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
                  className="w-full bg-[#181e25] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-all"
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
                  className="w-full bg-[#181e25] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-all"
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
              disabled={isPending}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#c5a880] to-[#997a4d] hover:from-[#d2b68e] hover:to-[#a88755] active:scale-[0.99] text-[#111] font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#c5a880]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <>
                  <Loader2 size={17} className="animate-spin text-[#111]" />
                  <span>Verifying Credentials...</span>
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
              <Sparkles size={13} className="text-[#c5a880]/70" />
              <span>Encrypted Session</span>
            </div>
            <Link
              href="/"
              className="text-[#c5a880] hover:text-white transition-colors flex items-center gap-1"
            >
              <Building2 size={13} />
              <span>Back to Public Site</span>
            </Link>
          </div>
        </div>

        {/* Security footer note */}
        <p className="text-center text-[11px] text-white/30 mt-6 tracking-wide">
          Oslo Elite Hotel Management System &bull; Authorized Personnel Only
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
          <Loader2 className="w-8 h-8 animate-spin text-[#c5a880]" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
