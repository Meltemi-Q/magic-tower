export const ACTIONS = Object.freeze({
  IDLE: "idle",
  WALK: "walk",
  ATTACK: "attack"
});

const ACTION_ROWS = Object.freeze({
  [ACTIONS.IDLE]: "0%",
  [ACTIONS.WALK]: "50%",
  [ACTIONS.ATTACK]: "100%"
});

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

export function setHeroAction(animation, action, facing = null) {
  animation.heroAction = normalizeAction(action);
  if (facing) {
    animation.heroFacing = facing;
  }
}

export function resetHeroAction(animation) {
  animation.heroAction = ACTIONS.IDLE;
}

export function getActionDuration(action) {
  return ACTION_DURATIONS[normalizeAction(action)];
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
  node.className = `actor-sprite actor-${role} action-${normalizeAction(action)} facing-${facing}`;
  node.setAttribute("aria-hidden", "true");
  node.style.backgroundImage = `url("${src}")`;
  node.style.setProperty("--sprite-y", ACTION_ROWS[normalizeAction(action)]);
  return node;
}

function normalizeAction(action) {
  return Object.values(ACTIONS).includes(action) ? action : ACTIONS.IDLE;
}
