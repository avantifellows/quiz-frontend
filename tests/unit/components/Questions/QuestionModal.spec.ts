import { flushPromises, mount } from "@vue/test-utils";
import { Question, SubmittedResponse } from "@/types";
import QuestionModal from "@/components/Questions/QuestionModal.vue";

let clonedeep = require("lodash.clonedeep");

describe("ItemModal.vue", () => {
  const questions = [
    {
      type: "mcq",
      text: "abcd",
      options: ["option 1", "option 2"],
      correct_answer: [0],
      image: null,
      survey: false,
      max_char_limit: null,
    },
    {
      type: "checkbox",
      text: "efgh",
      options: ["option 1", "option 2", "op3", "option 4"],
      correct_answer: [2, 3],
      image: null,
      survey: false,
      max_char_limit: null,
    },
    {
      type: "checkbox",
      text: "ijkl",
      options: ["", "", ""],
      correct_answer: [0, 1],
      image: {
        url: "https://plio-prod-assets.s3.ap-south-1.amazonaws.com/images/afbxudrmbl.png",
        alt_text: "some image",
      },
      survey: true,
      max_char_limit: null,
    },
  ] as Question[];

  let responses: SubmittedResponse[] = [];
  questions.forEach(() =>
    responses.push({
      answer: null,
    })
  );

  let wrapper: any;
  const mountWrapper = async (
    params = {
      currentQuestionIndex: 0,
    }
  ) => {
    if (wrapper != undefined) wrapper.unmount();
    wrapper = mount(QuestionModal, {
      props: {
        questions: questions,
        responses: clonedeep(responses),
        currentQuestionIndex: params.currentQuestionIndex,
      },
    });
  };

  beforeEach(() => mountWrapper());

  it("should render with required values", () => {
    expect(wrapper).toBeTruthy();
  });

  describe("basic checks", () => {
    it("should prepare draft responses for each question", () => {
      expect(wrapper.vm.draftResponses.length).toBe(questions.length);
    });

    it("moves to previous question when previous button clicked", async () => {
      await wrapper.setProps({
        currentQuestionIndex: 1,
      });
      wrapper
        .find('[data-test="footer"]')
        .find('[data-test="previousQuestionButton"]')
        .trigger("click");

      expect(wrapper.vm.localCurrentQuestionIndex).toBe(0);
    });
  });

  describe("mcq questions", () => {
    it("selecting option makes answer valid", async () => {
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper.find('[data-test="option-0"]').trigger("click");

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });

    describe("submits question", () => {
      beforeEach(async () => {
        await mountWrapper();

        // select an option
        wrapper
          .find('[data-test="body"]')
          .find('[data-test="option-0"]')
          .trigger("click");

        await flushPromises();

        // submit the answer
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="submitButton"]')
          .trigger("click");
      });

      it("responses have been updated", () => {
        expect(wrapper.vm.localResponses[0]).toEqual({
          answer: [0],
        });
        expect(wrapper.emitted()).toHaveProperty("submit-question");
      });

      it("proceeds with question on answering", () => {
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="submitButton"]')
          .trigger("click");

        expect(wrapper.vm.localCurrentQuestionIndex).toBe(1);
      });
    });
  });

  describe("checkbox questions", () => {
    const questionIndex = 1;

    beforeEach(() => mountWrapper({ currentQuestionIndex: questionIndex }));

    it("selecting option makes answer valid", async () => {
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper.find('[data-test="option-0"]').trigger("click");

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });

    it("unselecting all options makes the answer invalid", async () => {
      // select an option
      await wrapper.find('[data-test="option-0"]').trigger("click");
      // select another option
      await wrapper.find('[data-test="option-1"]').trigger("click");

      // unselect an option
      await wrapper.find('[data-test="option-0"]').trigger("click");
      // the answer should still be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();

      // unselect the other option
      await wrapper.find('[data-test="option-1"]').trigger("click");
      // the answer should now be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();
    });

    describe("submits question", () => {
      beforeEach(async () => {
        await mountWrapper({ currentQuestionIndex: questionIndex });

        // select options
        const body = wrapper.find('[data-test="body"]');
        await body.find('[data-test="optionSelector-0"]').trigger("click");
        await body.find('[data-test="optionSelector-1"]').trigger("click");

        await flushPromises();

        // submit the answer
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="submitButton"]')
          .trigger("click");
      });

      it("responses have been updated", () => {
        expect(wrapper.vm.localResponses[questionIndex]).toEqual({
          answer: [0, 1],
        });
        expect(wrapper.emitted()).toHaveProperty("submit-question");
      });

      it("proceeds with question on answering", () => {
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="submitButton"]')
          .trigger("click");

        expect(wrapper.vm.localCurrentQuestionIndex).toBe(2);
      });
    });
  });
});