import { t } from "./i18n.js";

export const SKILL_IDS = Object.freeze({
  POWER_STRIKE: "powerStrike",
  HEAL: "heal",
  SHIELD: "shield"
});

export const SKILL_DEFS = Object.freeze({
  [SKILL_IDS.POWER_STRIKE]: {
    id: SKILL_IDS.POWER_STRIKE,
    name: "Power Strike",
    shortName: "Strike",
    icon: "PS",
    asset: "assets/skill_power_strike.svg",
    description: "Next attack deals double damage.",
    cooldown: 3,
    trainCost: 36
  },
  [SKILL_IDS.HEAL]: {
    id: SKILL_IDS.HEAL,
    name: "Heal",
    shortName: "Heal",
    icon: "HL",
    asset: "assets/skill_heal.svg",
    description: "Restore 30% of max HP.",
    cooldown: 5,
    trainCost: 44
  },
  [SKILL_IDS.SHIELD]: {
    id: SKILL_IDS.SHIELD,
    name: "Shield",
    shortName: "Shield",
    icon: "SH",
    asset: "assets/skill_shield.svg",
    description: "Next incoming hit is reduced by half.",
    cooldown: 5,
    trainCost: 40
  }
});

export function createSkillState() {
  return {
    learned: {},
    cooldowns: {},
    active: {
      [SKILL_IDS.POWER_STRIKE]: false,
      [SKILL_IDS.SHIELD]: false
    }
  };
}

export function normalizeSkillState(skillState = {}) {
  return {
    ...createSkillState(),
    ...skillState,
    learned: { ...skillState.learned },
    cooldowns: { ...skillState.cooldowns },
    active: {
      ...createSkillState().active,
      ...skillState.active
    }
  };
}

export function getAllSkills() {
  return Object.values(SKILL_DEFS);
}

export function getSkillDef(skillId) {
  return SKILL_DEFS[skillId] ?? null;
}

export function isSkillLearned(skillState, skillId) {
  return Boolean(skillState?.learned?.[skillId]);
}

export function isSkillReady(skillState, skillId) {
  return isSkillLearned(skillState, skillId) && getSkillCooldown(skillState, skillId) <= 0;
}

export function getSkillCooldown(skillState, skillId) {
  return Math.max(0, skillState?.cooldowns?.[skillId] ?? 0);
}

export function learnSkill(skillState, skillId) {
  const skill = getSkillDef(skillId);
  if (!skill) {
    return { ok: false, message: t("skills.unknown") };
  }

  if (isSkillLearned(skillState, skillId)) {
    return { ok: false, message: t("logs.skillComplete", { skill: t(`skills.${skillId}.name`) }) };
  }

  skillState.learned[skillId] = true;
  skillState.cooldowns[skillId] = 0;
  return { ok: true, message: t(`skills.${skillId}.learned`) };
}

export function useSkill(player, skillState, skillId) {
  const skill = getSkillDef(skillId);
  if (!skill) {
    return { ok: false, message: t("skills.unknown") };
  }

  if (!isSkillLearned(skillState, skillId)) {
    return { ok: false, message: t(`skills.${skillId}.untrained`) };
  }

  const cooldown = getSkillCooldown(skillState, skillId);
  if (cooldown > 0) {
    return { ok: false, message: t(`skills.${skillId}.cooldown`, { turns: cooldown }) };
  }

  if (skillId === SKILL_IDS.POWER_STRIKE) {
    skillState.active[SKILL_IDS.POWER_STRIKE] = true;
    skillState.cooldowns[skillId] = skill.cooldown;
    return { ok: true, message: t("skills.powerStrike.ready") };
  }

  if (skillId === SKILL_IDS.HEAL) {
    const maxHp = Math.max(1, player.maxHp ?? player.hp);
    const amount = Math.max(1, Math.round(maxHp * 0.3));
    player.hp += amount;
    skillState.cooldowns[skillId] = skill.cooldown;
    return { ok: true, message: t("skills.heal.ready", { amount }) };
  }

  if (skillId === SKILL_IDS.SHIELD) {
    skillState.active[SKILL_IDS.SHIELD] = true;
    skillState.cooldowns[skillId] = skill.cooldown;
    return { ok: true, message: t("skills.shield.ready") };
  }

  return { ok: false, message: t("skills.unknown") };
}

export function tickSkillCooldowns(skillState) {
  if (!skillState?.cooldowns) {
    return;
  }

  Object.keys(skillState.cooldowns).forEach((skillId) => {
    skillState.cooldowns[skillId] = Math.max(0, skillState.cooldowns[skillId] - 1);
  });
}

export function consumePowerStrike(skillState) {
  if (!skillState?.active?.[SKILL_IDS.POWER_STRIKE]) {
    return false;
  }

  skillState.active[SKILL_IDS.POWER_STRIKE] = false;
  return true;
}

export function consumeShield(skillState) {
  if (!skillState?.active?.[SKILL_IDS.SHIELD]) {
    return false;
  }

  skillState.active[SKILL_IDS.SHIELD] = false;
  return true;
}
