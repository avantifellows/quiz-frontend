import { apiClient } from "./RootClient";
import { sessionsEndpoint, sessionAnswersEndpoint } from "./Endpoints";
import {
  SessionAPIResponse,
  SessionAnswerAPIResponse,
  UpdateSessionAnswerAPIPayload,
} from "../../types";

export default {
  /**
   * returns the details for a quiz
   * @param {string} quizId - id of the quiz for which the session is to be created
   * @param {string} userId - id of the user for which the session is to be created
   * @returns {Promise<SessionAPIResponse>} data corresponding to the session
   */
  async createSession(
    quizId: string,
    userId: string
  ): Promise<SessionAPIResponse> {
    const response = await apiClient().post(sessionsEndpoint, {
      user_id: userId,
      quiz_id: quizId,
    });
    return response.data;
  },

  /**
   * @param sessionId - id of the session to be updated
   * @param hasQuizEnded - whether the quiz has ended
   * @returns {Promise<SessionAPIResponse>} data corresponding to the updated session
   */
  async updateSession(
    sessionId: string,
    hasQuizEnded: boolean
  ): Promise<SessionAPIResponse> {
    const response = await apiClient().patch(sessionsEndpoint + sessionId, {
      has_quiz_ended: hasQuizEnded,
    });
    return response.data;
  },

  /**
   * @param {string} sessionAnswerId - id of the sessionAnswer instance to update
   * @param {submittedAnswer} answer - the answer that needs to be updated
   * @returns {Promise<SessionAnswerAPIResponse>} - the updated sessionAnswer instance
   */
  async updateSessionAnswer(
    sessionAnswerId: string,
    payload: UpdateSessionAnswerAPIPayload
  ): Promise<SessionAnswerAPIResponse> {
    const response = await apiClient().patch(
      sessionAnswersEndpoint + sessionAnswerId,
      payload
    );
    return response.data;
  },
};
