import {
  ASSETS,
  DEFAULT_DIFFICULTY,
  DOOR_TO_KEY,
  ENEMY_DEFS,
  ITEM_DEFS,
  MAP_SIZE,
  TILE,
  createGameSeed,
  createInitialFloors,
  createInitialPlayer,
  getEntity,
  getDifficulty,
  getEnemyDef,
  getTile,
  isInsideMap,
  normalizeDifficulty,
  removeEntity,
  setTile
} from "./map.js";
import { previewBattle, runBattle } from "./battle.js";
import { SHOP_OPTIONS, buyShopOption, createShopState, getShopCost } from "./shop.js";
import { bindAudioButton, playBgm, playCombatSounds, playSound, primeAudio } from "./audio.js";
import {
  difficultyText,
  doorName,
  enemyName,
  generatedFloorName,
  getLanguage,
  itemText,
  keyName,
  shopOptionText,
  skillText,
  syncDocumentLanguage,
  t,
  tList,
  tileText,
  toggleLanguage
} from "./i18n.js";
import {
  ACTIONS,
  addCombatEffect,
  calculateCombatDuration,
  createActorSprite,
  createAnimationState,
  createCombatAnimationState,
  getCombatEffectAt,
  getActionDuration,
  removeCombatEffect,
  resetCombatAnimation,
  resetHeroAction,
  startCombatAnimation,
  setHeroAction
} from "./animation.js";
import {
  createSkillState,
  getAllSkills,
  getSkillCooldown,
  isSkillLearned,
  isSkillReady,
  normalizeSkillState,
  tickSkillCooldowns,
  useSkill
} from "./skills.js";

const SAVE_PREFIX = "magicTowerSaveSlot";
const SAVE_SLOT_COUNT = 3;
const QUICK_SLOT = 1;
const TUTORIAL_KEY = "magicTowerTutorialDone.v4";
const DIFFICULTY_KEY = "magicTowerDifficulty";
const DIRECTIONS = Object.freeze({
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
});
const MOVEMENT_KEY_MAP = Object.freeze({
  ArrowUp: "up",
  Up: "up",
  KeyW: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  Down: "down",
  KeyS: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  Left: "left",
  KeyA: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  Right: "right",
  KeyD: "right",
  d: "right",
  D: "right"
});

const els = {
  mapGrid: document.querySelector("#mapGrid"),
  floorName: document.querySelector("#floorName"),
  langToggleBtn: document.querySelector("#langToggleBtn"),
  heroName: document.querySelector("#heroName"),
  heroLevel: document.querySelector("#heroLevel"),
  labelHp: document.querySelector("#labelHp"),
  labelAtk: document.querySelector("#labelAtk"),
  labelDef: document.querySelector("#labelDef"),
  labelGold: document.querySelector("#labelGold"),
  labelExp: document.querySelector("#labelExp"),
  labelFloor: document.querySelector("#labelFloor"),
  statHp: document.querySelector("#statHp"),
  statAtk: document.querySelector("#statAtk"),
  statDef: document.querySelector("#statDef"),
  statGold: document.querySelector("#statGold"),
  statExp: document.querySelector("#statExp"),
  statFloor: document.querySelector("#statFloor"),
  keyYellow: document.querySelector("#keyYellow"),
  keyBlue: document.querySelector("#keyBlue"),
  keyRed: document.querySelector("#keyRed"),
  difficultyGroup: document.querySelector("#difficultyGroup"),
  difficultyHeading: document.querySelector("#difficultyHeading"),
  difficultyHint: document.querySelector("#difficultyHint"),
  targetInfo: document.querySelector("#targetInfo"),
  skillHeading: document.querySelector("#skillHeading"),
  targetHeading: document.querySelector("#targetHeading"),
  saveHeading: document.querySelector("#saveHeading"),
  logHeading: document.querySelector("#logHeading"),
  skillBar: document.querySelector("#skillBar"),
  battleLog: document.querySelector("#battleLog"),
  saveSlots: document.querySelector("#saveSlots"),
  shopDialog: document.querySelector("#shopDialog"),
  shopItems: document.querySelector("#shopItems"),
  shopHint: document.querySelector("#shopHint"),
  shopPrompt: document.querySelector("#shopPrompt"),
  shopBtn: document.querySelector("#shopBtn"),
  manualSaveBtn: document.querySelector("#manualSaveBtn"),
  quickLoadBtn: document.querySelector("#quickLoadBtn"),
  newGameBtn: document.querySelector("#newGameBtn"),
  audioBtn: document.querySelector("#audioBtn"),
  helpBtn: document.querySelector("#helpBtn"),
  helpDialog: document.querySelector("#helpDialog"),
  tutorialOverlay: document.querySelector("#tutorialOverlay"),
  tutorialText: document.querySelector("#tutorialText"),
  tutorialProgress: document.querySelector("#tutorialProgress"),
  tutorialNextBtn: document.querySelector("#tutorialNextBtn"),
  tutorialSkipBtn: document.querySelector("#tutorialSkipBtn"),
  victoryOverlay: document.querySelector("#victoryOverlay"),
  victoryStats: document.querySelector("#victoryStats"),
  victoryRetryBtn: document.querySelector("#victoryRetryBtn"),
  victoryShareBtn: document.querySelector("#victoryShareBtn"),
  defeatOverlay: document.querySelector("#defeatOverlay"),
  defeatReason: document.querySelector("#defeatReason"),
  defeatRetryBtn: document.querySelector("#defeatRetryBtn"),
  defeatLoadBtn: document.querySelector("#defeatLoadBtn"),
  labelYellowKey: document.querySelector("#labelYellowKey"),
  labelBlueKey: document.querySelector("#labelBlueKey"),
  labelRedKey: document.querySelector("#labelRedKey"),
  victoryKicker: document.querySelector("#victoryKicker"),
  victoryTitle: document.querySelector("#victoryTitle"),
  defeatKicker: document.querySelector("#defeatKicker"),
  defeatTitle: document.querySelector("#defeatTitle"),
  shopDialogTitle: document.querySelector("#shopDialogTitle"),
  helpDialogTitle: document.querySelector("#helpDialogTitle"),
  helpList: document.querySelector("#helpList")
};

const tutorialSelectors = [
  "#mapGrid",
  ".side-panel",
  ".enemy-preview",
  ".action-row",
  ".top-actions"
];

const state = {
  player: null,
  floors: [],
  difficulty: DEFAULT_DIFFICULTY,
  seed: "",
  shop: createShopState(),
  skills: createSkillState(),
  logs: [],
  animation: createAnimationState(),
  combatAnimation: createCombatAnimationState(),
  heroActionTimer: 0,
  combatTimer: 0,
  shopAutoOpenTimer: 0,
  effectTimers: new Set(),
  moveCount: 0,
  startedAt: Date.now(),
  defeatReason: "",
  tutorial: {
    active: false,
    step: 0
  },
  gameOver: false,
  won: false
};

