# End-Test Summary — Architecture

## Control-flow change
Today the child modals gate submission and emit `end-test` straight into
`Player.endTest()` (which submits). We split "request to end" from "confirmed end":

```
child @end-test  ──▶  Player.requestEndTest()
                          │
             quiz_type == form ? ──yes──▶ Player.endTest()   (submit; forms keep old child gate)
                          │no
                          ▼
             open EndTestSummaryModal (compute buckets, pick variant)
                          │
        ┌─────────────────┴─────────────────┐
     @cancel                              @confirm
        │                                    │
   close modal,                        Player.endTest()  (existing submit logic,
   return to question                   unchanged: batch answers → end-quiz → metrics)
```

Time-up bypasses the summary:
```
Header countdown == 0 ─▶ child @end-test-by-time ─▶ Player.endTestByTime()
                                                     close summary ─▶ endTest()
heartbeat / resume sees time_remaining == 0 ──────────────────────▶ endTest()
```
`endTest()` ignores calls while one is in flight (D9) and closes the summary whenever
it shows the scorecard. Children close their palette before emitting either event.

## Stacking order
header `z-20` < palette, footer `z-50` < summary modal `z-[60]` < toasts.

## New component: `src/components/EndTestSummaryModal.vue`
Props:
- `show: boolean`
- `variant: 'exam' | 'homework' | 'omr'` — controls title, columns, confirm copy
- `buckets: { total, answered, notAnswered, markedForReview, notVisited }`
- `maxQuestionsAllowedToAttempt: number` — shows "You can attempt up to N questions."
  when N < total (D10)
- `isProcessing: boolean` — bound to `isSessionAnswerRequestProcessing`; disables buttons
  and shows a spinner on "Yes" so the student can't double-submit.

Emits: `confirm`, `cancel`.

Layout:
- Desktop (`bp-500`+): horizontal stat row/table like the screenshot (minus the
  "Answered & Marked" column).
- Mobile: 2-col grid of coloured stat cards, palette colours reused
  (green=answered, red=not-answered, purple=review, grey=not-visited, neutral=total).
- Uses existing UI button components under `src/components/UI/`.

## Bucket computation (in Player.vue)
A computed/helper `endTestBuckets` derived from `state.responses`:
```
answered         = responses.filter(r => r.answer != null).length
markedForReview  = responses.filter(r => r.marked_for_review).length
notVisited       = responses.filter(r => !r.visited).length
notAnswered      = total - answered - markedForReview - notVisited
```
(`notAnswered` is derived so the five always sum to `total`.)
For `omr` variant only `total / answered / notAnswered` are rendered, and
`notAnswered = total − answered` (D5).

## Changes to existing components
- `QuestionModal.vue`: remove the `endTest()` toast gate + `hasEndTestBeenClickedOnce`;
  emit `end-test` unconditionally.
- `SinglePageModal.vue`: for `omr-assessment` remove the toast gate and emit
  `end-test` unconditionally; for `form` keep the existing toast two-click gate untouched.
- `Player.vue`: add `showEndTestSummary` state, `requestEndTest()`, `endTestBuckets`,
  render `<EndTestSummaryModal>`; wire `@end-test` to `requestEndTest`.

## Failure handling
`Player.endTest()` already toasts on failure and resets `isSessionAnswerRequestProcessing`.
On failure we close the modal so the existing error toast is visible and the student can
click End Test again (which reopens the modal). On success the modal is superseded by the
scorecard (`isScorecardShown`).

## Required-field validation (forms) — preserved
Required-field validation lives entirely inside `Player.endTest()` and is untouched:
- client-side: `Player.vue:997-1003` (jumps to first incomplete question, no submission)
- server-side: `Player.vue:1044-1051` (`missing_positions` from backend).
Forms route `requestEndTest()` → `endTest()` directly, so both checks still run. The new
modal is purely presentational and never gates or duplicates this validation.

## i18n
New keys under a `endTestSummary` namespace in `englishTranslationData.json` and
`hindiTranslationData.json` (title, column labels, confirm/cancel, per-variant confirm copy).
