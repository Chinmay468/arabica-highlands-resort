import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BrandLogo from "@/components/BrandLogo";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Shield, MapPin, Phone, Mail, Award, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Arabica Highlands Resort & Sanctuary | Chikkamagaluru",
  description:
    "Luxury 76-key coffee-estate sanctuary in Chikkamagaluru, Karnataka. Direct booking, bespoke wedding lawns, and corporate retreats with best rate guarantee.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  // Query pending escalations count for the badge
  const pendingEscalations = await prisma.enquiry.count({
    where: { status: "ESCALATED_GM" },
  });

  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#182F18] selection:bg-[#C5A880] selection:text-white">
        <Navbar currentUser={currentUser} pendingEscalationsCount={pendingEscalations} />

        <main className="flex-1">{children}</main>

        {/* DPDP Act 2023 & Resort Footer */}
        <footer className="bg-[#0F1F0F] text-[#E3DAC5] border-t border-[#223E22] pt-14 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              {/* Brand Col */}
              <div className="space-y-3 md:col-span-1">
                <BrandLogo size="md" variant="light" />
                <p className="text-xs text-[#A3B6A3] leading-relaxed pt-1">
                  A 76-key boutique coffee estate sanctuary nestled on the mist-draped slopes of Chikkamagaluru, Karnataka.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium pt-1">
                  <Award className="w-4 h-4 text-[#C5A880]" />
                  <span>Direct Booking Best Tariff Guarantee</span>
                </div>
              </div>

              {/* Contact Col */}
              <div className="space-y-2 text-xs text-[#A3B6A3]">
                <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">The Sanctuary</h4>
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880] mt-0.5 shrink-0" />
                  Mullayanagiri Slopes, Post Box 14, Chikkamagaluru, Karnataka 577101
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                  +91 8262 258900 / +91 98450 12345
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                  reservations@arabicahighlands.com
                </p>
              </div>

              {/* Direct Booking Advantages */}
              <div className="space-y-2 text-xs text-[#A3B6A3]">
                <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Direct Privileges</h4>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Zero OTA commissions (15% savings passed to guest)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Complimentary single-estate coffee cupping session
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Priority early check-in & late checkout (subject to allotment)
                  </li>
                </ul>
              </div>

              {/* Statutory Compliance Col */}
              <div className="space-y-2 text-xs text-[#A3B6A3]">
                <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Statutory & Privacy</h4>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-medium text-[11px]">
                    <Shield className="w-3.5 h-3.5" />
                    DPDP Act 2023 Compliant
                  </div>
                  <p className="text-[10px] text-stone-400 leading-normal">
                    Guest identity data is collected solely for room reservations and statutory Form C check-in compliance. We never track or sell personal details.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A3B6A3] gap-3">
              <p>© {new Date().getFullYear()} Arabica Highlands Estate & Resort Pvt Ltd. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="/login" className="hover:text-white transition">Staff Sign In</a>
                <a href="/inbox" className="hover:text-white transition">AI Router</a>
                <a href="/admin/allotment" className="hover:text-white transition">Allotment Admin</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
