import { flushPromises, mount } from "@vue/test-utils";
import { Question, SubmittedResponse } from "@/types";
import QuestionModal from "@/components/Questions/QuestionModal.vue";

const clonedeep = require("lodash.clonedeep");

describe("QuestionModal.vue", () => {
  const questions = [
    {
      _id: "1234",
      type: "single-choice",
      text: "abcd",
      options: [
        {
          text: "option 1",
        },
        {
          text: "option 2",
        },
      ],
      correct_answer: [0],
      image: null,
      graded: true,
      max_char_limit: null,
    },
    {
      _id: "1235",
      type: "multi-choice",
      text: "efgh",
      options: [
        {
          text: "option 1",
        },
        {
          text: "option 2",
        },
        {
          text: "op3",
        },
        {
          text: "option 4",
        },
      ],
      correct_answer: [2, 3],
      image: null,
      graded: false,
      max_char_limit: null,
    },
    {
      _id: "1236",
      type: "subjective",
      text: "yolo",
      options: null,
      correct_answer: null,
      image: null,
      graded: true,
      max_char_limit: 100,
    },
    {
      _id: "1239",
      type: "subjective",
      text: "yolo",
      options: null,
      correct_answer: null,
      image: null,
      graded: false,
      max_char_limit: 100,
    },
    {
      _id: "1240",
      type: "numerical-integer",
      text: "yolo",
      options: null,
      correct_answer: 7,
      image: null,
      graded: true,
      max_char_limit: null,
    },
    {
      _id: "1241",
      type: "numerical-float",
      text: "yolo",
      options: null,
      correct_answer: 7.9,
      image: null,
      graded: false,
      max_char_limit: null,
    },
  ] as Question[];

  const responses: SubmittedResponse[] = [];
  questions.forEach((question, index) =>
    responses.push({
      _id: index.toString(),
      question_id: question._id,
      answer: null,
      visited: false,
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
        questions,
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

    describe("Assessments", () => {
      beforeEach(async () => {
        await wrapper.setProps({
          quizType: "assessment",
        });
      });
      it("sets question index to number of questions upon end test", async () => {
        wrapper.find('[data-test="endTestButton"]').trigger("click");
        expect(wrapper.vm.localCurrentQuestionIndex).toBe(questions.length);
      });
      it("does not increment question index when save & next button is clicked for last question", () => {
        for (let index = 0; index < questions.length - 1; index++) {
          wrapper.find('[data-test="nextQuestionButton"]').trigger("click");
        }
        // ensure that the last question has been reached
        expect(wrapper.vm.localCurrentQuestionIndex).toBe(questions.length - 1);

        wrapper.find('[data-test="saveAndNextButton"]').trigger("click");
        // the question index should not have been updated
        expect(wrapper.vm.localCurrentQuestionIndex).toBe(questions.length - 1);
      });
      it("navigates to question when navigate emitted from body", () => {
        const questionIndex = 2;
        wrapper.vm.$refs.body.$emit("navigate", questionIndex);
        expect(wrapper.vm.localCurrentQuestionIndex).toBe(questionIndex);
      });
      describe("Sets question states correctly", () => {
        describe("Quiz in-progress", () => {
          it("Without having visited", () => {
            expect(wrapper.vm.questionStates.length).toBe(3);
            expect(wrapper.vm.questionStates[0]).toEqual({
              index: 0,
              value: "neutral",
            });
            expect(wrapper.vm.questionStates[1]).toEqual({
              index: 2,
              value: "neutral",
            });
          });

          it("Having visited but not answered", async () => {
            const visitedResponses = clonedeep(responses);
            visitedResponses[2].visited = true;
            await wrapper.setProps({
              responses: visitedResponses,
            });
            expect(wrapper.vm.questionStates[1]).toEqual({
              index: 2,
              value: "error",
            });
          });

          it("Having answered", async () => {
            const visitedResponses = clonedeep(responses);
            visitedResponses[0].visited = true;
            visitedResponses[0].answer = [0];
            await wrapper.setProps({
              responses: visitedResponses,
            });
            expect(wrapper.vm.questionStates[0]).toEqual({
              index: 0,
              value: "success",
            });
          });
        });

        describe("Quiz ended", () => {
          beforeEach(async () => {
            await wrapper.setProps({
              hasQuizEnded: true,
            });
          });
          it("Skipped Questions", () => {
            expect(wrapper.vm.questionStates.length).toBe(3);
            expect(wrapper.vm.questionStates[0]).toEqual({
              index: 0,
              value: "neutral",
            });
            expect(wrapper.vm.questionStates[1]).toEqual({
              index: 2,
              value: "neutral",
            });
          });

          it("Wrongly answered", async () => {
            const visitedResponses = clonedeep(responses);
            visitedResponses[0].answer = [1];
            await wrapper.setProps({
              responses: visitedResponses,
            });
            expect(wrapper.vm.questionStates[0]).toEqual({
              index: 0,
              value: "error",
            });
          });

          it("Correctly answered - single choice", async () => {
            const visitedResponses = clonedeep(responses);
            visitedResponses[0].answer = [0];
            await wrapper.setProps({
              responses: visitedResponses,
            });
            expect(wrapper.vm.questionStates[0]).toEqual({
              index: 0,
              value: "success",
            });
          });

          it("Correctly answered - multi choice", async () => {
            const newQuestions = clonedeep(questions);
            newQuestions[1].graded = true;

            const visitedResponses = clonedeep(responses);
            visitedResponses[1].answer = [2, 3];
            await wrapper.setProps({
              questions: newQuestions,
              responses: visitedResponses,
            });
            expect(wrapper.vm.questionStates[1]).toEqual({
              index: 1,
              value: "success",
            });
          });

          it("Correctly answered - single choice", async () => {
            const visitedResponses = clonedeep(responses);
            visitedResponses[2].answer = "abcd";
            await wrapper.setProps({
              responses: visitedResponses,
            });
            expect(wrapper.vm.questionStates[1]).toEqual({
              index: 2,
              value: "success",
            });
          });
        });
      });
    });
  });

  describe("single-choice questions", () => {
    const questionIndex = 0;
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
        expect(wrapper.vm.localResponses[questionIndex]).toEqual({
          _id: `${questionIndex}`,
          question_id: questions[questionIndex]._id,
          answer: [0],
          visited: false,
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

    describe("assessments", () => {
      beforeEach(async () => {
        await wrapper.setProps({
          quizType: "assessment",
        });
      });
      it("clears selected answer on clicking Clear", async () => {
        // select an option
        wrapper
          .find('[data-test="body"]')
          .find('[data-test="option-0"]')
          .trigger("click");

        wrapper.find('[data-test="clearButton"]').trigger("click");

        expect(
          wrapper
            .find('[data-test="body"]')
            .find('[data-test="optionSelector-0"]').checked
        ).toBeFalsy();
      });
    });
  });

  describe("multi-choice questions", () => {
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
          _id: `${questionIndex}`,
          question_id: questions[questionIndex]._id,
          answer: [0, 1],
          visited: false,
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

    describe("assessments", () => {
      beforeEach(async () => {
        await wrapper.setProps({
          quizType: "assessment",
        });
      });
      it("clears selected answer on clicking Clear", async () => {
        // select an option
        await wrapper.find('[data-test="option-0"]').trigger("click");
        // select another option
        await wrapper.find('[data-test="option-1"]').trigger("click");

        wrapper.find('[data-test="clearButton"]').trigger("click");

        expect(
          wrapper
            .find('[data-test="body"]')
            .find('[data-test="optionSelector-0"]').checked
        ).toBeFalsy();
        expect(
          wrapper
            .find('[data-test="body"]')
            .find('[data-test="optionSelector-1"]').checked
        ).toBeFalsy();
      });
    });
  });

  describe("subjective questions", () => {
    const questionIndex = 2;

    beforeEach(() => mountWrapper({ currentQuestionIndex: questionIndex }));

    it("entering answer makes answer valid", async () => {
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper.find('[data-test="input"]').setValue("abcd");

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });

    describe("Homework", () => {
      describe("submits question", () => {
        const answer = "abcd";
        beforeEach(async () => {
          // enter answer
          await wrapper.find('[data-test="input"]').setValue(answer);

          // submit the answer
          wrapper
            .find('[data-test="footer"]')
            .find('[data-test="submitButton"]')
            .trigger("click");
        });

        it("responses have been updated", () => {
          expect(wrapper.vm.localResponses[questionIndex]).toEqual({
            _id: `${questionIndex}`,
            question_id: questions[questionIndex]._id,
            answer,
            visited: false,
          });
          expect(wrapper.emitted()).toHaveProperty("submit-question");
        });

        it("proceeds with question on answering", () => {
          wrapper
            .find('[data-test="footer"]')
            .find('[data-test="submitButton"]')
            .trigger("click");

          expect(wrapper.vm.localCurrentQuestionIndex).toBe(3);
        });
      });
    });

    describe("Assessments", () => {
      beforeEach(async () => {
        await wrapper.setProps({
          quizType: "assessment",
        });
      });
      it("removes gray background from selected answer upon clicking on Clear", async () => {
        // enter answer
        const answer = "abcd";
        await wrapper.find('[data-test="input"]').setValue(answer);

        // submit the answer
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="saveAndNextButton"]')
          .trigger("click");

        // go back to the previous question
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="previousQuestionButton"]')
          .trigger("click");

        // clear the answer
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="clearButton"]')
          .trigger("click");

        // move to next question
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="nextQuestionButton"]')
          .trigger("click");

        // go back to the previous question
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="previousQuestionButton"]')
          .trigger("click");

        // the answer should still be there since we didn't save after clearing
        expect(wrapper.find('[data-test="input"]').element.value).toBe(answer);
      });
    });
  });

  describe("numerical questions", () => {
    const questionIndex = 4;

    beforeEach(() => mountWrapper({ currentQuestionIndex: questionIndex }));

    it("entering answer makes answer valid", async () => {
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper.find('[data-test="input"]').setValue(9);

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });

    describe("Homework", () => {
      describe("submits question", () => {
        const answer = 9;
        beforeEach(async () => {
          // enter answer
          await wrapper.find('[data-test="input"]').setValue(answer);

          // submit the answer
          wrapper
            .find('[data-test="footer"]')
            .find('[data-test="submitButton"]')
            .trigger("click");
        });

        it("responses have been updated", () => {
          expect(wrapper.vm.localResponses[questionIndex]).toEqual({
            _id: `${questionIndex}`,
            question_id: questions[questionIndex]._id,
            answer,
            visited: false,
          });
          expect(wrapper.emitted()).toHaveProperty("submit-question");
        });

        it("proceeds with question on answering", () => {
          wrapper
            .find('[data-test="footer"]')
            .find('[data-test="submitButton"]')
            .trigger("click");

          expect(wrapper.vm.localCurrentQuestionIndex).toBe(5);
        });
      });
    });

    describe("Assessments", () => {
      beforeEach(async () => {
        await wrapper.setProps({
          quizType: "assessment",
        });
      });

      it("removes gray background from selected answer upon clicking on Clear", async () => {
        // enter answer
        const answer = 7;
        await wrapper.find('[data-test="input"]').setValue(answer);

        // submit the answer
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="saveAndNextButton"]')
          .trigger("click");

        // go back to the previous question
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="previousQuestionButton"]')
          .trigger("click");

        // clear the answer
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="clearButton"]')
          .trigger("click");

        // move to next question
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="nextQuestionButton"]')
          .trigger("click");

        // go back to the previous question
        wrapper
          .find('[data-test="footer"]')
          .find('[data-test="previousQuestionButton"]')
          .trigger("click");

        // the answer should still be there since we didn't save after clearing
        expect(Number(wrapper.find('[data-test="input"]').element.value)).toBe(
          answer
        );
      });
    });
  });
});
