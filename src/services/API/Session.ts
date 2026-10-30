import { apiClient } from "./RootClient";
import { sessionsEndpoint, sessionAnswersEndpoint } from "./Endpoints";
import {
  SessionAPIResponse,
  SessionAnswerAPIResponse,
  RevealAnswerAPIResponse,
  QuizPreflightAPIResponse,
  UpdateSessionAPIPayload,
  UpdateSessionAPIResponse,
  UpdateSessionAnswerAPIPayload,
  UpdateSessionAnswersAtSpecificPositionsAPIPayload
} from "@/types";

// End Test ships every answer in one payload (up to 180 for NEET) and then ends the
// session; under exam-scale load these two calls need more than the default 4s before
// the frontend gives up and (wrongly) tells the student their connection is poor.
const END_TEST_TIMEOUT_MS = 30000;

export default {
  /**
   * Preflight helper (Alt 1): tell FE whether to request quiz with answers included.
   */
  async quizPreflight(
    quizId: string,
    userId: string,
  ): Promise<{ status: number; data?: QuizPreflightAPIResponse }> {
    try {
      const response = await apiClient().get(
        `${sessionsEndpoint}preflight`,
        {
          params: {
            quiz_id: quizId,
            user_id: userId,
          }
        }
      );
      return { status: response.status, data: response.data };
    } catch (error: any) {
      if (error.code == 'ECONNABORTED') {
        return { status: 500 }; // request timeout
      } else if (error.response?.status != null) {
        return { status: error.response.status, data: error.response.data };
      } else {
        return { status: 400 }; // bad request
      }
    }
  },

  /**
   * Returns a map of {quizId: hasQuizEnded} for every quiz the user has a session for.
   * Used to decide whether a chained post-test survey still needs to be shown: if the
   * survey's quiz id is present and true, the student already submitted it, so we skip it.
   * Failure is treated as "no attempts" by the caller so a flaky read never blocks the
   * scorecard (it just risks showing the survey again, which the backend form dedup handles).
   */
  async getUserQuizAttempts(
    userId: string,
  ): Promise<{ status: number; data?: Record<string, boolean> }> {
    try {
      const response = await apiClient().get(
        `${sessionsEndpoint}user/${userId}/quiz-attempts`,
      );
      return { status: response.status, data: response.data };
    } catch (error: any) {
      if (error.code == 'ECONNABORTED') {
        return { status: 500 }; // request timeout
      } else if (error.response?.status != null) {
        return { status: error.response.status, data: error.response.data };
      } else {
        return { status: 400 }; // bad request
      }
    }
  },

  /**
   * returns the details for a quiz
   * @param {string} quizId - id of the quiz for which the session is to be created
   * @param {string} userId - id of the user for which the session is to be created
   * @param {boolean} omrMode - whether the session is being accessed in omrMode
   * @returns {Promise<SessionAPIResponse>} data corresponding to the session
   */
  async createSession(
    quizId: string,
    userId: string,
    omrMode: boolean = false
  ): Promise<SessionAPIResponse> {
    const response = await apiClient().post(sessionsEndpoint, {
      user_id: userId,
      quiz_id: quizId,
      omr_mode: omrMode
    });
    return response.data;
  },

  /**
   * @param {string} sessionId - id of the session to be updated
   * @param {UpdateSessionAPIPayload} payload - the event (start/resume/end/dummy) plus optional
   *   answer_updates folded onto the same request (per-question time_spent sent with the heartbeat)
   * @returns {Promise<{status: number, data?: UpdateSessionAPIResponse}>} response status and data
   */
  async updateSession(
    sessionId: string,
    payload: UpdateSessionAPIPayload
  ): Promise<{status: number, data?: UpdateSessionAPIResponse}> {
    try {
      const response = await apiClient().patch(
        sessionsEndpoint + sessionId,
        payload,
        { timeout: END_TEST_TIMEOUT_MS } // ending the session must not time out at 4s under load
      );
      return { status: response.status, data: response.data };
    } catch (error: any) {
      if (error.code == 'ECONNABORTED') {
        return { status: 500 }; // request timeout
      } else {
        return { status: 400 }; // bad request
      }
    }
  },

  /**
   * @param {string} sessionId - id of the session to be fetched
   * @returns {Promise<{status: number, data?: SessionAPIResponse}>} response status and data
   */
  async getSession(
    sessionId: string
  ): Promise<{status: number, data?: SessionAPIResponse}> {
    try {
      const response = await apiClient().get(
        sessionsEndpoint + sessionId
      );
      return { status: response.status, data: response.data };
    } catch (error: any) {
      if (error.code == 'ECONNABORTED') {
        return { status: 500 }; // request timeout
      } else if (error.response?.status != null) {
        // Preserve the real status (e.g. 409 = quiz already ended) and its body,
        // so callers can tell "already submitted" apart from "poor connection".
        return { status: error.response.status, data: error.response.data };
      } else {
        return { status: 400 }; // bad request
      }
    }
  },

  /**
   * @param {string} sessionId - id of the session for which the sessionAnswer is to be updated
   * @param {number} positionIndex - At what index is the question present in the quiz/question set.
   *                                 This index corresponds to the index of sessionAnswer in session
   * @param {UpdateSessionAnswerAPIPayload} payload - contains the answer {submittedAnswer} that
   * needs to be updated and a boolean variable to indicate that the question is visited
   * Further, it contains time_spent {number} variable indicating time spent for this question
   * @returns {Promise<SessionAnswerAPIResponse>} - response status of request
   */
  async updateSessionAnswer(
    sessionId: string,
    positionIndex: number,
    payload: UpdateSessionAnswerAPIPayload
  ): Promise<SessionAnswerAPIResponse> {
    try {
      const response = await apiClient().patch(
        sessionAnswersEndpoint + sessionId + "/" + positionIndex,
        payload
      );
      return { status: response.status };
    } catch (error: any) {
      if (error.code == 'ECONNABORTED') {
        return { status: 500 }; // request timeout
      } else if (error.response?.status != null) {
        return { status: error.response.status }; // preserve real status (e.g. 409 quiz ended)
      } else {
        return { status: 400 }; // bad request
      }
    }
  },

  /**
 * @param {string} sessionId - id of the session for which the sessionAnswers are to be updated at specific positions
 * @param {UpdateSessionAnswersAtSpecificPositionsAPIPayload} payload - contains list of response objects, each object
 * includes a position, an answer, whether the corresponding question was visited, and time spent on the question
 * @returns {Promise<SessionAnswerAPIResponse>} - response status of request
 */
  async updateSessionAnswersAtSpecificPositions(
    sessionId: string,
    payload: UpdateSessionAnswersAtSpecificPositionsAPIPayload
  ): Promise<SessionAnswerAPIResponse> {
    try {
      const response = await apiClient().patch(
        `${sessionAnswersEndpoint}${sessionId}/update-multiple-answers`,
        payload,
        { timeout: END_TEST_TIMEOUT_MS } // bulk End Test write (up to 180 answers) needs > 4s
      );
      return { status: response.status };
    } catch (error: any) {
      if (error.code == 'ECONNABORTED') {
        return { status: 500 }; // request timeout
      } else if (error.response?.status != null) {
        return { status: error.response.status }; // preserve real status (e.g. 409 quiz ended)
      } else {
        return { status: 400 }; // bad request
      }
    }
  },

  /**
   * Homework reveal endpoint (Option B2): fetch raw correct_answer (and solution if enabled)
   * for a single question after it has been submitted.
   */
  async revealAnswer(
    sessionId: string,
    positionIndex: number,
  ): Promise<{ status: number; data?: RevealAnswerAPIResponse }> {
    try {
      const response = await apiClient().get(
        `${sessionsEndpoint}${sessionId}/reveal/${positionIndex}`,
        {}
      );
      return { status: response.status, data: response.data };
    } catch (error: any) {
      if (error.code == 'ECONNABORTED') {
        return { status: 500 }; // request timeout
      } else {
        return { status: 400 }; // bad request
      }
    }
  }
};
