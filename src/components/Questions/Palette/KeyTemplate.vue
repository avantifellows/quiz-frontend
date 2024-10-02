<template>
  <div :class="legendKeyContainerClass">
    <div
      v-if="!hasQuizEnded"
      :class="keyIconClass"
      data-test="quizInProgressIcon"
    ></div>
    <BaseIcon
      v-if="hasQuizEnded"
      :name="iconName"
      data-test="quizEndedIcon"
    ></BaseIcon>
    <p :class="legendKeyTextClass" v-if="isTitlePresent">
      {{ title }}
    </p>
  </div>
</template>

<script lang="ts">
import {
  legendKeyIconClass,
  legendKeyTextClass,
  legendKeyContainerClass,
} from "./Utils";
import BaseIcon from "@/components/UI/Icons/BaseIcon.vue";
import { defineComponent, computed } from "vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      default: "",
    },
    value: {
      type: Number,
    },
    iconClass: {
      type: String,
      default: "",
    },
    iconName: {
      type: String,
      default: "",
    },
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    BaseIcon,
  },
  setup(props) {
    const keyIconClass = computed(() => [legendKeyIconClass, props.iconClass]);
    const isTitlePresent = computed(() => props.title != "");
    return {
      keyIconClass,
      legendKeyTextClass,
      legendKeyContainerClass,
      isTitlePresent,
    };
  },
});
</script>
