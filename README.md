# InsightAI — AI 驱动的产品洞察平台

> 应聘 AI 产品经理的 vibe coding 作品
> 技术栈：Vue 3 + Pinia + Vue Router 4 + Vite + OpenAI API

## 项目概述

InsightAI 是一个 AI 驱动的产品概念验证工具。输入一个产品想法，AI 自动生成结构化的产品洞察报告，涵盖：

- 📊 **市场分析** — TAM/SAM/SOM 市场规模、行业趋势、竞品格局
- 👥 **用户画像** — AI 生成的典型用户画像（背景 / 目标 / 痛点）
- ⚡ **功能优先级** — 基于 RICE 框架的量化评分排序
- 🗺️ **MVP 路线图** — 分阶段产品迭代规划
- 📈 **成功指标体系** — OKR + KPI 看板

## 为什么做这个作品

这是一个 **vibe coding** 作品，即借助 AI 辅助编程快速构建的完整应用。作为应聘 AI 产品经理的作品集项目，它展示了：

1. **产品思维** — 理解用户（产品经理）在工作流中的痛点，设计端到端的解决方案
2. **AI 集成能力** — 调用大模型 API 实现结构化生成，包含 Prompt 设计和结果解析
3. **技术落地能力** — 使用 Vue 3 组合式 API + Pinia 状态管理 + Vue Router 构建完整 SPA
4. **设计审美** — 专业、干净的产品级 UI 设计
5. **框架理解** — 在产品分析中使用了 RICE 排序、OKR、TAM/SAM/SOM 等 PM 常用框架

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装与运行
```bash
cd insightai
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可体验。

### 使用说明

1. **输入产品想法** — 在首页表单中填写你的产品思路（必填）和相关信息
2. **生成分析** — 点击"开始分析"按钮
3. **浏览洞察** — 在结果页通过 Tab 切换查看 5 大分析模块
4. **使用真实 AI**（可选）— 在设置中输入 OpenAI API Key，切换到 AI 模式

> 默认使用 Demo 模式（内置示例数据），无需 API Key 即可体验完整功能。

## 技术架构

```
insightai/
├── index.html              # 入口 HTML
├── vite.config.js          # Vite 构建配置
├── package.json            # 依赖管理
├── src/
│   ├── main.js             # 应用入口
│   ├── App.vue             # 根组件
│   ├── router/index.js     # 路由配置
│   ├── stores/analysis.js  # Pinia 状态管理
│   ├── services/
│   │   └── aiService.js    # AI 服务（OpenAI + Demo 模式）
│   ├── views/
│   │   ├── HomeView.vue    # 首页（输入表单）
│   │   └── ResultsView.vue # 结果页（Tab 展示）
│   ├── components/
│   │   └── TheHeader.vue   # 顶部导航 + 设置弹窗
│   └── assets/main.css     # 全局样式
```

## 面试故事线

> 在面试中 demo 这个作品时，建议按以下思路讲解：

1. **发现痛点** — 观察到产品经理在做产品决策时缺乏数据支撑，分析过程散乱
2. **定位解决方案** — 设计一个"想法 → 结构化洞察"的一站式工具，覆盖 PM 核心工作流
3. **技术选型** — 选择了 Vue 3（响应式 + Composition API） + OpenAI API（快速实现 AI 能力）
4. **迭代过程** — 从 MVP（只做 PRD 生成）到完整版（5 大分析模块）的演进
5. **产品思维** — 解释为什么选择 RICE 框架、如何设计用户画像模板、OKR 结构背后的思考
6. **反思与改进** — 如果继续迭代：添加协作功能、历史版本管理、更多分析框架支持

## AI 产品经理能力映射

| 能力维度 | 本项目体现 |
|---------|-----------|
| 用户洞察 | 观察到 PM 缺乏快速分析工具，设计了针对性的解决方案 |
| 产品规划 | 设计了 MVP → V2 → V3 的路线图 |
| 数据分析 | 使用了 TAM/SAM/SOM、RICE 等框架 |
| AI 产品设计 | 设计了 prompt 模板、结构化输出、后处理逻辑 |
| 技术理解 | 使用 Vue 3 + Vite + OpenAI API 实现完整应用 |
| 项目管理 | 通过 OKR + KPI 展示产品度量思维 |

---
*Built with ❤️ for AI Product Manager interview*
