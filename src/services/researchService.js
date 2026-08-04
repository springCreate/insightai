import { makeId } from '../utils/report.js'

const TAVILY_ENDPOINT = 'https://api.tavily.com/search'
const RESEARCH_PROXY_ENDPOINT = '/api/research'
const REQUEST_TIMEOUT_MS = 60000

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function hostname(url) {
  try {
    return new URL(url).hostname
  } catch (err) {
    return '未命名来源'
  }
}

async function searchTavily(query, apiKey, maxResults = 5) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(TAVILY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: maxResults
      }),
      signal: controller.signal
    })

    const raw = await response.text()
    let data = {}
    try {
      data = JSON.parse(raw)
    } catch (err) {
      data = {}
    }
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Tavily Key 无效或已过期，请重新粘贴并保存正确的 Key。')
      }
      if (response.status === 429) {
        throw new Error('Tavily 免费额度已用尽或请求过快，请稍后重试。')
      }
      throw new Error(data?.error || `Tavily 检索失败（${response.status}）`)
    }
    return data
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Tavily 检索超时，请稍后重试。')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

async function searchViaBackend(query, maxResults = 5) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(RESEARCH_PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        max_results: maxResults
      }),
      signal: controller.signal
    })

    const raw = await response.text()
    let data = {}
    try {
      data = JSON.parse(raw)
    } catch (err) {
      data = {}
    }
    if (!response.ok) {
      const message = data?.error || `后端检索失败（${response.status}）`
      throw new Error(message)
    }
    return data
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('后端检索超时，请稍后重试。')
    }
    if (String(err.message || '').includes('Failed to fetch')) {
      throw new Error('无法连接后端检索服务；本地开发请配置 Tavily Key，正式部署请在服务端配置 TAVILY_API_KEY。')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

async function search(query, apiKey, maxResults = 5) {
  if (apiKey) {
    try {
      return await searchTavily(query, apiKey, maxResults)
    } catch (err) {
      if (!String(err.message || '').includes('Failed to fetch')) {
        throw err
      }
    }
  }
  return searchViaBackend(query, maxResults)
}

function toEvidenceItems(queryLabel, category, results) {
  const seen = new Set()
  const items = []

  for (const result of results || []) {
    const url = String(result?.url || '').trim()
    if (!url || seen.has(url)) continue
    seen.add(url)

    const content = cleanText(result?.content)
    items.push({
      id: makeId(),
      category,
      title: `${queryLabel}：${cleanText(result?.title) || '未命名网页'}`,
      value: content.slice(0, 600) || '该网页没有可提取的正文摘要，请打开链接人工核验。',
      sourceTitle: hostname(url),
      sourceUrl: url,
      sourceDate: new Date().toISOString().slice(0, 10),
      note: `检索时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`
    })
  }

  return items
}

export function buildResearchQueries(input) {
  const product = cleanText(input.productIdea) || '产品'
  const users = cleanText(input.targetUsers)
  const industry = cleanText(input.industry)
  const market = cleanText(input.market)
  const pain = cleanText(input.painPoints)

  return [
    {
      label: '用户痛点',
      category: 'user',
      query: `${product} ${users} ${pain} 用户痛点 论坛`.trim()
    },
    {
      label: '竞品数据',
      category: 'competitor',
      query: `${product} ${industry} 竞品 对比 功能矩阵`.trim()
    },
    {
      label: '市场规模',
      category: 'market',
      query: `${industry} ${market} ${product} 市场规模 2026`.trim()
    },
    {
      label: '功能与趋势',
      category: 'trend',
      query: `${product} 功能 行业趋势 最新`.trim()
    }
  ]
}

export async function runResearch(input, apiKey, onProgress = () => {}) {
  const queries = buildResearchQueries(input)
  const items = []

  for (const query of queries) {
    onProgress(query.label)
    const data = await search(query.query, apiKey, 5)
    items.push(...toEvidenceItems(query.label, query.category, data?.results))
  }

  return items
}
