/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/studio/**/*.{js,jsx}", "./src/shared/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        stone: {
          50: "#fafaf9", 100: "#f5f5f4", 200: "#e7e5e4", 300: "#d6d3d1", 400: "#a8a29e",
          500: "#78716c", 600: "#57534e", 700: "#44403c", 800: "#292524", 900: "#1c1917"
        },
        terracotta: { 50: "#fff7ed", 100: "#ffedd5", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412" }
      }
    }
  },
  plugins: []
};
