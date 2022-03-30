<template>
  <div class="h-screen">
    <Splash
      v-if="isSplashShown"
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
      v-model:currentQuestionIndex="currentQuestionIndex"
      v-model:responses="responses"
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
          type: "mcq",
          text: "abcd",
          options: ["option 1", "option 2"],
          correct_answer: [0],
          image: null,
          survey: false,
          max_char_limit: null,
        },
        {
          type: "subjective",
          text: "yolo",
          options: ["", ""],
          correct_answer: null,
          image: null,
          survey: false,
          max_char_limit: 100,
        },
        {
          type: "checkbox",
          text: "efgh",
          options: ["option 1", "option 2", "op3", "option 4"],
          correct_answer: [2, 3],
          image: null,
          survey: false,
          max_char_limit: null,
        },
        {
          type: "checkbox",
          text: "ijkl",
          options: ["", "", ""],
          correct_answer: [0, 1],
          image: {
            url: "https://plio-prod-assets.s3.ap-south-1.amazonaws.com/images/afbxudrmbl.png",
            alt_text: "some image",
          },
          survey: true,
          max_char_limit: null,
        },
      ] as Question[],
      responses: [] as SubmittedResponse[], // holds the responses to each item submitted by the viewer
    });
    const isSplashShown = computed(() => state.currentQuestionIndex == -1);
    const isQuestionShown = computed(() => {
      return (
        state.currentQuestionIndex >= 0 &&
        state.currentQuestionIndex < state.questions.length
      );
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
      isSplashShown,
      startQuiz,
    };
  },
});
</script>
