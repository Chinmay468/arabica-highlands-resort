"use client";

import { useState } from "react";
import BookingModal from "./BookingModal";
import {
  Coffee,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  BedDouble,
  Compass,
} from "lucide-react";

interface RoomDetailClientProps {
  room: {
    id: string;
    name: string;
    slug: string;
    category: string;
    basePrice: number;
    totalKeys: number;
    maxGuests: number;
    description: string;
    imageUrl: string;
    amenities: string[];
  };
  allRooms: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    totalKeys: number;
  }[];
}

export default function RoomDetailClient({ room, allRooms }: RoomDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const isLowerGst = room.basePrice <= 7500;
  const gstRate = isLowerGst ? 0.12 : 0.18;
  const approxGst = Math.round(room.basePrice * gstRate);
  const totalWithGst = room.basePrice + approxGst;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <a href="/" className="hover:text-stone-900">Home</a>
        <span>/</span>
        <a href="/#rooms" className="hover:text-stone-900">Accommodations</a>
        <span>/</span>
        <span className="font-semibold text-stone-900">{room.name}</span>
      </div>

      {/* Hero Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Photo Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#D3C6AA] h-[420px] bg-stone-100">
            <img
              src={room.imageUrl}
              alt={room.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-[#182F18]/90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
              {room.totalKeys} Keys in Estate
            </div>
            <div className="absolute top-4 right-4 bg-white/95 text-[#182F18] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Up to {room.maxGuests} Guests
            </div>
          </div>
        </div>

        {/* Details & Pricing Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#D3C6AA] p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#7E5433] tracking-wider">
                {room.category}
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                {isLowerGst ? "12% GST Slab" : "18% GST Slab"}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold text-[#182F18]">
              {room.name}
            </h1>

            <p className="text-xs text-stone-600 leading-relaxed pt-1">
              {room.description}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E3DAC5] space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400">Direct Tariff</span>
                <p className="text-2xl font-bold text-[#182F18]">
                  ₹{room.basePrice.toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-stone-500"> / night</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400">Statutory Tax</span>
                <p className="text-xs font-semibold text-stone-700">
                  +₹{approxGst.toLocaleString("en-IN")} ({Math.round(gstRate * 100)}% GST)
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs font-bold text-emerald-800">
              <span>Total Inclusive Nightly Rate:</span>
              <span>₹{totalWithGst.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Reserve CTA */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full py-3.5 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition shadow-md"
          >
            <span>Reserve Direct (Save 15% vs OTAs)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Direct Privileges List */}
          <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Direct reservation allotment guaranteed without agency overbooking.
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Includes artisanal plantation breakfast and guided coffee cupping.
            </p>
            <p className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              DPDP Act 2023 protected personal data. Form C foreign check-in supported.
            </p>
          </div>
        </div>
      </div>

      {/* Amenities Grid */}
      <div className="bg-white rounded-3xl border border-[#D3C6AA] p-8 space-y-6">
        <h2 className="font-serif text-xl font-bold text-[#182F18]">
          Sanctuary Inclusions & Amenities
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {room.amenities.map((amenity, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200 flex items-center gap-2.5 text-xs text-stone-800 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-[#446B44] shrink-0" />
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        roomTypes={allRooms}
        preselectedRoomId={room.id}
      />
    </div>
  );
}
