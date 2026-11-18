<template>
  <!-- One fixed row: menu | centred timer | End Test. 52px on phones, 60px from lg.
       QuestionModal, SinglePageModal and the palette are offset by this height.
       The test name and ID are in a context strip at the top of the question area. -->
  <div
    class="fixed top-0 left-0 w-full z-20 flex items-center gap-2 lg:gap-3 h-[52px] lg:h-[60px] px-3 lg:px-6 bg-white border-b border-gray-200"
  >
    <icon-button
      :iconConfig="togglePaletteButtonIconConfig"
      :buttonClass="togglePaletteButtonClass"
      :isDisabled="isSessionAnswerRequestProcessing"
      @click="togglePalette"
      data-test="togglePaletteButton"
    ></icon-button>

    <!-- centre slot: the countdown -->
    <div class="flex-1 min-w-0 flex justify-center">
      <!-- toggle omr button -->
      <icon-button
        v-if="shouldShowOmrToggle"
        :titleConfig="toggleButtonTextConfig"
        :iconConfig="toggleButtonIconConfig"
        :buttonClass="toggleButtonIconClass"
        class="rounded-2xl shadow-lg"
        data-test="toggleOmrMode"
        @click="toggleOmrMode"
      ></icon-button>
      <div
        v-if="showTimer"
        :class="countdownTimerClass"
        role="timer"
        data-test="countdownTimer"
      >{{ countdownTimerText }}</div>
    </div>

    <!-- end-test button -->
    <icon-button
      :titleConfig="endTestButtonTitleConfig"
      :buttonClass="endTestButtonClass"
      :iconConfig="endTestButtonIconConfig"
      :isDisabled="isSessionAnswerRequestProcessing"
      @click="endTest"
      data-test="endTestButton"
    ></icon-button>
  </div>
</template>

<script lang="ts">
import IconButton from "../UI/Buttons/IconButton.vue";
import { ref, defineComponent, reactive, toRefs, computed, watch, onMounted, onBeforeUnmount, PropType } from "vue";
import { quizTitleType, quizType } from "@/types";

