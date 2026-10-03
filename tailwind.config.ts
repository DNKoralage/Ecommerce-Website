import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Blue Accent */
        blue: {
          DEFAULT: "#2563EB",
          50:  "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        /* Page & surface */
        background: {
          DEFAULT: "#F8FAFC",
          dark:    "#0F172A",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark:    "#1E293B",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          dark:    "#162032",
        },
        /* Text */
        foreground: {
          DEFAULT: "#0F172A",
          muted:   "#64748B",
          subtle:  "#94A3B8",
        },
        /* Border */
        border: {
          DEFAULT: "#E2E8F0",
          dark:    "rgba(51,65,85,0.7)",
        },
        /* Status */
        success: "#10B981",
        warning: "#F59E0B",
        danger:  "#EF4444",
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
        serif:   ["var(--font-outfit)", "sans-serif"],
        sinhala: ["var(--font-sinhala)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      boxShadow: {
        sm:  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        md:  "0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        lg:  "0 10px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
        xl:  "0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.08)",
        "blue-sm": "0 4px 14px rgba(37,99,235,0.35)",
        "blue-lg": "0 8px 32px rgba(37,99,235,0.5)",
        card: "0 2px 8px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.12)",
      },
      maxWidth: {
        container: "1440px",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.04)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        bounceCart: {
          "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
          "50%":      { transform: "translateX(-50%) translateY(-4px)" },
        },
      },
      animation: {
        "fade-in-up":  "fadeInUp 0.5s ease both",
        shimmer:       "shimmer 1.8s infinite linear",
        "pulse-soft":  "pulseSoft 2.5s ease-in-out infinite",
        "slide-up":    "slideUp 0.4s ease both",
        "bounce-cart": "bounceCart 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
