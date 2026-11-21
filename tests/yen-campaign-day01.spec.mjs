import { test, expect } from "@playwright/test";

const open = async page => {
  await page.goto("/tinh-huong/campaign/");
  await expect(page.locator("#game")).toBeVisible();
  await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-01");
  await expect(page.locator("#choices button")).toHaveCount(3);
};
const decide = async (page,id) => {
  await page.locator('#choices [data-choice="'+id+'"]').click();
  await expect(page.locator("#world")).toHaveAttribute("data-phase","resolution");
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#choices")).toBeHidden();
};
const next = page => page.locator("#continue").click();
const allImages = page => page.evaluate(()=>
 [...document.images].every(image=>image.complete && image.naturalWidth>0));
const loaded = async page => expect.poll(()=>allImages(page),{timeout:15000}).toBe(true);

test("Day 1: choose directly from illustrated story, then see reactions and debrief",async({page},testInfo)=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await open(page);
 await expect(page.locator("#targets")).toHaveCount(0);
 await expect(page.locator("#reset-mechanic")).toHaveCount(0);
 await expect(page.locator("#scene-evidence")).toContainText("Phiếu in bị lẫn thứ tự");
 await loaded(page);
 await testInfo.attach("D01-01-before",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 const morningFace=await page.locator("#illustrations img.actor").getAttribute("src");
 await decide(page,"explain");
 await expect(page.locator("#dialogue")).toContainText("Cảm ơn quán");
 await expect(page.locator("#scene-evidence")).toContainText("Khách đã được thông báo");
 await expect(page.locator("#illustrations img.actor")).not.toHaveAttribute("src",morningFace);
 await loaded(page);
 await testInfo.attach("D01-01-after",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await next(page);
 await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-02");
 await expect(page.locator("#scene-evidence")).toContainText("Sàn ướt");
 await expect(page.locator("#choices button")).toHaveCount(3);
 await loaded(page);
 await testInfo.attach("D01-02-before",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await decide(page,"clean");
 await expect(page.locator("#scene-evidence")).toContainText("Sàn đã lau khô");
 await expect(page.locator("#character-reaction")).toContainText("ĐÃ GIẢI QUYẾT");
 await loaded(page);
 await testInfo.attach("D01-02-after",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await next(page);
 await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-03");
 await expect(page.locator("#scene-evidence")).toContainText("Tổng 51.000đ");
 await expect(page.locator("#choices button")).toHaveCount(3);
 await loaded(page);
 await testInfo.attach("D01-03-before",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await decide(page,"refund");
 await expect(page.locator("#scene-evidence")).toContainText("Tổng 41.000đ");
 await expect(page.locator("#dialogue")).toContainText("cảm ơn quán");
 await loaded(page);
 await testInfo.attach("D01-03-after",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await next(page);
 await expect(page.locator("#debrief")).toBeVisible();
 await expect(page.locator("#debrief-list li")).toHaveCount(3);
 await expect(page.locator(".coming-soon")).toContainText("Ngày 2 chưa mở chơi");
 await testInfo.attach("D01-debrief",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 expect(errors).toEqual([]);
});

test("unsafe choice has meaningful aftermath and an optional correction without scene mini-game",async({page})=>{
 await open(page);
 await decide(page,"silent");await next(page);
 await decide(page,"open");
 await expect(page.locator("#world")).toHaveAttribute("data-risk","hazard");
 await expect(page.locator("#scene-evidence")).toContainText("chưa có cảnh báo");
 await expect(page.locator("#recover")).toBeVisible();
 await page.locator("#recover").click();
 await expect(page.locator("#world")).toHaveAttribute("data-outcome","recovered");
 await expect(page.locator("#world")).toHaveAttribute("data-risk","safe");
 await expect(page.locator("#recover")).toBeHidden();
 await expect(page.locator("#scene-evidence")).toContainText("Sàn đã lau khô");
 await next(page);
 await decide(page,"ignore");await next(page);
 await expect(page.locator("#debrief-list")).toContainText("Lối đi đã được xử lý");
 await expect(page.locator("#debrief-list")).toContainText("Sai lệch trên hóa đơn vẫn cần giải quyết");
});

test("keyboard: select dialogue answers with Tab and Enter; no scenery interaction",async({page})=>{
 await open(page);
 await expect(page.locator("#world button")).toHaveCount(0);
 await page.locator('[data-choice="explain"]').focus();await page.keyboard.press("Enter");
 await expect(page.locator("#result")).toBeVisible();
 await page.locator("#continue").focus();await page.keyboard.press("Space");
 await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-02");
 await page.locator('[data-choice="clean"]').focus();await page.keyboard.press("Enter");
 await expect(page.locator("#result")).toBeVisible();
 await page.locator("#continue").focus();await page.keyboard.press("Enter");
 await page.locator('[data-choice="refund"]').focus();await page.keyboard.press("Space");
 await expect(page.locator("#result")).toBeVisible();
});

test("choices are initially visible; no duplicate scoring; restart clears entire day",async({page})=>{
 await open(page);
 await expect(page.locator("#choices")).toBeVisible();
 await expect(page.locator("#continue")).toBeHidden();
 await expect(page.locator("#world")).toHaveAttribute("data-phase","establishing");
 await decide(page,"priority");
 await expect(page.locator("#choices")).toBeHidden();
 await expect(page.locator("#scene-evidence")).toContainText("Người đến sau");
 await page.locator("#restart").click();
 await expect(page.locator("#choices button")).toHaveCount(3);
 await expect(page.locator("#scene-evidence")).toContainText("Phiếu in bị lẫn thứ tự");
 await expect(page.locator("#world")).toHaveAttribute("data-phase","establishing");
 const persisted=await page.evaluate(()=>({cookie:document.cookie,local:localStorage.length,session:sessionStorage.length}));
 expect(persisted).toEqual({cookie:"",local:0,session:0});
});
test("touch: choose story replies directly, no hotspots or dragging",async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();await open(page);
 await page.locator('[data-choice="explain"]').tap();await page.locator("#continue").tap();
 await page.locator('[data-choice="clean"]').tap();await page.locator("#continue").tap();
 await page.locator('[data-choice="refund"]').tap();
 await expect(page.locator("#world")).toHaveAttribute("data-phase","resolution");
 await expect(page.locator("#targets")).toHaveCount(0);
 await context.close();
});
for(const width of [320,360,390,768,1440]){
 test("three illustrated scenes responsive, all sprites load at "+width+" px",async({page},testInfo)=>{
  const errors=[],broken=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("response",r=>{if(r.status()>=400)broken.push([r.status(),r.url()]);});
  await page.setViewportSize({width,height:width<768?844:900});
  await page.emulateMedia({reducedMotion:"reduce"});
  await open(page);
  const check=async()=>{
   await loaded(page);
   const info=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>window.innerWidth,
    images:[...document.images].map(image=>({src:image.getAttribute("src"),ready:image.complete&&image.naturalWidth>0})),
    choices:[...document.querySelectorAll("#choices button")].map(button=>{
      const r=button.getBoundingClientRect();return{w:r.width,h:r.height};
    })
   }));
   expect(info.overflow).toBe(false);
   expect(info.images.every(image=>image.ready),JSON.stringify(info.images)).toBe(true);
   for(const option of info.choices){
    expect(option.w).toBeGreaterThanOrEqual(44);
    expect(option.h).toBeGreaterThanOrEqual(44);
   }
  };
  await check();
  await testInfo.attach("D01-morning-"+width,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  await decide(page,"explain");await next(page);
  await check();
  await testInfo.attach("D01-spill-"+width,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  await decide(page,"clean");await next(page);
  await check();
  await testInfo.attach("D01-bill-"+width,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  expect(errors).toEqual([]);expect(broken).toEqual([]);
 });
}


const oneScreenSizes=[
  {width:320,height:568,label:"compact-phone"},
  {width:360,height:640,label:"small-phone"},
  {width:390,height:844,label:"modern-phone"},
  {width:414,height:736,label:"medium-phone"},
  {width:667,height:375,label:"phone-landscape"},
  {width:812,height:375,label:"wide-phone-landscape"},
  {width:768,height:1024,label:"tablet-portrait"},
  {width:1366,height:768,label:"laptop"},
  {width:1440,height:900,label:"desktop"}
];

async function assertOneViewport(page,label){
 const details=await page.evaluate(()=>{
  const viewport={w:document.documentElement.clientWidth,h:window.innerHeight};
  const rect=element=>{
   const b=element.getBoundingClientRect();
   return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,w:b.width,h:b.height};
  };
  const itemList=[
   ".header","#main>.intro h1","#chapter-steps","#game:not([hidden]) #world",
   "#game:not([hidden]) #scene-evidence",
   "#game:not([hidden]) #incident-title",
   "#game:not([hidden]) .dialogue-scene",
   "#game:not([hidden]) #prompt:not([hidden])",
   "#game:not([hidden]) #choices:not([hidden]) button",
   "#game:not([hidden]) #result:not([hidden])",
   "#game:not([hidden]) #actions:not([hidden]) button:not([hidden])",
   "#debrief:not([hidden]) h2",
   "#debrief:not([hidden]) .debrief-list li",
   "#debrief:not([hidden]) .tomorrow",
   "#debrief:not([hidden]) .actions button",
   "#debrief:not([hidden]) .actions a"
  ];
  const controls=[...document.querySelectorAll(itemList.join(","))]
    .filter(el=>el.getClientRects().length && getComputedStyle(el).visibility!=="hidden");
  const bad=controls.map(el=>({which:el.id||el.className||el.tagName,...rect(el)}))
    .filter(b=>b.w<1||b.h<1||b.x<-1||b.y<-1||b.right>viewport.w+1||b.bottom>viewport.h+1);
  const panel=document.querySelector("#game:not([hidden]) .story");
  const visibleButtons=[...document.querySelectorAll("#game:not([hidden]) #choices:not([hidden]) button, #game:not([hidden]) #actions:not([hidden]) button:not([hidden])")];
  const outsideStory=panel?visibleButtons.map(el=>({label:el.textContent.slice(0,30),...rect(el)}))
    .filter(b=>b.bottom>rect(panel).bottom-2||b.y<rect(panel).y-1):[];
  const tooSmall=visibleButtons.map(el=>({label:el.textContent.slice(0,30),...rect(el)}))
    .filter(b=>b.w<44||b.h<43.5);
  const scrollable=[...document.querySelectorAll("body,main,.story,.world-panel,#debrief")]
    .filter(el=>{const c=getComputedStyle(el);return /auto|scroll/.test(c.overflowY)&&el.scrollHeight>el.clientHeight+1;})
    .map(el=>el.id||el.className||el.tagName);
  return {
   viewport,
   document:{scrollH:document.documentElement.scrollHeight,clientH:document.documentElement.clientHeight,
     scrollW:document.documentElement.scrollWidth,clientW:document.documentElement.clientWidth},
   bad,outsideStory,tooSmall,scrollable,
   imageCount:document.querySelectorAll("#illustrations img").length,
   controls:controls.length
  };
 });
 expect(details.document.scrollH,label+" document height").toBeLessThanOrEqual(details.viewport.h+1);
 expect(details.document.scrollW,label+" document width").toBeLessThanOrEqual(details.viewport.w+1);
 expect(details.bad,label+" clipped items "+JSON.stringify(details.bad)).toEqual([]);
 expect(details.outsideStory,label+" clipped buttons "+JSON.stringify(details.outsideStory)).toEqual([]);
 expect(details.tooSmall,label+" too-small buttons "+JSON.stringify(details.tooSmall)).toEqual([]);
 expect(details.scrollable,label+" nested scrolling").toEqual([]);
 return details;
}

for (const viewport of oneScreenSizes){
 test("one-screen visual novel at "+viewport.label+" "+viewport.width+"x"+viewport.height,async({page},testInfo)=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.emulateMedia({reducedMotion:"reduce"});
  await open(page);
  const screenshot=async name=>{
    await loaded(page);
    await assertOneViewport(page,name);
    await testInfo.attach(name,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  };
  await screenshot(viewport.label+"-morning-choice");
  await decide(page,"explain");
  await screenshot(viewport.label+"-morning-result");
  await next(page);
  await screenshot(viewport.label+"-afternoon-choice");
  await decide(page,"clean");
  await screenshot(viewport.label+"-afternoon-result");
  await next(page);
  await screenshot(viewport.label+"-evening-choice");
  await decide(page,"refund");
  await screenshot(viewport.label+"-evening-result");
  await next(page);
  await screenshot(viewport.label+"-debrief");
  const scrolled=await page.evaluate(()=>{
    window.scrollTo(0,200);
    return {scrollY:window.scrollY,bodyScroll:document.body.scrollTop,documentScroll:document.documentElement.scrollTop};
  });
  expect(scrolled).toEqual({scrollY:0,bodyScroll:0,documentScroll:0});
 });
}

test("compact phone: risk and recovery must fit without page or panel scrolling",async({page})=>{
 await page.setViewportSize({width:320,height:568});
 await open(page);
 await decide(page,"priority");await next(page);
 await decide(page,"open");
 await expect(page.locator("#recover")).toBeVisible();
 await assertOneViewport(page,"hazard");
 await page.locator("#recover").click();
 await expect(page.locator("#recover")).toBeHidden();
 await assertOneViewport(page,"recovered");
 await next(page);
 await decide(page,"ignore");
 await assertOneViewport(page,"unresolved-bill");
 await next(page);
 await assertOneViewport(page,"negative-debrief");
});
