<template>
  <div class="bg-gray-200 border-b border-gray-300 px-4 py-3">
    <!-- Mobile: Title (truncated), ID, and Logout stacked -->
    <div class="sm:hidden flex flex-col gap-2">
      <h1 class="text-base font-semibold text-gray-800 truncate" data-test="test-name-mobile">
        {{ title || "no data" }}
      </h1>
      <div class="flex items-center">
        <div class="text-sm text-gray-700 font-semibold px-3 py-1.5 bg-gray-300 rounded inline-block" data-test="user-id-mobile">
          Id: {{ displayUserId || "no data" }}
        </div>
      </div>
    </div>

    <!-- Tablet+: Title, ID, and Logout side by side -->
    <div class="hidden sm:flex sm:justify-between sm:items-center gap-4">
      <h1 class="text-lg font-semibold text-gray-800 flex-1 break-words" data-test="test-name">
        {{ title || "no data" }}
      </h1>
      <div class="flex items-center gap-4">
        <div class="text-base text-gray-700 font-semibold whitespace-nowrap px-4 py-2 bg-gray-300 rounded" data-test="user-id">
          Id: {{ displayUserId || "no data" }}
        </div>
      </div>
    </div>
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
