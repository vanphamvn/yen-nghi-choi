#!/usr/bin/env node
// Picks the next eligible work for the 30-day visual-novel epic (#218).
// Reads docs/visual-novel/ops/roadmap.json (ticket order) and docs/visual-novel/episodes.json (incident status).
// GitHub state is optional: pass --gh to read issue/PR state with the gh CLI, or --state <file.json> with
// {"issues": {"223": "OPEN"}, "openPrs": [{"number": 1, "headRefName": "vn/d02", "title": "..."}]} for tests.
// Output: JSON on stdout. Never writes files.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DONE_STATUSES = new Set(["playable", "done", "released"]);
const REPO = "vanphamvn/yen-nghi-choi";

export const pad = (n) => String(n).padStart(2, "0");
export const sliceBranch = (day) => `vn/d${pad(day)}`;

export function loadInputs(root = ROOT) {
  const roadmap = JSON.parse(readFileSync(path.join(root, "docs/visual-novel/ops/roadmap.json"), "utf8"));
  const episodes = JSON.parse(readFileSync(path.join(root, "docs/visual-novel/episodes.json"), "utf8"));
  return { roadmap, episodes };
}

export function dayIsDone(day) {
  return day.incidents.length > 0 && day.incidents.every((i) => DONE_STATUSES.has(i.status));
}

function ghState() {
  const gh = process.env.GH_BIN || "gh";
  const run = (args) => JSON.parse(execFileSync(gh, args, { encoding: "utf8" }));
  const issues = {};
  for (const i of run(["issue", "list", "--repo", REPO, "--state", "all", "--limit", "300", "--json", "number,state"])) {
    issues[String(i.number)] = i.state;
  }
  const openPrs = run(["pr", "list", "--repo", REPO, "--state", "open", "--limit", "100", "--json", "number,headRefName,title"]);
  return { issues, openPrs };
}

// A PR is "in flight" for a day when its branch is vn/dNN... or its title names DNN-.
export function prForDay(openPrs, day) {
  const tag = `D${pad(day)}-`;
  return openPrs.find((p) => p.headRefName.startsWith(sliceBranch(day)) || p.title.includes(tag)) || null;
}

export function nextWork({ roadmap, episodes }, state = { issues: {}, openPrs: [] }) {
  const daysByNumber = new Map(episodes.days.map((d) => [d.day, d]));
  const byId = new Map(roadmap.tickets.map((t) => [t.id, t]));

  const ticketDone = (t) => {
    const gh = state.issues[String(t.issue)];
    if (gh) return gh === "CLOSED";
    if (!t.days) return false; // engine/release tickets: only GitHub can say they are done
    for (let d = t.days[0]; d <= t.days[1]; d++) if (!dayIsDone(daysByNumber.get(d))) return false;
    return true;
  };

  const eligible = [], blocked = [], inFlight = [], done = [];
  for (const t of roadmap.tickets) {
    if (ticketDone(t)) { done.push(t.id); continue; }
    const missing = t.dependsOn.filter((id) => !ticketDone(byId.get(id)));
    if (missing.length) { blocked.push({ ticket: t.id, issue: t.issue, waitingFor: missing }); continue; }

    if (!t.days) {
      const pr = state.openPrs.find((p) => p.title.includes(t.id));
      if (pr) inFlight.push({ ticket: t.id, issue: t.issue, pr: pr.number });
      else eligible.push({ ticket: t.id, issue: t.issue, kind: t.kind, slice: null });
      continue;
    }
    // Story tickets: the earliest unfinished day in range is the slice. Later days wait for it
    // because callbacks and flags flow forward day by day.
    for (let d = t.days[0]; d <= t.days[1]; d++) {
      const day = daysByNumber.get(d);
      if (dayIsDone(day)) continue;
      const pr = prForDay(state.openPrs, d);
      if (pr) { inFlight.push({ ticket: t.id, issue: t.issue, day: d, pr: pr.number }); break; }
      eligible.push({
        ticket: t.id, issue: t.issue, kind: t.kind,
        slice: {
          day: d, dayId: day.id, title: day.title, branch: sliceBranch(d),
          incidents: day.incidents.map((i) => ({ id: i.id, slot: i.slot, title: i.title, carryFlag: i.carryFlag, status: i.status })),
        },
      });
      break;
    }
  }
  return { done, eligible, inFlight, blocked };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  let state;
  if (args.includes("--gh")) state = ghState();
  const si = args.indexOf("--state");
  if (si >= 0) state = JSON.parse(readFileSync(args[si + 1], "utf8"));
  process.stdout.write(JSON.stringify(nextWork(loadInputs(), state), null, 2) + "\n");
}
