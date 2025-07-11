<template>
  <div
    class="flex w-full lg:p-6 justify-between z-50 place-self-end"
    :class="{
      'bg-white p-4': !isQuizAssessment,
      'bg-gray-200 py-4 px-2': isQuizAssessment,
    }"
  >
    <div :class="[
      !hasQuizEnded ? 'place-self-start flex h-full space-x-1': 'flex h-full w-full justify-between'
    ]">
      <!-- back button - assessment and homework -->
      <icon-button
        :iconConfig="previousQuestionButtonIconConfig"
        :buttonClass="assessmentNavigationButtonClass"
        :class="[
          { hidden: isOmrMode },
        ]"
        :isDisabled="isSessionAnswerRequestProcessing || !isPreviousButtonShown"
        ariaLabel="Previous Question"
        @click="goToPreviousQuestion"
        data-test="previousQuestionButton"
      ></icon-button>
      <!-- forward button - assessment and forms when quiz ended -->
      <icon-button
        :class="[
          { hidden: isOmrMode },
        ]"
        v-if="(isQuizAssessment && isNextButtonShown) || (isFormQuiz && hasQuizEnded && isNextButtonShown)"
        :iconConfig="nextQuestionButtonIconConfig"
        :buttonClass="assessmentNavigationButtonClass"
        :isDisabled="isSessionAnswerRequestProcessing"
        ariaLabel="Next Question"
        @click="goToNextQuestion"
        data-test="nextQuestionButton"
      ></icon-button>
    </div>

    <div
      v-if="isQuizAssessment && !hasQuizEnded"
      class="flex space-x-1 sm:space-x-4"
    >
      <!-- clear button - assessment -->
      <icon-button
        :class="{
          hidden: isOmrMode
        }"
        :titleConfig="clearButtonTitleConfig"
        :buttonClass="clearButtonClass"
        :isDisabled="!isSubmitEnabled || isSessionAnswerRequestProcessing"
        @click="clearAnswer"
        data-test="clearButton"
      ></icon-button>

      <!-- mark for review button - assessment -->
      <icon-button
      :class="{
          hidden: isOmrMode
      }"
      :titleConfig="markForReviewButtonTitleConfig"
      :buttonClass="markForReviewButtonClass"
      :isDisabled="isSessionAnswerRequestProcessing || isMarkedForReview"
      @click="toggleMarkForReview"
      data-test="markForReviewButton"
      ></icon-button>
    </div>

    <div class="place-self-end flex h-full">
      <!-- submit/continue button - homework and forms when quiz active-->
      <icon-button
        v-if="!isQuizAssessment && !hasQuizEnded"
        :titleConfig="submitButtonTitleConfig"
        :iconConfig="submitButtonIconConfig"
        :buttonClass="submitButtonClass"
        :isDisabled="(!isAnswerSubmitted && !isSubmitEnabled) || isSessionAnswerRequestProcessing"
        @click="submitQuestion"
        data-test="submitButton"
      ></icon-button>
      <!-- save&next button - assessment-->
      <icon-button
        :class="{
          hidden: isOmrMode
        }"
        v-if="isQuizAssessment && !hasQuizEnded"
        :titleConfig="saveAndNextButtonTitleConfig"
        :iconConfig="saveAndNextButtonIconConfig"
        :buttonClass="saveAndNextButtonClass"
        :isDisabled="(!isAnswerSubmitted && !isSubmitEnabled) || isSessionAnswerRequestProcessing"
        @click="saveQuestionAndProceed"
        data-test="saveAndNextButton"
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
} from "@/types";
import {
  defineComponent,
  ref,
  reactive,
  toRefs,
  computed,
  PropType,
  onMounted,
  onBeforeUnmount
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
    isMarkedForReview: {
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
    isSessionAnswerRequestProcessing: {
      type: Boolean,
      default: false
    },
    continueAfterAnswerSubmit: {
      type: Boolean,
      default: false
    },
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
    quizType: {
      type: String as PropType<quizType>,
      default: "homework",
    },
    isOmrMode: {
      default: false,
      type: Boolean,
    }
  },
  setup(props, context) {
    const isQuizAssessment = computed(() => props.quizType == "assessment" || props.quizType == "omr-assessment");
    const isFormQuiz = computed(() => props.quizType == "form");
    const isSmallScreen = ref(false);
    const updateScreenSize = () => {
      isSmallScreen.value = window.matchMedia("(max-width: 560px)").matches;
    };
    const state = reactive({
      assessmentNavigationButtonIconClass: [
        {
          "text-yellow-800 h-6 w-4": !isQuizAssessment.value || isFormQuiz.value,
          "text-gray-600 h-3 w-2 sm:h-5 sm:w-3 lg:h-6 lg:w-4":
            isQuizAssessment.value && !isFormQuiz.value,
        },
        "fill-current",
      ],
      assessmentTextButtonTitleClass:
        "text-xs bp-500:text-sm lg:text-base xl:text-lg font-bold",
      assessmentNavigationButtonClass: [
        {
          "bg-yellow-500 hover:bg-yellow-600 ring-yellow-500 px-6 bp-500:px-8 rounded-2xl":
            !isQuizAssessment.value || isFormQuiz.value,
          "bg-white hover:bg-gray-100 px-4 bp-500:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl":
            isQuizAssessment.value && !isFormQuiz.value,
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

    const markForReviewButtonClass = ref([
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

    const markForReviewButtonTitleConfig = computed(() => ({
      value: isSmallScreen.value ? "Review >" : "Mark For Review & Next",
      class: ["text-xxs bp-500:text-sm lg:text-base xl:text-lg font-bold", "text-violet-500"],
    } as IconButtonTitleConfig));

    const saveAndNextButtonTitleConfig = ref({
      value: "Save & Next",
      class: [state.assessmentTextButtonTitleClass, "text-emerald-500"],
    } as IconButtonTitleConfig);

    const saveAndNextButtonIconConfig = computed(() => {
      return {
        enabled: props.isSessionAnswerRequestProcessing,
        iconName: "spinner-solid",
        iconClass: "animate-spin h-4 w-4 text-primary",
      };
    });

    function submitQuestion() {
      if (isFormQuiz.value) {
        // for forms - auto-proceed after save like assessments
        context.emit("submit");
        // wait for processing to be done and answer to be submitted
        const checkProcessingDone = setInterval(() => {
          if (!props.isSessionAnswerRequestProcessing) {
            if (props.continueAfterAnswerSubmit) context.emit("continue");
            clearInterval(checkProcessingDone);
          }
        }, 100); // check every 100ms
      } else {
        // for homework
        if (props.isAnswerSubmitted && !isFormQuiz.value) context.emit("continue");
        else context.emit("submit");
      }
    }

    function clearAnswer() {
      context.emit("clear");
    }

    function toggleMarkForReview() {
      if (!props.isMarkedForReview) {
        context.emit("mark-for-review");
        // wait for processing to be done and answer to be submitted
        const checkProcessingDone = setInterval(() => {
          if (!props.isSessionAnswerRequestProcessing) {
            if (props.continueAfterAnswerSubmit) context.emit("continue");
            clearInterval(checkProcessingDone);
          }
        }, 100); // check every 100ms
      }
    }

    function goToPreviousQuestion() {
      context.emit("previous");
    }

    function goToNextQuestion() {
      context.emit("continue");
    }

    function saveQuestionAndProceed() {
      // for assessment
      context.emit("submit");
      // wait for processing to be done and answer to be submitted
      const checkProcessingDone = setInterval(() => {
        if (!props.isSessionAnswerRequestProcessing) {
          if (props.continueAfterAnswerSubmit) context.emit("continue");
          clearInterval(checkProcessingDone);
        }
      }, 100); // check every 100ms
    }

    const submitButtonTitleConfig = computed(() => {
      let buttonText = "Submit";
      if (isFormQuiz.value) {
        buttonText = "Save >";
      } else if (props.isAnswerSubmitted && !props.isSessionAnswerRequestProcessing) {
        buttonText = "Continue";
      }

      return {
        value: buttonText,
        class:
          "text-white text-md bp-500:text-lg lg:text-xl xl:text-2xl font-bold",
      } as IconButtonTitleConfig;
    });

    const submitButtonIconConfig = computed(() => {
      return {
        enabled: props.isSessionAnswerRequestProcessing,
        iconName: "spinner-solid",
        iconClass: "animate-spin h-4 w-4 text-primary",
      };
    });

    const submitButtonClass = computed(() => [
      {
        "bg-emerald-500 hover:bg-emerald-600 ring-emerald-500":
          !props.isAnswerSubmitted || isFormQuiz.value,
        "bg-primary hover:bg-primary-hover ring-primary":
          props.isAnswerSubmitted && !isFormQuiz.value,
      },
      isFormQuiz.value
        ? "p-3 px-6 bp-500:p-4 bp-500:px-8 rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        : "p-4 px-8 bp-500:p-6 bp-500:px-12 rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
    ]);

    // Setup listeners for screen size changes
    onMounted(() => {
      updateScreenSize();
      window.addEventListener("resize", updateScreenSize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", updateScreenSize);
    });

    return {
      ...toRefs(state),
      previousQuestionButtonIconConfig,
      nextQuestionButtonIconConfig,
      clearButtonClass,
      markForReviewButtonClass,
      saveAndNextButtonClass,
      clearButtonTitleConfig,
      markForReviewButtonTitleConfig,
      saveAndNextButtonTitleConfig,
      saveAndNextButtonIconConfig,
      submitQuestion,
      goToPreviousQuestion,
      goToNextQuestion,
      clearAnswer,
      toggleMarkForReview,
      saveQuestionAndProceed,
      submitButtonTitleConfig,
      submitButtonIconConfig,
      submitButtonClass,
      isQuizAssessment,
      isFormQuiz,
    };
  },
  emits: ["submit", "previous", "continue", "clear", "mark-for-review"],
});
</script>
