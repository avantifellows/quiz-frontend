<template>
  <KeyTemplate
    :title="title"
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
  },
  components: {
    KeyTemplate,
  },
});
</script>