init();

function init() {
  state.difficulty = normalizeDifficulty(localStorage.getItem(DIFFICULTY_KEY));
  syncDocumentLanguage();
  bindEvents();
  startNewGame(false);
  addLog(t("logs.welcome"), "good");
  renderAll();
  maybeStartTutorial();
}

function startNewGame(confirmFirst = true, difficultyId = state.difficulty, seed = null) {
  const difficulty = normalizeDifficulty(difficultyId);
  const difficultyMeta = difficultyText(difficulty);
  if (confirmFirst && !window.confirm(t("logs.confirmNew", { difficulty: difficultyMeta.label }))) {
    return;
  }

  const nextSeed = String(seed || createGameSeed());
  state.difficulty = difficulty;
  state.seed = nextSeed;
  localStorage.setItem(DIFFICULTY_KEY, difficulty);
  state.player = createInitialPlayer(difficulty);
  state.floors = createInitialFloors(difficulty, nextSeed);
  state.shop = createShopState();
  state.skills = createSkillState();
  state.logs = [];
  clearVisualTimers();
  state.animation = createAnimationState();
  state.combatAnimation = createCombatAnimationState();
  state.moveCount = 0;
  state.startedAt = Date.now();
  state.defeatReason = "";
  state.gameOver = false;
  state.won = false;
  hideOutcomeScreens();
  addLog(t("logs.start", { difficulty: difficultyMeta.label }), "good");
  playBgm("explore");
  renderAll();
}

function bindEvents() {
  bindAudioButton(els.audioBtn);
  els.langToggleBtn?.addEventListener("click", () => {
    toggleLanguage();
    renderAll();
    if (state.tutorial.active) {
      showTutorialStep();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || isModalOpen()) {
      return;
    }

    const direction = getKeyboardDirection(event);
    if (direction) {
      event.preventDefault();
      primeAudio();
      movePlayer(direction);
      return;
    }

    if (["1", "2", "3"].includes(event.key)) {
      event.preventDefault();
      primeAudio();
      useSkillByIndex(Number(event.key) - 1);
      return;
    }

    const focusedInteractive = event.target instanceof Element
      ? event.target.closest("button, a, input, select, textarea, [role='button']")
      : null;
    const shouldUseFocusedControl = focusedInteractive
      && !focusedInteractive.closest("#mapGrid, .mobile-controls");
    if (event.key === "Enter" && shouldUseFocusedControl) {
      return;
    }

    if (event.key.toLowerCase() === "e" || event.key === "Enter") {
      event.preventDefault();
      primeAudio();
      interactWithTarget();
    }
  });

  document.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("touchstart", (event) => {
      event.preventDefault();
    }, { passive: false });
    button.addEventListener("click", () => {
      primeAudio();
      movePlayer(button.dataset.move);
    });
  });

  bindSwipeGestures();

  els.difficultyGroup?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-difficulty]") : null;
    if (!button) {
      return;
    }

    chooseDifficulty(button.dataset.difficulty);
  });

  els.skillBar?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-skill]") : null;
    if (!button) {
      return;
    }
    primeAudio();
    useSkillById(button.dataset.skill);
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
        primeAudio();
        movePlayer(direction);
      }
      return;
    }

    renderTargetInfo(x, y);
  });

  els.mapGrid.addEventListener("dblclick", (event) => {
    const tile = event.target.closest(".tile");
    if (!tile || !state.player) {
      return;
    }

    const x = Number(tile.dataset.x);
    const y = Number(tile.dataset.y);
    if (getTile(getCurrentFloor(), x, y) !== TILE.SHOP) {
      return;
    }

    event.preventDefault();
    primeAudio();
    openShopFromTile(x, y);
  });

  els.shopBtn.addEventListener("click", () => {
    primeAudio();
    openShopFromAction();
  });
  els.manualSaveBtn.addEventListener("click", () => saveGame(QUICK_SLOT));
  els.quickLoadBtn.addEventListener("click", () => loadGame(QUICK_SLOT));
  els.newGameBtn.addEventListener("click", () => startNewGame(true));
  els.helpBtn.addEventListener("click", () => els.helpDialog.showModal());
  els.tutorialNextBtn.addEventListener("click", () => advanceTutorial());
  els.tutorialSkipBtn.addEventListener("click", () => finishTutorial());
  els.shopDialog?.addEventListener("close", () => {
    if (!state.gameOver && !state.won) {
      playBgm("explore");
    }
  });
  els.victoryRetryBtn?.addEventListener("click", () => startNewGame(false, state.difficulty));
  els.victoryShareBtn?.addEventListener("click", () => shareSeed());
  els.defeatRetryBtn?.addEventListener("click", () => startNewGame(false, state.difficulty, state.seed));
  els.defeatLoadBtn?.addEventListener("click", () => loadGame(QUICK_SLOT));
}

function bindSwipeGestures() {
  let touchStartX = 0;
  let touchStartY = 0;

  els.mapGrid.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  els.mapGrid.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const threshold = 20;

    if (Math.max(absDx, absDy) < threshold) {
      return;
    }

    event.preventDefault();
    primeAudio();
    movePlayer(absDx > absDy
      ? (dx > 0 ? "right" : "left")
      : (dy > 0 ? "down" : "up"));
  }, { passive: false });
}

function chooseDifficulty(difficultyId) {
  const next = normalizeDifficulty(difficultyId);
  if (next === state.difficulty) {
    renderDifficulty();
    return;
  }

  const difficulty = difficultyText(next);
  if (state.player && !window.confirm(t("logs.confirmDifficulty", { difficulty: difficulty.label }))) {
    renderDifficulty();
    return;
  }

  startNewGame(false, next);
  addLog(t("logs.difficultyChanged", {
    difficulty: difficulty.label,
    description: difficulty.description
  }), "good");
}

function interactWithTarget() {
  if (isTutorialActive()) {
    addLog(t("logs.tutorialBlocked"), "warn");
    return;
  }

  if (state.gameOver || state.won) {
    addLog(t(state.won ? "logs.wonLocked" : "logs.defeatedLocked"), "warn");
    return;
  }

  const shopTarget = getShopActionTarget();
  if (shopTarget) {
    openShopFromTile(shopTarget.x, shopTarget.y);
    return;
  }

  const target = getForwardTarget();
  if (!target) {
    addLog(t("logs.noInteractTarget"), "warn");
    playSound("blocked");
    return;
  }

  const direction = getDirectionTo(target.x, target.y);
  if (!direction) {
    renderTargetInfo(target.x, target.y);
    return;
  }

  movePlayer(direction);
}

