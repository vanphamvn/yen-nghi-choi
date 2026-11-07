import test from "node:test";
import assert from "node:assert/strict";
import {html,mountPermit} from "./permit-harness.mjs";

test("one tap on the main CTA reveals the randomized paper immediately",()=>{
  const {nodes}=mountPermit();
  assert.equal(nodes["permit-receipt"].hidden,true);
  nodes["permit-start"].click();
  assert.equal(nodes["permit-receipt"].hidden,false);
  assert.equal(nodes["permit-intro"].hidden,true);
  assert.equal(nodes["permit-cinema"].hidden,false,"The immersive scene must open");
  assert.equal(nodes["permit-cinema"].focused,true,"Focus stays on the centered performance");
  assert.equal(nodes["permit-cinema-reason"].textContent,nodes["permit-out-reason"].textContent);
  assert.equal(nodes["yen-permit"].classList.contains("is-previewing"),true);
});

test("the result has exactly two actions after stamping",()=>{\n  const segment=html.slice(html.indexOf('class="permit-result-actions"'),html.indexOf('id="permit-share-status"'));\n  assert.equal((segment.match(/<button/g)||[]).length,2);\n  assert.ok(segment.includes('id="permit-restart"'));\n  assert.ok(segment.includes('id="permit-share-img"'));\n  assert.ok(!segment.includes('<a '));\n});

test("taps during the animation cannot create another permit",()=>{
  const {nodes,timers}=mountPermit();
  nodes["permit-start"].click();
  const first=nodes["permit-out-reason"].textContent+"|"+nodes["permit-out-duration"].textContent;
  nodes["permit-start"].click();
  assert.equal(nodes["permit-out-reason"].textContent+"|"+nodes["permit-out-duration"].textContent,first);
  assert.equal(timers.length,1);
});

test("new permit is always a single tap after a completed stamp",()=>{
  const {nodes,tick}=mountPermit({randomValues:[0]});
  nodes["permit-start"].click();
  for(let i=0;i<4;i++)tick();
  assert.equal(nodes["yen-permit"].classList.contains("is-issued"),true);
  nodes["permit-restart"].click();
  assert.equal(nodes["yen-permit"].classList.contains("is-previewing"),true);
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),false);
});
