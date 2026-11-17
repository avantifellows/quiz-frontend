# End-Test Summary — Plan

## State (as of 2026-11-18)
- Branch: `feat/end-test-summary` (created from local `main` @ 17c7e4b).
- Committed: feature (84007ab), Group 1 fixes (f06eb14), merge of origin/main (811e184).
  Branch is level with origin/main; not pushed.

## DONE
- Traced end-test flow (frontend + backend); see architecture.md.
- i18n keys `endTestSummary.*` (en + hi) and in `jest.init.ts`.
- `EndTestBuckets` / `EndTestSummaryVariant` in `src/types.ts` (the `*.vue` shim only
  allows default imports, so types can't be exported from the SFC).
- `src/components/EndTestSummaryModal.vue` (desktop stat row, mobile 2-col cards).
- `computeEndTestBuckets()` in `Utilities.ts`.
- `Player.vue`: `showEndTestSummary`, `endTestBuckets`, `endTestSummaryVariant`,
  `requestEndTest()`, `onEndTestConfirm()`; child `@end-test` → `requestEndTest`.
- `QuestionModal.vue`: toast gate + `hasEndTestBeenClickedOnce` removed.
- `SinglePageModal.vue`: toast gate kept for `form` only.
- Tests: `Utilities.spec.ts` (4), `EndTestSummaryModal.spec.ts` (7). Full suite 178 pass,
  lint clean, build 0 errors.
- UI audit (2026-11-16) found 6 issues in this feature (report E1–E6,
  https://claude.ai/artifact/1CZBH7UWnceFHvd7HdoSTf). Fixed 2026-11-17, unstaged on top
  of the staged work:
  - E1 time-up bypasses summary (D8); double-submit guard (D9).
  - E2 summary closes whenever the scorecard shows.
  - E3 palette closes on End Test / time-up.
  - E4 modal `z-[60]`, above header/palette/footer.
  - E5 OMR Not Answered = Total − Answered (D5).
  - E6 attempt-limit line (D10), en + hi.
  - +4 tests; full suite 182 pass, lint clean, build ok.

## IN PROGRESS
- UI audit fixes, all on this branch (user's choice), one report group at a time.
  - Group 2 (instructions) committed; legend later made one column (it is also shown
    inside the 448px palette, where two columns squeezed the text).
  - Group 3 (palette) committed (7aaf8ec). Deferred: pinned section headings.
  - Group 4: Q9 Tailwind screens order committed (4cf7d82). Q3 number box, Q4 no
    "no data" + grey Previous, Q5 OMR label column, Q7 smaller splash art committed.
    Tried and reverted at the user's request: two-row phone bottom bar; window-based
    image layout (it also changed the scorecard). Skipped by user: Q2 Hindi labels,
    Q6 confetti, Q8 toast position.
  - Scorecard review (2026-11-17), committed 124ea78: S1 See Answers same
    size as Share; S2/S3 section table is a real auto-layout `<table>` (index.css forces
    `table-layout: fixed`), short headings, % in heading, max 1 decimal; S4 metric cards in
    one row on phone; S5 all columns shown (no `isScreenPortrait` gate); S6 one emoji
    (🎉 quiz / 📝 form) above an emoji-free greeting.
  - Long IDs: 11-digit ID fits everywhere. 30+ char IDs wrap the phone header chip and
    overlap the question bar; no guard added (not requested).
  - Homework has no End Test button, so the summary's homework variant was removed (D7).

- PR #250 opened 2026-11-17 (https://github.com/avantifellows/quiz-frontend/pull/250).
  Screenshots live on orphan branch `pr-assets/end-test-summary`; keep it until merged.

## NEXT
1. Address PR review comments; delete `pr-assets/end-test-summary` after merge.
2. `npm install` locally (main moved Cypress 9 → 12) before running E2E.

## BLOCKED
- None.
