import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyProduction,interpretBundle,parseArguments} from '../tools/production-smoke.mjs';

const SHA='a'.repeat(40),OLD_SHA='b'.repeat(40);
const png=Buffer.alloc(27);Buffer.from('89504e470d0a1a0a','hex').copy(png);
const responses=new Map([
 ['/game/preview-2d/','<html><main id="scene"></main><script src="./game.js"></script></html>'],
 ['/game/preview-2d/game.js','class CafeScene extends Phaser.Scene {createProps(){}}'],
 ['/game/preview-2d/style.css','.scene{width:100%}'],
 ['/game/preview-2d/assets/sprites/manifest.json',JSON.stringify({schemaVersion:1,format:{columns:4,rows:4}})],
 ['/game/preview-2d/assets/sprites/barista.png',png],
 ['/game/preview-2d/assets/scene/backdrop-painted-v1.png',png],
 ['/game/preview-2d/assets/scene/art-style-policy.json',JSON.stringify({styleId:'yen-painted-chibi-v1'})]
]);
const fetchFor=(overrides={})=>async target=>{
 const value=Object.hasOwn(overrides,new URL(target).pathname)?overrides[new URL(target).pathname]:responses.get(new URL(target).pathname);
 if(value===undefined)return new Response('Not found',{status:404});
 return new Response(value,{status:200});
};
const url='https://example.test/game/preview-2d/';

test('production bundle validates without needing browser or real internet',()=>{
 assert.deepEqual(interpretBundle({page:'<main id="scene"><script src="./game.js">',runtime:'class CafeScene {createProps(){}}',
  stylesheet:'.scene{}',spriteManifest:{schemaVersion:1,format:{columns:4,rows:4}},artPolicy:{styleId:'yen-painted-chibi-v1'}}),[]);
});

test('only exact provider SHA and complete boot assets qualify as verified release',async()=>{
 const result=await verifyProduction({url,expectedSha:SHA,deployedSha:SHA,fetchImpl:fetchFor()});
 assert.equal(result.status,'RELEASE_VERIFIED');
 assert.equal(result.checks.length,7);
 assert.ok(result.checks.every(x=>x.status==='pass'));
});

test('stale production is blocked even when every URL returns HTTP 200',async()=>{
 const result=await verifyProduction({url,expectedSha:SHA,deployedSha:OLD_SHA,fetchImpl:fetchFor()});
 assert.equal(result.status,'BLOCKED');
 assert.match(result.errors.join('\n'),/Stale production SHA/);
});

test('missing provider metadata does not count as released',async()=>{
 const result=await verifyProduction({url,expectedSha:SHA,fetchImpl:fetchFor()});
 assert.equal(result.status,'BLOCKED');
 assert.match(result.errors.join('\n'),/provider-deployed SHA/);
});

test('smoke-only mode reports unverified SHA, never RELEASE_VERIFIED',async()=>{
 const result=await verifyProduction({url,smokeOnly:true,fetchImpl:fetchFor()});
 assert.equal(result.status,'SMOKE_PASS_UNVERIFIED_SHA');
 assert.equal(result.errors.length,0);
});

test('404 or invalid critical asset fails even with correct SHA',async()=>{
 const result=await verifyProduction({url,expectedSha:SHA,deployedSha:SHA,
  fetchImpl:fetchFor({'/game/preview-2d/game.js':undefined})});
 assert.equal(result.status,'BLOCKED');
 assert.match(result.errors.join('\n'),/runtime: HTTP 404/);
 const damaged=await verifyProduction({url,expectedSha:SHA,deployedSha:SHA,
  fetchImpl:fetchFor({'/game/preview-2d/assets/sprites/barista.png':'not-png'})});
 assert.equal(damaged.status,'BLOCKED');
 assert.match(damaged.errors.join('\n'),/Invalid PNG/);
});

test('do not accept arbitrary host root or non-HTTPS production URL',async()=>{
 const result=await verifyProduction({url:'http://example.test/game/preview-2d/',expectedSha:SHA,deployedSha:SHA,fetchImpl:fetchFor()});
 assert.equal(result.status,'BLOCKED');
 assert.match(result.errors[0],/Invalid game URL/);
});

test('CLI args preserve SHA provenance and never invent a deployed SHA',()=>{
 assert.deepEqual(parseArguments(['--url',url,'--expected-sha',SHA,'--deployed-sha',SHA]),
  {url,expectedSha:SHA,deployedSha:SHA});
 assert.deepEqual(parseArguments(['--url',url,'--smoke-only']),{url,smokeOnly:true});
 assert.throws(()=>parseArguments(['--expected-sha',SHA]),/Required/);
});
