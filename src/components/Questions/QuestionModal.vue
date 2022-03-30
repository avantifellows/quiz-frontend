<template>
  <div
    class="flex flex-col bg-white w-full h-full justify-between overflow-hidden"
  >
    <Body
      class="mt-10"
      :text="currentQuestion.text"
      :options="currentQuestion.options"
      :correctAnswer="questionCorrectAnswer"
      :questionType="questionType"
      :isSurveyQuestion="isSurveyQuestion"
      :maxCharLimit="currentQuestion.max_char_limit"
      :isPortrait="isPortrait"
      :imageData="currentQuestion?.image"
      :draftAnswer="draftResponses[currentQuestionIndex]"
      :submittedAnswer="currentQuestionResponseAnswer"
      :isAnswerSubmitted="isAnswerSubmitted"
      @option-selected="questionOptionSelected"
      @answer-entered="subjectiveAnswerUpdated"
      data-test="body"
    ></Body>
    <Footer
      :isAnswerSubmitted="isAnswerSubmitted"
      :isPreviousButtonShown="currentQuestionIndex > 0"
      :isSubmitEnabled="isAttemptValid"
      @submit="submitQuestion"
      @continue="showNextQuestion"
      @previous="showPreviousQuestion"
      data-test="footer"
    ></Footer>
  </div>
</template>

<script lang="ts">
import Body from "./Body.vue";
import Footer from "./Footer.vue";
import {
  defineComponent,
  PropType,
  reactive,
  toRefs,
  onUnmounted,
  computed,
  watch,
} from "vue";
import { isScreenPortrait } from "../../services/Functional/Utilities";
import { Question, SubmittedResponse, DraftResponse } from "../../types";

export default defineComponent({
  name: "QuestionModal",
  components: {
    Body,
    Footer,
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
    responses: {
      required: true,
      type: Array as PropType<SubmittedResponse[]>,
    },
  },
  setup(props, context) {
    const state = reactive({
      localCurrentQuestionIndex: props.currentQuestionIndex as number, // local copy of currentQuestionIndex
      localResponses: props.responses as SubmittedResponse[], // local copy of responses
      isPortrait: true,
      draftResponses: [] as DraftResponse[], // stores the options selected by the user but not yet submitted
    });

    function checkScreenOrientation() {
      state.isPortrait = isScreenPortrait();
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
      if (isQuestionTypeMCQ.value) {
        // for MCQ, simply set the option as the current response
        state.draftResponses[props.currentQuestionIndex] = [optionIndex];
        return;
      }

      if (isQuestionTypeCheckbox.value) {
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
      state.localResponses[props.currentQuestionIndex].answer =
        state.draftResponses[props.currentQuestionIndex];
      context.emit("submit-question");
    }

    function showNextQuestion() {
      state.localCurrentQuestionIndex = state.localCurrentQuestionIndex + 1;
    }

    function showPreviousQuestion() {
      state.localCurrentQuestionIndex -= 1;
    }

    /** update the attempt to the current question - valid for subjective questions */
    function subjectiveAnswerUpdated(answer: string) {
      state.draftResponses[props.currentQuestionIndex] = answer;
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

    const isSurveyQuestion = computed(() => currentQuestion.value.survey);

    const isQuestionTypeCheckbox = computed(
      () => questionType.value == "checkbox"
    );
    const isQuestionTypeMCQ = computed(() => questionType.value == "mcq");
    const isQuestionTypeSubjective = computed(
      () => questionType.value == "subjective"
    );

    const currentQuestionResponse = computed(
      () => props.responses[props.currentQuestionIndex]
    );

    const currentQuestionResponseAnswer = computed(
      () => currentQuestionResponse.value.answer
    );

    const isAnswerSubmitted = computed(() => {
      if (currentQuestionResponseAnswer.value == null) return false;
      if (isQuestionTypeMCQ.value || isQuestionTypeCheckbox.value) {
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

    // instantiating draftResponses here
    props.questions.forEach(() => {
      state.draftResponses.push(null);
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
      currentQuestion,
      questionType,
      questionCorrectAnswer,
      isSurveyQuestion,
      currentQuestionResponseAnswer,
      isAnswerSubmitted,
      isAttemptValid,
    };
  },
  emits: ["update:currentQuestionIndex", "update:responses", "submit-question"],
});
</script>
