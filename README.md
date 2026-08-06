# InsightAI - AI 驱动的产品洞察草稿平台

> 应聘 AI 产品经理的 vibe coding 作品
> 技术栈：Vue 3 + Pinia + Vue Router 4 + Vite + DeepSeek API + Tavily 检索

## 项目概述

InsightAI 是一个 AI 驱动的产品概念验证工具。输入一个产品想法，AI 自动生成结构化的产品洞察草稿，涵盖：

- **市场分析**：TAM/SAM/SOM 市场规模估算、行业趋势、竞品格局，并标注来源、假设与风险
- **用户画像**：AI 生成的典型用户画像（背景 / 目标 / 痛点）
- **功能优先级**：基于 RICE 框架的量化评分建议
- **MVP 路线图**：分阶段产品迭代规划
- **成功指标体系**：OKR + KPI 看板
- **风险与核验**：数据可信度、关键假设、风险判断与人工核验清单

## 为什么做这个产品

产品经理在做早期方向判断时，常常缺少数据支持，手动查资料和分析周期很长。InsightAI 把“想法 → 结构化洞察”压缩成一次输入，同时强调 AI 输出只是草稿，必须经过人工核验后才能对外使用。

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
git clone https://github.com/springCreate/insightai.git
cd insightai
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可体验。

> 如默认端口被占用，可使用 `npx vite --port 5180 --strictPort` 指定端口。

### 本地全栈运行（含 API 代理）

```bash
npm run local
```

该命令会同时启动：
- Vite 开发服务器：`http://localhost:5173`
- Node API 代理服务：`http://localhost:3001`（DeepSeek + Tavily 代理）

### 使用说明

1. 输入产品想法，并补充目标用户、痛点、行业和市场信息。
2. 点击“开始生成 PRD”调用 DeepSeek；没有 API Key 时，可以点击“先看示例”体验示例报告。
3. 在结果页切换查看 PRD 草稿、市场分析、用户画像、功能优先级、MVP 路线图、成功指标和风险与核验。
4. 报告会自动保存在本机历史中，可复制/下载 Markdown，或打印为 PDF。
5. 在顶部“设置”中配置 DeepSeek API Key、Tavily API Key 和代理地址。
6. 使用“自动调研”：填写产品信息后点击“开始生成 PRD”，系统会通过 Tavily 检索真实网页，并把来源自动填入报告。
7. 需要严格无幻觉时，可访问 `/evidence` 页面手动录入证据条目，系统只按类别汇总，不调用大模型补事实。
8. 未提供的数据显示“暂无已核实数据”。

> 首页可一键体验示例报告，无需 API Key；真实 AI 分析需要 DeepSeek Key 或代理。

## 数据真实性说明

当前版本没有接入实时信息采集，也不保证 AI 生成的市场规模、评分和指标是真实事实。
AI 服务会要求模型区分“估算”和“已核实事实”，并在报告中标明来源、假设、置信度与风险。
对外使用前，必须由用户补充真实来源、统计口径和人工核验。

## 无幻觉边界

“自动调研”通过 Tavily API 检索用户痛点、竞品、市场规模和功能趋势，自动生成带来源链接的证据条目。
报告只按类别汇总这些证据，不调用大模型补事实。每条证据必须包含来源链接，否则不会进入报告。
查不到来源的模块显示“暂无已核实数据”，系统不会自动编造 TAM、竞品、用户或风险结论。
绝对零幻觉仍无法由软件单方面保证，因为来源本身也可能过期、偏差或被错误引用；因此导出前仍应人工复核来源。

## 部署与 Key 管理

- **本地开发**：在右上角“设置”中填写 DeepSeek API Key 与 Tavily API Key。
- **正式部署**：不要把 API Key 放在前端代码里，应在 Vercel/服务器环境变量中配置：
  - `TAVILY_API_KEY`：Tavily 检索服务 Key
  - DeepSeek Key 由用户在前端自行填写，仅保存在浏览器 localStorage
- 部署后用户无需填写任何 Tavily Key；前端会调用 `/api/research`，由服务端代理 Tavily 搜索。
- 当前项目已提供 `server/index.cjs` 和 `api/research.mjs` 两套服务端代理。
- 注意：现有 GitHub Actions 的 Cloudflare Pages 工作流只部署静态前端，不会部署 `/api/research`。
  要使用自动调研，请部署到 Vercel（仓库已含 `vercel.json`），或在 Node 服务器上运行 `npm run serve`，并配置 `TAVILY_API_KEY`。

## 项目结构

