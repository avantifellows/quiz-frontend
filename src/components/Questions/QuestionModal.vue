<template>
  <div class="h-full flex flex-col bg-white w-full justify-between absolute">
    <Header
      v-if="isQuizAssessment"
      :hasQuizEnded="hasQuizEnded"
      :hasTimeLimit="quizTimeLimit != null"
      v-model:isPaletteVisible="isPaletteVisible"
      :timeRemaining="timeRemaining"
      :isSessionAnswerRequestProcessing="$props.isSessionAnswerRequestProcessing"
      :warningTimeLimit="timeLimitWarningThreshold"
      :title="title"
      :userId="userId"
      @time-limit-warning="displayTimeLimitWarning"
      @end-test="endTest"
      @end-test-by-time="endTestByTime"
      data-test="header"
    ></Header>
    <div v-if="!isQuizAssessment">
      <div
        class="bg-white-400 w-full justify between">
        <div class="p-4 h-14 bg-white">
          <div class="float-left text-lg sm:text-xl truncate" data-test="test-name">
          {{ $props.title }}
          </div>
          <div class="float-right text-lg sm:text-xl mx-1 px-1 " data-test="user-id">
          Id: {{ $props.userId }}
          </div>
        </div>
      </div>
    </div>
    <div
      class="scroll-container flex flex-col grow bg-white w-full justify-between overflow-hidden"
    >
      <Body
        :text="currentQuestion.text"
        :class="bodyContainerClass"
        :options="currentQuestion.options"
        :correctAnswer="questionCorrectAnswer"
        :questionType="questionType"
        :isGradedQuestion="isGradedQuestion"
        :maxCharLimit="currentQuestion.max_char_limit"
        :isPortrait="isPortrait"
        :imageData="currentQuestion?.image"
        :draftAnswer="draftResponses[currentQuestionIndex]"
        :submittedAnswer="currentQuestionResponseAnswer"
        :isAnswerSubmitted="isAnswerSubmitted"
        :isPaletteVisible="isPaletteVisible"
        :isDraftAnswerCleared="isDraftAnswerCleared"
        :quizType="quizType"
        :hasQuizEnded="hasQuizEnded"
        :optionalLimitReached="optionalLimitReached"
        :questionSetTitle="questionSetTitle"
        :currentQuestionIndex="currentQuestionIndex"
        :questionSetStates="questionSetStates"
        :title="title"
        :subject="subject"
        :testFormat="testFormat"
        :maxMarks="maxMarks"
        :maxQuestionsAllowedToAttempt="maxQuestionsAllowedToAttempt"
        :quizTimeLimit="quizTimeLimit"
        :numQuestions = "numQuestions"
        @option-selected="questionOptionSelected"
        @subjective-answer-entered="subjectiveAnswerUpdated"
        @numerical-answer-entered="numericalAnswerUpdated"
        @navigate="navigateToQuestion"
        :key="reRenderKey"
        data-test="body"
        ref="body"
      ></Body>
      <Footer
        :isAnswerSubmitted="isAnswerSubmitted"
        :isPreviousButtonShown="currentQuestionIndex > 0"
        :isNextButtonShown="currentQuestionIndex != questions.length - 1"
        :isSubmitEnabled="isAttemptValid"
        :quizType="quizType"
        :hasQuizEnded="hasQuizEnded"
        :isSessionAnswerRequestProcessing="$props.isSessionAnswerRequestProcessing"
        :continueAfterAnswerSubmit="$props.continueAfterAnswerSubmit"
        @submit="submitQuestion"
        @continue="showNextQuestion"
        @previous="showPreviousQuestion"
        @clear="clearAnswer"
        data-test="footer"
      ></Footer>
    </div>
  </div>
</template>

<script lang="ts">
import Body from "./Body.vue"
import Footer from "./Footer.vue"
import Header from "./Header.vue"
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
  quizTitleType,
  testFormat
} from "../../types"
import { useToast, POSITION } from "vue-toastification"
const clonedeep = require("lodash.clonedeep");

