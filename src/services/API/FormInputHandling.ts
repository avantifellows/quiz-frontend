export default {
  async submitFormData(formData : any): Promise<Boolean> {
    const lambdaUrl = process.env.FORM_LAMBDA_BACKEND;
    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (response.status == 200) return true
    else return false
  }
}
