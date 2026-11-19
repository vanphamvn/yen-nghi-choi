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

The fixture server binds only to `127.0.0.1:4189`. The foundation GitHub workflow installs locked dependencies and runs the isolated prototype configuration. It uses runner Chrome when present (logging its actual version), otherwise installs Playwright Chromium. Browser evidence is uploaded as `yen-lab-ux-browser-evidence`.

## Actual local results

Independent final-source inspection: selectors and state transitions match the browser contract; controls use native links/buttons, intro navigation moves focus to its heading, stop is a direct action, history restores safe intro, filters are explicit and reset on return, and source contains no storage/network/clinical timer. The result offers neutral and skip choices. The three sample tools remain clearly labeled prototype content. No blocking editorial or semantics defect found by this source inspection; visual correctness remains a separate browser check.

- `node --check tests/yen-lab-ux.spec.mjs` — passed.
- `node --check playwright.lab-ux.config.mjs` — passed.
- `node --check tools/serve-lab-ux.mjs` — passed.
- Local runtime Playwright package is present, but its configured Chromium executable is absent. Browser tests were not run locally. A syntax check is not a browser pass.

## Remaining evidence

CI execution/results, screenshots and root-agent browser walkthrough must be recorded against the actual PR commit before completing F04. Physical-device touch, VoiceOver/TalkBack and later production `/lab/` behavior remain unverified. No health-effect, responsive visual approval, production deployment or owner signoff is asserted by this report.
