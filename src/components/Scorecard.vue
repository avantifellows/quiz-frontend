<template>
  <div class="flex flex-col bg-[#FFEDDA] w-full h-full overflow-hidden">
    <div
      class="flex justify-center w-full mx-auto my-auto h-full py-4"
      ref="container"
    >
      <div
        class="flex flex-col justify-center w-5/6"
        :class="{
          'space-y-8': !isCircularProgressShown && !isMobileLandscape,
          'space-y-4': !isCircularProgressShown && isMobileLandscape,
        }"
      >
        <!-- scorecard greeting -->
        <div
          class="text-center text-lg md:text-xl lg:text-2xl font-extrabold font-sans"
          :class="{ 'mb-4': isCircularProgressShown }"
        >
          {{ greeting }}
        </div>

        <!-- name of the quiz -->
        <div
          class="text-center text-sm md:text-lg lg:text-xl font-medium truncate"
        >
          {{ title }}
        </div>

        <!-- canvas element for drawing the confetti -->
        <canvas id="confetticanvas" class="fixed z-50"></canvas>

        <!-- circular progress bar -->
        <CircularProgress
          v-if="isCircularProgressShown"
          class="relative mx-auto w-full flex justify-center"
          :radius="circularProgressRadius"
          :stroke="circularProgressStroke"
          :result="result"
          :progressBarPercent="localProgressBarPercentage"
          :key="reRenderKey"
        >
        </CircularProgress>

        <!-- metric boxes -->
        <div
          v-if="hasGradedQuestions"
          class="flex flex-col bp-500:flex-row justify-center space-y-1 bp-500:space-x-1 bp-500:space-y-0 px-4 bp-500:px-10 max-w-4xl place-self-center"
        >
          <div
            v-for="(metric, metricIndex) in metrics"
            class="rounded-md bp-500:rounded-2xl bg-amber-400 grid grid-cols-2 bp-500:grid-rows-2 bp-500:grid-cols-none lg:grid-cols-2 lg:grid-rows-none border-2 px-4 lg:px-6 w-full h-14 bp-500:h-20 min-w-max"
            :key="metric"
          >
            <div
              class="w-full h-full flex flex-row justify-center space-x-2 bp-500:mt-2 lg:mt-0"
            >
              <!-- metric icon -->
              <BaseIcon
                :name="metric.icon.source"
                :iconClass="metric.icon.class"
              ></BaseIcon>
              <!-- numeric value of the metric -->
              <p
                class="text-xl bp-360:text-2xl md:text-3xl lg:text-4xl font-bold my-auto"
                :data-test="`metricValue-${metricIndex}`"
              >
                {{ metric.value }}
              </p>
            </div>
            <!-- name of the metric -->
            <div
              class="text-center text-xs bp-500:text-sm md:text-base mt-1 lg:mt-2 bp-500:whitespace-nowrap px-1 h-full flex place-self-center items-center"
            >
              <p>
                {{ metric.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- action buttons -->
        <div
          class="place-self-center flex h-14"
          :class="{
            'mt-5': isCircularProgressShown,
            'flex-row space-x-8 w-100 mt-12': !isPortrait,
            'flex-col space-y-2 w-32 mt-13': isPortrait,
          }"
          ignore-share-scorecard
        >
          <!-- share button -->
          <icon-button
            :titleConfig="shareButtonTitleConfig"
            :buttonClass="shareButtonClass"
            @click="shareScorecard"
            data-test="share"
          ></icon-button>

          <!-- back button -->
          <icon-button
            :titleConfig="backButtonTitleConfig"
            :buttonClass="backButtonClass"
            @click="goBack"
            data-test="backButton"
          ></icon-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  toRefs,
  onUnmounted,
  computed,
  watch,
  PropType,
} from "vue";
import CircularProgress from "./UI/Progress/CircularProgress.vue";
import {
  throwConfetti,
  isScreenPortrait,
} from "../services/Functional/Utilities";
import BaseIcon from "./UI/Icons/BaseIcon.vue";
import IconButton from "./UI/Buttons/IconButton.vue";
import domtoimage from "dom-to-image";
import { useStore } from "vuex";
import { ScorecardMetric, ScorecardResult } from "../types";

const confetti = require("canvas-confetti");
const PROGRESS_BAR_ANIMATION_DELAY_TIME = 500; // a time delay to be used for animating the progress bar
const MOBILE_SCREEN_HEIGHT_THRESHOLD = 500; // the maximum height of the screen in pixels that is classified as a mobile screen

