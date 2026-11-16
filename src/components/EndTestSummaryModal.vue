<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    data-test="endTestSummaryModal"
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 bp-500:p-8"
    >
      <!-- Title -->
      <h2
        class="text-xl bp-500:text-2xl font-bold text-center text-gray-800"
        data-test="summaryTitle"
      >
        {{ title }}
      </h2>

      <!-- Desktop: horizontal stat row (like the exam-summary table) -->
      <div
        class="hidden bp-500:flex justify-center divide-x divide-gray-200 mt-8 mb-6"
      >
        <div
          v-for="stat in stats"
          :key="stat.key"
          class="flex flex-col items-center px-6 text-center"
        >
          <span class="text-sm font-semibold text-gray-500 leading-tight">
            {{ stat.label }}
          </span>
          <span class="mt-2 text-2xl font-bold" :class="stat.textClass">
            {{ stat.value }}
          </span>
        </div>
      </div>

      <!-- Mobile: 2-column coloured stat cards -->
      <div class="grid grid-cols-2 gap-3 bp-500:hidden mt-6 mb-6">
        <div
          v-for="stat in stats"
          :key="stat.key"
          class="flex flex-col items-center justify-center rounded-xl border py-4 px-2 text-center"
          :class="[stat.cardClass, { 'col-span-2': stat.fullWidth }]"
        >
          <span class="text-2xl font-bold" :class="stat.textClass">
            {{ stat.value }}
          </span>
          <span class="mt-1 text-xs font-semibold text-gray-600 leading-tight">
            {{ stat.label }}
          </span>
        </div>
      </div>

      <!-- "Choose N of M" quizzes: the tiles count every question, but only N can be attempted -->
      <p
        v-if="showAttemptLimit"
        class="text-center text-sm font-semibold text-gray-600 -mt-2 mb-6"
        data-test="summaryAttemptLimit"
      >
        {{ $t("endTestSummary.attemptLimit", { count: maxQuestionsAllowedToAttempt }) }}
      </p>

      <hr class="border-gray-200" />

      <!-- Confirmation prompt -->
      <p
        class="text-center font-bold text-gray-700 mt-6 mb-6 whitespace-pre-line"
        data-test="summaryConfirmText"
      >
        {{ confirmText }}
      </p>

      <!-- Actions -->
      <div class="flex justify-center gap-4">
        <button
          type="button"
          class="min-w-[6rem] px-6 py-3 rounded-lg font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
          :disabled="isProcessing"
          data-test="summaryYesButton"
          @click="$emit('confirm')"
        >
          <BaseIcon
            v-if="isProcessing"
            name="spinner-solid"
            iconClass="animate-spin h-5 w-5"
          />
          <span v-else>{{ $t("endTestSummary.yes") }}</span>
        </button>
        <button
          type="button"
          class="min-w-[6rem] px-6 py-3 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 disabled:opacity-50 disabled:pointer-events-none"
          :disabled="isProcessing"
          data-test="summaryNoButton"
          @click="$emit('cancel')"
        >
          {{ $t("endTestSummary.no") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { useI18n } from "vue-i18n";
import BaseIcon from "./UI/Icons/BaseIcon.vue";
import { EndTestBuckets, EndTestSummaryVariant } from "../types";

export default defineComponent({
  name: "EndTestSummaryModal",
  components: { BaseIcon },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String as PropType<EndTestSummaryVariant>,
      default: "exam"
    },
    buckets: {
      type: Object as PropType<EndTestBuckets>,
      required: true
    },
    maxQuestionsAllowedToAttempt: {
      type: Number,
      default: 0
    },
    isProcessing: {
      type: Boolean,
      default: false
    }
  },
  emits: ["confirm", "cancel"],
  setup(props) {
    const { t } = useI18n();

    const title = computed(() =>
      props.variant === "homework"
        ? t("endTestSummary.summaryTitle")
        : t("endTestSummary.examTitle")
    );

    const confirmText = computed(() =>
      props.variant === "homework"
        ? t("endTestSummary.confirmHomework")
        : t("endTestSummary.confirmExam")
    );

    // Reused palette colours: answered=emerald, notAnswered=red,
    // markedForReview=violet, notVisited=gray.
    const stats = computed(() => {
      const b = props.buckets;
      const total = {
        key: "total",
        label: t("endTestSummary.totalQuestions"),
        value: b.total,
        textClass: "text-gray-800",
        cardClass: "bg-gray-50 border-gray-300",
        fullWidth: true
      };
      const answered = {
        key: "answered",
        label: t("endTestSummary.answered"),
        value: b.answered,
        textClass: "text-emerald-700",
        cardClass: "bg-emerald-100 border-emerald-400",
        fullWidth: false
      };
      const notAnswered = {
        key: "notAnswered",
        label: t("endTestSummary.notAnswered"),
        value: b.notAnswered,
        textClass: "text-red-700",
        cardClass: "bg-red-100 border-red-400",
        fullWidth: false
      };
      const markedForReview = {
        key: "markedForReview",
        label: t("endTestSummary.markedForReview"),
        value: b.markedForReview,
        textClass: "text-violet-700",
        cardClass: "bg-violet-100 border-violet-400",
        fullWidth: false
      };
      const notVisited = {
        key: "notVisited",
        label: t("endTestSummary.notVisited"),
        value: b.notVisited,
        textClass: "text-gray-700",
        cardClass: "bg-gray-100 border-gray-400",
        fullWidth: false
      };

      // OMR: marked-for-review is unsupported and "not visited" is not
      // meaningful (all questions shown at once).
      if (props.variant === "omr") {
        return [total, answered, notAnswered];
      }
      return [total, answered, notAnswered, markedForReview, notVisited];
    });

    const showAttemptLimit = computed(
      () =>
        props.maxQuestionsAllowedToAttempt > 0 &&
        props.maxQuestionsAllowedToAttempt < props.buckets.total
    );

    return { title, confirmText, stats, showAttemptLimit };
  }
});
</script>
