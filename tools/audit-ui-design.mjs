#!/usr/bin/env node
// Self-contained contract check for Yên's own original UI design instructions.
// This does not execute third-party code or claim to audit browser visuals.
import { readFileSync } from "node:fs";

const errors = [];
const warnings = [];
const load = (p) => {
  try { return readFileSync(new URL("../" + p, import.meta.url), "utf8"); }
  catch { errors.push("Missing: " + p); return ""; }
};
const requireRule = (ok, message) => { if (!ok) errors.push(message); };

const design = load("DESIGN.md");
const skill = load(".agents/skills/yen-ui-craft/SKILL.md");
const claude = load(".claude/skills/yen-ui-craft/SKILL.md");
const research = load(".agents/skills/yen-ui-craft/references/RESEARCH-NOTES.md");
const qa = load(".agents/skills/yen-ui-craft/references/QA-CHECKLIST.md");
const agents = load("AGENTS.md");

requireRule(/^---\r?\nversion: alpha\r?\nname: Yên Coffee & Tea/m.test(design), "DESIGN.md must declare the Google alpha format and Yên identity");
requireRule(/^---\r?\nname: yen-ui-craft\r?\ndescription:/m.test(skill), "Canonical skill must have discoverable name and description");
requireRule(/^---\r?\nname: yen-ui-craft\r?\ndescription:/m.test(claude), "Claude skill entrypoint needs valid frontmatter");
requireRule(claude.includes(".agents/skills/yen-ui-craft/SKILL.md"), "Claude entrypoint must point to canonical skill");
requireRule(agents.includes("yen-ui-craft/SKILL.md"), "AGENTS.md must route web UI changes to active skill");
requireRule(skill.includes("DESIGN.md") && skill.includes("QA-CHECKLIST.md"), "Skill must read design and QA contract");
requireRule(skill.includes("paused") && /Yên Lab Beta/i.test(skill), "Skill must prioritize the new beta and pause legacy game work");
requireRule(qa.includes("320×640") && qa.includes("1440×900") && qa.includes("reduced-motion"), "QA checklist must cover mobile, desktop and motion fallback");
requireRule(qa.includes("production") && qa.includes("privacy"), "QA must include production and privacy gates");

const repos = [
  "nextlevelbuilder/ui-ux-pro-max-skill",
  "VoltAgent/awesome-design-md",
  "nexu-io/open-design",
  "Leonxlnx/taste-skill",
  "pbakaus/impeccable",
  "DavidHDev/react-bits",
  "emilkowalski/skills",
  "nutlope/hallmark",
  "google-labs-code/design.md",
  "greensock/gsap-skills",
  "oso95/scroll-world",
  "DavidHDev/canvas-ui"
];
for (const repo of repos) {
  requireRule(research.toLowerCase().includes(("https://github.com/" + repo).toLowerCase()),
    "Reference missing: " + repo);
}

function getHex(name) {
  const line = design.split(/\r?\n/).find(s => s.startsWith("  " + name + ": "));
  const hex = line?.match(/#[a-f0-9]{6}\b/i)?.[0];
  requireRule(Boolean(hex), "Missing hex color token: " + name);
  return hex || "#000000";
}
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const paper = getHex("paper"), ink = getHex("ink"), muted = getHex("muted");
const green = getHex("green"), white = getHex("white");
for (const [name, a, b, minimum] of [
  ["paper/ink", paper, ink, 7],
  ["paper/muted", paper, muted, 4.5],
  ["green/white", green, white, 4.5]
]) {
  const ratio = contrast(a, b);
  requireRule(ratio >= minimum, "Contrast below " + minimum + ": " + name + " = " + ratio.toFixed(2));
}
if (design.includes("not yet generated")) warnings.push("Production CSS may still differ from DESIGN.md; browser QA remains necessary.");
for (const message of warnings) console.warn("WARN " + message);
if (errors.length) {
  for (const message of errors) console.error("FAIL " + message);
  process.exitCode = 1;
} else {
  console.log("PASS Yên UI design contract: skill discovery, design tokens, 12 references, QA and contrast");
}
