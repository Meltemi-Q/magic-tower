import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE_FRAME = 96;
const FRAME = 128;
const COLS = 4;
const ROWS = 3;
const OUT_DIR = new URL("../assets/sprites/", import.meta.url);

const actors = [
  {
    id: "hero",
    kind: "hero",
    title: "勇者动作精灵表",
    colors: {
      cape: "#171923",
      armor: "#3f4c56",
      armorDark: "#1d252d",
      trim: "#c9a24c",
      glow: "#67f4de",
      skin: "#d3a074",
      hair: "#141014",
      boot: "#11151b",
      blade: "#dff8ff"
    }
  },
  {
    id: "green_slime",
    kind: "slime",
    title: "绿色史莱姆动作精灵表",
    colors: {
      body: "#26724f",
      belly: "#4bbf78",
      dark: "#10382b",
      scale: "#7ce09c",
      eye: "#f6d45d",
      spark: "#d8ffe0"
    }
  },
  {
    id: "red_slime",
    kind: "slime",
    title: "红色史莱姆动作精灵表",
    colors: {
      body: "#8a2634",
      belly: "#c84845",
      dark: "#3a111b",
      scale: "#f08a68",
      eye: "#ffd86b",
      spark: "#ffe6bf"
    }
  },
  {
    id: "bat",
    kind: "bat",
    title: "蝙蝠动作精灵表",
    colors: {
      body: "#2c2940",
      fur: "#4c4765",
      wing: "#111525",
      membrane: "#4c385f",
      eye: "#f5d166",
      claw: "#d8ddf0"
    }
  },
  {
    id: "skeleton",
    kind: "skeleton",
    title: "骷髅士兵动作精灵表",
    colors: {
      bone: "#cfc5a6",
      shade: "#8f8265",
      armor: "#2a323d",
      armorEdge: "#607080",
      blade: "#dce8f3",
      eye: "#67e0d4"
    }
  },
  {
    id: "mage",
    kind: "mage",
    title: "黑袍法师动作精灵表",
    colors: {
      robe: "#171322",
      robeLight: "#31284b",
      trim: "#b58a3a",
      face: "#b88f70",
      staff: "#5a3825",
      magic: "#62e6d1"
    }
  },
  {
    id: "boss",
    kind: "boss",
    title: "魔塔领主动作用精灵表",
    colors: {
      body: "#4a1722",
      bodyLight: "#8e2d37",
      scale: "#c95450",
      horn: "#d8c28e",
      armor: "#1c2028",
      wing: "#171222",
      wingLight: "#4b2d4e",
      eye: "#ffd464",
      flame: "#5eead4"
    }
  }
];

await mkdir(OUT_DIR, { recursive: true });

const writtenActors = [];
for (const actor of actors) {
  await writeFile(new URL(`${actor.id}.svg`, OUT_DIR), buildSpriteSheet(actor), "utf8");
  writtenActors.push(actor);
}

await exportPngSheets(writtenActors);

console.log(`Generated ${actors.length} transparent SVG and PNG sprite sheets in assets/sprites.`);

function buildSpriteSheet(actor) {
  const frames = [];
  const actions = ["idle", "walk", "attack"];

  actions.forEach((action, row) => {
    for (let col = 0; col < COLS; col += 1) {
      const x = col * FRAME;
      const y = row * FRAME;
      frames.push(`<g transform="translate(${x} ${y}) scale(${FRAME / BASE_FRAME})">${drawActor(actor, action, col)}</g>`);
    }
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${FRAME * COLS}" height="${FRAME * ROWS}" viewBox="0 0 ${FRAME * COLS} ${FRAME * ROWS}" role="img" aria-label="${actor.title}">`,
    `<title>${actor.title}</title>`,
    "<defs>",
    '<filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.32"/></filter>',
    '<filter id="steelGlow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#67f4de" flood-opacity="0.58"/></filter>',
    '<linearGradient id="bladeSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".42" stop-color="#dff8ff"/><stop offset="1" stop-color="#6e8591"/></linearGradient>',
    '<linearGradient id="blackSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6873"/><stop offset=".48" stop-color="#2c3640"/><stop offset="1" stop-color="#12171f"/></linearGradient>',
    "</defs>",
    frames.join(""),
    "</svg>"
  ].join("");
}

async function exportPngSheets(actorList) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: FRAME * COLS, height: FRAME * ROWS },
    deviceScaleFactor: 1
  });

  for (const actor of actorList) {
    const svgPath = new URL(`${actor.id}.svg`, OUT_DIR);
    const svgMarkup = await readFile(svgPath, "utf8");
    await page.setContent(
      `<!doctype html>
      <html>
        <body>
          ${svgMarkup}
        </body>
        <style>
          html, body {
            width: ${FRAME * COLS}px;
            height: ${FRAME * ROWS}px;
            margin: 0;
            overflow: hidden;
            background: transparent;
          }

          svg {
            display: block;
            width: ${FRAME * COLS}px;
            height: ${FRAME * ROWS}px;
          }
        </style>
      </html>`,
      { waitUntil: "load" }
    );
    await page.screenshot({
      path: fileURLToPath(new URL(`${actor.id}.png`, OUT_DIR)),
      omitBackground: true,
      clip: { x: 0, y: 0, width: FRAME * COLS, height: FRAME * ROWS }
    });
  }

  await browser.close();
}

