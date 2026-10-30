<template>
  <div class="h-full">
    <!-- Initial loading spinner. Same neutral white + centred spinner as the in-flow
         transition overlay below, so every gap in the test <-> survey <-> scorecard flow
         (first load and each page hop) shows one consistent loader with no splash/blank flash. -->
    <div
      v-if="!isQuizLoaded"
      class="flex items-center justify-center h-full bg-white"
    >
      <BaseIcon
        name="spinner-solid"
        iconClass="animate-spin h-10 w-10 object-scale-down text-gray-600"
      />
    </div>

    <div v-else class="h-full flex flex-col">
      <icon-button
        v-if="shouldShowOmrToggle"
        :titleConfig="toggleButtonTextConfig"
        :iconConfig="toggleButtonIconConfig"
        :buttonClass="toggleButtonIconClass"
        class="rounded-2xl shadow-lg mt-5 place-self-center"
        data-test="toggleOmrMode"
        @click="toggleOmrMode"
      ></icon-button>

      <Splash
        v-if="isSplashShown && (!autoStart || autoStartFailed)"
        :title="title"
        :subject="metadata.subject"
        :grade="metadata.grade"
        :isFirstSession="isFirstSession"
        :hasQuizEnded="hasQuizEnded"
        :reviewAnswers="reviewAnswers"
        :sessionEndTimeText="sessionEndTimeText"
        :numQuestions="maxQuestionsAllowedToAttempt"
        :numConditionalQuestions="numConditionalQuestions"
        :quizType="computedQuizType"
        :quizTimeLimit="quizTimeLimit"
        :maxMarks="maxMarks"
        :maxQuestionsAllowedToAttempt="numGradedQuestions"
        :testFormat="metadata.test_format || ''"
        :displaySolution="displaySolution"
        :questions="questions"
        :questionSetStates="questionSetStates"
        @start="startQuiz"
        data-test="splash"
      ></Splash>

      <SinglePageModal
        :questions="questions"
        class="absolute z-10"
        :class="{
          hidden: !isOmrMode && !isSinglePageMode,
        }"
        :quizType="metadata.quiz_type"
        :questionLabels="questionLabels"
        :hasQuizEnded="hasQuizEnded"
        :numQuestions="maxQuestionsAllowedToAttempt"
        :maxQuestionsAllowedToAttempt="currentMaxQuestionsAllowedToAttempt"
        :questionSetStates="questionSetStates"
        :qsetIndex="currentQsetIndex"
        :qsetIndexLimits="currentQsetIndexLimits"
        :quizTimeLimit="quizTimeLimit"
        :isSessionAnswerRequestProcessing="isSessionAnswerRequestProcessing"
        :userId="userId"
        :displayId="displayId"
        :title="title"
        :subject="metadata.subject"
        :testFormat="metadata.test_format || ''"
        :singlePageHeaderText="singlePageHeaderText"
        :timeRemaining="timeRemaining"
        :maxMarks="maxMarks"
        :showFullText="showFullText"
        :displaySolution="displaySolution"
        :areAllQuestionsRequired="areAllQuestionsRequired"
        v-model:currentQuestionIndex="currentQuestionIndex"
        v-model:responses="responses"
        v-model:previousOmrResponses="previousOmrResponses"
        @submit-omr-question="submitOmrQuestion"
        @end-test="endTest"
        data-test="single-page-modal"
        v-if="isQuestionShown && (isOmrMode || isSinglePageMode)"
      ></SinglePageModal>

      <QuestionModal
        :questions="questions"
        :class="{
          hidden: isOmrMode || isSinglePageMode,
        }"
        :quizType="metadata.quiz_type"
        :hasQuizEnded="hasQuizEnded"
        :numQuestions="maxQuestionsAllowedToAttempt"
        :maxQuestionsAllowedToAttempt="currentMaxQuestionsAllowedToAttempt"
        :questionSetTitle="currentQsetTitle"
        :questionSetStates="questionSetStates"
        :qsetIndexLimits="currentQsetIndexLimits"
        :quizTimeLimit="quizTimeLimit"
        :isSessionAnswerRequestProcessing="isSessionAnswerRequestProcessing"
        :continueAfterAnswerSubmit="continueAfterAnswerSubmit"
        :timeRemaining="timeRemaining"
        :displaySolution="displaySolution"
        :userId="userId"
        :displayId="displayId"
        :title="title"
        :subject="metadata.subject"
        :testFormat="metadata.test_format || ''"
        :maxMarks="maxMarks"
        :questionOrder="questionOrder"
        :areAllQuestionsRequired="areAllQuestionsRequired"
        v-model:shuffledQuestionIndex="shuffledQuestionIndex"
        v-model:currentQuestionIndex="currentQuestionIndex"
        v-model:responses="responses"
        v-model:previousResponse="previousResponse"
        @submit-question="submitQuestion"
        @update-review-status="updateQuestionResponse"
        @end-test="endTest"
        @fetch-question-bucket="fetchQuestionBucket"
        v-if="isQuestionShown && !isOmrMode && !isSinglePageMode"
        data-test="modal"
      ></QuestionModal>

      <div
        v-if="isComputingScore"
        class="absolute inset-0 z-20 flex items-center justify-center bg-white/80"
      >
        <div class="flex flex-col items-center space-y-3">
          <BaseIcon
            name="spinner-solid"
            iconClass="animate-spin h-10 w-10 text-gray-600"
          />
          <div class="text-base font-semibold text-gray-700">
            Computing your scores...
          </div>
        </div>
      </div>

      <!-- One consistent overlay for every hop of the test <-> survey <-> scorecard flow, so no
           splash or blank frame flashes between full-page navigations. Covers: ending the test
           and redirecting into the survey, returning from the survey, and landing straight on
           the scorecard. The message reassures only after a survey submit; otherwise it's a
           quiet spinner. -->
      <div
        v-if="isTransitioning"
        class="absolute inset-0 z-20 flex items-center justify-center bg-white"
      >
        <div class="flex flex-col items-center space-y-3">
          <BaseIcon
            name="spinner-solid"
            iconClass="animate-spin h-10 w-10 text-gray-600"
          />
          <div
            v-if="isRedirectingAfterSurvey"
            class="text-base font-semibold text-gray-700"
          >
            Saving your responses...
          </div>
        </div>
      </div>

      <Scorecard
        id="scorecardmodal"
        class="absolute z-10"
        :class="{
          hidden: !isScorecardShown,
        }"
        :result="scorecardResult"
        :showScores="showScores"
        :quizType="metadata.quiz_type"
        :metrics="scorecardMetrics"
        :progressPercentage="scorecardProgress"
        :qsetMetrics="qsetMetrics"
        :isShown="isScorecardShown"
        :title="title"
        :userId="userId"
        :displayId="displayId"
        :greeting="scorecardGreeting"
        :numQuestionsAnswered="numQuestionsAnswered"
        :hasGradedQuestions="hasGradedQuestions"
        :reviewAnswers="reviewAnswers"
        :nextStepUrl="scorecardNextStepUrl"
        :nextStepText="nextStepButtonText"
        @go-back="goToPreviousQuestion"
        data-test="scorecard"
      ></Scorecard>
    </div>
  </div>
</template>

