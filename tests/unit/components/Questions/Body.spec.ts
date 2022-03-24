import { flushPromises, mount } from "@vue/test-utils";
import Body from "@/components/Questions/Body.vue";

describe("Body.vue", () => {
  const wrapper = mount(Body);

  describe("generic", () => {
    it("should render with default values", () => {
      expect(wrapper.find('[data-test="optionContainer"]').exists()).toBe(true);
      expect(
        wrapper.find('[data-test="subjectiveAnswerContainer"]').exists()
      ).toBe(false);
    });

    it("renders question text", async () => {
      const testQuestionText = "ABC";
      await wrapper.setProps({
        text: testQuestionText,
      });
      expect(wrapper.find('[data-test="text"]').text()).toBe(testQuestionText);
    });

    it("starts loading image if imageData is passed", async () => {
      await wrapper.setProps({
        questionType: "mcq",
        imageData: {
          url: "mock",
          alt_text: "mock",
        },
      });
      await flushPromises();
      expect(wrapper.vm.isImageLoading).toBeTruthy();
    });
  });

  describe("mcq questions", () => {
    const options = ["a", ""];
    const wrapper = mount(Body, {
      props: {
        options: options,
      },
    });

    it("renders options", () => {
      expect(wrapper.find('[data-test="option-0"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-2"]').exists()).toBe(false);
      expect(wrapper.find('[data-test="option-0"]').text()).toBe(options[0]);
      expect(wrapper.vm.optionInputType).toBe("radio");
    });

    it("set options selected based on draft answer", async () => {
      const draftAnswer = [0];
      await wrapper.setProps({
        draftAnswer: draftAnswer,
      });

      expect(wrapper.vm.isOptionMarked(0)).toBeTruthy();
      expect(wrapper.vm.isOptionMarked(1)).toBeFalsy();
    });

    it("option text selected correctly", () => {
      wrapper.find('[data-test="option-0"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("option-selected");
    });

    it("option radio selected correctly", () => {
      wrapper.find('[data-test="optionSelector-0"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("option-selected");
    });

    it("highlights options based on correct/wrong answers", async () => {
      const submittedAnswer = [0];
      const correctAnswer = [1];
      await wrapper.setProps({
        submittedAnswer: submittedAnswer,
        correctAnswer: correctAnswer,
        isAnswerSubmitted: true,
      });

      expect(
        wrapper.find(`[data-test="optionContainer-1"]`).classes()
      ).toContain("bg-green-500");
      expect(
        wrapper.find(`[data-test="optionContainer-0"]`).classes()
      ).toContain("bg-red-500");
    });

    it("highlights options as gray for survey mode answers", async () => {
      const submittedAnswer = [0];
      await wrapper.setProps({
        submittedAnswer: submittedAnswer,
        isAnswerSubmitted: true,
        isSurveyQuestion: true,
      });

      expect(
        wrapper.find(`[data-test="optionContainer-0"]`).classes()
      ).toContain("bg-gray-200");
    });
  });

  describe("checkbox", () => {
    const options = ["a", "b", "c"];
    const wrapper = mount(Body, {
      props: {
        options: options,
        questionType: "checkbox",
      },
    });

    it("renders options", () => {
      expect(wrapper.find('[data-test="option-0"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-2"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-3"]').exists()).toBe(false);
      expect(wrapper.find('[data-test="option-0"]').text()).toBe(options[0]);
      expect(wrapper.vm.optionInputType).toBe("checkbox");
    });

    it("set options selected based on draft answer", async () => {
      const draftAnswer = [1, 2];
      await wrapper.setProps({
        draftAnswer: draftAnswer,
      });

      expect(wrapper.vm.isOptionMarked(0)).toBeFalsy();
      expect(wrapper.vm.isOptionMarked(1)).toBeTruthy();
      expect(wrapper.vm.isOptionMarked(2)).toBeTruthy();
    });

    it("option text selected correctly", () => {
      wrapper.find('[data-test="option-0"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("option-selected");
    });

    it("option checkbox selected correctly", () => {
      wrapper.find('[data-test="optionSelector-0"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("option-selected");
    });

    it("highlights options based on correct/wrong answers", async () => {
      const submittedAnswer = [1, 2];
      const correctAnswer = [0, 1];
      await wrapper.setProps({
        submittedAnswer: submittedAnswer,
        correctAnswer: correctAnswer,
        isAnswerSubmitted: true,
      });

      expect(
        wrapper.find('[data-test="optionContainer-0"]').classes()
      ).toContain("bg-green-500");
      expect(
        wrapper.find('[data-test="optionContainer-1"]').classes()
      ).toContain("bg-green-500");
      expect(
        wrapper.find('[data-test="optionContainer-2"]').classes()
      ).toContain("bg-red-500");
    });

    it("highlights options gray for survey mode answers", async () => {
      const submittedAnswer = [1, 2];
      await wrapper.setProps({
        submittedAnswer: submittedAnswer,
        isAnswerSubmitted: true,
        isSurveyQuestion: true,
      });

      expect(
        wrapper.find('[data-test="optionContainer-1"]').classes()
      ).toContain("bg-gray-200");
      expect(
        wrapper.find('[data-test="optionContainer-2"]').classes()
      ).toContain("bg-gray-200");
    });
  });
});
