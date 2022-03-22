<template>
  <div>
    <Splash
      v-if="!isQuestionShown"
      :title="title"
      :subject="metadata.subject"
      :classNumber="metadata.class"
      :numQuestions="questions.length"
      :quizType="metadata.quizType"
      @start="startQuiz"
      data-test="splash"
    ></Splash>

    <QuestionModal
      :questions="questions"
      :currentQuestionIndex="currentQuestionIndex"
      :responses="responses"
      class="flex flex-col bg-white w-full h-full overflow-hidden"
      v-if="isQuestionShown"
      data-test="modal"
    ></QuestionModal>
  </div>
</template>

<script lang="ts">
import QuestionModal from "../components/Questions/QuestionModal.vue";
import Splash from "../components/Splash.vue";
import { defineComponent, reactive, toRefs, computed } from "vue";
import { Question, SubmittedResponse } from "../types";

export default defineComponent({
  name: "Player",
  components: {
    Splash,
    QuestionModal,
  },
  setup() {
    const state = reactive({
      currentQuestionIndex: -1 as number,
      title: "Geometry Quiz" as string,
      metadata: {
        quizType: "CBSE",
        subject: "Maths",
        class: 8,
      },
      questions: [
        {
          type: "checkbox",
          text: "abcd",
          options: ["option 1", "option 2"],
          correct_answer: [0],
          image: null,
          max_char_limit: null,
        },
        {
          type: "subjective",
          text: "efgh",
          options: null,
          correct_answer: null,
          image: null,
          max_char_limit: 1000,
        },
        {
          type: "checkbox",
          text: "ijkl",
          options: ["", "", ""],
          correct_answer: [0, 1],
          image:
            "https://plio-prod-assets.s3.ap-south-1.amazonaws.com/images/afbxudrmbl.png",
          max_char_limit: null,
        },
      ] as Question[],
      responses: [] as SubmittedResponse[], // holds the responses to each item submitted by the viewer
    });
    const isQuestionShown = computed(() => {
      return state.currentQuestionIndex >= 0;
    });

    function startQuiz() {
      state.currentQuestionIndex = 0;
    }

    state.questions.forEach((_, itemIndex) => {
      state.responses.push({
        answer: null,
      });
    });

    return {
      ...toRefs(state),
      isQuestionShown,
      startQuiz,
    };
  },
});
</script>
