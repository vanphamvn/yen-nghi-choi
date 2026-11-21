import { test, expect } from "@playwright/test";

const open=async page=>{
 await page.goto("/tinh-huong/campaign/");
 await expect(page.locator("#game")).toBeVisible();
 await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-01");
};
const activate=async(page,ids)=>{
 for(const id of ids)await page.locator('#targets [data-item="'+id+'"]').click();
 await expect(page.locator("#choices")).toBeVisible();
};
const decide=async(page,id)=>{
 await page.locator('#choices [data-choice="'+id+'"]').click();
 await expect(page.locator("#world")).toHaveAttribute("data-phase","resolution");
 await expect(page.locator("#result")).toBeVisible();
};
const next=async page=>page.locator("#continue").click();

test("Day 1: morning ticket sorting → afternoon hazard isolation → evening bill correction → debrief", async({page},testInfo)=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await open(page);
 await expect(page.getByRole("heading",{name:"Hàng khách đầu tiên"})).toBeVisible();
 await expect(page.locator("#world")).toHaveAttribute("data-phase","establishing");
 await testInfo.attach("D01-01-establishing",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await activate(page,["03","01","03","02"]);
 await expect(page.locator("#world")).toHaveAttribute("data-phase","interactive");
 await expect(page.locator("#targets .item-ticket").first()).toContainText("PHIẾU 01");
 await testInfo.attach("D01-01-interactive",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await decide(page,"explain");
 await expect(page.locator("#world")).toHaveAttribute("data-outcome","explain");
 await expect(page.locator("#dialogue")).toContainText("Cảm ơn quán");
 await testInfo.attach("D01-01-resolution",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await next(page);

 await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-02");
 await expect(page.locator("#incident-title")).toContainText("Vũng nước");
 await testInfo.attach("D01-02-establishing",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await activate(page,["sign","spill"]);
 await expect(page.locator('[data-item="sign"]')).toHaveClass(/is-deployed/);
 await testInfo.attach("D01-02-interactive",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await decide(page,"clean");
 await expect(page.locator("#world")).toHaveAttribute("data-outcome","clean");
 await expect(page.locator(".item-spill")).toHaveClass(/is-marked/);
 await testInfo.attach("D01-02-resolution",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await next(page);

 await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-03");
 await expect(page.locator("#incident-title")).toContainText("Hóa đơn");
 await testInfo.attach("D01-03-establishing",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await activate(page,["tea"]);
 await expect(page.locator('[data-item="tea"]')).toContainText("25.000");
 await testInfo.attach("D01-03-interactive",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await decide(page,"refund");
 await expect(page.locator('[data-item="total"]')).toContainText("41.000");
 await testInfo.attach("D01-03-resolution",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await next(page);
 await expect(page.locator("#debrief")).toBeVisible();
 await expect(page.locator("#debrief-list li")).toHaveCount(3);
 await expect(page.locator("#history li")).toHaveCount(3);
 await expect(page.locator("#game")).toBeHidden();
 await expect(page.locator(".coming-soon")).toContainText("Ngày 2 chưa mở chơi");
 await testInfo.attach("D01-debrief",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 expect(errors).toEqual([]);
});

test("hazard can be repaired; otherwise it remains visibly hazardous and Day 2 callback reports it",async({page})=>{
 await open(page);
 await activate(page,["03","01","03","02"]);await decide(page,"silent");await next(page);
 await activate(page,["sign","spill"]);await decide(page,"open");
 await expect(page.locator("#world")).toHaveAttribute("data-risk","hazard");
 await expect(page.locator("#recover")).toBeVisible();
 await expect(page.locator('[data-item="sign"]')).not.toHaveClass(/is-deployed/);
 await expect(page.locator('[data-item="spill"]')).not.toHaveClass(/is-marked/);
 await page.locator("#recover").click();
 await expect(page.locator("#world")).toHaveAttribute("data-outcome","recovered");
 await expect(page.locator("#recover")).toBeHidden();
 await expect(page.locator('[data-item="spill"]')).toHaveClass(/is-marked/);
 await next(page);
 await activate(page,["tea"]);await decide(page,"ignore");await next(page);
 await expect(page.locator("#debrief-list")).toContainText("Lối đi đã được xử lý");
 await expect(page.locator("#debrief-list")).toContainText("Sai lệch trên hóa đơn vẫn cần giải quyết");
});
test("keyboard: every scene is operable by Tab, Enter or Space without dragging",async({page})=>{
 await open(page);
 for(const key of ["03","01","03","02"]){
  await page.locator('#targets [data-item="'+key+'"]').focus();
  await page.keyboard.press(key==="01"?"Space":"Enter");
 }
 await expect(page.locator("#choices")).toBeVisible();
 await page.locator('[data-choice="explain"]').focus();
 await page.keyboard.press("Enter");
 await expect(page.locator("#result")).toBeVisible();
 await page.locator("#continue").focus();
 await page.keyboard.press("Space");
 await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-02");
 await page.locator('[data-item="sign"]').focus();await page.keyboard.press("Enter");
 await page.locator('[data-item="spill"]').focus();await page.keyboard.press("Space");
 await page.locator('[data-choice="clean"]').focus();await page.keyboard.press("Enter");
 await expect(page.locator("#world")).toHaveAttribute("data-phase","resolution");
});
test("scene choices cannot be bypassed or double-scored; user can reset and replay",async({page})=>{
 await open(page);
 await expect(page.locator("#continue")).toBeHidden();
 await expect(page.locator("#choices")).toBeHidden();
 await page.locator('[data-item="03"]').click();
 await page.locator("#reset-mechanic").click();
 await expect(page.locator("#world")).toHaveAttribute("data-phase","establishing");
 await activate(page,["03","01","03","02"]);
 await decide(page,"explain");
 await expect(page.locator("#choices")).toBeHidden();
 await expect(page.locator("#reset-mechanic")).toBeHidden();
 await page.locator("#restart").click();
 await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-01");
 await expect(page.locator("#world")).toHaveAttribute("data-phase","establishing");
 const session=await page.evaluate(()=>({cookie:document.cookie,local:localStorage.length,session:sessionStorage.length}));
 expect(session).toEqual({cookie:"",local:0,session:0});
});
test("Day 1 touch controls function without drag or enforced timing",async({browser})=>{
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await ctx.newPage();await open(page);
 for(const id of ["03","01","03","02"])await page.locator('[data-item="'+id+'"]').tap();
 await page.locator('[data-choice="explain"]').tap();await page.locator("#continue").tap();
 await page.locator('[data-item="sign"]').tap();
 await page.locator('[data-item="spill"]').tap();
 await page.locator('[data-choice="clean"]').tap();
 await expect(page.locator("#world")).toHaveAttribute("data-phase","resolution");
 await ctx.close();
});
for(const width of [320,360,390,768,1440]){
 test("Day 1 painted-world layout, no overflow, all asset loads at "+width+" px",async({page},testInfo)=>{
  const errors=[],broken=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("response",r=>{if(r.status()>=400)broken.push([r.status(),r.url()]);});
  await page.setViewportSize({width,height:width<768?844:900});
  await page.emulateMedia({reducedMotion:"reduce"});
  await open(page);
  const check=async()=>{
   const info=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>window.innerWidth,
    images:[...document.images].map(img=>({src:img.getAttribute("src"),loaded:img.complete&&img.naturalWidth>0})),
    targets:[...document.querySelectorAll("#targets button:not(:disabled)")].map(b=>{
     const r=b.getBoundingClientRect();return {label:b.getAttribute("aria-label"),w:r.width,h:r.height};
    })
   }));
   expect(info.overflow).toBe(false);
   expect(info.images.every(x=>x.loaded),JSON.stringify(info.images)).toBe(true);
   for(const t of info.targets){expect(t.w,t.label).toBeGreaterThanOrEqual(43.5);expect(t.h,t.label).toBeGreaterThanOrEqual(43.5);}
  };
  await check();
  await testInfo.attach("D01-morning-"+width,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  await activate(page,["03","01","03","02"]);await decide(page,"explain");await next(page);
  await check();
  await testInfo.attach("D01-spill-"+width,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  await activate(page,["sign","spill"]);await decide(page,"clean");await next(page);
  await check();
  await testInfo.attach("D01-pos-"+width,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  expect(errors).toEqual([]);
  expect(broken).toEqual([]);
 });
}
