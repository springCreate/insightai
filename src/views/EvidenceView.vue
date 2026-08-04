<template>
  <div class="evidence">
    <div class="container">
      <router-link to="/" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        返回
      </router-link>

      <div class="page-head">
        <h1>证据驱动报告</h1>
        <p>报告只使用你填写并标注来源的内容。没有来源或没有填写的项目显示“暂无已核实数据”，系统不会自动编造市场数字、竞品或风险。</p>
      </div>

      <div class="form-card card">
        <div class="form-card-header">
          <h2>1. 产品信息</h2>
        </div>
        <div class="form-body">
          <div class="form-row">
            <div class="form-group full">
              <label class="form-label">产品名称 / 一句话描述 <span class="required">*</span></label>
              <textarea v-model="form.productIdea" class="form-textarea" rows="2" maxlength="500" placeholder="例如：AI 驱动的产品经理分析工具"></textarea>
            </div>
          </div>
          <div class="form-row two-cols">
            <div class="form-group">
              <label class="form-label">目标用户</label>
              <input v-model="form.targetUsers" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">行业</label>
              <input v-model="form.industry" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group full">
              <label class="form-label">目标市场</label>
              <input v-model="form.market" class="form-input" placeholder="例如：中国 SaaS 市场" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group full">
              <label class="form-label">要解决的痛点 / 用户需求</label>
              <textarea v-model="form.painPoints" class="form-textarea" rows="2" placeholder="例如：产品经理收集竞品信息耗时太长，报告难以沉淀"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="form-card card">
        <div class="form-card-header">
          <h2>2. 证据条目</h2>
          <p>每条证据都需要填写事实/结论、数值或摘要，以及来源名称或来源链接。没有来源的条目无法生成到报告中。</p>
        </div>
        <div class="form-body">
          <div class="evidence-list">
            <div class="evidence-item" v-for="(item, idx) in evidenceItems" :key="item.id">
              <div class="evidence-item-head">
                <span class="evidence-index">{{ idx + 1 }}</span>
                <button class="btn btn-outline danger-text" type="button" @click="removeItem(item.id)">删除</button>
              </div>
              <div class="evidence-grid">
                <div class="form-group">
                  <label class="form-label">类别</label>
                  <select v-model="item.category" class="form-select">
                    <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.label }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">事实 / 结论</label>
                  <input v-model="item.title" class="form-input" placeholder="例如：中国 SaaS 市场 TAM" />
                </div>
                <div class="form-group">
                  <label class="form-label">数值 / 摘要</label>
                  <input v-model="item.value" class="form-input" placeholder="例如：约 500 亿元（2025 年）" />
                </div>
                <div class="form-group">
                  <label class="form-label">来源名称 <span class="required">*</span></label>
                  <input v-model="item.sourceTitle" class="form-input" placeholder="例如：IDC 行业报告" />
                </div>
                <div class="form-group">
                  <label class="form-label">来源链接</label>
                  <input v-model="item.sourceUrl" class="form-input" type="url" placeholder="https://..." />
                </div>
                <div class="form-group">
                  <label class="form-label">资料日期</label>
                  <input v-model="item.sourceDate" class="form-input" type="date" />
                </div>
                <div class="form-group full">
                  <label class="form-label">备注 / 风险等级</label>
                  <input v-model="item.note" class="form-input" placeholder="例如：统计口径为企业客户，或风险等级为高" />
                </div>
              </div>
            </div>
          </div>
          <div class="evidence-actions">
            <button class="btn btn-primary" type="button" @click="runAutoResearch" :disabled="generating">
              <template v-if="generating">{{ researchProgress || '正在自动检索...' }}</template>
              <template v-else>自动检索并生成 PRD 草稿</template>
            </button>
            <button class="btn btn-outline" type="button" @click="addItem">添加证据</button>
            <button class="btn btn-outline" type="button" @click="generateEvidenceReport" :disabled="generating">仅用现有证据生成</button>
          </div>
          <p v-if="researchProgress" class="research-progress">当前检索：{{ researchProgress }}</p>
        </div>
      </div>

      <div class="trust-note">
        无幻觉边界：生成逻辑不调用大模型补事实，只按类别汇总你填写的证据。来源链接是否真实、资料是否最新，仍需要在导出前人工复核。
      </div>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="error" class="toast-error-msg">
          {{ error }}
          <button @click="error = ''">&times;</button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAnalysisStore } from '../stores/analysis'
import { buildEvidenceReport, defaultEvidenceItem, EVIDENCE_CATEGORIES } from '../services/evidenceService'
import { runResearch } from '../services/researchService'

const router = useRouter()
const route = useRoute()
const store = useAnalysisStore()

const categories = EVIDENCE_CATEGORIES
const STORAGE_KEY = 'insightai_evidence_v1'
const generating = ref(false)
const error = ref('')
const researchProgress = ref('')

