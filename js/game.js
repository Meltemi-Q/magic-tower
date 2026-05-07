import {
  ASSETS,
  DOOR_TO_KEY,
  ENEMY_DEFS,
  ITEM_DEFS,
  KEY_NAMES,
  MAP_SIZE,
  TILE,
  createInitialFloors,
  createInitialPlayer,
  getEntity,
  getTile,
  isInsideMap,
  removeEntity,
  setTile
} from "./map.js";
import { previewBattle, runBattle } from "./battle.js";
import { SHOP_OPTIONS, buyShopOption, createShopState, getShopCost } from "./shop.js";

const SAVE_PREFIX = "magicTowerSaveSlot";
const SAVE_SLOT_COUNT = 3;
const QUICK_SLOT = 1;
const DIRECTIONS = Object.freeze({
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
});

const els = {
  mapGrid: document.querySelector("#mapGrid"),
  floorName: document.querySelector("#floorName"),
  heroLevel: document.querySelector("#heroLevel"),
  statHp: document.querySelector("#statHp"),
  statAtk: document.querySelector("#statAtk"),
  statDef: document.querySelector("#statDef"),
  statGold: document.querySelector("#statGold"),
  statExp: document.querySelector("#statExp"),
  statFloor: document.querySelector("#statFloor"),
  keyYellow: document.querySelector("#keyYellow"),
  keyBlue: document.querySelector("#keyBlue"),
  keyRed: document.querySelector("#keyRed"),
  targetInfo: document.querySelector("#targetInfo"),
  battleLog: document.querySelector("#battleLog"),
  saveSlots: document.querySelector("#saveSlots"),
  shopDialog: document.querySelector("#shopDialog"),
  shopItems: document.querySelector("#shopItems"),
  shopHint: document.querySelector("#shopHint"),
  shopBtn: document.querySelector("#shopBtn"),
  manualSaveBtn: document.querySelector("#manualSaveBtn"),
  quickLoadBtn: document.querySelector("#quickLoadBtn"),
  newGameBtn: document.querySelector("#newGameBtn"),
  helpBtn: document.querySelector("#helpBtn"),
  helpDialog: document.querySelector("#helpDialog")
};

const state = {
  player: null,
  floors: [],
  shop: createShopState(),
  logs: [],
  gameOver: false,
  won: false
};

init();

function init() {
  bindEvents();
  startNewGame(false);
  addLog("欢迎来到魔塔。击败每层守卫后继续向上。", "good");
  renderAll();
}

function startNewGame(confirmFirst = true) {
  if (confirmFirst && !window.confirm("确定开始新游戏？当前未保存进度会丢失。")) {
    return;
  }

  state.player = createInitialPlayer();
  state.floors = createInitialFloors();
  state.shop = createShopState();
  state.logs = [];
  state.gameOver = false;
  state.won = false;
  addLog("新游戏开始。", "good");
  renderAll();
}

function bindEvents() {
  window.addEventListener("keydown", (event) => {
    const keyMap = {
      ArrowUp: "up",
      w: "up",
      W: "up",
      ArrowDown: "down",
      s: "down",
      S: "down",
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right"
    };

    const direction = keyMap[event.key];
    if (direction) {
      event.preventDefault();
      movePlayer(direction);
    }
  });

  document.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => movePlayer(button.dataset.move));
  });

  els.mapGrid.addEventListener("click", (event) => {
    const tile = event.target.closest(".tile");
    if (!tile || !state.player) {
      return;
    }

    const x = Number(tile.dataset.x);
    const y = Number(tile.dataset.y);
    const dx = x - state.player.x;
    const dy = y - state.player.y;

    if (Math.abs(dx) + Math.abs(dy) === 1) {
      const direction = Object.entries(DIRECTIONS).find(([, delta]) => delta.x === dx && delta.y === dy)?.[0];
      if (direction) {
        movePlayer(direction);
      }
      return;
    }

    renderTargetInfo(x, y);
  });

  els.shopBtn.addEventListener("click", () => openShop());
  els.manualSaveBtn.addEventListener("click", () => saveGame(QUICK_SLOT));
  els.quickLoadBtn.addEventListener("click", () => loadGame(QUICK_SLOT));
  els.newGameBtn.addEventListener("click", () => startNewGame(true));
  els.helpBtn.addEventListener("click", () => els.helpDialog.showModal());
}

