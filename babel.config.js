module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  env: {
    development: {
      plugins: [
        [
          "babel-plugin-istanbul",
          {
            extension: [".js", ".vue"],
          },
        ],
      ],
    },
  },
};
