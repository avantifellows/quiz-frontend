import { mount } from "@vue/test-utils";
import QuestionPalette from "@/components/Questions/Palette/QuestionPalette.vue";

describe("QuestionPalette.vue", () => {
  // Mount the component with the mock store
  const wrapper = mount(QuestionPalette, {
    props: {
      // Include any necessary props here as per your component requirements
      title: "Sample Quiz",
      subject: "Maths",
      numQuestions: 10,
      maxMarks: 100,
      quizTimeLimit: { minutes: 30 },
      testFormat: "MCQ",
    },
  });

  it("Buttons are visible or not", () => {
    expect(wrapper.find('[data-test="toggleInstructions"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="togglePalette"]').exists()).toBeTruthy();
  });

  it("By default palette should be visible", () => {
    expect(wrapper.find('[data-test="instruction-page"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="question-palette"]').exists()).toBe(true);
  });

  it("instructions are visible when instruction button is clicked", async () => {
    await wrapper.find('[data-test="toggleInstructions"]').trigger("click");
    expect(wrapper.find('[data-test="instruction-page"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="question-palette"]').exists()).toBe(false);
  });

  it("palette is visible when palette button is clicked", async () => {
    await wrapper.find('[data-test="togglePalette"]').trigger("click");
    expect(wrapper.find('[data-test="question-palette"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="instruction-page"]').exists()).toBe(false);
  });

  it("renders div for quiz in progress", () => {
    expect(wrapper.find('[data-test="quizInProgressIcon"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="quizEndedIcon"]').exists()).toBeFalsy();
  });

  it("renders icon for ended quiz", async () => {
    await wrapper.setProps({
      hasQuizEnded: true,
    });
    expect(wrapper.find('[data-test="quizInProgressIcon"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="quizEndedIcon"]').exists()).toBeTruthy();
  });

  describe("Palette Item", () => {
    beforeEach(async () => {
      const questionStates0 = [
        { index: 0, value: "success" },
        { index: 1, value: "error" },
        { index: 2, value: "neutral" },
        { index: 3, value: "partial-success" },
      ];
      const questionStates1 = [
        { index: 4, value: "success" },
        { index: 5, value: "error" },
        { index: 6, value: "neutral" },
      ];
      const questionSetStates = [
        { title: "Question Set 0", paletteItems: questionStates0, instructionText: "You may attempt all questions", maxQuestionsAllowedToAttempt: 4 },
        { title: "Question Set 1", paletteItems: questionStates1, instructionText: "You may attempt all questions", maxQuestionsAllowedToAttempt: 3 },
      ];
      const currentQuestionIndex = 1;
      await wrapper.setProps({
        questionSetStates,
        currentQuestionIndex,
      });
    });

    it("renders question states and highlights the current question", () => {
      let paletteItem = wrapper.find('[data-test="paletteItem-0"]');
      expect(paletteItem.find('[data-test="success"]').exists()).toBeTruthy();
      paletteItem = wrapper.find('[data-test="paletteItem-3"]');
      expect(paletteItem.find('[data-test="partial-success"]').exists()).toBeTruthy();
      paletteItem = wrapper.find('[data-test="paletteItem-6"]');
      expect(paletteItem.find('[data-test="neutral"]').exists()).toBeTruthy();
    });

    it("clicks to selected question upon clicking palette item", async () => {
      const questionIndex = 4;
      await wrapper.find(`[data-test="paletteItem-${questionIndex}"]`).trigger("click");
      expect(wrapper.emitted()).toHaveProperty("navigate");
      expect(wrapper.emitted().navigate[0]).toEqual([questionIndex]);
    });
  });
});
