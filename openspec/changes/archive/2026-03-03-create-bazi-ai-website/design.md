## Context

本项目是一个基于 Next.js + Claude Agent SDK 的八字解读和运势推算网站。项目采用 AI Native 架构，将排盘逻辑封装成 Function Calling Tools 供 Agent 自主调用。

**技术背景：**
- 使用 lunar-javascript 作为排盘引擎基础
- Claude Agent SDK 提供 Agent 能力
- SQLite 作为数据存储
- 知识库采用 Markdown 分块 + 关键词检索

**约束条件：**
- 初期不做复杂的用户认证系统，但预留接口
- 知识库检索先用简单的关键词匹配，后续可升级到向量检索
- 先支持 Web 端，响应式设计

**主要干系人：**
- 开发者：维护排盘引擎和 Agent 工具
- 命理知识提供者：编写和维护知识库内容
- 用户：初学者（需要简单解释）和中级学习者（需要详细分析）

## Goals / Non-Goals

**Goals:**
- 实现完整的八字排盘引擎（四柱、五行、十神、大运、流年）
- 实现身强身弱分析功能
- 集成 Claude Agent，支持自然语言对话
- Agent 能够自主调用工具（排盘、检索知识库等）
- 实现用户档案管理（增删改查）
- 建立知识库系统（Markdown 格式，关键词检索）
- 创建简洁的对话式 UI

**Non-Goals:**
- 复杂的用户认证系统（初期用本地存储或简单 Session）
- 支付和商业化功能
- 移动端 App（先做响应式 Web）
- 向量检索（初期用关键词匹配）
- MCP Server（直接用 Function Calling）
- 多语言支持

## Decisions

### 1. 架构模式：AI Agent + Function Calling

**决策：** 使用 Claude Agent SDK 的 Function Calling 能力，将排盘逻辑封装成 Tools 供 Agent 调用。

**理由：**
- 排盘逻辑本就要在 Next.js 中实现，直接封装成函数最简单
- 相比 MCP Server，减少了一层抽象和进程间通信开销
- Agent 可以自主决定何时调用哪个工具，更灵活

**替代方案：**
- MCP Server：过度设计，初期不需要
- 纯 RAG 流程：无法支持 Agent 自主决策

### 2. 排盘引擎：基于 lunar-javascript

**决策：** 使用 lunar-javascript 库作为排盘基础，在其之上封装业务逻辑。

**理由：**
- 该库已处理节气计算、真太阳时等复杂逻辑
- 开源、活跃维护、文档完善
- 避免重复造轮子

**替代方案：**
- 完全自己实现：需要深入研究天文算法，成本高
- 其他库：功能不如 lunar-javascript 完整

### 3. 知识库检索：关键词匹配 + Agent 自主决定

**决策：** 初期使用关键词检索（SQLite FTS5 或文件系统 grep），由 Agent 自主决定何时检索。

**理由：**
- 实现简单，效果好
- 知识块已分类打标签，关键词检索足够
- Agent 可以根据对话上下文决定检索什么

**替代方案：**
- 向量检索：需要部署向量数据库，初期过度
- 纯靠 Agent 知识：无法提供个性化、专业的命理知识

### 4. 数据存储：SQLite

**决策：** 使用 SQLite 存储用户档案和对话历史。

**理由：**
- 零配置，单文件
- 适合个人/小流量应用
- 支持标准 SQL，方便后续迁移

**替代方案：**
- PostgreSQL/MySQL：需要独立数据库服务
- MongoDB：关系型数据用 SQL 更合适

### 5. 用户系统：预留接口，初期简化

**决策：** 实现 ProfileStore 接口，初期用 SQLiteProfileStore（忽略用户认证），后续可切换到 AuthenticatedProfileStore。

**理由：**
- 降低初期开发复杂度
- 预留接口，方便后续扩展

### 6. Agent 语气：朋友风格

**决策：** System Prompt 设定 Agent 为亲切的朋友式命理师，而非权威大师。

**理由：**
- 降低用户心理门槛
- 更适合初学者
- 可以解释术语，引导学习

## Risks / Trade-offs

**[Risk] Agent 调用工具过多导致响应慢**
→ Mitigation: 设置工具调用次数上限，优化 prompt 让 Agent 更高效

**[Risk] 知识库检索不准确**
→ Mitigation: 优化关键词匹配算法，后续可升级到向量检索

**[Risk] lunar-javascript 的排盘规则与目标流派不一致**
→ Mitigation: 预留自定义配置（如早晚子时处理方式），可在其上覆盖自己的逻辑

**[Risk] Claude API 成本不可控**
→ Mitigation: 设置调用频率限制，使用 Sonnet 模型（性价比高），后续可考虑缓存常用分析

**[Risk] Serverless 环境运行 Agent 可能超时**
→ Mitigation: Vercel 部署时注意函数超时设置，或考虑独立部署 Agent 服务

## Migration Plan

**Phase 1: 项目骨架 (Week 1)**
- 创建 Next.js 项目
- 配置 Claude Agent SDK
- 实现基础目录结构

**Phase 2: 排盘引擎 (Week 2)**
- 集成 lunar-javascript
- 实现四柱、五行、十神计算
- 实现大运、流年计算

**Phase 3: Agent 集成 (Week 3)**
- 定义 Function Calling Tools
- 配置 Agent System Prompt
- 实现对话 API

**Phase 4: 知识库系统 (Week 4)**
- 编写知识库 Markdown 文件
- 实现关键词检索服务
- 集成到 Agent Tools

**Phase 5: 前端 UI (Week 5-6)**
- 输入页面
- 对话界面
- 档案管理页面

**Phase 6: 测试与优化 (Week 7)**
- 功能测试
- 性能优化
- 部署上线

## Open Questions

1. 知识库的内容来源：需要用户提供还是从公开资料整理？
2. 部署方案：Vercel 还是自建服务器？
3. 是否需要支持农历输入？
4. 真太阳时校正的精度要求（是否需要精确到经度级别）？
