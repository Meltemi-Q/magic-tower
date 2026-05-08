# Magic Tower 项目关键记忆

## Codex CLI 使用经验（已验证成功）
- **安装**: `npm install -g mmx-cli` 安装 mmx; codex 通过 npm 全局安装
- **ChatGPT 账号支持的模型**: gpt-5.5 (默认最强), o4-mini
- **ChatGPT 账号不支持的模型**: o3, codex-1 (会报 "not supported when using Codex with a ChatGPT account")
- **✅ 成功的启动命令（在 SOLO 环境内）**:
  ```powershell
  Set-Location 'd:\Programs\myprojects\test_things\magic-tower'; codex exec --skip-git-repo-check -s danger-full-access -c 'model="gpt-5.5"' -c 'reasoning_effort="xhigh"' "prompt"
  ```
- **关键参数说明**:
  - `--skip-git-repo-check`: 必须加！SOLO 环境下 Git 检查可能失败
  - `-s danger-full-access`: 必须用这个沙箱模式！`-c 'sandbox_permissions=...'` 会导致 `CreateProcessWithLogonW failed: 2` 错误
  - `-c 'model="gpt-5.5"'`: 指定模型
  - `-c 'reasoning_effort="xhigh"'`: 最高推理强度
  - PowerShell 中不能用 `&&` 连接命令，用 `;` 分号
- **❌ 失败的启动方式（不要用）**:
  - `codex exec -c 'sandbox_permissions=["disk-full-access"]'` → CreateProcessWithLogonW failed: 2
  - `codex exec -c 'sandbox_permissions=["disk-full-read-access","disk-full-write-access"]'` → 同上
  - `codex exec -c 'model="o3"'` → not supported
  - `codex exec -c 'model="codex-1"'` → not supported
  - PowerShell 中 `cd dir && codex ...` → 语法错误
- **功能**: ImageGeneration, ComputerUse, BrowserUse 等都支持
- **退出码是语义化的**, 不是统一返回 1
- **Codex 适合**: 大规模代码重构、多文件修改、生成素材
- **Codex 不适合**: 在 SOLO 虚拟机的嵌套 shell 中运行（沙箱问题）

## Cloudflare 部署
- **Pages 项目名**: magic-tower
- **自定义域名**: magic-tower.iherai.online
- **Account ID**: 6cb6b3ace098431299e9b9cf1b07e5bb
- **Zone ID**: bd9f8b499a83496021b1340c2021c1f2
- **认证方式**: 必须用 CLOUDFLARE_API_KEY + CLOUDFLARE_EMAIL (Global API Key)
  - API Key: 02f7baf86aeae4c44915f9e0d79a24334dcfe
  - Email: 964294308@qq.com
- **不能用 CLOUDFLARE_API_TOKEN**: Global API Key 放在 CLOUDFLARE_API_TOKEN 里会报 "Invalid format for Authorization header [code: 6111]"
- **Pages 自定义域名 API**: 参数名是 `name` 不是 `domain_name`
- **Pages 自定义域名**: 子域名也可以直接添加（如 magic-tower.iherai.online）
- **Wrangler 部署命令**: `$env:CLOUDFLARE_API_KEY="..."; $env:CLOUDFLARE_EMAIL="..."; npx wrangler pages deploy 'path' --project-name magic-tower`
- **wrangler login 不能在后台模式运行**（需要浏览器交互）

## MiniMax mmx CLI
- **安装**: `npm install -g mmx-cli`
- **认证**: 命令行传 `--api-key` 或 `mmx auth`
- **音乐生成**: `mmx music generate --api-key "KEY" --prompt "..." --instrumental --out "path.mp3" --non-interactive --no-color`
- **模型**: music-2.6
- **用户 API Key**: sk-cp-0hNioAq78bEzP6-tNBEi7xkLmGjYjoMVNj4Ae4_O1mpTQRbI2UfHPqd9ecabjoD1oX0-OM49o9-RK6wygmeKlomWG6EGIrfFu_iXw0oM1qQAsttrmXLqkGM
- **可并行生成**: 多个 mmx music generate 命令可同时运行

