# End-Test Summary — Decisions

### D1 — Replace the toast gate, don't stack on it
**Decision:** The new modal replaces the two-click toast gate for assessment/homework/omr.
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
**Decision:** OMR variant drops Marked-for-Review and Not-Visited.
**Rationale:** OMR forces `marked_for_review=false` (`Player.vue:973`) and shows all
questions at once, so "not visited" isn't meaningful.

### D6 — Forms unchanged
**Decision:** Keep the existing SinglePageModal toast two-click gate for `form`.
**Rationale:** Explicit user instruction; forms have no marking/exam semantics.

### D7 — Homework = same buckets, neutral wording
**Decision:** Same 5 buckets as assessment, titled "Summary", softer confirm copy.
**Rationale:** Consistency; homework still has visited/review/answered states.