function openShopFromAction() {
  if (state.gameOver || state.won) {
    addLog(t(state.won ? "logs.wonLocked" : "logs.defeatedLocked"), "warn");
    return;
  }

  const target = getShopActionTarget();
  if (!target) {
    addLog(t("logs.shopNeedNear"), "warn");
    playSound("blocked");
    renderShopAccess();
    return;
  }

  openShopFromTile(target.x, target.y);
}

function openShopFromTile(x, y) {
  if (getTile(getCurrentFloor(), x, y) !== TILE.SHOP) {
    return;
  }

  if (state.player.x === x && state.player.y === y) {
    openShop();
    return;
  }

  const direction = getDirectionTo(x, y);
  if (!direction) {
    renderTargetInfo(x, y);
    addLog(t("logs.shopNear"), "warn");
    playSound("blocked");
    return;
  }

  movePlayer(direction);
  window.setTimeout(() => {
    if (canUseShop()) {
      openShop();
    }
  }, getActionDuration(ACTIONS.WALK) + 40);
}

function maybeStartTutorial() {
  if (localStorage.getItem(TUTORIAL_KEY) === "done") {
    return;
  }

  state.tutorial.active = true;
  state.tutorial.step = 0;
  showTutorialStep();
}

function showTutorialStep() {
  const tutorialSteps = getTutorialSteps();
  const step = tutorialSteps[state.tutorial.step];
  clearTutorialFocus();
  els.tutorialOverlay.hidden = false;
  els.tutorialText.textContent = step.text;
  els.tutorialNextBtn.textContent = state.tutorial.step === tutorialSteps.length - 1
    ? t("actions.startExplore")
    : t("actions.nextStep");
  els.tutorialSkipBtn.textContent = t("actions.skip");
  els.tutorialProgress.innerHTML = "";

  tutorialSteps.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className = `tutorial-dot ${index === state.tutorial.step ? "active" : ""}`;
    els.tutorialProgress.appendChild(dot);
  });

  document.querySelector(step.selector)?.classList.add("tutorial-focus");
}

function advanceTutorial() {
  if (state.tutorial.step >= getTutorialSteps().length - 1) {
    finishTutorial();
    return;
  }

  state.tutorial.step += 1;
  showTutorialStep();
}

function finishTutorial() {
  state.tutorial.active = false;
  localStorage.setItem(TUTORIAL_KEY, "done");
  clearTutorialFocus();
  els.tutorialOverlay.hidden = true;
  addLog(t("logs.guideDone"), "good");
}

function getTutorialSteps() {
  const texts = tList("tutorial.steps");
  return tutorialSelectors.map((selector, index) => ({
    selector,
    text: texts[index] ?? ""
  }));
}

function clearTutorialFocus() {
  document.querySelectorAll(".tutorial-focus").forEach((node) => node.classList.remove("tutorial-focus"));
}

function isTutorialActive() {
  return state.tutorial.active;
}

function getKeyboardDirection(event) {
  return MOVEMENT_KEY_MAP[event.key] ?? MOVEMENT_KEY_MAP[event.code] ?? null;
}

function movePlayer(direction) {
  if (!DIRECTIONS[direction]) {
    return;
  }

  if (isTutorialActive()) {
    finishTutorial();
  }

  if (state.gameOver || state.won) {
    addLog(t(state.won ? "logs.wonLocked" : "logs.defeatedLocked"), "warn");
    return;
  }

  if (state.combatAnimation.active) {
    return;
  }

  clearShopAutoOpen();
  setHeroAction(state.animation, ACTIONS.IDLE, direction);
  const delta = DIRECTIONS[direction];
  const targetX = state.player.x + delta.x;
  const targetY = state.player.y + delta.y;

  if (!isInsideMap(targetX, targetY)) {
    playSound("blocked");
    renderMap();
    return;
  }

  const floor = getCurrentFloor();
  const tile = getTile(floor, targetX, targetY);
  const entity = getEntity(floor, targetX, targetY);

  if (tile === TILE.WALL) {
    addLog(t("logs.wall"), "warn");
    playSound("blocked");
    renderMap();
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
    recordStep();
    queueHeroAction(ACTIONS.WALK, direction);
    useStairs("down");
    return;
  }

  if (currentTile === TILE.STAIR_UP) {
    state.player.x = targetX;
    state.player.y = targetY;
    recordStep();
    queueHeroAction(ACTIONS.WALK, direction);
    useStairs("up");
    return;
  }

  if (currentTile === TILE.SHOP) {
    state.player.x = targetX;
    state.player.y = targetY;
    recordStep();
    queueHeroAction(ACTIONS.WALK, direction);
    playSound("move");
    addLog(t("logs.arrivedShop"), "good");
    scheduleShopAutoOpen();
    renderAll();
    return;
  }

  state.player.x = targetX;
  state.player.y = targetY;
  recordStep();
  if (currentTile === TILE.CURSE) {
    applyCurseTile(floor, targetX, targetY);
  }
  if (!entity) {
    playSound("move");
  }
  queueHeroAction(entity?.type === "enemy" ? ACTIONS.ATTACK : ACTIONS.WALK, direction);
  renderAll();
}

function tryOpenDoor(floor, x, y, tile) {
  const keyType = DOOR_TO_KEY[tile];
  if (state.player.keys[keyType] <= 0) {
    addLog(t("logs.needKey", { key: keyName(keyType) }), "warn");
    playSound("blocked");
    renderTargetInfo(x, y);
    renderMap();
    return false;
  }

  state.player.keys[keyType] -= 1;
  setTile(floor, x, y, TILE.FLOOR);
  addLog(t("logs.openDoor", { door: doorName(keyType) }), "good");
  playSound("door");
  return true;
}

function handleEntity(floor, x, y, entity) {
  if (entity.type === "item") {
    const item = ITEM_DEFS[entity.id];
    item.apply(state.player);
    removeEntity(floor, x, y);
    addLog(itemText(entity.id).pickup, "good");
    playSound("pickup");
    return true;
  }

  if (entity.type === "enemy") {
    const preview = previewBattle(state.player, entity.id, state.skills);
    if (!preview.canWin) {
      addLog(t("logs.cannotDefeat", {
        enemy: enemyName(entity.id),
        loss: preview.expectedLoss
      }), "bad");
      playSound("blocked");
      renderTargetInfo(x, y);
      renderMap();
      return false;
    }

    startCombatSequence(floor, x, y, entity);
    return false;
  }

  return true;
}

function startCombatSequence(floor, x, y, entity) {
  const enemy = getEnemyDef(entity.id, state.player.difficulty);
  const direction = getDirectionTo(x, y) ?? state.animation.heroFacing;
  const duration = calculateCombatDuration(enemy);

  window.clearTimeout(state.heroActionTimer);
  window.clearTimeout(state.combatTimer);
  startCombatAnimation(state.combatAnimation, {
    enemyX: x,
    enemyY: y,
    enemyId: entity.id,
    playerDirection: direction,
    duration,
    hpFrom: 100,
    hpTo: 0,
    damage: enemy.hp
  });
  setHeroAction(state.animation, ACTIONS.ATTACK, direction);
  playBgm(enemy.isBoss ? "boss" : "explore");
  playSound(enemy.isBoss || entity.id === "mage" || entity.id === "eliteMage" ? "shop" : "attack");
  renderMap();

  state.combatTimer = window.setTimeout(() => {
    finishCombatSequence(floor, x, y, entity, direction);
  }, duration);
}

