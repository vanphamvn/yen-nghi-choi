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
 await expect(page.locator("#history li")).toHaveCount(3);
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
