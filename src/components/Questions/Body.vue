<template>
  <div class="overflow-y-auto flex flex-col">
    <!-- question text -->
    <div class="px-4 md:px-6">
      <p :class="questionTextClass" data-test="text">
        {{ text }}
      </p>
    </div>
    <div :class="orientationClass">
      <!-- loading spinner when question image is loading -->
      <div
        :class="questionImageAreaClass"
        class="flex justify-center"
        v-if="isImageLoading"
      >
        <BaseIcon
          name="spinner-solid"
          iconClass="animate-spin h-4 object-scale-down"
        />
      </div>
      <!-- question image container -->
      <div :class="questionImageContainerClass" v-if="isQuestionImagePresent">
        <img
          :src="imageData.url"
          class="object-contain h-full w-full"
          :alt="imageData.alt_text"
          @load="imageLoaded"
          ref="questionImage"
          :class="{ invisible: isImageLoading }"
        />
      </div>
      <!-- option container -->
      <div
        v-if="areOptionsVisible"
        class="flex"
        :class="answerContainerClass"
        data-test="optionContainer"
      >
        <ul class="w-full">
          <li class="list-none space-y-1 flex flex-col">
            <div
              v-for="(option, optionIndex) in options"
              :key="optionIndex"
              :class="[optionBackgroundClass(optionIndex), optionTextClass]"
              :data-test="`optionContainer-${optionIndex}`"
            >
              <!-- each option is defined here -->
              <!-- adding <label> so that touch input is just not limited to the radio/checkbox button -->
              <label :class="labelClass(option)">
                <!-- understand the meaning of the keys here:
                    https://www.w3schools.com/tags/att_input_type_radio.asp -->
                <input
                  :type="optionInputType"
                  name="option"
                  class="place-self-center text-primary focus:ring-0"
                  style="box-shadow: none"
                  @click="selectOption(optionIndex)"
                  :checked="isOptionMarked(optionIndex)"
                  :disabled="isAnswerSubmitted"
                  :data-test="`optionSelector-${optionIndex}`"
                />
                <div
                  v-html="option"
                  class="ml-2 h-full place-self-center text-base sm:text-lg"
                  :data-test="`option-${optionIndex}`"
                ></div>
              </label>
            </div>
          </li>
        </ul>
      </div>
      <!-- subjective question answer -->
      <!-- <div
        v-if="isQuestionTypeSubjective"
        class="flex flex-col"
        :class="answerContainerClass"
        data-test="subjectiveAnswerContainer"
      > -->
      <!-- input area for the answer -->
      <!-- <Textarea
          v-model:value="subjectiveAnswer"
          class="px-2 w-full"
          :boxStyling="subjectiveAnswerBoxStyling"
          :placeholder="subjectiveAnswerInputPlaceholder"
          :isDisabled="isAnswerSubmitted || previewMode"
          :maxHeightLimit="subjectiveBoxHeightLimit"
          @keypress="checkCharLimit"
          data-test="subjectiveAnswer"
        ></Textarea> -->
      <!-- character limit -->
      <!-- <div
          class="flex items-end px-6 mt-2"
          v-if="hasCharLimit && !isAnswerSubmitted"
          data-test="charLimitContainer"
        >
          <p
            class="text-sm sm:text-base lg:text-lg font-bold"
            :class="maxCharLimitClass"
            data-test="charLimit"
          >
            {{ charactersLeft }}
          </p>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
// import Textarea from "../UI/Text/Textarea.vue";
import { defineComponent, reactive, toRefs, computed } from "vue";
import BaseIcon from "../UI/Icons/BaseIcon.vue";

