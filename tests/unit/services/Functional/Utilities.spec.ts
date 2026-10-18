import { computeQuestionVisibility, answerToSubmit } from "@/services/Functional/Utilities";
import { Question, submittedAnswer, DisplayCondition } from "@/types";

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
    expect(computeQuestionVisibility(questions, [null, null, null])).toEqual([
      true,
      true,
      true,
    ]);
  });

  it("shows a dependent when the trigger option is selected", () => {
    const questions = [q("single-choice"), q("subjective", cond(0, [0]))];
    const answers: submittedAnswer[] = [[0], null];
    expect(computeQuestionVisibility(questions, answers)).toEqual([true, true]);
  });

  it("hides a dependent when the trigger option is not selected", () => {
    const questions = [q("single-choice"), q("subjective", cond(0, [0]))];
    const answers: submittedAnswer[] = [[1], null];
    expect(computeQuestionVisibility(questions, answers)).toEqual([true, false]);
  });

  it("intersects multi-choice answers with the required option indices", () => {
    const questions = [q("multi-choice"), q("subjective", cond(0, [2]))];
    const answers: submittedAnswer[] = [[1, 2], null];
    expect(computeQuestionVisibility(questions, answers)).toEqual([true, true]);
  });

  it("reveals multiple dependents from one trigger option", () => {
    const questions = [q(), q("subjective", cond(0, [0])), q("subjective", cond(0, [0]))];
    const answers: submittedAnswer[] = [[0], null, null];
    expect(computeQuestionVisibility(questions, answers)).toEqual([true, true, true]);
  });

  it("is transitive: a dependent of a hidden trigger stays hidden", () => {
    // q1 hidden (q0 not matched) => q2 (depends on q1) hidden even though its own
    // condition on q1 would otherwise match
    const questions = [q(), q("single-choice", cond(0, [0])), q("subjective", cond(1, [0]))];
    const answers: submittedAnswer[] = [[1], [0], [0]];
    expect(computeQuestionVisibility(questions, answers)).toEqual([true, false, false]);
  });

  it("hides a question whose source is self-referential / out of range", () => {
    const questions = [
      q("subjective", cond(0, [0])), // self-reference
      q("subjective", cond(5, [0])), // out of range
    ];
    expect(computeQuestionVisibility(questions, [[0], null])).toEqual([false, false]);
  });

  it("treats non-list answers (matrix/numerical/string) as no selection", () => {
    const questions = [q("matrix-rating"), q("subjective", cond(0, [0]))];
    const answers: submittedAnswer[] = [{ row: 0 }, null];
    expect(computeQuestionVisibility(questions, answers)).toEqual([true, false]);
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
