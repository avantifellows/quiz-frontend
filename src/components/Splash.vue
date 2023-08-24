<template>
  <div class="flex flex-col justify-center h-full" >
    <BaseIcon
      name="splash"
      iconClass="w-11/12 bp-500:w-9/12 md:w-6/12 lg:w-5/12 mt-24 sm:mt-16 place-self-center"
    />

    <div
      class="bg-primary flex flex-col space-y-16 bp-360:space-y-14 bp-420:space-y-10 lg:space-y-12 items-center rounded-2xl py-12 bp-500:py-10 md:py-11 lg:py-12"
    >
      <!-- title -->
      <p class="font-poppins font-semibold text-white text-center text-3xl md:text-4xl lg:text-5xl" data-test="title">
        {{ displayTitle }}
      </p>

      <!-- metadata -->
      <div class="flex flex-col space-y-4 w-full items-center">
        <div :class="metadataContainerClass">
          <div :class="metadataCellClass" class="border-r-2">
            <BaseIcon
              name="question-mark-round"
              :iconClass="metadataIconClass"
            ></BaseIcon>
            <div class="flex items-center" data-test="numQuestions">
              <p :class="metadataTitleClass">{{ numQuestions }} questions</p>
            </div>
          </div>
          <div :class="metadataCellClass">
            <BaseIcon
              name="student-in-class"
              :iconClass="metadataIconClass"
            ></BaseIcon>

            <div class="flex items-center" data-test="grade">
              <p :class="metadataTitleClass">Class {{ grade }}</p>
            </div>
          </div>
        </div>

        <div :class="metadataContainerClass">
          <div :class="metadataCellClass" class="border-r-2">
            <BaseIcon name="math" :iconClass="metadataIconClass"></BaseIcon>
            <div class="flex items-center" data-test="subject">
              <p :class="metadataTitleClass">{{ subject }}</p>
            </div>
          </div>
          <div :class="metadataCellClass">
            <BaseIcon name="notepad" :iconClass="metadataIconClass"></BaseIcon>
            <div class="flex items-center" data-test="quizType">
              <p class="capitalize" :class="metadataTitleClass">
                {{ quizType }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- start button -->
      <icon-button
        :titleConfig="startButtonTextConfig"
        :iconConfig="startButtonIconConfig"
        :buttonClass="startButtonIconClass"
        class="rounded-2xl shadow-lg mt-4 place-self-center"
        data-test="startQuiz"
        :isDisabled="!isSessionDataFetched"
        @click="start"
      ></icon-button>
    </div>
  </div>
</template>

<script lang="ts">
import IconButton from "./UI/Buttons/IconButton.vue";
import BaseIcon from "./UI/Icons/BaseIcon.vue";
import { defineComponent, computed, reactive, toRefs, PropType } from "vue";
import { IconButtonTitleConfig, quizType, quizTitleType, isFirstSessionType } from "../types";
export default defineComponent({
  name: "Splash",
  components: {
    IconButton,
    BaseIcon,
  },
  props: {
    title: {
      type: [null, String] as PropType<quizTitleType>,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    quizType: {
      type: String as PropType<quizType>,
      required: true,
    },
    numQuestions: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    isFirstSession: {
      type: Boolean as PropType<isFirstSessionType>,
      default: null,
    },
    hasQuizEnded: {
      type: Boolean,
      default: false
    },
    reviewAnswers: {
      type: Boolean,
      default: false,
    },
    sessionEndTimeText: {
      type: String,
      default: ""
    }
  },
  setup(props, context) {
    const state = reactive({
      metadataContainerClass:
        "grid grid-cols-2 space-x-6 bg-yellow-400 p-4 rounded-2xl w-11/12 bp-360:w-10/12 sm:w-2/3 md:w-1/2 xl:w-1/3",
      metadataCellClass:
        "flex space-x-1 bp-360:space-x-2 sm:space-x-4 border-primary flex space-x-2 sm:space-x-4 border-primary",
      metadataIconClass: "h-full w-8 sm:w-12 fill-primary flex",
      metadataTitleClass: "font-poppins-regular text-sm sm:text-base",
    });

    /** title of the quiz. "Untitled" if no title is present */
    const displayTitle = computed(() => {
      if (props.title != undefined) return props.title || "Untitled";
      return "Untitled";
    });

    /** whether the session data has been fetched */
    const isSessionDataFetched = computed(() => {
      return props.isFirstSession != null;
    });

    const startButtonTextConfig = computed(() => {
      const config: IconButtonTitleConfig = {
        value: "",
        class: "text-lg md:text-xl text-primary font-poppins-bold",
      };
      if (isSessionDataFetched.value) {
        if (props.isFirstSession) {
          config.value = "Let's Start";
        } else {
          if (props.hasQuizEnded && !props.reviewAnswers) {
            config.class = "text-sm md:text-sm text-primary font-poppins-bold";
            config.value = "You cannot review answers now. Please come back after test ends.";
            if (props.sessionEndTimeText != "") {
              config.value += ` (${props.sessionEndTimeText})`
            }
          } else if (props.hasQuizEnded && props.reviewAnswers) {
            config.value = "Review";
          } else {
            config.value = "Resume";
          }
        }
      }
      return config;
    });

    const startButtonIconClass = computed(() => {
      let iconClass = "bg-white hover:bg-gray-200 rounded-lg h-14 w-40 ring-primary px-2 border-b-outset border-primary";
      if (props.hasQuizEnded && !props.reviewAnswers) {
        // only in this case, make the button larger
        iconClass = "bg-white hover:bg-gray-200 rounded-lg h-24 w-60 ring-primary px-2 border-b-outset border-primary";
      }
      return iconClass;
    });

    const startButtonIconConfig = computed(() => {
      return {
        enabled: !isSessionDataFetched.value,
        iconName: "spinner-solid",
        iconClass: "animate-spin h-4 w-4 text-primary",
      };
    });

    function start() {
      context.emit("start");
    }

    return {
      ...toRefs(state),
      displayTitle,
      startButtonTextConfig,
      startButtonIconClass,
      isSessionDataFetched,
      startButtonIconConfig,
      start,
    };
  },
  emits: ["start"],
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Londrina+Solid&family=Poppins:wght@400;700&display=swap");

.font-londrina {
  font-family: "Londrina Solid";
}
.font-poppins-regular {
  font-family: "Poppins", sans-serif;
  font-weight: 400;
}
.font-poppins-bold {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
}
</style>
