import { isQuestionAnswerCorrect } from "@/services/Functional/Utilities";
import { Question, questionType } from "@/types";

const createQuestion = (overrides: Partial<Question>): Question => ({
  _id: "q-1",
  type: questionType.SINGLE_CHOICE,
  text: "Question",
  options: [{ text: "A", image: null }],
  correct_answer: [0],
  image: null,
  max_char_limit: null,
  matrix_size: null,
  matrix_rows: null,
  graded: true,
  instructions: null,
  marking_scheme: null,
  solution: null,
  metadata: null,
  question_set_id: "set-1",
  source_id: null,
  ...overrides,
});

describe("isQuestionAnswerCorrect", () => {
  it("returns invalid evaluation when answer key is hidden for graded objective question", () => {
    const question = createQuestion({
      type: questionType.SINGLE_CHOICE,
      correct_answer: null,
    });

    const evaluation = isQuestionAnswerCorrect(question, [0], false);

    expect(evaluation.valid).toBe(false);
    expect(evaluation.answered).toBe(true);
    expect(evaluation.isCorrect).toBeUndefined();
  });

  it("still evaluates graded subjective responses when answer key is hidden", () => {
    const question = createQuestion({
      type: questionType.SUBJECTIVE,
      correct_answer: null,
    });

    const evaluation = isQuestionAnswerCorrect(question, "my response", false);

    expect(evaluation.valid).toBe(true);
    expect(evaluation.answered).toBe(true);
    expect(evaluation.isCorrect).toBe(true);
  });
});
