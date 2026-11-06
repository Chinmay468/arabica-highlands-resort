"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { BrandEmblem } from "@/components/BrandLogo";
import {
  calculateStayPrice,
  checkAvailability,
  createBooking,
  type StayPriceQuote,
} from "@/app/actions/booking";
import {
  X,
  Calendar,
  Users,
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Tag,
  ArrowRight,
  ArrowLeft,
  FileText,
  Printer,
  Sparkles,
  Lock,
} from "lucide-react";

interface RoomOption {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  totalKeys: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTypes: RoomOption[];
  preselectedRoomId?: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  roomTypes,
  preselectedRoomId,
  defaultCheckIn,
  defaultCheckOut,
}: BookingModalProps) {
  const [mounted, setMounted] = useState(false);

  // Default dates: tomorrow to day after tomorrow if none provided
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const initialCheckIn = defaultCheckIn || tomorrow.toISOString().split("T")[0];
  const initialCheckOut = defaultCheckOut || dayAfter.toISOString().split("T")[0];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Stay, 2: Guest & DPDP, 3: Payment, 4: Confirmed
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    preselectedRoomId || roomTypes[0]?.id || ""
  );
  const [checkIn, setCheckIn] = useState<string>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoInput, setPromoInput] = useState<string>("");

  // Guest Details
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [dpdpConsent, setDpdpConsent] = useState(true);
  const [isForeignGuest, setIsForeignGuest] = useState(false);

  // Quote & Status State
  const [quote, setQuote] = useState<StayPriceQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const [isPending, startTransition] = useTransition();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync preselected room
  useEffect(() => {
    if (preselectedRoomId) {
      setSelectedRoomId(preselectedRoomId);
    }
  }, [preselectedRoomId]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Recalculate price quote when room, dates, or promo change
  useEffect(() => {
    if (!selectedRoomId || !checkIn || !checkOut || checkIn >= checkOut) return;

    let active = true;
    setQuoteLoading(true);
    setQuoteError(null);

    Promise.all([
      calculateStayPrice(selectedRoomId, checkIn, checkOut, roomsCount, promoCode),
      checkAvailability(selectedRoomId, checkIn, checkOut, roomsCount),
    ])
      .then(([quoteRes, availRes]) => {
        if (!active) return;
        setQuote(quoteRes);
        if (!availRes.available) {
          setAvailabilityMessage(
            availRes.message || "Selected category has limited keys for these dates."
          );
        } else {
          setAvailabilityMessage(null);
        }
      })
      .catch((err) => {
        if (!active) return;
        setQuoteError((err as Error).message);
      })
      .finally(() => {
        if (active) setQuoteLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedRoomId, checkIn, checkOut, roomsCount, promoCode]);

  if (!isOpen || !mounted) return null;

  const handleApplyPromo = () => {
    if (promoInput.trim()) {
      setPromoCode(promoInput.trim().toUpperCase());
    }
  };

  const handleProceedToGuestDetails = () => {
    if (!quote || availabilityMessage) return;
    setStep(2);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      setSubmissionError("Please fill in all guest contact details.");
      return;
    }
    if (!dpdpConsent) {
      setSubmissionError("Please agree to the DPDP Act 2023 data processing consent.");
      return;
    }
    setSubmissionError(null);
    setStep(3);
  };

  const handleConfirmTestPayment = () => {
    startTransition(async () => {
      setSubmissionError(null);
      try {
        const result = await createBooking({
          roomTypeId: selectedRoomId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          roomsCount,
          adults,
          children,
          guestName,
          guestEmail,
          guestPhone,
          dpdpConsent,
          isForeignGuest,
          paymentId: `MOCK_PAY_${Date.now()}`,
          promoCode: promoCode || undefined,
        });

        if (result.success && result.booking) {
          setConfirmedBooking(result.booking);
          setStep(4);
        }
      } catch (err) {
        setSubmissionError((err as Error).message);
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedRoomObj = roomTypes.find((r) => r.id === selectedRoomId);

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/35 backdrop-blur-md flex justify-center items-start pt-6 sm:pt-10 pb-16 px-4 sm:px-6 transition-all duration-300 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-[#FAF8F5] rounded-[32px] sm:rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.4)] border border-[#D3C6AA] w-full max-w-2xl sm:max-w-3xl overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Header Banner */}
        <div className="bg-[#182F18] text-[#E3DAC5] px-6 sm:px-8 py-5 flex items-center justify-between border-b border-[#223E22]">
          <div className="flex items-center gap-3.5">
            <BrandEmblem size={44} />
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                  Direct Sanctuary Reservation
                </span>
                <span className="text-[10px] bg-[#C5A880]/20 text-[#D8BC94] px-2.5 py-0.5 rounded-full border border-[#C5A880]/30 font-semibold uppercase tracking-wider">
                  Direct Rate Protection • 0% Fees
                </span>
              </div>
              <p className="text-xs text-[#A3B6A3]">
                Arabica Highlands Estate & Sanctuary • 76 Keys • Chikkamagaluru • Est. 1892
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
            title="Close Reservation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper with curved pills */}
        {step < 4 && (
          <div className="px-6 sm:px-8 py-3.5 bg-[#F2EDE2] border-b border-[#DDD3BF] flex items-center justify-between text-xs font-medium text-[#446B44]">
            <div className={`flex items-center gap-2 ${step === 1 ? "font-bold text-[#182F18]" : ""}`}>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === 1 ? "bg-[#182F18] text-white shadow-xs" : "bg-[#DDD3BF] text-[#182F18]"
                }`}
              >
                1
              </span>
              <span>Dates & Rate Slabs</span>
            </div>
            <span className="text-[#C5A880]">→</span>
            <div className={`flex items-center gap-2 ${step === 2 ? "font-bold text-[#182F18]" : ""}`}>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === 2 ? "bg-[#182F18] text-white shadow-xs" : "bg-[#DDD3BF] text-[#182F18]"
                }`}
              >
                2
              </span>
              <span>Guest & DPDP Consent</span>
            </div>
            <span className="text-[#C5A880]">→</span>
            <div className={`flex items-center gap-2 ${step === 3 ? "font-bold text-[#182F18]" : ""}`}>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === 3 ? "bg-[#182F18] text-white shadow-xs" : "bg-[#DDD3BF] text-[#182F18]"
                }`}
              >
                3
              </span>
              <span>Test Payment</span>
            </div>
          </div>
        )}

        {/* Body Steps */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: DATES, ROOM & GST QUOTE */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Room Selection */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#492E1E]">
                    Select Room / Villa Category
                  </label>
                  <span className="text-[11px] text-stone-500">All 76 keys managed atomically</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {roomTypes.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoomId(r.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedRoomId === r.id
                          ? "border-[#182F18] bg-white shadow-md ring-2 ring-[#182F18]/25 scale-[1.01]"
                          : "border-[#D3C6AA] bg-[#F8F4EC] hover:bg-white hover:border-stone-400"
                      }`}
                    >
                      <p className="font-semibold text-xs text-[#182F18] truncate">{r.name}</p>
                      <p className="text-[12px] text-[#7E5433] mt-1 font-bold">
                        ₹{r.basePrice.toLocaleString("en-IN")}/nt
                      </p>
                      <span className="inline-block mt-2 text-[9.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFE8DA] text-[#446B44]">
                        {r.basePrice <= 7500 ? "12% GST Slab" : "18% GST Slab"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates & Capacity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1.5">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1.5">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn}
                    className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20 transition"
                  />
                </div>
              </div>

              {/* Guest Counts */}
              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#492E1E] mb-1.5">Rooms</label>
                  <select
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Room" : "Rooms"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#492E1E] mb-1.5">Adults</label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                  >
                    {[1, 2, 3, 4, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Adult" : "Adults"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#492E1E] mb-1.5">Children</label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Child" : "Children"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Promo Code Entry */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Try promo 'DIRECT10' or 'ESTATE15'"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#D3C6AA] bg-white uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-5 py-2.5 text-xs font-bold bg-[#446B44] text-white rounded-xl hover:bg-[#2F502F] transition shadow-xs"
                >
                  Apply
                </button>
              </div>

              {/* Availability Alert if Allotment Exhausted */}
              {availabilityMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold">Allotment Notice: </span>
                    {availabilityMessage}
                    <p className="text-[11px] text-red-600 mt-0.5">
                      The resort restricts website allotment to protect agency quotas. Please try alternate dates or room categories.
                    </p>
                  </div>
                </div>
              )}

              {/* Per-Night Itemized GST Slab Calculation Breakdown */}
              {quote && !availabilityMessage && (
                <div className="p-5 rounded-2xl bg-white border border-[#D3C6AA] space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-[#182F18] pb-2.5 border-b border-stone-100">
                    <span>Stay Tariff Breakdown ({quote.nightsCount} {quote.nightsCount === 1 ? "Night" : "Nights"})</span>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                      Per-Night GST Verified
                    </span>
                  </div>

                  {/* Per Night Slabs */}
                  <div className="space-y-2 text-xs">
                    {quote.nightsBreakdown.map((n) => (
                      <div key={n.date} className="flex items-center justify-between text-stone-600">
                        <span className="font-medium text-stone-700">
                          {n.date} (Base: ₹{n.baseTariff.toLocaleString("en-IN")})
                        </span>
                        <div className="text-right">
                          <span className="text-[11px] text-[#7E5433] mr-2">
                            +{Math.round(n.gstRate * 100)}% GST (₹{n.gstAmount.toLocaleString("en-IN")})
                          </span>
                          <span className="font-semibold text-stone-900">
                            ₹{n.totalNightPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Totals */}
                  <div className="pt-3 border-t border-stone-100 text-xs space-y-2">
                    <div className="flex justify-between text-stone-600">
                      <span>Total Base Tariff:</span>
                      <span className="font-medium">₹{quote.discountedBaseTariff.toLocaleString("en-IN")}</span>
                    </div>
                    {quote.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Promo Code Discount ({quote.appliedPromo?.code}):</span>
                        <span>-₹{quote.discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>Combined GST (CGST + SGST):</span>
                      <span className="font-medium">₹{quote.gstTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-[#182F18] pt-2.5 border-t border-stone-200">
                      <span>Grand Total:</span>
                      <span className="text-[#182F18] font-serif text-lg">₹{quote.grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 Actions */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!quote || !!availabilityMessage || quoteLoading}
                  onClick={handleProceedToGuestDetails}
                  className="px-7 py-3.5 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg hover:scale-[1.01]"
                >
                  <span>Continue to Guest Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GUEST DETAILS & DPDP CONSENT */}
          {step === 2 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#492E1E] mb-1.5">
                  Full Name (Primary Guest)
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Karthik Subramanian"
                  className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="karthik@example.com"
                    className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1.5">
                    Mobile Number (India / Intl)
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full text-xs p-3 rounded-xl border border-[#D3C6AA] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#182F18]/20"
                  />
                </div>
              </div>

              {/* Foreign Guest Checkbox & Form C Advice */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer font-medium text-amber-950">
                  <input
                    type="checkbox"
                    checked={isForeignGuest}
                    onChange={(e) => setIsForeignGuest(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Primary guest or accompanying party includes a foreign national</span>
                </label>
                {isForeignGuest && (
                  <p className="text-[11px] text-amber-900 bg-white/80 p-3 rounded-xl border border-amber-200/60 leading-relaxed font-sans">
                    <strong>Statutory Form C Notice:</strong> Per Ministry of Home Affairs regulations, passport and visa details for foreign guests are verified physically at check-in counter and are not collected online.
                  </p>
                )}
              </div>

              {/* Mandatory DPDP Act 2023 Consent Checkbox */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-emerald-950 font-medium leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    checked={dpdpConsent}
                    onChange={(e) => setDpdpConsent(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4 mt-0.5"
                  />
                  <span>
                    I consent to the collection and processing of my reservation contact details solely for booking fulfillment and hospitality services under the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>.
                  </span>
                </label>
              </div>

              {submissionError && (
                <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {submissionError}
                </div>
              )}

              {/* Step 2 Actions */}
              <div className="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 border border-[#D3C6AA] text-[#182F18] text-xs font-semibold rounded-2xl flex items-center gap-1.5 hover:bg-stone-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dates</span>
                </button>
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.01]"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: TEST PAYMENT GATEWAY */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-stone-200 text-xs space-y-2 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 font-bold text-stone-900">
                  <span>Reservation Summary</span>
                  <span>{selectedRoomObj?.name}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Stay Dates:</span>
                  <span className="font-medium text-stone-900">{checkIn} to {checkOut} ({quote?.nightsCount} nights)</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Guest:</span>
                  <span className="font-medium text-stone-900">{guestName} ({guestEmail})</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-sm pt-2.5 border-t border-stone-100">
                  <span>Payable Amount:</span>
                  <span className="text-emerald-800 text-base font-serif">₹{quote?.grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Test Gateway Simulator */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-[#C5A880] bg-[#FAF8F5] text-xs space-y-3">
                <div className="flex items-center gap-2 text-[#492E1E] font-bold">
                  <CreditCard className="w-4 h-4 text-[#9C7046]" />
                  <span>Simulated Test Payment Gateway (Instant Sandbox)</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  This transaction operates in authenticated review test mode. Clicking confirm will atomically acquire the database allotment lock and confirm the reservation.
                </p>
                <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-[11px] text-stone-700 font-mono">
                  <span>TEST_CARD: 4242 •••• •••• 4242</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">AUTHORISED</span>
                </div>
              </div>

              {submissionError && (
                <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Booking Failed: </span>
                    {submissionError}
                  </div>
                </div>
              )}

              {/* Step 3 Actions */}
              <div className="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 border border-[#D3C6AA] text-[#182F18] text-xs font-semibold rounded-2xl flex items-center gap-1.5 hover:bg-stone-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Guest Details</span>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirmTestPayment}
                  className="px-7 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg hover:scale-[1.01]"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isPending ? "Confirming Allotment..." : "Confirm & Pay (Direct Booking)"}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION & ITEMISED RECEIPT */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#7E5433] font-bold">
                  Reservation Confirmed
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#182F18] mt-1">
                  We look forward to welcoming you to the estate
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  A confirmation email with stay directions has been dispatched to {confirmedBooking.guestEmail}.
                </p>
              </div>

              {/* Printable Folio Card with curves */}
              <div
                id="printable-folio"
                className="bg-white border border-stone-200 rounded-3xl p-6 text-left space-y-4 shadow-sm"
              >
                <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <BrandEmblem size={44} />
                    <div>
                      <h4 className="font-serif text-base font-bold text-stone-900 leading-tight">Arabica Highlands</h4>
                      <p className="text-[11px] text-stone-400">Coffee Estate & Sanctuary, Chikkamagaluru • Est. 1892</p>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">GSTIN: 29AAAAA0000A1Z5</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Booking Reference</span>
                    <span className="font-mono text-sm font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {confirmedBooking.bookingReference}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-stone-700">
                  <div>
                    <p className="text-[11px] text-stone-400">Guest Name</p>
                    <p className="font-semibold text-stone-900">{confirmedBooking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-stone-400">Stay Dates</p>
                    <p className="font-semibold text-stone-900">{confirmedBooking.checkInDate} to {confirmedBooking.checkOutDate}</p>
                  </div>
                </div>

                {/* Nightly GST Breakdown Table */}
                <div className="pt-2.5 border-t border-stone-100">
                  <p className="text-[11px] font-bold text-stone-900 mb-1.5">Itemized GST Tax Invoice</p>
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-stone-400 border-b border-stone-100 font-medium">
                        <th className="py-1">Date</th>
                        <th className="py-1">Base Tariff</th>
                        <th className="py-1">GST Rate</th>
                        <th className="py-1 text-right">Night Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedBooking.nightsBreakdown?.map((n: any) => (
                        <tr key={n.id} className="border-b border-stone-50">
                          <td className="py-1 font-medium">{n.date}</td>
                          <td className="py-1">₹{n.baseTariff.toLocaleString("en-IN")}</td>
                          <td className="py-1">{Math.round(n.gstRate * 100)}% (₹{n.gstAmount.toLocaleString("en-IN")})</td>
                          <td className="py-1 text-right font-semibold text-stone-900">₹{n.totalNightPrice.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2.5 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-[#182F18]">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-800">₹{confirmedBooking.grandTotal.toLocaleString("en-IN")}</span>
                </div>

                {confirmedBooking.isForeignGuest && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900">
                    <strong>Check-in Requirement:</strong> Foreign guest passport and visa verification per Form C guidelines will be completed upon arrival at the estate.
                  </div>
                )}
              </div>

              {/* Step 4 Actions */}
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#182F18] text-white rounded-xl text-xs font-bold hover:bg-[#2F502F] transition shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
