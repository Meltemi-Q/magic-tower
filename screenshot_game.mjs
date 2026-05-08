import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const outDir = 'c:\\Users\\meltemi\\.trae-cn\\work\\69fc410d357826f4e68d43d5';

  // Helper: close any open modal dialog
  async function closeDialog() {
    const dialog = await page.$('.modal[open]');
    if (dialog) {
      await dialog.$('.icon-button').then(btn => btn && btn.click());
      await page.waitForTimeout(400);
    }
  }

  // Helper: safe move that handles dialogs
  async function safeMove(direction) {
    await page.click(`[data-move="${direction}"]`);
    await page.waitForTimeout(700);
    // Check if a dialog opened and close it
    await closeDialog();
  }

  // Navigate to the game
  await page.goto('http://127.0.0.1:8789/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Screenshot 1: Initial game screen
  await page.screenshot({ path: `${outDir}\\screenshot_01_initial.png`, fullPage: true });
  console.log('Screenshot 1: Initial screen saved');

  // Move right to pick up yellow key (0,3 -> 1,3)
  await safeMove('right');
  await page.screenshot({ path: `${outDir}\\screenshot_02_yellow_key.png`, fullPage: true });
  console.log('Screenshot 2: Picked up yellow key');

  // Move up to pick up red potion (1,3 -> 1,2) -- this is the SHOP tile!
  // Actually (1,2) is shop. Let me go (1,3) -> (0,3) first... no.
  // Let me reconsider: from (1,3), up goes to (1,2) which is SHOP.
  // Let me go right instead to (2,3) = green slime
  await safeMove('right');
  await page.screenshot({ path: `${outDir}\\screenshot_03_face_slime.png`, fullPage: true });
  console.log('Screenshot 3: Facing green slime');

  // Attack green slime (2,3 -> stays, battle happens)
  await safeMove('right');
  // Wait, (2,3) is where the slime is. We already moved there.
  // Actually safeMove already moved us to (2,3) and fought the slime.
  // Let me just take screenshot
  await page.screenshot({ path: `${outDir}\\screenshot_04_after_slime_battle.png`, fullPage: true });
  console.log('Screenshot 4: After slime battle');

  // Move right to pick up emerald (2,3 -> 3,3)
  await safeMove('right');
  await page.screenshot({ path: `${outDir}\\screenshot_05_emerald.png`, fullPage: true });
  console.log('Screenshot 5: Picked up emerald');

  // Move up to floor (3,3 -> 3,2)
  await safeMove('up');
  await page.screenshot({ path: `${outDir}\\screenshot_06_moved_up.png`, fullPage: true });
  console.log('Screenshot 6: Moved up');

  // Move up (3,2 -> 3,1) = WALL, can't move
  await page.click('[data-move="up"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}\\screenshot_07_hit_wall.png`, fullPage: true });
  console.log('Screenshot 7: Hit wall');

  // Move left to ruby (3,2 -> 2,2)
  await safeMove('left');
  await page.screenshot({ path: `${outDir}\\screenshot_08_ruby.png`, fullPage: true });
  console.log('Screenshot 8: Picked up ruby');

  // Move left to shop (2,2 -> 1,2) - shop dialog will open
  await page.click('[data-move="left"]');
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${outDir}\\screenshot_09_shop_dialog.png`, fullPage: true });
  console.log('Screenshot 9: Shop dialog opened');

  // Close shop dialog
  await closeDialog();

  // Move left to blue potion (1,2 -> 0,2)
  await safeMove('left');
  await page.screenshot({ path: `${outDir}\\screenshot_10_blue_potion.png`, fullPage: true });
  console.log('Screenshot 10: Picked up blue potion');

  // Move up to red potion (0,2 -> 0,1)
  await safeMove('up');
  await page.screenshot({ path: `${outDir}\\screenshot_11_red_potion.png`, fullPage: true });
  console.log('Screenshot 11: Picked up red potion');

  // Move right to yellow door (0,1 -> 1,1) - door opens
  await safeMove('right');
  await page.screenshot({ path: `${outDir}\\screenshot_12_door_opened.png`, fullPage: true });
  console.log('Screenshot 12: Yellow door opened');

  // Move up to face boss (1,1 -> 1,0)
  await safeMove('up');
  await page.screenshot({ path: `${outDir}\\screenshot_13_face_boss.png`, fullPage: true });
  console.log('Screenshot 13: Facing boss');

  // Try to attack boss (1,0 -> 2,0) - boss is at (2,0)
  await safeMove('right');
  await page.screenshot({ path: `${outDir}\\screenshot_14_boss_battle.png`, fullPage: true });
  console.log('Screenshot 14: Boss battle result');

  // Open help dialog
  await page.click('#helpBtn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}\\screenshot_15_help_dialog.png`, fullPage: true });
  console.log('Screenshot 15: Help dialog');

  // Close help
  await closeDialog();

  // Open shop via button
  await page.click('#shopBtn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}\\screenshot_16_shop_button.png`, fullPage: true });
  console.log('Screenshot 16: Shop opened via button');

  await closeDialog();

  // Get battle log text
  const logText = await page.evaluate(() => {
    const entries = document.querySelectorAll('.log-entry');
    return Array.from(entries).map(e => e.textContent).join('\n');
  });
  console.log('\n=== Battle Log ===');
  console.log(logText);

  // Get stats
  const stats = await page.evaluate(() => {
    return {
      hp: document.getElementById('statHp').textContent,
      atk: document.getElementById('statAtk').textContent,
      def: document.getElementById('statDef').textContent,
      gold: document.getElementById('statGold').textContent,
      exp: document.getElementById('statExp').textContent,
      floor: document.getElementById('statFloor').textContent,
      level: document.getElementById('heroLevel').textContent,
      yellowKey: document.getElementById('keyYellow').textContent,
      blueKey: document.getElementById('keyBlue').textContent,
      redKey: document.getElementById('keyRed').textContent,
    };
  });
  console.log('\n=== Player Stats ===');
  console.log(JSON.stringify(stats, null, 2));

  await browser.close();
  console.log('\nDone!');
})();
