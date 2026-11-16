# Conditional Question Display for Forms — Design & Handoff

**Status**: designed, not implemented. **Owner**: Abhinav (handoff from Surya, Sep 2026).
**Origin**: Poojita's mentorship screener forms (Google Sheet `1H_c8CaR3YrhVt2qVxMWQ3jYTdUWIhRUDyB6FrUsnMaY`, tabs `qe_form_g12`, `qe_form_g13`, plus Hindi/Punjabi variants).

## 1. The ask

Some form questions should appear **only when a specific option is chosen on an earlier question**. Two live examples from `qe_form_g12`:

- "Do you have a friend or group of friends who help each other with studying?" — if **"Yes, I already have this"** → show "Which of these do you have a friend/group of friends for?"
- "Do you go for offline coaching classes?" — if **"Yes"** → show **two** questions ("Is travel a problem?" + a travel-frequency matrix-rating).

One trigger can reveal multiple questions. Triggers so far are single-choice; multi-choice triggers should also work in v1 (same answer shape).

> Note: before building, confirm with Poojita that branching is a **recurring** need across screeners. The zero-engineering alternative — give dependent questions an explicit "Not applicable / I don't have this" option — was offered and may still be acceptable for one-off forms. If this doc is being implemented, that decision has presumably been made.

## 2. The one architectural rule (read this twice)

The entire quiz system leans on a single invariant: **the quiz's question list is fixed and positional.**

- Sessions get one `session_answers` slot per question, in question-set order, at creation (quiz-backend `app/routers/sessions.py`, session creation).
- Answer updates are positional (`PATCH /session_answers/{session_id}/{position_index}`).
- The BigQuery ETL (`etl-data-flow/flows/quizzes/lambda_function.py`, `process_form_responses` ~line 2724) iterates `session_answers` **by position** per question set, then joins metadata by `question_id`.

Therefore conditional display must be **display-only**: every question always exists in the quiz and in every session. A hidden question is simply never rendered and its answer stays `null`. Never add/remove/reorder questions per student. Keeping this rule means the **BigQuery/reporting ETL needs zero changes** (see §7).

## 3. The rule schema

Stored on each **dependent** question as a new field in quiz-backend:

```json
"display_condition": {
  "source_position": 8,
  "option_indices": [0]
}
```

- `source_position`: flat 0-based position of the trigger question across all question sets, in quiz-document order. **Position, not question_id**, because questions are created in one `POST /quiz` payload before ids exist, and position is how session answers and the ETL already address questions.
- `option_indices`: show the question when the trigger's submitted answer (a list of option indices for single/multi-choice) intersects this list. **Index, not option text**, so the Hindi/Punjabi translated tabs work — as long as their option *order* matches the English tab.
- Visibility is **transitive**: if the trigger question is itself hidden, the dependent is hidden too. Evaluate in position order (triggers always precede dependents — validated at creation).
- Absent field ⇒ always visible ⇒ every existing quiz/form behaves exactly as today.

## 4. Sheet layout (already prepared)

The tab **"qe_form_g12 (proposed layout)"** in Poojita's spreadsheet (gid `244091523`) shows the full form ported to the new structure:

| Key | Theme | Baseline Questions | Options | Options Type | Show if Question | Show if Option |
|-----|-------|--------------------|---------|--------------|------------------|----------------|
| `friends_group` | Friends Support | Do you have a friend...? | ... | single-choice | | |
| | Friends Support | Which of these...? | ... | multiple-choice | `friends_group` | Yes, I already have this |

- `Key`: short slug, filled only on rows other rows point to.
- `Show if Question` / `Show if Option`: on dependent rows only. Option text must match the trigger's option exactly.
- This **replaces** Poojita's original row-number-based columns (`Display on selection?`, `Option`, `Display-question text`, `Display-row-number`) — row-number pointers silently break when rows are inserted while drafting; keys survive insert/move/reorder.
- Multiple reveals need no syntax: each dependent row carries its own condition. Future "any of several options" = comma-separated `Show if Option`.
- Precedent: the registration-form sheets in `etl-data-flow/flows/gsheets-to-db/form.py` already use `Database Key` / `Show If` / `Show If Condition` — same pattern.

## 5. Where forms come from (pipeline map)

