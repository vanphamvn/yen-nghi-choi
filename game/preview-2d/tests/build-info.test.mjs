import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildInfo,verifyBuildInfo} from '../tools/write-build-info.mjs';
const env={NETLIFY:'true',COMMIT_REF:'a'.repeat(40),DEPLOY_ID:'b'.repeat(24),CONTEXT:'production',BRANCH:'main',SITE_ID:'d6a1e807-d067-4b58-ab77-fe0287532606'};
test('build marker derives only from hosting environment and refuses invented defaults',()=>{
 assert.equal(verifyBuildInfo(buildInfo(env),env.COMMIT_REF),true);
 assert.throws(()=>buildInfo({}),/Netlify/);
 assert.throws(()=>buildInfo({...env,COMMIT_REF:''}),/COMMIT_REF/);
 assert.throws(()=>buildInfo({...env,DEPLOY_ID:''}),/DEPLOY_ID/);
});
test('production verifier refuses stale commits, previews and the wrong site',()=>{
 const info=buildInfo(env);
 assert.equal(verifyBuildInfo(info,'c'.repeat(40)),false);
 assert.equal(verifyBuildInfo({...info,context:'deploy-preview'},env.COMMIT_REF),false);
 assert.equal(verifyBuildInfo({...info,siteId:'another-site'},env.COMMIT_REF),false);
 assert.equal(verifyBuildInfo(info,''),false);
});
