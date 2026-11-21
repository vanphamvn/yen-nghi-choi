// VN-F02 · Visual asset manifest gate. An incident cannot become "ready" on descriptions alone.
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, sep } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const states = ["establishing", "interactive", "resolution"];
const types = ["background", "actor", "prop", "effect"];
const assert = (ok, message) => { if (!ok) throw new Error("Yên art audit: " + message); };
const filled = (v) => typeof v === "string" && v.trim().length > 2;

function assetFile(path) {
  assert(filled(path) && !path.includes("\\") && !path.startsWith("/") &&
    !path.includes("..") && /^(?:lab\/assets|assets\/cuc-yen\/sprites|tinh-huong\/assets)\//.test(path) &&
    /\.(?:png|jpe?g|webp|avif)$/i.test(path), "unsafe/unsupported asset path: " + path);
  const absolute = resolve(root, path);
  assert(absolute.startsWith(root + sep), "asset path escapes project");
  assert(existsSync(absolute) && statSync(absolute).isFile(), "asset missing: " + path);
  const buffer = readFileSync(absolute);
  assert(buffer.length > 100, "asset empty: " + path);
  const isJPEG = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isPNG = buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const isWEBP = buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  const isAVIF = buffer.toString("ascii", 4, 12).includes("ftypavif");
  assert(isJPEG || isPNG || isWEBP || isAVIF, "asset signature invalid: " + path);
  return { bytes: buffer.length };
}

export function auditArtManifest(manifest, catalog, { checkFiles = true } = {}) {
  assert(manifest.schemaVersion === 1 && manifest.status === "foundation-only", "unsupported foundation manifest");
  assert(Array.isArray(manifest.sourceAssets) && manifest.sourceAssets.length >= 5, "missing painted reference set");
  assert(Array.isArray(catalog.days) && catalog.days.length === 30, "catalog must contain 30 days");
  const requiredIDs = catalog.days.flatMap(day => day.incidents.map(e => e.id));
  assert(requiredIDs.length === 90 && new Set(requiredIDs).size === 90, "catalog invalid");
  assert(Array.isArray(manifest.incidents) && manifest.incidents.length === requiredIDs.length, "art manifest must have 90 incidents");
  const seenAssets = new Set();
  const sourceBytes = {};
  for (const asset of manifest.sourceAssets) {
    assert(filled(asset.id) && !seenAssets.has(asset.id) && types.includes(asset.kind), "bad reference ID/type");
    seenAssets.add(asset.id);
    assert(filled(asset.origin) && asset.usage === "runtime-reference", "unproven reference source");
    assert(Number.isInteger(asset.width) && asset.width > 0 &&
      Number.isInteger(asset.height) && asset.height > 0, "missing native dimensions: " + asset.id);
    if (checkFiles) sourceBytes[asset.id] = assetFile(asset.path).bytes;
  }

  const seen = new Set();
  let ready = 0;
  for (const [index, item] of manifest.incidents.entries()) {
    assert(item.id === requiredIDs[index] && !seen.has(item.id), "incorrect incident ID: " + item.id);
    seen.add(item.id);
    assert(filled(item.title) && item.status && ["planned", "in-progress", "ready"].includes(item.status), item.id + " invalid status");
    assert(filled(item.interactionBrief), item.id + " missing in-scene interaction brief");
    for (const stage of states) {
      assert(filled(item.requiredBrief?.[stage]) && item.frames?.[stage], item.id + " missing " + stage);
      const frame = item.frames[stage];
      assert(Array.isArray(frame.actors) && Array.isArray(frame.props), item.id + " missing layer arrays");
    }
    assert(Array.isArray(item.visualChanges) && item.artReview &&
      typeof item.artReview.ownerReviewPending === "boolean", item.id + " missing art review contract");

    if (item.status === "ready") {
      ready++;
      const fingerprints = [];
      for (const stage of states) {
        const frame = item.frames[stage];
        assert(filled(frame.alt) && filled(frame.background), item.id + " shot without scene and alt: " + stage);
        if (checkFiles) assetFile(frame.background);
        const layers = [...frame.actors, ...frame.props];
        assert(layers.length >= 1, item.id + " shot requires real visible layer");
        for (const layer of layers) {
          assert(filled(layer.id) && filled(layer.src) && filled(layer.state) &&
            filled(layer.alt) && Number.isFinite(layer.x) && Number.isFinite(layer.y),
            item.id + " layer needs source, state, alt and anchor coordinates");
          if (checkFiles) assetFile(layer.src);
        }
        fingerprints.push(JSON.stringify({
          background:frame.background,
          actors:frame.actors.map(a=>[a.src,a.state,a.x,a.y]),
          props:frame.props.map(p=>[p.src,p.state,p.x,p.y])
        }));
      }
      assert(new Set(fingerprints).size === 3, item.id + " cannot reuse one unchanged frame for all three stages");
      assert(item.visualChanges.length >= 1 && item.visualChanges.some(c =>
        ["actor", "prop", "setting"].includes(c.layer) && filled(c.from) && filled(c.to) && c.from !== c.to),
        item.id + " must show a meaningful on-scene consequence");
      assert(["agent-reviewed","human-reviewed"].includes(item.artReview.status) &&
        filled(item.artReview.reviewerType) && filled(item.artReview.reviewEvidence),
        item.id + " cannot be ready without review evidence");
    }
  }
  return { days: 30, incidents: seen.size, ready, planned: seen.size - ready, sourceBytes };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = JSON.parse(readFileSync(resolve(root, "docs/visual-novel/art-manifest.json"), "utf8"));
  const catalog = JSON.parse(readFileSync(resolve(root, "docs/visual-novel/episodes.json"), "utf8"));
  const result = auditArtManifest(manifest, catalog);
  console.log("Yên visual art audit:", JSON.stringify(result, null, 2));
  if (result.ready === 0) console.log("No released art. All 90 incidents remain planned; correct at foundation stage.");
}