```text
insightai/
├── docs/                         # 项目文档
│   └── PRD.md                    # 产品需求文档
├── api/                          # Vercel Serverless API 代理
│   ├── chat.mjs                  # DeepSeek 代理
│   └── research.mjs              # Tavily 检索代理
├── server/                       # 本地 Node 服务器（含 API 代理 + 静态托管）
│   └── index.cjs
├── public/                       # 静态资源
│   └── favicon.svg
├── src/                          # 前端源码
│   ├── main.js                   # 应用入口
│   ├── App.vue                   # 根组件
│   ├── assets/
│   │   └── main.css              # 全局样式与设计变量
│   ├── components/
│   │   └── TheHeader.vue         # 顶部导航与设置弹窗
│   ├── router/
│   │   └── index.js              # Vue Router 路由配置
│   ├── services/
│   │   ├── aiService.js          # DeepSeek 调用 + Demo + JSON 容错
│   │   ├── evidenceService.js    # 证据驱动报告（无模型生成事实）
│   │   └── researchService.js    # Tavily 自动检索
│   ├── stores/
│   │   └── analysis.js           # Pinia：报告历史、加载、反馈
│   ├── utils/
│   │   └── report.js             # Markdown 导出、事件统计、工具函数
│   └── views/
│       ├── HomeView.vue          # 首页（输入表单 + 历史 + 示例）
│       ├── EvidenceView.vue      # 证据条目录入与来源核验
│       └── ResultsView.vue       # 结果页（Tab + 导出 + 反馈）
├── test/
│   └── report.test.mjs           # 单元测试（report/evidence/research）
├── .github/
│   └── workflows/
│       └── deploy.yml             # Cloudflare Pages 自动部署
├── index.html                    # HTML 入口
├── vite.config.js                # Vite 配置（含本地代理）
├── vercel.json                    # Vercel 部署路由
├── package.json
├── LICENSE
└── README.md
```

## NPM 脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器（端口 5173） |
| `npm run build` | 构建生产包到 `dist/` |
| `npm run preview` | 预览构建产物 |
| `npm run serve` | 启动 Node 服务器（API 代理 + 静态托管，端口 3001） |
| `npm run local` | 同时启动 Vite 与 Node API 代理 |
| `npm test` | 运行单元测试 |

## 测试

本项目包含 5 个单元测试，覆盖：

- 示例报告归一化与 Markdown 导出
- PRD 草稿章节完整导出
- 自动检索查询词覆盖用户/竞品/市场/趋势四类
- AI 输出部分缺失时的容错处理
- 证据报告不编造缺失事实

```bash
npm test
```

## 技术架构

```text
┌───────────────────────────────────────────────────────────┐
│                      浏览器（前端）                          │
│  Vue 3 + Pinia + Vue Router 4 + Vite                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  HomeView    │→│ ResultsView  │  │ EvidenceView │       │
│  │  输入与历史   │  │  Tab 展示    │  │  证据录入     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │               │
│         ▼                 ▼                 ▼               │
│  ┌──────────────────────────────────────────────────┐      │
│  │  services/                                       │      │
│  │  aiService.js      evidenceService.js            │      │
│  │  researchService.js                              │      │
│  └──────────────────────────────────────────────────┘      │
└──────────────┬────────────────────────────────────────────┘
               │ fetch
               ▼
┌───────────────────────────────────────────────────────────┐
│                  服务端代理（可选）                          │
│  server/index.cjs 或 Vercel api/*.mjs                       │
│  - /api/chat      → DeepSeek                               │
│  - /api/research  → Tavily                                 │
└───────────────────────────────────────────────────────────┘
```

## 产品故事线

1. **发现痛点**：产品经理做早期判断时缺少数据、方法和汇报闭环。
2. **定位方案**：做一个“想法 → 结构化草稿”的 PM 分析工作流。
3. **技术选型**：Vue 3 + Pinia + Vite + DeepSeek API + Tavily 检索。
4. **迭代过程**：从单次生成，补上示例模式、历史保存、Markdown/PDF 导出、证据驱动无幻觉报告。
5. **产品反思**：AI 估值不是事实，产品需要来源、假设、风险与人工核验。
6. **后续方向**：接入真实检索/搜索、报告在线编辑、团队协作与版本对比。

## AI 产品经理能力映射

| 能力维度 | 本项目体现 |
| --- | --- |
| 用户洞察 | 识别 PM 缺少快速分析工具和汇报闭环 |
| 产品规划 | 设计 MVP → V2 → V3 路线图 |
| 数据分析 | 使用 TAM/SAM/SOM、RICE、OKR 框架 |
| AI 产品设计 | Prompt 模板、结构化 JSON、容错解析、置信度展示 |
| 技术理解 | Vue 3 + Vite + DeepSeek API + Tavily 检索 |
| 项目管理 | OKR + KPI 度量思维 |

## 许可证

详见 [LICENSE](./LICENSE)。

---

*Built with 💜 for AI Product Manager interview*
