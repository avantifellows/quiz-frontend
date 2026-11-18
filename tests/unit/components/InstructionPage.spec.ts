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

    it("matches the palette colours in the symbol legend", () => {
      // palette: red = visited but not answered, grey = not visited yet
      const legendRow = (label: string) =>
        wrapper.find(`[data-test="legend-${label}"]`).element.parentElement as HTMLElement;
      expect(legendRow("notAnswered").querySelector(".bg-red-300")).not.toBeNull();
      expect(legendRow("notVisited").querySelector(".bg-gray-100")).not.toBeNull();
    });

    it("lays out the marked-for-review row like the other legend rows", () => {
      const row = (label: string) =>
        (wrapper.find(`[data-test="legend-${label}"]`).element.parentElement as HTMLElement).className;
      expect(row("markedForReview")).toBe(row("notVisited"));
      expect(wrapper.text()).not.toContain("NEW");
    });
  });

  describe('when test_format is FST', () => {
    const testTimeLimit = {
      max: 10800,
      min: 0
    };
    const testQuestionSetStates = [
      {
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
  });

  describe("duration", () => {
    const durationText = (max: number) =>
      mount(InstructionPage, {
        props: {
          title: "Geometry Quiz",
          quizType: "assessment",
          quizTimeLimit: { min: 0, max },
          questionSetStates: [],
        },
      }).find('[data-test="quiz-time-limit"]').text();

    it("shows whole minutes and leftover seconds instead of a fraction", () => {
      expect(durationText(10800)).toBe("180 minutes");
      expect(durationText(200)).toBe("3 minutes 20 seconds");
      expect(durationText(60)).toBe("1 minute");
      expect(durationText(45)).toBe("45 seconds");
      expect(durationText(61)).toBe("1 minute 1 second");
    });
  });
});
