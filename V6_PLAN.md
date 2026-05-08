# Magic Tower v6.0 迭代需求文档

## 项目信息
- 项目路径: `d:\Programs\myprojects\test_things\magic-tower\`
- 技术栈: 纯静态 HTML/CSS/JS（ES Module），DOM 渲染（非 Canvas）
- 当前版本: v5.0
- 部署: Cloudflare Pages，域名 magic-tower.iherai.online

## 代码结构
```
magic-tower/
  index.html          -- 入口页面
  css/style.css       -- 全部样式（含动画 keyframes）
  js/
    game.js           -- 主控制器（~1111行），事件绑定、渲染、存档
    animation.js      -- 动画状态管理（73行），精灵创建
    map.js            -- 地图数据与规则（568行），关卡模板、敌人/道具定义
    battle.js         -- 战斗逻辑（90行），伤害计算、升级
    shop.js           -- 商店逻辑（70行），价格与购买
    audio.js          -- 音频系统（208行），Web Audio API 合成音效
  assets/sprites/     -- 8个角色精灵图（256x192, 4列x3行, 64x64/帧）
```

## 当前精灵系统说明
- 精灵图为 sprite sheet，4列(帧动画) x 3行(动作: idle/walk/attack)
- CSS `background-size: 400% 300%`，通过 `--sprite-y` CSS变量控制行
- 帧循环: `@keyframes spriteCycle` + `steps(1, end)` 实现4帧离散跳跃
- 朝向: 仅通过 `scaleX(-1)` 镜像翻转（左/右），上下不翻转
- 动画时长: idle=960ms, walk=520ms, attack=420ms

## 游戏美术风格设定（所有素材生成必须遵守）
- **风格**: 经典魔塔像素风，参考 2004 年 flash 魔塔、新魔塔等经典作品
- **色调**: 暗色地牢风格，石墙灰色、地板深棕、火把暖黄
- **角色设计原则**:
  - 英雄: 蓝色系战士，持剑盾，正面朝下
  - 史莱姆: 果冻质感，绿色/红色，圆润弹跳
  - 蝙蝠: 紫黑色翅膀，红眼
  - 骷髅: 白色骨架，持骨剑
  - 法师: 黑色长袍，紫色法杖，发光法球
  - 守卫: 银色铠甲，大盾
  - Boss: 暗红色巨大身躯，角和尾巴
- **道具风格**: 像素风小图标，颜色鲜明（红药水=红色瓶、蓝药水=蓝色瓶、钥匙=对应颜色）
- **UI风格**: 深色半透明面板，金色边框和文字，像素风按钮

---

## 需求 1: 角色朝向精灵动画优化

### 问题
当前角色往左跑只是简单 scaleX(-1) 镜像，缺乏真正的方向感。上下方向完全没有视觉区分。

### 方案
保持现有 sprite sheet 格式不变（4x3），但增强方向表现：

1. **CSS 增强**:
   - 朝上时: 增加 `brightness(0.92) saturate(0.9)` 模拟背影暗化
   - 朝下时: 正常亮度
   - 朝左: 保持 `scaleX(-1)` 镜像
   - 朝右: 正常

2. **英雄攻击方向感增强**:
   - 已有 `heroAttackLunge` 前冲动画，保持
   - 新增攻击特效方向: 斩击特效 `slashBurst` 应根据朝向旋转（左=-90deg, 右=90deg, 上=0deg, 下=180deg）

3. **移动时的微小位移**:
   - 行走动画期间，根据方向添加微小位移（2-3px），增强移动感
   - `facing-up` 行走时 `translateY(-2px)`, `facing-down` 时 `translateY(2px)` 等

### 修改文件
- `css/style.css`: 增强 `.facing-up/down` 样式，新增 `.action-walk.facing-*` 位移

---

## 需求 2: 移动端触控优化 + 商店交互改进

### 问题
1. 手机上点击方向按钮可能触发页面缩放
2. 商店需要双击或按键触发，手机上不方便
3. 没有滑动手势支持

### 方案

#### 2.1 禁止页面缩放
在 `index.html` 的 `<head>` 中确保 viewport meta 正确:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```
同时在 `css/style.css` 中添加:
```css
html {
  touch-action: manipulation;
  -ms-touch-action: manipulation;
  overscroll-behavior: none;
}
```

