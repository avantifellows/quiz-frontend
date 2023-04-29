import { mount } from "@vue/test-utils";
import QuestionPalette from "@/components/Questions/Palette/QuestionPalette.vue";

describe("QuestionPalette.vue", () => {
  const wrapper = mount(QuestionPalette);
  it("renders div for quiz in progress", () => {
    expect(
      wrapper.find('[data-test="quizInProgressIcon"]').exists()
    ).toBeTruthy();
    expect(wrapper.find('[data-test="quizEndedIcon"]').exists()).toBeFalsy();
  });

  it("renders icon for ended quiz", async () => {
    await wrapper.setProps({
      hasQuizEnded: true,
    });
    expect(
      wrapper.find('[data-test="quizInProgressIcon"]').exists()
    ).toBeFalsy();
    expect(wrapper.find('[data-test="quizEndedIcon"]').exists()).toBeTruthy();
  });

  describe("Palette Item", () => {
    beforeEach(async () => {
      const questionStates0 = [
        {
          index: 0,
          value: "success",
        },
        {
          index: 1,
          value: "error",
        },
        {
          index: 2,
          value: "neutral",
        },
      ];
      const questionStates1 = [
        {
          index: 3,
          value: "success",
        },
        {
          index: 4,
          value: "error",
        },
        {
          index: 5,
          value: "neutral",
        },
      ];
      const questionSetStates = [
        {
          title: "Question Set 0",
          paletteItems: questionStates0,
          instructionText: "You may attempt all questions",
          maxQuestionsAllowedToAttempt: 3,
        },
        {
          title: "Question Set 1",
          paletteItems: questionStates1,
          instructionText: "You may attempt all questions",
          maxQuestionsAllowedToAttempt: 3,
        },
      ];
      const currentQuestionIndex = 1;
      await wrapper.setProps({
        questionSetStates,
        currentQuestionIndex,
      });
    });

    it("renders question states and highlights the current question", async () => {
      // palette item 1
      let paletteItem = wrapper.find('[data-test="paletteItem-0"]');
      expect(paletteItem.find('[data-test="success"]').exists()).toBeTruthy();
      expect(paletteItem.find('[data-test="error"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="neutral"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="index"]').classes()).toContain(
        "bg-gray-200"
      );

      // palette item 2
      paletteItem = wrapper.find('[data-test="paletteItem-1"]');
      expect(paletteItem.find('[data-test="success"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="error"]').exists()).toBeTruthy();
      expect(paletteItem.find('[data-test="neutral"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="index"]').classes()).toContain(
        "bg-yellow-200"
      );

      // palette item 6
      paletteItem = wrapper.find('[data-test="paletteItem-5"]');
      expect(paletteItem.find('[data-test="success"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="error"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="neutral"]').exists()).toBeTruthy();
      expect(paletteItem.find('[data-test="index"]').classes()).toContain(
        "bg-gray-200"
      );
    });

    it("clicks to selected question upon clicking palette item", () => {
      const questionIndex = 4;
      wrapper
        .find(`[data-test="paletteItem-${questionIndex}"]`)
        .trigger("click");
      expect(wrapper.emitted()).toHaveProperty("navigate");
      expect(wrapper.emitted().navigate[0]).toEqual([questionIndex]);
    });

    it("displays question set title", () => {
      let questionSetIndex = 0;
      expect(wrapper
        .find(`[data-test="paletteTitle-${questionSetIndex}"]`).text()
      ).toBe("Question Set 0");

      questionSetIndex = 1;
      expect(wrapper
        .find(`[data-test="paletteTitle-${questionSetIndex}"]`).text()
      ).toBe("Question Set 1");
    });

    it("displays instruction text for each set", () => {
      let questionSetIndex = 0;
      expect(wrapper
        .find(`[data-test="paletteInstruction-${questionSetIndex}"]`).text()
      ).toBe("You may attempt all questions");

      questionSetIndex = 1;
      expect(wrapper
        .find(`[data-test="paletteInstruction-${questionSetIndex}"]`).text()
      ).toBe("You may attempt all questions");
    });
  });
});