export default defineComponent({
  name: "QuestionModal",
  components: {
    Body,
    Footer,
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
    isSessionAnswerRequestProcessing: {
      type: Boolean,
      default: false
    },
    continueAfterAnswerSubmit: {
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
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true
    },
    testFormat: {
      type: [null, String] as PropType<testFormat>,
      required: true
    },
  },
  setup(props, context) {
    const state = reactive({
      localCurrentQuestionIndex: props.currentQuestionIndex as number, // local copy of currentQuestionIndex
      localResponses: props.responses as SubmittedResponse[], // local copy of responses
      previousLocalResponse: {} as SubmittedResponse, // save previous answer for current question
      isPortrait: true,
      draftResponses: [] as DraftResponse[], // stores the options selected by the user but not yet submitted
      toast: useToast(),
      isDraftAnswerCleared: false, // whether the draft answer has been cleared but not yet submitted
      isPaletteVisible: false, // whether the question palette is visible
      reRenderKey: false, // a key to re-render a component
      hasEndTestBeenClickedOnce: true
    })

    // display warning when time remaining goes below this threshold (in minutes)
    const timeLimitWarningThreshold: number = 3

    function checkScreenOrientation() {
      state.isPortrait = isScreenPortrait()
    }

    function navigateToQuestion(questionIndex: number) {
      context.emit("fetch-question-bucket", questionIndex)
      state.reRenderKey = !state.reRenderKey
      resetState()
      state.localCurrentQuestionIndex = questionIndex;
      state.isPaletteVisible = false
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
        state.localCurrentQuestionIndex = newValue.valueOf()
        if (!props.hasQuizEnded && optionalLimitReached.value && currentQuestionResponseAnswer.value == null) {
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
      () => state.previousLocalResponse,
      (newValue) => {
        context.emit("update:previousResponse", newValue)
      },
      { deep: true }
    )

    /**
     * triggered upon selecting an option
     */
    function questionOptionSelected(optionIndex: number) {
      if (isQuestionTypeSingleChoice.value) {
        // for MCQ, simply set the option as the current response
        state.draftResponses[props.currentQuestionIndex] = [optionIndex]
        return
      }

      if (isQuestionTypeMultiChoice.value) {
        if (state.draftResponses[props.currentQuestionIndex] == null) {
          state.draftResponses[props.currentQuestionIndex] = []
        }

        // if the selection option was already in the response
        // remove it from the response (uncheck it); otherwise add it (check it)
        // lodash clonedeep clones the array (which may contain any complex object; responses here)
        // not cloning the array leads to update:responses -> changing currentResponse value
        let currentResponse = clonedeep(state.draftResponses[props.currentQuestionIndex])
        if (Array.isArray(currentResponse)) {
          const optionPositionInResponse = currentResponse.indexOf(optionIndex)
          if (optionPositionInResponse != -1) {
            currentResponse.splice(optionPositionInResponse, 1)
            if (currentResponse.length == 0) {
              // if all options unselected, set answer to null
              currentResponse = null;
            }
          } else {
            currentResponse.push(optionIndex)
            currentResponse.sort()
          }
        }
        state.draftResponses[props.currentQuestionIndex] = currentResponse
      }
    }

    function submitQuestion() {
      if (!state.localResponses.length) return
      state.previousLocalResponse = clonedeep(state.localResponses[props.currentQuestionIndex]);
      state.localResponses[props.currentQuestionIndex].answer =
        state.draftResponses[props.currentQuestionIndex]
      context.emit("submit-question")
    }

    function clearAnswer() {
      state.reRenderKey = !state.reRenderKey
      state.draftResponses[props.currentQuestionIndex] = null
      state.isDraftAnswerCleared = true
    }

    function showNextQuestion() {
      // It toggles the reRenderKey from 0 to 1 or 1 to 0. And changing the reRender key, re-renders the component.
      // we reRender the whole component as textarea is holding the details which is not getting updated
      // https://michaelnthiessen.com/force-re-render/
      state.reRenderKey = !state.reRenderKey
      resetState()
      if (
        state.localCurrentQuestionIndex < props.questions.length - 1 ||
        props.hasQuizEnded ||
        !isQuizAssessment.value
      ) {
        // if bucket corresponding to index has not been fetched yet, this emit will fetch it
        // if bucket has already been fetched, emit will have no effect
        context.emit("fetch-question-bucket", state.localCurrentQuestionIndex + 1)

        state.localCurrentQuestionIndex += 1;
      } else {
        state.toast.success(
          'No more questions, please press "End Test" if you are done 👉',
          {
            position: POSITION.TOP_LEFT,
            timeout: 3000,
          }
        )
      }
    }

    function showPreviousQuestion() {
      state.reRenderKey = !state.reRenderKey
      resetState()
      // if bucket corresponding to index has not been fetched yet, this emit will fetch it
      // if bucket has already been fetched, emit will have no effect
      context.emit("fetch-question-bucket", state.localCurrentQuestionIndex - 1)
      state.localCurrentQuestionIndex -= 1
    }

    function resetState() {
      if (
        (state.isDraftAnswerCleared || isAnswerSubmitted.value) &&
        state.draftResponses[props.currentQuestionIndex] !=
          currentQuestionResponseAnswer.value
      ) {
        state.draftResponses[props.currentQuestionIndex] =
          currentQuestionResponseAnswer.value
      }
      state.isDraftAnswerCleared = false
      state.toast.clear() // if toast exists in current state, clear when you switch state
    }

    function numericalAnswerUpdated(answer: number | null) {
      state.draftResponses[props.currentQuestionIndex] = answer
    }

    /** update the attempt to the current question - valid for subjective questions */
    function subjectiveAnswerUpdated(answer: string) {
      state.draftResponses[props.currentQuestionIndex] = answer
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
            `You have answered ${attemptedQuestions} out of ${props.numQuestions} questions. Click on the Question Palette to review unanswered questions before submitting the test. Click the End Test button again to make the final submission.`,
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

    const bodyContainerClass = computed(() => ({
      "mt-36": isQuizAssessment.value
    }))

    const currentQuestion = computed(
      () => props.questions[props.currentQuestionIndex]
    )

    const questionType = computed(() => currentQuestion.value.type)

    const questionCorrectAnswer = computed(
      () => currentQuestion.value?.correct_answer
    )

    const isGradedQuestion = computed(() => currentQuestion.value.graded)

    const isQuestionTypeMultiChoice = computed(
      () => questionType.value == "multi-choice"
    )
    const isQuestionTypeSingleChoice = computed(
      () => questionType.value == "single-choice"
    )
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
      () => props.responses[props.currentQuestionIndex]
    )

    const currentQuestionResponseAnswer = computed(
      () => currentQuestionResponse.value?.answer
    )

    const isAnswerSubmitted = computed(() => {
      if (currentQuestionResponseAnswer.value == null) return false
      if (currentQuestionResponseAnswer.value != null && props.isSessionAnswerRequestProcessing) {
        // answer is set, but session_answer request is still processing
        return false
      }
      if (isQuestionTypeNumericalInteger.value || isQuestionTypeNumericalFloat.value) {
        return true
      }
      if (isQuestionTypeSingleChoice.value || isQuestionTypeMultiChoice.value) {
        return currentQuestionResponseAnswer.value != []
      }
      return true
    })

    const isAttemptValid = computed(() => {
      if (optionalLimitReached.value && currentQuestionResponseAnswer.value == null) {
        // this cannot be answered
        return false
      }
      const currentDraftResponse = state.draftResponses[
        props.currentQuestionIndex
      ] as DraftResponse
      if (currentDraftResponse == null) {
        return false
      }
      if (isQuestionTypeSubjective.value) return currentDraftResponse != ""
      if (isQuestionTypeNumericalInteger.value || isQuestionTypeNumericalFloat.value) {
        return true
      }
      return Array.isArray(currentDraftResponse) && currentDraftResponse.length > 0
    })

    const isQuizAssessment = computed(() => props.quizType == "assessment")

    const optionalLimitReached = computed(() => {
      let numSubmittedResponses = 0
      for (let idx = props.qsetIndexLimits.low; idx < props.qsetIndexLimits.high; idx++) {
        const response = props.responses[idx]
        if (response.answer != null) numSubmittedResponses += 1
      }
      if (numSubmittedResponses >= props.maxQuestionsAllowedToAttempt) return true
      return false
    })

    // instantiating draftResponses here
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
      questionOptionSelected,
      submitQuestion,
      showNextQuestion,
      showPreviousQuestion,
      subjectiveAnswerUpdated,
      clearAnswer,
      endTest,
      endTestByTime,
      navigateToQuestion,
      currentQuestion,
      bodyContainerClass,
      questionType,
      questionCorrectAnswer,
      isGradedQuestion,
      currentQuestionResponseAnswer,
      isAnswerSubmitted,
      isAttemptValid,
      isQuizAssessment,
      optionalLimitReached,
      numericalAnswerUpdated,
      timeLimitWarningThreshold,
      displayTimeLimitWarning
    }
  },
  emits: [
    "update:currentQuestionIndex",
    "update:responses",
    "update:previousResponse",
    "submit-question",
    "end-test",
    "fetch-question-bucket",
    "test-warning-shown",
    "test-optional-warning-shown"
  ],
});
</script>

<style>
.truncate {
  @apply whitespace-nowrap overflow-hidden overflow-ellipsis;
  max-width: 10em; /*(10em) Adjust this value to determine the maximum width in characters */
}
.scroll-container {
  height: 100vh; /* Adjust the height as per your needs */
  overflow: auto;
}
</style>
