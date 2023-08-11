const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F78000",
        "primary-hover": "#db7506",
        "back-color": "#F78000",
        "share-color": "#10B981",
        pink: "#E8ADAA",
        red: "#FF0000",
      },
      borderWidth: {
        1: "1px",
      },
    },
    screens: {
      "bp-320": "320px",
      "bp-360": "360px",
      "bp-420": "420px",
      "bp-500": "500px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      custom: "870px", // Custom breakpoint at 870px
      ...defaultTheme.screens,
    },
    listStyleType: {
      exclamation: "!",
    },
  },
  plugins: [],
  // disabling preflight plugin because one type of default causes problems in the cms question text html code
  corePlugins: {
    preflight: false,
  },
};
