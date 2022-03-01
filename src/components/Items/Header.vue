<template>
  <div :class="containerClass">
    <!-- skip button -->
    <icon-button
      :titleConfig="skipButtonTitleConfig"
      :buttonClass="skipButtonClass"
      @click="skipItem"
      data-test="skip"
    ></icon-button>
  </div>
</template>

<script lang="ts">
import IconButton from "../UI/Buttons/IconButton.vue";
import { reactive, toRefs } from "vue";
import { IconButtonTitleConfig } from "../../types";

export default {
  name: "Header",
  setup(_, context) {
    const state = reactive({
      // styling class for the skip button
      skipButtonClass:
        "bg-primary hover:bg-primary-hover p-1 pl-4 pr-4 sm:p-2 sm:pl-10 sm:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none h-full" as string,
      // main styling class for this component
      containerClass:
        "px-6 md:px-8 xl:px-12 flex w-full bg-white justify-end p-1 space-x-2 mt-2" as string,
      // config for the title of skip button
      skipButtonTitleConfig: {
        value: "Skip",
        class: "text-white text-md sm:text-base lg:text-xl font-bold",
      } as IconButtonTitleConfig,
    });

    function skipItem() {
      context.emit("skip-item");
    }

    return {
      ...toRefs(state),
      skipItem,
    };
  },
  components: { IconButton },
  emits: ["skip-item"],
};
</script>
