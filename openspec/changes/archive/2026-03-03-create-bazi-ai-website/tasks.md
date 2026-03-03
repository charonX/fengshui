## 1. 项目初始化

- [x] 1.1 创建 Next.js 项目（App Router）
- [x] 1.2 安装依赖（lunar-javascript, @anthropic-ai/sdk, better-sqlite3, gray-matter 等）
- [x] 1.3 配置 Tailwind CSS
- [x] 1.4 创建基础目录结构（lib/services/, components/, knowledge/）

## 2. 排盘引擎实现

- [x] 2.1 集成 lunar-javascript，实现基础排盘
- [x] 2.2 实现四柱计算（年柱、月柱、日柱、时柱）
- [x] 2.3 实现五行统计功能
- [x] 2.4 实现十神关系计算
- [x] 2.5 实现真太阳时校正功能
- [x] 2.6 实现大运计算（起运时间、大运干支排列）
- [x] 2.7 实现流年计算（干支、生肖、十神）
- [x] 2.8 实现身强身弱分析（得令、得地、得助、综合评分）
- [x] 2.9 实现用神忌神分析

## 3. 知识库系统

- [x] 3.1 创建知识库目录结构（knowledge/basics, shishen, yunshi, cases）
- [x] 3.2 编写基础术语知识库（天干、地支、五行、刑冲合害）
- [x] 3.3 编写十神知识库（十神含义、在各柱的含义）
- [x] 3.4 编写运势规则知识库（大运解读、流年断法）
- [x] 3.5 实现关键词检索服务（search_knowledge）
- [x] 3.6 实现分类过滤功能
- [x] 3.7 实现相关性排序和 Top N 返回

## 4. 用户档案管理

- [x] 4.1 设计 SQLite 表结构（users, profiles, chat_messages）
- [x] 4.2 实现数据库初始化脚本
- [x] 4.3 实现 ProfileStore 接口定义
- [x] 4.4 实现 SQLiteProfileStore（初期版本）
- [x] 4.5 实现 get_profile 和 save_profile 函数
- [x] 4.6 实现 list_profiles 和 delete_profile 函数

## 5. Agent 集成

- [x] 5.1 配置 Claude Agent SDK
- [x] 5.2 编写 Agent System Prompt（朋友式语气）
- [x] 5.3 实现 calculate_bazi 工具
- [x] 5.4 实现 get_dayun 工具
- [x] 5.5 实现 get_liunian 工具
- [x] 5.6 实现 analyze_shenqiang 工具
- [x] 5.7 实现 search_knowledge 工具
- [x] 5.8 实现 get_profile 和 save_profile 工具
- [x] 5.9 实现对话 API（/api/chat）

## 6. 前端 UI

- [x] 6.1 创建首页（介绍和引导）
- [x] 6.2 创建输入页面（出生信息表单）
- [x] 6.3 创建对话页面（聊天界面）
- [x] 6.4 实现 ChatInput 组件
- [x] 6.5 实现 MessageList 组件
- [x] 6.6 实现 SuggestionChips 组件（推荐问题）
- [x] 6.7 创建档案管理页面（列表、新建、编辑）
- [x] 6.8 实现工具调用状态展示（"正在排盘中..."）

## 7. 测试与优化

- [x] 7.1 测试排盘引擎准确性（对比已知案例）
- [x] 7.2 测试 Agent 工具调用流程
- [x] 7.3 测试知识库检索效果
- [x] 7.4 优化 Agent System Prompt（调整语气和响应质量）
- [x] 7.5 性能优化（缓存排盘结果、知识检索缓存）
- [x] 7.6 部署测试（Vercel 或自建服务器）
