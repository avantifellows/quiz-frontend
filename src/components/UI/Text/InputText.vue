<template>
  <div>
    <div class="flex justify-between">
      <!-- title for the input box -->
      <p class="text-xs pl-2" data-test="title" v-if="isTitleShown">
        {{ title }}
      </p>
      <!-- input validation -->
      <div class="pr-2" v-if="isValidationEnabled">
        <div class="flex text-xs">
          <!-- validation icon -->
          <BaseIcon
            :name="validationIconName"
            :iconClass="validationIconClass"
          />

          <!-- validation message -->
          <p
            class="pl-1 place-self-center"
            :class="validationColorClass"
            data-test="validationMessage"
          >
            {{ validationMessage }}
          </p>
        </div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { computed, PropType, defineComponent } from "vue";
import { InputTextValidationConfig } from "@/types";
import BaseIcon from "../Icons/BaseIcon.vue";

export default defineComponent({
  name: "InputText",
  components: {
    BaseIcon,
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
  },
  setup(props) {
    const isTitleShown = computed(() => {
      return props.title != "" && props.title != null;
    });

    const isValidationEnabled = computed(() => {
      // whether input validation is on
      return props.inputValidation.enabled;
    });
    const isValid = computed(() => {
      // whether the input is valid
      return isValidationEnabled.value && props.inputValidation.isValid;
    });
    const validationColorClass = computed(() => {
      // https://v3.vuejs.org/guide/class-and-style.html#class-and-style-bindings
      return {
        "text-green-600": isValid.value,
        "text-red-600": !isValid.value,
      };
    });
    const validationMessage = computed(() => {
      // message to show for valid/invalid input
      if (isValid.value) {
        return props.inputValidation.validMessage;
      }
      return props.inputValidation.invalidMessage;
    });
    const validationIconName = computed(() => {
      // fetches and returns the icon object, depending on "isValid"
      if (isValid.value) {
        return "correct";
      }
      return "wrong";
    });

    const validationIconClass = computed(() => [
      validationColorClass.value,
      `h-5 w-2.5 place-self-center`,
    ]);

    return {
      isTitleShown,
      isValidationEnabled,
      isValid,
      validationColorClass,
      validationMessage,
      validationIconName,
      validationIconClass,
    };
  },
});
</script>
