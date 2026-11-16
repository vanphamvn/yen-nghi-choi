// node --test tests/game-2d-production-route.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const home = read('game/index.html');
const original3d = read('game/3d.html');
const twoD = read('game/preview-2d/index.html');
const game = read('game/preview-2d/game.js');

test('The production game entry point redirects to the new 2D game', () => {
  assert.match(home,/<meta http-equiv="refresh" content="0;url=\.\/preview-2d\/"/);
  assert.match(home,/href="\.\/preview-2d\/"/);
  assert.match(home,/href="\.\/3d\.html"/);
  assert.match(home,/Yencafeday 2D/);
});

test('Babylon game still exists at a stable rollback URL',()=>{
  assert.match(original3d,/id="objective-panel" hidden/);
  assert.match(original3d,/src="\.\/game\.js"/);
  assert.match(original3d,/href="\.\/style\.css"/);
  assert.match(original3d,/BETA · 03/);
});

test('2D game assets use the five PNG sprite packs and real animation clips',()=>{
  assert.match(twoD,/phaser@4\.2\.1/);
  assert.match(game,/load\.spritesheet\(role,sheetUrl\(role/);
  assert.match(game,/this\.add\.sprite\(/);
  assert.match(game,/CLIPS=/);
  assert.match(game,/playDirectional/);
  assert.match(game,/const SPRITE_ROLES=\['barista','waiter','shipper','guard','cat'\]/);
  assert.doesNotMatch(game,/load\.svg\(role/);
});
