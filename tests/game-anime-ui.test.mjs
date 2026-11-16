// Run: node --test tests/game-anime-ui.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../game/index.html',import.meta.url),'utf8');
const game=readFileSync(new URL('../game/game.js',import.meta.url),'utf8');
const world=readFileSync(new URL('../game/world-babylon.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../game/style.css',import.meta.url),'utf8');

test('objective starts collapsed and has accessible disclosure',()=>{
  assert.match(html,/id="objective-panel" hidden/);
  assert.match(html,/id="objective-toggle"[^>]*aria-expanded="false"/);
  assert.match(html,/aria-controls="objective-panel"/);
  assert.match(html,/id="objective-pill"/);
  assert.match(css,/\.objective-shell \.objective\[hidden\]/);
  assert.match(html,/id="game-toast"[^>]*hidden/);
});

test('Babylon renderer exposes anime shading and five role-safe models',()=>{
  assert.doesNotThrow(()=>new vm.Script(world.replace('export function createAnimeWorld','function createAnimeWorld')));
  for(const token of [
    'new B.Engine(', 'new B.Scene(', 'new B.FreeCamera(',
    'yenAnimeVertexShader','yenAnimeFragmentShader',
    'createAnimeWorld(B, container, roleId, roles, npcData)',
    'function makeHuman','function makeCat','function makeCharacter',
    'function toon','npcs.push','setTint(mesh,hex)'
  ]) assert.ok(world.includes(token),'Missing scene feature: '+token);
  assert.ok(game.includes('babylonjs@9.36.0/babylon.js'));
  assert.ok(game.includes("import('./world-babylon.js')"));
  assert.ok(!game.includes('new THREE.'));
  assert.ok(!game.includes('WebGLRenderer'));
});

test('objective button toggles state and dialogue works with the panel closed',()=>{
  const nodes=new Map();
  const $=id=>{
    if(!nodes.has(id))nodes.set(id,{
      id,hidden:id==='objective-panel'||id==='game-toast',disabled:false,
      textContent:'',innerHTML:'',dataset:{},style:{},attributes:{},handlers:{},
      addEventListener(name,fn){this.handlers[name]=fn},
      setAttribute(name,value){this.attributes[name]=value},
      append(){},
      querySelector(){return {getBoundingClientRect(){return {width:100,height:100,left:0,top:0}}}}
    });
    return nodes.get(id);
  };
  const context=vm.createContext({
    document:{getElementById:$,querySelectorAll(){return []},
      createElement(){return {style:{},append(){},addEventListener(){},setAttribute(){}}}},
    window:{addEventListener(){}},
    console,
    requestAnimationFrame(){return 1},
    cancelAnimationFrame(){}
  });
  vm.runInContext(game,context);
  assert.equal($('objective-panel').hidden,true);
  $('objective-toggle').handlers.click();
  assert.equal($('objective-panel').hidden,false);
  assert.equal($('objective-toggle').attributes['aria-expanded'],'true');
  $('objective-toggle').handlers.click();
  assert.equal($('objective-panel').hidden,true);
  assert.equal($('objective-toggle').attributes['aria-expanded'],'false');

  vm.runInContext("game={phase:'explore',message:'',messageTime:0};showMessage('Mèo đang ngủ.',3);",context);
  assert.equal($('game-toast').hidden,false);
  assert.equal($('game-toast').textContent,'Mèo đang ngủ.');
  assert.equal($('objective-panel').hidden,true);
});
