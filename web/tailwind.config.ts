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
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        surface: "var(--surface)",
        "surface-warm": "var(--surface-warm)",
        "surface-yellow": "var(--surface-yellow)",
        "surface-blue": "var(--surface-blue)",
        "surface-green": "var(--surface-green)",
        border: "var(--border)",
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        secondary: "var(--secondary)",
        success: "var(--success)",
        dark: "var(--dark)",
        "dark-accent": "var(--dark-accent)",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
