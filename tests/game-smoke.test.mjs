// Run with: node --test tests/game-smoke.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../game/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../game/style.css',import.meta.url),'utf8');
const js=readFileSync(new URL('../game/game.js',import.meta.url),'utf8');
const site=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const extract=(before,after)=>{
  const start=js.indexOf(before),end=js.indexOf(after,start+before.length);
  assert.ok(start>=0&&end>start,'Missing source block: '+before);
  return js.slice(start+before.length,end).trim();
};
const roles=vm.runInNewContext('('+extract('const ROLES = ',';\nconst STAT_INFO')+')');
const stations=vm.runInNewContext('('+extract('const STATIONS = ',';\nlet selectedRole')+')');

test('game exposes five distinct playable roles',()=>{
  assert.deepEqual(Object.keys(roles).sort(),['barista','cat','guard','shipper','waiter']);
  for (const [id,role] of Object.entries(roles)) {
    assert.equal(role.tasks.length,3,id+' needs three tasks');
    assert.ok(role.power&&role.desc&&role.name);
    for(const task of role.tasks) assert.ok(stations[task.at],id+' has an unknown station: '+task.at);
  }
});

test('12-point allocation respects four attributes with 1..5 range',()=>{
  assert.ok(js.includes('stats = { speed: 3, dexterity: 3, calm: 3, charm: 3 }'));
  assert.ok(js.includes('12 - totalStats()'));
  assert.ok(js.includes('stats[st.key] <= 1'));
  assert.ok(js.includes('stats[st.key] >= 5 || remain === 0'));
  assert.ok(js.includes('if (totalStats() !== 12) return'));
});

test('HTML contains the creator, HUD, touch controls, and result views',()=>{
  for (const id of ['setup','role-grid','stats','points-left','start-btn','game','scene',
    'objective-title','interact-btn','skill-btn','joystick','clock','eff-bar','yen-bar',
    'result','result-tasks','result-eff','result-yen','error']) {
    assert.ok(html.includes('id="'+id+'"'),'Missing required element: '+id);
  }
  for(const role of Object.keys(roles)) assert.ok(html.includes('data-role="'+role+'"'));
  assert.ok(css.includes('@media(max-width:520px)'),'Missing responsive layout');
  assert.ok(css.includes('touch-action:none'),'Touch control should prevent scroll hijacking');
});

test('game is separate from main website and does not track visitors',()=>{
  assert.ok(site.includes('href="/game/"'),'Homepage should link to /game/');
  assert.ok(html.includes('href="../"'),'Game should link back home');
  assert.ok(html.includes('noindex,nofollow'),'New preview should remain unindexed');
  assert.ok(!/localStorage|sessionStorage|document\.cookie|sendBeacon|google-analytics|gtag\(/i.test(js));
  assert.ok(js.includes("import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js')"));
  assert.ok(js.includes('if (!game || !game.playing || !world) return;'),'Game animation must stop safely after cleanup');
});

test('game JavaScript is syntactically valid',()=>{
  assert.doesNotThrow(()=>new vm.Script(js,{filename:'game/game.js'}));
});
