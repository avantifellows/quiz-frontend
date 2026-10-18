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
});
