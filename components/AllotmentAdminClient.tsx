"use client";

import { useState, useTransition } from "react";
import {
  updateDailyAllotment,
  toggleStopSell,
  createPromoCode,
} from "@/app/actions/allotment";
import {
  Calendar,
  Shield,
  Tag,
  AlertCircle,
  CheckCircle,
  Save,
  Ban,
  Percent,
  Plus,
  Sliders,
  DollarSign,
  Info,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface AllotmentRow {
  id: string;
  roomTypeId: string;
  date: string;
  totalAllotment: number;
  bookedCount: number;
  basePrice: number;
  stopSell: boolean;
  roomType: {
    id: string;
    name: string;
    slug: string;
    category: string;
    totalKeys: number;
  };
}

interface PromoCodeItem {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  description: string | null;
}

interface AllotmentAdminClientProps {
  initialAllotments: AllotmentRow[];
  initialPromoCodes: PromoCodeItem[];
  roomTypes: any[];
  currentUser: SessionUser;
}

export default function AllotmentAdminClient({
  initialAllotments,
  initialPromoCodes,
  roomTypes,
  currentUser,
}: AllotmentAdminClientProps) {
  const [allotments, setAllotments] = useState<AllotmentRow[]>(initialAllotments);
  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>(initialPromoCodes);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAllotment, setEditAllotment] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // New promo form state
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(10);
  const [newPromoDesc, setNewPromoDesc] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const filteredAllotments = allotments.filter((a) => {
    if (selectedRoomFilter === "ALL") return true;
    return a.roomTypeId === selectedRoomFilter;
  });

  const handleStartEdit = (row: AllotmentRow) => {
    setEditingId(row.id);
    setEditAllotment(row.totalAllotment);
    setEditPrice(row.basePrice);
  };

  const handleSaveEdit = (row: AllotmentRow) => {
    startTransition(async () => {
      const res = await updateDailyAllotment(
        row.id,
        editAllotment,
        editPrice,
        row.stopSell
      );
      if (res.success && res.allotment) {
        setAllotments((prev) =>
          prev.map((item) =>
            item.id === row.id
              ? {
                  ...item,
                  totalAllotment: res.allotment.totalAllotment,
                  basePrice: res.allotment.basePrice,
                }
              : item
          )
        );
        setEditingId(null);
        setSaveSuccess(`Updated ${row.roomType.name} on ${row.date}`);
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    });
  };

  const handleToggleStopSell = (row: AllotmentRow) => {
    startTransition(async () => {
      const nextStop = !row.stopSell;
      const res = await toggleStopSell(row.id, nextStop);
      if (res.success) {
        setAllotments((prev) =>
          prev.map((item) =>
            item.id === row.id ? { ...item, stopSell: nextStop } : item
          )
        );
      }
    });
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    startTransition(async () => {
      try {
        const res = await createPromoCode(newPromoCode, newPromoDiscount, newPromoDesc);
        if (res.success && res.promo) {
          setPromoCodes((prev) => [res.promo as any, ...prev]);
          setNewPromoCode("");
          setNewPromoDesc("");
        }
      } catch (err) {
        setPromoError((err as Error).message);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DAC5]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#182F18]">
              Rate & Allotment Matrix
            </h1>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
              Agency Stock Protection
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Administer website quota, daily room tariffs, blackout stop-sells, and direct booking promo codes.
          </p>
        </div>

        {/* Room Filter Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500 font-medium">Filter Category:</span>
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="p-2 rounded-lg border border-[#D3C6AA] bg-white font-medium text-xs"
          >
            <option value="ALL">All 76 Keys (All Rooms)</option>
            {roomTypes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.totalKeys} keys)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agency Protection Explainer Banner */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Shield className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-emerald-900">
              Mandatory Business Constraint: Zero Overbooking of Agency Allotment
            </p>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              68% of the resort’s room nights belong to contracted OTAs (MakeMyTrip, Booking.com). The direct website only sells this admin-set allotment pool. All bookings are committed via atomic transaction locks (`maxWait: 5000ms, timeout: 10000ms`), preventing website overbooking.
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Daily Allotment Matrix Table */}
      <div className="bg-white rounded-2xl border border-[#D3C6AA] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#FAF8F5] border-b border-[#D3C6AA] flex items-center justify-between text-xs font-bold text-[#182F18]">
          <span>Inventory Calendar Matrix ({filteredAllotments.length} Scheduled Days)</span>
          <span className="text-[11px] text-stone-500 font-normal">
            Click "Edit" on any row to adjust direct quota or base rate
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Stay Date</th>
                <th className="py-3 px-4">Room Type</th>
                <th className="py-3 px-4 text-center">Web Allotment</th>
                <th className="py-3 px-4 text-center">Booked Direct</th>
                <th className="py-3 px-4 text-center">Available Quota</th>
                <th className="py-3 px-4">Base Tariff (₹)</th>
                <th className="py-3 px-4 text-center">GST Slab</th>
                <th className="py-3 px-4 text-center">Stop Sell (Blackout)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {filteredAllotments.map((row) => {
                const isEditing = editingId === row.id;
                const available = row.totalAllotment - row.bookedCount;
                const isLowerGst = row.basePrice <= 7500;

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-stone-50 transition ${
                      row.stopSell ? "bg-red-50/30 text-stone-400" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium">{row.date}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-stone-900">{row.roomType.name}</span>
                      <span className="block text-[10px] text-stone-400">Total keys: {row.roomType.totalKeys}</span>
                    </td>

                    {/* Allotment Column */}
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max={row.roomType.totalKeys}
                          value={editAllotment}
                          onChange={(e) => setEditAllotment(Number(e.target.value))}
                          className="w-16 text-center text-xs p-1 border rounded"
                        />
                      ) : (
                        <span className="font-bold text-stone-900">{row.totalAllotment}</span>
                      )}
                    </td>

                    {/* Booked Direct */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-emerald-800">{row.bookedCount}</span>
                    </td>

                    {/* Available */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          available === 0
                            ? "bg-red-100 text-red-700"
                            : available <= 2
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {available} left
                      </span>
                    </td>

                    {/* Base Tariff */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="100"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-24 text-xs p-1 border rounded"
                        />
                      ) : (
                        <span className="font-medium text-stone-900">
                          ₹{row.basePrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>

                    {/* GST Slab */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isLowerGst
                            ? "bg-stone-100 text-stone-700"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {isLowerGst ? "12% GST" : "18% GST"}
                      </span>
                    </td>

                    {/* Stop Sell Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStopSell(row)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                          row.stopSell
                            ? "bg-red-600 text-white"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {row.stopSell ? "Closed (Stop Sell)" : "Open"}
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(row)}
                            className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-semibold hover:bg-emerald-600 flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 border text-stone-600 rounded text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(row)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promo Codes Manager */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 cols: Active Promos */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#D3C6AA] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="font-serif text-base font-bold text-[#182F18] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C5A880]" />
              Active Direct Booking Promo Codes
            </h3>
            <span className="text-[11px] text-stone-400">Applied on base tariffs during checkout</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {promoCodes.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#182F18] tracking-wider">
                    {p.code}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {p.discountPercent}% OFF
                  </span>
                </div>
                <p className="text-stone-500 text-[11px]">{p.description || "Direct booking privilege discount"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 col: Add Promo */}
        <div className="bg-[#FAF6F2] rounded-2xl border border-[#E3DAC5] p-6 space-y-4 text-xs">
          <h3 className="font-serif text-sm font-bold text-[#182F18] flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#7E5433]" />
            Create Direct Promo Code
          </h3>

          <form onSubmit={handleCreatePromo} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Promo Code</label>
              <input
                type="text"
                required
                placeholder="e.g. MIST20"
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value)}
                className="w-full p-2 rounded-lg border border-[#D3C6AA] bg-white uppercase font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Discount Percentage (%): {newPromoDiscount}%
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={newPromoDiscount}
                onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                className="w-full accent-[#182F18]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Monsoon direct booking rate"
                value={newPromoDesc}
                onChange={(e) => setNewPromoDesc(e.target.value)}
                className="w-full p-2 rounded-lg border border-[#D3C6AA] bg-white"
              />
            </div>

            {promoError && (
              <p className="text-red-600 text-[11px] font-medium">{promoError}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-lg transition"
            >
              {isPending ? "Adding..." : "Add Promo Code"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
