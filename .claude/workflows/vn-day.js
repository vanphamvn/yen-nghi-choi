export const meta = {
  name: 'vn-day',
  description: 'Build one day (3 incidents) of the 30-day visual novel: script, continuity review, art gaps, wiring, staging, independent QA with fix loop, optional release',
  whenToUse: 'Run by the vn-coordinator skill for one eligible day slice from tools/vn-next-work.mjs. Args: {day, ticket, issue, release?}',
  phases: [
    { title: 'Script', detail: 'vn-story-writer writes days/dayNN.mjs; vn-continuity-editor reviews; up to 2 fix rounds' },
    { title: 'Art + wiring', detail: 'vn-art-director gap analysis and briefs, vn-engine-dev wires the day (different files, in parallel)' },
    { title: 'Staging', detail: 'vn-scene-stager places the day in scene-composition.mjs' },
    { title: 'QA', detail: 'vn-qa checks every incident against roadmap section 8; failures go back to the owning role, up to 2 rounds' },
    { title: 'Release', detail: 'vn-release opens the PR, follows CI, merges and verifies production (only with release: true)' },
  ],
}

const a = args || {}
if (!a.day || !a.ticket || !a.issue) throw new Error('vn-day needs args {day, ticket, issue}')
const NN = String(a.day).padStart(2, '0')
const BRANCH = `vn/d${NN}`
const DAYFILE = `tinh-huong/campaign/days/day${NN}.mjs`
const CTX = `Epic #218, ticket ${a.ticket} (#${a.issue}), Day ${NN}. Repo: the current checkout of vanphamvn/yen-nghi-choi. ` +
  `Work only on branch ${BRANCH}. Incident ids D${NN}-01..D${NN}-03.`

const REVIEW = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['pass', 'fix'] },
    findings: { type: 'array', items: { type: 'object', properties: {
      incident: { type: 'string' }, where: { type: 'string' }, problem: { type: 'string' },
      fix: { type: 'string' }, blocking: { type: 'boolean' },
    }, required: ['incident', 'problem', 'fix', 'blocking'] } },
  },
  required: ['verdict', 'findings'],
}
const QA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['pass', 'fail'] },
    report: { type: 'string', description: 'path of docs/visual-novel/qa/dNN/report.md' },
    findings: { type: 'array', items: { type: 'object', properties: {
      incident: { type: 'string' }, problem: { type: 'string' }, evidence: { type: 'string' },
      owner: { type: 'string', enum: ['vn-story-writer', 'vn-scene-stager', 'vn-art-director', 'vn-engine-dev'] },
      blocking: { type: 'boolean' },
    }, required: ['incident', 'problem', 'owner', 'blocking'] } },
  },
  required: ['verdict', 'report', 'findings'],
}
const blockingOf = (r) => (r && r.findings ? r.findings.filter((f) => f.blocking) : [])

// ---- Script ------------------------------------------------------------------------------------
phase('Script')
let script = await agent(
  `${CTX}\nFirst: git fetch origin && git switch ${BRANCH} 2>/dev/null || git switch -c ${BRANCH} origin/main.\n` +
  `Write ${DAYFILE} for Day ${NN} following your role instructions.`,
  { agentType: 'vn-story-writer', label: `write D${NN}`, phase: 'Script' })

let review = null
for (let round = 1; round <= 3; round++) {
  review = await agent(`${CTX}\nReview ${DAYFILE}. Writer's report:\n${script}`,
    { agentType: 'vn-continuity-editor', schema: REVIEW, label: `continuity D${NN} r${round}`, phase: 'Script' })
  const blocking = blockingOf(review)
  if (!blocking.length) break
  if (round === 3) {
    log(`Day ${NN}: ${blocking.length} blocking continuity findings left after 2 fix rounds, stopping before art.`)
    return { day: a.day, stoppedAt: 'continuity', findings: blocking }
  }
  script = await agent(`${CTX}\nFix these blocking review findings in ${DAYFILE}, nothing else:\n${JSON.stringify(blocking, null, 1)}`,
    { agentType: 'vn-story-writer', label: `fix D${NN} r${round}`, phase: 'Script' })
}

// ---- Art gaps and wiring: disjoint files, so they run side by side ---------------------------
phase('Art + wiring')
const [art, wiring] = await parallel([
  () => agent(`${CTX}\nDo the art gap analysis and briefs for Day ${NN} (script in ${DAYFILE}). Script report:\n${script}`,
    { agentType: 'vn-art-director', label: `art D${NN}`, phase: 'Art + wiring' }),
  () => agent(`${CTX}\nWire ${DAYFILE} into the campaign (introduce days/index.mjs if it does not exist yet) and add/extend ` +
    `tests so Day ${NN} is covered by the engine tests, path fuzz and a Playwright flow. Do not change episodes.json statuses. ` +
    `Requests from the writer:\n${script}`,
    { agentType: 'vn-engine-dev', label: `wire D${NN}`, phase: 'Art + wiring' }),
])

// ---- Staging -----------------------------------------------------------------------------------
phase('Staging')
let staging = await agent(`${CTX}\nStage Day ${NN}. Art director's result:\n${art}\nEngine wiring result:\n${wiring}`,
  { agentType: 'vn-scene-stager', label: `stage D${NN}`, phase: 'Staging' })

// ---- QA with routed fixes --------------------------------------------------------------------------
phase('QA')
let qa = null
for (let round = 1; round <= 3; round++) {
  qa = await agent(`${CTX}\nQA Day ${NN} (round ${round}). Write docs/visual-novel/qa/d${NN}/report.md.`,
    { agentType: 'vn-qa', schema: QA, label: `qa D${NN} r${round}`, phase: 'QA' })
  const blocking = blockingOf(qa)
  if (qa && qa.verdict === 'pass' && !blocking.length) break
  if (round === 3) break
  // One fixer per owning role, run one after another: stager and writer may both need scene-composition context.
  const owners = [...new Set(blocking.map((f) => f.owner))]
  for (const owner of owners) {
    const mine = blocking.filter((f) => f.owner === owner)
    await agent(`${CTX}\nFix these QA findings that are yours, only in files you own:\n${JSON.stringify(mine, null, 1)}`,
      { agentType: owner, label: `fix ${owner.replace('vn-', '')} D${NN} r${round}`, phase: 'QA' })
  }
}

const qaPassed = qa && qa.verdict === 'pass' && !blockingOf(qa).length
if (!qaPassed) {
  log(`Day ${NN}: QA still failing after 2 fix rounds. Not releasing.`)
  return { day: a.day, stoppedAt: 'qa', report: qa && qa.report, findings: blockingOf(qa) }
}

// ---- Release (opt-in) ------------------------------------------------------------------------------------
if (!a.release) {
  log(`Day ${NN}: QA passed. release=false, so the branch ${BRANCH} is left for the coordinator.`)
  return { day: a.day, stoppedAt: 'ready-for-pr', branch: BRANCH, report: qa.report }
}
phase('Release')
const release = await agent(`${CTX}\nShip Day ${NN}. QA report: ${qa.report}. Pack issue #${a.issue}.`,
  { agentType: 'vn-release', label: `release D${NN}`, phase: 'Release' })
return { day: a.day, stoppedAt: 'released', branch: BRANCH, report: qa.report, release }
