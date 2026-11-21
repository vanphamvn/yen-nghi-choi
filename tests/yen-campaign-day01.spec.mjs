import { test, expect } from "@playwright/test";

const open = async page => {
  await page.goto("/tinh-huong/campaign/");
  await expect(page.locator("#game")).toBeVisible();
  // Netlify adds an external Deploy Preview drawer across the bottom of the viewport.
  // Remove only that provider QA overlay so it cannot intercept gameplay clicks.
  await page.evaluate(()=>document.querySelectorAll("[data-netlify-deploy-id]").forEach(element=>element.remove()));
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
 await expect(page.locator("#scene-evidence,#character-reaction")).toHaveCount(0);
 await expect(page.locator("#level-panel")).toBeVisible();
 await loaded(page);
 await testInfo.attach("D01-01-before",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 const morningFace=await page.locator("#illustrations [data-role=mascot]").getAttribute("src");
 await decide(page,"explain");
 await expect(page.locator("#dialogue")).toContainText("Cảm ơn quán");
 await expect(page.locator("#level-panel [data-level=earned]")).toHaveText("Ca này +12 XP");
 await expect(page.locator("#illustrations [data-role=mascot]")).not.toHaveAttribute("src",morningFace);
 await loaded(page);
 await testInfo.attach("D01-01-after",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await next(page);
 await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-02");
 await expect(page.locator('[data-sprite-id="spill"]')).toBeVisible();
 await expect(page.locator("#choices button")).toHaveCount(3);
 await loaded(page);
 await testInfo.attach("D01-02-before",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await decide(page,"clean");
 await expect(page.locator('[data-sprite-id="spill"]')).toHaveAttribute("data-state","dry");
 await expect(page.locator("#level-panel")).toHaveAttribute("data-level","2");
 await loaded(page);
 await testInfo.attach("D01-02-after",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await next(page);
 await expect(page.locator("#world")).toHaveAttribute("data-incident","D01-03");
 await expect(page.locator('[data-sprite-id="receipt"]')).toBeVisible();
 await expect(page.locator("#choices button")).toHaveCount(3);
 await loaded(page);
 await testInfo.attach("D01-03-before",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await decide(page,"refund");
 await expect(page.locator('[data-sprite-id="receipt"]')).toHaveAttribute("data-state","corrected");
 await expect(page.locator("#dialogue")).toContainText("cảm ơn quán");
 await loaded(page);
 await testInfo.attach("D01-03-after",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 await next(page);
 await expect(page.locator("#debrief")).toBeVisible();
 await expect(page.locator("#debrief-list li")).toHaveCount(3);
 await expect(page.locator("#tomorrow")).toContainText("Ngày 2");
 await testInfo.attach("D01-debrief",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 expect(errors).toEqual([]);
});

test("unsafe choice has meaningful aftermath and an optional correction without scene mini-game",async({page})=>{
 await open(page);
 await decide(page,"silent");await next(page);
 await decide(page,"open");
 await expect(page.locator("#world")).toHaveAttribute("data-risk","hazard");
 await expect(page.locator('[data-sprite-id="spill"]')).toHaveAttribute("data-state","unsafe");
 await expect(page.locator("#recover")).toBeVisible();
 await page.locator("#recover").click();
 await expect(page.locator("#world")).toHaveAttribute("data-outcome","recovered");
 await expect(page.locator("#world")).toHaveAttribute("data-risk","safe");
 await expect(page.locator("#recover")).toBeHidden();
 await expect(page.locator('[data-sprite-id="spill"]')).toHaveAttribute("data-state","dry");
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
 await expect(page.locator("#level-panel [data-level=earned]")).toHaveText("Ca này +6 XP");
 await page.locator("#restart").click();
 await expect(page.locator("#choices button")).toHaveCount(3);
 await expect(page.locator("#level-panel [data-level=xp]")).toHaveText("0/20 XP");
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
  {width:320,height:480,label:"short-phone"},
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
   "#game:not([hidden]) .level-panel",
   "#debrief:not([hidden]) .level-panel",
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


test("portrait is exactly two 50% halves with no redundant navigation, trackers or meters",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await open(page);
  await expect(page.locator(".header,.intro,#chapter-steps,.meter-section,.world-caption,.world-below")).toHaveCount(0);
  await expect(page.locator(".scene-meta .scene-exit")).toHaveAttribute("href","/tinh-huong/");
  await expect(page.locator("#scene-number")).toContainText("Ngày 1");
  for(const [phase,choice] of [["morning","explain"],["afternoon","clean"],["evening","refund"]]){
    const geometry=await page.evaluate(()=>{
      const w=document.querySelector("#game").getBoundingClientRect();
      const a=document.querySelector(".world-panel").getBoundingClientRect();
      const b=document.querySelector("#story").getBoundingClientRect();
      const picture=document.querySelector("#world").getBoundingClientRect();
      const background=document.querySelector("#backdrop").getBoundingClientRect();
      return{viewport:innerHeight,worldTop:a.top,worldBottom:a.bottom,worldHeight:a.height,
        storyTop:b.top,storyBottom:b.bottom,storyHeight:b.height,
        imageTop:picture.top,imageBottom:picture.bottom,backgroundBottom:background.bottom,
        split:Math.abs(a.height-b.height),gameHeight:w.height};
    });
    expect(geometry.split,phase+" exact 50/50 split").toBeLessThan(1.1);
    expect(geometry.worldTop).toBeGreaterThanOrEqual(-1);
    expect(geometry.storyBottom).toBeLessThanOrEqual(845);
    expect(Math.abs(geometry.storyTop-geometry.worldBottom)).toBeLessThan(1.1);
    expect(Math.abs(geometry.imageBottom-geometry.worldBottom)).toBeLessThan(1.1);
    await assertOneViewport(page,phase+" 50/50");
    await decide(page,choice);
    await assertOneViewport(page,phase+" result 50/50");
    await next(page);
  }
  await expect(page.locator("#debrief")).toBeVisible();
  await assertOneViewport(page,"end of day");
});

for(const {width,height} of [{width:320,height:480},{width:320,height:568},{width:360,height:640},{width:390,height:844},{width:768,height:1024}]){
 test("strict upper art and lower answers 50/50 on "+width+"x"+height,async({page})=>{
  await page.setViewportSize({width,height});
  await open(page);
  for(const answer of ["explain","clean","refund"]){
    const halves=await page.evaluate(()=>{
      const a=document.querySelector(".world-panel").getBoundingClientRect();
      const b=document.querySelector("#story").getBoundingClientRect();
      return{a:a.height,b:b.height,y:a.bottom,next:b.top,top:a.top,bottom:b.bottom};
    });
    expect(Math.abs(halves.a-halves.b)).toBeLessThanOrEqual(1.1);
    expect(Math.abs(halves.y-halves.next)).toBeLessThanOrEqual(1.1);
    expect(halves.top).toBeGreaterThanOrEqual(-1);
    expect(halves.bottom).toBeLessThanOrEqual(height+1);
    await assertOneViewport(page,width+"x"+height+" before");
    await decide(page,answer);
    await assertOneViewport(page,width+"x"+height+" after");
    await next(page);
  }
 });
}


const sceneRoles=["staff","customer","mascot"];
async function validateSpatialScene(page,incident){
 const result=await page.evaluate((id)=>{
  const root=document.querySelector("#world").getBoundingClientRect();
  const get=key=>document.querySelector('#illustrations [data-sprite-id="'+key+'"]');
  const rect=e=>{
   const r=e.getBoundingClientRect();
   return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
  };
  const elements=[...document.querySelectorAll("#illustrations .scene-sprite")];
  const counter=get("counter"),machine=get("espresso");
  const roles=Object.fromEntries(["staff","customer","mascot"].map(role=>[role,elements.filter(e=>e.dataset.role===role).length]));
  const sheets=elements.filter(e=>e.classList.contains("scene-sprite-sheet")).map(e=>({
    id:e.dataset.spriteId,
    image:getComputedStyle(e).backgroundImage,
    size:getComputedStyle(e).backgroundSize,
    pos:getComputedStyle(e).backgroundPosition
  }));
  const countertop=counter?rect(counter).top+rect(counter).height*.12:NaN;
  const machineFoot=machine?parseFloat(machine.style.top)+root.top:NaN;
  const paintedMachineBase=machine?rect(machine).top+rect(machine).height*.90:NaN;
  const stageHeight=root.height,stageWidth=root.width;
  const children=elements.map(e=>{
   const r=rect(e);
   return {id:e.dataset.spriteId,role:e.dataset.role,surface:e.dataset.surface,depth:+e.dataset.depth,
    contactX:parseFloat(e.style.left),contactY:parseFloat(e.style.top),
    x:r.left-root.left,y:r.top-root.top,right:r.right-root.left,bottom:r.bottom-root.top,w:r.width,h:r.height};
  });
  return{scene:id,roles,sheets,children,countertop,machineFoot,paintedMachineBase,stageHeight,stageWidth,
   focus:document.querySelector("#illustrations .is-focus")?.dataset.spriteId}
 },incident);
 expect(result.roles,{incident,result}).toEqual({staff:1,customer:1,mascot:1});
 expect(result.sheets).toHaveLength(2);
 for(const sheet of result.sheets){
  expect(sheet.size).toBe("400% 400%");
  expect(sheet.image).toContain("/game/preview-2d/assets/sprites/");
 }
 expect(Math.abs(result.machineFoot-result.countertop),incident+" projected countertop contact").toBeLessThanOrEqual(2.5);
 expect(Math.abs(result.paintedMachineBase-result.countertop),
   incident+" metal feet must contact painted wood, not upper image box").toBeLessThanOrEqual(1.5);
 const byId=Object.fromEntries(result.children.map(c=>[c.id,c]));
 if(incident==="D01-02"){
   expect(byId.staff.depth).toBeGreaterThan(byId.counter.depth);
   expect(byId.staff.contactX).toBeLessThan(byId.customer.contactX);
   expect(byId["cuc-yen"].contactX).toBeLessThan(byId.staff.contactX);
   expect(byId.spill.w).toBeGreaterThan(30);
   const paintedHorizontalGap=(a,b)=>Math.max(b.x-(a.x+a.w),a.x-(b.x+b.w));
   expect(paintedHorizontalGap(byId.staff,byId["cuc-yen"])).toBeGreaterThanOrEqual(0);
   expect(paintedHorizontalGap(byId.staff,byId.customer)).toBeGreaterThanOrEqual(0);
 }else{
   expect(byId.staff.depth).toBeLessThan(byId.counter.depth);
 }
 expect(byId.staff.w/byId.customer.w,incident+" staff must be smaller than guest").toBeLessThanOrEqual(.92);
 if(incident!=="D01-02"){
   const visibleBarista=byId.counter.y-byId.staff.y;
   expect(visibleBarista,incident+" head and shoulders visible over counter").toBeGreaterThan(byId.staff.h*.42);
   expect(visibleBarista,incident+" rear barista must not loom above counter").toBeLessThan(byId.staff.h*.79);
 }
 expect(byId.customer.depth).toBeGreaterThan(byId.counter.depth);
 expect(byId["cuc-yen"].depth).toBeGreaterThan(byId.counter.depth);
 for(const id of ["staff","customer","cuc-yen"]){
  const a=byId[id];
  expect(a.surface).toBe("floor");
  expect(a.contactY,incident+" actor feet on floor "+id).toBeGreaterThan(result.stageHeight*(id==="staff"?.679:.79));
  expect(a.contactY,incident+" actor feet below viewport "+id).toBeLessThanOrEqual(result.stageHeight*.99);
  expect(a.w).toBeGreaterThan(20);
  expect(a.h).toBeGreaterThan(20);
 }
 expect(result.focus).toBe(incident==="D01-01"?"ticket-center":incident==="D01-02"?"spill":"receipt");
 return result;
}

for(const [width,height] of [[320,480],[375,667],[390,660],[390,844],[768,1024],[812,375],[1440,900]]){
 test("painted staff, customer, Cục Yên on floor and machine on counter at "+width+"×"+height,async({page},testInfo)=>{
  await page.setViewportSize({width,height});
  await open(page);
  for(const [id,choice] of [["D01-01","explain"],["D01-02","clean"],["D01-03","refund"]]){
   await validateSpatialScene(page,id);
   await loaded(page);
   await testInfo.attach(id+"-staging-"+width+"x"+height,
    {body:await page.screenshot({fullPage:true}),contentType:"image/png"});
   await decide(page,choice);
   await validateSpatialScene(page,id);
   await next(page);
  }
 });
}

test("the water hazard remains visibly on the floor until repaired; customers do not step onto the counter",async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);
 await decide(page,"explain");await next(page);
 let info=await validateSpatialScene(page,"D01-02");
 const spill=info.children.find(e=>e.id==="spill");
 expect(spill.surface).toBe("floor");
 expect(spill.contactY).toBeGreaterThan(info.stageHeight*.75);
 await decide(page,"open");
 await expect(page.locator('[data-sprite-id="spill"]')).toHaveAttribute("data-state","unsafe");
 await page.locator("#recover").click();
 await expect(page.locator('[data-sprite-id="spill"]')).toHaveAttribute("data-state","dry");
 await validateSpatialScene(page,"D01-02");
});


test("gamified Day 1: XP, levels, awards and debrief come from the actual three decisions",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await open(page);
 await expect(page.locator("#scene-evidence,#character-reaction")).toHaveCount(0);
 await expect(page.locator("#level-panel [data-level=title]")).toHaveText("Tập đứng quầy");
 await expect(page.locator("#level-panel [data-level=xp]")).toHaveText("0/20 XP");
 await decide(page,"explain");
 await expect(page.locator("#level-panel [data-level=earned]")).toHaveText("Ca này +12 XP");
 await expect(page.locator("#level-panel [data-level=xp]")).toHaveText("12/20 XP");
 await expect(page.locator("#level-panel [data-level=next]")).toContainText("Quầy đã vào nhịp");
 await next(page);
 await decide(page,"clean");
 await expect(page.locator("#level-panel")).toHaveAttribute("data-level","2");
 await expect(page.locator("#level-panel")).toHaveAttribute("data-level-up","true");
 await expect(page.locator("#level-panel [data-level=title]")).toHaveText("Quầy đã vào nhịp");
 await expect(page.locator("#level-panel [data-level=xp]")).toHaveText("4/40 XP");
 await next(page);
 await decide(page,"refund");
 await expect(page.locator("#level-panel [data-level=xp]")).toHaveText("16/40 XP");
 await next(page);
 await expect(page.locator("#day-level [data-level=title]")).toHaveText("Quầy đã vào nhịp");
 await expect(page.locator("#day-level [data-level=earned]")).toHaveText("Ngày 1 · +36 XP");
 await expect(page.locator("#day-level [data-level=xp]")).toHaveText("16/40 XP");
 await expect(page.locator("#scene-evidence,#character-reaction")).toHaveCount(0);
});

test("unsafe actions and one recovery adjust XP once; restarting resets the shop rank",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await open(page);
 await decide(page,"silent");
 await expect(page.locator("#level-panel [data-level=earned]")).toHaveText("Ca này +6 XP");
 await next(page);
 await decide(page,"open");
 await expect(page.locator("#level-panel [data-level=xp]")).toHaveText("8/20 XP");
 await page.locator("#recover").click();
 await expect(page.locator("#level-panel [data-level=xp]")).toHaveText("12/20 XP");
 await expect(page.locator("#level-panel [data-level=earned]")).toHaveText("Ca này +6 XP");
 await expect(page.locator("#recover")).toBeHidden();
 await page.locator("#restart").click();
 await expect(page.locator("#level-panel [data-level=xp]")).toHaveText("0/20 XP");
 await expect(page.locator("#level-panel [data-level=title]")).toHaveText("Tập đứng quầy");
});

for(const viewport of [{width:320,height:480},{width:320,height:568},{width:375,height:667},
 {width:390,height:660},{width:390,height:844},{width:812,height:375},{width:1440,height:900}]){
 test("XP/level UI fits without scrolling at "+viewport.width+"×"+viewport.height,async({page},testInfo)=>{
  await page.setViewportSize(viewport);
  await page.emulateMedia({reducedMotion:"reduce"});
  await open(page);
  for(const choice of ["explain","clean","refund"]){
   await decide(page,choice);
   await expect(page.locator("#level-panel")).toBeVisible();
   await expect(page.locator("#level-panel [data-level=title]")).not.toBeEmpty();
   await assertOneViewport(page,"reward at "+viewport.width+"x"+viewport.height);
   const layout=await page.evaluate(()=>{
    const story=document.querySelector("#story").getBoundingClientRect();
    const card=document.querySelector("#level-panel").getBoundingClientRect();
    const actions=document.querySelector("#actions").getBoundingClientRect();
    return {cardTop:card.top,cardBottom:card.bottom,storyBottom:story.bottom,actionsTop:actions.top,actionsBottom:actions.bottom};
   });
   expect(layout.cardBottom).toBeLessThanOrEqual(layout.storyBottom+1);
   expect(layout.actionsBottom).toBeLessThanOrEqual(layout.storyBottom+1);
   expect(layout.cardBottom).toBeLessThanOrEqual(layout.actionsTop+1);
   await next(page);
  }
  await expect(page.locator("#day-level")).toBeVisible();
  await assertOneViewport(page,"gamified debrief "+viewport.width+"x"+viewport.height);
  await testInfo.attach("level-final-"+viewport.width+"x"+viewport.height,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
 });
}

test("wet floor is an irregular transparent watercolor illustration with no rectangular placeholder",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await open(page);
 await decide(page,"explain");await next(page);
 const asset=page.locator('[data-sprite-id="spill"]');
 await expect(asset).toHaveAttribute("src",/watercolor-floor-puddle\.webp$/);
 const art=await asset.evaluate(async image=>{
  await image.decode();
  const canvas=document.createElement("canvas");
  canvas.width=image.naturalWidth;
  canvas.height=image.naturalHeight;
  const ctx=canvas.getContext("2d",{willReadFrequently:true});
  ctx.drawImage(image,0,0);
  const {data,width,height}=ctx.getImageData(0,0,canvas.width,canvas.height);
  const index=(x,y)=>(y*width+x)*4+3;
  const transparentCorners=[[0,0],[width-1,0],[0,height-1],[width-1,height-1]]
    .every(([x,y])=>data[index(x,y)]<15);
  const hasWater=[.3,.5,.7].some(frac=>data[index(Math.floor(width*frac),Math.floor(height*.52))]>100);
  return {width,height,transparentCorners,hasWater};
 });
 expect(art.transparentCorners).toBe(true);
 expect(art.hasWater).toBe(true);
 await decide(page,"clean");
 await expect(asset).toHaveAttribute("data-state","dry");
 await expect(asset).toBeHidden();
});

test("initial load never shows an apparently clickable button before game input is ready",async({page})=>{
 await page.route("**/docs/visual-novel/episodes.json",async route=>{
  await new Promise(resolve=>setTimeout(resolve,250));
  await route.continue();
 });
 await page.goto("/tinh-huong/campaign/",{waitUntil:"domcontentloaded"});
 await expect(page.locator("html")).toHaveAttribute("data-input-ready","false");
 await expect(page.locator("#game")).toBeHidden();
 await expect(page.locator("#loading")).toBeVisible();
 await expect(page.locator("html")).toHaveAttribute("data-input-ready","true",{timeout:10000});
 await expect(page.locator("#controls-loading")).toBeHidden();
 await expect(page.locator("#choices")).toBeVisible();
 await page.locator('[data-choice="explain"]').click();
 await expect(page.locator("#story")).toHaveAttribute("data-state","resolve");
});

test("first tap after each reload responds without extra taps or sprite reconstruction on browser chrome resize",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(let attempt=0;attempt<5;attempt++){
  await page.goto("/tinh-huong/campaign/",{waitUntil:"domcontentloaded"});
  await expect(page.locator("html")).toHaveAttribute("data-input-ready","true",{timeout:10000});
  await expect(page.locator("#choices")).toBeVisible();
  const sceneIdentity=await page.evaluate(()=>{
   const initial=document.querySelector('[data-sprite-id="staff"]');
   window.__firstSceneStaff=initial;
   window.dispatchEvent(new Event("resize"));
   return Boolean(initial);
  });
  expect(sceneIdentity).toBe(true);
  await page.locator('[data-choice="explain"]').click();
  await expect(page.locator("#story")).toHaveAttribute("data-state","resolve");
  const preserved=await page.evaluate(()=>window.__firstSceneStaff?.isConnected);
  expect(preserved).toBe(false); // valid state transition redraws, unlike browser resize
  await expect(page.locator("#interaction-error")).toBeHidden();
 }
});
