"use client";

import { useState, useTransition } from "react";
import { submitEnquiry } from "@/app/actions/enquiry";
import {
  Sparkles,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  Send,
  Building,
  HeartHandshake,
  Check,
  MapPin,
  Coffee,
  Flame,
  Music,
  Presentation,
  Wifi,
} from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = ["2026", "2027", "2028"];

const DURATION_OPTIONS = [
  { nights: 1, label: "1 Night", desc: "Day Gala" },
  { nights: 2, label: "2 Nights", desc: "Weekend Celebration" },
  { nights: 3, label: "3 Nights", desc: "Grand Buyout" },
  { nights: 4, label: "4+ Nights", desc: "Extended Retreat" },
];

const WEDDING_VENUE_TAGS = [
  { id: "mist_lawn", label: "Mist Lawn (Reception / Sangeet)", icon: "🌿" },
  { id: "amphitheatre", label: "Coffee Amphitheatre (Pheras / Ceremony)", icon: "🏛️" },
  { id: "buyout", label: "Full 76-Key Resort Buyout (Exclusive Seclusion)", icon: "🏡" },
  { id: "cupping", label: "Private Coffee Cupping for Wedding Party", icon: "☕" },
  { id: "banquet", label: "Malnad & Firewood BBQ Banquet", icon: "🍽️" },
  { id: "poolside", label: "Poolside Sundowner & Cocktail Lawn", icon: "🍸" },
];

const CORPORATE_VENUE_TAGS = [
  { id: "conference", label: "Conference Pavilion & 4K AV Setup", icon: "🎤" },
  { id: "buyout", label: "Full 76-Key Corporate Buyout", icon: "🏡" },
  { id: "breakouts", label: "Open Mist Lawn for Team Breakouts", icon: "🌿" },
  { id: "trek", label: "Estate Plantation Trek & Naturalist Guide", icon: "🥾" },
  { id: "gala", label: "Executive Gala Dinner by Poolside", icon: "🍽️" },
  { id: "wifi", label: "High-Speed Mesh Wi-Fi & AV Technician", icon: "📶" },
];

const BUDGET_OPTIONS = [
  { value: "₹5 Lakh - ₹10 Lakh", label: "₹5L – ₹10L", desc: "Intimate Gathering (20–50 pax)" },
  { value: "₹10 Lakh - ₹20 Lakh", label: "₹10L – ₹20L", desc: "Leadership Offsite / Single Lawn" },
  { value: "₹20 Lakh - ₹35 Lakh", label: "₹20L – ₹35L", desc: "Full Estate 76-Key Buyout" },
  { value: "Flexible / Bespoke", label: "Bespoke", desc: "Custom Consultation" },
];

