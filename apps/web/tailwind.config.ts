import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
