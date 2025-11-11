<template>
  <div class="bg-gray-200 border-b border-gray-300 px-4 py-3">
    <!-- Mobile: Title (truncated), ID, and Logout stacked -->
    <div class="sm:hidden flex flex-col gap-2">
      <h1 class="text-base font-semibold text-gray-800 truncate" data-test="test-name-mobile">
        {{ title || "no data" }}
      </h1>
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700 font-semibold px-3 py-1.5 bg-gray-300 rounded inline-block" data-test="user-id-mobile">
          Id: {{ displayUserId || "no data" }}
        </div>
        <icon-button
          :titleConfig="portalLogoutTitleConfig"
          :buttonClass="portalLogoutButtonClass"
          @click="$emit('logout')"
          data-test="portalLogoutButton"
        />
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
        <icon-button
          v-if="showPortalLogout"
          :titleConfig="portalLogoutTitleConfig"
          :buttonClass="portalLogoutButtonClass"
          @click="$emit('logout')"
          data-test="portalLogoutButton"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import IconButton from "../UI/Buttons/IconButton.vue";
import { defineComponent, computed, PropType } from "vue";
import { quizTitleType } from "@/types";

export default defineComponent({
  name: "InfoBar",
  components: {
    IconButton,
  },
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
    showPortalLogout: {
      type: Boolean,
      default: false,
    },
    portalLogoutLabel: {
      type: String,
      default: "Logout",
    },
  },
  setup(props) {
    const displayUserId = computed(() => props.displayId || props.userId || "");

    const portalLogoutTitleConfig = computed(() => ({
      value: props.portalLogoutLabel || "Logout",
      class: "text-white text-sm bp-500:text-md lg:text-lg xl:text-xl font-bold",
    }));

    const portalLogoutButtonClass = computed(() =>
      "bg-red-600 hover:bg-red-700 ring-red-600 p-2 px-4 bp-500:p-4 bp-500:px-6 rounded-lg sm:rounded-2xl shadow-xl disabled:opacity-50 disabled:pointer-events-none"
    );

    return {
      displayUserId,
      portalLogoutTitleConfig,
      portalLogoutButtonClass,
    };
  },
  emits: ["logout"],
});
</script>
