import { createStore } from "vuex";

export default createStore({
  state: {
    isSpinnerShown: false,
  },
  getters: {},
  mutations: {
    showSpinner(state) {
      state.isSpinnerShown = true;
    },
    hideSpinner(state) {
      state.isSpinnerShown = false;
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
