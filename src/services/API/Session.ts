import { apiClient } from "./RootClient";
import { sessionsEndpoint, sessionAnswersEndpoint } from "./Endpoints";
import {
  SessionAPIResponse,
  SessionAnswerAPIResponse,
  UpdateSessionAPIPayload,
  UpdateSessionAPIResponse,
  UpdateSessionAnswerAPIPayload,
  UpdateSessionAnswersAtSpecificPositionsAPIPayload,
  eventType,
  QuestionSetMetricPayload,
  SessionMetricsPayload
} from "@/types";

export default {
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
   * @param {UpdateSessionAPIPayload} payload - contains start/resume/end event information
   * @returns {Promise<UpdateSessionAPIResponse>} data corresponding to the updated session response
   */
  async updateSession(
    sessionId: string,
    payload: UpdateSessionAPIPayload
  ): Promise<UpdateSessionAPIResponse> {
    const updatedPayload: {
      event: eventType;
      metrics?: SessionMetricsPayload | null;
    } = {
      event: payload.event
    };
    if (payload.metrics) {
      const sessionMetrics: SessionMetricsPayload = {
        qset_metrics: [],
        total_answered: 0,
        total_skipped: 0,
        total_correct: 0,
        total_wrong: 0,
        total_partially_correct: 0,
        total_marked_for_review: 0,
        total_marks: 0,
      };

      payload.metrics.forEach(metric => {
        const qsetMetric: QuestionSetMetricPayload = {
          name: metric.name || "",
          qset_id: metric.qset_id,
          marks_scored: metric.marksScored,
          num_answered: metric.numAnswered,
          num_skipped: metric.maxQuestionsAllowedToAttempt - metric.numAnswered,
          num_correct: metric.correctlyAnswered,
          num_wrong: metric.wronglyAnswered,
          num_partially_correct: metric.partiallyAnswered,
          num_marked_for_review: metric.numQuestionsMarkedForReview,
          attempt_rate: Math.round(metric.attemptRate * 100) / 100,
          accuracy_rate: Math.round(metric.accuracyRate * 100) / 100,
        };

        sessionMetrics.qset_metrics.push(qsetMetric);
        sessionMetrics.total_answered += metric.numAnswered;
        sessionMetrics.total_skipped += metric.maxQuestionsAllowedToAttempt - metric.numAnswered;
        sessionMetrics.total_correct += metric.correctlyAnswered;
        sessionMetrics.total_wrong += metric.wronglyAnswered;
        sessionMetrics.total_partially_correct += metric.partiallyAnswered;
        sessionMetrics.total_marked_for_review += metric.numQuestionsMarkedForReview;
        sessionMetrics.total_marks += metric.marksScored;
      });

      updatedPayload.metrics = sessionMetrics as SessionMetricsPayload;
    }
    const response = await apiClient().patch(
      sessionsEndpoint + sessionId,
      updatedPayload
    );
    return response.data;
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
        payload
      );
      return { status: response.status };
    } catch (error: any) {
      if (error.code == 'ECONNABORTED') {
        return { status: 500 }; // request timeout
      } else {
        return { status: 400 }; // bad request
      }
    }
  }
};
