<template>
  <div class="home">
    <div class="container">
      <section class="workspace card">
        <div class="workspace-head">
          <div>
            <h1>用真实网页生成 PRD 草稿</h1>
            <p>只需输入产品想法，检索、证据整理、PRD 草稿和来源挂载会自动完成。</p>
          </div>
          <span class="status-chip" :class="keySaved ? 'ready' : 'missing'">
            {{ keySaved ? '本地检索已配置' : '未配置本地检索' }}
          </span>
        </div>

        <form @submit.prevent="startAutoResearch">
          <div class="form-group">
            <label class="form-label">产品想法 <span class="required">*</span></label>
            <textarea v-model="form.productIdea" class="form-textarea" rows="3" maxlength="500" placeholder="例如：一个帮助产品经理自动收集竞品信息并生成 PRD 草稿的工具" required></textarea>
            <p class="form-hint">{{ form.productIdea.length }}/500</p>
          </div>

          <details class="optional-details">
            <summary>补充可选信息（推荐）</summary>
            <div class="optional-grid">
              <div class="form-group">
                <label class="form-label">目标用户群体</label>
                <input v-model="form.targetUsers" class="form-input" placeholder="例如：互联网产品经理" />
              </div>
              <div class="form-group">
                <label class="form-label">所属行业</label>
                <input v-model="form.industry" class="form-input" placeholder="例如：企业服务 / AI" />
              </div>
              <div class="form-group">
                <label class="form-label">目标市场</label>
                <input v-model="form.market" class="form-input" placeholder="例如：中国中小企业市场" />
              </div>
              <div class="form-group">
                <label class="form-label">要解决的痛点</label>
                <input v-model="form.painPoints" class="form-input" placeholder="例如：竞品调研太慢" />
              </div>
            </div>
          </details>

          <div v-if="!keySaved" class="key-row">
            <div class="key-input-wrap">
              <input v-model="tavilyKey" type="password" class="form-input" placeholder="粘贴 Tavily API Key" />
            </div>
            <button type="button" class="btn btn-outline" @click="saveTavilyKey">保存 Key</button>
            <p class="key-note">Key 仅保存在当前浏览器；正式部署后可改为后端统一配置，用户无需填写。</p>
          </div>
          <div v-else class="key-row key-row--saved">
            <p class="key-note">Tavily Key 已保存在本机浏览器。</p>
            <button type="button" class="btn btn-outline" @click="resetKey">更换 Key</button>
          </div>

          <div class="start-row">
            <button type="submit" class="btn btn-primary btn-large" :disabled="busy || !form.productIdea.trim()">
              <template v-if="busy">{{ progress || '正在准备...' }}</template>
              <template v-else>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                开始生成 PRD
              </template>
            </button>
            <button type="button" class="btn btn-outline btn-large" @click="openDemo" :disabled="busy">先看示例</button>
          </div>

          <p v-if="error" class="inline-error">{{ error }}</p>
        </form>
      </section>

      <section v-if="store.history.length" class="history-section">
        <h2>最近报告</h2>
        <div class="history-list">
          <div class="history-item card" v-for="entry in store.history" :key="entry.id">
            <div class="history-main">
              <strong>{{ entry.input.productIdea }}</strong>
              <span class="history-meta">{{ formatTime(entry.createdAt) }} · {{ entry.meta.mode === 'demo' ? '示例报告' : '自动调研' }}</span>
            </div>
            <div class="history-actions">
              <button class="btn btn-outline" @click="openHistory(entry)">查看</button>
              <button class="btn btn-outline danger-text" @click="store.deleteReport(entry.id)">删除</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAnalysisStore } from '../stores/analysis'
import { generateDemoReport, generateGroundedPrd } from '../services/aiService'
import { buildEvidenceReport } from '../services/evidenceService'
import { runResearch } from '../services/researchService'
import { trackEvent } from '../utils/report'

const router = useRouter()
const store = useAnalysisStore()

const form = reactive({
  productIdea: '',
  targetUsers: '',
  painPoints: '',
  industry: '',
  market: ''
})

const tavilyKey = ref(localStorage.getItem('tavily_api_key') || '')
const keySaved = ref(Boolean(localStorage.getItem('tavily_api_key') || ''))
const busy = ref(false)
const error = ref('')
const progress = ref('')

function saveTavilyKey() {
  const key = tavilyKey.value.trim()
  localStorage.setItem('tavily_api_key', key)
  keySaved.value = Boolean(key)
  error.value = ''
}

