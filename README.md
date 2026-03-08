# Fengshui (风水命理项目)

本项目是一个涵盖传统中华八字命理与前沿 AI 技术的综合性 Web 应用生态项目。

## 📍 子项目导航

目前本项目包含以下主要子系统：

- [**bazi-web**](./bazi-web): 一款基于现代 Web 技术（Next.js 16, React 19, Tailwind CSS v4）构建的八字命理分析应用。它将中国传统的八字命理排盘算法与强大的大语言模型能力相融合，并提供独具极客风格的终端（Terminal）智能体对话体验。关于此部分的详细使用、开发说明请参阅 [bazi-web/README.md](./bazi-web/README.md)。

## ✨ 核心亮点结集

- **传统易学与 AI 结合**：内置完整的排盘算法引擎（五行旺衰、神煞、用忌神），并结合 Anthropic Claude SDK 实现具有“人在回路（Human-in-the-Loop）”能力的定制化解盘交互。
- **现代化技术栈与体验**：使用最新 React 架构与自制 Markdown 终端渲染器，将古老神秘的命理展现以最酷炫的技术界面表现。
- **全要素管理**：提供基于 JWT 的安全用户校验与 SQLite 支持的功能化档案本存储系统。

## 🚀 快速上手

请分别进入子项目目录了解其运行方法与环境依赖：

```bash
# 进入 bazi-web 项目目录进行本地环境配置及后端启动
cd bazi-web
npm install
npm run dev
```

> **注意**：每个子项目目录下均有独立的 `.env` 相关配置需求，请参照对应文档配置如 `ANTHROPIC_API_KEY` 及 `JWT_SECRET` 等参数密钥。

## 🤝 贡献与参与

欢迎对命理与前沿技术交叉领域感兴趣的开发者提交 Issue 或 Pull Request 一同优化算法与交互设计！

## 📄 许可证

本项目遵从 MIT 许可证。