function drawActor(actor, action, frame) {
  if (actor.kind === "hero") return drawHero(actor.colors, action, frame);
  if (actor.kind === "slime") return drawSlime(actor.colors, action, frame);
  if (actor.kind === "bat") return drawBat(actor.colors, action, frame);
  if (actor.kind === "skeleton") return drawSkeleton(actor.colors, action, frame);
  if (actor.kind === "mage") return drawMage(actor.colors, action, frame);
  return drawBoss(actor.colors, action, frame);
}

function phase(frame) {
  return [0, 1, 0, -1][frame];
}

function bob(action, frame, amount = 2) {
  if (action === "attack") return [0, -1, -2, 0][frame];
  if (action === "walk") return [0, -amount, 0, amount][frame];
  return [0, -1, 0, 1][frame];
}

function drawHero(c, action, frame) {
  const p = phase(frame);
  const y = bob(action, frame, 3);
  const stride = action === "walk" ? p * 5 : p * 1.5;
  const attack = action === "attack" ? frame : -1;
  const armLift = attack >= 0 ? [-8, -15, -7, 0][frame] : p * 2;
  const swordX = attack >= 0 ? [56, 68, 74, 58][frame] : 60;
  const swordY = attack >= 0 ? [30, 25, 38, 45][frame] : 36;

  return `
    <ellipse cx="48" cy="81" rx="27" ry="7" fill="#000" opacity=".36"/>
    <g filter="url(#softShadow)" transform="translate(${p * 1.2} ${y})">
      <path d="M28 36 C19 51 22 69 35 78 L61 78 C75 66 75 49 67 35 C57 43 39 43 28 36Z" fill="${c.cape}"/>
      <path d="M29 37 L20 50 L34 50Z" fill="${c.armorDark}"/>
      <path d="M67 37 L76 50 L62 50Z" fill="${c.armorDark}"/>
      <path d="M36 39 L60 39 L66 68 L30 68Z" fill="url(#blackSteel)"/>
      <path d="M39 42 H57 L60 61 H36Z" fill="${c.armor}" opacity=".8"/>
      <path d="M43 42 L48 63 L54 42" fill="none" stroke="${c.trim}" stroke-width="2" stroke-linecap="round" opacity=".78"/>
      <path d="M37 49 H59 M35 56 H61 M34 63 H62" stroke="#11171d" stroke-width="1.3" opacity=".75"/>
      <path d="M34 66 L45 66 L43 80 L30 80Z" fill="${c.boot}" transform="translate(${stride} 0)"/>
      <path d="M52 66 L63 66 L67 80 L53 80Z" fill="${c.boot}" transform="translate(${-stride} 0)"/>
      <path d="M33 69 L43 70 M54 70 L65 69" stroke="${c.trim}" stroke-width="1.8" opacity=".65"/>
      <circle cx="48" cy="28" r="12" fill="${c.skin}"/>
      <path d="M35 25 C39 14 57 12 63 25 L60 29 C54 24 43 24 36 29Z" fill="${c.hair}"/>
      <path d="M35 26 L41 15 H55 L63 26 L59 37 H37Z" fill="${c.armorDark}" opacity=".92"/>
      <path d="M39 28 H57 L55 34 H41Z" fill="${c.skin}"/>
      <path d="M37 25 H59" stroke="${c.trim}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="43" cy="31" r="1.7" fill="${c.glow}"/>
      <circle cx="53" cy="31" r="1.7" fill="${c.glow}"/>
      <path d="M44 36 Q49 38 54 36" fill="none" stroke="#6f3d35" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M35 42 C28 48 28 58 34 63" fill="none" stroke="${c.armor}" stroke-width="6" stroke-linecap="round"/>
      <path d="M59 42 C65 ${45 + armLift} ${swordX - 9} ${swordY + 8} ${swordX - 2} ${swordY + 14}" fill="none" stroke="${c.armor}" stroke-width="6" stroke-linecap="round"/>
      <path d="M${swordX} ${swordY} L${swordX + (attack >= 1 ? 21 : 9)} ${swordY - (attack >= 1 ? 9 : 22)}" stroke="url(#bladeSteel)" stroke-width="4.8" stroke-linecap="round" filter="url(#steelGlow)"/>
      <path d="M${swordX + 2} ${swordY - 2} L${swordX + (attack >= 1 ? 17 : 7)} ${swordY - (attack >= 1 ? 8 : 18)}" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity=".88"/>
      <path d="M${swordX - 4} ${swordY + 6} L${swordX + 6} ${swordY + 10}" stroke="${c.trim}" stroke-width="4" stroke-linecap="round"/>
      <path d="M34 39 L62 39" stroke="${c.trim}" stroke-width="3" stroke-linecap="round"/>
      ${attack === 2 ? '<path d="M67 25 C80 31 85 42 76 51" fill="none" stroke="#f4c95d" stroke-width="3" stroke-linecap="round" opacity=".85"/><path d="M70 28 C78 35 80 42 73 48" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" opacity=".72"/>' : ""}
    </g>`;
}

