<template>
  <KeyTemplate
    :title="title"
    iconClass="bg-red-300 border-red-500"
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
  },
  components: {
    KeyTemplate,
  },
});
</script>
