<template>
  <div class="w-full" data-test="matrixSubjectiveGridContainer">
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full table-fixed border-collapse border border-gray-200">
        <thead>
          <tr>
            <th class="w-40 border border-gray-200 bg-gray-50 p-2 text-left text-sm font-semibold">
              Item
            </th>
            <th
              v-for="column in columns"
              :key="column"
              class="border border-gray-200 bg-gray-50 p-2 text-left text-sm font-semibold"
            >
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row">
            <td class="border border-gray-200 p-2 text-sm font-medium align-top">
              {{ row }}
            </td>
            <td
              v-for="column in columns"
              :key="`${row}-${column}`"
              class="border border-gray-200 p-2 align-top"
            >
              <textarea
                rows="2"
                class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100"
                :disabled="isDisabled"
                :value="getValue(row, column)"
                @input="updateValue(row, column, $event)"
                :data-test="`matrixSubjectiveGridInput-${row}-${column}`"
              ></textarea>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-4 md:hidden">
      <div
        v-for="row in rows"
        :key="`mobile-${row}`"
        class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
      >
        <p class="text-sm font-semibold text-gray-900">{{ row }}</p>
        <label
          v-for="column in columns"
          :key="`mobile-${row}-${column}`"
          class="mt-3 block text-sm font-medium text-gray-700"
        >
          {{ column }}
          <textarea
            rows="2"
            class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100"
            :disabled="isDisabled"
            :value="getValue(row, column)"
            @input="updateValue(row, column, $event)"
          ></textarea>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { MatrixSubjectiveGridResponse } from "@/types";

function cloneAnswer(answer: MatrixSubjectiveGridResponse | null): MatrixSubjectiveGridResponse {
  return JSON.parse(JSON.stringify(answer || {}));
}

export default defineComponent({
  name: "MatrixSubjectiveGridAnswer",
  props: {
    rows: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    columns: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    answer: {
      type: Object as PropType<MatrixSubjectiveGridResponse | null>,
      default: null,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update"],
  setup(props, context) {
    function getValue(row: string, column: string) {
      return props.answer?.[row]?.[column] || "";
    }

    function updateValue(row: string, column: string, event: Event) {
      const target = event.target as HTMLTextAreaElement;
      const nextAnswer = cloneAnswer(props.answer);
      const nextRow = { ...(nextAnswer[row] || {}) };

      if (target.value.trim() === "") {
        delete nextRow[column];
      } else {
        nextRow[column] = target.value;
      }

      if (Object.keys(nextRow).length === 0) {
        delete nextAnswer[row];
      } else {
        nextAnswer[row] = nextRow;
      }

      context.emit("update", Object.keys(nextAnswer).length > 0 ? nextAnswer : null);
    }

    return {
      getValue,
      updateValue,
    };
  },
});
</script>
