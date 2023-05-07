<template>
    <KeyTemplate
      :title="title"
      :hasQuizEnded="hasQuizEnded"
      iconName="partially-correct-rounded"
      iconClass="bg-blue-300 border-blue-500"
    ></KeyTemplate>
  </template>

<script lang="ts">
import { defineComponent } from "vue";
import KeyTemplate from "./KeyTemplate.vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      default: "",
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
