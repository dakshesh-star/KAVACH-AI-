import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        kavach: {
          bg: "#060B18",
          bgAlt: "#0A101F",
          border: "#1E2A45",
          borderLight: "#1A2235",
          blue: "#2563EB",
          violet: "#7C3AED",
          sky: "#0EA5E9",
          text: {
            primary: "#FFFFFF",
            secondary: "#94A3B8",
            muted: "#64748B",
            faint: "#475569",
          },
        },
      },
      backgroundImage: {
        "gradient-kavach": "linear-gradient(135deg, #2563EB, #7C3AED)",
        "gradient-text": "linear-gradient(90deg, #60A5FA, #A78BFA)",
      },
      animation: {
        "fade-slide": "fadeSlide 0.6s ease-out both",
        "spin-slow": "spin 20s linear infinite",
        "spin-slow-reverse": "spin 32s linear infinite reverse",
        breathe: "breathe 3.2s ease-in-out infinite",
        "pulse-green": "pulseGreen 2s infinite",
        shimmer: "shimmer 4s linear infinite",
        "glow-pulse": "glowPulse 8s ease-in-out infinite",
        scanline: "scanline 5s linear infinite",
      },
      keyframes: {
        fadeSlide: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1) translateY(0)", filter: "drop-shadow(0 6px 24px rgba(59,130,246,0.5))" },
          "50%": { transform: "scale(1.06) translateY(-3px)", filter: "drop-shadow(0 10px 36px rgba(124,58,237,0.6))" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.4)" },
          "50%": { boxShadow: "0 0 0 5px rgba(34,197,94,0.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.35" },
        },
        scanline: {
          "0%": { top: "-2%" },
          "100%": { top: "102%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
