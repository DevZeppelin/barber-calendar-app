/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0a0d12",
          900: "#0f1319",
          800: "#161c25",
          700: "#1f2733",
          600: "#2a3441",
        },
        brass: {
          50: "#fff8ec",
          100: "#ffedc7",
          200: "#ffd98a",
          300: "#ffbf4d",
          400: "#ffa423",
          500: "#f6820e",
          600: "#e06308",
          700: "#ba4709",
          800: "#95370f",
          900: "#7a2f10",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(246,130,14,0.15), 0 8px 30px -8px rgba(246,130,14,0.25)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
