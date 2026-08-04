import test from 'node:test'
import assert from 'node:assert/strict'
import { generateDemoReport, normalizeReport } from '../src/services/aiService.js'
import { buildEvidenceReport } from '../src/services/evidenceService.js'
import { reportToMarkdown } from '../src/utils/report.js'
import { buildResearchQueries } from '../src/services/researchService.js'

test('demo report is normalized and exports to markdown', () => {
  const demo = generateDemoReport({
    productIdea: 'AI 面试助手',
    targetUsers: '产品经理',
    industry: 'AI',
    market: '中国'
  })

  assert.equal(demo.report.marketAnalysis.sources.length, 2)
  assert.equal(demo.report.userPersonas.length, 3)
  assert.ok(demo.report.featurePrioritization.length >= 3)
  assert.ok(demo.report.risks.length >= 4)

  const md = reportToMarkdown(
    { productIdea: 'AI 面试助手' },
    demo.report,
    demo.meta
  )
  assert.ok(md.includes('AI 面试助手'))
  assert.ok(md.includes('重要说明'))
  assert.ok(md.length > 1000)
})

test('markdown export includes full PRD draft sections', () => {
  const report = normalizeReport({
    prdDraft: {
      summary: '产品概述',
      userStories: [{ title: '用户故事', description: '描述' }],
      requirements: [{ title: '功能需求', description: '描述' }],
      nonFunctional: [{ title: '非功能需求', description: '描述' }],
      openQuestions: [{ title: '待确认问题', description: '描述' }]
    }
  })

  const md = reportToMarkdown(
    { productIdea: 'AI 面试助手' },
    report,
    { mode: 'demo', createdAt: '2026-01-01' }
  )

  assert.ok(md.includes('产品概述'))
  assert.ok(md.includes('用户故事'))
  assert.ok(md.includes('功能需求'))
  assert.ok(md.includes('非功能需求'))
  assert.ok(md.includes('待确认问题'))
})

test('research queries cover user, competitor, market and trend', () => {
  const queries = buildResearchQueries({
    productIdea: 'AI 面试助手',
    targetUsers: '产品经理',
    industry: 'AI',
    market: '中国'
  })

  assert.equal(queries.length, 4)
  assert.deepEqual(
    queries.map((query) => query.category),
    ['user', 'competitor', 'market', 'trend']
  )
  assert.ok(queries.every((query) => query.query.trim()))
})

test('normalizeReport tolerates partial AI output', () => {
  const report = normalizeReport({
    marketAnalysis: {
      tam: '约 10 亿元',
      sources: ['需要人工核验的行业报告']
    },
    featurePrioritization: [
      {
        feature: '核心功能',
        rice: { reach: 8, impact: 9, confidence: 7, effort: 4 }
      }
    ]
  })

  assert.equal(report.marketAnalysis.sam, '未知（需人工核验）')
  assert.equal(report.userPersonas.length, 0)
  assert.equal(report.featurePrioritization[0].score, 12.6)
  assert.equal(report.marketAnalysis.sources[0].title, '需要人工核验的行业报告')
  assert.equal(report.risks.length, 0)
})

test('evidence report never invents missing facts', () => {
  const { report, meta } = buildEvidenceReport(
    { productIdea: 'AI 面试助手' },
    [
      {
        category: 'market',
        title: '中国 AI 面试工具 TAM',
        value: '约 50 亿元（示例来源）',
        sourceTitle: '示例行业报告',
        sourceUrl: 'https://example.com/report',
        sourceDate: '2026-01-01'
      }
    ]
  )

  assert.equal(meta.mode, 'evidence')
  assert.equal(report.marketAnalysis.tam, '约 50 亿元（示例来源）')
  assert.equal(report.marketAnalysis.sam, '暂无已核实数据')
  assert.equal(report.userPersonas.length, 0)
  assert.equal(report.featurePrioritization.length, 0)
  assert.equal(report.mvpScope.length, 0)
  assert.equal(report.successMetrics.kpis.length, 0)
  assert.equal(report.prdDraft.title, 'AI 面试助手')
  assert.equal(report.prdDraft.targetUsers.length, 0)
})
