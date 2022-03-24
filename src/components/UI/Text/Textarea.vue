<template>
  <InputText :title="title" :inputValidation="inputValidation">
    <div class="flex relative mt-1">
      <!-- input text area -->
      <textarea
        class="p-2 border placeholder-blueGray-300 text-blueGray-600 bg-white disabled:bg-gray-200 rounded text-md border-blueGray-300 focus:outline-none focus:ring focus:border-transparent focus:shadow-outline w-full border-gray-200 disabled:cursor-not-allowed"
        :class="boxStyling"
        :disabled="isDisabled"
        :placeholder="placeholder"
        v-model="localValue"
        name="placeholder"
        autocomplete="off"
        @input="inputChange"
        @keypress="keyPress"
        @keydown="keyDown"
        data-test="input"
      />
    </div>
  </InputText>
</template>

<script lang="ts">
import InputText from "./InputText.vue";
import { InputTextValidationConfig } from "../../../types";
import { PropType, defineComponent, reactive, toRefs } from "vue";

export default defineComponent({
  components: {
    InputText,
  },
  props: {
    title: {
      default: "",
      type: String,
    },
    /** whether to show any validation for the input */
    inputValidation: {
      default: () => ({
        enabled: false,
      }),
      type: Object as PropType<InputTextValidationConfig>,
    },
    placeholder: {
      default: "",
      type: String,
    },
    /** the value of the input to the input box */
    value: {
      default: "",
      type: [String, Number],
    },
    /** classes for the input boxes */
    boxStyling: {
      default: () => {
        return "focus:ring-primary";
      },
      type: [Object, String],
    },
    /** whether the input text is disabled */
    isDisabled: {
      default: false,
      type: Boolean,
    },
    /** maximum allowed height of the text box (in px) */
    maxHeightLimit: {
      default: 0,
      type: Number,
    },
  },
  setup(props, context) {
    const state = reactive({
      localValue: props.value,
    });
    function inputChange(event: KeyboardEvent) {
      // invoked on input change
      context.emit("update:value", state.localValue);

      // auto expand the textbox if a `maxHeightLimit` has been specified
      if (props.maxHeightLimit > 0) {
        const textareaElement = event.target as HTMLInputElement;
        textareaElement.style.height = "";
        textareaElement.style.height =
          Math.min(textareaElement.scrollHeight, props.maxHeightLimit) + "px";
      }
    }
    function keyPress(event: KeyboardEvent) {
      // invoked by pressing a key
      context.emit("keypress", event);
    }
    function keyDown(event: KeyboardEvent) {
      // invoked by the event keydown
      context.emit("keydown", event);
    }

    return {
      ...toRefs(state),
      inputChange,
      keyPress,
      keyDown,
    };
  },
  emits: ["keypress", "keydown", "update:value"],
});
</script>