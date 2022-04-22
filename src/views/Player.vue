<template>
  <div class="h-screen">
    <div v-if="isQuizLoaded" class="h-full">
      <Splash
        v-if="isSplashShown"
        :title="title"
        :subject="metadata.subject"
        :grade="metadata.grade"
        :numQuestions="questions.length"
        :quizType="metadata.quiz_type"
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
        id="scorecardmodal"
        class="absolute z-10"
        :class="{
          hidden: !isScorecardShown,
        }"
        :metrics="scorecardMetrics"
        :progressPercentage="scorecardProgress"
        :isShown="isScorecardShown"
        :title="title"
        greeting="Hooray! Congrats on completing the quiz! 🎉"
        :numQuestionsAnswered="numQuestionsAnswered"
        :areAllQuestionsSurvey="areAllQuestionsSurvey"
        @go-back="goToLastQuestion"
        ref="scorecard"
      ></Scorecard>
    </div>
  </div>
</template>

<script lang="ts">
import QuestionModal from "../components/Questions/QuestionModal.vue";
import Splash from "../components/Splash.vue";
import Scorecard from "../components/Scorecard.vue";
import { resetConfetti } from "@/services/Functional/Utilities";
import QuizAPIService from "../services/API/Quiz";
import { defineComponent, reactive, toRefs, computed, watch } from "vue";
import { Question, SubmittedResponse, QuizMetadata } from "../types";

export default defineComponent({
  name: "Player",
  components: {
    Splash,
    QuestionModal,
    Scorecard,
  },
  props: {
    quizId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      currentQuestionIndex: -1 as number,
      title: "Geometry Quiz" as string,
      metadata: {} as QuizMetadata,
      questions: [] as Question[],
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
    const isQuizLoaded = computed(() => state.questions.length > 0);

    watch(
      () => state.currentQuestionIndex,
      (newValue) => {
        if (newValue == state.questions.length) {
          state.isScorecardShown = true;
          if (areAllQuestionsSurvey.value) return;
          calculateScorecardMetrics();
        }
      }
    );

    function startQuiz() {
      state.currentQuestionIndex = 0;
    }

    async function getQuiz() {
      const quizDetails = await QuizAPIService.getQuiz(props.quizId);
      // since we know that there is going to be only one
      // question set for now
      const questionSet = quizDetails.question_sets[0];
      state.questions = questionSet.questions;
      state.metadata = quizDetails.metadata;

      // prepare responses
      state.questions.forEach((_) => {
        state.responses.push({
          answer: null,
        });
      });
    }

    getQuiz();

    /**
     * defines all the metrics to show in the scorecard here
     */
    const scorecardMetrics = computed(() => {
      return [
        {
          name: "Correct",
          icon: {
            source: "correct",
            class:
              "text-[#10B981] h-7 bp-360:h-8 bp-500:h-10 lg:h-11 w-8 bp-360:w-8 bp-500:w-10 md:w-10 mt-5 bp-360:mt-6 md:mt-4 lg:mt-5 my-1 lg:w-11 place-self-center",
          },
          value: state.numCorrect,
        },
        {
          name: "Wrong",
          icon: {
            source: "wrong",
            class:
              "text-red-500 h-8 bp-360:h-8 bp-500:h-10 md:h-11 w-6 bp-360:w-6 bp-500:w-6 md:w-7 lg:w-8 mt-4 mx-1 place-self-center",
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
        if (!itemDetail.graded) count += 1;
      });
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
      if (!itemDetail.graded) {
        console.log("sur", state.numCorrect);
        console.log("sur", state.numWrong);
        return;
      }
      if (
        (itemDetail.type == "single-choice" ||
          itemDetail.type == "multi-choice") &&
        userAnswer != null &&
        userAnswer.length > 0
      ) {
        const correctAnswer = itemDetail.correct_answer;
        isEqual(userAnswer, correctAnswer)
          ? (state.numCorrect += 1)
          : (state.numWrong += 1);
        console.log("mc", state.numCorrect);
        console.log("mc", state.numWrong);
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

    /**
     * remove the scorecard, display last question and remove the confetti
     */
    function goToLastQuestion() {
      state.isScorecardShown = false;
      state.currentQuestionIndex -= 1;
      state.numCorrect = 0;
      state.numWrong = 0;
      resetConfetti();
    }

    return {
      ...toRefs(state),
      isQuestionShown,
      isSplashShown,
      startQuiz,
      scorecardMetrics,
      scorecardProgress,
      numQuestionsAnswered,
      areAllQuestionsSurvey,
      goToLastQuestion,
      isQuizLoaded,
    };
  },
});
</script>