#### 2.2 滑动手势
在地图区域（`.map-grid`）添加触摸滑动手势:
- 检测 `touchstart` → `touchend` 的滑动方向
- 滑动距离 > 20px 才触发移动（防止误触）
- 滑动后立即 `preventDefault()` 防止页面滚动
- 滑动方向映射: 上滑=up, 下滑=down, 左滑=left, 右滑=right

在 `js/game.js` 中添加:
```js
// 在地图网格上添加滑动手势
let touchStartX, touchStartY;
els.mapGrid.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

els.mapGrid.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const threshold = 20;

  if (Math.max(absDx, absDy) < threshold) return; // 太短，不触发

  if (absDx > absDy) {
    movePlayer(dx > 0 ? "right" : "left");
  } else {
    movePlayer(dy > 0 ? "down" : "up");
  }
}, { passive: true });
```

#### 2.3 自动商店
当玩家移动到商店格（`TILE.SHOP`）上时，延迟 300ms 后自动弹出商店对话框。
- 如果玩家在商店格上只是路过（立即移走），不弹出
- 添加一个 `shopAutoOpenTimer`，移动到商店格时设置，离开时清除
- 保留原有的按键E/Enter打开商店功能作为备选

#### 2.4 方向按钮防缩放
在方向按钮上添加 `touch-action: manipulation` 和 `preventDefault`:
```css
.move-button {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
```

### 修改文件
- `index.html`: viewport meta
- `css/style.css`: 全局 touch-action, 按钮样式
- `js/game.js`: 滑动手势, 自动商店逻辑

---

## 需求 3: 敌人攻击动画系统

### 问题
当前敌人只有 idle 待机动画，法师没有丢光球的动作，史莱姆没有跳动，所有敌人看起来都只是"晃"。

### 方案

#### 3.1 敌人攻击动画触发
当玩家点击/移动到相邻的敌人格子时:
1. 先播放**敌人攻击动画**（敌人面朝玩家方向播放 attack 行）
2. 同时播放**英雄攻击动画**（heroAttackLunge）
3. 动画持续时间**根据敌人属性动态计算**（见 3.6）
4. 动画结束后，执行战斗结算
5. 如果胜利，播放敌人消散特效，玩家移动到敌人位置
6. 如果失败，显示战斗失败日志

#### 3.2 敌人朝向
敌人应根据玩家相对于自己的位置设置 facing:
- 玩家在敌人左边 → `facing-left`
- 玩家在敌人右边 → `facing-right`
- 玩家在敌人上方 → `facing-up`
- 玩家在敌人下方 → `facing-down`

#### 3.3 敌人攻击动画实现
在 `renderMap()` 中，当检测到正在播放战斗动画时:
- 给敌人精灵添加 `action-attack` class（切换到 attack 行）
- 给敌人精灵添加正确的 `facing-*` class
- 攻击动画结束后恢复 `action-idle`

#### 3.4 新增敌人攻击特效 CSS
为不同敌人类型添加独特的攻击视觉反馈:
- **法师 (mage)**: 攻击时在法师和玩家之间显示一个移动的光球（用 CSS animation 的 `::after` 伪元素实现）
- **史莱姆 (green_slime/red_slime)**: 攻击时播放弹跳动画（translateY 上下跳动）
- **蝙蝠 (bat)**: 攻击时快速扑向玩家方向（scale + translate 组合）
- **骷髅 (skeleton)**: 攻击时挥剑动作（rotate 微小角度）
- **Boss**: 攻击时屏幕微震（在 map-grid 上添加 shake class）

#### 3.5 战斗动画状态管理
在 `animation.js` 中新增:
```js
export function createCombatAnimationState() {
  return {
    active: false,
    enemyX: 0,
    enemyY: 0,
    enemyId: null,
    playerDirection: null,
    startTime: 0,
    duration: 500 // ms，由动态计算覆盖
  };
}
```

在 `game.js` 的 `handleEntity()` 中，当遇到敌人时:
1. 根据敌人属性动态计算动画时长
2. 设置 `state.combatAnimation` 状态
3. 渲染敌人攻击姿态 + 英雄攻击姿态
4. `setTimeout(计算时长)` 后执行实际战斗结算
5. 结算后清除动画状态，重新渲染

#### 3.6 动画时长动态计算（按敌人属性）
战斗动画时长根据敌人的 HP 和 ATK 动态计算，反映战斗的"重量感":

