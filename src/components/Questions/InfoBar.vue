<template>
  <!-- Homework / forms: the same context strip as the assessment question area (Body.vue) -->
  <div
    v-if="title || displayUserId"
    class="flex items-center gap-3 px-4 lg:px-8 py-2 bg-gray-50 border-b border-gray-200 text-[13px] lg:text-sm leading-[18px]"
  >
    <span v-if="title" class="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-gray-700" :title="title" data-test="test-name">{{ title }}</span>
    <span v-if="displayUserId" class="flex-none ml-auto font-semibold text-gray-900 tabular-nums whitespace-nowrap" data-test="user-id">ID: {{ displayUserId }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { quizTitleType } from "@/types";

export default defineComponent({
  name: "InfoBar",
  props: {
    title: {
      type: [null, String] as PropType<quizTitleType>,
      required: true,
    },
    userId: {
      type: String,
      default: "",
    },
    displayId: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const displayUserId = computed(() => props.displayId || props.userId || "");

    return {
      displayUserId,
    };
  },
});
</script>
