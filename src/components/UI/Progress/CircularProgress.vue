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
      v-if="isResultShown"
      class="absolute inset-1/3 flex flex-col justify-center"
      data-test="result"
    >
      <div class="w-full flex justify-center">
        <p class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center">
          {{ progressBarPercent }}%
        </p>
      </div>
      <div class="w-full flex justify-center">
        <p
          class="text-sm sm:text-sm md:text-base lg:text-xl font-bold text-center"
        >
          {{ result.title }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from "vue";

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
     * - whether it is enabled and its title
     */
    result: {
      default: () => {
        return {
          enabled: false,
          title: "",
          value: Number,
        };
      },
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      progressBarBackgroundColor: "#C4C5C5",
      progressBarForegroundColor: "#2B9D05",
    });

    /**
     * percentage of progress to be shown in the progress bar
     */
    const progressBarPercent = computed(() => {
      return props.result.value;
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
        (progressBarPercent.value / 100) * circumference.value
      );
    });
    /**
     * Whether a result will be shown in the center of the progress bar
     */
    const isResultShown = computed(() => {
      return props.result.enabled;
    });

    return {
      ...toRefs(state),
      progressBarPercent,
      normalizedRadius,
      circumference,
      strokeDashoffset,
      isResultShown,
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
