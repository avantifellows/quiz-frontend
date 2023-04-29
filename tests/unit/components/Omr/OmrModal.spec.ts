import { flushPromises, mount } from "@vue/test-utils";
import { Question, QuestionSetIndexLimits, SubmittedResponse } from "@/types";
import OmrModal from "@/components/Omr/OmrModal.vue";
import { createQuestionBuckets } from "@/services/Functional/Utilities";

const clonedeep = require("lodash.clonedeep");

describe("OmrModal.vue", () => {
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
      question_set_id: "777",
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
      question_set_id: "777",
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
      question_set_id: "777",
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
      question_set_id: "777",
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
      question_set_id: "777",
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
      question_set_id: "777",
    },
    {
      _id: "1111",
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
      graded: true,
      max_char_limit: null,
      question_set_id: "777",
    },
    {
      _id: "2222",
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
      graded: true,
      max_char_limit: null,
      question_set_id: "777",
    },
    {
      _id: "3333",
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
      graded: true,
      max_char_limit: null,
      question_set_id: "777",
    },
    {
      _id: "3333",
      type: "multi-choice",
      text: null,
      options: null,
      image: null,
      max_char_limit: null,
      graded: true,
      correct_answer: [2, 3],
      question_set_id: "777"
    },
    {
      _id: "3333",
      type: "multi-choice",
      text: null,
      options: null,
      image: null,
      max_char_limit: null,
      graded: true,
      correct_answer: [2, 3],
      question_set_id: "777",
    },
    {
      _id: "3333",
      type: "multi-choice",
      text: null,
      options: null,
      image: null,
      max_char_limit: null,
      graded: true,
      correct_answer: [2, 3],
      question_set_id: "777",
    },
    {
      _id: "3333",
      type: "multi-choice",
      text: null,
      options: null,
      image: null,
      max_char_limit: null,
      graded: true,
      correct_answer: [2, 3],
      question_set_id: "777",
    },
  ] as Question[];

  const questionStates0 = [];

  for (let i = 0; i < 13; i++) {
    questionStates0.push({
      index: i,
      value: "neutral",
    });
  }

  const testQuestionSetStates = [
    {
      title: "Question Set 0",
      paletteItems: questionStates0,
      instructionText: "You may attempt all questions",
      maxQuestionsAllowedToAttempt: 13,
    },
  ];

  const responses: SubmittedResponse[] = [];
  questions.forEach((question, index) =>
    responses.push({
      _id: index.toString(),
      question_id: question._id,
      answer: null,
      visited: false,
    })
  );

  const qsetTestIndexLimits = {
    low: 0,
    high: questions.length
  } as QuestionSetIndexLimits;

  let wrapper: any;
  const mountWrapper = async (
    params = {
      currentQuestionIndex: 0,
      maxQuestionsAllowedToAttempt: questions.length,
    }
  ) => {
    if (wrapper != undefined) wrapper.unmount();

    createQuestionBuckets([questions.length]);

    wrapper = mount(OmrModal, {
      props: {
        questions,
        responses: clonedeep(responses),
        quizType: "omr-assessment",
        currentQuestionIndex: params.currentQuestionIndex,
        maxQuestionsAllowedToAttempt: params.maxQuestionsAllowedToAttempt,
        qsetIndexLimits: qsetTestIndexLimits,
        questionSetStates: testQuestionSetStates,
        isOmrMode: true,
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

    describe("OMR Assessments", () => {
      it("sets question index to number of questions upon end test", async () => {
        wrapper.find('[data-test="endTestButton"]').trigger("click");
        wrapper.find('[data-test="endTestButton"]').trigger("click"); // adding additional click to protect endTest button
        expect(wrapper.vm.localCurrentQuestionIndex).toBe(questions.length);
      });
    });
  });

  describe("single-choice questions", () => {
    const questionIndex = 0;
    it("selecting option makes answer valid", async () => {
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper
        .find('[data-test="OmrItem-0"]')
        .find('[data-test="optionSelector-0"]').trigger("click");

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });

    describe("submits omr question", () => {
      beforeEach(async () => {
        await mountWrapper();

        // select an option
        wrapper
          .find('[data-test="OmrItem-0"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        await flushPromises();
      });

      it("responses have been updated", () => {
        expect(wrapper.vm.localResponses[questionIndex]).toEqual({
          _id: `${questionIndex}`,
          question_id: questions[questionIndex]._id,
          answer: [0],
          visited: false,
        });
        expect(wrapper.emitted()).toHaveProperty("submit-omr-question");
      });
    });

    describe("omr assessments", () => {
      it("clears selected answer on clicking answer again", async () => {
        // select an option
        await wrapper
          .find('[data-test="OmrItem-0"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        // select same option again
        await wrapper
          .find('[data-test="OmrItem-0"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        expect(
          await wrapper
            .find('[data-test="OmrItem-0"]')
            .find('[data-test="optionSelector-0"]').checked
        ).toBeFalsy();
      });
    });
  });

  describe("multi-choice questions", () => {
    const questionIndex = 1;

    beforeEach(() => mountWrapper({
      currentQuestionIndex: questionIndex,
      maxQuestionsAllowedToAttempt: questions.length
    }));

    it("unselecting all options makes the answer invalid", async () => {
      // select an option
      await wrapper.find('[data-test="OmrItem-1"]')
        .find('[data-test="optionSelector-0"]')
        .trigger("click");

      // select another option
      await wrapper.find('[data-test="OmrItem-1"]')
        .find('[data-test="optionSelector-1"]')
        .trigger("click");

      // unselect an option
      await wrapper.find('[data-test="OmrItem-1"]')
        .find('[data-test="optionSelector-0"]')
        .trigger("click");

      // the answer should still be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();

      // unselect the other option
      await wrapper.find('[data-test="OmrItem-1"]')
        .find('[data-test="optionSelector-1"]')
        .trigger("click");

      // the answer should now be invalid
      expect(await wrapper.vm.isAttemptValid).toBeFalsy();
    });

    describe("submits omr question", () => {
      beforeEach(async () => {
        await mountWrapper({
          currentQuestionIndex: questionIndex,
          maxQuestionsAllowedToAttempt: questions.length
        });

        // select an option
        await wrapper.find('[data-test="OmrItem-1"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        // select another option
        await wrapper.find('[data-test="OmrItem-1"]')
          .find('[data-test="optionSelector-1"]')
          .trigger("click");

        await flushPromises();
      });

      it("responses have been updated", () => {
        expect(wrapper.vm.localResponses[questionIndex]).toEqual({
          _id: `${questionIndex}`,
          question_id: questions[questionIndex]._id,
          answer: [0, 1],
          visited: false,
        });
        expect(wrapper.emitted()).toHaveProperty("submit-omr-question");
      });
    });
  });

  describe("subjective questions", () => {
    const questionIndex = 2;

    beforeEach(() => mountWrapper({
      currentQuestionIndex: questionIndex,
      maxQuestionsAllowedToAttempt: questions.length
    }));

    it("entering answer makes answer valid", async () => {
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper.find('[data-test="OmrItem-2"]')
        .find('[data-test="input"]').setValue("abcd");

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });
  });

  describe("numerical questions", () => {
    const questionIndex = 4;

    beforeEach(() => mountWrapper({
      currentQuestionIndex: questionIndex,
      maxQuestionsAllowedToAttempt: questions.length
    }));

    it("entering answer makes answer valid", async () => {
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper.find('[data-test="OmrItem-3"]')
        .find('[data-test="input"]').setValue(9);

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });
  });
});
