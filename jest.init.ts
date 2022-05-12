/*
 * This file contains the initialization for test cases.
 * It is being run from jest.config.js as a setupFile.
 * It gets loaded before the tests are run.
 */

import { config } from "@vue/test-utils";
import VueClickAway from "vue3-click-away";

// inline-svg stub
const InlineSvg = {
  template: "<img />",
};

config.global.stubs = {
  InlineSvg: InlineSvg,
};
config.global.plugins = [VueClickAway];
