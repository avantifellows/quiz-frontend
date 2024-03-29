import { flushPromises, mount, shallowMount } from "@vue/test-utils";
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
        questionType: "single-choice",
        imageData: {
          url: "mock",
          alt_text: "mock",
        },
      });
      await flushPromises();
      expect(wrapper.vm.isImageLoading).toBeTruthy();
    });

    it("Check if the Question Index and type is visible", () => {
      const wrapper = mount(Body)
      expect(wrapper.find('[data-test="question-index-type"]').isVisible())
    });

    it("Check if the Question subject and section is visible", () => {
      const wrapper = mount(Body)
      expect(wrapper.find('[data-test="question-subject-section"]').isVisible())
    });
  });

  describe("single-choice questions", () => {
    const options = [
      {
        text: "a",
      },
      {
        text: "",
      },
    ];
    const wrapper = mount(Body, {
      props: {
        options,
      },
    });

    it("renders options", () => {
      expect(wrapper.find('[data-test="option-0"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-2"]').exists()).toBe(false);
      expect(wrapper.find('[data-test="option-0"]').text()).toBe(
        options[0].text
      );
      expect(wrapper.vm.optionInputType).toBe("radio");
    });

    it("set options selected based on draft answer", async () => {
      const draftAnswer = [0];
      await wrapper.setProps({
        draftAnswer,
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

    it("highlights options based on correct/wrong answers for homework", async () => {
      const submittedAnswer = [0];
      const correctAnswer = [1];
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
      });

      expect(
        wrapper.find(`[data-test="optionContainer-1"]`).classes()
      ).toContain("border-green-500");
      expect(
        wrapper.find(`[data-test="optionContainer-0"]`).classes()
      ).toContain("bg-red-500");
    });

    it("highlights options as gray for non-graded questions", async () => {
      const submittedAnswer = [0];
      await wrapper.setProps({
        submittedAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: false,
      });

      expect(
        wrapper.find(`[data-test="optionContainer-0"]`).classes()
      ).toContain("bg-gray-200");
    });

    it("no highlights on selected options for assessments  before quiz submission", async () => {
      const submittedAnswer = [0];
      const correctAnswer = [1];
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
        quizType: "assessment",
      });

      expect(
        wrapper.find(`[data-test="optionContainer-1"]`).classes()
      ).not.toContain("bg-green-500");
      expect(
        wrapper.find(`[data-test="optionContainer-0"]`).classes()
      ).not.toContain("bg-red-500");
      expect(
        wrapper.find(`[data-test="optionContainer-0"]`).classes()
      ).not.toContain("bg-gray-200");
    });
  });

  describe("multi-choice", () => {
    const options = [
      {
        text: "a",
      },
      {
        text: "b",
      },
      {
        text: "c",
      },
    ];
    const wrapper = mount(Body, {
      props: {
        options,
        questionType: "multi-choice",
      },
    });

    it("renders options", () => {
      expect(wrapper.find('[data-test="option-0"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-2"]').exists()).toBe(true);
      expect(wrapper.find('[data-test="option-3"]').exists()).toBe(false);
      expect(wrapper.find('[data-test="option-0"]').text()).toBe(
        options[0].text
      );
      expect(wrapper.vm.optionInputType).toBe("checkbox");
    });

    it("set options selected based on draft answer", async () => {
      const draftAnswer = [1, 2];
      await wrapper.setProps({
        draftAnswer,
      });

      expect(wrapper.vm.isOptionMarked(0)).toBeFalsy();
      expect(wrapper.vm.isOptionMarked(1)).toBeTruthy();
      expect(wrapper.vm.isOptionMarked(2)).toBeTruthy();
    });

    it("selects option text correctly", () => {
      wrapper.find('[data-test="option-0"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("option-selected");
    });

    it("selects option checkbox correctly", () => {
      wrapper.find('[data-test="optionSelector-0"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("option-selected");
    });

    it("highlights options based on correct/wrong answers for homework quizzes", async () => {
      const submittedAnswer = [1, 2];
      const correctAnswer = [0, 1];
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
      });

      expect(
        wrapper.find('[data-test="optionContainer-0"]').classes()
      ).toContain("border-green-500");
      expect(
        wrapper.find('[data-test="optionContainer-1"]').classes()
      ).toContain("bg-green-500");
      expect(
        wrapper.find('[data-test="optionContainer-2"]').classes()
      ).toContain("bg-red-500");
    });

    it("highlights options gray for non-graded questions", async () => {
      const submittedAnswer = [1, 2];
      await wrapper.setProps({
        submittedAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: false,
      });

      expect(
        wrapper.find('[data-test="optionContainer-1"]').classes()
      ).toContain("bg-gray-200");
      expect(
        wrapper.find('[data-test="optionContainer-2"]').classes()
      ).toContain("bg-gray-200");
    });

    it("no highlights for selected options in assessments before quiz submission", async () => {
      const submittedAnswer = [1, 2];
      const correctAnswer = [0, 1];
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
        quizType: "assessment",
      });

      expect(
        wrapper.find('[data-test="optionContainer-0"]').classes()
      ).not.toContain("border-green-500");
      expect(
        wrapper.find('[data-test="optionContainer-1"]').classes()
      ).not.toContain("bg-green-500");
      expect(
        wrapper.find('[data-test="optionContainer-2"]').classes()
      ).not.toContain("bg-red-500");
      expect(
        wrapper.find('[data-test="optionContainer-1"]').classes()
      ).not.toContain("bg-gray-200");
      expect(
        wrapper.find('[data-test="optionContainer-2"]').classes()
      ).not.toContain("bg-gray-200");
    });
  });

  describe("subjective questions", () => {
    const wrapper = mount(Body, {
      props: {
        questionType: "subjective",
      },
    });

    it("should render question with default values", () => {
      expect(
        wrapper.find('[data-test="optionContainer"]').exists()
      ).toBeFalsy();
      expect(
        wrapper.find('[data-test="subjectiveAnswerContainer"]').exists()
      ).toBeTruthy();
    });

    it("renders char limit correctly", async () => {
      // default
      expect(
        wrapper.find('[data-test="charLimitContainer"]').exists()
      ).toBeFalsy();

      // set char limit
      const maxCharLimit = 50;
      await wrapper.setProps({
        maxCharLimit,
      });

      expect(
        wrapper.find('[data-test="charLimitContainer"]').exists()
      ).toBeTruthy();
      expect(wrapper.find('[data-test="charLimit"]').text()).toBe(
        `${String(maxCharLimit)} characters left`
      );

      // add input such that chars left = > 0.2 * maxCharLimit
      const value = "thetest";
      await wrapper
        .find('[data-test="subjectiveAnswer"]')
        .find('[data-test="input"]')
        .setValue(value);
      expect(wrapper.vm.charactersLeft).toBe(maxCharLimit - value.length);
      expect(wrapper.vm.maxCharLimitClass).toBe("text-gray-400");

      // add input such that chars left = < 0.2 * maxCharLimit, > 0.1 * charLimit
      await wrapper
        .find('[data-test="subjectiveAnswer"]')
        .find('[data-test="input"]')
        .setValue("thetestthetestthetestthetestthetestthetest");
      expect(wrapper.vm.maxCharLimitClass).toBe("text-yellow-500");

      // add input such that chars left = < 0.1 * maxCharLimit
      await wrapper
        .find('[data-test="subjectiveAnswer"]')
        .find('[data-test="input"]')
        .setValue("thetestthetestthetestthetestthetestthetestthetest");
      expect(wrapper.vm.maxCharLimitClass).toBe("text-red-400");
    });

    it("renders disabled answer input field when answer submitted", async () => {
      await wrapper.setProps({
        isAnswerSubmitted: true,
      });

      expect(
        (
          wrapper
            .find('[data-test="subjectiveAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).disabled
      ).toBe(true);

      await wrapper.setProps({
        isAnswerSubmitted: false,
      });
    });

    it("displays the answer when default answer given", async () => {
      const draftAnswer = "abc";
      const wrapper = mount(Body, {
        props: {
          questionType: "subjective",
          draftAnswer,
        },
      });

      expect(
        (
          wrapper
            .find('[data-test="subjectiveAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).value
      ).toBe(draftAnswer);
    });

    it("displays the answer when submitted answer given", async () => {
      const submittedAnswer = "abc";
      const wrapper = mount(Body, {
        props: {
          questionType: "subjective",
          submittedAnswer,
        },
      });

      expect(
        (
          wrapper
            .find('[data-test="subjectiveAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).value
      ).toBe(submittedAnswer);
    });

    it("updates the answer through the input field", async () => {
      const value = "test";
      await wrapper
        .find('[data-test="subjectiveAnswer"]')
        .find('[data-test="input"]')
        .setValue(value);

      expect(wrapper.vm.subjectiveAnswer).toBe(value);
    });

    it("corrects the answer when it exceeds the max char limit", async () => {
      const maxCharLimit = 10;
      await wrapper.setProps({
        maxCharLimit,
      });

      const value = "thetestthetest";
      await wrapper
        .find('[data-test="subjectiveAnswer"]')
        .find('[data-test="input"]')
        .setValue(value);
      expect(wrapper.vm.subjectiveAnswer).toBe(value.slice(0, maxCharLimit));
    });

    it("shows correct answer when quiz has ended", async () => {
      await wrapper.setProps({
        isAnswerSubmitted: true,
        correctAnswer: "Answer",
        hasQuizEnded: true
      });

      expect(wrapper.find('[data-test="subjectiveCorrectAnswer"').text())
        .toBe("Correct Answer: Answer")
    })
  });
  describe("numerical integer questions", () => {
    const wrapper = mount(Body, {
      props: {
        questionType: "numerical-integer",
      },
    });

    it("should render question with default values", () => {
      expect(
        wrapper.find('[data-test="optionContainer"]').exists()
      ).toBeFalsy();
      expect(
        wrapper.find('[data-test="numericalAnswerContainer"]').exists()
      ).toBeTruthy();
    });

    it("renders disabled answer input field when answer submitted", async () => {
      await wrapper.setProps({
        isAnswerSubmitted: true,
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).disabled
      ).toBe(true);

      await wrapper.setProps({
        isAnswerSubmitted: false,
      });
    });

    it("displays the answer when default answer given", async () => {
      const draftAnswer = 9;
      const wrapper = mount(Body, {
        props: {
          questionType: "numerical-integer",
          draftAnswer,
        },
      });

      expect(
        Number(
          (
            wrapper
              .find('[data-test="numericalAnswer"]')
              .find('[data-test="input"]').element as HTMLInputElement
          ).value
        )
      ).toBe(draftAnswer);
    });

    it("displays the answer when submitted answer given", async () => {
      const submittedAnswer = 7;
      const wrapper = mount(Body, {
        props: {
          questionType: "numerical-integer",
          submittedAnswer,
        },
      });

      expect(
        Number(
          (
            wrapper
              .find('[data-test="numericalAnswer"]')
              .find('[data-test="input"]').element as HTMLInputElement
          ).value
        )
      ).toBe(submittedAnswer);
    });

    it("updates the answer through the input field", async () => {
      const value = 9;
      await wrapper
        .find('[data-test="numericalAnswer"]')
        .find('[data-test="input"]')
        .setValue(value);

      expect(Number(wrapper.vm.numericalAnswer)).toBe(value);
    });

    it("emits an update when numerical value is entered, with value as payload", async () => {
      const value = 9;
      await wrapper
        .find('[data-test="numericalAnswer"]')
        .find('[data-test="input"]')
        .setValue(value);
      const emitted = wrapper.emitted()
      expect(emitted["numerical-answer-entered"].length).toBe(1)
      expect(emitted["numerical-answer-entered"][0]).toEqual([9])
    })

    it("emits an update when empty string is entered, with null as payload", async () => {
      const value = "";
      await wrapper
        .find('[data-test="numericalAnswer"]')
        .find('[data-test="input"]')
        .setValue(value);
      const emitted = wrapper.emitted()
      expect(emitted["numerical-answer-entered"].length).toBe(2) // accounts for previous emit of value 9 to be removed
      expect(emitted["numerical-answer-entered"][1]).toEqual([null])
    })

    it("shows correct answer when quiz has ended", async () => {
      await wrapper.setProps({
        isAnswerSubmitted: true,
        correctAnswer: 10,
        hasQuizEnded: true
      });

      expect(wrapper.find('[data-test="numericalCorrectAnswer"').text())
        .toBe("Correct Answer: 10")
    })

    it("highlights correct/wrong answer for homework quizzes", async () => {
      let submittedAnswer = 7;
      let correctAnswer = 8;
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: true,
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("text-red-500 border-red-400");

      submittedAnswer = 7;
      correctAnswer = 7;
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: true,
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("text-green-500 border-green-500");

      submittedAnswer = 9;
      await wrapper.setProps({
        submittedAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: false,
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("bg-gray-100");
    });

    it("highlights answer gray for assessment quizzes if quiz has ended", async () => {
      let submittedAnswer = 7;
      let correctAnswer = 8;
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: true,
        hasQuizEnded: true,
        quizType: "assessment",
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("text-red-500 border-red-400");

      submittedAnswer = 7;
      correctAnswer = 7;
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: true,
        quizType: "assessment",
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("text-green-500 border-green-500");

      submittedAnswer = 9;
      await wrapper.setProps({
        submittedAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: false,
        quizType: "assessment",
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("bg-gray-100");
    });

    it("highlights answer gray for assessment quizzes if quiz has not ended", async () => {
      await wrapper.setProps({
        isAnswerSubmitted: true,
        isGradedQuestion: true,
        hasQuizEnded: false,
        quizType: "assessment",
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("border-gray-200");
    });
  });

  describe("numerical float questions", () => {
    const wrapper = mount(Body, {
      props: {
        questionType: "numerical-float",
      },
    });

    it("should render question with default values", () => {
      expect(
        wrapper.find('[data-test="optionContainer"]').exists()
      ).toBeFalsy();
      expect(
        wrapper.find('[data-test="numericalAnswerContainer"]').exists()
      ).toBeTruthy();
    });

    it("renders disabled answer input field when answer submitted", async () => {
      await wrapper.setProps({
        isAnswerSubmitted: true,
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).disabled
      ).toBe(true);

      await wrapper.setProps({
        isAnswerSubmitted: false,
      });
    });

    it("displays the answer when default answer given", async () => {
      const draftAnswer = 7.9;
      const wrapper = mount(Body, {
        props: {
          questionType: "numerical-float",
          draftAnswer,
        },
      });

      expect(
        Number(
          (
            wrapper
              .find('[data-test="numericalAnswer"]')
              .find('[data-test="input"]').element as HTMLInputElement
          ).value
        )
      ).toBe(draftAnswer);
    });

    it("displays the answer when submitted answer given", async () => {
      const submittedAnswer = 7.9;
      const wrapper = mount(Body, {
        props: {
          questionType: "numerical-float",
          submittedAnswer,
        },
      });

      expect(
        Number(
          (
            wrapper
              .find('[data-test="numericalAnswer"]')
              .find('[data-test="input"]').element as HTMLInputElement
          ).value
        )
      ).toBe(submittedAnswer);
    });

    it("updates the answer through the input field", async () => {
      const value = 9.9;
      await wrapper
        .find('[data-test="numericalAnswer"]')
        .find('[data-test="input"]')
        .setValue(value);

      expect(Number(wrapper.vm.numericalAnswer)).toBe(value);
    });

    it("highlights correct/wrong answer for homework quizzes", async () => {
      let submittedAnswer = 7.9;
      let correctAnswer = 8.9;
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: true,
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("text-red-500 border-red-400");

      submittedAnswer = 7.9;
      correctAnswer = 7.9;
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: true,
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("text-green-500 border-green-500");

      submittedAnswer = 9.8;
      await wrapper.setProps({
        submittedAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: false,
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("bg-gray-100");
    });

    it("highlights answer gray for assessment quizzes if quiz has ended", async () => {
      let submittedAnswer = 7.9;
      let correctAnswer = 8.9;
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: true,
        hasQuizEnded: true,
        quizType: "assessment",
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("text-red-500 border-red-400");

      submittedAnswer = 7.8;
      correctAnswer = 7.8;
      await wrapper.setProps({
        submittedAnswer,
        correctAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: true,
        quizType: "assessment",
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("text-green-500 border-green-500");

      submittedAnswer = 9.9;
      await wrapper.setProps({
        submittedAnswer,
        isAnswerSubmitted: true,
        isGradedQuestion: false,
        quizType: "assessment",
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("bg-gray-100");
    });

    it("highlights answer gray for assessment quizzes if quiz has not ended", async () => {
      await wrapper.setProps({
        isAnswerSubmitted: true,
        isGradedQuestion: true,
        hasQuizEnded: false,
        quizType: "assessment",
      });

      expect(
        (
          wrapper
            .find('[data-test="numericalAnswer"]')
            .find('[data-test="input"]').element as HTMLInputElement
        ).className
      ).toContain("border-gray-200");
    });
  });
});
