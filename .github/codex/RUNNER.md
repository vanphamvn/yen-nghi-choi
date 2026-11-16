# Yên coding runner

The runner uses the official Codex GitHub Action on ephemeral Ubuntu workers.
After the existing main-branch CI and production-content gate passes, it selects
an eligible engineering task, implements one slice, validates a restricted diff,
opens a draft PR and explicitly dispatches game CI on that branch. It pauses while
any autopilot/game-* PR is open. It does not auto-approve artwork or merge its PR.
Merging an accepted slice and passing production verification starts the next one.
There is no hourly/daily schedule or self-triggering commit loop.

## Activate

1. In repository Settings > Secrets and variables > Actions, add the repository
   secret OPENAI_API_KEY. Use an OpenAI project key with a spending limit. API use
   is billed to that project; it does not use this chat session's credentials.
2. In Settings > Actions > General > Workflow permissions, allow GitHub Actions
   to create pull requests. The publish job requests contents/pull-requests write;
   Codex itself receives a read-only repository token.
3. Open Actions > Game 2D coding runner > Run workflow on main. Leave plan_only
   false to code; set it true for a credential-free readiness check.

Automatic continuation is enabled by default once a valid key exists. To pause
automatic coding, set repository variable GAME_CODING_PAUSED=true, disable the
workflow, or remove the key. Manual plan-only checks remain available. Existing
PRs, missing key, changed main, blocked tasks or out-of-scope edits stop publication
with a clear job summary. No credential values are logged or stored in artifacts.

## Evidence and limits

Each coding run has a 25-minute timeout and publishes at most one draft PR. The
read-only validation job checks syntax, the existing game suite, art provenance and
roadmap validity. A fresh publish worker uses trusted scripts from main, rejects
non-regular/deleted/out-of-scope files and checks that main has not moved. The
agent's token cannot publish. Generated patch artifacts expire after one day.

Draft status is deliberate: inspect the implementation and CI before marking
ready and merging under repository rules. Production verification runs after the
merge. Real browser/mobile QA, art signoff and provider SHA evidence remain separate
requirements. Workflow timeout is not a monetary cap; use OpenAI project spend
controls. This setup does not create API keys or alter billing.
