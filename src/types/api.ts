/**
 * API-specific type re-exports.
 *
 * Clean separation of API request/response types from domain types.
 * Import from "@/types/api" when working with API service layer.
 */
export type {
  QuizAPIResponse,
  RevealAnswerAPIResponse,
  QuizPreflightAPIResponse,
  SessionAPIResponse,
  SessionAnswerAPIResponse,
  UpdateSessionAPIPayload,
  UpdateSessionAPIResponse,
  UpdateSessionAnswerAPIPayload,
  UpdateSessionAnswersAtSpecificPositionsAPIPayload,
  ValidationResponse,
  ValidationError,
  FormResultResponse,
  OrganizationAPIResponse,
} from "@/types";
