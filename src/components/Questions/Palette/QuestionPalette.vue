<template>
  <div class="bg-white p-4 sm:p-6 lg:p-8 overflow-auto sm:w-1/3 lg:w-1/3 xl:w-1/3">
    <div class="inline-flex rounded-md w-full" role="group">
      <button
        :class="togglePaletteButtonClass"
        class="mr-1"
        type="button"
        @click="togglePalette"
        data-test="togglePalette"
      >PALETTE</button>
      <button
        :class="toggleInstructionsButtonClass"
        class="ml-1"
        type="button"
        @click="toggleInstructions"
        data-test="toggleInstructions"
      >INSTRUCTIONS</button>
    </div>
      <InstructionPage
      v-if="showInstructionButton"
      :title="title"
      :subject="subject"
      :testFormat="testFormat"
      :maxMarks="maxMarks"
      :max-questions-allowed-to-attempt="numQuestions"
      :quizTimeLimit="quizTimeLimit"
      :questionSetStates = "questionSetStates"
      data-test="instruction-page"
    />
    <div v-if="showPaletteButton" data-test="question-palette">
      <div
        class="bg-gray-200 rounded-md p-4 grid grid-rows-2 space-y-2 mt-6"
      >
        <div class="grid grid-cols-2">
          <Success
            :title="legendSuccessText"
            :hasQuizEnded="hasQuizEnded"
          ></Success>
          <Error :title="legendErrorText" :hasQuizEnded="hasQuizEnded"></Error>
        </div>

        <div class="grid grid-cols-2">
          <Neutral
          :title="legendNeutralText"
          :hasQuizEnded="hasQuizEnded"
        ></Neutral>
          <div v-if="hasQuizEnded">
            <PartialSuccess :title="legendPartialSuccessText" :hasQuizEnded="hasQuizEnded"></PartialSuccess>
          </div>
        </div>
      </div>

      <div
        v-for="(questionSetState, index) in questionSetStates" :key="index" class="space-y-2">
          <p :class="titleTextClass" :data-test="`paletteTitle-${index}`">{{ questionSetState.title }}</p>
          <div :class="instructionTextClass" :data-test="`paletteInstruction-${index}`" v-html="questionSetState.instructionText"></div>
          <div class="grid grid-cols-5 bp-500:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 mt-4 space-y-4">
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
            ></PaletteItem>
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
  },
  setup(props, context) {
    function navigateToQuestion(questionIndex: number) {
      context.emit("navigate", questionIndex);
    }

    function toggleInstructions() {
      if (state.showInstructions == false) {
        state.showInstructions = !state.showInstructions;
        state.showPalette = !state.showPalette
      }
    };

    function togglePalette() {
      if (state.showPalette == false) {
        state.showPalette = !state.showPalette;
        state.showInstructions = !state.showInstructions;
      }
    }
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

    const showInstructionButton = computed(() => state.showInstructions == true)
    const showPaletteButton = computed(() => state.showPalette == true)

    const toggleInstructionsButtonClass = computed(() => [
      {
        "bg-primary": !showInstructionButton.value,
        "bg-orange-300 hover:cursor-not-allowed": showInstructionButton.value,
      },
      `w-1/2 font-bold text-white p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl border shadow-lg ring-primary`,
    ]);

    const togglePaletteButtonClass = computed(() => [
      {
        "bg-primary": !showPaletteButton.value,
        "bg-orange-300 hover:cursor-not-allowed": showPaletteButton.value,
      },
      `w-1/2 font-bold text-white p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl border shadow-lg ring-primary`,
    ]);

    const state = reactive({
      instructionTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 mt-2 leading-none text-slate-500",
      titleTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 mt-10 font-bold leading-tight whitespace-pre-wrap",
      instructionsButtonClass:
        "bg-gray-300 w-full font-bold ring-gray-500 p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl",
      showInstructions: false,
      showPalette: true,
    });

    return {
      ...state,
      navigateToQuestion,
      toggleInstructions,
      togglePalette,
      legendSuccessText,
      legendPartialSuccessText,
      showInstructionButton,
      showPaletteButton,
      toggleInstructionsButtonClass,
      togglePaletteButtonClass,
      legendErrorText,
      legendNeutralText,
    };
  },
  emits: ["navigate"],
});
</script>
