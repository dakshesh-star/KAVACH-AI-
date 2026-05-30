"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LayoutDashboard, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    setDropdownOpen(false);
  };

  return (
    <nav className="flex items-center justify-between px-7 h-[52px] bg-[rgba(4,8,16,0.98)] border-b border-[#1E2A45] sticky top-0 z-50 backdrop-blur-xl">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 no-underline">
        <div className="w-[27px] h-[27px] gradient-kavach rounded-[7px] flex items-center justify-center text-[11px] font-black text-white relative overflow-hidden">
          <Shield className="w-3.5 h-3.5" />
        </div>
        <span className="text-[14px] font-black text-white tracking-tight">KAVACH</span>
        <span className="bg-[rgba(37,99,235,0.15)] border border-[rgba(37,99,235,0.3)] rounded px-[7px] py-[2px] text-[9px] font-bold text-blue-400 tracking-[0.04em]">
          BETA
        </span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex gap-[22px]">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-[12px] transition-colors duration-200 no-underline relative py-1",
              pathname === link.href
                ? "text-slate-200 font-semibold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:gradient-kavach after:rounded-sm"
                : "text-[#475569] hover:text-slate-400"
            )}
          >
            {link.label}
          </Link>
        ))}
        {user && (
          <Link
            href="/dashboard"
            className={cn(
              "text-[12px] transition-colors duration-200 no-underline relative py-1",
              pathname === "/dashboard"
                ? "text-slate-200 font-semibold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:gradient-kavach after:rounded-sm"
                : "text-[#475569] hover:text-slate-400"
            )}
          >
            Dashboard
          </Link>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-[10px]">
        <div className="hidden sm:flex items-center gap-[5px] text-[10px] text-emerald-400 font-semibold px-[10px] py-1 bg-[rgba(34,197,94,0.07)] border border-[rgba(34,197,94,0.15)] rounded-full">
          <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 animate-pulse-green" />
          AI Live
        </div>

        {loading ? null : user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="h-[30px] px-[12px] bg-white/[0.06] border border-white/[0.1] rounded-lg text-[11px] font-semibold text-slate-300 cursor-pointer transition-all hover:bg-white/[0.09] hover:text-white flex items-center gap-1.5"
            >
              <User className="w-3 h-3" />
              {user.email?.split("@")[0]}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-[38px] w-[180px] bg-[#0A101F] border border-[#1E2A45] rounded-xl shadow-xl overflow-hidden z-50">
                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-[12px] text-slate-300 hover:bg-white/5 hover:text-white transition-colors no-underline"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <Link
                  href="/history"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-[12px] text-slate-300 hover:bg-white/5 hover:text-white transition-colors no-underline"
                >
                  <Shield className="w-3.5 h-3.5" />
                  History
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-[12px] text-slate-300 hover:bg-white/5 hover:text-white transition-colors no-underline"
                >
                  <User className="w-3.5 h-3.5" />
                  Profile
                </Link>
                <div className="border-t border-[#1E2A45]" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/login">
              <button className="h-[30px] px-[14px] bg-white/[0.06] border border-white/[0.1] rounded-lg text-[11px] font-semibold text-slate-300 cursor-pointer transition-all hover:bg-white/[0.09] hover:text-white">
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button className="h-[30px] px-[14px] gradient-kavach rounded-lg text-[11px] font-bold text-white cursor-pointer transition-all hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(124,58,237,0.35)]">
                Sign up
              </button>
            </Link>
          </>
        )}
        <Link href="/analyze">
          <button className="h-[30px] px-[14px] gradient-kavach rounded-lg text-[11px] font-bold text-white cursor-pointer transition-all hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(124,58,237,0.35)]">
            Analyze Now
          </button>
        </Link>
      </div>
    </nav>
  );
}
