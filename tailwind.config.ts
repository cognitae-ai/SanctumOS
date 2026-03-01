import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0c0b0a", 
        surface: "#141312", 
        raised: "#1a1918",
        text: "#d4cec2", 
        muted: "#847b6f", 
        dim: "#3d3831", 
        faint: "#2a2622",
        accent: "#c49a6c", 
        accentSoft: "rgba(196,154,108,0.10)",
        guide: "#d4c4a8", 
        border: "rgba(255,255,255,0.04)",
        paper: "#ede8df", 
        paperText: "#2b2520", 
        paperMuted: "#736a5f",
        episteme: "#7a9eb5", 
        epistemeSoft: "rgba(122,158,181,0.10)",
        techne: "#8aab7a", 
        techneSoft: "rgba(138,171,122,0.10)",
        phronesis: "#b59a7a", 
        phronesisSoft: "rgba(181,154,122,0.10)",
        reflect: "#d4aa78", 
        reflectSoft: "rgba(212,170,120,0.12)",
        err: "#c47a6c", 
        lock: "#5a5550", 
        panelBg: "#111110",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      keyframes: {
        sFadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        sBreathe: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        sFadeIn: "sFadeIn 0.6s ease forwards",
        sBreathe: "sBreathe 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