function finishCombatSequence(floor, x, y, entity, direction) {
  const currentEntity = getEntity(floor, x, y);
  resetCombatAnimation(state.combatAnimation);
  resetHeroAction(state.animation);
  state.combatTimer = 0;

  if (!currentEntity || currentEntity.type !== "enemy" || currentEntity.id !== entity.id) {
    renderAll();
    return;
  }

  const result = runBattle(state.player, entity.id, state.skills);
  result.logs.forEach((line, index) => addLog(line, index === result.logs.length - 1 ? "good" : ""));
  playCombatSounds(result.enemy.isBoss || entity.id === "mage" || entity.id === "eliteMage", result.leveledUp);

  if (!result.victory) {
    state.gameOver = true;
    state.defeatReason = t("logs.defeatReason", { enemy: enemyName(entity.id) });
    showDefeatScreen(state.defeatReason);
    renderAll();
    return;
  }

  removeEntity(floor, x, y);
  queueCombatEffect(x, y, entity.id, direction, result.enemy);

  if (result.enemy.isBoss) {
    floor.bossDefeated = true;
    addLog(t("logs.bossDefeated", { enemy: enemyName(entity.id) }), "good");
  }

  state.player.x = x;
  state.player.y = y;
  recordStep();

  if (result.enemy.isFinalBoss) {
    state.won = true;
    addLog(t("logs.finalDefeated"), "good");
    showVictoryScreen();
    renderAll();
    return;
  }

  playBgm("explore");
  queueHeroAction(ACTIONS.ATTACK, direction);
  renderAll();
}

