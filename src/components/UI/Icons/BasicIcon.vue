<template>
  <div :class="iconClass">
    <QuestionMarkRound v-if="name == 'question-mark-round'"></QuestionMarkRound>
    <StudentInClass v-if="name == 'student-in-class'"></StudentInClass>
    <Math v-if="name == 'math'"></Math>
    <Notepad v-if="name == 'notepad'"></Notepad>
  </div>
</template>

<script>
import QuestionMarkRound from "./QuestionMarkRound.vue";
import StudentInClass from "./StudentInClass.vue";
import Math from "./Math.vue";
import Notepad from "./Notepad.vue";

export default {
  name: "BasicIcon",
  components: {
    QuestionMarkRound,
    StudentInClass,
    Math,
    Notepad,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    iconClass: {
      type: String,
      default: "",
    },
  },
};
</script>
