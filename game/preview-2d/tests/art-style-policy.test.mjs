import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,writeFileSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const dir=path.dirname(fileURLToPath(import.meta.url));
const game=path.resolve(dir,'..');
const repo=path.resolve(game,'../..');
const policy=JSON.parse(readFileSync(path.join(game,'assets/scene/art-style-policy.json'),'utf8'));
const audit=path.join(game,'tools/audit-art-style.mjs');

test('art bible and reusable skill are present and anchored to original character PNGs',()=>{
 const skill=readFileSync(path.join(repo,'.agents/skills/yen-sprite-style/SKILL.md'),'utf8');
 const bible=readFileSync(path.join(repo,'.agents/skills/yen-sprite-style/references/STYLE_BIBLE.md'),'utf8');
 const agentRules=readFileSync(path.join(repo,'AGENTS.md'),'utf8');
 assert.match(skill,/^---\nname: yen-sprite-style\n/);
 assert.match(skill,/same illustrator|SAME illustrator/i);
 assert.match(skill,/Human visual review is mandatory/);
 assert.match(skill,/production/i);
 assert.match(bible,/barista\.png/);
 assert.match(bible,/runtime scale/i);
 assert.match(agentRules,/yen-sprite-style\/SKILL\.md/);
});

test('all known bad world SVG textures are frozen but not falsely approved',()=>{
 assert.equal(policy.styleId,'yen-painted-chibi-v1');
 assert.equal(Object.keys(policy.legacyUnapprovedVectors).length,10);
 assert.equal(Object.keys(policy.canonicalRoleBlobs).length,5);
 for(const sha of Object.values(policy.canonicalRoleBlobs))
  assert.match(sha,/^[0-9a-f]{40}$/);
 assert.deepEqual(Object.keys(policy.approvedArt),[]);
 for(const file of Object.keys(policy.legacyUnapprovedVectors)){
   assert.equal(path.extname(file),'.svg');
   assert.match(policy.legacyUnapprovedVectors[file].gitBlobSha,/^[0-9a-f]{40}$/,file+' has malformed SHA');
   assert.ok(existsSync(path.join(game,file)),file);
   assert.ok(!policy.approvedArt[file],file+' cannot be approved');
 }
});

test('visual comparison board references both character and unapproved scene textures',()=>{
 const html=readFileSync(path.join(game,'art-review.html'),'utf8');
 assert.match(html,/barista\.png/);
 assert.match(html,/waiter\.png/);
 assert.match(html,/assets\/scene\/table\.svg/);
 assert.match(html,/assets\/scene\/backdrop\.svg/);
 assert.match(html,/CHƯA ĐẠT ART REVIEW/);
});

test('CI process gate passes on frozen known debt, strict sign-off rejects it',()=>{
 const normal=spawnSync(process.execPath,[audit],{encoding:'utf8'});
 assert.equal(normal.status,0,'baseline audit must pass: '+normal.stderr);
 assert.match(normal.stdout,/Yên art gate PASSED/);
 assert.match(normal.stderr,/NOT STYLE APPROVED/);
 const strict=spawnSync(process.execPath,[audit,'--strict'],{encoding:'utf8'});
 assert.equal(strict.status,1,'strict must block known mismatched art');
 assert.match(strict.stderr,/Strict art release blocked/);
});

test('audit rejects a newly introduced unreviewed visible SVG sprite',()=>{
 const rogue=path.join(game,'assets/scene/__style_gate_probe.svg');
 assert.equal(existsSync(rogue),false,'test probe collision');
 try{
  writeFileSync(rogue,'<svg xmlns="http://www.w3.org/2000/svg"/>\n');
  const result=spawnSync(process.execPath,[audit],{encoding:'utf8'});
  assert.equal(result.status,1,'unreviewed vector art must fail CI');
  assert.match(result.stderr,/Unregistered new or replacement sprite: assets\/scene\/__style_gate_probe.svg/);
 }finally{
  if(existsSync(rogue))unlinkSync(rogue);
 }
});