## 项目信息
- **路径**: d:\Programs\myprojects\test_things\magic-tower\
- **GitHub**: https://github.com/Meltemi-Q/magic-tower
- **技术栈**: 纯静态 HTML/CSS/JS (ES Module), DOM 渲染, 无 Canvas
- **精灵图格式**: 256x192 PNG, 4列x3行 (64x64/帧), idle/walk/attack
- **当前版本**: v6.0 (2026-05-08)

## 素材生成工作流（重要！）
- **不要直接写 SVG 代码！**
- **正确流程**:
  1. 先确定游戏美术风格（像素风、颜色主题等）
  2. 用 Codex 的 ImageGeneration 功能生成 PNG
  3. 把 PNG 转换成 SVG（保持像素风格）
- **已生成的素材**:
  - 精灵图: hero.png, enemies/*.png, enemies/*.svg
  - 技能图标: skill_*.svg
  - UI 元素: 需要方向键 SVG
- **风格参考**: 金色/棕色主色调，像素艺术，16-bit RPG 风格

## v6.0 已实现功能清单
- ✅ 移动端禁止缩放 (viewport meta + touch-action)
- ✅ 滑动手势控制 (touchstart/touchend on map-grid)
- ✅ 自动商店弹出 (300ms 延迟)
- ✅ 敌人攻击动画 (动态时长 based on HP/ATK/Boss)
- ✅ 敌人常驻 HP 条 (绿/黄/红)
- ✅ 通关胜利画面 + 失败画面
- ✅ 地图随机生成 (种子 + PRNG + BFS 验证)
- ✅ 困难模式 7 层 + 精英敌人
- ✅ 技能系统 (猛击/治疗/护盾)
- ✅ BGM 集成 (6 首 MiniMax 生成的 mp3)
- ✅ 角色朝向动画增强
- ✅ 精英敌人 SVG 素材 (elite_skeleton/elite_mage/dark_bat)

## v6.1 已实现功能清单 (2026-05-08)
- ✅ 移除 seed UI 显示（胜利画面才显示）
- ✅ 掉血飘字动画（红色数字上飘消失）
- ✅ 音量调整：BGM 0.2, SFX 0.85
- ✅ 英雄精灵图格式修复（4x4 布局适配）
- ✅ 方向键 SVG（像素风金色主题）
- ✅ 版本号缓存刷新 (v=6.1)

## 用户偏好
- 语言: 中文
- 喜欢直接行动，不要问太多，说"干就干"
- 让 Codex 干活时不要自己动手写代码
- 关注游戏可玩性和手机体验
- 希望沉淀经验和记忆，避免重复踩坑

## SOLO 工作规范（SOLO → Codex 协作模式）

### SOLO 的角色
- **记录者**：记录所有进度、结果、问题到 PROJECT_LOG.md
- **协调者**：调用 Codex 执行实际开发任务
- **文档维护者**：更新 CODEX_SKILL.md 和 PROJECT_MEMORY.md
- **不是拆解者**：不要拆解分析任务，直接把用户需求交给 Codex

### Codex 的角色
- **执行者**：所有代码修改、素材生成、部署都由 Codex 完成
- **自驱决策**：Codex 自行决定技术方案，SOLO 不干预
- **文档同步**：Codex 修改代码后同步更新 PROJECT_LOG.md

### 协作流程
1. 用户提出需求 → SOLO 直接调用 Codex（不拆解、不分析）
2. Codex 执行 → SOLO 监控进度
3. Codex 完成 → SOLO 验证结果、更新文档
4. 循环直到用户满意

### 文档体系
| 文件 | 用途 | 维护者 |
|------|------|--------|
| `PROJECT_MEMORY.md` | 项目全貌记忆（Codex 启动时读取） | SOLO + Codex |
| `PROJECT_LOG.md` | 详细进度日志 | SOLO + Codex |
| `CODEX_SKILL.md` | Codex 使用规范 + 历史任务 | SOLO |
| `.codex/skills/*/SKILL.md` | Codex 技能文件 | Codex |

### 当前版本: v6.2
### 当前部署: https://magic-tower.pages.dev（已验证 v=6.2 在线）
