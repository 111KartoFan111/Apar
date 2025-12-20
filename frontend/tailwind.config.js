/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1b6f78",
        primaryDark: "#0f4d55",
        secondary: "#334155",
        border: "#e2e8f0",
        surface: "#f4f6f8",
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
        info: "#0ea5e9"
      }
    }
  },
  plugins: []
};
