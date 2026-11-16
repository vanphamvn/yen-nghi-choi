// node --test tests/game-2d-background.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const base=new URL('../game/preview-2d/',import.meta.url);
const read=path=>readFileSync(new URL(path,base));
const code=read('game.js').toString('utf8');
const background=read('assets/cafe-painted.webp');
const foreground=read('assets/cafe-foreground.webp');

test('Raster background is a real self-hosted WebP with a lightweight alpha foreground',()=>{
 for(const [name,buffer] of [['background',background],['foreground',foreground]]){
  assert.equal(buffer.toString('ascii',0,4),'RIFF',name);
  assert.equal(buffer.toString('ascii',8,12),'WEBP',name);
  assert.ok(buffer.length>12000,name+' too small or blank');
  assert.ok(buffer.length<400000,name+' should be mobile-friendly');
 }
 assert.match(code,/load\.image\('cafe','\.\/assets\/cafe-painted\.webp'\)/);
 assert.match(code,/load\.image\('cafe-foreground','\.\/assets\/cafe-foreground\.webp'\)/);
 assert.doesNotMatch(code,/load\.svg\('cafe'/);
 assert.match(code,/'cafe-foreground'\)\.setDisplaySize\(1440,900\)\.setDepth\(950\)/);
 assert.doesNotThrow(()=>new vm.Script(code));
});

const blocked=(()=>{
 const from=code.indexOf('function blocked(x,y){');
 const to=code.indexOf('function renderInfo(',from);
 assert.ok(from>=0&&to>from,'collision function not found');
 return new Function(code.slice(from,to)+'; return blocked;')();
})();
const stations=(()=>{
 const from=code.indexOf('const stations={');
 const to=code.indexOf('const npcs=[',from);
 assert.ok(from>=0&&to>from,'station map not found');
 return new Function(code.slice(from,to)+'; return stations;')();
})();

test('Painted furniture blocks passage but keeps every task station reachable',()=>{
 assert.equal(blocked(600,750),false,'player spawn');
 assert.equal(blocked(1000,490),true,'service counter');
 assert.equal(blocked(342,618),true,'café table');
 assert.equal(blocked(1180,670),true,'bench');
 assert.equal(blocked(1380,680),true,'delivery bike');
 assert.equal(blocked(740,620),false,'open floor');
 for(const [name,p] of Object.entries(stations)){
  assert.equal(blocked(p.x,p.y),false,name+' station should be on walkable floor');
 }
});

test('All 6 stations can be approached from the original player spawn',()=>{
 const step=20;
 const start={x:600,y:750};
 const queue=[start],visited=new Set();
 const id=(x,y)=>x+':'+y;
 visited.add(id(start.x,start.y));
 for(let i=0;i<queue.length;i++){
  const {x,y}=queue[i];
  for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){
   const nx=x+dx,ny=y+dy,k=id(nx,ny);
   if(nx<100||nx>1360||ny<510||ny>840||visited.has(k)||blocked(nx,ny))continue;
   visited.add(k);queue.push({x:nx,y:ny});
  }
 }
 assert.ok(queue.length>80,'explorable floor must be contiguous');
 for(const [name,p] of Object.entries(stations)){
  const near=queue.some(n=>Math.hypot(n.x-p.x,n.y-p.y)<110);
  assert.ok(near,name+' not reachable from player spawn');
 }
});