<script lang="ts">
import QuestionModal from "../components/Questions/QuestionModal.vue";
import SinglePageModal from "../components/SinglePage/SinglePageModal.vue"
import Splash from "../components/Splash.vue";
import Scorecard from "../components/Scorecard.vue";
import { resetConfetti, isQuestionAnswerCorrect, isQuestionFetched, createQuestionBuckets, isQuestionResponseComplete, computeQuestionVisibility, computeQuestionLabels, answerToSubmit, shouldForceSinglePageMode } from "../services/Functional/Utilities";
import QuizAPIService from "../services/API/Quiz";
import FormAPIService from "../services/API/Form";
import SessionAPIService from "../services/API/Session";
import QuestionAPIService from "../services/API/Question"
import { defineComponent, reactive, toRefs, computed, watch, onMounted, PropType } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  QuizAPIResponse,
  Question,
  SubmittedResponse,
  UpdateSessionAPIPayload,
  QuizMetadata,
  quizTitleType,
  QuestionSet,
  QuestionSetIndexLimits,
  questionState,
  paletteItemState,
  questionSetPalette,
  TimeLimit,
  eventType,
  TimeSpentEntry,
  UpdateSessionAnswerAPIPayload,
  UpdateSessionAnswersAtSpecificPositionsAPIPayload,
  QuestionSetMetric,
  QuestionSetMetricPayload,
  SessionMetricsPayload,
  DisplayIdType
} from "../types";
import { useToast, POSITION } from "vue-toastification"
import BaseIcon from "../components/UI/Icons/BaseIcon.vue";
import IconButton from "../components/UI/Buttons/IconButton.vue";
import OrganizationAPIService from "../services/API/Organization";