```js
function calculateCombatDuration(enemy) {
  // 基础时长 300ms
  // HP 越高 → 战斗越长（每 50 HP +20ms，上限 +200ms）
  // ATK 越高 → 攻击动作越有力量感（每 10 ATK +10ms，上限 +100ms）
  // Boss 额外 +100ms
  const hpFactor = Math.min(200, Math.floor(enemy.hp / 50) * 20);
  const atkFactor = Math.min(100, Math.floor(enemy.atk / 10) * 10);
  const bossFactor = enemy.isBoss ? 100 : 0;
  return 300 + hpFactor + atkFactor + bossFactor;
}
```

**各敌人预估时长**:
| 敌人 | HP | ATK | 时长 |
|------|-----|------|------|
| 绿色史莱姆 | 45 | 18 | 300ms |
| 红色史莱姆 | 70 | 26 | 352ms |
| 蝙蝠 | 90 | 34 | 394ms |
| 骷髅 | 130 | 46 | 472ms |
| 法师 | 170 | 58 | 546ms |
| 一层守卫 | 120 | 34 | 488ms |
| 二层守卫 | 210 | 48 | 596ms |
| 三层守卫 | 270 | 62 | 694ms |
| 四层守卫 | 350 | 78 | 816ms |
| 魔塔领主 | 460 | 95 | 970ms |

这样弱小的史莱姆战斗很快（~300ms），而最终Boss的战斗有近1秒的史诗感。

### 修改文件
- `js/animation.js`: 新增战斗动画状态、动态时长计算
- `js/game.js`: 修改 `handleEntity()` 流程，新增战斗动画渲染
- `css/style.css`: 新增敌人攻击特效样式

---

## 需求 4: 怪物常驻 HP 条

### 问题
玩家无法直观看到怪物的血量、攻击力等信息，不知道能不能打得过。

### 方案

#### 4.1 常驻 HP 条
在每个有敌人的格子上，精灵下方显示一个 HP 条:
- HP 条宽度 = 格子宽度的 80%
- HP 条高度 = 4px
- 颜色: 绿色(>60%) → 黄色(30-60%) → 红色(<30%)
- HP 条下方显示怪物名称（小字，10px）

#### 4.2 怪物信息提示
鼠标悬停（PC）或长按（手机）怪物格子时，显示详细信息 tooltip:
- 怪物名称
- HP / ATK / DEF 数值
- 预估战斗结果: "可战胜"（绿色）/ "危险"（黄色）/ "无法战胜"（红色）
- 预计损失 HP

#### 4.3 CSS 实现
```css
/* HP 条容器 */
.enemy-hp-bar {
  position: absolute;
  bottom: 2px;
  left: 10%;
  width: 80%;
  height: 4px;
  background: rgba(0,0,0,0.5);
  border-radius: 2px;
  overflow: hidden;
  z-index: 3;
}

.enemy-hp-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.enemy-hp-fill.hp-high { background: #4caf50; }
.enemy-hp-fill.hp-mid { background: #ff9800; }
.enemy-hp-fill.hp-low { background: #f44336; }

/* 怪物名称 */
.enemy-name {
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap;
  pointer-events: none;
}
```

### 修改文件
- `js/game.js`: `renderMap()` 中为敌人格子添加 HP 条和名称元素
- `css/style.css`: HP 条样式、tooltip 样式

---

## 需求 5: 地图随机生成系统

### 问题
当前地图是固定的5层手工模板，每次游戏完全相同，缺乏重玩性。

### 方案: 程序化随机地图生成（保证通关合理性）

#### 5.1 随机种子
- 游戏开始时生成一个随机种子（`Math.random()`）
- 种子显示在 UI 上，玩家可以分享种子重玩同一地图
- 新增"输入种子"选项，让玩家可以挑战特定地图
- 使用简单的伪随机数生成器（seeded PRNG）确保种子可复现:
```js
function createSeededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}
```

#### 5.2 地图生成算法
保持8x8网格，使用以下约束保证可玩性:

**固定元素**（不可随机）:
- 起始位置: 左下角区域 (x=0, y=7)
- 上楼梯: 起始位置或附近
- 下楼梯: 右上角区域
- 商店: 每层1个，放在中间区域

**随机元素**:
- 墙壁布局: 使用随机房间+走廊算法生成
- 敌人位置和种类: 根据楼层等级从敌人池中随机选择
- 道具位置和种类: 根据楼层等级从道具池中随机选择
- 门的位置: 在关键通道上随机放置

