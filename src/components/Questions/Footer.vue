<template>
  <div
    class="flex w-full p-4 lg:p-6 justify-between"
    :class="{
      'bg-white': !isQuizAssessment,
      'bg-gray-200': isQuizAssessment,
    }"
  >
    <div class="place-self-start flex h-full">
      <!-- back button -->
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

    <div v-if="isQuizAssessment" class="flex space-x-4">
      <!-- clear button -->
      <icon-button
        :titleConfig="clearButtonTitleConfig"
        :buttonClass="clearButtonClass"
        :isDisabled="!isSubmitEnabled"
        @click="clearAnswer"
        data-test="ClearButton"
      ></icon-button>

      <!-- save & next button -->
      <icon-button
        :titleConfig="saveNextButtonTitleConfig"
        :buttonClass="saveNextButtonClass"
        :isDisabled="!isAnswerSubmitted && !isSubmitEnabled"
        @click="saveQuestionAndProceed"
        data-test="saveAndNextButton"
      ></icon-button>
    </div>

    <div class="place-self-end flex h-full">
      <!-- submit/continue button -->
      <icon-button
        v-if="!isQuizAssessment"
        :titleConfig="submitButtonTitleConfig"
        :buttonClass="submitButtonClass"
        :isDisabled="!isAnswerSubmitted && !isSubmitEnabled"
        @click="submitQuestion"
        data-test="submitButton"
      ></icon-button>
      <!-- forward button -->
      <icon-button
        v-if="isQuizAssessment"
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
          "text-yellow-800": !isQuizAssessment.value,
          "text-gray-600": isQuizAssessment.value,
        },
        "fill-current h-6 w-4",
      ],
      assessmentNavigationButtonClass: [
        {
          "bg-yellow-500 hover:bg-yellow-600 ring-yellow-500":
            !isQuizAssessment.value,
          "bg-white hover:bg-gray-100": isQuizAssessment.value,
        },
        "p-2 px-6 bp-500:p-4 bp-500:px-8 rounded-2xl shadow-xl",
      ],
      clearButtonTitleConfig: {
        value: "Clear",
        class:
          "text-gray-600 text-md bp-500:text-lg lg:text-xl xl:text-2xl font-bold",
      } as IconButtonTitleConfig,
      saveNextButtonTitleConfig: {
        value: "Save & Next",
        class:
          "text-emerald-500 text-md bp-500:text-lg lg:text-xl xl:text-2xl font-bold",
      } as IconButtonTitleConfig,
      textButtonClass:
        "p-4 px-8 bp-500:p-6 bp-500:px-12 rounded-2xl shadow-xl disabled:opacity-50 disabled:pointer-events-none",
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
      state.textButtonClass,
      "bg-white hover:bg-gray-50",
    ]);

    const saveNextButtonClass = ref([
      state.textButtonClass,
      "bg-white hover:bg-gray-50",
    ]);

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
      state.textButtonClass,
    ]);

    return {
      ...toRefs(state),
      previousQuestionButtonIconConfig,
      nextQuestionButtonIconConfig,
      clearButtonClass,
      saveNextButtonClass,
      submitQuestion,
      goToPreviousQuestion,
      goToNextQuestion,
      clearAnswer,
      submitButtonTitleConfig,
      submitButtonClass,
      isQuizAssessment,
    };
  },
  emits: ["submit", "previous", "continue", "clear"],
});
</script>
