const API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'
const REQUEST_TIMEOUT_MS = 90000

function asString(value, fallback = '') {
  if (value === null || value === undefined) return fallback
  return String(value)
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function asNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function sourceItem(source) {
  if (typeof source === 'string') {
    return { title: source, url: '', note: '' }
  }
  return {
    title: asString(source?.title, '未命名来源'),
    url: asString(source?.url),
    note: asString(source?.note)
  }
}

function prdItem(item) {
  if (typeof item === 'string') {
    return { title: item, description: '', source: { title: '', url: '' } }
  }
  return {
    title: asString(item?.title),
    description: asString(item?.description),
    source: sourceItem(item?.source)
  }
}

function riskItem(risk) {
  if (typeof risk === 'string') {
    return { title: risk, description: '', level: '' }
  }
  return {
    title: asString(risk?.title, '未命名风险'),
    description: asString(risk?.description),
    level: asString(risk?.level)
  }
}

function fallbackScore(f) {
  const rice = f?.rice || {}
  const reach = asNumber(rice.reach, 0)
  const impact = asNumber(rice.impact, 0)
  const confidence = asNumber(rice.confidence, 0)
  const effort = asNumber(rice.effort, 1)
  const score = asNumber(f?.score)
  if (score > 0) return score
  if (effort <= 0) return 0
  return Math.round(((reach * impact * confidence) / (effort * 10)) * 10) / 10
}

export function normalizeReport(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const market = source.marketAnalysis || {}
  const metrics = source.successMetrics || {}

  const marketAnalysis = {
    summary: asString(market.summary),
    tam: asString(market.tam, '未知（需人工核验）'),
    sam: asString(market.sam, '未知（需人工核验）'),
    som: asString(market.som, '未知（需人工核验）'),
    confidence: asString(market.confidence, '低'),
    dataQuality: {
      level: asString(market.dataQuality?.level, '低'),
      reason: asString(market.dataQuality?.reason, '未接入实时数据源，数字来自模型估算。')
    },
    sources: asArray(market.sources).map(sourceItem),
    assumptions: asArray(market.assumptions).map((item) => asString(item)),
    risks: asArray(market.risks).map((item) => asString(item)),
    trends: asArray(market.trends).map((item) => ({
      title: asString(item?.title, '未命名趋势'),
      description: asString(item?.description),
      sourceUrl: asString(item?.sourceUrl)
    })),
    competitors: asArray(market.competitors).map((item) => ({
      name: asString(item?.name, '未命名竞品'),
      strength: asString(item?.strength),
      weakness: asString(item?.weakness),
      sourceUrl: asString(item?.sourceUrl)
    }))
  }

  const userPersonas = asArray(source.userPersonas).map((item) => ({
    name: asString(item?.name, '匿名用户'),
    age: asString(item?.age, '未知'),
    role: asString(item?.role, '目标用户'),
    background: asString(item?.background),
    goals: asArray(item?.goals).map((goal) => asString(goal)),
    painPoints: asArray(item?.painPoints).map((point) => asString(point))
  }))

  const featurePrioritization = asArray(source.featurePrioritization).map((item) => {
    const rice = item?.rice || {}
    return {
      feature: asString(item?.feature, '未命名功能'),
      description: asString(item?.description),
      rice: {
        reach: asNumber(rice.reach),
        impact: asNumber(rice.impact),
        confidence: asNumber(rice.confidence),
        effort: asNumber(rice.effort)
      },
      score: fallbackScore(item),
      rationale: asString(item?.rationale),
      confidence: asString(item?.confidence),
      sourceUrl: asString(item?.sourceUrl)
    }
  })

  const mvpScope = asArray(source.mvpScope).map((item, index) => ({
    phase: asString(item?.phase, `阶段 ${index + 1}`),
    features: asArray(item?.features).map((feature) => asString(feature)),
    goal: asString(item?.goal),
    sourceUrl: asString(item?.sourceUrl)
  }))

  const successMetrics = {
    okrs: asArray(metrics.okrs).map((item) => ({
      objective: asString(item?.objective, '未命名目标'),
      keyResults: asArray(item?.keyResults).map((kr) => asString(kr)),
      sourceUrl: asString(item?.sourceUrl)
    })),
    kpis: asArray(metrics.kpis).map((item) => ({
      metric: asString(item?.metric, '未命名指标'),
      target: asString(item?.target),
      unit: asString(item?.unit),
      sourceUrl: asString(item?.sourceUrl)
    }))
  }

  const prdDraft = source.prdDraft || {}
  const prd = {
    title: asString(prdDraft.title, '产品 PRD 草稿'),
    summary: asString(prdDraft.summary),
    background: asArray(prdDraft.background).map(prdItem),
    targetUsers: asArray(prdDraft.targetUsers).map((item) => ({
      name: asString(item?.name, '待补充用户'),
      description: asString(item?.description),
      source: sourceItem(item?.source)
    })),
    userStories: asArray(prdDraft.userStories).map(prdItem),
    requirements: asArray(prdDraft.requirements).map(prdItem),
    nonFunctional: asArray(prdDraft.nonFunctional).map(prdItem),
    openQuestions: asArray(prdDraft.openQuestions).map(prdItem),
    competitors: asArray(prdDraft.competitors).map((item) => ({
      name: asString(item?.name, '待补充竞品'),
      evidence: asString(item?.evidence),
      source: sourceItem(item?.source)
    })),
    features: asArray(prdDraft.features).map((item) => ({
      name: asString(item?.name, '候选功能'),
      description: asString(item?.description),
      source: sourceItem(item?.source)
    })),
    risks: asArray(prdDraft.risks).map(riskItem)
  }

  return {
    marketAnalysis,
    userPersonas,
    featurePrioritization,
    mvpScope,
    successMetrics,
    prdDraft: prd,
    risks: asArray(source.risks).map(riskItem)
  }
}

function extractJson(content) {
  const text = asString(content).trim()
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim())
    } catch (err) {
      // Fall through to full-text extraction below.
    }
  }

  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first >= 0 && last > first) {
    const candidate = text.slice(first, last + 1)
    return JSON.parse(candidate)
  }

  throw new Error('AI 返回内容无法解析为 JSON，请重试。')
}

