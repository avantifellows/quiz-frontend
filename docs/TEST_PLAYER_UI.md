# Test Player UI

Notes on how the test player's End Test flow and main UI pieces behave, and why. Read this
before changing `Player.vue`'s end-test logic, the question palette, or global styles.

## End Test flow

```
End Test click ─▶ Player.requestEndTest()
                    ├─ form ──────────────▶ endTest()   (child keeps the two-click toast)
                    └─ assessment / OMR ──▶ EndTestSummaryModal
                                              ├─ No  ─▶ close, back to the same question
                                              └─ Yes ─▶ endTest()

Countdown hits 0 ─▶ end-test-by-time ─▶ Player.endTestByTime() ─▶ endTest()   (no summary)
Heartbeat / resume sees time_remaining == 0 ────────────────────▶ endTest()
```

- **Why a modal on every click:** the old toast gate set a flag that was never reset, so
  only the first End Test click in a session was ever confirmed.
- **Time-up submits immediately**, as before. Routing it through the summary let students
  keep working after time ran out.
- **`endTest()` ignores calls while one is in flight.** Countdown, heartbeat and "Yes" can
  fire together; a second call could hit a 409 and show a false connection error.
- **The summary closes from a watcher on `hasQuizEnded`**, so every end path (Yes,
  time-up, heartbeat, 409 "already ended", survey redirect) closes it.
- **Stacking:** header `z-20` < palette and footer `z-50` < summary `z-[60]` < toasts.
  Children close the palette before emitting `end-test`.

### Summary counts (`computeEndTestBuckets` in `Utilities.ts`)
- Assessment: answered, not answered, marked for review, not visited, plus the total.
  Not answered is derived so the buckets always sum to the total.
- OMR: total, answered, not answered only, with not answered = total − answered. OMR leaves
  untouched questions `visited=false`, so the generic formula would hide them.
- "Answered & marked for review" is not shown: marking for review clears the answer.
- "Choose N of M" quizzes keep M as the total (it matches the palette) and add
  "You can attempt up to N questions."
- Homework has no header, so no End Test button and no summary; it ends itself after the
  last question. Forms are unchanged.

## Header, context strip and question meta
- **Header** (`Header.vue`, assessment and OMR): one fixed row, `h-[52px]` on phones and
  `lg:h-[60px]`: menu | centred timer | End Test ("See Results" after the test).
  Everything below is offset by that height: `mt-[52px] lg:mt-[60px]` on the question body
  (`QuestionModal.vue`) and OMR content (`SinglePageModal.vue`), `top-[52px] lg:top-[60px]`
  on the palette and its backdrop. Change them together.
- **Timer:** soft grey (`bg-gray-100`); soft red (`bg-red-100 text-red-700`) under the
  warning limit (3 minutes). `tabular-nums` so the digits don't jitter.
- **Context strip:** test name (ellipsis) + `ID: …` (never truncated) at the top of the
  question area. It scrolls with the question, so the header stays one row. Assessment:
  in `Body.vue`; OMR: `InfoBar` at the top of the page; homework / forms: `InfoBar` as the
  top bar (they have no header, hence no palette).
- **Meta row** (`Body.vue`): "Q1 · Single Choice" on the left, section as an orange tag on
  the right (homework / forms show "Total Questions: N" there). E2E tests assert this text.
- **Status pills** (NOT ANSWERED / ANSWERED / MARKED FOR REVIEW) sit above the question text
  so they stay visible on long questions.
- Avoid Tailwind's `truncate` class in these components: an unscoped `<style>` in
  `QuestionModal.vue` / `SinglePageModal.vue` overrides `.truncate` app-wide with a
  `max-width` of 10em / 16em. Use `overflow-hidden text-ellipsis whitespace-nowrap`.

## Footer
- One white bar for every quiz type (`Footer.vue`): joined ‹|› on the left, actions on the
  right, Save & Next / Submit as the solid green primary action.
- Previous is disabled on the first question and **Next is shown disabled on the last**
  (not hidden), so nothing shifts.
- **Below 640px (`sm`):** icon-only ‹|›; Save & Next grows but is capped at `max-w-[12rem]`
  and spare width collects before Clear. Below 360px the labels shorten to "Review" and
  "Save ›" so Save never ends up narrower than Review.
- **From 640px (tablets and up):** labelled "‹ Previous | Next ›", actions grouped right,
  Save & Next a fixed `min-w-[10rem]`, "Mark For Review & Next". The label switch uses
  `matchMedia("(max-width: 639px)")` to match the `sm:` classes.
- Review mode: two wide Previous / Next buttons only.

## Question palette
- One 44px tile per question with the number inside, filled by status. The current
  question has an outline ring and `aria-current="true"` (E2E tests check that).
- Each tile also has a screen-reader status label, so read the number from
  `[data-test="index"]`, not the tile's full text.
- Review mode adds a corner badge (correct / wrong / skipped / partial) so results are not
  shown by colour alone.
- Palette colours: green = answered, red = visited but not answered, grey = not visited,
  purple = marked for review. The instructions legend must use the same mapping.

## Global style gotchas
- **Tailwind screens must be listed in ascending order** in `tailwind.config.js`.
  Otherwise a smaller breakpoint's rules are emitted later and win (e.g. `sm:` overrode
  `lg:` on every screen ≥ 640px).
- **`src/index.css` sets `table-layout: fixed` on every table**, giving all columns equal
  width. Add `table-auto` when columns should size to their content (the scorecard's
  section table does).
- **`isScreenPortrait()` reads the device screen, not the window.** Prefer width-based
  Tailwind classes for layout; a laptop with a narrow window still counts as landscape.

## Quiz data
- `time_limit.max` is in **seconds**. The instructions table shows it as minutes plus
  leftover seconds ("3 minutes 20 seconds"), never a fraction.
