"use client";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "dark" | "light"; // dark = dark green/gold for light bg; light = white/gold for dark bg
  showText?: boolean;
}

export function BrandEmblem({
  size = 44,
  theme = "gold",
}: {
  size?: number;
  theme?: "gold" | "white";
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm select-none"
    >
      <defs>
        {/* Luxury Metallic Gold Gradient */}
        <linearGradient id="arabicaGoldGrad" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#F9E7BA" />
          <stop offset="35%" stopColor="#DFB972" />
          <stop offset="70%" stopColor="#C59B4B" />
          <stop offset="100%" stopColor="#8F6826" />
        </linearGradient>

        {/* Deep Sanctuary Forest Gradient */}
        <linearGradient id="sanctuaryGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A1E" />
          <stop offset="60%" stopColor="#122412" />
          <stop offset="100%" stopColor="#0B170B" />
        </linearGradient>

        {/* Inner Glow */}
        <radialGradient id="emblemGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#DFB972" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#DFB972" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Base Circular Shield */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="url(#sanctuaryGreenGrad)"
        stroke="url(#arabicaGoldGrad)"
        strokeWidth="1.8"
      />
      <circle cx="50" cy="50" r="48" fill="url(#emblemGlow)" />

      {/* 2. Ornate Filigree Inner Ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="url(#arabicaGoldGrad)"
        strokeWidth="0.8"
        strokeDasharray="2.5 1.5"
        strokeOpacity="0.85"
      />
      <circle
        cx="50"
        cy="50"
        r="41"
        stroke="url(#arabicaGoldGrad)"
        strokeWidth="0.5"
        strokeOpacity="0.6"
      />

      {/* 3. Mountain Peaks (Western Ghats - 1,200m) */}
      <path
        d="M 18 68 L 36 46 L 47 57 L 62 40 L 82 68 Z"
        fill="none"
        stroke="url(#arabicaGoldGrad)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Mountain Contour Ribs */}
      <path
        d="M 36 46 L 38 68 M 62 40 L 58 68"
        stroke="url(#arabicaGoldGrad)"
        strokeWidth="0.75"
        strokeOpacity="0.5"
      />

      {/* 4. Rising Sun / Dawn Radiant Disc */}
      <circle
        cx="50"
        cy="33"
        r="5.5"
        fill="url(#arabicaGoldGrad)"
      />
      {/* Sunburst Rays */}
      <g stroke="url(#arabicaGoldGrad)" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.75">
        <line x1="50" y1="23" x2="50" y2="20" />
        <line x1="42" y1="26" x2="40" y2="23" />
        <line x1="58" y1="26" x2="60" y2="23" />
        <line x1="36" y1="33" x2="33" y2="33" />
        <line x1="64" y1="33" x2="67" y2="33" />
      </g>

      {/* 5. Arabica Coffee Botanical Wreath (Branches & Cherries) */}
      {/* Left Coffee Branch */}
      <path
        d="M 23 60 C 20 46, 26 34, 34 26"
        fill="none"
        stroke="url(#arabicaGoldGrad)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Left Leaves */}
      <path
        d="M 23 48 C 17 46, 17 40, 24 43 C 27 44, 27 48, 23 48 Z"
        fill="url(#arabicaGoldGrad)"
      />
      <path
        d="M 27 38 C 22 34, 25 28, 30 32 C 32 34, 31 38, 27 38 Z"
        fill="url(#arabicaGoldGrad)"
      />
      {/* Left Ripe Coffee Cherries */}
      <circle cx="27" cy="51" r="2.2" fill="#C84B31" stroke="url(#arabicaGoldGrad)" strokeWidth="0.5" />
      <circle cx="30" cy="48" r="2" fill="#E25B3E" stroke="url(#arabicaGoldGrad)" strokeWidth="0.5" />

      {/* Right Coffee Branch */}
      <path
        d="M 77 60 C 80 46, 74 34, 66 26"
        fill="none"
        stroke="url(#arabicaGoldGrad)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Right Leaves */}
      <path
        d="M 77 48 C 83 46, 83 40, 76 43 C 73 44, 73 48, 77 48 Z"
        fill="url(#arabicaGoldGrad)"
      />
      <path
        d="M 73 38 C 78 34, 75 28, 70 32 C 68 34, 69 38, 73 38 Z"
        fill="url(#arabicaGoldGrad)"
      />
      {/* Right Ripe Coffee Cherries */}
      <circle cx="73" cy="51" r="2.2" fill="#C84B31" stroke="url(#arabicaGoldGrad)" strokeWidth="0.5" />
      <circle cx="70" cy="48" r="2" fill="#E25B3E" stroke="url(#arabicaGoldGrad)" strokeWidth="0.5" />

      {/* 6. Heritage Monogram / Sanctuary Seal Base */}
      <path
        d="M 38 78 L 50 72 L 62 78 L 50 82 Z"
        fill="url(#arabicaGoldGrad)"
        fillOpacity="0.8"
      />
      <text
        x="50"
        y="77.5"
        textAnchor="middle"
        fontSize="5"
        fontWeight="bold"
        fontFamily="serif"
        fill="#0B170B"
        letterSpacing="1"
      >
        EST. 1892
      </text>

      {/* 7. Apex North Star of Hospitality */}
      <polygon
        points="50,11 51.5,14.5 55,16 51.5,17.5 50,21 48.5,17.5 45,16 48.5,14.5"
        fill="url(#arabicaGoldGrad)"
      />
    </svg>
  );
}

export default function BrandLogo({
  className = "",
  size = "md",
  variant = "dark",
  showText = true,
}: BrandLogoProps) {
  const pixelSize = {
    sm: 36,
    md: 46,
    lg: 58,
    xl: 72,
  }[size];

  const isLight = variant === "light";

  return (
    <div className={`flex items-center gap-3.5 group select-none ${className}`}>
      {/* Ornate Vector Heritage Emblem */}
      <div className="relative shrink-0 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
        <BrandEmblem size={pixelSize} />
      </div>

      {/* Refined Luxury Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-serif text-lg sm:text-xl font-bold tracking-tight block leading-none transition-colors ${
                isLight
                  ? "text-white group-hover:text-[#F0DCB4]"
                  : "text-[#182F18] group-hover:text-[#0F1F0F]"
              }`}
            >
              Arabica Highlands
            </span>
            <span className="hidden sm:inline-block text-[8px] tracking-[0.25em] uppercase font-bold text-[#C5A880] border border-[#C5A880]/40 px-1.5 py-0.2 rounded bg-[#C5A880]/10">
              Chikkamagaluru
            </span>
          </div>
          <span
            className={`text-[9px] sm:text-[9.5px] tracking-[0.22em] uppercase font-medium block mt-1 transition-colors ${
              isLight ? "text-[#C5A880]" : "text-[#7E5433]"
            }`}
          >
            Coffee Estate & Sanctuary • Est. 1892
          </span>
        </div>
      )}
    </div>
  );
}