```
quiz-creator (Next.js UI, ~/jan2023/quiz-creator)      ← only creates a session row + SNS message
  └─ SNS → etl-data-flow/flows/sessionCreator/lambda_function.py  (actions: db_id | sheet | patch | regenerate_quiz)
       └─ SessionCreator.py process_row → for test_type=form + spreadsheet link:
            GsheetInterface.get_raw_problem_sets_from_gsheet_form(sheet_key, sheet_name, "1,0")
              (groups rows by Theme → question sets; Theme = set title)
       └─ QuizInterface builds payload → POST {quiz-backend}/quiz
       └─ session/occurrence/links written to db-service; forms are FORCED single_page_mode
            (SessionCreator.py ~:625) and get /form/{id}?...&singlePageMode=true admin links
frontend: GET /form/{id}?single_page_mode=true returns ALL questions in full (no bucketing)
responses: session_answers (positional, embedded on session doc) → flows/quizzes/lambda_function.py → BQ
```

- `regenerate_quiz` **PATCHes the same quiz id** in Mongo (`SessionCreator.py:659-666`) — links don't change. Regenerating while Poojita drafts is safe and recomputes everything, including display conditions. **After students respond, the structure is frozen** (pre-existing constraint for all forms).
- Known bug hit in practice: `get_raw_problem_sets_from_gsheet_form` requires columns `Theme`, **`Baseline Questions`**, `Options` (`GsheetInterface.py:628`), but Poojita's tabs say `Question` — session 20063 failed on exactly this. Add `Question` as an alias while you're in there.

## 6. Implementation plan, in deploy order

### 6.1 quiz-backend (deploy first; inert without data) — ~1 day

Repo: `avantifellows/quiz-backend`. main → ECS **testing** deploy; release → **prod** (CI must pass; prod domain `quiz-backend.avantifellows.org`).

1. `app/models.py`: add `display_condition: Optional[DisplayCondition]` to `Question` (~line 155) **and** `QuestionResponse` (~line 205). These are closed Pydantic models — extra keys are silently dropped on create and stripped from responses, which is why the field can't ride inside `metadata` (`QuestionMetadata` is closed too).
2. `app/routers/quizzes.py:113-124`: add `display_condition` to the trimmed-subset projection so bucketed (non-single-page) paths carry it. Forms use single-page mode (full questions), but keep the projection correct.
3. `app/routers/sessions.py:125-141` (`_get_incomplete_required_form_positions`): skip questions whose condition is unmet. Evaluate against `session_answers[source_position]["answer"]` (list-intersection with `option_indices`), transitively. **Without this, `require_all_questions` forms with conditionals can never be submitted** — the server re-validates at end-quiz and returns `missing_positions`.
4. Optional polish: `app/services/scoring.py:262-265` counts hidden unanswered questions in `num_skipped` / attempt-rate denominator. Harmless for forms (no marks); fix only if metrics readers complain.

### 6.2 quiz-frontend — ~1–2 days

Repo: `avantifellows/quiz-frontend`. main → staging; release → prod (S3 sync, **no CloudFront invalidation** — hard-refresh when verifying).

1. `src/types.ts`: add `display_condition?` to `Question` (~line 180).
2. `src/views/Player.vue`: computed `questionVisibility: boolean[]` derived from `state.responses` — no condition ⇒ visible; else trigger visible AND trigger's answer includes a required index. Reactive ⇒ resume works for free (restored answers re-derive visibility).
3. `src/components/SinglePage/SinglePageModal.vue`:
   - Hide invisible questions (there is already a `v-show` on the per-set wrapper for section pagination; per-item hiding goes on the `SinglePageItem` loop).
   - Exclude hidden questions from: the Next-button section gate (`goToNextSet`, uses `isQuestionResponseComplete` from `src/services/Functional/Utilities.ts`), the "answered X of N" submit toast, and Player's submit-time incomplete scan (`Player.vue:997`).
   - **Answer clearing**: when a trigger's answer changes so a dependent becomes hidden, null the dependent's answer AND push it to the server via the existing `submit-omr-question` path, cascading through chains. Otherwise stale answers to hidden questions land in BigQuery.
4. Scope v1 to single-page mode only — sessionCreator forces it for every form. Question-by-question (`QuestionModal`) skip-navigation is a follow-up.
5. Section pagination interplay: a dependent in a later section works naturally; if an entire section can become empty, skip its page (nice-to-have; Poojita's forms don't produce this).

### 6.3 etl-data-flow / sessionCreator — ~1 day

Repo `avantifellows/etl-data-flow`, dir `flows/sessionCreator/`. Deployed as a Lambda (Dockerfile.prod); test locally via `run_locally.py` with a `db_id` message (careful: it runs against production).

