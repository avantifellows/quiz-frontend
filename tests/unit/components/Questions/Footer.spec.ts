import { mount } from "@vue/test-utils";
import Footer from "@/components/Questions/Footer.vue";

describe("Footer.vue", () => {
  describe("Homework quizzes", () => {
    const wrapper = mount(Footer, {
      props: {
        quizType: "homework",
      },
    });
    it("shows disabled submit button only by default", () => {
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
      beforeEach(async () => {
        await wrapper.setProps({
          isSubmitEnabled: true,
        });
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
      beforeEach(async () => {
        await wrapper.setProps({
          isAnswerSubmitted: true,
        });
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
      beforeEach(async () => {
        await wrapper.setProps({
          isPreviousButtonShown: true,
        });
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

  describe("Assessment quizzes", () => {
    const wrapper = mount(Footer, {
      props: {
        quizType: "assessment",
      },
    });
    it("shows next, disabled save & next and disabled clear buttons by default", () => {
      expect(
        wrapper.get('[data-test="previousQuestionButton"]').classes()
      ).toContain("invisible");
      expect(wrapper.find('[data-test="submitButton"]').exists()).toBeFalsy();
      expect(
        wrapper.find('[data-test="saveAndNextButton"]').exists()
      ).toBeTruthy();
      expect(wrapper.find('[data-test="clearButton"]').exists()).toBeTruthy();
      expect(
        wrapper.find('[data-test="nextQuestionButton"]').exists()
      ).toBeTruthy();

      expect(
        wrapper.find('[data-test="clearButton"]').attributes().disabled
      ).toBeDefined();
      expect(
        wrapper.find('[data-test="saveAndNextButton"]').attributes().disabled
      ).toBeDefined();
    });

    it("clicking on next question button emits continue event", () => {
      wrapper.find('[data-test="nextQuestionButton"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("continue");
    });

    describe("answer selected", () => {
      beforeEach(async () => {
        await wrapper.setProps({
          isSubmitEnabled: true,
        });
      });

      it("enables clear and save & next buttons", () => {
        expect(
          wrapper.find('[data-test="clearButton"]').attributes().disabled
        ).not.toBeDefined();
        expect(
          wrapper.find('[data-test="saveAndNextButton"]').attributes().disabled
        ).not.toBeDefined();
      });

      it("clicking on clear emits clear event", () => {
        wrapper.find('[data-test="clearButton"]').trigger("click");
        expect(wrapper.emitted()).toHaveProperty("clear");
      });

      it("clicking on save & next emits submit and continue events", () => {
        wrapper.find('[data-test="saveAndNextButton"]').trigger("click");
        expect(wrapper.emitted()).toHaveProperty("submit");
        expect(wrapper.emitted()).toHaveProperty("continue");
      });
    });
  });
});
