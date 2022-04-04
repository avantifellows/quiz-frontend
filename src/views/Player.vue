<template>
  <div class="h-screen">
    <Splash
      v-if="isSplashShown"
      :title="title"
      :subject="metadata.subject"
      :classNumber="metadata.class"
      :numQuestions="questions.length"
      :quizType="metadata.quizType"
      @start="startQuiz"
      data-test="splash"
    ></Splash>

    <QuestionModal
      :questions="questions"
      v-model:currentQuestionIndex="currentQuestionIndex"
      v-model:responses="responses"
      v-if="isQuestionShown"
      data-test="modal"
    ></QuestionModal>

    <Scorecard
      v-if="showScorecard"
      id="scorecardmodal"
      class="absolute z-10"
      :class="{
        hidden: !isScorecardShown,
      }"
      :metrics="scorecardMetrics"
      :progressPercentage="scorecardProgress"
      :isShown="isScorecardShown"
      :title="title"
      :numQuestionsAnswered="numQuestionsAnswered"
      ref="scorecard"
    ></Scorecard>
  </div>
</template>

<script lang="ts">
import QuestionModal from "../components/Questions/QuestionModal.vue";
import Splash from "../components/Splash.vue";
import Scorecard from "../components/Scorecard.vue";
import { defineComponent, reactive, toRefs, computed } from "vue";
import { Question, SubmittedResponse } from "../types";

export default defineComponent({
  name: "Player",
  components: {
    Splash,
    QuestionModal,
    Scorecard,
  },
  setup() {
    const state = reactive({
      currentQuestionIndex: -1 as number,
      title: "Geometry Quiz" as string,
      metadata: {
        quizType: "CBSE",
        subject: "Maths",
        class: 8,
      },
      questions: [
        {
          type: "mcq",
          text: "abcd",
          options: ["option 1", "option 2"],
          correct_answer: [0],
          image: null,
          survey: false,
          max_char_limit: null,
        },
        {
          type: "subjective",
          text: "yolo",
          options: ["", ""],
          correct_answer: null,
          image: null,
          survey: false,
          max_char_limit: 100,
        },
        {
          type: "checkbox",
          text: "efgh",
          options: ["option 1", "option 2", "op3", "option 4"],
          correct_answer: [2, 3],
          image: null,
          survey: false,
          max_char_limit: null,
        },
        {
          type: "checkbox",
          text: "ijkl",
          options: ["", "", ""],
          correct_answer: [0, 1],
          image: {
            url:
              "https://plio-prod-assets.s3.ap-south-1.amazonaws.com/images/afbxudrmbl.png",
            alt_text: "some image",
          },
          survey: true,
          max_char_limit: null,
        },
      ] as Question[],
      responses: [] as SubmittedResponse[], // holds the responses to each item submitted by the viewer
      numCorrect: 0, // number of correctly answered questions
      numWrong: 0, // number of wrongly answered questions
      isScorecardShown: false, // to show the scorecard or not
    });
    const isEqual = require("deep-eql");
    const isSplashShown = computed(() => state.currentQuestionIndex == -1);
    const isQuestionShown = computed(() => {
      return (
        state.currentQuestionIndex >= 0 &&
        state.currentQuestionIndex < state.questions.length
      );
    });
    const showScorecard = computed(() => {
      if (areAllQuestionsSurvey.value) return false;
      if (state.currentQuestionIndex == state.questions.length) scorecard();
      return state.currentQuestionIndex == state.questions.length;
    });

    function scorecard() {
      state.isScorecardShown = true;
      calculateScorecardMetrics();
    }

    function startQuiz() {
      state.currentQuestionIndex = 0;
    }

    state.questions.forEach((_, itemIndex) => {
      state.responses.push({
        answer: null,
      });
    });

    // scorecard

    /**
     * defines all the metrics to show in the scorecard here
     */
    const scorecardMetrics = computed(() => {
      return [
        {
          name: "Correct",
          icon: {
            source: "correct",
            class: "text-green-500",
          },
          value: state.numCorrect,
        },
        {
          name: "Wrong",
          icon: {
            source: "wrong",
            class: "text-red-500",
          },
          value: state.numWrong,
        },
      ];
    });

    /**
     * progress value (0-100) to be passed to the Scorecard component
     */
    const scorecardProgress = computed(() => {
      const totalAttempted = state.numCorrect + state.numWrong;
      if (totalAttempted == 0) return null;
      return (state.numCorrect / totalAttempted) * 100;
    });

    /**
     * number of questions that have been answered
     */
    const numQuestionsAnswered = computed(() => {
      return state.numCorrect + state.numWrong;
    });

    const numSurveyQuestions = computed(() => {
      let count = 0;
      state.questions.forEach((itemDetail) => {
        if (itemDetail.survey) count += 1;
      });
      // for (itemDetail of state.questions) {
      //   if (itemDetail.survey) count += 1;
      // }
      return count;
    });

    const areAllQuestionsSurvey = computed(() => {
      return numSurveyQuestions.value == state.questions.length;
    });

    function calculateScorecardMetrics() {
      let index = 0;
      state.questions.forEach((itemDetail) => {
        updateNumCorrectWrongSkipped(itemDetail, state.responses[index].answer);
        index += 1;
      });
    }

    function updateNumCorrectWrongSkipped(itemDetail: any, userAnswer: any) {
      if (itemDetail.survey) {
        return;
      }
      if (itemDetail.type == "mcq" && !isNaN(userAnswer)) {
        const correctAnswer = itemDetail.correct_answer;
        isEqual(userAnswer, correctAnswer)
          ? (state.numCorrect += 1)
          : (state.numWrong += 1);
      } else if (
        itemDetail.type == "checkbox" &&
        userAnswer != null &&
        userAnswer.length > 0
      ) {
        // for checkbox questions, check if the answers match exactly
        const correctAnswer = itemDetail.correct_answer;

        isEqual(userAnswer, correctAnswer)
          ? (state.numCorrect += 1)
          : (state.numWrong += 1);
      } else if (
        itemDetail.type == "subjective" &&
        userAnswer != null &&
        userAnswer.trim() != ""
      ) {
        // for subjective questions, as long as the viewer has given any answer
        // their response is considered correct
        state.numCorrect += 1;
      }
    }

    return {
      ...toRefs(state),
      isQuestionShown,
      isSplashShown,
      startQuiz,
      showScorecard,
      scorecardMetrics,
      scorecardProgress,
      numQuestionsAnswered,
    };
  },
});
</script>
