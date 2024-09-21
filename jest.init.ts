/*
 * This file contains the initialization for test cases.
 * It is being run from jest.config.js as a setupFile.
 * It gets loaded before the tests are run.
 */

import { config } from "@vue/test-utils";
import VueClickAway from "vue3-click-away";

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// inline-svg stub
const InlineSvg = {
  template: "<img />",
};

config.global.stubs = {
  InlineSvg,
};
config.global.plugins = [VueClickAway];
