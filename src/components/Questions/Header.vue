<template>
  <div class="flex w-full justify-end bg-gray-100 p-4">
    <!-- end-test button -->
    <icon-button
      :titleConfig="endTestButtonTitleConfig"
      :buttonClass="endTestButtonClass"
      @click="endTest"
      data-test="endTestButton"
    ></icon-button>
  </div>
</template>

<script lang="ts">
import IconButton from "../UI/Buttons/IconButton.vue";
import { defineComponent, reactive, toRefs, computed } from "vue";

export default defineComponent({
  name: "Header",
  props: {
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const state = reactive({
      endTestButtonClass:
        "bg-emerald-500 hover:bg-emerald-600 ring-emerald-500 p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl disabled:opacity-50 disabled:pointer-events-none",
    });
    function endTest() {
      context.emit("end-test");
    }
    const endTestButtonTitleConfig = computed(() => ({
      value: props.hasQuizEnded ? "See Results" : "End Test",
      class:
        "text-white text-sm bp-500:text-md lg:text-lg xl:text-xl font-bold",
    }));

    return {
      ...toRefs(state),
      endTest,
      endTestButtonTitleConfig,
    };
  },
  components: {
    IconButton,
  },
  emits: ["end-test"],
});
</script>