export default defineComponent({
  name: "Player",
  components: {
    IconButton,
    Splash,
    QuestionModal,
    Scorecard,
    BaseIcon,
    SinglePageModal
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
    displayId: {
      type: String,
      default: "",
    },
    displayIdType: {
      type: String as PropType<DisplayIdType>,
      default: null,
    },
    apiKey: {
      default: null,
      type: String,
    },
    omrMode: {
      default: false,
      type: Boolean
    },
    singlePageMode: {
      default: false,
      type: Boolean
    },
    autoStart: {
      default: false,
      type: Boolean
    },
    // Set by ?landing=scorecard, used when a chained survey redirects the student back to
    // their test: boot the already-ended session straight onto the scorecard (no splash).
    landingScorecard: {
      default: false,
      type: Boolean
    },
    // Set by ?return_to=<test id>. On a before-scores survey this is the test the survey must
    // send the student back to, substituted into the survey's next_step_url as {return_to}.
    landingReturnTo: {
      default: null,
      type: String
    }
  },
  setup(props) {
    const router = useRouter();
    const store = useStore();
    const state = reactive({
      currentQuestionIndex: -1 as number,
      shuffledQuestionIndex: -1 as number,
      title: null as quizTitleType,
      metadata: {} as QuizMetadata,
      questions: [] as Question[],
      questionOrder: [] as number[],
      responses: [] as SubmittedResponse[], // holds the responses to each item submitted by the viewer
      previousResponse: {} as SubmittedResponse, // holds previous respnose for question being submitted
      previousOmrResponses: [] as SubmittedResponse[],
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
      autoStartFailed: false, // show splash if auto-start couldn't begin
      numCorrect: 0, // number of correctly answered questions
      numWrong: 0, // number of wrongly answered questions
      numPartiallyCorrect: 0, // number of partially correct questions
      numSkipped: 0, // number of skipped questions
      numMarkedForReview: 0, // number of questions marked for review
      marksScored: 0,
      maxMarks: 0, // maximum marks that can be scored
      isScorecardShown: false, // to show the scorecard or not
      // True once the end-of-test gate has decided to redirect into the survey, so the brief
      // window before navigation completes doesn't flash the scorecard underneath.
      isScorecardRedirectingToSurvey: false,
      // True when the student has already submitted the post-test survey. Used to suppress the
      // scorecard's next-step CTA/countdown so a later visit to the test (e.g. "Review quiz",
      // without ?landing=scorecard) never offers to send them back into a survey they've done.
      hasCompletedSurvey: false,
      // True after a survey (a form with a next_step) is submitted, while we redirect the
      // student to their score — shows a "Saving your responses..." overlay instead of the
      // form's own thank-you scorecard.
      isRedirectingAfterSurvey: false,
      isComputingScore: false, // whether score computation is in progress
      hasSessionMetrics: false, // whether session metrics have been loaded
      hasQuizEnded: false, // whether the quiz has ended - only valid for quizType = assessment
      reviewAnswers: true, // whether users can review answers once quiz has ended
      quizLoadedWithAnswers: false, // whether last quiz fetch included correct_answer/solution
      displaySolution: true as boolean, // whether solutions to each question should be displayed
      showScores: true as boolean, // whether we should show scores after quiz has ended
      requireAllQuestions: false as boolean,
      sessionEndTimeText: "", // session end time in text if available
      sessionId: "", // id of the session created for a user-quiz combination
      isSessionAnswerRequestProcessing: false, // whether session answer api request is processing
      continueAfterAnswerSubmit: true as boolean, // do we continue after submitting answer
      timeSpentOnQuestion: [] as TimeSpentEntry[], // stores time spent on each question
      timerInterval: null as number | null, // variable used in computing time spent on question
      qsetMetrics: [] as QuestionSetMetric[],
      // set when a form with conditional questions was opened without ?singlePageMode=true
      // (see shouldForceSinglePageMode)
      forceSinglePage: false,
      toast: useToast(),
    });

    OrganizationAPIService.checkAuthToken(props.apiKey).catch(() => {
      router.replace({
        name: "403",
      });
    });

    const isQuizAssessment = computed(() => (state.metadata.quiz_type == "assessment" || state.metadata.quiz_type == "omr-assessment"));

    const isOmrMode = computed(() => {
      // homework should never use OMR mode
      if (state.metadata.quiz_type == "homework") return false;
      return props.omrMode || state.metadata.quiz_type == "omr-assessment";
    });

    const isFormQuiz = computed(() => state.metadata.quiz_type == "form");

    const areAllQuestionsRequired = computed(() => isFormQuiz.value && state.requireAllQuestions);

    // single-page mode from the URL, or forced for a form with conditional questions
    const isSinglePageMode = computed(() => props.singlePageMode || state.forceSinglePage);

    const showFullText = computed(() => !isOmrMode.value && isSinglePageMode.value);

    const singlePageHeaderText = computed(() => {
      if (!isSinglePageMode.value) return "";
      const header = state.metadata?.single_page_header_text?.trim();
      return header || "";
    });

    const computedQuizType = computed(() => {
      if (isFormQuiz.value) return "form";
      if (isQuizAssessment.value == false) return "homework";
      return isOmrMode.value ? "omr-assessment" : "assessment";
    });

    function displayIndexForQuestionPosition(positionIndex: number) {
      if (isOmrMode.value) return positionIndex;
      const displayIndex = state.questionOrder.indexOf(positionIndex);
      return displayIndex == -1 ? positionIndex : displayIndex;
    }

    function navigateToIncompleteQuestion(positionIndex: number) {
      const displayIndex = displayIndexForQuestionPosition(positionIndex);
      state.currentQuestionIndex = displayIndex;
    }

    // The number the student sees for a question: the single-page view shows questions by
    // position under their label; the question-by-question view numbers them in shuffled order.
    function questionLabelForPosition(positionIndex: number) {
      if (isOmrMode.value || isSinglePageMode.value) return questionLabels.value[positionIndex];
      return String(displayIndexForQuestionPosition(positionIndex) + 1);
    }

    function showIncompleteRequiredQuestionWarning(positionIndex: number) {
      state.toast.warning(
        `Please answer all required questions before submitting. Question ${questionLabelForPosition(positionIndex)} is incomplete.`,
        {
          position: POSITION.TOP_CENTER,
          timeout: 7000,
          draggablePercent: 0.4
        }
      );
      navigateToIncompleteQuestion(positionIndex);
    }

    // const shouldShowOmrToggle = computed(() => state.metadata.quiz_type == "assessment")
    const shouldShowOmrToggle = computed(() => false)

    const toggleButtonTextConfig = computed(() => {
      const config = {
        value: "",
        class: ["text-orange-500 underline underline-offset-8", "text-base md:text-lg lg:text-xl font-semibold"],
      };

      if (isOmrMode.value) {
        config.value = "Switch to Assessment Mode";
      } else {
        config.value = "Switch to OMR Mode";
      }

      return config;
    });

    const toggleButtonIconClass = computed(() => {
      const iconClass = [
        "border border-orange-300",
        "bg-transparent hover:bg-gray-100",
        "rounded-lg shadow-sm px-6 py-3",
        "flex items-center justify-center",
        "transition-all duration-200 ease-in-out"
      ]

      return iconClass;
    });

    const toggleButtonIconConfig = computed(() => {
      return {
        enabled: true,
        iconName: isOmrMode.value ? "check-circle-solid" : "sync-alt-solid",
        iconClass: "h-4 w-4 text-white",
      };
    });

    const toDifficultyLabel = (d: string | number | null | undefined) => {
      if (d == '1' || d == 1) return 'Easy';
      if (d == '2' || d == 2) return 'Medium';
      if (d == '3' || d == 3) return 'Hard';
      return null;
    };
    const toDifficultyBadgeClass = (label: string | null) => {
      if (label === 'Easy') return 'bg-green-400 text-white text-xs font-bold py-0.5 px-2 rounded-full';
      if (label === 'Medium') return 'bg-amber-400 text-white text-xs font-bold py-0.5 px-2 rounded-full';
      if (label === 'Hard') return 'bg-rose-400 text-white text-xs font-bold py-0.5 px-2 rounded-full';
      return '';
    };

    // True during any cross-page hop of the test <-> survey <-> scorecard flow, where the
    // page is mounted but its real view (survey / scorecard) hasn't settled yet. Used to keep
    // the splash from flashing underneath and to show one consistent "please wait" overlay.
    const isTransitioning = computed(
      () =>
        state.isScorecardRedirectingToSurvey ||
        state.isRedirectingAfterSurvey ||
        // Landing straight on the scorecard (?landing=scorecard): from the first paint until
        // the scorecard shows, keep the overlay up so the splash never flashes underneath.
        // This starts true on mount (before the session even loads), which is exactly the
        // window the splash used to leak into on refresh.
        (props.landingScorecard && !state.isScorecardShown)
    );
    const isSplashShown = computed(
      () =>
        state.currentQuestionIndex == -1 &&
        !isTransitioning.value &&
        // Belt-and-suspenders: the splash must never show on a landing-scorecard load.
        !props.landingScorecard
    );
    const numQuestions = computed(() => state.questions.length);
    // Visibility of each question by flat position, derived from current answers. Reactive on
    // state.responses, so resume re-derives it for free. Questions with no display_condition
    // are always visible, so non-conditional quizzes/forms are unaffected.
    const questionVisibility = computed(() =>
      computeQuestionVisibility(
        state.questions,
        state.responses.map((response) => response?.answer ?? null),
        state.metadata.quiz_type
      )
    );
    // Number shown for each question by flat position (follow-ups under their trigger, e.g.
    // "2a"). Single-page header and warnings all read it; display only.
    const questionLabels = computed(() =>
      computeQuestionLabels(state.questions, state.metadata.quiz_type)
    );
    // Questions a form may hide (display_condition is form-only, like the evaluator), for the
    // splash's "min–max questions" range.
    const numConditionalQuestions = computed(() =>
      isFormQuiz.value
        ? state.questions.filter((question) => question.display_condition != null).length
        : 0
    );
    const isQuestionShown = computed(() => {
      return (
        state.currentQuestionIndex >= 0 && state.currentQuestionIndex < numQuestions.value
      );
    });
    const isQuizLoaded = computed(() => numQuestions.value > 0);
    const scorecardResult = computed(() => ({
      title: isQuizAssessment.value ? "Score" : "Score %",
      value: scorecardResultValue.value,
    }));

    function toggleOmrMode() {
      const url = new URL(window.location.href);

      if (url.searchParams.has("omrMode")) {
        url.searchParams.delete("omrMode");
      } else {
        url.searchParams.set("omrMode", "true");
      }

      window.location.href = url.toString();
    }

    function starttimeSpentOnQuestionCalc() {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }

      // Track time silently for forms as well (no visible timer)
      // so that backend can store per-question durations.
      // We still skip for OMR mode which has no reliable per-question timing.

      state.timerInterval = setInterval(() => {
        if (!isOmrMode.value && state.currentQuestionIndex >= 0 && state.currentQuestionIndex < numQuestions.value && !state.isSessionAnswerRequestProcessing) {
          state.timeSpentOnQuestion[state.shuffledQuestionIndex].timeSpent += 1;
          state.timeSpentOnQuestion[state.shuffledQuestionIndex].hasSynced = false;
        }
      }, 1000);
    }

    function stoptimeSpentOnQuestionCalc() {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
      }
    }

    async function ensureHomeworkRevealLoaded(positionIndex: number) {
      if (state.metadata?.quiz_type !== "homework") return;
      if (positionIndex < 0 || positionIndex >= state.responses.length) return;
      const response = state.responses[positionIndex];
      if (response?.answer == null) return; // only after submit

      const question = state.questions[positionIndex];
      // Base /quiz payload hides correct_answer for homework; after resume we need to re-fetch
      // revealed answers for already-submitted questions so UI can render correctness safely.
      if (question?.correct_answer != null) return;

      const reveal = await SessionAPIService.revealAnswer(
        state.sessionId,
        positionIndex
      );
      if (reveal.status === 200 && reveal.data) {
        state.questions[positionIndex].correct_answer = reveal.data.correct_answer;
        state.questions[positionIndex].solution = reveal.data.solution;
      }
    }

    watch(
      () => state.currentQuestionIndex,
      async (newValue, oldValue) => {
        stoptimeSpentOnQuestionCalc();
        let shuffledOldValue = oldValue;
        let shuffledNewValue = newValue

        if (!isOmrMode.value) {
          if (oldValue != -1) shuffledOldValue = state.questionOrder[oldValue]
          else shuffledOldValue = -1
          if (newValue != -1) shuffledNewValue = state.questionOrder[newValue]
          else shuffledNewValue = -1
        }
        if (shuffledNewValue != -1) state.shuffledQuestionIndex = shuffledNewValue;
        if (!state.hasQuizEnded && (isQuizAssessment.value || isFormQuiz.value) && !isOmrMode.value && shuffledOldValue != -1) {
          // update time spent for previous question in assessment
          // but not for homework
          SessionAPIService.updateSessionAnswer(
            state.sessionId,
            shuffledOldValue,
            {
              time_spent: state.timeSpentOnQuestion[shuffledOldValue].timeSpent
            }
          )
          state.timeSpentOnQuestion[shuffledOldValue].hasSynced = true;
        }
        if (newValue == numQuestions.value) {
          if (!state.hasQuizEnded && (!isQuizAssessment.value || isFormQuiz.value)) {
            await endTest() // send an end-quiz event for homeworks and forms
          }
          // revealScorecardOrSurvey() (called by endTest) may redirect a gated test into its
          // survey, in which case the page is navigating away and we skip showing the scorecard.
          if (state.hasQuizEnded && !state.isScorecardRedirectingToSurvey) {
            // Always show the scorecard screen after quiz ends; content will hide scores if needed.
            state.isScorecardShown = true;
            if (!state.hasSessionMetrics && !state.isComputingScore) {
              state.isComputingScore = true;
              const fetchedMetrics = await fetchSessionMetricsWithRetry();
              if (!fetchedMetrics) {
                state.toast.error(
                  'Score computation is taking longer than expected. Please open the scorecard again after a few seconds.',
                  {
                    position: POSITION.TOP_LEFT,
                    timeout: 8000,
                    draggablePercent: 0.4
                  }
                );
              }
              state.isComputingScore = false;
            }
          }
        } else if (shuffledNewValue != -1 && !state.hasQuizEnded) {
          // Homework: if this question was already submitted (resume flow), fetch reveal payload
          // so correctness/solutions can render correctly.
          await ensureHomeworkRevealLoaded(shuffledNewValue);

          if (!state.responses[shuffledNewValue].visited) {
            // if not visited yet
            starttimeSpentOnQuestionCalc(); // for homework and assessment
            state.responses[shuffledNewValue].visited = true;
            SessionAPIService.updateSessionAnswer(
              state.sessionId,
              shuffledNewValue,
              {
                visited: true,
              }
            );
          } else {
            // for assessment, run the timer even if question was visited earlier
            if (isQuizAssessment.value) {
              starttimeSpentOnQuestionCalc();
            }

            // for homework, run the timer if question is visited but not submitted
            if (!isQuizAssessment.value && state.responses[shuffledNewValue].answer == null) {
              starttimeSpentOnQuestionCalc();
            }
          }
        }
        // the index where cumulative length first exceeds newValue
        [state.currentQsetIndex, state.currentQsetIndexLimits] = getQsetLimits(state.currentQuestionIndex);
      }
    );

    function getQsetLimits(questionIndex : number) : [number, QuestionSetIndexLimits] {
      // returns the question set index a question belongs to
      // and the limits of that question set (low and high)
      let qsetIndex = state.qsetCumulativeLengths.findIndex(
        cumulativeLength => cumulativeLength > questionIndex
      )

      const qsetIndexLimits: QuestionSetIndexLimits = { low: 0, high: 0 };
      if (qsetIndex > 0) {
        qsetIndexLimits.low = state.qsetCumulativeLengths[qsetIndex - 1]
      } else qsetIndexLimits.low = 0
      qsetIndexLimits.high = state.qsetCumulativeLengths[qsetIndex]

      if (qsetIndex == -1) qsetIndex = 0; // set to default question set index

      return [qsetIndex, qsetIndexLimits];
    }

    async function timerUpdates() {
      if (!state.hasQuizEnded && state.currentQuestionIndex != -1) {
        const payload: UpdateSessionAPIPayload = {
          event: eventType.DUMMY_EVENT
        }

        // Fold the periodic time-spent sync into the SAME request as the dummy event, so the
        // 20s heartbeat is a single API call + single backend write instead of two.
        // Collect per-question time_spent for entries not yet synced.
        // (OMR mode has no reliable per-question timing, so it sends the event only.)
        // useful when network is off or window is closed midway during a question
        // Remember the exact time_spent we send per position. The 1s timer keeps incrementing
        // the current question while this request is in flight, so we compare after the
        // response and only mark a position synced if it hasn't advanced — otherwise those
        // mid-flight seconds would be dropped.
        const sentTimeSpent = new Map<number, number>();
        if (!isOmrMode.value) {
          const answerUpdates: UpdateSessionAnswersAtSpecificPositionsAPIPayload = [];
          for (let idx = 0; idx < state.timeSpentOnQuestion.length; idx++) {
            if (state.timeSpentOnQuestion[idx].hasSynced == true) continue;
            const timeSpent = state.timeSpentOnQuestion[idx].timeSpent;
            answerUpdates.push([idx, { time_spent: timeSpent }]);
            sentTimeSpent.set(idx, timeSpent);
          }
          if (answerUpdates.length > 0) {
            payload.answer_updates = answerUpdates;
          }
        }

        const response = await SessionAPIService.updateSession(
          state.sessionId,
          payload
        );
        if (response.status == 200) {
          // Mark a position synced only if the combined write succeeded AND no further time
          // accumulated while the request was in flight. If the 1s timer advanced timeSpent
          // mid-request, leave it unsynced so the next tick sends the newer value instead of
          // silently dropping those seconds.
          for (const [idx, sent] of sentTimeSpent) {
            if (state.timeSpentOnQuestion[idx].timeSpent === sent) {
              state.timeSpentOnQuestion[idx].hasSynced = true;
            }
          }
          if (response.data?.time_remaining == 0) {
            endTest()
          }
        } else if (payload.answer_updates) {
          const eventOnlyResponse = await SessionAPIService.updateSession(
            state.sessionId,
            { event: eventType.DUMMY_EVENT }
          );
          if (
            eventOnlyResponse.status == 200 &&
            eventOnlyResponse.data?.time_remaining == 0
          ) {
            endTest()
          }
        }
      }
    };

    onMounted(() => {
      window.setInterval(() => {
        timerUpdates();
      }, 20000);
    });

    async function startQuiz() {
      if (!state.hasQuizEnded) {
        state.autoStartFailed = false;
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
        const response = await SessionAPIService.updateSession(
          state.sessionId,
          payload
        );
        if (response.status != 200 || !response.data) {
          state.autoStartFailed = true;
          state.toast.error(
            "Unable to start quiz due to poor connection. Please try again.",
            {
              position: POSITION.TOP_LEFT,
              timeout: 4000,
              draggablePercent: 0.4
            }
          );
          return;
        }
        if (response.status == 200 && response.data) {
          const timeRemainingFromServer = response.data.time_remaining;
          if (timeRemainingFromServer != null) {
            state.timeRemaining = timeRemainingFromServer;
            if (timeRemainingFromServer == 0 && isQuizAssessment.value && state.quizTimeLimit != null) {
              // show results based on submitted session's answers (if any)
              endTest()
            }
          }
        }
        state.currentQuestionIndex = 0;
      } else if (state.hasQuizEnded && state.reviewAnswers) {
        state.currentQuestionIndex = 0;
        // don't set currentIndex to 0 when reviewAnswers is false
      }
      window.scrollTo(0, 0); // scroll up top incase users scroll down in splash screen
    }

    function fetchQuizDetails(
      { includeAnswers, singlePageMode }: { includeAnswers: boolean, singlePageMode: boolean }
    ): Promise<QuizAPIResponse> {
      // Use Form API service if current route is a form route
      const isFormRoute = router.currentRoute.value.path.startsWith("/form/");
      return isFormRoute
        ? FormAPIService.getForm({
          formId: props.quizId,
          omrMode: isOmrMode.value ?? false,
          singlePageMode
        })
        : QuizAPIService.getQuiz({
          quizId: props.quizId,
          omrMode: isOmrMode.value ?? false,
          singlePageMode,
          includeAnswers,
        });
    }

    async function getQuiz(
      { includeAnswers = false }: { includeAnswers?: boolean } = {}
    ) {
      let quizDetails = await fetchQuizDetails({
        includeAnswers,
        singlePageMode: isSinglePageMode.value,
      });
      if (
        shouldForceSinglePageMode(quizDetails, {
          singlePageMode: isSinglePageMode.value,
          omrMode: isOmrMode.value ?? false,
        })
      ) {
        // refetch: only single-page mode returns every question in full
        state.forceSinglePage = true;
        quizDetails = await fetchQuizDetails({ includeAnswers, singlePageMode: true });
      }
      state.quizLoadedWithAnswers = includeAnswers;
      // Bucketing stays enabled even when includeAnswers=true (large exams, slow networks).
      applyQuizDetails(quizDetails, { enableBucketing: !isSinglePageMode.value });
    }

    function applyQuizDetails(quizDetails: QuizAPIResponse, { enableBucketing }: { enableBucketing: boolean }) {
      // Reset quiz-derived state (used for initial load and for review payload reload)
      state.questionSets = [];
      state.questions = [];
      state.qsetCumulativeLengths = [];
      state.maxQuestionsAllowedToAttempt = 0;

      state.questionSets = quizDetails.question_sets;
      const totalQuestionsInEachSet = [];
      for (const [idx, questionSet] of state.questionSets.entries()) {
        state.maxQuestionsAllowedToAttempt += questionSet.max_questions_allowed_to_attempt;
        state.questions.push(...questionSet.questions); // spread to add questions
        totalQuestionsInEachSet.push(questionSet.questions.length);
        if (idx == 0) state.qsetCumulativeLengths.push(questionSet.questions.length);
        else state.qsetCumulativeLengths.push(state.qsetCumulativeLengths[idx - 1] + questionSet.questions.length);
      }

      // Normalize difficulty label and badge class once
      state.questions = state.questions.map((q) => {
        const label = toDifficultyLabel(q.metadata?.difficulty);
        const badge = toDifficultyBadgeClass(label);
        return {
          ...q,
          metadata: q.metadata ? { ...q.metadata, difficulty_label: label, difficulty_badge_class: badge } : q.metadata,
        } as Question;
      });

      state.quizTimeLimit = quizDetails.time_limit;
      state.metadata = quizDetails.metadata;

      state.maxMarks = quizDetails.max_marks || quizDetails.num_graded_questions;
      state.title = quizDetails.title;
      state.displaySolution = quizDetails?.display_solution ?? true;
      state.showScores = quizDetails?.show_scores ?? true;
      state.requireAllQuestions = quizDetails?.require_all_questions ?? false;

      if (enableBucketing) {
        createQuestionBuckets(totalQuestionsInEachSet);
      } else {
        store.dispatch("setQuestionBucketMap", []);
      }

      if (quizDetails?.review_immediate == false) {
        // check if current time is beyond session end time
        if (state.metadata.session_end_time != null) {
          const sessionEndTime = new Date(state.metadata.session_end_time);
          const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
          state.sessionEndTimeText = new Intl.DateTimeFormat('en-US', dateOptions).format(sessionEndTime);
          state.reviewAnswers = new Date() > sessionEndTime;
        }
      }
    }

    async function fetchQuizWithAnswersIfAllowed() {
      if (!state.hasQuizEnded || !state.reviewAnswers || isFormQuiz.value) return;
      try {
        await getQuiz({ includeAnswers: true });
      } catch (e) {
        // Ignore failures; review can be retried later
      }
    }

    async function createSession() {
      const sessionDetails = await SessionAPIService.createSession(
        props.quizId,
        props.userId as string,
        isOmrMode.value
      );
      state.sessionId = sessionDetails._id;
      state.responses = sessionDetails.session_answers;
      // Only use shuffled order for non-OMR mode
      state.questionOrder = isOmrMode.value
        ? Array.from({ length: sessionDetails.session_answers.length }, (_, i) => i)
        : sessionDetails.question_order;
      for (const response of state.responses) {
        if (response.time_spent == null) {
          state.timeSpentOnQuestion.push({
            timeSpent: 0,
            hasSynced: true
          }) // init time spent with zero, sync true
        } else {
          state.timeSpentOnQuestion.push({
            timeSpent: response.time_spent,
            hasSynced: true
          })
        }
      }
      state.isFirstSession = sessionDetails.is_first;
      state.hasQuizEnded = sessionDetails.has_quiz_ended || false;
      state.hasSessionMetrics = false;
      if (state.hasQuizEnded) {
        if (sessionDetails.metrics) {
          applySessionMetrics(sessionDetails.metrics);
        } else {
          await fetchSessionMetricsWithRetry();
        }
        // If quiz was not loaded with answers (e.g., preflight failed), retry once here.
        if (!state.quizLoadedWithAnswers) {
          await fetchQuizWithAnswersIfAllowed();
        }
      }
    }

    function applySessionMetrics(sessionMetrics: SessionMetricsPayload) {
      state.qsetMetrics = sessionMetrics.qset_metrics.map((metric: QuestionSetMetricPayload) => ({
        name: metric.name || "",
        qset_id: metric.qset_id,
        marksScored: metric.marks_scored,
        maxQuestionsAllowedToAttempt: metric.num_answered + metric.num_skipped,
        numAnswered: metric.num_answered,
        correctlyAnswered: metric.num_correct,
        partiallyAnswered: metric.num_partially_correct,
        wronglyAnswered: metric.num_wrong,
        numQuestionsMarkedForReview: metric.num_marked_for_review || 0,
        attemptRate: metric.attempt_rate,
        accuracyRate: metric.accuracy_rate
      }));
      state.numCorrect = sessionMetrics.total_correct;
      state.numWrong = sessionMetrics.total_wrong;
      state.numPartiallyCorrect = sessionMetrics.total_partially_correct;
      state.numSkipped = sessionMetrics.total_skipped;
      state.numMarkedForReview = sessionMetrics.total_marked_for_review || 0;
      state.marksScored = sessionMetrics.total_marks;
      state.hasSessionMetrics = true;
    }

    async function fetchSessionMetrics(): Promise<SessionMetricsPayload | null> {
      const response = await SessionAPIService.getSession(state.sessionId);
      if (response.status != 200 || !response.data?.metrics) {
        return null;
      }
      applySessionMetrics(response.data.metrics);
      return response.data.metrics;
    }

    function wait(ms: number): Promise<void> {
      return new Promise(resolve => window.setTimeout(resolve, ms));
    }

    async function fetchSessionMetricsWithRetry(
      maxAttempts = 3,
      initialDelayMs = 1200,
      backoffMultiplier = 2
    ): Promise<SessionMetricsPayload | null> {
      let delayMs = initialDelayMs;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const metrics = await fetchSessionMetrics();
        if (metrics) return metrics;
        if (attempt < maxAttempts) {
          await wait(delayMs);
          delayMs *= backoffMultiplier;
        }
      }
      return null;
    }

    async function getQuizCreateSession() {
      let includeAnswers = false;
      // Preflight before GET /quiz
      if (!router.currentRoute.value.path.startsWith("/form/")) {
        const preflight = await SessionAPIService.quizPreflight(
          props.quizId,
          props.userId as string,
        );
        if (preflight.status === 200 && preflight.data) {
          includeAnswers = preflight.data.include_answers;
        }
      }

      await getQuiz({ includeAnswers });
      await createSession();

      // If the student is reopening an already-ended test that is wired to a survey (and this
      // isn't the landing=scorecard return, which already implies the survey is done), resolve
      // whether they've completed the survey so the scorecard can suppress its CTA/countdown.
      // Without this, a later "Review quiz" visit would keep offering a survey they've finished.
      if (
        state.hasQuizEnded &&
        state.metadata?.next_step_before_scores &&
        !props.landingScorecard &&
        getSurveyQuizId() &&
        !isFormQuiz.value
      ) {
        const attempts = await SessionAPIService.getUserQuizAttempts(
          props.userId as string
        );
        state.hasCompletedSurvey =
          attempts.data?.[getSurveyQuizId() as string] === true;
      }

      // A chained survey redirected the student back to their test (?landing=scorecard):
      // if the attempt is already submitted, open straight onto the scorecard instead of the
      // splash. createSession() has already loaded metrics for an ended session. Whether the
      // scorecard reveals scores is still governed by the quiz's own show_scores.
      if (props.landingScorecard && state.hasQuizEnded) {
        // Arriving here means the student just finished the survey, so it's done: suppress the
        // scorecard's survey CTA/countdown.
        state.hasCompletedSurvey = true;
        // Move off the splash (currentQuestionIndex === -1) so it doesn't render behind the
        // scorecard overlay, exactly as the normal end-of-test flow does.
        state.currentQuestionIndex = numQuestions.value;
        state.isScorecardShown = true;
        if (!state.hasSessionMetrics && !state.isComputingScore) {
          state.isComputingScore = true;
          await fetchSessionMetricsWithRetry();
          state.isComputingScore = false;
        }
        return;
      }

      // Auto-start quiz if autoStart prop is true
      if (props.autoStart) {
        await startQuiz();
      }
    }

    /** updates the session answer once marked for review */
    async function updateQuestionResponse() {
      state.isSessionAnswerRequestProcessing = true;
      const itemResponse = state.responses[state.shuffledQuestionIndex];
      const payload: UpdateSessionAnswerAPIPayload = {
        marked_for_review: itemResponse.marked_for_review
      }
      const response = await SessionAPIService.updateSessionAnswer( // response.data
        state.sessionId,
        state.shuffledQuestionIndex,
        payload
      );
      state.timeSpentOnQuestion[state.shuffledQuestionIndex].hasSynced = true;
      if (response.status != 200) {
        state.toast.error(
          `Review Status for Q.${state.currentQuestionIndex + 1} not saved. Please try to mark for review again or refresh the page.`,
          {
            position: POSITION.TOP_LEFT,
            timeout: 4000,
            draggablePercent: 0.4
          }
        )
        state.responses[state.shuffledQuestionIndex] = state.previousResponse; // previous value?!
      } else {
        // successful response
        state.continueAfterAnswerSubmit = true;
      }
      state.isSessionAnswerRequestProcessing = false;
    }

    /** updates the session answer once a response is submitted */
    async function submitQuestion() {
      state.isSessionAnswerRequestProcessing = true;
      state.continueAfterAnswerSubmit = false;
      const itemResponse = state.responses[state.shuffledQuestionIndex];
      const payload: UpdateSessionAnswerAPIPayload = {
        answer: itemResponse.answer,
        marked_for_review: itemResponse.marked_for_review
      }
      if (!isQuizAssessment.value) {
        // For homework and form quizzes, update time spent immediately on submit.
        stoptimeSpentOnQuestionCalc();
        payload.time_spent = state.timeSpentOnQuestion[state.shuffledQuestionIndex].timeSpent;
      }
      const response = await SessionAPIService.updateSessionAnswer( // response.data
        state.sessionId,
        state.shuffledQuestionIndex,
        payload
      );
      state.timeSpentOnQuestion[state.shuffledQuestionIndex].hasSynced = true;
      if (response.status != 200) {
        state.toast.error(
          `Answer for Q.${state.currentQuestionIndex + 1} not saved. Please try to submit again or refresh the page.`,
          {
            position: POSITION.TOP_LEFT,
            timeout: 4000,
            draggablePercent: 0.4
          }
        )
        state.responses[state.shuffledQuestionIndex] = state.previousResponse; // previous value?!
      } else {
        // successful response
        state.continueAfterAnswerSubmit = true;

        // For homework, reveal correct answer only after submit
        if (state.metadata.quiz_type === "homework") {
          const reveal = await SessionAPIService.revealAnswer(
            state.sessionId,
            state.shuffledQuestionIndex
          );
          if (reveal.status === 200 && reveal.data) {
            state.questions[state.shuffledQuestionIndex].correct_answer = reveal.data.correct_answer;
            state.questions[state.shuffledQuestionIndex].solution = reveal.data.solution;
          }
        }
      }
      state.isSessionAnswerRequestProcessing = false;
    }

    async function submitOmrQuestion(newQuestionIndex: number) {
      const itemResponse = state.responses[newQuestionIndex];
      const response = await SessionAPIService.updateSessionAnswer( // response.data
        state.sessionId,
        newQuestionIndex,
        {
          answer: itemResponse.answer,
          marked_for_review: false // false by default for omr
          // not sending time spent on question for omr -- cannot compute!
        }
      );
      if (response.status != 200) {
        state.toast.error(
          `Answer for Q.${questionLabels.value[newQuestionIndex]} not saved. Please answer again or refresh the page.`,
          {
            position: POSITION.TOP_LEFT,
            timeout: 4000,
            draggablePercent: 0.4
          }
        )
        state.responses[newQuestionIndex] = state.previousOmrResponses[newQuestionIndex];
      }
    }

    // The server says this session is already ended (409 on an answer/end write), so the
    // first End Test did go through. Mark it ended locally and move to the scorecard/survey
    // instead of showing the "poor connection, retry" banner in a loop.
    async function finishAlreadyEndedSession() {
      state.hasQuizEnded = true;
      const redirected = await revealScorecardOrSurvey();
      if (redirected) return;
      state.currentQuestionIndex = numQuestions.value;
    }

    async function endTest() {
      if (state.hasQuizEnded) {
        state.currentQuestionIndex = numQuestions.value;
        await revealScorecardOrSurvey();
        return;
      }

      const incompleteQuestionIndex = state.questions.findIndex((question, idx) => {
        if (question.required === false) return false; // per-question opt-out
        if (!questionVisibility.value[idx]) return false; // hidden by display_condition => not required
        return !isQuestionResponseComplete(question, state.responses[idx]?.answer ?? null);
      });
      if (areAllQuestionsRequired.value && incompleteQuestionIndex != -1) {
        showIncompleteRequiredQuestionWarning(incompleteQuestionIndex);
        return;
      }

      state.isSessionAnswerRequestProcessing = true;
      stoptimeSpentOnQuestionCalc();

      const responseAnswersWithPositions: UpdateSessionAnswersAtSpecificPositionsAPIPayload = [];
      for (const [idx, response] of state.responses.entries()) {
        const answerPayload: UpdateSessionAnswerAPIPayload = {
          // hidden questions always submit null (see answerToSubmit)
          answer: answerToSubmit(response.answer, questionVisibility.value[idx] ?? true),
          visited: response.visited,
          marked_for_review: response.marked_for_review
        };
        if (!isOmrMode.value) {
          answerPayload.time_spent = state.timeSpentOnQuestion[idx].timeSpent;
        }
        responseAnswersWithPositions.push([idx, answerPayload]);
      }

      const updateResponse = await SessionAPIService.updateSessionAnswersAtSpecificPositions(
        state.sessionId,
        responseAnswersWithPositions
      );

      // 409 => the backend already recorded this session as ended (the first End Test
      // went through; only the reply was lost under load). The answers are safe on the
      // server, so stop retrying and move the student to the scorecard instead of looping
      // on the "poor connection" banner.
      if (updateResponse.status === 409) {
        state.isSessionAnswerRequestProcessing = false;
        await finishAlreadyEndedSession();
        return;
      }

      if (updateResponse.status != 200) {
        state.toast.error(
          'Unable to submit some of your answers due to poor connection. Please retry "End Test" when connection improves.',
          {
            position: POSITION.TOP_LEFT,
            timeout: 10000,
            draggablePercent: 0.4
          }
        );
        state.isSessionAnswerRequestProcessing = false;
        return;
      }

      state.isComputingScore = true;
      const payload: UpdateSessionAPIPayload = {
        event: eventType.END_QUIZ
      };
      const endSessionResponse = await SessionAPIService.updateSession(state.sessionId, payload);
      if (endSessionResponse.status === 409) {
        // Session already ended on the server (a prior End Test succeeded). Treat as done.
        state.isComputingScore = false;
        state.isSessionAnswerRequestProcessing = false;
        await finishAlreadyEndedSession();
        return;
      }
      if (endSessionResponse.status != 200) {
        const missingPositions = endSessionResponse.data?.detail?.missing_positions;
        if (areAllQuestionsRequired.value && Array.isArray(missingPositions) && missingPositions.length > 0) {
          showIncompleteRequiredQuestionWarning(missingPositions[0]);
          state.isComputingScore = false;
          state.isSessionAnswerRequestProcessing = false;
          return;
        }
        state.toast.error(
          'Unable to complete test submission due to poor connection. Please retry "End Test" to complete.',
          {
            position: POSITION.TOP_LEFT,
            timeout: 10000,
            draggablePercent: 0.4
          }
        );
        state.isComputingScore = false;
        state.isSessionAnswerRequestProcessing = false;
        return;
      }

      state.hasQuizEnded = true;

      // Resolve the survey gate BEFORE moving currentQuestionIndex to the end: that move fires
      // the question-index watcher, which shows the scorecard. If we're redirecting into the
      // survey instead, stop here so the scorecard never renders (and the watcher, seeing
      // isScorecardRedirectingToSurvey, also stands down). Otherwise fall through and let the
      // index move trigger the scorecard the normal way, after answers are hydrated.
      const redirected = await revealScorecardOrSurvey();
      if (redirected) {
        state.isSessionAnswerRequestProcessing = false;
        return;
      }
      state.currentQuestionIndex = numQuestions.value;

      const responseMetrics = endSessionResponse.data?.metrics || null;
      if (responseMetrics) {
        applySessionMetrics(responseMetrics);
      } else {
        const fetchedMetrics = await fetchSessionMetricsWithRetry();
        if (!fetchedMetrics) {
          state.toast.error(
            'Score computation is taking longer than expected. Please open the scorecard after the test session is complete.',
            {
              position: POSITION.TOP_LEFT,
              timeout: 8000,
              draggablePercent: 0.4
            }
          );
        }
      }

      // Show the scorecard only now — after the question index moved and answers/metrics are
      // hydrated — so single-page review items never render against a null correctAnswer.
      state.isScorecardShown = true;
      state.isComputingScore = false;
      state.isSessionAnswerRequestProcessing = false;
    }

    /**
     * The survey's quiz id, parsed from the quiz's next_step_url. For forms the path id in
     * `/form/<id>` is the quiz _id, which is also the key used in the quiz-attempts map, so we
     * can look up whether this student already submitted the survey. Returns null when the quiz
     * has no next_step_url or the id can't be parsed (in which case there is no survey gate).
     */
    function getSurveyQuizId(): string | null {
      const url = state.metadata?.next_step_url;
      if (!url) return null;
      const match = url.match(/\/(?:form|quiz)\/([^/?#]+)/);
      return match ? match[1] : null;
    }

    /**
     * Decide, at the end of a test, whether to redirect the student into a post-test survey
     * (or, for a before-scores survey, back to the test scorecard) instead of showing the
     * scorecard here. Returns true if it redirected (the caller should stop), false if the
     * caller should show the scorecard the normal way. This function must NOT set
     * isScorecardShown itself: the scorecard has to render only after the question index is
     * moved and answers are hydrated, or single-page review items read a null correctAnswer.
     */
    async function revealScorecardOrSurvey(): Promise<boolean> {
      const surveyQuizId = getSurveyQuizId();
      // Gate only a test/assessment that is wired to a survey the student hasn't done yet, and
      // only on the forward path (not a landing=scorecard return). Forms (the survey itself)
      // follow their own next_step normally — they must never be gated, or submitting the survey
      // would redirect back into another survey. When the gate applies, redirect straight into
      // the survey; the survey's own header text sets the "2 min, then your score" expectation.
      // Opt-in: only quizzes explicitly marked next_step_before_scores use the gate. Existing
      // next_step_url flows (e.g. the NVS post-test survey, shown via a scorecard CTA) are
      // unaffected and keep showing the scorecard first.
      if (
        surveyQuizId &&
        state.metadata?.next_step_before_scores &&
        !props.landingScorecard &&
        !isFormQuiz.value
      ) {
        const attempts = await SessionAPIService.getUserQuizAttempts(
          props.userId as string
        );
        const alreadyDoneSurvey = attempts.data?.[surveyQuizId] === true;
        // Remember this so the scorecard suppresses the survey CTA/countdown once it's done.
        state.hasCompletedSurvey = alreadyDoneSurvey;
        if (!alreadyDoneSurvey) {
          const surveyUrl = processedNextStepUrl.value;
          if (surveyUrl) {
            state.isScorecardRedirectingToSurvey = true;
            window.location.href = surveyUrl;
            return true;
          }
        }
      }

      // A before-scores survey (a form marked next_step_before_scores, chaining back to the test
      // scorecard) submitting: skip the form's own thank-you scorecard and redirect to its
      // next_step, showing a brief "Saving your responses..." overlay instead. This is scoped to
      // before-scores forms so ordinary chained forms (e.g. multi-step feedback forms) keep their
      // normal scorecard-CTA behaviour.
      if (
        isFormQuiz.value &&
        state.metadata?.next_step_before_scores &&
        processedNextStepUrl.value
      ) {
        // Clear the computing-scores overlay so it doesn't stack under the redirect overlay
        // while the (now irrelevant) metrics await in endTest finishes.
        state.isComputingScore = false;
        state.isRedirectingAfterSurvey = true;
        window.location.href = processedNextStepUrl.value;
        return true;
      }

      // Not redirecting: the caller shows the scorecard the normal way (after moving the question
      // index), so answer data is hydrated before the scorecard/review items render.
      return false;
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

      if (state.numPartiallyCorrect) {
        metrics.push({
          name: "Partially Correct",
          icon: {
            source: "partially-correct",
            class:
              "h-10 bp-500:h-12 lg:h-14 w-8 bp-500:w-10 lg:w-12 place-self-center flex justify-center",
          },
          value: state.numPartiallyCorrect
        })
      };

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
      return state.numCorrect + state.numWrong + state.numPartiallyCorrect;
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

    const scorecardGreeting = computed(() => {
      if (isFormQuiz.value) {
        return "Thank you for completing the questionnaire! 📝";
      }
      return "Hooray! Congrats on completing the quiz! 🎉";
    });

    /** Process the next step URL by replacing parameters */
    const processedNextStepUrl = computed(() => {
      if (!state.metadata?.next_step_url) return "";

      // Only substitute {userId} with a userId that came from the URL query (a whitelisted
      // test/admin id). props.userId also resolves to a portal student's real internal userId,
      // and putting that in the chained URL would 403 them (real userIds in the query are
      // rejected) — portal students ride their portal token instead, so {userId} stays empty.
      const routeUserId = router.currentRoute.value.query.userId;
      const substitutableUserId =
        typeof routeUserId === "string" && routeUserId ? routeUserId : "";

      // {return_to}: the quiz id this survey should send the student back to. A before-scores
      // survey is shared across many tests, so it can't hardcode one test id — the launching
      // test injects its own id via {quizId} (below), and the survey reads it back from the
      // landingReturnTo prop (?return_to=<id>) and substitutes it here. Absent → empty, handled
      // after substitution.
      const returnTo = props.landingReturnTo || "";

      // A next_step_url that needs {return_to} but has none (stale/forwarded survey link, or the
      // param was dropped) can't build a valid return — treat it as "no next step" so the survey
      // falls back to its own scorecard rather than redirecting to a broken URL.
      if (state.metadata.next_step_url.includes('{return_to}') && !returnTo) {
        return "";
      }

      let url = state.metadata.next_step_url
        .replace('{userId}', substitutableUserId)
        .replace('{apiKey}', props.apiKey || '')
        // {quizId}: this quiz's own id, so a test can pass itself to the survey as return_to.
        .replace('{quizId}', props.quizId || '')
        .replace('{return_to}', returnTo);

      // Admin/test flows open this page with ?userId=<whitelisted id>; carry it to
      // the next step so the chained page passes the same guard. Portal students
      // have no userId in the URL (their identity is the portal token), and the
      // next-step URL must stay clean of it for them.
      if (substitutableUserId && !url.includes("userId=")) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}userId=${substitutableUserId}`;
      }

      // Add autoStart parameter if next_step_autostart is true
      if (state.metadata?.next_step_autostart) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}autoStart=true`;
      }

      return url;
    });

    /**
     * The next-step URL the scorecard itself shows as a CTA. When the student reached the
     * scorecard by returning from the survey (landing=scorecard), the survey is already done,
     * so we suppress the CTA to avoid looping them back into it. In every other case the
     * scorecard keeps its normal next-step behaviour.
     */
    const scorecardNextStepUrl = computed(() => {
      // Suppress the CTA when the student returned from the survey (landing=scorecard) or has
      // already completed it — in both cases the survey is done, so never offer it again.
      if (props.landingScorecard || state.hasCompletedSurvey) return "";
      return processedNextStepUrl.value;
    });

    /** Get the next step button text */
    const nextStepButtonText = computed(() => {
      return state.metadata?.next_step_text || "Proceed to Next Step";
    });

    /**
     * remove the scorecard, display previous question and remove the confetti
     */
    async function goToPreviousQuestion() {
      // Scorecard "See Answers": lazily load answers when review is allowed.
      await fetchQuizWithAnswersIfAllowed();
      state.isScorecardShown = false;
      state.currentQuestionIndex = 0;
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
      for (let index = 0; index < state.questionSets.length; index++) {
        const states = [] as paletteItemState[]
        let startIndex = 0
        if (index > 0) startIndex = state.qsetCumulativeLengths[index - 1]
        for (let qindex = startIndex; qindex < state.qsetCumulativeLengths[index]; qindex++) {
          let qstate: questionState
          let dynamicIndex = qindex;
          if (!isOmrMode.value) dynamicIndex = state.questionOrder[qindex];
          if (state.hasQuizEnded) {
            const questionAnswerEvaluation = isQuestionAnswerCorrect(
              state.questions[dynamicIndex],
              state.responses[dynamicIndex].answer,
              state.questions[dynamicIndex].marking_scheme?.partial != null // doesPartialMarkingExist
            )
            if (!questionAnswerEvaluation.valid && state.questions[dynamicIndex].graded) continue

            if (!state.questions[dynamicIndex].graded) {
              qstate = "neutral"
            } else if (
              !questionAnswerEvaluation.answered ||
          questionAnswerEvaluation.isCorrect == null
            ) {
              qstate = "neutral"
            } else {
              if (questionAnswerEvaluation.isCorrect) {
                qstate = "success"
              } else if (questionAnswerEvaluation.isPartiallyCorrect) {
                qstate = "partial-success"
              } else qstate = "error"
            }
          } else {
            if (state.responses.length > 0) {
              if (!state.responses[dynamicIndex].visited) { // initially responses empty
                qstate = "neutral"
              } else {
                if (state.responses[dynamicIndex].answer != null) qstate = "success"
                else if (state.responses[dynamicIndex].marked_for_review) qstate = "review"
                else qstate = "error"
              }
            } else qstate = "error"
          }
          states.push({
            index: qindex,
            value: qstate
          })
        }
        // the below instruction assumes all questions within a set are of the same type
        let paletteInstructionText: string = "";

        // Don't show instruction text for forms
        if (!isFormQuiz.value) {
          paletteInstructionText = state.questionSets[index].description ?? "";

          if (state.questionSets[index].max_questions_allowed_to_attempt < state.questionSets[index].questions.length) {
            paletteInstructionText += `<br>You may attempt only up to ${state.questionSets[index].max_questions_allowed_to_attempt} questions in this section.`
          } else {
            paletteInstructionText += `<br>You may attempt all questions in this section.`
          }
        }

        qsetStates.push({
          title: state.questionSets[index].title,
          paletteItems: states,
          instructionText: paletteInstructionText,
          maxQuestionsAllowedToAttempt: state.questionSets[index].max_questions_allowed_to_attempt,
        })
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

        try {
          const fetchedQuestions = await QuestionAPIService.getQuestions(
            state.questions[questionIndex].question_set_id,
            bucketStartIndex,
            store.state.bucketSize,
            state.quizLoadedWithAnswers
          )

          for (let i = bucketStartIndex; i <= bucketEndIndex; i++) {
            let globalQuestionIndex = i
            if (qsetIndex != 0) globalQuestionIndex = i + state.qsetCumulativeLengths[qsetIndex - 1]
            // The base /questions endpoint will no longer return answers.
            // If homework reveal already populated correct_answer/solution for a question, preserve it.
            const existing = state.questions[globalQuestionIndex]
            const incoming = fetchedQuestions[i - bucketStartIndex]
            state.questions[globalQuestionIndex] = {
              ...incoming,
              // If quiz was loaded with answers (review mode), prefer incoming (which also includes solutions).
              // Otherwise (attempt/homework reveal), preserve any already-revealed answers.
              correct_answer: state.quizLoadedWithAnswers
                ? incoming.correct_answer
                : (existing?.correct_answer ?? incoming.correct_answer),
              solution: state.quizLoadedWithAnswers
                ? incoming.solution
                : (existing?.solution ?? incoming.solution),
            } as Question
          }

          store.dispatch("updateBucketFetchedStatus", {
            qsetIndex,
            bucketIndex: bucketToFetch,
            fetchedStatus: true,
          })
        } catch (error) {
          state.toast.error(
            'Unable to load questions due to poor connection. Please check your internet connection and try again.',
            {
              position: POSITION.TOP_LEFT,
              timeout: 5000,
              draggablePercent: 0.4
            }
          )
        }
      }
    }

    return {
      ...toRefs(state),
      isQuestionShown,
      isSplashShown,
      isTransitioning,
      isQuizAssessment,
      isFormQuiz,
      numConditionalQuestions,
      questionLabels,
      isSinglePageMode,
      areAllQuestionsRequired,
      scorecardMetrics,
      scorecardProgress,
      numQuestionsAnswered,
      hasGradedQuestions,
      numNonGradedQuestions,
      numGradedQuestions,
      isQuizLoaded,
      scorecardResult,
      scorecardGreeting,
      startQuiz,
      getQsetLimits,
      submitQuestion,
      updateQuestionResponse,
      submitOmrQuestion,
      goToPreviousQuestion,
      endTest,
      currentMaxQuestionsAllowedToAttempt,
      currentQsetTitle,
      questionSetStates,
      fetchQuestionBucket,
      timerUpdates,
      isOmrMode,
      computedQuizType,
      shouldShowOmrToggle,
      toggleButtonTextConfig,
      toggleButtonIconClass,
      toggleButtonIconConfig,
      toggleOmrMode,
      starttimeSpentOnQuestionCalc,
      stoptimeSpentOnQuestionCalc,
      processedNextStepUrl,
      scorecardNextStepUrl,
      nextStepButtonText,
      showFullText,
      singlePageHeaderText,
    };
  },
});
</script>
