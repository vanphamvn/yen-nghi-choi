// Renders every Cục Yên pose in assets/cuc-yen/mascot.svg to a transparent WebP sprite.
//
// Why: iOS WebKit does not resolve gradients/patterns/clipPaths/filters referenced from inside an
// external <use href="/assets/cuc-yen/mascot.svg#…">, so Cục Yên's body painted transparent on iPhone.
// The homepage therefore draws raster sprites (SVG <image> / <img>) rendered here by Chromium.
//
// Usage (needs the local fixture server for a same-origin page):
//   node tools/serve-lab-ux.mjs &
//   node tools/render-cuc-yen-sprites.mjs [size=800]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const size = Number(process.argv[2] || 800);
const origin = `http://127.0.0.1:${process.env.LAB_UX_PORT || 4189}`;
const svgSource = readFileSync(new URL('../assets/cuc-yen/mascot.svg', import.meta.url), 'utf8');
const poses = [...svgSource.matchAll(/<symbol id="cuc-yen-([a-z-]+)"/g)].map(m => m[1]);
const outDir = new URL('../assets/cuc-yen/sprites/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: size + 40, height: size + 40 }, deviceScaleFactor: 1 });
await page.goto(origin + '/404.html');
for (const pose of poses) {
  await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}</style>
    <svg id="s" width="${size}" height="${size}" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <use href="${origin}/assets/cuc-yen/mascot.svg#cuc-yen-${pose}"/></svg>`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  const png = await page.locator('#s').screenshot({ omitBackground: true });
  const webp = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.9).split(',')[1];
  }, png.toString('base64'));
  const bytes = Buffer.from(webp, 'base64');
  writeFileSync(new URL(pose + '.webp', outDir), bytes);
  console.log(pose.padEnd(14), size + '×' + size, (bytes.length / 1024).toFixed(1) + ' KB');
}
await browser.close();
