import {
  computeQuestionVisibility,
  computeQuestionLabels,
  answerToSubmit,
  answerOptionIndices,
  isMinusSignMisplaced,
  isQuestionResponseComplete,
  numericalAnswerValue,
  sanitizeNumericalAnswer,
  shouldForceSinglePageMode,
} from "@/services/Functional/Utilities";
import { Question, submittedAnswer, DisplayCondition, QuizAPIResponse } from "@/types";

// minimal Question builder — only the fields the visibility rule reads. `type` is a plain
// string here (the evaluator reads a trigger's type to know its answer shape); cast through
// unknown to satisfy Question.
function q(
  type = "single-choice",
  displayCondition: DisplayCondition | null = null
): Question {
  return { type, display_condition: displayCondition } as unknown as Question;
}

function cond(sourcePosition: number, optionIndices: number[]): DisplayCondition {
  return { source_position: sourcePosition, option_indices: optionIndices };
}

describe("computeQuestionVisibility", () => {
  it("marks every question visible when none have a display_condition", () => {
    const questions = [q(), q(), q()];
    expect(computeQuestionVisibility(questions, [null, null, null], "form")).toEqual([
      true,
      true,
      true,
    ]);
  });

  it("shows a dependent when the trigger option is selected", () => {
    const questions = [q("single-choice"), q("subjective", cond(0, [0]))];
    const answers: submittedAnswer[] = [[0], null];
    expect(computeQuestionVisibility(questions, answers, "form")).toEqual([true, true]);
  });

  it("hides a dependent when the trigger option is not selected", () => {
    const questions = [q("single-choice"), q("subjective", cond(0, [0]))];
    const answers: submittedAnswer[] = [[1], null];
    expect(computeQuestionVisibility(questions, answers, "form")).toEqual([true, false]);
  });

  it("intersects multi-choice answers with the required option indices", () => {
    const questions = [q("multi-choice"), q("subjective", cond(0, [2]))];
    const answers: submittedAnswer[] = [[1, 2], null];
    expect(computeQuestionVisibility(questions, answers, "form")).toEqual([true, true]);
  });

  it("reveals multiple dependents from one trigger option", () => {
    const questions = [q(), q("subjective", cond(0, [0])), q("subjective", cond(0, [0]))];
    const answers: submittedAnswer[] = [[0], null, null];
    expect(computeQuestionVisibility(questions, answers, "form")).toEqual([true, true, true]);
  });

  it("is transitive: a dependent of a hidden trigger stays hidden", () => {
    // q1 hidden (q0 not matched) => q2 (depends on q1) hidden even though its own
    // condition on q1 would otherwise match
    const questions = [q(), q("single-choice", cond(0, [0])), q("subjective", cond(1, [0]))];
    const answers: submittedAnswer[] = [[1], [0], [0]];
    expect(computeQuestionVisibility(questions, answers, "form")).toEqual([true, false, false]);
  });

  it("hides a question whose source is self-referential / out of range", () => {
    const questions = [
      q("subjective", cond(0, [0])), // self-reference
      q("subjective", cond(5, [0])), // out of range
    ];
    expect(computeQuestionVisibility(questions, [[0], null], "form")).toEqual([false, false]);
  });

  it("treats non-list answers (matrix/numerical/string) as no selection", () => {
    const questions = [q("matrix-rating"), q("subjective", cond(0, [0]))];
    const answers: submittedAnswer[] = [{ row: 0 }, null];
    expect(computeQuestionVisibility(questions, answers, "form")).toEqual([true, false]);
  });

  it("ignores display_condition outside forms: every question is visible", () => {
    // a trigger answer that would hide q1 and q2 on a form
    const questions = [q(), q("subjective", cond(0, [0])), q("subjective", cond(9, [0]))];
    const answers: submittedAnswer[] = [[1], "kept", null];
    for (const quizType of ["assessment", "homework", "omr-assessment", undefined] as const) {
      expect(computeQuestionVisibility(questions, answers, quizType)).toEqual([
        true,
        true,
        true,
      ]);
    }
    expect(computeQuestionVisibility(questions, answers, "form")).toEqual([
      true,
      false,
      false,
    ]);
  });
});

