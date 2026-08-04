<template>
  <div class="results">
    <div class="container">
      <div class="results-top">
        <router-link to="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          返回
        </router-link>
        <div v-if="result" class="results-actions">
          <button class="btn btn-outline" @click="copyMarkdown">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            复制 Markdown
          </button>
          <button class="btn btn-outline" @click="downloadMarkdown">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            下载 Markdown
          </button>
          <button class="btn btn-primary" @click="printReport">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            打印 / PDF
          </button>
        </div>
      </div>

      <div v-if="result" class="report-header card">
        <div class="report-title-row">
          <h1>{{ store.input.productIdea }}</h1>
          <span v-if="meta.mode === 'evidence'" class="tag tag-success">证据报告</span>
          <span v-else-if="meta.mode === 'demo'" class="tag tag-warning">示例报告</span>
          <span v-else class="tag tag-success">AI 分析</span>
        </div>
        <div class="report-meta">
          <span v-if="store.input.industry" class="report-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/></svg>
            {{ store.input.industry }}
          </span>
          <span v-if="store.input.targetUsers" class="report-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            {{ store.input.targetUsers }}
          </span>
          <span v-if="meta.createdAt" class="report-meta-item">{{ formatDate(meta.createdAt) }}</span>
          <span v-if="meta.totalTokens" class="report-meta-item">Token 用量：{{ meta.totalTokens }}</span>
        </div>
      </div>

      <div v-if="result" class="trust-banner card">
        <div class="trust-banner-head">
          <strong>{{ meta.mode === 'evidence' ? '本报告只展示已提供来源的内容' : '这份报告是 AI 草稿，不是已核实事实' }}</strong>
          <button class="text-button" @click="expandTrust = !expandTrust">
            {{ expandTrust ? '收起核验信息' : '查看来源、假设与风险' }}
          </button>
        </div>
        <p>{{ meta.mode === 'evidence' ? '系统不会自动补充市场数字；来源链接、资料日期和统计口径仍建议在导出前人工复核。' : '市场规模、RICE 分数、OKR/KPI 都是估算或建议。对外使用前，请补充真实来源、统计口径和人工校准。' }}</p>
        <div v-if="expandTrust" class="trust-details">
          <div class="trust-column">
            <h4>数据来源</h4>
            <ul>
              <li v-for="s in result.marketAnalysis.sources" :key="s.title">
                <strong>{{ s.title }}</strong>
                <span v-if="s.url">{{ s.url }}</span>
                <span v-if="s.note">{{ s.note }}</span>
              </li>
            </ul>
          </div>
          <div class="trust-column">
            <h4>关键假设</h4>
            <ul>
              <li v-for="a in result.marketAnalysis.assumptions" :key="a">{{ a }}</li>
            </ul>
          </div>
          <div class="trust-column">
            <h4>主要风险</h4>
            <ul>
              <li v-for="r in result.risks" :key="r.title">{{ r.title }}{{ r.level ? `（${r.level}）` : '' }}<span v-if="r.description">：{{ r.description }}</span></li>
            </ul>
          </div>
        </div>
      </div>

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

      <div v-else-if="store.error" class="error-state card">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3>分析出错</h3>
        <p>{{ store.error }}</p>
        <router-link to="/" class="btn btn-primary">重新尝试</router-link>
      </div>

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
          <div v-if="activeTab === 'prd'" class="tab-pane">
            <h2 class="tab-title">PRD 草稿</h2>
            <p class="tab-desc">由 DeepSeek 基于检索证据生成；每条结论尽量保留来源，没有证据的章节会明确留空。</p>
            <div v-if="hasPrdContent" class="prd-draft">
              <div v-if="result.prdDraft?.summary" class="section-block">
                <h3>产品概述</h3>
                <p>{{ result.prdDraft.summary }}</p>
              </div>
              <div class="section-block">
                <h3>背景与问题</h3>
                <div class="prd-item" v-for="item in result.prdDraft.background" :key="item.title">
                  <strong>{{ item.title }}</strong>
                  <p>{{ truncateText(item.description, 180) || '暂无描述' }}</p>
                  <a v-if="item.source.url" :href="item.source.url" target="_blank" rel="noopener">{{ item.source.url }}</a>
                </div>
                <p v-if="result.prdDraft.background.length === 0" class="empty-state">暂无背景证据。</p>
              </div>
              <div class="section-block">
                <h3>目标用户</h3>
                <div class="prd-item" v-for="item in result.prdDraft.targetUsers" :key="item.name">
                  <strong>{{ item.name }}</strong>
                  <p>{{ truncateText(item.description, 180) || '暂无描述' }}</p>
                  <a v-if="item.source.url" :href="item.source.url" target="_blank" rel="noopener">{{ item.source.url }}</a>
                </div>
                <p v-if="result.prdDraft.targetUsers.length === 0" class="empty-state">暂无目标用户证据。</p>
              </div>
              <div class="section-block">
                <h3>用户故事</h3>
                <div class="prd-item" v-for="item in result.prdDraft.userStories" :key="item.title">
                  <strong>{{ item.title }}</strong>
                  <p>{{ truncateText(item.description, 180) || '暂无描述' }}</p>
                  <a v-if="item.source.url" :href="item.source.url" target="_blank" rel="noopener">{{ item.source.url }}</a>
                </div>
                <p v-if="result.prdDraft.userStories.length === 0" class="empty-state">暂无用户故事。</p>
              </div>
              <div class="section-block">
                <h3>功能需求</h3>
                <div class="prd-item" v-for="item in result.prdDraft.requirements" :key="item.title">
                  <strong>{{ item.title }}</strong>
                  <p>{{ truncateText(item.description, 180) || '暂无描述' }}</p>
                  <a v-if="item.source.url" :href="item.source.url" target="_blank" rel="noopener">{{ item.source.url }}</a>
                </div>
                <p v-if="result.prdDraft.requirements.length === 0" class="empty-state">暂无功能需求证据。</p>
              </div>
              <div class="section-block">
                <h3>功能优先级</h3>
                <div v-if="result.featurePrioritization.length" class="prd-item" v-for="f in result.featurePrioritization" :key="f.feature">
                  <strong>{{ f.feature }} · 分数 {{ formatScore(f.score) }}</strong>
                  <p>{{ truncateText(f.description, 180) || '暂无描述' }}</p>
                  <p class="muted">{{ f.rationale || '暂无评分依据' }}</p>
                  <a v-if="f.sourceUrl" :href="f.sourceUrl" target="_blank" rel="noopener">{{ f.sourceUrl }}</a>
                </div>
                <div v-else class="prd-item" v-for="item in result.prdDraft.features" :key="item.name">
                  <strong>{{ item.name }}</strong>
                  <p>{{ truncateText(item.description, 180) || '暂无描述' }}</p>
                  <a v-if="item.source.url" :href="item.source.url" target="_blank" rel="noopener">{{ item.source.url }}</a>
                </div>
                <p v-if="result.featurePrioritization.length === 0 && result.prdDraft.features.length === 0" class="empty-state">暂无功能优先级证据。</p>
              </div>
              <div class="section-block">
                <h3>MVP 路线图</h3>
                <div class="prd-item" v-for="phase in result.mvpScope" :key="phase.phase">
                  <strong>{{ phase.phase }}</strong>
                  <p>{{ phase.features.join('、') || '暂无功能清单' }} · {{ phase.goal || '' }}</p>
                  <a v-if="phase.sourceUrl" :href="phase.sourceUrl" target="_blank" rel="noopener">{{ phase.sourceUrl }}</a>
                </div>
                <p v-if="result.mvpScope.length === 0" class="empty-state">暂无 MVP 路线图证据。</p>
              </div>
              <div class="section-block">
                <h3>成功指标</h3>
                <div v-for="o in result.successMetrics.okrs" :key="o.objective" class="prd-item">
                  <strong>{{ o.objective }}</strong>
                  <ul class="plain-list"><li v-for="kr in o.keyResults" :key="kr">{{ kr }}</li></ul>
                  <a v-if="o.sourceUrl" :href="o.sourceUrl" target="_blank" rel="noopener">{{ o.sourceUrl }}</a>
                </div>
                <div v-for="k in result.successMetrics.kpis" :key="k.metric" class="prd-item">
                  <strong>{{ k.metric }}：{{ k.target }} {{ k.unit }}</strong>
                  <a v-if="k.sourceUrl" :href="k.sourceUrl" target="_blank" rel="noopener">{{ k.sourceUrl }}</a>
                </div>
                <p v-if="result.successMetrics.okrs.length === 0 && result.successMetrics.kpis.length === 0" class="empty-state">暂无成功指标证据。</p>
              </div>
              <div class="section-block">
                <h3>非功能需求</h3>
                <div class="prd-item" v-for="item in result.prdDraft.nonFunctional" :key="item.title">
                  <strong>{{ item.title }}</strong>
                  <p>{{ truncateText(item.description, 180) || '暂无描述' }}</p>
                  <a v-if="item.source.url" :href="item.source.url" target="_blank" rel="noopener">{{ item.source.url }}</a>
                </div>
                <p v-if="result.prdDraft.nonFunctional.length === 0" class="empty-state">暂无非功能需求证据。</p>
              </div>
              <div class="section-block">
                <h3>风险</h3>
                <div class="prd-item" v-for="r in result.risks" :key="r.title">
                  <strong>{{ r.title }}{{ r.level ? `（${r.level}）` : '' }}</strong>
                  <p>{{ truncateText(r.description, 180) || '暂无描述' }}</p>
                </div>
                <p v-if="result.risks.length === 0" class="empty-state">暂无风险证据。</p>
              </div>
              <div class="section-block">
                <h3>待确认问题</h3>
                <div class="prd-item" v-for="item in result.prdDraft.openQuestions" :key="item.title">
                  <strong>{{ item.title }}</strong>
                  <p>{{ truncateText(item.description, 180) || '暂无描述' }}</p>
                  <a v-if="item.source.url" :href="item.source.url" target="_blank" rel="noopener">{{ item.source.url }}</a>
                </div>
                <p v-if="result.prdDraft.openQuestions.length === 0" class="empty-state">暂无待确认问题。</p>
              </div>
            </div>
            <p v-else class="empty-state">{{ store.meta.deepseekMissing ? '未配置 DeepSeek API Key，完整 PRD 章节未生成；请在设置中配置后重新生成。' : '当前没有足够证据生成 PRD 草稿，请先完成自动检索。' }}</p>
          </div>

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
            <div class="section-block confidence-block">
              <h3>数据可信度</h3>
              <p><strong>{{ result.marketAnalysis.confidence }}</strong>：{{ result.marketAnalysis.dataQuality.reason }}</p>
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

          <div v-if="activeTab === 'personas'" class="tab-pane">
            <h2 class="tab-title">用户画像</h2>
            <p class="tab-desc">这些画像应视为待验证假设，而不是真实用户访谈结果</p>
            <div class="personas-grid">
              <div class="persona-card card" v-for="p in result.userPersonas" :key="p.name">
                <div class="persona-header">
                  <div class="persona-avatar">{{ personaInitial(p.name) }}</div>
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
              <p v-if="result.userPersonas.length === 0" class="empty-state">暂无已核实用户事实，请补充访谈、问卷或行为数据。</p>
            </div>
          </div>

          <div v-if="activeTab === 'features'" class="tab-pane">
            <h2 class="tab-title">功能优先级评估</h2>
            <p class="tab-desc">RICE 分数只是 AI 建议，需要团队根据真实数据校准</p>
            <p v-if="result.featurePrioritization.length === 0" class="empty-state">当前报告未提供功能优先级数据，系统不会自动生成评分。</p>
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
                    <th>评分依据</th>
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
                    <td><span class="score-badge">{{ formatScore(f.score) }}</span></td>
                    <td class="feature-rationale">{{ f.rationale || f.confidence || '需人工补充依据' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'mvp'" class="tab-pane">
            <h2 class="tab-title">MVP 路线图</h2>
            <p class="tab-desc">分阶段的产品迭代规划，每个阶段的验证目标都需要实际数据支撑</p>
            <p v-if="result.mvpScope.length === 0" class="empty-state">当前报告未提供 MVP 路线图，系统不会自动生成阶段计划。</p>
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

          <div v-if="activeTab === 'metrics'" class="tab-pane">
            <h2 class="tab-title">成功指标体系</h2>
            <p class="tab-desc">指标目标值来自 AI 建议，需要结合实际业务基线修正</p>
            <p v-if="result.successMetrics.okrs.length === 0 && result.successMetrics.kpis.length === 0" class="empty-state">当前报告未提供成功指标，系统不会自动生成目标值。</p>
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

          <div v-if="activeTab === 'risks'" class="tab-pane">
            <h2 class="tab-title">风险与核验</h2>
            <p class="tab-desc">AI 只能给出风险提示，真实风险判断需要你补充业务证据</p>
            <div class="section-block">
              <h3>数据来源与质量</h3>
              <div class="source-list">
                <div class="source-item" v-for="s in result.marketAnalysis.sources" :key="s.title">
                  <strong>{{ s.title }}</strong>
                  <span v-if="s.url">{{ s.url }}</span>
                  <span v-if="s.note">{{ s.note }}</span>
                </div>
              </div>
            </div>
            <div class="section-block">
              <h3>关键假设</h3>
              <ul class="plain-list">
                <li v-for="a in result.marketAnalysis.assumptions" :key="a">{{ a }}</li>
              </ul>
            </div>
            <div class="section-block">
              <h3>风险判断</h3>
              <div class="risk-grid">
                <div class="risk-card card" v-for="r in result.risks" :key="r.title">
                  <div class="risk-card-head">
                    <strong>{{ r.title }}</strong>
                    <span v-if="r.level" class="tag tag-danger">{{ r.level }}</span>
                  </div>
                  <p v-if="r.description">{{ r.description }}</p>
                </div>
              </div>
            </div>
            <div class="section-block">
              <h3>人工核验清单</h3>
              <ul class="check-list">
                <li>每个市场数字是否有可点击、可验证的来源？</li>
                <li>数字是否明确统计口径、地区和时间范围？</li>
                <li>用户画像是否有访谈、问卷或行为数据支持？</li>
                <li>RICE 评分是否经过团队校准，而不只是 AI 建议？</li>
                <li>OKR/KPI 目标是否和业务基线、资源约束一致？</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-if="result && !store.isLoading" class="feedback-section card">
        <h3>这版报告对你有帮助吗？</h3>
        <div class="feedback-actions">
          <button class="btn btn-outline" :class="{ active: store.feedback === 'useful' }" @click="sendFeedback('useful')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            有用
          </button>
          <button class="btn btn-outline" :class="{ active: store.feedback === 'not_useful' }" @click="sendFeedback('not_useful')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/><path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>
            帮助有限
          </button>
          <span v-if="store.feedback" class="feedback-done">已记录，我们会用它改进 Prompt</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAnalysisStore } from '../stores/analysis'
import { reportToMarkdown, downloadText, copyText, trackEvent } from '../utils/report'

const router = useRouter()
const store = useAnalysisStore()
const activeTab = ref('prd')
const expandTrust = ref(false)

const result = computed(() => store.result)
const meta = computed(() => store.meta)

const tabs = [
  { key: 'prd', label: 'PRD 草稿', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' },
  { key: 'market', label: '市场分析', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><line x1="18" y1="12" x2="18" y2="17"/></svg>' },
  { key: 'personas', label: '用户画像', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
  { key: 'features', label: '功能优先级', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
  { key: 'mvp', label: 'MVP 路线图', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 14 15 20 9"/><polyline points="14 9 20 9 20 15"/></svg>' },
  { key: 'metrics', label: '成功指标', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
  { key: 'risks', label: '风险与核验', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' }
]

const sortedFeatures = computed(() => {
  if (!result.value) return []
  return [...result.value.featurePrioritization].sort((a, b) => b.score - a.score)
})

const hasPrdContent = computed(() => {
  const p = result.value?.prdDraft || {}
  return Boolean(
    p.summary ||
    p.background?.length ||
    p.targetUsers?.length ||
    p.userStories?.length ||
    p.requirements?.length ||
    p.nonFunctional?.length ||
    p.openQuestions?.length ||
    result.value?.featurePrioritization?.length ||
    result.value?.mvpScope?.length ||
    result.value?.successMetrics?.okrs?.length ||
    result.value?.successMetrics?.kpis?.length ||
    result.value?.risks?.length
  )
})

function truncateText(text, max = 180) {
  const value = String(text || '').trim()
  return value.length > max ? `${value.slice(0, max)}...` : value
}

function formatScore(score) {
  const num = Number(score)
  return Number.isFinite(num) ? num.toFixed(1) : 'N/A'
}

function personaInitial(name) {
  return (name || '匿')[0]
}

function formatDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', { hour12: false })
}

function markdown() {
  return reportToMarkdown(store.input, result.value, { ...meta.value, createdAt: meta.value.createdAt || new Date().toISOString() })
}

async function copyMarkdown() {
  try {
    await copyText(markdown())
    trackEvent('report_exported', { format: 'copy', reportId: store.currentId })
  } catch (err) {
    alert('复制失败，请使用“下载 Markdown”')
  }
}

function downloadMarkdown() {
  const safeName = (store.input.productIdea || '产品洞察报告').slice(0, 40).replace(/[\\/:*?"<>|]/g, '-')
  downloadText(`${safeName}.md`, markdown())
  trackEvent('report_exported', { format: 'markdown', reportId: store.currentId })
}

function printReport() {
  window.print()
  trackEvent('report_exported', { format: 'pdf', reportId: store.currentId })
}

function sendFeedback(value) {
  store.setFeedback(value)
}

watch(activeTab, (tab) => {
  trackEvent('tab_viewed', { tab, reportId: store.currentId })
})

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
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
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

.results-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.report-header { padding: 28px 32px; margin-bottom: 16px; }
.report-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.report-title-row h1 { font-size: 22px; font-weight: 700; }
.report-meta { display: flex; gap: 16px; flex-wrap: wrap; }
.report-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--gray-500); }

.trust-banner { padding: 20px 24px; margin-bottom: 24px; border-left: 4px solid var(--warning); background: #fffbeb; }
.trust-banner-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
.trust-banner-head strong { font-size: 15px; color: #92400e; }
.trust-banner p { font-size: 13px; color: #a16207; }
.text-button { color: var(--primary); font-size: 13px; font-weight: 600; }
.trust-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 16px; }
.trust-column h4 { font-size: 13px; color: #92400e; margin-bottom: 8px; }
.trust-column ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.trust-column li { font-size: 12px; color: #78350f; display: flex; flex-direction: column; gap: 2px; }

.loading-state { text-align: center; padding: 80px 20px; }
.loading-state p { margin: 20px 0; font-size: 16px; color: var(--gray-600); }
.loading-steps { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 8px; }
.loading-step { font-size: 14px; color: var(--gray-400); animation: pulse 2s ease infinite; }
.loading-step:nth-child(1) { animation-delay: 0s; }
.loading-step:nth-child(2) { animation-delay: 0.4s; }
.loading-step:nth-child(3) { animation-delay: 0.8s; }
.loading-step:nth-child(4) { animation-delay: 1.2s; }
.loading-step:nth-child(5) { animation-delay: 1.6s; }
@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

.error-state { padding: 60px 32px; text-align: center; }
.error-state svg { margin-bottom: 16px; }
.error-state h3 { font-size: 20px; margin-bottom: 8px; }
.error-state p { color: var(--gray-500); margin-bottom: 20px; }

.tabs-container { border: 1px solid var(--gray-200); border-radius: var(--radius-lg); background: white; overflow: hidden; }
.tabs-header { display: flex; border-bottom: 1px solid var(--gray-200); overflow-x: auto; background: var(--gray-50); }
.tab-btn { display: inline-flex; align-items: center; gap: 6px; padding: 14px 18px; font-size: 14px; font-weight: 500; color: var(--gray-500); border-bottom: 2px solid transparent; transition: all var(--transition); white-space: nowrap; }
.tab-btn:hover { color: var(--gray-700); background: white; }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); background: white; }
.tab-content { padding: 32px; }
.tab-title { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
.tab-desc { color: var(--gray-500); font-size: 14px; margin-bottom: 28px; }

.market-numbers { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 28px; }
.market-card { padding: 20px; text-align: center; }
.market-label { font-size: 12px; color: var(--gray-400); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.market-value { font-size: 16px; font-weight: 700; color: var(--primary); }
.confidence-block p { font-size: 13px; color: var(--gray-600); }

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
.rice-table th { text-align: left; padding: 14px 16px; font-size: 13px; color: var(--gray-500); font-weight: 600; border-bottom: 2px solid var(--gray-200); white-space: nowrap; }
.rice-table td { padding: 14px 16px; border-bottom: 1px solid var(--gray-100); font-size: 14px; }
.rice-table tr:last-child td { border-bottom: none; }
.feature-name { font-weight: 600; margin-bottom: 2px; }
.feature-desc { font-size: 12px; color: var(--gray-400); }
.feature-rationale { min-width: 220px; font-size: 12px; color: var(--gray-500); }
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

.source-list { display: flex; flex-direction: column; gap: 10px; }
.source-item { display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: var(--gray-600); border-left: 3px solid var(--primary); padding-left: 12px; }
.source-item span { font-size: 12px; color: var(--gray-400); }
.plain-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.plain-list li { font-size: 13px; color: var(--gray-600); padding-left: 14px; position: relative; }
.plain-list li::before { content: ''; position: absolute; left: 0; top: 7px; width: 5px; height: 5px; border-radius: 50%; background: var(--primary); }
.risk-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.risk-card { padding: 16px; }
.risk-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.risk-card p { font-size: 13px; color: var(--gray-500); }
.check-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.check-list li { font-size: 13px; color: var(--gray-600); padding-left: 24px; position: relative; }
.check-list li::before { content: '□'; position: absolute; left: 0; top: 0; font-size: 14px; color: var(--primary); }
.empty-state { padding: 20px; border: 1px dashed var(--gray-300); border-radius: var(--radius); color: var(--gray-500); font-size: 13px; background: var(--gray-50); margin-bottom: 20px; }
.prd-draft { display: flex; flex-direction: column; gap: 24px; }
.prd-item { border-left: 3px solid var(--primary); background: var(--gray-50); padding: 12px 16px; margin-bottom: 10px; }
.prd-item strong { font-size: 14px; display: block; margin-bottom: 4px; }
.prd-item p { font-size: 13px; color: var(--gray-600); margin-bottom: 4px; }
.prd-item a { font-size: 12px; color: var(--primary); word-break: break-all; }

.feedback-section { margin-top: 24px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.feedback-section h3 { font-size: 15px; font-weight: 700; }
.feedback-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.feedback-actions .active { background: #eef2ff; border-color: var(--primary); color: var(--primary); }
.feedback-done { font-size: 12px; color: var(--success); }

@media print {
  .header, .results-top, .trust-banner, .feedback-section, .tabs-header { display: none !important; }
  .tabs-container { border: none; box-shadow: none; }
  .tab-content { padding: 0; }
}

@media (max-width: 600px) {
  .market-numbers { grid-template-columns: 1fr; }
  .tab-content { padding: 20px; }
  .rice-table th, .rice-table td { padding: 10px 12px; }
  .report-title-row { flex-direction: column; }
  .results-actions { width: 100%; }
  .results-actions .btn { flex: 1; justify-content: center; }
}
</style>
