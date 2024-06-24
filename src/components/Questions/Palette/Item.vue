<template>
  <div class="flex flex-col items-center">
    <Success
      v-if="state == 'success'"
      :hasQuizEnded="hasQuizEnded"
      data-test="success"
    ></Success>
    <Error
      v-else-if="state == 'error'"
      :hasQuizEnded="hasQuizEnded"
      data-test="error"
    ></Error>
    <PartialSuccess
      v-else-if="state == 'partial-success'"
      :hasQuizEnded="hasQuizEnded"
      data-test="partial-success"
    ></PartialSuccess>
    <Neutral
      v-else-if="state == 'neutral'"
      :hasQuizEnded="hasQuizEnded"
      data-test="neutral"
    ></Neutral>
    <Review
      v-else-if="state == 'review'"
      :hasQuizEnded="hasQuizEnded"
      data-test="review"
    ></Review>
    <p
      class="mt-2 bg-gray-200 border-gray-500 border-1 rounded-md px-2 text-xs"
      :class="{
        'bg-gray-200 border-gray-500': !isHighlighted,
        'bg-yellow-200 border-yellow-500': isHighlighted,
      }"
      data-test="index"
    >
      {{ index + 1 }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Success from "./Success.vue";
import PartialSuccess from "./PartialSuccess.vue"
import Error from "./Error.vue";
import Neutral from "./Neutral.vue";
import Review from "./Review.vue";
import { questionState } from "../../../types";

export default defineComponent({
  name: "Item",
  components: {
    Success,
    PartialSuccess,
    Error,
    Neutral,
    Review
  },
  props: {
    state: {
      type: String as PropType<questionState>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    hasQuizEnded: {
      type: Boolean,
      default: false,
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
  },
  setup() {},
});
</script>
