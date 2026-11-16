import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,writeFileSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {reviewAuthorityErrors} from '../tools/art-review-authority.mjs';

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
 assert.match(skill,/explicit user delegation/);
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
 assert.ok(policy.approvedArt['assets/scene/table-painted-v1.webp']);
 assert.equal(policy.approvedArt['assets/scene/table-painted-v1.webp'].reviewerType,'agent');
 assert.equal(policy.approvedArt['assets/scene/table-painted-v1.webp'].ownerReviewPending,true);
 for(const file of Object.keys(policy.legacyUnapprovedVectors)){
   assert.equal(path.extname(file),'.svg');
   assert.match(policy.legacyUnapprovedVectors[file].gitBlobSha,/^[0-9a-f]{40}$/,file+' has malformed SHA');
   assert.equal(existsSync(path.join(game,file)),false,file+' still in active scene');
   const archived=policy.legacyVectorArchive[file];
   assert.ok(existsSync(path.join(game,archived)),file+' historical reference missing');
   assert.ok(!policy.approvedArt[file],file+' cannot be approved');
 }
});

test('agent review needs delegation and cannot masquerade as owner approval',()=>{
 const entry=policy.approvedArt['assets/scene/table-painted-v1.webp'];
 assert.deepEqual(reviewAuthorityErrors(entry,policy),[]);
 assert.ok(reviewAuthorityErrors(entry,{...policy,reviewDelegation:{enabled:false}}).some(x=>x.includes('delegation')));
 assert.ok(reviewAuthorityErrors({...entry,ownerReviewPending:false},policy).some(x=>x.includes('pending owner review')));
 assert.ok(reviewAuthorityErrors({...entry,reviewerType:'human'},policy).some(x=>x.includes('human reviewer')));
 assert.ok(reviewAuthorityErrors({...entry,visualChecks:{}},policy).some(x=>x.includes('visual check')));
});

test('visual comparison board references both character and unapproved scene textures',()=>{
 const html=readFileSync(path.join(game,'art-review.html'),'utf8');
 assert.match(html,/barista\.png/);
 assert.match(html,/waiter\.png/);
 assert.match(html,/art-reviews\/legacy-svg\/table\.svg/);
 assert.match(html,/assets\/scene\/backdrop-painted-v1\.png/);
 assert.match(html,/ĐÃ THAY TOÀN BỘ SVG RUNTIME/);
});

test('normal and strict art gates pass after vector history is archived',()=>{
 const normal=spawnSync(process.execPath,[audit],{encoding:'utf8'});
 assert.equal(normal.status,0,'baseline audit must pass: '+normal.stderr);
 assert.match(normal.stdout,/Yên art gate PASSED/);
 assert.doesNotMatch(normal.stderr,/NOT STYLE APPROVED/);
 const strict=spawnSync(process.execPath,[audit,'--strict'],{encoding:'utf8'});
 assert.equal(strict.status,0,'strict gate must accept reviewed raster-only scene');
 assert.match(strict.stdout,/Yên art gate PASSED/);
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
