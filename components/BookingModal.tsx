"use client";

import { useState, useEffect, useTransition } from "react";
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
      .then(([priceQuote, avail]) => {
        if (!active) return;
        setQuote(priceQuote);
        if (!avail.available) {
          setAvailabilityMessage(avail.message || "Selected dates exceed website allotment.");
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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#D3C6AA] w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#182F18] text-[#E3DAC5] p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-white tracking-wide">
                Direct Reservation
              </span>
              <span className="text-[10px] bg-[#C5A880]/20 text-[#C5A880] px-2 py-0.5 rounded border border-[#C5A880]/30 font-semibold uppercase tracking-wider">
                Direct Rate Protection
              </span>
            </div>
            <p className="text-xs text-[#A3B6A3] mt-0.5">
              Arabica Highlands Estate & Sanctuary • Chikkamagaluru
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper */}
        {step < 4 && (
          <div className="px-6 py-3 bg-[#EFE8DA] border-b border-[#D3C6AA] flex items-center justify-between text-xs font-medium text-[#446B44]">
            <div className={`flex items-center gap-1.5 ${step === 1 ? "font-bold text-[#182F18]" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? "bg-[#182F18] text-white" : "bg-[#D3C6AA] text-[#182F18]"}`}>
                1
              </span>
              <span>Dates & Rate Slabs</span>
            </div>
            <span className="text-[#C5A880]">→</span>
            <div className={`flex items-center gap-1.5 ${step === 2 ? "font-bold text-[#182F18]" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? "bg-[#182F18] text-white" : "bg-[#D3C6AA] text-[#182F18]"}`}>
                2
              </span>
              <span>Guest & DPDP Consent</span>
            </div>
            <span className="text-[#C5A880]">→</span>
            <div className={`flex items-center gap-1.5 ${step === 3 ? "font-bold text-[#182F18]" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? "bg-[#182F18] text-white" : "bg-[#D3C6AA] text-[#182F18]"}`}>
                3
              </span>
              <span>Test Payment</span>
            </div>
          </div>
        )}

        {/* Body Steps */}
        <div className="p-6">
          {/* STEP 1: DATES, ROOM & GST QUOTE */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Room Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#492E1E] mb-1.5">
                  Select Room / Villa Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {roomTypes.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoomId(r.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedRoomId === r.id
                          ? "border-[#182F18] bg-white shadow-sm ring-1 ring-[#182F18]"
                          : "border-[#D3C6AA] bg-[#F8F4EC] hover:bg-white"
                      }`}
                    >
                      <p className="font-semibold text-xs text-[#182F18] truncate">{r.name}</p>
                      <p className="text-[11px] text-[#7E5433] mt-0.5">
                        ₹{r.basePrice.toLocaleString("en-IN")}/nt
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#EFE8DA] text-[#446B44]">
                        {r.basePrice <= 7500 ? "12% GST Slab" : "18% GST Slab"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white focus:outline-none focus:ring-1 focus:ring-[#182F18]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white focus:outline-none focus:ring-1 focus:ring-[#182F18]"
                  />
                </div>
              </div>

              {/* Guest Counts */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#492E1E] mb-1">Rooms</label>
                  <select
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Room" : "Rooms"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#492E1E] mb-1">Adults</label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white"
                  >
                    {[1, 2, 3, 4, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Adult" : "Adults"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#492E1E] mb-1">Children</label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white"
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
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    placeholder="Try promo 'DIRECT10' or 'ESTATE15'"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-[#D3C6AA] bg-white uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3 py-2 text-xs font-semibold bg-[#446B44] text-white rounded-lg hover:bg-[#2F502F] transition"
                >
                  Apply
                </button>
              </div>

              {/* Availability Alert if Allotment Exhausted */}
              {availabilityMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold">Allotment Notice: </span>
                    {availabilityMessage}
                    <p className="text-[11px] text-red-600 mt-0.5">
                      The resort restricts website allotment to protect agency quotas. Please try alternate dates.
                    </p>
                  </div>
                </div>
              )}

              {/* Per-Night Itemized GST Slab Calculation Breakdown */}
              {quote && !availabilityMessage && (
                <div className="p-4 rounded-xl bg-white border border-[#D3C6AA] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#182F18] pb-1.5 border-b border-stone-100">
                    <span>Stay Tariff Breakdown ({quote.nightsCount} {quote.nightsCount === 1 ? "Night" : "Nights"})</span>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Per-Night GST Verified
                    </span>
                  </div>

                  {/* Per Night Slabs */}
                  <div className="space-y-1 text-xs">
                    {quote.nightsBreakdown.map((n) => (
                      <div key={n.date} className="flex items-center justify-between text-stone-600">
                        <span>
                          {n.date} (Base: ₹{n.baseTariff.toLocaleString("en-IN")})
                        </span>
                        <div className="text-right">
                          <span className="text-[11px] text-[#7E5433] mr-2">
                            +{Math.round(n.gstRate * 100)}% GST (₹{n.gstAmount.toLocaleString("en-IN")})
                          </span>
                          <span className="font-medium text-stone-900">
                            ₹{n.totalNightPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Totals */}
                  <div className="pt-2 border-t border-stone-100 text-xs space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>Total Base Tariff:</span>
                      <span>₹{quote.discountedBaseTariff.toLocaleString("en-IN")}</span>
                    </div>
                    {quote.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Promo Code Discount ({quote.appliedPromo?.code}):</span>
                        <span>-₹{quote.discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>Combined GST (CGST + SGST):</span>
                      <span>₹{quote.gstTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#182F18] pt-1 border-t border-stone-200">
                      <span>Grand Total:</span>
                      <span className="text-[#2F502F]">₹{quote.grandTotal.toLocaleString("en-IN")}</span>
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
                  className="px-5 py-2.5 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition disabled:opacity-50"
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
                <label className="block text-xs font-bold text-[#492E1E] mb-1">
                  Full Name (Primary Guest)
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Karthik Subramanian"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white focus:outline-none focus:ring-1 focus:ring-[#182F18]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="karthik@example.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white focus:outline-none focus:ring-1 focus:ring-[#182F18]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#492E1E] mb-1">
                    Mobile Number (India / Intl)
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white focus:outline-none focus:ring-1 focus:ring-[#182F18]"
                  />
                </div>
              </div>

              {/* Foreign Guest Checkbox & Form C Advice */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-900">
                  <input
                    type="checkbox"
                    checked={isForeignGuest}
                    onChange={(e) => setIsForeignGuest(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Primary guest or accompanying party includes a foreign national</span>
                </label>
                {isForeignGuest && (
                  <p className="text-[11px] text-amber-800 bg-white/70 p-2 rounded border border-amber-200/50 leading-relaxed">
                    <strong>Statutory Form C Notice:</strong> Per Ministry of Home Affairs regulations, passport and visa details for foreign guests are verified physically at check-in counter and are not collected online.
                  </p>
                )}
              </div>

              {/* Mandatory DPDP Act 2023 Consent Checkbox */}
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-1">
                <label className="flex items-start gap-2 cursor-pointer text-emerald-950 font-medium">
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
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                  {submissionError}
                </div>
              )}

              {/* Step 2 Actions */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-[#D3C6AA] text-[#182F18] text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-stone-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dates</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
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
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 font-semibold text-stone-900">
                  <span>Reservation Summary</span>
                  <span>{selectedRoomObj?.name}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Stay Dates:</span>
                  <span>{checkIn} to {checkOut} ({quote?.nightsCount} nights)</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Guest:</span>
                  <span>{guestName} ({guestEmail})</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-sm pt-1 border-t border-stone-200">
                  <span>Payable Amount:</span>
                  <span className="text-emerald-800">₹{quote?.grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Test Gateway Simulator */}
              <div className="p-4 rounded-xl border border-dashed border-[#C5A880] bg-[#FAF8F5] text-xs space-y-3">
                <div className="flex items-center gap-2 text-[#492E1E] font-bold">
                  <CreditCard className="w-4 h-4 text-[#9C7046]" />
                  <span>Simulated Test Payment Gateway (Instant Sandbox)</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  This transaction operates in authenticated review test mode. Clicking confirm will atomically acquire the database allotment lock and confirm the reservation.
                </p>
                <div className="p-2.5 rounded bg-white border border-stone-200 flex items-center justify-between text-[11px] text-stone-600 font-mono">
                  <span>TEST_CARD: 4242 •••• •••• 4242</span>
                  <span className="text-emerald-600 font-bold">AUTHORISED</span>
                </div>
              </div>

              {submissionError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Booking Failed: </span>
                    {submissionError}
                  </div>
                </div>
              )}

              {/* Step 3 Actions */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-[#D3C6AA] text-[#182F18] text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-stone-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirmTestPayment}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isPending ? "Locking Allotment..." : `Pay ₹${quote?.grandTotal.toLocaleString("en-IN")} & Confirm`}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VERIFIED CONFIRMATION RECEIPT */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-4 print:p-0">
              <div className="text-center py-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#182F18]">
                  Reservation Confirmed!
                </h3>
                <p className="text-xs text-stone-500">
                  Your direct reservation at Arabica Highlands has been locked into our database.
                </p>
              </div>

              {/* Printable Invoice Card */}
              <div className="p-4 rounded-xl bg-white border border-[#D3C6AA] text-xs space-y-3 font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Booking Reference</span>
                    <p className="font-mono font-bold text-sm text-[#182F18]">{confirmedBooking.bookingReference}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400">Status</span>
                    <span className="block font-bold text-emerald-700">CONFIRMED (TEST_PAID)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-stone-700">
                  <div>
                    <p className="text-[11px] text-stone-500">Guest Name</p>
                    <p className="font-medium">{confirmedBooking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-stone-500">Stay Dates</p>
                    <p className="font-medium">{confirmedBooking.checkInDate} to {confirmedBooking.checkOutDate}</p>
                  </div>
                </div>

                {/* Nightly GST Breakdown Table */}
                <div className="pt-2 border-t border-stone-100">
                  <p className="text-[11px] font-bold text-stone-900 mb-1">Itemized GST Tax Invoice</p>
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-stone-500 border-b border-stone-100">
                        <th className="py-1">Date</th>
                        <th className="py-1">Base Tariff</th>
                        <th className="py-1">GST Rate</th>
                        <th className="py-1 text-right">Night Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedBooking.nightsBreakdown?.map((n: any) => (
                        <tr key={n.id} className="border-b border-stone-50">
                          <td className="py-1">{n.date}</td>
                          <td className="py-1">₹{n.baseTariff.toLocaleString("en-IN")}</td>
                          <td className="py-1">{Math.round(n.gstRate * 100)}% (₹{n.gstAmount.toLocaleString("en-IN")})</td>
                          <td className="py-1 text-right font-medium">₹{n.totalNightPrice.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-[#182F18]">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-800">₹{confirmedBooking.grandTotal.toLocaleString("en-IN")}</span>
                </div>

                {confirmedBooking.isForeignGuest && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900">
                    <strong>Check-in Requirement:</strong> Foreign guest passport and visa verification per Form C guidelines will be completed upon arrival at the estate.
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-[#182F18] text-white rounded-xl text-xs font-semibold hover:bg-[#2F502F]"
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
}
