<template>
  <div class="flex flex-col bg-white w-full h-full overflow-auto justify-between">
    <Header class="fixed top-0" v-if="isQuizAssessment" :hasQuizEnded="hasQuizEnded"
      :hasTimeLimit="quizTimeLimit != null" :title="title" :userId="userId" :isOmrMode=true
      :isSessionAnswerRequestProcessing="isSessionAnswerRequestProcessing" v-model:isPaletteVisible="isPaletteVisible"
      :timeRemaining="timeRemaining" :warningTimeLimit="timeLimitWarningThreshold"
      @time-limit-warning="displayTimeLimitWarning" @end-test="endTest" @end-test-by-time="endTestByTime"
      data-test="omr-header"></Header>
    <div class="flex flex-col w-full h-full -z-10" :class="{ 'mt-20 mb-20': isQuizAssessment }">
      <div class="h-full relative">
        <div class="scroll-container flex flex-col grow bg-white w-full justify-between overflow-hidden" :class="{ 'mt-[66px]': isQuizAssessment }">
          <div class="flex grow flex-col w-full h-full overflow-y-auto">
            <QuestionPalette v-if="isPaletteVisible" :hasQuizEnded="hasQuizEnded" :questionSetStates="questionSetStates"
              :currentQuestionIndex="currentQuestionIndex" :title="title" :subject="subject" :testFormat="testFormat"
              :maxMarks="maxMarks" :numQuestions="numQuestions" :quizTimeLimit="quizTimeLimit" :isOmrMode=true
              class="absolute w-full h-full sm:w-2/3 lg:w-1/2 xl:w-1/3 z-10 bg-white overflow-y-scroll pb-[56px]"
              data-test="questionPalette">
            </QuestionPalette>
          </div>
          <div v-for="(questionSetState, index) in questionSetStates" :key="index" class="space-y-2 pb-[56px]">
            <div class="bg-gray-300">
              <p :class="titleTextClass" :data-test="`questionSetTitle-${index}`">{{ questionSetState.title }}</p>
            </div>
            <p :class="instructionTextClass" v-html="questionSetState.instructionText"
              :data-test="`questionSetInstruction-${index}`"></p>
            <div class="mt-4 space-y-4">
              <!-- it is being stopping endbutton make sur eu -->
              <SinglePageItem v-for="(questionState, qindex) in questionSetState.paletteItems" :class="{ 'mt-4': qindex == 0 }"
                :options="$props.questions[questionState.index].options"
                :correctAnswer="$props.questions[questionState.index].correct_answer"
                :questionType="$props.questions[questionState.index].type"
                :isGradedQuestion="$props.questions[questionState.index].graded"
                :maxCharLimit="$props.questions[questionState.index].max_char_limit"
                :matrixSize="$props.questions[questionState.index].matrix_size"
                :matrixRows="$props.questions[questionState.index].matrix_rows"
                :isPortrait="isPortrait"
                :quizType="quizType"
                :hasQuizEnded="hasQuizEnded"
                :submittedAnswer="draftResponses[questionState.index]"
                :isQuestionDisabled="questionDisabledArray[questionState.index]"
                :currentQuestionIndex="questionState.index"
                :showFullText="showFullText"
                :questionText="$props.questions[questionState.index].text"
                :questionImage="$props.questions[questionState.index].image"
                :solutionText="$props.questions[questionState.index].solution"
                :difficulty="$props.questions[questionState.index].metadata?.difficulty"
                :displaySolution="displaySolution"
                @option-selected="questionOptionSelected"
                @subjective-answer-entered="subjectiveAnswerUpdated"
                @numerical-answer-entered="numericalAnswerUpdated"
                @matrix-option-selected="matrixOptionSelected"
                @matrix-numerical-updated="matrixNumericalUpdated"
                :key="questionState.index"
                :data-test="`SinglePageItem-${questionState.index}`"
                :ref="`singlepageitem-${questionState.index}`"></SinglePageItem>
            </div>
          </div>
          <!-- footer -->
          <div class="flex w-full lg:p-6 justify-between z-50 place-self-end fixed bottom-0" :class="{
            'bg-white p-4': !isQuizAssessment,
            'bg-gray-200 py-2 px-2': isQuizAssessment,
          }"></div>
          <!-- Submit button for non-assessment quizzes (forms/homework) -->
          <div v-if="!isQuizAssessment && !hasQuizEnded" class="flex justify-center py-8 pb-24">
            <button
              @click="endTest"
              :disabled="isSessionAnswerRequestProcessing"
              class="bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-xl disabled:opacity-50 disabled:pointer-events-none"
              data-test="submit-button"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Header from "../Questions/Header.vue"
