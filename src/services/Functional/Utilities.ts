import store from "@/store/index";
import {
  Question,
  submittedAnswer,
  CorrectAnswerType,
  answerEvaluation,
  QuestionBucketingMap,
} from "@/types";
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
  // console.log("questionDetail", questionDetail);
  // console.log("userAnswer", userAnswer);
  if (questionDetail.graded) {
    answerEvaluation.valid = true;

    if (userAnswer != null && typeof userAnswer != "number") {
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
        } else if (
          doesPartialMarkingExist &&
          Array.isArray(userAnswer) &&
          Array.isArray(correctAnswer) &&
          userAnswer.length > 0
        ) {
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
        } else if (
          doesPartialMarkingExist &&
          Array.isArray(userAnswer) &&
          Array.isArray(correctAnswer) &&
          userAnswer.length > 0
        ) {
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

      if (
        questionDetail.type == "numerical-float" &&
        typeof correctAnswer == "number" &&
        Math.abs(userAnswer - correctAnswer) < 0.05
      ) {
        answerEvaluation.isCorrect = true; // tolerance of error = 0.05
      } else if (
        questionDetail.type == "numerical-integer" &&
        userAnswer == correctAnswer
      ) {
        answerEvaluation.isCorrect = true;
      } else answerEvaluation.isCorrect = false;
    }
  } else {
    if (userAnswer != null && typeof userAnswer != "number") {
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
  const bucketToCheck = Math.floor(questionIndex / store.state.bucketSize);
  if (
    "questionBucketingMaps" in store.state &&
    store.state.questionBucketingMaps[qsetIndex] != null &&
    store.state.questionBucketingMaps[qsetIndex][bucketToCheck] != null &&
    "isFetched" in store.state.questionBucketingMaps[qsetIndex][bucketToCheck]
  ) {
    return store.state.questionBucketingMaps[qsetIndex][bucketToCheck]
      .isFetched;
  }
  return true;
}

/**
 * Dividing all the questions in a set into buckets of a specific size.
 * A map is created which tracks the starting and ending indices of buckets in each question set array.
 * That map also tracks if a bucket's question's details have been fetched or not.
 * This map for each set is stored in the vue store.
 * @param {Array<number>} totalQuestionsInEachSet - array of total number of questions in each question set
 */
export function createQuestionBuckets(totalQuestionsInEachSet: Array<number>) {
  // number of questions in each set - 30
  const questionBucketingMaps = [] as Array<QuestionBucketingMap>;

  // calculate total buckets possible
  for (const [mapIndex, totalQuestions] of totalQuestionsInEachSet.entries()) {
    const totalBucketsPossible = Math.ceil(
      totalQuestions / store.state.bucketSize // 30/10 = 3
    );

    // create the bucket map
    const questionBucketingMap = {} as QuestionBucketingMap;
    for (
      let bucketIndex = 0;
      bucketIndex < totalBucketsPossible;
      bucketIndex++
    ) {
      questionBucketingMap[bucketIndex] = {
        start: bucketIndex * store.state.bucketSize,
        end:
          bucketIndex == totalBucketsPossible - 1 &&
          totalQuestions % store.state.bucketSize != 0
            ? totalQuestions - 1
            : bucketIndex * store.state.bucketSize +
              (store.state.bucketSize - 1),
        isFetched: !bucketIndex,
      };
    }
    questionBucketingMaps.push(questionBucketingMap);
    // console.log("questionBucketingMap", questionBucketingMap);
  }

  store.dispatch("setQuestionBucketMap", questionBucketingMaps);
}
