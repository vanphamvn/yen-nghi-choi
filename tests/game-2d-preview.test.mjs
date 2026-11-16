// Yencafeday Phaser 2D sprites - run: node --test tests/game-2d-preview.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const root=new URL('../game/preview-2d/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const html=read('index.html'),css=read('style.css'),js=read('game.js');
const roles=['barista','waiter','shipper','guard','cat'];

test('Each role has a valid 4x4 transparent RGBA spritesheet',()=>{
 for(const role of roles){
  const b=readFileSync(new URL('assets/sprites/'+role+'.png',root));
  assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a',role+' png signature');
  assert.equal(b.toString('ascii',12,16),'IHDR',role+' IHDR');
  assert.equal(b.readUInt32BE(16),1024,role+' sheet width');
  assert.equal(b.readUInt32BE(20),1280,role+' sheet height');
  assert.equal(b[24],8,role+' 8-bit color');
  assert.equal(b[25],6,role+' RGBA channel');
  assert.ok(b.length>100_000,role+' must not be empty');
 }
});

test('Phaser renders PNG sprites, not actor SVG placeholders',()=>{
 assert.match(js,/this\.load\.spritesheet\(role,sheetUrl\(role\),\{frameWidth:256,frameHeight:320,endFrame:15\}\)/);
 assert.match(js,/this\.add\.sprite\(person\.x,person\.y,asset,0\)/);
 assert.match(js,/this\.add\.sprite\(600,750,'barista',0\)/);
 assert.doesNotMatch(js,/this\.load\.svg\(r\+'-front'/);
 assert.match(js,/createRoleAnimations/);
 assert.match(js,/playDirectional/);
 assert.match(js,/window\.setInterval\(\(\)=>\{if\(activeModal==='preview'\)paintPreview\(\);\},165\)/);
});

test('Preview uses real frames with distinct directional views and animated modal',()=>{
 for(const dir of ['front','right','back','left'])
  assert.match(html,new RegExp('id="pose-'+dir+'"'));
 assert.match(html,/class="sprite-thumb"/);
 assert.match(html,/class="sprite-frame mini-frame"/);
 assert.match(css,/\.sprite-frame/);
 assert.match(js,/const CLIPS=\{/);
 for(const clip of ['idle-down','walk-down','idle-right','walk-right','idle-up','walk-up','interact'])
  assert.ok(js.includes("'"+clip+"'"),clip);
 assert.match(js,/paintSpriteFrame/);
 assert.match(html,/16 frame sprite art/);
});

test('Navigation and gameplay remain present, without tracking',()=>{
 assert.doesNotThrow(()=>new vm.Script(js,{filename:'game/preview-2d/game.js'}));
 assert.equal([...js.matchAll(/tasks:\[/g)].length,5);
 assert.match(html,/phaser@4\.2\.1/);
 assert.match(html,/BETA 2D/);
 assert.match(html,/noindex, nofollow/);
 for(const id of ['start-shift','finish-shift','open-preview','open-objective',
  'open-journal','open-bag','model-modal','info-modal','result-modal','pose-front',
  'animation-film','stick','interact','power','scene']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 for(const fn of ['startShift','finishShift','nextDay','finishAction','interact','usePower','selectPreviewRole'])
  assert.match(js,new RegExp('function '+fn+'\\('));
 assert.doesNotMatch(js,/(localStorage|sessionStorage)\s*[\[.(]|document\.cookie|sendBeacon\(/);
});

function harness(){
 const elements=new Map();
 const elem=id=>{
  if(!elements.has(id)){
   const filmFrames=Array.from({length:6},()=>({style:{},dataset:{},setAttribute(){}}));
   elements.set(id,{
    id,textContent:'',value:'',src:'',hidden:false,disabled:false,dataset:{},style:{},
    attrs:{},children:[],events:{},focus(){},append(...v){this.children.push(...v)},
    replaceChildren(...v){this.children=v},
    setAttribute(n,v){this.attrs[n]=v},addEventListener(n,fn){this.events[n]=fn},
    setPointerCapture(){},
    querySelectorAll(sel){return sel==='.sprite-frame'?filmFrames:[]},
    querySelector(){return{getBoundingClientRect(){return{left:0,top:0,width:100,height:100}}}},
    classList:{toggle(){},add(){},remove(){}}
   });
  }
  return elements.get(id);
 };
 const rolesUI=roles.map(role=>({dataset:{role},classList:{toggle(){}},setAttribute(){},addEventListener(){}}));
 const animUI=['idle','walk','interact'].map(animation=>({dataset:{animation},classList:{toggle(){}},setAttribute(){},addEventListener(){}}));
 const thumbs=roles.map(thumb=>({dataset:{thumb},style:{}}));
 const doc={
  getElementById:elem,createElement:tag=>({tagName:tag,textContent:'',className:''}),
  querySelectorAll(sel){
   if(sel==='.role-option')return rolesUI;
   if(sel==='[data-animation]')return animUI;
   if(sel==='[data-thumb]')return thumbs;
   return [];
  }
 };
 const allAnimations=new Map();
 function sprite(x=0,y=0){return {
  x,y,visible:true,scale:1,alpha:1,angle:0,
  anims:{currentAnim:null,isPlaying:false},
  play(key){this.anims.currentAnim={key};this.anims.isPlaying=true;return this},
  setDisplaySize(){return this},setOrigin(){return this},setDepth(){return this},
  setAlpha(v){this.alpha=v;return this},
  setStrokeStyle(){return this},setVisible(v){this.visible=v;return this},
  setPosition(x,y){this.x=x;this.y=y;return this},setFlipX(v){this.flipX=v;return this},
  setAngle(){return this},setTexture(key){this.texture=key;this.anims.isPlaying=false;return this}
 }}
 let scene=null;
 class StubScene{
  constructor(){
   this.add={image:sprite,sprite,circle:sprite,ellipse:sprite,text:sprite};
   this.tweens={add(){}};
   this.cameras={main:{setBounds(){},startFollow(){},setZoom(){},shake(){},flash(){}}};
   this.load={svg(){},image(key,path){assert.match(path,/\.webp$/);assert.ok(['cafe','cafe-foreground'].includes(key));},spritesheet(key,path,opt){assert.equal(opt.frameWidth,256);assert.equal(opt.frameHeight,320)},on(){}};
   this.anims={exists:key=>allAnimations.has(key),create:def=>allAnimations.set(def.key,def)};
   this.input={keyboard:{addKeys(){return{}},on(){}}};
   this.scale={width:1200,height:800,on(){}};
  }
 }
 const Phaser={AUTO:1,Scale:{RESIZE:1,CENTER_BOTH:1},Scene:StubScene,
  Game:class{constructor(options){scene=new options.scene[0]();scene.preload();scene.create();}}};
 const win={Phaser,addEventListener(){},setInterval(){}};
 const ctx=vm.createContext({window:win,Phaser,document:doc,console});
 const modified=js.replace(/\ninit\(\);\n\}\)\(\);\s*$/,
  "\nwindow.__api={state,roles,stations,npcs,modal,selectPreviewRole,selectAnimation,setRole,startShift,finishShift,nextDay,interact,finishAction,nearbyCandidate,renderInfo,updateUI,paintPreview};\ninit();\n})();");
 assert.notEqual(modified,js);
 vm.runInContext(modified,ctx,{filename:'game.js'});
 return {node:elem,api:win.__api,scene,animations:allAnimations};
}

test('Preview selects PNG frames and applying role changes the Phaser player',()=>{
 const h=harness(),{api:a,node:el}=h;
 assert.equal(el('overlay').hidden,false);
 assert.equal(el('model-modal').hidden,false);
 assert.equal(a.state.role,'barista');
 a.selectPreviewRole('waiter');
 assert.match(el('pose-back').style.backgroundImage,/waiter\.png/);
 assert.match(el('pose-right').style.backgroundImage,/waiter\.png/);
 assert.equal(el('pose-back').dataset.frame,'8');
 a.selectAnimation('walk');
 assert.equal(el('animation-film').dataset.animation,'walk');
 assert.equal(el('pose-front').dataset.frame,'2');
 el('apply-model').events.click();
 assert.equal(a.state.role,'waiter');
 assert.equal(h.scene.player.texture,'waiter');
 assert.equal(el('overlay').hidden,true);
 h.scene.player.setPosition(520,650);a.interact();
 assert.match(el('dialogue').textContent,/Khách đọc sách/);
 assert.equal(h.scene.player.anims.currentAnim.key,'waiter-interact');
});

test('Five playable roles complete all 3 tasks and advance days',()=>{
 const {api:a,node:el,scene,animations}=harness();
 assert.equal(animations.size,35);
 a.modal(null);
 for(const role of roles){
  a.setRole(role);a.state.phase='explore';a.startShift();
  assert.equal(a.state.phase,'shift');
  for(const t of a.roles[role].tasks){
   const station=a.stations[t.at];scene.player.setPosition(station.x,station.y);
   a.interact();assert.ok(a.state.active,'No task active for '+role+':'+t.at);
   a.finishAction();
  }
  assert.equal(a.state.done,3);assert.equal(a.state.phase,'ready');
  a.finishShift();assert.equal(a.state.phase,'result');
  assert.equal(el('result-modal').hidden,false);
  const day=a.state.day;a.nextDay();
  assert.equal(a.state.day,day+1);
  assert.equal(a.state.phase,'explore');
  assert.equal(el('overlay').hidden,true);
 }
 a.renderInfo('journal');assert.equal(el('info-modal').hidden,false);
 assert.ok(el('info-body').children.length>0);
 a.renderInfo('bag');assert.equal(el('info-title').textContent,'Túi đồ');
});
