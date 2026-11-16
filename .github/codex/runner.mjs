import {readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export function permitted(file) {
  if (file.includes('..') || file.includes('\\') || file.startsWith('/')) return false;
  return /^(game\/preview-2d\/(game\.js|style\.css|index\.html|tests\/[^/]+\.test\.mjs)|tests\/game-2d[^/]*\.test\.mjs)$/.test(file);
}

export function validateDiff(entries) {
  if (!entries.length) throw Error('No implementation changes; do not create an empty PR');
  if (entries.length > 20) throw Error('Slice too large: at most 20 files');
  for (const entry of entries) {
    if (!['A','M'].includes(entry.status) || !permitted(entry.path)) throw Error('Out-of-scope change: '+entry.path);
    if (entry.mode !== '100644') throw Error('Non-regular file: '+entry.path);
  }
}

export function selectTask(plan) {
  const done=new Set(plan.stages.filter(s=>s.status==='done').map(s=>s.id));
  return plan.stages.filter(s=>['todo','in-progress'].includes(s.status)&&!s.requiresHumanApproval&&s.dependencies.every(d=>done.has(d)))
    .sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id))[0] || null;
}

const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const command=process.argv[2];
  if (command==='plan') {
    const plan=JSON.parse(readFileSync('game/preview-2d/ops/roadmap.json','utf8'));
    const task=selectTask(plan);
    writeFileSync('runner-task.json',JSON.stringify({task},null,2));
    console.log(task ? `Next engineering slice: ${task.id} / issue #${task.issue}` : 'No eligible engineering task');
  } else if (command==='check') {
    const entries=git('diff','--cached','--name-status','--no-renames').split('\n').filter(Boolean).map(line=>{
      const [status,...rest]=line.split('\t'); const name=rest.join('\t');
      const index=git('ls-files','--stage','--',name);
      return {status,path:name,mode:index.split(' ')[0]};
    });
    validateDiff(entries);
    if (Number(execFileSync('git',['diff','--cached','--numstat'],{encoding:'utf8'}).split('\n').filter(Boolean).reduce((sum,line)=>{
      const [a,b]=line.split('\t');if(a==='-'||b==='-')throw Error('Binary changes require the art pipeline');return sum+Number(a)+Number(b);
    },0))>1200) throw Error('Slice too large: at most 1200 changed lines');
    console.log('Allowed engineering diff:',entries.length,'files');
  } else throw Error('Expected plan or check');
}
