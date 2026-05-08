# Codex 使用技能规范

## ⚠️ SOLO 操作铁律（每次对话必读）

1. **不要拆解任务** — 用户说什么，直接交给 Codex，不要自己分析
2. **不要自己写代码** — 所有代码/素材/部署工作由 Codex 完成
3. **记录一切** — 每次操作后更新 PROJECT_LOG.md 和本文件
4. **让 Codex 了解全貌** — 调用 Codex 时提醒他读 PROJECT_MEMORY.md
5. **持续跟进** — 不要停下来等确认，一直干到完成
6. **迭代技能** — 发现新踩坑点立即记录到本文件

## 核心原则

### 1. 任务描述要完整
- 明确目标：要做什么，做成什么样
- 明确约束：格式、尺寸、风格等技术要求
- 明确步骤：分几步，每步做什么
- 明确验证：怎么确认做对了

### 2. 不要干预 Codex 的判断
- 把问题和目标描述清楚
- 让 Codex 自己决定怎么做
- 不要替 Codex 做技术决策

### 3. 记录一切
- 问题是什么
- 尝试了什么
- 结果如何
- 改了什么
- 验证结果

---

## Codex 非交互式使用方法

### 命令格式
```bash
codex [选项] "任务描述"
```

### 常用选项
| 选项 | 说明 |
|------|------|
| `-a never` 或 `--ask-for-approval never` | 从不询问确认，全自动执行 |
| `-a on-request` | 只在 Codex 主动要求时询问 |
| `-a untrusted` | 不可信命令都询问（默认） |
| `-s danger-full-access` | 完全禁用沙箱，完全文件系统+网络访问 |
| `-s read-only` | 只读沙箱 |
| `-s workspace-write` | 可写工作区 |
| `--full-auto` | 完全绕过一切保护（危险！仅限隔离环境） |
| `--yolo` | `--dangerously-bypass-approvals-and-sandbox` 的别名 |
| `-m gpt-5.5` | 指定模型 |
| `--no-alt-screen` | 不使用备用屏幕 |

### 非交互式执行示例
```bash
# ✅ 推荐方式：codex exec（无需 TTY，适合脚本和自动化）
codex exec --dangerously-bypass-approvals-and-sandbox -s danger-full-access -m gpt-5.5 "任务描述"

# 指定工作目录
codex exec --dangerously-bypass-approvals-and-sandbox -s danger-full-access -m gpt-5.5 -C /path/to/project "任务描述"

# 旧方式（需要 TTY 终端）
codex -a never -s danger-full-access -m gpt-5.5 "任务描述"
```

### 关键区别：`codex exec` vs `codex`
| 特性 | `codex exec` | `codex`（交互式） |
|------|-------------|-----------------|
| 需要 TTY | ❌ 不需要 | ✅ 需要 |
| 适合自动化 | ✅ 是 | ❌ 否 |
| 参数格式 | `--dangerously-bypass-approvals-and-sandbox` | `-a never` |
| 退出码 | 返回 0/非0 | N/A |
| 适用场景 | SOLO 调用、CI/CD | 人工终端操作 |

### 踩坑记录

#### ❌ 错误方式
```bash
# 这种方式在 PowerShell 中无法正确传递多行文本
echo "任务描述" | codex -a never -s danger-full-access

# 这种方式会导致 Codex 等待交互式输入
codex -a never -s danger-full-access < task.txt
```

#### ✅ 正确方式
```bash
# PowerShell: 直接传递字符串（注意转义）
codex -a never -s danger-full-access -m gpt-5.5 "## 任务：xxx`n`n### 背景`n..."

# 或者使用文件内容（需确保格式正确）
codex -a never -s danger-full-access -m gpt-5.5 (Get-Content -Raw task.md)
```

### 重要发现
**Codex 需要真正的 TTY 终端才能运行**。在以下环境中无法启动：
- VS Code 集成终端（某些情况）
- 非交互式 shell 脚本
- 某些 CI/CD 环境

**解决方案**：
1. 在真正的终端（Windows Terminal、iTerm2、GNOME Terminal 等）中运行
2. 使用 `script` 命令伪造 TTY（Linux/macOS）
3. 使用 `winpty`（Windows MSYS2/Cygwin）

---

## 任务执行流程

### 1. 任务接收
```markdown
## 任务：[任务名称]

### 背景
[当前状况，存在的问题]

### 目标
[要达成什么效果]

### 约束条件
- [技术约束1]
- [技术约束2]
- [格式要求]

### 执行步骤
1. [步骤1]
2. [步骤2]
3. [步骤3]

### 验证标准
- [ ] [验证项1]
- [ ] [验证项2]
```

### 2. 任务分析
- 读取相关代码文件
- 理解当前实现
- 识别问题根源

### 3. 任务执行
- 使用正确的工具和命令
- 验证每一步的结果
- 记录到 PROJECT_LOG.md

### 4. 任务验证
- 检查修改是否正确
- 运行测试/验证脚本
- 更新 PROJECT_LOG.md

---

## 精灵图生成任务模板

### 任务描述示例
```markdown
## 任务：生成高质量英雄精灵图

### 背景
当前 assets/sprites/hero.png 是 Python 程序用矩形拼接绘制的粗糙版本，
用户不满意，要求使用 AI Image Generation 生成高质量像素风精灵图。

### 目标
生成 512x1536 像素的英雄精灵表，4方向×3动作，每帧128x128，
风格为16-bit像素艺术，类似经典JRPG。

