# Implement one Yên 2D engineering slice

Read AGENTS.md, .agents/skills/yen-game-director/SKILL.md,
.agents/skills/yen-game-release/SKILL.md, game/preview-2d/ROADMAP.md,
game/preview-2d/ops/roadmap.json and runner-task.json.

Implement one small, useful, testable change for the selected task. If that task
needs unavailable provider access, choose another eligible engineering task from
the same roadmap and explain the blocker in your final report. Never invent
deployment evidence or mark a milestone done. Do not stop at planning when a safe
implementation exists. Preserve the Phaser 2D game and all five playable roles.

Allowed changes: game/preview-2d/game.js, style.css, index.html, tests/*.test.mjs
and root tests/game-2d*.test.mjs. Do not edit assets, workflows, tools, skills,
AGENTS.md, roadmap state, hosting configuration, licenses, dependencies or secrets.
Do not delete files. Do not weaken existing tests, assertions or style policy to
make CI pass. Do not generate or approve art. No storage, tracking or paid services.

Run node --check game/preview-2d/game.js and the existing game test suite. Add a
meaningful regression test when changing behavior. Keep the diff under 20 files
and 1200 changed lines. Do not commit, push, merge, deploy or call GitHub APIs;
trusted later jobs handle publication. Leave only the intended source/test edits.

In your final response state the chosen milestone/issue, player-visible change,
tests actually run, remaining blockers and a short manual test scenario. State
clearly that a PR is not a verified production release.
