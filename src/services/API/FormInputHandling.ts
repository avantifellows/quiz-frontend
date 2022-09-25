export default {
  async submitFormData(formData : any): Promise<Boolean> {
    const lambdaUrl = "https://rzpmorl6si7wbjgu22q5q7puxe0reqqk.lambda-url.ap-south-1.on.aws/";
    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (response.status == 200) return true
    else return false
  }
}
