// Integration-style virtual clock tests for the three-trigger stamp sequence.
// Run: node --test tests/permit-seal-animation.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const script=html.split('<script id="yen-permit-script">')[1]?.split("</script>")[0];

function makeNode(id){
  const classes=new Set();
  return {
    id,hidden:id==="permit-form"||id==="permit-receipt",disabled:false,
    textContent:"",dataset:{},handlers:{},style:{setProperty(){}},
    classList:{
      add(...names){names.forEach(name=>classes.add(name))},
      remove(...names){names.forEach(name=>classes.delete(name))},
      toggle(name,enabled){if(enabled)classes.add(name);else classes.delete(name)},
      contains(name){return classes.has(name)}
    },
    getBoundingClientRect(){return{left:1,top:2,width:100,height:80}},
    querySelector(){return makeNode("stamp-bottom")},
    addEventListener(name,fn){this.handlers[name]=fn},
    setAttribute(){},focus(){this.focused=true},scrollIntoView(){},
    click(){this.handlers.click?.()}
  };
}
function mount({reduced=false}={}){
  const required=["yen-permit","permit-intro","permit-form","permit-receipt",
    "permit-stamp","permit-message","permit-progress","permit-stamp-performer",
    "permit-stamp-landing","permit-stamp-landing-mobile","permit-approve","permit-approve-status",
    "permit-cuc-trigger","permit-start","permit-share-img","permit-restart",
    "permit-out-reason","permit-out-duration","permit-out-note","permit-out-drink",
    "permit-out-why","permit-share-status"];
  const nodes=Object.fromEntries(required.map(id=>[id,makeNode(id)]));
  const opts=Object.fromEntries(["reason","duration"].map(field=>[
    field,(field==="reason"?["noise","deadline","busy","why"]:["ten","cup","song","better"])
      .map(value=>Object.assign(makeNode(field+"-"+value),{dataset:{permitField:field,permitValue:value}}))
  ]));
  const fieldsets=Object.fromEntries(["reason","duration"].map(field=>[field,makeNode("fieldset-"+field)]));
  for(const field of Object.keys(fieldsets))fieldsets[field].querySelector=()=>opts[field][0];
  nodes["yen-permit"].querySelector=(selector)=>{
    if(selector.startsWith("fieldset"))return fieldsets[selector.match(/data-field="([^"]+)"/)?.[1]];
    const field=selector.match(/data-permit-field="([^"]+)"/)?.[1];
    return opts[field]?.[0]??null;
  };
  nodes["yen-permit"].querySelectorAll=(selector)=>opts[selector.match(/data-permit-field="([^"]+)"/)?.[1]]??[];
  nodes["yen-permit"].contains=()=>true;
  const document={readyState:"complete",getElementById:id=>nodes[id],addEventListener(){}};
  const queue=[];
  let nextTimer=0;
  const window={matchMedia:()=>({matches:reduced}),
    setTimeout(fn,delay){if(reduced){fn();return ++nextTimer;}const id=++nextTimer;queue.push({id,fn,delay});return id;},
    clearTimeout(id){const i=queue.findIndex(x=>x.id===id);if(i>=0)queue.splice(i,1)},
    YenReaction:{show(){}}};
  new Function("document","window","navigator",script)(document,window,{});
  const choose=(field,value)=>{
    const btn=opts[field].find(b=>b.dataset.permitValue===value);
    nodes["yen-permit"].handlers.click({target:{closest:()=>btn}});
  };
  return {nodes,opts,fieldsets,choose,queue,runNext(){const timer=queue.shift();if(!timer)throw new Error('No pending timer');timer.fn();return timer.delay;}};
}


