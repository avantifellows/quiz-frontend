import { Question, submittedAnswer, answerEvaluation } from "../../types";
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
      colors: colors,
    });
    confettiHandler({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
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
  userAnswer: submittedAnswer
): answerEvaluation {
  const answerEvaluation = {
    valid: false,
    answered: false,
  } as answerEvaluation;

  if (questionDetail.graded) {
    answerEvaluation.valid = true;

    if (userAnswer != null && typeof userAnswer != "number") {
      answerEvaluation.answered = true;

      if (
        (questionDetail.type == "single-choice" ||
          questionDetail.type == "multi-choice") &&
        userAnswer.length > 0
      ) {
        const correctAnswer = questionDetail.correct_answer;
        if (isEqual(userAnswer, correctAnswer)) {
          answerEvaluation.isCorrect = true;
        } else answerEvaluation.isCorrect = false;
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
      const correctAnswer = questionDetail.correct_answer;
      if (userAnswer == correctAnswer) {
        answerEvaluation.isCorrect = true;
      } else answerEvaluation.isCorrect = false;
    }
  }
  return answerEvaluation;
}
