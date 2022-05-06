<template>
  <div :class="legendKeyContainerClass">
    <div :class="keyIconClass"></div>
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
