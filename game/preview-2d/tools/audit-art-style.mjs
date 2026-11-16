#!/usr/bin/env node
/**
 * Yên visual-style process gate. It cannot judge image aesthetics.
 *
 * node game/preview-2d/tools/audit-art-style.mjs          # CI gate (legacy debt warned)
 * node game/preview-2d/tools/audit-art-style.mjs --strict # human release sign-off
 *
 * Blocks new vector world art, undocumented raster art, silent edits to legacy
 * vector textures, and changes to canonical reference characters.
 */
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const policyPath=path.join(root,'assets/scene/art-style-policy.json');
const policy=JSON.parse(readFileSync(policyPath,'utf8'));
const errors=[];
const warnings=[];
const isArt=f=>/\.(png|webp|svg)$/i.test(f);
const toAbs=rel=>{
  if(typeof rel!=='string'||!rel||rel.startsWith('/')||rel.includes('\\')){
    errors.push('Invalid relative path: '+String(rel));
    return null;
  }
  const abs=path.resolve(root,rel);
  if(!abs.startsWith(root+path.sep)){
    errors.push('Path escapes game directory: '+rel);
    return null;
  }
  return abs;
};
function blobHash(b){
  const prefix=Buffer.concat([Buffer.from('blob '+b.length),Buffer.from([0])]);
  return createHash('sha1').update(prefix).update(b).digest('hex');
}
const resolveExisting=(rel)=>{
 const p=toAbs(rel);
 if(!p)return null;
 if(!existsSync(p)){errors.push('Missing asset: '+rel);return null;}
 return p;
};
function imageSignature(rel){
 const p=resolveExisting(rel);if(!p)return false;
 const b=readFileSync(p),ext=path.extname(rel).toLowerCase();
 if(ext==='.png'){
  const isPng=b.length>24&&b.subarray(0,8).toString('hex')==='89504e470d0a1a0a';
  if(!isPng)errors.push('Invalid PNG: '+rel);
  return isPng;
 }
 if(ext==='.webp'){
  const isWebp=b.length>12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP';
  if(!isWebp)errors.push('Invalid WebP: '+rel);
  return isWebp;
 }
 errors.push('Proof or approved image must be raster PNG/WebP: '+rel);
 return false;
}
if(policy.schemaVersion!==1)errors.push('Unsupported policy schemaVersion');
if(policy.styleId!=='yen-painted-chibi-v1')errors.push('Unexpected style ID');
if(!Array.isArray(policy.referenceRolePaths)||policy.referenceRolePaths.length<2)
 errors.push('Missing canonical character reference list');
const references=new Set(policy.referenceRolePaths||[]);
const canonical=policy.canonicalRoleBlobs||{};
if(Object.keys(canonical).length<5)errors.push('Missing canonical PNG blob fingerprints');
for(const [rel,expectedHash] of Object.entries(canonical)){
 if(!references.has(rel))errors.push('Non-reference sprite locked: '+rel);
 const p=resolveExisting(rel);
 if(!p)continue;
 imageSignature(rel);
 const actual=blobHash(readFileSync(p));
 if(actual!==expectedHash)errors.push('Canonical character sheet changed without a new approved style version: '+rel);
}
const legacy=policy.legacyUnapprovedVectors||{};
const approved=policy.approvedArt||{};
for(const [rel,entry] of Object.entries(legacy)){
 const p=toAbs(rel);
 if(!p)continue;
 if(!existsSync(p))continue; // Can retire a legacy SVG after replacing runtime references.
 const actual=blobHash(readFileSync(p));
 if(actual!==entry.gitBlobSha)errors.push('Quarantined vector modified. Replace with reviewed raster art instead: '+rel);
 warnings.push('NOT STYLE APPROVED (legacy vector): '+rel);
}
function auditApproval(rel,entry){
 if(!entry||typeof entry!=='object'){
  errors.push('Malformed art approval: '+rel);return;
 }
 if(!/\.(png|webp)$/i.test(rel)){
  errors.push('Visible world art must be a reviewed raster PNG/WebP: '+rel);return;
 }
 imageSignature(rel);
 if(entry.styleStatus!=='approved'||entry.styleId!==policy.styleId)
  errors.push('Art lacks explicit approved painterly style status: '+rel);
 if(!Array.isArray(entry.characterReferences)||new Set(entry.characterReferences).size<2 ||
    !entry.characterReferences.every(x=>references.has(x)))
  errors.push('Art approval must compare at least two canonical character sheets: '+rel);
 if(!/^art-reviews\/[A-Za-z0-9_./-]+\.(png|webp)$/i.test(entry.proof||'') ||
    (entry.proof||'').includes('..'))
  errors.push('Missing valid visual contact sheet path under art-reviews/: '+rel);
 else imageSignature(entry.proof);
 if(typeof entry.reviewer!=='string'||entry.reviewer.trim().length<3||
    /^(ai|bot|gpt|agent|assistant|unknown|self)$/i.test(entry.reviewer.trim()))
  errors.push('Human reviewer name required (not agent self-approval): '+rel);
 const date=Date.parse(entry.reviewedOn||'');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(entry.reviewedOn||'')||!Number.isFinite(date))
  errors.push('Valid YYYY-MM-DD reviewedOn required: '+rel);
 if(entry.runtimeScaleCompared!==true)
  errors.push('Runtime-scale side-by-side review must be recorded: '+rel);
}
for(const [rel,entry] of Object.entries(approved))auditApproval(rel,entry);
for(const folder of ['assets/scene','assets/sprites']){
 const dir=path.join(root,folder);
 const files=readdirSync(dir,{withFileTypes:true}).filter(x=>x.isFile()&&isArt(x.name));
 for(const file of files){
  const rel=folder+'/'+file.name;
  if(legacy[rel]||canonical[rel])continue;
  if(!approved[rel]){
   errors.push('Unregistered new or replacement sprite: '+rel+'; add proof and owner review');
   continue;
  }
  // Approval already validated in the previous loop.
 }
}
if(process.argv.includes('--strict')&&warnings.length)
 errors.push(warnings.length+' quarantined vector assets still present. Strict art release blocked.');
for(const issue of warnings)console.warn('[STYLE DEBT]',issue);
for(const issue of errors)console.error('[ART GATE ERROR]',issue);
if(errors.length){
 console.error('Yên art gate FAILED:',errors.length,'error(s),',warnings.length,'known debt asset(s)');
 process.exitCode=1;
}else{
 console.log('Yên art gate PASSED:',Object.keys(canonical).length,
  'canonical character sheets; ',Object.keys(approved).length,
  'approved new assets;',warnings.length,'known legacy vector assets (not approved)');
}
