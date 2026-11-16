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
      },
      borderWidth: {
        1: "1px",
      },
      fontSize: {
        xxs: "0.80rem",
      },
    },
    // Keep these in ascending order: Tailwind emits media queries in this order, so a
    // breakpoint listed after a larger one overrides it (sm: used to win over lg:/xl:).
    screens: {
      "bp-320": "320px",
      "bp-360": "360px",
      "bp-420": "420px",
      "bp-500": "500px",
      sm: defaultTheme.screens.sm, // 640px
      md: defaultTheme.screens.md, // 768px
      custom: "870px", // Custom breakpoint at 870px
      lg: defaultTheme.screens.lg, // 1024px
      xl: defaultTheme.screens.xl, // 1280px
      "2xl": defaultTheme.screens["2xl"], // 1536px
    },
  },
  plugins: [],
  // disabling preflight plugin because one type of default causes problems in the cms question text html code
  corePlugins: {
    preflight: false,
  },
};
