"use client";

import { useState, useTransition } from "react";
import { loginAction, logoutAction } from "@/app/actions/auth";
import BrandLogo from "@/components/BrandLogo";
import {
  Compass,
  Calendar,
  Inbox,
  Download,
  User,
  ChevronDown,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
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

  const isStaffOrGM = currentUser.role === "STAFF" || currentUser.role === "GM";

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E1D3]">
      {/* 1. Full-Width Top Reviewer Utility Bar */}
      <div className="w-full bg-[#182F18] text-[#E3DAC5] text-xs px-6 sm:px-10 lg:px-14 xl:px-16 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-[#223E22]">
        {/* Left: Active Role Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-emerald-200">Reviewer Mode:</span>
          <span>Logged in as:</span>
          <span className="font-semibold text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>

        {/* Center: Internal Staff & GM Tool Links OR Direct Engine Status */}
        {isStaffOrGM ? (
          <div className="flex items-center gap-5 text-xs font-medium text-stone-300">
            <span className="text-stone-400 text-[11px] uppercase tracking-wider font-semibold">
              Internal Portals:
            </span>
            <a
              href="/inbox"
              className="hover:text-white transition flex items-center gap-1.5"
            >
              <Inbox className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Inbox</span>
              {pendingEscalationsCount > 0 && (
                <span className="bg-red-600 text-white text-[9.5px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingEscalationsCount}
                </span>
              )}
            </a>

            <span className="text-stone-600">•</span>

            <a
              href="/admin/allotment"
              className="hover:text-white transition flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Allotment & Rates</span>
            </a>

            <span className="text-stone-600">•</span>

            <a
              href="/admin/export"
              className="hover:text-white transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>PMS Export</span>
            </a>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-[11px] text-[#A3B6A3]">
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Direct Booking Engine Active
            </span>
            <span className="text-stone-600">•</span>
            <span>Zero Agency Commissions</span>
            <span className="text-stone-600">•</span>
            <span>DPDP Act 2023 Compliant</span>
          </div>
        )}

        {/* Right: 1-Click Role Switch Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-stone-400 mr-1 hidden sm:inline text-[11px]">1-Click Switch:</span>
          <button
            onClick={() => handleRoleSwitch("gm@arabicahighlands.com")}
            disabled={isPending || currentUser.role === "GM"}
            className={`px-2.5 py-0.5 rounded transition ${
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
            className={`px-2.5 py-0.5 rounded transition ${
              currentUser.role === "STAFF"
                ? "bg-emerald-600 text-white font-semibold cursor-default"
                : "bg-white/10 hover:bg-white/20 text-stone-200"
            }`}
          >
            🛎️ Staff
          </button>
          <button
            onClick={() => handleRoleSwitch("guest@example.com")}
            disabled={isPending || currentUser.role === "GUEST"}
            className={`px-2.5 py-0.5 rounded transition ${
              currentUser.role === "GUEST"
                ? "bg-stone-600 text-white font-semibold cursor-default"
                : "bg-white/10 hover:bg-white/20 text-stone-200"
            }`}
          >
            🧳 Guest
          </button>
        </div>
      </div>

      {/* 2. Full-Width Guest Navigation Bar */}
      <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16 py-4 flex items-center justify-between">
        {/* Left: Rich Heritage Brand Identity */}
        <a href="/" className="shrink-0 hover:opacity-95 transition-opacity">
          <BrandLogo size="md" variant="dark" />
        </a>

        {/* Center: Clean, Well-Spaced Guest Links */}
        <nav className="hidden lg:flex items-center gap-10">
          <a
            href="/#rooms"
            className="text-xs uppercase tracking-widest text-stone-700 hover:text-[#182F18] font-medium transition-colors py-1"
          >
            Rooms & Villas
          </a>
          <a
            href="/events"
            className="text-xs uppercase tracking-widest text-stone-700 hover:text-[#182F18] font-medium transition-colors py-1"
          >
            Weddings & Events
          </a>
          <a
            href="/#experience"
            className="text-xs uppercase tracking-widest text-stone-700 hover:text-[#182F18] font-medium transition-colors py-1"
          >
            Coffee Cupping
          </a>
        </nav>

        {/* Right: Location Pill + Solid Direct Book Button + Profile */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* Subtle Location / Privilege Tag */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-stone-500 border-r border-[#E3DAC5] pr-5">
            <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="font-serif italic text-stone-600">Western Ghats • 1,200m</span>
          </div>

          {/* Solid Dark Emerald Direct Book Button */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                if (window.location.pathname === "/") {
                  window.dispatchEvent(new CustomEvent("open-booking-modal"));
                } else {
                  window.location.href = "/?book=true";
                }
              }
            }}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#182F18] text-[#FAF8F5] hover:bg-[#2F502F] transition-all shadow-sm hover:shadow"
          >
            Direct Book
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-[#D3C6AA] bg-white text-[#182F18] hover:bg-[#F8F4EC] transition shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full bg-[#EFE8DA] flex items-center justify-center text-[#446B44]">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium hidden sm:inline max-w-[90px] truncate">
                {currentUser.name.split(" ")[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl shadow-2xl border border-[#E3DAC5] p-3.5 z-50 text-xs">
                <div className="pb-2.5 mb-2.5 border-b border-stone-100">
                  <p className="font-semibold text-stone-900">{currentUser.name}</p>
                  <p className="text-stone-500 text-[11px] truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[9.5px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    Role: {currentUser.role}
                  </span>
                </div>

                {/* Mobile staff links if hidden on small screens */}
                <div className="lg:hidden space-y-1 pb-2 mb-2 border-b border-stone-100">
                  <a href="/#rooms" className="block px-2 py-1.5 rounded hover:bg-stone-50 text-stone-700">
                    Rooms & Villas
                  </a>
                  <a href="/events" className="block px-2 py-1.5 rounded hover:bg-stone-50 text-stone-700">
                    Weddings & Events
                  </a>
                  {isStaffOrGM && (
                    <>
                      <a href="/inbox" className="block px-2 py-1.5 rounded hover:bg-stone-50 text-stone-700">
                        AI Enquiry Inbox
                      </a>
                      <a href="/admin/allotment" className="block px-2 py-1.5 rounded hover:bg-stone-50 text-stone-700">
                        Allotment & Rates Admin
                      </a>
                      <a href="/admin/export" className="block px-2 py-1.5 rounded hover:bg-stone-50 text-stone-700">
                        PMS Daily Export
                      </a>
                    </>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[9.5px] uppercase font-bold text-stone-400 tracking-wider px-1">
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
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-red-50 text-red-600 flex items-center gap-1.5"
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