export default defineComponent({
  name: "Header",
  props: {
    title: {
      type: [null, String] as PropType<quizTitleType>,
      required: true,
    },
    userId: {
      type: String,
      default: ""
    },
    displayId: {
      type: String,
      default: "",
    },
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
    /** whether the question palette is visible */
    isPaletteVisible: {
      type: Boolean,
      default: false,
    },
    isSessionAnswerRequestProcessing: {
      type: Boolean,
      default: false
    },
    /** whether the quiz has a time limit */
    hasTimeLimit: {
      type: Boolean,
      default: false
    },
    /** display a warning when <default> minutes left on timer */
    warningTimeLimit: {
      type: Number,
      default: 10
    },
    /** time remaining for quiz to complete */
    timeRemaining: {
      type: Number,
      default: 0 // time remaining for quiz to complete
    },
    isOmrMode: {
      type: Boolean,
      default: false,
    },
    quizType: {
      type: String as PropType<quizType>,
      default: "homework"
    },
  },
  setup(props, context) {
    const state = reactive({
      endTestButtonClass:
        "shrink-0 h-11 px-3.5 lg:px-[18px] rounded-[10px] bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none",
      localIsPaletteVisible: props.isPaletteVisible,
      countdownTimerNormal:
        "flex items-center h-[38px] px-3.5 rounded-[10px] bg-gray-100 text-gray-900 text-[17px] bp-360:text-lg lg:text-xl font-bold tracking-[0.03em] tabular-nums",
      countdownTimerAlert:
        "flex items-center h-[38px] px-3.5 rounded-[10px] bg-red-100 text-red-700 text-[17px] bp-360:text-lg lg:text-xl font-bold tracking-[0.03em] tabular-nums",
      timeRemaining: props.timeRemaining
    });
    const isSmallScreen = ref(false);
    const updateScreenSize = () => {
      isSmallScreen.value = window.matchMedia("(max-width: 560px)").matches;
    };

    onMounted(() => {
      window.setInterval(() => {
        if (!props.hasQuizEnded && props.hasTimeLimit && !props.isSessionAnswerRequestProcessing) {
          if (state.timeRemaining > 0) {
            state.timeRemaining -= 1
          } else {
            state.timeRemaining = 0
          }
        }
      }, 1000); // update every second if quiz has not ended
    })

    function endTest() {
      context.emit("end-test");
    }
    function togglePalette() {
      state.localIsPaletteVisible = !state.localIsPaletteVisible;
    }

    // repetitive code - make a component later
    function toggleOmrMode() {
      const url = new URL(window.location.href);

      if (url.searchParams.has("omrMode")) {
        url.searchParams.delete("omrMode");
      } else {
        url.searchParams.set("omrMode", "true");
      }

      window.location.href = url.toString();
    }

    // const shouldShowOmrToggle = computed(() => props.quizType == "assessment")
    const shouldShowOmrToggle = computed(() => false)

    const displayUserId = computed(() => props.displayId || props.userId || "");
    const showTimer = computed(() => !props.hasQuizEnded && props.hasTimeLimit);

    const toggleButtonTextConfig = computed(() => {
      const config = {
        value: "",
        class: ["text-orange-500 underline underline-offset-8", "text-base md:text-lg lg:text-xl font-semibold"],
      };

      if (props.isOmrMode) {
        config.value = isSmallScreen.value ? "A" : "Switch to Assessment Mode";
      } else {
        config.value = isSmallScreen.value ? "O" : "Switch to OMR Mode";
      }

      return config;
    });

    const toggleButtonIconClass = computed(() => {
      const iconClass = [
        "border border-orange-300",
        "bg-transparent hover:bg-gray-100",
        "rounded-lg shadow-sm px-6 py-3",
        "flex items-center justify-center",
        "transition-all duration-200 ease-in-out"
      ]

      return iconClass;
    });

    const toggleButtonIconConfig = computed(() => {
      return {
        iconName: props.isOmrMode ? "check-circle-solid" : "sync-alt-solid",
        iconClass: "h-4 w-4 text-white",
      };
    });

    const endTestButtonTitleConfig = computed(() => ({
      value: props.hasQuizEnded ? "See Results" : "End Test",
      class: "text-white text-sm lg:text-base font-semibold whitespace-nowrap",
    }));

    const endTestButtonIconConfig = computed(() => {
      return {
        enabled: props.isSessionAnswerRequestProcessing && props.isOmrMode,
        iconName: "spinner-solid",
        iconClass: "animate-spin h-4 w-4 text-primary",
      };
    });

    const countdownTimerClass = computed(() => {
      let buttonClass;
      if (state.timeRemaining >= props.warningTimeLimit * 60) {
        buttonClass = state.countdownTimerNormal;
      } else {
        buttonClass = state.countdownTimerAlert;
      }
      return buttonClass;
    })

    function padWithZeroes(digit: Number) {
      if (digit.toString().length <= 1) {
        return "0" + digit.toString()
      }
      return digit.toString()
    }

    const seconds = computed(() => {
      return padWithZeroes((state.timeRemaining) % 60)
    })

    const minutes = computed(() => {
      return padWithZeroes(Math.trunc(state.timeRemaining / 60) % 60)
    })

    const hours = computed(() => {
      return padWithZeroes(Math.trunc(state.timeRemaining / 60 / 60) % 24)
    })

    const countdownTimerText = computed(() => `${hours.value}:${minutes.value}:${seconds.value}`);

    watch(
      () => state.timeRemaining,
      (newValue) => {
        if (newValue == props.warningTimeLimit * 60) {
          context.emit("time-limit-warning")
        }
        if (newValue == 0) {
          context.emit("end-test-by-time")
        }
      })

    // Watch for prop changes and update internal state (useful for testing)
    watch(
      () => props.timeRemaining,
      (newValue) => {
        state.timeRemaining = Math.max(0, newValue);
      }
    )

    const togglePaletteButtonClass = computed(() => [
      {
        "bg-transparent hover:bg-gray-100": !props.isPaletteVisible,
        "bg-gray-600": props.isPaletteVisible,
      },
      `shrink-0 rounded-[10px] h-11 w-11 p-2.5`,
    ]);

    const togglePaletteButtonIconConfig = computed(() => ({
      enabled: true,
      iconName: "hamburger",
      iconClass: [
        {
          "text-white": props.isPaletteVisible,
          "text-black": !props.isPaletteVisible,
        },
        `fill-current h-6 w-6`,
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

    // Setup listeners for screen size changes
    onMounted(() => {
      updateScreenSize();
      window.addEventListener("resize", updateScreenSize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", updateScreenSize);
    });

    return {
      ...toRefs(state),
      endTest,
      togglePalette,
      endTestButtonTitleConfig,
      endTestButtonIconConfig,
      togglePaletteButtonIconConfig,
      togglePaletteButtonClass,
      countdownTimerClass,
      countdownTimerText,
      shouldShowOmrToggle,
      toggleButtonIconClass,
      toggleButtonIconConfig,
      toggleButtonTextConfig,
      toggleOmrMode,
      displayUserId,
      showTimer,
    };
  },
  components: {
    IconButton,
  },
  emits: ["end-test", "end-test-by-time", "update:isPaletteVisible", "time-limit-warning"],
});
</script>
