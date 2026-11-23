---
name: vn-coordinator
description: Coordinate the 30-day visual-novel epic (#218) - pick eligible work with tools/vn-next-work.mjs, run one day slice through the vn-day workflow, run engine tickets beside it, reconcile status. Use for "continue the visual novel", "build the next day", "work on #218".
---

# Visual novel coordinator for Claude Code

**Required first step:** read the canonical skill at `../../../.agents/skills/vn-coordinator/SKILL.md` and follow it.
This file is only the Claude Code entry point so Codex and Claude Code do not drift.

Claude Code specifics:
- Role agents: `.claude/agents/vn-story-writer.md`, `vn-continuity-editor.md`, `vn-art-director.md`,
  `vn-scene-stager.md`, `vn-engine-dev.md`, `vn-qa.md`, `vn-release.md`.
- Day pipeline: the saved workflow `.claude/workflows/vn-day.js`, run with the Workflow tool
  (`name: "vn-day"`, `args: {day, ticket, issue, release}`).
- Engine tickets: Agent tool with `subagent_type: "vn-engine-dev"` and `isolation: "worktree"`.