function drawSlime(c, action, frame) {
  const p = phase(frame);
  const y = bob(action, frame, 4);
  const stretch = action === "attack" ? [0, -4, 4, 1][frame] : action === "walk" ? p * 2 : p;
  const spike = action === "attack" && frame >= 1;

  return `
    <ellipse cx="48" cy="80" rx="26" ry="7" fill="#000" opacity=".32"/>
    <g filter="url(#softShadow)" transform="translate(${p * 2} ${y})">
      ${spike ? `<path d="M62 45 L85 ${37 + frame * 3} L67 60Z" fill="${c.dark}" opacity=".95"/><path d="M66 47 L80 ${42 + frame * 2} L68 55Z" fill="${c.scale}" opacity=".55"/>` : ""}
      <path d="M19 ${64 - stretch} C19 41 33 27 48 27 C66 27 77 43 77 ${64 - stretch} C77 76 65 83 48 83 C31 83 19 76 19 ${64 - stretch}Z" fill="${c.dark}"/>
      <path d="M23 ${60 - stretch} C23 42 35 32 49 32 C63 32 73 44 73 ${60 - stretch} C73 72 62 78 48 78 C34 78 23 72 23 ${60 - stretch}Z" fill="${c.body}"/>
      <ellipse cx="48" cy="${64 - stretch}" rx="18" ry="10" fill="${c.belly}" opacity=".46"/>
      <path d="M34 45 q5 -5 10 0 q-5 6 -10 0ZM47 40 q5 -5 10 0 q-5 6 -10 0ZM55 51 q5 -5 10 0 q-5 6 -10 0ZM33 58 q5 -5 10 0 q-5 6 -10 0ZM47 59 q5 -5 10 0 q-5 6 -10 0Z" fill="${c.scale}" opacity=".38"/>
      <path d="M30 37 C38 30 53 29 64 39" fill="none" stroke="${c.scale}" stroke-width="2" stroke-linecap="round" opacity=".42"/>
      <circle cx="39" cy="50" r="4.2" fill="#111"/>
      <circle cx="58" cy="50" r="4.2" fill="#111"/>
      <circle cx="39" cy="50" r="2.5" fill="${c.eye}"/>
      <circle cx="58" cy="50" r="2.5" fill="${c.eye}"/>
      <circle cx="40" cy="49" r="1.1" fill="${c.spark}"/>
      <circle cx="59" cy="49" r="1.1" fill="${c.spark}"/>
      <path d="M40 63 Q48 ${68 + p} 57 63" fill="none" stroke="#0d1712" stroke-width="2.3" stroke-linecap="round" opacity=".82"/>
    </g>`;
}

