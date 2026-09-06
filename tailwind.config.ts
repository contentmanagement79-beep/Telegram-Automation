import type { Config } from "tailwindcss";

/** Change the palette in ONE place to re-skin the whole site. */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0B12",
          900: "#06070C",
          800: "#0A0B12",
          700: "#12141F",
          600: "#1B1E2E",
        },
        violet: { DEFAULT: "#6D5EF6", soft: "#8B7CF8", deep: "#5647D9" },
        iris: "#A855F7", // aurora accent only
        sky: "#38BDF8", // aurora accent only
        mint: "#3DDC97", // live / status only
        cloud: "#F4F5FB",
        muted: "#9AA3B8",
        line: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "1rem", "2xl": "1.5rem", "3xl": "2rem" },
      maxWidth: { "7xl": "80rem" },
    },
  },
  plugins: [],
};

export default config;