import QuestionPalette from "../Questions/Palette/QuestionPalette.vue"
import SinglePageItem from "./SinglePageItem.vue"
import {
  defineComponent,
  PropType,
  reactive,
  toRefs,
  onUnmounted,
  computed,
  watch
} from "vue"
import {
  isScreenPortrait
} from "@/services/Functional/Utilities";
import {
  Question,
  SubmittedResponse,
  DraftResponse,
  quizType,
  testFormat,
  QuestionSetIndexLimits,
  questionSetPalette,
  TimeLimit,
  quizTitleType
} from "@/types"
import { useToast, POSITION } from "vue-toastification"
const clonedeep = require("lodash.clonedeep");

const { v4: uuidv4 } = require('uuid');

export default defineComponent({
  name: "SinglePageModal",
  components: {
    SinglePageItem,
    Header,
    QuestionPalette
  },
  props: {
    questions: {
      required: true,
      type: Array as PropType<Question[]>
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    hasQuizEnded: {
      type: Boolean,
      default: false
    },
    responses: {
      required: true,
      type: Array as PropType<SubmittedResponse[]>
    },
    isSessionAnswerRequestProcessing: {
      type: Boolean,
      default: false
    },
    quizType: {
      type: String as PropType<quizType>,
      default: "homework"
    },
    numQuestions: {
      type: Number,
      default: 0
    },
    maxQuestionsAllowedToAttempt: {
      type: Number,
      default: 0
    },
    questionSetTitle: {
      type: String,
      default: ""
    },
    qsetIndexLimits: {
      required: true,
      type: Object as PropType<QuestionSetIndexLimits>
    },
    qsetIndex: {
      type: Number,
      default: 0
    },
    questionSetStates: {
      type: Array as PropType<questionSetPalette[]>,
      default: () => []
    },
    quizTimeLimit: {
      type: Object as PropType<TimeLimit> || null,
      default: null
    },
    timeRemaining: {
      type: Number,
      default: 0
    },
    userId: {
      type: String,
      default: ""
    },
    title: {
      required: true,
      type: [null, String] as PropType<quizTitleType>,
    },
    subject: {
      type: String,
      default: null,
    },
    testFormat: {
      type: [null, String] as PropType<testFormat>,
      default: null,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    showFullText: {
      type: Boolean,
      default: false,
    },
    displaySolution: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, context) {
    const state = reactive({
      localCurrentQuestionIndex: props.currentQuestionIndex as number, // local copy of currentQuestionIndex
      localResponses: props.responses as SubmittedResponse[], // local copy of responses
      previousLocalResponses: [] as SubmittedResponse[], // local copy of previous responses to each question
      isPortrait: true,
      draftResponses: [] as DraftResponse[], // stores the options selected by the user but not yet submitted
      toast: useToast(),
      isDraftAnswerCleared: false, // whether the draft answer has been cleared but not yet submitted
      isPaletteVisible: false, // whether the question palette is visible
      reRenderKey: false, // a key to re-render a component
      hasEndTestBeenClickedOnce: true,
      instructionTextClass:
        "text-lg sm:text-xl text-base mx-4 m-2 leading-tight whitespace-pre-wrap text-slate-500",
      titleTextClass:
        "text-lg sm:text-xl text-base mx-4 py-2 font-medium leading-tight whitespace-pre-wrap bg-gray-300",
    })

    // display warning when time remaining goes below this threshold (in minutes)
    const timeLimitWarningThreshold: number = 3

    function checkScreenOrientation() {
      state.isPortrait = isScreenPortrait()
    }

    function generateId(idx: number) {
      return uuidv4() + idx;
      // return idx; // random key string for vue component
    }

    function updateQuestionIndex(newQuestionIndex: number) {
      state.localCurrentQuestionIndex = newQuestionIndex;
    }

    watch(
      () => state.localCurrentQuestionIndex,
      (newValue) => {
        context.emit("update:currentQuestionIndex", newValue)
      }
    )

    watch(
      () => props.currentQuestionIndex,
      (newValue: Number) => {
        if (!props.hasQuizEnded && optionalLimitReachedArray.value[props.qsetIndex]) {
          state.toast.warning(
            `You have already attempted maximum allowed (${props.maxQuestionsAllowedToAttempt}) questions in current section (Q.${props.qsetIndexLimits.low + 1} - Q.${props.qsetIndexLimits.high}).

  To attempt this question, unselect an answer to another question in this section.
              `,
            {
              position: POSITION.TOP_CENTER,
              timeout: 7000,
              draggablePercent: 0.4
            }
          )
          context.emit("test-optional-warning-shown");
        }
      }
    )

    watch(
      () => state.localResponses,
      (newValue) => {
        context.emit("update:responses", newValue)
      },
      { deep: true }
    )

    watch(
      () => state.previousLocalResponses,
      (newValue) => {
        context.emit("update:previousOmrResponses", newValue)
      },
      { deep: true }
    )

    /**
       * triggered upon selecting an option in single-choice / multi-choice / matrix match
       */
    function questionOptionSelected(draftAnswer: DraftResponse, newQuestionIndex: number) {
      updateQuestionIndex(newQuestionIndex);
      if (!state.localResponses.length) return
      const clonedLocalResponse = clonedeep(state.localResponses[state.localCurrentQuestionIndex]);
      state.previousLocalResponses[newQuestionIndex] = clonedLocalResponse;
      state.localResponses[state.localCurrentQuestionIndex].answer = draftAnswer
      context.emit("submit-omr-question", newQuestionIndex); // submit answer whenever there is an update / option selected
    }

    function clearAnswer() {
      // no clearAnswer functionality for SinglePageModal
    }

    function numericalAnswerUpdated(answer: number | null, newQuestionIndex: number) {
      updateQuestionIndex(newQuestionIndex);
      state.previousLocalResponses[newQuestionIndex] = clonedeep(state.localResponses[state.localCurrentQuestionIndex]);
      state.localResponses[state.localCurrentQuestionIndex].answer = answer
      context.emit("submit-omr-question", newQuestionIndex);
    }

    /** update the attempt to the current question - valid for subjective questions */
    function subjectiveAnswerUpdated(answer: string, newQuestionIndex: number) {
      updateQuestionIndex(newQuestionIndex);
      state.previousLocalResponses[newQuestionIndex] = clonedeep(state.localResponses[state.localCurrentQuestionIndex]);
      state.localResponses[state.localCurrentQuestionIndex].answer = answer
      context.emit("submit-omr-question", newQuestionIndex);
    }

    /** update matrix rating answer */
    function matrixOptionSelected(answer: Record<string, number>, newQuestionIndex: number) {
      updateQuestionIndex(newQuestionIndex);
      state.previousLocalResponses[newQuestionIndex] = clonedeep(state.localResponses[state.localCurrentQuestionIndex]);
      state.localResponses[state.localCurrentQuestionIndex].answer = answer
      context.emit("submit-omr-question", newQuestionIndex);
    }

    /** update matrix numerical answer */
    function matrixNumericalUpdated(answer: Record<string, string> | null, newQuestionIndex: number) {
      updateQuestionIndex(newQuestionIndex);
      state.previousLocalResponses[newQuestionIndex] = clonedeep(state.localResponses[state.localCurrentQuestionIndex]);
      state.localResponses[state.localCurrentQuestionIndex].answer = answer
      context.emit("submit-omr-question", newQuestionIndex);
    }

    function endTest() {
      if (!props.hasQuizEnded && state.hasEndTestBeenClickedOnce) {
        let attemptedQuestions = 0;
        for (const response of props.responses) {
          if (response.answer != null) {
            attemptedQuestions += 1;
          }
        }
        const buttonName = isQuizAssessment.value ? "End Test" : "Submit";
        state.toast.success(
          `You have answered ${attemptedQuestions} out of ${props.numQuestions} questions. Please verify your responses and click ${buttonName} button again to make final submission.`,
          {
            position: POSITION.TOP_CENTER,
            timeout: 5000,
            draggablePercent: 0.4
          }
        )
        state.hasEndTestBeenClickedOnce = false;
      } else {
        context.emit("end-test")
      }
    }

    function endTestByTime() {
      // same function as above -- can update later for new feature
      if (!props.hasQuizEnded && isQuizAssessment.value) {
        context.emit("end-test")
      }
    }

    onUnmounted(() => {
      // remove listeners
      window.removeEventListener("resize", checkScreenOrientation)
    })

    const currentQuestion = computed(
      () => props.questions[state.localCurrentQuestionIndex]
    )

    const questionType = computed(() => currentQuestion.value.type)

    const questionCorrectAnswer = computed(
      () => currentQuestion.value?.correct_answer
    )

    const isGradedQuestion = computed(() => currentQuestion.value.graded)

    // const isQuestionTypeMultiChoice = computed(
    // () => questionType.value == "multi-choice"
    // )
    // const isQuestionTypeSingleChoice = computed(
    // () => questionType.value == "single-choice"
    // )

    const isQuestionTypeSubjective = computed(
      () => questionType.value == "subjective"
    )

    const isQuestionTypeNumericalInteger = computed(
      () => questionType.value == "numerical-integer"
    )
    const isQuestionTypeNumericalFloat = computed(
      () => questionType.value == "numerical-float"
    )

    const currentQuestionResponse = computed(
      () => props.responses[state.localCurrentQuestionIndex]
    )

    const currentQuestionResponseAnswer = computed(
      () => currentQuestionResponse.value?.answer
    )

    const isAttemptValid = computed(() => {
      if (optionalLimitReachedArray.value[props.qsetIndex] && currentQuestionResponseAnswer.value == null) {
        // this cannot be answered
        return false
      }
      const currentDraftResponse = state.localResponses[state.localCurrentQuestionIndex].answer as DraftResponse;
      if (currentDraftResponse == null) {
        return false
      }
      if (isQuestionTypeSubjective.value) return currentDraftResponse != ""
      if (isQuestionTypeNumericalInteger.value || isQuestionTypeNumericalFloat.value) {
        return true
      }
      // Handle matrix questions (matrix-rating and matrix-numerical only)
      if (currentQuestion.value?.type === "matrix-rating" || currentQuestion.value?.type === "matrix-numerical") {
        if (typeof currentDraftResponse !== 'object' || currentDraftResponse === null || Array.isArray(currentDraftResponse)) {
          return false;
        }
        // Check if all matrix rows are filled for matrix-rating and matrix-numerical
        const matrixRows = currentQuestion.value?.matrix_rows || [];
        const answeredRows = Object.keys(currentDraftResponse);
        return matrixRows.length > 0 && answeredRows.length === matrixRows.length;
      }
      return Array.isArray(currentDraftResponse) && currentDraftResponse.length > 0
    })

    const isQuizAssessment = computed(() => props.quizType == "assessment" || props.quizType == "omr-assessment")

    const optionalLimitReachedArray = computed(() => {
      const arr = [] as Array<Boolean>;
      props.questionSetStates.forEach((questionSetState) => {
        arr.push(false);
      });

      for (let idx = 0; idx < props.questionSetStates.length; idx++) {
        const questionSetState = props.questionSetStates[idx];
        const sizeOfState = questionSetState.paletteItems.length;

        // no optional questions in this state, limit can't be reached
        if (sizeOfState == questionSetState.maxQuestionsAllowedToAttempt) continue

        const lowQsetIndex = questionSetState.paletteItems[0].index;
        const highQsetIndex = lowQsetIndex + sizeOfState;
        let numSubmittedResponses = 0;
        for (let qindex = lowQsetIndex; qindex < highQsetIndex; qindex++) {
          const response = props.responses[qindex];
          if (response.answer != null) numSubmittedResponses += 1
        }
        if (numSubmittedResponses >= questionSetState.maxQuestionsAllowedToAttempt) arr[idx] = true;
      }

      return arr;
    })

    const questionDisabledArray = computed(() => {
      const arr = [] as Array<Boolean>;
      // instantiating array to determine if answering a question is disabled - false initially
      props.questions.forEach((question) => {
        arr.push(false);
      })

      for (let idx = 0; idx < props.questionSetStates.length; idx++) {
        if (optionalLimitReachedArray.value[idx] == true) {
          const questionSetState = props.questionSetStates[idx];
          const sizeOfState = questionSetState.paletteItems.length;
          const lowQsetIndex = questionSetState.paletteItems[0].index;
          const highQsetIndex = lowQsetIndex + sizeOfState;
          for (let qindex = lowQsetIndex; qindex < highQsetIndex; qindex++) {
            const response = props.responses[qindex];
            if (response.answer == null) arr[qindex] = true;
            // since optionalLimitReached is true, remaining questions in set can't be answered
          }
        }
      }

      return arr;
    })

    // instantiating draftResponses here -- useful when quiz is resumed
    props.responses.forEach((response) => {
      state.draftResponses.push(response.answer)
      state.previousLocalResponses.push(
        {
          _id: response._id,
          question_id: response.question_id,
          answer: response.answer,
          visited: response.visited,
          time_spent: response.time_spent,
          marked_for_review: response.marked_for_review
        }
      )
    })

    // determine the screen orientation when the item modal is created
    checkScreenOrientation()
    // add listener for screen size being changed
    window.addEventListener("resize", checkScreenOrientation)

    // displaying warning when time is lesser than the warning threshold
    function displayTimeLimitWarning() {
      if (!props.hasQuizEnded) {
        state.toast.warning(
          `Only ${timeLimitWarningThreshold} minutes left! Please submit!`,
          {
            position: POSITION.TOP_CENTER,
            timeout: 3000,
            draggablePercent: 0.4
          }
        )
        context.emit("test-warning-shown");
      }
    }

    return {
      ...toRefs(state),
      generateId,
      updateQuestionIndex,
      questionOptionSelected,
      subjectiveAnswerUpdated,
      matrixOptionSelected,
      matrixNumericalUpdated,
      clearAnswer,
      endTest,
      endTestByTime,
      currentQuestion,
      questionType,
      questionCorrectAnswer,
      isGradedQuestion,
      currentQuestionResponseAnswer,
      isAttemptValid,
      isQuizAssessment,
      optionalLimitReachedArray,
      questionDisabledArray,
      numericalAnswerUpdated,
      timeLimitWarningThreshold,
      displayTimeLimitWarning
    }
  },
  emits: [
    "update:currentQuestionIndex",
    "update:responses",
    "update:previousOmrResponses",
    "submit-question",
    "end-test",
    "fetch-question-bucket",
    "test-warning-shown",
    "test-optional-warning-shown",
    "submit-omr-question"
  ],
});
</script>

<style>
.truncate {
  @apply whitespace-nowrap overflow-hidden overflow-ellipsis;
  max-width: 10em;
  /*(10em) Adjust this value to determine the maximum width in characters */
}

.scroll-container {
  height: 100vh;
  /* Adjust the height as per your needs */
  overflow: auto;
}
</style>
