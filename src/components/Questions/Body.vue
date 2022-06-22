<template>
  <div
    class="flex relative h-full overflow-y-auto"
    :class="{ 'bg-gray-50': isPaletteVisible }"
  >
    <QuestionPalette
      v-if="isPaletteVisible"
      :hasQuizEnded="hasQuizEnded"
      :questionStates="questionStates"
      :currentQuestionIndex="currentQuestionIndex"
      class="absolute w-full h-full sm:w-2/3 lg:w-1/2 xl:w-1/3 z-10"
      @navigate="navigateToQuestion"
      data-test="questionPalette"
    >
    </QuestionPalette>

    <div class="overflow-y-auto flex flex-col w-full mt-10">
      <!-- question text -->
      <div class="mx-6 md:mx-10">
        <p :class="questionTextClass" data-test="text" v-html="text"></p>
      </div>
      <div :class="orientationClass">
        <!-- loading spinner when question image is loading -->
        <div
          :class="questionImageAreaClass"
          class="flex justify-center"
          v-if="isImageLoading"
        >
          <BaseIcon
            name="spinner-solid"
            iconClass="animate-spin h-4 w-4 object-scale-down"
          />
        </div>
        <!-- question image container -->
        <div :class="questionImageContainerClass" v-if="isQuestionImagePresent">
          <img
            :src="imageData.url"
            class="object-contain h-full w-full"
            :alt="imageData.alt_text"
            @load="stopImageLoading"
            ref="questionImage"
            :class="{ invisible: isImageLoading }"
          />
        </div>
        <!-- option container -->
        <div
          v-if="areOptionsVisible"
          class="flex"
          :class="answerContainerClass"
          data-test="optionContainer"
        >
          <ul class="w-full">
            <li class="list-none space-y-1 flex flex-col">
              <div
                v-for="(option, optionIndex) in options"
                :key="optionIndex"
                :class="[optionBackgroundClass(optionIndex), optionTextClass]"
                :data-test="`optionContainer-${optionIndex}`"
              >
                <!-- each option is defined here -->
                <!-- adding <label> so that touch input is just not limited to the radio/checkbox button -->
                <label :class="labelClass(option)">
                  <!-- understand the meaning of the attributes here:
                    https://www.w3schools.com/tags/att_input_type_radio.asp -->

                  <input
                    :type="optionInputType"
                    name="option"
                    class="place-self-center text-primary focus:ring-0 disabled:cursor-not-allowed"
                    style="box-shadow: none"
                    @click="selectOption(optionIndex)"
                    :checked="isOptionMarked(optionIndex)"
                    :disabled="isAnswerDisabled"
                    :data-test="`optionSelector-${optionIndex}`"
                  />
                  <div
                    v-html="option.text"
                    class="ml-2 h-full place-self-center text-base sm:text-lg"
                    :data-test="`option-${optionIndex}`"
                  ></div>
                </label>
              </div>
            </li>
          </ul>
        </div>
        <!-- subjective question answer -->
        <div
          v-if="isQuestionTypeSubjective"
          class="flex flex-col"
          :class="answerContainerClass"
          data-test="subjectiveAnswerContainer"
        >
          <!-- input area for the answer -->
          <Textarea
            v-model:value="subjectiveAnswer"
            class="px-2 w-full"
            :boxStyling="subjectiveAnswerBoxStyling"
            placeholder="Enter your answer here"
            :isDisabled="isAnswerDisabled"
            :maxHeightLimit="250"
            @keypress="preventKeypressIfApplicable"
            data-test="subjectiveAnswer"
          ></Textarea>
          <!-- character limit -->
          <div
            class="flex items-end px-6 mt-2"
            v-if="hasCharLimit && !isAnswerSubmitted"
            data-test="charLimitContainer"
          >
            <p
              class="text-sm sm:text-base lg:text-lg font-bold"
              :class="maxCharLimitClass"
              data-test="charLimit"
            >
              {{ charactersLeft }}
            </p>
          </div>
        </div>
        <!-- Numerical question answer -->
        <div
          v-if="isQuestionTypeNumericalFloat || isQuestionTypeNumericalInteger"
          class="flex flex-col"
          :class="answerContainerClass"
          data-test="numericalAnswerContainer"
        >
          <!-- input area for the answer -->
          <Textarea
            v-model:value="numericalAnswer"
            class="px-2 w-full"
            :boxStyling="numericalAnswerBoxStyling"
            placeholder="Enter your answer here. Only numbers are allowed"
            :isDisabled="isAnswerDisabled"
            :maxHeightLimit="250"
            @keypress="preventKeypressIfApplicable"
            data-test="numericalAnswer"
          ></Textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Textarea from "../UI/Text/Textarea.vue"
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  watch,
  PropType,
  onMounted,
  onUpdated
} from "vue"
import BaseIcon from "../UI/Icons/BaseIcon.vue"
import { quizType, paletteItemState } from "../../types"
import QuestionPalette from "./Palette/QuestionPalette.vue"

