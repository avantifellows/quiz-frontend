<template>
  <div :class="containerClass">
    <div class="place-self-start flex h-full">
      <!-- back button -->
      <icon-button
        :iconConfig="previousQuestionButtonIconConfig"
        :buttonClass="previousQuestionButtonClass"
        v-if="isPreviousButtonEnabled"
        @click="gotToPreviousQuestion"
        data-test="previousQuestionButton"
      ></icon-button>
    </div>

    <div class="place-self-end">
      <!-- submit/continue button -->
      <icon-button
        :titleConfig="submitButtonTitleConfig"
        :buttonClass="submitButtonClass"
        :isDisabled="!isSubmitEnabled"
        @click="submitQuestion"
        data-test="submitButton"
      ></icon-button>
    </div>
  </div>
</template>

<script lang="ts">
import IconButton from "../UI/Buttons/IconButton.vue";
import { IconButtonIconConfig } from "../../types";
import { defineComponent, reactive, toRefs, computed } from "vue";

export default defineComponent({
  components: { IconButton },
  props: {
    isAnswerSubmitted: {
      default: false,
      type: Boolean,
    },
    isSubmitEnabled: {
      default: false,
      type: Boolean,
    },
    isPreviousButtonEnabled: {
      default: false,
      type: Boolean,
    },
  },
  setup(props, context) {
    const state = reactive({
      // main styling class for this component
      containerClass:
        "flex w-full bg-white p-6 bp-500:p-8 md:p-10 lg:p-12 justify-between" as String,
      previousQuestionButtonClass:
        "bg-yellow-500 hover:bg-yellow-600 ring-yellow-500 p-2 px-6 bp-500:p-4 bp-500:px-8 rounded-2xl shadow-xl" as String,
      previousQuestionButtonIconConfig: {
        enabled: true,
        iconName: "right-arrow",
        iconClass: "text-yellow-800 transform rotate-180 fill-current h-6 w-4",
      } as IconButtonIconConfig,
    });

    function submitQuestion() {
      if (props.isAnswerSubmitted) context.emit("continue");
      else context.emit("submit-question");
    }

    function gotToPreviousQuestion() {
      context.emit("previous");
    }

    const submitButtonTitleConfig = computed(() => {
      return {
        value: props.isAnswerSubmitted ? "Continue" : "Submit",
        class:
          "text-white text-md bp-500:text-lg lg:text-xl xl:text-2xl font-bold",
      };
    });

    const submitButtonClass = computed(() => [
      {
        "bg-emerald-500 hover:bg-emerald-600 ring-emerald-500":
          !props.isAnswerSubmitted,
        "bg-primary hover:bg-primary-hover ring-primary":
          props.isAnswerSubmitted,
      },
      `p-4 px-8 bp-500:p-6 bp-500:px-12 rounded-2xl shadow-xl disabled:opacity-50 disabled:pointer-events-none`,
    ]);

    return {
      ...toRefs(state),
      submitQuestion,
      gotToPreviousQuestion,
      submitButtonTitleConfig,
      submitButtonClass,
    };
  },
  emits: ["submit-question", "previous", "continue"],
});
</script>
