import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://127.0.0.1:8797/";
const outDir = "tmp";
const stateRows = [
  ["idle", "down"],
  ["idle", "left"],
  ["idle", "right"],
  ["idle", "up"],
  ["walk", "down"],
  ["walk", "left"],
  ["walk", "right"],
  ["walk", "up"],
  ["attack", "down"],
  ["attack", "left"],
  ["attack", "right"],
  ["attack", "up"],
];

function rowOffset(action, facing) {
  const actionIndex = { idle: 0, walk: 1, attack: 2 }[action] ?? 0;
  const facingIndex = { down: 0, left: 1, right: 2, up: 3 }[facing] ?? 0;
  const rowIndex = actionIndex * 4 + facingIndex;
  return `${-(rowIndex / 12) * 100}%`;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
await page.addInitScript(() => {
  localStorage.setItem("magicTowerTutorialDone.v4", "done");
});

await mkdir(outDir, { recursive: true });
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);

const assetStatus = await page.evaluate(async () => {
  const response = await fetch("assets/sprites/hero.png", { cache: "no-store" });
  const blob = await response.blob();
  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get("content-type"),
    bytes: blob.size,
  };
});

const liveHero = await page.locator(".actor-hero").first();
await liveHero.waitFor({ state: "visible", timeout: 5000 });
const liveInfo = await liveHero.evaluate((node) => {
  const style = getComputedStyle(node);
  return {
    className: node.className,
    backgroundImage: style.backgroundImage,
    width: style.width,
    height: style.height,
    rowOffset: node.style.getPropertyValue("--sprite-row-offset"),
  };
});

await page.screenshot({ path: `${outDir}/hero_ai_game_initial.png`, fullPage: true });

const moveRight = page.locator('[data-move="right"]').first();
if (await moveRight.count()) {
  await moveRight.click();
  await page.waitForTimeout(650);
  await page.screenshot({ path: `${outDir}/hero_ai_game_after_move.png`, fullPage: true });
}

await page.evaluate(
  ({ rows }) => {
    const oldProbe = document.getElementById("spriteProbe");
    oldProbe?.remove();

    const style = document.createElement("style");
    style.id = "spriteProbeStyle";
    style.textContent = `
      #spriteProbe {
        position: fixed;
        inset: 24px auto auto 24px;
        z-index: 99999;
        display: grid;
        grid-template-columns: repeat(4, 104px);
        gap: 10px;
        padding: 14px;
        background: #171a20;
        border: 1px solid rgba(255,255,255,.18);
      }
      #spriteProbe .probe-cell {
        position: relative;
        width: 104px;
        height: 104px;
        background: #22262e;
        overflow: hidden;
      }
      #spriteProbe .probe-cell .actor-sprite {
        left: 6px;
        top: 6px;
        width: 92px;
      }
      #spriteProbe .probe-label {
        position: absolute;
        left: 4px;
        top: 3px;
        z-index: 3;
        font: 10px/1.2 sans-serif;
        color: rgba(255,255,255,.8);
      }
      #spriteProbe .actor-sprite::before {
        animation-play-state: paused !important;
      }
    `;
    document.head.appendChild(style);

    const probe = document.createElement("div");
    probe.id = "spriteProbe";
    rows.forEach(({ action, facing, offset }) => {
      const cell = document.createElement("div");
      cell.className = "probe-cell";
      const label = document.createElement("span");
      label.className = "probe-label";
      label.textContent = `${action} ${facing}`;
      const sprite = document.createElement("span");
      sprite.className = `actor-sprite actor-hero action-${action} facing-${facing}`;
      sprite.style.backgroundImage = 'url("assets/sprites/hero.png")';
      sprite.style.setProperty("--sprite-row-offset", offset);
      cell.append(label, sprite);
      probe.appendChild(cell);
    });
    document.body.appendChild(probe);
  },
  { rows: stateRows.map(([action, facing]) => ({ action, facing, offset: rowOffset(action, facing) })) },
);

await page.waitForTimeout(400);
await page.locator("#spriteProbe").screenshot({ path: `${outDir}/hero_ai_browser_probe.png` });

console.log(JSON.stringify({ url, assetStatus, liveInfo }, null, 2));
await browser.close();
