const API_ENDPOINT = '/api/chat'

async function callOpenAI(input) {
  const apiKey = localStorage.getItem('openai_api_key')
  if (!apiKey) {
    throw new Error('请先在设置中配置 OpenAI API Key')
  }

  let targetUrl = localStorage.getItem('proxy_url') || API_ENDPOINT

  const systemPrompt = 'You are a senior AI product manager. Analyze the product idea and output structured insights in JSON format only: {"marketAnalysis":{"summary":"summary","tam":"TAM","sam":"SAM","som":"SOM","trends":[{"title":"trend","description":"desc"}],"competitors":[{"name":"name","strength":"strength","weakness":"weakness"}]},"userPersonas":[{"name":"name","age":"age","role":"role","background":"background","goals":["goal"],"painPoints":["pain"]}],"featurePrioritization":[{"feature":"feature","description":"desc","rice":{"reach":1,"impact":1,"confidence":1,"effort":1},"score":1}],"mvpScope":[{"phase":"phase","features":["feature"],"goal":"goal"}],"successMetrics":{"okrs":[{"objective":"objective","keyResults":["KR"]}],"kpis":[{"metric":"metric","target":"target","unit":"unit"}]}}'

  const userMessage = 'Analyze this product idea: Product: ' + (input.productIdea || 'N/A') + ', Target users: ' + (input.targetUsers || 'N/A') + ', Pain points: ' + (input.painPoints || 'N/A') + ', Industry: ' + (input.industry || 'N/A')

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const errData = await response.text()
      throw new Error('API error (' + response.status + '): ' + errData)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    return JSON.parse(content)
  } catch (err) {
    if (err.message.includes('Failed to fetch')) {
      throw new Error('API 连接失败。部署版会自动使用同域代理，本地开发请运行 npm run start')
    }
    throw err
  }
}

export async function analyzeProduct(input) {
  return await callOpenAI(input)
}