function useStairs(direction) {
  const currentFloor = getCurrentFloor();
  const nextFloorIndex = direction === "down" ? state.player.floor + 1 : state.player.floor - 1;

  if (direction === "down" && !currentFloor.bossDefeated) {
    addLog(t("logs.stairLocked"), "warn");
    renderAll();
    return;
  }

  if (!state.floors[nextFloorIndex]) {
    addLog(t("logs.noFloor"), "warn");
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
  addLog(t("logs.arriveFloor", { floor: getFloorDisplayName(nextFloor) }), "good");
  playSound("stairs");
  renderAll();
}

function getCurrentFloor() {
  return state.floors[state.player.floor];
}

function getFloorDisplayName(floor) {
  if (!floor) {
    return t("app.floorFallback", { floor: 1 });
  }
  return floor.generated
    ? generatedFloorName(floor, state.player?.difficulty ?? state.difficulty)
    : floor.name;
}

function isTileVisible(x, y) {
  const radius = getDifficulty(state.player?.difficulty ?? state.difficulty).fogRadius;
  if (!radius) {
    return true;
  }

  return Math.max(Math.abs(state.player.x - x), Math.abs(state.player.y - y)) <= radius;
}

function queueHeroAction(action, direction) {
  window.clearTimeout(state.heroActionTimer);
  setHeroAction(state.animation, action, direction);
  state.heroActionTimer = window.setTimeout(() => {
    resetHeroAction(state.animation);
    renderMap();
  }, getActionDuration(action));
}

function queueCombatEffect(x, y, enemyId, direction, enemy) {
  const effectId = addCombatEffect(state.animation, {
    x,
    y,
    direction,
    enemySprite: ENEMY_DEFS[enemyId].sprite,
    kind: enemy.isBoss || enemyId === "mage" || enemyId === "eliteMage" ? "magic" : "slash",
    defeated: true
  });

  const timer = window.setTimeout(() => {
    removeCombatEffect(state.animation, effectId);
    state.effectTimers.delete(timer);
    renderMap();
  }, 680);
  state.effectTimers.add(timer);
}

function clearVisualTimers() {
  window.clearTimeout(state.heroActionTimer);
  window.clearTimeout(state.combatTimer);
  window.clearTimeout(state.shopAutoOpenTimer);
  state.heroActionTimer = 0;
  state.combatTimer = 0;
  state.shopAutoOpenTimer = 0;
  resetCombatAnimation(state.combatAnimation);
  state.effectTimers.forEach((timer) => window.clearTimeout(timer));
  state.effectTimers.clear();
}

function renderStaticText() {
  syncDocumentLanguage();
  setText(".game-title h1", t("app.title"));
  setText(els.heroName, t("app.hero"));
  setText(els.difficultyHeading, t("panels.difficulty"));
  setText(els.labelHp, t("stats.hp"));
  setText(els.labelAtk, t("stats.atk"));
  setText(els.labelDef, t("stats.def"));
  setText(els.labelGold, t("stats.gold"));
  setText(els.labelExp, t("stats.exp"));
  setText(els.labelFloor, t("stats.floor"));
  setText(els.labelYellowKey, keyName("yellow"));
  setText(els.labelBlueKey, keyName("blue"));
  setText(els.labelRedKey, keyName("red"));
  setText(els.skillHeading, t("panels.skills"));
  setText(els.targetHeading, t("panels.target"));
  setText(els.saveHeading, t("panels.saves"));
  setText(els.logHeading, t("panels.log"));
  setText(els.shopPrompt, t("prompt.shop"));
  setText(els.victoryKicker, t("outcome.victory"));
  setText(els.victoryTitle, t("outcome.victoryTitle"));
  setText(els.defeatKicker, t("outcome.defeat"));
  setText(els.defeatTitle, t("outcome.defeatTitle"));
  setText(els.shopDialogTitle, t("actions.shop"));
  setText(els.helpDialogTitle, t("panels.operations"));
  setText(els.langToggleBtn, t("actions.languageButton"));
  els.langToggleBtn?.setAttribute("aria-label", t("actions.language"));
  els.langToggleBtn?.setAttribute("title", t("actions.language"));

  setButtonLabel(els.newGameBtn, t("actions.newGame"));
  setButtonLabel(els.manualSaveBtn, t("actions.save"));
  setButtonLabel(els.quickLoadBtn, t("actions.load"));
  setButtonLabel(els.shopBtn, t("actions.shop"));
  setText(els.tutorialSkipBtn, t("actions.skip"));
  setText(els.victoryRetryBtn, t("actions.retry"));
  setText(els.victoryShareBtn, t("actions.shareSeed"));
  setText(els.defeatRetryBtn, t("actions.retryChallenge"));
  setText(els.defeatLoadBtn, t("actions.load"));

  document.querySelector(".game-area")?.setAttribute("aria-label", t("aria.gameMap"));
  els.mapGrid?.setAttribute("aria-label", t("aria.mapGrid"));
  document.querySelector(".mobile-controls")?.setAttribute("aria-label", t("aria.movement"));
  document.querySelector(".side-panel")?.setAttribute("aria-label", t("aria.status"));
  document.querySelector(".difficulty-panel")?.setAttribute("aria-label", t("aria.difficulty"));
  els.difficultyGroup?.setAttribute("aria-label", t("aria.selectDifficulty"));
  document.querySelector(".skill-panel")?.setAttribute("aria-label", t("aria.skills"));
  document.querySelector(".enemy-preview")?.setAttribute("aria-label", t("aria.target"));
  document.querySelector(".save-panel")?.setAttribute("aria-label", t("aria.saves"));
  document.querySelector(".bottom-panel")?.setAttribute("aria-label", t("aria.battleLog"));
  els.tutorialOverlay?.querySelector(".tutorial-panel")?.setAttribute("aria-label", t("aria.tutorial"));
  els.victoryOverlay?.querySelector(".outcome-panel")?.setAttribute("aria-label", t("aria.victory"));
  els.defeatOverlay?.querySelector(".outcome-panel")?.setAttribute("aria-label", t("aria.defeat"));

  document.querySelector('[data-move="up"]')?.setAttribute("aria-label", t("aria.moveUp"));
  document.querySelector('[data-move="down"]')?.setAttribute("aria-label", t("aria.moveDown"));
  document.querySelector('[data-move="left"]')?.setAttribute("aria-label", t("aria.moveLeft"));
  document.querySelector('[data-move="right"]')?.setAttribute("aria-label", t("aria.moveRight"));
  els.helpBtn?.setAttribute("aria-label", t("actions.help"));
  els.helpBtn?.setAttribute("title", t("actions.help"));
  document.querySelectorAll(".modal .icon-button[type='submit']").forEach((button) => {
    button.setAttribute("aria-label", t("actions.close"));
  });

  els.helpList.innerHTML = "";
  tList("help.lines").forEach((line) => {
    const item = document.createElement("p");
    item.textContent = line;
    els.helpList.appendChild(item);
  });
}

function setText(target, value) {
  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (element) {
    element.textContent = value;
  }
}

function setButtonLabel(button, value) {
  const label = button?.querySelector("span");
  if (label) {
    label.textContent = value;
  } else if (button) {
    button.textContent = value;
  }
}

function renderAll() {
  if (!state.player) {
    return;
  }

  renderStaticText();
  renderMap();
  renderStats();
  renderSkills();
  renderDifficulty();
  renderTargetInfo();
  renderSaveSlots();
  renderLog();
  renderShopAccess();
  renderShop();
}

function renderMap() {
  const floor = getCurrentFloor();
  els.floorName.textContent = getFloorDisplayName(floor);
  els.mapGrid.innerHTML = "";
  els.mapGrid.classList.toggle("map-shake", isBossCombatActive());

  for (let y = 0; y < MAP_SIZE; y += 1) {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      const tile = getTile(floor, x, y);
      const entity = getEntity(floor, x, y);
      const combatEffect = getCombatEffectAt(state.animation, x, y);
      const visible = isTileVisible(x, y);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tile ${visible ? tileClass(tile, entity) : "fog-hidden"}`;
      button.dataset.x = String(x);
      button.dataset.y = String(y);
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", visible ? describeCell(tile, entity, x, y) : t("status.hiddenTile"));

      if (!visible) {
        button.disabled = true;
        els.mapGrid.appendChild(button);
        continue;
      }

      appendTileImage(button, ASSETS.tiles[tile] ?? ASSETS.tiles[TILE.FLOOR], "tile-base");

      if (combatEffect) {
        button.classList.add("combat-hit", `combat-${combatEffect.kind}`);
        appendEffectEnemy(button, combatEffect);
      }

      if (state.player.x === x && state.player.y === y) {
        button.classList.add("player");
        const heroSprite = appendActorSprite(button, ASSETS.sprites.hero, "hero", state.animation.heroAction, state.animation.heroFacing);
        if (state.combatAnimation.active) {
          heroSprite.style.setProperty("--action-duration", `${state.combatAnimation.duration}ms`);
        }
      } else if (entity?.type === "enemy") {
        const isActiveEnemy = state.combatAnimation.active
          && state.combatAnimation.enemyX === x
          && state.combatAnimation.enemyY === y;
        const enemySprite = appendActorSprite(
          button,
          ENEMY_DEFS[entity.id].sprite,
          "enemy",
          isActiveEnemy ? ACTIONS.ATTACK : ACTIONS.IDLE,
          isActiveEnemy ? getEnemyFacingForCombat() : "down",
          [`enemy-type-${entity.id}`]
        );
        if (isActiveEnemy) {
          enemySprite.style.setProperty("--action-duration", `${state.combatAnimation.duration}ms`);
        }
        appendEnemyHud(button, entity.id, isActiveEnemy ? {
          hpFrom: state.combatAnimation.hpFrom,
          hpTo: state.combatAnimation.hpTo,
          damage: state.combatAnimation.damage
        } : null);
      } else if (entity?.type === "item") {
        appendTileImage(button, ITEM_DEFS[entity.id].asset, "tile-entity item-entity");
      }

      if (Math.abs(state.player.x - x) + Math.abs(state.player.y - y) === 1) {
        button.classList.add("reachable");
      }

      if (combatEffect) {
        appendCombatBurst(button, combatEffect);
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

function appendActorSprite(parent, src, role, action, facing = "down", extraClasses = []) {
  const sprite = createActorSprite(src, { action, facing, role });
  extraClasses.forEach((className) => sprite.classList.add(className));
  parent.appendChild(sprite);
  return sprite;
}

function appendEnemyHud(parent, enemyId, hpDrop = null) {
  const enemy = getEnemyDef(enemyId, state.player.difficulty);
  const hpPercent = hpDrop?.hpTo ?? 100;
  const hpStart = hpDrop?.hpFrom ?? hpPercent;
  const hpClass = hpPercent > 60 ? "hp-high" : hpPercent > 30 ? "hp-mid" : "hp-low";
  const bar = document.createElement("span");
  bar.className = "enemy-hp-bar";
  bar.setAttribute("aria-hidden", "true");
  const fill = document.createElement("span");
  fill.className = `enemy-hp-fill ${hpClass}`;
  fill.style.width = `${hpStart}%`;
  bar.appendChild(fill);
  if (hpDrop) {
    window.requestAnimationFrame(() => {
      fill.style.width = `${hpPercent}%`;
    });
  }

  const name = document.createElement("span");
  name.className = "enemy-name";
  name.textContent = enemyName(enemyId);

  const preview = previewBattle(state.player, enemyId, state.skills);
  const tooltip = document.createElement("span");
  tooltip.className = `enemy-tooltip ${preview.canWin ? "can-win" : "danger"}`;
  tooltip.textContent = `${enemyName(enemyId)} | ${t("stats.hp")} ${enemy.hp} ${t("stats.atk")} ${enemy.atk} ${t("stats.def")} ${enemy.def} | ${t("target.expectedLoss")} ${preview.expectedLoss}`;

  parent.append(bar, name, tooltip);
  if (hpDrop?.damage) {
    const damage = document.createElement("span");
    damage.className = "damage-number";
    damage.textContent = `-${hpDrop.damage}`;
    damage.setAttribute("aria-hidden", "true");
    parent.appendChild(damage);
  }
}

function appendEffectEnemy(parent, effect) {
  if (!effect.enemySprite) {
    return;
  }

  const ghost = createActorSprite(effect.enemySprite, { action: ACTIONS.IDLE, role: "enemy" });
  ghost.classList.add("effect-enemy-ghost");
  if (effect.defeated) {
    ghost.classList.add("effect-defeated");
  }
  parent.appendChild(ghost);
}

function appendCombatBurst(parent, effect) {
  const burst = document.createElement("span");
  burst.className = `combat-effect effect-${effect.kind} direction-${effect.direction}`;
  burst.setAttribute("aria-hidden", "true");
  parent.appendChild(burst);
}

function tileClass(tile, entity) {
  if (entity?.type === "enemy") {
    return ENEMY_DEFS[entity.id].isBoss ? "enemy boss" : "enemy";
  }

  if (entity?.type === "item") {
    return `item item-${entity.id}`;
  }

  const classMap = {
    [TILE.WALL]: "wall",
    [TILE.FLOOR]: "floor",
    [TILE.YELLOW_DOOR]: "door-yellow",
    [TILE.BLUE_DOOR]: "door-blue",
    [TILE.RED_DOOR]: "door-red",
    [TILE.STAIR_DOWN]: "stair-down",
    [TILE.STAIR_UP]: "stair-up",
    [TILE.SHOP]: "shop",
    [TILE.CURSE]: "curse"
  };

  return classMap[tile] ?? "floor";
}

function describeCell(tile, entity, x, y) {
  if (state.player.x === x && state.player.y === y) {
    return t("status.currentPosition");
  }

  if (entity?.type === "item") {
    return itemText(entity.id).name;
  }

  if (entity?.type === "enemy") {
    return enemyName(entity.id);
  }

  const names = {
    [TILE.WALL]: tileText("wall"),
    [TILE.FLOOR]: tileText("floor"),
    [TILE.YELLOW_DOOR]: tileText("yellowDoor"),
    [TILE.BLUE_DOOR]: tileText("blueDoor"),
    [TILE.RED_DOOR]: tileText("redDoor"),
    [TILE.STAIR_DOWN]: tileText("stairDown"),
    [TILE.STAIR_UP]: tileText("stairUp"),
    [TILE.SHOP]: tileText("shop"),
    [TILE.CURSE]: tileText("curse")
  };

  return names[tile] ?? tileText("floor");
}

function renderStats() {
  const player = state.player;
  els.heroLevel.textContent = `LV ${player.lvl}`;
  els.statHp.textContent = player.maxHp ? `${player.hp}/${player.maxHp}` : player.hp;
  els.statAtk.textContent = player.atk;
  els.statDef.textContent = player.def;
  els.statGold.textContent = player.gold;
  els.statExp.textContent = player.exp;
  els.statFloor.textContent = player.floor + 1;
  els.keyYellow.textContent = player.keys.yellow;
  els.keyBlue.textContent = player.keys.blue;
  els.keyRed.textContent = player.keys.red;
}

function renderSkills() {
  if (!els.skillBar || !state.skills) {
    return;
  }

  els.skillBar.innerHTML = "";
  const skills = getAllSkills();
  const learnedSkills = skills.filter((skill) => isSkillLearned(state.skills, skill.id));

  if (learnedSkills.length === 0) {
    const empty = document.createElement("p");
    empty.className = "skill-empty";
    empty.textContent = t("skills.empty");
    els.skillBar.appendChild(empty);
    return;
  }

  learnedSkills.forEach((skill, index) => {
    const cooldown = getSkillCooldown(state.skills, skill.id);
    const active = Boolean(state.skills.active?.[skill.id]);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `skill-button ${active ? "armed" : ""}`;
    button.dataset.skill = skill.id;
    button.disabled = active || !isSkillReady(state.skills, skill.id) || state.gameOver || state.won || state.combatAnimation.active;
    const text = skillText(skill.id);
    button.innerHTML = `
      <span class="skill-icon">${skill.asset ? `<img src="${skill.asset}" alt="" aria-hidden="true">` : skill.icon}</span>
      <span class="skill-meta">
        <strong>${index + 1}. ${text.shortName}</strong>
        <small>${active ? t("status.armed") : cooldown > 0 ? t("status.cooldown", { turns: cooldown }) : t("status.ready")}</small>
      </span>
    `;
    els.skillBar.appendChild(button);
  });
}

function useSkillByIndex(index) {
  const learnedSkills = getAllSkills().filter((skill) => isSkillLearned(state.skills, skill.id));
  const skill = learnedSkills[index];
  if (skill) {
    useSkillById(skill.id);
  }
}

function useSkillById(skillId) {
  if (!skillId || state.gameOver || state.won || state.combatAnimation.active) {
    return;
  }

  if (state.skills.active?.[skillId]) {
    addLog(t("logs.skillAlreadyArmed"), "warn");
    playSound("blocked");
    renderAll();
    return;
  }

  const result = useSkill(state.player, state.skills, skillId);
  addLog(result.message, result.ok ? "good" : "warn");
  if (result.ok) {
    playSound(skillId === "shield" ? "shield" : "skill");
  } else {
    playSound("blocked");
  }
  renderAll();
}

function recordStep() {
  state.moveCount += 1;
  tickSkillCooldowns(state.skills);
}

function applyCurseTile(floor, x, y) {
  const hpLoss = Math.min(Math.max(1, state.player.hp - 1), Math.max(35, Math.round((state.player.maxHp ?? state.player.hp) * 0.08)));
  const atkLoss = Math.min(Math.max(0, state.player.atk - 1), 2 + Math.floor(state.player.floor / 2));
  const defLoss = Math.min(Math.max(0, state.player.def - 1), 2 + Math.floor(state.player.floor / 2));

  state.player.hp = Math.max(1, state.player.hp - hpLoss);
  state.player.atk = Math.max(1, state.player.atk - atkLoss);
  state.player.def = Math.max(1, state.player.def - defLoss);
  setTile(floor, x, y, TILE.FLOOR);
  addLog(t("logs.curse", { hp: hpLoss, atk: atkLoss, def: defLoss }), "bad");
  playSound("hit");
}

function renderDifficulty() {
  const current = normalizeDifficulty(state.player?.difficulty ?? state.difficulty);
  state.difficulty = current;
  const difficulty = difficultyText(current);

  els.difficultyGroup?.querySelectorAll("[data-difficulty]").forEach((button) => {
    const active = button.dataset.difficulty === current;
    button.setAttribute("aria-pressed", String(active));
    button.textContent = difficultyText(button.dataset.difficulty).label;
  });

  if (els.difficultyHint) {
    els.difficultyHint.textContent = difficulty.description;
  }
}

function renderTargetInfo(x = null, y = null) {
  const floor = getCurrentFloor();
  const target = x === null || y === null ? getForwardTarget() : { x, y };

  if (!target) {
    els.targetInfo.textContent = t("status.noTarget");
    return;
  }

  if (!isTileVisible(target.x, target.y)) {
    els.targetInfo.textContent = t("status.hiddenTile");
    return;
  }

  const tile = getTile(floor, target.x, target.y);
  const entity = getEntity(floor, target.x, target.y);

  if (entity?.type === "enemy") {
    const preview = previewBattle(state.player, entity.id, state.skills);
    els.targetInfo.innerHTML = `
      <div class="target-row"><span>${enemyName(entity.id)}</span><strong>${preview.canWin ? t("status.canFight") : t("status.danger")}</strong></div>
      <div class="target-row"><span>${t("stats.hp")} / ${t("stats.atk")} / ${t("stats.def")}</span><strong>${preview.enemy.hp} / ${preview.enemy.atk} / ${preview.enemy.def}</strong></div>
      <div class="target-row"><span>${t("target.expectedLoss")}</span><strong>${preview.expectedLoss} ${t("stats.hp")}</strong></div>
      <div class="target-row"><span>${t("target.reward")}</span><strong>${t("target.rewardValue", { gold: preview.enemy.gold, exp: preview.enemy.exp })}</strong></div>
    `;
    return;
  }

  if (entity?.type === "item") {
    const item = itemText(entity.id);
    els.targetInfo.innerHTML = `<div class="target-row"><span>${item.name}</span><strong>${item.description}</strong></div>`;
    return;
  }

  if (DOOR_TO_KEY[tile]) {
    const keyType = DOOR_TO_KEY[tile];
    els.targetInfo.innerHTML = `<div class="target-row"><span>${doorName(keyType)}</span><strong>${t("status.holdKey", { count: state.player.keys[keyType] })}</strong></div>`;
    return;
  }

  if (tile === TILE.STAIR_DOWN) {
    els.targetInfo.innerHTML = `<div class="target-row"><span>${tileText("stairDown")}</span><strong>${floor.bossDefeated ? t("status.stairUnlocked") : t("status.stairLocked")}</strong></div>`;
    return;
  }

  if (tile === TILE.STAIR_UP) {
    els.targetInfo.innerHTML = `<div class="target-row"><span>${tileText("stairUp")}</span><strong>${t("status.returnPrevious")}</strong></div>`;
    return;
  }

  if (tile === TILE.SHOP) {
    els.targetInfo.innerHTML = `<div class="target-row"><span>${tileText("shop")}</span><strong>${t("status.shopEnter")}</strong></div>`;
    return;
  }

  if (tile === TILE.CURSE) {
    els.targetInfo.innerHTML = `<div class="target-row"><span>${tileText("curse")}</span><strong>${t("status.curseEffect")}</strong></div>`;
    return;
  }

  els.targetInfo.textContent = t("status.noSpecialTarget");
}

function getForwardTarget() {
  const floor = getCurrentFloor();
  const facingDelta = DIRECTIONS[state.animation.heroFacing] ?? DIRECTIONS.down;
  const adjacent = [facingDelta, ...Object.values(DIRECTIONS).filter((delta) => delta !== facingDelta)]
    .map((delta) => ({ x: state.player.x + delta.x, y: state.player.y + delta.y }))
    .filter((pos) => isInsideMap(pos.x, pos.y));

  return adjacent.find((pos) => {
    const tile = getTile(floor, pos.x, pos.y);
    return getEntity(floor, pos.x, pos.y)
      || DOOR_TO_KEY[tile]
      || tile === TILE.STAIR_DOWN
      || tile === TILE.STAIR_UP
      || tile === TILE.SHOP
      || tile === TILE.CURSE;
  }) ?? null;
}

function getDirectionTo(x, y) {
  const dx = x - state.player.x;
  const dy = y - state.player.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) {
    return null;
  }

  return Object.entries(DIRECTIONS).find(([, delta]) => delta.x === dx && delta.y === dy)?.[0] ?? null;
}

function getEnemyFacingForCombat() {
  const opposite = {
    up: "down",
    down: "up",
    left: "right",
    right: "left"
  };
  return opposite[state.combatAnimation.playerDirection] ?? "down";
}

function isBossCombatActive() {
  if (!state.combatAnimation.active || !state.combatAnimation.enemyId) {
    return false;
  }
  return Boolean(ENEMY_DEFS[state.combatAnimation.enemyId]?.isBoss);
}

function getShopActionTarget() {
  const floor = getCurrentFloor();
  if (getTile(floor, state.player.x, state.player.y) === TILE.SHOP) {
    return { x: state.player.x, y: state.player.y };
  }

  return Object.values(DIRECTIONS)
    .map((delta) => ({ x: state.player.x + delta.x, y: state.player.y + delta.y }))
    .filter((pos) => isInsideMap(pos.x, pos.y))
    .find((pos) => getTile(floor, pos.x, pos.y) === TILE.SHOP) ?? null;
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
  if (isTutorialActive()) {
    addLog(t("logs.tutorialBlocked"), "warn");
    return;
  }

  if (!canUseShop()) {
    addLog(t("logs.shopNeedOnTile"), "warn");
    playSound("blocked");
    renderShopAccess();
    return;
  }

  renderShop();
  if (!els.shopDialog.open) {
    playSound("shop");
    playBgm("shop");
    els.shopDialog.showModal();
  }
}

function renderShopAccess() {
  if (!state.player) {
    return;
  }

  const available = Boolean(getShopActionTarget()) && !state.gameOver && !state.won;
  els.shopBtn.disabled = !available;
  els.shopBtn.classList.toggle("active", available);
  els.shopPrompt.hidden = !available;
}

function canUseShop() {
  if (!state.player || state.gameOver || state.won) {
    return false;
  }

  return getTile(getCurrentFloor(), state.player.x, state.player.y) === TILE.SHOP;
}

function scheduleShopAutoOpen() {
  clearShopAutoOpen();
  state.shopAutoOpenTimer = window.setTimeout(() => {
    state.shopAutoOpenTimer = 0;
    if (canUseShop() && !els.shopDialog.open) {
      openShop();
    }
  }, 300);
}

function clearShopAutoOpen() {
  window.clearTimeout(state.shopAutoOpenTimer);
  state.shopAutoOpenTimer = 0;
}

function isModalOpen() {
  return Boolean(els.shopDialog?.open || els.helpDialog?.open);
}

function renderShop() {
  if (!els.shopItems || !state.player) {
    return;
  }

  els.shopItems.innerHTML = "";
  SHOP_OPTIONS.forEach((option) => {
    const cost = getShopCost(option.id, state.shop, state.player.difficulty);
    const learned = option.type === "skill" && isSkillLearned(state.skills, option.skillId);
    const text = shopOptionText(option);
    const item = document.createElement("article");
    item.className = `shop-item ${option.type === "skill" ? "shop-skill" : ""}`;
    item.innerHTML = `
      <div>
        <h3>${text.name}</h3>
        <p>${text.description} · ${t("actions.buy", { cost })} · ${option.type === "skill" ? (learned ? t("actions.learned") : t("status.untrained")) : t("status.boughtCount", { count: state.shop[option.id] ?? 0 })}</p>
      </div>
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "buy-button";
    button.textContent = learned ? t("actions.learned") : t("actions.buy", { cost });
    button.disabled = learned || state.player.gold < cost || state.gameOver || state.won;
    button.addEventListener("click", () => {
      const result = buyShopOption(state.player, state.shop, option.id, state.skills);
      addLog(result.message, result.ok ? "good" : "warn");
      playSound(result.ok ? "levelUp" : "blocked");
      renderAll();
    });

    item.appendChild(button);
    els.shopItems.appendChild(item);
  });

  els.shopHint.textContent = t(state.player.difficulty === "nightmare" ? "logs.shopGoldNightmare" : "logs.shopGold", {
    gold: state.player.gold
  });
}

