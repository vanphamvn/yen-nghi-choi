import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../workflows/game-2d-coding-runner.yml', import.meta.url), 'utf8');
test('archived Phaser runner cannot automatically develop or call a paid model', () => {
  const triggers = workflow.split('\non:\n')[1]?.split('\npermissions:')[0];
  assert.ok(triggers, 'workflow trigger block is present');
  assert.match(triggers, /^  workflow_dispatch:\s*$/m);
  assert.doesNotMatch(triggers, /^  (push|pull_request|workflow_run|schedule|repository_dispatch):/m);
  assert.doesNotMatch(workflow, /codex-action|OPENAI_API_KEY|gh pr create|git push|workflow run|permissions:\s*write/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /issues\/124/);
});
