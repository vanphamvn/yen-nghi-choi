#!/usr/bin/env node
/**
 * Read-only production smoke gate for Game Yên 2D.
 *
 * Verify a DEPLOYED commit separately from the repo's main commit. Never mark a
 * GitHub merge or a preview URL as production merely because HTTP returns 200.
 *
 * Usage:
 * node game/preview-2d/tools/production-smoke.mjs --url https://yencafeday.vercel.app/game/preview-2d/ --expected-sha <main-sha> --deployed-sha <provider-verified-sha>
 * node game/preview-2d/tools/production-smoke.mjs --url https://yencafeday.netlify.app/game/preview-2d/ --smoke-only
 *
 * The deployed SHA MUST come from the hosting provider's deployment metadata,
 * not from an HTML meta tag, the branch name, or a user-supplied guess.
 */
import {fileURLToPath} from 'node:url';

const SHA=/^[a-f0-9]{40}$/i;
const CHECKS=[
 ['page','', 'text'],
 ['runtime','game.js','text'],
 ['stylesheet','style.css','text'],
 ['spriteManifest','assets/sprites/manifest.json','json'],
 ['characterPNG','assets/sprites/barista.png','png'],
 ['sceneBackground','assets/scene/backdrop-painted-v1.png','png'],
 ['artPolicy','assets/scene/art-style-policy.json','json']
];

export function interpretBundle(assetMap){
 const errors=[];
 const page=assetMap.page||'';
 const runtime=assetMap.runtime||'';
 const style=assetMap.stylesheet||'';
 const manifest=assetMap.spriteManifest;
 const policy=assetMap.artPolicy;
 if(!/id="scene"/.test(page)||!/\.\/game\.js/.test(page))errors.push('Game scene or script missing from HTML');
 if(!/class CafeScene/.test(runtime)||!/createProps\(/.test(runtime))errors.push('Phaser gameplay or prop scene not present');
 if(!/\.scene\b/.test(style))errors.push('Scene stylesheet missing');
 if(manifest?.schemaVersion!==1||manifest?.format?.columns!==4||manifest?.format?.rows!==4)
  errors.push('Wrong sprite manifest version or 4x4 layout');
 if(policy?.styleId!=='yen-painted-chibi-v1')errors.push('Art-style policy missing or unexpected version');
 return errors;
}

export async function verifyProduction({url,expectedSha,deployedSha,smokeOnly=false,fetchImpl=globalThis.fetch}){
 const checks=[],bundle={},errors=[];
 let base;
 try {
  base=new URL(url);
  if(base.protocol!=='https:'||!base.pathname.endsWith('/game/preview-2d/'))
   throw Error('Use an HTTPS URL ending with /game/preview-2d/');
 } catch(e){
  return {status:'BLOCKED',url,checks,errors:['Invalid game URL: '+e.message]};
 }
 if(!smokeOnly&&(!SHA.test(expectedSha||'')||!SHA.test(deployedSha||'')))
  errors.push('Release verification requires actual 40-character main and provider-deployed SHA');
 if(expectedSha&&deployedSha&&expectedSha!==deployedSha)
  errors.push('Stale production SHA: expected '+expectedSha+', deployed '+deployedSha);
 for(const [name,relative,type] of CHECKS){
  const target=new URL(relative,base);
  try{
   const response=await fetchImpl(target.href,{signal:AbortSignal.timeout(12000),redirect:'follow'});
   if(!response?.ok)throw Error('HTTP '+(response?.status??'unknown'));
   let value;
   if(type==='png'){
    const buf=Buffer.from(await response.arrayBuffer());
    if(buf.length<24||buf.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Invalid PNG');
    value=true;
   }else{
    const text=await response.text();
    if(type==='json')value=JSON.parse(text);
    else if(type==='svg'){
     if(!/^\s*<svg\b/.test(text)||!/<\/svg>\s*$/.test(text))throw Error('Invalid scene SVG');
     value=text;
    }else value=text;
   }
   bundle[name]=value;
   checks.push({name,status:'pass',url:target.href});
  }catch(e){
   checks.push({name,status:'fail',url:target.href,error:String(e.message||e)});
   errors.push(name+': '+String(e.message||e));
  }
 }
 if(checks.every(x=>x.status==='pass'))errors.push(...interpretBundle(bundle));
 const status=errors.length?'BLOCKED':smokeOnly?'SMOKE_PASS_UNVERIFIED_SHA':'RELEASE_VERIFIED';
 return {status,url:base.href,expectedSha:expectedSha||null,deployedSha:deployedSha||null,checks,errors};
}

export function parseArguments(args){
 const out={};
 for(let i=0;i<args.length;i++){
  if(args[i]==='--smoke-only')out.smokeOnly=true;
  else if(['--url','--expected-sha','--deployed-sha'].includes(args[i])){
   const key={'--url':'url','--expected-sha':'expectedSha','--deployed-sha':'deployedSha'}[args[i]];
   out[key]=args[++i];
  }else if(args[i]==='--json')out.json=true;
  else throw Error('Unknown argument: '+args[i]);
 }
 if(!out.url)throw Error('Required: --url https://<production>/game/preview-2d/');
 return out;
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 try{
  const args=parseArguments(process.argv.slice(2));
  const result=await verifyProduction(args);
  if(args.json)console.log(JSON.stringify(result,null,2));
  else{
   console.log('Yên 2D production gate:',result.status);
   for(const item of result.checks)console.log((item.status==='pass'?'PASS':'FAIL')+' '+item.name);
   for(const error of result.errors)console.error('BLOCKED:',error);
   if(result.status==='SMOKE_PASS_UNVERIFIED_SHA')
    console.warn('WARNING: HTTP smoke passed but provider SHA was NOT verified. Do not claim shipped.');
  }
  if(result.status==='BLOCKED')process.exitCode=1;
 }catch(e){console.error('Production gate error:',String(e));process.exitCode=2;}
}
