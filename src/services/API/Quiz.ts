import { apiClient } from "./RootClient";
import { quizEndpoint, reviewQuizEndpoint } from "./Endpoints";
import { QuizAPIResponse } from "../../types";

export default {
  /**
   * returns the details for a quiz
   * @param {string} quizId - uuid of the quiz to be fetched
   * @returns {Promise<QuizAPIResponse>} data corresponding to the quiz
   */
  async getQuiz(quizId: string): Promise<QuizAPIResponse> {
    const response = await apiClient().get(quizEndpoint + quizId);
    return response.data;
  },

  async getReviewQuiz(quizId: string): Promise<QuizAPIResponse> {
    const response = await apiClient().get(reviewQuizEndpoint + quizId);
    return response.data;
  }
};
