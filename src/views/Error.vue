<template>
  <div class="flex flex-col space-y-8 items-center">
    <!-- 404 -->
    <div
      v-if="isError404"
      class="w-full mt-16 flex flex-col space-y-4 items-center"
    >
      <BaseIcon
        name="warning"
        iconClass="w-12 h-12 text-yellow-600 fill-current"
      />
      <p class="text-2xl align-middle">Page Not Found</p>
      <p class="text-lg text-gray-500 text-center w-10/12 sm:w-1/2">
        We are unable to find what you are looking for
      </p>
    </div>
    <!-- 403 -->
    <div
      v-if="isError403"
      class="w-full mt-16 flex flex-col space-y-4 items-center"
    >
      <BaseIcon
        name="lock"
        iconClass="w-12 h-12 text-yellow-600 fill-current"
      />
      <p class="text-2xl text-center">Access Denied</p>
      <p class="text-lg text-gray-500 text-center w-10/12 sm:w-1/2">
        You do not have the permission to access this page
      </p>
    </div>
    <!-- Quiz Not Available -->
    <div
      v-if="isQuizNotAvailable"
      class="w-full mt-16 flex flex-col space-y-4 items-center"
    >
      <BaseIcon
        name="warning"
        iconClass="w-12 h-12 text-red-600 fill-current"
      />
      <p class="text-2xl text-center">Requested quiz is not available</p>
      <p class="text-lg text-gray-500 text-center w-10/12 sm:w-1/2">
        The quiz you are trying to access is not available through this URL
      </p>
    </div>
    <!-- Form Not Available -->
    <div
      v-if="isFormNotAvailable"
      class="w-full mt-16 flex flex-col space-y-4 items-center"
    >
      <BaseIcon
        name="warning"
        iconClass="w-12 h-12 text-red-600 fill-current"
      />
      <p class="text-2xl text-center">Requested questionnaire is not available</p>
      <p class="text-lg text-gray-500 text-center w-10/12 sm:w-1/2">
        The questionnaire you are trying to access is not available through this URL
      </p>
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
    /** whether the error type is 404 */
    const isError404 = computed(() => {
      return props.type === "404";
    });
    const isError403 = computed(() => {
      return props.type === "403";
    });
    const isQuizNotAvailable = computed(() => {
      return props.type === "quiz-not-available";
    });
    const isFormNotAvailable = computed(() => {
      return props.type === "form-not-available";
    });
    return {
      isError404,
      isError403,
      isQuizNotAvailable,
      isFormNotAvailable,
    };
  },
});
</script>
