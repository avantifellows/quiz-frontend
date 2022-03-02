import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./index.css";

import InlineSvg from "vue-inline-svg";

const app = createApp(App).use(store).use(router);

app.component("inline-svg", InlineSvg);

app.mount("#app");
