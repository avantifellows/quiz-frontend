<template>
  <div class="h-full flex flex-col bg-white w-full justify-between absolute">
    <Header
      v-if="isQuizAssessment"
      :hasQuizEnded="hasQuizEnded"
      v-model:isPaletteVisible="isPaletteVisible"
      @end-test="endTest"
    ></Header>
    <div
      class="flex flex-col grow bg-white w-full justify-between overflow-hidden"
    >
      <Body
        :text="currentQuestion.text"
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
        :currentQuestionIndex="currentQuestionIndex"
        :questionStates="questionStates"
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
  isScreenPortrait,
  isQuestionAnswerCorrect
} from "../../services/Functional/Utilities"
import {
  Question,
  SubmittedResponse,
  DraftResponse,
  quizType,
  paletteItemState,
  questionState
} from "../../types"
import { useToast, POSITION } from "vue-toastification"

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
    quizType: {
      type: String as PropType<quizType>,
      default: "homework"
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
      reRenderKey: false // a key to re-render a component
    })

    function checkScreenOrientation() {
      state.isPortrait = isScreenPortrait()
    }

    function navigateToQuestion(questionIndex: number) {
      state.localCurrentQuestionIndex = questionIndex
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
        const currentResponse = JSON.parse(JSON.stringify(state.draftResponses[props.currentQuestionIndex]))
        // JSON parse + stringify clones the array (which may contain any complex object; responses here)
        // not cloning the array leads to update:responses -> changing currentResponse value
        if (Array.isArray(currentResponse)) {
          const optionPositionInResponse = currentResponse.indexOf(optionIndex)
          if (optionPositionInResponse != -1) {
            currentResponse.splice(optionPositionInResponse, 1)
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
        state.localCurrentQuestionIndex = state.localCurrentQuestionIndex + 1
      } else {
        state.toast.success(
          'No more questions, please press "End Test" if you are done 👉',
          {
            position: POSITION.TOP_LEFT
          }
        )
      }
    }

    function showPreviousQuestion() {
      state.reRenderKey = !state.reRenderKey
      resetState()
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
    }

    function numericalAnswerUpdated(answer: number | null) {
      state.draftResponses[props.currentQuestionIndex] = answer
    }

    /** update the attempt to the current question - valid for subjective questions */
    function subjectiveAnswerUpdated(answer: string) {
      state.draftResponses[props.currentQuestionIndex] = answer
    }

    function endTest() {
      state.localCurrentQuestionIndex = props.questions.length
      context.emit("end-test")
    }

    onUnmounted(() => {
      // remove listeners
      window.removeEventListener("resize", checkScreenOrientation)
    })

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

    const currentQuestionResponse = computed(
      () => props.responses[props.currentQuestionIndex]
    )

    const currentQuestionResponseAnswer = computed(
      () => currentQuestionResponse.value?.answer
    )

    const isAnswerSubmitted = computed(() => {
      if (currentQuestionResponseAnswer.value == null) return false
      if (typeof currentQuestionResponseAnswer.value == "number") {
        return true
      }
      if (isQuestionTypeSingleChoice.value || isQuestionTypeMultiChoice.value) {
        return currentQuestionResponseAnswer.value.length > 0
      }
      return true
    })

    const isAttemptValid = computed(() => {
      const currentDraftResponse = state.draftResponses[
        props.currentQuestionIndex
      ] as DraftResponse
      if (currentDraftResponse == null) {
        return false
      }
      if (isQuestionTypeSubjective.value) return currentDraftResponse != ""
      if (typeof currentDraftResponse == "number") {
        return true
      }
      return currentDraftResponse.length > 0
    })

    const isQuizAssessment = computed(() => props.quizType == "assessment")

    const questionStates = computed(() => {
      const states = [] as paletteItemState[]

      if (props.hasQuizEnded) {
        for (let index = 0; index < props.questions.length; index++) {
          const questionAnswerEvaluation = isQuestionAnswerCorrect(
            props.questions[index],
            props.responses[index].answer
          )
          // we are not adding ungraded questions to the palette
          if (!questionAnswerEvaluation.valid) continue
          let state: questionState
          if (
            !questionAnswerEvaluation.answered ||
            questionAnswerEvaluation.isCorrect == null
          ) {
            state = "neutral"
          } else {
            questionAnswerEvaluation.isCorrect
              ? (state = "success")
              : (state = "error")
          }
          states.push({
            index,
            value: state
          })
        }
      } else {
        for (let index = 0; index < props.questions.length; index++) {
          if (!props.questions[index].graded) continue
          let state: questionState
          if (!props.responses[index].visited) {
            state = "neutral"
          } else {
            if (props.responses[index].answer != null) state = "success"
            else state = "error"
          }
          states.push({
            index,
            value: state
          })
        }
      }

      return states
    })

    // instantiating draftResponses here
    props.responses.forEach((response) => {
      state.draftResponses.push(response.answer)
    })

    // determine the screen orientation when the item modal is created
    checkScreenOrientation()
    // add listener for screen size being changed
    window.addEventListener("resize", checkScreenOrientation)

    return {
      ...toRefs(state),
      questionOptionSelected,
      submitQuestion,
      showNextQuestion,
      showPreviousQuestion,
      subjectiveAnswerUpdated,
      clearAnswer,
      endTest,
      navigateToQuestion,
      currentQuestion,
      questionType,
      questionCorrectAnswer,
      isGradedQuestion,
      currentQuestionResponseAnswer,
      isAnswerSubmitted,
      isAttemptValid,
      isQuizAssessment,
      numericalAnswerUpdated,
      questionStates
    }
  },
  emits: [
    "update:currentQuestionIndex",
    "update:responses",
    "submit-question",
    "end-test"
  ]
})
</script>
