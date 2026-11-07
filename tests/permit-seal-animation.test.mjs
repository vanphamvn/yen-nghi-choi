import test from "node:test";
import assert from "node:assert/strict";
import {html,mountPermit} from "./permit-harness.mjs";

test("paper and randomly filled result appear before stamp hits the paper",()=>{
  const {nodes,timers,tick}=mountPermit();
  nodes["permit-start"].click();
  assert.equal(nodes["permit-receipt"].hidden,false);
  assert.ok(nodes["permit-out-reason"].textContent);
  assert.ok(nodes["permit-out-duration"].textContent);
  assert.equal(nodes["yen-permit"].classList.contains("is-previewing"),true);
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),false);
  assert.equal(timers[0].delay,470);
  tick();
  assert.equal(nodes["yen-permit"].classList.contains("is-collecting"),true);
  tick();
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-coming"),true);
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),false);
  tick();
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),true);
  tick();
  assert.equal(nodes["yen-permit"].classList.contains("is-issued"),true);
  assert.equal(nodes["permit-receipt"].hidden,false);
});

test("the stamp animation remains centered in its own overlay",()=>{
  assert.match(html,/id="permit-seal-target"/);
  assert.match(html,/id="permit-ink-seal"/);
  assert.match(html,/id="permit-cinema" role="dialog"/);
  assert.match(html,/class="yen-stamp-cinema-giant"/);
  assert.match(html,/\\.yen-stamp-cinema\\.is-seal-coming \\.yen-stamp-cinema-giant/);
  assert.match(html,/\\.permit-stage\\.is-seal-imprinted \\.permit-ink-seal/);
});

test("no motion setting skips animation but still reveals completed approval",()=>{
  const {nodes,timers}=mountPermit({reduced:true});
  nodes["permit-start"].click();
  assert.equal(nodes["permit-receipt"].hidden,false);
  assert.equal(nodes["yen-permit"].classList.contains("is-issued"),true);
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),true);
  assert.equal(timers.length,0);
});

test("replay during ongoing motion cancels the previous callbacks",()=>{
  const {nodes,timers,tick}=mountPermit();
  nodes["permit-start"].click();
  tick();
  assert.equal(nodes["yen-permit"].classList.contains("is-collecting"),true);
  // The visitor cannot request a new permit until the current stamp finishes.
  nodes["permit-restart"].click();
  assert.equal(nodes["yen-permit"].classList.contains("is-collecting"),true);
  assert.equal(timers.length,1);
});
