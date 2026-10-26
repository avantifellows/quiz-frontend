const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "ux33ap",
  fixturesFolder: "tests/e2e/fixtures",
  screenshotsFolder: "tests/e2e/screenshots",
  videosFolder: "tests/e2e/videos",
  e2e: {
    baseUrl: "http://localhost:8081",
    specPattern: "tests/e2e/specs/**/*.js",
    excludeSpecPattern: "**/dist/*.dev.js",
    supportFile: "tests/e2e/support/index.js",
    setupNodeEvents(on, config) {
      return require("./tests/e2e/plugins/index.js")(on, config);
    },
  },
});
