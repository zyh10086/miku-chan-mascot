# 🎀 Miku-chan Balance Mascot

> 初音未来绿色风格 · 右下角 Q 版初音未来 · DeepSeek API 余额提醒

一个为 **DeepSeek Harness (DSH)** 打造的动态 Cordis 插件：

- 🌿 **初音绿主题**：整个界面被覆盖成初音未来的招牌青绿色（亮色/暗色两套）。
- 🧚 **右下角 Q 版初音未来**：纯 SVG 手绘的 chibi 初音（渐变发色、呆毛、大眼睛），显示 DeepSeek API 余额气泡。
- 🔊 **会说话的初音**：点击她真的会开口说话！Host 端通过 **edge-tts**（微软神经网络语音）的 **ja-JP-NanamiNeural 日语女声** + 高音调合成，非常接近二次元声线；点击时还有呼吸、晃动动画。
- 🖼 **自定义头像**：把你喜欢的初音图片（PNG/GIF/WebP）放入 `<workspaceRoot>/.miku-avatar/`，插件自动加载显示；GIF 动图会直接播放。
- 🎵 **趣味二次元互动**：点击摸头会随机说出二次元台词、跳出 ♥ 和 ♪ 动画、余额不足时小初音会露出担心的表情提醒你充值。
- 🧅 **"葱"化 token 消耗**：把本会话消耗的 token 换算成"根葱"显示在 Miku 脚下。
- 🤖 **动态工具 `miku_status`**：模型可以直接调用，回答"我的余额还有多少？"这类问题。

---

## ✨ 功能一览

| 功能 | 说明 |
| --- | --- |
| DeepSeek 余额查询 | Host 端通过凭证服务读取 `DEEPSEEK_API_KEY`，调用官方 `https://api.deepseek.com/user/balance` 接口 |
| 初音绿主题 | 覆盖品牌色、背景、文字、边框等全套 CSS 变量，亮/暗模式都有 |
| Q 版初音吉祥物 | 右下角悬浮，内联 SVG 绘制，无需任何外部图片资源 |
| 点击摸头 | 随机二次元台词 + ♥ 飘出 + 弹跳动画 |
| 余额低提醒 | 余额 < 10 时小初音皱眉并提示充值 |
| token 统计 | 通过 `llm/stream` 事件累计本会话输入/输出 token |
| 动态工具 | `miku_status`：模型可主动查询余额与消耗 |

---

## 📦 安装

### 方式一：在 DSH 会话中动态安装（推荐体验）

在任意 DSH 会话中让 Agent 执行：

1. 将本仓库 `plugin/host.js` 与 `plugin/client.js` 的代码内容提供给 `cordis_define`（Host 与 Client 两个部分）。
2. 对返回的 Package 执行 `cordis_run`。
3. 在弹出的 Run 卡片中批准，浏览器端会自动激活主题与吉祥物。

### 方式二：作为预设/插件行加载（进阶）

将本仓库挂载为 DSH 的插件行，参考 `docs/plugin-row.yml` 示例（按部署的 cordis 组合方式调整）。

---

## 🔑 配置 DeepSeek API Key

余额查询依赖凭证服务中的 `DEEPSEEK_API_KEY`（与 DSH 内置 DeepSeek 模型路由共用同一凭证）：

- 在 DSH 的 **Models/模型设置** 页面写入 API Key；或
- 在启动环境中导出 `DEEPSEEK_API_KEY`。

未配置时，小初音会显示"未配置 DEEPSEEK_API_KEY"。

> 余额接口为公开官方 API：`GET https://api.deepseek.com/user/balance`，请求头 `Authorization: Bearer <key>`。本插件仅在 Host 端使用该 Key，绝不会下发到浏览器。

---

## 🛠 开发

```bash
git clone https://github.com/<your-name>/miku-chan-mascot.git
cd miku-chan-mascot
```

目录结构：

```
miku-chan-mascot/
├── plugin/
│   ├── host.js        # Host 端：余额查询、token 统计、miku_status 工具
│   └── client.js      # Client 端：初音绿主题 + Q版初音吉祥物
├── docs/
│   └── plugin-row.yml # 插件行挂载示例
├── README.md
└── LICENSE
```

修改后，把 `host.js` / `client.js` 的内容通过 `cordis_define`（kind: existing，同一 pluginId）提交为新 Package 即可热更新。

---

## 📜 声明

- 初音未来（Hatsune Miku）为 Crypton Future Media 的注册商标；本项目为非官方粉丝作品，仅供学习与娱乐。
- 本项目与 DeepSeek 官方无附属关系。
- 使用本项目产生的 API 调用费用由使用者自行承担。

## 📄 License

[MIT](./LICENSE)
