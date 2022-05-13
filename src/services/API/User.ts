import { apiClient } from "./RootClient";
import { externalAuthTokenEndpoint } from "./Endpoints";

export default {
  /**
   * returns authentication token
   * @param {object} payload - user id + api key
   * @returns {Promise<any>} token corresponding to a user
   */
  async generateExternalAuthToken(payload: object): Promise<any> {
    const response = await apiClient().post(externalAuthTokenEndpoint, payload, {
      baseURL: process.env.VUE_APP_BACKEND_AUTH_URL,
    });
    return response.data;
  }
}
