<template>
  <div class="flex flex-col bg-white w-full justify-between">
      <Header
        class="fixed top-0"
        v-if="isQuizAssessment"
        :hasQuizEnded="hasQuizEnded"
        :hasTimeLimit="quizTimeLimit != null"
        :isOmrMode="isOmrMode"
        v-model:isPaletteVisible="isPaletteVisible"
        :timeRemaining="timeRemaining"
        :warningTimeLimit="timeLimitWarningThreshold"
        @time-limit-warning="displayTimeLimitWarning"
        @end-test="endTest"
        @end-test-by-time="endTestByTime"
        data-test="omr-header"
      ></Header>
      <div
        class="flex flex-col grow space-y-10"
      >
        <div class="mt-20 mb-20">
          <div class="grid grid-rows-1 grid-flow-col gap-2 h-10">
            <div
              class="row-span-1 text-left mx-4 text-xl text-base sm:text-xs md:text-base lg:text-lg xl:text-xl 2xl:text-2xl custom:text-md py-2 ">
                <!-- Content for the left column -->
                <p class="truncate my-2" data-test="test-name-omr">{{ $props.title }}</p>
            </div>
            <div class="col-span-2 text-right mx-4">
              <div class="row-span-2 col-span-2 text-right text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-2xl custom:text-md py-4">
                <!-- Content for the right column -->
              <div data-test="user-id-omr">Id: {{ $props.userId }}</div>
              </div>
            </div>
          </div>
          <div
          v-for="(questionSetState, index) in questionSetStates" :key="index" class="space-y-2">
              <div class="bg-gray-300"><p :class="titleTextClass" :data-test="`questionSetTitle-${index}`">{{ questionSetState.title }}</p></div>
              <p :class="instructionTextClass" :data-test="`questionSetInstruction-${index}`">{{ questionSetState.instructionText }}</p>
              <div class="mt-4 space-y-4">
              <OmrItem
                  v-for="(questionState, qindex) in questionSetState.paletteItems"
                  :class="{ 'mt-4': qindex == 0 }"
                  :options="$props.questions[questionState.index].options"
                  :correctAnswer="$props.questions[questionState.index].correct_answer"
                  :questionType="$props.questions[questionState.index].type"
                  :isGradedQuestion="$props.questions[questionState.index].graded"
                  :maxCharLimit="$props.questions[questionState.index].max_char_limit"
                  :isPortrait="isPortrait"
                  :quizType="quizType"
                  :hasQuizEnded="hasQuizEnded"
                  :submittedAnswer="draftResponses[questionState.index]"
                  :isQuestionDisabled="questionDisabledArray[questionState.index]"
                  :currentQuestionIndex="questionState.index"
                  @option-selected="questionOptionSelected"
                  @subjective-answer-entered="subjectiveAnswerUpdated"
                  @numerical-answer-entered="numericalAnswerUpdated"
                  :key="questionState.index"
                  :data-test="`OmrItem-${questionState.index}`"
                  :ref="`omritem-${questionState.index}`"
              ></OmrItem>
              </div>
          </div>
        </div>

        <!-- footer -->
        <div
          class="flex w-full lg:p-6 justify-between z-50 place-self-end fixed bottom-0"
          :class="{
            'bg-white p-4': !isQuizAssessment,
            'bg-gray-200 py-2 px-2': isQuizAssessment,
          }"
        ></div>
      </div>
  </div>
</template>

<script lang="ts">
import Header from "../Questions/Header.vue"
import OmrItem from "./OmrItem.vue"
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
} from "../../services/Functional/Utilities";
import {
  Question,
  SubmittedResponse,
  DraftResponse,
  quizType,
  QuestionSetIndexLimits,
  questionSetPalette,
  TimeLimit,
  quizTitleType
} from "../../types"
import { useToast, POSITION } from "vue-toastification"

const { v4: uuidv4 } = require('uuid');

export default defineComponent({
  name: "OmrModal",
  components: {
    OmrItem,
    Header
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
    isOmrMode: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      default: ""
    },
    title: {
      required: true,
      type: [null, String] as PropType<quizTitleType>,
    }
  },
  setup(props, context) {
    const state = reactive({
      localCurrentQuestionIndex: props.currentQuestionIndex as number, // local copy of currentQuestionIndex
      localResponses: props.responses as SubmittedResponse[], // local copy of responses
      isPortrait: true,
      draftResponses: [] as DraftResponse[], // stores the options selected by the user but not yet submitted
      toast: useToast(),
      isDraftAnswerCleared: false, // whether the draft answer has been cleared but not yet submitted
      isPaletteVisible: false, // whether the question palette is visible
      reRenderKey: false, // a key to re-render a component
      hasEndTestBeenClickedOnce: true,
      instructionTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 m-2 leading-tight whitespace-pre-wrap text-slate-500",
      titleTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 m-2 py-2 font-bold leading-tight whitespace-pre-wrap bg-gray-300",
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

    /**
       * triggered upon selecting an option
       */
    function questionOptionSelected(draftAnswer: DraftResponse, newQuestionIndex: number) {
      updateQuestionIndex(newQuestionIndex);
      if (!state.localResponses.length) return
      state.localResponses[state.localCurrentQuestionIndex].answer = draftAnswer
      context.emit("submit-omr-question", newQuestionIndex); // submit answer whenever there is an update / option selected
    }

    function clearAnswer() {
      // no clearAnswer functionality for OmrModal
    }

    function numericalAnswerUpdated(answer: number | null, newQuestionIndex: number) {
      updateQuestionIndex(newQuestionIndex);
      state.localResponses[state.localCurrentQuestionIndex].answer = answer
      context.emit("submit-omr-question", newQuestionIndex);
    }

    /** update the attempt to the current question - valid for subjective questions */
    function subjectiveAnswerUpdated(answer: string, newQuestionIndex: number) {
      updateQuestionIndex(newQuestionIndex);
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
        state.toast.success(
              `You have answered ${attemptedQuestions} out of ${props.numQuestions} questions. Please verify your responses and click End Test button again to make final submission.`,
              {
                position: POSITION.TOP_CENTER,
                timeout: 5000,
                draggablePercent: 0.4
              }
        )
        state.hasEndTestBeenClickedOnce = false;
      } else {
        state.localCurrentQuestionIndex = props.questions.length
        context.emit("end-test")
      }
    }

    function endTestByTime() {
      // same function as above -- can update later for new feature
      if (!props.hasQuizEnded && isQuizAssessment.value) {
        state.localCurrentQuestionIndex = props.questions.length
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
        if (numSubmittedResponses == questionSetState.maxQuestionsAllowedToAttempt) arr[idx] = true;
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
    "submit-question",
    "end-test",
    "fetch-question-bucket",
    "test-warning-shown",
    "test-optional-warning-shown",
    "submit-omr-question"
  ],
});
</script>
