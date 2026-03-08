# Bazi-Web (八字命理 Web 应用)

Bazi-Web 是一款基于现代 Web 技术构建的八字命理分析应用。它将中国传统的八字命理算法与最前沿的 AI 大模型能力相结合，并提供独具特色的终端风格（Terminal CSS）智能体对话体验。

## ✨ 核心特性

- 🔮 **专业的八字命理排盘引擎**：深度集成 `lunar-javascript` 进行精确的农历与干支历转换。内置复杂的旺衰计算引擎（基于季节的旺相休囚死、地支藏干分析）以及用神（YongShen）、忌神（JiShen）的智能识别。
- 🤖 **智能 AI 助手驱动**：由 Anthropic 的 Claude SDK 驱动的会话智能体。AI 不仅提供深度易懂的命理分析，而且集成了“人在回路”（Human-in-the-Loop, HITL）架构，允许用户参与和确认敏感操作。
- 💻 **命令行终端风格 UI**：借鉴原生高端 CLI 工具设计的酷炫终端交互界面。支持 Markdown 富文本解析展示（通过 `react-markdown` 和 `remark-gfm`），实现树状结构化数据和对话进度实时展现。
- 👤 **完整的用户与档案管理**：基于 JWT 的安全用户身份认证系统（通过 `jose` 和 `bcryptjs`）。数据持久化由高性能本地 SQLite 数据库（`better-sqlite3`）支持，轻松保存、随时调阅多份家庭成员八字档案资料。
- ⚡ **现代极致技术栈**：基于 Next.js 16 (App Router)、React 19 以及全面拥抱原子化的 Tailwind CSS v4 打造极致丝滑性能。

## 🧰 技术栈

- **前端框架**：[Next.js](https://nextjs.org/) (App Router)
- **UI & 样式**：[React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **数据库**：[SQLite](https://sqlite.org/) (基于 `better-sqlite3`)
- **认证**：自定义 JWT 实现（使用 `jose` 及 `bcryptjs` 加密）
- **AI 智能服务**：`@anthropic-ai/sdk`
- **历法排盘引擎**：`lunar-javascript`

## 🚀 快速开始

### 运行环境准备

- Node.js 20.x 或更高版本
- npm, yarn, 或 pnpm

### 本地部署步骤

1. 克隆整个仓库代码并进入对应目录：
   ```bash
   git clone <repository-url>
   cd bazi-web
   ```

2. 安装所有依赖包：
   ```bash
   npm install
   ```

3. 环境变量配置：
   在项目根目录下创建一个 `.env.local` 或者是 `.env` 文件，完善必需的环境变量（重点是 Claude 的 API 金钥与 JWT 加密串等）：
   ```env
   ANTHROPIC_API_KEY=your_claude_api_key_here
   ...
   ```

4. 数据库默认配置：
   系统会自动对位于 `data/bazi.db` 内的数据进行 SQLite 建表与存储映射，包含用户信息、对话状态以及命理档案等数据。（该文件默认已通过 `.gitignore` 保护）

5. 启动本地开发服务器环境：
   ```bash
   npm run dev
   ```

6. 在浏览器当中打开 [http://localhost:3000](http://localhost:3000) 进行访问及预览。

## 📂 项目结构指南

- `/app`: 包含所有的 Next.js App Router 路由节点及 API 服务接口（用户验证 API、档案管理接口及 Chat 智能对话交互端点）。
- `/components`: 封装的 React 组件化视图。尤指高频复用的终端界面控制面板、八字档案卡片及自定义重写的 Markdown 节点解释器等。
- `/lib`: 核心的业务后端逻辑枢纽。涉及所有的 SQLite 数据服务注入（`profile-store`, `user-store`）、令牌身份鉴权与验证逻辑集、核心的大语言模型调用路由设置。
- `/data`: 内置的数据储存目录（SQLite .db 后缀数据库文件落盘位置）。

## 🤝 参与贡献

欢迎提出任何改进建议与功能讨论！随时提交 Issue 反馈或是通过 Pull Requests 直接贡献代码！

## 📄 开源许可证

本项目遵从 MIT 许可证。
