import { apiClient } from "./RootClient";
import { questionsEndpoint } from "./Endpoints";
import { Question } from "../../types";

export default {
  /**
   * returns the list of questions belonging to a question set
   * @param {string} questionSetId - uuid of the question set
   * @param {number | undefined} skip - skip a number of records
   * @param {number | undefined} limit - limit the returned number of records
   * @returns {Promise<QuizResponse>} a list of questions belonging to the given question set
   */
  async getQuestions(
    questionSetId: string,
    skip: number | undefined = undefined,
    limit: number | undefined = undefined
  ): Promise<Question[]> {
      type queryParamsType = {
         question_set_id: string,
         skip?: number,
         limit?: number,
      }

      const queryParams: queryParamsType = {
        question_set_id: questionSetId,
      }

      if (skip != undefined) queryParams.skip = skip
      if (limit != undefined) queryParams.limit = limit

      const response = await apiClient().get(
        questionsEndpoint,
        { params: queryParams }
      );
      return response.data;
  },
};
