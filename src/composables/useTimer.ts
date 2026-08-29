import { ref, onUnmounted } from "vue";

/**
 * Composable for managing per-question time tracking.
 *
 * Extracted from Player.vue timer logic to enable reuse and testability.
 * Tracks time spent on each question with 1-second resolution.
 *
 * Usage:
 *   const {
 *     timeSpentEntries, startTimer, stopTimer, getTimeSpent, resetTimer
 *   } = useTimer();
 */

export interface TimerEntry {
  timeSpent: number;
  hasSynced: boolean;
}

export function useTimer() {
  const timeSpentEntries = ref<TimerEntry[]>([]);
  const timerInterval = ref<number | null>(null);
  const activeIndex = ref<number>(-1);

  /**
   * Initialize timer entries for all questions.
   * @param count - Number of questions in the quiz
   * @param existing - Optional pre-existing time entries (from session resume)
   */
  function initEntries(count: number, existing?: TimerEntry[]): void {
    if (existing && existing.length === count) {
      timeSpentEntries.value = [...existing];
    } else {
      timeSpentEntries.value = Array.from({ length: count }, () => ({
        timeSpent: 0,
        hasSynced: true,
      }));
    }
  }

  /**
   * Start tracking time for a specific question index.
   * Stops any currently running timer first.
   */
  function startTimer(questionIndex: number): void {
    stopTimer();

    if (questionIndex < 0 || questionIndex >= timeSpentEntries.value.length) {
      return;
    }

    activeIndex.value = questionIndex;

    timerInterval.value = window.setInterval(() => {
      if (activeIndex.value >= 0 && activeIndex.value < timeSpentEntries.value.length) {
        timeSpentEntries.value[activeIndex.value].timeSpent += 1;
        timeSpentEntries.value[activeIndex.value].hasSynced = false;
      }
    }, 1000);
  }

  /**
   * Stop the currently running timer.
   */
  function stopTimer(): void {
    if (timerInterval.value !== null) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
    activeIndex.value = -1;
  }

  /**
   * Get time spent on a specific question.
   */
  function getTimeSpent(questionIndex: number): number {
    if (questionIndex < 0 || questionIndex >= timeSpentEntries.value.length) {
      return 0;
    }
    return timeSpentEntries.value[questionIndex].timeSpent;
  }

  /**
   * Mark a specific entry as synced (after successful API call).
   */
  function markSynced(questionIndex: number): void {
    if (questionIndex >= 0 && questionIndex < timeSpentEntries.value.length) {
      timeSpentEntries.value[questionIndex].hasSynced = true;
    }
  }

  /**
   * Get all unsynced entries with their indices.
   * Useful for batch-syncing with the backend.
   */
  function getUnsyncedEntries(): Array<{ index: number; entry: TimerEntry }> {
    return timeSpentEntries.value
      .map((entry, index) => ({ index, entry }))
      .filter(({ entry }) => !entry.hasSynced);
  }

  /**
   * Reset all timer state.
   */
  function resetTimer(): void {
    stopTimer();
    timeSpentEntries.value = [];
  }

  // Clean up on component unmount
  onUnmounted(() => {
    stopTimer();
  });

  return {
    timeSpentEntries,
    activeIndex,
    initEntries,
    startTimer,
    stopTimer,
    getTimeSpent,
    markSynced,
    getUnsyncedEntries,
    resetTimer,
  };
}
