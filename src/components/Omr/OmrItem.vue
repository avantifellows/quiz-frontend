<template>
  <div class="flex h-full">
    <div class="flex flex-row w-full">
      <!-- question number and type information-->
      <div class="basis-3/12">
        <p
          :class="questionHeaderTextClass"
          data-test="question-header-text"
          v-html="questionHeaderText"
        ></p>
      </div>
      <div :class="orientationClass">
        <!-- option container -->
        <div
          v-if="areOptionsVisible"
          class="flex"
          :class="answerContainerClass"
          data-test="optionContainer"
        >
          <ul class="w-full">
            <li class="list-none flex flex-row">
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

                  <!-- radio button rely on names to decide what gets to be checked -->
                  <!-- so ensure unique names for all radio buttons -->
                  <input
                    :type="optionInputType"
                    :name="`option-${optionIndex}-${$props.currentQuestionIndex}`"
                    class="place-self-center text-primary focus:ring-0 disabled:cursor-not-allowed"
                    style="box-shadow: none"
                    @click="selectOption(optionIndex)"
                    :checked="isOptionMarked(optionIndex)"
                    :disabled="isAnswerDisabled"
                    :data-test="`optionSelector-${optionIndex}`"
                  />
                  <!-- assuming max 12 options  -->
                  <div
                    v-html="'ABCDEFGHIJKL'.split('')[optionIndex]"
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
            class="px-1 w-full"
            :boxStyling="subjectiveAnswerBoxStyling"
            placeholder="Enter your answer here"
            :isDisabled="isAnswerDisabled"
            :maxHeightLimit="250"
            @beforeinput="preventKeypressIfApplicable"
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
          <!-- answer display -->
          <div
            v-if="hasQuizEnded"
            class="px-1 text-lg mt-2"
            data-test="subjectiveCorrectAnswer"
          >
            Correct Answer: {{ correctAnswer }}
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
            class="px-1 w-full"
            :boxStyling="numericalAnswerBoxStyling"
            placeholder="Only numbers are allowed"
            :inputMode="getInputMode"
            :isDisabled="isAnswerDisabled"
            :maxHeightLimit="250"
            @beforeinput="preventKeypressIfApplicable"
            data-test="numericalAnswer"
          ></Textarea>
          <!-- answer display -->
          <div
            v-if="hasQuizEnded"
            class="px-1 text-lg mt-2"
            data-test="numericalCorrectAnswer"
          >
            Correct Answer: {{ correctAnswer }}
          </div>
        </div>
        <!-- Matrix match answer -->
        <div
          v-if="isQuestionTypeMatrixMatch"
          class="flex flex-col items-center"
          :class="answerContainerClass"
          data-test="matrixMatchContainer"
        >
          <ul class="max-w-screen-md w-full">
            <li class="list-none space-y-1 flex flex-col">
              <!-- Create the matrix match table -->
              <table class="border-collapse border border-gray-200 mx-auto">
                <thead>
                  <tr>
                    <th></th>
                    <th
                      v-for="(column, columnIndex) in $props.matrixSize?.[1] ||
                      5"
                      :key="columnIndex"
                      class="border border-gray-200 text-center"
                    >
                      {{ getColumnLabel(columnIndex) }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in $props.matrixSize?.[0] || 4"
                    :key="rowIndex"
                  >
                    <td class="border border-gray-200 text-center">
                      {{ "ABCD"[rowIndex] }}
                    </td>
                    <td
                      v-for="(column, columnIndex) in $props.matrixSize?.[1] ||
                      5"
                      :key="columnIndex"
                      class="border border-gray-200 text-center"
                    >
                      <div
                        :class="
                          optionBackgroundClass(
                            convertMatrixMatchOptionToString(
                              rowIndex,
                              columnIndex
                            )
                          )
                        "
                      >
                        <input
                          type="checkbox"
                          :id="`${rowIndex}-${columnIndex}`"
                          :name="`${rowIndex}-${columnIndex}-${$props.currentQuestionIndex}`"
                          :value="`${columnIndex}`"
                          :disabled="isAnswerDisabled"
                          class="place-self-center text-primary focus:ring-0 disabled:cursor-not-allowed"
                          style="box-shadow: none"
                          @click="
                            selectOption(
                              convertMatrixMatchOptionToString(
                                rowIndex,
                                columnIndex
                              )
                            )
                          "
                          :checked="
                            isMatrixMatchOptionMarked(
                              convertMatrixMatchOptionToString(
                                rowIndex,
                                columnIndex
                              )
                            )
                          "
                          :data-test="`matrixMatchSelector-${rowIndex}-${columnIndex}`"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </li>
          </ul>
          <!-- answer display -->
          <div
            v-if="hasQuizEnded"
            class="px-2 text-lg mt-2"
            data-test="matrixMatchCorrectAnswer"
          >
            Correct Answer: {{ correctAnswer }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Textarea from "../UI/Text/Textarea.vue";
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  watch,
  PropType,
  onMounted,
  onUpdated,
} from "vue";

import { quizType, questionType, DraftResponse } from "../../types";

const MAX_LENGTH_NUMERICAL_CHARACTERS: number = 10; // max length of characters in numerical answer textbox

const clonedeep = require("lodash.clonedeep");

export default defineComponent({
  components: {
    Textarea,
  },
  props: {
    options: {
      default: () => [],
      type: Array,
    },
    correctAnswer: {
      default: null,
      type: [String, Number, Array],
    },
    /** submitted answer -- used to initialize omr-item's draft answer when quiz is resumed */
    submittedAnswer: {
      default: null,
      type: [String, Number, Array],
    },
    questionType: {
      default: questionType.SINGLE_CHOICE,
      type: String as PropType<questionType>,
    },
    /** the character limit to be used if present */
    maxCharLimit: {
      default: -1,
      type: Number,
    },
    /** matrix size for matrix match question */
    matrixSize: {
      default: () => [4, 5],
      type: Array,
    },
    /** data of the image to be shown on a question. Contains URL and alt_text */
    isPortrait: {
      default: false,
      type: Boolean,
    },
    isGradedQuestion: {
      default: true,
      type: Boolean,
    },
    quizType: {
      type: String as PropType<quizType>,
      default: "homework",
    },
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
    /** whether the user has attempted all available questions
     * based on question set's optional limit
     */
    isQuestionDisabled: {
      type: Boolean,
      default: false,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
  },
  setup(props, context) {
    const isQuizAssessment = computed(
      () => props.quizType == "assessment" || props.quizType == "omr-assessment"
    );
    const state = reactive({
      questionTypesWithOptions: new Set([
        questionType.SINGLE_CHOICE,
        questionType.MULTI_CHOICE,
      ]),
      draftAnswer: props.submittedAnswer as DraftResponse, // answer for the current question
      nonGradedAnswerClass: "bg-gray-200",
      correctOptionClass: "text-white bg-green-500 border rounded-md",
      skippedCorrectOptionClass: "border-4 border-green-500 rounded-md",
      wrongOptionClass: "text-white bg-red-500 border rounded-md",
      disabledOptionClass: "bg-gray-200",
      questionHeaderTextClass:
        "text-lg md:text-xl lg:text-2xl mx-2 md:mx-10 py-6 text-center leading-tight whitespace-pre-wrap",
      questionTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 mt-6 m-2 font-bold leading-tight whitespace-pre-wrap",
      optionTextClass:
        "p-2 text-lg md:text-xl lg:text-2xl border rounded-md mx-2 whitespace-pre-wrap",
      subjectiveAnswer: null as string | null, // holds the answer to the subjective question
      numericalAnswer: null as number | null, // holds the answer to the numerical question
    });

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
    function optionBackgroundClass(answer: number | string) {
      // for omr-mode, when answer is disabled, gray the option box
      if (isAnswerDisabled.value && !props.hasQuizEnded) {
        return state.disabledOptionClass;
      }
      if (
        (!isAnswerSubmitted.value && !props.hasQuizEnded) || // before quiz has ended, if answer isn't submitted
        typeof props.correctAnswer == "string" || // check for typescript
        typeof state.draftAnswer == "string" || // check for typescript
        typeof props.correctAnswer == "number" || // check for typescript
        typeof state.draftAnswer == "number" // check for typescript
      ) {
        return;
      }
      if (
        (!isQuizAssessment.value || props.hasQuizEnded) && // display colors if its a homework or if its assessment and quiz ended
        props.isGradedQuestion &&
        props.correctAnswer.indexOf(answer) != -1
      ) {
        if (
          state.draftAnswer != null &&
          typeof state.draftAnswer != "string" &&
          typeof state.draftAnswer != "number" &&
          (state.draftAnswer as (string | number)[]).indexOf(answer) != -1
        ) {
          // if both correct and submitted option
          return state.correctOptionClass;
        }
        // if correct but not in submitted option
        return state.skippedCorrectOptionClass;
      }
      if (
        (!isQuizAssessment.value || props.hasQuizEnded) &&
        state.draftAnswer != null &&
        (state.draftAnswer as (string | number)[]).indexOf(answer) != -1
      ) {
        if (!props.isGradedQuestion) return state.nonGradedAnswerClass;
        return state.wrongOptionClass;
      }
    }

    // whether the given option index should be marked selected
    function isOptionMarked(optionIndex: number) {
      return (
        state.draftAnswer != null &&
        typeof state.draftAnswer != "string" &&
        typeof state.draftAnswer != "number" &&
        (state.draftAnswer as (string | number)[]).indexOf(optionIndex) != -1
      );
    }

    function getRowLabel(rowIndex: number) {
      return "ABCDEFGHIJ"[rowIndex]; // assume max rows = 10
    }

    function getColumnLabel(columnIndex: number) {
      return "PQRSTUVWXYZ"[columnIndex]; // assume max cols = 11
    }

    function convertMatrixMatchOptionToString(
      rowIndex: number,
      columnIndex: number
    ) {
      const rowLetter = getRowLabel(rowIndex);
      const colLetter = getColumnLabel(columnIndex);
      return rowLetter + colLetter;
    }

    function isMatrixMatchOptionMarked(matrixMatchAnswer: string) {
      return (
        state.draftAnswer != null &&
        typeof state.draftAnswer != "string" &&
        typeof state.draftAnswer != "number" &&
        (state.draftAnswer as (string | number)[]).indexOf(matrixMatchAnswer) !=
          -1
      );
    }

    /**
     * triggered upon selecting an option
     */
    function selectOption(answer: number | string) {
      if (isQuestionTypeSingleChoice.value) {
        // for MCQ, simply set the option as the current response
        let currentResponse = clonedeep(state.draftAnswer);
        if (
          currentResponse != null &&
          Array.isArray(currentResponse) &&
          currentResponse[0] == answer
        ) {
          // if user has selected same radio button again
          currentResponse = null;
        } else {
          currentResponse = [answer];
        }
        state.draftAnswer = currentResponse;
      }

      if (isQuestionTypeMultiChoice.value || isQuestionTypeMatrixMatch.value) {
        if (state.draftAnswer == null) {
          state.draftAnswer = [];
        }

        // if the selection option was already in the response
        // remove it from the response (uncheck it); otherwise add it (check it)
        // lodash clonedeep clones the array (which may contain any complex object; responses here)
        // not cloning the array leads to update:responses -> changing currentResponse value
        let currentResponse = clonedeep(state.draftAnswer);
        if (Array.isArray(currentResponse)) {
          const optionPositionInResponse = currentResponse.indexOf(answer);
          if (optionPositionInResponse != -1) {
            currentResponse.splice(optionPositionInResponse, 1);
            if (currentResponse.length == 0) {
              // if all options unselected, set answer to null
              currentResponse = null;
            }
          } else {
            currentResponse.push(answer);
            currentResponse.sort();
          }
        }
        state.draftAnswer = currentResponse;
      }

      context.emit(
        "option-selected",
        state.draftAnswer,
        props.currentQuestionIndex
      );
    }

    function labelClass(optionText: String) {
      return [{ "h-4 sm:h-5": optionText == "" }, "flex content-center"];
    }

    function doesNumberContainDecimal(x: Number | null) {
      return String(x).includes(".");
    }

    function doNumericalCharactersExceedLimit(x: Number | null) {
      return String(x).length >= MAX_LENGTH_NUMERICAL_CHARACTERS;
    }

    function preventKeypressIfApplicable(event: InputEvent) {
      function showErrorNotification(message: string) {
        const notification = document.createElement("div");
        notification.className = "error-notification";
        notification.innerText = message;

        // Styling the notification
        Object.assign(notification.style, {
          position: "fixed",
          bottom: "80px",
          right: "20px",
          backgroundColor: "#f44336",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          zIndex: 1000,
        });

        document.body.appendChild(notification);

        // Automatically remove the notification after 3 seconds
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }

      if (event.data == null) {
        // prevent "Enter" key in android browser decimal keypad mode
        if (event.inputType == "insertLineBreak") event.preventDefault();
        // in other cases, return to escape null type error
        return;
      }

      const isAlphabet = /[a-zA-Z]/.test(event.data); // Check if the input is an alphabet

      if (isAlphabet) {
        console.error("Alphabets are not allowed!");
        showErrorNotification("Alphabets are not allowed!");
        event.preventDefault();
        return;
      }

      if (isQuestionTypeSubjective.value) {
        // checks if character limit is reached in case it is set
        if (!hasCharLimit.value) return;
        if (!charactersLeft.value) {
          event.preventDefault();
          return;
        }
      }
      if (isQuestionTypeNumericalFloat.value) {
        const keysAllowed: string[] = [
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          ".",
        ];
        const keyPressed: string = event.data;
        if (
          doNumericalCharactersExceedLimit(state.numericalAnswer) ||
          !keysAllowed.includes(keyPressed) ||
          // if key is "." but number already has a decimal point, or key "." is entered as the first character in answer, prevent
          (event.data == "." &&
            (doesNumberContainDecimal(state.numericalAnswer) ||
              state.numericalAnswer == null))
        ) {
          if (
            event.data == "." &&
            doesNumberContainDecimal(state.numericalAnswer)
          ) {
            console.error("You have already entered a decimal point!");
            showErrorNotification("You have already entered a decimal point!");
          }
          event.preventDefault();
        }
      }
      if (isQuestionTypeNumericalInteger.value) {
        const keysAllowed: string[] = [
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
        ];
        const keyPressed: string = event.data;
        if (
          doNumericalCharactersExceedLimit(state.numericalAnswer) ||
          !keysAllowed.includes(keyPressed)
        ) {
          event.preventDefault();
        }
      }
    }

    const questionHeaderText = computed(() => {
      return `Q.${props.currentQuestionIndex + 1}: `;
    });

    // styling class for the question image and loading spinner containers
    const questionImageAreaClass = computed(() => ({
      "h-56 mb-4": props.isPortrait,
      "h-28 sm:h-36 md:h-48 lg:h-56 xl:h-80 w-1/2": !props.isPortrait,
    }));

    const areOptionsVisible = computed(() =>
      state.questionTypesWithOptions.has(props.questionType)
    );
    const isQuestionTypeSubjective = computed(
      () => props.questionType == questionType.SUBJECTIVE
    );
    const isQuestionTypeMultiChoice = computed(
      () => props.questionType == questionType.MULTI_CHOICE
    );
    const isQuestionTypeSingleChoice = computed(
      () => props.questionType == questionType.SINGLE_CHOICE
    );
    const isQuestionTypeNumericalInteger = computed(
      () => props.questionType == questionType.NUMERICAL_INTEGER
    );
    const isQuestionTypeNumericalFloat = computed(
      () => props.questionType == questionType.NUMERICAL_FLOAT
    );
    const isQuestionTypeMatrixMatch = computed(
      () => props.questionType == questionType.MATRIX_MATCH
    );

    // styling class to decide orientation of image + options
    // depending on portrait/landscape orientation
    const orientationClass = computed(() => {
      return [
        {
          "content-center": false,
          "flex-col": false,
        },
        "flex mx-2 md:mx-10 py-4",
      ];
    });

    const optionInputType = computed(() => {
      if (!areOptionsVisible.value) return null;
      if (isQuestionTypeSingleChoice.value) return "radio";
      if (isQuestionTypeMultiChoice.value) return "checkbox";
      return null;
    });

    /**
     * classes for the various containers corresponding to the possible types of answers
     * to the various types of questions (options for MCQ, textarea for subjective)
     */
    const answerContainerClass = computed(() => ({
      "w-1/2": false,
      "w-full": true,
    }));

    const hasCharLimit = computed(() => props.maxCharLimit != -1);

    const isAnswerSubmitted = computed(() => {
      if (state.draftAnswer == null) return false;
      if (
        isQuestionTypeNumericalInteger.value ||
        isQuestionTypeNumericalFloat.value
      ) {
        return state.numericalAnswer != null;
      }
      if (isQuestionTypeSingleChoice.value || isQuestionTypeMultiChoice.value) {
        return Array.isArray(state.draftAnswer) && state.draftAnswer.length > 0;
      }
      return true;
    });

    const maxCharLimitClass = computed(() => {
      // class for the character limit text
      if (charactersLeft.value > 0.2 * props.maxCharLimit) {
        return "text-gray-400";
      } else if (charactersLeft.value > 0.1 * props.maxCharLimit) {
        return "text-yellow-500";
      } else return "text-red-400";
    });
    const charactersLeft = computed(() => {
      // number of characters left for the subjective answer if a limit is given
      return props.maxCharLimit - currentAnswerLength.value;
    });
    const currentAnswerLength = computed(() => {
      // length of the current answer (for subjective question)
      if (state.subjectiveAnswer == null) return 0;
      return state.subjectiveAnswer.length;
    });
    const defaultSubjectiveAnswer = computed(() => {
      // the default answer to be shown for the subjective question
      if (state.draftAnswer != null && typeof state.draftAnswer == "string") {
        return state.draftAnswer;
      }
      return "";
    });
    const defaultNumericalAnswer = computed(() => {
      if (state.draftAnswer != null && typeof state.draftAnswer == "number") {
        return state.draftAnswer;
      }
      return null;
    });
    const isAnswerDisabled = computed(
      () =>
        (isAnswerSubmitted.value && !isQuizAssessment.value) ||
        props.isQuestionDisabled ||
        props.hasQuizEnded
    );
    // input mode refers to keypad being displayed in mobile browsers
    const getInputMode = computed(() => {
      if (
        isQuestionTypeNumericalInteger.value ||
        isQuestionTypeNumericalFloat.value
      ) {
        return "decimal";
      }
      return "text";
    });

    const subjectiveAnswerBoxStyling = computed(() => [
      {
        "bg-gray-100": isAnswerSubmitted.value,
      },
      "bp-420:h-20 sm:h-28 md:h-26 px-4 placeholder-gray-400 focus:border-gray-200 focus:ring-primary disabled:cursor-not-allowed",
    ]);

    const numericalAnswerBoxStyling = computed(() => [
      {
        "text-green-500 border-green-500":
          ((state.draftAnswer == props.correctAnswer &&
            isQuestionTypeNumericalInteger.value) ||
            (typeof state.draftAnswer == "number" &&
              typeof props.correctAnswer == "number" &&
              Math.abs(state.draftAnswer - props.correctAnswer) < 0.05 &&
              isQuestionTypeNumericalFloat.value)) &&
          isAnswerSubmitted.value &&
          props.isGradedQuestion &&
          (!isQuizAssessment.value ||
            (isQuizAssessment.value && props.hasQuizEnded)),
        "text-red-500 border-red-400":
          ((state.draftAnswer != props.correctAnswer &&
            isQuestionTypeNumericalInteger.value) ||
            (typeof state.draftAnswer == "number" &&
              typeof props.correctAnswer == "number" &&
              Math.abs(state.draftAnswer - props.correctAnswer) >= 0.05 &&
              isQuestionTypeNumericalFloat.value)) &&
          isAnswerSubmitted.value &&
          props.isGradedQuestion &&
          (!isQuizAssessment.value ||
            (isQuizAssessment.value && props.hasQuizEnded)),
        "bg-gray-100":
          (isAnswerSubmitted.value && !props.isGradedQuestion) ||
          (isQuizAssessment.value && !props.hasQuizEnded),
      },
      "bp-420:h-12 sm:h-12 md:h-12 px-4 placeholder-gray-400 focus:border-gray-200 focus:ring-primary disabled:cursor-not-allowed",
    ]);

    state.subjectiveAnswer = defaultSubjectiveAnswer.value;
    state.numericalAnswer = defaultNumericalAnswer.value;

    watch(
      () => state.numericalAnswer,
      (newValue) => {
        if (String(newValue) == "" || newValue == null) {
          state.draftAnswer = null;
          context.emit(
            "numerical-answer-entered",
            null,
            props.currentQuestionIndex
          ); // when entire answer is deleted, set draftAnswer as null
        } else {
          state.draftAnswer = Number(state.numericalAnswer);
          context.emit(
            "numerical-answer-entered",
            Number(state.numericalAnswer),
            props.currentQuestionIndex
          );
        }
      }
    );

    watch(
      () => state.subjectiveAnswer,
      (newValue) => {
        if (
          newValue != null &&
          hasCharLimit.value &&
          newValue.length > props.maxCharLimit
        ) {
          // prevent answers more than the character limit from being entered via copy pasting
          state.subjectiveAnswer = newValue.substring(0, props.maxCharLimit);
        }
        state.draftAnswer = state.subjectiveAnswer;
        context.emit(
          "subjective-answer-entered",
          state.subjectiveAnswer,
          props.currentQuestionIndex
        );
      }
    );

    onMounted(() => {
      // Force render any math on the page when component is mounted
      // @ts-ignore
      if ("MathJax" in window) (window.MathJax as any).typeset();
    });

    onUpdated(() => {
      // Force render any math on the page when component is updated
      // @ts-ignore
      if ("MathJax" in window) (window.MathJax as any).typeset();
    });

    return {
      ...toRefs(state),
      questionHeaderText,
      optionBackgroundClass,
      isOptionMarked,
      selectOption,
      isAnswerSubmitted,
      labelClass,
      preventKeypressIfApplicable,
      questionImageAreaClass,
      areOptionsVisible,
      isQuestionTypeSubjective,
      isQuestionTypeMultiChoice,
      isQuestionTypeSingleChoice,
      isQuestionTypeMatrixMatch,
      getRowLabel,
      getColumnLabel,
      convertMatrixMatchOptionToString,
      isMatrixMatchOptionMarked,
      orientationClass,
      optionInputType,
      answerContainerClass,
      hasCharLimit,
      charactersLeft,
      maxCharLimitClass,
      isQuizAssessment,
      isAnswerDisabled,
      getInputMode,
      subjectiveAnswerBoxStyling,
      numericalAnswerBoxStyling,
      isQuestionTypeNumericalFloat,
      isQuestionTypeNumericalInteger,
    };
  },
  emits: [
    "option-selected",
    "subjective-answer-entered",
    "numerical-answer-entered",
    "navigate",
  ],
});
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