function drawBat(c, action, frame) {
  const p = phase(frame);
  const y = action === "walk" ? [2, -6, 1, -4][frame] : bob(action, frame, 2);
  const flap = action === "attack" ? [4, -11, -4, 7][frame] : [0, -8, 0, 7][frame];
  const lunge = action === "attack" ? [0, 4, 8, 2][frame] : 0;

  return `
    <ellipse cx="48" cy="80" rx="25" ry="6" fill="#000" opacity=".27"/>
    <g filter="url(#softShadow)" transform="translate(${lunge} ${y})">
      <path d="M44 45 L16 ${31 + flap} L23 51 L12 64 L38 64Z" fill="${c.wing}"/>
      <path d="M52 45 L80 ${31 + flap} L73 51 L84 64 L58 64Z" fill="${c.wing}"/>
      <path d="M40 48 L22 ${38 + flap} L31 58 L39 63Z" fill="${c.membrane}" opacity=".82"/>
      <path d="M56 48 L74 ${38 + flap} L65 58 L57 63Z" fill="${c.membrane}" opacity=".82"/>
      <path d="M20 ${38 + flap} L38 61 M28 ${45 + flap} L39 63 M76 ${38 + flap} L58 61 M68 ${45 + flap} L57 63" stroke="#8e89ab" stroke-width="1.35" stroke-linecap="round" opacity=".36"/>
      <ellipse cx="48" cy="53" rx="16" ry="20" fill="${c.body}"/>
      <path d="M36 39 L30 27 L43 34Z" fill="${c.body}"/>
      <path d="M60 39 L66 27 L53 34Z" fill="${c.body}"/>
      <path d="M39 42 C43 39 54 39 58 42 L55 68 L48 74 L41 68Z" fill="${c.fur}" opacity=".62"/>
      <path d="M42 45 L46 54 L41 54 L47 65 M54 45 L50 54 L55 54 L49 66" stroke="#1b1928" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
      <circle cx="42" cy="50" r="3.5" fill="#09090d"/>
      <circle cx="54" cy="50" r="3.5" fill="#09090d"/>
      <circle cx="42" cy="50" r="2" fill="${c.eye}"/>
      <circle cx="54" cy="50" r="2" fill="${c.eye}"/>
      <path d="M45 57 L48 61 L51 57" fill="none" stroke="#d8ddf0" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M42 62 L38 69 M54 62 L59 69" stroke="${c.claw}" stroke-width="2.3" stroke-linecap="round"/>
      ${action === "attack" && frame === 2 ? '<path d="M64 39 C77 37 83 43 84 52" fill="none" stroke="#ffd166" stroke-width="3" stroke-linecap="round" opacity=".75"/><path d="M67 43 L80 50" stroke="#ffffff" stroke-width="1.2" opacity=".58"/>' : ""}
    </g>`;
}

function drawSkeleton(c, action, frame) {
  const p = phase(frame);
  const y = bob(action, frame, 2);
  const stride = action === "walk" ? p * 4 : 0;
  const swing = action === "attack" ? [-12, -23, -7, 3][frame] : p * 2;
  const swordX = action === "attack" ? [59, 72, 76, 61][frame] : 60;
  const swordY = action === "attack" ? [39, 26, 42, 46][frame] : 38;

  return `
    <ellipse cx="48" cy="81" rx="24" ry="6" fill="#000" opacity=".31"/>
    <g filter="url(#softShadow)" transform="translate(${p} ${y})">
      <path d="M34 21 C39 11 57 11 62 21 L59 37 L37 37Z" fill="${c.bone}"/>
      <path d="M38 20 L33 14 M58 20 L63 14" stroke="${c.shade}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M39 37 H57 L55 44 H41Z" fill="${c.bone}"/>
      <path d="M35 43 H61 L66 63 H30Z" fill="${c.armor}"/>
      <path d="M37 45 H59 L57 51 H39Z" fill="${c.armorEdge}" opacity=".72"/>
      <path d="M38 52 H58 M39 59 H57" stroke="${c.bone}" stroke-width="2.4" stroke-linecap="round" opacity=".86"/>
      <circle cx="43" cy="27" r="3.6" fill="#101820"/>
      <circle cx="53" cy="27" r="3.6" fill="#101820"/>
      <circle cx="43" cy="27" r="1.9" fill="${c.eye}"/>
      <circle cx="53" cy="27" r="1.9" fill="${c.eye}"/>
      <path d="M42 34 H55 M44 38 H52" stroke="${c.shade}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M35 45 C28 52 28 60 33 66" fill="none" stroke="${c.bone}" stroke-width="5" stroke-linecap="round"/>
      <path d="M61 45 C67 ${48 + swing} ${swordX - 8} ${swordY + 8} ${swordX - 3} ${swordY + 14}" fill="none" stroke="${c.bone}" stroke-width="5" stroke-linecap="round"/>
      <path d="M${swordX} ${swordY} L${swordX + 16} ${swordY - 21}" stroke="url(#bladeSteel)" stroke-width="4.4" stroke-linecap="round" filter="url(#steelGlow)"/>
      <path d="M${swordX + 3} ${swordY - 3} L${swordX + 13} ${swordY - 17}" stroke="#fff" stroke-width="1.1" opacity=".75"/>
      <path d="M38 64 L34 80" stroke="${c.bone}" stroke-width="6" stroke-linecap="round" transform="translate(${stride} 0)"/>
      <path d="M57 64 L63 80" stroke="${c.bone}" stroke-width="6" stroke-linecap="round" transform="translate(${-stride} 0)"/>
      <path d="M31 48 L25 54 L33 56 M65 48 L72 54 L63 56" fill="${c.armorEdge}" opacity=".8"/>
      ${action === "attack" && frame === 2 ? '<path d="M71 28 C82 34 84 43 76 52" fill="none" stroke="#67e0d4" stroke-width="3" stroke-linecap="round" opacity=".72"/>' : ""}
    </g>`;
}

