import { createApp } from "vue";
import { createI18n } from 'vue-i18n';
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Toast, { ToastInterface } from "vue-toastification";
import { plugin, defaultConfig } from '@formkit/vue'
import '@formkit/themes/genesis'
import VueClickAway from "vue3-click-away";

import "./index.css";
import "vue-toastification/dist/index.css";

import en from './locales/englishTranslationData.json';
import hi from './locales/hindiTranslationData.json';

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: store.getters.locale || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    hi
  }
});

const app = createApp(App).use(store).use(router);

const filterBeforeCreate = (
  toast: ToastInterface,
  toasts: ToastInterface[]
) => {
  // adapted from here - https://github.com/Maronato/vue-toastification#filterbeforecreate
  // prevents toasts with the same content from appearing simultaneously, discarding duplicates
  // and prevent toasts from showing up for an embedded plio
  // @ts-ignore
  if (toasts.filter((t) => t.content === toast.content).length !== 0) {
    // returning false discards the toast
    return false;
  }
  return toast;
};
app.use(i18n);
app.use(Toast, { filterBeforeCreate });
app.use(VueClickAway);
app.use(plugin, defaultConfig);
app.mount("#app");
