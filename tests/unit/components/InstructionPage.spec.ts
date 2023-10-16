import { mount } from '@vue/test-utils';
import InstructionPage from '@/components/InstructionPage.vue';

describe('InstructionPage', () => {
  // When test_format is not 'full_syllabus_test'
  describe('when test_format is not FST', () => {
    const testTimeLimit = {
      max: 10800,
      min: 0
    };
    const testQuestionSetStates = [
      {
        localInstructionPageText: "You may attempt 2 out of 5 questions",
        instructionTest: "You may attempt all the questions",
        maxQuestionsAllowedToAttempt: 2,
        paletteItems: [
          {
            index: 0,
            value: "error"
          },
          {
            index: 1,
            value: "error"
          },
        ],
        title: "Maths - Set 0",
      },
      {
        localInstructionPageText: "You may attempt 2 out of 5 questions",
        instructionTest: "You may attempt all the questions",
        maxQuestionsAllowedToAttempt: 2,
        paletteItems: [
          {
            index: 0,
            value: "error"
          },
          {
            index: 1,
            value: "error"
          },
        ],
        title: "Maths - Set 1",
      },
      // Add more questionSets as needed
    ]
    const wrapper = mount(InstructionPage, {
      props: {
        title: "Geometry Quiz",
        subject: "Maths",
        quizType: "assessment",
        maxQuestionsAllowedToAttempt: 3,
        grade: "8",
        maxMarks: 30,
        testFormat: "major_test",
        quizTimeLimit: testTimeLimit,
        questionSetStates: testQuestionSetStates,
      },
    });

    it("renders props correctly", () => {
      expect(wrapper.find('[data-test="title"]').text()).toBe("Geometry Quiz");
      expect(wrapper.find('[data-test="test-format"]').text()).toContain("Major Test");
      expect(wrapper.find('[data-test="quiz-time-limit"]').text()).toContain("180 minutes");
      expect(wrapper.find('[data-test="total-marks"]').text()).toContain("30 Marks");
      expect(wrapper.find('[data-test="num-questions"]').text()).toContain("3");
      expect(wrapper.find('[data-test="subject"]').text()).toBe("Maths");
    });

    it("Test Paper Pattern should not be Visible", async () => {
      expect(wrapper.find('[data-test="test-fst"]').exists()).toBe(false);
    });
  });

  describe('when test_format is FST', () => {
    const testTimeLimit = {
      max: 10800,
      min: 0
    };
    const testQuestionSetStates = [
      {
        localInstructionPageText: "You may attempt 2 out of 5 questions",
        instructionTest: "You may attempt all the questions",
        maxQuestionsAllowedToAttempt: 2,
        paletteItems: [
          {
            index: 0,
            value: "error"
          },
          {
            index: 1,
            value: "error"
          },
        ],
        title: "Maths - Set 0",
      },
      {
        localInstructionPageText: "You may attempt 2 out of 5 questions",
        instructionTest: "You may attempt all the questions",
        maxQuestionsAllowedToAttempt: 2,
        paletteItems: [
          {
            index: 0,
            value: "error"
          },
          {
            index: 1,
            value: "error"
          },
        ],
        title: "Maths - Set 1",
      },
      // Add more questionSets as needed
    ]
    const wrapper = mount(InstructionPage, {
      props: {
        title: "Geometry Quiz",
        subject: "Maths",
        quizType: "assessment",
        maxQuestionsAllowedToAttempt: 3,
        grade: "8",
        maxMarks: 30,
        quizTimeLimit: testTimeLimit,
        testFormat: "full_syllabus_test",
        questionSetStates: testQuestionSetStates,
      },
    });

    it("renders props correctly", () => {
      expect(wrapper.find('[data-test="title"]').text()).toBe("Geometry Quiz");
      expect(wrapper.find('[data-test="test-format"]').text()).toContain("Full Syllabus Test");
      expect(wrapper.find('[data-test="quiz-time-limit"]').text()).toContain("180 minutes");
      expect(wrapper.find('[data-test="total-marks"]').text()).toContain("30 Marks");
      expect(wrapper.find('[data-test="num-questions"]').text()).toContain("3");
      expect(wrapper.find('[data-test="subject"]').text()).toBe("Maths");
    });

    it("Test Paper Pattern should be Visible", async () => {
      expect(wrapper.find('[data-test="test-fst"]').exists()).toBe(true);
    });

    it("displays question set title", () => {
      let questionSetIndex = 0;
      expect(wrapper.find(`[data-test="questionSetTitle-${questionSetIndex}"]`).text()).toBe("Maths - Set 0");

      questionSetIndex = 1;
      expect(wrapper.find(`[data-test="questionSetTitle-${questionSetIndex}"]`).text()).toBe("Maths - Set 1");
    });

    it("displays instruction text for each set", () => {
      let questionSetIndex = 0;
      expect(wrapper.find(`[data-test="questionSetInstruction-${questionSetIndex}"]`).text()).toBe("You may attempt 2 out of 5 questions");

      questionSetIndex = 1;
      expect(wrapper.find(`[data-test="questionSetInstruction-${questionSetIndex}"]`).text()).toBe("You may attempt 2 out of 5 questions");
    });

    it("No. of questions need to be attempted for each set", () => {
      let questionSetIndex = 0;
      expect(wrapper.find(`[data-test="no-of-questions-${questionSetIndex}"]`).text()).toBe("There are 2 questions, out of which only 2 questions need to be attempted.");

      questionSetIndex = 1;
      expect(wrapper.find(`[data-test="no-of-questions-${questionSetIndex}"]`).text()).toBe("There are 2 questions, out of which only 2 questions need to be attempted.");
    })
  });
});
