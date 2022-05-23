import { apiClient } from "./RootClient";
import { authenticationEndpoint } from "./Endpoints";
import {
  OrgAPIResponse
} from "../../types";

export default {
  /**
   * authorizes the user using the API key
   * @param {string} apiKey - api key
   * @returns {Promise<OrgAPIResponse>} organization details
   */
  async checkAuthToken(apiKey: string): Promise<OrgAPIResponse> {
    const response = await apiClient().get(authenticationEndpoint + apiKey);
    return response.data;
  }
}
