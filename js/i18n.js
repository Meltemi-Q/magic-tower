const LANGUAGE_KEY = "magicTowerLanguage";
const DEFAULT_LANGUAGE = "zh";
const SUPPORTED_LANGUAGES = new Set(["zh", "en"]);

const TEXT = {
  zh: {
    app: {
      title: "魔塔",
      fullTitle: "魔塔 Magic Tower",
      floorFallback: "第 {floor} 层",
      hero: "勇者"
    },
    actions: {
      audioOn: "关闭音乐",
      audioOff: "播放音乐",
      help: "帮助",
      language: "Switch to English",
      languageButton: "EN",
      newGame: "新游戏",
      save: "保存",
      load: "读取",
      shop: "商店",
      close: "关闭",
      retry: "再来一局",
      retryChallenge: "重新挑战",
      shareSeed: "分享种子",
      startExplore: "开始探索",
      nextStep: "下一步",
      skip: "跳过",
      buy: "{cost} 金",
      learned: "已学会"
    },
    panels: {
      difficulty: "难度",
      stats: "基础属性",
      keys: "钥匙",
      skills: "技能",
      target: "前方目标",
      saves: "存档槽",
      log: "日志",
      operations: "操作"
    },
    aria: {
      gameMap: "游戏地图",
      mapGrid: "8x8 魔塔地图",
      movement: "移动控制",
      moveUp: "向上",
      moveDown: "向下",
      moveLeft: "向左",
      moveRight: "向右",
      status: "角色状态",
      difficulty: "难度选择",
      selectDifficulty: "选择难度",
      tutorial: "新手引导",
      victory: "通关胜利",
      defeat: "游戏失败",
      battleLog: "战斗日志和操作",
      skills: "技能",
      target: "目标信息",
      saves: "存档"
    },
    stats: {
      hp: "生命",
      atk: "攻击",
      def: "防御",
      gold: "金币",
      exp: "经验",
      floor: "楼层",
      level: "等级",
      time: "时间",
      steps: "步数",
      seed: "种子"
    },
    status: {
      canFight: "可战斗",
      danger: "危险",
      ready: "就绪",
      armed: "已准备",
      cooldown: "冷却 {turns}",
      untrained: "未训练",
      boughtCount: "已购买 {count} 次",
      noSpecialTarget: "没有特殊目标。",
      noTarget: "移动到怪物、道具、门或楼梯旁查看。",
      holdKey: "持有 {count}",
      stairUnlocked: "可进入",
      stairLocked: "需击败守卫",
      returnPrevious: "返回上一层",
      shopEnter: "E / Enter / 双击进入",
      hiddenTile: "未知区域",
      currentPosition: "勇者当前位置",
      curseEffect: "踩上后会降低生命、攻击和防御。"
    },
    difficulty: {
      easy: {
        label: "简单",
        description: "5 层，怪物较弱，补给更多。"
      },
      normal: {
        label: "普通",
        description: "5 层，标准魔塔节奏。"
      },
      hard: {
        label: "困难",
        description: "7 层，怪物更强，后期出现精英怪。"
      },
      nightmare: {
        label: "噩梦",
        description: "7 层，怪物极强，商店更贵，有迷雾和诅咒格。"
      }
    },
    enemies: {
      greenSlime: "绿色史莱姆",
      redSlime: "红色史莱姆",
      bat: "暗翼蝙蝠",
      skeleton: "骷髅士兵",
      mage: "黑袍法师",
      darkBat: "暗影蝙蝠",
      eliteSkeleton: "精英骷髅",
      eliteMage: "精英法师",
      boss1: "一层守卫",
      boss2: "二层守卫",
      boss3: "三层守卫",
      boss4: "四层守卫",
      finalBoss: "魔塔领主"
    },
    items: {
      redPotion: {
        name: "红药水",
        description: "+120 生命",
        pickup: "喝下红药水，生命 +120。"
      },
      bluePotion: {
        name: "蓝药水",
        description: "+220 生命",
        pickup: "喝下蓝药水，生命 +220。"
      },
      ruby: {
        name: "红宝石",
        description: "+6 攻击",
        pickup: "吸收红宝石，攻击 +6。"
      },
      emerald: {
        name: "绿宝石",
        description: "+6 防御",
        pickup: "吸收绿宝石，防御 +6。"
      },
      yellowKey: {
        name: "黄钥匙",
        description: "+1 黄钥匙",
        pickup: "获得 1 把黄钥匙。"
      },
      blueKey: {
        name: "蓝钥匙",
        description: "+1 蓝钥匙",
        pickup: "获得 1 把蓝钥匙。"
      },
      redKey: {
        name: "红钥匙",
        description: "+1 红钥匙",
        pickup: "获得 1 把红钥匙。"
      }
    },
    keys: {
      yellow: "黄钥匙",
      blue: "蓝钥匙",
      red: "红钥匙",
      yellowDoor: "黄门",
      blueDoor: "蓝门",
      redDoor: "红门"
    },
    tiles: {
      wall: "墙",
      floor: "地板",
      yellowDoor: "黄门",
      blueDoor: "蓝门",
      redDoor: "红门",
      stairDown: "下楼梯",
      stairUp: "上楼梯",
      shop: "商店",
      curse: "诅咒格"
    },
    shopOptions: {
      hp: {
        name: "生命训练",
        description: "生命 +100"
      },
      atk: {
        name: "攻击训练",
        description: "攻击 +5"
      },
      def: {
        name: "防御训练",
        description: "防御 +5"
      },
      skillTraining: "{skill}训练"
    },
    skills: {
      powerStrike: {
        name: "重击",
        shortName: "重击",
        description: "下一次攻击造成双倍伤害。",
        learned: "学会了重击。",
        ready: "重击已准备。下一次攻击会更强。",
        active: "重击已经准备好了。",
        untrained: "尚未学会重击。",
        cooldown: "重击还需要 {turns} 步冷却。"
      },
      heal: {
        name: "治疗",
        shortName: "治疗",
        description: "恢复最大生命的 30%。",
        learned: "学会了治疗。",
        ready: "治疗恢复了 {amount} 点生命。",
        active: "治疗已经生效。",
        untrained: "尚未学会治疗。",
        cooldown: "治疗还需要 {turns} 步冷却。"
      },
      shield: {
        name: "护盾",
        shortName: "护盾",
        description: "下一次受到的伤害减半。",
        learned: "学会了护盾。",
        ready: "护盾已举起。下一次受到的伤害会减半。",
        active: "护盾已经准备好了。",
        untrained: "尚未学会护盾。",
        cooldown: "护盾还需要 {turns} 步冷却。"
      },
      unknown: "未知技能"
      ,
      empty: "在商店训练技能。"
    },
    floorNames: {
      floor1: "第 {floor} 层：入口大厅",
      floor2: "第 {floor} 层：迷雾回廊",
      floor3: "第 {floor} 层：暗影深渊",
      floor4: "第 {floor} 层：熔岩地狱",
      floor5: "第 {floor} 层：冰封王座",
      floor6: "第 {floor} 层：虚空之境",
      floor7: "第 {floor} 层：魔王巢穴",
      fallback: "第 {floor} 层：失落深境"
    },
    target: {
      enemyStats: "{hp} / {atk} / {def}",
      expectedLoss: "预计损失",
      reward: "奖励",
      rewardValue: "{gold} 金 / {exp} 经验"
    },
    tutorial: {
      steps: [
        "这里是 8x8 魔塔地图。方向键、WASD、下方方向按钮或点击相邻格都可以移动。",
        "右侧显示生命、攻击、防御、金币、经验和钥匙。进门和战斗前先看这里。",
        "靠近怪物、门、楼梯或商店时，目标面板会显示战斗损失、钥匙需求或交互提示。",
        "底部按钮负责新游戏、保存、读取和商店。靠近商店后按 E、Enter、双击商店格或点击商店按钮交易。",
        "顶部按钮可以开关背景音乐、切换语言，也可以随时打开帮助。完成引导后即可开始探索。"
      ]
    },
    help: {
      lines: [
        "方向键或 WASD 移动；手机端使用地图下方方向按钮。",
        "点击相邻格也可以移动；按 E 或 Enter 会交互前方目标。",
        "靠近商店后，双击商店格、按 E / Enter 或点击商店按钮都能进入训练。",
        "击败每层守卫后，踏下楼梯进入下一层。噩梦难度会限制视野并生成诅咒格。"
      ]
    },
    prompt: {
      shop: "按 E / Enter、双击商店格或点击商店进入训练。"
    },
    logs: {
      welcome: "欢迎来到魔塔。击败每层守卫后继续向上。",
      start: "{difficulty}难度开始。",
      confirmNew: "确定以 {difficulty} 难度开始新游戏？当前未保存进度会丢失。",
      confirmDifficulty: "切换到 {difficulty} 难度会重新开始本局，确定吗？",
      difficultyChanged: "已切换为{difficulty}难度。{description}",
      tutorialBlocked: "请先完成新手引导。",
      wonLocked: "魔塔已经通关，可以开始新游戏。",
      defeatedLocked: "勇者已经倒下，请读取存档或重新开始。",
      noInteractTarget: "附近没有可交互目标。",
      shopNeedNear: "靠近商店或站在商店格上才能交易。",
      shopNeedOnTile: "需要站在商店格子上才能交易。",
      shopNear: "靠近商店后再交互。",
      arrivedShop: "到达商店。按 E、Enter、双击商店格或点击商店按钮进入训练。",
      wall: "前方是墙。",
      needKey: "需要{key}。",
      openDoor: "打开{door}。",
      cannotDefeat: "无法击败 {enemy}，预计损失 {loss} 生命。",
      bossDefeated: "{enemy} 已被击败，本层楼梯封印解除。",
      finalDefeated: "魔塔领主倒下，通关完成。",
      stairLocked: "守卫仍在，本层下楼梯被封印。",
      noFloor: "没有可前往的楼层。",
      arriveFloor: "来到{floor}。",
      guideDone: "新手引导完成，开始探索魔塔。",
      skillAlreadyArmed: "该技能已经准备好了。",
      shopNoItem: "商店没有这个项目。",
      skillUnavailable: "技能训练不可用。",
      skillComplete: "{skill} 已经学会。",
      noGold: "金币不足，需要 {cost} 金币。",
      bought: "购买 {name}，花费 {cost} 金币，{description}。",
      shopGold: "持有 {gold} 金币。价格会随购买次数递增。",
      shopGoldNightmare: "持有 {gold} 金币。噩梦难度商店价格为 1.5 倍。",
      defeatReason: "被 {enemy} 击败。",
      defeatDefault: "勇者在战斗中倒下。",
      seedCopied: "种子已复制到剪贴板。",
      saved: "已保存到槽 {slot}。",
      emptySlot: "槽 {slot}: 空",
      badSlot: "槽 {slot}: 数据损坏",
      unknownFloor: "未知楼层",
      loaded: "已读取槽 {slot}。",
      noSave: "槽 {slot} 没有存档。",
      loadFailed: "槽 {slot} 存档无法读取。",
      curse: "踏上诅咒格，生命 -{hp}，攻击 -{atk}，防御 -{def}。"
    },
    battle: {
      encountered: "遭遇 {enemy}。",
      powerStrike: "重击让开场攻击翻倍。",
      heroHit: "第 {round} 回合：勇者造成 {damage} 点伤害，{enemy} 剩余 {hp} 生命。",
      shield: "护盾减半了这次伤害。",
      enemyHit: "第 {round} 回合：{enemy} 反击造成 {damage} 点伤害，勇者剩余 {hp} 生命。",
      fallen: "勇者倒下了。",
      defeated: "击败 {enemy}，获得 {gold} 金币和 {exp} 经验。",
      levelUp: "升到 LV {level}：生命 +90，攻击 +5，防御 +4。"
    },
    outcome: {
      victory: "Victory",
      victoryTitle: "恭喜通关",
      defeat: "Defeat",
      defeatTitle: "勇者倒下了"
    }
  },
  en: {
    app: {
      title: "Magic Tower",
      fullTitle: "Magic Tower",
      floorFallback: "Floor {floor}",
      hero: "Hero"
    },
    actions: {
      audioOn: "Mute music",
      audioOff: "Play music",
      help: "Help",
      language: "切换到中文",
      languageButton: "中",
      newGame: "New Game",
      save: "Save",
      load: "Load",
      shop: "Shop",
      close: "Close",
      retry: "Try Again",
      retryChallenge: "Retry",
      shareSeed: "Share Seed",
      startExplore: "Start",
      nextStep: "Next",
      skip: "Skip",
      buy: "{cost} Gold",
      learned: "Learned"
    },
    panels: {
      difficulty: "Difficulty",
      stats: "Stats",
      keys: "Keys",
      skills: "Skills",
      target: "Target",
      saves: "Saves",
      log: "Log",
      operations: "Controls"
    },
    aria: {
      gameMap: "Game map",
      mapGrid: "8 by 8 Magic Tower map",
      movement: "Movement controls",
      moveUp: "Move up",
      moveDown: "Move down",
      moveLeft: "Move left",
      moveRight: "Move right",
      status: "Hero status",
      difficulty: "Difficulty selection",
      selectDifficulty: "Select difficulty",
      tutorial: "Tutorial",
      victory: "Victory",
      defeat: "Defeat",
      battleLog: "Battle log and controls",
      skills: "Skills",
      target: "Target information",
      saves: "Saves"
    },
    stats: {
      hp: "HP",
      atk: "ATK",
      def: "DEF",
      gold: "Gold",
      exp: "EXP",
      floor: "Floor",
      level: "Level",
      time: "Time",
      steps: "Steps",
      seed: "Seed"
    },
    status: {
      canFight: "Can fight",
      danger: "Danger",
      ready: "Ready",
      armed: "Armed",
      cooldown: "CD {turns}",
      untrained: "Untrained",
      boughtCount: "Bought {count}",
      noSpecialTarget: "No special target.",
      noTarget: "Move next to an enemy, item, door, or stair to inspect it.",
      holdKey: "Owned {count}",
      stairUnlocked: "Open",
      stairLocked: "Defeat guard",
      returnPrevious: "Return",
      shopEnter: "E / Enter / Double-click",
      hiddenTile: "Unknown area",
      currentPosition: "Hero position",
      curseEffect: "Stepping on it reduces HP, ATK, and DEF."
    },
    difficulty: {
      easy: {
        label: "Easy",
        description: "5 floors, weaker enemies, extra supplies."
      },
      normal: {
        label: "Normal",
        description: "5 floors, standard tower pacing."
      },
      hard: {
        label: "Hard",
        description: "7 floors, stronger enemies, elite enemies late."
      },
      nightmare: {
        label: "Nightmare",
        description: "7 floors, brutal enemies, higher shop prices, fog, and curse tiles."
      }
    },
    enemies: {
      greenSlime: "Green Slime",
      redSlime: "Red Slime",
      bat: "Dark Bat",
      skeleton: "Skeleton Soldier",
      mage: "Black Mage",
      darkBat: "Shadow Bat",
      eliteSkeleton: "Elite Skeleton",
      eliteMage: "Elite Mage",
      boss1: "First Guard",
      boss2: "Second Guard",
      boss3: "Third Guard",
      boss4: "Fourth Guard",
      finalBoss: "Tower Lord"
    },
    items: {
      redPotion: {
        name: "Red Potion",
        description: "+120 HP",
        pickup: "Drank a red potion. HP +120."
      },
      bluePotion: {
        name: "Blue Potion",
        description: "+220 HP",
        pickup: "Drank a blue potion. HP +220."
      },
      ruby: {
        name: "Ruby",
        description: "+6 ATK",
        pickup: "Absorbed a ruby. ATK +6."
      },
      emerald: {
        name: "Emerald",
        description: "+6 DEF",
        pickup: "Absorbed an emerald. DEF +6."
      },
      yellowKey: {
        name: "Yellow Key",
        description: "+1 Yellow Key",
        pickup: "Gained 1 yellow key."
      },
      blueKey: {
        name: "Blue Key",
        description: "+1 Blue Key",
        pickup: "Gained 1 blue key."
      },
      redKey: {
        name: "Red Key",
        description: "+1 Red Key",
        pickup: "Gained 1 red key."
      }
    },
    keys: {
      yellow: "Yellow Key",
      blue: "Blue Key",
      red: "Red Key",
      yellowDoor: "Yellow Door",
      blueDoor: "Blue Door",
      redDoor: "Red Door"
    },
    tiles: {
      wall: "Wall",
      floor: "Floor",
      yellowDoor: "Yellow Door",
      blueDoor: "Blue Door",
      redDoor: "Red Door",
      stairDown: "Down Stairs",
      stairUp: "Up Stairs",
      shop: "Shop",
      curse: "Curse Tile"
    },
    shopOptions: {
      hp: {
        name: "HP Training",
        description: "HP +100"
      },
      atk: {
        name: "ATK Training",
        description: "ATK +5"
      },
      def: {
        name: "DEF Training",
        description: "DEF +5"
      },
      skillTraining: "{skill} Training"
    },
    skills: {
      powerStrike: {
        name: "Power Strike",
        shortName: "Strike",
        description: "Next attack deals double damage.",
        learned: "Trained Power Strike.",
        ready: "Power Strike readied. The next attack will hit harder.",
        active: "Power Strike is already armed.",
        untrained: "Power Strike has not been trained.",
        cooldown: "Power Strike is cooling down for {turns} more steps."
      },
      heal: {
        name: "Heal",
        shortName: "Heal",
        description: "Restore 30% of max HP.",
        learned: "Trained Heal.",
        ready: "Heal restored {amount} HP.",
        active: "Heal already resolved.",
        untrained: "Heal has not been trained.",
        cooldown: "Heal is cooling down for {turns} more steps."
      },
      shield: {
        name: "Shield",
        shortName: "Shield",
        description: "Next incoming hit is reduced by half.",
        learned: "Trained Shield.",
        ready: "Shield raised. The next incoming hit will be reduced.",
        active: "Shield is already armed.",
        untrained: "Shield has not been trained.",
        cooldown: "Shield is cooling down for {turns} more steps."
      },
      unknown: "Unknown skill"
      ,
      empty: "Train skills at the shop."
    },
    floorNames: {
      floor1: "Floor {floor}: Entrance Hall",
      floor2: "Floor {floor}: Mist Corridor",
      floor3: "Floor {floor}: Shadow Abyss",
      floor4: "Floor {floor}: Lava Inferno",
      floor5: "Floor {floor}: Frozen Throne",
      floor6: "Floor {floor}: Void Realm",
      floor7: "Floor {floor}: Demon Lair",
      fallback: "Floor {floor}: Lost Depths"
    },
    target: {
      enemyStats: "{hp} / {atk} / {def}",
      expectedLoss: "Expected Loss",
      reward: "Reward",
      rewardValue: "{gold} Gold / {exp} EXP"
    },
    tutorial: {
      steps: [
        "This is the 8 by 8 tower map. Move with arrow keys, WASD, the mobile buttons, or by clicking an adjacent tile.",
        "The right panel shows HP, ATK, DEF, gold, EXP, and keys. Check it before opening doors or fighting.",
        "When you stand near enemies, doors, stairs, or shops, the target panel shows losses, key needs, and interaction hints.",
        "The bottom buttons handle new game, save, load, and shop. Near a shop, press E, Enter, double-click the shop tile, or tap Shop.",
        "The top buttons control music, language, and help. Finish the guide to start exploring."
      ]
    },
    help: {
      lines: [
        "Move with arrow keys or WASD; use the direction pad on mobile.",
        "Click adjacent tiles to move; press E or Enter to interact with the forward target.",
        "Near a shop, double-click the shop tile, press E / Enter, or click Shop to train.",
        "Defeat each floor guard, then step onto the stairs to continue. Nightmare adds fog and curse tiles."
      ]
    },
    prompt: {
      shop: "Press E / Enter, double-click the shop tile, or click Shop to train."
    },
    logs: {
      welcome: "Welcome to Magic Tower. Defeat each floor guard to continue upward.",
      start: "{difficulty} difficulty started.",
      confirmNew: "Start a new {difficulty} run? Unsaved progress will be lost.",
      confirmDifficulty: "Switching to {difficulty} restarts this run. Continue?",
      difficultyChanged: "Switched to {difficulty}. {description}",
      tutorialBlocked: "Finish the tutorial first.",
      wonLocked: "The tower is already cleared. Start a new game.",
      defeatedLocked: "The hero has fallen. Load a save or restart.",
      noInteractTarget: "There is no nearby target to interact with.",
      shopNeedNear: "Stand near or on the shop tile to trade.",
      shopNeedOnTile: "Stand on the shop tile to trade.",
      shopNear: "Move closer to the shop first.",
      arrivedShop: "Reached the shop. Press E, Enter, double-click the shop tile, or click Shop to train.",
      wall: "There is a wall ahead.",
      needKey: "Need {key}.",
      openDoor: "Opened {door}.",
      cannotDefeat: "Cannot defeat {enemy}; expected loss is {loss} HP.",
      bossDefeated: "{enemy} has been defeated. The stair seal on this floor is broken.",
      finalDefeated: "The Tower Lord has fallen. The tower is cleared.",
      stairLocked: "The guard still stands. The downstairs seal remains.",
      noFloor: "There is no floor in that direction.",
      arriveFloor: "Arrived at {floor}.",
      guideDone: "Tutorial complete. Begin exploring the tower.",
      skillAlreadyArmed: "That skill is already armed.",
      shopNoItem: "The shop does not offer that option.",
      skillUnavailable: "Skill training is unavailable.",
      skillComplete: "{skill} is already complete.",
      noGold: "Not enough gold. Need {cost} gold.",
      bought: "Bought {name} for {cost} gold. {description}.",
      shopGold: "You have {gold} gold. Prices increase after each purchase.",
      shopGoldNightmare: "You have {gold} gold. Nightmare shop prices are multiplied by 1.5.",
      defeatReason: "Defeated by {enemy}.",
      defeatDefault: "The hero fell in battle.",
      seedCopied: "Seed copied to clipboard.",
      saved: "Saved to slot {slot}.",
      emptySlot: "Slot {slot}: Empty",
      badSlot: "Slot {slot}: Corrupt data",
      unknownFloor: "Unknown floor",
      loaded: "Loaded slot {slot}.",
      noSave: "Slot {slot} has no save.",
      loadFailed: "Slot {slot} could not be loaded.",
      curse: "Stepped on a curse tile. HP -{hp}, ATK -{atk}, DEF -{def}."
    },
    battle: {
      encountered: "Encountered {enemy}.",
      powerStrike: "Power Strike doubles the opening blow.",
      heroHit: "Round {round}: Hero deals {damage} damage. {enemy} has {hp} HP.",
      shield: "Shield halves the incoming hit.",
      enemyHit: "Round {round}: {enemy} counters for {damage}. Hero has {hp} HP.",
      fallen: "The hero has fallen.",
      defeated: "Defeated {enemy}. Gained {gold} gold and {exp} EXP.",
      levelUp: "Level up to LV {level}: HP +90, ATK +5, DEF +4."
    },
    outcome: {
      victory: "Victory",
      victoryTitle: "Tower Cleared",
      defeat: "Defeat",
      defeatTitle: "The Hero Fell"
    }
  }
};

