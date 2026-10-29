"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction, signupAction } from "@/app/actions/auth";
import { Loader2, Mail, Lock, User, Phone, ArrowRight, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const router = useRouter();

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

    const formData = new FormData(e.currentTarget);
    
    let res;
    if (isLogin) {
      res = await loginAction(formData);
    } else {
      res = await signupAction(formData);
    }

    if (res.success) {
      router.push("/profile");
      router.refresh();
    } else {
      setError(res.error || "An error occurred");
      if (res.isLocked && res.retryAfterSeconds) {
        setIsLocked(true);
        setLockoutSeconds(res.retryAfterSeconds);
      }
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative pt-20" style={{ backgroundImage: 'url("/images/hero-1.jpg")' }}>
      <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md bg-white p-8 md:p-10 shadow-2xl border-t-4 border-[#d7b56d]">
        <div className="text-center mb-8">
          <h1 className="font-marcellus text-3xl text-[#000000] mb-2">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </h1>
          <p className="font-jost text-[#000000] text-[14px]">
            {isLogin 
              ? "Sign in to manage your reservations and profile." 
              : "Join Grand Luxe to book exclusive luxury suites."}
          </p>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#EF4444] text-[#991B1B] px-4 py-3 text-[13px] font-jost mb-6 flex items-start gap-2">
            <span className="font-bold mt-0.5">!</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
                  <User size={13} className="text-[#d7b56d]" /> Full Name *
                </label>
                <input 
                  name="fullName" 
                  type="text" 
                  required 
                  placeholder="Eleanor Vance"
                  className="w-full bg-[#FFFFFF] border border-[#d7b56d] focus:border-[#d7b56d] px-4 py-3 text-[14px] font-jost text-[#000000] outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
                  <Phone size={13} className="text-[#d7b56d]" /> Phone Number
                </label>
                <input 
                  name="phone" 
                  type="tel" 
                  placeholder="+47 22 00 00 00"
                  className="w-full bg-[#FFFFFF] border border-[#d7b56d] focus:border-[#d7b56d] px-4 py-3 text-[14px] font-jost text-[#000000] outline-none transition-colors"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
              <Mail size={13} className="text-[#d7b56d]" /> Email Address *
            </label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="name@example.com"
              className="w-full bg-[#FFFFFF] border border-[#d7b56d] focus:border-[#d7b56d] px-4 py-3 text-[14px] font-jost text-[#000000] outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold font-jost uppercase tracking-wider text-[#000000] flex items-center gap-1.5">
              <Lock size={13} className="text-[#d7b56d]" /> Password *
            </label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full bg-[#FFFFFF] border border-[#d7b56d] focus:border-[#d7b56d] px-4 py-3 text-[14px] font-jost text-[#000000] outline-none transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || isLocked}
            className="mt-2 w-full bg-[#000000] hover:bg-[#d7b56d] text-white font-jost font-semibold uppercase tracking-[0.18em] text-[13px] py-4 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#d7b56d] pt-6">
          <p className="font-jost text-[14px] text-[#000000]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="ml-2 text-[#d7b56d] font-semibold hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
