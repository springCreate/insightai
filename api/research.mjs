const TAVILY_ENDPOINT = 'https://api.tavily.com/search'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    res.status(503).json({
      error: '服务端未配置 TAVILY_API_KEY；请在 Vercel 环境变量中配置。'
    })
    return
  }

  const { query, max_results: maxResults } = req.body || {}
  if (!query) {
    res.status(400).json({ error: 'Missing query' })
    return
  }

  try {
    const response = await fetch(TAVILY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: maxResults || 5
      })
    })

    const raw = await response.text()
    let data
    try {
      data = JSON.parse(raw)
    } catch (err) {
      data = { raw }
    }
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
