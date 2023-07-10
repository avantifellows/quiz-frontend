<template>
    <div class="">
        <h1 class="text-3xl font-bold m-3 text-center">Instructions</h1>
        <h4 class="text-lg font-bold m-6 ">Test Paper Overview</h4>
        <!-- Table -->
        <div class="w-1/2 m-4 gap-0">
            <!-- row-1 -->
            <div class="grid grid-cols-2">
                <div class=" font-semibold col-span-1 border-1 border-black p-1 pl-2">
                    Test Name
                </div>
                <div class="col-span-1 border-1 border-l-0 border-black p-1 pl-2">
                    {{ $props.title }}
                </div>
            </div>
            <!-- row-2 -->
            <div class="grid grid-cols-2">
                <div class=" font-semibold col-span-1 border-1 border-t-0 border-black p-1 pl-2">
                    Test Purpose
                </div>
                <div class="col-span-1 border-1 border-l-0 border-t-0 border-black p-1 pl-2">
                   {{ $props.test_purpose }}
                </div>
            </div>
            <!-- row-3 -->
            <div class="grid grid-cols-2">
                <div class=" font-semibold col-span-1 border-1 border-t-0 border-black p-1 pl-2">
                    Duration
                </div>
                <div class="col-span-1 border-1 border-l-0 border-t-0 border-black p-1 pl-2">
                    {{ ($props.quizTimeLimit)/60 }} min
                </div>
            </div>
            <!-- row-4 -->
            <div class="grid grid-cols-2">
                <div class=" font-semibold col-span-1 border-1 border-t-0 border-black p-1 pl-2">
                    Total Marks
                </div>
                <div class="col-span-1 border-1 border-l-0 border-t-0 border-black p-1 pl-2">
                    {{ $props.maxMarks }}
                </div>
            </div>
            <!-- row-5 -->
            <div class="grid grid-cols-2">
                <div class=" font-semibold col-span-1 border-1 border-t-0 border-black p-1 pl-2">
                    No. of Questions
                </div>
                <div class="col-span-1 border-1 border-l-0 border-t-0 border-black p-1 pl-2">
                    {{ $props.maxQuestionsAllowedToAttempt }}
                </div>
            </div>
            <!-- row-6 -->
            <div class="grid grid-cols-2">
                <div class=" font-semibold col-span-1 border-1 border-t-0 border-black p-1 pl-2">
                    Subjects
                </div>
                <div class="col-span-1 border-1 border-l-0 border-t-0 border-black p-1 pl-2">
                    {{ $props.subject }}
                </div>
            </div>
            <!-- row-7 -->
            <div class="grid grid-cols-2">
                <div class=" font-semibold col-span-1 border-1 border-t-0 border-black p-1 pl-2">
                    Type of Questions
                </div>
                <div class="col-span-1 border-1 border-l-0 border-t-0 border-black p-1 pl-2">
                    {{ $props.questionType }}
                </div>
            </div>
            <!-- row-8 -->
            <div class="grid grid-cols-2">
                <div class=" font-semibold col-span-1 border-1 border-t-0 border-black p-1 pl-2">
                    Marking Scheme
                </div>
                <div class="col-span-1 border-1 border-l-0 border-t-0 border-black p-1 pl-2">
                    {{ $props.markingScheme }}
                </div>
            </div>
            <!-- row-9 -->
            <div class="grid grid-cols-2">
                <div class=" font-semibold col-span-1 border-1 border-t-0 border-black p-1 pl-2">
                    Quiz Type
                </div>
                <div class="col-span-1 border-1 border-l-0 border-t-0 border-black p-1 pl-2">
                    {{ $props.quiz_type }}
                </div>
            </div>
        </div>
        <!-- Test Paper Pattern(if FST) -->
        <h4 class="text-lg font-bold m-6">General Instructions</h4>
        <div class="w-1/2 ml-10">
          <ol class="text-justify">
             <li>The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
             <li>You can click on the "=" button on the top left corner of the page to expand the Question Palette </li>
             <li>The Question Palette will show the status of each question using one of the following symbols:
                <ol class="ml-7 m-2 list-[lower-alpha]">
                <li>You have not visited the question yet.</li>
                <li>You have not answered the question.</li>
                <li>You have answered the question.</li>
             </ol>
             </li>
             <li>To view the Instructions again, click on the “Instructions” button at the top of the Question Palette. </li>
             <li>You can click on the “X” button to the right of the Question Palette to collapse it.</li>
          </ol>
        </div>
        <h4 class="text-lg font-bold m-6">Answering a Question:</h4>
        <div class="w-1/2 ml-10">
          <ol class="text-justify">
             <li>Procedure for answering a multiple choice type question:
                <ol class="ml-7 m-2 list-[lower-alpha] text-justify">
                <li>To select you answer, click on the button of one of the options.</li>
                <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <span><b>Clear Response</b></span> button</li>
                <li>To change your chosen answer, click on the button of another option</li>
                <li>To save your answer, you <b>MUST</b> click on the Save & Next button.</li>
             </ol>
             </li>
             <li>To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.</li>
          </ol>
        </div>
        <div class="w-1/2 mt-5 flex items-center-top">
            <p class="text-red-950 text-lg mt-3 ml-7">!</p>
            <p class="list-[none] text-justify bg-pink bg-opacity-25 p-3 pt-4 ml-3">Note that selecting an option does NOT save your answer to the current question. Click on <b>Save & Next</b> to save your answer for the current question and then go to the next question.</p>
        </div>
        <div class="w-1/2 flex items-center-top ml-4 mt-5">
            <input type="checkbox" class="mr-2">
            <p class="ml-2 text-justify">I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. /any prohibited material with me into the Examination Hall. I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations. </p>
        </div>

        <button></button>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { quizType, quizTitleType, testPurpose } from "../types";
export default defineComponent({
  name: "InstructionPage",
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
    quiz_type: {
      type: [null, String] as PropType<quizType>,
      required: true
    },
    maxMarks: {
      type: Number,
      required: true
    },
    quizTimeLimit: {
      type: Number,
      required: true
    },
    markingScheme: {
      required: true,
      type: Array
    },
    questionType: {
      required: true,
      type: Array
    },
    test_purpose: {
      type: [null, String] as PropType<testPurpose>,
      required: true
    }
  },
  mounted() {
    console.log(this.test_purpose)
    console.log(this.title)
  },
})
</script>
