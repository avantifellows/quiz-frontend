<template>
  <div class="flex flex-col justify-center" @wheel="preventScrolling">
    <img
      src="../assets/images/question.svg"
      class="mt-24 sm:mt-16 place-self-center"
      height="300"
      width="600"
    />

    <div
      class="bg-primary flex flex-col space-y-16 bp-420:space-y-10 items-center rounded-2xl py-12"
    >
      <!-- title -->
      <p class="font-londrina text-white text-5xl">Geometry Quiz</p>

      <!-- metadata -->
      <div class="flex flex-col space-y-4 w-full items-center">
        <div :class="metadataContainerClass">
          <div :class="metadataCellClass" class="border-r-2">
            <BasicIcon
              name="question-mark-round"
              :iconClass="metadataIconClass"
            ></BasicIcon>
            <div class="flex items-center">
              <p :class="metadataTitleClass">10 questions</p>
            </div>
          </div>
          <div :class="metadataCellClass">
            <BasicIcon
              name="student-in-class"
              :iconClass="metadataIconClass"
            ></BasicIcon>

            <div class="flex items-center">
              <p :class="metadataTitleClass">Class 8</p>
            </div>
          </div>
        </div>

        <div :class="metadataContainerClass">
          <div :class="metadataCellClass" class="border-r-2">
            <BasicIcon name="math" :iconClass="metadataIconClass"></BasicIcon>
            <div class="flex items-center">
              <p :class="metadataTitleClass">Maths</p>
            </div>
          </div>
          <div :class="metadataCellClass">
            <BasicIcon
              name="notepad"
              :iconClass="metadataIconClass"
            ></BasicIcon>
            <div class="flex items-center">
              <p :class="metadataTitleClass">CBSE</p>
            </div>
          </div>
        </div>
      </div>

      <!-- start button -->
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
      metadataContainerClass:
        "grid grid-cols-2 space-x-6 bg-yellow-400 p-4 rounded-2xl w-11/12 bp-360:w-10/12 sm:w-2/3 md:w-1/2 xl:w-1/3",
      metadataCellClass:
        "flex space-x-1 bp-360:space-x-2 sm:space-x-4 border-primary flex space-x-2 sm:space-x-4 border-primary",
      metadataIconClass: "h-full w-8 sm:w-12 fill-primary flex",
      metadataTitleClass: "font-poppins-regular text-sm sm:text-base",
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