function movePlayer(direction) {
  if (state.gameOver || state.won) {
    addLog(state.won ? "魔塔已经通关，可以开始新游戏。" : "勇者已经倒下，请读取存档或重新开始。", "warn");
    return;
  }

  const delta = DIRECTIONS[direction];
  const targetX = state.player.x + delta.x;
  const targetY = state.player.y + delta.y;

  if (!isInsideMap(targetX, targetY)) {
    return;
  }

  const floor = getCurrentFloor();
  const tile = getTile(floor, targetX, targetY);
  const entity = getEntity(floor, targetX, targetY);

  if (tile === TILE.WALL) {
    addLog("前方是墙。", "warn");
    return;
  }

  if (DOOR_TO_KEY[tile] && !tryOpenDoor(floor, targetX, targetY, tile)) {
    return;
  }

  if (entity && !handleEntity(floor, targetX, targetY, entity)) {
    return;
  }

  const currentTile = getTile(floor, targetX, targetY);
  if (currentTile === TILE.STAIR_DOWN) {
    state.player.x = targetX;
    state.player.y = targetY;
    useStairs("down");
    return;
  }

  if (currentTile === TILE.STAIR_UP) {
    state.player.x = targetX;
    state.player.y = targetY;
    useStairs("up");
    return;
  }

  if (currentTile === TILE.SHOP) {
    state.player.x = targetX;
    state.player.y = targetY;
    addLog("进入商店。", "good");
    renderAll();
    openShop();
    return;
  }

  state.player.x = targetX;
  state.player.y = targetY;
  renderAll();
}

function tryOpenDoor(floor, x, y, tile) {
  const keyType = DOOR_TO_KEY[tile];
  if (state.player.keys[keyType] <= 0) {
    addLog(`需要${KEY_NAMES[keyType]}。`, "warn");
    renderTargetInfo(x, y);
    return false;
  }

  state.player.keys[keyType] -= 1;
  setTile(floor, x, y, TILE.FLOOR);
  addLog(`打开${KEY_NAMES[keyType]}门。`, "good");
  return true;
}

function handleEntity(floor, x, y, entity) {
  if (entity.type === "item") {
    const item = ITEM_DEFS[entity.id];
    const message = item.apply(state.player);
    removeEntity(floor, x, y);
    addLog(message, "good");
    return true;
  }

  if (entity.type === "enemy") {
    const preview = previewBattle(state.player, entity.id);
    if (!preview.canWin) {
      addLog(`无法击败 ${preview.enemy.name}，预计损失 ${preview.expectedLoss} HP。`, "bad");
      renderTargetInfo(x, y);
      return false;
    }

    const result = runBattle(state.player, entity.id);
    result.logs.forEach((line, index) => addLog(line, index === result.logs.length - 1 ? "good" : ""));

    if (!result.victory) {
      state.gameOver = true;
      renderAll();
      return false;
    }

    removeEntity(floor, x, y);

    if (result.enemy.isBoss) {
      floor.bossDefeated = true;
      addLog(`${result.enemy.name} 已被击败，本层楼梯封印解除。`, "good");
    }

    if (result.enemy.isFinalBoss) {
      state.won = true;
      state.player.x = x;
      state.player.y = y;
      addLog("魔塔领主倒下，通关完成。", "good");
      renderAll();
      return false;
    }

    return true;
  }

  return true;
}

