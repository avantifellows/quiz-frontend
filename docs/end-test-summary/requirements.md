# End-Test Summary — Requirements

## Goal
Replace the current auto-dismissing "click End Test twice" toast confirmation with an
explicit **summary + confirm** step shown when a student ends a test, so submission of an
irreversible action is deliberate and informed.

## Background (current behaviour)
- `QuestionModal.endTest()` and `SinglePageModal.endTest()` implement a one-time toast gate.
- The gate flag `hasEndTestBeenClickedOnce` starts `true` and is only ever set to `false`
  — it is **never reset**, so only the *first* End-Test click of a session is ever
  confirmed. Every later click submits immediately. This is the core defect being fixed.
- Marking a question for review **clears its answer** (`QuestionModal.vue:395-398`), so
  "Answered & Marked for Review" is not a reachable state.

## Bucket taxonomy (mutually exclusive, sum == total)
| Bucket | Rule |
|---|---|
| No of Questions | total (`numQuestions`) |
| Answered | `answer != null` |
| Not Answered | `visited && answer == null && !marked_for_review` |
| Marked for Review | `marked_for_review == true` |
| Not Visited | `!visited` |

These mirror the existing palette states (`neutral`/`success`/`review`/`error`,
`Player.vue:1272-1277`); reuse those colours.

## Per quiz-type behaviour (decided)
| Quiz type | Confirmation UI | Columns |
|---|---|---|
| assessment (normal mode) | New **Exam Summary** modal | Full 5-bucket |
| homework (normal mode) | New **Summary** modal (neutral wording) | Full 5-bucket |
| omr-assessment | New **Exam Summary** modal | Total / Answered / Not Answered only |
| form | **Unchanged** — keep existing toast two-click gate | n/a |

## UX decisions (confirmed)
- **Presentation:** centered modal overlay over a dimmed quiz; "No" returns to the exact
  question. Not a full-page replacement.
- **Mobile:** 2-column coloured stat cards (palette colours), reflowing from the desktop
  row/table layout.
- **Copy:**
  - assessment/omr: "Are you sure you want to submit for final marking? No changes will be
    allowed after submission."
  - homework: softer, e.g. "Submit your answers? You won't be able to change them after."
- **OMR** drops Marked-for-Review (unsupported) and Not-Visited (all questions shown at once).

## Success criteria
- Every End-Test click (assessment/homework/omr) shows the modal — no more one-time gate.
- Buckets always sum to total (unit-tested).
- Modal is fully usable on smallest supported breakpoint (`bp-320`, 320px).
- English + Hindi strings via existing i18n.
- Forms behave exactly as today.
- Double-submission prevented while the request is in flight.
- When time runs out, the test submits immediately with no confirmation (as on `main`),
  and the summary never stays open over the scorecard.
- OMR summary counts every unanswered question.
