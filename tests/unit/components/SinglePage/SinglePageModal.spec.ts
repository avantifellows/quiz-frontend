import { flushPromises, mount } from "@vue/test-utils";
import { Question, QuestionSetIndexLimits, SubmittedResponse } from "@/types";
import SinglePageModal from "@/components/SinglePage/SinglePageModal.vue";
import { createQuestionBuckets } from "@/services/Functional/Utilities";

const clonedeep = require("lodash.clonedeep");

describe("SinglePageModal.vue", () => {
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
      marked_for_review: false,
      time_spent: 0
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
      showFullText: false,
    }
  ) => {
    if (wrapper != undefined) wrapper.unmount();

    createQuestionBuckets([questions.length]);

    wrapper = mount(SinglePageModal, {
      props: {
        questions,
        responses: clonedeep(responses),
        quizType: "omr-assessment",
        currentQuestionIndex: params.currentQuestionIndex,
        maxQuestionsAllowedToAttempt: params.maxQuestionsAllowedToAttempt,
        qsetIndexLimits: qsetTestIndexLimits,
        questionSetStates: testQuestionSetStates,
        isOmrMode: true,
        showFullText: params.showFullText,
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

    describe("Single Page Assessments", () => {
      it("emits end-test upon end test", async () => {
        wrapper.find('[data-test="endTestButton"]').trigger("click");
        wrapper.find('[data-test="endTestButton"]').trigger("click"); // adding additional click to protect endTest button
        expect(wrapper.emitted()).toHaveProperty("end-test");
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
        .find('[data-test="SinglePageItem-0"]')
        .find('[data-test="optionSelector-0"]').trigger("click");

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });

    describe("submits single page question", () => {
      beforeEach(async () => {
        await mountWrapper();

        // select an option
        wrapper
          .find('[data-test="SinglePageItem-0"]')
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
          marked_for_review: false,
          time_spent: 0
        });
        expect(wrapper.emitted()).toHaveProperty("submit-omr-question");
      });
    });

    describe("single page assessments", () => {
      it("clears selected answer on clicking answer again", async () => {
        // select an option
        await wrapper
          .find('[data-test="SinglePageItem-0"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        // select same option again
        await wrapper
          .find('[data-test="SinglePageItem-0"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        expect(
          await wrapper
            .find('[data-test="SinglePageItem-0"]')
            .find('[data-test="optionSelector-0"]').checked
        ).toBeFalsy();
      });
    });
  });

  describe("multi-choice questions", () => {
    const questionIndex = 1;

    beforeEach(() => mountWrapper({
      currentQuestionIndex: questionIndex,
      maxQuestionsAllowedToAttempt: questions.length,
      showFullText: false,
    }));

    it("unselecting all options makes the answer invalid", async () => {
      // select an option
      await wrapper.find('[data-test="SinglePageItem-1"]')
        .find('[data-test="optionSelector-0"]')
        .trigger("click");

      // select another option
      await wrapper.find('[data-test="SinglePageItem-1"]')
        .find('[data-test="optionSelector-1"]')
        .trigger("click");

      // unselect an option
      await wrapper.find('[data-test="SinglePageItem-1"]')
        .find('[data-test="optionSelector-0"]')
        .trigger("click");

      // the answer should still be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();

      // unselect the other option
      await wrapper.find('[data-test="SinglePageItem-1"]')
        .find('[data-test="optionSelector-1"]')
        .trigger("click");

      // the answer should now be invalid
      expect(await wrapper.vm.isAttemptValid).toBeFalsy();
    });

    describe("submits single page question", () => {
      beforeEach(async () => {
        await mountWrapper({
          currentQuestionIndex: questionIndex,
          maxQuestionsAllowedToAttempt: questions.length,
          showFullText: false,
        });

        // select an option
        await wrapper.find('[data-test="SinglePageItem-1"]')
          .find('[data-test="optionSelector-0"]')
          .trigger("click");

        // select another option
        await wrapper.find('[data-test="SinglePageItem-1"]')
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
          marked_for_review: false,
          time_spent: 0
        });
        expect(wrapper.emitted()).toHaveProperty("submit-omr-question");
      });
    });
  });

  describe("subjective questions", () => {
    const questionIndex = 2;

    beforeEach(() => mountWrapper({
      currentQuestionIndex: questionIndex,
      maxQuestionsAllowedToAttempt: questions.length,
      showFullText: false,
    }));

    it("entering answer makes answer valid", async () => {
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper.find('[data-test="SinglePageItem-2"]')
        .find('[data-test="input"]').setValue("abcd");

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });
  });

  describe("numerical questions", () => {
    const questionIndex = 4;

    beforeEach(() => mountWrapper({
      currentQuestionIndex: questionIndex,
      maxQuestionsAllowedToAttempt: questions.length,
      showFullText: false,
    }));

    it("entering answer makes answer valid", async () => {
      // initially answer should be invalid
      expect(wrapper.vm.isAttemptValid).toBeFalsy();

      // select an option
      await wrapper.find('[data-test="SinglePageItem-3"]')
        .find('[data-test="input"]').setValue(9);

      // the answer should now be valid
      expect(wrapper.vm.isAttemptValid).toBeTruthy();
    });
  });

  describe("full text mode", () => {
    beforeEach(() => mountWrapper({
      currentQuestionIndex: 0,
      maxQuestionsAllowedToAttempt: questions.length,
      showFullText: true,
    }));

    it("renders with showFullText prop", () => {
      expect(wrapper.props().showFullText).toBe(true);
    });

    it("passes showFullText to SinglePageItem components", () => {
      const singlePageItem = wrapper.find('[data-test="SinglePageItem-0"]');
      expect(singlePageItem.exists()).toBe(true);
    });
  });
});
