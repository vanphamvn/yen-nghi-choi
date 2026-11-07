import test from "node:test";
import assert from "node:assert/strict";
import {html,permitScript,mountPermit} from "./permit-harness.mjs";

test("one click creates a permit, with no form choices or user inputs",()=>{
  const permit=html.slice(html.indexOf('<section class="section permit-section'),html.indexOf('<section class="section release-section'));
  assert.ok(!permit.includes('id="permit-form"'));
  assert.ok(!permit.includes('data-permit-field='));
  assert.ok(!permit.includes('id="permit-approve"'));
  assert.ok(permit.includes('id="permit-start"'));
  assert.ok(permit.includes("BỐC GIẤY PHÉP NGHỈ"));
  assert.ok(permit.includes('id="permit-restart"'));
});

test("random result includes reason, duration, reaction and a real drink suggestion",()=>{
  const {nodes,getReactionCount}=mountPermit({randomValues:[0]});
  nodes["permit-start"].click();
  assert.equal(nodes["permit-receipt"].hidden,false);
  assert.equal(nodes["permit-out-reason"].textContent,"Não mở 38 tab, tab nào cũng phát nhạc");
  assert.equal(nodes["permit-out-duration"].textContent,"10 phút nữa, hứa bằng Wi-Fi");
  assert.equal(nodes["permit-out-drink"].textContent,"Trà atiso đường phèn mật ong");
  assert.equal(getReactionCount(),1);
});

test("replaying generates a different combination even when the RNG repeats",()=>{
  const {nodes,tick}=mountPermit({randomValues:[0]});
  nodes["permit-start"].click();
  const first=nodes["permit-out-reason"].textContent+"|"+nodes["permit-out-duration"].textContent;
  for(let i=0;i<4;i++)tick();
  nodes["permit-restart"].click();
  const second=nodes["permit-out-reason"].textContent+"|"+nodes["permit-out-duration"].textContent;
  assert.notEqual(first,second);
});

test("no customer data is stored and the permit can be saved locally",()=>{
  assert.ok(!permitScript.includes("localStorage"));
  assert.ok(!permitScript.includes("fetch("));
  assert.ok(permitScript.includes('ctx.fillText("GIẤY PHÉP"'));
  assert.ok(permitScript.includes('function permitImage()'));
  assert.ok(permitScript.includes('function downloadPermitImage(uri)'));
});

test("permit script parses without JavaScript errors",()=>{
  assert.doesNotThrow(()=>new Function(permitScript));
});
