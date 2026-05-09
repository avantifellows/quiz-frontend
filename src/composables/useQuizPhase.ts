import { ref, computed } from "vue";
import type { QuizPhase } from "@/types";

/**
 * Composable for managing the quiz phase state machine.
 *
 * Encapsulates all valid state transitions and prevents invalid ones.
 * This replaces ad-hoc boolean flags with a single phase enum.
 *
 * Usage:
 *   const { phase, setPhase, canTransitionTo, resetPhase } = useQuizPhase();
 */
export function useQuizPhase() {
  const phase = ref<QuizPhase>("IDLE");

  /**
   * Valid transitions map.
   * Each key lists the phases it can transition TO.
   */
  const validTransitions: Record<QuizPhase, QuizPhase[]> = {
    IDLE: ["ACTIVE"],
    ACTIVE: ["VALIDATING", "COMPLETE"],
    VALIDATING: ["ANSWERED", "VALIDATION_ERROR"],
    ANSWERED: ["ACTIVE", "COMPLETE"],
    VALIDATION_ERROR: ["VALIDATING", "ACTIVE"],
    COMPLETE: ["REVIEW"],
    REVIEW: [], // terminal state
  };

  /**
   * Check if a transition from current phase to target is valid.
   */
  function canTransitionTo(target: QuizPhase): boolean {
    return validTransitions[phase.value].includes(target);
  }

  /**
   * Set the phase, with optional validation of the transition.
   * @param newPhase - Target phase
   * @param strict - If true, throws on invalid transition. Default false for backward compat.
   */
  function setPhase(newPhase: QuizPhase, strict = false): void {
    if (strict && !canTransitionTo(newPhase)) {
      console.warn(
        `[useQuizPhase] Invalid transition: ${phase.value} → ${newPhase}. ` +
        `Valid targets: ${validTransitions[phase.value].join(", ")}`
      );
      return;
    }
    phase.value = newPhase;
  }

  /**
   * Reset to initial state.
   */
  function resetPhase(): void {
    phase.value = "IDLE";
  }

  // ─── Convenience Getters ────────────────────────────────────────

  const isIdle = computed(() => phase.value === "IDLE");
  const isActive = computed(() => phase.value === "ACTIVE");
  const isValidating = computed(() => phase.value === "VALIDATING");
  const isAnswered = computed(() => phase.value === "ANSWERED");
  const hasError = computed(() => phase.value === "VALIDATION_ERROR");
  const isComplete = computed(() => phase.value === "COMPLETE");
  const isReview = computed(() => phase.value === "REVIEW");

  return {
    phase,
    setPhase,
    canTransitionTo,
    resetPhase,
    isIdle,
    isActive,
    isValidating,
    isAnswered,
    hasError,
    isComplete,
    isReview,
  };
}
