import { apiClient } from "./RootClient";
import { externalAuthTokenEndpoint } from "./Endpoints";
import {
  UserAPIResponse
} from "../../types";

export default {
  /**
   * returns organization name
   * @param {string} apiKey - api key
   * @returns {Promise<UserAPIResponse>} org details corresponding to the user
   */
  async checkAuthToken(apiKey: string): Promise<UserAPIResponse> {
    const response = await apiClient().get(externalAuthTokenEndpoint + apiKey);
    return response.data;
  }
}