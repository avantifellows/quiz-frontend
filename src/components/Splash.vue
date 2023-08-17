<template>
  <div class="flex flex-col justify-center h-full" >
    <BaseIcon
      name="splash"
      iconClass="w-11/12 bp-500:w-9/12 md:w-6/12 lg:w-5/12 mt-24 sm:mt-16 place-self-center"
    />
    <div
      class="bg-primary flex flex-col space-y-16 bp-360:space-y-14 bp-420:space-y-10 lg:space-y-12 items-center rounded-2xl py-12 bp-500:py-10 md:py-11 lg:py-12"
    >
      <p class="text-white text-lg md:text-xl lg:text-2xl font-bold justify-center text-center">PLEASE READ THE INSTRUCTIONS CAREFULLY</p>
    </div>

    <InstructionPage
        :title="title"
        :subject="subject"
        :test_purpose="test_purpose"
        :maxMarks="maxMarks"
        :max-questions-allowed-to-attempt="maxQuestionsAllowedToAttempt"
        :quiz-time-limit="quizTimeLimit"
        :questionSets = "questionSets"
    ></InstructionPage>

    <!-- start button -->
    <icon-button
        :titleConfig="startButtonTextConfig"
        :iconConfig="startButtonIconConfig"
        buttonClass="bg-primary hover:bg-orange-300 rounded-lg h-14 w-40  ring-primary px-2 border-b-outset border-white mb-10 mt-10"
        class="rounded-2xl shadow-lg mt-5 place-self-center"
        data-test="startQuiz"
        :isDisabled="!isSessionDataFetched"
        @click="start"
      ></icon-button>
  </div>
</template>

<script lang="ts">
import IconButton from "./UI/Buttons/IconButton.vue";
import BaseIcon from "./UI/Icons/BaseIcon.vue";
import { defineComponent, computed, reactive, toRefs, PropType } from "vue";
import { IconButtonTitleConfig, quizType, quizTitleType, isFirstSessionType, testPurpose, QuestionSet } from "../types";
import InstructionPage from "./InstructionPage.vue";
export default defineComponent({
  name: "Splash",
  components: {
    IconButton,
    BaseIcon,
    InstructionPage
  },
  props: {
    title: {
      type: [null, String] as PropType<quizTitleType>,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    quizType: {
      type: String as PropType<quizType>,
      required: true,
    },
    numQuestions: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true
    },
    maxQuestionsAllowedToAttempt: {
      type: Number,
      required: true,
    },
    quizTimeLimit: {
      type: Number,
      required: true
    },
    questionSets: {
      required: true,
      type: Array as PropType<QuestionSet[]>
    },
    test_purpose: {
      type: [null, String] as PropType<testPurpose>,
      required: true
    },
    isFirstSession: {
      type: Boolean as PropType<isFirstSessionType>,
      default: null,
    },
  },
  setup(props, context) {
    const state = reactive({
      metadataContainerClass:
        "grid grid-cols-2 space-x-6 bg-yellow-400 p-4 rounded-2xl w-11/12 bp-360:w-10/12 sm:w-2/3 md:w-1/2 xl:w-1/3",
      metadataCellClass:
        "flex space-x-1 bp-360:space-x-2 sm:space-x-4 border-primary flex space-x-2 sm:space-x-4 border-primary",
      metadataIconClass: "h-full w-8 sm:w-12 fill-primary flex",
      metadataTitleClass: "font-poppins-regular text-sm sm:text-base",
    });

    /** title of the quiz. "Untitled" if no title is present */
    const displayTitle = computed(() => {
      if (props.title != undefined) return props.title || "Untitled";
      return "Untitled";
    });

    /** whether the session data has been fetched */
    const isSessionDataFetched = computed(() => {
      return props.isFirstSession != null;
    });

    const startButtonTextConfig = computed(() => {
      const config: IconButtonTitleConfig = {
        value: "",
        class: "text-lg md:text-xl text-white font-poppins-bold",
      };
      if (isSessionDataFetched.value) {
        config.value = props.isFirstSession ? "Let's Start" : "Resume";
      }
      return config;
    });

    const startButtonIconConfig = computed(() => {
      return {
        enabled: !isSessionDataFetched.value,
        iconName: "spinner-solid",
        iconClass: "animate-spin h-4 w-4 text-white",
      };
    });

    function start() {
      context.emit("start");
    }
    return {
      ...toRefs(state),
      displayTitle,
      startButtonTextConfig,
      isSessionDataFetched,
      startButtonIconConfig,
      start,
    };
  },
  emits: ["start"],
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Londrina+Solid&family=Poppins:wght@400;700&display=swap");

.font-londrina {
  font-family: "Londrina Solid";
}
.font-poppins-regular {
  font-family: "Poppins", sans-serif;
  font-weight: 400;
}
.font-poppins-bold {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
}
</style>
