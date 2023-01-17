<template>
  <div class="bg-white p-4 sm:p-6 lg:p-8 overflow-auto">
    <div
      class="bg-gray-200 border-gray-500 border-1 rounded-md p-4 grid grid-rows-2 space-y-2"
    >
      <div class="grid grid-cols-2">
        <Success
          :title="legendSuccessText"
          :hasQuizEnded="hasQuizEnded"
        ></Success>
        <Error :title="legendErrorText" :hasQuizEnded="hasQuizEnded"></Error>
      </div>

      <Neutral
        :title="legendNeutralText"
        :hasQuizEnded="hasQuizEnded"
      ></Neutral>
    </div>

    <div
      v-for="(itemSetState, index) in questionSetStates" :key="index" class="space-y-2">
        <p :class="titleTextClass" :data-test="`paletteTitle-${index}`">{{ itemSetState.title }}</p>
        <p :class="instructionTextClass" :data-test="`paletteInstruction-${index}`">{{ itemSetState.instructionText }}</p>
        <div class="grid grid-cols-5 bp-500:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 mt-4 space-y-4">
          <PaletteItem
            v-for="(questionItemState, qindex) in itemSetState.paletteItems"
            class="hover:cursor-pointer"
            :class="{ 'mt-4': qindex == 0 }"
            :key="qindex"
            :index="questionItemState.index"
            :hasQuizEnded="hasQuizEnded"
            :state="questionItemState.value"
            :isHighlighted="currentQuestionIndex == questionItemState.index"
            @click="navigateToQuestion(questionItemState.index)"
            :data-test="`paletteItem-${questionItemState.index}`"
          ></PaletteItem>
        </div>

    </div>
  </div>
</template>

<script lang="ts">
import Success from "./Success.vue";
import Error from "./Error.vue";
import Neutral from "./Neutral.vue";
import PaletteItem from "./Item.vue";
import { questionSetPalette } from "../../../types";
import { defineComponent, computed, reactive, PropType } from "vue";

export default defineComponent({
  components: {
    Success,
    Error,
    Neutral,
    PaletteItem,
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
  },
  setup(props, context) {
    function navigateToQuestion(questionIndex: number) {
      context.emit("navigate", questionIndex);
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

    const state = reactive({
      instructionTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 m-2 leading-tight whitespace-pre-wrap text-slate-500",
      titleTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 mt-10 m-2 font-bold leading-tight whitespace-pre-wrap",
    })

    return {
      ...state,
      navigateToQuestion,
      legendSuccessText,
      legendErrorText,
      legendNeutralText,
    };
  },
  emits: ["navigate"],
});
</script>
