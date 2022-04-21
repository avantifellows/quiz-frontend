<template>
  <div class="h-screen">
    <div v-if="isQuizLoaded" class="h-full">
      <Splash
        v-if="isSplashShown"
        :title="title"
        :subject="metadata.subject"
        :grade="metadata.grade"
        :numQuestions="questions.length"
        :quizType="metadata.quiz_type"
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
  </div>
</template>

<script lang="ts">
import QuestionModal from "../components/Questions/QuestionModal.vue";
import Splash from "../components/Splash.vue";
import QuizAPIService from "../services/API/Quiz";
import { defineComponent, reactive, toRefs, computed } from "vue";
import { Question, SubmittedResponse, QuizMetadata } from "../types";

export default defineComponent({
  name: "Player",
  components: {
    Splash,
    QuestionModal,
  },
  props: {
    quizId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      currentQuestionIndex: -1 as number,
      title: "Geometry Quiz" as string,
      metadata: {} as QuizMetadata,
      questions: [] as Question[],
      responses: [] as SubmittedResponse[], // holds the responses to each item submitted by the viewer
    });
    const isSplashShown = computed(() => state.currentQuestionIndex == -1);
    const isQuestionShown = computed(() => {
      return (
        state.currentQuestionIndex >= 0 &&
        state.currentQuestionIndex < state.questions.length
      );
    });
    const isQuizLoaded = computed(() => state.questions.length > 0);

    function startQuiz() {
      state.currentQuestionIndex = 0;
    }

    async function getQuiz() {
      const quizDetails = await QuizAPIService.getQuiz(props.quizId);
      // since we know that there is going to be only one
      // question set for now
      const questionSet = quizDetails.question_sets[0];
      state.questions = questionSet.questions;
      state.metadata = quizDetails.metadata;

      // prepare responses
      state.questions.forEach((_) => {
        state.responses.push({
          answer: null,
        });
      });
    }

    getQuiz();

    return {
      ...toRefs(state),
      isQuestionShown,
      isSplashShown,
      startQuiz,
      isQuizLoaded,
    };
  },
});
</script>
