<template>
  <div :class="legendKeyContainerClass">
    <div v-if="!hasQuizEnded" :class="keyIconClass"></div>
    <BaseIcon v-if="hasQuizEnded" :name="iconName"></BaseIcon>
    <p :class="legendKeyTextClass">
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
import BaseIcon from "../../../components/UI/Icons/BaseIcon.vue";
import { defineComponent, computed } from "vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
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
    return {
      keyIconClass,
      legendKeyTextClass,
      legendKeyContainerClass,
    };
  },
});
</script>