let currentLanguage = normalizeLanguage(readStoredLanguage());

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(language) {
  currentLanguage = normalizeLanguage(language);
  writeStoredLanguage(currentLanguage);
  syncDocumentLanguage();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("magicTowerLanguageChange", { detail: { language: currentLanguage } }));
  }
  return currentLanguage;
}

export function toggleLanguage() {
  return setLanguage(currentLanguage === "zh" ? "en" : "zh");
}

export function syncDocumentLanguage() {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.title = t("app.fullTitle");
}

export function t(key, params = {}) {
  const template = getNested(TEXT[currentLanguage], key)
    ?? getNested(TEXT[DEFAULT_LANGUAGE], key)
    ?? key;

  if (typeof template !== "string") {
    return String(template);
  }

  return template.replace(/\{(\w+)\}/g, (_, name) => {
    const value = params[name];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function tList(key) {
  const value = getNested(TEXT[currentLanguage], key)
    ?? getNested(TEXT[DEFAULT_LANGUAGE], key);
  return Array.isArray(value) ? value : [];
}

export function difficultyText(id) {
  return {
    label: t(`difficulty.${id}.label`),
    description: t(`difficulty.${id}.description`)
  };
}

export function enemyName(id) {
  return t(`enemies.${id}`);
}

export function itemText(id) {
  return {
    name: t(`items.${id}.name`),
    description: t(`items.${id}.description`),
    pickup: t(`items.${id}.pickup`)
  };
}

export function keyName(id) {
  return t(`keys.${id}`);
}

export function doorName(id) {
  return t(`keys.${id}Door`);
}

export function tileText(id) {
  return t(`tiles.${id}`);
}

export function skillText(id) {
  return {
    name: t(`skills.${id}.name`),
    shortName: t(`skills.${id}.shortName`),
    description: t(`skills.${id}.description`)
  };
}

export function shopOptionText(option) {
  if (option.type === "skill") {
    const skill = skillText(option.skillId);
    return {
      name: t("shopOptions.skillTraining", { skill: skill.name }),
      description: skill.description
    };
  }

  return {
    name: t(`shopOptions.${option.id}.name`),
    description: t(`shopOptions.${option.id}.description`)
  };
}

export function generatedFloorName(floor) {
  const floorNumber = (floor?.id ?? 0) + 1;
  const key = floorNumber >= 1 && floorNumber <= 7
    ? `floorNames.floor${floorNumber}`
    : "floorNames.fallback";
  return t(key, { floor: floorNumber });
}

function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.has(language) ? language : DEFAULT_LANGUAGE;
}

function readStoredLanguage() {
  try {
    return typeof localStorage === "undefined" ? DEFAULT_LANGUAGE : localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function writeStoredLanguage(language) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LANGUAGE_KEY, language);
    }
  } catch {
    // Local storage can be unavailable in private contexts.
  }
}

function getNested(source, key) {
  return key.split(".").reduce((value, part) => value?.[part], source);
}
