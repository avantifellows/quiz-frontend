import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Toast, { ToastInterface } from "vue-toastification";
import VueClickAway from "vue3-click-away";

import "./index.css";
import "vue-toastification/dist/index.css";

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

app.use(Toast, { filterBeforeCreate });
app.use(VueClickAway);
app.mount("#app");
