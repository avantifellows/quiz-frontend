import { apiClient } from "./RootClient";
import { questionsEndpoint } from "./Endpoints";
import { Question } from "@/types";

function shuffleArray<T>(array: T[]): T[] {
  // Shuffle function using Fisher-Yates algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

export default {
  /**
   * Returns the list of questions belonging to a question set.
   * @param {string} questionSetId - UUID of the question set.
   * @param {boolean} isJumbled - Whether the questions should be jumbled.
   * @param {number | undefined} skip - Skip a number of records.
   * @param {number | undefined} limit - Limit the returned number of records.
   * @returns {Promise<Question[]>} - A list of questions belonging to the given question set.
   */
  async getQuestions(
    questionSetId: string,
    isJumbled: boolean = false,  // Add a parameter to control jumbling
    skip: number | undefined = 0, // Default to 0 if skip is not provided
    limit: number | undefined = 10  // Default to 10 if limit is not provided
  ): Promise<Question[]> {
    try {
      const queryParams: { question_set_id: string; skip?: number; limit?: number } = {
        question_set_id: questionSetId,
      };

      if (skip !== undefined) queryParams.skip = skip;
      if (limit !== undefined) queryParams.limit = limit;

      // Fetch questions from API
      const response = await apiClient().get(questionsEndpoint, {
        params: queryParams,
      });

      let questions = response.data;

      // If the questions need to be jumbled, shuffle them
      if (isJumbled) {
        questions = shuffleArray(questions);
      }

      return questions;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw new Error("Failed to fetch questions. Please try again later.");
    }
  },
};