function drawMage(c, action, frame) {
  const p = phase(frame);
  const y = bob(action, frame, 2);
  const robeSwing = action === "walk" ? p * 3 : p;
  const cast = action === "attack" ? frame : -1;
  const orbR = cast >= 0 ? [3, 6, 10, 5][frame] : 3;
  const orbX = cast >= 0 ? [66, 72, 78, 68][frame] : 66;
  const orbY = cast >= 0 ? [35, 30, 36, 40][frame] : 35;

  return `
    <ellipse cx="48" cy="81" rx="24" ry="7" fill="#000" opacity=".32"/>
    <g filter="url(#softShadow)" transform="translate(${p} ${y})">
      <path d="M32 33 C37 20 59 20 64 33 L72 77 L24 77Z" fill="${c.robe}"/>
      <path d="M38 37 C42 30 55 30 59 37 L62 73 L34 73Z" fill="${c.robeLight}" opacity=".72"/>
      <path d="M36 32 C40 21 57 21 61 32 C57 41 42 41 36 32Z" fill="#0f0d16"/>
      <ellipse cx="49" cy="35" rx="8" ry="6" fill="${c.face}" opacity=".92"/>
      <path d="M41 29 C45 25 53 25 58 29 L55 34 H43Z" fill="${c.robe}" opacity=".96"/>
      <circle cx="46" cy="35" r="1.9" fill="${c.magic}"/>
      <circle cx="52" cy="35" r="1.9" fill="${c.magic}"/>
      <path d="M45 39 Q49 41 53 39" fill="none" stroke="#3c2439" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M36 48 H60 M35 57 H61 M34 66 H62" stroke="#0c0b12" stroke-width="1.25" opacity=".72"/>
      <path d="M31 73 C37 ${69 + robeSwing} 59 ${69 - robeSwing} 66 73" fill="none" stroke="${c.trim}" stroke-width="3" stroke-linecap="round"/>
      <path d="M43 48 L48 55 L53 48 M39 60 L48 67 L57 60" fill="none" stroke="${c.magic}" stroke-width="1.2" opacity=".5"/>
      <path d="M31 45 C23 49 23 60 30 64" fill="none" stroke="${c.robeLight}" stroke-width="6" stroke-linecap="round"/>
      <path d="M63 44 C70 ${45 - robeSwing} 71 54 65 63" fill="none" stroke="${c.robeLight}" stroke-width="6" stroke-linecap="round"/>
      <path d="M69 25 L58 79" stroke="${c.staff}" stroke-width="5" stroke-linecap="round"/>
      <path d="M66 26 L72 26 M65 33 L71 35" stroke="${c.trim}" stroke-width="1.7" stroke-linecap="round"/>
      <circle cx="${orbX}" cy="${orbY}" r="${orbR}" fill="${c.magic}" opacity=".86" filter="url(#steelGlow)"/>
      <circle cx="${orbX}" cy="${orbY}" r="${orbR + 6}" fill="none" stroke="${c.magic}" stroke-width="2" opacity="${cast >= 0 ? ".45" : ".18"}"/>
      ${cast === 2 ? '<path d="M73 36 C85 40 88 51 78 58" fill="none" stroke="#62e6d1" stroke-width="3" stroke-linecap="round" opacity=".78"/><path d="M70 31 L80 43 L73 51" fill="none" stroke="#f4c95d" stroke-width="1.5" opacity=".55"/>' : ""}
    </g>`;
}

