/** Validate who actually reviewed artwork; never impersonate owner approval. */
export function reviewAuthorityErrors(entry,policy){
 const errors=[];
 if(entry.reviewerType==='agent'){
  const delegation=policy.reviewDelegation;
  if(delegation?.enabled!==true||delegation.source!=='explicit-user-instruction'||
     typeof delegation.instruction!=='string'||delegation.instruction.length<20)
   errors.push('Agent review requires explicit recorded user delegation');
  if(!['Codex','ChatGPT GPT-6'].includes(entry.reviewer))
   errors.push('Agent reviewer must identify the actual delegated assistant, not the owner');
  if(entry.ownerReviewPending!==true)errors.push('Delegated agent review must preserve pending owner review');
  if(entry.reviewAuthority!=='user-delegated')errors.push('Missing user-delegated review authority');
  for(const check of ['brush','lighting','perspective','scale','alpha'])
   if(entry.visualChecks?.[check]!=='pass')errors.push('Missing actual agent visual check: '+check);
 }else if(entry.reviewerType==='human'){
  if(typeof entry.reviewer!=='string'||entry.reviewer.trim().length<3||
     /^(ai|bot|gpt|agent|assistant|unknown|self|codex)$/i.test(entry.reviewer.trim()))
   errors.push('Actual human reviewer identity required');
 }else errors.push('Explicit human or agent reviewerType required');
 return errors;
}
