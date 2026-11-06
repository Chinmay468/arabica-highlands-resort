import Link from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BrandEmblem } from "@/components/BrandLogo";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="bg-white rounded-3xl border border-[#D3C6AA] p-8 max-w-md w-full shadow-lg space-y-4">
        <div className="flex justify-center mx-auto">
          <BrandEmblem size={56} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#182F18]">
          Sanctuary Not Found
        </h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          The requested room category or estate page could not be located in our Chikkamagaluru grounds.
        </p>
        <div className="pt-2">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-xl transition shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sanctuary Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
