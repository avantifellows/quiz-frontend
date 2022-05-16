import { apiClient } from "./RootClient";
import { externalAuthTokenEndpoint } from "./Endpoints";
import {
  UserAPIResponse
} from "../../types";

export default {
  /**
   * authenticates the user using the provided API key
   * @param {string} apiKey - api key
   * @returns {Promise<UserAPIResponse>} org details corresponding to the user that is trying to log in
   */
  async checkAuthToken(apiKey: string): Promise<UserAPIResponse> {
    const response = await apiClient().get(externalAuthTokenEndpoint + apiKey);
    return response.data;
  }
}
