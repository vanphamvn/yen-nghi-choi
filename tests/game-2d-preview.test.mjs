// Run with node --test tests/game-2d-preview.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const root=new URL('../game/preview-2d/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const html=read('index.html'),css=read('style.css'),js=read('game.js');
const roles=['barista','waiter','shipper','guard','cat'];
const directions=['side','back'];

test('Reference UI has playable HUD, working modal controls and a responsive sidebar',()=>{
 for(const id of ['top-day','top-time','top-coins','top-hearts','top-energy',
  'start-shift','finish-shift','open-preview','open-objective','open-journal','open-bag',
  'model-modal','info-modal','result-modal','close-modal','apply-model','next-day',
  'pose-front','pose-right','pose-back','pose-left','animation-film','stick','interact','power','scene']){
   assert.match(html,new RegExp('id="'+id+'"'),id+' missing');
 }
 assert.match(html,/phaser@4\.2\.1/);
 assert.match(html,/BETA 2D/);
 assert.match(html,/aria-modal="true"/);
 assert.match(html,/noindex, nofollow/);
 assert.match(css,/\.model-turnaround/);
 assert.match(css,/@media\(max-width:710px\)/);
 assert.match(css,/@media\(max-height:700px\)/);
});

test('Assets have at least two distinct directions for every human avatar',()=>{
 const scenes=['cafe','barista','waiter','shipper','guard','cat','guest','reader'];
 for(const name of scenes){
  const svg=read('assets/'+name+'.svg');
  assert.match(svg,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg,/<\/svg>/);
  assert.doesNotMatch(svg,/<script|<foreignObject|<image[^>]*href=["']https?:/i);
 }
 for(const name of ['barista','waiter','shipper','guard','guest','reader']){
  const front=read('assets/'+name+'.svg');
  for(const dir of directions){
    const svg=read('assets/'+name+'-'+dir+'.svg');
    assert.match(svg,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.notEqual(svg,front,'Different viewpoint should not reuse front mesh');
  }
 }
});
test('Game logic preserves endless shifts, five roles and honest sprite status',()=>{
 assert.doesNotThrow(()=>new vm.Script(js,{filename:'game/preview-2d/game.js'}));
 assert.equal([...js.matchAll(/tasks:\[/g)].length,5);
 for(const word of ['startShift','finishShift','finishAction','nextDay',
  'nearbyCandidate','selectPreviewRole','selectAnimation','renderInfo','resetDay']){
  assert.match(js,new RegExp('function '+word+'\\('));
 }
 assert.match(html,/Sprite animation đang hoàn thiện/);
 assert.match(js,/placeholder/i);
 assert.doesNotMatch(js,/(localStorage|sessionStorage)\s*[\[.(]|document\.cookie|sendBeacon\(/);
});

function harness(){
 const nodes=new Map();
 const elem=id=>{
  if(!nodes.has(id))nodes.set(id,{
   id,textContent:'',value:'',src:'',alt:'',hidden:false,disabled:false,dataset:{},style:{},
   attrs:{},children:[],events:{},focus(){},append(...e){this.children.push(...e)},
   replaceChildren(...e){this.children=e},
   setAttribute(n,v){this.attrs[n]=v},
   addEventListener(n,fn){this.events[n]=fn},setPointerCapture(){},
   querySelectorAll(q){if(q==='img')return Array.from({length:6},()=>({src:''}));return[]},
   querySelector(q){return{getBoundingClientRect(){return{left:0,top:0,width:100,height:100}}}},
   classList:{toggle(){},add(){},remove(){}}
  });
  return nodes.get(id);
 };
 const roleBtns=roles.map(role=>({
  dataset:{role},classList:{toggle(){}},setAttribute(){},addEventListener(){}
 }));
 const animationBtns=['idle','walk','interact'].map(animation=>({
  dataset:{animation},classList:{toggle(){}},setAttribute(){},addEventListener(){}
 }));
 const doc={
  getElementById:elem,createElement:tag=>({tagName:tag,textContent:'',className:''}),
  querySelectorAll(selector){
   if(selector==='.role-option')return roleBtns;
   if(selector==='[data-animation]')return animationBtns;
   return[];
  }
 };
 function sprite(x=0,y=0){return{
  x,y,visible:true,alpha:1,scale:1,angle:0,
  setDisplaySize(){return this},setOrigin(){return this},setDepth(){return this},
  setStrokeStyle(){return this},setVisible(v){this.visible=v;return this},
  setPosition(x,y){this.x=x;this.y=y;return this},setFlipX(){return this},
  setAngle(){return this},setTexture(name){this.texture=name;return this}
 }}
 let scene=null;
 class StubScene {
  constructor(){
   this.add={image:sprite,circle:sprite,ellipse:sprite,text:sprite};
   this.tweens={add(){}};
   this.cameras={main:{setBounds(){},startFollow(){},setZoom(){},shake(){},flash(){}}};
   this.load={svg(){}};
   this.input={keyboard:{addKeys(){return{}},on(){}}};
   this.scale={width:1200,height:800,on(){}};
  }
 }
 const Phaser={AUTO:1,Scale:{RESIZE:1,CENTER_BOTH:1},Scene:StubScene,
  Game:class{constructor(options){scene=new options.scene[0]();scene.preload();scene.create();}}};
 const win={Phaser,addEventListener(){}};
 const ctx=vm.createContext({window:win,Phaser,document:doc,console});
 const modified=js.replace(/\ninit\(\);\n\}\)\(\);\s*$/,
  "\nwindow.__api={state,roles,stations,npcs,modal,selectPreviewRole,selectAnimation,setRole,startShift,finishShift,nextDay,interact,finishAction,nearbyCandidate,renderInfo,updateUI};\ninit();\n})();");
 assert.notEqual(modified,js,'Could not attach test API');
 vm.runInContext(modified,ctx,{filename:'game.js'});
 return {node:elem,api:win.__api,scene};
}
test('Preview is interactive and closing it enables exploration',()=>{
 const h=harness(),{api:a,node:el}=h;
 assert.equal(el('overlay').hidden,false);
 assert.equal(el('model-modal').hidden,false);
 assert.equal(a.state.role,'barista');
 a.selectPreviewRole('waiter');
 assert.equal(el('pose-back').src,'./assets/waiter-back.svg');
 assert.equal(el('pose-right').src,'./assets/waiter-side.svg');
 a.selectAnimation('walk');
 assert.equal(el('animation-film').dataset.animation,'walk');
 el('apply-model').events.click();
 assert.equal(a.state.role,'waiter');
 assert.equal(el('overlay').hidden,true);
 h.scene.player.setPosition(382,620);a.interact();
 assert.match(el('dialogue').textContent,/Khách đọc sách/);
});
test('All five roles complete 3 tasks, manually finish and start a new day',()=>{
 const {api:a,node:el,scene}=harness();
 a.modal(null);
 for(const role of roles){
  a.setRole(role);
  a.state.phase='explore';
  a.startShift();
  assert.equal(a.state.phase,'shift');
  for(const t of a.roles[role].tasks){
   const station=a.stations[t.at];
   scene.player.setPosition(station.x,station.y);
   a.interact();
   assert.ok(a.state.active,'Task did not start for '+role+':'+t.at);
   a.finishAction();
  }
  assert.equal(a.state.done,3);
  assert.equal(a.state.phase,'ready');
  a.finishShift();
  assert.equal(a.state.phase,'result');
  assert.equal(el('result-modal').hidden,false);
  const day=a.state.day;
  a.nextDay();
  assert.equal(a.state.day,day+1);
  assert.equal(a.state.phase,'explore');
  assert.equal(el('overlay').hidden,true);
 }
 a.renderInfo('journal');
 assert.equal(el('info-modal').hidden,false);
 assert.ok(el('info-body').children.length>0);
 a.renderInfo('bag');
 assert.equal(el('info-title').textContent,'Túi đồ');
});
