const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    colors: {
      // use colors only specified
      white: colors.white,
      gray: colors.gray,
      blue: colors.blue,
      green: colors.green, // Add green colors for the gradient
      yellow: colors.yellow, // Add yellow colors for the pause button
    },
    extend: {},
  },
  plugins: [],
};
