import { mount } from "@vue/test-utils";
import QuestionPalette from "@/components/Questions/Palette/QuestionPalette.vue";

describe("Buttons in palette", () => {
  const wrapper = mount(QuestionPalette);
  it("Buttons are visible or not", () => {
    expect(wrapper.find('[data-test="toggleInstructions"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="togglePalette"]').exists()).toBeTruthy();
  })

  it("By default palette should be visible", async () => {
    expect(wrapper.find('[data-test="instruction-page"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="question-palette"]').exists()).toBe(true);
  })

  it("instructions are visible when instruction button is clicked", async () => {
    await wrapper.find('[data-test="toggleInstructions"]').trigger("click");
    expect(wrapper.find('[data-test="instruction-page"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="question-palette"]').exists()).toBe(false);
  });

  it("when instructions are visible and instruction button is clicked again", async () => {
    const showInstructions = true;
    const showPalette = false;
      await wrapper.setProps({
        showInstructions,
        showPalette
      });
    await wrapper.find('[data-test="toggleInstructions"]').trigger("click");
    expect(wrapper.find('[data-test="instruction-page"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="question-palette"]').exists()).toBe(false);
  });

  it("palette is visible when palette button is clicked", async () => {
    await wrapper.find('[data-test="togglePalette"]').trigger("click");
    expect(wrapper.find('[data-test="question-palette"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="instruction-page"]').exists()).toBe(false);
  });

  it("when palette is visible and palette button is clicked again", async () => {
    const showInstructions = false;
    const showPalette = true;
      await wrapper.setProps({
        showInstructions,
        showPalette
      });
    await wrapper.find('[data-test="toggleInstructions"]').trigger("click");
    expect(wrapper.find('[data-test="instruction-page"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="question-palette"]').exists()).toBe(false);
  });
})

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
        {
          index: 3,
          value: "partial-success"
        },
      ];
      const questionStates1 = [
        {
          index: 4,
          value: "success",
        },
        {
          index: 5,
          value: "error",
        },
        {
          index: 6,
          value: "neutral",
        },
      ];
      const questionSetStates = [
        {
          title: "Question Set 0",
          paletteItems: questionStates0,
          instructionText: "You may attempt all questions",
          maxQuestionsAllowedToAttempt: 4,
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
      expect(paletteItem.find('[data-test="partial-success"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="index"]').classes()).toContain(
        "bg-gray-200"
      );

      // palette item 4
      paletteItem = wrapper.find('[data-test="paletteItem-3"]');
      expect(paletteItem.find('[data-test="success"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="partial-success"]').exists()).toBeTruthy();
      expect(paletteItem.find('[data-test="neutral"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="error"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="index"]').classes()).toContain(
        "bg-gray-200"
      );

      // palette item 7
      paletteItem = wrapper.find('[data-test="paletteItem-6"]');
      expect(paletteItem.find('[data-test="success"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="error"]').exists()).toBeFalsy();
      expect(paletteItem.find('[data-test="neutral"]').exists()).toBeTruthy();
      expect(paletteItem.find('[data-test="partial-success"]').exists()).toBeFalsy();
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