1. `GsheetInterface.py`: accept `Question` as alias for `Baseline Questions`; parse `Key`, `Show if Question`, `Show if Option`. Track each parsed question's original sheet row while grouping by Theme, then compute flat positions and attach `display_condition` to dependents (resolve `Show if Option` text → option index within the trigger's parsed options).
2. `QuizInterface.py`: `Question.to_dict()` (~:348) serializes all instance attributes, so setting `self.display_condition` on the creator-side Question is enough to reach the payload.
3. **Validate loudly at creation** (fail the run with a clear error, like the missing-column error does): unknown key, duplicate key, option text matching zero or multiple options, trigger positioned after its dependent, trigger not single/multi-choice.

### 6.4 BigQuery / reports ETL — no required changes

`flows/quizzes/lambda_function.py` iterates positionally and joins by question_id; slots are preserved, nothing shifts. A never-shown question appears as `is_answered: false`.

**Recommended (+0.5 day)**: add a `was_displayed BOOL` column to the form question-level rows (`generate_form_response_row` ~:2841, `FORM_QUESTION_LEVEL_METRICS_COLUMNS` ~:513) by evaluating the same rule at dump time — the lambda already has question details and the user's session_answers. Rationale: `is_answered: false` conflates "hidden by rule" with "abandoned mid-form"; with `require_all_questions` a *submitted* form's false can only mean hidden, but abandoned sessions and future non-require-all forms are ambiguous. Merge keys (`hashed_session_id, session_id, user_id, question_id`) are unchanged; BQ table needs the column added.

## 7. Constraints & gotchas (learned the hard way)

- **Never restructure a live form** (insert/delete/reorder rows) once students have responded — positional attribution in ETL and resumed sessions breaks. This predates conditional display.
- **Translated tabs** (Hindi/Punjabi) must keep identical question AND option ordering.
- **No shuffle** on conditional forms (positions must match document order; forms don't shuffle today anyway).
- **`require_all_questions` is enforced in three places** that must agree on visibility: frontend Next-gate, frontend submit scan, backend end-quiz validation. The cautionary tale: single-row matrix ratings store answers under a `"__default__"` key (blank row label) while matrix-numerical/subjective use the raw key — the two completeness checkers didn't know, and forms were unsubmittable until fixed (frontend `Utilities.ts` `isQuestionResponseComplete`, backend `sessions.py` `_is_required_form_answer_complete`, Sep 2026). Keep the visibility rule in ONE evaluator per codebase and reuse it.
- Answers for single/multi-choice are **lists of 0-based option indices**; matrix answers are dicts; numerical are JS numbers. `display_condition` v1 supports only the list-shaped triggers.
- `GET /form/{id}` (forms router) does NOT hide `correct_answer` the way `/quiz/{id}` does — irrelevant for forms (ungraded) but don't put secrets in metadata.
- Deploying etl-next or restarting services mid-flow causes false "stale run" failures elsewhere; unrelated to this feature but you'll see the alerts.

## 8. What's already shipped (context, all on prod)

quiz-frontend (Sep 11, 2026): section titles shown for forms; forms paginated one question-set per page with Previous/Next + "Section X of Y"; header text above titles, first page only; Next gated on section completeness when `require_all_questions`; matrix `__default__` completeness fix (`02bf590`, `a3077f0`, `ef40d84`, `827356e`, `3d7386a`).
quiz-backend: matrix `__default__` fix in required-question validation (`237e017`).
None of the conditional-display feature itself is coded anywhere.

## 9. Verification playbook

1. Have Poojita finalize a tab in the new layout (the proposed-layout tab is the template).
2. Create a session via quiz-creator UI → the SNS/lambda builds the form. Or `run_locally.py` with `{"action":"db_id","id":<session_pk>}`. Iterate with `regenerate_quiz` (same links).
3. Use the admin testing link (`/form/{id}?apiKey=...&userId=test_admin&singlePageMode=true&autoStart=true`):
   - dependent hidden by default; appears on selecting the trigger option; disappears (and its answer clears server-side) on changing the trigger;
   - Next-gate and final Submit pass with hidden questions unanswered (`require_all_questions: true`);
   - resume mid-form (refresh) restores visibility correctly.
4. Submit as test_admin, then check BigQuery `assessments.<form question-level table>` rows: hidden-unshown questions have `answer null` (and `was_displayed=false` if built).
5. Reports: forms have their own mentor-facing report (`/reports/form_responses/...`); no student scorecard changes needed.
