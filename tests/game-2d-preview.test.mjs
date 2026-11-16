// node --test tests/game-2d-preview.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const base=new URL('../game/preview-2d/',import.meta.url);
const read=p=>readFileSync(new URL(p,base),'utf8');
const html=read('index.html'),css=read('style.css'),js=read('game.js');
const assets=['cafe','barista','waiter','guard','shipper','guest','reader','cat'].map(n=>read('assets/'+n+'.svg'));

test('2D route is isolated, responsive and accessible',()=>{
  assert.match(html,/phaser@4\.2\.1\/dist\/phaser\.min\.js/);
  assert.match(html,/noindex,nofollow/);
  assert.match(html,/id="objective-panel" hidden/);
  assert.match(html,/aria-expanded="false"/);
  assert.match(html,/id="stick"/);
  assert.match(html,/id="interact"/);
  assert.match(html,/BẢN THỬ 2D · CHƯA DUYỆT ART/);
  assert.match(css,/@media\(max-width:520px\)/);
  assert.doesNotMatch(html,/href="\/game\/"/);
});
test('owned placeholder vector art is present and not an undocumented external asset',()=>{
  assert.equal(assets.length,8);
  for(const asset of assets){
    assert.match(asset,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(asset,/<\/svg>/);
    assert.doesNotMatch(asset,/<script|<image.*https?:|<foreignObject/i);
  }
  assert.match(read('README.md'),/placeholder/i);
  assert.match(read('README.md'),/Người dùng xác nhận thay/);
});
test('game has full day-loop and five roles without persistence',()=>{
  assert.doesNotThrow(()=>new vm.Script(js));
  for(const token of ['enterGame','startShift','finishAction','endShift','nextDay',
    'nearestCandidate','interact','usePower','resetDay','YenScene']){
    assert.ok(js.includes(token),'Missing '+token);
  }
  assert.equal([...js.matchAll(/tasks:\[/g)].length,5);
  assert.match(js,/id:'reader'/);
  assert.match(js,/id:'cat'/);
  assert.doesNotMatch(js,/localStorage\(|sessionStorage\(|document\.cookie|sendBeacon\(/);
});
test('phase transitions, objectives, and NPC dialogue run under a Phaser API stub',()=>{
  const nodes=new Map();
  const node=id=>{
    if(!nodes.has(id))nodes.set(id,{
      id,hidden:id!=='setup',disabled:false,textContent:'',style:{},attributes:{},handlers:{},
      setAttribute(k,v){this.attributes[k]=v;},
      addEventListener(k,fn){this.handlers[k]=fn;},
      querySelector(){return {getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}};},
      setPointerCapture(){}
    });
    return nodes.get(id);
  };
  const roles=['barista','waiter','guard','shipper','cat'].map(role=>({
    dataset:{role},setAttribute(){},addEventListener(){}
  }));
  const sprite=(x=0,y=0)=>({
    x,y,visible:true,setDisplaySize(){return this;},setOrigin(){return this;},
    setDepth(){return this;},setStrokeStyle(){return this;},setVisible(v){this.visible=v;return this;},
    setPosition(x,y){this.x=x;this.y=y;return this;},setFlipX(){return this;},
    setTexture(){return this;}
  });
  let scene;
  class FakeScene {
    constructor(){
      this.add={image:(x,y)=>sprite(x,y),circle:(x,y)=>sprite(x,y),
        ellipse:(x,y)=>sprite(x,y),text:(x,y)=>sprite(x,y)};
      this.tweens={add(){}};
      this.cameras={main:{setBounds(){},startFollow(){},setZoom(){},shake(){},flash(){}}};
      this.load={svg(){}};
      this.input={keyboard:{on(){},addKeys(){return {};}}};
      this.scale={width:1200,height:760,on(){}};
      this.events={once(){}};
      this.textures={exists(){return true;}};
    }
  }
  const Phaser={
    AUTO:1,Scale:{RESIZE:1,CENTER_BOTH:1},Scene:FakeScene,
    Game:class{constructor(config){scene=new config.scene[0]();scene.preload();scene.create();}}
  };
  const win={Phaser,addEventListener(){}};
  const context=vm.createContext({
    window:win,Phaser,console,
    document:{getElementById:node,querySelectorAll(){return roles;}}
  });
  const testJs=js.replace(/\n  init\(\);\n\}\)\(\);\s*$/,
    "\n  window.__api={state,ROLES,STATIONS,enterGame,leaveGame,setRole,startShift,interact,finishAction,endShift,nextDay};\n  init();\n})();");
  assert.notEqual(testJs,js);
  vm.runInContext(testJs,context,{filename:'game/preview-2d/game.js'});
  const a=win.__api;
  assert.ok(scene);
  a.enterGame();
  assert.equal(a.state.phase,'explore');
  assert.equal(node('objective-panel').hidden,true);
  scene.player.setPosition(360,615);
  a.interact();
  assert.match(node('speech').textContent,/Khách đọc sách/);

  for(const role of Object.keys(a.ROLES)){
    a.leaveGame();a.setRole(role);a.enterGame();a.startShift();
    assert.equal(a.state.phase,'shift');
    for(const task of a.ROLES[role].tasks){
      const p=a.STATIONS[task.at];
      scene.player.setPosition(p.x,p.y);
      a.interact();
      assert.ok(a.state.active,'No task active for '+role+': '+task.at);
      a.finishAction();
    }
    assert.equal(a.state.phase,'ready');
    assert.equal(a.state.done,3);
    a.endShift();
    assert.equal(a.state.phase,'result');
    a.nextDay();
    assert.equal(a.state.phase,'explore');
    assert.equal(a.state.day,2);
  }
});
