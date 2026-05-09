import { apiClient } from "./RootClient";
import { validateEndpoint, reviewEndpoint } from "./Endpoints";
import type {
  ActiveQuestion,
  ReviewQuestion,
  ValidationResponse,
  ValidationError,
  submittedAnswer,
} from "@/types";

/**
 * Validation API Service
 *
 * Handles server-side answer validation and review data fetching.
 * This service is scaffolded for the future POST /validate backend endpoint.
 *
 * Current state:
 * - `validateAnswer()` is ready to use once the backend endpoint exists
 * - `fetchReviewData()` is ready to use once the backend review endpoint exists
 * - `stripAnswersFromQuestions()` is a defensive helper for the transition period
 */
export default {
  /**
   * Validate a user's answer against the backend.
   * Never reads correct_answer locally — the server performs the evaluation.
   *
   * @param quizId - ID of the quiz
   * @param questionId - ID of the question being answered
   * @param selectedAnswer - The user's selected answer(s)
   * @param sessionToken - Session token identifying the quiz attempt
   * @returns ValidationResponse with correct/incorrect status
   * @throws ValidationError with retryable flag
   */
  async validateAnswer(
    quizId: string,
    questionId: string,
    selectedAnswer: submittedAnswer,
    sessionToken: string
  ): Promise<ValidationResponse> {
    try {
      const response = await apiClient().post(
        `${validateEndpoint}${quizId}/validate`,
        {
          questionId,
          selectedAnswer,
          sessionToken,
        },
        {
          timeout: 10000, // 10 second timeout for low-bandwidth environments
        }
      );
      return response.data as ValidationResponse;
    } catch (error: any) {
      // Map axios errors to typed ValidationError
      const validationError: ValidationError = {
        code: error.code === "ECONNABORTED" ? "TIMEOUT" : "NETWORK_ERROR",
        message: error.message || "Validation request failed",
        retryable: true,
      };

      // Check for specific server error codes
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        validationError.code = "SESSION_EXPIRED";
        validationError.message = "Your quiz session has expired. Please restart.";
        validationError.retryable = false;
      } else if (error?.response?.status === 404) {
        validationError.code = "INVALID_QUESTION";
        validationError.message = "Question not found.";
        validationError.retryable = false;
      }

      throw validationError;
    }
  },

  /**
   * Fetch review data — only available after quiz completion.
   * Backend enforces the completion check; frontend just consumes.
   *
   * @param quizId - ID of the completed quiz
   * @param sessionToken - Session token for the completed attempt
   * @returns Array of ReviewQuestion with correct answers and user answers
   */
  async fetchReviewData(
    quizId: string,
    sessionToken: string
  ): Promise<ReviewQuestion[]> {
    const response = await apiClient().get(
      `${reviewEndpoint}${quizId}/review`,
      {
        params: { sessionToken },
      }
    );
    return response.data.questions as ReviewQuestion[];
  },

  /**
   * Defensive helper: strips correct_answer from question arrays.
   * Used as a safety net during the backend migration period where
   * the backend might still send correct_answer in active quiz payloads.
   *
   * @param questions - Array of question objects that may contain correct_answer
   * @returns Array of ActiveQuestion objects without correct_answer
   */
  stripAnswersFromQuestions<T extends Record<string, any>>(
    questions: T[]
  ): ActiveQuestion[] {
    return questions.map((q): ActiveQuestion => {
      // Destructure to remove answer-related fields
      // eslint-disable-next-line camelcase
      const { correct_answer: _correctAnswer, solution: _solution, user_answer: _userAnswer, is_correct: _isCorrect, ...safeQuestion } = q;
      return safeQuestion as unknown as ActiveQuestion;
    });
  },
};