function showVictoryScreen() {
  playSound("victory");
  playBgm("victory");
  if (!els.victoryOverlay) {
    return;
  }

  const elapsed = formatElapsed(Date.now() - state.startedAt);
  els.victoryStats.innerHTML = `
    <div><span>${t("stats.time")}</span><strong>${elapsed}</strong></div>
    <div><span>${t("stats.hp")}</span><strong>${state.player.hp}</strong></div>
    <div><span>${t("stats.gold")}</span><strong>${state.player.gold}</strong></div>
    <div><span>${t("stats.level")}</span><strong>${state.player.lvl}</strong></div>
    <div><span>${t("stats.steps")}</span><strong>${state.moveCount}</strong></div>
    <div><span>${t("stats.seed")}</span><strong>${state.seed}</strong></div>
  `;
  els.victoryOverlay.hidden = false;
}

function showDefeatScreen(reason) {
  playSound("defeat");
  playBgm("defeat");
  if (els.defeatReason) {
    els.defeatReason.textContent = reason || t("logs.defeatDefault");
  }
  if (els.defeatOverlay) {
    els.defeatOverlay.hidden = false;
  }
}

function hideOutcomeScreens() {
  if (els.victoryOverlay) {
    els.victoryOverlay.hidden = true;
  }
  if (els.defeatOverlay) {
    els.defeatOverlay.hidden = true;
  }
}

