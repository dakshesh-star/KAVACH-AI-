"use client";

// FIX BUG-007: Removed the manual profile upsert after signUp.
// The database trigger `handle_new_user` in supabase-schema.sql already
// inserts into `profiles` automatically on auth.users INSERT.
// The manual upsert was redundant and could fail with an RLS error when
// the user's session isn't yet established (email confirmation flow).

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield, Mail, Lock, Eye, EyeOff, User, Phone,
  ChevronRight, CheckCircle, BarChart2, Clock, Star, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const benefits = [
  { icon: <Shield className="w-4 h-4 text-blue-400" />, title: "Scam Detection", desc: "AI-powered analysis of screenshots, messages & URLs" },
  { icon: <Clock className="w-4 h-4 text-violet-400" />, title: "Analysis History", desc: "Track every threat you've analyzed, forever" },
  { icon: <BarChart2 className="w-4 h-4 text-sky-400" />, title: "Recovery Dashboard", desc: "Step-by-step guidance if you've been targeted" },
  { icon: <Star className="w-4 h-4 text-emerald-400" />, title: "Personalized Protection", desc: "Scam alerts tailored to your risk profile" },
];

interface FormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  mobile?: string;
  password?: string;
  confirmPassword?: string;
  global?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ name: "", email: "", mobile: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.mobile) e.mobile = "Mobile number is required";
    else if (!/^\+?[0-9]{10,13}$/.test(form.mobile.replace(/\s/g, ""))) e.mobile = "Enter a valid mobile number";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, mobile: form.mobile },
      },
    });

    if (error) {
      setIsLoading(false);
      if (error.message.toLowerCase().includes("already")) {
        setErrors({ global: "An account with this email already exists. Please sign in instead." });
      } else if (error.message.toLowerCase().includes("weak")) {
        setErrors({ password: "Password is too weak. Use a mix of letters, numbers, and symbols." });
      } else {
        setErrors({ global: error.message });
      }
      return;
    }

    // FIX BUG-007: Removed manual profile upsert — the DB trigger handles it.
    // The `handle_new_user` trigger fires on auth.users INSERT and creates the
    // profile row using the `full_name` from raw_user_meta_data passed above.

    setIsLoading(false);

    // If email confirmation is disabled in Supabase, redirect to dashboard.
    // If email confirmation is enabled, show the success / check-your-email screen.
    if (data.session) {
      router.push("/dashboard");
    } else {
      setSuccess(true);
    }
  };

  const passwordStrength = (): { label: string; color: string; width: string } => {
    const p = form.password;
    if (!p) return { label: "", color: "bg-white/10", width: "0%" };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "25%" };
    if (score === 2) return { label: "Fair", color: "bg-orange-400", width: "50%" };
    if (score === 3) return { label: "Good", color: "bg-blue-400", width: "75%" };
    return { label: "Strong", color: "bg-emerald-400", width: "100%" };
  };

  const strength = passwordStrength();

  if (success) {
    return (
      <div className="min-h-screen bg-[#060B18] flex items-center justify-center p-8">
        <div className="glass-card p-9 w-full max-w-[380px] text-center">
          <div className="w-16 h-16 gradient-kavach rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-[22px] font-black text-white mb-2">Check your email</h2>
          <p className="text-[13px] text-slate-400 mb-6">
            We sent a confirmation link to <span className="text-white font-semibold">{form.email}</span>. Click it to activate your account.
          </p>
          <Link href="/login">
            <button className="w-full h-[44px] gradient-kavach rounded-[12px] text-[13px] font-bold text-white">
              Back to Sign in
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060B18] flex overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[120px] -right-[80px] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 65%)", animation: "glowPulse 22s ease-in-out infinite" }} />
        <div className="absolute -bottom-[100px] -left-[60px] w-[440px] h-[440px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(30,64,175,0.18) 0%, transparent 65%)", animation: "glowPulse 28s ease-in-out infinite reverse" }} />
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
      </div>

      {/* Left Panel — Form */}
      <div className="w-full lg:w-[52%] flex items-center justify-center p-8 z-10">
        <div className="glass-card p-9 w-full max-w-[400px]" style={{ animation: "fadeSlide 0.5s 0.1s ease-out both", opacity: 0 }}>
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300/20 to-transparent animate-scanline" />

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 gradient-kavach rounded-[6px] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[13px] font-black text-white">KAVACH</span>
            </div>
            <h2 className="text-[22px] font-black text-white tracking-tight leading-tight mb-1">Create your account</h2>
            <p className="text-[12px] text-slate-500">Free forever. No credit card required.</p>
          </div>

          {errors.global && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-[12px] text-red-400">{errors.global}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            {/* Name */}
            <div className="relative">
              <User className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors", activeField === "name" ? "text-blue-400" : "text-blue-400/50")} />
              <input type="text" placeholder="Full name" value={form.name} onChange={set("name")}
                onFocus={() => setActiveField("name")} onBlur={() => setActiveField(null)}
                className={cn("w-full h-[46px] bg-white/[0.05] border rounded-[11px] pl-[44px] pr-4 text-[13px] text-white/85 placeholder-white/25 outline-none transition-all",
                  activeField === "name" ? "border-blue-400/55 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : errors.name ? "border-red-500/50" : "border-white/10 hover:border-white/18")} />
              {errors.name && <p className="text-[11px] text-red-400 mt-1 ml-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors", activeField === "email" ? "text-blue-400" : "text-blue-400/50")} />
              <input type="email" placeholder="Email address" value={form.email} onChange={set("email")}
                onFocus={() => setActiveField("email")} onBlur={() => setActiveField(null)}
                className={cn("w-full h-[46px] bg-white/[0.05] border rounded-[11px] pl-[44px] pr-4 text-[13px] text-white/85 placeholder-white/25 outline-none transition-all",
                  activeField === "email" ? "border-blue-400/55 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : errors.email ? "border-red-500/50" : "border-white/10 hover:border-white/18")} />
              {errors.email && <p className="text-[11px] text-red-400 mt-1 ml-1">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div className="relative">
              <Phone className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors", activeField === "mobile" ? "text-blue-400" : "text-blue-400/50")} />
              <input type="tel" placeholder="Mobile number" value={form.mobile} onChange={set("mobile")}
                onFocus={() => setActiveField("mobile")} onBlur={() => setActiveField(null)}
                className={cn("w-full h-[46px] bg-white/[0.05] border rounded-[11px] pl-[44px] pr-4 text-[13px] text-white/85 placeholder-white/25 outline-none transition-all",
                  activeField === "mobile" ? "border-blue-400/55 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : errors.mobile ? "border-red-500/50" : "border-white/10 hover:border-white/18")} />
              {errors.mobile && <p className="text-[11px] text-red-400 mt-1 ml-1">{errors.mobile}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className={cn("absolute left-3.5 top-[23px] -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors", activeField === "password" ? "text-blue-400" : "text-blue-400/50")} />
              <input type={showPassword ? "text" : "password"} placeholder="Password (min 8 characters)" value={form.password} onChange={set("password")}
                onFocus={() => setActiveField("password")} onBlur={() => setActiveField(null)}
                className={cn("w-full h-[46px] bg-white/[0.05] border rounded-[11px] pl-[44px] pr-10 text-[13px] text-white/85 placeholder-white/25 outline-none transition-all",
                  activeField === "password" ? "border-blue-400/55 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : errors.password ? "border-red-500/50" : "border-white/10 hover:border-white/18")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[23px] -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {form.password && (
                <div className="mt-1.5 ml-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-300", strength.color)} style={{ width: strength.width }} />
                    </div>
                    <span className={cn("text-[10px] font-semibold", strength.color.replace("bg-", "text-"))}>{strength.label}</span>
                  </div>
                </div>
              )}
              {errors.password && <p className="text-[11px] text-red-400 mt-1 ml-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className={cn("absolute left-3.5 top-[23px] -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors", activeField === "confirm" ? "text-blue-400" : "text-blue-400/50")} />
              <input type={showConfirm ? "text" : "password"} placeholder="Confirm password" value={form.confirmPassword} onChange={set("confirmPassword")}
                onFocus={() => setActiveField("confirm")} onBlur={() => setActiveField(null)}
                className={cn("w-full h-[46px] bg-white/[0.05] border rounded-[11px] pl-[44px] pr-10 text-[13px] text-white/85 placeholder-white/25 outline-none transition-all",
                  activeField === "confirm" ? "border-blue-400/55 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : errors.confirmPassword ? "border-red-500/50" : "border-white/10 hover:border-white/18")} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-[23px] -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {errors.confirmPassword && <p className="text-[11px] text-red-400 mt-1 ml-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[46px] gradient-kavach rounded-[12px] text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(124,58,237,0.4)] disabled:opacity-70 disabled:pointer-events-none mt-1"
            >
              {isLoading ? (
                <>
                  <div className="w-[16px] h-[16px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create free account
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-600 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors no-underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-[10px] text-slate-700 mt-3">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Right Panel — Benefits */}
      <div className="hidden lg:flex w-[48%] relative flex-col items-center justify-center px-16 py-16 z-10">
        <div className="text-center mb-10 animate-fade-slide">
          <h2 className="text-[34px] font-black text-white leading-tight tracking-tight mb-3">
            Everything you need to<br />
            <span className="gradient-text animate-shimmer">stay protected</span>
          </h2>
          <p className="text-[14px] text-slate-400">Join thousands of Indians already protected by Kavach</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-[340px]">
          {benefits.map((b, i) => (
            <div key={b.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] transition-all hover:border-white/[0.12] hover:bg-white/[0.05]"
              style={{ animation: `fadeSlide 0.5s ${0.2 + i * 0.1}s ease-out both`, opacity: 0 }}>
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">{b.icon}</div>
              <div>
                <div className="text-[13px] font-bold text-white mb-0.5">{b.title}</div>
                <div className="text-[11px] text-slate-500">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-8 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-[11px] text-emerald-400">Free forever · No credit card · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
