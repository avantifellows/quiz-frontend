<template>
  <div>
    <h4 class="text-lg font-bold m-6">Test Paper Overview</h4>
    <!-- Table -->
    <table class="table-auto mx-auto md:mx-0 m-4">
      <!-- row 1 -->
      <tr>
        <th class="border-black border-1 text-left px-4 py-2">Test Name</th>
        <td class="border-black border-1 px-4 py-2" data-test="title">
          {{ $props.title }}
        </td>
      </tr>
      <!-- row 2 -->
      <tr>
        <th class="border-black border-1 text-left px-4 py-2">Test Format</th>
        <td class="border-black border-1 px-4 py-2" data-test="test-format">
          {{ testFormatMapping.get($props.testFormat || "") }}
        </td>
      </tr>
      <!-- row 3 -->
      <tr>
        <th class="border-black border-1 text-left px-4 py-2">Duration</th>
        <td class="border-black border-1 px-4 py-2" data-test="quiz-time-limit">
          {{ ($props.quizTimeLimit?.max || 0) / 60 }} minutes
        </td>
      </tr>
      <!-- row 4 -->
      <tr>
        <th class="border-black border-1 text-left px-4 py-2">Total Marks</th>
        <td class="border-black border-1 px-4 py-2" data-test="total-marks">
          {{ $props.maxMarks }} Marks
        </td>
      </tr>
      <!-- row 5 -->
      <tr>
        <th class="border-black border-1 text-left px-4 py-2">
          No. of Questions
        </th>
        <td class="border-black border-1 px-4 py-2" data-test="num-questions">
          {{ $props.maxQuestionsAllowedToAttempt }}
        </td>
      </tr>
      <!-- row 6 -->
      <tr>
        <th class="border-black border-1 text-left px-4 py-2">Subjects</th>
        <td class="border-black border-1 px-4 py-2" data-test="subject">
          {{ $props.subject }}
        </td>
      </tr>
    </table>
    <!-- Test Paper Pattern(if FST) -->
    <div v-if="isTestFST" data-test="test-fst">
      <h4 class="text-lg font-bold m-6">Test Paper Pattern</h4>
      <!-- Printing subjects extracted from questionSet.title -->
      <p class="ml-6 mr-4 mb-2 text-justify">
        The following are the subjects in the test:
        <strong>
          <span v-for="(part, index) in subjectNames" :key="part">
            {{ index > 0 ? ", " : "" }}{{ part }}
          </span></strong
        >
      </p>
      <!-- iterating over every questionset and printing title and its description -->
      <div v-for="(questionSetState, index) in questionSetStates" :key="index">
        <li
          class="text-base mt-2 ml-7 font-semibold leading-none mr-4"
          :data-test="`questionSetTitle-${index}`"
        >
          {{ questionSetState.title }}
        </li>
        <div
          class="text-base mx-2 mb-4 leading-tight text-slate-500 ml-12 mr-4"
          :data-test="`questionSetInstruction-${index}`"
          v-html="questionSetState.instructionText"
        ></div>
      </div>
    </div>
    <!-- general Instruction -->
    <!-- Language Toggle Button next to General Instructions -->
    <div class="flex justify-between items-center m-6">
      <h4 class="text-lg font-bold">{{ $t("generalInstructions.header") }}</h4>
      <LocalePicker
        :options="localeOptions"
        :currentLocale="currentLocale"
        @update:locale="handleLocaleChange"
      />
    </div>
    <div class="ml-11 mr-4">
      <ol class="text-justify">
        <li>{{ $t("generalInstructions.timerInfo") }}</li>
        <li>
          {{ $t("generalInstructions.paletteInfo") }}
          <span class="inline-flex items-baseline"
            ><BaseIcon
              name="hamburger"
              class="place-self-center w-4 h-4"
            ></BaseIcon
          ></span>
          {{ $t("generalInstructions.expandPalette") }}
        </li>
        <li>
          {{ $t("generalInstructions.paletteSymbols") }}
          <div class="flex flex-wrap mx-2 md:mx-4 my-2">
            <div class="flex items-center my-2 md:mx-4">
              <Success></Success>
              <span class="ml-6 mr-6">{{ $t("generalInstructions.answered") }}</span>
            </div>
            <div class="flex items-center my-2 md:mx-4">
              <Error></Error>
              <span class="ml-6 mr-6">{{ $t("generalInstructions.notVisited") }}</span>
            </div>
            <div class="flex items-center my-2 md:mx-4">
              <Neutral></Neutral>
              <span class="ml-6 mr-6">{{ $t("generalInstructions.notAnswered") }}</span>
            </div>
          </div>
        </li>
      </ol>
    </div>
    <!-- Answering a question -->

    <h4 class="text-lg font-bold m-6">{{ $t("answeringQuestion.title") }}</h4>
    <div class="ml-11 mr-4">
      <ol class="text-justify">
        <li>
          {{ $t("answeringQuestion.procedureForMCQ") }}
          <ol class="ml-7 list-[lower-alpha] text-justify">
            <li>{{ $t("answeringQuestion.selectAnswer") }}</li>
            <li>{{ $t("answeringQuestion.deselectAnswer") }}</li>
            <li>{{ $t("answeringQuestion.changeAnswer") }}</li>
            <li>{{ $t("answeringQuestion.saveAnswer") }}</li>
          </ol>
        </li>
        <li>{{ $t("answeringQuestion.changeAnsweredQuestion") }}</li>
      </ol>
    </div>
    <div class="mt-5 ml-6 mr-4 flex border-red-400 border-1 p-2">
      <div class="float-left text-red-400 pr-5 pl-3 text-xl font-bold">!</div>
      <div class="float-right text-justify pr-2">
        {{ $t("answeringQuestion.noteSaveAnswer") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from "vue";
import BaseIcon from "./UI/Icons/BaseIcon.vue";
import Success from "./Questions/Palette/Success.vue";
import Error from "./Questions/Palette/Error.vue";
import Neutral from "./Questions/Palette/Neutral.vue";
import {
  quizTitleType,
  testFormat,
  questionSetPalette,
  TimeLimit,
} from "../types";
import LocalePicker from "./LocalePicker.vue";
import { useI18n } from "vue-i18n";
export default defineComponent({
  name: "InstructionPage",
  components: {
    BaseIcon,
    Success,
    Error,
    Neutral,
    LocalePicker,
  },
  props: {
    title: {
      type: [null, String] as PropType<quizTitleType>,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    maxQuestionsAllowedToAttempt: {
      type: Number,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    quizTimeLimit: {
      type: (Object as PropType<TimeLimit>) || null,
      default: null,
    },
    questionSetStates: {
      type: Array as PropType<questionSetPalette[]>,
      default: () => [],
    },
    testFormat: {
      type: [null, String] as PropType<testFormat>,
      default: null,
    },
  },
  setup(props) {
    const { t, locale } = useI18n();
    const state = reactive({
      currentLocale: locale.value,
    });
    const isTestFST = computed(() => props.testFormat == "full_syllabus_test");

    // to extract the questionSetTitles from questionSets (eg. Physics - Section A)
    const questionSetTitles = computed(() => {
      return props.questionSetStates.map(
        (questionSetState) => questionSetState.title
      );
    });

    // to split the questionSetTitles from char "-" (eg. Physics)
    const subjectNames = computed(() => {
      const distinctComponents = new Set();

      questionSetTitles.value.forEach((title) => {
        if (title !== null) {
          const parts = title.split("-");
          if (parts.length === 2) {
            distinctComponents.add(parts[0].trim());
          }
        }
      });

      return Array.from(distinctComponents);
    });

    const testFormatMapping = new Map<string, string>([
      ["full_syllabus_test", "Full Syllabus Test"],
      ["major_test", "Major Test"],
      ["part_test", "Part Test"],
      ["chapter_test", "Chapter Test"],
      ["hiring_test", "Hiring Test"],
      ["evaluation_test", "Evaluation Test"],
      ["homework", "Homework"],
    ]);

    // to split the questionSetTitles from char "-" (eg. Section A)
    const sectionNames = computed(() => {
      const distinctComponents = new Set();

      questionSetTitles.value.forEach((title) => {
        if (title !== null) {
          const parts = title.split("-");
          if (parts.length === 2) {
            distinctComponents.add(parts[1].trim());
          }
        }
      });

      return Array.from(distinctComponents);
    });
    const localeOptions = [
      { value: "en", label: "English" },
      { value: "hi", label: "Hindi" },
    ];
    const handleLocaleChange = (newLocale: any) => {
      state.currentLocale = newLocale;
      locale.value = newLocale;
      // Update vue-i18n locale here if needed
    };

    return {
      isTestFST,
      questionSetTitles,
      subjectNames,
      sectionNames,
      testFormatMapping,
      localeOptions,
      currentLocale: computed(() => state.currentLocale),
      handleLocaleChange,
      t,
    };
  },
});
</script>