### 约束条件
- 文件：assets/sprites/hero.png
- 尺寸：512×1536 像素
- 布局：4列×12行，每格128×128
- 行顺序：
  - Row 0-3: idle (down/left/right/up)
  - Row 4-7: walk (down/left/right/up)
  - Row 8-11: attack (down/left/right/up)
- 风格：16-bit像素艺术，JRPG骑士风格
- 角色：蓝色盔甲+金色装饰，深蓝披风，持剑盾
- 透明背景

### 执行步骤
1. 用 image_generation_call 生成12张128×128单帧
   - 每个方向+动作组合一张
   - 保存到 tmp/hero_frame_XX.png
2. 用 Python PIL 拼合成512×1536精灵表
   - 每行复制同一帧4次
   - 保存到 assets/sprites/hero.png
3. 裁剪第一帧到 assets/hero.png
4. 生成预览图验证
5. 用 Playwright 截图验证游戏内效果

### 验证标准
- [ ] 精灵图尺寸正确 512×1536
- [ ] 每帧角色完整显示，无头身分离
- [ ] 4个方向有明显朝向差异
- [ ] 游戏内显示正常
```

---

## 常用命令

```powershell
# 部署到 Cloudflare（正确方式：Global API Key + Email）
$env:CLOUDFLARE_API_KEY="02f7baf86aeae4c44915f9e0d79a24334dcfe"
$env:CLOUDFLARE_EMAIL="964294308@qq.com"
npx wrangler pages deploy '.' --project-name=magic-tower --branch=main

# ❌ 错误方式（不要用这个，Wrangler 4.90.0 不支持）
# npx wrangler login --api-token "xxx"

# ❌ 错误方式（Global API Key 不能当 API Token 用）
# $env:CLOUDFLARE_API_TOKEN="02f7baf86aeae4c44915f9e0d79a24334dcfe"  # 这会报 9106 认证失败

# 检查精灵图尺寸
python -c "from PIL import Image; img = Image.open('assets/sprites/hero.png'); print(f'Size: {img.size}')"

# 验证 JS 语法
node --check js/animation.js

# 启动本地服务器测试
npx serve . -p 8080
```

---

## 问题排查流程

### 精灵图问题
1. 检查源图尺寸和格式
2. 检查切割参数
3. 检查行列映射
4. 生成预览图验证
5. 修复后重新验证

### 部署问题
1. 检查文件是否已保存
2. 检查 Cloudflare 凭证
3. 检查网络连接
4. 查看部署日志

---

## 历史任务参考

### job-238: 修复英雄精灵头身分离问题
- **问题**: CSS background-position 百分比裁剪导致跨行取帧
- **方案**: 改用 transform 平移 + ::before 承载整张精灵图
- **结果**: 修复成功，Playwright 验证通过
- **命令**: `codex -a never -s danger-full-access -m gpt-5.5 "任务描述"`

### job-292: 生成高质量英雄精灵图
- **问题**: 原 Python 绘制的精灵图粗糙（17KB），需要 AI 生成高质量版本
- **方案**: 使用 Codex 的 image_generation_call 生成 12 张单帧，PIL 拼合
- **结果**: ✅ 成功，512x1536 RGBA 精灵表（291KB），12帧4方向×3动作
- **命令**: `codex exec --dangerously-bypass-approvals-and-sandbox -s danger-full-access -m gpt-5.5 -C d:\...\magic-tower "任务描述"`
- **新增文件**: `tools/build_ai_hero_sheet.py`, `tmp/hero-ai-sheet-preview.png`

### job-297: Cloudflare Pages 部署
- **问题**: 之前用 `CLOUDFLARE_API_TOKEN` 认证失败（code 9106）
- **根因**: 用户提供的是 Global API Key，不是 API Token；Wrangler 4.90.0 也不支持 `--api-token`
- **方案**: 使用 `CLOUDFLARE_API_KEY` + `CLOUDFLARE_EMAIL` 环境变量
- **结果**: ✅ 部署成功
  - 预览: https://7a46812c.magic-tower.pages.dev
  - 生产: https://magic-tower.pages.dev
  - 自定义域名: https://magic-tower.iherai.online（返回 200 但内容哈希不一致，需检查缓存）
- **命令**: `codex exec --dangerously-bypass-approvals-and-sandbox -s danger-full-access -m gpt-5.5 -C d:\...\magic-tower "部署任务"`

### job-298: 修复键盘方向键不可用
- **问题**: 部署到 Cloudflare 后，新用户首次访问按上下左右键没有移动反馈
- **根因**: 新域名下 localStorage 无教程完成标记，教程激活后 `movePlayer()` 直接 return，键盘事件被拦截
- **方案**: 添加 `MOVEMENT_KEY_MAP`（event.key + event.code 双映射），有效移动输入自动完成教程
- **结果**: ✅ 修复成功，Playwright 验证 ArrowRight 和 `d` 键均可正常移动
- **版本**: v=6.1 → v=6.2

### job-299: v6.2 部署到 Cloudflare
- **任务**: 将键盘修复版本重新部署到 Cloudflare Pages
- **结果**: ✅ 部署成功
  - 预览: https://c6333389.magic-tower.pages.dev
  - 生产: https://magic-tower.pages.dev（已验证 `v=6.2` 和 `MOVEMENT_KEY_MAP` 在线上代码中）
- **命令**: `codex exec --dangerously-bypass-approvals-and-sandbox -s danger-full-access -m gpt-5.5 -C d:\...\magic-tower "部署任务"`
