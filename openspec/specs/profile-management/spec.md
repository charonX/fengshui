## ADDED Requirements

### Requirement: 创建用户档案

系统 SHALL 支持创建和保存用户档案。

#### Scenario: 新建档案
- **WHEN** 用户提供姓名、出生日期、时间、地点、性别
- **THEN** 系统创建档案并分配唯一 ID

#### Scenario: 自动排盘缓存
- **WHEN** 保存档案时
- **THEN** 系统自动计算并缓存排盘结果（四柱、五行等）

#### Scenario: 档案唯一性
- **WHEN** 创建档案时
- **THEN** 系统为每个档案生成唯一 ID

### Requirement: 查询用户档案

系统 SHALL 支持根据 ID 查询用户档案信息。

#### Scenario: 获取档案详情
- **WHEN** 用户提供档案 ID
- **THEN** 系统返回档案的完整信息（包括排盘结果）

#### Scenario: 列出所有档案
- **WHEN** 用户请求档案列表时
- **THEN** 系统返回所有档案的摘要信息（ID、姓名、出生日期）

### Requirement: 更新和删除档案

系统 SHALL 支持更新和删除用户档案。

#### Scenario: 更新档案
- **WHEN** 用户修改档案信息
- **THEN** 系统更新档案并重新计算排盘结果

#### Scenario: 删除档案
- **WHEN** 用户请求删除档案
- **THEN** 系统删除档案及其相关数据

### Requirement: 预留用户系统接口

系统 SHALL 预留用户认证接口，方便后续接入用户系统。

#### Scenario: ProfileStore 接口
- **WHEN** 实现档案存储时
- **THEN** 系统使用接口抽象（ProfileStore），支持不同实现

#### Scenario: 初期简化实现
- **WHEN** 初期部署时
- **THEN** 系统使用 SQLiteProfileStore（忽略用户认证）

#### Scenario: 后期认证实现
- **WHEN** 接入用户系统时
- **THEN** 系统可切换到 AuthenticatedProfileStore（需要验证用户权限）
