import { test, expect } from "@playwright/test";

const WIDTHS = [320, 360, 390, 768, 1440];

test("bốn ca chơi trọn từ chọn tình huống đến tổng kết và chơi lại", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/tinh-huong/");
  await expect(page.getByRole("heading", { name: "Hôm nay bạn trực ca nào?" })).toBeVisible();
  await expect(page.locator(".scenario-button")).toHaveCount(4);

  for (const scenario of ["nuoc-do", "do-uong", "mat-dien", "tre-nho"]) {
    await page.locator('[data-scenario="' + scenario + '"]').click();
    await expect(page.locator("#playing")).toBeVisible();
    for (let i = 0; i < 3; i++) {
      await expect(page.locator(".choice")).toHaveCount(3);
      await page.locator(".choice").first().click();
      await expect(page.locator("#consequence")).toBeVisible();
      await expect(page.locator("#impact")).not.toBeEmpty();
      await expect(page.locator(".choice")).toBeHidden();
      await page.locator("#continue").click();
    }
    await expect(page.locator("#ending")).toBeVisible();
    await expect(page.locator("#history-list li")).toHaveCount(3);
    await expect(page.locator("#lesson")).not.toBeEmpty();
    await page.locator("#replay").click();
    await expect(page.locator("#playing")).toBeVisible();
    await expect(page.locator(".choice")).toHaveCount(3);
    await page.locator("#leave").click();
    await expect(page.locator("#selector")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("phản hồi thay đổi theo lựa chọn, không cho chọn hai lần", async ({ page }) => {
  await page.goto("/tinh-huong/");
  await page.locator('[data-scenario="nuoc-do"]').click();
  const before = await page.locator("#stat-safety").inputValue().catch(() => null);
  await page.locator(".choice").nth(1).click();
  await expect(page.locator("#dialogue-line")).toContainText("suýt trượt");
  await expect(page.locator("#reason")).toContainText("Khăn");
  await expect(page.locator("#word-safety")).toHaveText("Đang khó");
  const after = await page.locator("#stat-safety").evaluate((p) => p.value);
  expect(Number(after)).toBeLessThan(65);
  expect(before).toBeNull(); // progress is not an input, so no false input-value assumption
  await expect(page.locator("#continue")).toBeEnabled();
  await page.locator("#continue").click();
  await expect(page.locator("#dialogue-line")).toContainText("Lối đi vẫn trơn");
});

test("phím 1–3, giảm chuyển động và quyền thoát hoạt động", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/tinh-huong/");
  await page.locator('[data-scenario="do-uong"]').click();
  await page.keyboard.press("1");
  await expect(page.locator("#consequence")).toBeVisible();
  await page.locator("#continue").click();
  await page.keyboard.press("3");
  await expect(page.locator("#consequence")).toBeVisible();
  await page.locator("#leave").click();
  await expect(page.locator("#selector")).toBeVisible();
  await expect(page.locator("#playing")).toBeHidden();
  const storage = await page.evaluate(() => ({
    local: localStorage.length, session: sessionStorage.length, cookie: document.cookie
  }));
  expect(storage).toEqual({ local: 0, session: 0, cookie: "" });
});

for (const width of WIDTHS) {
  test("không tràn ngang và nút dễ chạm tại " + width + "px", async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width >= 768 ? 900 : 800 });
    await page.goto("/tinh-huong/");
    await expect(page.locator(".scenario-button")).toHaveCount(4);
    await page.locator('[data-scenario="mat-dien"]').click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    const tooSmall = await page.locator('button:not([hidden])').evaluateAll((buttons) =>
      buttons.filter((button) => {
        const rect = button.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.height < 44;
      }).map((button) => button.textContent.trim())
    );
    expect(tooSmall).toEqual([]);
    await testInfo.attach("visual-novel-" + width, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  });
}
