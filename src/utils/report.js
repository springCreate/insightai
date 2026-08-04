export function makeId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}

export function trackEvent(name, payload = {}) {
  try {
    const key = 'insightai_events'
    const events = JSON.parse(localStorage.getItem(key) || '[]')
    events.push({
      name,
      at: new Date().toISOString(),
      ...payload
    })
    localStorage.setItem(key, JSON.stringify(events.slice(-200)))
  } catch (err) {
    console.warn('[InsightAI] event tracking failed', err)
  }
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

function list(items, fallback = '暂无') {
  if (!Array.isArray(items) || items.length === 0) return fallback
  return items.map((item) => `- ${item}`).join('\n')
}

function sourceList(sources) {
  if (!Array.isArray(sources) || sources.length === 0) return '- 暂无来源；该内容为 AI 估算，使用前必须人工核验。'
  return sources
    .map((s) => {
      const title = s.title || '未命名来源'
      const url = s.url ? ` (${s.url})` : ''
      const note = s.note ? ` - ${s.note}` : ''
      return `- ${title}${url}${note}`
    })
    .join('\n')
}

export function reportToMarkdown(input, report, meta = {}) {
  const market = report.marketAnalysis || {}
  const personas = report.userPersonas || []
  const features = report.featurePrioritization || []
  const phases = report.mvpScope || []
  const metrics = report.successMetrics || {}
  const risks = report.risks || []

  const lines = []
  lines.push(`# ${input.productIdea || '产品洞察报告'}`)
  lines.push('')
  lines.push(`> 生成时间：${meta.createdAt || new Date().toISOString()}`)
  lines.push(`> 生成方式：${meta.mode === 'demo' ? '示例数据（非真实 AI 调用）' : meta.mode === 'evidence' ? '证据驱动（无模型生成事实）' : 'AI 生成草稿'}`)
  lines.push('')
  if (meta.mode === 'evidence') {
    lines.push('> 重要说明：本报告只汇总用户提供并标注来源的内容；未提供证据的模块显示“暂无已核实数据”。')
  } else {
    lines.push('> 重要说明：本报告中的市场规模、评分和指标均为 AI 估算或建议，不代表事实。')
    lines.push('> 任何数字在对外使用前都必须补充真实来源、统计口径和人工核验。')
  }
  lines.push('')

  const prd = report.prdDraft || {}
  if (
    prd.summary ||
    prd.background?.length ||
    prd.targetUsers?.length ||
    prd.userStories?.length ||
    prd.requirements?.length ||
    prd.nonFunctional?.length ||
    prd.openQuestions?.length ||
    prd.competitors?.length ||
    prd.features?.length
  ) {
    lines.push('## PRD 草稿')
    lines.push('')
    lines.push(`**产品：** ${prd.title || input.productIdea || '待补充'}`)
    lines.push('')
    if (prd.summary) {
      lines.push(`**产品概述：** ${prd.summary}`)
      lines.push('')
    }
    if (prd.background?.length) {
      lines.push('**背景与问题：**')
      lines.push('')
      prd.background.forEach((item) => {
        lines.push(`- ${item.title}：${item.description || '暂无描述'}${item.source?.url ? `（${item.source.url}）` : ''}`)
      })
      lines.push('')
    }
    if (prd.targetUsers?.length) {
      lines.push('**目标用户（候选证据）：**')
      lines.push('')
      prd.targetUsers.forEach((item) => {
        lines.push(`- ${item.name}：${item.description || '暂无描述'}${item.source?.url ? `（${item.source.url}）` : ''}`)
      })
      lines.push('')
    }
    if (prd.userStories?.length) {
      lines.push('**用户故事：**')
      lines.push('')
      prd.userStories.forEach((item) => {
        lines.push(`- ${item.title}：${item.description || '暂无描述'}${item.source?.url ? `（${item.source.url}）` : ''}`)
      })
      lines.push('')
    }
    if (prd.requirements?.length) {
      lines.push('**功能需求：**')
      lines.push('')
      prd.requirements.forEach((item) => {
        lines.push(`- ${item.title}：${item.description || '暂无描述'}${item.source?.url ? `（${item.source.url}）` : ''}`)
      })
      lines.push('')
    }
    if (prd.nonFunctional?.length) {
      lines.push('**非功能需求：**')
      lines.push('')
      prd.nonFunctional.forEach((item) => {
        lines.push(`- ${item.title}：${item.description || '暂无描述'}${item.source?.url ? `（${item.source.url}）` : ''}`)
      })
      lines.push('')
    }
    if (prd.openQuestions?.length) {
      lines.push('**待确认问题：**')
      lines.push('')
      prd.openQuestions.forEach((item) => {
        lines.push(`- ${item.title}：${item.description || '暂无描述'}${item.source?.url ? `（${item.source.url}）` : ''}`)
      })
      lines.push('')
    }
    if (prd.competitors?.length) {
      lines.push('**竞品矩阵（候选证据）：**')
      lines.push('')
      prd.competitors.forEach((item) => {
        lines.push(`- ${item.name}：${item.evidence || '暂无证据'}${item.source?.url ? `（${item.source.url}）` : ''}`)
      })
      lines.push('')
    }
    if (prd.features?.length) {
      lines.push('**候选功能（需人工确认优先级）：**')
      lines.push('')
      prd.features.forEach((item) => {
        lines.push(`- ${item.name}：${item.description || '暂无描述'}${item.source?.url ? `（${item.source.url}）` : ''}`)
      })
      lines.push('')
    }
  }

  lines.push('## 一、市场分析')
  lines.push('')
  lines.push(`**概述：** ${market.summary || '暂无'}`)
  lines.push('')
  lines.push(`- TAM：${market.tam || '未知（需人工核验）'}`)
  lines.push(`- SAM：${market.sam || '未知（需人工核验）'}`)
  lines.push(`- SOM：${market.som || '未知（需人工核验）'}`)
  lines.push(`- 数据可信度：${market.confidence || '低'}${market.dataQuality?.reason ? `（${market.dataQuality.reason}）` : ''}`)
  lines.push('')
  lines.push('**来源：**')
  lines.push(sourceList(market.sources))
  lines.push('')
  lines.push('**假设：**')
  lines.push(list(market.assumptions))
  lines.push('')
  lines.push('**市场风险：**')
  lines.push(list(market.risks))
  lines.push('')

  lines.push('## 二、用户画像')
  lines.push('')
  if (personas.length === 0) {
    lines.push('暂无')
  } else {
    personas.forEach((p, i) => {
      lines.push(`### ${i + 1}. ${p.name || '匿名用户'}（${p.role || '目标用户'} / ${p.age || '未知'}）`)
      lines.push('')
      lines.push(`**背景：** ${p.background || '暂无'}`)
      lines.push(`**目标：** ${list(p.goals, '暂无')}`)
      lines.push(`**痛点：** ${list(p.painPoints, '暂无')}`)
      lines.push('')
    })
  }

  lines.push('## 三、功能优先级（RICE 建议）')
  lines.push('')
  if (features.length === 0) {
    lines.push('暂无')
  } else {
    lines.push('| 功能 | 覆盖度 | 影响力 | 信心度 | 工作量 | 总分 | 依据 |')
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: | --- |')
    features.forEach((f) => {
      const rice = f.rice || {}
      lines.push(
        `| ${f.feature || '未命名功能'} | ${rice.reach ?? '-'} | ${rice.impact ?? '-'} | ${rice.confidence ?? '-'} | ${rice.effort ?? '-'} | ${f.score?.toFixed?.(1) ?? '-'} | ${f.rationale || f.confidence || '-'} |`
      )
    })
  }
  lines.push('')

  lines.push('## 四、MVP 路线图')
  lines.push('')
  if (phases.length === 0) {
    lines.push('暂无')
  } else {
    phases.forEach((phase, i) => {
      lines.push(`### ${i + 1}. ${phase.phase || `阶段 ${i + 1}`}`)
      lines.push(`- 功能：${phase.features?.join('、') || '暂无'}`)
      lines.push(`- 目标：${phase.goal || '暂无'}`)
      lines.push('')
    })
  }

  lines.push('## 五、成功指标体系')
  lines.push('')
  lines.push('**OKR：**')
  lines.push('')
  ;(metrics.okrs || []).forEach((o, i) => {
    lines.push(`### O${i + 1}. ${o.objective || '未命名目标'}`)
    lines.push(list(o.keyResults, '暂无'))
    lines.push('')
  })
  lines.push('**KPI：**')
  lines.push('')
  ;(metrics.kpis || []).forEach((k) => {
    lines.push(`- ${k.metric || '未命名指标'}：${k.target || '-'} ${k.unit || ''}`)
  })
  lines.push('')

  lines.push('## 六、风险判断')
  lines.push('')
  if (risks.length === 0) {
    lines.push('- 暂无风险说明；建议补充市场、技术、合规和执行风险。')
  } else {
    risks.forEach((r) => {
      const title = typeof r === 'string' ? r : r.title
      const desc = typeof r === 'string' ? '' : r.description
      const level = typeof r === 'string' ? '' : r.level
      lines.push(`- ${title || '未命名风险'}${level ? `（${level}）` : ''}${desc ? `：${desc}` : ''}`)
    })
  }

  return lines.join('\n')
}
