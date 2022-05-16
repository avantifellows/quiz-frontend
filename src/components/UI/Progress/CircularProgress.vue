<template>
  <div class="relative">
    <svg :height="radius * 2" :width="radius * 2">
      <!-- background circle -->
      <circle
        :stroke="progressBarBackgroundColor"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="{ strokeDashoffset: 0 }"
        :stroke-width="stroke"
        fill="transparent"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
      />
      <!-- the actual progress circle -->
      <circle
        :stroke="progressBarForegroundColor"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="{ strokeDashoffset: strokeDashoffset }"
        :stroke-width="stroke"
        fill="transparent"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
      />
    </svg>
    <!-- progress indicator in the center of the circle  -->
    <div
      class="absolute inset-1/3 flex flex-col justify-center"
      data-test="result"
    >
      <div class="w-full flex justify-center">
        <p class="text-xl sm:text-2xl md:text-3xl font-extrabold text-center">
          {{ result.value }}
        </p>
      </div>
      <div class="w-full flex justify-center">
        <p class="text-sm sm:text-sm md:text-base lg:text-xl text-center">
          {{ result.title }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, PropType } from "vue";
import { CircularProgressResult } from "../../../types";

export default defineComponent({
  name: "CircularProgress",
  props: {
    // radius of ring
    radius: {
      type: Number,
      required: true,
    },
    // thickness of the ring
    stroke: {
      type: Number,
      required: true,
    },
    /**
     * the result to be shown in the centre of the progress bar
     */
    result: {
      type: Object as PropType<CircularProgressResult>,
      required: true,
    },
    progressBarPercent: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      progressBarBackgroundColor: "#A0D8C8",
      progressBarForegroundColor: "#10B981",
    });

    /**
     * Calculating a reduced radius as we don't want the ring to overflow
     * the svg viewbox if the stroke is high
     * Reference - https://css-tricks.com/building-progress-ring-quickly/
     */
    const normalizedRadius = computed(() => {
      return props.radius - props.stroke * 2;
    });
    /**
     * Circumference of the circle that lies halfway between the inner and outer circle
     */
    const circumference = computed(() => {
      return normalizedRadius.value * 2 * Math.PI;
    });
    /**
     * refer to https://css-tricks.com/building-progress-ring-quickly/
     */
    const strokeDashoffset = computed(() => {
      return (
        circumference.value -
        (props.progressBarPercent / 100) * circumference.value
      );
    });

    return {
      ...toRefs(state),
      normalizedRadius,
      circumference,
      strokeDashoffset,
    };
  },
});
</script>

<style lang="postcss">
circle {
  transition: stroke-dashoffset 0.5s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}
</style>
