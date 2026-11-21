// Build lightweight painted-world WebP with a JPEG/PNG fallback from a licensed source.
// Run locally / in CI with the project's installed Playwright Chromium. No network or API keys.
// Example:
// node tools/optimize-yen-art.mjs --input lab/assets/cup.webp --output /tmp/yen-cup --alpha --max-width 200
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { chromium } from "@playwright/test";

function options(args) {
  const o = { quality: 0.85, maxWidth: 1600, alpha: false };
  for (let i=0; i<args.length; i++) {
    const arg = args[i];
    if (arg === "--alpha") o.alpha = true;
    else if (["--input", "--output", "--quality", "--max-width"].includes(arg)) {
      const next = args[++i];
      if (!next) throw new Error("Missing value for " + arg);
      o[{ "--input": "input", "--output": "output", "--quality": "quality", "--max-width": "maxWidth" }[arg]] = next;
    } else throw new Error("Unsupported argument: " + arg);
  }
  o.quality = Number(o.quality);
  o.maxWidth = Number(o.maxWidth);
  if (!o.input || !o.output || !Number.isFinite(o.quality) || o.quality < 0.5 || o.quality > 1 ||
      !Number.isInteger(o.maxWidth) || o.maxWidth < 64 || o.maxWidth > 4096) {
    throw new Error("Use --input PATH --output PREFIX [--alpha] [--quality 0.5..1] [--max-width 64..4096]");
  }
  return o;
}

function decode(encoded) {
  const part = encoded.indexOf(",");
  if (part < 0) throw new Error("Invalid encoder data URI");
  return Buffer.from(encoded.slice(part + 1), "base64");
}

export async function optimizeArt(opts) {
  const o = typeof opts === "object" ? { ...opts } : options(opts);
  const input = resolve(o.input);
  const output = resolve(o.output);
  if (input === output || output.startsWith(input + ".")) throw new Error("Refusing to overwrite source asset");
  const ext = extname(input).toLowerCase();
  const mime = ({ ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" })[ext];
  if (!mime) throw new Error("Only PNG, JPEG or WebP painted sources are supported");
  const source = readFileSync(input);
  const url = "data:" + mime + ";base64," + source.toString("base64");
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.LAB_UX_CHROMIUM_PATH ? { executablePath: process.env.LAB_UX_CHROMIUM_PATH } : {})
  });
  let encoded;
  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    encoded = await page.evaluate(async ({ url, quality, maxWidth, alpha }) => {
      const img = new Image();
      img.src = url;
      await img.decode();
      const width = Math.min(img.naturalWidth, maxWidth);
      const height = Math.max(1, Math.round(img.naturalHeight * width / img.naturalWidth));
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha });
      if (!alpha) { ctx.fillStyle = "#f7f3e9"; ctx.fillRect(0, 0, width, height); }
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      const webp = canvas.toDataURL("image/webp", quality);
      const fallback = canvas.toDataURL(alpha ? "image/png" : "image/jpeg", quality);
      if (!webp.startsWith("data:image/webp") || !fallback.startsWith(alpha ? "data:image/png" : "data:image/jpeg")) {
        throw new Error("Encoder does not support requested output formats");
      }
      return { webp, fallback, width, height };
    }, { url, quality: o.quality, maxWidth: o.maxWidth, alpha: o.alpha });
    await page.close();
  } finally {
    await browser.close();
  }
  mkdirSync(dirname(output), { recursive: true });
  const fallbackExt = o.alpha ? ".png" : ".jpg";
  writeFileSync(output + ".webp", decode(encoded.webp));
  writeFileSync(output + fallbackExt, decode(encoded.fallback));
  const outputPaths = [output + ".webp", output + fallbackExt];
  const sizes = outputPaths.map(path => statSync(path).size);
  if (sizes.some(size => size < 100)) throw new Error("Invalid conversion result");
  return { width: encoded.width, height: encoded.height, webp: outputPaths[0],
    fallback: outputPaths[1], bytes: { webp: sizes[0], fallback: sizes[1] } };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  optimizeArt(options(process.argv.slice(2))).then(report => {
    console.log(JSON.stringify(report, null, 2));
  }).catch(err => { console.error(err.message); process.exitCode = 1; });
}
