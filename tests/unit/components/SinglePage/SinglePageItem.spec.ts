import { mount } from "@vue/test-utils";
import SinglePageItem from "@/components/SinglePage/SinglePageItem.vue";

// single-choice-other: the last option ("Other") shows a free-text box when selected, and
// the answer is {selected: [index], other_text}
describe("SinglePageItem.vue — single-choice-other", () => {
  const options = [{ text: "I was not aware" }, { text: "No time" }, { text: "Other" }];

  function mountItem(submittedAnswer: unknown = null) {
    return mount(SinglePageItem, {
      props: {
        options,
        questionType: "single-choice-other",
        quizType: "form",
        showFullText: true,
        isGradedQuestion: false,
        maxCharLimit: null as unknown as number, // backend sends null when unset
        currentQuestionIndex: 4,
        submittedAnswer,
      },
    });
  }

  function lastEmit(wrapper: ReturnType<typeof mountItem>) {
    const emitted = wrapper.emitted("option-selected") || [];
    return emitted[emitted.length - 1];
  }

  it("renders radio options with no text box initially", () => {
    const wrapper = mountItem();
    expect(wrapper.find('[data-test="optionSelector-0"]').attributes("type")).toBe("radio");
    expect(wrapper.find('[data-test="otherTextContainer"]').exists()).toBe(false);
  });

  it("picking a normal option emits {selected, other_text: null}", async () => {
    const wrapper = mountItem();
    await wrapper.find('[data-test="optionSelector-1"]').trigger("click");
    expect(lastEmit(wrapper)).toEqual([{ selected: [1], other_text: null }, 4]);
    expect(wrapper.find('[data-test="otherTextContainer"]').exists()).toBe(false);
  });

  it("picking Other shows the text box and typed text is emitted", async () => {
    const wrapper = mountItem();
    await wrapper.find('[data-test="optionSelector-2"]').trigger("click");
    expect(lastEmit(wrapper)).toEqual([{ selected: [2], other_text: null }, 4]);
    expect(wrapper.find('[data-test="otherTextContainer"]').exists()).toBe(true);

    await wrapper.find('[data-test="otherText"] textarea').setValue("No internet at home");
    expect(lastEmit(wrapper)).toEqual([
      { selected: [2], other_text: "No internet at home" },
      4,
    ]);
  });

  it("switching away from Other hides the box and clears the text", async () => {
    const wrapper = mountItem({ selected: [2], other_text: "No internet" });
    expect(wrapper.find('[data-test="otherTextContainer"]').exists()).toBe(true);

    await wrapper.find('[data-test="optionSelector-0"]').trigger("click");
    expect(lastEmit(wrapper)).toEqual([{ selected: [0], other_text: null }, 4]);
    expect(wrapper.find('[data-test="otherTextContainer"]').exists()).toBe(false);

    // coming back to Other starts with an empty box
    await wrapper.find('[data-test="optionSelector-2"]').trigger("click");
    expect(
      (wrapper.find('[data-test="otherText"] textarea').element as HTMLTextAreaElement).value
    ).toBe("");
  });

  it("restores the selected option and typed text on resume", () => {
    const wrapper = mountItem({ selected: [2], other_text: "No internet" });
    expect(
      (wrapper.find('[data-test="optionSelector-2"]').element as HTMLInputElement).checked
    ).toBe(true);
    expect(
      (wrapper.find('[data-test="otherText"] textarea').element as HTMLTextAreaElement).value
    ).toBe("No internet");
  });

  it("picking the selected option again clears the answer", async () => {
    const wrapper = mountItem({ selected: [1], other_text: null });
    await wrapper.find('[data-test="optionSelector-1"]').trigger("click");
    expect(lastEmit(wrapper)).toEqual([null, 4]);
  });

  it("renders when options are null (e.g. trimmed question details)", () => {
    const wrapper = mount(SinglePageItem, {
      props: { options: null as unknown as [], questionType: "single-choice", showFullText: true },
    });
    expect(wrapper.find('[data-test="otherTextContainer"]').exists()).toBe(false);
  });
});

// numerical answers can be negative: "-" is allowed as the first character only
describe.each(["numerical-integer", "numerical-float"])(
  "SinglePageItem.vue — negative %s answers",
  (numericalType) => {
    function mountItem() {
      return mount(SinglePageItem, {
        props: {
          questionType: numericalType,
          quizType: "assessment",
          currentQuestionIndex: 2,
        },
      });
    }

    function answerBox(wrapper: ReturnType<typeof mountItem>) {
      return wrapper.find('[data-test="numericalAnswer"] textarea');
    }

    function isKeyBlocked(
      wrapper: ReturnType<typeof mountItem>,
      data: string,
      caret: number
    ) {
      const element = answerBox(wrapper).element as HTMLTextAreaElement;
      element.setSelectionRange(caret, caret);
      const event = new Event("beforeinput", { cancelable: true });
      Object.defineProperty(event, "data", { value: data });
      element.dispatchEvent(event);
      return event.defaultPrevented;
    }

    function lastEmit(wrapper: ReturnType<typeof mountItem>) {
      const emitted = wrapper.emitted("numerical-answer-entered") || [];
      return emitted[emitted.length - 1];
    }

    it("allows a leading minus sign and blocks one later in the answer", async () => {
      const wrapper = mountItem();
      expect(isKeyBlocked(wrapper, "-", 0)).toBe(false);
      await answerBox(wrapper).setValue("7");
      expect(isKeyBlocked(wrapper, "-", 1)).toBe(true);
    });

    it("saves a lone minus as not answered and then the negative number", async () => {
      const wrapper = mountItem();
      await answerBox(wrapper).setValue("-");
      expect(lastEmit(wrapper)).toEqual([null, 2]);
      await answerBox(wrapper).setValue("-7");
      expect(lastEmit(wrapper)).toEqual([-7, 2]);
    });
  }
);