function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function shareSeed() {
  const text = `Magic Tower seed: ${state.seed}`;
  if (!navigator.clipboard?.writeText) {
    addLog(text, "good");
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => addLog(t("logs.seedCopied"), "good"))
    .catch(() => addLog(text, "good"));
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
    saveButton.textContent = t("actions.save");
    saveButton.addEventListener("click", () => saveGame(slot));

    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "slot-button";
    loadButton.textContent = t("actions.load");
    loadButton.disabled = !localStorage.getItem(slotKey(slot));
    loadButton.addEventListener("click", () => loadGame(slot));

    row.append(label, saveButton, loadButton);
    els.saveSlots.appendChild(row);
  }
}

function getSlotLabel(slot) {
  const raw = localStorage.getItem(slotKey(slot));
  if (!raw) {
    return t("logs.emptySlot", { slot });
  }

  try {
    const data = JSON.parse(raw);
    const savedAt = new Date(data.savedAt).toLocaleString(getLanguage() === "zh" ? "zh-CN" : "en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
    return `${getLanguage() === "zh" ? "槽" : "Slot"} ${slot}: ${data.floorName ?? t("logs.unknownFloor")} ${savedAt}`;
  } catch {
    return t("logs.badSlot", { slot });
  }
}

function saveGame(slot) {
  const payload = {
    version: 6,
    savedAt: new Date().toISOString(),
    floorName: getFloorDisplayName(getCurrentFloor()),
    difficulty: state.difficulty,
    seed: state.seed,
    moveCount: state.moveCount,
    startedAt: state.startedAt,
    player: state.player,
    floors: state.floors,
    shop: state.shop,
    skills: state.skills,
    logs: state.logs.slice(-40),
    defeatReason: state.defeatReason,
    gameOver: state.gameOver,
    won: state.won
  };

  localStorage.setItem(slotKey(slot), JSON.stringify(payload));
  addLog(t("logs.saved", { slot }), "good");
  renderSaveSlots();
}

function loadGame(slot) {
  const raw = localStorage.getItem(slotKey(slot));
  if (!raw) {
    addLog(t("logs.noSave", { slot }), "warn");
    return;
  }

  try {
    const data = JSON.parse(raw);
    if (!isValidSave(data)) {
      throw new Error("Invalid save data");
    }

    state.difficulty = normalizeDifficulty(data.difficulty ?? data.player.difficulty);
    state.seed = String(data.seed ?? createGameSeed());
    state.player = {
      ...data.player,
      difficulty: state.difficulty,
      maxHp: data.player.maxHp ?? Math.max(520, data.player.hp)
    };
    state.floors = data.floors;
    state.shop = { ...createShopState(), ...data.shop };
    state.skills = normalizeSkillState(data.skills);
    state.logs = data.logs ?? [];
    clearVisualTimers();
    state.animation = createAnimationState();
    state.combatAnimation = createCombatAnimationState();
    state.moveCount = data.moveCount ?? 0;
    state.startedAt = data.startedAt ?? Date.now();
    state.defeatReason = data.defeatReason ?? "";
    state.gameOver = Boolean(data.gameOver);
    state.won = Boolean(data.won);
    hideOutcomeScreens();
    localStorage.setItem(DIFFICULTY_KEY, state.difficulty);
    addLog(t("logs.loaded", { slot }), "good");
    renderAll();
  } catch {
    addLog(t("logs.loadFailed", { slot }), "bad");
  }
}

function isValidSave(data) {
  return data
    && [2, 3, 4, 6].includes(data.version)
    && data.player
    && Array.isArray(data.floors)
    && data.floors.length >= 5
    && data.shop;
}

function slotKey(slot) {
  return `${SAVE_PREFIX}${slot}`;
}
