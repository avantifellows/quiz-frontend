module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,ts,vue}",
    "!src/main.tx",
    "!src/**/dist/*.{js,ts}",
  ],
  setupFiles: ["<rootDir>/jest.init.ts"],
};