function useStairs(direction) {
  const currentFloor = getCurrentFloor();
  const nextFloorIndex = direction === "down" ? state.player.floor + 1 : state.player.floor - 1;

  if (direction === "down" && !currentFloor.bossDefeated) {
    addLog("守卫仍在，本层下楼梯被封印。", "warn");
    renderAll();
    return;
  }

  if (!state.floors[nextFloorIndex]) {
    addLog("没有可前往的楼层。", "warn");
    renderAll();
    return;
  }

  state.player.floor = nextFloorIndex;
  const nextFloor = getCurrentFloor();
  const spawn = direction === "down"
    ? nextFloor.upPosition ?? nextFloor.start
    : nextFloor.downPosition ?? nextFloor.start;

  state.player.x = spawn.x;
  state.player.y = spawn.y;
  addLog(`来到${nextFloor.name}。`, "good");
  renderAll();
}

function getCurrentFloor() {
  return state.floors[state.player.floor];
}

function renderAll() {
  if (!state.player) {
    return;
  }

  renderMap();
  renderStats();
  renderTargetInfo();
  renderSaveSlots();
  renderLog();
  renderShop();
}

function renderMap() {
  const floor = getCurrentFloor();
  els.floorName.textContent = floor.name;
  els.mapGrid.innerHTML = "";

  for (let y = 0; y < MAP_SIZE; y += 1) {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      const tile = getTile(floor, x, y);
      const entity = getEntity(floor, x, y);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tile ${tileClass(tile, entity)}`;
      button.dataset.x = String(x);
      button.dataset.y = String(y);
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", describeCell(tile, entity, x, y));

      appendTileImage(button, ASSETS.tiles[tile] ?? ASSETS.tiles[TILE.FLOOR], "tile-base");

      if (state.player.x === x && state.player.y === y) {
        button.classList.add("player");
        appendTileImage(button, ASSETS.hero, "tile-entity");
      } else if (entity) {
        appendTileImage(button, entityAsset(entity), "tile-entity");
      }

      if (Math.abs(state.player.x - x) + Math.abs(state.player.y - y) === 1) {
        button.classList.add("reachable");
      }

      els.mapGrid.appendChild(button);
    }
  }
}

function appendTileImage(parent, src, className) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  img.decoding = "async";
  img.draggable = false;
  img.className = `tile-img ${className}`;
  parent.appendChild(img);
}

function tileClass(tile, entity) {
  if (entity?.type === "enemy") {
    return ENEMY_DEFS[entity.id].isBoss ? "enemy boss" : "enemy";
  }

  if (entity?.type === "item") {
    return "item";
  }

  const classMap = {
    [TILE.WALL]: "wall",
    [TILE.FLOOR]: "floor",
    [TILE.YELLOW_DOOR]: "door-yellow",
    [TILE.BLUE_DOOR]: "door-blue",
    [TILE.RED_DOOR]: "door-red",
    [TILE.STAIR_DOWN]: "stair-down",
    [TILE.STAIR_UP]: "stair-up",
    [TILE.SHOP]: "shop"
  };

  return classMap[tile] ?? "floor";
}

function entityAsset(entity) {
  if (entity.type === "item") {
    return ITEM_DEFS[entity.id].asset;
  }

  if (entity.type === "enemy") {
    return ENEMY_DEFS[entity.id].asset;
  }

  return ASSETS.tiles[TILE.FLOOR];
}

function describeCell(tile, entity, x, y) {
  if (state.player.x === x && state.player.y === y) {
    return "勇者当前位置";
  }

  if (entity?.type === "item") {
    return ITEM_DEFS[entity.id].name;
  }

  if (entity?.type === "enemy") {
    return ENEMY_DEFS[entity.id].name;
  }

  const names = {
    [TILE.WALL]: "墙",
    [TILE.FLOOR]: "地板",
    [TILE.YELLOW_DOOR]: "黄门",
    [TILE.BLUE_DOOR]: "蓝门",
    [TILE.RED_DOOR]: "红门",
    [TILE.STAIR_DOWN]: "下楼梯",
    [TILE.STAIR_UP]: "上楼梯",
    [TILE.SHOP]: "商店"
  };

  return names[tile] ?? "地块";
}

function renderStats() {
  const player = state.player;
  els.heroLevel.textContent = `LV ${player.lvl}`;
  els.statHp.textContent = player.hp;
  els.statAtk.textContent = player.atk;
  els.statDef.textContent = player.def;
  els.statGold.textContent = player.gold;
  els.statExp.textContent = player.exp;
  els.statFloor.textContent = player.floor + 1;
  els.keyYellow.textContent = player.keys.yellow;
  els.keyBlue.textContent = player.keys.blue;
  els.keyRed.textContent = player.keys.red;
}

function renderTargetInfo(x = null, y = null) {
  const floor = getCurrentFloor();
  const target = x === null || y === null ? getForwardTarget() : { x, y };

  if (!target) {
    els.targetInfo.textContent = "移动到怪物、道具、门或楼梯旁查看。";
    return;
  }

  const tile = getTile(floor, target.x, target.y);
  const entity = getEntity(floor, target.x, target.y);

  if (entity?.type === "enemy") {
    const preview = previewBattle(state.player, entity.id);
    els.targetInfo.innerHTML = `
      <div class="target-row"><span>${preview.enemy.name}</span><strong>${preview.canWin ? "可战斗" : "危险"}</strong></div>
      <div class="target-row"><span>HP / ATK / DEF</span><strong>${preview.enemy.hp} / ${preview.enemy.atk} / ${preview.enemy.def}</strong></div>
      <div class="target-row"><span>预计损失</span><strong>${preview.expectedLoss} HP</strong></div>
      <div class="target-row"><span>奖励</span><strong>${preview.enemy.gold} 金 / ${preview.enemy.exp} 经验</strong></div>
    `;
    return;
  }

  if (entity?.type === "item") {
    const item = ITEM_DEFS[entity.id];
    els.targetInfo.innerHTML = `<div class="target-row"><span>${item.name}</span><strong>${item.description}</strong></div>`;
    return;
  }

  if (DOOR_TO_KEY[tile]) {
    const keyType = DOOR_TO_KEY[tile];
    els.targetInfo.innerHTML = `<div class="target-row"><span>${KEY_NAMES[keyType]}门</span><strong>持有 ${state.player.keys[keyType]}</strong></div>`;
    return;
  }

  if (tile === TILE.STAIR_DOWN) {
    els.targetInfo.innerHTML = `<div class="target-row"><span>下楼梯</span><strong>${floor.bossDefeated ? "可进入" : "需击败守卫"}</strong></div>`;
    return;
  }

  if (tile === TILE.STAIR_UP) {
    els.targetInfo.innerHTML = '<div class="target-row"><span>上楼梯</span><strong>返回上一层</strong></div>';
    return;
  }

  if (tile === TILE.SHOP) {
    els.targetInfo.innerHTML = '<div class="target-row"><span>商店</span><strong>金币训练</strong></div>';
    return;
  }

  els.targetInfo.textContent = "没有特殊目标。";
}

function getForwardTarget() {
  const floor = getCurrentFloor();
  const adjacent = Object.values(DIRECTIONS)
    .map((delta) => ({ x: state.player.x + delta.x, y: state.player.y + delta.y }))
    .filter((pos) => isInsideMap(pos.x, pos.y));

  return adjacent.find((pos) => {
    const tile = getTile(floor, pos.x, pos.y);
    return getEntity(floor, pos.x, pos.y)
      || DOOR_TO_KEY[tile]
      || tile === TILE.STAIR_DOWN
      || tile === TILE.STAIR_UP
      || tile === TILE.SHOP;
  }) ?? null;
}

function renderLog() {
  els.battleLog.innerHTML = "";
  state.logs.slice(-80).forEach((entry) => {
    const line = document.createElement("div");
    line.className = `log-entry ${entry.type}`;
    line.textContent = entry.message;
    els.battleLog.appendChild(line);
  });
  els.battleLog.scrollTop = els.battleLog.scrollHeight;
}

function addLog(message, type = "") {
  state.logs.push({ message, type, at: Date.now() });
  if (state.logs.length > 120) {
    state.logs = state.logs.slice(-120);
  }

  if (els.battleLog) {
    renderLog();
  }
}

function openShop() {
  renderShop();
  if (!els.shopDialog.open) {
    els.shopDialog.showModal();
  }
}

function renderShop() {
  if (!els.shopItems || !state.player) {
    return;
  }

  els.shopItems.innerHTML = "";
  SHOP_OPTIONS.forEach((option) => {
    const cost = getShopCost(option.id, state.shop);
    const item = document.createElement("article");
    item.className = "shop-item";
    item.innerHTML = `
      <div>
        <h3>${option.name}</h3>
        <p>${option.description}，当前价格 ${cost} 金，已购买 ${state.shop[option.id] ?? 0} 次。</p>
      </div>
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "buy-button";
    button.textContent = `${cost} 金`;
    button.disabled = state.player.gold < cost || state.gameOver || state.won;
    button.addEventListener("click", () => {
      const result = buyShopOption(state.player, state.shop, option.id);
      addLog(result.message, result.ok ? "good" : "warn");
      renderAll();
    });

    item.appendChild(button);
    els.shopItems.appendChild(item);
  });

  els.shopHint.textContent = `持有 ${state.player.gold} 金币。价格会随购买次数递增。`;
}

