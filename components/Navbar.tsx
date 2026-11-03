"use client";

import Link from "next/navigation";
import { useState, useTransition } from "react";
import { loginAction, logoutAction } from "@/app/actions/auth";
import {
  Compass,
  Calendar,
  Inbox,
  ShieldCheck,
  Download,
  User,
  ChevronDown,
  Sparkles,
  BedDouble,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface NavbarProps {
  currentUser: SessionUser;
  pendingEscalationsCount?: number;
}

export default function Navbar({ currentUser, pendingEscalationsCount = 0 }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRoleSwitch = (email: string) => {
    startTransition(async () => {
      await loginAction(email);
      setDropdownOpen(false);
      window.location.reload();
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setDropdownOpen(false);
      window.location.reload();
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E3DAC5]">
      {/* Role Switcher Top Utility Bar for Reviewers */}
      <div className="bg-[#182F18] text-[#E3DAC5] text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-emerald-200">Interactive Reviewer Mode:</span>
          <span>Logged in as:</span>
          <span className="font-semibold text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>

        {/* 1-Click Role Switch Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-stone-400 mr-1 hidden sm:inline">1-Click Switch:</span>
          <button
            onClick={() => handleRoleSwitch("gm@arabicahighlands.com")}
            disabled={isPending || currentUser.role === "GM"}
            className={`px-2 py-0.5 rounded transition ${
              currentUser.role === "GM"
                ? "bg-amber-600 text-white font-semibold cursor-default"
                : "bg-white/10 hover:bg-white/20 text-stone-200"
            }`}
          >
            👔 GM
          </button>
          <button
            onClick={() => handleRoleSwitch("reservations@arabicahighlands.com")}
            disabled={isPending || currentUser.role === "STAFF"}
            className={`px-2 py-0.5 rounded transition ${
              currentUser.role === "STAFF"
                ? "bg-emerald-600 text-white font-semibold cursor-default"
                : "bg-white/10 hover:bg-white/20 text-stone-200"
            }`}
          >
            🛎️ Reservations Staff
          </button>
          <button
            onClick={() => handleRoleSwitch("guest@example.com")}
            disabled={isPending || currentUser.role === "GUEST"}
            className={`px-2 py-0.5 rounded transition ${
              currentUser.role === "GUEST"
                ? "bg-stone-600 text-white font-semibold cursor-default"
                : "bg-white/10 hover:bg-white/20 text-stone-200"
            }`}
          >
            🧳 Guest
          </button>
        </div>
      </div>

      {/* Main Brand Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#182F18] flex items-center justify-center text-[#C5A880] shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#182F18] block leading-tight">
              Arabica Highlands
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[#7E5433] block">
              Coffee Estate & Sanctuary • Chikkamagaluru
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#2F502F]">
          <a href="/#rooms" className="hover:text-[#182F18] transition flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-[#C5A880]" />
            Rooms & Villas
          </a>
          <a href="/events" className="hover:text-[#182F18] transition flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            Weddings & Events
          </a>

          {/* Staff & GM Links */}
          {(currentUser.role === "STAFF" || currentUser.role === "GM") && (
            <>
              <a
                href="/inbox"
                className="hover:text-[#182F18] transition flex items-center gap-1.5 relative px-2.5 py-1 rounded bg-[#EFE8DA]"
              >
                <Inbox className="w-4 h-4 text-[#446B44]" />
                <span>AI Inbox</span>
                {pendingEscalationsCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                    {pendingEscalationsCount}
                  </span>
                )}
              </a>

              <a href="/admin/allotment" className="hover:text-[#182F18] transition flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#446B44]" />
                Allotment & Rates
              </a>

              <a href="/admin/export" className="hover:text-[#182F18] transition flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#446B44]" />
                PMS Export
              </a>
            </>
          )}
        </nav>

        {/* Right CTA & Account Dropdown */}
        <div className="flex items-center gap-3">
          <a
            href="/#rooms"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#182F18] text-[#FAF8F5] hover:bg-[#223E22] transition shadow-sm"
          >
            Direct Book (Save 15%)
          </a>

          {/* User Profile Button */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full border border-[#D3C6AA] bg-white text-[#182F18] hover:bg-[#F8F4EC] transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#EFE8DA] flex items-center justify-center text-[#446B44]">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium hidden lg:inline max-w-[100px] truncate">
                {currentUser.name.split(" ")[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 mr-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E3DAC5] p-3 z-50 text-xs">
                <div className="pb-2 mb-2 border-b border-stone-100">
                  <p className="font-semibold text-stone-900">{currentUser.name}</p>
                  <p className="text-stone-500 text-[11px] truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    Role: {currentUser.role}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider px-1">
                    Demo Role Switch
                  </p>
                  <button
                    onClick={() => handleRoleSwitch("gm@arabicahighlands.com")}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-stone-50 flex items-center justify-between"
                  >
                    <span>👔 General Manager</span>
                    {currentUser.role === "GM" && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch("reservations@arabicahighlands.com")}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-stone-50 flex items-center justify-between"
                  >
                    <span>🛎️ Reservations Staff</span>
                    {currentUser.role === "STAFF" && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch("guest@example.com")}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-stone-50 flex items-center justify-between"
                  >
                    <span>🧳 Guest (Consumer)</span>
                    {currentUser.role === "GUEST" && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                </div>

                <div className="pt-2 mt-2 border-t border-stone-100">
                  <a
                    href="/login"
                    className="block px-2 py-1.5 rounded hover:bg-stone-50 text-stone-700 font-medium"
                  >
                    Sign In with Another Account
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-red-50 text-red-600 flex items-center gap-1.5 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Reset to Default Guest
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
