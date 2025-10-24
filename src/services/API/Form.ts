import { apiClient } from "./RootClient";
import { formEndpoint } from "./Endpoints";
import { QuizAPIResponse } from "@/types";
import router from "@/router";

export default {
  /**
   * returns the details for a form
   * @param {string} formId - uuid of the form to be fetched
   * @param {boolean} omrMode - whether form should be displayed in omr mode
   * @param {boolean} singlePageMode - whether form should be displayed in single page mode with full text
   * @returns {Promise<QuizAPIResponse>} data corresponding to the form
   */
  async getForm({ formId, omrMode = false, singlePageMode = false }: { formId: string, omrMode?: boolean, singlePageMode?: boolean }): Promise<QuizAPIResponse> {
    try {
      const response = await apiClient().get(formEndpoint + formId, {
        params: {
          omr_mode: omrMode,
          single_page_mode: singlePageMode
        }
      });
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
