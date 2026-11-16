import {test,expect} from '@playwright/test';

async function walkActorTo(page,x,y){
 const inspect=()=>page.evaluate(()=>window.__yenQA.inspect());
  for(const axis of ['x','y']){
   const target=axis==='x'?x:y;
   for(let attempts=0;attempts<30;attempts++){
    const position=(await inspect()).player[axis],distance=target-position;
    if(Math.abs(distance)<24)break;
    const key=axis==='x'?(distance>0?'d':'a'):(distance>0?'s':'w');
    await page.keyboard.down(key);
    await page.waitForTimeout(Math.min(220,Math.max(25,Math.abs(distance)/225*1000)));
    await page.keyboard.up(key);
    // Observe a rendered frame after key release, not a stale pre-keyup sample.
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    if(attempts===29)throw Error('Could not walk to '+x+','+y+' along '+axis+'; actual='+JSON.stringify(await inspect()));
   }
  }
 }


test('boot, role selection, focus, movement and mobile controls',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const paintedLoads=new Set();page.on('response',response=>{
  const file=new URL(response.url()).pathname.split('/').pop();
  if(response.ok()&&/^(cup|book|cushion|counter|machine|bench|plant|scooter|door)-painted-v1\.webp$|^backdrop-painted-v1\.png$/.test(file))paintedLoads.add(file);
 });
 await page.goto('/game/preview-2d/?qa=1');
 await expect(page.locator('#scene canvas')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>Boolean(window.__yenQA?.inspect().player))).toBe(true);
 await expect(page.locator('#load-error')).toBeHidden();
 await expect(page.locator('#model-modal')).toBeVisible();
 await page.locator('#apply-model').focus();await page.keyboard.press('Tab');
 await expect(page.locator('#close-modal')).toBeFocused();
 await page.keyboard.press('Shift+Tab');await expect(page.locator('#apply-model')).toBeFocused();
 await page.locator('[data-role="waiter"]').click();await page.locator('#apply-model').click();
 await expect(page.locator('#overlay')).toBeHidden();await expect(page.locator('#role-label')).toHaveText('Phục vụ');
 const inspect=()=>page.evaluate(()=>window.__yenQA.inspect());
 const start=await inspect();
 expect(start.props.find(prop=>prop.id==='table').texture).toBe('prop-table-painted');
 expect(start.props.find(prop=>prop.id==='counter').texture).toBe('prop-counter-painted');
 for(const [id,texture] of [['door','prop-door-painted'],['bench','prop-bench-painted'],['plant','prop-plant-painted'],['bike','prop-scooter-painted']])
  expect(start.props.find(prop=>prop.id===id).texture).toBe(texture);
 expect(paintedLoads.has('backdrop-painted-v1.png')).toBe(true);
 expect(paintedLoads.has('counter-painted-v1.webp')).toBe(true);
 expect(paintedLoads.has('machine-painted-v1.webp')).toBe(true);
 for(const name of ['cup','book','cushion']){
  const detail=start.details.find(d=>d.id===name);
  expect(paintedLoads.has(name+'-painted-v1.webp')).toBe(true);
  expect(detail.texture).toBe('prop-'+name);
  expect(detail.visible).toBe(true);
 }
 await page.keyboard.down('d');await page.waitForTimeout(220);await page.keyboard.up('d');
 const moved=await inspect();expect(moved.player.x).toBeGreaterThan(start.player.x+10);
 await page.keyboard.down('d');await page.locator('#open-bag').click();
 await expect(page.locator('#info-modal')).toBeVisible();
 expect((await inspect()).held).toEqual([]);
 await page.locator('#close-info').click();
 await expect(page.locator('#open-bag')).toBeFocused();
 const stopped=await inspect();await page.waitForTimeout(220);
 expect((await inspect()).player.x).toBe(stopped.player.x);
 await page.keyboard.up('d');
 if(testInfo.project.name!=='desktop'){
  await expect(page.locator('#stick')).toBeVisible();
  const box=await page.locator('#stick').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+35,box.y+box.height/2);await page.waitForTimeout(180);await page.mouse.up();
  expect((await inspect()).player.x).toBeGreaterThan(stopped.player.x+5);
  const button=await page.locator('#settings-btn').boundingBox();expect(button.width).toBeGreaterThanOrEqual(44);expect(button.height).toBeGreaterThanOrEqual(44);
 }
 await page.locator('#start-shift').click();
 await expect(page.locator('#phase-label')).toContainText('ĐANG LÀM VIỆC');
 expect((await inspect()).done).toBe(0);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
 expect(overflow).toBe(false);
 await page.screenshot({path:testInfo.outputPath('playing.png'),fullPage:true});
 expect(errors).toEqual([]);
});

