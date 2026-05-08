import { enemyName, t } from "./i18n.js";
import { getEnemyDef } from "./map.js";
import { consumePowerStrike, consumeShield } from "./skills.js";

export function calculateDamage(attackerAtk, defenderDef) {
  return Math.max(1, attackerAtk - defenderDef);
}

export function previewBattle(player, enemyId, skillState = null) {
  const enemy = getEnemyDef(enemyId, player.difficulty);
  const simulation = simulateBattle(player, enemy, skillState, false);

  return {
    enemy,
    playerDamage: simulation.firstPlayerDamage,
    enemyDamage: simulation.firstEnemyDamage,
    turnsToKill: simulation.turns,
    expectedLoss: simulation.expectedLoss,
    canWin: player.hp > simulation.expectedLoss
  };
}

export function runBattle(player, enemyId, skillState = null) {
  const enemyBase = getEnemyDef(enemyId, player.difficulty);
  const enemy = { ...enemyBase };
  const displayName = enemyName(enemyId);
  const logs = [t("battle.encountered", { enemy: displayName })];
  let round = 1;
  let usedPowerStrike = false;
  let usedShield = false;

  while (player.hp > 0 && enemy.hp > 0) {
    let playerDamage = calculateDamage(player.atk, enemy.def);
    if (skillState?.active?.powerStrike) {
      playerDamage *= 2;
      usedPowerStrike = consumePowerStrike(skillState);
      logs.push(t("battle.powerStrike"));
    }

    enemy.hp = Math.max(0, enemy.hp - playerDamage);
    logs.push(t("battle.heroHit", {
      round,
      damage: playerDamage,
      enemy: displayName,
      hp: enemy.hp
    }));

    if (enemy.hp <= 0) {
      break;
    }

    let enemyDamage = calculateDamage(enemy.atk, player.def);
    if (skillState?.active?.shield) {
      enemyDamage = Math.ceil(enemyDamage / 2);
      usedShield = consumeShield(skillState);
      logs.push(t("battle.shield"));
    }

    player.hp = Math.max(0, player.hp - enemyDamage);
    logs.push(t("battle.enemyHit", {
      round,
      enemy: displayName,
      damage: enemyDamage,
      hp: player.hp
    }));
    round += 1;
  }

  if (player.hp <= 0) {
    logs.push(t("battle.fallen"));
    return {
      victory: false,
      enemy: enemyBase,
      usedPowerStrike,
      usedShield,
      logs
    };
  }

  player.gold += enemy.gold;
  player.exp += enemy.exp;
  logs.push(t("battle.defeated", {
    enemy: displayName,
    gold: enemy.gold,
    exp: enemy.exp
  }));
  const levelLogs = applyLevelUps(player);
  logs.push(...levelLogs);

  return {
    victory: true,
    enemy: enemyBase,
    usedPowerStrike,
    usedShield,
    leveledUp: levelLogs.length > 0,
    logs
  };
}

function simulateBattle(player, enemyBase, skillState, mutate) {
  const enemy = { ...enemyBase };
  let hp = player.hp;
  let turns = 0;
  let expectedLoss = 0;
  let firstPlayerDamage = 0;
  let firstEnemyDamage = 0;
  let powerStrikeReady = Boolean(skillState?.active?.powerStrike);
  let shieldReady = Boolean(skillState?.active?.shield);

  while (hp > 0 && enemy.hp > 0 && turns < 999) {
    turns += 1;
    let playerDamage = calculateDamage(player.atk, enemy.def);
    if (powerStrikeReady) {
      playerDamage *= 2;
      powerStrikeReady = false;
    }

    if (turns === 1) {
      firstPlayerDamage = playerDamage;
    }

    enemy.hp = Math.max(0, enemy.hp - playerDamage);
    if (enemy.hp <= 0) {
      break;
    }

    let enemyDamage = calculateDamage(enemy.atk, player.def);
    if (shieldReady) {
      enemyDamage = Math.ceil(enemyDamage / 2);
      shieldReady = false;
    }

    if (firstEnemyDamage === 0) {
      firstEnemyDamage = enemyDamage;
    }

    if (mutate) {
      hp = Math.max(0, hp - enemyDamage);
    } else {
      expectedLoss += enemyDamage;
      hp = Math.max(0, hp - enemyDamage);
    }
  }

  return {
    turns,
    expectedLoss,
    firstPlayerDamage,
    firstEnemyDamage
  };
}

function applyLevelUps(player) {
  const logs = [];
  let neededExp = nextLevelExp(player.lvl);

  while (player.exp >= neededExp) {
    player.exp -= neededExp;
    player.lvl += 1;
    player.maxHp = (player.maxHp ?? player.hp) + 90;
    player.hp += 90;
    player.atk += 5;
    player.def += 4;
    logs.push(t("battle.levelUp", { level: player.lvl }));
    neededExp = nextLevelExp(player.lvl);
  }

  return logs;
}

export function nextLevelExp(level) {
  return 20 + (level - 1) * 14;
}
