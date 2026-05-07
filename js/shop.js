// 商店模块无 UI 依赖，只负责价格、扣款和属性成长。
export const SHOP_OPTIONS = Object.freeze([
  {
    id: "hp",
    name: "生命训练",
    description: "HP +100",
    baseCost: 12,
    growth: 8,
    apply(player) {
      player.hp += 100;
    }
  },
  {
    id: "atk",
    name: "攻击训练",
    description: "ATK +5",
    baseCost: 24,
    growth: 12,
    apply(player) {
      player.atk += 5;
    }
  },
  {
    id: "def",
    name: "防御训练",
    description: "DEF +5",
    baseCost: 20,
    growth: 10,
    apply(player) {
      player.def += 5;
    }
  }
]);

export function createShopState() {
  return SHOP_OPTIONS.reduce((state, option) => {
    state[option.id] = 0;
    return state;
  }, {});
}

export function getShopCost(optionId, shopState) {
  const option = SHOP_OPTIONS.find((item) => item.id === optionId);
  if (!option) {
    throw new Error(`Unknown shop option: ${optionId}`);
  }

  return option.baseCost + option.growth * (shopState[optionId] ?? 0);
}

export function buyShopOption(player, shopState, optionId) {
  const option = SHOP_OPTIONS.find((item) => item.id === optionId);
  if (!option) {
    return { ok: false, message: "商店没有这个项目。" };
  }

  const cost = getShopCost(optionId, shopState);
  if (player.gold < cost) {
    return { ok: false, message: `金币不足，需要 ${cost} 金币。` };
  }

  player.gold -= cost;
  option.apply(player);
  shopState[optionId] = (shopState[optionId] ?? 0) + 1;

  return {
    ok: true,
    message: `购买 ${option.name}，花费 ${cost} 金币，${option.description}。`
  };
}
