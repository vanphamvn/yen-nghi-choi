# LAB-F14 · Catalog of the twenty games

Issue: [#138](https://github.com/vanphamvn/yen-nghi-choi/issues/138) · Epic [#124](https://github.com/vanphamvn/yen-nghi-choi/issues/124) · Milestone M4.

## What it is

[`ops/catalog.json`](ops/catalog.json) is the one list of all twenty Yên Lab games. Each entry has:

- `key` (G01–G20), `id` and `title` (the Vietnamese name used everywhere).
- `route`: the stable deep link `/lab/<id>/`. It is reserved now, so it never changes when a planned game opens.
- `status`, one of:
  - `planned`: no page yet.
  - `beta`: released through a Lab beta gate.
  - `live`: passed the full-catalog gate, [#139](https://github.com/vanphamvn/yen-nghi-choi/issues/139).
- `category`: body, attention, thoughts, feelings or kindness.
- `duration` and `evidenceTier`, copied exactly from the [EVIDENCE.md twenty-tool matrix](EVIDENCE.md#twenty-tool-matrix).
- `caution`: the main discomfort to design around.
- `issue`.
- `review`: the game's own review doc. Only released games have one.
- `module` and `stylesheet`: the only code the game's page loads.
- `releasedIn`: the gate that released it.

It is data for people and checks only. **No page loads it**, so it costs nothing on the homepage or in the Lab. The book menu stays hand-written, static HTML so it works without JavaScript. The owner's no-UI-chrome rule still holds: the catalog adds no filter, tag or "all games" screen.

Today: 6 open (G01, G02, G05, G07, G09, G14, all `beta`) and 14 `planned`. The five `deferred` games (G10, G11, G12, G16, G17) cannot be opened until their research blocker is resolved in EVIDENCE.md; the checker enforces this.

## What keeps it honest

`node tools/check-yen-lab-catalog.mjs` runs in the foundation CI job. It fails when any of these happens:

- **IDs:** a key, id, title or route is duplicated, or a route is not `/lab/<id>/`.
- **Roadmap:** a title, issue or open/planned state disagrees with `ops/roadmap.json` (a game is open exactly when its ticket is done).
- **Evidence matrix:**
  - A title, duration or evidence tier differs from the EVIDENCE.md row.
  - A `deferred` game is open.
  - An entry uses blanket proof wording ("khoa học chứng minh", "proven", "clinically").
- **Planned games:** a planned game has a folder in `lab/`.
- **Open games:** an open game's page:
  - has a different `<h1>` or `<title>`;
  - loads any script other than its own module, or imports another game's folder (the shared `/lab/engine.mjs` is allowed);
  - lacks its `<noscript>` text, its "về góc ngồi chơi" link, a "bắt đầu" that stays disabled until the module runs, or the slow-load note;
  - lacks `data-loading` on `<main class="game">`, or its module does not remove it.
- **Lab folder:** a folder in `lab/` (other than `assets`) is not an open catalog game.
- **Book menu:**
  - Its links, no-JavaScript list, released count or screen-reader status line differ from the open games.
  - An inert "is-soon" line is not a planned catalog title.
- **Cục Yên:** a suggestion links to anything but an open game under its catalog title.
- **Homepage:** it references the catalog or a game module.
- **404 fallback:** the `/lab/*` rule is missing, or `lab/404.html` has a script or no way back.

Mutation checks that failed with the right message, 20/11/2026:

- a book title off by a word;
- a fake "is-soon" line;
- a wrong released count;
- a game missing from the no-JavaScript list;
- Cục Yên linking to a planned route;
- an evidence tier changed from deferred;
- another game's module added to a page;
- a folder created for a planned game.

## What a guest meets

- **A planned game's link, or any unknown `/lab/` address:**
  - Netlify's `/lab/* → /lab/404.html` rule returns status 404 with a Lab page: "Góc này chưa mở", Cục Yên, and "về góc ngồi chơi". It has no script and no fake game.
  - The rule is not forced, so every real file and folder still wins.
  - The local test server mirrors the rule.
  - `vercel.json` has no such rule; that deployment is blocked, and its misses fall back to the site 404.
- **Slow or broken game module:**
  - Each game page starts with `data-loading` on `<main class="game">`, and its module removes it once it has run.
  - While the marker is there, "bắt đầu" stays disabled. After 1.5 s, a quiet note appears: "Trò đang mở ra. Lâu quá thì về góc ngồi chơi rồi quay lại sau nhé."
  - The exit link is plain HTML and works without the module. The note disappears when the module runs.
  - Until it shows, the note takes no space (no jump on a normal load) and is visibility-hidden (screen readers skip it). It appears in one discrete step, not motion, so it also shows under reduced motion.
  - It is keyed to the marker, not to a disabled "bắt đầu": Căng rồi thả turns "bắt đầu" off on purpose when no body part is chosen, and that is not loading.
  - The note is not a live region, so a slow load stays silent for screen readers. That is a deliberate choice to keep the room quiet; the exit link is always reachable.
- **No JavaScript:** each game's `<noscript>` explains what to do by hand and links back. The slow-load note is hidden (`@media (scripting: none)`), so it never promises a game that cannot open.

`tests/yen-lab-catalog.spec.mjs` covers these in the browser:

- each open game's deep link and the scripts it requests;
- no JavaScript;
- a held module (the slow network case);
- Căng with every part unticked (no false "đang mở ra");
- an aborted module;
- every planned route returning 404;
- an unknown address;
- the homepage loading neither the catalog nor any game.

## Review · 20/11/2026

Independent agent review (`reviewerType=agent`, no owner signoff): no P0.

- **P1, fixed:** the first version keyed the note to a disabled "bắt đầu", so Căng with no part chosen said "đang mở ra" on a loaded game. It now uses the `data-loading` marker. The regression test fails against the old selector.
- **P2s, fixed:**
  - The layout jump on a normal load: the note now takes no space until it shows.
  - The narrow claim-wording scan: it now covers more words, plus the 404 page and the note copy.
  - The netlify.toml rule check depended on line order and spacing; it no longer does.
- **P2s, accepted:**
  - The note is not announced to screen readers (see above).
  - Older browsers without `@media (scripting: none)` may show the note under the `<noscript>` text when JavaScript is off.
  - `vercel.json` has no Lab 404 rule (the Vercel deployment is blocked; Netlify is production).
  - Only the deployed smoke run proves the real Netlify rule.

## Adding a game later

1. Keep its catalog `id` and `route`, and create `lab/<id>/index.html`, `<id>.mjs` and `<id>.css` with the game-screen contract.
2. Set `status` to `beta`, then fill `module`, `stylesheet`, `review` and `releasedIn`.
3. Mark its roadmap ticket done.
4. Add it to the book, the no-JavaScript list and the released count.
5. Run the checker: it fails until all of these agree.