function friendlyApiError(status, body) {
  if (status === 401 || status === 403) {
    return 'API Key 无效或无权限，请检查设置中的 Key。'
  }
  if (status === 429) {
    return '请求过于频繁或额度不足，请稍后重试。'
  }
  if (status >= 500) {
    return 'AI 服务暂时不可用，请稍后重试。'
  }
  const detail = asString(body).slice(0, 200)
  return `AI 请求失败（${status}）${detail ? `：${detail}` : ''}`
}

function buildUserMessage(input) {
  return [
    '请分析以下产品想法，并输出一份可用于团队讨论的中文产品洞察草稿：',
    '',
    `产品描述：${input.productIdea || 'N/A'}`,
    `目标用户：${input.targetUsers || 'N/A'}`,
    `用户痛点：${input.painPoints || 'N/A'}`,
    `所属行业：${input.industry || 'N/A'}`,
    `目标市场：${input.market || 'N/A'}`,
    '',
    '输出要求：',
    '1. 只输出一个合法 JSON 对象，不要输出 Markdown 代码块、解释或额外文字。',
    '2. marketAnalysis 中所有市场规模必须标注为估算，并提供 confidence、sources、assumptions、risks。',
    '3. 没有真实来源时，sources 使用 title 描述来源类型、url 留空、note 写“需要人工核验”，禁止编造网址。',
    '4. featurePrioritization 每一项必须包含 rationale 和 confidence，说明评分依据。',
    '5. 顶层 risks 至少包含市场、技术/实现、合规、执行四类风险判断。',
    '6. 所有内容必须是中文。'
  ].join('\n')
}

const SYSTEM_PROMPT = [
  '你是一名资深产品经理和战略分析师。你会输出结构化产品洞察草稿，但必须区分“模型估算”和“已核实事实”。',
  '你对市场规模、评分和指标的判断都只能作为建议，不能伪装成权威数据。',
  '必须包含：marketAnalysis（summary/tam/sam/som/confidence/dataQuality/sources/assumptions/risks/trends/competitors）、',
  'userPersonas、featurePrioritization（含 rice、score、rationale、confidence）、mvpScope、successMetrics（okrs/kpis）、risks。'
].join('\n')

const GROUNDED_SYSTEM_PROMPT = [
  '你是一名严谨的产品经理。你只能根据用户提供的检索证据生成完整 PRD 草稿。',
  '禁止编造市场规模、竞品、用户、功能、指标、路线图或来源。',
  '证据不足时，相关字段使用空数组，或写“暂无证据”，不得用模型知识补全。',
  '每条结论必须在对应条目中携带 sourceUrl，且只能来自提供的证据。',
  '输出必须是合法 JSON，不要输出 Markdown 代码块或额外文字。'
].join('\n')

