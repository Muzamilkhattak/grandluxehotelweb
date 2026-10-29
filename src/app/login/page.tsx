"use client";

import { useState, useEffect, Suspense } from "react";
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
} from "lucide-react";

function LoginFormContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

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
        setSuccessMessage(isLogin ? "Signed in successfully! Redirecting..." : "Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 600);
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
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4 py-24 sm:py-28"
      style={{ backgroundImage: 'url("/images/hero-1.jpg")' }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md bg-white p-6 sm:p-10 shadow-2xl border-t-4 border-[#d7b56d]">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12px] font-jost uppercase tracking-wider text-[#000000]/70 hover:text-[#d7b56d] transition-colors"
          >
            <ChevronLeft size={14} /> Back to Home
          </Link>
        </div>

        <div className="text-center mb-6">
          <h1 className="font-marcellus text-2xl sm:text-3xl text-[#000000] mb-2">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </h1>
          <p className="font-jost text-[#000000]/80 text-[13.5px]">
            {isLogin
              ? "Sign in to manage your reservations and profile."
              : "Join Grand Luxe to book exclusive luxury suites."}
          </p>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#EF4444] text-[#991B1B] px-4 py-3 text-[13px] font-jost mb-5 flex items-start gap-2 rounded-sm animate-in fade-in">
            <span className="font-bold mt-0.5 text-[#EF4444]">!</span>
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-[#F0FDF4] border border-[#22C55E] text-[#166534] px-4 py-3 text-[13px] font-jost mb-5 flex items-start gap-2 rounded-sm animate-in fade-in">
            <CheckCircle2 size={16} className="text-[#22C55E] shrink-0 mt-0.5" />
            <p className="leading-snug">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
                  <User size={13} className="text-[#d7b56d]" /> Full Name *
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Eleanor Vance"
                  className="w-full bg-[#FFFFFF] border border-[#d7b56d] focus:border-[#000000] px-3.5 py-2.5 text-[14px] font-jost text-[#000000] outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
                  <Phone size={13} className="text-[#d7b56d]" /> Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+47 22 00 00 00"
                  className="w-full bg-[#FFFFFF] border border-[#d7b56d] focus:border-[#000000] px-3.5 py-2.5 text-[14px] font-jost text-[#000000] outline-none transition-colors"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
              <Mail size={13} className="text-[#d7b56d]" /> Email Address *
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="w-full bg-[#FFFFFF] border border-[#d7b56d] focus:border-[#000000] px-3.5 py-2.5 text-[14px] font-jost text-[#000000] outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
              <Lock size={13} className="text-[#d7b56d]" /> Password *
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder={isLogin ? "••••••••" : "Minimum 6 characters"}
                className="w-full bg-[#FFFFFF] border border-[#d7b56d] focus:border-[#000000] px-3.5 py-2.5 pr-10 text-[14px] font-jost text-[#000000] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isLogin && (
              <span className="text-[11px] font-jost text-gray-500">
                Must be at least 6 characters
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="mt-3 w-full bg-[#000000] hover:bg-[#d7b56d] text-white font-jost font-semibold uppercase tracking-[0.18em] text-[13px] py-3.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
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

        <div className="mt-7 text-center border-t border-[#d7b56d]/40 pt-5">
          <p className="font-jost text-[14px] text-[#000000]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccessMessage(null);
              }}
              className="ml-2 text-[#d7b56d] font-semibold hover:underline cursor-pointer"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Loader2 size={32} className="animate-spin text-[#d7b56d]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
