import { createStore } from "vuex";
import { QuestionBucketingMap, QuizPhase, ValidationResponse } from "../types";

export default createStore({
  state: {
    isSpinnerShown: false,
    questionBucketingMaps: [] as Array<QuestionBucketingMap>,
    bucketSize: 10,
    locale: "en", // default locale

    // ─── Quiz Phase State (Phase 2) ─────────────────────────────────
    quizPhase: "IDLE" as QuizPhase,
    validationResult: null as ValidationResponse | null,
    score: 0,
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
    // ─── Quiz Phase Mutations ─────────────────────────────────────
    setQuizPhase(state, phase: QuizPhase) {
      state.quizPhase = phase;
    },
    setValidationResult(state, result: ValidationResponse | null) {
      state.validationResult = result;
    },
    addScore(state, delta: number) {
      state.score += delta;
    },
    resetScore(state) {
      state.score = 0;
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
    // ─── Quiz Phase Actions ───────────────────────────────────────
    setQuizPhase({ commit }, phase: QuizPhase) {
      commit("setQuizPhase", phase);
    },
    /**
     * Record a validation result and update the score if applicable.
     */
    recordValidation({ commit }, result: ValidationResponse) {
      commit("setValidationResult", result);
      if (result.score_delta) {
        commit("addScore", result.score_delta);
      }
    },
    /**
     * Move to the next question — reset validation state and phase.
     */
    nextQuestion({ commit }) {
      commit("setQuizPhase", "ACTIVE");
      commit("setValidationResult", null);
    },
  },
  getters: {
    locale: (state) => state.locale,
    // ─── Quiz Phase Getters ───────────────────────────────────────
    currentPhase: (state) => state.quizPhase,
    isValidating: (state) => state.quizPhase === "VALIDATING",
    isComplete: (state) => state.quizPhase === "COMPLETE",
    validationResult: (state) => state.validationResult,
    currentScore: (state) => state.score,
  },
});
