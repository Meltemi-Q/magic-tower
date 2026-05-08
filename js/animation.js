export const ACTIONS = Object.freeze({
  IDLE: "idle",
  WALK: "walk",
  ATTACK: "attack"
});

const ACTION_ROW_OFFSETS = Object.freeze({
  [ACTIONS.IDLE]: "0%",
  [ACTIONS.WALK]: "-33.333333%",
  [ACTIONS.ATTACK]: "-66.666667%"
});

const ACTION_INDEX = Object.freeze({
  [ACTIONS.IDLE]: 0,
  [ACTIONS.WALK]: 1,
  [ACTIONS.ATTACK]: 2
});

const FACING_INDEX = Object.freeze({
  down: 0,
  left: 1,
  right: 2,
  up: 3
});

const HERO_FACING_COUNT = 4;
const HERO_ROW_COUNT = Object.keys(ACTION_INDEX).length * HERO_FACING_COUNT;

const ACTION_DURATIONS = Object.freeze({
  [ACTIONS.IDLE]: 960,
  [ACTIONS.WALK]: 520,
  [ACTIONS.ATTACK]: 420
});

export function createAnimationState() {
  return {
    heroAction: ACTIONS.IDLE,
    heroFacing: "down",
    effects: []
  };
}

export function createCombatAnimationState() {
  return {
    active: false,
    enemyX: 0,
    enemyY: 0,
    enemyId: null,
    playerDirection: null,
    startTime: 0,
    duration: 500,
    hpFrom: 100,
    hpTo: 100,
    damage: 0
  };
}

export function setHeroAction(animation, action, facing = null) {
  animation.heroAction = normalizeAction(action);
  if (facing) {
    animation.heroFacing = normalizeFacing(facing);
  }
}

export function resetHeroAction(animation) {
  animation.heroAction = ACTIONS.IDLE;
}

export function getActionDuration(action) {
  return ACTION_DURATIONS[normalizeAction(action)];
}

export function calculateCombatDuration(enemy) {
  const hpFactor = Math.min(200, Math.floor((enemy?.hp ?? 0) / 50) * 20);
  const atkFactor = Math.min(100, Math.floor((enemy?.atk ?? 0) / 10) * 10);
  const bossFactor = enemy?.isBoss ? 100 : 0;
  return 300 + hpFactor + atkFactor + bossFactor;
}

export function startCombatAnimation(combatAnimation, {
  enemyX,
  enemyY,
  enemyId,
  playerDirection,
  duration,
  hpFrom = 100,
  hpTo = 0,
  damage = 0
}) {
  combatAnimation.active = true;
  combatAnimation.enemyX = enemyX;
  combatAnimation.enemyY = enemyY;
  combatAnimation.enemyId = enemyId;
  combatAnimation.playerDirection = playerDirection;
  combatAnimation.startTime = Date.now();
  combatAnimation.duration = duration;
  combatAnimation.hpFrom = hpFrom;
  combatAnimation.hpTo = hpTo;
  combatAnimation.damage = damage;
}

export function resetCombatAnimation(combatAnimation) {
  Object.assign(combatAnimation, createCombatAnimationState());
}

export function addCombatEffect(animation, effect) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  animation.effects.push({
    id,
    type: "combat",
    kind: "slash",
    defeated: true,
    ...effect
  });
  return id;
}

export function removeCombatEffect(animation, id) {
  animation.effects = animation.effects.filter((effect) => effect.id !== id);
}

export function getCombatEffectAt(animation, x, y) {
  return animation.effects.find((effect) => effect.type === "combat" && effect.x === x && effect.y === y) ?? null;
}

export function createActorSprite(src, { action = ACTIONS.IDLE, facing = "down", role = "enemy" } = {}) {
  const node = document.createElement("span");
  const normalizedAction = normalizeAction(action);
  const normalizedFacing = normalizeFacing(facing);
  node.className = `actor-sprite actor-${role} action-${normalizedAction} facing-${normalizedFacing}`;
  node.setAttribute("aria-hidden", "true");
  node.style.backgroundImage = `url("${src}")`;
  node.style.setProperty("--sprite-row-offset", role === "hero"
    ? getHeroSpriteRowOffset(normalizedAction, normalizedFacing)
    : ACTION_ROW_OFFSETS[normalizedAction]);
  return node;
}

function normalizeAction(action) {
  return Object.values(ACTIONS).includes(action) ? action : ACTIONS.IDLE;
}

function normalizeFacing(facing) {
  return Object.prototype.hasOwnProperty.call(FACING_INDEX, facing) ? facing : "down";
}

function getHeroSpriteRowOffset(action, facing) {
  const actionIndex = ACTION_INDEX[normalizeAction(action)] ?? ACTION_INDEX[ACTIONS.IDLE];
  const facingIndex = FACING_INDEX[normalizeFacing(facing)];
  const rowIndex = actionIndex * HERO_FACING_COUNT + facingIndex;
  return `${-(rowIndex / HERO_ROW_COUNT) * 100}%`;
}
