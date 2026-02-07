/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enables dark mode via class (add 'dark' class to html/body)

  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all files in src folder
    "./public/index.html", // If you have custom HTML
  ],

  theme: {
    extend: {
      // Custom colors (pink-purple theme for your app)
      colors: {
        primary: {
          50: "#fdf2f8",
          100: "#fae5f1",
          200: "#f5c4e1",
          300: "#f0a0ce",
          400: "#e975b7",
          500: "#e04fa0",
          600: "#c33d8a",
          700: "#a13272",
          800: "#83285c",
          900: "#6b214c",
        },
        secondary: {
          50: "#f5f3ff",
          100: "#ebe9ff",
          200: "#d9d6ff",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
      },

      // Custom animations
      animation: {
        "bounce-slow": "bounce 3s infinite",
        "pulse-once": "pulseOnce 1.5s ease-in-out",
        "float": "float 6s ease-in-out infinite",
        "slideIn": "slideIn 0.7s ease-out",
        "fadeIn": "fadeIn 0.8s ease-out",
        "shimmer": "shimmer 2.5s infinite linear",
      },

      keyframes: {
        bounce: {
          "0%, 100%": { transform: "translateY(-5%)" },
          "50%": { transform: "translateY(0)" },
        },
        pulseOnce: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-30px) rotate(10deg)" },
        },
        slideIn: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },

      // Box shadows
      boxShadow: {
        "glow": "0 0 20px rgba(236, 72, 153, 0.5)", // pink glow
        "glow-dark": "0 0 20px rgba(168, 85, 247, 0.5)", // purple glow
      },
    },
  },

  plugins: [
    // Optional: add more plugins if needed later
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};

