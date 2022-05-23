<template>
  <div class="h-screen">
    <!-- loading spinner -->
    <div v-if="!isQuizLoaded" class="flex justify-center h-full">
      <BaseIcon
        name="spinner-solid"
        iconClass="animate-spin h-10 w-10 object-scale-down my-auto"
      />
    </div>

    <div v-else class="h-full">
      <Splash
        v-if="isSplashShown"
        :title="title"
        :subject="metadata.subject"
        :grade="metadata.grade"
        :isFirstSession="isFirstSession"
        :numQuestions="questions.length"
        :quizType="metadata.quiz_type"
        @start="startQuiz"
        data-test="splash"
      ></Splash>

      <QuestionModal
        :questions="questions"
        :quizType="metadata.quiz_type"
        :hasQuizEnded="hasQuizEnded"
        v-model:currentQuestionIndex="currentQuestionIndex"
        v-model:responses="responses"
        @submit-question="submitQuestion"
        @end-test="endTest"
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
        :hasGradedQuestions="hasGradedQuestions"
        @go-back="goToPreviousQuestion"
        data-test="scorecard"
      ></Scorecard>
    </div>
  </div>
</template>

<script lang="ts">
import QuestionModal from "../components/Questions/QuestionModal.vue";
import Splash from "../components/Splash.vue";
import Scorecard from "../components/Scorecard.vue";
import { resetConfetti, isQuestionAnswerCorrect } from "../services/Functional/Utilities";
import QuizAPIService from "../services/API/Quiz";
import SessionAPIService from "../services/API/Session";
import { defineComponent, reactive, toRefs, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Question, SubmittedResponse, QuizMetadata, submittedAnswer } from "../types";
import BaseIcon from "../components/UI/Icons/BaseIcon.vue";
import OrgAPIService from "../services/API/Organization";

