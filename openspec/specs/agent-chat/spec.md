## ADDED Requirements

### Requirement: Agent 自主调用工具

系统 SHALL 允许 Claude Agent 根据对话上下文，自主决定调用哪些工具。

#### Scenario: 识别排盘需求
- **WHEN** 用户询问八字相关问题时
- **THEN** Agent 自主调用 calculate_bazi 工具获取用户四柱信息

#### Scenario: 识别知识检索需求
- **WHEN** 需要专业命理知识解释时
- **THEN** Agent 自主调用 search_knowledge 工具检索相关知识

#### Scenario: 识别大运流年需求
- **WHEN** 用户询问运势时
- **THEN** Agent 自主调用 get_dayun 和 get_liunian 工具

### Requirement: 朋友式对话风格

系统 SHALL 设定 Agent 使用亲切、易懂的朋友式语气。

#### Scenario: 白话解释
- **WHEN** 用户（初学者）询问专业术语时
- **THEN** Agent 使用白话文解释，避免过多术语

#### Scenario: 详细分析
- **WHEN** 用户（中级）询问深入问题时
- **THEN** Agent 提供详细的命理分析，包括推导过程

#### Scenario: 主动引导
- **WHEN** 用户问题模糊时
- **THEN** Agent 主动询问或引导用户澄清问题

### Requirement: 多轮对话上下文

系统 SHALL 支持多轮对话，Agent 能够记住上下文。

#### Scenario: 记住用户信息
- **WHEN** 用户已提供出生信息后
- **THEN** Agent 在后续对话中复用该信息，无需重复输入

#### Scenario: 上下文关联
- **WHEN** 用户追问"那我的财运呢？"
- **THEN** Agent 理解"我的"指的是当前用户的八字

### Requirement: 工具调用透明度

系统 SHALL 向用户展示 Agent 正在调用哪些工具。

#### Scenario: 显示思考过程
- **WHEN** Agent 调用工具时
- **THEN** 界面展示"正在排盘中..."、"正在检索知识库..."等提示

#### Scenario: 展示工具结果
- **WHEN** 工具返回结果时
- **THEN** Agent 在回答中引用或展示关键结果
