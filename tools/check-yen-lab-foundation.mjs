import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFileSync(path.join(root, p), 'utf8');
const roadmap = JSON.parse(read('docs/yen-lab/ops/roadmap.json'));
const tasks = new Map(roadmap.tasks.map(task => [task.key, task]));
assert.equal(tasks.size, roadmap.tasks.length, 'Task keys must be unique');
assert.equal(new Set(roadmap.tasks.map(t => t.issue)).size, tasks.size, 'Issue numbers must be unique');
assert.equal(roadmap.counts.all, tasks.size, 'Task count must match');
assert.equal(roadmap.tasks.filter(t => t.kind === 'minigame').length, roadmap.counts.mini_games);
assert.equal(roadmap.tasks.filter(t => t.kind !== 'minigame').length, roadmap.counts.foundations);
assert.equal(roadmap.target_route, '/lab/');
const allowed = new Set(['todo', 'in-progress', 'blocked', 'done']);
const visiting = new Set();
const visited = new Set();
function visit(key) {
  assert(tasks.has(key), `Unknown dependency ${key}`);
  assert(!visiting.has(key), `Dependency cycle at ${key}`);
  if (visited.has(key)) return;
  visiting.add(key);
  const task = tasks.get(key);
  assert(allowed.has(task.status), `Unknown status on ${key}`);
  assert(Array.isArray(task.depends_on), `Missing dependencies on ${key}`);
  assert.equal(new Set(task.depends_on).size, task.depends_on.length, `Duplicate dependency on ${key}`);
  for (const dependency of task.depends_on) visit(dependency);
  visiting.delete(key);
  visited.add(key);
}
for (const key of tasks.keys()) visit(key);
for (const gate of roadmap.gates) {
  for (const issue of gate.required_issues) {
    assert(roadmap.tasks.some(t => t.issue === issue), `Unknown gate issue ${issue}`);
  }
}
for (const file of ['docs/yen-lab/EVIDENCE.md', 'docs/yen-lab/SAFETY.md', 'docs/yen-lab/UX.md']) {
  assert(existsSync(path.join(root, file)), `Missing foundation deliverable ${file}`);
  assert(read(file).trim().length > 100, `Empty foundation deliverable ${file}`);
}
const evidenceRows = [...read('docs/yen-lab/EVIDENCE.md').matchAll(/^\| (G\d{2}) ·/gm)].map(match => match[1]);
const expectedGames = roadmap.tasks.filter(t => t.kind === 'minigame').map(t => t.key).sort();
assert.deepEqual(evidenceRows.sort(), expectedGames, 'Evidence matrix must cover each game once');
for (const file of ['docs/yen-lab/EVIDENCE.md', 'docs/yen-lab/SAFETY.md', 'docs/yen-lab/UX.md', 'docs/yen-lab/wireframes.html']) {
  assert(!read(file).includes('\uFFFD'), `Invalid UTF-8 replacement character in ${file}`);
}
console.log(`Foundation structure passed: ${tasks.size} unique tasks, acyclic dependencies, gate references and required documents. This is not scientific review or browser QA.`);
