/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F7F1E7",
          card: "#FFFDF8",
          secondary: "#EADBC8",
          brown: "#765747",
          dark: "#4A352C",
          yellow: "#F4D58D",
          softYellow: "#FAE8B6",
          green: "#B7C9A8",
          red: "#DFA7A0",
          cream: "#FAF5EE"
        }
      },
      fontFamily: {
        sans: ['Calibri', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(118, 87, 71, 0.08)',
        'soft-lg': '0 10px 25px -3px rgba(74, 53, 44, 0.12)',
      }
    },
  },
  plugins: [],
}
