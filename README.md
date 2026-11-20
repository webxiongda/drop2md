# Drop2MD · 拖拽转 Markdown

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/your-org/drop2md?style=flat-square&color=34d399)](https://github.com/your-org/drop2md/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-22d3ee?style=flat-square)](https://github.com/your-org/drop2md/pulls)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

> 把任何文本文件拖进来，立刻得到干净的 Markdown —— 全部在本地浏览器完成，文件不会上传。

Drop2MD 灵感来自 [microsoft/markitdown](https://github.com/microsoft/markitdown)：把「万物转 Markdown」这件事搬进浏览器，零后端、零依赖、零上传。拖入文件即可批量转换、实时预览、一键复制或下载 `.md`。

## ✨ 特性

- **拖拽即转**：支持多文件拖入与点击多选，悬停有上浮反馈，拖入动画清晰。
- **隐私优先**：所有解析都在浏览器里完成（DOMParser / File API），没有任何网络请求。
- **多种格式**：
  - `.md` / `.txt` / `.log` → 原样文本
  - `.html` / `.htm` → 提取标题、段落、列表（含嵌套）、链接、代码块、引用、表格
  - `.csv` / `.tsv` → Markdown 表格，正确处理引号包裹、转义引号 `""` 与字段内逗号
  - `.json` / `.jsonl` → 漂亮格式化后包成 ```json 代码块
  - 其他文本 → 带语言提示的代码块；二进制文件给出友好提示
- **批量队列**：每个文件显示原名、大小、状态、目标 `.md` 名，可单独移除。
- **实时预览**：零依赖自写 Markdown 渲染器，支持标题、粗体、斜体、代码块、行内代码、链接、列表、表格；输出全部转义并带链接协议白名单，避免 XSS。
- **一键带走**：复制单个结果、下载单个 `.md`、批量下载全部。
- **开箱体验**：内置 HTML 片段 / CSV / JSON 三个示例按钮，点一下就能看到完整流程。
- **精致界面**：深色玻璃拟态、青绿霓虹强调色、微交互动效、响应式布局。

## 🚀 快速开始

```bash
npm install
npm run dev
```

打开终端提示的本地地址即可使用。生产构建：

```bash
npm run build
npm run preview
```

## 🎯 核心玩法

1. 把文件拖到左侧虚线区域，或点击区域多选文件。
2. 在「转换队列」里选中任意一条，右侧即时显示 Markdown 预览。
3. 用顶部标签在 **实时预览** 与 **Markdown 源码** 之间切换。
4. 点击 **复制** 贴到别处，或点 **下载 .md** / **全部下载** 保存到本地。
5. 想快速体验？点左侧的三个示例卡片，无需准备文件。

## 📸 截图

截图占位区（后续替换为真实截图）：

```text
docs/
  ├── screenshot-desktop.png   # 桌面端：左侧队列 + 右侧预览
  ├── screenshot-mobile.png    # 移动端：上下堆叠布局
  └── screenshot-preview.png   # 预览与源码切换
```

## 🔐 隐私说明

没有后端、没有上传、没有统计脚本。文件读取全部使用浏览器原生 `File.text()` / `File.arrayBuffer()`，HTML 解析使用 `DOMParser`。关掉网络依然可用。

## 🛠 技术细节

- Vite + React 18 + TypeScript，仅 `react` / `react-dom` 两个运行时依赖。
- Markdown 预览为自写最小渲染器（见 `src/markdown.ts`），不引入 `marked` 等第三方库。
- 转换核心见 `src/converter.ts`，示例数据见 `src/samples.ts`。

## 🤝 贡献

欢迎提 Issue 与 PR！新增格式解析、完善 Markdown 语法、补充测试用例都非常欢迎。

## 📄 License

[MIT](LICENSE) © 2026 Drop2MD contributors
