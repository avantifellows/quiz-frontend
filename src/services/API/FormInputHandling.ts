import {
  FormResultResponse
} from "../../types";

export default {
  async submitFormData(formData : any, resultsQuery: boolean = false): Promise<FormResultResponse> {
    const lambdaUrl = process.env.VUE_APP_FORM_LAMBDA;
    formData.results_query = resultsQuery;
    console.log(resultsQuery);

    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await response.json();
    return data;
  }
}
