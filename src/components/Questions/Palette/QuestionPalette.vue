<template>
  <div class="bg-white p-4 sm:p-6 lg:p-8">
    <div
      class="bg-gray-200 border-gray-500 border-1 rounded-md p-4 grid grid-rows-2 space-y-2"
    >
      <div class="grid grid-cols-2">
        <Success :title="legendSuccessText"></Success>
        <Error :title="legendErrorText"></Error>
      </div>

      <Neutral :title="legendNeutralText"></Neutral>
    </div>
  </div>
</template>

<script lang="ts">
import Success from "./Success.vue";
import Error from "./Error.vue";
import Neutral from "./Neutral.vue";
import { defineComponent, computed } from "vue";

export default defineComponent({
  components: {
    Success,
    Error,
    Neutral,
  },
  props: {
    hasQuizEnded: {
      type: Boolean,
      default: false,
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
