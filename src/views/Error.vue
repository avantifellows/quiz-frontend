<template>
  <div class="flex flex-col space-y-8 items-center">
<!-- 404 -->
<div
  v-if="isError404"
  class="w-full mt-16 flex flex-col space-y-4 items-center"
>
  <img src="/src/assets/images/404image.png" alt="Page Not Found" class="w-40 h-auto" />
  <BaseIcon
    name="warning"
    iconClass="w-12 h-12 text-yellow-600 fill-current"
  />
  <p class="text-2xl align-middle">Page Not Found</p>
  <p class="text-lg text-gray-500 text-center w-10/12 sm:w-1/2">
    The Quiz ID in the URL might be incorrect, or the quiz no longer exists.
  </p>
</div>

</div>

    <!-- 403 -->
<div
  v-if="isError403"
  class="w-full mt-16 flex flex-col space-y-4 items-center"
>
  <img src="/src/assets/images/access-denied-stamp-png.png" alt="Access Denied" class="w-40 h-auto" />
  <BaseIcon
    name="lock"
    iconClass="w-12 h-12 text-yellow-600 fill-current"
  />
  <p class="text-2xl text-center">Access Denied</p>
  <p class="text-lg text-gray-500 text-center w-10/12 sm:w-1/2">
    Your API key might be invalid or missing required permissions to view this quiz.
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
    return {
      isError404,
      isError403,
    };
  },
});
</script>
