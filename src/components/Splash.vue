<template>
  <div class="flex flex-col justify-center" @wheel="preventScrolling">
    <img
      src="../assets/images/question.svg"
      class="mt-16 place-self-center"
      height="300"
      width="600"
    />

    <div
      class="bg-primary flex flex-col space-y-10 items-center rounded-2xl py-12"
    >
      <p class="font-londrina text-white text-5xl">Geometry Quiz</p>
      <div class="flex flex-col space-y-4 w-full items-center">
        <div
          class="grid grid-cols-2 space-x-6 bg-yellow-400 p-4 rounded-xl w-1/3"
        >
          <div class="flex space-x-4 border-r-2 border-primary">
            <BasicIcon
              name="question-mark-round"
              iconClass="h-full w-12 fill-primary"
            ></BasicIcon>
            <div class="flex items-center">
              <p class="font-poppins-regular">10 questions</p>
            </div>
          </div>
          <div class="flex space-x-4 border-primary">
            <BasicIcon
              name="student-in-class"
              iconClass="h-full w-12 fill-primary"
            ></BasicIcon>

            <div class="flex items-center">
              <p class="font-poppins-regular">Class 8</p>
            </div>
          </div>
        </div>

        <div
          class="grid grid-cols-2 space-x-6 bg-yellow-400 p-4 rounded-xl w-1/3"
        >
          <div class="flex space-x-4 border-r-2 border-primary">
            <BasicIcon
              name="math"
              iconClass="h-full w-12 fill-primary"
            ></BasicIcon>
            <div class="flex items-center">
              <p class="font-poppins-regular">Maths</p>
            </div>
          </div>
          <div class="flex space-x-4 border-primary">
            <BasicIcon
              name="notepad"
              iconClass="h-full w-12 fill-primary"
            ></BasicIcon>
            <div class="flex items-center">
              <p class="font-poppins-regular">CBSE</p>
            </div>
          </div>
        </div>
      </div>
      <icon-button
        :titleConfig="startButtonTextConfig"
        buttonClass="bg-white hover:bg-gray-200 rounded-lg h-14 w-40 sm:h-20 sm:w-60 ring-primary px-2 border-b-outset border-primary"
        class="rounded-2xl shadow-lg mt-4 place-self-center"
        data-test="startQuiz"
      ></icon-button>
    </div>
  </div>
</template>

<script lang="ts">
import IconButton from "./UI/Buttons/IconButton.vue";
import BasicIcon from "./UI/Icons/BasicIcon.vue";

import { defineComponent, reactive, toRefs } from "vue";
export default defineComponent({
  name: "Splash",
  components: {
    IconButton,
    BasicIcon,
  },
  setup() {
    const state = reactive({
      startButtonTextConfig: {
        value: "Let's Start",
        class: "text-lg md:text-xl lg:text-2xl text-primary font-poppins-bold",
      },
    });

    function preventScrolling(event: Event) {
      event.preventDefault();
    }

    return {
      ...toRefs(state),
      preventScrolling,
    };
  },
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Londrina+Solid&family=Poppins:wght@400;700&display=swap");

.font-londrina {
  font-family: "Londrina Solid";
}
.font-poppins-regular {
  font-family: "Poppins", sans-serif;
  font-weight: 400;
}
.font-poppins-bold {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
}
</style>
