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
      cape: "#274b63",
      armor: "#5ec8b6",
      trim: "#f4c95d",
      skin: "#f0b78a",
      hair: "#4d2d21",
      boot: "#202630",
      blade: "#e9f4ff"
    }
  },
  {
    id: "green_slime",
    kind: "slime",
    title: "绿色史莱姆动作精灵表",
    colors: {
      body: "#46c56f",
      belly: "#8ff0a4",
      dark: "#1f7a43",
      eye: "#17201a",
      spark: "#d8ffe0"
    }
  },
  {
    id: "red_slime",
    kind: "slime",
    title: "红色史莱姆动作精灵表",
    colors: {
      body: "#df5b55",
      belly: "#ff9b81",
      dark: "#93313f",
      eye: "#231414",
      spark: "#ffe6bf"
    }
  },
  {
    id: "bat",
    kind: "bat",
    title: "蝙蝠动作精灵表",
    colors: {
      body: "#4d4a7d",
      wing: "#252b4d",
      membrane: "#6b5fa3",
      eye: "#f5d166",
      claw: "#d8ddf0"
    }
  },
  {
    id: "skeleton",
    kind: "skeleton",
    title: "骷髅士兵动作精灵表",
    colors: {
      bone: "#e3dcc7",
      shade: "#b9ac8e",
      armor: "#526071",
      blade: "#dce8f3",
      eye: "#67e0d4"
    }
  },
  {
    id: "mage",
    kind: "mage",
    title: "黑袍法师动作精灵表",
    colors: {
      robe: "#30234b",
      robeLight: "#514174",
      trim: "#f2b84b",
      face: "#d6b28e",
      staff: "#8a5938",
      magic: "#62e6d1"
    }
  },
  {
    id: "boss",
    kind: "boss",
    title: "魔塔领主动作用精灵表",
    colors: {
      body: "#6e2937",
      bodyLight: "#a43a44",
      horn: "#edd6a5",
      wing: "#30253f",
      wingLight: "#6d4562",
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
    <ellipse cx="48" cy="80" rx="24" ry="7" fill="#000" opacity=".24"/>
    <g filter="url(#softShadow)" transform="translate(${p * 1.2} ${y})">
      <path d="M30 35 C22 48 23 67 35 76 L61 76 C73 64 72 47 65 35 C55 42 40 42 30 35Z" fill="${c.cape}"/>
      <path d="M37 40 L59 40 L64 67 L32 67Z" fill="${c.armor}"/>
      <path d="M40 43 H56 L59 60 H37Z" fill="#d9fff5" opacity=".2"/>
      <path d="M34 65 L44 65 L42 78 L31 78Z" fill="${c.boot}" transform="translate(${stride} 0)"/>
      <path d="M52 65 L62 65 L65 78 L53 78Z" fill="${c.boot}" transform="translate(${-stride} 0)"/>
      <circle cx="48" cy="27" r="12" fill="${c.skin}"/>
      <path d="M36 27 C39 14 57 12 62 25 C54 19 43 20 36 27Z" fill="${c.hair}"/>
      <path d="M38 25 C45 30 54 29 61 25 L59 36 C51 41 43 39 37 35Z" fill="${c.skin}"/>
      <circle cx="43" cy="29" r="2" fill="#1d2228"/>
      <circle cx="53" cy="29" r="2" fill="#1d2228"/>
      <path d="M45 35 Q49 38 54 35" fill="none" stroke="#8f4f42" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M41 24 L46 23 M51 23 L57 24" stroke="${c.hair}" stroke-width="2" stroke-linecap="round"/>
      <path d="M37 40 C30 46 29 55 34 60" fill="none" stroke="${c.trim}" stroke-width="5" stroke-linecap="round"/>
      <path d="M59 41 C64 ${45 + armLift} ${swordX - 9} ${swordY + 8} ${swordX - 2} ${swordY + 14}" fill="none" stroke="${c.trim}" stroke-width="5" stroke-linecap="round"/>
      <path d="M${swordX} ${swordY} L${swordX + (attack >= 1 ? 19 : 8)} ${swordY - (attack >= 1 ? 8 : 20)}" stroke="${c.blade}" stroke-width="4" stroke-linecap="round"/>
      <path d="M${swordX - 4} ${swordY + 6} L${swordX + 6} ${swordY + 10}" stroke="${c.trim}" stroke-width="4" stroke-linecap="round"/>
      <path d="M36 39 L60 39" stroke="${c.trim}" stroke-width="3" stroke-linecap="round"/>
      ${attack === 2 ? '<path d="M68 27 C78 32 82 40 76 48" fill="none" stroke="#f4c95d" stroke-width="3" stroke-linecap="round" opacity=".85"/>' : ""}
    </g>`;
}

function drawSlime(c, action, frame) {
  const p = phase(frame);
  const y = bob(action, frame, 4);
  const stretch = action === "attack" ? [0, -4, 4, 1][frame] : action === "walk" ? p * 2 : p;
  const spike = action === "attack" && frame >= 1;

  return `
    <ellipse cx="48" cy="79" rx="24" ry="7" fill="#000" opacity=".22"/>
    <g filter="url(#softShadow)" transform="translate(${p * 2} ${y})">
      ${spike ? `<path d="M64 45 L83 ${38 + frame * 3} L66 58Z" fill="${c.body}" opacity=".9"/>` : ""}
      <path d="M20 ${63 - stretch} C20 42 34 29 48 29 C65 29 76 44 76 ${63 - stretch} C76 75 65 82 48 82 C32 82 20 75 20 ${63 - stretch}Z" fill="${c.dark}"/>
      <path d="M24 ${60 - stretch} C24 43 36 33 49 33 C62 33 72 45 72 ${60 - stretch} C72 71 62 77 48 77 C34 77 24 71 24 ${60 - stretch}Z" fill="${c.body}"/>
      <ellipse cx="48" cy="${63 - stretch}" rx="18" ry="10" fill="${c.belly}" opacity=".55"/>
      <circle cx="39" cy="50" r="4" fill="${c.eye}"/>
      <circle cx="58" cy="50" r="4" fill="${c.eye}"/>
      <circle cx="40" cy="49" r="1.5" fill="${c.spark}"/>
      <circle cx="59" cy="49" r="1.5" fill="${c.spark}"/>
      <path d="M41 62 Q48 ${66 + p} 56 62" fill="none" stroke="${c.eye}" stroke-width="2" stroke-linecap="round" opacity=".65"/>
    </g>`;
}

function drawBat(c, action, frame) {
  const p = phase(frame);
  const y = action === "walk" ? [2, -6, 1, -4][frame] : bob(action, frame, 2);
  const flap = action === "attack" ? [4, -11, -4, 7][frame] : [0, -8, 0, 7][frame];
  const lunge = action === "attack" ? [0, 4, 8, 2][frame] : 0;

  return `
    <ellipse cx="48" cy="80" rx="22" ry="6" fill="#000" opacity=".18"/>
    <g filter="url(#softShadow)" transform="translate(${lunge} ${y})">
      <path d="M44 45 L18 ${33 + flap} L24 54 L13 63 L38 63Z" fill="${c.wing}"/>
      <path d="M52 45 L78 ${33 + flap} L72 54 L83 63 L58 63Z" fill="${c.wing}"/>
      <path d="M40 48 L22 ${39 + flap} L31 57 L39 62Z" fill="${c.membrane}" opacity=".82"/>
      <path d="M56 48 L74 ${39 + flap} L65 57 L57 62Z" fill="${c.membrane}" opacity=".82"/>
      <path d="M24 ${41 + flap} L38 60 M72 ${41 + flap} L58 60" stroke="#d8ddf0" stroke-width="1.4" stroke-linecap="round" opacity=".32"/>
      <path d="M31 ${46 + flap} L39 62 M65 ${46 + flap} L57 62" stroke="#d8ddf0" stroke-width="1.2" stroke-linecap="round" opacity=".24"/>
      <ellipse cx="48" cy="53" rx="16" ry="19" fill="${c.body}"/>
      <path d="M37 38 L31 28 L43 34Z" fill="${c.body}"/>
      <path d="M59 38 L65 28 L53 34Z" fill="${c.body}"/>
      <circle cx="42" cy="50" r="3" fill="${c.eye}"/>
      <circle cx="54" cy="50" r="3" fill="${c.eye}"/>
      <path d="M43 61 L39 67 M53 61 L57 67" stroke="${c.claw}" stroke-width="2" stroke-linecap="round"/>
      ${action === "attack" && frame === 2 ? '<path d="M65 39 C76 37 81 42 83 50" fill="none" stroke="#ffd166" stroke-width="3" stroke-linecap="round" opacity=".75"/>' : ""}
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
    <ellipse cx="48" cy="80" rx="22" ry="6" fill="#000" opacity=".23"/>
    <g filter="url(#softShadow)" transform="translate(${p} ${y})">
      <circle cx="48" cy="27" r="13" fill="${c.bone}"/>
      <rect x="39" y="36" width="18" height="6" rx="3" fill="${c.bone}"/>
      <path d="M37 44 H59 L64 62 H32Z" fill="${c.armor}"/>
      <path d="M38 48 H58 M40 55 H56" stroke="${c.bone}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="43" cy="27" r="3" fill="${c.eye}"/>
      <circle cx="53" cy="27" r="3" fill="${c.eye}"/>
      <path d="M43 34 H54" stroke="${c.shade}" stroke-width="2" stroke-linecap="round"/>
      <path d="M35 45 C29 52 29 58 33 64" fill="none" stroke="${c.bone}" stroke-width="5" stroke-linecap="round"/>
      <path d="M61 45 C66 ${48 + swing} ${swordX - 8} ${swordY + 8} ${swordX - 3} ${swordY + 14}" fill="none" stroke="${c.bone}" stroke-width="5" stroke-linecap="round"/>
      <path d="M${swordX} ${swordY} L${swordX + 14} ${swordY - 19}" stroke="${c.blade}" stroke-width="4" stroke-linecap="round"/>
      <path d="M39 63 L35 78" stroke="${c.bone}" stroke-width="6" stroke-linecap="round" transform="translate(${stride} 0)"/>
      <path d="M56 63 L62 78" stroke="${c.bone}" stroke-width="6" stroke-linecap="round" transform="translate(${-stride} 0)"/>
      ${action === "attack" && frame === 2 ? '<path d="M71 28 C80 34 82 42 75 50" fill="none" stroke="#67e0d4" stroke-width="3" stroke-linecap="round" opacity=".7"/>' : ""}
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
    <ellipse cx="48" cy="80" rx="23" ry="7" fill="#000" opacity=".23"/>
    <g filter="url(#softShadow)" transform="translate(${p} ${y})">
      <path d="M33 34 C38 21 58 21 63 34 L70 76 L26 76Z" fill="${c.robe}"/>
      <path d="M39 37 C42 31 54 31 57 37 L60 72 L36 72Z" fill="${c.robeLight}" opacity=".72"/>
      <path d="M37 32 C41 22 56 22 60 32 C55 40 43 40 37 32Z" fill="${c.robe}"/>
      <ellipse cx="49" cy="34" rx="8" ry="6" fill="${c.face}"/>
      <circle cx="46" cy="34" r="1.8" fill="${c.magic}"/>
      <circle cx="52" cy="34" r="1.8" fill="${c.magic}"/>
      <path d="M45 38 Q49 40 53 38" fill="none" stroke="#3c2439" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M29 73 C36 ${69 + robeSwing} 60 ${69 - robeSwing} 67 73" fill="none" stroke="${c.trim}" stroke-width="3" stroke-linecap="round"/>
      <path d="M31 45 C23 49 23 59 30 63" fill="none" stroke="${c.robeLight}" stroke-width="6" stroke-linecap="round"/>
      <path d="M63 44 C69 ${45 - robeSwing} 70 54 65 62" fill="none" stroke="${c.robeLight}" stroke-width="6" stroke-linecap="round"/>
      <path d="M69 26 L58 78" stroke="${c.staff}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="${orbX}" cy="${orbY}" r="${orbR}" fill="${c.magic}" opacity=".82"/>
      <circle cx="${orbX}" cy="${orbY}" r="${orbR + 6}" fill="none" stroke="${c.magic}" stroke-width="2" opacity="${cast >= 0 ? ".45" : ".18"}"/>
      ${cast === 2 ? '<path d="M74 37 C83 40 86 50 78 56" fill="none" stroke="#62e6d1" stroke-width="3" stroke-linecap="round" opacity=".75"/>' : ""}
    </g>`;
}

function drawBoss(c, action, frame) {
  const p = phase(frame);
  const y = bob(action, frame, 2);
  const wing = action === "attack" ? [-2, -8, 5, 0][frame] : [0, -4, 0, 4][frame];
  const lunge = action === "attack" ? [0, 2, 7, 1][frame] : 0;
  const flameR = action === "attack" ? [5, 9, 13, 7][frame] : 4;

  return `
    <ellipse cx="48" cy="81" rx="29" ry="8" fill="#000" opacity=".28"/>
    <g filter="url(#softShadow)" transform="translate(${lunge + p} ${y})">
      <path d="M36 42 L13 ${28 + wing} L24 64 L38 59Z" fill="${c.wing}"/>
      <path d="M60 42 L83 ${28 + wing} L72 64 L58 59Z" fill="${c.wing}"/>
      <path d="M28 ${45 + wing} L21 ${36 + wing} L29 58Z" fill="${c.wingLight}" opacity=".82"/>
      <path d="M68 ${45 + wing} L75 ${36 + wing} L67 58Z" fill="${c.wingLight}" opacity=".82"/>
      <path d="M27 55 C28 34 38 24 48 24 C60 24 69 35 70 56 C71 72 61 80 48 80 C34 80 26 72 27 55Z" fill="${c.body}"/>
      <path d="M35 54 C36 41 42 34 49 34 C57 34 63 42 63 55 C63 67 57 73 49 73 C40 73 35 66 35 54Z" fill="${c.bodyLight}" opacity=".76"/>
      <path d="M38 25 L27 11 L43 19Z" fill="${c.horn}"/>
      <path d="M58 25 L69 11 L53 19Z" fill="${c.horn}"/>
      <circle cx="43" cy="41" r="3.5" fill="${c.eye}"/>
      <circle cx="55" cy="41" r="3.5" fill="${c.eye}"/>
      <path d="M37 36 L46 39 M60 36 L52 39" stroke="#2d141b" stroke-width="3" stroke-linecap="round"/>
      <path d="M47 45 L44 50 L51 50Z" fill="#2d141b" opacity=".75"/>
      <path d="M40 51 Q49 58 58 51" fill="none" stroke="#2d141b" stroke-width="3" stroke-linecap="round"/>
      <path d="M31 58 C21 57 19 68 27 72" fill="none" stroke="${c.bodyLight}" stroke-width="7" stroke-linecap="round"/>
      <path d="M65 58 C74 55 80 62 78 70" fill="none" stroke="${c.bodyLight}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="76" cy="68" r="${flameR}" fill="${c.flame}" opacity=".78"/>
      <circle cx="76" cy="68" r="${flameR + 7}" fill="none" stroke="${c.flame}" stroke-width="2" opacity=".36"/>
    </g>`;
}
