// 地图模块保存静态规则、素材路径和五层初始关卡。
export const MAP_SIZE = 8;

export const TILE = Object.freeze({
  WALL: "#",
  FLOOR: ".",
  YELLOW_DOOR: "1",
  BLUE_DOOR: "2",
  RED_DOOR: "3",
  STAIR_UP: "S",
  STAIR_DOWN: "s",
  SHOP: "M"
});

export const ASSETS = Object.freeze({
  hero: "assets/hero.png",
  sprites: {
    hero: "assets/sprites/hero.png",
    enemies: {
      greenSlime: "assets/sprites/green_slime.png",
      redSlime: "assets/sprites/red_slime.png",
      bat: "assets/sprites/bat.png",
      skeleton: "assets/sprites/skeleton.png",
      mage: "assets/sprites/mage.png",
      guard: "assets/sprites/guard.png",
      boss1: "assets/sprites/guard.png",
      boss2: "assets/sprites/guard.png",
      boss3: "assets/sprites/guard.png",
      boss4: "assets/sprites/guard.png",
      finalBoss: "assets/sprites/boss.png"
    }
  },
  tiles: {
    [TILE.WALL]: "assets/wall.png",
    [TILE.FLOOR]: "assets/floor.png",
    [TILE.YELLOW_DOOR]: "assets/door_yellow.png",
    [TILE.BLUE_DOOR]: "assets/door_blue.png",
    [TILE.RED_DOOR]: "assets/door_red.png",
    [TILE.STAIR_UP]: "assets/stairs_up.png",
    [TILE.STAIR_DOWN]: "assets/stairs_down.png",
    [TILE.SHOP]: "assets/shop.png"
  },
  items: {
    redPotion: "assets/red_potion.png",
    bluePotion: "assets/blue_potion.png",
    ruby: "assets/ruby.png",
    emerald: "assets/emerald.png",
    yellowKey: "assets/key_yellow.png",
    blueKey: "assets/key_blue.png",
    redKey: "assets/key_red.png"
  },
  enemies: {
    greenSlime: "assets/green_slime.png",
    redSlime: "assets/red_slime.png",
    bat: "assets/bat.png",
    skeleton: "assets/skeleton.png",
    mage: "assets/mage.png",
    guard: "assets/guard.png",
    boss1: "assets/guard.png",
    boss2: "assets/guard.png",
    boss3: "assets/guard.png",
    boss4: "assets/guard.png",
    finalBoss: "assets/boss.png"
  }
});

export const DOOR_TO_KEY = Object.freeze({
  [TILE.YELLOW_DOOR]: "yellow",
  [TILE.BLUE_DOOR]: "blue",
  [TILE.RED_DOOR]: "red"
});

export const KEY_NAMES = Object.freeze({
  yellow: "黄钥匙",
  blue: "蓝钥匙",
  red: "红钥匙"
});

export const DEFAULT_DIFFICULTY = "normal";

export const DIFFICULTIES = Object.freeze({
  easy: {
    id: "easy",
    label: "简单",
    description: "怪物更弱，额外补给更多。",
    enemy: { hp: 0.86, atk: 0.86, def: 0.9, reward: 1.05 }
  },
  normal: {
    id: "normal",
    label: "普通",
    description: "标准魔塔节奏。",
    enemy: { hp: 1, atk: 1, def: 1, reward: 1 }
  },
  hard: {
    id: "hard",
    label: "困难",
    description: "怪物更强，补给更紧。",
    enemy: { hp: 1.18, atk: 1.16, def: 1.12, reward: 1 }
  }
});

