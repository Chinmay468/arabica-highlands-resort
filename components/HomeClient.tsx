"use client";

import { useState } from "react";
import BookingModal from "./BookingModal";
import {
  Coffee,
  Sparkles,
  Users,
  Compass,
  CheckCircle,
  ArrowRight,
  Shield,
  Calendar,
  Eye,
  Award,
  ChevronRight,
} from "lucide-react";

interface RoomItem {
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
}

export default function HomeClient({ rooms }: { rooms: RoomItem[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || "");
  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [searchCheckOut, setSearchCheckOut] = useState("");

  const handleBookRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setModalOpen(true);
  };

  const handleSearchBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#0F1F0F] text-[#FAF8F5] px-4 overflow-hidden">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 filter brightness-75 scale-105 transition duration-1000"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1F0F] via-transparent to-[#0F1F0F]/80" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-12 pb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs tracking-widest uppercase text-[#C5A880]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chikkamagaluru • Western Ghats • 76 Keys</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Restrained Luxury in the Heart of Coffee Country
          </h1>

          <p className="text-sm sm:text-base text-stone-200 max-w-2xl mx-auto font-light leading-relaxed">
            Perched 1,200 meters above sea level amidst 250 acres of shade-grown Robusta plantations. Book direct to safeguard the resort’s best tariffs with zero agency commissions.
          </p>

          {/* Quick Availability Search Widget */}
          <div className="mt-8 max-w-3xl mx-auto bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-2xl border border-[#D3C6AA] text-[#182F18]">
            <form onSubmit={handleSearchBarSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#623F27] mb-1 text-left">
                  Check-In
                </label>
                <input
                  type="date"
                  value={searchCheckIn}
                  onChange={(e) => setSearchCheckIn(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D3C6AA] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#623F27] mb-1 text-left">
                  Check-Out
                </label>
                <input
                  type="date"
                  value={searchCheckOut}
                  onChange={(e) => setSearchCheckOut(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D3C6AA] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#623F27] mb-1 text-left">
                  Sanctuary Category
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D3C6AA] bg-white font-medium"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-lg uppercase tracking-wider transition shadow"
                >
                  Check Rates & Book
                </button>
              </div>
            </form>
          </div>

          {/* Direct Booking Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-stone-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Guaranteed Best Tariff
            </span>
            <span className="flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-[#C5A880]" /> Complimentary Estate Coffee Tour
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> DPDP Act 2023 Protected
            </span>
          </div>
        </div>
      </section>

      {/* 2. THE 76 KEYS ROOM SHOWCASE */}
      <section id="rooms" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#7E5433]">
            Accommodation Portfolio • 76 Keys
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#182F18]">
            Crafted for Seclusion & Rest
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Heritage plantation timber, verandahs wrapped in hill mist, and heated plunge pools secluded beneath shade trees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map((room) => {
            const isLowerGst = room.basePrice <= 7500;
            const gstRate = isLowerGst ? 0.12 : 0.18;
            const approxGst = Math.round(room.basePrice * gstRate);
            const totalWithGst = room.basePrice + approxGst;

            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#D3C6AA] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative h-60 overflow-hidden bg-stone-100">
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#182F18]/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {room.totalKeys} Keys in Estate
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 text-[#182F18] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Up to {room.maxGuests} Guests
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#7E5433] tracking-wider">
                        {room.category}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                        {isLowerGst ? "12% GST Slab" : "18% GST Slab"}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#182F18] group-hover:text-[#2F502F] transition">
                      {room.name}
                    </h3>

                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {room.description}
                    </p>

                    {/* Amenities Tag List */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {room.amenities.slice(0, 4).map((a, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-[#FAF8F5] text-stone-600 px-2 py-0.5 rounded border border-[#E3DAC5]"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-4 border-t border-[#EFE8DA] flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider">Direct Tariff</p>
                      <p className="text-lg font-bold text-[#182F18] font-sans">
                        ₹{room.basePrice.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-stone-500"> / night</span>
                      </p>
                      <p className="text-[10px] text-stone-500">
                        +₹{approxGst.toLocaleString("en-IN")} ({Math.round(gstRate * 100)}% GST) = ₹{totalWithGst.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookRoom(room.id)}
                      className="px-4 py-2 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span>Book Direct</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ESTATE EXPERIENCES & COFFEE HERITAGE */}
      <section className="bg-[#182F18] text-[#FAF8F5] py-16 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C5A880]">
              The Coffee Estate Living
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
              Cultivating Sanctuary Since 1924
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Every morning at Arabica Highlands begins with mist filtering through shade trees, freshly roasted plantation coffee cupping, and wild Malnad birdsong.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-white">Artisan Bean-to-Cup Roastery</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Experience bean harvesting, wet processing, and small-batch roasting led by our certified Q-grader baristas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-white">Private Ridge Forest Trails</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Trek up the Mullayanagiri slopes with resident estate naturalists through pepper vine canopies and hidden waterfalls.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-white">Heritage Malnad Dining</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Farm-to-fork culinary masterclasses featuring estate-grown cardamom, bamboo shoot curries, and firewood barbecues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WEDDING & CORPORATE OFFSITE TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF6F2] rounded-3xl p-8 sm:p-12 border border-[#E3DAC5] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs uppercase font-bold tracking-widest text-[#7E5433]">
              Bespoke Gatherings & Buyouts
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#182F18]">
              Weddings on Mist Lawns & Executive Offsites
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Hosting up to 300 guests on open amphitheatre lawns, with audio-visual conference halls for corporate leadership retreats. Complete estate buyouts available for absolute seclusion.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="/events"
              className="px-6 py-3 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow"
            >
              <span>Explore Weddings & Offsites</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        roomTypes={rooms}
        preselectedRoomId={selectedRoomId}
        defaultCheckIn={searchCheckIn}
        defaultCheckOut={searchCheckOut}
      />
    </div>
  );
}