test("approved permit appears before the animated wooden stamp touches the red ink",()=>{
  const {nodes,choose,queue,runNext}=mount();
  nodes["permit-start"].click();
  choose("reason","deadline");choose("duration","cup");
  nodes["permit-approve"].click();
  assert.equal(nodes["permit-receipt"].hidden,false,"Paper must be shown immediately");
  assert.equal(nodes["permit-out-drink"].textContent,"Cold Brew Cam Vàng","Real drink is visible");
  assert.equal(nodes["yen-permit"].classList.contains("is-previewing"),true,"Unstamped preview should be visible");
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),false,"Ink cannot appear before stamp impact");
  assert.equal(nodes["yen-permit"].classList.contains("is-issued"),false,"Approval animation must not finish early");
  assert.equal(queue[0].delay,470);

  runNext();
  assert.equal(nodes["yen-permit"].classList.contains("is-collecting"),true,"Cục Yên should fetch stamp");
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),false);
  assert.equal(queue[0].delay,720);

  runNext();
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-coming"),true,"Large stamp is approaching seal target");
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),false);
  assert.equal(queue[0].delay,755);

  runNext();
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),true,"Ink must appear on impact");
  assert.equal(nodes["yen-permit"].classList.contains("is-issued"),false);

  runNext();
  assert.equal(nodes["yen-permit"].classList.contains("is-issued"),true);
  assert.equal(nodes["permit-receipt"].hidden,false);
  assert.equal(nodes["permit-approve"].disabled,false);
  assert.equal(nodes["permit-cuc-trigger"].disabled,false);
});

test("all three entry points use the same sequence and focus the approved paper",()=>{
  for(const trigger of ["permit-approve","permit-cuc-trigger","permit-stamp"]){
    const {nodes,choose,runNext}=mount();
    nodes["permit-start"].click();
    choose("reason","noise");choose("duration","ten");
    nodes[trigger].click();
    assert.equal(nodes["permit-receipt"].hidden,false,"Receipt visible via "+trigger);
    assert.equal(nodes["permit-receipt"].focused,true,"Receipt focused via "+trigger);
    assert.equal(nodes["yen-permit"].classList.contains("is-previewing"),true);
    for(let i=0;i<4;i++)runNext();
    assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),true);
    assert.equal(nodes["yen-permit"].classList.contains("is-issued"),true);
  }
});

test("giant wooden stamp targets the ink seal, not a placeholder elsewhere",()=>{
  assert.match(html,/id="permit-seal-target"/);
  assert.match(html,/id="permit-ink-seal"/);
  assert.match(html,/id="permit-giant-stamp"/);
  assert.match(html,/\.permit-giant-stamp\{[\s\S]*?left:50%;top:50%/);
  assert.match(html,/\.permit-stage\.is-seal-coming \.permit-giant-stamp/);
  assert.match(html,/\.permit-stage\.is-seal-imprinted \.permit-ink-seal/);
  assert.ok(html.indexOf('receipt.hidden=false;')<html.indexOf('stage.classList.add("is-seal-imprinted")'));
});

test("restarting during the animation cancels stale callbacks and removes red ink",()=>{
  const {nodes,choose,queue,runNext}=mount();
  nodes["permit-start"].click();
  choose("reason","busy");choose("duration","better");
  nodes["permit-approve"].click();
  runNext();
  assert.equal(nodes["yen-permit"].classList.contains("is-collecting"),true);
  nodes["permit-restart"].click();
  assert.equal(nodes["permit-receipt"].hidden,true);
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),false);
  assert.equal(nodes["yen-permit"].classList.contains("is-collecting"),false);
  assert.equal(queue.length,0,"Pending stamp callbacks cleared");
});

test("reduced motion shows final imprinted receipt immediately",()=>{
  const {nodes,choose,queue}=mount({reduced:true});
  nodes["permit-start"].click();
  choose("reason","why");choose("duration","song");
  nodes["permit-approve"].click();
  assert.equal(nodes["permit-receipt"].hidden,false);
  assert.equal(nodes["yen-permit"].classList.contains("is-issued"),true);
  assert.equal(nodes["yen-permit"].classList.contains("is-seal-imprinted"),true);
  assert.equal(queue.length,0);
});
