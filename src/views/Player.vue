<template>
  <div class="h-full">
    <!-- loading spinner -->
    <div v-if="!isQuizLoaded" class="flex justify-center h-full">
      <BaseIcon
        name="spinner-solid"
        iconClass="animate-spin h-10 w-10 object-scale-down my-auto"
      />
    </div>

    <div v-else class="h-full flex flex-col">
      <Splash
        v-if="isSplashShown"
        :title="title"
        :subject="metadata.subject"
        :grade="metadata.grade"
        :isFirstSession="isFirstSession"
        :numQuestions="maxQuestionsAllowedToAttempt"
        :quizType="metadata.quiz_type"
        @start="startQuiz"
        data-test="splash"
      ></Splash>

      <OmrModal
        :questions="questions"
        class="absolute z-10"
        :class="{
          hidden: !isOmrMode,
        }"
        :quizType="metadata.quiz_type"
        :hasQuizEnded="hasQuizEnded"
        :isOmrMode="isOmrMode"
        :numQuestions="maxQuestionsAllowedToAttempt"
        :maxQuestionsAllowedToAttempt="currentMaxQuestionsAllowedToAttempt"
        :questionSetStates="questionSetStates"
        :qsetIndex="currentQsetIndex"
        :qsetIndexLimits="currentQsetIndexLimits"
        :quizTimeLimit="quizTimeLimit"
        :timeRemaining="timeRemaining"
        v-model:currentQuestionIndex="currentQuestionIndex"
        v-model:responses="responses"
        @submit-omr-question="submitOmrQuestion"
        @end-test="endTest"
        data-test="omr-modal"
        v-if="isQuestionShown && isOmrMode"
      ></OmrModal>

      <QuestionModal
        :questions="questions"
        :class="{
          hidden: isOmrMode,
        }"
        :quizType="metadata.quiz_type"
        :hasQuizEnded="hasQuizEnded"
        :numQuestions="maxQuestionsAllowedToAttempt"
        :maxQuestionsAllowedToAttempt="currentMaxQuestionsAllowedToAttempt"
        :questionSetTitle="currentQsetTitle"
        :questionSetStates="questionSetStates"
        :qsetIndexLimits="currentQsetIndexLimits"
        :quizTimeLimit="quizTimeLimit"
        :timeRemaining="timeRemaining"
        v-model:currentQuestionIndex="currentQuestionIndex"
        v-model:responses="responses"
        @submit-question="submitQuestion"
        @end-test="endTest"
        @fetch-question-bucket="fetchQuestionBucket"
        v-if="isQuestionShown && !isOmrMode"
        data-test="modal"
      ></QuestionModal>

      <Scorecard
        id="scorecardmodal"
        class="absolute z-10"
        :class="{
          hidden: !isScorecardShown,
        }"
        :result="scorecardResult"
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
import OmrModal from "../components/Omr/OmrModal.vue"
import Splash from "../components/Splash.vue";
import Scorecard from "../components/Scorecard.vue";
import { resetConfetti, isQuestionAnswerCorrect, isQuestionFetched, createQuestionBuckets } from "../services/Functional/Utilities";
import QuizAPIService from "../services/API/Quiz";
import SessionAPIService from "../services/API/Session";
import QuestionAPIService from "../services/API/Question"
import { defineComponent, reactive, toRefs, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import {
  QuizAPIResponse,
  Question,
  SubmittedResponse,
  UpdateSessionAPIPayload,
  UpdateSessionAPIResponse,
  QuizMetadata,
  submittedAnswer,
  quizTitleType,
  QuestionSet,
  QuestionSetIndexLimits,
  questionState,
  paletteItemState,
  questionSetPalette,
  TimeLimit,
  eventType
} from "../types";
import BaseIcon from "../components/UI/Icons/BaseIcon.vue";
import OrganizationAPIService from "../services/API/Organization";

export default defineComponent({
  name: "Player",
  components: {
    Splash,
    QuestionModal,
    Scorecard,
    BaseIcon,
    OmrModal
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
    const store = useStore();
    const state = reactive({
      currentQuestionIndex: -1 as number,
      title: null as quizTitleType,
      metadata: {} as QuizMetadata,
      questions: [] as Question[],
      responses: [] as SubmittedResponse[], // holds the responses to each item submitted by the viewer
      questionSets: [] as QuestionSet[],
      maxQuestionsAllowedToAttempt: 0,
      qsetCumulativeLengths: [] as number[],
      currentQsetIndex: 0,
      // currentQsetIndexLimits contain `low` and `high`
      // low: lowest questionIndex belonging to current question set,
      // high: highest questionIndex belonging to current question set
      currentQsetIndexLimits: {} as QuestionSetIndexLimits,
      quizTimeLimit: {} as TimeLimit | null,
      timeRemaining: 0,
      // whether the current session is the first for the given user-quiz pair
      // a value of null means the data has not been fetched yet
      isFirstSession: null as boolean | null,
      numCorrect: 0, // number of correctly answered questions
      numWrong: 0, // number of wrongly answered questions
      numSkipped: 0, // number of skipped questions
      marksScored: 0,
      maxMarks: 0, // maximum marks that can be scored
      isScorecardShown: false, // to show the scorecard or not
      hasQuizEnded: false, // whether the quiz has ended - only valid for quizType = assessment
      sessionId: "", // id of the session created for a user-quiz combination
    });

    OrganizationAPIService.checkAuthToken(props.apiKey).catch(() => {
      router.replace({
        name: "403",
      });
    });

    const isQuizAssessment = computed(() => (state.metadata.quiz_type == "assessment" || state.metadata.quiz_type == "omr-assessment"));

    // const isOmrMode = computed(() => state.metadata.quiz_type == "assessment" && state.metadata.omr_mode == true);
    const isOmrMode = computed(() => state.metadata.quiz_type == "omr-assessment");

    const isSplashShown = computed(() => state.currentQuestionIndex == -1);
    const numQuestions = computed(() => state.questions.length);
    const isQuestionShown = computed(() => {
      return (
        state.currentQuestionIndex >= 0 && state.currentQuestionIndex < numQuestions.value
      );
    });
    const isQuizLoaded = computed(() => numQuestions.value > 0);
    const scorecardResult = computed(() => ({
      title: isQuizAssessment.value ? "Score" : "Accuracy",
      value: scorecardResultValue.value,
    }));

    watch(
      () => state.currentQuestionIndex,
      (newValue) => {
        if (newValue == numQuestions.value) {
          state.isScorecardShown = true;
          if (!state.hasQuizEnded && !isQuizAssessment.value) {
            endTest() // send an end-quiz event for homeworks
          }
          if (!hasGradedQuestions.value) return;
          calculateScorecardMetrics();
        } else if (!state.hasQuizEnded && !state.responses[newValue].visited && !isOmrMode.value) {
          state.responses[newValue].visited = true;
          // update `visited` key seperately only if not in omr mode
          // if it is omr mode, update `visited` key along with session-answer update
          SessionAPIService.updateSessionAnswer(
            state.sessionId,
            state.currentQuestionIndex,
            {
              visited: true,
            }
          );
        }
        // the index where cumulative length first exceeds newValue
        [state.currentQsetIndex, state.currentQsetIndexLimits] = getQsetLimits(state.currentQuestionIndex);
      }
    );

    function getQsetLimits(questionIndex : number) : [number, QuestionSetIndexLimits] {
      // returns the question set index a question belongs to
      // and the limits of that question set (low and high)
      const qsetIndex = state.qsetCumulativeLengths.findIndex(
        cumulativeLength => cumulativeLength > questionIndex
      )

      const qsetIndexLimits: QuestionSetIndexLimits = { low: 0, high: 0 };
      if (qsetIndex > 0) {
        qsetIndexLimits.low = state.qsetCumulativeLengths[qsetIndex - 1]
      } else qsetIndexLimits.low = 0
      qsetIndexLimits.high = state.qsetCumulativeLengths[qsetIndex]

      return [qsetIndex, qsetIndexLimits];
    }
    async function timerUpdates() {
      if (!state.hasQuizEnded && state.currentQuestionIndex != -1) {
        const payload: UpdateSessionAPIPayload = {
          event: eventType.DUMMY_EVENT
        }
        const response: UpdateSessionAPIResponse = await SessionAPIService.updateSession(
          state.sessionId,
          payload
        );
        if (response.time_remaining == 0) {
          endTest()
        }
      }
    };
    onMounted(() => {
      window.setInterval(() => {
        timerUpdates();
      }, 38000);
    });

    async function startQuiz() {
      if (!state.hasQuizEnded) {
        let payload: UpdateSessionAPIPayload;
        if (state.isFirstSession) {
          payload = {
            event: eventType.START_QUIZ
          }
        } else {
          payload = {
            event: eventType.RESUME_QUIZ
          }
        }
        const response: UpdateSessionAPIResponse = await SessionAPIService.updateSession(
          state.sessionId,
          payload
        );
        state.timeRemaining = response.time_remaining;
        if (state.timeRemaining == 0 && isQuizAssessment.value) {
        // show results based on submitted session's answers (if any)
          endTest()
        }
      }
      state.currentQuestionIndex = 0;
    }

    async function getQuiz() {
      const quizDetails : QuizAPIResponse = await QuizAPIService.getQuiz(props.quizId);
      // since we know that there is going to be only one
      // question set for now
      state.questionSets = quizDetails.question_sets;
      const totalQuestionsInEachSet = [];
      for (const [idx, questionSet] of state.questionSets.entries()) {
        state.maxQuestionsAllowedToAttempt += questionSet.max_questions_allowed_to_attempt;
        state.questions.push(...questionSet.questions) // spread to add questions
        totalQuestionsInEachSet.push(questionSet.questions.length)
        if (idx == 0) state.qsetCumulativeLengths.push(questionSet.questions.length)
        else state.qsetCumulativeLengths.push(state.qsetCumulativeLengths[idx - 1] + questionSet.questions.length)
      }
      state.quizTimeLimit = quizDetails.time_limit;
      state.metadata = quizDetails.metadata;
      state.maxMarks =
        quizDetails.max_marks || quizDetails.num_graded_questions;
      state.title = quizDetails.title;
      createQuestionBuckets(totalQuestionsInEachSet);
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
      SessionAPIService.updateSessionAnswer(
        state.sessionId,
        state.currentQuestionIndex,
        {
          answer: itemResponse.answer,
        }
      );
    }

    function submitOmrQuestion(newQuestionIndex: number) {
      state.responses[state.currentQuestionIndex].visited = true;
      const itemResponse = state.responses[newQuestionIndex];
      SessionAPIService.updateSessionAnswer(
        state.sessionId,
        newQuestionIndex,
        {
          answer: itemResponse.answer,
          visited: itemResponse.visited,
        }
      );
    }

    function endTest() {
      if (!state.hasQuizEnded) {
        SessionAPIService.updateSession(state.sessionId, {
          event: eventType.END_QUIZ
        });
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
      if (!state.maxMarks) return null;
      return Math.max(state.marksScored / state.maxMarks, 0) * 100;
    });

    /** result to be shown in the center of the progress bar of Scorecard */
    const scorecardResultValue = computed(() => {
      if (!state.maxMarks || scorecardProgress.value == null) return null;
      if (isQuizAssessment.value) {
        return `${state.marksScored}/${state.maxMarks}`;
      }
      return `${Math.round(scorecardProgress.value)}%`;
    });

    /**
     * number of questions that have been answered
     */
    const numQuestionsAnswered = computed(() => {
      return state.numCorrect + state.numWrong;
    });

    const numNonGradedQuestions = computed(() => {
      let count = 0;
      state.questions.forEach((questionDetail) => {
        if (!questionDetail.graded) count += 1;
      });
      return count;
    });

    const numGradedQuestions = computed(
      () => state.maxQuestionsAllowedToAttempt - numNonGradedQuestions.value
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
      state.marksScored = 0;

      state.questions.forEach((questionDetail) => {
        updateQuestionMetrics(questionDetail, state.responses[index].answer);
        index += 1;
      });
    }

    function updateQuestionMetrics(
      questionDetail: Question,
      userAnswer: submittedAnswer
    ) {
      const markingScheme = questionDetail.marking_scheme;

      function updateMetricsForCorrectAnswer() {
        state.numCorrect += 1;
        // default marks for correctly answered questions = 1
        state.marksScored += markingScheme?.correct || 1;
      }

      function updateMetricsForWrongAnswer() {
        state.numWrong += 1;
        // default marks for wrongly answered questions = 0
        state.marksScored += markingScheme?.wrong || 0;
      }

      const answerEvaluation = isQuestionAnswerCorrect(questionDetail, userAnswer);
      if (!answerEvaluation.valid) {
        return;
      }
      if (answerEvaluation.answered) {
        state.numSkipped -= 1;
        if (answerEvaluation.isCorrect != null) {
          answerEvaluation.isCorrect
            ? updateMetricsForCorrectAnswer()
            : updateMetricsForWrongAnswer();
        }
      } else {
        // default marks for skipped questions = 0
        // note that optional unanswered questions come here
        // and calculation will be wrong if "skipped" has a score other than zero
        state.marksScored += markingScheme?.skipped || 0;
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

    /**
     * compute details of current question set
     */
    const currentMaxQuestionsAllowedToAttempt = computed(() => {
      return state.questionSets[state.currentQsetIndex].max_questions_allowed_to_attempt
    })

    const currentQsetTitle = computed(() => {
      return state.questionSets[state.currentQsetIndex].title
    })

    /**
     * preparing states for palette
     */
    const questionSetStates = computed(() => {
      const qsetStates = [] as questionSetPalette[]

      if (state.hasQuizEnded) {
        for (let index = 0; index < state.questionSets.length; index++) {
          const states = [] as paletteItemState[]
          let startIndex = 0
          if (index > 0) startIndex = state.qsetCumulativeLengths[index - 1]
          for (let qindex = startIndex; qindex < state.qsetCumulativeLengths[index]; qindex++) {
            const questionAnswerEvaluation = isQuestionAnswerCorrect(
              state.questions[qindex],
              state.responses[qindex].answer
            )
            if (!questionAnswerEvaluation.valid) continue
            let qstate: questionState
            if (
              !questionAnswerEvaluation.answered ||
              questionAnswerEvaluation.isCorrect == null
            ) {
              qstate = "neutral"
            } else {
              questionAnswerEvaluation.isCorrect
                ? (qstate = "success")
                : (qstate = "error")
            }
            states.push({
              index: qindex,
              value: qstate
            })
          }
          let paletteInstructionText: string = "";
          if (state.questionSets[index].max_questions_allowed_to_attempt < state.questionSets[index].questions.length) {
            paletteInstructionText = `You may attempt only up to ${state.questionSets[index].max_questions_allowed_to_attempt} questions in this section.`
          } else {
            paletteInstructionText = `You may attempt all questions in this section.`
          }
          qsetStates.push({
            title: state.questionSets[index].title,
            paletteItems: states,
            instructionText: paletteInstructionText,
            maxQuestionsAllowedToAttempt: state.questionSets[index].max_questions_allowed_to_attempt
          })
        }
      } else {
        for (let index = 0; index < state.questionSets.length; index++) {
          const states = [] as paletteItemState[]
          let startIndex = 0
          if (index > 0) startIndex = state.qsetCumulativeLengths[index - 1]
          for (let qindex = startIndex; qindex < state.qsetCumulativeLengths[index]; qindex++) {
            if (!state.questions[qindex].graded) continue
            let qstate: questionState
            if (!state.responses[qindex].visited) {
              qstate = "neutral"
            } else {
              if (state.responses[qindex].answer != null) qstate = "success"
              else qstate = "error"
            }
            states.push({
              index: qindex,
              value: qstate
            })
          }
          let paletteInstructionText: string = "";
          if (state.questionSets[index].max_questions_allowed_to_attempt < state.questionSets[index].questions.length) {
            paletteInstructionText = `You may attempt only up to ${state.questionSets[index].max_questions_allowed_to_attempt} questions in this section.`
          } else {
            paletteInstructionText = `You may attempt all questions in this section.`
          }
          qsetStates.push({
            title: state.questionSets[index].title,
            paletteItems: states,
            instructionText: paletteInstructionText,
            maxQuestionsAllowedToAttempt: state.questionSets[index].max_questions_allowed_to_attempt
          })
        }
      }

      return qsetStates
    })

    async function fetchQuestionBucket(questionIndex: number) {
      const qsetIndex = state.qsetCumulativeLengths.findIndex(
        cumulativeLength => cumulativeLength > questionIndex
      )
      let questionIndexInSet = questionIndex;
      if (qsetIndex != 0) questionIndexInSet = questionIndex - state.qsetCumulativeLengths[qsetIndex - 1];
      if (!isQuestionFetched(qsetIndex, questionIndexInSet)) {
        const bucketToFetch = Math.floor(questionIndexInSet / store.state.bucketSize)
        const bucketStartIndex = store.state.questionBucketingMaps[qsetIndex][bucketToFetch].start
        const bucketEndIndex = store.state.questionBucketingMaps[qsetIndex][bucketToFetch].end

        const fetchedQuestions = await QuestionAPIService.getQuestions(
          state.questions[questionIndex].question_set_id,
          bucketStartIndex,
          store.state.bucketSize
        )

        for (let i = bucketStartIndex; i <= bucketEndIndex; i++) {
          let globalQuestionIndex = i
          if (qsetIndex != 0) globalQuestionIndex = i + state.qsetCumulativeLengths[qsetIndex - 1]
          state.questions[globalQuestionIndex] = fetchedQuestions[i - bucketStartIndex]
        }

        store.dispatch("updateBucketFetchedStatus", {
          qsetIndex,
          bucketIndex: bucketToFetch,
          fetchedStatus: true,
        })
      }
    }

    return {
      ...toRefs(state),
      isQuestionShown,
      isSplashShown,
      isQuizAssessment,
      scorecardMetrics,
      scorecardProgress,
      numQuestionsAnswered,
      hasGradedQuestions,
      isQuizLoaded,
      scorecardResult,
      startQuiz,
      getQsetLimits,
      submitQuestion,
      submitOmrQuestion,
      goToPreviousQuestion,
      endTest,
      currentMaxQuestionsAllowedToAttempt,
      currentQsetTitle,
      questionSetStates,
      fetchQuestionBucket,
      timerUpdates,
      isOmrMode
    };
  },
});
</script>
