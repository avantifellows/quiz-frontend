<template>
  <div class="flex flex-col bg-[#FFEDDA] w-full min-h-screen">
    <div
      class="flex justify-center w-full mx-auto my-auto h-full py-8"
      ref="container"
    >
      <div
        class="flex flex-col justify-center w-full sm:w-5/6 max-w-4xl mx-auto"
        :class="{
          'space-y-6': !isCircularProgressShown && !isMobileLandscape,
          'space-y-4': !isCircularProgressShown && isMobileLandscape,
        }"
      >
        <!-- Main content card -->
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8 mx-4">
          <!-- scorecard greeting with icon -->
          <div class="text-center mb-6">
            <div class="text-4xl mb-3">🎉</div>
            <div
              class="text-xl md:text-2xl lg:text-3xl font-extrabold font-sans text-gray-800"
            >
              {{ greeting }}
            </div>
          </div>

          <!-- name of the quiz -->
          <div
            class="text-center text-lg md:text-xl lg:text-2xl font-semibold text-gray-700 mb-4"
          >
            {{ title }}
          </div>

          <!-- student's userId in a styled box -->
          <div
            class="text-center mb-6"
          >
            <div class="inline-block bg-gray-100 rounded-lg px-4 py-2">
              <span class="text-base font-semibold text-gray-800" data-test="scorecard-user-id"> Id: {{ displayUserId }}</span>
            </div>
          </div>

          <!-- canvas element for drawing the confetti -->
          <canvas id="confetticanvas" class="fixed z-50 pointer-events-none"></canvas>

          <div v-if="showScores || isFormQuiz">
            <!-- circular progress bar -->
            <CircularProgress
              v-if="isCircularProgressShown"
              class="relative mx-auto w-full flex justify-center mb-6"
              :radius="circularProgressRadius"
              :stroke="circularProgressStroke"
              :result="result"
              :progressBarPercent="localProgressBarPercent"
              :key="reRenderKey"
              data-test="progress"
            >
            </CircularProgress>

            <!-- metric boxes -->
            <div
              v-if="hasGradedQuestions && !isFormQuiz"
              class="flex flex-col bp-500:flex-row justify-center space-y-3 bp-500:space-x-4 bp-500:space-y-0 mb-6"
            >
              <div
                v-for="(metric, metricIndex) in metrics"
                class="rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 flex flex-row items-center px-4 py-3 shadow-md"
                :key="metric"
              >
                <!-- metric icon -->
                <BaseIcon
                  :name="metric.icon.source"
                  :iconClass="metric.icon.class"
                  class="mr-3"
                ></BaseIcon>
                <!-- metric content -->
                <div class="flex flex-col">
                  <p
                    class="text-2xl md:text-3xl font-bold text-gray-800"
                    :data-test="`metricValue-${metricIndex}`"
                  >
                    {{ metric.value }}
                  </p>
                  <p class="text-sm font-medium text-gray-700">
                    {{ metric.name }}
                  </p>
                </div>
              </div>
            </div>

            <!-- question set metrics table -->
            <div v-if="isQuizAssessment" class="bg-gray-50 rounded-lg p-4 mb-6 overflow-auto">
              <div class="flex border-b-2 border-gray-400 p-2 font-bold">
                <div :class="tableCellClass">Name</div>
                <div :class="tableCellClass">Marks Scored</div>
                <div v-if="!isPortrait" :class="tableCellClass">Total No. Of Questions</div>
                <div :class="tableCellClass">Attempt Rate (%)</div>
                <div :class="tableCellClass">Accuracy Rate (%)</div>
              </div>
              <div v-for="metric in $props.qsetMetrics" :key="metric.name" class="flex border-b border-gray-100 p-2">
                <div :class="tableCellClass">{{ metric.name }}</div>
                <div :class="tableCellClass">{{ metric.marksScored }}</div>
                <div v-if="!isPortrait" :class="tableCellClass">{{ metric.maxQuestionsAllowedToAttempt }}</div>
                <div :class="tableCellClass">{{ formatPercentage(metric.attemptRate) }}</div>
                <div :class="tableCellClass">{{ formatPercentage(metric.accuracyRate) }}</div>
              </div>
            </div>

            <!-- action buttons when showing scores -->
            <div v-if="showScores" class="flex justify-center mt-6" ignore-share-scorecard>
              <!-- when both next step and share are available -->
              <div v-if="nextStepUrl" class="flex flex-col gap-4 items-center w-full max-w-xs">
                <!-- see answers button (when review is allowed) -->
                <icon-button
                  v-if="reviewAnswers"
                  :titleConfig="backButtonTitleConfig"
                  :buttonClass="backButtonClass + ' w-full'"
                  @click="goBack"
                  data-test="see-answers"
                ></icon-button>

                <!-- share button -->
                <icon-button
                  :titleConfig="shareButtonTitleConfig"
                  :buttonClass="shareButtonClass + ' w-full'"
                  @click="shareScorecard"
                  data-test="share"
                ></icon-button>

                <!-- next step button -->
                <icon-button
                  :titleConfig="nextStepButtonTitleConfig"
                  :buttonClass="nextStepButtonClass + ' w-full'"
                  @click="proceedToNextStep"
                  data-test="proceed-next"
                ></icon-button>
              </div>

              <!-- when only share is available (no next step) -->
              <div v-else class="flex flex-col gap-4 items-center w-full max-w-xs">
                <!-- see answers button (when review is allowed) -->
                <icon-button
                  v-if="reviewAnswers"
                  :titleConfig="backButtonTitleConfig"
                  :buttonClass="backButtonClass + ' w-full'"
                  @click="goBack"
                  data-test="see-answers"
                ></icon-button>

                <!-- share button -->
                <icon-button
                  :titleConfig="shareButtonTitleConfig"
                  :buttonClass="shareButtonClass + ' w-full'"
                  @click="shareScorecard"
                  data-test="share"
                ></icon-button>
              </div>
            </div>

            <!-- completion message when not showing scores (for forms) -->
            <div v-else>
              <div class="text-center mt-6">
                <div class="text-lg md:text-xl lg:text-2xl font-semibold text-gray-700 mb-4">
                  {{ completionMessage }}
                </div>
                <div v-if="nextStepUrl" class="flex justify-center">
                  <div class="w-full max-w-xs">
                    <icon-button
                      :titleConfig="nextStepButtonTitleConfig"
                      :buttonClass="nextStepButtonClass + ' w-full'"
                      @click="proceedToNextStep"
                      data-test="proceed-next"
                    ></icon-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- completion message when neither showScores nor isFormQuiz -->
          <div v-else class="text-center mt-6">
            <div class="text-lg md:text-xl lg:text-2xl font-semibold text-gray-700 mb-4">
              {{ completionMessage }}
            </div>
            <div v-if="nextStepUrl" class="flex justify-center">
              <div class="w-full max-w-xs">
                <icon-button
                  :titleConfig="nextStepButtonTitleConfig"
                  :buttonClass="nextStepButtonClass + ' w-full'"
                  @click="proceedToNextStep"
                  data-test="proceed-next"
                ></icon-button>
              </div>
            </div>
          </div>
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
import { ScorecardMetric, CircularProgressResult, quizTitleType, quizType, QuestionSetMetric } from "../types";

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
    /** whether scores have to be displayed after quiz has ended */
    showScores: {
      default: true,
      type: Boolean
    },
    /** whether there are graded questions */
    hasGradedQuestions: {
      default: false,
      type: Boolean,
    },
    /** progress to show on the progress bar (in %) */
    progressPercentage: {
      required: true,
      type: Number || null,
    },
    title: {
      required: true,
      type: [null, String] as PropType<quizTitleType>,
    },
    quizType: {
      type: String as PropType<quizType>,
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
    result: {
      type: Object as PropType<CircularProgressResult>,
      default: () => {},
    },
    qsetMetrics: {
      required: true,
      type: Array as PropType<QuestionSetMetric[]>,
    },
    /** Processed next step URL (already has parameters replaced) */
    nextStepUrl: {
      type: String,
      default: ""
    },
    /** Text to display on the next step button */
    nextStepText: {
      type: String,
      default: "Proceed to Next Step"
    },
    /** Whether users can review answers after quiz ends */
    reviewAnswers: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const store = useStore();
    const confettiCanvas = document.getElementById("confetticanvas");
    const confettiHandler = confetti.create(confettiCanvas, {
      resize: true,
    });
    const state = reactive({
      localProgressBarPercent: 0, // local value of progress
      innerWidth: window.innerWidth, // variable to hold the width of window
      reRenderKey: false, // a key to re-render a component
      // classes for watch again button
      backButtonClass:
        "bg-back-color hover:bg-primary-hover bp-500:w-40 px-6 py-3 bp-500:p-4 bp-500:px-10 sm:p-6 rounded-2xl md:rounded-xl shadow-xl disabled:opacity-50 disabled:pointer-events-none invisible",
      shareButtonClass:
        "flex justify-center bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-2xl md:rounded-xl shadow-xl cursor-pointer",
      tableCellClass: "px-2 sm:px-4 flex-1 whitespace-normal break-words",
      isPortrait: true,
      isMobileLandscape: false, // whether the screen corresponds to a mobile screen in landscape mode
      confettiHandler,
    });

    const displayUserId = computed(() => props.displayId || props.userId || "");

    function checkScreenOrientation() {
      state.reRenderKey = !state.reRenderKey;
      state.innerWidth = window.innerWidth;
      state.isPortrait = isScreenPortrait();
      state.isMobileLandscape = checkMobileLandscapeMode();
    }

    const container = ref();

    window.scrollTo(0, 0); // scroll up top incase users scroll down in modal screen

    onUnmounted(() => {
      window.removeEventListener("resize", checkScreenOrientation);
    });

    watch(
      () => props.isShown,
      (newValue) => {
        if (newValue) {
          setTimeout(() => {
            state.localProgressBarPercent = props.progressPercentage;
          }, PROGRESS_BAR_ANIMATION_DELAY_TIME);
          // throw some confetti in there
          throwConfetti(state.confettiHandler);
        } else {
          // if scorecard is not visible anymore, reset things
          state.localProgressBarPercent = 0;
        }
      }
    );

    const isQuizAssessment = computed(() => {
      return (props.quizType == "assessment" || props.quizType == "omr-assessment")
    })

    const isFormQuiz = computed(() => props.quizType == "form")

    /** Completion message when scores are not shown */
    const completionMessage = computed(() => {
      if (isFormQuiz.value) {
        return props.nextStepUrl ? "Thanks for completing the questionnaire!" : "Thanks for completing the questionnaire! You may close this window.";
      }
      return props.nextStepUrl ? "Thank you for completing the quiz!" : "Thank you for completing the quiz! You may close this window.";
    });

    /**
     * returns the text to be shared for showing result and number of questions answered
     */
    const resultTextToShare = computed(() => {
      if (isFormQuiz.value) {
        return `I completed a questionnaire with ${numQuestionsAnsweredText.value} questions on Avanti Fellows today!`;
      }
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
        isFormQuiz.value ||
        !props.hasGradedQuestions ||
        props.progressPercentage == null ||
        props.result.value == null ||
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
        value: "See Answers",
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

    /** config for the text of the next step button */
    const nextStepButtonTitleConfig = computed(() => {
      return {
        value: props.nextStepText,
        class: "text-white text-md sm:text-lg lg:text-xl font-bold",
      };
    });

    /** config for the styling of the next step button */
    const nextStepButtonClass = computed(() => {
      return "flex justify-center bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-2xl md:rounded-xl shadow-xl cursor-pointer";
    });

    /** enhanced share button styling */
    const enhancedShareButtonClass = computed(() => {
      return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold";
    });

    /** Navigate to the next step URL */
    function proceedToNextStep() {
      if (props.nextStepUrl) {
        window.location.href = props.nextStepUrl;
      }
    }

    function formatPercentage(value: number) {
      return `${(value * 100).toFixed(2)}%`;
    }

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
      isQuizAssessment,
      isFormQuiz,
      container,
      shareScorecard,
      shareButtonTitleConfig,
      backButtonTitleConfig,
      nextStepButtonTitleConfig,
      nextStepButtonClass,
      enhancedShareButtonClass,
      completionMessage,
      proceedToNextStep,
      goBack,
      isCircularProgressShown,
      circularProgressRadius,
      circularProgressStroke,
      formatPercentage,
      displayUserId,
    };
  },
  emits: ["go-back"],
});
</script>