export const ITEM_DEFS = Object.freeze({
  redPotion: {
    name: "红药水",
    asset: ASSETS.items.redPotion,
    description: "+120 HP",
    apply(player) {
      player.hp += 120;
      return "喝下红药水，HP +120。";
    }
  },
  bluePotion: {
    name: "蓝药水",
    asset: ASSETS.items.bluePotion,
    description: "+220 HP",
    apply(player) {
      player.hp += 220;
      return "喝下蓝药水，HP +220。";
    }
  },
  ruby: {
    name: "红宝石",
    asset: ASSETS.items.ruby,
    description: "+6 ATK",
    apply(player) {
      player.atk += 6;
      return "吸收红宝石，ATK +6。";
    }
  },
  emerald: {
    name: "绿宝石",
    asset: ASSETS.items.emerald,
    description: "+6 DEF",
    apply(player) {
      player.def += 6;
      return "吸收绿宝石，DEF +6。";
    }
  },
  yellowKey: {
    name: "黄钥匙",
    asset: ASSETS.items.yellowKey,
    description: "+1 黄钥匙",
    apply(player) {
      player.keys.yellow += 1;
      return "获得 1 把黄钥匙。";
    }
  },
  blueKey: {
    name: "蓝钥匙",
    asset: ASSETS.items.blueKey,
    description: "+1 蓝钥匙",
    apply(player) {
      player.keys.blue += 1;
      return "获得 1 把蓝钥匙。";
    }
  },
  redKey: {
    name: "红钥匙",
    asset: ASSETS.items.redKey,
    description: "+1 红钥匙",
    apply(player) {
      player.keys.red += 1;
      return "获得 1 把红钥匙。";
    }
  }
});

export const ENEMY_DEFS = Object.freeze({
  greenSlime: {
    name: "绿色史莱姆",
    asset: ASSETS.enemies.greenSlime,
    sprite: ASSETS.sprites.enemies.greenSlime,
    hp: 45,
    atk: 18,
    def: 4,
    gold: 4,
    exp: 4
  },
  redSlime: {
    name: "红色史莱姆",
    asset: ASSETS.enemies.redSlime,
    sprite: ASSETS.sprites.enemies.redSlime,
    hp: 70,
    atk: 26,
    def: 8,
    gold: 7,
    exp: 7
  },
  bat: {
    name: "暗翼蝙蝠",
    asset: ASSETS.enemies.bat,
    sprite: ASSETS.sprites.enemies.bat,
    hp: 90,
    atk: 34,
    def: 10,
    gold: 10,
    exp: 9
  },
  skeleton: {
    name: "骷髅士兵",
    asset: ASSETS.enemies.skeleton,
    sprite: ASSETS.sprites.enemies.skeleton,
    hp: 130,
    atk: 46,
    def: 16,
    gold: 16,
    exp: 15
  },
  mage: {
    name: "黑袍法师",
    asset: ASSETS.enemies.mage,
    sprite: ASSETS.sprites.enemies.mage,
    hp: 170,
    atk: 58,
    def: 22,
    gold: 22,
    exp: 20
  },
  boss1: {
    name: "一层守卫",
    asset: ASSETS.enemies.boss1,
    sprite: ASSETS.sprites.enemies.boss1,
    hp: 120,
    atk: 34,
    def: 12,
    gold: 18,
    exp: 16,
    isBoss: true
  },
  boss2: {
    name: "二层守卫",
    asset: ASSETS.enemies.boss2,
    sprite: ASSETS.sprites.enemies.boss2,
    hp: 210,
    atk: 48,
    def: 18,
    gold: 28,
    exp: 24,
    isBoss: true
  },
  boss3: {
    name: "三层守卫",
    asset: ASSETS.enemies.boss3,
    sprite: ASSETS.sprites.enemies.boss3,
    hp: 270,
    atk: 62,
    def: 26,
    gold: 40,
    exp: 34,
    isBoss: true
  },
  boss4: {
    name: "四层守卫",
    asset: ASSETS.enemies.boss4,
    sprite: ASSETS.sprites.enemies.boss4,
    hp: 350,
    atk: 78,
    def: 35,
    gold: 60,
    exp: 50,
    isBoss: true
  },
  finalBoss: {
    name: "魔塔领主",
    asset: ASSETS.enemies.finalBoss,
    sprite: ASSETS.sprites.enemies.finalBoss,
    hp: 460,
    atk: 95,
    def: 44,
    gold: 120,
    exp: 100,
    isBoss: true,
    isFinalBoss: true
  }
});

const itemDifficultyChanges = Object.freeze({
  easy: {
    add: [
      { floorId: 0, key: "6,7", id: "redPotion" },
      { floorId: 1, key: "6,7", id: "yellowKey" },
      { floorId: 2, key: "6,7", id: "bluePotion" },
      { floorId: 3, key: "6,7", id: "emerald" }
    ],
    remove: []
  },
  normal: {
    add: [],
    remove: []
  },
  hard: {
    add: [],
    remove: [
      { floorId: 0, key: "1,4" },
      { floorId: 1, key: "1,7" },
      { floorId: 2, key: "1,7" },
      { floorId: 3, key: "1,7" },
      { floorId: 4, key: "1,7" }
    ]
  }
});

