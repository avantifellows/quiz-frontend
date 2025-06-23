<template>
  <!-- Only render palette on large screens -->
  <div
    class="bg-white p-4 sm:p-6 lg:p-8 overflow-auto lg:w-1/3 hidden lg:block"
  >
    <InstructionPage
      :title="title"
      :subject="subject"
      :testFormat="testFormat"
      :maxMarks="maxMarks"
      :max-questions-allowed-to-attempt="numQuestions"
      :quizTimeLimit="quizTimeLimit"
      :questionSetStates="questionSetStates"
      :is-omr-mode="isOmrMode"
      data-test="instruction-page"
    />

    <div data-test="question-palette">
      <div class="bg-gray-200 rounded-md p-4 grid grid-rows-2 space-y-2 mt-6">
        <div class="grid grid-cols-2">
          <Success :title="legendSuccessText" :hasQuizEnded="hasQuizEnded" />
          <Error :title="legendErrorText" :hasQuizEnded="hasQuizEnded" />
        </div>

        <div class="grid grid-cols-2">
          <Neutral :title="legendNeutralText" :hasQuizEnded="hasQuizEnded" />
          <div v-if="!hasQuizEnded">
            <Review title="Marked For Review" :hasQuizEnded="hasQuizEnded" />
          </div>
          <div v-if="hasQuizEnded">
            <PartialSuccess
              :title="legendPartialSuccessText"
              :hasQuizEnded="hasQuizEnded"
            />
          </div>
        </div>
      </div>

      <div
        v-for="(questionSetState, index) in questionSetStates"
        :key="index"
        class="space-y-2"
      >
        <p :class="titleTextClass" :data-test="`paletteTitle-${index}`">
          {{ questionSetState.title }}
        </p>
        <div
          :class="instructionTextClass"
          :data-test="`paletteInstruction-${index}`"
          v-html="questionSetState.instructionText"
        ></div>

        <div
          class="grid grid-cols-5 bp-500:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 mt-4 space-y-4"
        >
          <PaletteItem
            v-for="(questionState, qindex) in questionSetState.paletteItems"
            class="hover:cursor-pointer"
            :class="{ 'mt-4': qindex == 0 }"
            :key="qindex"
            :index="questionState.index"
            :hasQuizEnded="hasQuizEnded"
            :state="questionState.value"
            :isHighlighted="currentQuestionIndex == questionState.index"
            @click="navigateToQuestion(questionState.index)"
            :data-test="`paletteItem-${questionState.index}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Success from "./Success.vue";
import PartialSuccess from "./PartialSuccess.vue";
import Error from "./Error.vue";
import Neutral from "./Neutral.vue";
import Review from "./Review.vue";
import PaletteItem from "./Item.vue";
import InstructionPage from "@/components/InstructionPage.vue";
import { TimeLimit, questionSetPalette, quizTitleType, testFormat } from "@/types";
import { defineComponent, computed, PropType, reactive } from "vue";

export default defineComponent({
  components: {
    Success,
    PartialSuccess,
    Error,
    Neutral,
    Review,
    PaletteItem,
    InstructionPage
  },
  props: {
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
    questionSetStates: {
      type: Array as PropType<questionSetPalette[]>,
      default: () => [],
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    title: {
      type: [null, String] as PropType<quizTitleType>,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      default: "..",
    },
    numQuestions: {
      type: Number,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true
    },
    quizTimeLimit: {
      type: Object as PropType<TimeLimit> || null,
      default: null
    },
    testFormat: {
      type: [null, String] as PropType<testFormat>,
      default: null
    },
    isOmrMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    function navigateToQuestion(questionIndex: number) {
      if (!props.isOmrMode) {
        context.emit("navigate", questionIndex);
      }
    }

    const state = reactive({
      instructionTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 mt-2 leading-none text-slate-500",
      titleTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 mt-10 font-bold leading-tight whitespace-pre-wrap",
    });

    const legendSuccessText = computed(() =>
      props.hasQuizEnded ? "Correct" : "Answered"
    );
    const legendErrorText = computed(() =>
      props.hasQuizEnded ? "Wrong" : "Not Answered"
    );
    const legendNeutralText = computed(() =>
      props.hasQuizEnded ? "Skipped" : "Not Visited"
    );

    const legendPartialSuccessText = "Partially Correct"

    return {
      ...state,
      navigateToQuestion,
      legendSuccessText,
      legendPartialSuccessText,
      legendErrorText,
      legendNeutralText,
    };
  },
  emits: ["navigate"],
});
</script>
