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
