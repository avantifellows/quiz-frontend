import axios, { AxiosRequestConfig, AxiosError, AxiosInstance } from "axios";
import ErrorHandling from "./ErrorHandling";

// const headers = {
//   Accept: "application/json",
//   "Content-Type": "application/json",
// };

// backend API client
const client = axios.create({
  baseURL: process.env.VUE_APP_BACKEND,
  withCredentials: false,
  // headers,
});

// handle errors in responses for API requests
client.interceptors.response.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    return config;
  },
  async (error: AxiosError): Promise<AxiosError> => {
    // logging the error
    console.log(error);

    ErrorHandling.handleAPIErrors(error);
    return Promise.reject(error);
  }
);

export function apiClient(): AxiosInstance {
  return client;
}
