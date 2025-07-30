import { apiClient } from "./RootClient";
import { quizEndpoint } from "./Endpoints";
import { QuizAPIResponse } from "@/types";
import router from "@/router";

export default {
  /**
   * returns the details for a quiz
   * @param {string} quizId - uuid of the quiz to be fetched
   * @param {boolean} omrMode - whether quiz should be displayed in omr mode
   * @returns {Promise<QuizAPIResponse>} data corresponding to the quiz
   */
  async getQuiz({ quizId, omrMode = false }: { quizId: string, omrMode: boolean }): Promise<QuizAPIResponse> {
    try {
      const response = await apiClient().get(quizEndpoint + quizId, {
        params: { omr_mode: omrMode }
      });
      return response.data;
    } catch (error: any) {
      // Handle quiz-specific 404 errors
      if (error?.response?.status === 404) {
        router.replace({ name: "quiz-not-available" });
      }
      throw error; // Re-throw for other error types
    }
  },
};
