/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-background)",
        surface: "var(--bg-surface)",
        "surface-container": "var(--bg-surface-container)",
        "surface-container-low": "var(--bg-surface-low)",
        "surface-container-high": "var(--bg-surface-high)",
        "on-surface": "var(--text-on-surface)",
        "on-surface-variant": "var(--text-on-surface-variant)",
        primary: "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        border: "var(--border-color)",
        "emerald-signal": "#10b981",
        "amber-signal": "#f59e0b",
        "indigo-signal": "#6366f1",
        "rose-signal": "#f43f5e",
        "violet-signal": "#8b5cf6",
      },
      fontFamily: {
        headline: "var(--font-headline)",
        body: "var(--font-body)",
      },
      borderRadius: {
        DEFAULT: "var(--radius-default)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
}
