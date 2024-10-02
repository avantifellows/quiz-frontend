import { apiClient } from "./RootClient";
import { authenticationEndpoint } from "./Endpoints";
import {
  OrganizationAPIResponse
} from "@/types";

export default {
  /**
   * authorizes the user using the API key
   * @param {string} apiKey - api key
   * @returns {Promise<OrganizationAPIResponse>} organization details
   */
  async checkAuthToken(apiKey: string): Promise<OrganizationAPIResponse> {
    const response = await apiClient().get(authenticationEndpoint + apiKey);
    return response.data;
  }
}
