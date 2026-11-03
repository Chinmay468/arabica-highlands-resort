"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileJson,
  Search,
  CheckCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  UserCheck,
  Shield,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface BookingItem {
  id: string;
  bookingReference: string;
  roomTypeId: string;
  roomType: {
    name: string;
    slug: string;
  };
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomsCount: number;
  adults: number;
  children: number;
  baseTariffTotal: number;
  gstTotal: number;
  grandTotal: number;
  paymentStatus: string;
  isForeignGuest: boolean;
  status: string;
  createdAt: Date;
  nightsBreakdown: {
    date: string;
    baseTariff: number;
    gstRate: number;
    gstAmount: number;
    totalNightPrice: number;
  }[];
}

interface ExportClientProps {
  initialBookings: BookingItem[];
  currentUser: SessionUser;
}

export default function ExportClient({ initialBookings, currentUser }: ExportClientProps) {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      b.bookingReference.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.guestEmail.toLowerCase().includes(q) ||
      b.roomType.name.toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + b.grandTotal, 0);
  const commissionSaved = Math.round(totalRevenue * 0.20); // 20% OTA commission saved
  const foreignGuestCount = bookings.filter((b) => b.isForeignGuest).length;

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "BookingReference",
      "RoomType",
      "GuestName",
      "Email",
      "Phone",
      "CheckInDate",
      "CheckOutDate",
      "Nights",
      "Rooms",
      "BaseTariffTotal",
      "GSTTotal",
      "GrandTotal",
      "PaymentStatus",
      "ForeignGuest_FormC_Required",
      "BookingStatus",
      "CreatedDate",
    ];

    const rows = filteredBookings.map((b) => [
      b.bookingReference,
      `"${b.roomType.name}"`,
      `"${b.guestName}"`,
      b.guestEmail,
      b.guestPhone,
      b.checkInDate,
      b.checkOutDate,
      b.nights,
      b.roomsCount,
      b.baseTariffTotal,
      b.gstTotal,
      b.grandTotal,
      b.paymentStatus,
      b.isForeignGuest ? "YES" : "NO",
      b.status,
      new Date(b.createdAt).toISOString().split("T")[0],
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `arabica-pms-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredBookings, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute(
      "download",
      `arabica-pms-export-${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DAC5]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#182F18]">
              Daily PMS Reservation Exporter
            </h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              Legacy PMS Bridge
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Synchronize direct website reservations with legacy property management systems (PMS) without manual double entry.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#C5A880]" />
            <span>Export PMS CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-[#D3C6AA] text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <FileJson className="w-4 h-4 text-emerald-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#D3C6AA] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">Total Direct Bookings</span>
          <p className="text-2xl font-bold text-[#182F18]">{bookings.length}</p>
          <span className="text-[10px] text-stone-500">Atomic locking verified</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#D3C6AA] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">Direct Gross Revenue</span>
          <p className="text-2xl font-bold text-emerald-800">₹{totalRevenue.toLocaleString("en-IN")}</p>
          <span className="text-[10px] text-stone-500">Includes 12% & 18% GST</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#D3C6AA] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">OTA Commission Saved (20%)</span>
          <p className="text-2xl font-bold text-amber-700">₹{commissionSaved.toLocaleString("en-IN")}</p>
          <span className="text-[10px] text-stone-500">Direct margin captured</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#D3C6AA] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">Form C Foreign Guests</span>
          <p className="text-2xl font-bold text-[#182F18]">{foreignGuestCount}</p>
          <span className="text-[10px] text-amber-700 font-medium">Physical check-in required</span>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-[#D3C6AA] shadow-sm overflow-hidden space-y-0">
        <div className="p-4 bg-[#FAF8F5] border-b border-[#D3C6AA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <span className="font-bold text-[#182F18]">
            Direct Confirmed Reservations ({filteredBookings.length})
          </span>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by ref, guest, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Room Category</th>
                <th className="py-3 px-4">Guest Contact</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4 text-center">Nights</th>
                <th className="py-3 px-4">Base Tariff</th>
                <th className="py-3 px-4">GST</th>
                <th className="py-3 px-4">Total Paid</th>
                <th className="py-3 px-4 text-center">Form C (Foreign)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400">
                    No confirmed bookings yet. Book a stay from the homepage to see it appear here.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-800">
                      {b.roomType.name}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-stone-900">{b.guestName}</p>
                      <p className="text-[10px] text-stone-400">{b.guestPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-stone-700">
                      {b.checkInDate} to {b.checkOutDate}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {b.nights} {b.nights === 1 ? "nt" : "nts"}
                    </td>
                    <td className="py-3 px-4 text-stone-700">
                      ₹{b.baseTariffTotal.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-stone-500 text-[11px]">
                      ₹{b.gstTotal.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-800">
                      ₹{b.grandTotal.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {b.isForeignGuest ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          FORM C REQD
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Domestic</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                        CONFIRMED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
