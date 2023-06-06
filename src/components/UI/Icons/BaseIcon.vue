<template>
  <div :class="iconClass">
    <QuestionMarkRound v-if="name == 'question-mark-round'"></QuestionMarkRound>
    <StudentInClass v-if="name == 'student-in-class'"></StudentInClass>
    <Math v-if="name == 'math'"></Math>
    <Notepad v-if="name == 'notepad'"></Notepad>
    <Splash v-if="name == 'splash'"></Splash>
    <Correct v-if="name == 'correct'"></Correct>
    <Wrong v-if="name == 'wrong'"></Wrong>
    <Skip v-if="name == 'skip'"></Skip>
    <SpinnerSolid v-if="name == 'spinner-solid'"></SpinnerSolid>
    <RightArrow v-if="name == 'right-arrow'"></RightArrow>
    <Warning v-if="name == 'warning'"></Warning>
    <Lock v-if="name == 'lock'"></Lock>
    <Hamburger v-if="name == 'hamburger'"></Hamburger>
    <CorrectRounded v-if="name == 'correct-rounded'"></CorrectRounded>
    <WrongRounded v-if="name == 'wrong-rounded'"></WrongRounded>
    <SkipRounded v-if="name == 'skip-rounded'"></SkipRounded>
    <PartiallyCorrect v-if="name == 'partially-correct'"></PartiallyCorrect>
    <PartiallyCorrectRounded v-if="name == 'partially-correct-rounded'"></PartiallyCorrectRounded>
  </div>
</template>

<script lang="ts">
import QuestionMarkRound from "./QuestionMarkRound.vue";
import StudentInClass from "./StudentInClass.vue";
import Math from "./Math.vue";
import Notepad from "./Notepad.vue";
import Splash from "./Splash.vue";
import Correct from "./Correct.vue";
import PartiallyCorrect from "./PartiallyCorrect.vue";
import Wrong from "./Wrong.vue";
import SpinnerSolid from "./SpinnerSolid.vue";
import RightArrow from "./RightArrow.vue";
import Warning from "./Warning.vue";
import Lock from "./Lock.vue";
import Skip from "./Skip.vue";
import Hamburger from "./Hamburger.vue";
import CorrectRounded from "./CorrectRounded.vue";
import WrongRounded from "./WrongRounded.vue";
import SkipRounded from "./SkipRounded.vue";
import PartiallyCorrectRounded from "./PartiallyCorrectRounded.vue"

export default {
  name: "BaseIcon",
  components: {
    QuestionMarkRound,
    StudentInClass,
    Math,
    Notepad,
    Splash,
    Correct,
    PartiallyCorrect,
    Wrong,
    SpinnerSolid,
    RightArrow,
    Warning,
    Lock,
    Skip,
    Hamburger,
    CorrectRounded,
    WrongRounded,
    SkipRounded,
    PartiallyCorrectRounded
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    iconClass: {
      type: [String, Array],
      default: "",
    },
  },
};
</script>