function drawBoss(c, action, frame) {
  const p = phase(frame);
  const y = bob(action, frame, 2);
  const wing = action === "attack" ? [-2, -8, 5, 0][frame] : [0, -4, 0, 4][frame];
  const lunge = action === "attack" ? [0, 2, 7, 1][frame] : 0;
  const flameR = action === "attack" ? [5, 9, 13, 7][frame] : 4;

  return `
    <ellipse cx="48" cy="82" rx="31" ry="8" fill="#000" opacity=".38"/>
    <g filter="url(#softShadow)" transform="translate(${lunge + p} ${y})">
      <path d="M36 42 L12 ${27 + wing} L23 64 L38 60Z" fill="${c.wing}"/>
      <path d="M60 42 L84 ${27 + wing} L73 64 L58 60Z" fill="${c.wing}"/>
      <path d="M27 ${45 + wing} L20 ${35 + wing} L30 59Z" fill="${c.wingLight}" opacity=".82"/>
      <path d="M69 ${45 + wing} L76 ${35 + wing} L66 59Z" fill="${c.wingLight}" opacity=".82"/>
      <path d="M18 ${39 + wing} L37 58 M78 ${39 + wing} L59 58" stroke="#7e5f83" stroke-width="1.4" opacity=".36"/>
      <path d="M26 55 C27 33 38 23 48 23 C61 23 70 34 71 56 C72 73 61 81 48 81 C33 81 25 73 26 55Z" fill="${c.body}"/>
      <path d="M34 54 C35 40 42 33 49 33 C58 33 64 42 64 55 C64 68 57 74 49 74 C39 74 34 66 34 54Z" fill="${c.bodyLight}" opacity=".74"/>
      <path d="M36 26 L25 9 L44 19Z" fill="${c.horn}"/>
      <path d="M60 26 L71 9 L52 19Z" fill="${c.horn}"/>
      <path d="M35 44 H62 L67 59 L59 67 H37 L29 59Z" fill="${c.armor}" opacity=".72"/>
      <path d="M39 48 H58 M37 55 H60 M39 63 H57" stroke="#090b0f" stroke-width="1.25" opacity=".72"/>
      <path d="M39 40 q5 -5 10 0 q-5 6 -10 0ZM51 40 q5 -5 10 0 q-5 6 -10 0ZM42 52 q5 -5 10 0 q-5 6 -10 0ZM48 61 q5 -5 10 0 q-5 6 -10 0Z" fill="${c.scale}" opacity=".68"/>
      <circle cx="43" cy="41" r="3.7" fill="#10080c"/>
      <circle cx="55" cy="41" r="3.7" fill="#10080c"/>
      <circle cx="43" cy="41" r="2.2" fill="${c.eye}"/>
      <circle cx="55" cy="41" r="2.2" fill="${c.eye}"/>
      <path d="M36 36 L46 39 M61 36 L52 39" stroke="#12090d" stroke-width="3" stroke-linecap="round"/>
      <path d="M47 45 L44 50 L52 50Z" fill="#12090d" opacity=".82"/>
      <path d="M39 51 Q49 59 59 51" fill="none" stroke="#12090d" stroke-width="3" stroke-linecap="round"/>
      <path d="M31 58 C20 57 18 69 27 73" fill="none" stroke="${c.bodyLight}" stroke-width="7" stroke-linecap="round"/>
      <path d="M65 58 C75 55 81 62 79 71" fill="none" stroke="${c.bodyLight}" stroke-width="7" stroke-linecap="round"/>
      <path d="M25 72 L20 78 M76 70 L83 75" stroke="${c.horn}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="76" cy="68" r="${flameR}" fill="${c.flame}" opacity=".82" filter="url(#steelGlow)"/>
      <circle cx="76" cy="68" r="${flameR + 7}" fill="none" stroke="${c.flame}" stroke-width="2" opacity=".36"/>
    </g>`;
}
