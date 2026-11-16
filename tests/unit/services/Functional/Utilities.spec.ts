import { computeEndTestBuckets } from "@/services/Functional/Utilities";
import { SubmittedResponse } from "@/types";

/**
 * Helper to build a SubmittedResponse with only the fields the bucketing logic
 * cares about (answer, visited, marked_for_review).
 */
function makeResponse(
  overrides: Partial<SubmittedResponse>
): SubmittedResponse {
  return {
    _id: "id",
    question_id: "qid",
    answer: null,
    visited: false,
    marked_for_review: false,
    ...overrides
  };
}

describe("computeEndTestBuckets", () => {
  it("returns all-zero buckets for an empty response list", () => {
    expect(computeEndTestBuckets([])).toEqual({
      total: 0,
      answered: 0,
      notAnswered: 0,
      markedForReview: 0,
      notVisited: 0
    });
  });

  it("classifies each response into the correct, mutually-exclusive bucket", () => {
    const responses: SubmittedResponse[] = [
      // answered (answer present)
      makeResponse({ answer: [0], visited: true }),
      makeResponse({ answer: "42", visited: true }),
      // not answered (visited, no answer, not marked)
      makeResponse({ answer: null, visited: true }),
      // marked for review (answer always cleared when marked)
      makeResponse({ answer: null, visited: true, marked_for_review: true }),
      // not visited
      makeResponse({ answer: null, visited: false })
    ];

    expect(computeEndTestBuckets(responses)).toEqual({
      total: 5,
      answered: 2,
      notAnswered: 1,
      markedForReview: 1,
      notVisited: 1
    });
  });

  it("always has the four sub-buckets sum to the total", () => {
    const responses: SubmittedResponse[] = [
      makeResponse({ answer: [1], visited: true }),
      makeResponse({ answer: null, visited: true }),
      makeResponse({ answer: null, visited: true, marked_for_review: true }),
      makeResponse({ answer: null, visited: false }),
      makeResponse({ answer: [2, 3], visited: true }),
      makeResponse({ answer: null, visited: false })
    ];

    const buckets = computeEndTestBuckets(responses);
    expect(
      buckets.answered +
        buckets.notAnswered +
        buckets.markedForReview +
        buckets.notVisited
    ).toBe(buckets.total);
    expect(buckets.total).toBe(responses.length);
  });

  it("treats an answer of 0 (falsy but not null) as answered", () => {
    const responses: SubmittedResponse[] = [
      makeResponse({ answer: 0 as unknown as SubmittedResponse["answer"], visited: true })
    ];
    expect(computeEndTestBuckets(responses).answered).toBe(1);
  });
});
