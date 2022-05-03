import { mount } from "@vue/test-utils";
import Footer from "@/components/Questions/Footer.vue";

describe("Footer.vue", () => {
  it("shows disabled submit button only by default", () => {
    const wrapper = mount(Footer);
    expect(
      wrapper.get('[data-test="previousQuestionButton"]').classes()
    ).toContain("hidden");
    const submitButton = wrapper.find('[data-test="submitButton"]');
    expect(submitButton.exists()).toBeTruthy();
    expect(submitButton.text()).toBe("Submit");
    expect(submitButton.attributes().disabled).toBeDefined();
    expect(submitButton.classes()).toContain("bg-emerald-500");
  });

  describe("submit button enabled", () => {
    const wrapper = mount(Footer, {
      props: {
        isSubmitEnabled: true,
      },
    });

    it("enables submit button when isSubmitEnabled is set to True", () => {
      expect(
        wrapper.find('[data-test="submitButton"]').attributes().disabled
      ).not.toBeDefined();
    });

    it("clicking on submit emits submit event", () => {
      wrapper.find('[data-test="submitButton"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("submit");
    });
  });

  describe("continue button", () => {
    const wrapper = mount(Footer, {
      props: {
        isAnswerSubmitted: true,
      },
    });

    it("shows continue instead of submit as button text when answer is submitted", () => {
      const continueButton = wrapper.find('[data-test="submitButton"]');
      expect(continueButton.text()).toBe("Continue");
      expect(continueButton.classes()).toContain("bg-primary");
    });

    it("clicking on continue button emits continue", () => {
      wrapper.find('[data-test="submitButton"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("continue");
    });
  });
  describe("previous button", () => {
    const wrapper = mount(Footer, {
      props: {
        isPreviousButtonShown: true,
      },
    });
    it("shows previous button when isPreviousButtonShown is true", () => {
      expect(
        wrapper.find('[data-test="previousQuestionButton"]').exists()
      ).toBeTruthy();
    });
    it("clicking on previous button emits previous", () => {
      wrapper.find('[data-test="previousQuestionButton"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("previous");
    });
  });
});