// 每层 8x8，实体用 "x,y" 保存，方便拾取和战斗后删除。
const floorTemplates = [
  {
    id: 0,
    name: "第 1 层 石厅",
    start: { x: 0, y: 7 },
    upPosition: null,
    downPosition: { x: 6, y: 0 },
    layout: [
      "##....s#",
      "#..##..#",
      "#.1...1#",
      "#.##M#.#",
      "#......#",
      "#.##.#.#",
      "#......#",
      "........"
    ],
    entities: {
      "1,6": { type: "enemy", id: "greenSlime" },
      "2,6": { type: "item", id: "yellowKey" },
      "3,7": { type: "item", id: "redPotion" },
      "4,6": { type: "enemy", id: "greenSlime" },
      "5,6": { type: "item", id: "ruby" },
      "1,4": { type: "item", id: "bluePotion" },
      "2,4": { type: "enemy", id: "redSlime" },
      "5,4": { type: "item", id: "emerald" },
      "2,1": { type: "item", id: "yellowKey" },
      "5,1": { type: "enemy", id: "bat" },
      "6,0": { type: "enemy", id: "boss1" }
    }
  },
  {
    id: 1,
    name: "第 2 层 回廊",
    start: { x: 0, y: 7 },
    upPosition: { x: 0, y: 7 },
    downPosition: { x: 7, y: 0 },
    layout: [
      "##...#.s",
      "#..#.#.#",
      "#..#..2#",
      "#.2#M#.#",
      "#......#",
      "###.#..#",
      "#......#",
      "S......#"
    ],
    entities: {
      "1,7": { type: "item", id: "redPotion" },
      "2,6": { type: "item", id: "blueKey" },
      "3,6": { type: "enemy", id: "redSlime" },
      "5,7": { type: "enemy", id: "bat" },
      "6,6": { type: "item", id: "ruby" },
      "1,4": { type: "item", id: "bluePotion" },
      "3,4": { type: "enemy", id: "bat" },
      "5,4": { type: "item", id: "emerald" },
      "1,2": { type: "enemy", id: "skeleton" },
      "4,0": { type: "item", id: "yellowKey" },
      "7,0": { type: "enemy", id: "boss2" }
    }
  },
  {
    id: 2,
    name: "第 3 层 图书厅",
    start: { x: 0, y: 7 },
    upPosition: { x: 0, y: 7 },
    downPosition: { x: 6, y: 0 },
    layout: [
      "##..#.s#",
      "#..#...#",
      "#..3##.#",
      "#.##M..#",
      "#......#",
      "#.###..#",
      "#......#",
      "S......#"
    ],
    entities: {
      "1,7": { type: "item", id: "redPotion" },
      "2,6": { type: "enemy", id: "skeleton" },
      "3,6": { type: "item", id: "redKey" },
      "5,7": { type: "enemy", id: "mage" },
      "6,6": { type: "item", id: "ruby" },
      "1,4": { type: "item", id: "bluePotion" },
      "3,4": { type: "enemy", id: "bat" },
      "5,4": { type: "item", id: "emerald" },
      "1,2": { type: "enemy", id: "mage" },
      "5,1": { type: "item", id: "blueKey" },
      "6,0": { type: "enemy", id: "boss3" }
    }
  },
  {
    id: 3,
    name: "第 4 层 暗炉",
    start: { x: 0, y: 7 },
    upPosition: { x: 0, y: 7 },
    downPosition: { x: 7, y: 0 },
    layout: [
      "##...#.s",
      "#..#...#",
      "#.1#2#.#",
      "#..#M..#",
      "#......#",
      "#.###..#",
      "#......#",
      "S......#"
    ],
    entities: {
      "1,7": { type: "item", id: "bluePotion" },
      "2,6": { type: "enemy", id: "mage" },
      "3,6": { type: "item", id: "yellowKey" },
      "5,7": { type: "enemy", id: "skeleton" },
      "6,6": { type: "item", id: "ruby" },
      "1,4": { type: "item", id: "redPotion" },
      "3,4": { type: "enemy", id: "skeleton" },
      "5,4": { type: "item", id: "emerald" },
      "1,1": { type: "item", id: "blueKey" },
      "6,1": { type: "enemy", id: "mage" },
      "7,0": { type: "enemy", id: "boss4" }
    }
  },
  {
    id: 4,
    name: "第 5 层 王座",
    start: { x: 0, y: 7 },
    upPosition: { x: 0, y: 7 },
    downPosition: null,
    layout: [
      "##..#..#",
      "#..#...#",
      "#.3#2#.#",
      "#..#M..#",
      "#......#",
      "#.###..#",
      "#......#",
      "S......#"
    ],
    entities: {
      "1,7": { type: "item", id: "bluePotion" },
      "2,6": { type: "enemy", id: "skeleton" },
      "3,6": { type: "item", id: "redKey" },
      "5,7": { type: "enemy", id: "mage" },
      "6,6": { type: "item", id: "ruby" },
      "1,4": { type: "item", id: "redPotion" },
      "3,4": { type: "enemy", id: "mage" },
      "5,4": { type: "item", id: "emerald" },
      "1,1": { type: "item", id: "yellowKey" },
      "6,1": { type: "enemy", id: "skeleton" },
      "6,0": { type: "enemy", id: "finalBoss" }
    }
  }
];

