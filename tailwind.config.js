const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F78000",
        "primary-hover": "#db7506",
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
      ...defaultTheme.screens,
    },
  },
  plugins: [],
};
