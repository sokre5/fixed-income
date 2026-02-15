/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"SF Mono"', 'Consolas', 'monospace'],
      },
      colors: {
        terminal: {
          black: "#0a0a0a",
          dark: "#111111",
          panel: "#1a1a1a",
          border: "#2a2a2a",
          muted: "#3a3a3a",
        },
        fg: {
          primary: "#cccccc",
          secondary: "#777777",
          bright: "#ffffff",
        },
        neon: {
          green: "#00ff41",
          red: "#ff3333",
          amber: "#ffaa00",
          cyan: "#00d4ff",
          blue: "#4488ff",
        },
      },
      borderRadius: {
        none: "0",
      },
    },
  },
  plugins: [],
};
