import store from "@/store/index";
import { Question, submittedAnswer, CorrectAnswerType, answerEvaluation, QuestionBucketingMap, OtherOptionAnswer, questionType, quizType, QuizAPIResponse } from "@/types";
const isEqual = require("deep-eql");

/**
 * custom logic for deciding when the screen is considered to be in portrait mode
 */
export function isScreenPortrait() {
  if (screen.availHeight > 0.8 * screen.availWidth) return true;
  return false;
}

/**
 * An identifier to hold the current animation frame request.
 * useful when it is needed to cancel a particular animation frame
 */
export let animationFrameRequest: number = 0;

/**
 * Animates confetti gun for a certain amount of time
 * @param {Object} confettiHandler - Handler which will draw the confetti on the canvas
 * @param {Number} duration - How long the confetti should be animated for
 * @param {Array} colors - Colors for the confetti
 */
export function throwConfetti(
  confettiHandler: (params: {
    particleCount: number;
    angle: number;
    spread: number;
    origin: { x: number };
    colors: string[];
  }) => void,
  duration = 3,
  colors: string[] = ["#ff718d", "#fdff6a"]
) {
  const animationEndTime = Date.now() + duration * 1000;
  const frame = () => {
    confettiHandler({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confettiHandler({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < animationEndTime) {
      // store the animation frame request in a variable
      // so we can cancel it later on
      animationFrameRequest = requestAnimationFrame(frame);
    }
  };
  frame();
}

/**
 * Resets the animation frame request for the confetti being rendered
 */
export function resetConfetti() {
  if (animationFrameRequest != undefined) {
    cancelAnimationFrame(animationFrameRequest);
  }
}

/**
 * Selected 0-based option indices from a choice answer. Single/multi-choice store a number
 * array; single-choice-other stores {selected, other_text}. Any other answer shape (matrix
 * dicts, numerical, string, null) cannot drive a display_condition, so it contributes no
 * indices. The question type is needed because matrix answers are objects too. Mirrors the
 * backend `_answer_option_indices`.
 */
export function answerOptionIndices(
  answer: submittedAnswer | undefined,
  type?: string
): number[] {
  let selected: unknown = answer;
  if (type == questionType.SINGLE_CHOICE_OTHER) {
    selected =
      answer != null && typeof answer == "object" && !Array.isArray(answer)
        ? (answer as OtherOptionAnswer).selected
        : null;
  }
  if (!Array.isArray(selected)) return [];
  const indices: number[] = [];
  for (const value of selected) {
    if (typeof value == "number") indices.push(value);
  }
  return indices;
}

/**
 * Numeric value of a numerical answer textbox. Empty text and partial negatives that are
 * not a number yet ("-", "-.") give null, so they are saved as "not answered".
 */
export function numericalAnswerValue(
  answer: string | number | null | undefined
): number | null {
  if (answer == null || String(answer) == "") return null;
  const value = Number(answer);
  return Number.isNaN(value) ? null : value;
}

/**
 * Whether typing `insertedText` over the selection [selectionStart, selectionEnd) of a
 * numerical answer would put a minus sign anywhere but the first character: a "-" typed
 * after the start, or any text typed in front of an existing leading "-".
 */
export function isMinusSignMisplaced(
  answer: string | number | null | undefined,
  insertedText: string,
  selectionStart: number,
  selectionEnd: number
): boolean {
  const text = answer == null ? "" : String(answer);
  if (text.startsWith("-") && selectionEnd == 0) return true;
  return insertedText == "-" && selectionStart != 0;
}

/**
 * Visibility of every question by flat position — the single source of truth for the
 * conditional-display rule on the frontend (mirrors the backend
 * `_compute_form_question_visibility`).
 *
 * A question with no `display_condition` is always visible. Otherwise it is visible only
 * when its trigger question is itself visible AND the trigger's answer selects one of the
 * required `option_indices`. Visibility is transitive: a dependent of a hidden trigger is
 * hidden. Triggers always precede their dependents (validated at creation), so a single
 * forward pass that reads earlier positions' visibility resolves whole chains. A condition
 * whose `source_position` is missing, out of range, or points at/after the dependent itself
 * can never be satisfied, so the question stays hidden.
 *
 * Conditional display is form-only: for any other quiz type every question is visible and
 * display_condition is ignored, so hiding and answer-clearing never apply there.
 */
export function computeQuestionVisibility(
  questions: Question[],
  answers: (submittedAnswer | undefined)[],
  quizType: quizType | undefined
): boolean[] {
  if (quizType != "form") return questions.map(() => true);
  const visibility: boolean[] = [];
  questions.forEach((question, position) => {
    const condition = question.display_condition;
    if (condition == null) {
      visibility.push(true);
      return;
    }
    const source = condition.source_position;
    if (
      typeof source != "number" ||
      source < 0 ||
      source >= position ||
      !visibility[source]
    ) {
      visibility.push(false);
      return;
    }
    const selected = answerOptionIndices(answers[source] ?? null, questions[source].type);
    visibility.push(
      selected.some((index) => condition.option_indices.includes(index))
    );
  });
  return visibility;
}

/** 1 -> "a", 26 -> "z", 27 -> "aa" */
function toLetters(count: number): string {
  let letters = "";
  while (count > 0) {
    count -= 1;
    letters = String.fromCharCode(97 + (count % 26)) + letters;
    count = Math.floor(count / 26);
  }
  return letters;
}

/**
 * The number shown for every question by flat position ("2" in "Q.2: ") — the single
 * source for the single-page header and every warning that names a question. Display
 * only: answers and BigQuery address questions by flat position, never by this label.
 *
 * Questions with no display_condition are numbered 1, 2, 3… in position order. A form's
 * follow-up is numbered under its trigger: a letter under a top-level question (2a, 2b), a
 * number under a follow-up (2a.1), alternating with depth. A quiz that is not a form, or a
 * form without conditions, is numbered position + 1 as before. A condition the evaluator can
 * never satisfy (bad / forward source_position) keeps position + 1; that question is never
 * shown.
 */
export function computeQuestionLabels(
  questions: Question[],
  quizType: quizType | undefined
): string[] {
  const labels: string[] = [];
  const depths: number[] = [];
  const numFollowUps: number[] = [];
  let numTopLevel = 0;
  questions.forEach((question, position) => {
    numFollowUps.push(0);
    const condition = quizType == "form" ? question.display_condition : null;
    if (condition == null) {
      numTopLevel += 1;
      labels.push(String(numTopLevel));
      depths.push(0);
      return;
    }
    const source = condition.source_position;
    if (typeof source != "number" || source < 0 || source >= position) {
      labels.push(String(position + 1));
      depths.push(0);
      return;
    }
    numFollowUps[source] += 1;
    const depth = depths[source] + 1;
    labels.push(
      depth % 2 == 1
        ? `${labels[source]}${toLetters(numFollowUps[source])}`
        : `${labels[source]}.${numFollowUps[source]}`
    );
    depths.push(depth);
  });
  return labels;
}

/**
 * Whether a quiz fetched without single-page mode must be re-shown in it. Conditional
 * questions are only hidden in single-page mode; the question-by-question view would show
 * a hidden question and End Test would then submit null for it, losing what the student
 * typed. So a form with any display_condition always uses single-page mode (OMR mode
 * already renders through the single-page view).
 */
export function shouldForceSinglePageMode(
  quizDetails: QuizAPIResponse,
  { singlePageMode, omrMode }: { singlePageMode: boolean, omrMode: boolean }
): boolean {
  if (singlePageMode || omrMode || quizDetails.metadata?.quiz_type != "form") return false;
  return (quizDetails.question_sets ?? []).some((questionSet) =>
    (questionSet.questions ?? []).some((question) => question.display_condition != null)
  );
}

/**
 * The answer to save for a question at submission. A question hidden by display_condition
 * always saves null, so a stale answer never reaches the backend / BigQuery — e.g. one
 * restored locally after the save that cleared it failed.
 */
export function answerToSubmit(
  answer: submittedAnswer,
  isVisible: boolean
): submittedAnswer {
  return isVisible ? answer : null;
}

export function isQuestionResponseComplete(
  questionDetail: Question,
  userAnswer: submittedAnswer
): boolean {
  if (userAnswer == null) return false;

  if (questionDetail.type == "subjective") {
    return typeof userAnswer == "string" && userAnswer.trim() != "";
  }

  if (
    questionDetail.type == "numerical-integer" ||
    questionDetail.type == "numerical-float"
  ) {
    return typeof userAnswer == "number";
  }

  if (questionDetail.type == questionType.SINGLE_CHOICE_OTHER) {
    const selected = answerOptionIndices(userAnswer, questionDetail.type);
    if (selected.length == 0) return false;
    // the LAST option is "Other": choosing it requires the free text to be filled
    const otherIndex = (questionDetail.options || []).length - 1;
    if (otherIndex >= 0 && selected.includes(otherIndex)) {
      const otherText = (userAnswer as OtherOptionAnswer).other_text;
      return typeof otherText == "string" && otherText.trim() != "";
    }
    return true;
  }

  if (
    questionDetail.type == "matrix-rating" ||
    questionDetail.type == "matrix-numerical" ||
    questionDetail.type == "matrix-subjective"
  ) {
    if (typeof userAnswer != "object" || Array.isArray(userAnswer)) return false;
    const matrixAnswer = userAnswer as Record<string, number | string>; // row -> value
    const matrixRows = questionDetail.matrix_rows || [];
    if (matrixRows.length == 0) return false;
    // blank row labels are stored under the "__default__" key by the answer
    // entry components (e.g. single-row matrix ratings)
    const rowValues = matrixRows.map((row) =>
      row in matrixAnswer ? matrixAnswer[row] : (!row || !row.trim() ? matrixAnswer.__default__ : undefined)
    );
    if (
      questionDetail.type == "matrix-subjective" ||
      questionDetail.type == "matrix-numerical"
    ) {
      return rowValues.every((val) => typeof val == "string" && val.trim() != "");
    }
    return rowValues.every((val) => typeof val == "number");
  }

  return Array.isArray(userAnswer) && userAnswer.length > 0;
}

/**
 * Given a question and its corresponding answer, this method checks if the answer is correct.
 * If the question is ungraded, the method returns that the evaluation is invalid.
 * For graded questions, it returns whether the question has been answered and if it has been,
 * it also returns whether the answer is correct.
 *
 * @param {Question} questionDetail - the data corresponding to the question which needs to be checked
 * @param {submittedAnswer} userAnswer - the answer which needs to be evaluated
 * @returns {answerEvaluation}
 */
export function isQuestionAnswerCorrect(
  questionDetail: Question,
  userAnswer: submittedAnswer,
  doesPartialMarkingExist: Boolean
): answerEvaluation {
  const answerEvaluation = {
    valid: false,
    answered: false,
  } as answerEvaluation;

  if (questionDetail.graded) {
    answerEvaluation.valid = true;

    // Handle invalid format: if a number is submitted for single-choice/multi-choice, mark as wrong
    if (typeof userAnswer == "number" && (questionDetail.type == "single-choice" || questionDetail.type == "multi-choice" || questionDetail.type == "matrix-match")) {
      answerEvaluation.answered = true;
      answerEvaluation.isCorrect = false; // Invalid format = wrong answer
    } else if (userAnswer != null && typeof userAnswer != "number") {
      answerEvaluation.answered = true;

      if (questionDetail.type == "single-choice") {
        const correctAnswer: CorrectAnswerType = questionDetail.correct_answer;
        if (isEqual(userAnswer, correctAnswer)) {
          answerEvaluation.isCorrect = true;
        } else answerEvaluation.isCorrect = false;
      } else if (questionDetail.type == "multi-choice") {
        const correctAnswer: CorrectAnswerType = questionDetail.correct_answer;
        if (isEqual(userAnswer, correctAnswer)) {
          answerEvaluation.isCorrect = true;
        } else if (doesPartialMarkingExist && Array.isArray(userAnswer) && Array.isArray(correctAnswer) && userAnswer.length > 0) {
          // check if user answer is a subset of correct answer
          // ensure userAnswer and correctAnswer are treated as array of numbers here
          const isSubset = (userAnswer as number[]).every((option) =>
            (correctAnswer as number[]).includes(option)
          );
          if (isSubset) {
            answerEvaluation.isCorrect = false;
            answerEvaluation.isPartiallyCorrect = true;
          } else answerEvaluation.isCorrect = false;
        } else {
          answerEvaluation.isCorrect = false;
        }
      } else if (questionDetail.type == "matrix-match") {
        const correctAnswer: CorrectAnswerType = questionDetail.correct_answer;
        if (isEqual(userAnswer, correctAnswer)) {
          answerEvaluation.isCorrect = true;
        } else if (doesPartialMarkingExist && Array.isArray(userAnswer) && Array.isArray(correctAnswer) && userAnswer.length > 0) {
          // check if user answer is a subset of correct answer
          const isSubset = (userAnswer as string[]).every((option) =>
            (correctAnswer as string[]).includes(option)
          );
          if (isSubset) {
            answerEvaluation.isCorrect = false;
            answerEvaluation.isPartiallyCorrect = true;
          } else answerEvaluation.isCorrect = false;
        } else {
          answerEvaluation.isCorrect = false;
        }
      } else if (questionDetail.type == "matrix-rating") {
        const correctAnswer: CorrectAnswerType = questionDetail.correct_answer;
        if (isEqual(userAnswer, correctAnswer)) {
          answerEvaluation.isCorrect = true;
        } else {
          answerEvaluation.isCorrect = false;
        }
      } else if (questionDetail.type == "matrix-numerical") {
        const correctAnswer: CorrectAnswerType = questionDetail.correct_answer;
        if (isEqual(userAnswer, correctAnswer)) {
          answerEvaluation.isCorrect = true;
        } else {
          answerEvaluation.isCorrect = false;
        }
      } else if (questionDetail.type == "matrix-subjective") {
        if (
          userAnswer &&
          typeof userAnswer === "object" &&
          !Array.isArray(userAnswer)
        ) {
          const hasResponse = Object.values(userAnswer).some(
            (val) => typeof val === "string" && val.trim() !== ""
          );
          answerEvaluation.isCorrect = hasResponse;
        } else {
          answerEvaluation.isCorrect = false;
        }
      } else if (
        questionDetail.type == "subjective" &&
        typeof userAnswer == "string" &&
        userAnswer.trim() != ""
      ) {
        // for subjective questions, as long as the viewer has given any answer
        // their response is considered correct
        answerEvaluation.isCorrect = true;
      }
    } else if (
      (questionDetail.type == "numerical-integer" ||
        questionDetail.type == "numerical-float") &&
      typeof userAnswer == "number" &&
      userAnswer != null
    ) {
      answerEvaluation.answered = true;
      const correctAnswer: CorrectAnswerType = questionDetail.correct_answer;

      if (questionDetail.type == "numerical-float" &&
          typeof correctAnswer == "number" &&
          Math.abs(userAnswer - correctAnswer) < 0.05
      ) {
        answerEvaluation.isCorrect = true; // tolerance of error = 0.05
      } else if (questionDetail.type == "numerical-integer" &&
          userAnswer == correctAnswer
      ) {
        answerEvaluation.isCorrect = true;
      } else answerEvaluation.isCorrect = false;
    }
  } else {
    // Ungraded questions: mark as answered if any value provided (including invalid formats)
    if (userAnswer != null && typeof userAnswer != "number") {
      answerEvaluation.answered = true;
    } else if (typeof userAnswer == "number") {
      // For ungraded questions, still mark as answered even if format is invalid
      answerEvaluation.answered = true;
    } else if (
      (questionDetail.type == "matrix-rating" || questionDetail.type == "matrix-numerical" || questionDetail.type == "matrix-subjective") &&
      userAnswer != null &&
      typeof userAnswer == "object" &&
      !Array.isArray(userAnswer) &&
      Object.keys(userAnswer).length > 0
    ) {
      answerEvaluation.answered = true;
    }
  }
  return answerEvaluation;
}

/**
 * If all the details of a question has been fetched or not
 * @param {number} qsetIndex - the index of question set (map to consider)
 * @param {number} questionIndex - the index of a question in the question set
 * @returns {boolean} - whether the question details have been fetched or not
 */
export function isQuestionFetched(qsetIndex: number, questionIndex: number) {
  const bucketToCheck = Math.floor(questionIndex / store.state.bucketSize)
  if (
    'questionBucketingMaps' in store.state &&
    store.state.questionBucketingMaps[qsetIndex] != null &&
    store.state.questionBucketingMaps[qsetIndex][bucketToCheck] != null &&
    'isFetched' in store.state.questionBucketingMaps[qsetIndex][bucketToCheck]
  ) return store.state.questionBucketingMaps[qsetIndex][bucketToCheck].isFetched
  return true
}

/**
 * Dividing all the questions in a set into buckets of a specific size.
 * A map is created which tracks the starting and ending indices of buckets in each question set array.
 * That map also tracks if a bucket's question's details have been fetched or not.
 * This map for each set is stored in the vue store.
 * @param {Array<number>} totalQuestionsInEachSet - array of total number of questions in each question set
 */
export function createQuestionBuckets(totalQuestionsInEachSet: Array<number>) {
  const questionBucketingMaps = [] as Array<QuestionBucketingMap>

  // calculate total buckets possible
  for (const [mapIndex, totalQuestions] of totalQuestionsInEachSet.entries()) {
    const totalBucketsPossible = Math.ceil(totalQuestions / store.state.bucketSize)

    // create the bucket map
    const questionBucketingMap = {} as QuestionBucketingMap
    for (let bucketIndex = 0; bucketIndex < totalBucketsPossible; bucketIndex++) {
      questionBucketingMap[bucketIndex] = {
        start: (bucketIndex * store.state.bucketSize),
        end: (
          bucketIndex == totalBucketsPossible - 1 &&
        totalQuestions % store.state.bucketSize != 0
        )
          ? totalQuestions - 1
          : (bucketIndex * store.state.bucketSize) + (store.state.bucketSize - 1),
        isFetched: !bucketIndex,
      }
    }
    questionBucketingMaps.push(questionBucketingMap);
  }

  store.dispatch("setQuestionBucketMap", questionBucketingMaps)
}
