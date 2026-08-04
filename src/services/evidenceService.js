import { normalizeReport } from './aiService.js'
import { makeId } from '../utils/report.js'

export const EVIDENCE_CATEGORIES = [
  { key: 'market', label: '市场数据' },
  { key: 'user', label: '用户事实' },
  { key: 'competitor', label: '竞品事实' },
  { key: 'trend', label: '行业趋势' },
  { key: 'risk', label: '风险事实' }
]

export function defaultEvidenceItem() {
  return {
    id: makeId(),
    category: 'market',
    title: '',
    value: '',
    sourceTitle: '',
    sourceUrl: '',
    sourceDate: '',
    note: ''
  }
}

function validItems(items) {
  return (Array.isArray(items) ? items : []).filter((item) => {
    const title = String(item?.title || '').trim()
    const value = String(item?.value || '').trim()
    return title || value
  })
}

function uniqueSources(items) {
  const seen = new Set()
  const sources = []
  for (const item of items) {
    const title = String(item.sourceTitle || '').trim()
    const url = String(item.sourceUrl || '').trim()
    const key = `${title}|${url}`
    if (!title && !url) continue
    if (seen.has(key)) continue
    seen.add(key)
    sources.push({
      title: title || '未命名来源',
      url,
      note: item.sourceDate ? `资料日期：${item.sourceDate}` : '需要人工核验'
    })
  }
  return sources
}

function firstValue(items, keyword) {
  const found = items.find((item) => {
    const title = String(item.title || '').toLowerCase()
    return title.includes(keyword)
  })
  return found?.value || '暂无已核实数据'
}

function itemSource(item) {
  return {
    title: item.sourceTitle || '未命名来源',
    url: item.sourceUrl || '',
    note: item.sourceDate ? `资料日期：${item.sourceDate}` : '需要人工核验'
  }
}

export function buildEvidenceReport(input, rawItems) {
  const items = validItems(rawItems)
  const marketItems = items.filter((item) => item.category === 'market')
  const userItems = items.filter((item) => item.category === 'user')
  const competitorItems = items.filter((item) => item.category === 'competitor')
  const trendItems = items.filter((item) => item.category === 'trend')
  const riskItems = items.filter((item) => item.category === 'risk')

  const prdDraft = {
    title: input.productIdea || '产品 PRD 草稿',
    background: [
      ...trendItems.map((item) => ({
        title: item.title || '未命名趋势',
        description: item.value || '',
        source: itemSource(item)
      })),
      ...marketItems.slice(0, 5).map((item) => ({
        title: item.title || '市场资料',
        description: item.value || '',
        source: itemSource(item)
      }))
    ],
    targetUsers: userItems.map((item) => ({
      name: item.title || '待补充用户',
      description: item.value || '',
      source: itemSource(item)
    })),
    competitors: competitorItems.map((item) => ({
      name: item.title || '待补充竞品',
      evidence: item.value || '',
      source: itemSource(item)
    })),
    features: [...competitorItems, ...trendItems].slice(0, 12).map((item) => ({
      name: item.title || '候选功能',
      description: item.value || '',
      source: itemSource(item)
    })),
    risks: riskItems.map((item) => ({
      title: item.title || '未命名风险',
      description: item.value || '',
      level: item.note || '待评估'
    }))
  }

  const report = {
    marketAnalysis: {
      summary: items.length
        ? `本报告仅汇总 ${items.length} 条已提供证据；未提供证据的模块不进行估算。`
        : '当前没有已核实证据。请先补充来源资料，系统不会自动生成市场数字。',
      tam: firstValue(marketItems, 'tam'),
      sam: firstValue(marketItems, 'sam'),
      som: firstValue(marketItems, 'som'),
      confidence: items.length ? '中' : '无',
      dataQuality: {
        level: items.length ? '中' : '无',
        reason: items.length
          ? '报告仅汇总用户提供或检索到的来源，系统未生成新事实。'
          : '未提供任何来源，无法形成事实结论。'
      },
      sources: uniqueSources(items),
      assumptions: [
        '本报告只展示用户填写的证据，未填写项一律显示“暂无已核实数据”。',
        '来源标题、链接和日期需要用户在对外使用前复核。',
        '系统不会根据模型知识补充 TAM、竞品、用户或风险事实。'
      ],
      risks: [
        '来源本身可能过期、偏差或被错误引用，仍需人工复核。',
        '缺少证据的结论不应被解读为“不存在”，只能视为“尚未核实”。'
      ],
      trends: trendItems.map((item) => ({
        title: item.title || '未命名趋势',
        description: `${item.value || '暂无描述'}${item.note ? `；${item.note}` : ''}`
      })),
      competitors: competitorItems.map((item) => ({
        name: item.title || '未命名竞品',
        strength: item.value || '暂无',
        weakness: item.note || '暂无'
      }))
    },
    userPersonas: userItems.map((item) => ({
      name: item.title || '用户事实',
      age: item.sourceDate || '未知',
      role: '待补充角色',
      background: item.value || '暂无',
      goals: [],
      painPoints: item.note ? [item.note] : []
    })),
    featurePrioritization: [],
    mvpScope: [],
    successMetrics: {
      okrs: [],
      kpis: []
    },
    prdDraft,
    risks: riskItems.map((item) => ({
      title: item.title || '未命名风险',
      description: item.value || '',
      level: item.note || '待评估'
    }))
  }

  return {
    report: normalizeReport(report),
    meta: {
      mode: 'evidence',
      model: '证据驱动（无模型生成事实）',
      sourceCount: items.length,
      createdAt: new Date().toISOString()
    }
  }
}
