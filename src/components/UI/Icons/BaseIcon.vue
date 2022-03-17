<template>
  <div :class="iconClass">
    <QuestionMarkRound v-if="name == 'question-mark-round'"></QuestionMarkRound>
    <StudentInClass v-if="name == 'student-in-class'"></StudentInClass>
    <Math v-if="name == 'math'"></Math>
    <Notepad v-if="name == 'notepad'"></Notepad>
    <Splash v-if="name == 'splash'"></Splash>
  </div>
</template>

<script>
import QuestionMarkRound from "./QuestionMarkRound.vue";
import StudentInClass from "./StudentInClass.vue";
import Math from "./Math.vue";
import Notepad from "./Notepad.vue";
import Splash from "./Splash.vue";

export default {
  name: "BaseIcon",
  components: {
    QuestionMarkRound,
    StudentInClass,
    Math,
    Notepad,
    Splash,
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