test('all five roles complete a shift through real controls and advance days',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','The three viewport boot/input cases cover mobile separately');
 test.setTimeout(240000);
 // The default-renderer smoke above remains on AUTO/WebGL. Use the supported
 // Canvas fallback for long input scenarios on software-rendered CI workers.
 await page.goto('/game/preview-2d/?qa=1&canvas=1');
 await expect.poll(()=>page.evaluate(()=>Boolean(window.__yenQA?.inspect().player))).toBe(true);
 const inspect=()=>page.evaluate(()=>window.__yenQA.inspect());
 const walkTo=(x,y)=>walkActorTo(page,x,y);
 const paths={
  table:[[600,790],[482,790],[482,762]],
  plant:[[600,790],[190,790],[190,613]],
  counter:[[600,790],[790,790],[790,652],[990,652]],
  bench:[[600,790],[1040,790],[1040,768]],
  bike:[[600,790],[1040,790],[1040,809],[1283,809]],
  door:[[600,790],[535,790],[535,700]]
 };
 const tasks={barista:['counter','plant','counter'],waiter:['table','counter','bench'],
  shipper:['counter','bike','door'],guard:['door','table','bench'],cat:['plant','table','bench']};
 let day=1;
 for(const [role,stations]of Object.entries(tasks)){
  if(day>1)await page.locator('#open-preview').click();
  await page.locator('[data-role="'+role+'"]').click();await page.locator('#apply-model').click();
  await page.locator('#start-shift').click();
  let previous=[];
  for(const [index,id]of stations.entries()){
   console.log('Walkthrough',role,'task',index+1,id,JSON.stringify((await inspect()).player));
   for(const [x,y]of [...previous].reverse().slice(1))await walkTo(x,y);
   for(const [x,y]of paths[id])await walkTo(x,y);
   await expect.poll(async()=>(await inspect()).near).toBe(id);
   await page.locator('#interact').click();
   await expect.poll(async()=>(await inspect()).done,{timeout:8000}).toBe(index+1);
   if(role==='waiter'&&id==='table')await expect.poll(async()=>(await inspect()).details.find(d=>d.id==='cup').visible).toBe(false);
   if(role==='waiter'&&id==='bench')await expect.poll(async()=>Math.round((await inspect()).details.find(d=>d.id==='cushion').x)).toBe(1197);
   previous=paths[id];
  }
  await expect(page.locator('#finish-shift')).toBeEnabled();await page.locator('#finish-shift').click();
  await expect(page.locator('#result-tasks')).toHaveText('3/3');await page.locator('#next-day').click();
  day++;await expect(page.locator('#top-day')).toContainText('Ngày '+day+' ·');
  const reset=await inspect();expect(reset.phase).toBe('explore');
  expect(reset.details.find(d=>d.id==='cup').visible).toBe(true);
  expect(reset.details.find(d=>d.id==='book').angle).toBe(0);
  expect(reset.details.find(d=>d.id==='cushion').x).toBe(1168);
 }
 await page.screenshot({path:testInfo.outputPath('five-roles-day-six.png'),fullPage:true});
});

test('delegated artwork review evidence loads separately',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/game/preview-2d/art-reviews/table-v1/');
 await expect(page.getByRole('heading',{name:'Mẫu bàn v1 — Codex tự đánh giá'})).toBeVisible();
 await expect(page.locator('#review-scene canvas')).toBeVisible();
 await expect(page.locator('#review-scene')).toHaveAttribute('data-ready','true');
 await expect(page.locator('#review-error')).toBeHidden();
 await expect(page.locator('img')).toBeVisible();
 await expect.poll(()=>page.locator('img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
 expect(errors).toEqual([]);
});


test('painted detail reference board is readable and has no missing images',async({page},testInfo)=>{
 await page.goto('/game/preview-2d/art-reviews/details-v1/');
 await expect(page.getByRole('heading',{name:'Ly, sách và gối — đối chiếu v1'})).toBeVisible();
 const board=page.locator('#detail-proof');await expect(board).toBeVisible();
 expect(await board.evaluate(img=>img.naturalWidth)).toBe(1200);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:testInfo.outputPath('detail-proof.png'),fullPage:true});
});


test('counter layers, barista and brewing are visible through real controls',async({page},testInfo)=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/game/preview-2d/?qa=1&canvas=1');
 const inspect=()=>page.evaluate(()=>window.__yenQA.inspect());
 await expect.poll(async()=>Boolean((await inspect())?.player)).toBe(true);
 await page.locator('#apply-model').click();await page.locator('#start-shift').click();
 for(const [x,y]of [[600,790],[790,790],[790,652],[990,652]])await walkActorTo(page,x,y);
 await expect.poll(async()=>(await inspect()).near).toBe('counter');
 const before=await inspect(),front=before.props.find(p=>p.id==='counter');
 const actor=before.npcs.find(p=>p.id==='barista');
 expect(before.counterLayers.backDepth).toBeLessThan(actor.depth);
 expect(actor.depth).toBeLessThan(front.depth);
 expect(actor.y).toBe(570);expect(before.counterLayers.machine.texture).toBe('prop-machine-painted');
 expect(before.counterLayers.machine.x).toBe(1160);expect(before.counterLayers.machine.y).toBe(534);
 await page.locator('#interact').click();
 await expect.poll(async()=>(await inspect()).active).toBe(true);
 expect((await inspect()).counterLayers.steam.every(p=>p.visible)).toBe(true);
 await page.screenshot({path:testInfo.outputPath('counter-brewing.png'),fullPage:true});
 await expect.poll(async()=>(await inspect()).done,{timeout:8000}).toBe(1);
 expect((await inspect()).counterLayers.steam.every(p=>!p.visible)).toBe(true);
 await page.goto('/game/preview-2d/art-reviews/counter-v1/');
 await expect(page.getByRole('heading',{name:'Quầy và máy pha — đối chiếu v1'})).toBeVisible();
 await expect.poll(()=>page.locator('img').evaluate(img=>img.naturalWidth)).toBe(1200);
 await page.screenshot({path:testInfo.outputPath('counter-proof.png'),fullPage:true});
 expect(errors).toEqual([]);
});
