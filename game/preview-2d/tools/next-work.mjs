#!/usr/bin/env node
/** Deterministic next milestone selection for agent/coding sessions.
 *  node game/preview-2d/tools/next-work.mjs
 *  node game/preview-2d/tools/next-work.mjs --json
 *  node game/preview-2d/tools/next-work.mjs --validate
 *
 *  This script cannot deploy code or approve art. It only validates the plan
 *  and chooses the highest-priority eligible item.
 */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const roadmapPath=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../ops/roadmap.json');
export function validateRoadmap(plan){
 const errors=[];
 if(!plan||plan.schemaVersion!==1)errors.push('Expected schemaVersion=1');
 if(!Array.isArray(plan?.stages)||plan.stages.length!==8)errors.push('Expected eight game milestones M0..M7');
 const stages=Array.isArray(plan?.stages)?plan.stages:[];
 const ids=new Set(),issues=new Set();
 for(const s of stages){
  if(!/^M[0-7]$/.test(s.id||''))errors.push('Unknown milestone: '+s.id);
  if(ids.has(s.id))errors.push('Duplicate milestone: '+s.id);
  ids.add(s.id);
  if(!Number.isInteger(s.issue)||s.issue<1)errors.push('Missing issue for '+s.id);
  if(issues.has(s.issue))errors.push('Duplicate issue: '+s.issue);
  issues.add(s.issue);
  if(!Number.isInteger(s.priority)||s.priority<0)errors.push('Invalid priority for '+s.id);
  if(!['todo','in-progress','blocked','done'].includes(s.status))errors.push('Invalid status for '+s.id);
  if(!Array.isArray(s.dependencies))errors.push('Invalid dependency list for '+s.id);
  if(typeof s.requiresHumanApproval!=='boolean')errors.push('Human approval field required: '+s.id);
  if(!Array.isArray(s.acceptance)||s.acceptance.length<2)errors.push('Concrete acceptance evidence missing: '+s.id);
  if(s.status==='blocked'&&(!s.blocker||typeof s.blocker!=='string'))errors.push('Blocked without reason: '+s.id);
  if(s.status==='done'&&(!s.evidence?.deployedSHA||!s.evidence?.productionURL||!s.evidence?.testReport))
   errors.push('Done without verified release evidence: '+s.id);
  if(s.status==='done'&&s.requiresHumanApproval&&!s.evidence?.ownerApproval)
   errors.push('Human acceptance missing: '+s.id);
 }
 for(const s of stages){
  for(const dep of Array.isArray(s.dependencies)?s.dependencies:[]){
   if(!ids.has(dep))errors.push(s.id+' has missing dependency '+dep);
   if(dep===s.id)errors.push(s.id+' cannot depend on itself');
  }
  if(s.status==='done'&&s.dependencies.some(id=>stages.find(x=>x.id===id)?.status!=='done'))
   errors.push('Milestone complete despite incomplete dependency: '+s.id);
 }
 for(let i=0;i<8;i++)if(!ids.has('M'+i))errors.push('Missing milestone M'+i);
 // Detect cycles, even while a milestone is still blocked.
 const visiting=new Set(),done=new Set();
 const visit=id=>{
  if(done.has(id))return;
  if(visiting.has(id)){errors.push('Dependency cycle involving '+id);return;}
  visiting.add(id);
  const s=stages.find(x=>x.id===id);
  for(const dep of s?.dependencies||[])if(ids.has(dep))visit(dep);
  visiting.delete(id);done.add(id);
 };
 for(const id of ids)visit(id);
 return [...new Set(errors)];
}
export function chooseWork(plan){
 const stages=plan.stages;
 const done=new Set(stages.filter(s=>s.status==='done').map(s=>s.id));
 const available=stages.filter(s=>['todo','in-progress'].includes(s.status)&&s.dependencies.every(id=>done.has(id)))
  .sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id));
 return {next:available[0]||null,ready:available,blocked:stages.filter(s=>s.status==='blocked'||(s.status!=='done'&&!s.dependencies.every(id=>done.has(id)))),
   complete:stages.every(s=>s.status==='done')};
}
const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
 try{
  const plan=JSON.parse(readFileSync(roadmapPath,'utf8'));
  const errors=validateRoadmap(plan);
  if(errors.length){
   console.error('INVALID YÊN GAME ROADMAP:\n'+errors.map(s=>' - '+s).join('\n'));
   process.exitCode=1;
  }else if(process.argv.includes('--validate')){
   console.log('Roadmap valid: '+plan.stages.length+' milestones, all issues unique, dependency graph acyclic.');
  }else{
   const result=chooseWork(plan);
   if(process.argv.includes('--json'))
    console.log(JSON.stringify({next:result.next?.id||null,issue:result.next?.issue||null,ready:result.ready.map(s=>s.id),blocked:result.blocked.map(s=>s.id),complete:result.complete}));
   else if(result.complete)
    console.log('All mandatory milestones done. Run the full release skill before announcing game completion.');
   else if(result.next)
    console.log('NEXT '+result.next.id+' | '+result.next.title+' | Issue #'+result.next.issue+'\nReady: '+result.ready.map(s=>s.id).join(', ')+'\nBlocked: '+result.blocked.map(s=>s.id).join(', '));
   else{
    console.log('No eligible milestone. Inspect blockers and pursue independent safe work; do not claim finished.');
    process.exitCode=2;
   }
  }
 }catch(e){console.error('Roadmap runner error:',String(e));process.exitCode=1;}
}