export function createInitialFloors(difficultyId = DEFAULT_DIFFICULTY) {
  const difficulty = normalizeDifficulty(difficultyId);
  return floorTemplates.map((floor) => applyDifficultyItems({
    ...floor,
    layout: floor.layout.map((row) => row.split("")),
    entities: cloneData(floor.entities),
    bossDefeated: false
  }, difficulty));
}

export function createInitialPlayer(difficultyId = DEFAULT_DIFFICULTY) {
  const difficulty = normalizeDifficulty(difficultyId);
  return {
    x: floorTemplates[0].start.x,
    y: floorTemplates[0].start.y,
    floor: 0,
    difficulty,
    hp: 520,
    atk: 42,
    def: 18,
    gold: 0,
    exp: 0,
    lvl: 1,
    keys: {
      yellow: 0,
      blue: 0,
      red: 0
    }
  };
}

export function normalizeDifficulty(difficultyId) {
  return DIFFICULTIES[difficultyId]?.id ?? DEFAULT_DIFFICULTY;
}

export function getDifficulty(difficultyId = DEFAULT_DIFFICULTY) {
  return DIFFICULTIES[normalizeDifficulty(difficultyId)];
}

export function getEnemyDef(enemyId, difficultyId = DEFAULT_DIFFICULTY) {
  const enemy = ENEMY_DEFS[enemyId];
  if (!enemy) {
    throw new Error(`Unknown enemy: ${enemyId}`);
  }

  const difficulty = getDifficulty(difficultyId);
  return {
    ...enemy,
    hp: scaleStat(enemy.hp, difficulty.enemy.hp),
    atk: scaleStat(enemy.atk, difficulty.enemy.atk),
    def: scaleStat(enemy.def, difficulty.enemy.def),
    gold: scaleStat(enemy.gold, difficulty.enemy.reward),
    exp: scaleStat(enemy.exp, difficulty.enemy.reward)
  };
}

export function coordKey(x, y) {
  return `${x},${y}`;
}

export function isInsideMap(x, y) {
  return x >= 0 && x < MAP_SIZE && y >= 0 && y < MAP_SIZE;
}

export function getTile(floor, x, y) {
  return floor.layout[y]?.[x] ?? TILE.WALL;
}

export function setTile(floor, x, y, tile) {
  floor.layout[y][x] = tile;
}

export function getEntity(floor, x, y) {
  return floor.entities[coordKey(x, y)] ?? null;
}

export function removeEntity(floor, x, y) {
  delete floor.entities[coordKey(x, y)];
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function applyDifficultyItems(floor, difficultyId) {
  const changes = itemDifficultyChanges[difficultyId] ?? itemDifficultyChanges[DEFAULT_DIFFICULTY];

  changes.remove.forEach(({ floorId, key }) => {
    if (floor.id === floorId && floor.entities[key]?.type === "item") {
      delete floor.entities[key];
    }
  });

  changes.add.forEach(({ floorId, key, id }) => {
    if (floor.id !== floorId || floor.entities[key]) {
      return;
    }

    const [x, y] = key.split(",").map(Number);
    if (getTile(floor, x, y) !== TILE.FLOOR || !ITEM_DEFS[id]) {
      return;
    }

    floor.entities[key] = { type: "item", id };
  });

  return floor;
}

function scaleStat(value, multiplier) {
  return Math.max(1, Math.round(value * multiplier));
}
