// LAB-F06 (#130): shared game screen primitives (lab/game.css) exercised through the design kit page.
import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const KIT = '/docs/yen-lab/game-kit.html';
const WIDTHS = [320, 360, 390, 768, 1440];
const SHOTS = 'test-results/lab-ux/game-kit-shots';

async function blockExternal(page) {
  const external = [];
  await page.route(url => !/^http:\/\/127\.0\.0\.1:4189\//.test(url.href), route => { external.push(route.request().url()); return route.abort(); });
  return external;
}
const visibleWords = page => page.locator('#game-controls .ink-word').evaluateAll(list => list.filter(el => el.offsetParent !== null).map(el => el.textContent.trim()));

test('ink-word controls walk idle → running → paused → running → stopped → idle, focus never lost', async ({ page }, testInfo) => {
  const external = await blockExternal(page);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(KIT);
  const game = page.locator('#game');
  const press = async name => {
    const word = page.getByRole('button', { name, exact: true });
    if (testInfo.project.name === 'emulated-touch') await word.tap(); else await word.click();
  };

  await expect(game).toHaveAttribute('data-state', 'idle');
  expect(await visibleWords(page)).toEqual(['bắt đầu', 'về góc ngồi chơi']);
  // The caution sits right above "bắt đầu" (SAFETY.md) and the cue/progress are hidden until running.
  await expect(page.getByText('Không cần hít sâu hay nín thở', { exact: false })).toBeVisible();
  await expect(page.locator('#game-cue')).toBeHidden();

  await press('bắt đầu');
  await expect(game).toHaveAttribute('data-state', 'running');
  expect(await visibleWords(page)).toEqual(['tạm dừng', 'dừng hẳn']);
  await expect(page.getByRole('button', { name: 'tạm dừng' })).toBeFocused();
  await expect(page.locator('#game-cue')).toBeVisible();
  await expect(page.getByText('vòng 2 / 6')).toBeVisible();

  await press('tạm dừng');
  await expect(game).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('#game-whisper')).toHaveText('Đang tạm dừng.');
  expect(await visibleWords(page)).toEqual(['tiếp tục', 'dừng hẳn']);
  await press('tiếp tục');
  await expect(game).toHaveAttribute('data-state', 'running');

  await press('dừng hẳn');
  await expect(game).toHaveAttribute('data-state', 'stopped');
  await expect(page.getByText('Mình dừng ở đây nhé.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'làm lại' })).toBeFocused();

  // Optional reflection: answering hides the question; nothing is kept.
  await press('như cũ');
  await expect(page.locator('#game-reflect')).toBeHidden();
  await expect(page.locator('#game-whisper')).toHaveText('Cảm ơn bạn đã tự để ý một chút.');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, location.search, location.hash])).toEqual([0, 0, '', '', '']);

  await press('làm lại');
  await expect(game).toHaveAttribute('data-state', 'idle');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('keyboard only: Tab reaches the main word, Enter and Space act on it', async ({ page }) => {
  await blockExternal(page);
  await page.goto(KIT);
  const start = page.getByRole('button', { name: 'bắt đầu' });
  for (let i = 0; i < 12 && !(await start.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(start).toBeFocused();
  // Focus is visible: a real outline in the focus colour.
  expect(await start.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'running');
  await page.keyboard.press('Space'); // focused word is now "tạm dừng"
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'paused');
});

test('complete state is quiet: no score, reflection skippable, way back to the room', async ({ page }) => {
  await blockExternal(page);
  await page.goto(KIT + '?state=complete');
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'complete');
  await expect(page.getByText('Xong rồi. Không cần thấy khác đi.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'bỏ qua' })).toBeVisible();
  await expect(page.locator('#game-controls').getByRole('link', { name: 'về góc ngồi chơi' })).toHaveAttribute('href', '/lab/');
  await expect(page.getByText(/điểm|chuỗi|streak|score/i)).toHaveCount(0);
  // On a 360×800 phone the main word stays in the first screen after the game.
  await page.setViewportSize({ width: 360, height: 800 });
  const again = await page.getByRole('button', { name: 'làm lại' }).boundingBox();
  expect(again.y + again.height).toBeLessThanOrEqual(800);
  await page.goto(KIT + '?state=<script>');
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'idle'); // unknown states fall back safely
});

test('controls are words on paper, not pills: no background, border or box shadow', async ({ page }) => {
  await page.goto(KIT);
  const styles = await page.locator('.ink-word').evaluateAll(list => list.map(el => {
    const s = getComputedStyle(el);
    return [s.backgroundColor, s.borderTopStyle, s.boxShadow];
  }));
  for (const [bg, border, shadow] of styles) {
    expect(bg).toBe('rgba(0, 0, 0, 0)');
    expect(border).toBe('none');
    expect(shadow).toBe('none');
  }
});

test('reduced motion keeps every state usable with no animation or transition', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(KIT);
  await page.getByRole('button', { name: 'bắt đầu' }).click();
  await expect(page.locator('#game-cue')).toBeVisible();
  const moving = await page.evaluate(() => [...document.querySelectorAll('.game *')].filter(el => {
    const s = getComputedStyle(el);
    return (s.animationName !== 'none' && parseFloat(s.animationDuration) > 0) || parseFloat(s.transitionDuration) > 0;
  }).length);
  expect(moving).toBe(0);
  await context.close();
});

test('WCAG AA contrast for every visible text colour on the paper sheet', async ({ page }) => {
  await page.goto(KIT + '?state=paused');
  const lum = c => { const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => v / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
  const paper = await page.locator('.game-sheet').evaluate(el => getComputedStyle(el).backgroundColor);
  for (const state of ['idle', 'running', 'paused', 'complete', 'stopped', 'error']) {
    await page.goto(KIT + '?state=' + state);
    const colours = await page.locator('.game-sheet').evaluate(sheet => [...sheet.querySelectorAll('*')]
      .filter(el => el.offsetParent !== null && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
      .map(el => ({ text: el.textContent.trim().slice(0, 20), color: getComputedStyle(el).color, size: parseFloat(getComputedStyle(el).fontSize) })));
    expect(colours.length, state).toBeGreaterThan(3);
    for (const { text, color, size } of colours) {
      const [a, b] = [lum(color), lum(paper)].sort((x, y) => y - x);
      const ratio = (a + .05) / (b + .05);
      expect(ratio, `${state}: "${text}" ${color}`).toBeGreaterThanOrEqual(size >= 24 ? 3 : 4.5);
    }
  }
});

for (const width of WIDTHS) {
  test(`no overflow, ≥44px words, one-line words and state screenshots at ${width}px`, async ({ page }, testInfo) => {
    await blockExternal(page);
    await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
    mkdirSync(SHOTS, { recursive: true });
    for (const state of ['idle', 'running', 'paused', 'complete', 'stopped', 'error']) {
      await page.goto(`${KIT}?state=${state}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), state).toBe(true);
      const words = await page.locator('.game .ink-word').evaluateAll(list => list.filter(el => el.offsetParent !== null).map(el => {
        const r = el.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(el);
        const sheet = el.closest('.game-sheet').getBoundingClientRect();
        return { text: el.textContent.trim(), w: r.width, h: r.height, lines: range.getClientRects().length,
          inside: r.left >= sheet.left - 0.5 && r.right <= sheet.right + 0.5 && sheet.left >= 0 && sheet.right <= innerWidth };
      }));
      expect(words.length, state).toBeGreaterThan(0);
      for (const w of words) {
        // .game clips overflow, so check each word really sits inside the sheet and the sheet inside the viewport.
        expect(w.inside, `${state} "${w.text}" clipped`).toBe(true);
        expect(Math.min(w.w, w.h), `${state} "${w.text}"`).toBeGreaterThanOrEqual(44);
        expect(w.lines, `${state} "${w.text}" wraps`).toBe(1); // Vietnamese words never break mid-control
      }
      if (['idle', 'running', 'complete'].includes(state) && testInfo.project.name === 'desktop') {
        const shot = await page.screenshot({ fullPage: false });
        await testInfo.attach(`kit-${state}-${width}`, { body: shot, contentType: 'image/png' });
        await page.screenshot({ path: `${SHOTS}/${state}-${width}.png` });
      }
    }
  });
}