export default defineComponent({
  name: "Scorecard",
  components: {
    CircularProgress,
    IconButton,
    BaseIcon,
  },
  props: {
    /**
     * details of all the metrics to show
     */
    metrics: {
      required: true,
      type: Array as PropType<ScorecardMetric[]>,
    },
    /** number of questions that the user has answered */
    numQuestionsAnswered: {
      required: true,
      type: Number,
    },
    /** greeting of the scorecard */
    greeting: {
      default: "",
      type: String,
    },
    /** whether the scorecard has to be shown */
    isShown: {
      default: false,
      type: Boolean,
    },
    /** whether there are graded questions */
    hasGradedQuestions: {
      default: false,
      type: Boolean,
    },
    /** progress to show on the progress bar (in %) */
    progressPercentage: {
      required: true,
      type: Number,
    },
    title: {
      required: true,
      type: String,
    },
    result: {
      type: Object as PropType<ScorecardResult>,
      default: () => {},
    },
  },
  setup(props, context) {
    const store = useStore();
    const confettiCanvas = document.getElementById("confetticanvas");
    const confettiHandler = confetti.create(confettiCanvas, {
      resize: true,
    });
    const state = reactive({
      localProgressBarPercentage: 0, // local value of progress
      innerWidth: window.innerWidth, // variable to hold the width of window
      reRenderKey: false, // a key to re-render a component
      // classes for watch again button
      backButtonClass:
        "bg-[#F78000] hover:bg-primary-hover bp-500:w-40 px-6 py-3 bp-500:p-4 bp-500:px-10 sm:p-6 rounded-2xl md:rounded-xl shadow-xl disabled:opacity-50 disabled:pointer-events-none",
      shareButtonClass:
        "bg-[#10B981] hover:bg-green-600 bp-500:w-40 px-6 py-3 bp-500:p-4 bp-500:px-10 sm:p-6 rounded-2xl md:rounded-xl shadow-xl disabled:opacity-50 disabled:pointer-events-none",
      isPortrait: true,
      isMobileLandscape: false, // whether the screen corresponds to a mobile screen in landscape mode
      confettiHandler: confettiHandler,
    });

    function checkScreenOrientation() {
      state.reRenderKey = !state.reRenderKey;
      state.innerWidth = window.innerWidth;
      state.isPortrait = isScreenPortrait();
      state.isMobileLandscape = checkMobileLandscapeMode();
    }

    const container = ref();

    onUnmounted(() => {
      window.removeEventListener("resize", checkScreenOrientation);
    });

    watch(
      () => props.isShown,
      (newValue) => {
        if (newValue) {
          setTimeout(() => {
            state.localProgressBarPercentage = props.progressPercentage;
          }, PROGRESS_BAR_ANIMATION_DELAY_TIME);
          // throw some confetti in there
          throwConfetti(state.confettiHandler);
        } else {
          // if scorecard is not visible anymore, reset things
          state.localProgressBarPercentage = 0;
        }
      }
    );

    /**
     * returns the text to be shared for showing result and number of questions answered
     */
    const resultTextToShare = computed(() => {
      return `I answered ${numQuestionsAnsweredText.value} questions with ${
        props.result.value
      } ${props.result.title.toLowerCase()} on Avanti Fellows quiz today!`;
    });

    /**
     * When the scorecard is shared, this method handles whether to use the singular
     * or the plural version of "question" based on the number of questions answered
     */
    const numQuestionsAnsweredText = computed(() => {
      if (props.numQuestionsAnswered <= 1) return props.numQuestionsAnswered;
      return props.numQuestionsAnswered;
    });
    /**
     * Whether the circular progress bar will be visible.
     * If progressPercentage is null, the circular progress
     * will not be visible
     */
    const isCircularProgressShown = computed(() => {
      if (
        !props.hasGradedQuestions ||
        props.progressPercentage == null ||
        state.isMobileLandscape
      ) {
        return false;
      }
      return true;
    });
    /**
     * reactively control the radius of the circular progress bar
     * according to the screen width
     */
    const circularProgressRadius = computed(() => {
      if (state.innerWidth >= 1200) return 130;
      else if (state.innerWidth < 1200 && state.innerWidth >= 1024) return 120;
      else if (state.innerWidth < 1024 && state.innerWidth >= 768) return 110;
      else if (state.innerWidth < 768 && state.innerWidth >= 640) return 100;
      else if (state.innerWidth < 640 && state.innerWidth >= 380) return 85;
      else if (state.innerWidth < 380 && state.innerWidth >= 300) return 80;
      return 60;
    });
    /**
     * reactively control the stroke of the circular progress bar
     * according to the screen width
     */
    const circularProgressStroke = computed(() => {
      if (state.innerWidth >= 1200) return 20;
      else if (state.innerWidth < 1200 && state.innerWidth >= 1024) return 18;
      else if (state.innerWidth < 1024 && state.innerWidth >= 768) return 18;
      else if (state.innerWidth < 768 && state.innerWidth >= 640) return 17;
      else if (state.innerWidth < 640 && state.innerWidth >= 380) return 15;
      else if (state.innerWidth < 380 && state.innerWidth >= 300) return 14;
      return 8;
    });
    /** config for the text of the go back button */
    const backButtonTitleConfig = computed(() => {
      return {
        value: "Go Back",
        class: "text-white text-md sm:text-lg lg:text-xl font-bold",
      };
    });
    /** config for the text of the share button */
    const shareButtonTitleConfig = computed(() => {
      return {
        value: "Share",
        class: "text-white text-md sm:text-lg lg:text-xl font-bold",
      };
    });

    /**
     * checks whether the current screen corresponds to a mobile-sized
     * screen in landscape mode
     */
    function checkMobileLandscapeMode() {
      return (
        !state.isPortrait && window.innerHeight < MOBILE_SCREEN_HEIGHT_THRESHOLD
      );
    }
    /**
     * share the scorecard message on whatsapp
     */
    function shareOnWhatsApp() {
      let message = `🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊\n\n🏆 *Hooray! I completed a Quiz!* 🏆\n\n`;

      // add title if it is non-empty
      if (props.title != "") message += `🌟 *${props.title}* 🌟\n\n`;

      // add result text if any question has been answered
      if (props.numQuestionsAnswered != 0) {
        message += `${resultTextToShare.value} 😇\n\n`;
      }
      message += "🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊";

      // required for correctly formatting the string to be used in the URL
      message = encodeURI(message);

      // @ts-ignore
      window
        .open("https://api.whatsapp.com/send/?phone&text=" + message)
        .focus();
    }
    /**
     * shares the scorecard on multiple platforms using the Web Share API on devices where it
     * is supported and falls back to sharing a text-based scorecard otherwise
     */
    function shareScorecard() {
      if (!navigator.canShare) {
        // if the web share API is not supported, share a text-based scorecard on WhatsApp
        shareOnWhatsApp();
        return;
      }
      store.dispatch("showSpinner");
      /**
       * the image generated by default is of a lower resolution
       * look at this to understand how we increase the resolution of
       * the generated image: https://github.com/tsayen/dom-to-image/issues/21
       */
      const scale = 2;
      domtoimage
        .toBlob(container.value, {
          bgcolor: "white",
          width: container.value.clientWidth * scale,
          height: container.value.clientHeight * scale,
          style: {
            transform: "scale(" + scale + ")",
            "transform-origin": "top center",
          },
          filter: (node: any) => {
            // ignore DOM elements containing the attribute 'ignore-share-scorecard'
            if (
              node.attributes != undefined &&
              node.attributes["ignore-share-scorecard"] != undefined
            ) {
              return false;
            }
            return true;
          },
        })
        .then((blob: Blob) => {
          // navigator.share requires an array of File objects
          const file = new File([blob], "scorecard.png", { type: blob.type });
          const filesArray = [file];

          /**
           * it is possible that the device supports the Web Share API in general
           * but does not support sharing the file that we have created; if it does
           * not, fall back to sharing the text-based scorecard on WhatsApp
           */
          if (navigator.canShare({ files: filesArray })) {
            let message = `Hooray!`;
            if (props.numQuestionsAnswered != 0) {
              message += resultTextToShare.value;
            }
            message += " 🏆";

            navigator
              .share({
                files: filesArray,
                title: "Quiz Scorecard",
                text: message,
              })
              .catch((error) => console.log("Sharing failed", error));
          } else shareOnWhatsApp();
          store.dispatch("hideSpinner");
        });
    }
    /**
     * Emits an event to restart the quiz
     */
    function goBack() {
      context.emit("go-back");
    }

    // determine the screen orientation when the item modal is created
    checkScreenOrientation();
    // add listener for screen size being changed
    window.addEventListener("resize", checkScreenOrientation);

    return {
      ...toRefs(state),
      container,
      shareScorecard,
      goBack,
      isCircularProgressShown,
      backButtonTitleConfig,
      shareButtonTitleConfig,
      circularProgressRadius,
      circularProgressStroke,
    };
  },
  emits: ["go-back"],
});
</script>
