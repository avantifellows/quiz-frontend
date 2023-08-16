<template>
    <div class="xl:mr-20 xl:ml-10 lg:mr-24 lg:ml-24 md:mr-48 md:ml-48 sm:mr-60 sm:ml-60">
        <h4 class="text-lg font-bold m-6 ">Test Paper Overview</h4>
        <!-- Table -->
        <table class="table-auto m-4">
            <!-- row 1 -->
            <tr>
                <th class="border-black border-1 text-left px-4 py-2">Test Name</th>
                <td class="border-black border-1 px-4 py-2">{{ $props.title }}</td>
            </tr>
            <!-- row 2 -->
            <tr>
                <th class="border-black border-1 text-left px-4 py-2">Test Purpose</th>
                <td class="border-black border-1 px-4 py-2">{{ $props.test_purpose }}</td>
            </tr>
            <!-- row 3 -->
            <tr>
                <th class="border-black border-1 text-left px-4 py-2">Duration</th>
                <td class="border-black border-1 px-4 py-2">{{ ($props.quizTimeLimit)/60 }} minutes</td>
            </tr>
            <!-- row 4 -->
            <tr>
                <th class="border-black border-1 text-left px-4 py-2">Total Marks</th>
                <td class="border-black border-1 px-4 py-2">{{ $props.maxMarks }} Marks</td>
            </tr>
            <!-- row 5 -->
            <tr>
                <th class="border-black border-1 text-left px-4 py-2">No. of Questions</th>
                <td class="border-black border-1 px-4 py-2">{{ $props.maxQuestionsAllowedToAttempt }}</td>
            </tr>
            <!-- row 6 -->
            <tr>
                <th class="border-black border-1 text-left px-4 py-2">Subjects</th>
                <td class="border-black border-1 px-4 py-2">{{ $props.subject }}</td>
            </tr>
        </table>
        <!-- Test Paper Pattern(if FST) -->
        <div v-if="isTestFST">
          <h4 class="text-lg font-bold m-6">Test Paper Pattern</h4>
            <!-- Printing subjects extracted from questionSet.title -->
            <p class="ml-6 mr-4 mb-2 text-justify">The following are the subjects in the test: <strong>
              <span v-for="(part, index) in subjectNames" :key="part">
                  {{ index > 0 ? ', ' : '' }}{{ part }}
              </span></strong>
            </p>
            <!-- iterating over every questionset and printing title and its description -->
            <div
              v-for="(questionSet, index) in questionSets" :key="index">
                <li class="text-base mt-2 ml-7 font-semibold leading-none mr-4">{{ questionSet.title }}</li>
                <div class="ml-12 mr-4 mt-1">
                  There are {{ questionSet.questions.length }} questions, out of which only {{ questionSet.max_questions_allowed_to_attempt }} questions need to be attempted.
                </div>
                <div class="text-base mx-2 mb-4 leading-tight text-slate-500 ml-12 mr-4" v-html="questionSet.description"></div>
            </div>
        </div>
        <!-- general Instruction -->
        <h4 class="text-lg font-bold m-6">General Instructions</h4>
        <div class="ml-11 mr-4">
          <ol class="text-justify">
             <li>The countdown timer in the top right corner of screen will display the remaining time available for you to complete the test. When the timer reaches zero, the test will end by itself. You will not be required to end or submit your test.</li>
             <li>You can click on the <span class="inline-flex items-baseline"><BaseIcon name ='hamburger' class="place-self-center w-4 h-4"></BaseIcon></span> button on the top left corner of the page to expand the Question Palette </li>
             <li>The Question Palette will show the status of each question using one of the following symbols:
                <div class="flex flex-wrap ml-7 mr-4 m-2">
                    <div class="flex items-center mb-2 mr-4">
                        <Success></Success>
                        <span class="ml-6 mr-6">You have answered the question</span>
                    </div>
                    <div class="flex items-center mb-2 mr-4">
                        <Error></Error>
                        <span class="ml-6 mr-6">You have not visited the question yet</span>
                    </div>
                    <div class="flex items-center mb-2 mr-4">
                        <Neutral></Neutral>
                        <span class="ml-6 mr-6">You have not answered the question</span>
                    </div>
                </div>
             </li>
             <li>To view the Instructions again, click on the “Instructions” button at the top of the Question Palette. </li>
             <li>You can click on the <span class="inline-flex items-baseline"><BaseIcon name ='hamburger' class="place-self-center w-4 h-4"></BaseIcon></span> button again to collapse the Question Palette.</li>
          </ol>
        </div>
        <!-- Answering a question -->
        <h4 class="text-lg font-bold m-6">Answering a Question:</h4>
        <div class="ml-11 mr-4">
          <ol class="text-justify">
             <li>Procedure for answering a multiple choice type question:
                <ol class="ml-7 list-[lower-alpha] text-justify">
                <li>To select you answer, click on the button of one of the options.</li>
                <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <b>Clear Response</b> button</li>
                <li>To change your chosen answer, click on the button of another option</li>
                <li>To save your answer, you <b>MUST</b> click on the Save & Next button.</li>
             </ol>
             </li>
             <li>To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.</li>
          </ol>
        </div>
        <div class="mt-5 ml-6 mr-4 flex border-red border-1 p-2">
          <div class="float-left text-red pr-5 pl-3 text-xl font-bold">!</div>
          <div class="float-right text-justify pr-2">Note that selecting an option does NOT save your answer to the current question. Click on <b>Save & Next to save your answer</b> for the current question and then go to the next question.</div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import BaseIcon from "./UI/Icons/BaseIcon.vue";
import Success from "./Questions/Palette/Success.vue";
import Error from "./Questions/Palette/Error.vue";
import Neutral from "./Questions/Palette/Neutral.vue";
import { quizTitleType, testPurpose, QuestionSet } from "../types";
export default defineComponent({
  name: "InstructionPage",
  components: {
    BaseIcon,
    Success,
    Error,
    Neutral
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
      required: true
    },
    quizTimeLimit: {
      type: Number,
      required: true
    },
    questionSets: {
      required: true,
      type: Array as PropType<QuestionSet[]>
    },
    test_purpose: {
      type: [null, String] as PropType<testPurpose>,
      required: true
    },
  },
  setup(props) {
    const isTestFST = computed(() => props.test_purpose == "Full Syllabus Test")

    // to extract the questionSetTitles from questionSets (eg. Physics - Section A)
    const questionSetTitles = computed(() => {
      return props.questionSets.map(questionSet => questionSet.title);
    });

    // to split the questionSetTitles from char "-" (eg. Physics)
    const subjectNames = computed(() => {
      const distinctComponents = new Set();

      questionSetTitles.value.forEach(title => {
        if (title !== null) {
          const parts = title.split("-");
          if (parts.length === 2) {
            distinctComponents.add(parts[0].trim());
          }
        }
      });

      return Array.from(distinctComponents);
    });

    // to split the questionSetTitles from char "-" (eg. Section A)
    const sectionNames = computed(() => {
      const distinctComponents = new Set();

      questionSetTitles.value.forEach(title => {
        if (title !== null) {
          const parts = title.split("-");
          if (parts.length === 2) {
            distinctComponents.add(parts[1].trim());
          }
        }
      });

      return Array.from(distinctComponents);
    });

    return {
      isTestFST,
      questionSetTitles,
      subjectNames,
      sectionNames
    }
  },
})
</script>
