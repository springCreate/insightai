const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'
const TAVILY_ENDPOINT = 'https://api.tavily.com/search'

// 代理 DeepSeek API（OpenAI 兼容格式）
app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = req.headers.authorization
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing API key' })
    }

    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify(req.body)
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
})

// 代理 Tavily 搜索：生产环境由服务端持有 Key，用户无需填写
app.post('/api/research', async (req, res) => {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error: '服务端未配置 TAVILY_API_KEY；请在部署环境变量中配置，或在本机设置中填写 Tavily Key。'
    })
  }

  const { query, max_results: maxResults } = req.body || {}
  if (!query) {
    return res.status(400).json({ error: 'Missing query' })
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
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 提供前端静态文件（生产环境）
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT)
})
