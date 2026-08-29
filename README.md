# 📌 候选提示词（Prompt Stash）

一个钉在屏幕最前面的 AI 提示词暂存小工具（macOS / Windows）。

> 和 AI 结对干活时，你脑子里常常已经想好了它「下一步」要干的任务——但当前任务还没跑完，这个念头没地方放。把它写进这个始终置顶的小窗口，要用时点一下：复制、粘贴、发送。

## 它解决什么问题

和 Claude Code、ChatGPT 这类 AI 的对话是「串行」的：AI 跑当前任务时，你想到的下一步只能记在脑子里、备忘录里、或者聊天框草稿里——切换几次应用就丢了。

这个工具给你一个**永远浮在最前面**的小窗口（切换桌面、台前调度切换应用都不会被盖住），专门暂存「下一条要发给 AI 的提示词」：

- 按会话/项目**分组**（比如「Claude Code」「Hermes」各一组，列表和草稿互不干扰）
- 点一下卡片正文即**复制到剪贴板**，粘到 AI 对话框就能发
- 写得好的提示词一键**收藏**，跨分组沉淀复用
- 删错了有**回收站**兜底（保留 7 天）

## 功能一览

| 操作 | 方式 |
|---|---|
| 写提示词 | 底部输入框，`⌘/Ctrl+Enter` 或点「添加」；每个分组的草稿各自独立 |
| 用提示词 | 点卡片正文 → 已复制，去粘贴即用；卡片标「已用」但保留，`✕` 手动删 |
| 编辑 | 卡片 `✏️` 原地改，`⌘/Ctrl+Enter` 保存，`Esc` 取消 |
| 收藏 | 卡片 `☆`（实心金色 `★` 为已收藏，再点取消）；右上角 `⭐` 进收藏区 |
| 分组 | 左上角下拉菜单：点击切换；悬停可 `✏️` 改名、`✕` 删除；底部 `＋` 新建 |
| 回收站 | 右上角 `🗑️`；删除的提示词/收藏保留 7 天，`↩︎` 一键恢复到原处 |
| 置顶开关 | 右上角 `📌`（含跨桌面 / 台前调度可见性） |
| 主题 | 右上角 `☀️/🌙` 白天黑夜切换 |

所有状态（分组、提示词、收藏、回收站、置顶、主题）都在本地持久化，重启不丢。

## 快速开始

### Windows

到 [Releases](../../releases) 下载 `候选提示词-Windows.zip`，解压后双击 `候选提示词.exe`——免安装绿色版。首次运行若提示「Windows 已保护你的电脑」，点「更多信息 → 仍要运行」。压缩包内附一页纸 `使用指南.html`。

### macOS（从源码运行）

```bash
git clone https://github.com/sunquqixx/prompt-stash.git
cd prompt-stash
npm install
npm start
```

Electron 下载慢时用镜像：`ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ npm install`

可选：生成一个双击即开的启动器（生成后可拖到 Dock 或「应用程序」）：

```bash
osacompile -o 候选提示词.app -e "do shell script \"nohup '$PWD/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron' '$PWD' >/dev/null 2>&1 &\""
```

## 数据存哪

一个 JSON 文件，完全本地运行、不联网、无账号：

- macOS：`~/Library/Application Support/prompt-stash/prompts-data.json`
- Windows：`%APPDATA%\prompt-stash\prompts-data.json`

备份 = 拷走这一个文件。

## 技术说明

Electron + 原生 HTML/CSS/JavaScript（零前端框架、零运行时依赖），3 个源文件约 900 行：

| 文件 | 职责 |
|---|---|
| `main.js` | 主进程：窗口与置顶（`screen-saver` 层级 + 跨 Spaces 可见）、数据文件读写、剪贴板、单实例锁 |
| `preload.js` | contextBridge 安全桥：界面只能调用「读数据 / 存数据 / 复制 / 置顶」四个白名单能力 |
| `index.html` | 全部界面与交互逻辑，单文件 |

本项目由 [Claude Code](https://claude.com/claude-code) 结对完成——从需求对齐到 MVP 可用不到一天，之后按使用反馈逐条迭代。而它服务的，恰好就是这种和 AI 结对的工作流。

## Roadmap

- [ ] 接入 LLM API 对候选提示词打分/改写（数据已结构化，规划 `ai:process` IPC 通道 + API Key 设置页）
- [ ] 全局快捷键唤起
- [ ] macOS 正式打包（electron-builder）

## 二创欢迎 🎉

MIT 协议，随意 fork、改造、集成、商用。加个你想要的功能、换套 UI、接上你自己的模型、移植到 Linux 都行——做出了有意思的变体，欢迎开 issue 告诉我。