function buildEvidenceDigest(evidenceItems) {
  return (evidenceItems || [])
    .slice(0, 40)
    .map((item, index) => {
      const title = asString(item?.title)
      const value = asString(item?.value).slice(0, 300)
      const sourceUrl = asString(item?.sourceUrl)
      const sourceTitle = asString(item?.sourceTitle)
      return `${index + 1}. [${asString(item?.category)}] ${title}\n内容：${value}\n来源：${sourceTitle || sourceUrl || '未提供'}${sourceUrl ? `\n链接：${sourceUrl}` : ''}`
    })
    .join('\n\n')
}

function buildGroundedUserMessage(input, evidenceItems) {
  return [
    '请根据以下产品信息和检索证据，生成一份可直接修改的完整 PRD 草稿。',
    '',
    `产品描述：${input.productIdea || 'N/A'}`,
    `目标用户：${input.targetUsers || 'N/A'}`,
    `用户痛点：${input.painPoints || 'N/A'}`,
    `所属行业：${input.industry || 'N/A'}`,
    `目标市场：${input.market || 'N/A'}`,
    '',
    '=== 检索证据 ===',
    buildEvidenceDigest(evidenceItems) || '暂无证据',
    '',
    '=== 输出 JSON 结构 ===',
    JSON.stringify({
      marketAnalysis: {
        summary: '基于证据的一句话市场概述',
        tam: '只有证据中出现时才填',
        sam: '只有证据中出现时才填',
        som: '只有证据中出现时才填',
        confidence: '低/中/高',
        dataQuality: { level: '低/中/高', reason: '说明' },
        sources: [{ title: '', url: '', note: '' }],
        assumptions: ['基于证据的假设'],
        risks: ['基于证据的风险'],
        trends: [{ title: '', description: '', sourceUrl: '' }],
        competitors: [{ name: '', strength: '', weakness: '', sourceUrl: '' }]
      },
      userPersonas: [{ name: '', age: '', role: '', background: '', goals: [], painPoints: [], sourceUrl: '' }],
      featurePrioritization: [
        { feature: '', description: '', rice: { reach: 0, impact: 0, confidence: 0, effort: 0 }, score: 0, rationale: '必须写依据', confidence: '低/中/高', sourceUrl: '' }
      ],
      mvpScope: [{ phase: 'MVP/V2/V3', features: [], goal: '', sourceUrl: '' }],
      successMetrics: {
        okrs: [{ objective: '', keyResults: [], sourceUrl: '' }],
        kpis: [{ metric: '', target: '', unit: '', sourceUrl: '' }]
      },
      prdDraft: {
        title: '',
        summary: '',
        background: [{ title: '', description: '', source: { title: '', url: '' } }],
        targetUsers: [{ name: '', description: '', source: { title: '', url: '' } }],
        userStories: [{ title: '', description: '', source: { title: '', url: '' } }],
        requirements: [{ title: '', description: '', source: { title: '', url: '' } }],
        nonFunctional: [{ title: '', description: '', source: { title: '', url: '' } }],
        openQuestions: [{ title: '', description: '', source: { title: '', url: '' } }],
        competitors: [{ name: '', evidence: '', source: { title: '', url: '' } }],
        features: [{ name: '', description: '', source: { title: '', url: '' } }],
        risks: [{ title: '', description: '', level: '' }]
      },
      risks: [{ title: '', description: '', level: '' }]
    }, null, 2)
  ].join('\n')
}

