import router from "@/router";
import { AxiosError } from "axios";

export default {
  handleAPIErrors(error: AxiosError) {
    if (
      error != undefined &&
      "response" in error &&
      error.response != undefined
    ) {
      if (error.response.status === 404) router.replace({ name: "404" });
    }
  },
};
