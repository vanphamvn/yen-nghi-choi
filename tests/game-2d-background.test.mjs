// node --test tests/game-2d-background.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const base=new URL('../game/preview-2d/',import.meta.url);
const read=path=>readFileSync(new URL(path,base));
const code=read('game.js').toString('utf8');
const sceneFiles=['backdrop','door','counter','table','bench','plant','scooter','cup','book','cushion'];
const extract=(begin,end,ret)=>{
 const from=code.indexOf(begin),to=code.indexOf(end,from);
 assert.ok(from>=0&&to>from,'missing '+begin);
 return new Function(code.slice(from,to)+'; return '+ret+';')();
};
const solids=extract('const SCENE_COLLIDERS=','const stations=', 'SCENE_COLLIDERS');
const stations=extract('const stations=','const npcs=', 'stations');
const props=extract('const SCENE_PROPS=','const SCENE_COLLIDERS=', 'SCENE_PROPS');
const blocked=(x,y)=>solids.some(c=>c.shape==='rect'
 ?x>c.l&&x<c.r&&y>c.t&&y<c.b:((x-c.x)/c.rx)**2+((y-c.y)/c.ry)**2<1);

test('frozen SVG baseline and independent raster props remain self-hosted',()=>{
 for(const name of sceneFiles){
  const path='assets/scene/'+name+'.svg';
  assert.ok(existsSync(new URL(path,base)),path);
  const svg=read(path).toString('utf8');
  assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/,name);
  assert.match(svg,/<\/svg>$/,name);
  assert.ok(svg.length>700,name+' unexpectedly empty');
 }
 assert.match(code,/this\.load\.svg\('scene-backdrop'/);
 assert.match(code,/this\.createProps\(\)/);
 assert.match(code,/\.setOrigin\(\.5,1\)\.setDepth\(def\.y\)/);
 assert.doesNotMatch(code,/this\.load\.image\('cafe','\.\/assets\/cafe-painted\.webp'\)/);
 assert.doesNotMatch(code,/this\.load\.image\('cafe-foreground'/);
 assert.doesNotThrow(()=>new vm.Script(code));
});

test('All six interactive objects have unique sprites and bottom pivot footprints',()=>{
 assert.equal(props.length,6);
 assert.equal(new Set(props.map(p=>p.id)).size,6);
 for(const prop of props){
  if(prop.id==='table')assert.ok(prop.w>=120&&prop.w<=180&&prop.h>=70&&prop.h<=110,'table must remain proportionate to 146px characters');
  else assert.ok(prop.w>=100&&prop.h>=150,prop.id+' wrong-scale object');
  assert.ok(prop.x>0&&prop.x<=1440&&prop.y>0&&prop.y<=900,prop.id);
  assert.ok(prop.shadow.length===2,prop.id+' missing grounding');
  assert.ok(stations[prop.id],prop.id+' missing station');
  assert.ok(existsSync(new URL(prop.raster||'assets/scene/'+prop.texture+'.svg',base)),prop.id+' missing texture');
 }
 assert.deepEqual(Object.keys(stations).sort(),props.map(p=>p.id).sort());
 assert.equal(solids.length,5,'door should be passable');
});

test('Furniture footprints block actors but task points remain accessible',()=>{
 for(const [name,x,y] of [
  ['counter',1000,540],['table',355,704],['bench',1180,700],
  ['scooter',1370,788],['plant',110,632]
 ])assert.equal(blocked(x,y),true,name+' should be solid');
 assert.equal(blocked(600,750),false,'spawn');
 assert.equal(blocked(740,620),false,'free walkway');
 assert.equal(blocked(450,680),false,'painted table must not retain the old oversized chair collision');
 for(const [id,p] of Object.entries(stations))
  assert.equal(blocked(p.x,p.y),false,id+' interaction point blocked');
});

test('Every station can be approached from the original player spawn',()=>{
 const step=20,start={x:600,y:750},queue=[start],visited=new Set();
 const key=(x,y)=>x+':'+y;
 visited.add(key(start.x,start.y));
 for(let i=0;i<queue.length;i++){
  const {x,y}=queue[i];
  for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){
   const nx=x+dx,ny=y+dy,k=key(nx,ny);
   if(nx<90||nx>1365||ny<507||ny>840||visited.has(k)||blocked(nx,ny))continue;
   visited.add(k);queue.push({x:nx,y:ny});
  }
 }
 assert.ok(queue.length>80,'walkable area must be contiguous');
 for(const [id,p] of Object.entries(stations))
  assert.ok(queue.some(n=>Math.hypot(n.x-p.x,n.y-p.y)<110),id+' not reachable');
});

test('All interactive scenes change visible sprite state',()=>{
 assert.match(code,/reactProp\(id,next\)/);
 for(const id of ['counter','table','bench','bike','plant','door'])
  assert.ok(code.includes("id==='"+id+"'"),id+' missing interaction');
 assert.match(code,/this\.propDetails\.set\('cup',cup\)/);
 assert.match(code,/this\.scooterLight\?\.setVisible\(!!next\)/);
 assert.match(code,/this\.steam\.forEach\(p=>p\.setVisible\(!!next\)\)/);
});
