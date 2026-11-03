import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const section=html.slice(html.indexOf('<section class="section permit-section'),html.indexOf('<section class="section release-section'));
const form=section.slice(section.indexOf('<div class="permit-form"'),section.indexOf('<div class="permit-receipt"'));
const receipt=section.slice(section.indexOf('<div class="permit-receipt"'),section.indexOf('<aside class="permit-clerk"'));
const script=html.split('<script id="yen-permit-script">')[1]?.split("</script>")[0]||"";

test("exactly two questions, no drink-style question",()=>{
  const names=[...form.matchAll(/<fieldset class="permit-field" data-field="([^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(names,["reason","duration"]);
  assert.ok(form.includes("PHIẾU ĐỀ NGHỊ<br>ĐƯỢC NGỒI YÊN"));
  assert.ok(form.includes("Hôm nay lấy cớ gì để ngồi Yên?"));
  assert.ok(form.includes("Bao giờ mới chịu đứng dậy?"));
  assert.ok(!form.includes("Nghỉ theo kiểu nào?"));
});

test("both questions offer four consistent reasons",()=>{
  for(const field of ["reason","duration"]){
    assert.equal((form.match(new RegExp('data-permit-field="'+field+'"','g'))||[]).length,4);
  }
  assert.ok(form.includes('Não mở 38 tab, tab nào cũng phát nhạc'));
  assert.ok(form.includes('Hết bài này... rồi bài nữa'));
});

test("validation requires two fields, not three",()=>{
  assert.ok(script.includes('const values={reason:null,duration:null};'));
  assert.ok(script.includes("if(count()===2)"));
  assert.ok(script.includes('progress.textContent="ĐÃ KHAI "+count()+"/2 MỤC"'));
  assert.ok(script.includes('ĐÃ KHAI 0/2 MỤC'));
  assert.ok(!script.includes("values.style"));
  assert.ok(!script.includes("count()===3"));
  assert.ok(!form.includes("0/3"));
});

test("receipt, image export and drink suggestion use the two answers",()=>{
  assert.ok(receipt.includes('id="permit-out-reason"'));
  assert.ok(receipt.includes('id="permit-out-duration"'));
  assert.ok(!receipt.includes('permit-out-style'));
  assert.ok(script.includes('const selected=menu[values.reason];'));
  assert.ok(script.includes('["THỜI HẠN", $("permit-out-duration").textContent]'));
  assert.ok(!script.includes('["HÌNH THỨC"'));
  for(const drink of ["Cold Brew Cam Vàng","Trà atiso đường phèn mật ong","Cacao cốt dừa","Nước ép thơm táo"]){
    assert.ok(script.includes(drink));
  }
});

test("mobile layout handles longer text",()=>{
  assert.ok(html.includes("@media(max-width:420px){\n  .permit-form .permit-options{grid-template-columns:1fr"));
  assert.ok(html.includes("overflow-wrap:anywhere"));
});

test("permit script parses as valid JavaScript",()=>{
  assert.doesNotThrow(()=>new Function(script));
});
