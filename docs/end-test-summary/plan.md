# End-Test Summary — Plan

## State (as of 2026-10-12)
- Branch: `feat/end-test-summary` (created from local `main` @ 17c7e4b).
- All changes **staged but NOT committed** — user wants to test manually before any commit.
- `main` is clean. `origin/main` is **19 commits ahead** of local `main`.

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

## IN PROGRESS
- Manual testing by user, two ways:
  1. Local backend + frontend against **local Mongo** (user has local org key + quizzes).
     Backend: `export MONGO_AUTH_CREDENTIALS="mongodb://127.0.0.1:27017"; export
     MONGO_DB_NAME="quiz"; ./startServerMac.sh` (don't edit backend `.env` — it holds the
     staging Atlas URI). Frontend: `npm run serve` (`.env.local` → `127.0.0.1:8000`).
  2. Same, but backend on **staging Mongo** (backend `.env` as-is) across assessment /
     homework / omr / form. Note: submitting writes real sessions to staging DB.
  - URL: `http://localhost:8080/quiz/{quizId}?userId=test_student&apiKey={orgKey}`.
    `userId` must be whitelisted (`test_admin|test_student|dev_1|dev_2`); `apiKey` must be
    an org key in the Mongo the backend is connected to (Player checks it → else 403).

## NEXT
1. After user approves testing: commit on `feat/end-test-summary`.
2. `git fetch` + rebase onto `origin/main`. **Expect conflicts**: remote has 7 forms
   commits touching `SinglePageModal.vue` (+153 lines: section pagination, per-question
   required flag, validate-section-before-Next) and `Player.vue`.
3. After rebase, re-verify:
   - forms still keep their toast gate and required-field validation in `Player.endTest()`
     (remote "honor per-question required flag" may have changed `areAllQuestionsRequired`).
   - full test suite, lint, build.
4. Open PR only when user asks.

## OPEN QUESTION (user to decide)
- Summary "Total" = `state.responses.length` (all questions) so buckets always sum.
  Old toast showed `maxQuestionsAllowedToAttempt` (sum of per-set attemptable). They
  differ only for "choose N of M" quizzes. Keep current, or reconcile differently?

## BLOCKED
- None.
