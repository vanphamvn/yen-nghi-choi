import { test, expect } from "@playwright/test";

const paths = [
  {scene:"arrange", sequence:["03","01","03","02"], result:"Phiếu về đúng thứ tự"},
  {scene:"isolate", sequence:["sign","dry","spill"], result:"Biển cảnh báo"},
  {scene:"compare", sequence:["total","tea"], result:"41.000đ"},
  {scene:"inspect", sequence:["book","cup"], result:"mức ngọt tiêu chuẩn"},
  {scene:"place", sequence:["tray","cup","tray"], result:"Ly nằm đúng khay"},
  {scene:"move", sequence:["corner","plant","corner"], result:"Lối đi không còn"}
];
const sizes=[320,360,390,768,1440];

test("all six in-scene interactions work by clicking objects, with visible consequences, replay and next", async ({page})=>{
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/tinh-huong/tuong-tac/");
  await expect(page.getByRole("heading",{name:/Chạm vào cảnh/})).toBeVisible();
  await expect(page.locator(".mode")).toHaveCount(6);
  for(const [index, scenario] of paths.entries()){
    await page.locator('[data-demo="'+scenario.scene+'"]').click();
    await expect(page.locator("#world")).toHaveAttribute("data-phase","establishing");
    for(const id of scenario.sequence){
      await page.locator('[data-item="'+id+'"]').click();
    }
    await expect(page.locator("#world")).toHaveAttribute("data-phase","resolution");
    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator("#outcome")).toContainText(scenario.result);
    await expect(page.locator("#next")).toBeVisible();
    await expect(page.locator(".scene-item:not([disabled])")).toHaveCount(0);
    await page.locator("#reset").click();
    await expect(page.locator("#world")).toHaveAttribute("data-phase","establishing");
    await expect(page.locator("#result")).toBeHidden();
    await page.locator('[data-demo="'+scenario.scene+'"]').click();
  }
  await page.locator('[data-demo="arrange"]').click();
  await page.locator('[data-item="03"]').click();
  await page.locator('[data-item="01"]').click();
  await expect(page.locator(".item-ticket").first()).toContainText("PHIẾU 01");
  expect(errors).toEqual([]);
});

test("keyboard only: tab-focus scene targets, Enter and Space activate objects", async ({page})=>{
  await page.goto("/tinh-huong/tuong-tac/");
  await page.locator('[data-demo="arrange"]').focus();
  await page.keyboard.press("Enter");
  await page.locator('[data-item="03"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#world")).toHaveAttribute("data-phase","interactive");
  await page.locator('[data-item="01"]').focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".item-ticket").first()).toContainText("PHIẾU 01");
  await page.locator('[data-item="03"]').focus();
  await page.keyboard.press("Enter");
  await page.locator('[data-item="02"]').focus();
  await page.keyboard.press("Space");
  await expect(page.locator("#result")).toBeVisible();
});

test("touch mode: direct scene tap, wrong placement reversible, no mandatory drag", async ({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.goto("/tinh-huong/tuong-tac/");
  await page.locator('[data-demo="isolate"]').tap();
  await page.locator('[data-item="spill"]').tap();
  await expect(page.locator("#result")).toBeHidden();
  await page.locator('[data-item="sign"]').tap();
  await page.locator('[data-item="dry"]').tap();
  await expect(page.locator("#result")).toBeHidden();
  await page.locator('[data-item="spill"]').tap();
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator('.item-spill')).toHaveClass(/is-marked/);
  await expect(page.locator('[data-item="sign"]')).toHaveClass(/is-deployed/);
  await expect(page.locator('[data-item="sign"]')).toHaveCSS("--x","51%");
  await page.locator("#next").tap();
  await expect(page.locator("#scene-title")).toContainText("Hóa đơn");
  await context.close();
});

test("scene can reset after partial interaction and does not persist game state",async ({page})=>{
  await page.goto("/tinh-huong/tuong-tac/");
  await page.locator('[data-item="03"]').click();
  await expect(page.locator("#world")).toHaveAttribute("data-phase","interactive");
  await page.locator("#reset").click();
  await expect(page.locator("#world")).toHaveAttribute("data-phase","establishing");
  const state=await page.evaluate(()=>({
    cookie:document.cookie,
    local:localStorage.length,
    session:sessionStorage.length
  }));
  expect(state).toEqual({cookie:"",local:0,session:0});
});

for(const width of sizes){
  test("responsive, painted image loading, touch targets and screenshot "+width,async ({page},testInfo)=>{
    await page.setViewportSize({width,height:width<768?844:900});
    await page.emulateMedia({reducedMotion:"reduce"});
    const failedImages=[];
    page.on("response",response=>{if(response.status()>=400)failedImages.push(response.url());});
    await page.goto("/tinh-huong/tuong-tac/");
    await page.locator('[data-demo="inspect"]').click();
    const info=await page.evaluate(()=>{
      const visibleTargets=[...document.querySelectorAll(".scene-item:not([disabled])")];
      return {
        scrollWidth:document.documentElement.scrollWidth,
        innerWidth:window.innerWidth,
        images:[...document.images].map(img=>({src:img.src,loaded:img.complete&&img.naturalWidth>0})),
        small:visibleTargets.filter(b=>b.getBoundingClientRect().width<44||b.getBoundingClientRect().height<44).map(b=>b.getAttribute("aria-label")),
        world:document.getElementById("world").getBoundingClientRect().width
      };
    });
    expect(info.scrollWidth).toBeLessThanOrEqual(info.innerWidth);
    expect(info.images.every(img=>img.loaded),JSON.stringify(info.images)).toBe(true);
    expect(info.small).toEqual([]);
    expect(info.world).toBeGreaterThan(250);
    expect(failedImages).toEqual([]);
    await page.locator('[data-item="cup"]').click();
    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator('[data-item="cup"]')).toHaveClass(/is-inspected/);
    await expect(page.locator('[data-item="cup"]')).toContainText("ngọt tiêu chuẩn");
    await testInfo.attach("scene-interactions-"+width,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  });
}
