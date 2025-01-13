	
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // мы сами управляем классом .dark
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}", // если нужны классы внутри контекста
  ],
  theme: {
    extend: {
      fontFamily: {
        greatvibes: ["Great Vibes", "cursive"],
      },
      // Пример анимации, градиентов и т.д.
      keyframes: {
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        gradient: "gradient 3s ease infinite",
      },
      typography: {
        DEFAULT: {
          css: {
/*             hyphens: 'auto', */
/*             lang:"en", */
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
/*     require('@tailwindcss/typography'), */
  ],
};