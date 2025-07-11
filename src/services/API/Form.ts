import { apiClient } from "./RootClient";
import { formEndpoint } from "./Endpoints";
import { QuizAPIResponse } from "@/types";
import router from "@/router";

export default {
  /**
   * returns the details for a form
   * @param {string} formId - uuid of the form to be fetched
   * @returns {Promise<QuizAPIResponse>} data corresponding to the form
   */
  async getForm({ formId }: { formId: string }): Promise<QuizAPIResponse> {
    try {
      const response = await apiClient().get(formEndpoint + formId);
      return response.data;
    } catch (error: any) {
      // Handle form-specific 404 errors
      if (error?.response?.status === 404) {
        router.replace({ name: "form-not-available" });
      }
      throw error; // Re-throw for other error types
    }
  },
};