#### 5.3 通关合理性保证
**核心原则: 玩家不依赖商店也能通关**

1. **数值验证函数** `validateFloorBalance()`:
   - 模拟玩家从第1层到当前层的成长（击杀所有敌人、拾取所有道具）
   - 确保玩家在到达每层Boss前，属性足够击杀Boss
   - 如果不平衡，自动调整道具/敌人配置

2. **钥匙-门匹配**:
   - 确保每层放置的门都有对应的钥匙可达
   - 黄钥匙 > 黄门数量, 蓝钥匙 > 蓝门数量, 红钥匙 > 红门数量

3. **路径连通性**:
   - 使用 BFS/DFS 验证从起点到下楼梯的路径存在
   - 确保所有道具和钥匙都可达

4. **敌人强度曲线**:
   - 第1层: greenSlime, redSlime (弱)
   - 第2层: redSlime, bat (中弱)
   - 第3层: bat, skeleton, mage (中)
   - 第4层: skeleton, mage (中强)
   - 第5层: mage, skeleton, finalBoss (强)
   - Boss固定在每层下楼梯前

#### 5.4 难度影响
- **简单**: 敌人数值 x0.86, 额外补给道具, 5层
- **普通**: 标准数值, 5层
- **困难**: 敌人数值 x1.18, 补给减少, **7层**（新增2层过渡层）, 新增精英敌人变种

#### 5.5 困难模式扩展
- 新增楼层: 第6层"炼狱", 第7层"深渊"
- 新增敌人变种:
  - `eliteSkeleton`: 精英骷髅 (hp:200, atk:60, def:24)
  - `eliteMage`: 精英法师 (hp:260, atk:75, def:30)
  - `darkBat`: 暗影蝙蝠 (hp:140, atk:50, def:18)
- 最终Boss数值提升

#### 5.6 地图生成器实现
在 `js/map.js` 中新增 `generateRandomFloors(seed, difficulty)` 函数:

```js
export function generateRandomFloors(seed, difficultyId) {
  const rng = createSeededRandom(seed);
  const difficulty = normalizeDifficulty(difficultyId);
  const floorCount = difficultyId === "hard" ? 7 : 5;
  const floors = [];

  for (let i = 0; i < floorCount; i++) {
    let floor;
    let attempts = 0;
    do {
      floor = generateSingleFloor(rng, i, floorCount, difficultyId);
      attempts++;
    } while (!validateFloor(floor, i, floors) && attempts < 50);

    floors.push(floor);
  }

  return floors;
}
```

### 修改文件
- `js/map.js`: 新增随机地图生成器、验证函数、种子系统
- `js/game.js`: 新增种子UI、开始游戏时调用随机生成
- `index.html`: 新增种子显示/输入UI
- `css/style.css`: 种子相关样式

---

## 需求 6: 通关提示与胜利画面

### 问题
当前击败最终Boss后缺乏明确的胜利反馈。

### 方案

#### 6.1 通关胜利画面
击败最终Boss后:
1. 播放胜利音效（使用 audio.js 合成一段欢快的旋律）
2. 全屏覆盖一个胜利画面:
   - 金色渐变背景
   "恭喜通关！" 大标题（带闪光动画）
   - 显示通关统计: 用时、剩余HP、总金币、总等级、总步数
   - 显示随机种子（方便分享挑战）
   - "再来一局" 按钮（生成新种子重新开始）
   - "分享种子" 按钮（复制种子到剪贴板）

#### 6.2 游戏失败画面
当玩家HP归零时:
1. 播放失败音效
2. 显示失败画面:
   - 暗红色背景
   - "勇者倒下了..." 标题
   - 显示失败原因（被哪个敌人击败）
   - "读取存档" 和 "重新开始" 按钮

### 修改文件
- `index.html`: 新增胜利/失败画面 HTML
- `css/style.css`: 胜利/失败画面样式和动画
- `js/game.js`: 胜利/失败逻辑
- `js/audio.js`: 胜利/失败音效

---

## 需求 7: 难度系统优化

### 当前问题评估
- 简单模式: 敌人太弱，可能过于无聊
- 普通模式: 5层固定地图，熟悉后缺乏挑战
- 困难模式: 只是数值提升，体验单一

