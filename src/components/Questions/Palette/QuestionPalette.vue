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
      class="grid grid-cols-5 bp-500:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 mt-4 space-y-4"
    >
      <PaletteItem
        v-for="(state, stateIndex) in questionStates"
        :class="{ 'mt-4': stateIndex == 0 }"
        :key="stateIndex"
        :index="stateIndex"
        :hasQuizEnded="hasQuizEnded"
        :state="state"
      ></PaletteItem>
    </div>
  </div>
</template>

<script lang="ts">
import Success from "./Success.vue";
import Error from "./Error.vue";
import Neutral from "./Neutral.vue";
import PaletteItem from "./Item.vue";
import { questionState } from "../../../types";
import { defineComponent, computed, PropType } from "vue";

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
    questionStates: {
      type: Array as PropType<questionState[]>,
      default: () => [],
    },
  },
  setup(props) {
    const legendSuccessText = computed(() =>
      props.hasQuizEnded ? "Correct" : "Answered"
    );
    const legendErrorText = computed(() =>
      props.hasQuizEnded ? "Wrong" : "Not Answered"
    );
    const legendNeutralText = computed(() =>
      props.hasQuizEnded ? "Skipped" : "Not Visited"
    );
    return {
      legendSuccessText,
      legendErrorText,
      legendNeutralText,
    };
  },
});
</script>
