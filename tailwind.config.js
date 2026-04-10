/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Inter'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        bg:      "#0F172A",
        surface: "#1E293B",
        border:  "#334155",
        accent:  "#3B82F6",
        muted:   "#94A3B8",
        dim:     "#64748B",
      },
    },
  },
  plugins: [],
};