const form = reactive({
  productIdea: '',
  targetUsers: '',
  painPoints: '',
  industry: '',
  market: ''
})

const evidenceItems = ref([defaultEvidenceItem()])

function persistDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    form: { ...form },
    items: evidenceItems.value
  }))
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (saved.form) Object.assign(form, saved.form)
    if (Array.isArray(saved.items) && saved.items.length) {
      evidenceItems.value = saved.items.map((item) => ({ ...defaultEvidenceItem(), ...item }))
    }
  } catch (err) {
    console.warn('[InsightAI] failed to load evidence draft', err)
  }
  if (!form.productIdea && store.input.productIdea) {
    Object.assign(form, { ...store.input })
  }
}

function addItem() {
  evidenceItems.value.push(defaultEvidenceItem())
}

function removeItem(id) {
  evidenceItems.value = evidenceItems.value.filter((item) => item.id !== id)
}

function generateEvidenceReport() {
  if (!form.productIdea.trim()) {
    error.value = '请先填写产品名称或一句话描述。'
    return
  }

  const missingSource = evidenceItems.value.some((item) => {
    const hasContent = item.title.trim() || item.value.trim()
    return hasContent && !item.sourceTitle.trim() && !item.sourceUrl.trim()
  })
  if (missingSource) {
    error.value = '每条证据必须填写来源名称或来源链接，否则无法确保真实性。'
    return
  }

  generating.value = true
  error.value = ''
  try {
    const { report, meta } = buildEvidenceReport({ ...form }, evidenceItems.value)
    store.saveReport({
      input: { ...form },
      result: report,
      meta
    })
    persistDraft()
    router.push('/results')
  } catch (err) {
    error.value = err.message || '证据报告生成失败，请重试'
  } finally {
    generating.value = false
  }
}

async function runAutoResearch() {
  if (!form.productIdea.trim()) {
    error.value = '请先填写产品名称或一句话描述。'
    return
  }

  const tavilyKey = localStorage.getItem('tavily_api_key')

  generating.value = true
  error.value = ''
  researchProgress.value = '准备检索词'
  try {
    const items = await runResearch({ ...form }, tavilyKey, (label) => {
      researchProgress.value = label
    })

    if (items.length === 0) {
      error.value = '未检索到可用网页资料，请检查产品描述或稍后重试。'
      return
    }

    evidenceItems.value = items
    const { report, meta } = buildEvidenceReport({ ...form }, evidenceItems.value)
    store.saveReport({
      input: { ...form },
      result: report,
      meta
    })
    persistDraft()
    router.push('/results')
  } catch (err) {
    error.value = err.message || '自动检索失败，请稍后重试'
  } finally {
    generating.value = false
    researchProgress.value = ''
  }
}

onMounted(() => {
  loadDraft()
  if (route.query.auto === '1' && form.productIdea.trim()) {
    runAutoResearch()
  }
})
watch([form, evidenceItems], persistDraft, { deep: true })
</script>

<style scoped>
.evidence { padding: 40px 0 60px; }
.back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; color: var(--gray-500); text-decoration: none; margin-bottom: 24px; }
.back-link:hover { color: var(--primary); }
.page-head { max-width: 760px; margin-bottom: 24px; }
.page-head h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
.page-head p { font-size: 14px; color: var(--gray-500); line-height: 1.7; }
.form-card { max-width: 900px; margin: 0 auto 20px; overflow: hidden; }
.form-card-header { padding: 24px 28px 0; }
.form-card-header h2 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.form-card-header p { font-size: 13px; color: var(--gray-500); }
.form-body { padding: 20px 28px 28px; }
.form-row { width: 100%; }
.form-row.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.required { color: var(--danger); }
.evidence-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
.evidence-item { border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 16px; background: var(--gray-50); }
.evidence-item-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.evidence-index { width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--primary); color: white; font-size: 13px; font-weight: 700; }
.evidence-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.evidence-grid .full { grid-column: 1 / -1; }
.evidence-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.danger-text { color: var(--danger); }
.danger-text:hover { border-color: var(--danger); color: var(--danger); }
.trust-note { max-width: 900px; margin: 20px auto 0; padding: 16px 20px; border-left: 4px solid var(--success); background: #ecfdf5; color: #065f46; font-size: 13px; line-height: 1.7; }
.research-progress { margin-top: 10px; font-size: 13px; color: var(--primary); }
.toast-error-msg { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: var(--radius); font-size: 14px; box-shadow: var(--shadow-lg); z-index: 300; background: #fef2f2; color: var(--danger); border: 1px solid #fecaca; }

@media (max-width: 600px) {
  .form-row.two-cols, .evidence-grid { grid-template-columns: 1fr; }
  .form-body { padding: 20px; }
}
</style>