describe("computeQuestionLabels", () => {
  it("numbers questions by position when none have a display_condition", () => {
    expect(computeQuestionLabels([q(), q(), q()], "form")).toEqual(["1", "2", "3"]);
  });

  it("numbers follow-ups under their trigger and keeps counting top-level questions", () => {
    // Q1, Q2 with two follow-ups, Q3 — follow-ups don't use up a top-level number
    const questions = [
      q(),
      q(),
      q("subjective", cond(1, [0])),
      q("subjective", cond(1, [1])),
      q(),
    ];
    expect(computeQuestionLabels(questions, "form")).toEqual(["1", "2", "2a", "2b", "3"]);
  });

  it("numbers a follow-up of a follow-up with a number, then a letter again", () => {
    const questions = [
      q(),
      q("single-choice", cond(0, [0])),
      q("single-choice", cond(1, [0])),
      q("subjective", cond(2, [0])),
    ];
    expect(computeQuestionLabels(questions, "form")).toEqual(["1", "1a", "1a.1", "1a.1a"]);
  });

  it("labels a follow-up after its parent even when it is not directly below it", () => {
    const questions = [q(), q(), q("subjective", cond(0, [0]))];
    expect(computeQuestionLabels(questions, "form")).toEqual(["1", "2", "1a"]);
  });

  it("continues letters past z", () => {
    const questions = [q(), ...Array.from({ length: 27 }, () => q("subjective", cond(0, [0])))];
    const labels = computeQuestionLabels(questions, "form");
    expect(labels[26]).toEqual("1z");
    expect(labels[27]).toEqual("1aa");
  });

  it("keeps position + 1 for a condition that can never be satisfied", () => {
    // forward / self references never show (see computeQuestionVisibility)
    const questions = [q(), q("subjective", cond(1, [0])), q("subjective", cond(5, [0])), q()];
    expect(computeQuestionLabels(questions, "form")).toEqual(["1", "2", "3", "2"]);
  });

  it("ignores display_condition outside forms", () => {
    const questions = [q(), q("subjective", cond(0, [0])), q()];
    expect(computeQuestionLabels(questions, "assessment")).toEqual(["1", "2", "3"]);
  });
});

describe("answerToSubmit", () => {
  it("submits the answer of a visible question unchanged", () => {
    expect(answerToSubmit([2], true)).toEqual([2]);
    expect(answerToSubmit("some text", true)).toEqual("some text");
  });

  it("submits null for a hidden question, even if a stale answer is held", () => {
    expect(answerToSubmit([2], false)).toBeNull();
    expect(answerToSubmit("stale text", false)).toBeNull();
    expect(answerToSubmit({ row: 1 }, false)).toBeNull();
  });
});

describe("shouldForceSinglePageMode", () => {
  function quiz(quizType: string, ...questions: Question[]): QuizAPIResponse {
    return {
      metadata: { quiz_type: quizType },
      question_sets: [{ questions: questions.slice(0, 1) }, { questions: questions.slice(1) }],
    } as unknown as QuizAPIResponse;
  }
  const paginated = { singlePageMode: false, omrMode: false };

  it("forces it for a form with a conditional question opened without the flag", () => {
    // the conditional question sits in the second set
    const form = quiz("form", q(), q("subjective", cond(0, [0])));
    expect(shouldForceSinglePageMode(form, paginated)).toBe(true);
  });

  it("does not force it when single-page or OMR mode is already on", () => {
    const form = quiz("form", q(), q("subjective", cond(0, [0])));
    expect(shouldForceSinglePageMode(form, { singlePageMode: true, omrMode: false })).toBe(false);
    expect(shouldForceSinglePageMode(form, { singlePageMode: false, omrMode: true })).toBe(false);
  });

  it("does not force it for a form without conditional questions", () => {
    expect(shouldForceSinglePageMode(quiz("form", q(), q("subjective")), paginated)).toBe(false);
  });

  it("does not force it outside forms, even with a display_condition", () => {
    for (const quizType of ["assessment", "homework", "omr-assessment"]) {
      const notAForm = quiz(quizType, q(), q("subjective", cond(0, [0])));
      expect(shouldForceSinglePageMode(notAForm, paginated)).toBe(false);
    }
  });
});

describe("single-choice-other", () => {
  // last option is "Other"
  const otherQuestion = {
    type: "single-choice-other",
    options: [{ text: "I was not aware" }, { text: "No time" }, { text: "Other" }],
    display_condition: null,
  } as unknown as Question;

  it("reads selected indices from the {selected, other_text} answer", () => {
    expect(
      answerOptionIndices({ selected: [1], other_text: null }, "single-choice-other")
    ).toEqual([1]);
    expect(answerOptionIndices(null, "single-choice-other")).toEqual([]);
  });

  it("does not misread a matrix answer that has a 'selected' row", () => {
    const matrixAnswer = { selected: 1 } as submittedAnswer;
    expect(answerOptionIndices(matrixAnswer, "matrix-rating")).toEqual([]);
    expect(answerOptionIndices(matrixAnswer)).toEqual([]);
  });

  it("is complete when a normal option is picked", () => {
    expect(
      isQuestionResponseComplete(otherQuestion, { selected: [0], other_text: null })
    ).toBe(true);
  });

  it("needs non-blank text when Other is picked", () => {
    expect(
      isQuestionResponseComplete(otherQuestion, { selected: [2], other_text: "No internet" })
    ).toBe(true);
    expect(
      isQuestionResponseComplete(otherQuestion, { selected: [2], other_text: "  " })
    ).toBe(false);
    expect(
      isQuestionResponseComplete(otherQuestion, { selected: [2], other_text: null })
    ).toBe(false);
  });

  it("is incomplete when nothing is selected or the shape is wrong", () => {
    expect(isQuestionResponseComplete(otherQuestion, null)).toBe(false);
    expect(
      isQuestionResponseComplete(otherQuestion, { selected: [], other_text: null })
    ).toBe(false);
    expect(isQuestionResponseComplete(otherQuestion, [0])).toBe(false);
  });

  it("can trigger a follow-up question", () => {
    const questions = [otherQuestion, q("subjective", cond(0, [1]))];
    expect(
      computeQuestionVisibility(questions, [{ selected: [1], other_text: null }, null], "form")
    ).toEqual([true, true]);
    expect(
      computeQuestionVisibility(questions, [{ selected: [2], other_text: "x" }, null], "form")
    ).toEqual([true, false]);
  });
});

