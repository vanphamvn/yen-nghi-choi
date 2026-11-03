// Self-contained DOM simulation for the permit CTA, mascot and wooden stamp.
// Run with: node --test tests/permit-approval-flow.test.mjs
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
function mount(){
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
  const window={matchMedia:()=>({matches:true}),
    setTimeout(fn){fn();return 1},clearTimeout(){},YenReaction:{show(){}}};
  new Function("document","window","navigator",script)(document,window,{});
  const choose=(field,value)=>{
    const btn=opts[field].find(b=>b.dataset.permitValue===value);
    nodes["yen-permit"].handlers.click({target:{closest:()=>btn}});
  };
  return {nodes,opts,fieldsets,choose};
}

test("permit has visible approval button and clickable mascot and stamp",()=>{
  assert.ok(html.includes('id="permit-approve"'));
  assert.ok(html.includes('id="permit-approve-status"'));
  assert.ok(html.includes('id="permit-cuc-trigger"'));
  assert.ok(!html.includes('id="permit-stamp" type="button" aria-describedby="permit-message" disabled'));
});

test("tapping Cục Yên or wooden stamp from intro starts the form",()=>{
  for(const target of ["permit-cuc-trigger","permit-stamp"]){
    const {nodes}=mount();
    assert.equal(nodes["permit-form"].hidden,true);
    nodes[target].click();
    assert.equal(nodes["permit-form"].hidden,false,target+" should start the application");
  }
});

test("approval before two answers highlights missing field",()=>{
  const {nodes,fieldsets}=mount();
  nodes["permit-start"].click();
  nodes["permit-approve"].click();
  assert.equal(fieldsets.reason.classList.contains("is-missing"),true);
  assert.equal(nodes["permit-receipt"].hidden,true);
  assert.match(nodes["permit-approve-status"].textContent,/Chọn thêm/);
});

test("CTA, stamp and mascot each approve after two selections",()=>{
  for(const target of ["permit-approve","permit-stamp","permit-cuc-trigger"]){
    const {nodes,choose}=mount();
    nodes["permit-start"].click();
    choose("reason","deadline");
    choose("duration","cup");
    assert.equal(nodes["permit-progress"].textContent,"ĐÃ KHAI 2/2 MỤC");
    assert.equal(nodes["permit-approve"].classList.contains("is-ready"),true);
    nodes[target].click();
    assert.equal(nodes["permit-receipt"].hidden,false,target+" should issue the permit");
    assert.equal(nodes["permit-out-drink"].textContent,"Cold Brew Cam Vàng");
  }
});

test("restart clears the permit and allows another approval",()=>{
  const {nodes,choose}=mount();
  nodes["permit-start"].click();
  choose("reason","noise");choose("duration","ten");
  nodes["permit-approve"].click();
  assert.equal(nodes["permit-receipt"].hidden,false);
  nodes["permit-restart"].click();
  assert.equal(nodes["permit-receipt"].hidden,true);
  assert.equal(nodes["permit-progress"].textContent,"ĐÃ KHAI 0/2 MỤC");
  choose("reason","why");choose("duration","better");
  nodes["permit-cuc-trigger"].click();
  assert.equal(nodes["permit-receipt"].hidden,false);
});
