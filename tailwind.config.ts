import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        estate: {
          50: "#F5F7F5",
          100: "#E6EBE6",
          200: "#C9D4C9",
          300: "#A3B6A3",
          400: "#6B896B",
          500: "#446B44",
          600: "#2F502F",
          700: "#223E22",
          800: "#182F18",
          900: "#0F1F0F",
          950: "#091309",
        },
        coffee: {
          50: "#FAF6F2",
          100: "#F2E9DE",
          200: "#E3CFBA",
          300: "#CEAF8F",
          400: "#B88E67",
          500: "#9C7046",
          600: "#7E5433",
          700: "#623F27",
          800: "#492E1E",
          900: "#321F16",
        },
        parchment: {
          50: "#FCFAF6",
          100: "#F8F4EC",
          200: "#EFE8DA",
          300: "#E3DAC5",
          400: "#D3C6AA",
          500: "#BEAE8D",
        },
        gold: {
          400: "#D4AF37",
          500: "#C5A880",
          600: "#AA8C65",
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
