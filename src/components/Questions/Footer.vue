<template>
  <div
    class="flex w-full lg:p-6 justify-between"
    :class="{
      'bg-white p-4': !isQuizAssessment,
      'bg-gray-200 py-4 px-2': isQuizAssessment,
    }"
  >
    <div class="place-self-start flex h-full">
      <!-- back button - assessment and homework -->
      <icon-button
        :iconConfig="previousQuestionButtonIconConfig"
        :buttonClass="assessmentNavigationButtonClass"
        :class="{
          hidden: !isPreviousButtonShown && !isQuizAssessment,
          invisible: !isPreviousButtonShown && isQuizAssessment,
        }"
        ariaLabel="Previous Question"
        @click="goToPreviousQuestion"
        data-test="previousQuestionButton"
      ></icon-button>
    </div>

    <div
      v-if="isQuizAssessment && !hasQuizEnded"
      class="flex space-x-1 sm:space-x-4"
    >
      <!-- clear button - assessment -->
      <icon-button
        :titleConfig="clearButtonTitleConfig"
        :buttonClass="clearButtonClass"
        :isDisabled="!isSubmitEnabled && !isAnswerSubmitted"
        @click="clearAnswer"
        data-test="clearButton"
      ></icon-button>

      <!-- save & next button - assessment -->
      <icon-button
        :titleConfig="saveAndNextButtonTitleConfig"
        :buttonClass="saveAndNextButtonClass"
        :isDisabled="!isAnswerSubmitted && !isSubmitEnabled"
        @click="saveQuestionAndProceed"
        data-test="saveAndNextButton"
      ></icon-button>
    </div>

    <div class="place-self-end flex h-full">
      <!-- submit/continue button - homework-->
      <icon-button
        v-if="!isQuizAssessment"
        :titleConfig="submitButtonTitleConfig"
        :buttonClass="submitButtonClass"
        :isDisabled="!isAnswerSubmitted && !isSubmitEnabled"
        @click="submitQuestion"
        data-test="submitButton"
      ></icon-button>
      <!-- forward button - assessment -->
      <icon-button
        v-if="isQuizAssessment && isNextButtonShown"
        :iconConfig="nextQuestionButtonIconConfig"
        :buttonClass="assessmentNavigationButtonClass"
        ariaLabel="Next Question"
        @click="goToNextQuestion"
        data-test="nextQuestionButton"
      ></icon-button>
    </div>
  </div>
</template>

<script lang="ts">
import IconButton from "../UI/Buttons/IconButton.vue";
import {
  IconButtonIconConfig,
  IconButtonTitleConfig,
  quizType,
} from "../../types";
import {
  defineComponent,
  ref,
  reactive,
  toRefs,
  computed,
  PropType,
} from "vue";

export default defineComponent({
  components: { IconButton },
  props: {
    isAnswerSubmitted: {
      default: false,
      type: Boolean,
    },
    isSubmitEnabled: {
      default: false,
      type: Boolean,
    },
    isPreviousButtonShown: {
      default: false,
      type: Boolean,
    },
    isNextButtonShown: {
      default: true,
      type: Boolean,
    },
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
    quizType: {
      type: String as PropType<quizType>,
      default: "homework",
    },
  },
  setup(props, context) {
    const isQuizAssessment = computed(() => props.quizType == "assessment");
    const state = reactive({
      assessmentNavigationButtonIconClass: [
        {
          "text-yellow-800 h-6 w-4": !isQuizAssessment.value,
          "text-gray-600 h-3 w-2 sm:h-5 sm:w-3 lg:h-6 lg:w-4":
            isQuizAssessment.value,
        },
        "fill-current",
      ],
      assessmentTextButtonTitleClass:
        "text-sm bp-500:text-md lg:text-lg xl:text-xl font-bold",
      assessmentNavigationButtonClass: [
        {
          "bg-yellow-500 hover:bg-yellow-600 ring-yellow-500 px-6 bp-500:px-8 rounded-2xl":
            !isQuizAssessment.value,
          "bg-white hover:bg-gray-100 px-4 bp-500:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl":
            isQuizAssessment.value,
        },
        "p-2 bp-500:p-4 shadow-xl",
      ],
      assessmentTextButtonClass:
        "p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
    });

    const previousQuestionButtonIconConfig = ref({
      enabled: true,
      iconName: "right-arrow",
      iconClass: [
        state.assessmentNavigationButtonIconClass,
        "transform rotate-180",
      ],
    } as IconButtonIconConfig);

    const nextQuestionButtonIconConfig = ref({
      enabled: true,
      iconName: "right-arrow",
      iconClass: state.assessmentNavigationButtonIconClass,
    } as IconButtonIconConfig);

    const clearButtonClass = ref([
      state.assessmentTextButtonClass,
      "bg-white hover:bg-gray-50",
    ]);

    const saveAndNextButtonClass = ref([
      state.assessmentTextButtonClass,
      "bg-white hover:bg-gray-50",
    ]);

    const clearButtonTitleConfig = ref({
      value: "Clear",
      class: [state.assessmentTextButtonTitleClass, "text-gray-600"],
    } as IconButtonTitleConfig);

    const saveAndNextButtonTitleConfig = ref({
      value: "Save & Next",
      class: [state.assessmentTextButtonTitleClass, "text-emerald-500"],
    } as IconButtonTitleConfig);

    function submitQuestion() {
      if (props.isAnswerSubmitted) context.emit("continue");
      else context.emit("submit");
    }

    function clearAnswer() {
      context.emit("clear");
    }

    function goToPreviousQuestion() {
      context.emit("previous");
    }

    function goToNextQuestion() {
      context.emit("continue");
    }

    function saveQuestionAndProceed() {
      context.emit("submit");
      context.emit("continue");
    }

    const submitButtonTitleConfig = computed(() => {
      return {
        value: props.isAnswerSubmitted ? "Continue" : "Submit",
        class:
          "text-white text-md bp-500:text-lg lg:text-xl xl:text-2xl font-bold",
      } as IconButtonTitleConfig;
    });

    const submitButtonClass = computed(() => [
      {
        "bg-emerald-500 hover:bg-emerald-600 ring-emerald-500":
          !props.isAnswerSubmitted,
        "bg-primary hover:bg-primary-hover ring-primary":
          props.isAnswerSubmitted,
      },
      "p-4 px-8 bp-500:p-6 bp-500:px-12 rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
    ]);

    return {
      ...toRefs(state),
      previousQuestionButtonIconConfig,
      nextQuestionButtonIconConfig,
      clearButtonClass,
      saveAndNextButtonClass,
      clearButtonTitleConfig,
      saveAndNextButtonTitleConfig,
      submitQuestion,
      goToPreviousQuestion,
      goToNextQuestion,
      clearAnswer,
      saveQuestionAndProceed,
      submitButtonTitleConfig,
      submitButtonClass,
      isQuizAssessment,
    };
  },
  emits: ["submit", "previous", "continue", "clear"],
});
</script>
