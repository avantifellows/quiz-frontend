<template>
  <KeyTemplate
    :title="title"
    :hasQuizEnded="hasQuizEnded"
    iconName="skip-rounded"
    iconClass="bg-gray-100 border-gray-600"
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
