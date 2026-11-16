import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export function buildInfo(env) {
 if(env.NETLIFY!=='true')throw Error('Build provenance requires the Netlify build environment');
 if(!/^[a-f0-9]{40}$/i.test(env.COMMIT_REF||''))throw Error('Missing provider COMMIT_REF');
 if(!/^[a-f0-9]{24}$/i.test(env.DEPLOY_ID||''))throw Error('Missing provider DEPLOY_ID');
 if(!['production','deploy-preview','branch-deploy'].includes(env.CONTEXT))throw Error('Unknown deployment context');
 return {schemaVersion:1,provider:'netlify',commitSha:env.COMMIT_REF,deployId:env.DEPLOY_ID,
  context:env.CONTEXT,branch:env.BRANCH,siteId:env.SITE_ID};
}
export function verifyBuildInfo(info,expected) {
 return info?.schemaVersion===1&&info.provider==='netlify'&&info.context==='production'
  &&info.branch==='main'&&/^[a-f0-9]{40}$/i.test(expected||'')&&info.commitSha===expected
  &&/^[a-f0-9]{24}$/i.test(info.deployId||'')
  &&info.siteId==='d6a1e807-d067-4b58-ab77-fe0287532606';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const info=buildInfo(process.env);
 writeFileSync(path.resolve('game/preview-2d/build-info.json'),JSON.stringify(info,null,2)+'\n');
 console.log('Netlify game build:',info.commitSha,info.context,info.deployId);
}
