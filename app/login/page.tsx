"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { BrandEmblem } from "@/components/BrandLogo";
import {
  Compass,
  ShieldCheck,
  User,
  ArrowRight,
  Lock,
  CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleQuickLogin = (targetEmail: string) => {
    setError(null);
    startTransition(async () => {
      const res = await loginAction(targetEmail);
      if (res.success) {
        router.push(targetEmail.includes("gm") ? "/admin/allotment" : targetEmail.includes("reservations") ? "/inbox" : "/");
        router.refresh();
      } else {
        setError(res.error || "Login failed");
      }
    });
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    handleQuickLogin(email.trim());
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-[#D3C6AA] shadow-xl p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center mx-auto">
            <BrandEmblem size={64} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#182F18]">
              Arabica Highlands
            </h1>
            <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#C5A880] mt-0.5">
              Staff & Reviewer Portal • Est. 1892
            </p>
          </div>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Sign in to access direct reservations, AI routing inbox, and allotment controls.
          </p>
        </div>

        {/* 1-Click Reviewer Demo Login Buttons */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E3DAC5]">
          <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider text-center">
            Reviewer 1-Click Demo Profiles
          </p>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleQuickLogin("gm@arabicahighlands.com")}
            className="w-full p-3 rounded-xl border border-stone-200 bg-white hover:border-[#182F18] hover:bg-stone-50 text-left transition text-xs flex items-center justify-between group shadow-sm"
          >
            <div>
              <p className="font-bold text-stone-900 group-hover:text-[#182F18]">
                👔 General Manager (GM)
              </p>
              <p className="text-[11px] text-stone-500">gm@arabicahighlands.com</p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#182F18] transition" />
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleQuickLogin("reservations@arabicahighlands.com")}
            className="w-full p-3 rounded-xl border border-stone-200 bg-white hover:border-[#182F18] hover:bg-stone-50 text-left transition text-xs flex items-center justify-between group shadow-sm"
          >
            <div>
              <p className="font-bold text-stone-900 group-hover:text-[#182F18]">
                🛎️ Reservations & Sales Staff
              </p>
              <p className="text-[11px] text-stone-500">reservations@arabicahighlands.com</p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#182F18] transition" />
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleQuickLogin("guest@example.com")}
            className="w-full p-3 rounded-xl border border-stone-200 bg-white hover:border-[#182F18] hover:bg-stone-50 text-left transition text-xs flex items-center justify-between group shadow-sm"
          >
            <div>
              <p className="font-bold text-stone-900 group-hover:text-[#182F18]">
                🧳 Guest (Consumer)
              </p>
              <p className="text-[11px] text-stone-500">guest@example.com</p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#182F18] transition" />
          </button>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Or Sign In with Any Registered Email
            </label>
            <input
              type="email"
              required
              placeholder="e.g. gm@arabicahighlands.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#D3C6AA] bg-white focus:outline-none focus:ring-1 focus:ring-[#182F18]"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-xl transition shadow disabled:opacity-50"
          >
            {isPending ? "Signing In..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
