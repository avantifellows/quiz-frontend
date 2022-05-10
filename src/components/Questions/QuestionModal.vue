<template>
  <div class="h-full flex flex-col">
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
        @answer-entered="subjectiveAnswerUpdated"
        @navigate="navigateToQuestion"
        data-test="body"
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
import Body from "./Body.vue";
import Footer from "./Footer.vue";
import Header from "./Header.vue";
import {
  defineComponent,
  PropType,
  reactive,
  toRefs,
  onUnmounted,
  computed,
  watch,
} from "vue";
import {
  isScreenPortrait,
  isQuestionAnswerCorrect,
} from "../../services/Functional/Utilities";
import {
  Question,
  SubmittedResponse,
  DraftResponse,
  quizType,
  questionState,
} from "../../types";
import { useToast, POSITION } from "vue-toastification";

export default defineComponent({
  name: "QuestionModal",
  components: {
    Body,
    Footer,
    Header,
  },
  props: {
    questions: {
      required: true,
      type: Array as PropType<Question[]>,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
    responses: {
      required: true,
      type: Array as PropType<SubmittedResponse[]>,
    },
    quizType: {
      type: String as PropType<quizType>,
      default: "homework",
    },
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
    });

    function checkScreenOrientation() {
      state.isPortrait = isScreenPortrait();
    }

    function navigateToQuestion(questionIndex: number) {
      state.localCurrentQuestionIndex = questionIndex;
    }

    watch(
      () => state.localCurrentQuestionIndex,
      (newValue) => {
        context.emit("update:currentQuestionIndex", newValue);
      }
    );

    watch(
      () => props.currentQuestionIndex,
      (newValue: Number) => {
        state.localCurrentQuestionIndex = newValue.valueOf();
      }
    );

    watch(
      () => state.localResponses,
      (newValue) => {
        context.emit("update:responses", newValue);
      },
      { deep: true }
    );

    /**
     * triggered upon selecting an option
     */
    function questionOptionSelected(optionIndex: number) {
      if (isQuestionTypeSingleChoice.value) {
        // for MCQ, simply set the option as the current response
        state.draftResponses[props.currentQuestionIndex] = [optionIndex];
        return;
      }

      if (isQuestionTypeMultiChoice.value) {
        if (state.draftResponses[props.currentQuestionIndex] == null) {
          state.draftResponses[props.currentQuestionIndex] = [];
        }

        // if the selection option was already in the response
        // remove it from the response (uncheck it); otherwise add it (check it)
        const currentResponse =
          state.draftResponses[props.currentQuestionIndex];

        // TODO: this is ideally not needed but typescript is giving an error that
        // "currentResponse could be possibly null" without this line, which is
        // not correct as the null case has been handled above.
        if (currentResponse == null || typeof currentResponse == "string") {
          return;
        }

        const optionPositionInResponse = currentResponse.indexOf(optionIndex);
        if (optionPositionInResponse != -1) {
          currentResponse.splice(optionPositionInResponse, 1);
        } else {
          currentResponse.push(optionIndex);
          currentResponse.sort();
        }
      }
    }

    function submitQuestion() {
      if (!state.localResponses.length) return;
      state.localResponses[props.currentQuestionIndex].answer =
        state.draftResponses[props.currentQuestionIndex];
      context.emit("submit-question");
    }

    function clearAnswer() {
      state.draftResponses[props.currentQuestionIndex] = null;
      state.isDraftAnswerCleared = true;
    }

    function showNextQuestion() {
      resetState();
      if (
        state.localCurrentQuestionIndex < props.questions.length - 1 ||
        props.hasQuizEnded ||
        !isQuizAssessment.value
      ) {
        state.localCurrentQuestionIndex = state.localCurrentQuestionIndex + 1;
      } else {
        state.toast.success(
          'No more questions, please press "End Test" if you are done 👉',
          {
            position: POSITION.TOP_LEFT,
          }
        );
      }
    }

    function showPreviousQuestion() {
      resetState();
      state.localCurrentQuestionIndex -= 1;
    }

    function resetState() {
      if (
        state.isDraftAnswerCleared &&
        isQuestionTypeSubjective.value &&
        state.draftResponses[props.currentQuestionIndex] !=
          currentQuestionResponseAnswer.value
      ) {
        state.draftResponses[props.currentQuestionIndex] =
          currentQuestionResponseAnswer.value;
      }
      state.isDraftAnswerCleared = false;
    }

    /** update the attempt to the current question - valid for subjective questions */
    function subjectiveAnswerUpdated(answer: string) {
      state.draftResponses[props.currentQuestionIndex] = answer;
    }

    function endTest() {
      state.localCurrentQuestionIndex = props.questions.length;
      context.emit("end-test");
    }

    onUnmounted(() => {
      // remove listeners
      window.removeEventListener("resize", checkScreenOrientation);
    });

    const currentQuestion = computed(
      () => props.questions[props.currentQuestionIndex]
    );

    const questionType = computed(() => currentQuestion.value.type);

    const questionCorrectAnswer = computed(
      () => currentQuestion.value?.correct_answer
    );

    const isGradedQuestion = computed(() => currentQuestion.value.graded);

    const isQuestionTypeMultiChoice = computed(
      () => questionType.value == "multi-choice"
    );
    const isQuestionTypeSingleChoice = computed(
      () => questionType.value == "single-choice"
    );
    const isQuestionTypeSubjective = computed(
      () => questionType.value == "subjective"
    );

    const currentQuestionResponse = computed(
      () => props.responses[props.currentQuestionIndex]
    );

    const currentQuestionResponseAnswer = computed(
      () => currentQuestionResponse.value?.answer
    );

    const isAnswerSubmitted = computed(() => {
      if (currentQuestionResponseAnswer.value == null) return false;
      if (isQuestionTypeSingleChoice.value || isQuestionTypeMultiChoice.value) {
        return currentQuestionResponseAnswer.value.length > 0;
      }
      return true;
    });

    const isAttemptValid = computed(() => {
      const currentDraftResponse = state.draftResponses[
        props.currentQuestionIndex
      ] as DraftResponse;
      if (currentDraftResponse == null) return false;
      if (isQuestionTypeSubjective.value) return currentDraftResponse != "";
      return currentDraftResponse.length > 0;
    });

    const isQuizAssessment = computed(() => props.quizType == "assessment");

    const questionStates = computed(() => {
      const states = [] as questionState[];

      if (props.hasQuizEnded) {
        for (let index = 0; index < props.questions.length; index++) {
          const questionAnswerEvaluation = isQuestionAnswerCorrect(
            props.questions[index],
            props.responses[index].answer
          );
          // we are not adding ungraded questions to the palette
          if (!questionAnswerEvaluation.valid) continue;
          if (
            !questionAnswerEvaluation.answered ||
            questionAnswerEvaluation.isCorrect == null
          ) {
            states.push("neutral");
          } else {
            questionAnswerEvaluation.isCorrect
              ? states.push("success")
              : states.push("error");
          }
        }
      } else {
        console.log(props.responses);
        for (let index = 0; index < props.questions.length; index++) {
          if (!props.responses[index].visited) {
            states.push("neutral");
            continue;
          }
          if (props.responses[index].answer != null) states.push("success");
          else states.push("error");
        }
      }

      // for (let i = 0; i < 6; i++) {
      //   for (let j = 0; j < 3; j++) {
      //     states.push(states[j]);
      //   }
      // }

      return states;
    });

    // instantiating draftResponses here
    props.responses.forEach((response) => {
      state.draftResponses.push(response.answer);
    });

    // determine the screen orientation when the item modal is created
    checkScreenOrientation();
    // add listener for screen size being changed
    window.addEventListener("resize", checkScreenOrientation);

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
      questionStates,
    };
  },
  emits: [
    "update:currentQuestionIndex",
    "update:responses",
    "submit-question",
    "end-test",
  ],
});
</script>
