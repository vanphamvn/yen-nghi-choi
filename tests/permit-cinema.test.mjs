import test from "node:test";
import assert from "node:assert/strict";
import {html,mountPermit} from "./permit-harness.mjs";

test("cinematic stamping occupies and centers the viewport",()=>{
  assert.ok(html.includes('id="permit-cinema" role="dialog" aria-modal="true"'));
  assert.ok(html.includes('.yen-stamp-cinema{\n  position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;'));
  assert.ok(html.includes('max-height:calc(100dvh - 18px)'));
  assert.ok(html.includes('.yen-stamp-cinema-shade{'));
  assert.ok(html.includes('backdrop-filter:blur(9px)'));
});

test("randomized reason and duration are visible and focused before mascot fetches the stamp",()=>{
  const {nodes,body,timers}=mountPermit({randomValues:[0]});
  nodes["permit-start"].click();
  assert.equal(nodes["permit-cinema"].hidden,false);
  assert.equal(nodes["permit-cinema"].focused,true);
  assert.equal(body.classList.contains("yen-stamping-active"),true);
  assert.equal(nodes["permit-cinema-reason"].textContent,nodes["permit-out-reason"].textContent);
  assert.equal(nodes["permit-cinema-duration"].textContent,nodes["permit-out-duration"].textContent);
  assert.equal(nodes["permit-cinema"].classList.contains("is-previewing"),true);
  assert.equal(nodes["permit-cinema"].classList.contains("is-seal-imprinted"),false);
  assert.equal(timers[0].delay,470);
});

test("visual action is staged as fetch, giant mộc, impact and receipt",()=>{
  const {nodes,body,tick}=mountPermit();
  nodes["permit-start"].click();
  tick();
  assert.equal(nodes["permit-cinema"].classList.contains("is-collecting"),true);
  assert.equal(nodes["permit-cinema"].classList.contains("is-seal-coming"),false);
  tick();
  assert.equal(nodes["permit-cinema"].classList.contains("is-seal-coming"),true);
  assert.equal(nodes["permit-cinema"].classList.contains("is-seal-imprinted"),false);
  tick();
  assert.equal(nodes["permit-cinema"].classList.contains("is-seal-imprinted"),true);
  assert.match(nodes["permit-cinema-status"].textContent,/CỘP/);
  tick();
  assert.equal(nodes["permit-cinema"].hidden,true);
  assert.equal(body.classList.contains("yen-stamping-active"),false);
  assert.equal(nodes["permit-receipt"].scrolled,true);
  assert.equal(nodes["yen-permit"].classList.contains("is-issued"),true);
});

test("a new single-tap permit resets and replays the centered stamp scene",()=>{
  const {nodes,body,tick}=mountPermit({randomValues:[0]});
  nodes["permit-start"].click();
  const first=nodes["permit-cinema-duration"].textContent;
  for(let i=0;i<4;i++)tick();
  nodes["permit-restart"].click();
  assert.equal(nodes["permit-cinema"].hidden,false);
  assert.equal(body.classList.contains("yen-stamping-active"),true);
  assert.equal(nodes["permit-cinema"].classList.contains("is-previewing"),true);
  assert.notEqual(nodes["permit-cinema-duration"].textContent,first);
});

test("reduced motion completes without opening an overlay or locking scrolling",()=>{
  const {nodes,body,timers}=mountPermit({reduced:true});
  nodes["permit-start"].click();
  assert.equal(nodes["permit-cinema"].hidden,true);
  assert.equal(body.classList.contains("yen-stamping-active"),false);
  assert.equal(nodes["yen-permit"].classList.contains("is-issued"),true);
  assert.equal(timers.length,0);
});

test("unused permit props are no longer rendered",()=>{
  const area=html.slice(html.indexOf('<section class="section permit-section'),html.indexOf('</section>',html.indexOf('<section class="section permit-section')));
  for(const cls of ["permit-illustration","permit-desk-pencil","permit-desk-coaster","permit-desk-ribbon","permit-bottom-strip","permit-inkpad"]){
    assert.ok(!area.includes('class="'+cls+'"'),"Decorative prop still rendered: "+cls);
  }
  assert.ok(area.includes('id="permit-start"'));
  assert.ok(area.includes('id="permit-receipt"'));
});
