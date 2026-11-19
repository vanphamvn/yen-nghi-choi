import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, sep } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../lab/assets/sprites/collections');
const assets = join(root, 'assets');
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
const groups = ['coffee-tea', 'positive-psychology', 'walking', 'breathing'];
const paths = [...manifest.sprites.map(s => s.path), ...manifest.sourceSheets.map(s => s.path)];

test('Yên Lab supplemental sprite registry covers all four categories', () => {
  assert.equal(manifest.sprites.length, 105);
  assert.equal(manifest.sourceSheets.length, 6);
  const counts = Object.fromEntries(groups.map(g => [g, manifest.sprites.filter(s => s.category === g).length]));
  assert.deepEqual(counts, { 'coffee-tea': 38, 'positive-psychology': 40, walking: 15, breathing: 12 });
  assert.equal(new Set(paths).size, paths.length, 'asset paths must be unique');
});

test('every referenced sprite is a non-empty genuine WebP file', () => {
  for (const rel of paths) {
    const path = resolve(assets, rel);
    assert.ok(path.startsWith(assets + sep), 'path traversal blocked: ' + rel);
    assert.ok(existsSync(path), 'missing: ' + rel);
    assert.ok(statSync(path).size > 200, 'too small: ' + rel);
    const bytes = readFileSync(path);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', rel);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', rel);
  }
});

test('breathing sequence has a 12-frame cycle and safe reduced-motion state', () => {
  assert.equal(manifest.breathing.frameCount, 12);
  assert.deepEqual(manifest.breathing.frameSize, [362, 362]);
  assert.equal(manifest.breathing.frames.length, 12);
  assert.ok(manifest.breathing.reducedMotion.includes('static'));
  const refs = new Set(manifest.sprites.map(s => s.path));
  for (const frame of manifest.breathing.frames) assert.ok(refs.has(frame), frame);
});

test('static reviewer gallery lists all graphics and has non-treatment copy', () => {
  const page = readFileSync(join(root, 'index.html'), 'utf8');
  assert.equal((page.match(/<figure>/g) ?? []).length, 105);
  assert.ok(page.includes('không thay thế tư vấn hoặc điều trị chuyên môn'));
  assert.ok(page.includes('Nguồn phương pháp'));
  assert.ok(!page.includes('http://'));
});
