<template>
  <div class="fixed top-0 left-0 w-full z-20">
    <!-- Main Header Bar -->
    <div class="flex w-full justify-between items-center bg-gray-200 p-4">
      <!-- Left: Hamburger -->
      <div class="flex items-center">
        <icon-button
          :iconConfig="togglePaletteButtonIconConfig"
          :buttonClass="togglePaletteButtonClass"
          :isDisabled="isSessionAnswerRequestProcessing"
          @click="togglePalette"
          data-test="togglePaletteButton"
        ></icon-button>
      </div>

      <!-- Right: Controls -->
      <div class="flex items-center gap-3">
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
          v-if="showTimerOrLogout"
          class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3"
        >
          <icon-button
            v-if="showTimer"
            :titleConfig="countdownTimerTitleConfig"
            :buttonClass="countdownTimerClass"
            data-test="countdownTimer"
          ></icon-button>
          <icon-button
            v-if="showPortalLogout"
            class="sm:flex hidden"
            :titleConfig="portalLogoutTitleConfig"
            :buttonClass="portalLogoutButtonClass"
            @click="triggerPortalLogout"
            data-test="portalLogoutButton"
          ></icon-button>
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
    </div>

    <!-- Info Bar: Test Name and User ID (stacked on mobile) -->
    <div class="bg-gray-200 border-b border-gray-300 px-4 py-3">
      <!-- Mobile: Test Name (truncated) -->
      <div class="sm:hidden flex flex-col gap-2">
        <h1 class="text-base font-semibold text-gray-800 truncate" data-test="test-name-mobile">
          {{ $props.title || "no data" }}
        </h1>
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 font-semibold px-3 py-1.5 bg-gray-300 rounded inline-block" data-test="user-id-mobile">
            Id: {{ $props.userId || "no data" }}
          </div>
          <icon-button
            v-if="showPortalLogout"
            :titleConfig="portalLogoutTitleConfig"
            :buttonClass="portalLogoutButtonClass"
            @click="triggerPortalLogout"
            data-test="portalLogoutButtonMobile"
          />
        </div>
      </div>
      <!-- Tablet+: Test Name and ID side by side (no truncate) -->
      <div class="hidden sm:flex sm:justify-between sm:items-center gap-4">
        <h1 class="text-lg font-semibold text-gray-800 flex-1 break-words" data-test="test-name">
          {{ $props.title || "no data" }}
        </h1>
        <div class="text-base text-gray-700 font-semibold whitespace-nowrap px-4 py-2 bg-gray-300 rounded" data-test="user-id">
          Id: {{ $props.userId || "no data" }}
        </div>
      </div>
    </div>
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
    showPortalLogout: {
      type: Boolean,
      default: false
    },
    portalLogoutLabel: {
      type: String,
      default: "Logout"
    },
  },
  setup(props, context) {
    const state = reactive({
      endTestButtonClass:
        "bg-emerald-500 hover:bg-emerald-600 ring-emerald-500 p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl disabled:opacity-50 disabled:pointer-events-none",
      localIsPaletteVisible: props.isPaletteVisible,
      countdownTimerNormal:
        "bg-gray-500 ring-gray-500 p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl hover:cursor-default",
      countdownTimerAlert:
        "bg-red-600 ring-red-500 p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl hover:cursor-default",
      timeRemaining: props.timeRemaining
    });
    const isSmallScreen = ref(false);
    const updateScreenSize = () => {
      isSmallScreen.value = window.matchMedia("(max-width: 560px)").matches;
    };

    onMounted(() => {
      window.setInterval(() => {
        if (!props.hasQuizEnded && props.hasTimeLimit && !props.isSessionAnswerRequestProcessing) {
          state.timeRemaining -= 1
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
    const showTimerOrLogout = computed(
      () => showTimer.value || props.showPortalLogout
    );
    const portalLogoutTitleConfig = computed(() => ({
      value: props.portalLogoutLabel || "Logout",
      class: "text-white text-sm bp-500:text-md lg:text-lg xl:text-xl font-bold",
    }));
    const portalLogoutButtonClass = computed(() =>
      "bg-red-600 hover:bg-red-700 ring-red-600 p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl disabled:opacity-50 disabled:pointer-events-none"
    );

    const triggerPortalLogout = () => {
      context.emit("logout");
    };

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
      class:
        "text-white text-sm bp-500:text-md lg:text-lg xl:text-xl font-bold",
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

    const countdownTimerTitleConfig = computed(() => (
      {
        value: `${hours.value}:${minutes.value}:${seconds.value}`,
        class:
        "text-white text-sm bp-500:text-md lg:text-lg xl:text-xl font-bold"
      }));

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
        state.timeRemaining = newValue;
      }
    )

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
      countdownTimerTitleConfig,
      shouldShowOmrToggle,
      toggleButtonIconClass,
      toggleButtonIconConfig,
      toggleButtonTextConfig,
      toggleOmrMode,
      displayUserId,
      showTimer,
      showTimerOrLogout,
      portalLogoutButtonClass,
      portalLogoutTitleConfig,
      triggerPortalLogout
    };
  },
  components: {
    IconButton,
  },
  emits: ["end-test", "end-test-by-time", "update:isPaletteVisible", "time-limit-warning", "logout"],
});
</script>
