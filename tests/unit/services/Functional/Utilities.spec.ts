import { computeQuestionVisibility, computeQuestionLabels, answerToSubmit, shouldForceSinglePageMode } from "@/services/Functional/Utilities";
import { Question, submittedAnswer, DisplayCondition, QuizAPIResponse } from "@/types";

// minimal Question builder — only the fields the visibility rule reads. `type` is a plain
// string here (the evaluator ignores it); cast through unknown to satisfy Question.
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
