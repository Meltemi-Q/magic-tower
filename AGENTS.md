# Magic Tower - 项目指令

## 项目概述
魔塔 RPG 网页游戏，纯静态 HTML/CSS/JS (ES Module)，DOM 渲染，无 Canvas。
- **路径**: 当前目录
- **线上地址**: https://magic-tower.pages.dev
- **GitHub**: https://github.com/Meltemi-Q/magic-tower
- **当前版本**: v6.3

## 技术栈
- 纯静态站点，无构建工具
- ES Module (`type="module"`)
- 精灵图格式: 512x1536 PNG, 4列x12行, 128x128/帧, RGBA 透明背景
- CSS sprite animation: transform 平移 + ::before 承载精灵图

## 编码规范
- 所有 UI 文本通过 i18n 系统 (`t()`, `tList()`) 输出，支持中英文
- 新增功能必须同时更新中文和英文翻译
- 修改代码后更新 `index.html` 中的版本号查询参数（如 `v=6.2`）用于缓存刷新
- 修改代码后同步更新 `PROJECT_LOG.md`

## 常用命令
```powershell
# 验证 JS 语法
node --check js/game.js

# 本地测试
npx serve . -p 8080

# 部署到 Cloudflare Pages
$env:CLOUDFLARE_API_KEY="02f7baf86aeae4c44915f9e0d79a24334dcfe"
$env:CLOUDFLARE_EMAIL="964294308@qq.com"
npx wrangler pages deploy '.' --project-name=magic-tower --branch=main

# Git 提交推送
git add -A; git commit -m "描述"; git push
```

## 部署凭证
- **Cloudflare 认证**: 必须用 `CLOUDFLARE_API_KEY` + `CLOUDFLARE_EMAIL`（Global API Key）
- **不能用 `CLOUDFLARE_API_TOKEN`**: 会报认证失败
- **Wrangler 不支持 `--api-token` 参数**

## 文档体系
| 文件 | 用途 |
|------|------|
| `PROJECT_MEMORY.md` | 项目全貌记忆、踩坑记录、用户偏好 |
| `PROJECT_LOG.md` | 详细进度日志、操作记录 |
| `CODEX_SKILL.md` | Codex 使用规范和历史任务 |

## 用户偏好
- 语言: 中文
- 关注游戏可玩性和手机体验
- 每次修改后必须 git commit + push
- 每次修改后必须更新 PROJECT_LOG.md
