/**
 * Domain-specific type re-exports.
 *
 * Clean separation of domain/business types from API types.
 * Import from "@/types/domain" when working with domain logic and components.
 */
export type {
  // Phase-based question types
  ActiveQuestion,
  ReviewQuestion,

  // Quiz state machine
  QuizPhase,

  // Legacy (deprecated) — use ActiveQuestion/ReviewQuestion instead
  Question,

  // Core domain types
  questionType,
  quizType,
  submittedAnswer,
  CorrectAnswerType,
  answerEvaluation,
  QuestionSet,
  QuestionSetIndexLimits,
  QuizMetadata,
  SubmittedResponse,
  MarkingScheme,
  TimeLimit,

  // Offline mode placeholders
  OfflinePackage,
  NetworkStatus,
} from "@/types";
