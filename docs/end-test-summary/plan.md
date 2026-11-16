# End-Test Summary — Plan

## State (as of 2026-11-17, evening)
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
- UI audit fixes on this branch, one report group at a time (user decides each).
  - Group 2 (instructions page) committed (f575d4d).
  - Group 3 (palette) built, uncommitted, awaiting user's visual check: 44px tiles with
    the number inside + dark outline for current; review mode adds a corner result badge
    (user may revisit); filled/outlined Palette|Instructions toggle (hidden in OMR); compact
    legend, no counts (user's call); auto-fill grid; backdrop + close button; palette
    width `max-w-md` (sm: breakpoint bug, see Q9); en/hi strings. Deferred: pinned
    section headings.
  - New finding Q9: `sm:` overrides md/lg/xl app-wide (tailwind screens order). Needs
    the user's decision; not fixed.
  - Next: Group 4.
- Merge resolution: summary modal now closes from a `hasQuizEnded` watcher (covers
  main's 409 "already ended" and survey-redirect paths). Verified in-app.

## NEXT
1. Commit Group 3 when the user approves the screenshots.
2. Groups 3–4 of the UI report.
3. `npm install` locally (main moved Cypress 9 → 12) before running E2E.
4. Open PR only when user asks.

## BLOCKED
- None.