export default defineComponent({
  name: "Player",
  components: {
    Splash,
    QuestionModal,
    Scorecard,
    BaseIcon,
  },
  props: {
    quizId: {
      type: String,
      required: true,
    },
    userId: {
      default: null,
      type: String,
    },
    apiKey: {
      default: null,
      type: String,
    },
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();

    const state = reactive({
      currentQuestionIndex: -1 as number,
      title: "Geometry Quiz" as string,
      metadata: {} as QuizMetadata,
      questions: [] as Question[],
      responses: [] as SubmittedResponse[], // holds the responses to each item submitted by the viewer
      // whether the current session is the first for the given user-quiz pair
      // a value of null means the data has not been fetched yet
      isFirstSession: null as boolean | null,
      numCorrect: 0, // number of correctly answered questions
      numWrong: 0, // number of wrongly answered questions
      numSkipped: 0, // number of skipped questions
      isScorecardShown: false, // to show the scorecard or not
      hasQuizEnded: false, // whether the quiz has ended - only valid for quizType = assessment
      sessionId: "", // id of the session created for a user-quiz combination
    });

    OrgAPIService.checkAuthToken(props.apiKey).catch(() => {
      router.replace({
        name: "403",
      });
    });

    const isQuizAssessment = computed(() => state.metadata.quiz_type == "assessment");

    const isSplashShown = computed(() => state.currentQuestionIndex == -1);
    const numQuestions = computed(() => state.questions.length);
    const isQuestionShown = computed(() => {
      return (
        state.currentQuestionIndex >= 0 && state.currentQuestionIndex < numQuestions.value
      );
    });
    const isQuizLoaded = computed(() => numQuestions.value > 0);

    watch(
      () => state.currentQuestionIndex,
      (newValue) => {
        if (newValue == numQuestions.value) {
          state.isScorecardShown = true;
          if (!hasGradedQuestions.value) return;
          calculateScorecardMetrics();
        } else if (!state.responses[newValue].visited) {
          state.responses[newValue].visited = true;
          SessionAPIService.updateSessionAnswer(
            state.responses[state.currentQuestionIndex]._id,
            {
              visited: true,
            }
          );
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
    }

    async function createSession() {
      const sessionDetails = await SessionAPIService.createSession(
        props.quizId,
        route.query.userId as string
      );
      state.sessionId = sessionDetails._id;
      state.responses = sessionDetails.session_answers;
      state.isFirstSession = sessionDetails.is_first;
      state.hasQuizEnded = sessionDetails.has_quiz_ended || false;
    }

    async function getQuizCreateSession() {
      await getQuiz();
      await createSession();
    }

    /** updates the session answer once a response is submitted */
    function submitQuestion() {
      const itemResponse = state.responses[state.currentQuestionIndex];
      SessionAPIService.updateSessionAnswer(itemResponse._id, {
        answer: itemResponse.answer,
      });
    }

    function endTest() {
      if (!state.hasQuizEnded) {
        SessionAPIService.updateSession(state.sessionId, true);
        state.hasQuizEnded = true;
      }
    }

    getQuizCreateSession();

    /**
     * defines all the metrics to show in the scorecard here
     */
    const scorecardMetrics = computed(() => {
      const metrics = [
        {
          name: "Correct",
          icon: {
            source: "correct",
            class:
              "text-[#10B981] h-8 bp-500:h-10 lg:h-12 w-8 bp-500:w-10 lg:w-12 place-self-center flex justify-center",
          },
          value: state.numCorrect,
        },
        {
          name: "Wrong",
          icon: {
            source: "wrong",
            class:
              "text-red-500 h-8 bp-500:h-10 lg:h-12 w-6 bp-500:w-8 lg:w-10 place-self-center flex justify-center",
          },
          value: state.numWrong,
        },
      ];

      if (isQuizAssessment.value) {
        metrics.push({
          name: "Skipped",
          icon: {
            source: "skip",
            class:
              "h-10 bp-500:h-12 lg:h-14 w-8 bp-500:w-10 lg:w-12 place-self-center flex justify-center",
          },
          value: state.numSkipped,
        });
      }

      return metrics;
    });

    /**
     * progress value (0-100) to be passed to the Scorecard component
     */
    const scorecardProgress = computed(() => {
      if (!numQuestionsAnswered.value) return 0;
      return (state.numCorrect / numQuestionsAnswered.value) * 100;
    });

    /**
     * number of questions that have been answered
     */
    const numQuestionsAnswered = computed(() => {
      return state.numCorrect + state.numWrong;
    });

    const numNonGradedQuestions = computed(() => {
      let count = 0;
      state.questions.forEach((itemDetail) => {
        if (!itemDetail.graded) count += 1;
      });
      return count;
    });

    const numGradedQuestions = computed(
      () => numQuestions.value - numNonGradedQuestions.value
    );

    const hasGradedQuestions = computed(() => {
      return numNonGradedQuestions.value != numQuestions.value;
    });

    function calculateScorecardMetrics() {
      let index = 0;

      // set initial values
      state.numSkipped = numGradedQuestions.value;
      state.numCorrect = 0;
      state.numWrong = 0;

      state.questions.forEach((itemDetail) => {
        updateNumCorrectWrongSkipped(itemDetail, state.responses[index].answer);
        index += 1;
      });
    }

    function updateNumCorrectWrongSkipped(
      itemDetail: Question,
      userAnswer: submittedAnswer
    ) {
      const answerEvaluation = isQuestionAnswerCorrect(itemDetail, userAnswer);
      if (!answerEvaluation.valid) {
        return;
      }
      if (answerEvaluation.answered) {
        state.numSkipped -= 1;

        if (answerEvaluation.isCorrect != null) {
          answerEvaluation.isCorrect ? (state.numCorrect += 1) : (state.numWrong += 1);
        }
      }
    }

    /**
     * remove the scorecard, display previous question and remove the confetti
     */
    function goToPreviousQuestion() {
      state.isScorecardShown = false;
      state.currentQuestionIndex -= 1;
      resetConfetti();
    }

    return {
      ...toRefs(state),
      isQuestionShown,
      isSplashShown,
      scorecardMetrics,
      scorecardProgress,
      numQuestionsAnswered,
      hasGradedQuestions,
      isQuizLoaded,
      startQuiz,
      submitQuestion,
      goToPreviousQuestion,
      endTest,
    };
  },
});
</script>