export default function EventsPage() {
  const [eventType, setEventType] = useState<"Wedding" | "Corporate Offsite" | "Family Gathering">("Wedding");
  const [senderName, setSenderName] = useState("Vikramaditya Hegde");
  const [senderEmail, setSenderEmail] = useState("vikram@example.com");
  const [senderPhone, setSenderPhone] = useState("+91 98450 12345");
  const [guestCount, setGuestCount] = useState<number>(250);

  // Tactile Month & Year Selection (Zero freeform typing!)
  const [selectedMonth, setSelectedMonth] = useState<string>("February");
  const [selectedYear, setSelectedYear] = useState<string>("2027");
  const [selectedNights, setSelectedNights] = useState<number>(2);

  // 1-Click Interactive Venue & Service Tags
  const [selectedVenues, setSelectedVenues] = useState<string[]>([
    "Mist Lawn (Reception / Sangeet)",
    "Coffee Amphitheatre (Pheras / Ceremony)",
    "Full 76-Key Resort Buyout (Exclusive Seclusion)",
  ]);

  const [budgetINR, setBudgetINR] = useState<string>("₹20 Lakh - ₹35 Lakh");
  const [additionalNote, setAdditionalNote] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const [submittedEnquiry, setSubmittedEnquiry] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleVenueTag = (label: string) => {
    setSelectedVenues((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const currentTags = eventType === "Corporate Offsite" ? CORPORATE_VENUE_TAGS : WEDDING_VENUE_TAGS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const formattedDates = `${selectedMonth} ${selectedYear} (${selectedNights} ${
      selectedNights === 1 ? "night" : "nights"
    })`;

    const venuesString = selectedVenues.length > 0 ? selectedVenues.join(", ") : "Standard Estate Facilities";

    const composedMessage = `${eventType}: Venue enquiry for ${guestCount} guests in ${formattedDates}. Selected Venues & Services: ${venuesString}. Target Budget: ${budgetINR}.${
      additionalNote.trim() ? ` Additional Requests: ${additionalNote.trim()}` : ""
    }`;

    startTransition(async () => {
      try {
        const res = await submitEnquiry({
          channel: "WEB_FORM",
          senderName,
          senderEmail,
          senderPhone,
          message: composedMessage,
        });

        if (res.success && res.enquiry) {
          setSubmittedEnquiry(res.enquiry);
        }
      } catch (err) {
        setErrorMessage((err as Error).message);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Estate Buyouts & Lawns</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#182F18]">
          Weddings & Corporate Offsites
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Nestled among 250 acres of shade-grown coffee. Our 76-key sanctuary accommodates up to 300 guests across panoramic mist lawns and modern conference pavilions.
        </p>
      </div>

      {submittedEnquiry ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D3C6AA] shadow-xl text-center max-w-xl mx-auto space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl font-bold text-[#182F18]">
              Enquiry Routed via AI Engine
            </h2>
            <p className="text-xs text-stone-500">
              Enquiry Reference:{" "}
              <strong className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {submittedEnquiry.enquiryNumber}
              </strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs text-left space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Auto-Classified Intent:</span>
              <span className="font-bold text-[#182F18] bg-white px-2.5 py-0.5 rounded border border-stone-200">
                {submittedEnquiry.category}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Confidence Score:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {Math.round(submittedEnquiry.confidenceScore * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Assigned Routing:</span>
              <span className="font-semibold text-stone-800">{submittedEnquiry.assignedTo}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-stone-200/60">
              <span className="text-stone-500">Guaranteed Response SLA:</span>
              <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A880]" /> Under 30 minutes in working hours
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <a
              href="/inbox"
              className="px-6 py-3 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition shadow-md"
            >
              <span>View in AI Inbox (Reviewer Mode)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setSubmittedEnquiry(null)}
              className="px-5 py-3 border border-stone-300 text-stone-700 text-xs font-semibold rounded-2xl hover:bg-stone-50 transition"
            >
              Submit Another Enquiry
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Interactive Event Builder */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#D3C6AA] shadow-sm space-y-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Event Type Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#492E1E] mb-2.5">
                  1. Event Category
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["Wedding", "Corporate Offsite", "Family Gathering"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEventType(t)}
                      className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                        eventType === t
                          ? "border-[#182F18] bg-[#182F18] text-white shadow-sm scale-[1.01]"
                          : "border-[#D3C6AA] bg-[#F8F4EC] text-[#182F18] hover:bg-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Tactile Date & Duration Selector (Zero Typing!) */}
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E3DAC5] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#492E1E]">
                    2. Preferred Timing & Duration
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {selectedMonth} {selectedYear} • {selectedNights} {selectedNights === 1 ? "Night" : "Nights"}
                  </span>
                </div>

                {/* Month & Year Selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Preferred Month
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D3C6AA] bg-white font-semibold text-[#182F18] focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Target Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D3C6AA] bg-white font-semibold text-[#182F18] focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration 1-Click Pills */}
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1.5">
                    Duration of Stay
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d.nights}
                        type="button"
                        onClick={() => setSelectedNights(d.nights)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          selectedNights === d.nights
                            ? "border-[#182F18] bg-[#182F18] text-white shadow-xs"
                            : "border-[#D3C6AA] bg-white text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        <p className="text-xs font-bold leading-tight">{d.label}</p>
                        <p className={`text-[10px] mt-0.5 ${selectedNights === d.nights ? "text-emerald-200" : "text-stone-400"}`}>
                          {d.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Expected Guests with Slider & Quick Preset Pills */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#492E1E]">
                    3. Estimated Guest Count
                  </label>
                  <span className="text-xs font-bold text-[#182F18] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#D3C6AA]">
                    {guestCount} Guests
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full accent-[#182F18] cursor-pointer"
                />
                <div className="flex justify-between items-center text-[10px] text-stone-500 mt-1.5">
                  <span>20 (Intimate)</span>
                  <div className="flex gap-1.5">
                    {[50, 100, 200, 250].map((pax) => (
                      <button
                        key={pax}
                        type="button"
                        onClick={() => setGuestCount(pax)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition ${
                          guestCount === pax
                            ? "bg-[#182F18] text-white border-[#182F18]"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-white"
                        }`}
                      >
                        {pax} Pax
                      </button>
                    ))}
                  </div>
                  <span>300 (Max Capacity)</span>
                </div>
              </div>

              {/* 4. 1-Click Venue & Experience Tags (No typing essays!) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#492E1E]">
                    4. Desired Venues & Experiences (Click to select)
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {selectedVenues.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentTags.map((tag) => {
                    const isSelected = selectedVenues.includes(tag.label);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleVenueTag(tag.label)}
                        className={`p-3 rounded-2xl border text-left text-xs font-medium flex items-center justify-between gap-2 transition-all ${
                          isSelected
                            ? "border-[#182F18] bg-white ring-2 ring-[#182F18]/20 shadow-xs text-[#182F18]"
                            : "border-[#E3DAC5] bg-[#FAF8F5] text-stone-600 hover:bg-white hover:border-stone-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base">{tag.icon}</span>
                          <span className="truncate">{tag.label}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition ${
                            isSelected
                              ? "bg-[#182F18] border-[#182F18] text-white"
                              : "border-stone-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Budget Indication Pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#492E1E] mb-2">
                  5. Target Budget Indication
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {BUDGET_OPTIONS.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => setBudgetINR(b.value)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        budgetINR === b.value
                          ? "border-[#182F18] bg-[#182F18] text-white shadow-xs"
                          : "border-[#D3C6AA] bg-white text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      <p className="text-xs font-bold">{b.label}</p>
                      <p className={`text-[10px] mt-0.5 truncate ${budgetINR === b.value ? "text-emerald-200" : "text-stone-400"}`}>
                        {b.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Quick Contact Details */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#492E1E] mb-2">
                  6. Contact Details for Proposal Dispatch
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="Mobile Number"
                      className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Optional Notes (Never forced) */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                  Additional Bespoke Requests (Optional)
                </label>
                <input
                  type="text"
                  value={additionalNote}
                  onChange={(e) => setAdditionalNote(e.target.value)}
                  placeholder="e.g. Need dedicated helipad transfer / special jain dietary counter"
                  className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isPending
                      ? "Routing Enquiry to Banquet Team..."
                      : `Request Proposal for ${guestCount} Guests (${selectedMonth} ${selectedYear})`}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Live Sanctuary Specifications & SLA Guarantee */}
          <div className="space-y-6">
            <div className="bg-[#FAF6F2] rounded-3xl p-6 border border-[#E3DAC5] space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 text-[#182F18]">
                <Building className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif text-base font-bold">Sanctuary Capacities</h3>
              </div>

              <div className="space-y-3.5 text-xs text-stone-700">
                <div className="pb-3 border-b border-[#E3DAC5]/70">
                  <p className="font-bold text-[#182F18]">Mist Amphitheatre Lawn</p>
                  <p className="text-stone-500 mt-0.5">
                    Up to 300 guests for wedding pheras, sangeet, and cocktail receptions.
                  </p>
                </div>

                <div className="pb-3 border-b border-[#E3DAC5]/70">
                  <p className="font-bold text-[#182F18]">Pepper Vine Conference Hall</p>
                  <p className="text-stone-500 mt-0.5">
                    120 theatre-style / 70 boardroom. Dual 4K laser projectors, Bose acoustic arrays.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-[#182F18]">Complete 76-Key Estate Seclusion</p>
                  <p className="text-stone-500 mt-0.5">
                    20 Heritage Rooms, 44 Plantation Cottages, 12 Pool Villas. Full estate buyout provides absolute privacy.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#182F18] text-white space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-[#C5A880]">
                <Clock className="w-4 h-4" />
                <h4 className="font-serif text-sm font-bold">Fast-Track Routing</h4>
              </div>
              <p className="text-xs text-stone-200 leading-relaxed">
                Event enquiries are parsed by our AI router and assigned directly to the Banquets & Events Director with rate-grounded availability checks.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-300 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>30-minute working-hours response commitment</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
