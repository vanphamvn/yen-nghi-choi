import test from "node:test";
import assert from "node:assert/strict";
import {html,mountPermit} from "./permit-harness.mjs";

test("one tap on the main CTA reveals the randomized paper immediately",()=>{
  const {nodes}=mountPermit();
  assert.equal(nodes["permit-receipt"].hidden,true);
  nodes["permit-start"].click();
  assert.equal(nodes["permit-receipt"].hidden,false);
  assert.equal(nodes["permit-intro"].hidden,true);
  assert.equal(nodes["permit-receipt"].focused,true);
  assert.equal(nodes["permit-receipt"].scrolled,true);
  assert.equal(nodes["yen-permit"].classList.contains("is-previewing"),true);
});

test("clicking the Cục Yên character or wooden stamp does the same thing",()=>{
  for(const id of ["permit-cuc-trigger","permit-stamp"]){
    const {nodes}=mountPermit();
    nodes[id].click();
    assert.equal(nodes["permit-receipt"].hidden,false,id+" must trigger randomization");
    assert.ok(nodes["permit-out-duration"].textContent.length>0);
    assert.equal(nodes["yen-permit"].classList.contains("is-previewing"),true);
  }
});

test("taps during the animation cannot create another permit",()=>{
  const {nodes,timers}=mountPermit();
  nodes["permit-start"].click();
  const first=nodes["permit-out-reason"].textContent+"|"+nodes["permit-out-duration"].textContent;
  nodes["permit-start"].click();
  nodes["permit-stamp"].click();
  assert.equal(nodes["permit-out-reason"].textContent+"|"+nodes["permit-out-duration"].textContent,first);
  assert.equal(timers.length,1);
});

test("new permit is always a single tap after a completed stamp",()=>{
  const {nodes,tick}=mountPermit({randomValues:[0]});
  nodes["permit-cuc-trigger"].click();
  for(let i=0;i<4;i++)tick();
  assert.equal(nodes["yen-permit"].classList.contains("is-issued"),true);
  nodes["permit-restart"].click();
  assert.equal(nodes["yen-permit"].classList.contains("is-previewing"),true);
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),false);
});