function renderSaveSlots() {
  els.saveSlots.innerHTML = "";

  for (let slot = 1; slot <= SAVE_SLOT_COUNT; slot += 1) {
    const row = document.createElement("div");
    row.className = "slot-row";

    const label = document.createElement("div");
    label.className = "slot-label";
    label.textContent = getSlotLabel(slot);

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "slot-button";
    saveButton.textContent = "保存";
    saveButton.addEventListener("click", () => saveGame(slot));

    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "slot-button";
    loadButton.textContent = "读取";
    loadButton.disabled = !localStorage.getItem(slotKey(slot));
    loadButton.addEventListener("click", () => loadGame(slot));

    row.append(label, saveButton, loadButton);
    els.saveSlots.appendChild(row);
  }
}

function getSlotLabel(slot) {
  const raw = localStorage.getItem(slotKey(slot));
  if (!raw) {
    return `槽 ${slot}：空`;
  }

  try {
    const data = JSON.parse(raw);
    const savedAt = new Date(data.savedAt).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
    return `槽 ${slot}：${data.floorName ?? "未知楼层"} ${savedAt}`;
  } catch {
    return `槽 ${slot}：数据损坏`;
  }
}

function saveGame(slot) {
  const payload = {
    version: 2,
    savedAt: new Date().toISOString(),
    floorName: getCurrentFloor().name,
    player: state.player,
    floors: state.floors,
    shop: state.shop,
    logs: state.logs.slice(-40),
    gameOver: state.gameOver,
    won: state.won
  };

  localStorage.setItem(slotKey(slot), JSON.stringify(payload));
  addLog(`已保存到槽 ${slot}。`, "good");
  renderSaveSlots();
}

function loadGame(slot) {
  const raw = localStorage.getItem(slotKey(slot));
  if (!raw) {
    addLog(`槽 ${slot} 没有存档。`, "warn");
    return;
  }

  try {
    const data = JSON.parse(raw);
    if (!isValidSave(data)) {
      throw new Error("Invalid save data");
    }

    state.player = data.player;
    state.floors = data.floors;
    state.shop = { ...createShopState(), ...data.shop };
    state.logs = data.logs ?? [];
    state.gameOver = Boolean(data.gameOver);
    state.won = Boolean(data.won);
    addLog(`已读取槽 ${slot}。`, "good");
    renderAll();
  } catch {
    addLog(`槽 ${slot} 存档无法读取。`, "bad");
  }
}

function isValidSave(data) {
  return data
    && data.version === 2
    && data.player
    && Array.isArray(data.floors)
    && data.floors.length === 5
    && data.shop;
}

function slotKey(slot) {
  return `${SAVE_PREFIX}${slot}`;
}
