import {test,expect} from '@playwright/test';

test('boot, role selection, focus, movement and mobile controls',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/game/preview-2d/?qa=1');
 await expect(page.locator('#scene canvas')).toBeVisible();
 await expect(page.locator('#load-error')).toBeHidden();
 await expect(page.locator('#model-modal')).toBeVisible();
 await page.locator('#apply-model').focus();await page.keyboard.press('Tab');
 await expect(page.locator('#close-modal')).toBeFocused();
 await page.keyboard.press('Shift+Tab');await expect(page.locator('#apply-model')).toBeFocused();
 await page.locator('[data-role="waiter"]').click();await page.locator('#apply-model').click();
 await expect(page.locator('#overlay')).toBeHidden();await expect(page.locator('#role-label')).toHaveText('Phục vụ');
 const inspect=()=>page.evaluate(()=>window.__yenQA.inspect());
 const start=await inspect();
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
