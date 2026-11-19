import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../lab/assets/sprites');
const manifest=JSON.parse(readFileSync(join(root,'manifest.json'),'utf8'));
const assets=[manifest.book.atlas,...manifest.book.individualFrames,...manifest.games.map(g=>g.file),...manifest.shared.map(s=>s.file)];
test('catalog maps 20 games, 18 shared sprites and 8 page flip frames',()=>{
 assert.equal(manifest.games.length,20);assert.equal(manifest.shared.length,18);
 assert.equal(manifest.book.individualFrames.length,8);assert.equal(new Set(assets).size,assets.length);
});
test('all sprite file paths are safe, exist and contain real RIFF/WebP data',()=>{
 for(const rel of assets){
  const full=resolve(root,rel);
  assert.ok(full.startsWith(root+sep),rel);
  assert.ok(existsSync(full),rel);
  const file=readFileSync(full);
  assert.equal(file.toString('ascii',0,4),'RIFF',rel);
  assert.equal(file.toString('ascii',8,12),'WEBP',rel);
  assert.ok(file.length>500,rel);
 }
});
test('page flip atlas dimensions and frames are declared coherently',()=>{
 assert.equal(manifest.book.columns*manifest.book.rows,8);
 assert.equal(manifest.book.frameWidth,410);
 assert.equal(manifest.book.frameHeight,410);
 assert.equal(manifest.book.loop,false);
});
test('page flip atlas pixel size matches the declared grid',()=>{
 const file=readFileSync(join(root,manifest.book.atlas));
 assert.equal(file.toString('ascii',12,16),'VP8X','atlas must be an extended WebP with a canvas header');
 const width=file.readUIntLE(24,3)+1,height=file.readUIntLE(27,3)+1;
 assert.equal(width,manifest.book.columns*manifest.book.frameWidth);
 assert.equal(height,manifest.book.rows*manifest.book.frameHeight);
});
