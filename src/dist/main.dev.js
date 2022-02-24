"use strict";

var _vue = require("vue");

var _App = _interopRequireDefault(require("./App.vue"));

var _router = _interopRequireDefault(require("./router"));

var _store = _interopRequireDefault(require("./store"));

require("./index.css");

var _vueInlineSvg = _interopRequireDefault(require("vue-inline-svg"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var app = (0, _vue.createApp)(_App.default)
  .use(_store.default)
  .use(_router.default);
app.component("inline-svg", _vueInlineSvg.default);
app.mount("#app");
