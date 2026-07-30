const fs = require("fs");

const content = `const API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions"

async function callDeepSeek(input) {
  const apiKey = localStorage.getItem("openai_api_key")
  if (!apiKey) throw new Error("Please configure DeepSeek API Key in settings")

  const systemPrompt = "You are a senior AI product manager and product strategy analyst. Analyze the product idea and output structured insights in JSON format only. All output must be in Chinese language."

  const userMessage = "Analyze this product idea:\\nProduct: " + (input.productIdea || "N/A") + "\\nTarget users: " + (input.targetUsers || "N/A") + "\\nPain points: " + (input.painPoints || "N/A") + "\\nIndustry: " + (input.industry || "N/A")

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const errData = await response.text()
      throw new Error("API error (" + response.status + "): " + errData)
    }

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch (err) {
    if (err.message.includes("Failed to fetch")) throw new Error("Cannot connect to API. Check your API key and network.")
    throw err
  }
}

export async function analyzeProduct(input) {
  return await callDeepSeek(input)
}
`;

fs.writeFileSync("src/services/aiService.js", content, "utf8");
console.log("DONE");
