import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Toast from "vue-toastification";
import VueClickAway from "vue3-click-away";

import "./index.css";
import "vue-toastification/dist/index.css";

const app = createApp(App).use(store).use(router);
app.use(Toast);
app.use(VueClickAway);
app.mount("#app");
