<template>
  <div class="flex w-full justify-between bg-gray-100 p-4">
    <!-- hamburger for question palette -->
    <icon-button
      :iconConfig="togglePaletteButtonIconConfig"
      :buttonClass="togglePaletteButtonClass"
      @click="togglePalette"
      data-test="togglePaletteButton"
    ></icon-button>

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
import { defineComponent, reactive, toRefs, computed, watch } from "vue";

export default defineComponent({
  name: "Header",
  props: {
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
    /** whether the question palette is visible */
    isPaletteVisible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const state = reactive({
      endTestButtonClass:
        "bg-emerald-500 hover:bg-emerald-600 ring-emerald-500 p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl disabled:opacity-50 disabled:pointer-events-none",
      localIsPaletteVisible: props.isPaletteVisible,
    });
    function endTest() {
      context.emit("end-test");
    }
    function togglePalette() {
      state.localIsPaletteVisible = !state.localIsPaletteVisible;
    }

    const endTestButtonTitleConfig = computed(() => ({
      value: props.hasQuizEnded ? "See Results" : "End Test",
      class:
        "text-white text-sm bp-500:text-md lg:text-lg xl:text-xl font-bold",
    }));

    const togglePaletteButtonClass = computed(() => [
      {
        "bg-gray-300": !props.isPaletteVisible,
        "bg-gray-600": props.isPaletteVisible,
      },
      `rounded-md border shadow-lg ring-primary h-12 w-12 p-2 self-center`,
    ]);

    const togglePaletteButtonIconConfig = computed(() => ({
      enabled: true,
      iconName: "hamburger",
      iconClass: [
        {
          "text-white": props.isPaletteVisible,
          "text-black": !props.isPaletteVisible,
        },
        `fill-current h-8 w-8`,
      ],
    }));

    watch(
      () => props.isPaletteVisible,
      (newValue) => {
        state.localIsPaletteVisible = newValue;
      }
    );

    watch(
      () => state.localIsPaletteVisible,
      (newValue) => {
        context.emit("update:isPaletteVisible", newValue);
      }
    );

    return {
      ...toRefs(state),
      endTest,
      togglePalette,
      endTestButtonTitleConfig,
      togglePaletteButtonIconConfig,
      togglePaletteButtonClass,
    };
  },
  components: {
    IconButton,
  },
  emits: ["end-test", "update:isPaletteVisible"],
});
</script>
