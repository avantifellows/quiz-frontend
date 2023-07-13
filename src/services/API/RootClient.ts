import axios, { AxiosRequestConfig, AxiosError, AxiosInstance } from "axios";
import ErrorHandling from "./ErrorHandling";

// backend API client
const client = axios.create({
  baseURL: process.env.VUE_APP_BACKEND,
  withCredentials: false,
  timeout: 4000, // cancel request after 10 sec
  // but this works only when internet connection is active
  // ref: https://stackoverflow.com/questions/36690451/timeout-feature-in-the-axios-library-is-not-working
});

// delay response by one second to notice loading spinner
client.interceptors.response.use(function (response) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(response);
    }, 1000);
  });
}, function (error) {
  return Promise.reject(error);
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
