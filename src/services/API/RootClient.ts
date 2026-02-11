import axios, { AxiosRequestConfig, AxiosError, AxiosInstance } from "axios";
import ErrorHandling from "./ErrorHandling";

function createClient(baseURL: string | undefined): AxiosInstance {
  const instance = axios.create({
    baseURL,
    withCredentials: false,
    timeout: 4000, // cancel request after 4 sec
    // but this works only when internet connection is active
    // ref: https://stackoverflow.com/questions/36690451/timeout-feature-in-the-axios-library-is-not-working
  });

  // handle errors in responses for API requests
  instance.interceptors.response.use(
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

  return instance;
}

// default backend (Lambda)
const defaultClient = createClient(process.env.VUE_APP_BACKEND);

// ECS backend — only created if the env var is set
const ecsClient = process.env.VUE_APP_BACKEND_ECS
  ? createClient(process.env.VUE_APP_BACKEND_ECS)
  : null;

function useEcsBackend(): boolean {
  return (
    ecsClient != null &&
    new URLSearchParams(window.location.search).has("new_backend")
  );
}

export function apiClient(): AxiosInstance {
  return useEcsBackend() ? ecsClient! : defaultClient;
}
