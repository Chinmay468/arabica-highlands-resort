"use client";

import { useState, useTransition } from "react";
import { loginAction, logoutAction } from "@/app/actions/auth";
import {
  Compass,
  Calendar,
  Inbox,
  Download,
  User,
  ChevronDown,
  LogOut,
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
      {/* 1. Top Reviewer Utility Bar: Holds Staff Links & 1-Click Role Switcher */}
      <div className="bg-[#182F18] text-[#E3DAC5] text-xs px-6 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-[#223E22]">
        {/* Left: Active Role Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-emerald-200">Reviewer Mode:</span>
          <span>Logged in as:</span>
          <span className="font-semibold text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>

        {/* Center: Internal Staff & GM Tool Links (Relocated from main navbar) */}
        {isStaffOrGM && (
          <div className="flex items-center gap-4 text-xs font-medium text-stone-300">
            <span className="text-stone-500 font-normal">Internal Tools:</span>
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
        )}

        {/* Right: 1-Click Role Switch Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-stone-400 mr-1 hidden sm:inline">1-Click Switch:</span>
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

      {/* 2. Pure Guest Navigation Bar: Left Logo, Center Links, Right Direct Book & Profile */}
      <div className="w-full max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <a href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-full bg-[#182F18] flex items-center justify-center text-[#C5A880] shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#182F18] block leading-none">
              Arabica Highlands
            </span>
            <span className="text-[9.5px] tracking-[0.2em] uppercase text-[#7E5433] block mt-1 font-medium">
              Coffee Estate & Sanctuary • Chikkamagaluru
            </span>
          </div>
        </a>

        {/* Center: Clean Guest Links (No icons, no outline boxes) */}
        <nav className="hidden md:flex items-center gap-10">
          <a
            href="/#rooms"
            className="text-sm tracking-wide text-stone-700 hover:text-[#182F18] font-medium transition-colors"
          >
            Rooms & Villas
          </a>
          <a
            href="/events"
            className="text-sm tracking-wide text-stone-700 hover:text-[#182F18] font-medium transition-colors"
          >
            Weddings & Events
          </a>
        </nav>

        {/* Right: Solid Dark Emerald Direct Book Button & Profile */}
        <div className="flex items-center gap-4">
          <a
            href="/#rooms"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#182F18] text-[#FAF8F5] hover:bg-[#2F502F] transition-all shadow-sm"
          >
            Direct Book
          </a>

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
                <div className="md:hidden space-y-1 pb-2 mb-2 border-b border-stone-100">
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
