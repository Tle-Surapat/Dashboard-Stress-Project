/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        yellow: "#ffd664",
        blue: "#2bbdf0",
        blue_green: "#5bc6d2",
        navy: "#0d4269",
        green: "#8FD14F",
        orange: "#FA812F",
        red: "#FF2929"
      },
      fontFamily: {
        sans: ['"Montserrat"', 'sans-serif'],  // Add Montserrat to the sans font family
      },
    },
  },
  plugins: [],
};
