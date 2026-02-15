/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#070A0E",
          900: "#0E141C",
          800: "#17202B"
        },
        text: {
          primary: "#E6EDF7",
          secondary: "#9AAABA"
        },
        signal: {
          bullish: "#4ADE80",
          bearish: "#F87171",
          neutral: "#FBBF24"
        },
        accent: {
          amber: "#F59E0B"
        }
      }
    }
  },
  plugins: [],
};