async function callGroundedDeepSeek(input, evidenceItems, apiKey, proxyUrl) {
  const endpoint = proxyUrl || API_ENDPOINT
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const startedAt = Date.now()

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: GROUNDED_SYSTEM_PROMPT },
          { role: 'user', content: buildGroundedUserMessage(input, evidenceItems) }
        ],
        temperature: 0.2,
        max_tokens: 8000
      }),
      signal: controller.signal
    })

    const raw = await response.text()
    if (!response.ok) {
      throw new Error(friendlyApiError(response.status, raw))
    }

    const data = JSON.parse(raw)
    const content = data?.choices?.[0]?.message?.content || ''
    const report = normalizeReport(extractJson(content))
    const usage = data?.usage || {}

    return {
      report,
      meta: {
        mode: 'grounded',
        model: data?.model || 'deepseek-chat',
        sourceCount: (evidenceItems || []).length,
        elapsedMs: Date.now() - startedAt,
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
        createdAt: new Date().toISOString()
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('DeepSeek 生成 PRD 超时，请稍后重试。')
    }
    if (err.message.includes('Failed to fetch')) {
      throw new Error('无法连接 DeepSeek，请检查 API Key 或代理地址。')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function generateGroundedPrd(input, evidenceItems) {
  const apiKey = localStorage.getItem('openai_api_key')
  if (!apiKey) {
    throw new Error('请先在设置中配置 DeepSeek API Key，才能生成完整的 PRD 章节。')
  }
  const proxyUrl = localStorage.getItem('proxy_url') || ''
  return callGroundedDeepSeek(input, evidenceItems, apiKey, proxyUrl)
}

async function callDeepSeek(input) {
  const apiKey = localStorage.getItem('openai_api_key')
  if (!apiKey) {
    throw new Error('请先在设置中配置 DeepSeek API Key；没有 Key 可以先体验示例报告。')
  }

  const proxyUrl = localStorage.getItem('proxy_url') || ''
  const endpoint = proxyUrl || API_ENDPOINT
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const startedAt = Date.now()

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserMessage(input) }
        ],
        temperature: 0.4,
        max_tokens: 6000
      }),
      signal: controller.signal
    })

    const raw = await response.text()
    if (!response.ok) {
      throw new Error(friendlyApiError(response.status, raw))
    }

    const data = JSON.parse(raw)
    const content = data?.choices?.[0]?.message?.content || ''
    const report = normalizeReport(extractJson(content))
    const usage = data?.usage || {}

    return {
      report,
      meta: {
        mode: 'api',
        model: data?.model || 'deepseek-chat',
        elapsedMs: Date.now() - startedAt,
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
        createdAt: new Date().toISOString()
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('AI 请求超过 90 秒未返回，请检查网络或稍后重试。')
    }
    if (err.message.includes('Failed to fetch')) {
      throw new Error('无法连接到 AI 服务，请检查网络、API Key 或代理地址。')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

function buildDemoReport(input) {
  const product = input.productIdea?.trim() || 'AI 驱动的产品洞察平台'
  const target = input.targetUsers?.trim() || '中小团队产品经理、创业者、产品新人'
  const market = input.market?.trim() || '中国企业服务与个人效率工具市场'

  return {
    marketAnalysis: {
      summary: `围绕“${product}”做早期判断：目标用户是${target}，核心价值在于把分散的分析动作压缩成一次结构化输出。该判断是示例草稿，不代表真实市场规模。`,
      tam: '约 200 亿元（示例估算，需人工核验）',
      sam: '约 60 亿元（示例估算，需人工核验）',
      som: '约 6 亿元（示例估算，需人工核验）',
      confidence: '低',
      dataQuality: {
        level: '低',
        reason: '示例报告未接入实时数据源，数字仅用于演示结构，不应用于决策。'
      },
      sources: [
        { title: '示例来源：行业报告/官网数据', url: '', note: '需要人工核验并替换为真实来源' },
        { title: '示例来源：用户访谈/问卷', url: '', note: '当前未采集真实用户数据' }
      ],
      assumptions: [
        '假设目标用户愿意为“更快得到结构化洞察”付费。',
        '假设 AI 生成结果在人工核验后能够进入日常工作流。',
        '假设市场规模估算口径为中国大陆企业服务市场。'
      ],
      risks: [
        'AI 估算的市场规模可能显著偏离真实数据。',
        '目标用户可能更愿意使用通用对话工具，而不是独立产品。',
        '报告内容如果被直接用于 BP 或对外汇报，存在事实风险。'
      ],
      trends: [
        { title: 'AI 工作流工具从对话走向任务闭环', description: '用户不再满足于问答，而是希望结果可以直接编辑、导出和沉淀。' },
        { title: '企业对 AI 输出可信度要求提高', description: '引用来源、置信度和人工核验逐渐成为付费产品的基本要求。' }
      ],
      competitors: [
        { name: '通用 AI 对话（ChatGPT/DeepSeek 等）', strength: '能力强、免配置、用户习惯成熟', weakness: '输出不稳定，需要自己维护 Prompt 和工作流' },
        { name: 'Notion AI 等文档型 AI', strength: '与文档协作结合好', weakness: '缺少产品分析专用框架和决策支持' },
        { name: '咨询公司/市场报告', strength: '专业、有来源、权威性高', weakness: '价格高、周期长、不针对具体想法' }
      ]
    },
    userPersonas: [
      {
        name: '陈敏',
        age: '27 岁',
        role: '互联网产品经理',
        background: '在 50-200 人公司负责新功能方向判断，团队没有专职用研和数据团队。',
        goals: ['快速判断想法是否值得立项', '拿到能用于周会讨论的结构化材料'],
        painPoints: ['手动查资料和写报告耗时', 'AI 对话结果零散，无法直接汇报']
      },
      {
        name: '林舟',
        age: '30 岁',
        role: '创业者',
        background: '正在准备 BP 和 MVP 规划，预算有限，需要低成本做早期验证。',
        goals: ['获得市场规模和竞品格局初稿', '明确 MVP 范围和验证指标'],
        painPoints: ['数据来源不确定', '分析框架多但不会组合使用']
      },
      {
        name: '阿杰',
        age: '22 岁',
        role: '产品新人/在校生',
        background: '正在学习产品分析方法论，需要课程作业或面试作品。',
        goals: ['掌握 TAM/SAM/SOM、RICE、OKR 等框架', '快速产出结构完整的练习报告'],
        painPoints: ['缺少真实业务上下文', '容易照搬模板导致内容空泛']
      }
    ],
    featurePrioritization: [
      {
        feature: '产品想法输入与上下文补充',
        description: '收集产品描述、用户、痛点、行业和市场信息。',
        rice: { reach: 10, impact: 9, confidence: 8, effort: 3 },
        score: 24,
        rationale: '输入质量直接决定报告质量，属于所有后续功能的基础。',
        confidence: '中高'
      },
      {
        feature: '结构化洞察报告生成',
        description: '生成市场分析、用户画像、RICE、MVP 和指标体系。',
        rice: { reach: 9, impact: 10, confidence: 8, effort: 4 },
        score: 18,
        rationale: '这是核心价值，也是用户完成一次分析的最低要求。',
        confidence: '中'
      },
      {
        feature: '报告保存、历史与导出',
        description: '支持本地保存、打开历史报告，导出 Markdown 和打印 PDF。',
        rice: { reach: 8, impact: 9, confidence: 8, effort: 3 },
        score: 19.2,
        rationale: '报告如果不能沉淀和导出，就难以进入真实工作流。',
        confidence: '中'
      },
      {
        feature: '数据可信度与人工核验',
        description: '展示置信度、来源、假设和风险，并允许用户补充修正。',
        rice: { reach: 7, impact: 10, confidence: 8, effort: 3 },
        score: 18.7,
        rationale: 'AI 估算必须有边界说明，否则用户无法安全使用结果。',
        confidence: '中高'
      }
    ],
    mvpScope: [
      {
        phase: 'MVP',
        features: ['产品想法输入', 'AI 洞察生成', '示例报告', '报告保存与导出'],
        goal: '验证用户是否愿意用 1 分钟获得可讨论的结构化草稿。'
      },
      {
        phase: 'V2',
        features: ['真实来源检索', '报告在线编辑', '追问与逐节重生成'],
        goal: '提升报告可信度和可落地程度。'
      },
      {
        phase: 'V3',
        features: ['团队共享', '评论协作', '历史版本对比'],
        goal: '从个人工具扩展为团队决策工作流。'
      }
    ],
    successMetrics: {
      okrs: [
        {
          objective: '让 PM 在 1 分钟内获得结构化洞察草稿',
          keyResults: ['报告平均生成时间低于 60 秒', '首周至少 60% 新用户完成一次报告生成']
        },
        {
          objective: '让报告能进入真实工作流',
          keyResults: ['报告导出使用率超过 40%', '报告编辑或重新生成率超过 30%']
        }
      ],
      kpis: [
        { metric: '周生成报告数', target: '3', unit: '份/人' },
        { metric: '报告采纳率', target: '60', unit: '%' },
        { metric: '次日留存', target: '30', unit: '%' },
        { metric: '7 日留存', target: '15', unit: '%' }
      ]
    },
    risks: [
      { title: '市场数据真实性', description: '当前为模型估算，缺少实时来源和人工核验，可能误导决策。', level: '高' },
      { title: '通用工具替代', description: 'ChatGPT/DeepSeek 已具备类似能力，差异化需要落在工作流和可信度上。', level: '中' },
      { title: '合规与隐私', description: '用户输入的商业想法和 API Key 都需要明确保存边界。', level: '中' },
      { title: '执行风险', description: '报告只是草稿，缺少用户访谈、竞品验证和团队校准就会空泛。', level: '中' }
    ]
  }
}

export function generateDemoReport(input = {}) {
  const raw = buildDemoReport(input)
  return {
    report: normalizeReport(raw),
    meta: {
      mode: 'demo',
      model: '内置示例数据',
      elapsedMs: 0,
      createdAt: new Date().toISOString()
    }
  }
}

export async function analyzeProduct(input) {
  return callDeepSeek(input)
}
