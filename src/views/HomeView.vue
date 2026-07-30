<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="tag tag-primary">AI Powered</span>
            <span class="tag tag-accent">Product Strategy</span>
          </div>
          <h1 class="hero-title">
            从想法到洞察<br />
            <span class="hero-highlight">只需一次输入</span>
          </h1>
          <p class="hero-desc">
            输入你的产品想法，AI 自动生成结构化的市场分析、用户画像、功能优先级评估、
            MVP 范围建议和成功指标体系——让每一个产品决策都有据可依。
          </p>
        </div>
      </div>
      <div class="hero-bg"></div>
    </section>

    <section class="form-section">
      <div class="container">
        <div class="form-card card">
          <div class="form-card-header">
            <h2>开始分析你的产品想法</h2>
            <p>填写以下信息，AI 将为你生成一份完整的产品洞察报告</p>
          </div>
          <form @submit.prevent="handleSubmit" class="form-body">
            <div class="form-row">
              <div class="form-group full">
                <label class="form-label">产品想法 / 一句话描述 <span class="required">*</span></label>
                <textarea v-model="form.productIdea" class="form-textarea" rows="3" placeholder="例如：一个利用 AI 帮助产品经理快速生成竞品分析报告的工具" required maxlength="500"></textarea>
                <p class="form-hint">{{ form.productIdea.length }}/500</p>
              </div>
            </div>
            <div class="form-row two-cols">
              <div class="form-group">
                <label class="form-label">目标用户群体</label>
                <input v-model="form.targetUsers" class="form-input" placeholder="例如：互联网产品经理、创业者" />
              </div>
              <div class="form-group">
                <label class="form-label">所属行业</label>
                <select v-model="form.industry" class="form-select">
                  <option value="">请选择行业</option>
                  <option value="互联网">互联网</option>
                  <option value="教育">教育</option>
                  <option value="医疗健康">医疗健康</option>
                  <option value="金融">金融</option>
                  <option value="电商">电商</option>
                  <option value="企业服务">企业服务</option>
                  <option value="游戏">游戏</option>
                  <option value="AI 大模型">AI / 大模型</option>
                  <option value="物联网">物联网</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full">
                <label class="form-label">要解决的痛点 / 用户需求</label>
                <textarea v-model="form.painPoints" class="form-textarea" rows="2" placeholder="描述你的目标用户遇到了什么问题，或者有什么未被满足的需求"></textarea>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full">
                <label class="form-label">目标市场（可选）</label>
                <input v-model="form.market" class="form-input" placeholder="例如：中国中小企业市场、东南亚教育市场" />
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-large" :disabled="!form.productIdea.trim() || loading">
                <template v-if="loading">
                  <span class="loading-spinner" style="width:18px;height:18px;border-width:2px"></span>
                  正在分析...
                </template>
                <template v-else>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  开始分析
                </template>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <h2 class="section-title">你将会得到什么</h2>
        <div class="features-grid">
          <div class="feature-card card" v-for="f in features" :key="f.title">
            <div class="feature-icon" :style="{ background: f.bg }">
              <span v-html="f.icon"></span>
            </div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="error" class="toast-error-msg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {{ error }}
          <button @click="error = ''">&times;</button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnalysisStore } from '../stores/analysis'
import { analyzeProduct } from '../services/aiService'

const router = useRouter()
const store = useAnalysisStore()

const form = reactive({
  productIdea: '',
  targetUsers: '',
  painPoints: '',
  industry: '',
  market: ''
})

const loading = ref(false)
const error = ref('')

const features = ref([
  {
    title: '市场分析',
    desc: 'TAM/SAM/SOM 市场规模估算、行业趋势洞察、竞品格局分析',
    bg: 'rgba(99,102,241,0.1)',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><line x1="18" y1="12" x2="18" y2="17"/></svg>'
  },
  {
    title: '用户画像',
    desc: 'AI 生成 2-3 个典型用户画像，包含背景、目标和痛点',
    bg: 'rgba(6,182,212,0.1)',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  },
  {
    title: '功能优先级',
    desc: '基于 RICE 框架量化评分（覆盖度、影响力、信心度、工作量）',
    bg: 'rgba(16,185,129,0.1)',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
  },
  {
    title: 'MVP 路线图',
    desc: '分阶段的产品迭代规划，明确每个阶段的交付目标和验证指标',
    bg: 'rgba(245,158,11,0.1)',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><polyline points="4 17 10 11 14 15 20 9"/><polyline points="14 9 20 9 20 15"/></svg>'
  },
  {
    title: '成功指标体系',
    desc: 'OKR 目标和关键结果 + 核心 KPI 看板，量化产品成功标准',
    bg: 'rgba(239,68,68,0.1)',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
  }
])

async function handleSubmit() {
  if (!form.productIdea.trim()) return
  loading.value = true
  error.value = ''

  store.setInput({ ...form })
  store.clearAnalysis()

  try {
    const result = await analyzeProduct({ ...form })
    store.setResult(result)
    router.push('/results')
  } catch (err) {
    error.value = err.message || '分析失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.home { padding-bottom: 60px; }

.hero {
  position: relative;
  overflow: hidden;
  padding: 60px 0 40px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(6,182,212,0.04) 100%);
  z-index: -1;
}

.hero-content { text-align: center; max-width: 680px; margin: 0 auto; }
.hero-badge { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; }
.hero-title { font-size: 40px; font-weight: 800; line-height: 1.2; color: var(--gray-900); margin-bottom: 16px; }
.hero-highlight {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-desc { font-size: 16px; color: var(--gray-500); line-height: 1.7; margin: 0 auto; }

.form-section { padding: 0 0 40px; }
.form-card { max-width: 720px; margin: 0 auto; overflow: hidden; }
.form-card-header { padding: 28px 32px 0; }
.form-card-header h2 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
.form-card-header p { font-size: 14px; color: var(--gray-500); }
.form-body { padding: 24px 32px 32px; }
.form-row { width: 100%; }
.form-row.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.required { color: var(--danger); }
.form-actions { margin-top: 8px; }
.btn-large { width: 100%; padding: 14px 24px; font-size: 16px; justify-content: center; }

.features-section { padding: 40px 0; }
.section-title { text-align: center; font-size: 24px; font-weight: 700; margin-bottom: 28px; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 1060px; margin: 0 auto; }
.feature-card { padding: 24px; text-align: center; transition: 0.2s ease; }
.feature-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.feature-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; margin: 0 auto 14px; }
.feature-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.feature-card p { font-size: 13px; color: var(--gray-500); line-height: 1.5; }

.toast-error-msg {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 10px; padding: 12px 20px;
  border-radius: var(--radius); font-size: 14px; box-shadow: var(--shadow-lg); z-index: 300;
  background: #fef2f2; color: var(--danger); border: 1px solid #fecaca;
}

@media (max-width: 600px) {
  .hero-title { font-size: 28px; }
  .form-body { padding: 20px; }
  .form-row.two-cols { grid-template-columns: 1fr; }
}
</style>
