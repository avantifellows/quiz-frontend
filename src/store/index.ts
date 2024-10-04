import { createStore } from "vuex";
import { QuestionBucketingMap } from "../types";

export default createStore({
  state: {
    isSpinnerShown: false,
    questionBucketingMaps: [] as Array<QuestionBucketingMap>,
    bucketSize: 10,
    locale: "en", // default locale
  },
  mutations: {
    showSpinner(state) {
      state.isSpinnerShown = true;
    },
    hideSpinner(state) {
      state.isSpinnerShown = false;
    },
    setQuestionBucketMap(state, value: Array<QuestionBucketingMap>) {
      state.questionBucketingMaps = value;
    },
    updateBucketFetchedStatus(
      state,
      details: {
        qsetIndex: number;
        bucketIndex: number;
        fetchedStatus: boolean;
      }
    ) {
      state.questionBucketingMaps[details.qsetIndex][
        details.bucketIndex
      ].isFetched = details.fetchedStatus;
    },
    setLocale(state, locale: string) {
      state.locale = locale;
    },
  },
  actions: {
    showSpinner({ commit }) {
      commit("showSpinner");
    },
    hideSpinner({ commit }) {
      commit("hideSpinner");
    },
    setQuestionBucketMap({ commit }, value: Array<QuestionBucketingMap>) {
      commit("setQuestionBucketMap", value);
    },
    updateBucketFetchedStatus(
      { commit },
      details: {
        qsetIndex: number;
        bucketIndex: number;
        fetchedStatus: boolean;
      }
    ) {
      commit("updateBucketFetchedStatus", details);
    },
    setLocale({ commit }, locale: string) {
      commit("setLocale", locale);
    },
  },
  getters: {
    locale: (state) => state.locale,
  },
});
