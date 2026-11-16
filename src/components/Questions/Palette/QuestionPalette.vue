<template>
  <div class="bg-white p-4 bp-500:p-6 overflow-auto">
    <div class="flex items-center gap-3">
      <!-- Palette / Instructions: the selected view is filled. OMR has only instructions. -->
      <div
        v-if="!isOmrMode"
        class="flex flex-1 rounded-xl border-2 border-primary overflow-hidden"
        role="group"
      >
        <button
          :class="tabClass(showPaletteButton)"
          :aria-pressed="showPaletteButton"
          type="button"
          @click="togglePalette"
          data-test="togglePalette"
        >{{ $t("palette.paletteTab") }}</button>
        <button
          :class="tabClass(showInstructionButton)"
          :aria-pressed="showInstructionButton"
          type="button"
          @click="toggleInstructions"
          data-test="toggleInstructions"
        >{{ $t("palette.instructionsTab") }}</button>
      </div>
      <button
        type="button"
        class="ml-auto shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        :aria-label="$t('palette.close')"
        @click="$emit('close')"
        data-test="closePalette"
      >
        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>
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
      :is-omr-mode="isOmrMode"
      data-test="instruction-page"
    />
    <div v-if="showPaletteButton && !isOmrMode" data-test="question-palette">
      <div class="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg bg-gray-100 px-3 py-2.5">
        <div
          v-for="key in legendKeys"
          :key="key.label"
          class="flex items-center gap-2 text-sm font-semibold text-gray-700 leading-tight"
        >
          <BaseIcon
            v-if="hasQuizEnded"
            :name="key.icon"
            iconClass="palette-legend-icon w-5 h-5 shrink-0"
            data-test="quizEndedIcon"
          ></BaseIcon>
          <span
            v-else
            class="w-5 h-5 shrink-0 rounded border-2"
            :class="key.swatchClass"
            data-test="quizInProgressIcon"
          ></span>
          <span>{{ key.label }}</span>
        </div>
      </div>

      <div
        v-for="(questionSetState, index) in questionSetStates" :key="index" class="mt-6">
          <p :class="titleTextClass" :data-test="`paletteTitle-${index}`">{{ questionSetState.title }}</p>
          <div :class="instructionTextClass" :data-test="`paletteInstruction-${index}`" v-html="questionSetState.instructionText"></div>
          <div class="mt-3 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-x-2 gap-y-3 justify-items-center">
            <PaletteItem
              v-for="(questionState, qindex) in questionSetState.paletteItems"
              class="hover:cursor-pointer"
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
import PaletteItem from "./Item.vue";
import BaseIcon from "@/components/UI/Icons/BaseIcon.vue";
import { paletteTileStateClass, paletteTileEndedStateClass, paletteEndedBadgeIcon } from "./Utils";
import InstructionPage from "@/components/InstructionPage.vue";
import { TimeLimit, questionSetPalette, quizTitleType, testFormat } from "@/types";
import { defineComponent, computed, PropType, reactive } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    PaletteItem,
    BaseIcon,
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

    const { t } = useI18n();

    const state = reactive({
      instructionTextClass: "mt-1 text-sm leading-snug text-slate-500",
      titleTextClass: "text-base md:text-lg font-bold leading-tight whitespace-pre-wrap",
      // Set initial state based on isOmrMode
      showInstructions: props.isOmrMode,
      showPalette: !props.isOmrMode,
    });

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

    const showInstructionButton = computed(() => state.showInstructions == true)
    const showPaletteButton = computed(() => state.showPalette == true)

    // segmented toggle: the selected half is filled, the other is outlined
    function tabClass(isSelected: boolean) {
      return [
        "flex-1 py-2 px-3 text-sm bp-420:text-base font-bold",
        isSelected ? "bg-primary text-white" : "bg-white text-primary hover:bg-orange-50",
      ];
    }

    // in progress: the question's status; after the quiz: its result
    const legendKeys = computed(() =>
      props.hasQuizEnded
        ? [
            { state: "success", label: t("palette.correct") },
            { state: "error", label: t("palette.wrong") },
            { state: "neutral", label: t("palette.skipped") },
            { state: "partial-success", label: t("palette.partiallyCorrect") },
          ].map((key) => ({ ...key, icon: paletteEndedBadgeIcon[key.state], swatchClass: paletteTileEndedStateClass[key.state] }))
        : [
            { state: "success", label: t("palette.answered") },
            { state: "error", label: t("palette.notAnswered") },
            { state: "neutral", label: t("palette.notVisited") },
            { state: "review", label: t("palette.markedForReview") },
          ].map((key) => ({ ...key, icon: "", swatchClass: paletteTileStateClass[key.state] }))
    );

    return {
      ...state,
      navigateToQuestion,
      toggleInstructions,
      togglePalette,
      showInstructionButton,
      showPaletteButton,
      tabClass,
      legendKeys
    };
  },
  emits: ["navigate", "close"],
});
</script>

<style scoped>
/* the round result icons are fixed 44px SVGs; scale them to the legend */
:deep(.palette-legend-icon svg) {
  width: 100%;
  height: 100%;
}
</style>
