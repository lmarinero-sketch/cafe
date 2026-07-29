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
          bg: "#F6F9F5",
          card: "#FFFFFF",
          secondary: "#D6E2D4",
          brown: "#2F5233",
          dark: "#1A2E1E",
          yellow: "#E2EAC7",
          softYellow: "#EFF4DA",
          green: "#8FA887",
          red: "#E5A9A4",
          cream: "#EEF4EC"
        }
      },
      fontFamily: {
        sans: ['Calibri', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(47, 82, 51, 0.08)',
        'soft-lg': '0 10px 25px -3px rgba(26, 46, 30, 0.12)',
      }
    },
  },
  plugins: [],
}