export default defineComponent({
  components: {
    BaseIcon,
  },
  // data() {
  //   return {
  //     subjectiveAnswer: "", // holds the answer to the subjective question
  //     subjectiveBoxHeightLimit: 250, // maximum allowed height of the subjective answer text box in px
  //   };
  // },
  // watch: {
  //   subjectiveAnswer() {
  //     if (
  //       this.subjectiveAnswer != null &&
  //       this.hasCharLimit &&
  //       this.subjectiveAnswer.length > this.maxCharLimit
  //     ) {
  //       // prevent answers more than the character limit from being entered via copy pasting
  //       this.subjectiveAnswer = this.subjectiveAnswer.substring(
  //         0,
  //         this.maxCharLimit
  //       );
  //     }
  //     this.$emit("answer-updated", this.subjectiveAnswer);
  //   },
  //   imageData: {
  //     // invoked when another question pops up which has an image
  //     handler(value) {
  //       if (value != null) this.startImageLoading();
  //     },
  //     deep: true,
  //   },
  // },
  // async created() {
  //   this.subjectiveAnswer = this.defaultAnswer;
  //   if (this.isQuestionImagePresent) this.startImageLoading();
  // },
  props: {
    text: {
      default: "",
      type: String,
    },
    options: {
      default: () => [],
      type: Array,
    },
    correctAnswer: {
      default: null,
      type: Array,
    },
    /** answer for the question which has been submitted */
    submittedAnswer: {
      default: null,
      type: Array,
    },
    /** answer for the question which has been entered but not submitted */
    draftAnswer: {
      default: null,
      type: Array,
    },
    isAnswerSubmitted: {
      default: false,
      type: Boolean,
    },
    questionType: {
      required: true,
      type: String,
    },
    /** the character limit to be used if present */
    maxCharLimit: {
      default: 0,
      type: Number,
    },
    /** data of the image to be shown on a question. Contains URL and alt_text */
    imageData: {
      default: null,
      type: Object,
    },
    /** whether the screen is in portrait mode */
    isPortrait: {
      default: false,
      type: Boolean,
    },
    isSurveyQuestion: {
      default: false,
      type: Boolean,
    },
  },
  setup(props, context) {
    const state = reactive({
      isImageLoading: false,
      // set containing the question types in which options are present
      questionTypesWithOptions: new Set(["mcq", "checkbox"]),
      surveyAnswerClass: "bg-gray-200",
      correctOptionClass: "text-white bg-green-500",
      wrongOptionClass: "text-white bg-red-500",
      questionTextClass:
        "text-lg md:text-xl lg:text-2xl mx-4 m-2 font-bold leading-tight whitespace-pre-wrap",
      optionTextClass:
        "p-2 text-lg md:text-xl lg:text-2xl border rounded-md mx-2 whitespace-pre-wrap",
    });

    // stop the loading spinner when the image has been loaded
    function imageLoaded() {
      state.isImageLoading = false;
    }

    function optionBackgroundClass(optionIndex: Number) {
      // returns the background class for the option
      if (!props.isAnswerSubmitted) return {};

      if (
        !props.isSurveyQuestion &&
        props.correctAnswer.indexOf(optionIndex) != -1
      ) {
        return state.correctOptionClass;
      }
      if (props.submittedAnswer.indexOf(optionIndex) != -1) {
        if (props.isSurveyQuestion) return state.surveyAnswerClass;
        return state.wrongOptionClass;
      }
    }

    // whether the given option index should be marked selected
    function isOptionMarked(optionIndex: Number) {
      return (
        props.draftAnswer != null &&
        props.draftAnswer.indexOf(optionIndex) != -1
      );
    }

    function selectOption(optionIndex: Number) {
      context.emit("option-selected", optionIndex);
    }

    function labelClass(optionText: String) {
      return [{ "h-4 sm:h-5": optionText == "" }, "flex content-center"];
    }

    // styling class for the question image and loading spinner containers
    const questionImageAreaClass = computed(() => ({
      "h-56 mb-4": props.isPortrait,
      "h-28 sm:h-36 md:h-48 lg:h-56 xl:h-80 w-1/2": !props.isPortrait,
    }));

    // styling class for the image container
    const questionImageContainerClass = computed(() => [
      questionImageAreaClass.value,
      {
        hidden: state.isImageLoading,
      },
      "border rounded-md",
    ]);

    const isQuestionImagePresent = computed(
      () => props.imageData != null && props.imageData.url != null
    );
    const areOptionsVisible = computed(() =>
      state.questionTypesWithOptions.has(props.questionType)
    );
    const isQuestionTypeSubjective = computed(
      () => props.questionType == "subjective"
    );
    const isQuestionTypeCheckbox = computed(
      () => props.questionType == "checkbox"
    );
    const isQuestionTypeMCQ = computed(() => props.questionType == "mcq");

    // styling class to decide orientation of image + options
    // depending on portrait/landscape orientation
    const orientationClass = computed(() => {
      return [
        {
          "content-center": isQuestionImagePresent.value && !props.isPortrait,
          "flex-col": isQuestionImagePresent.value && props.isPortrait,
        },
        "flex mx-6 md:mx-10 py-4",
      ];
    });

    const optionInputType = computed(() => {
      if (!areOptionsVisible.value) return null;
      if (isQuestionTypeMCQ.value) return "radio";
      if (isQuestionTypeCheckbox.value) return "checkbox";
      return null;
    });

    /**
     * classes for the various containers corresponding to the possible types of answers
     * to the various types of questions (options for MCQ, textarea for subjective)
     */
    const answerContainerClass = computed(() => ({
      "w-1/2": !props.isPortrait && isQuestionImagePresent.value,
      "w-full":
        props.isPortrait ||
        (!props.isPortrait && !isQuestionImagePresent.value),
    }));

    return {
      ...toRefs(state),
      imageLoaded,
      optionBackgroundClass,
      isOptionMarked,
      selectOption,
      labelClass,
      questionImageAreaClass,
      questionImageContainerClass,
      isQuestionImagePresent,
      areOptionsVisible,
      isQuestionTypeSubjective,
      isQuestionTypeCheckbox,
      isQuestionTypeMCQ,
      orientationClass,
      optionInputType,
      answerContainerClass,
    };
  },
  emits: ["option-selected"],
  // components: { Textarea },
  // methods: {
  //   startImageLoading() {
  //     // sets the image state as loading
  //     this.isImageLoading = true;
  //   },
  //   checkCharLimit(event) {
  //     // checks if character limit is reached in case it is set
  //     if (!this.hasCharLimit) return;
  //     if (!this.charactersLeft) event.preventDefault();
  //   },
  // },
  // computed: {
  //   subjectiveAnswerBoxStyling() {
  //     // classes for the subjective answer box
  //     return [
  //       {
  //         "bp-420:h-20 sm:h-28 md:h-36": !this.previewMode,
  //         "bp-420:h-16 sm:h-20 md:h-16 text-xs bp-420:text-sm sm:text-base md:text-sm lg:text-base":
  //           this.previewMode,
  //       },
  //       "px-4 placeholder-gray-400 focus:border-gray-200 focus:ring-transparent",
  //     ];
  //   },
  //   maxCharLimitClass() {
  //     // class for the character limit text
  //     if (this.charactersLeft > 0.2 * this.maxCharLimit) return "text-gray-400";
  //     else if (this.charactersLeft > 0.1 * this.maxCharLimit)
  //       return "text-yellow-500";
  //     else return "text-red-400";
  //   },
  //   charactersLeft() {
  //     // number of characters left for the subjective answer if a limit is given
  //     return this.maxCharLimit - this.currentAnswerLength;
  //   },
  //   currentAnswerLength() {
  //     // length of the current answer (for subjective question)
  //     if (this.subjectiveAnswer == null) return 0;
  //     return this.subjectiveAnswer.length;
  //   },
  //   defaultAnswer() {
  //     // the default answer to be shown
  //     if (this.submittedAnswer != null) {
  //       return this.submittedAnswer;
  //     }
  //     return this.draftAnswer;
  //   },
  //   subjectiveAnswerInputPlaceholder() {
  //     // placeholder for the subjective answer input area
  //     return this.$t("player.question.placeholder");
  //   },
  // },
  // emits: ["option-selected", "answer-updated"],
});
</script>

<style>
/* width */
::-webkit-scrollbar {
  width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
