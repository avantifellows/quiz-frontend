<template>
  <button
    type="button"
    class="palette-tile relative flex items-center justify-center w-11 h-11 rounded-lg border-2 text-sm font-bold text-gray-800"
    :class="[stateClass, { 'ring-2 ring-offset-2 ring-gray-800': isHighlighted }]"
    :aria-current="isHighlighted ? 'true' : undefined"
  >
    <span data-test="index">{{ index + 1 }}</span>
    <!-- status for screen readers (and tests); the fill colour shows it visually -->
    <span class="sr-only" :data-test="state">{{ stateLabel }}</span>
    <BaseIcon
      v-if="hasQuizEnded && badgeIcon"
      :name="badgeIcon"
      iconClass="palette-tile-badge absolute -top-1.5 -right-1.5 w-4 h-4"
      data-test="badge"
    ></BaseIcon>
  </button>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { useI18n } from "vue-i18n";
import BaseIcon from "@/components/UI/Icons/BaseIcon.vue";
import { questionState } from "@/types";
import {
  paletteTileStateClass,
  paletteTileEndedStateClass,
  paletteEndedBadgeIcon,
} from "./Utils";

const stateLabelKey: Record<string, string> = {
  success: "palette.answered",
  error: "palette.notAnswered",
  neutral: "palette.notVisited",
  review: "palette.markedForReview",
};
const endedStateLabelKey: Record<string, string> = {
  success: "palette.correct",
  error: "palette.wrong",
  neutral: "palette.skipped",
  "partial-success": "palette.partiallyCorrect",
};

export default defineComponent({
  name: "Item",
  components: {
    BaseIcon,
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
  setup(props) {
    const { t } = useI18n();
    const stateClass = computed(() =>
      props.hasQuizEnded
        ? paletteTileEndedStateClass[props.state]
        : paletteTileStateClass[props.state]
    );
    const badgeIcon = computed(() => paletteEndedBadgeIcon[props.state]);
    const stateLabel = computed(() => {
      const key = props.hasQuizEnded
        ? endedStateLabelKey[props.state]
        : stateLabelKey[props.state];
      return key ? t(key) : "";
    });
    return { stateClass, badgeIcon, stateLabel };
  },
});
</script>

<style scoped>
/* the round icons are fixed 44px SVGs; scale them to the badge */
.palette-tile :deep(.palette-tile-badge svg) {
  width: 100%;
  height: 100%;
}
</style>