### 优化方案
1. **普通模式**: 保持5层，使用随机地图增加重玩性
2. **困难模式**: 扩展到7层，新增精英敌人，使用随机地图
3. **新增"噩梦"难度**:
   - 7层
   - 敌人数值 x1.35
   - 商店价格 x1.5
   - 某些楼层视野受限（战争迷雾效果，只能看到玩家周围2格）
   - 新增"诅咒"机制: 某些格子踩上去会降低属性

### 修改文件
- `js/map.js`: 新增噩梦难度定义、精英敌人、诅咒机制
- `js/game.js`: 战争迷雾渲染、诅咒逻辑
- `css/style.css`: 迷雾效果样式
- `index.html`: 难度选择UI更新

---

## 需求 8: 玩家技能系统

### 长期可迭代的技能系统设计

#### 8.1 基础技能（v6.0 实现3个）
在商店中新增"技能训练"选项，玩家可以学习主动技能:

1. **猛击** (Power Strike): 下次攻击伤害翻倍，冷却3步
2. **治疗** (Heal): 恢复30%最大HP，冷却5步
3. **护盾** (Shield): 下次受到伤害减半，冷却4步

技能UI:
- 在属性面板下方显示已学技能
- 每个技能显示图标、名称、冷却状态
- 点击/按键使用技能
- 技能使用时有特效动画

#### 8.2 战利品系统
击败敌人有概率掉落特殊道具:
- 暴击宝石: ATK +10（稀有）
- 守护之盾: DEF +10（稀有）
- 生命之心: 最大HP +50（普通）

### 修改文件
- `js/skills.js`: 新增技能系统模块
- `js/shop.js`: 扩展商店选项
- `js/game.js`: 技能使用逻辑、战利品掉落
- `index.html`: 技能栏UI
- `css/style.css`: 技能样式

---

## 需求 9: 素材生成规范（PNG → SVG 工作流）

### 9.1 新增素材清单
v6.0 需要生成以下新素材:

**技能图标** (64x64 PNG → SVG):
- `skill_power_strike.png/svg`: 猛击 - 红色剑刃闪光
- `skill_heal.png/svg`: 治疗 - 绿色十字光芒
- `skill_shield.png/svg`: 护盾 - 蓝色盾牌

**成就徽章** (64x64 PNG → SVG):
- `achievement_first_clear.png/svg`: 初次通关 - 金色奖杯
- `achievement_speedrun.png/svg`: 速通 - 闪电标志
- `achievement_collector.png/svg`: 收藏家 - 宝箱
- `achievement_undefeated.png/svg`: 不败传说 - 钻石

**战利品图标** (64x64 PNG → SVG):
- `loot_crit_gem.png/svg`: 暴击宝石 - 红色多面体宝石
- `loot_guard_shield.png/svg`: 守护之盾 - 银色小盾
- `loot_heart.png/svg`: 生命之心 - 红色心形

**精英敌人精灵图** (256x192 PNG → SVG, 4x3):
- `elite_skeleton.png/svg`: 精英骷髅 - 金色骨架，更大更壮
- `elite_mage.png/svg`: 精英法师 - 暗红色长袍，双法杖
- `dark_bat.png/svg`: 暗影蝙蝠 - 更大，紫色光环

**UI 元素** (PNG → SVG):
- `victory_bg.png/svg`: 胜利画面背景
- `defeat_bg.png/svg`: 失败画面背景
- `seed_icon.png/svg`: 种子图标
- `fog_tile.png/svg`: 战争迷雾遮罩

### 9.2 素材生成工作流
1. **Codex 使用 AI 图像生成** 生成 PNG 素材
2. **PNG → SVG 转换**: 使用在线工具或 Codex 脚本将 PNG 转为 SVG 矢量图
3. **一致性检查**: 所有素材必须符合"游戏美术风格设定"（见文档开头）
4. **存放路径**:
   - 精灵图: `assets/sprites/`
   - 道具/图标: `assets/`
   - UI元素: `assets/ui/`

### 9.3 精灵图格式规范
- 角色精灵图: 256x192 (4列 x 3行, 64x64/帧)
- 图标/徽章: 64x64 单帧
- 背景图: 根据需要调整尺寸

---

## 需求 10: 背景音乐生成（MiniMax Music API）

