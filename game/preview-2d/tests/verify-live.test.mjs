import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {compareLive} from '../tools/verify-live.mjs';

test('live gate detects stale assets and HTML fallbacks, accepts exact bytes', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'yen-live-'));
  try {
    mkdirSync(path.join(root, 'assets'));
    for (const file of ['index.html','game.js','style.css','assets/hero.png']) writeFileSync(path.join(root,file), file);
    const mock = mode => async url => {
      const file = url.pathname.replace('/game/preview-2d/', '');
      return new Response(mode === 'stale' && file.endsWith('.png') ? '<html>fallback</html>' : file);
    };
    assert.equal((await compareLive(root,'https://example.test/game/preview-2d/',mock('ok'))).status, 'CONTENT_MATCH');
    const stale = await compareLive(root,'https://example.test/game/preview-2d/',mock('stale'));
    assert.equal(stale.status,'BLOCKED');
    assert.equal(stale.results.find(r=>r.file.endsWith('.png')).pass,false);
    const failed = await compareLive(root,'https://example.test/game/preview-2d/',async()=>{throw Error('timeout')});
    assert.equal(failed.status,'BLOCKED');
  } finally { rmSync(root,{recursive:true,force:true}); }
});
