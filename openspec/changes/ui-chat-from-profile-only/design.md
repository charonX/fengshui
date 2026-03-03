# 技术设计：UI 重构 - 聊天从档案进入

## 架构概述

```
┌─────────────────────────────────────────────────────────────┐
│  Pages                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  / (Home)                                                   │
│    └── 只保留"档案管理"入口 → /profiles                     │
│                                                             │
│  /profiles (ProfileList)                                    │
│    └── 档案列表 + 新建表单                                  │
│    └── 点击档案 → /profiles/[id]                            │
│                                                             │
│  /profiles/[id] (ProfileDetail) ★ NEW                       │
│    └── Left: ProfileReport (只读报告)                        │
│    └── Right: ChatPanel (AI 聊天)                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

DELETED:
  /chat (ChatPage) - 完全删除
```

## 组件设计

### 新增组件

```
components/
├── ProfileReport.tsx       ★ NEW - 左侧基础报告组件
│   ├── BaziPanel           - 八字排盘展示
│   ├── WuxingPanel         - 五行统计展示
│   ├── DayunPanel          - 大运走势展示
│   ├── ShenqiangPanel      - 身强身弱展示
│   └── LiunianPanel        - 流年运势展示
│
├── ChatPanel.tsx           ★ NEW - 右侧聊天组件（从原 ChatPage 提取）
│   ├── MessageList         - 复用原有组件
│   ├── ChatInput           - 复用原有组件
│   └── SuggestionChips     - 复用原有组件
│
└── ProfileCard.tsx         ★ NEW - 档案卡片（用于列表）
```

### 修改的组件

```
app/
├── page.tsx                → 简化，只保留档案管理入口
├── chat/page.tsx           → DELETE (完全删除)
└── profiles/
    ├── page.tsx            → 微调（移除"对话"链接，改为路由跳转）
    └── [id]/page.tsx       ★ NEW - 档案详情页
```

## 数据流设计

### ProfileDetail 页面数据流

```
┌─────────────────────────────────────────────────────────────┐
│  ProfileDetail (/profiles/[id])                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  useEffect(() => {                                          │
│    // 1. 加载档案数据                                        │
│    const profile = await fetch(`/api/profiles/${id}`)       │
│                                                             │
│    // 2. 计算排盘数据（客户端或服务端）                        │
│    const baziData = calculateBazi(...)                       │
│    const dayunData = calculateDayun(...)                     │
│    const shenqiangData = analyzeShenqiang(...)              │
│                                                             │
│    // 3. 设置初始聊天上下文                                  │
│    setChatContext({                                          │
│      profile,                                                │
│      baziData,                                               │
│      dayunData,                                              │
│      shenqiangData                                           │
│    })                                                        │
│  }, [id])                                                   │
│                                                             │
│  ┌─────────────────────┬─────────────────────────────────┐  │
│  │ ProfileReport       │ ChatPanel                        │  │
│  │ - baziData          │ - messages                       │  │
│  │ - dayunData         │ - isLoading                      │  │
│  │ - shenqiangData     │ - chatContext (自动包含档案)     │  │
│  └─────────────────────┴─────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 聊天 API 调用（自动包含档案信息）

```typescript
// 原调用方式
await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages })
})

// 新调用方式（自动包含 profileId）
await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages,
    profileId: params.id  // 自动传递
  })
})
```

## API 设计

### 新增 API（可选）

```
GET /api/profiles/[id]  ★ NEW
  - 返回单个档案详情（包括排盘数据）
  - 响应格式:
    {
      "id": "string",
      "name": "string",
      "birthDate": "string",
      "birthTime": "string",
      "gender": "male" | "female",
      "bazi": { ... },       // 预计算的排盘数据
      "dayun": { ... },
      "shenqiang": { ... }
    }
```

**设计决策**：可以选择在客户端计算排盘数据（复用现有的 `lib/services/bazi.ts`），或者在服务端计算后返回。

建议：**客户端计算**，因为：
1. 已有成熟的计算函数
2. 减少 API 调用
3. 减少服务器负载

## 路由变更

### 路由表

| 原路由 | 新路由 | 变更类型 |
|--------|--------|----------|
| `/` | `/` | 修改（简化内容） |
| `/chat` | - | 删除 |
| `/profiles` | `/profiles` | 保持 |
| - | `/profiles/[id]` | 新增 |

### 导航变更

```typescript
// app/page.tsx
// 原代码
<Link href="/chat">开始对话</Link>
<Link href="/profiles">档案管理</Link>

// 新代码（只保留档案管理）
<Link href="/profiles">进入档案管理</Link>
```

## 样式设计

### ProfileDetail 布局

```css
/* 左右分栏布局 */
.profile-detail {
  display: grid;
  grid-template-columns: 380px 1fr;  /* 左侧固定宽度，右侧自适应 */
  height: 100vh;
}

/* 左侧报告面板 */
.report-panel {
  overflow-y: auto;
  border-right: 1px solid var(--border);
  padding: 1rem;
}

/* 右侧聊天区域 */
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 响应式：小屏幕切换为上下布局 */
@media (max-width: 768px) {
  .profile-detail {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}
```

## 技术实现细节

### 1. 八字排盘数据计算

```typescript
// 复用现有的 bazi.ts 函数
import {
  calculateBazi,
  calculateDayun,
  analyzeShenqiang,
  calculateLiunian
} from '@/lib/services/bazi';

// 在 ProfileDetail 中计算
const bazi = calculateBazi(profile.birthDate, profile.birthTime);
const dayun = calculateDayun(
  profile.birthDate,
  profile.birthTime,
  profile.gender,
  bazi.nianZhu.gan,
  bazi.yueZhu
);
const shenqiang = analyzeShenqiang(bazi);
const liunian = calculateLiunian(new Date().getFullYear(), bazi.riZhu.gan);
```

### 2. 聊天自动开始

```typescript
// 进入页面时的初始化
useEffect(() => {
  if (profile && bazi) {
    // 可选：自动发送欢迎消息
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `你好！我已经看到你的八字信息了。
                你的日主是${bazi.riZhu.gan}，
                有什么想要了解的吗？`,
      timestamp: new Date()
    }]);
  }
}, [profile, bazi]);
```

### 3. 报告组件数据结构

```typescript
interface ProfileReportProps {
  profile: Profile;
  bazi: BaziResult;
  dayun: DayunInfo;
  shenqiang: ShenqiangResult;
  liunian: LiunianInfo;
}
```

## 测试策略

| 测试类型 | 测试内容 |
|----------|----------|
| 功能测试 | 从档案列表进入详情页 |
| 功能测试 | 左侧报告正确显示排盘数据 |
| 功能测试 | 右侧聊天正常发送消息 |
| 功能测试 | 聊天时自动包含档案信息（无需重新输入生日） |
| 回归测试 | 确认 `/chat` 页面已删除，访问时重定向或 404 |
| 视觉测试 | 左右分栏布局在不同屏幕尺寸下的表现 |

## 部署注意事项

1. **SEO 影响**：`/chat` 删除后，如有外部链接需要设置重定向
2. **用户习惯**：老用户可能需要适应新的导航结构
3. **性能**：ProfileDetail 页面加载时需计算排盘数据，注意首屏性能