function resetKey() {
  localStorage.removeItem('tavily_api_key')
  tavilyKey.value = ''
  keySaved.value = false
}

function formatTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', { hour12: false })
}

async function openDemo() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    const demo = generateDemoReport({ ...form })
    store.saveReport({
      input: { ...form, productIdea: form.productIdea.trim() || 'AI 驱动的产品洞察平台' },
      result: demo.report,
      meta: demo.meta
    })
    router.push('/results')
  } catch (err) {
    error.value = err.message || '示例报告生成失败，请重试'
  } finally {
    busy.value = false
  }
}

async function startAutoResearch() {
  if (!form.productIdea.trim() || busy.value) return
  const apiKey = tavilyKey.value.trim() || localStorage.getItem('tavily_api_key') || ''
  if (apiKey) {
    localStorage.setItem('tavily_api_key', apiKey)
    keySaved.value = true
  }

  busy.value = true
  error.value = ''
  progress.value = '正在准备检索词'
  store.setInput({ ...form })
  store.clearAnalysis()
  trackEvent('analysis_started', {
    ideaLength: form.productIdea.length,
    fieldCount: Object.values(form).filter(Boolean).length
  })

  try {
    const items = await runResearch({ ...form }, apiKey, (label) => {
      progress.value = `正在检索：${label}`
    })

    if (items.length === 0) {
      error.value = '没有检索到可用网页资料，请换个产品描述或稍后重试。'
      return
    }

    const deepseekKey = localStorage.getItem('openai_api_key') || ''
    let result
    if (deepseekKey) {
      progress.value = 'DeepSeek 正在生成完整 PRD 草稿'
      result = await generateGroundedPrd({ ...form }, items)
    } else {
      const fallback = buildEvidenceReport({ ...form }, items)
      result = {
        report: fallback.report,
        meta: { ...fallback.meta, deepseekMissing: true }
      }
    }
    store.saveReport({
      input: { ...form },
      result: result.report,
      meta: result.meta
    })
    router.push('/results')
  } catch (err) {
    error.value = err.message || '自动检索失败，请检查 Key 和网络后重试'
  } finally {
    busy.value = false
    progress.value = ''
  }
}

function openHistory(entry) {
  store.openReport(entry)
  router.push('/results')
}
</script>

<style scoped>
.home { padding: 40px 0 60px; }
.workspace { max-width: 860px; margin: 0 auto; padding: 28px; }
.workspace-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
.workspace-head h1 { font-size: 26px; font-weight: 800; color: var(--gray-900); margin-bottom: 6px; }
.workspace-head p { font-size: 14px; color: var(--gray-500); }
.status-chip { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.status-chip.ready { background: #ecfdf5; color: #047857; }
.status-chip.missing { background: #fffbeb; color: #b45309; }
.optional-details { margin-bottom: 20px; }
.optional-details summary { cursor: pointer; font-size: 14px; font-weight: 600; color: var(--gray-600); margin-bottom: 12px; }
.optional-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.key-row { display: flex; align-items: flex-start; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; padding: 14px; background: var(--gray-50); border-radius: var(--radius); }
.key-row--saved { align-items: center; justify-content: space-between; }
.key-input-wrap { flex: 1; min-width: 240px; }
.key-note { width: 100%; font-size: 12px; color: var(--gray-400); margin: 0; }
.start-row { display: flex; gap: 10px; flex-wrap: wrap; }
.start-row .btn-large { flex: 1; min-width: 220px; }
.inline-error { margin-top: 12px; color: var(--danger); font-size: 13px; }
.history-section { max-width: 860px; margin: 32px auto 0; }
.history-section h2 { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.history-list { display: flex; flex-direction: column; gap: 10px; }
.history-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 18px; }
.history-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.history-main strong { font-size: 14px; color: var(--gray-800); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-meta { font-size: 12px; color: var(--gray-400); }
.history-actions { display: flex; gap: 8px; flex-shrink: 0; }
.danger-text { color: var(--danger); }
.danger-text:hover { border-color: var(--danger); color: var(--danger); }

@media (max-width: 600px) {
  .home { padding: 20px 0 40px; }
  .workspace { padding: 20px; }
  .workspace-head { flex-direction: column; }
  .optional-grid { grid-template-columns: 1fr; }
  .start-row { flex-direction: column; }
  .history-item { flex-direction: column; align-items: flex-start; }
}
</style>
