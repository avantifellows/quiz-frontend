import { createStore } from "vuex";

export default createStore({
  state: {
    isSpinnerShown: false,
    windowInnerHeight: null,
  },
  getters: {},
  mutations: {
    showSpinner(state) {
      state.isSpinnerShown = true;
    },
    hideSpinner(state) {
      state.isSpinnerShown = false;
    },
    setWindowInnerHeight(state, windowInnerHeight) {
      state.windowInnerHeight = windowInnerHeight;
    },
  },
  actions: {
    showSpinner({ commit }) {
      commit("showSpinner");
    },
    hideSpinner({ commit }) {
      commit("hideSpinner");
    },
    setWindowInnerHeight({ commit }, windowInnerHeight) {
      commit("setWindowInnerHeight", windowInnerHeight);
    },
  },
  modules: {},
});
