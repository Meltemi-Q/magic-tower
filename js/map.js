// 地图模块保存所有静态规则、素材路径和五层初始关卡。
export const MAP_SIZE = 4;

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
    boss1: "assets/boss.png",
    boss2: "assets/boss.png",
    boss3: "assets/boss.png",
    boss4: "assets/boss.png",
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
    hp: 45,
    atk: 18,
    def: 4,
    gold: 4,
    exp: 4
  },
  redSlime: {
    name: "红色史莱姆",
    asset: ASSETS.enemies.redSlime,
    hp: 70,
    atk: 26,
    def: 8,
    gold: 7,
    exp: 7
  },
  bat: {
    name: "蝙蝠",
    asset: ASSETS.enemies.bat,
    hp: 90,
    atk: 34,
    def: 10,
    gold: 10,
    exp: 9
  },
  skeleton: {
    name: "骷髅士兵",
    asset: ASSETS.enemies.skeleton,
    hp: 130,
    atk: 46,
    def: 16,
    gold: 16,
    exp: 15
  },
  mage: {
    name: "黑袍法师",
    asset: ASSETS.enemies.mage,
    hp: 170,
    atk: 58,
    def: 22,
    gold: 22,
    exp: 20
  },
  boss1: {
    name: "一层守卫",
    asset: ASSETS.enemies.boss1,
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
    hp: 460,
    atk: 95,
    def: 44,
    gold: 120,
    exp: 100,
    isBoss: true,
    isFinalBoss: true
  }
});

// 每层只有 4x4，实体用 "x,y" 保存，方便捡取和击杀后删除。
const floorTemplates = [
  {
    id: 0,
    name: "第 1 层 石厅",
    start: { x: 0, y: 3 },
    upPosition: null,
    downPosition: { x: 2, y: 0 },
    layout: [
      "#.s.",
      ".1.#",
      ".M..",
      "...."
    ],
    entities: {
      "0,1": { type: "item", id: "bluePotion" },
      "0,2": { type: "item", id: "redPotion" },
      "1,3": { type: "item", id: "yellowKey" },
      "2,3": { type: "enemy", id: "greenSlime" },
      "2,2": { type: "item", id: "ruby" },
      "3,3": { type: "item", id: "emerald" },
      "2,0": { type: "enemy", id: "boss1" }
    }
  },
  {
    id: 1,
    name: "第 2 层 回廊",
    start: { x: 0, y: 3 },
    upPosition: { x: 0, y: 3 },
    downPosition: { x: 2, y: 0 },
    layout: [
      "#.s.",
      "..2#",
      ".M..",
      "S..."
    ],
    entities: {
      "0,2": { type: "item", id: "redPotion" },
      "1,1": { type: "enemy", id: "bat" },
      "1,3": { type: "item", id: "blueKey" },
      "2,3": { type: "enemy", id: "redSlime" },
      "2,2": { type: "item", id: "ruby" },
      "3,2": { type: "item", id: "emerald" },
      "2,0": { type: "enemy", id: "boss2" }
    }
  },
  {
    id: 2,
    name: "第 3 层 图书厅",
    start: { x: 0, y: 3 },
    upPosition: { x: 0, y: 3 },
    downPosition: { x: 3, y: 0 },
    layout: [
      "#..s",
      "..3#",
      ".M..",
      "S..."
    ],
    entities: {
      "0,2": { type: "item", id: "bluePotion" },
      "1,1": { type: "enemy", id: "mage" },
      "1,3": { type: "item", id: "redKey" },
      "2,3": { type: "enemy", id: "skeleton" },
      "2,2": { type: "item", id: "ruby" },
      "3,2": { type: "item", id: "emerald" },
      "3,0": { type: "enemy", id: "boss3" }
    }
  },
  {
    id: 3,
    name: "第 4 层 暗井",
    start: { x: 0, y: 3 },
    upPosition: { x: 0, y: 3 },
    downPosition: { x: 2, y: 0 },
    layout: [
      "#.s.",
      "..1#",
      ".M..",
      "S..."
    ],
    entities: {
      "0,2": { type: "item", id: "redPotion" },
      "1,1": { type: "enemy", id: "skeleton" },
      "1,3": { type: "item", id: "yellowKey" },
      "2,3": { type: "enemy", id: "mage" },
      "2,2": { type: "item", id: "ruby" },
      "3,2": { type: "item", id: "emerald" },
      "2,0": { type: "enemy", id: "boss4" }
    }
  },
  {
    id: 4,
    name: "第 5 层 王座",
    start: { x: 0, y: 3 },
    upPosition: { x: 0, y: 3 },
    downPosition: null,
    layout: [
      "#..#",
      "..3#",
      ".M..",
      "S..."
    ],
    entities: {
      "0,2": { type: "item", id: "redPotion" },
      "1,1": { type: "enemy", id: "skeleton" },
      "1,3": { type: "item", id: "redKey" },
      "2,3": { type: "enemy", id: "mage" },
      "2,2": { type: "item", id: "ruby" },
      "3,2": { type: "item", id: "emerald" },
      "2,0": { type: "enemy", id: "finalBoss" }
    }
  }
];

export function createInitialFloors() {
  return floorTemplates.map((floor) => ({
    ...floor,
    layout: floor.layout.map((row) => row.split("")),
    entities: cloneData(floor.entities),
    bossDefeated: false
  }));
}

export function createInitialPlayer() {
  return {
    x: floorTemplates[0].start.x,
    y: floorTemplates[0].start.y,
    floor: 0,
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
