# End-Test Summary — Decisions

### D1 — Replace the toast gate, don't stack on it
**Decision:** The new modal replaces the two-click toast gate for assessment/omr.
`hasEndTestBeenClickedOnce` is removed from those paths.
**Rationale:** The gate never re-arms, so later clicks submit unconfirmed. A modal every
time is both safer and simpler.
**Alternatives:** Keep toast + add modal (double confirmation — rejected).
**Consequences:** Confirmation logic centralises in Player.vue.

### D2 — Drop "Answered & Marked for Review" column
**Decision:** Not shown.
**Rationale:** Marking for review clears the answer (`QuestionModal.vue:395-398`), so the
state is unreachable in this product.

### D3 — Modal overlay, not full-page replace
**Decision:** Centered dialog over dimmed quiz; "No" returns to the exact question.
**Rationale:** Cancelling is common; preserving scroll/question position is better UX.

### D4 — Mobile = 2-col coloured stat cards
**Decision:** Reflow the desktop stat row into a 2-column card grid reusing palette colours.
**Rationale:** App is mobile-first; a 5-col table can't fit at 320px. Palette colours tie
the summary to the state language students already saw.

### D5 — OMR shows only Total / Answered / Not Answered
**Decision:** OMR variant drops Marked-for-Review and Not-Visited, and computes
Not Answered = Total − Answered.
**Rationale:** OMR forces `marked_for_review=false` and shows all questions at once, so
"not visited" isn't meaningful to the student. But OMR still leaves untouched questions
with `visited=false`, so the generic formula would put them in the hidden Not-Visited
bucket; the OMR formula keeps them visible.

### D6 — Forms unchanged
**Decision:** Keep the existing SinglePageModal toast two-click gate for `form`.
**Rationale:** Explicit user instruction; forms have no marking/exam semantics.

### D7 — No summary for homework
**Decision:** Homework keeps its existing flow; the summary has no homework variant.
**Rationale:** Homework has no header, so no End Test button and no palette; it ends
itself after the last question (`Player.vue` question-index watcher). A homework variant
could never be shown. Found during manual testing.
**Alternatives:** Add an End Test button to homework — a product change for the team.

### D8 — Time-up submits without the summary
**Decision:** The countdown reaching zero emits `end-test-by-time`, which calls
`Player.endTest()` directly (closing the summary and palette). Only a student's End Test
click goes through the summary. No "time's up" message for now.
**Rationale:** Matches `main`: a timed test is submitted the moment time runs out.
Routing time-up through the summary let students keep working after zero.
**Consequences:** The summary closes from a watcher on `hasQuizEnded`, which every end
path sets (including main's 409 and survey-redirect paths).

### D9 — Ignore concurrent end-test calls
**Decision:** `endTest()` is a thin wrapper with an in-flight flag; calls made while a
submission is running return immediately.
**Rationale:** Countdown, heartbeat (`time_remaining == 0`) and "Yes" can fire together.
A second call can't change the score (backend keeps existing metrics), but its answer
write can get a 409 and show a false "poor connection" error, and it rewrites
`end_quiz_time`. A local flag is enough; `isSessionAnswerRequestProcessing` is not
used because answer saves also set it and would block a time-up submit.

### D10 — "Choose N of M": keep total, add attempt-limit line
**Decision:** Tiles keep counting every question (so they sum and match the palette); a
line "You can attempt up to N questions." appears when N < total.
**Rationale:** Splash, the old toast and the scorecard all use N; the palette uses M.
**Alternatives:** Show N as total (tiles stop summing); rename tile only.
