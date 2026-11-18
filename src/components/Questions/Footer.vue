<template>
  <!-- One white bar for every quiz type: joined ‹|› navigation on the left, the actions on the right.
       Phones (< 640px): Save & Next / Submit grows to fill the row but is capped at 12rem, and is never
       narrower than the other buttons. From 640px (tablets and laptops): labelled Previous / Next,
       actions grouped on the right, Save & Next a fixed 10rem. -->
  <div
    class="flex w-full items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 bg-white border-t border-gray-200 z-50 place-self-end"
  >
    <!-- previous / next: joined; labelled from 640px and in review mode -->
    <div
      class="flex h-11 border border-gray-300 rounded-[10px] overflow-hidden"
      :class="[
        hasQuizEnded ? 'flex-1 sm:flex-none' : 'flex-none',
        { hidden: isOmrMode },
      ]"
    >
      <!-- back button - assessment and homework -->
      <icon-button
        :iconConfig="previousQuestionButtonIconConfig"
        :titleConfig="previousButtonTitleConfig"
        :buttonClass="navigationButtonClass"
        :isDisabled="isSessionAnswerRequestProcessing || !isPreviousButtonShown"
        ariaLabel="Previous Question"
        @click="goToPreviousQuestion"
        data-test="previousQuestionButton"
      ></icon-button>
      <!-- forward button - assessment always; homework / forms once the quiz has ended.
           Shown disabled on the last question instead of disappearing. -->
      <template v-if="isQuizAssessment || hasQuizEnded">
        <span aria-hidden="true" class="w-px bg-gray-300"></span>
        <icon-button
          :iconConfig="nextQuestionButtonIconConfig"
          :titleConfig="nextButtonTitleConfig"
          :buttonClass="navigationButtonClass"
          innerContainerClass="flex w-full justify-center flex-row-reverse space-x-reverse"
          :isDisabled="isSessionAnswerRequestProcessing || !isNextButtonShown"
          ariaLabel="Next Question"
          @click="goToNextQuestion"
          data-test="nextQuestionButton"
        ></icon-button>
      </template>
    </div>

    <!-- assessment actions; from 640px they sit together on the right -->
    <div
      v-if="isQuizAssessment && !hasQuizEnded"
      class="contents sm:flex sm:gap-2 sm:ml-auto"
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

      <!-- save&next button - assessment-->
      <icon-button
        :class="{
          hidden: isOmrMode
        }"
        :titleConfig="saveAndNextButtonTitleConfig"
        :iconConfig="saveAndNextButtonIconConfig"
        :buttonClass="saveAndNextButtonClass"
        :isDisabled="(!isAnswerSubmitted && !isSubmitEnabled) || isSessionAnswerRequestProcessing"
        @click="saveQuestionAndProceed"
        data-test="saveAndNextButton"
      ></icon-button>
    </div>

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
      // same 640px switch as the layout classes (sm:), so labels and layout change together
      isSmallScreen.value = window.matchMedia("(max-width: 639px)").matches;
      isTinyScreen.value = window.matchMedia("(max-width: 359px)").matches;
    };
    const isTinyScreen = ref(false); // below 360px "Save & Next" becomes "Save ›" so nothing wraps
    const state = reactive({
      navigationIconClass: "flex items-center fill-current text-gray-700 h-4 w-3",
      outlinedButtonClass:
        "flex-none h-11 px-2.5 bp-360:px-3 sm:px-[18px] rounded-[10px] border disabled:opacity-50 disabled:cursor-not-allowed",
      buttonTitleClass: "text-sm sm:text-base font-semibold whitespace-nowrap",
    });
    /** each half of the joined ‹|› control; grows to fill the row in review mode */
    const navigationButtonClass = computed(() => [
      "h-full bg-white hover:bg-gray-50 gap-1.5 disabled:hover:bg-white",
      props.hasQuizEnded ? "flex-1 sm:flex-none px-4" : "w-9 bp-360:w-10 sm:w-auto sm:px-4",
    ]);
    /** "Previous" / "Next" labels: from 640px always; on phones only in review mode (when ‹ › have the row) */
    const navigationTitleClass = computed(() => [
      "text-sm sm:text-base font-semibold text-gray-700 whitespace-nowrap",
      props.hasQuizEnded ? "" : "hidden sm:inline",
    ]);
    const previousQuestionButtonIconConfig = ref({
      enabled: true,
      iconName: "right-arrow",
      iconClass: [state.navigationIconClass, "transform -scale-x-100"], // mirror, not rotate: rotating moved it off-centre
    } as IconButtonIconConfig);
    const nextQuestionButtonIconConfig = ref({
      enabled: true,
      iconName: "right-arrow",
      iconClass: state.navigationIconClass,
    } as IconButtonIconConfig);
    const previousButtonTitleConfig = computed(() => ({
      value: "Previous",
      class: navigationTitleClass.value,
    } as IconButtonTitleConfig));
    const nextButtonTitleConfig = computed(() => ({
      value: "Next",
      class: navigationTitleClass.value,
    } as IconButtonTitleConfig));
    const clearButtonClass = ref([
      state.outlinedButtonClass,
      // on phones, spare width collects here (between ‹|› and the actions) instead of stretching Save
      "ml-auto sm:ml-0 border-gray-300 bg-white hover:bg-gray-50",
    ]);
    const markForReviewButtonClass = ref([
      state.outlinedButtonClass,
      "border-violet-300 bg-violet-50 hover:bg-violet-100",
    ]);
    const saveAndNextButtonClass = ref([
      "flex-1 min-w-0 max-w-[12rem] sm:flex-none sm:max-w-none sm:min-w-[10rem] h-11 px-2 sm:px-[22px] rounded-[10px] gap-2",
      "bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed",
    ]);
    const clearButtonTitleConfig = ref({
      value: "Clear",
      class: [state.buttonTitleClass, "text-gray-700"],
    } as IconButtonTitleConfig);
    const markForReviewButtonTitleConfig = computed(() => ({
      value: isTinyScreen.value ? "Review" : isSmallScreen.value ? "Review >" : "Mark For Review & Next",
      class: [state.buttonTitleClass, "text-violet-500"],
    } as IconButtonTitleConfig));
    const saveAndNextButtonTitleConfig = computed(() => ({
      value: isTinyScreen.value ? "Save ›" : "Save & Next",
      class: [state.buttonTitleClass, "text-white"],
    } as IconButtonTitleConfig));
    const saveAndNextButtonIconConfig = computed(() => {
      return {
        enabled: props.isSessionAnswerRequestProcessing,
        iconName: "spinner-solid",
        iconClass: "animate-spin h-4 w-4 text-white",
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
          "text-white text-sm sm:text-base font-semibold whitespace-nowrap",
      } as IconButtonTitleConfig;
    });

    const submitButtonIconConfig = computed(() => {
      return {
        enabled: props.isSessionAnswerRequestProcessing,
        iconName: "spinner-solid",
        iconClass: "animate-spin h-4 w-4 text-white",
      };
    });

    const submitButtonClass = computed(() => [
      {
        "bg-emerald-500 hover:bg-emerald-600 ring-emerald-500":
          !props.isAnswerSubmitted || isFormQuiz.value,
        "bg-primary hover:bg-primary-hover ring-primary":
          props.isAnswerSubmitted && !isFormQuiz.value,
      },
      "flex-1 min-w-0 max-w-[12rem] ml-auto sm:flex-none sm:max-w-none sm:min-w-[10rem] h-11 px-4 sm:px-[22px] rounded-[10px] gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
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
      previousButtonTitleConfig,
      nextButtonTitleConfig,
      navigationButtonClass,
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
