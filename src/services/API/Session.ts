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
   * @param {string} sessionId - id of the session for which the sessionAnswer is to be updated
   * @param {number} positionIndex - At what index is the question present in the quiz/question set.
   *                                 This index corresponds to the index of sessionAnswer in session
   * @param {UpdateSessionAnswerAPIPayload} payload - contains the answer {submittedAnswer} that
   * needs to be updated and a boolean variable to indicate that the question is visited
   * @returns {Promise<SessionAnswerAPIResponse>} - the updated sessionAnswer instance
   */
  async updateSessionAnswer(
    sessionId: string,
    positionIndex: number,
    payload: UpdateSessionAnswerAPIPayload
  ): Promise<SessionAnswerAPIResponse> {
    const response = await apiClient().patch(
      sessionAnswersEndpoint + sessionId + "/" + positionIndex,
      payload
    );
    return response.data;
  },
};
