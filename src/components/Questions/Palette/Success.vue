<template>
  <KeyTemplate
    :title="title"
    :hasQuizEnded="hasQuizEnded"
    iconName="correct-rounded"
    iconClass="bg-emerald-300 border-emerald-500"
  ></KeyTemplate>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import KeyTemplate from "./KeyTemplate.vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    KeyTemplate,
  },
});
</script>
