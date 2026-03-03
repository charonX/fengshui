## Why

创建一个基于 AI Agent 的八字解读和运势推算网站，让用户能够通过自然对话获得个性化的命理分析。结合传统八字命理知识与现代 AI 技术，提供既专业又易懂的解读体验。

## What Changes

- 新建 Next.js 项目，采用 SSR 架构
- 实现八字排盘引擎（基于 lunar-javascript）
- 集成 Claude Agent SDK，实现 AI 对话功能
- 实现 Function Calling 工具集（排盘、大运、流年、身弱分析、知识检索）
- 建立知识库系统（Markdown 分块 + 关键词检索）
- 实现用户档案管理（SQLite 存储，预留用户系统接口）
- 创建对话式 UI 界面

## Capabilities

### New Capabilities

- `bazi-engine`: 八字排盘核心引擎，包括四柱计算、五行统计、真太阳时校正
- `dayun-calculation`: 大运推算能力，包括起运时间计算、大运干支排列
- `liunian-calculation`: 流年推算能力，计算指定年份的流年干支和十神关系
- `shenqiang-analysis`: 身强身弱分析能力，判断日主强弱并给出用神忌神
- `knowledge-search`: 知识库检索能力，支持关键词搜索和分类过滤
- `profile-management`: 用户档案管理能力，存储和管理用户的出生信息和排盘结果
- `agent-chat`: AI 对话能力，Agent 自主调用工具进行分析和回答

### Modified Capabilities

（无）

## Impact

- **前端**: Next.js (App Router), React, Tailwind CSS
- **后端**: Next.js API Routes, Claude Agent SDK
- **数据库**: SQLite (通过 better-sqlite3 或 Turso)
- **外部依赖**:
  - lunar-javascript (排盘)
  - @anthropic/agent-sdk (Agent)
  - @anthropic/sdk (Claude API)
- **知识库**: Markdown 文件格式，gray-matter 解析 frontmatter
- **部署**: 支持 Vercel 部署（需注意 Serverless 函数的 Agent 运行环境）