describe("numericalAnswerValue", () => {
  it("parses positive, negative and decimal answers", () => {
    expect(numericalAnswerValue("7")).toBe(7);
    expect(numericalAnswerValue("-7")).toBe(-7);
    expect(numericalAnswerValue("-2.5")).toBe(-2.5);
    expect(numericalAnswerValue(-7)).toBe(-7);
    expect(numericalAnswerValue("0")).toBe(0);
  });

  it("treats empty and partial negative answers as not answered", () => {
    expect(numericalAnswerValue(null)).toBeNull();
    expect(numericalAnswerValue(undefined)).toBeNull();
    expect(numericalAnswerValue("")).toBeNull();
    expect(numericalAnswerValue("-")).toBeNull();
    expect(numericalAnswerValue("-.")).toBeNull();
  });
});

describe("isMinusSignMisplaced", () => {
  it("allows a minus as the first character", () => {
    expect(isMinusSignMisplaced(null, "-", 0, 0)).toBe(false);
    expect(isMinusSignMisplaced("", "-", 0, 0)).toBe(false);
    expect(isMinusSignMisplaced("7", "-", 0, 0)).toBe(false);
  });

  it("rejects a minus after the first character", () => {
    expect(isMinusSignMisplaced("7", "-", 1, 1)).toBe(true);
    expect(isMinusSignMisplaced("-7", "-", 2, 2)).toBe(true);
  });

  it("rejects typing in front of an existing minus", () => {
    expect(isMinusSignMisplaced("-7", "-", 0, 0)).toBe(true);
    expect(isMinusSignMisplaced("-7", "5", 0, 0)).toBe(true);
  });

  it("allows replacing a selection that covers the existing minus", () => {
    expect(isMinusSignMisplaced("-7", "-", 0, 2)).toBe(false);
    expect(isMinusSignMisplaced("-7", "5", 0, 1)).toBe(false);
  });

  it("ignores digits typed after the minus", () => {
    expect(isMinusSignMisplaced("-", "7", 1, 1)).toBe(false);
    expect(isMinusSignMisplaced("-7", "5", 2, 2)).toBe(false);
  });
});

describe("sanitizeNumericalAnswer", () => {
  it("keeps valid answers unchanged", () => {
    expect(sanitizeNumericalAnswer("-7", true, 10)).toBe("-7");
    expect(sanitizeNumericalAnswer("-2.5", true, 10)).toBe("-2.5");
    expect(sanitizeNumericalAnswer("3.14", true, 10)).toBe("3.14");
    expect(sanitizeNumericalAnswer("-", true, 10)).toBe("-");
    expect(sanitizeNumericalAnswer("", true, 10)).toBe("");
  });

  it("drops a minus sign that is not the first character", () => {
    expect(sanitizeNumericalAnswer("7-646", true, 10)).toBe("7646");
    expect(sanitizeNumericalAnswer("--3", false, 10)).toBe("-3");
    expect(sanitizeNumericalAnswer("-3.564-5", true, 10)).toBe("-3.5645");
  });

  it("keeps one decimal point after a digit, only when decimals are allowed", () => {
    expect(sanitizeNumericalAnswer("3..5", true, 10)).toBe("3.5");
    expect(sanitizeNumericalAnswer("1.2.3", true, 10)).toBe("1.23");
    expect(sanitizeNumericalAnswer(".5", true, 10)).toBe("5");
    expect(sanitizeNumericalAnswer("-.5", true, 10)).toBe("-5");
    expect(sanitizeNumericalAnswer("-3.564", false, 10)).toBe("-3564");
  });

  it("drops letters and other symbols", () => {
    expect(sanitizeNumericalAnswer("1,2 a#", true, 10)).toBe("12");
  });

  it("cuts the answer to the maximum length", () => {
    expect(sanitizeNumericalAnswer("-1234567890", true, 10)).toBe("-123456789");
  });
});
