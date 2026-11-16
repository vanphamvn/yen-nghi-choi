import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chooseWork,validateRoadmap} from '../tools/next-work.mjs';

const folder=path.dirname(fileURLToPath(import.meta.url));
const plan=JSON.parse(readFileSync(path.join(folder,'../ops/roadmap.json'),'utf8'));
const clone=()=>structuredClone(plan);

test('roadmap is machine-readable, traceable and dependency-safe',()=>{
 assert.deepEqual(validateRoadmap(plan),[]);
 assert.equal(plan.ownerEpic,94);
 assert.equal(plan.stages.length,8);
 assert.equal(plan.stages.find(s=>s.id==='M2').issue,93);
 assert.equal(plan.stages.find(s=>s.id==='M0').issue,95);
 assert.equal(plan.stages.find(s=>s.id==='M7').status,'blocked');
});

test('pick M0 first, but keep independent gameplay work available',()=>{
 const result=chooseWork(plan);
 assert.equal(result.next.id,'M0');
 assert.deepEqual(result.ready.map(s=>s.id),['M0','M1','M4','M5','M6']);
 assert.ok(result.blocked.map(s=>s.id).includes('M2'));
 assert.ok(result.blocked.map(s=>s.id).includes('M3'));
});

test('detect fake done state and missing release proof',()=>{
 const p=clone();
 p.stages[0].status='done';
 assert.ok(validateRoadmap(p).some(s=>s.includes('Done without verified release evidence')));
});

test('require owner approval for art milestones, not an AI placeholder',()=>{
 const p=clone();
 p.stages[1].status='done';
 p.stages[1].evidence={deployedSHA:'a'.repeat(40),productionURL:'https://example.com/game/preview-2d/',testReport:'pass'};
 assert.ok(validateRoadmap(p).some(s=>s.includes('Human acceptance missing')));
});

test('cannot create dependency cycles',()=>{
 const p=clone();
 p.stages[0].dependencies=['M7'];
 assert.ok(validateRoadmap(p).some(s=>s.includes('Dependency cycle')));
});

test('selection advances to next milestone only with real evidence',()=>{
 const p=clone();
 p.stages[0].status='done';
 p.stages[0].evidence={deployedSHA:'a'.repeat(40),productionURL:'https://example.com/game/preview-2d/',testReport:'smoke-pass'};
 assert.deepEqual(validateRoadmap(p),[]);
 assert.equal(chooseWork(p).next.id,'M1');
});
