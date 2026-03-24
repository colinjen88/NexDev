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
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-soft": "var(--surface-soft)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        line: "var(--line)",
        "accent-primary": "var(--accent-primary)",
        "accent-warm": "var(--accent-warm)",
        "accent-olive": "var(--accent-olive)",
        "accent-danger": "var(--accent-danger)",
        "accent-info": "var(--accent-info)",
      },
      fontFamily: {
        serif: ["var(--font-noto-serif-tc)", "serif"],
        sans: ["var(--font-noto-sans-tc)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
