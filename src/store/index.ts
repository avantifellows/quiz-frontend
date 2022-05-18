import { createStore } from "vuex";
import { QuestionBucketingMap } from "../types"

export default createStore({
  state: {
    isSpinnerShown: false,
    questionsBucketingMap: {} as QuestionBucketingMap,
    bucketSize: 10,
  },
  getters: {
    questionBucketingMap: (state) => state.questionsBucketingMap,
    bucketSize: (state) => state.bucketSize,
  },
  mutations: {
    showSpinner(state) {
      state.isSpinnerShown = true;
    },
    hideSpinner(state) {
      state.isSpinnerShown = false;
    },
    setQuestionBucketMap(state, value: QuestionBucketingMap) {
      state.questionsBucketingMap = value;
    },
    updateBucketFetchedStatus(state, details: {
      key: number,
      fetchedStatus: boolean
    }) {
      state.questionsBucketingMap[details.key].hasBeenFetched = details.fetchedStatus
    }
  },
  actions: {
    showSpinner({ commit }) {
      commit("showSpinner");
    },
    hideSpinner({ commit }) {
      commit("hideSpinner");
    },
    setQuestionBucketMap({ commit }, value: QuestionBucketingMap) {
      commit("setQuestionBucketMap", value)
    },
    updateBucketFetchedStatus({ commit }, details: {
      key: number,
      fetchedStatus: boolean
    }) {
      commit("updateBucketFetchedStatus", details)
    },
  },
});
