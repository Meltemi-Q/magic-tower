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
  SHOP: "M",
  CURSE: "C"
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
      finalBoss: "assets/sprites/boss.png",
      eliteSkeleton: "assets/sprites/elite_skeleton.svg",
      eliteMage: "assets/sprites/elite_mage.svg",
      darkBat: "assets/sprites/dark_bat.svg"
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
    [TILE.SHOP]: "assets/shop.png",
    [TILE.CURSE]: "assets/floor.png"
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
    finalBoss: "assets/boss.png",
    eliteSkeleton: "assets/sprites/elite_skeleton.svg",
    eliteMage: "assets/sprites/elite_mage.svg",
    darkBat: "assets/sprites/dark_bat.svg"
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
    enemy: { hp: 1.18, atk: 1.16, def: 1.12, reward: 1 },
    floorCount: 7
  },
  nightmare: {
    id: "nightmare",
    label: "Nightmare",
    description: "7 floors, stronger enemies, fog of war, and curse tiles.",
    enemy: { hp: 1.35, atk: 1.35, def: 1.35, reward: 1 },
    floorCount: 7,
    shopCostMultiplier: 1.5,
    fogRadius: 2,
    curseTiles: true
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
  darkBat: {
    name: "Dark Bat",
    asset: ASSETS.enemies.darkBat,
    sprite: ASSETS.sprites.enemies.darkBat,
    hp: 140,
    atk: 50,
    def: 18,
    gold: 18,
    exp: 16,
    isElite: true
  },
  eliteSkeleton: {
    name: "Elite Skeleton",
    asset: ASSETS.enemies.eliteSkeleton,
    sprite: ASSETS.sprites.enemies.eliteSkeleton,
    hp: 200,
    atk: 60,
    def: 24,
    gold: 30,
    exp: 28,
    isElite: true
  },
  eliteMage: {
    name: "Elite Mage",
    asset: ASSETS.enemies.eliteMage,
    sprite: ASSETS.sprites.enemies.eliteMage,
    hp: 260,
    atk: 75,
    def: 30,
    gold: 42,
    exp: 38,
    isElite: true
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

export function createInitialFloors(difficultyId = DEFAULT_DIFFICULTY, seed = createGameSeed()) {
  return generateRandomFloors(seed, difficultyId);
}

export function createInitialPlayer(difficultyId = DEFAULT_DIFFICULTY) {
  const difficulty = normalizeDifficulty(difficultyId);
  return {
    x: floorTemplates[0].start.x,
    y: floorTemplates[0].start.y,
    floor: 0,
    difficulty,
    maxHp: 520,
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

export function createGameSeed() {
  return String(Math.floor(Math.random() * 0xffffffff)).padStart(10, "0");
}

export function createSeededRandom(seed) {
  let s = hashSeed(seed);
  return function random() {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function generateRandomFloors(seed = createGameSeed(), difficultyId = DEFAULT_DIFFICULTY) {
  const difficulty = normalizeDifficulty(difficultyId);
  const difficultyMeta = getDifficulty(difficulty);
  const rng = createSeededRandom(seed);
  const floorCount = difficultyMeta.floorCount ?? 5;
  const floors = [];

  for (let i = 0; i < floorCount; i += 1) {
    let floor = null;
    let attempts = 0;
    do {
      floor = generateSingleFloor(rng, i, floorCount, difficulty);
      attempts += 1;
    } while (!validateFloor(floor) && attempts < 50);

    floors.push(floor);
  }

  rebalanceGeneratedFloors(floors, difficulty);
  return floors;
}

function hashSeed(seed) {
  const text = String(seed ?? "");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash || 1;
}

function generateSingleFloor(rng, floorIndex, floorCount, difficulty) {
  const start = { x: 0, y: 7 };
  const downPosition = floorIndex < floorCount - 1
    ? { x: rng() < 0.5 ? 6 : 7, y: 0 }
    : null;
  const bossPosition = downPosition ?? { x: rng() < 0.5 ? 6 : 7, y: 0 };
  const layout = Array.from({ length: MAP_SIZE }, () => Array.from({ length: MAP_SIZE }, () => TILE.FLOOR));
  const path = createMainPath(rng, start, bossPosition);
  const protectedKeys = new Set(path.map((pos) => coordKey(pos.x, pos.y)));
  const shopPosition = chooseShopPosition(rng, protectedKeys);
  protectedKeys.add(coordKey(start.x, start.y));
  protectedKeys.add(coordKey(bossPosition.x, bossPosition.y));
  protectedKeys.add(coordKey(shopPosition.x, shopPosition.y));

  for (let y = 0; y < MAP_SIZE; y += 1) {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      const key = coordKey(x, y);
      const edgePenalty = x === 0 || y === 0 || x === MAP_SIZE - 1 || y === MAP_SIZE - 1 ? -0.04 : 0;
      const wallChance = 0.19 + floorIndex * 0.012 + edgePenalty;
      if (!protectedKeys.has(key) && rng() < wallChance) {
        layout[y][x] = TILE.WALL;
      }
    }
  }

  if (floorIndex > 0) {
    layout[start.y][start.x] = TILE.STAIR_UP;
  }
  if (downPosition) {
    layout[downPosition.y][downPosition.x] = TILE.STAIR_DOWN;
  }
  layout[shopPosition.y][shopPosition.x] = TILE.SHOP;

  const entities = {};
  const doorCounts = placeRandomDoors(rng, layout, protectedKeys, floorIndex, difficulty);
  placeCurseTiles(rng, layout, protectedKeys, floorIndex, difficulty);
  const available = collectAvailableEntityCells(layout, protectedKeys);
  placeGeneratedItems(rng, available, entities, floorIndex, difficulty, doorCounts);
  placeGeneratedEnemies(rng, available, entities, floorIndex, floorCount, difficulty);
  entities[coordKey(bossPosition.x, bossPosition.y)] = {
    type: "enemy",
    id: getBossForFloor(floorIndex, floorCount)
  };

  return {
    id: floorIndex,
    name: getGeneratedFloorName(floorIndex),
    start,
    upPosition: floorIndex > 0 ? start : null,
    downPosition,
    layout,
    entities,
    bossDefeated: false,
    generated: true
  };
}

function createMainPath(rng, start, target) {
  const path = [{ ...start }];
  const current = { ...start };

  while (current.x !== target.x || current.y !== target.y) {
    const options = [];
    if (current.x < target.x) options.push({ x: 1, y: 0 });
    if (current.x > target.x) options.push({ x: -1, y: 0 });
    if (current.y < target.y) options.push({ x: 0, y: 1 });
    if (current.y > target.y) options.push({ x: 0, y: -1 });
    const step = options[Math.floor(rng() * options.length)];
    current.x += step.x;
    current.y += step.y;
    path.push({ ...current });
  }

  return path;
}

function chooseShopPosition(rng, protectedKeys) {
  const candidates = [
    { x: 3, y: 3 },
    { x: 4, y: 3 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
    { x: 5, y: 3 },
    { x: 2, y: 4 }
  ].filter((pos) => !protectedKeys.has(coordKey(pos.x, pos.y)));

  return candidates[Math.floor(rng() * candidates.length)] ?? { x: 3, y: 3 };
}

function placeRandomDoors(rng, layout, protectedKeys, floorIndex, difficulty) {
  const doorCounts = { yellow: 0, blue: 0, red: 0 };
  const doorPlan = ["yellow"];
  if (floorIndex >= 1) doorPlan.push("yellow");
  if (floorIndex >= 2 || difficulty === "hard" || difficulty === "nightmare") doorPlan.push("blue");
  if (floorIndex >= 4) doorPlan.push("red");

  doorPlan.forEach((doorType) => {
    const pos = pickFloorCell(rng, layout, protectedKeys);
    if (!pos) return;
    const tile = doorType === "yellow" ? TILE.YELLOW_DOOR : doorType === "blue" ? TILE.BLUE_DOOR : TILE.RED_DOOR;
    layout[pos.y][pos.x] = tile;
    protectedKeys.add(coordKey(pos.x, pos.y));
    doorCounts[doorType] += 1;
  });

  return doorCounts;
}

function placeCurseTiles(rng, layout, protectedKeys, floorIndex, difficulty) {
  if (!getDifficulty(difficulty).curseTiles) {
    return;
  }

  const curseCount = Math.min(5, 2 + Math.floor(floorIndex / 2));
  for (let i = 0; i < curseCount; i += 1) {
    const pos = pickFloorCell(rng, layout, protectedKeys);
    if (!pos) {
      return;
    }
    layout[pos.y][pos.x] = TILE.CURSE;
    protectedKeys.add(coordKey(pos.x, pos.y));
  }
}

function collectAvailableEntityCells(layout, protectedKeys) {
  const cells = [];
  for (let y = 0; y < MAP_SIZE; y += 1) {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      const tile = layout[y][x];
      const key = coordKey(x, y);
      if (tile === TILE.FLOOR && !protectedKeys.has(key)) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}

function placeGeneratedItems(rng, available, entities, floorIndex, difficulty, doorCounts) {
  const items = [
    "redPotion",
    "bluePotion",
    "ruby",
    "emerald",
    ...Array.from({ length: doorCounts.yellow + 1 }, () => "yellowKey"),
    ...Array.from({ length: doorCounts.blue + (floorIndex >= 1 ? 1 : 0) }, () => "blueKey"),
    ...Array.from({ length: doorCounts.red + (floorIndex >= 3 ? 1 : 0) }, () => "redKey")
  ];

  if (difficulty === "easy") {
    items.push("redPotion", floorIndex % 2 === 0 ? "ruby" : "emerald");
  }
  if ((difficulty === "hard" || difficulty === "nightmare") && floorIndex % 2 === 1) {
    items.splice(items.indexOf("bluePotion"), 1);
  }

  shuffle(rng, items).forEach((id) => placeEntity(rng, available, entities, { type: "item", id }));
}

function placeGeneratedEnemies(rng, available, entities, floorIndex, floorCount, difficulty) {
  const pool = getEnemyPool(floorIndex, floorCount, difficulty);
  const baseCount = difficulty === "easy" ? 3 + Math.min(2, floorIndex) : 4 + Math.min(3, floorIndex);
  const count = difficulty === "nightmare" ? baseCount + 1 : baseCount;
  for (let i = 0; i < count; i += 1) {
    const id = pool[Math.floor(rng() * pool.length)];
    placeEntity(rng, available, entities, { type: "enemy", id });
  }
}

function getEnemyPool(floorIndex, floorCount, difficulty) {
  const pools = [
    ["greenSlime", "redSlime"],
    ["greenSlime", "redSlime", "bat"],
    ["redSlime", "bat", "skeleton"],
    ["bat", "skeleton", "mage"],
    ["skeleton", "mage"]
  ];
  const pool = [...(pools[Math.min(floorIndex, pools.length - 1)] ?? pools[pools.length - 1])];
  if ((difficulty === "hard" || difficulty === "nightmare") && floorIndex >= floorCount - 3) {
    pool.push("darkBat", "eliteSkeleton", "eliteMage");
  }
  return pool;
}

function getBossForFloor(floorIndex, floorCount) {
  if (floorIndex === floorCount - 1) {
    return "finalBoss";
  }
  return `boss${Math.min(4, floorIndex + 1)}`;
}

const GENERATED_FLOOR_THEMES = Object.freeze([
  "Entrance Hall",
  "Mist Corridor",
  "Shadow Abyss",
  "Lava Inferno",
  "Frozen Throne",
  "Void Realm",
  "Demon Lair"
]);

function getGeneratedFloorName(floorIndex) {
  const floorNumber = floorIndex + 1;
  const theme = GENERATED_FLOOR_THEMES[floorIndex] ?? "Lost Depths";
  return `Floor ${floorNumber}: ${theme}`;
}

function pickFloorCell(rng, layout, protectedKeys) {
  const cells = collectAvailableEntityCells(layout, protectedKeys);
  return cells[Math.floor(rng() * cells.length)] ?? null;
}

function placeEntity(rng, available, entities, entity) {
  if (available.length === 0) {
    return false;
  }
  const index = Math.floor(rng() * available.length);
  const [pos] = available.splice(index, 1);
  entities[coordKey(pos.x, pos.y)] = entity;
  return true;
}

function validateFloor(floor) {
  const start = floor.upPosition ?? floor.start;
  const reachable = floodFill(floor.layout, start);
  const doorCounts = { yellow: 0, blue: 0, red: 0 };
  const keyCounts = { yellow: 0, blue: 0, red: 0 };

  for (let y = 0; y < MAP_SIZE; y += 1) {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      const tile = floor.layout[y][x];
      if (tile === TILE.YELLOW_DOOR) doorCounts.yellow += 1;
      if (tile === TILE.BLUE_DOOR) doorCounts.blue += 1;
      if (tile === TILE.RED_DOOR) doorCounts.red += 1;
    }
  }

  const allEntitiesReachable = Object.entries(floor.entities).every(([key, entity]) => {
    if (!reachable.has(key)) {
      return false;
    }
    if (entity.type === "item" && entity.id.endsWith("Key")) {
      const keyType = entity.id.replace("Key", "");
      keyCounts[keyType] += 1;
    }
    return true;
  });

  const bossKey = floor.downPosition
    ? coordKey(floor.downPosition.x, floor.downPosition.y)
    : Object.entries(floor.entities).find(([, entity]) => entity.id === "finalBoss")?.[0];

  return allEntitiesReachable
    && Boolean(bossKey && reachable.has(bossKey))
    && keyCounts.yellow >= doorCounts.yellow
    && keyCounts.blue >= doorCounts.blue
    && keyCounts.red >= doorCounts.red;
}

function floodFill(layout, start) {
  const seen = new Set();
  const queue = [{ ...start }];

  while (queue.length > 0) {
    const pos = queue.shift();
    const key = coordKey(pos.x, pos.y);
    if (seen.has(key) || !isInsideMap(pos.x, pos.y) || layout[pos.y][pos.x] === TILE.WALL) {
      continue;
    }
    seen.add(key);
    Object.values([
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ]).forEach((delta) => queue.push({ x: pos.x + delta.x, y: pos.y + delta.y }));
  }

  return seen;
}

function rebalanceGeneratedFloors(floors, difficulty) {
  let guard = 0;
  while (!validateFloorBalance(floors, difficulty) && guard < 14) {
    const floor = floors[Math.min(floors.length - 1, Math.floor(guard / 3))];
    const id = ["ruby", "emerald", "bluePotion", "redPotion"][guard % 4];
    addBalanceItem(floor, id);
    guard += 1;
  }
}

function validateFloorBalance(floors, difficulty) {
  const sim = { hp: 520, atk: 42, def: 18 };

  for (const floor of floors) {
    const entries = Object.values(floor.entities);
    entries.filter((entity) => entity.type === "item").forEach((entity) => applyBalanceItem(sim, entity.id));
    const enemies = entries
      .filter((entity) => entity.type === "enemy")
      .sort((a, b) => Number(Boolean(ENEMY_DEFS[a.id].isBoss)) - Number(Boolean(ENEMY_DEFS[b.id].isBoss)));

    for (const entity of enemies) {
      const enemy = getEnemyDef(entity.id, difficulty);
      const damage = Math.max(1, sim.atk - enemy.def);
      const turns = Math.ceil(enemy.hp / damage);
      const loss = Math.max(0, turns - 1) * Math.max(1, enemy.atk - sim.def);
      if (sim.hp <= loss) {
        return false;
      }
      sim.hp -= loss;
    }
  }

  return true;
}

function applyBalanceItem(sim, id) {
  const effects = {
    redPotion: () => { sim.hp += 120; },
    bluePotion: () => { sim.hp += 220; },
    ruby: () => { sim.atk += 6; },
    emerald: () => { sim.def += 6; }
  };
  effects[id]?.();
}

function addBalanceItem(floor, id) {
  const protectedKeys = new Set(Object.keys(floor.entities));
  if (floor.upPosition) protectedKeys.add(coordKey(floor.upPosition.x, floor.upPosition.y));
  if (floor.downPosition) protectedKeys.add(coordKey(floor.downPosition.x, floor.downPosition.y));
  const reachable = floodFill(floor.layout, floor.upPosition ?? floor.start);
  const available = collectAvailableEntityCells(floor.layout, protectedKeys)
    .filter((pos) => reachable.has(coordKey(pos.x, pos.y)));
  const pos = available[0];
  if (pos) {
    floor.entities[coordKey(pos.x, pos.y)] = { type: "item", id };
  }
}

function shuffle(rng, values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
