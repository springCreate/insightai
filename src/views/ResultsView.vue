<template>
  <div class="results">
    <div class="container">
      <!-- Back link -->
      <div class="results-top">
        <router-link to="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          返回
        </router-link>
        <div v-if="result" class="results-meta">
          <span class="tag tag-success">分析完成</span>
          <span class="tag tag-primary">{{ result.marketAnalysis.competitors.length }} 个竞品</span>
          <span class="tag tag-accent">{{ result.userPersonas.length }} 个用户画像</span>
        </div>
      </div>

      <!-- Report Header -->
      <div v-if="result" class="report-header card">
        <h1>{{ store.input.productIdea }}</h1>
        <div class="report-meta">
          <span v-if="store.input.industry" class="report-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/></svg>
            {{ store.input.industry }}
          </span>
          <span v-if="store.input.targetUsers" class="report-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            {{ store.input.targetUsers }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="store.isLoading" class="loading-state">
        <div class="loading-spinner" style="width:40px;height:40px;border-width:4px"></div>
        <p>AI 正在分析你的产品想法...</p>
        <div class="loading-steps">
          <div class="loading-step">理解产品概念</div>
          <div class="loading-step">分析市场环境</div>
          <div class="loading-step">构建用户画像</div>
          <div class="loading-step">评估功能优先级</div>
          <div class="loading-step">生成产品报告</div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="store.error" class="error-state card">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3>分析出错</h3>
        <p>{{ store.error }}</p>
        <router-link to="/" class="btn btn-primary">重新尝试</router-link>
      </div>

      <!-- Tabs (Results) -->
      <div v-if="result && !store.isLoading" class="tabs-container">
        <div class="tabs-header">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <span v-html="tab.icon"></span>
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- Market Analysis -->
          <div v-if="activeTab === 'market'" class="tab-pane">
            <h2 class="tab-title">市场分析</h2>
            <p class="tab-desc">{{ result.marketAnalysis.summary }}</p>
            <div class="market-numbers">
              <div class="market-card card">
                <div class="market-label">TAM（总可寻址市场）</div>
                <div class="market-value">{{ result.marketAnalysis.tam }}</div>
              </div>
              <div class="market-card card">
                <div class="market-label">SAM（可服务市场）</div>
                <div class="market-value">{{ result.marketAnalysis.sam }}</div>
              </div>
              <div class="market-card card">
                <div class="market-label">SOM（可获取市场）</div>
                <div class="market-value">{{ result.marketAnalysis.som }}</div>
              </div>
            </div>
            <div class="section-block">
              <h3>行业趋势</h3>
              <div class="trends-list">
                <div class="trend-item" v-for="t in result.marketAnalysis.trends" :key="t.title">
                  <div class="trend-dot"></div>
                  <div>
                    <strong>{{ t.title }}</strong>
                    <p>{{ t.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="section-block">
              <h3>竞品分析</h3>
              <div class="competitors-grid">
                <div class="competitor-card card" v-for="c in result.marketAnalysis.competitors" :key="c.name">
                  <h4>{{ c.name }}</h4>
                  <div class="comp-row">
                    <span class="comp-label">优势</span>
                    <span class="tag tag-success">{{ c.strength }}</span>
                  </div>
                  <div class="comp-row">
                    <span class="comp-label">劣势</span>
                    <span class="tag tag-danger">{{ c.weakness }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- User Personas -->
          <div v-if="activeTab === 'personas'" class="tab-pane">
            <h2 class="tab-title">用户画像</h2>
            <p class="tab-desc">AI 基于你的产品描述生成的典型用户画像，帮助你更好地理解目标用户</p>
            <div class="personas-grid">
              <div class="persona-card card" v-for="p in result.userPersonas" :key="p.name">
                <div class="persona-header">
                  <div class="persona-avatar">{{ p.name[0] }}</div>
                  <div>
                    <h3>{{ p.name }}</h3>
                    <span class="persona-role">{{ p.role }} · {{ p.age }}</span>
                  </div>
                </div>
                <div class="persona-section">
                  <div class="persona-label">背景</div>
                  <p>{{ p.background }}</p>
                </div>
                <div class="persona-section">
                  <div class="persona-label">目标</div>
                  <ul>
                    <li v-for="g in p.goals" :key="g">{{ g }}</li>
                  </ul>
                </div>
                <div class="persona-section">
                  <div class="persona-label">痛点</div>
                  <ul class="pain-list">
                    <li v-for="pt in p.painPoints" :key="pt">{{ pt }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature Prioritization -->
          <div v-if="activeTab === 'features'" class="tab-pane">
            <h2 class="tab-title">功能优先级评估</h2>
            <p class="tab-desc">基于 RICE 框架（覆盖度、影响力、信心度、工作量）对功能进行量化评分</p>
            <div class="rice-table-card card">
              <table class="rice-table">
                <thead>
                  <tr>
                    <th>功能</th>
                    <th>覆盖度</th>
                    <th>影响力</th>
                    <th>信心度</th>
                    <th>工作量</th>
                    <th>总分</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in sortedFeatures" :key="f.feature">
                    <td>
                      <div class="feature-name">{{ f.feature }}</div>
                      <div class="feature-desc">{{ f.description }}</div>
                    </td>
                    <td>{{ f.rice.reach }}</td>
                    <td>{{ f.rice.impact }}</td>
                    <td>{{ f.rice.confidence }}</td>
                    <td>{{ f.rice.effort }}</td>
                    <td><span class="score-badge">{{ f.score.toFixed(1) }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- MVP Scope -->
          <div v-if="activeTab === 'mvp'" class="tab-pane">
            <h2 class="tab-title">MVP 路线图</h2>
            <p class="tab-desc">分阶段的产品迭代规划，确保每个阶段都有明确的验证目标</p>
            <div class="timeline">
              <div class="timeline-item card" v-for="(phase, idx) in result.mvpScope" :key="phase.phase">
                <div class="timeline-marker">
                  <div class="timeline-dot">{{ idx + 1 }}</div>
                  <div v-if="idx < result.mvpScope.length - 1" class="timeline-line"></div>
                </div>
                <div class="timeline-content">
                  <h3>{{ phase.phase }}</h3>
                  <div class="timeline-tags">
                    <span class="tag tag-primary" v-for="f in phase.features" :key="f">{{ f }}</span>
                  </div>
                  <p class="timeline-goal">{{ phase.goal }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Success Metrics -->
          <div v-if="activeTab === 'metrics'" class="tab-pane">
            <h2 class="tab-title">成功指标体系</h2>
            <p class="tab-desc">通过 OKR 和 KPI 量化产品的成功标准</p>
            <div class="section-block">
              <h3>OKR 目标与关键结果</h3>
              <div class="okrs-list">
                <div class="okr-card card" v-for="o in result.successMetrics.okrs" :key="o.objective">
                  <h4>{{ o.objective }}</h4>
                  <ul class="kr-list">
                    <li v-for="kr in o.keyResults" :key="kr">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      {{ kr }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="section-block">
              <h3>核心 KPI 看板</h3>
              <div class="kpi-grid">
                <div class="kpi-card card" v-for="k in result.successMetrics.kpis" :key="k.metric">
                  <div class="kpi-value">{{ k.target }}</div>
                  <div class="kpi-unit">{{ k.unit }}</div>
                  <div class="kpi-label">{{ k.metric }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnalysisStore } from '../stores/analysis'

const route = useRoute()
const router = useRouter()
const store = useAnalysisStore()
const activeTab = ref('market')

const result = computed(() => store.result)

const tabs = [
  { key: 'market', label: '市场分析', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><line x1="18" y1="12" x2="18" y2="17"/></svg>' },
  { key: 'personas', label: '用户画像', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
  { key: 'features', label: '功能优先级', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
  { key: 'mvp', label: 'MVP 路线图', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 14 15 20 9"/><polyline points="14 9 20 9 20 15"/></svg>' },
  { key: 'metrics', label: '成功指标', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' }
]

const sortedFeatures = computed(() => {
  if (!result.value) return []
  return [...result.value.featurePrioritization].sort((a, b) => b.score - a.score)
})

// Redirect to home if no result
watch(result, (val) => {
  if (!val) {
    router.push('/')
  }
}, { immediate: true })
</script>

<style scoped>
.results { padding: 40px 0 60px; }

.results-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-500);
  text-decoration: none;
  transition: color var(--transition);
}

.back-link:hover { color: var(--primary); }

.results-meta { display: flex; gap: 8px; }

.report-header { padding: 28px 32px; margin-bottom: 24px; }
.report-header h1 { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
.report-meta { display: flex; gap: 16px; flex-wrap: wrap; }
.report-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--gray-500); }

.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-state p { margin: 20px 0; font-size: 16px; color: var(--gray-600); }

.loading-steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.loading-step {
  font-size: 14px;
  color: var(--gray-400);
  animation: pulse 2s ease infinite;
}

.loading-step:nth-child(1) { animation-delay: 0s; }
.loading-step:nth-child(2) { animation-delay: 0.4s; }
.loading-step:nth-child(3) { animation-delay: 0.8s; }
.loading-step:nth-child(4) { animation-delay: 1.2s; }
.loading-step:nth-child(5) { animation-delay: 1.6s; }

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.error-state { padding: 60px 32px; text-align: center; }
.error-state svg { margin-bottom: 16px; }
.error-state h3 { font-size: 20px; margin-bottom: 8px; }
.error-state p { color: var(--gray-500); margin-bottom: 20px; }

.tabs-container {
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  background: white;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--gray-200);
  overflow-x: auto;
  background: var(--gray-50);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-500);
  border-bottom: 2px solid transparent;
  transition: all var(--transition);
  white-space: nowrap;
}

.tab-btn:hover { color: var(--gray-700); background: white; }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); background: white; }

.tab-content { padding: 32px; }
.tab-title { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
.tab-desc { color: var(--gray-500); font-size: 14px; margin-bottom: 28px; }

.market-numbers { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 28px; }
.market-card { padding: 20px; text-align: center; }
.market-label { font-size: 12px; color: var(--gray-400); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.market-value { font-size: 16px; font-weight: 700; color: var(--primary); }

.section-block { margin-bottom: 28px; }
.section-block h3 { font-size: 16px; font-weight: 700; margin-bottom: 14px; color: var(--gray-700); }

.trends-list { display: flex; flex-direction: column; gap: 12px; }
.trend-item { display: flex; gap: 12px; align-items: flex-start; }
.trend-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-top: 6px; flex-shrink: 0; }
.trend-item strong { font-size: 14px; display: block; }
.trend-item p { font-size: 13px; color: var(--gray-500); margin-top: 2px; }

.competitors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.competitor-card { padding: 16px; }
.competitor-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
.comp-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.comp-label { font-size: 12px; color: var(--gray-400); min-width: 28px; }

.personas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.persona-card { padding: 24px; }
.persona-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.persona-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
.persona-role { font-size: 13px; color: var(--gray-500); }
.persona-section { margin-bottom: 12px; }
.persona-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gray-400); margin-bottom: 4px; }
.persona-section ul { list-style: none; padding: 0; }
.persona-section li { font-size: 13px; padding-left: 14px; position: relative; margin-bottom: 4px; }
.persona-section li::before { content: ''; position: absolute; left: 0; top: 7px; width: 4px; height: 4px; border-radius: 50%; background: var(--primary); }
.pain-list li::before { background: var(--danger); }

.rice-table-card { overflow-x: auto; }
.rice-table { width: 100%; border-collapse: collapse; }
.rice-table th { text-align: left; padding: 14px 16px; font-size: 13px; color: var(--gray-500); font-weight: 600; border-bottom: 2px solid var(--gray-200); }
.rice-table td { padding: 14px 16px; border-bottom: 1px solid var(--gray-100); font-size: 14px; }
.rice-table tr:last-child td { border-bottom: none; }
.feature-name { font-weight: 600; margin-bottom: 2px; }
.feature-desc { font-size: 12px; color: var(--gray-400); }
.score-badge { display: inline-block; padding: 4px 10px; border-radius: 100px; background: #eef2ff; color: var(--primary); font-weight: 700; font-size: 14px; }

.timeline { display: flex; flex-direction: column; gap: 0; position: relative; padding-left: 40px; }
.timeline-item { position: relative; margin-bottom: 20px; padding: 20px; }
.timeline-marker { position: absolute; left: -40px; top: 0; display: flex; flex-direction: column; align-items: center; }
.timeline-dot { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.timeline-line { width: 2px; height: calc(100% + 20px); background: var(--gray-200); margin-top: 4px; }
.timeline-content h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.timeline-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.timeline-goal { font-size: 13px; color: var(--gray-600); }

.okrs-list { display: flex; flex-direction: column; gap: 12px; }
.okr-card { padding: 20px; }
.okr-card h4 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
.kr-list { list-style: none; padding: 0; }
.kr-list li { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 6px; color: var(--gray-600); }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.kpi-card { padding: 20px; text-align: center; }
.kpi-value { font-size: 28px; font-weight: 800; color: var(--primary); }
.kpi-unit { font-size: 12px; color: var(--gray-400); margin-bottom: 4px; }
.kpi-label { font-size: 12px; color: var(--gray-500); }

@media (max-width: 600px) {
  .market-numbers { grid-template-columns: 1fr; }
  .tab-content { padding: 20px; }
  .rice-table th, .rice-table td { padding: 10px 12px; }
}
</style>
