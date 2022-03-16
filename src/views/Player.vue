<template>
  <div>
    {{ isQuestionShown }}
    <splash
      v-if="!isQuestionShown"
      :title="title"
      :subject="metadata.subject"
      :classNumber="metadata.class"
      :numQuestions="questions.length"
      :examType="metadata.examType"
      @start="startQuiz"
      data-test="splash"
    ></splash>
    <div
      v-if="isQuestionShown"
      class="flex flex-col bg-white w-full h-full overflow-hidden"
    >
      <!-- header -->
      <question-header
        @skip-question="skipQuestion"
        data-test="header"
      ></question-header>
    </div>
  </div>
</template>

<script lang="ts">
import QuestionHeader from "../components/Questions/Header.vue";
import Splash from "../components/Splash.vue";
import { defineComponent, reactive, toRefs, computed } from "vue";
import { Question } from "../types";
export default defineComponent({
  name: "Player",
  components: {
    QuestionHeader,
    Splash,
  },
  setup() {
    const state = reactive({
      currentQuestionIndex: -1 as number,
      title: "Geometry Quiz",
      metadata: {
        examType: "CBSE",
        subject: "Maths",
        class: 8,
      },
      questions: [
        {
          type: "mcq",
          options: ["", ""],
          correct_answer: 0,
          image: null,
          has_char_limit: false,
          max_char_limit: null,
        },
        {
          type: "subjective",
          options: null,
          correct_answer: null,
          image: null,
          has_char_limit: true,
          max_char_limit: 1000,
        },
        {
          type: "checkbox",
          options: ["", "", ""],
          correct_answer: [0, 1],
          image:
            "https://plio-prod-assets.s3.ap-south-1.amazonaws.com/images/afbxudrmbl.png",
          has_char_limit: false,
          max_char_limit: null,
        },
      ] as Question[],
    });
    function skipQuestion() {}
    const isQuestionShown = computed(() => {
      return state.currentQuestionIndex >= 0;
    });

    function startQuiz() {
      state.currentQuestionIndex = 0;
    }

    return {
      ...toRefs(state),
      isQuestionShown,
      skipQuestion,
      startQuiz,
    };
  },
});
</script>
