import { ref } from "vue";
import type { ValidationResponse, ValidationError, submittedAnswer } from "@/types";
import ValidationAPIService from "@/services/API/Validation";
import { useQuizPhase } from "./useQuizPhase";

/**
 * Composable for handling async answer validation.
 *
 * Provides:
 * - `handleAnswerSelect()` — validates an answer against the backend
 * - `retryValidation()` — retries with the last pending answer
 * - Reactive state for validation results, errors, and pending answers
 * - Double-submission prevention
 * - Exponential backoff retry logic
 *
 * Usage:
 *   const {
 *     validationResult, validationError, pendingAnswer,
 *     handleAnswerSelect, retryValidation
 *   } = useValidation(quizId, sessionToken);
 */
export function useValidation(
  quizId: string,
  sessionTokenGetter: () => string
) {
  const { phase, setPhase, isValidating } = useQuizPhase();

  const validationResult = ref<ValidationResponse | null>(null);
  const validationError = ref<ValidationError | null>(null);
  const pendingAnswer = ref<submittedAnswer>(null);
  const pendingQuestionId = ref<string | null>(null);
  const retryCount = ref(0);
  const maxRetries = 3;

  /**
   * Submit an answer for server-side validation.
   * Prevents double submission while a validation is in-flight.
   */
  async function handleAnswerSelect(
    questionId: string,
    selected: submittedAnswer
  ): Promise<void> {
    // Prevent double submission
    if (isValidating.value) return;

    pendingAnswer.value = selected;
    pendingQuestionId.value = questionId;
    validationResult.value = null;
    validationError.value = null;
    retryCount.value = 0;
    setPhase("VALIDATING");

    await executeValidation();
  }

  /**
   * Internal: execute the validation API call.
   */
  async function executeValidation(): Promise<void> {
    try {
      const result = await ValidationAPIService.validateAnswer(
        quizId,
        pendingQuestionId.value!,
        pendingAnswer.value,
        sessionTokenGetter()
      );
      validationResult.value = result;
      setPhase("ANSWERED");
    } catch (err: unknown) {
      validationError.value = err as ValidationError;
      setPhase("VALIDATION_ERROR");
    }
  }

  /**
   * Retry the last failed validation with exponential backoff.
   */
  async function retryValidation(): Promise<void> {
    if (!pendingAnswer.value || !pendingQuestionId.value) return;
    if (retryCount.value >= maxRetries) {
      validationError.value = {
        code: "NETWORK_ERROR",
        message: `Maximum retries (${maxRetries}) exceeded. Please check your connection.`,
        retryable: false,
      };
      return;
    }

    retryCount.value++;
    const backoffMs = Math.pow(2, retryCount.value) * 500; // 1s, 2s, 4s
    await new Promise((resolve) => setTimeout(resolve, backoffMs));

    setPhase("VALIDATING");
    await executeValidation();
  }

  /**
   * Reset all validation state (e.g., when moving to next question).
   */
  function resetValidation(): void {
    validationResult.value = null;
    validationError.value = null;
    pendingAnswer.value = null;
    pendingQuestionId.value = null;
    retryCount.value = 0;
    setPhase("ACTIVE");
  }

  return {
    phase,
    validationResult,
    validationError,
    pendingAnswer,
    pendingQuestionId,
    retryCount,
    handleAnswerSelect,
    retryValidation,
    resetValidation,
    isValidating,
  };
}
