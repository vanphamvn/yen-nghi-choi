# F04 interactive design prototype QA

Date: 19/11/2026. Independent reviewer: Codex QA agent (`reviewerType=agent`). Target: documentation prototype at `/docs/yen-lab/wireframes.html`, not the future `/lab/` exercise runtime.

## Automated browser contract

`tests/yen-lab-ux.spec.mjs`, run through `playwright.lab-ux.config.mjs`, exercises:

- Explicit need selection and the all-list path: at most two selections to a tool introduction; a visitor can also choose a tool directly without declaring a mood.
- Start, pause, resume, stop, reset, simulated completion and simulated error/retry. These are design state simulations, not physiological pacing or evidence of benefit.
- Keyboard Enter/Space, heading focus, back/forward returning to safe introduction rather than auto-running.
- Optional neutral “Không rõ” reflection, no cookies/localStorage/sessionStorage, no mood or reflection URL parameter and no non-GET/off-origin request during the tested flow.
- Emulated touch using actual Playwright `.tap()` at 360×800; separate desktop context at 1440×900. This does not represent a physical iPhone/Android test.
- Reduced-motion function availability and horizontal-overflow assertions at 320/360/390/768/1440 widths. Idle, active and completed screenshots are attached at each width, plus normal-motion desktop/mobile screenshots and failure traces.

The fixture server binds only to `127.0.0.1:4189`. The foundation GitHub workflow installs locked dependencies and runs the isolated prototype configuration. It uses runner Chrome when present (logging its actual version), otherwise installs Playwright Chromium. The Playwright run is sharded across parallel jobs; browser evidence is uploaded per shard as `yen-lab-ux-browser-evidence-shard-<n>` (smoke: `yen-lab-smoke-browser-evidence`).

## Actual local results

Independent final-source inspection: selectors and state transitions match the browser contract; controls use native links/buttons, intro navigation moves focus to its heading, stop is a direct action, history restores safe intro, filters are explicit and reset on return, and source contains no storage/network/clinical timer. The result offers neutral and skip choices. The three sample tools remain clearly labeled prototype content. No blocking editorial or semantics defect found by this source inspection; visual correctness remains a separate browser check.

- `node --check tests/yen-lab-ux.spec.mjs` — passed.
- `node --check playwright.lab-ux.config.mjs` — passed.
- `node --check tools/serve-lab-ux.mjs` — passed.
- Local runtime Playwright package is present, but its configured Chromium executable is absent. Browser tests were not run locally. A syntax check is not a browser pass.

## CI browser result

Root agent verified the actual logs for [PR #166](https://github.com/vanphamvn/yen-nghi-choi/pull/166), tested head `b0ce329bdcef62d88b688d81e544e0262ba7bb66`: [run 44476258938, job 135397445725](https://github.com/vanphamvn/yen-nghi-choi/actions/runs/44476258938/job/135397445725). Foundation contract passed; Google Chrome `157.0.8103.50` ran **10 tests, all passed in 24.2 seconds**. This comprises five tests per desktop/emulated-touch project, including actual Playwright `.tap()` calls at 360×800. The configured screenshot captures cover idle/active/completed states at the five widths; the workflow preserves browser evidence as an artifact. These results concern the isolated documentation prototype, not a physical device or production exercise.

## Preview browser walkthrough

Root agent performed and reported actual CUA walkthrough and screenshot inspection on [Netlify preview #166](https://deploy-preview-166--yencafeday.netlify.app/docs/yen-lab/wireframes.html) at 1440×900 and 360×800 for the same tested PR head:

- Selected the body need and then the breathing tool introduction in two clicks; exercised start, pause, resume, stop, neutral “Không rõ” reflection and reset.
- Opened the small-things tool directly with Enter; started with Space and completed the simulated flow. Tested error/retry returning to the introduction and observed heading focus.
- Inspected screenshots at both viewport sizes. At 360px viewport width, measured document `scrollWidth=345`, indicating no horizontal overflow in that inspected state.

The preview provider attempted to inject its drawer iframe from `app.netlify.com`; the prototype CSP blocked it. This provider-preview behavior is outside the prototype source and is not a production privacy assurance. Local fixture privacy assertions passed in CI; production network behavior remains a later gate.

## Remaining release limits

F04's design-source, automated browser and preview walkthrough evidence is recorded above. Final merge SHA and post-merge CI remain to be reconciled. Physical-device touch, VoiceOver/TalkBack and later production `/lab/` behavior remain unverified. No health-effect, production deployment, clinician approval or owner signoff is asserted by this report.
