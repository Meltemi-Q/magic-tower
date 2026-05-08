import { t, shopOptionText, skillText } from "./i18n.js";
import { getDifficulty } from "./map.js";
import { getAllSkills, isSkillLearned, learnSkill } from "./skills.js";

export const SHOP_OPTIONS = Object.freeze([
  {
    id: "hp",
    baseCost: 12,
    growth: 8,
    apply(player) {
      player.hp += 100;
    }
  },
  {
    id: "atk",
    baseCost: 24,
    growth: 12,
    apply(player) {
      player.atk += 5;
    }
  },
  {
    id: "def",
    baseCost: 20,
    growth: 10,
    apply(player) {
      player.def += 5;
    }
  },
  ...getAllSkills().map((skill) => ({
    id: `skill:${skill.id}`,
    type: "skill",
    skillId: skill.id,
    baseCost: skill.trainCost,
    growth: 0
  }))
]);

export function createShopState() {
  return SHOP_OPTIONS.reduce((state, option) => {
    state[option.id] = 0;
    return state;
  }, {});
}

export function getShopCost(optionId, shopState, difficultyId = "normal") {
  const option = SHOP_OPTIONS.find((item) => item.id === optionId);
  if (!option) {
    throw new Error(`Unknown shop option: ${optionId}`);
  }

  const multiplier = getDifficulty(difficultyId).shopCostMultiplier ?? 1;
  return Math.ceil((option.baseCost + option.growth * (shopState[optionId] ?? 0)) * multiplier);
}

export function buyShopOption(player, shopState, optionId, skillState = null) {
  const option = SHOP_OPTIONS.find((item) => item.id === optionId);
  if (!option) {
    return { ok: false, message: t("logs.shopNoItem") };
  }

  if (option.type === "skill" && !skillState) {
    return { ok: false, message: t("logs.skillUnavailable") };
  }

  if (option.type === "skill" && isSkillLearned(skillState, option.skillId)) {
    return { ok: false, message: t("logs.skillComplete", { skill: skillText(option.skillId).name }) };
  }

  const cost = getShopCost(optionId, shopState, player.difficulty);
  if (player.gold < cost) {
    return { ok: false, message: t("logs.noGold", { cost }) };
  }

  player.gold -= cost;
  if (option.type === "skill") {
    const result = learnSkill(skillState, option.skillId);
    if (!result.ok) {
      player.gold += cost;
      return result;
    }
  } else {
    const previousMaxHp = player.maxHp ?? player.hp;
    option.apply(player);
    if (option.id === "hp") {
      player.maxHp = previousMaxHp + 100;
    }
  }
  shopState[optionId] = (shopState[optionId] ?? 0) + 1;

  const optionText = shopOptionText(option);
  return {
    ok: true,
    message: t("logs.bought", {
      name: optionText.name,
      cost,
      description: optionText.description
    })
  };
}