### 10.1 MiniMax Music 2.0 API
- **接口**: `POST https://api.minimaxi.com/v1/music_generation`
- **模型**: `music-2.0`
- **认证**: `Authorization: Bearer <API_KEY>`
- **输入**: `prompt`(风格描述) + `lyrics`(歌词，可选)
- **输出**: hex编码音频数据 或 URL（24小时有效）
- **格式**: mp3, 44100Hz, 256kbps

### 10.2 需要生成的音乐

| 编号 | 用途 | 风格描述 | 时长 |
|------|------|----------|------|
| BGM-1 | 主菜单/标题画面 | 8-bit 像素风，史诗感，中速，暗色地牢氛围，带神秘感 | ~30s 循环 |
| BGM-2 | 游戏中（普通层） | 8-bit 像素风，轻快冒险，中速，探索感 | ~60s 循环 |
| BGM-3 | Boss 战 | 8-bit 像素风，紧张激烈，快速，鼓点密集 | ~30s 循环 |
| BGM-4 | 通关胜利 | 8-bit 像素风，欢快庆祝，明亮，带凯旋感 | ~15s |
| BGM-5 | 游戏失败 | 8-bit 像素风，悲伤低沉，缓慢，带遗憾感 | ~10s |
| BGM-6 | 商店 | 8-bit 像素风，轻松温馨，中速，带交易感 | ~20s 循环 |

### 10.3 生成流程
1. 用户需要提供 MiniMax API Key
2. Codex 编写 Python/Node.js 脚本调用 API 生成音乐
3. 将生成的 mp3 文件保存到 `assets/audio/` 目录
4. 在 `js/audio.js` 中添加背景音乐播放逻辑:
   - 根据游戏状态切换 BGM（菜单/探索/Boss战/商店）
   - 支持静音/取消静音
   - BGM 自动循环播放
   - 音量独立于音效控制

### 10.4 API 调用示例
```bash
curl --request POST \
  --url https://api.minimaxi.com/v1/music_generation \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "music-2.0",
    "prompt": "8-bit chiptune pixel art game music, dark dungeon exploration, mysterious atmosphere, medium tempo, loopable",
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 128000,
      "format": "mp3"
    },
    "output_format": "url"
  }'
```

### 修改文件
- `assets/audio/`: 新增 6 个 BGM mp3 文件
- `js/audio.js`: 新增 BGM 播放/切换/静音逻辑
- `index.html`: 新增音乐控制按钮（静音/取消静音）
- `css/style.css`: 音乐按钮样式

---

## 实现优先级

### P0 (必须完成)
1. 禁止页面缩放（移动端基础体验）
2. 滑动手势控制
3. 自动商店弹出
4. 敌人攻击动画（交互动画 → 战斗结算 → 移动到敌人位置），**时长按敌人属性动态计算**
5. 怪物常驻 HP 条 + 名称
6. 通关胜利画面 + 失败画面
7. 地图随机生成（带种子和通关验证）

### P1 (应该完成)
8. 角色朝向动画增强
9. 困难模式扩展到7层
10. 基础技能系统（3个技能）
11. 新素材生成（技能图标、精英敌人精灵图等 PNG → SVG）

### P2 (可以延后)
12. 背景音乐生成（MiniMax Music API，需要用户提供 API Key）
13. 噩梦难度（战争迷雾+诅咒机制）
14. 战利品系统
15. 成就系统

---

## 技术约束
1. **纯静态**: 不引入任何构建工具或框架，保持纯 HTML/CSS/JS
2. **ES Module**: 保持现有的 ES Module 导入方式
3. **DOM 渲染**: 不切换到 Canvas，保持 CSS Grid + DOM 方案
4. **精灵图格式**: 保持 4列x3行 (256x192) 的 sprite sheet 格式
5. **浏览器兼容**: 支持现代浏览器（Chrome/Safari/Firefox 最新2个版本）
6. **文件大小**: 单个JS文件不超过1500行，超过则拆分模块
7. **不引入外部依赖**: 不使用任何 npm 包或 CDN 资源（BGM 文件除外）
8. **素材一致性**: 所有新生成素材必须符合"游戏美术风格设定"

## 部署
完成后需要部署到 Cloudflare Pages:
```
npx wrangler pages deploy d:\Programs\myprojects\test_things\magic-tower --project-name magic-tower
```
环境变量:
- CLOUDFLARE_API_KEY=02f7baf86aeae4c44915f9e0d79a24334dcfe
- CLOUDFLARE_EMAIL=964294308@qq.com
