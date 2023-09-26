import { mount } from '@vue/test-utils';
import InstructionPage from '@/components/InstructionPage.vue';

describe('InstructionPage', () => {
  // When test_format is not 'full_syllabus_test'
  describe('when test_format is not FST', () => {
    const testQuestionSets = [
      {
        _id: "64bf709a8b60731c693290c1",
        title: "Maths - Set 0",
        description: "You may attempt all questions",
        max_questions_allowed_to_attempt: 2,
        questions: [
          {
            _id: "64bf709a8b60731c693290c1",
          },
          {
            _id: "64bf709a8b60731c693290c1",
          },
        ]
      },
      {
        _id: "64bf709a8b60731c693290c8",
        title: "Maths - Set 1",
        description: "You may attempt all questions",
        max_questions_allowed_to_attempt: 2,
        questions: [
          {
            _id: "64bf709a8b60731c693290c1",
          },
          {
            _id: "64bf709a8b60731c693290c1",
          },
        ]
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
        quizTimeLimit: 10800,
        testFormat: "major_test",
        questionSets: testQuestionSets,
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
    const testQuestionSets = [
      {
        _id: "64bf709a8b60731c693290c1",
        title: "Maths - Set 0",
        description: "You may attempt all questions",
        max_questions_allowed_to_attempt: 2,
        questions: [
          {
            _id: "64bf709a8b60731c693290c1",
          },
          {
            _id: "64bf709a8b60731c693290c1",
          },
        ]
      },
      {
        _id: "64bf709a8b60731c693290c8",
        title: "Maths - Set 1",
        description: "You may attempt all questions",
        max_questions_allowed_to_attempt: 2,
        questions: [
          {
            _id: "64bf709a8b60731c693290c1",
          },
          {
            _id: "64bf709a8b60731c693290c1",
          },
        ]
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
        quizTimeLimit: 10800,
        testFormat: "full_syllabus_test",
        questionSets: testQuestionSets,
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
      expect(wrapper.find(`[data-test="questionSetInstruction-${questionSetIndex}"]`).text()).toBe("You may attempt all questions");

      questionSetIndex = 1;
      expect(wrapper.find(`[data-test="questionSetInstruction-${questionSetIndex}"]`).text()).toBe("You may attempt all questions");
    });

    it("No. of questions need to be attempted for each set", () => {
      let questionSetIndex = 0;
      expect(wrapper.find(`[data-test="no-of-questions-${questionSetIndex}"]`).text()).toBe("There are 2 questions, out of which only 2 questions need to be attempted.");

      questionSetIndex = 1;
      expect(wrapper.find(`[data-test="no-of-questions-${questionSetIndex}"]`).text()).toBe("There are 2 questions, out of which only 2 questions need to be attempted.");
    })
  });
});
