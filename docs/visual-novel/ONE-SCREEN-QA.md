# Một Tháng Không Yên · single-viewport QA (21/11/2026)

**Scope:** Day 1 at \`/tinh-huong/campaign/\`; responsive dialogue visual novel, three incidents and the end-of-day debrief.

## Product rule

One incident, one viewport. No scroll-to-answer or scroll-to-continue. On narrow portrait displays the illustrated scene is above dialogue/answers; on desktop and phone landscape it is beside them. There are no object hotspots. Results replace answer controls in the same area; they do not push content down the page.

CSS: \`tinh-huong/campaign/one-screen.css\`. End-of-day report retains three concise consequences but removes the long expandable decision history from the screen. Data in memory remains unchanged.

## Independent verification while GitHub Actions runner was unavailable

- Verified Netlify Preview \`https://deploy-preview-236--yencafeday.netlify.app/tinh-huong/campaign/\` responded HTTP 200.
- **Real headless Chrome 158** (Playwright browser in a short-lived Vercel Sandbox): stepped through opening, choice, consequence and next incident, from D01-01 to D01-03 to debrief at **320×480, 320×568, 360×640, 390×844, 414×736, 667×375, 812×375, 768×1024, 1366×768 and 1440×900**.
- A first pass detected a third answer cut off at 320×480 and 812×375. Fixed these with \`max-height: 520px\` portrait and \`max-height: 500px\` landscape media queries, **without reducing button height below 44px**.
- A repeated live browser run across all ten sizes and the seven major transitions (before choices, three resolutions, three advances, including debrief) reported **zero viewport-boundary / document-scroll failures**. This is *spatial* and interaction QA, not subjective artwork approval.
- Independently downloaded the exact deployed JS/JSON/test sources from Netlify Preview and executed five suites with Node.js 24: **26 tests passed, 0 failed**, covering Day 1 choices and flags, engine states, visual asset manifest, roadmap integrity and legacy interaction regression.
- Captured real browser screenshots at 320×480, 390×844 and 812×375 in the isolated QA VM. The screenshot bytes could not be transferred back through the connector for human visual inspection; do not call this an owner art approval.
- All Day 1 artwork is composited from existing Yên painted materials. New unique background paintings are a separate art task.

## CI limitation

GitHub Actions runs initiated on PR #236 failed within seconds at the runner/job infrastructure stage, before recorded test steps and without usable job logs. This is **not** a green GitHub Actions result. Automated tests are in the PR and should rerun when hosted runners are available. Netlify and Vercel preview deployment statuses were separately confirmed successful at the last tested commit. Independent browser + Node checks do not remove the need for restored GitHub Actions checks.

## Local repro

\`\`\`sh
node --test tests/yen-campaign-day01.test.mjs tests/yen-campaign-engine.test.mjs tests/yen-visual-novel-roadmap.test.mjs tests/yen-visual-art.test.mjs tests/yen-scene-mechanics.test.mjs

LAB_UX_CHROMIUM_PATH=/path/to/chrome npx playwright test --config playwright.yen-day01.config.mjs
\`\`\`

The browser suite includes true element-bound assertions, minimum 44px answer-button heights, nine-plus real phone/tablet/desktop viewports, choice-result-debrief routing, and the dangerous floor-spill recovery branch. No analytics, new persistent state, or external runtime dependency was added to the game.
