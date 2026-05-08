import { getEnemyDef } from "./map.js";

export function calculateDamage(attackerAtk, defenderDef) {
  // 魔塔经典公式：攻击低于防御时也至少造成 1 点伤害。
  return Math.max(1, attackerAtk - defenderDef);
}

export function previewBattle(player, enemyId) {
  const enemy = getEnemyDef(enemyId, player.difficulty);
  const playerDamage = calculateDamage(player.atk, enemy.def);
  const enemyDamage = calculateDamage(enemy.atk, player.def);
  const turnsToKill = Math.ceil(enemy.hp / playerDamage);
  const enemyHits = Math.max(0, turnsToKill - 1);
  const expectedLoss = enemyHits * enemyDamage;

  return {
    enemy,
    playerDamage,
    enemyDamage,
    turnsToKill,
    expectedLoss,
    canWin: player.hp > expectedLoss
  };
}

export function runBattle(player, enemyId) {
  const enemyBase = getEnemyDef(enemyId, player.difficulty);
  const enemy = { ...enemyBase };
  const logs = [`遭遇 ${enemy.name}。`];
  let round = 1;

  // 玩家先手；怪物死亡的回合不会反击。
  while (player.hp > 0 && enemy.hp > 0) {
    const playerDamage = calculateDamage(player.atk, enemy.def);
    enemy.hp = Math.max(0, enemy.hp - playerDamage);
    logs.push(`第 ${round} 回合：勇者造成 ${playerDamage} 伤害，${enemy.name} 剩余 ${enemy.hp} HP。`);

    if (enemy.hp <= 0) {
      break;
    }

    const enemyDamage = calculateDamage(enemy.atk, player.def);
    player.hp = Math.max(0, player.hp - enemyDamage);
    logs.push(`第 ${round} 回合：${enemy.name} 反击 ${enemyDamage} 伤害，勇者剩余 ${player.hp} HP。`);
    round += 1;
  }

  if (player.hp <= 0) {
    logs.push("勇者倒下了。读取存档或重新开始。");
    return {
      victory: false,
      enemy: enemyBase,
      logs
    };
  }

  player.gold += enemy.gold;
  player.exp += enemy.exp;
  logs.push(`击败 ${enemy.name}，获得 ${enemy.gold} 金币和 ${enemy.exp} 经验。`);
  const levelLogs = applyLevelUps(player);
  logs.push(...levelLogs);

  return {
    victory: true,
    enemy: enemyBase,
    leveledUp: levelLogs.length > 0,
    logs
  };
}

function applyLevelUps(player) {
  const logs = [];
  let neededExp = nextLevelExp(player.lvl);

  while (player.exp >= neededExp) {
    player.exp -= neededExp;
    player.lvl += 1;
    player.hp += 90;
    player.atk += 5;
    player.def += 4;
    logs.push(`升级到 LV ${player.lvl}，HP +90，ATK +5，DEF +4。`);
    neededExp = nextLevelExp(player.lvl);
  }

  return logs;
}

export function nextLevelExp(level) {
  return 20 + (level - 1) * 14;
}
