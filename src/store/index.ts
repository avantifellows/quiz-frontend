import { createStore } from "vuex";
import { QuestionBucketingMap } from "../types"

export default createStore({
  state: {
    isSpinnerShown: false,
    questionBucketingMap: {} as QuestionBucketingMap,
    bucketSize: 10,
  },
  mutations: {
    showSpinner(state) {
      state.isSpinnerShown = true;
    },
    hideSpinner(state) {
      state.isSpinnerShown = false;
    },
    setQuestionBucketMap(state, value: QuestionBucketingMap) {
      state.questionBucketingMap = value;
    },
    updateBucketFetchedStatus(state, details: {
      key: number,
      fetchedStatus: boolean
    }) {
      state.questionBucketingMap[details.key].isFetched = details.fetchedStatus
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
