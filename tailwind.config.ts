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
        background: {
          DEFAULT: "#02030A",
          secondary: "#060812",
        },
        surface: "rgba(8,12,28,0.85)",
        primary: {
          DEFAULT: "#E8E3D8",
          muted: "#8A8070",
        },
        accent: {
          DEFAULT: "#FFD700",
          hover: "#FF8C00",
          subtle: "rgba(255,215,0,0.08)",
        },
        "neon-cyan": "#00FFFF",
        "neon-jade": "#00FF88",
        "neon-red": "#FF2D55",
        "neon-violet": "#BF5FFF",
        destructive: "#FF2D55",
        success: "#00FF88",
        border: "rgba(255,215,0,0.08)",
        "border-strong": "rgba(255,215,0,0.2)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-cinzel)", "serif"],
        display: ["var(--font-rajdhani)", "sans-serif"],
      },
      boxShadow: {
        card: "0 0 20px rgba(255,215,0,0.06), 0 0 40px rgba(255,215,0,0.02)",
        elevated: "0 0 40px rgba(255,215,0,0.12), 0 0 80px rgba(0,255,255,0.04)",
        dropdown: "0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(255,215,0,0.1)",
        drawer: "-4px 0 30px rgba(0,0,0,0.9), 0 0 20px rgba(255,215,0,0.08)",
        "neon-gold": "0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.25)",
        "neon-cyan": "0 0 20px rgba(0,255,255,0.4), 0 0 40px rgba(0,255,255,0.2)",
      },
      letterSpacing: {
        tracked: "0.1em",
      },
      maxWidth: {
        container: "1440px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSlow: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.85" },
        },
        neonPulse: {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(255,215,0,0.3), 0 0 20px rgba(255,215,0,0.15)",
          },
          "50%": {
            boxShadow: "0 0 25px rgba(255,215,0,0.7), 0 0 50px rgba(255,215,0,0.4), 0 0 80px rgba(255,140,0,0.2)",
          },
        },
        floatUp: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)", opacity: "0.4" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s infinite linear",
        "pulse-slow": "pulseSlow 2.5s infinite ease-in-out",
        "neon-pulse": "neonPulse 2s infinite ease-in-out",
        "float-up": "floatUp 4s infinite ease-in-out",
        "scan-line": "scanLine 6s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
