import { test, expect } from "@playwright/test";

const widths = [320, 360, 390, 768, 1440];
for (const width of widths) {
  test("painted art scale reference at " + width + "px has no missing image, overflow or crop error", async ({ page }, testInfo) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await page.goto("/tinh-huong/art-reference/");
    await expect(page.getByRole("heading", { name: "Vẽ cùng một thế giới." })).toBeVisible();
    await expect(page.locator(".stage")).toHaveCount(2);
    await expect(page.locator(".status")).toContainText("Owner visual review pending");
    const details = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      images: [...document.querySelectorAll("img")].map(img => ({
        src: img.getAttribute("src"), loaded: img.complete && img.naturalWidth > 0
      })),
      stages: [...document.querySelectorAll(".stage")].map(el => {
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height, ratio: r.width / r.height };
      }),
      mascot: [...document.querySelectorAll(".stage .buddy")].map(el => {
        const r = el.getBoundingClientRect();
        const p = el.closest(".stage").getBoundingClientRect();
        return { contained: r.left >= p.left && r.right <= p.right && r.top >= p.top && r.bottom <= p.bottom };
      })
    }));
    expect(errors).toEqual([]);
    expect(details.overflow).toBe(false);
    expect(details.images.every(img => img.loaded), JSON.stringify(details.images)).toBe(true);
    expect(details.stages[0].ratio).toBeGreaterThan(1.4);
    expect(details.stages[1].ratio).toBeCloseTo(0.75, 1);
    expect(details.mascot.every(m => m.contained)).toBe(true);
    await testInfo.attach("yen-painted-art-reference-" + width, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png"
    });
  });
}
