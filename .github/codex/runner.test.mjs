import {test} from 'node:test';
import assert from 'node:assert/strict';
import {permitted,validateDiff,selectTask} from './runner.mjs';
import {mkdtempSync,writeFileSync,mkdirSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('engineering sandbox excludes workflow, secrets, art, traversal and policy edits',()=>{
 for(const file of ['game/preview-2d/game.js','game/preview-2d/tests/input.test.mjs','tests/game-2d-preview.test.mjs'])assert.equal(permitted(file),true,file);
 for(const file of ['.github/workflows/a.yml','.env','AGENTS.md','game/preview-2d/assets/cat.png','game/preview-2d/ops/roadmap.json','game/preview-2d/../game.js','/game/preview-2d/game.js'])assert.equal(permitted(file),false,file);
 assert.throws(()=>validateDiff([]),/empty PR/);
 assert.throws(()=>validateDiff([{status:'D',path:'game/preview-2d/game.js',mode:'100644'}]),/Out-of-scope/);
 assert.throws(()=>validateDiff([{status:'M',path:'game/preview-2d/game.js',mode:'120000'}]),/Non-regular/);
 assert.doesNotThrow(()=>validateDiff([{status:'M',path:'game/preview-2d/game.js',mode:'100644'}]));
});
test('select only eligible engineering work; pause on human approval or blocked dependency',()=>{
 const stages=[{id:'M1',priority:0,status:'todo',requiresHumanApproval:true,dependencies:[]},{id:'M4',priority:4,status:'todo',requiresHumanApproval:false,dependencies:['M0']},{id:'M0',priority:1,status:'todo',requiresHumanApproval:false,dependencies:[]}];
 assert.equal(selectTask({stages}).id,'M0');
 stages[2].status='blocked';assert.equal(selectTask({stages}),null);
 stages[2].status='done';assert.equal(selectTask({stages}).id,'M4');
});

test('actual staged patch guard accepts normal code and rejects escaped scope and symlinks',()=>{
 const root=mkdtempSync(path.join(tmpdir(),'yen-runner-'));
 const script=fileURLToPath(new URL('./runner.mjs',import.meta.url));
 const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
 const check=()=>execFileSync(process.execPath,[script,'check'],{cwd:root,stdio:'pipe'});
 try {
  git('init');mkdirSync(path.join(root,'game/preview-2d'),{recursive:true});
  writeFileSync(path.join(root,'game/preview-2d/game.js'),'const value=1;');git('add','-A');
  assert.doesNotThrow(check);
  writeFileSync(path.join(root,'AGENTS.md'),'tampered');git('add','-A');assert.throws(check);
  git('rm','--cached','AGENTS.md');
  rmSync(path.join(root,'AGENTS.md'));
  rmSync(path.join(root,'game/preview-2d/game.js'));symlinkSync('/etc/passwd',path.join(root,'game/preview-2d/game.js'));git('add','-A');assert.throws(check);
 } finally {rmSync(root,{recursive:true,force:true});}
});
