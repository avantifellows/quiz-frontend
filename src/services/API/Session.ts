import { apiClient } from "./RootClient";
import { sessionsEndpoint, sessionAnswersEndpoint } from "./Endpoints";
import {
  SessionAPIResponse,
  SessionAnswerAPIResponse,
  UpdateSessionAPIPayload,
  UpdateSessionAPIResponse,
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
   * @param {string} sessionId - id of the session to be updated
   * @param {UpdateSessionAPIPayload} payload - contains start/resume/end event information
   * @returns {Promise<UpdateSessionAPIResponse>} data corresponding to the updated session response
   */
  async updateSession(
    sessionId: string,
    payload: UpdateSessionAPIPayload
  ): Promise<UpdateSessionAPIResponse> {
    const response = await apiClient().patch(
      sessionsEndpoint + sessionId,
      payload
    );
    return response.data;
  },

  /**
   * @param {string} sessionAnswerId - id of the sessionAnswer instance to update
   * @param {UpdateSessionAnswerAPIPayload} payload - contains the answer {submittedAnswer} that
   * needs to be updated and a boolean variable to indicate that the question is visited
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
