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
} from "lucide-react";

export default function EventsPage() {
  const [eventType, setEventType] = useState<"Wedding" | "Corporate Offsite" | "Family Gathering">("Wedding");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [guestCount, setGuestCount] = useState(250);
  const [preferredDates, setPreferredDates] = useState("February 2027 (2 nights)");
  const [budgetINR, setBudgetINR] = useState("₹15 Lakh - ₹25 Lakh");
  const [specificRequirements, setSpecificRequirements] = useState(
    "Venue for my sister's wedding in Feb 2027, about 250 guests, 2 nights. Requires Mist Lawn for Sangeet, Amphitheatre for wedding ceremony, and full resort room buyout."
  );

  const [isPending, startTransition] = useTransition();
  const [submittedEnquiry, setSubmittedEnquiry] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const composedMessage = `${eventType}: ${specificRequirements}. Estimated Pax: ${guestCount}. Preferred Season: ${preferredDates}. Target Budget: ${budgetINR}.`;

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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Estate Buyouts & Lawns</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#182F18]">
          Weddings & Corporate Offsites
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Surrounded by 100-year-old coffee estates. Our 76-key sanctuary accommodates up to 300 guests across panoramic mist lawns and modern conference pavilions.
        </p>
      </div>

      {submittedEnquiry ? (
        <div className="bg-white rounded-2xl p-8 border border-[#D3C6AA] shadow-lg text-center max-w-xl mx-auto space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#182F18]">
              Enquiry Dispatched to AI Router!
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Enquiry Reference: <strong className="font-mono text-emerald-800">{submittedEnquiry.enquiryNumber}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Auto-Classified Intent:</span>
              <span className="font-bold text-[#182F18]">{submittedEnquiry.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Confidence Score:</span>
              <span className="font-bold text-emerald-700">{Math.round(submittedEnquiry.confidenceScore * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Assigned Routing:</span>
              <span className="font-medium text-stone-800">{submittedEnquiry.assignedTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Guaranteed SLA:</span>
              <span className="text-stone-800 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C5A880]" /> Under 30 minutes in working hours
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <a
              href="/inbox"
              className="px-5 py-2.5 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <span>View in AI Inbox (Reviewer Mode)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setSubmittedEnquiry(null)}
              className="px-4 py-2.5 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50"
            >
              Submit Another Enquiry
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-[#D3C6AA] shadow-sm space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Event Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#492E1E] mb-2">
                  Event Category
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["Wedding", "Corporate Offsite", "Family Gathering"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEventType(t)}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold transition ${
                        eventType === t
                          ? "border-[#182F18] bg-[#182F18] text-white shadow-sm"
                          : "border-[#D3C6AA] bg-[#F8F4EC] text-[#182F18] hover:bg-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Count & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1">
                    Expected Number of Guests ({guestCount} pax)
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="10"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full accent-[#182F18]"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 mt-1">
                    <span>20 Guests</span>
                    <span>150 Guests</span>
                    <span>300 Max Capacity</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1">
                    Preferred Month / Year / Nights
                  </label>
                  <input
                    type="text"
                    required
                    value={preferredDates}
                    onChange={(e) => setPreferredDates(e.target.value)}
                    placeholder="e.g. Feb 2027 (2 nights)"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white"
                  />
                </div>
              </div>

              {/* Budget Indication */}
              <div>
                <label className="block text-xs font-bold text-[#492E1E] mb-1">
                  Target Budget Indication
                </label>
                <select
                  value={budgetINR}
                  onChange={(e) => setBudgetINR(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white font-medium"
                >
                  <option value="₹5 Lakh - ₹10 Lakh">₹5 Lakh - ₹10 Lakh (Intimate Gathering / Small Offsite)</option>
                  <option value="₹10 Lakh - ₹20 Lakh">₹10 Lakh - ₹20 Lakh (Leadership Offsite / Single-Night Lawn)</option>
                  <option value="₹20 Lakh - ₹35 Lakh">₹20 Lakh - ₹35 Lakh (Full Estate 76-Key Buyout Wedding)</option>
                  <option value="Flexible / Bespoke">Flexible / Bespoke Consultation</option>
                </select>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Vikramaditya Hegde"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white"
                  />
                </div>
              </div>

              {/* Specific Requirements & Notes */}
              <div>
                <label className="block text-xs font-bold text-[#492E1E] mb-1">
                  Specific Requirements & Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={specificRequirements}
                  onChange={(e) => setSpecificRequirements(e.target.value)}
                  placeholder="Detail your requirements: lawn setups, conference projector, catering preferences..."
                  className="w-full text-xs p-3 rounded-lg border border-[#D3C6AA] bg-white focus:outline-none focus:ring-1 focus:ring-[#182F18]"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isPending ? "Routing via AI Engine..." : "Submit Event Enquiry"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Estate Specs */}
          <div className="space-y-6">
            <div className="bg-[#FAF6F2] rounded-2xl p-6 border border-[#E3DAC5] space-y-4">
              <h3 className="font-serif text-base font-bold text-[#182F18]">
                Sanctuary Capacities
              </h3>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="pb-2 border-b border-[#E3DAC5]">
                  <p className="font-bold text-[#182F18]">Mist Amphitheatre Lawn</p>
                  <p className="text-stone-500">Up to 300 guests for wedding pheras, sangeet & cocktail receptions.</p>
                </div>

                <div className="pb-2 border-b border-[#E3DAC5]">
                  <p className="font-bold text-[#182F18]">Pepper Grove Conference Hall</p>
                  <p className="text-stone-500">60 delegates in theatre layout, 4K projection, 100 Mbps uplink.</p>
                </div>

                <div>
                  <p className="font-bold text-[#182F18]">76 Keys Buyout</p>
                  <p className="text-stone-500">Full resort privacy for up to 180 residential guests across all rooms and private villas.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Clock className="w-4 h-4" />
                <span>Response SLA Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Every enquiry is ingested into our unified AI router. Draft proposals grounded in real rate tables are generated and reviewed by our sales directors in under 30 minutes during estate hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
