## ADDED Requirements

### Requirement: 知识库内容管理

系统 SHALL 支持以 Markdown 格式存储和管理八字命理知识。

#### Scenario: 知识库文件结构
- **WHEN** 创建知识库文件时
- **THEN** 系统使用 YAML frontmatter + Markdown 正文格式

#### Scenario: 知识库分类
- **WHEN** 组织知识时
- **THEN** 系统支持分类目录（basics、shishen、yunshi、cases）

#### Scenario: 元数据标注
- **WHEN** 编写知识文件时
- **THEN** 系统支持 tags、difficulty 等元数据标注

### Requirement: 关键词检索

系统 SHALL 支持通过关键词检索知识库内容。

#### Scenario: 全文检索
- **WHEN** 用户输入搜索关键词
- **THEN** 系统在标题、内容、标签中进行匹配

#### Scenario: 分类过滤
- **WHEN** 指定分类参数时
- **THEN** 系统只在该分类下检索

#### Scenario: 相关性排序
- **WHEN** 返回检索结果时
- **THEN** 系统按相关性排序（标题匹配权重 > 标签匹配 > 内容匹配）

#### Scenario: 限制返回数量
- **WHEN** 检索结果较多时
- **THEN** 系统返回最相关的 Top N 条结果（默认 3-5 条）
