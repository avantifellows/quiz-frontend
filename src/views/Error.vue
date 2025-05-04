<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
    <!-- 404 -->
    <div
      v-if="isError404"
      class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 flex flex-col space-y-6 items-center"
    >
      <div class="flex items-center space-x-4">
        <BaseIcon
          name="warning"
          iconClass="w-16 h-16 text-yellow-500 fill-current"
        />
        <h1 class="text-4xl font-bold text-gray-800">404 - Page Not Found</h1>
      </div>
      <div class="text-center space-y-4">
        <p class="text-xl text-gray-600">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <p class="text-lg text-gray-500">
          Here are some things you can try:
        </p>
        <ul class="text-left list-disc list-inside text-gray-600 space-y-2">
          <li>Check the URL for typos</li>
          <li>Go back to the previous page</li>
          <li>Return to the homepage</li>
        </ul>
      </div>
      <button
        @click="$router.push('/')"
        class="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
      >
        Return to Homepage
      </button>
    </div>

    <!-- 403 -->
    <div
      v-if="isError403"
      class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 flex flex-col space-y-6 items-center"
    >
      <div class="flex items-center space-x-4">
        <BaseIcon
          name="lock"
          iconClass="w-16 h-16 text-red-500 fill-current"
        />
        <h1 class="text-4xl font-bold text-gray-800">403 - Access Denied</h1>
      </div>
      <div class="text-center space-y-4">
        <p class="text-xl text-gray-600">
          Sorry, you don't have permission to access this page.
        </p>
        <p class="text-lg text-gray-500">
          This could be because:
        </p>
        <ul class="text-left list-disc list-inside text-gray-600 space-y-2">
          <li>You need to be logged in</li>
          <li>Your account doesn't have the required permissions</li>
          <li>The page is restricted to specific users</li>
        </ul>
      </div>
      <button
        @click="$router.push('/')"
        class="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
      >
        Return to Homepage
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import BaseIcon from "../components/UI/Icons/BaseIcon.vue";

export default defineComponent({
  props: {
    type: {
      type: String,
      default: "404",
    },
  },
  components: {
    BaseIcon,
  },
  setup(props) {
    const isError404 = computed(() => {
      return props.type === "404";
    });
    const isError403 = computed(() => {
      return props.type === "403";
    });
    return {
      isError404,
      isError403,
    };
  },
});
</script>