export default defineComponent({
  components: {
    BaseIcon,
    Textarea,
    QuestionPalette
  },
  props: {
    text: {
      default: "",
      type: String
    },
    options: {
      default: () => [],
      type: Array
    },
    correctAnswer: {
      default: null,
      type: [String, Number, Array]
    },
    /** answer for the question which has been submitted */
    submittedAnswer: {
      default: null,
      type: [String, Number, Array]
    },
    /** answer for the question which has been entered but not submitted */
    draftAnswer: {
      default: null,
      type: [String, Number, Array]
    },
    isAnswerSubmitted: {
      default: false,
      type: Boolean
    },
    questionType: {
      default: "single-choice",
      type: String
    },
    /** the character limit to be used if present */
    maxCharLimit: {
      default: -1,
      type: Number
    },
    /** data of the image to be shown on a question. Contains URL and alt_text */
    imageData: {
      default: null,
      type: Object
    },
    isPortrait: {
      default: false,
      type: Boolean
    },
    isGradedQuestion: {
      default: true,
      type: Boolean
    },
    quizType: {
      type: String as PropType<quizType>,
      default: "homework"
    },
    hasQuizEnded: {
      type: Boolean,
      default: false
    },
    /** whether the draft answer has been cleared but not yet submitted */
    isDraftAnswerCleared: {
      default: false,
      type: Boolean
    },
    /** whether the question palette is visible */
    isPaletteVisible: {
      type: Boolean,
      default: false
    },
    questionStates: {
      type: Array as PropType<paletteItemState[]>,
      default: () => []
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    }
  },
  setup(props, context) {
    const isQuizAssessment = computed(() => props.quizType == "assessment")
    const state = reactive({
      isImageLoading: false,
      // set containing the question types in which options are present
      questionTypesWithOptions: new Set(["single-choice", "multi-choice"]),
      nonGradedAnswerClass: "bg-gray-200",
      correctOptionClass: "text-white bg-green-500",
      wrongOptionClass: "text-white bg-red-500",
      questionTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 m-2 font-bold leading-tight whitespace-pre-wrap",
      optionTextClass:
        "p-2 text-lg md:text-xl lg:text-2xl border rounded-md mx-2 whitespace-pre-wrap",
      subjectiveAnswer: null as string | null, // holds the answer to the subjective question
      numericalAnswer: null as number | null // holds the answer to the numerical question
    })

    /** stop the loading spinner when the image has been loaded **/
    function stopImageLoading() {
      state.isImageLoading = false
    }

    /**
     * returns the background class for an option
     *
     * handles the 4 different cases:
     * - the given option has not been selected
     * - question is graded and given option is the right answer
     * - question is graded and given option is the wrong answer
     * - question is non-graded and the given option has been selected
     * @param {Number} optionIndex - index of the option
     */
    function optionBackgroundClass(optionIndex: Number) {
      if (
        !props.isAnswerSubmitted ||
        props.isDraftAnswerCleared ||
        typeof props.correctAnswer == "string" || // check for typescript
        typeof props.submittedAnswer == "string" || // check for typescript
        typeof props.correctAnswer == "number" || // check for typescript
        typeof props.submittedAnswer == "number" // check for typescript
      ) {
        return
      }

      if (isQuizAssessment.value && !props.hasQuizEnded) {
        if (props.submittedAnswer.indexOf(optionIndex) != -1) {
          return state.nonGradedAnswerClass
        }
        return
      }

      if (
        props.isGradedQuestion &&
        props.correctAnswer.indexOf(optionIndex) != -1
      ) {
        return state.correctOptionClass
      }
      if (props.submittedAnswer.indexOf(optionIndex) != -1) {
        if (!props.isGradedQuestion) return state.nonGradedAnswerClass
        return state.wrongOptionClass
      }
    }

    // whether the given option index should be marked selected
    function isOptionMarked(optionIndex: Number) {
      return (
        props.draftAnswer != null &&
        typeof props.draftAnswer != "string" &&
        typeof props.draftAnswer != "number" &&
        props.draftAnswer.indexOf(optionIndex) != -1
      )
    }

    function selectOption(optionIndex: Number) {
      context.emit("option-selected", optionIndex)
    }

    function labelClass(optionText: String) {
      return [{ "h-4 sm:h-5": optionText == "" }, "flex content-center"]
    }

    function startImageLoading() {
      state.isImageLoading = true
    }

    function checkIfNumberContainsDecimal(x: Number | null) {
      return String(x).includes(".")
    }

    function isNumberLarge(x: Number) {
      const maxValue: number = 1e10
      return x > maxValue
    }

    function checkIfNumberExceedsDecimalDigitLimit(x: Number | null) {
      const maxDecimalPlaces: number = 10 // max length of digits after decimal
      return String(x).includes(".") && String(x).split(".")[1].length > maxDecimalPlaces - 1
    }

    function preventKeypressIfApplicable(event: KeyboardEvent) {
      if (isQuestionTypeSubjective.value) {
        // checks if character limit is reached in case it is set
        if (!hasCharLimit.value) return
        if (!charactersLeft.value) {
          event.preventDefault()
          return
        }
      }
      if (isQuestionTypeNumericalFloat.value) {
        const keysAllowed: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
        const keyPressed: string = event.key
        if (!keysAllowed.includes(keyPressed) || (event.key == "." && checkIfNumberContainsDecimal(state.numericalAnswer))) {
          event.preventDefault()
        }
        if (isNumberLarge(Number(state.numericalAnswer + event.key))) {
          event.preventDefault()
        }
        if (checkIfNumberExceedsDecimalDigitLimit(state.numericalAnswer)) {
          event.preventDefault()
        }
      }
      if (isQuestionTypeNumericalInteger.value) {
        const keysAllowed: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        const keyPressed: string = event.key
        if (!keysAllowed.includes(keyPressed)) {
          event.preventDefault()
        }
        if (isNumberLarge(Number(state.numericalAnswer + event.key))) {
          event.preventDefault()
        }
      }
    }

    function navigateToQuestion(questionIndex: number) {
      context.emit("navigate", questionIndex)
    }

    // styling class for the question image and loading spinner containers
    const questionImageAreaClass = computed(() => ({
      "h-56 mb-4": props.isPortrait,
      "h-28 sm:h-36 md:h-48 lg:h-56 xl:h-80 w-1/2": !props.isPortrait
    }))

    // styling class for the image container
    const questionImageContainerClass = computed(() => [
      questionImageAreaClass.value,
      {
        hidden: state.isImageLoading
      },
      "border rounded-md"
    ])

    const isQuestionImagePresent = computed(
      () => props.imageData != null && props.imageData.url != null
    )
    const areOptionsVisible = computed(() =>
      state.questionTypesWithOptions.has(props.questionType)
    )
    const isQuestionTypeSubjective = computed(
      () => props.questionType == "subjective"
    )
    const isQuestionTypeMultiChoice = computed(
      () => props.questionType == "multi-choice"
    )
    const isQuestionTypeSingleChoice = computed(
      () => props.questionType == "single-choice"
    )
    const isQuestionTypeNumericalInteger = computed(
      () => props.questionType == "numerical-integer"
    )
    const isQuestionTypeNumericalFloat = computed(
      () => props.questionType == "numerical-float"
    )

    // styling class to decide orientation of image + options
    // depending on portrait/landscape orientation
    const orientationClass = computed(() => {
      return [
        {
          "content-center": isQuestionImagePresent.value && !props.isPortrait,
          "flex-col": isQuestionImagePresent.value && props.isPortrait
        },
        "flex mx-6 md:mx-10 py-4"
      ]
    })

    const optionInputType = computed(() => {
      if (!areOptionsVisible.value) return null
      if (isQuestionTypeSingleChoice.value) return "radio"
      if (isQuestionTypeMultiChoice.value) return "checkbox"
      return null
    })

    /**
     * classes for the various containers corresponding to the possible types of answers
     * to the various types of questions (options for MCQ, textarea for subjective)
     */
    const answerContainerClass = computed(() => ({
      "w-1/2": !props.isPortrait && isQuestionImagePresent.value,
      "w-full":
        props.isPortrait || (!props.isPortrait && !isQuestionImagePresent.value)
    }))

    const hasCharLimit = computed(() => props.maxCharLimit != -1)

    const maxCharLimitClass = computed(() => {
      // class for the character limit text
      if (charactersLeft.value > 0.2 * props.maxCharLimit) {
        return "text-gray-400"
      } else if (charactersLeft.value > 0.1 * props.maxCharLimit) {
        return "text-yellow-500"
      } else return "text-red-400"
    })
    const charactersLeft = computed(() => {
      // number of characters left for the subjective answer if a limit is given
      return props.maxCharLimit - currentAnswerLength.value
    })
    const currentAnswerLength = computed(() => {
      // length of the current answer (for subjective question)
      if (state.subjectiveAnswer == null) return 0
      return state.subjectiveAnswer.length
    })
    const defaultSubjectiveAnswer = computed(() => {
      // the default answer to be shown for the subjective question
      if (
        props.submittedAnswer != null &&
        typeof props.submittedAnswer == "string" &&
        !props.isDraftAnswerCleared
      ) {
        return props.submittedAnswer
      }
      if (typeof props.draftAnswer == "string") {
        return props.draftAnswer
      }
      return ""
    })
    const defaultNumericalAnswer = computed(() => {
      if (
        props.submittedAnswer != null &&
        typeof props.submittedAnswer == "number" &&
        !props.isDraftAnswerCleared
      ) {
        return props.submittedAnswer
      }
      if (typeof props.draftAnswer == "number") {
        return props.draftAnswer
      }
      return null
    })
    const isAnswerDisabled = computed(
      () =>
        (props.isAnswerSubmitted && !isQuizAssessment.value) ||
        props.hasQuizEnded
    )

    const subjectiveAnswerBoxStyling = computed(() => [
      {
        "bg-gray-100": props.isAnswerSubmitted
      },
      "bp-420:h-20 sm:h-28 md:h-36 px-4 placeholder-gray-400 focus:border-gray-200 focus:ring-primary disabled:cursor-not-allowed"
    ])

    const numericalAnswerBoxStyling = computed(() => [
      {
        "text-green-500 border-green-500":
          props.submittedAnswer == props.correctAnswer &&
          props.isAnswerSubmitted &&
          props.isGradedQuestion &&
          (!isQuizAssessment.value ||
            (isQuizAssessment.value && props.hasQuizEnded)),
        "text-red-500 border-red-400":
          props.submittedAnswer != props.correctAnswer &&
          props.isAnswerSubmitted &&
          props.isGradedQuestion &&
          (!isQuizAssessment.value ||
            (isQuizAssessment.value && props.hasQuizEnded)),
        "bg-gray-100":
          (props.isAnswerSubmitted && !props.isGradedQuestion) ||
          (isQuizAssessment.value && !props.hasQuizEnded)
      },
      "bp-420:h-20 sm:h-28 md:h-36 px-4 placeholder-gray-400 focus:border-gray-200 focus:ring-primary disabled:cursor-not-allowed"
    ])

    state.subjectiveAnswer = defaultSubjectiveAnswer.value
    state.numericalAnswer = defaultNumericalAnswer.value

    watch(
      () => props.imageData,
      (newValue) => {
        // invoked when another item pops up which has an image
        if (newValue != null) startImageLoading()
      },
      { deep: true }
    )

    watch(
      () => props.draftAnswer,
      (newValue, oldValue) => {
        // specific to subjective and numerical questions
        // when the draft answer is updated,
        // update the subjective and numerical answer too
        if (typeof newValue == "string" || (newValue == null && typeof oldValue == "string")) {
          state.subjectiveAnswer = newValue
        }
        if (typeof newValue == "number" || (newValue == null && typeof oldValue == "number")) {
          if (newValue != Number(state.numericalAnswer)) {
            state.numericalAnswer = newValue
          }
        }
      }
    )

    watch(
      () => state.numericalAnswer,
      (newValue) => {
        if (String(newValue) == '' || newValue == null) {
          context.emit('numerical-answer-entered', null) // when entire answer is deleted, set draftAnswer as null
        } else {
          context.emit("numerical-answer-entered", Number(state.numericalAnswer))
        }
      }
    )

    watch(
      () => state.subjectiveAnswer,
      (newValue) => {
        if (
          newValue != null &&
          hasCharLimit.value &&
          newValue.length > props.maxCharLimit
        ) {
          // prevent answers more than the character limit from being entered via copy pasting
          state.subjectiveAnswer = newValue.substring(0, props.maxCharLimit)
        }
        context.emit("subjective-answer-entered", state.subjectiveAnswer)
      }
    )

    if (isQuestionImagePresent.value) startImageLoading()

    onMounted(() => {
      // Force render any math on the page when component is mounted
      // @ts-ignore
      if ("MathJax" in window) (window.MathJax as any).typeset()
    })

    onUpdated(() => {
      // Force render any math on the page when component is updated
      // @ts-ignore
      if ("MathJax" in window) (window.MathJax as any).typeset()
    })

    return {
      ...toRefs(state),
      stopImageLoading,
      optionBackgroundClass,
      isOptionMarked,
      selectOption,
      labelClass,
      preventKeypressIfApplicable,
      navigateToQuestion,
      questionImageAreaClass,
      questionImageContainerClass,
      isQuestionImagePresent,
      areOptionsVisible,
      isQuestionTypeSubjective,
      isQuestionTypeMultiChoice,
      isQuestionTypeSingleChoice,
      orientationClass,
      optionInputType,
      answerContainerClass,
      hasCharLimit,
      charactersLeft,
      maxCharLimitClass,
      isQuizAssessment,
      isAnswerDisabled,
      subjectiveAnswerBoxStyling,
      numericalAnswerBoxStyling,
      isQuestionTypeNumericalFloat,
      isQuestionTypeNumericalInteger
    }
  },
  emits: [
    "option-selected",
    "subjective-answer-entered",
    "numerical-answer-entered",
    "navigate"
  ]
})
</script>

<style>
/* width */
::-webkit-scrollbar {
  width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
