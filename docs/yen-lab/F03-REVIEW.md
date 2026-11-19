# F03 · Research foundation review

Issue: [#127](https://github.com/vanphamvn/yen-nghi-choi/issues/127). Review date: **19/11/2026**.
Reviewers: **Codex coordinator** and independent **source_review** agent; `reviewerType=agent`. No clinician or owner signoff.

## Reviewed scope

Read current main EVIDENCE.md, SAFETY.md, UX.md and wireframes.html against the issue acceptance criteria. Source/claims review concerns the underlying research and proposed text. No custom tool has been validated, and completing this document does not approve a per-tool implementation or release.

### Source access and factual checks

| Source | Actual access/review result | Accepted use and limit |
|---|---|---|
| [S1 breathing review](https://www.nature.com/articles/s41598-022-27247-y) / [required PubMed](https://pubmed.ncbi.nlm.nih.gov/36624160/) | Publisher text and indexed PubMed abstract matched; direct PubMed rendering was footer-only. | 12 stress RCTs/785 adults, moderate bias; no universal rhythm, effective single-visit duration or game claim. |
| [S2 PMR review](https://pubmed.ncbi.nlm.nih.gov/38322293/) | Readable PubMed abstract; identity/full-text link matched. | 46 publications/>3,402 adults. Review cannot approve the exact short G02 movements; routine remains deferred. |
| [S3 gratitude review](https://pmc.ncbi.nlm.nih.gov/articles/PMC10393216/) / [required PubMed](https://pubmed.ncbi.nlm.nih.gov/37585888/) | PMC/indexed abstract matched; direct PubMed footer-only. | 64 randomized trials; high bias and low/very-low certainty noted, no immediate improvement promise. |
| [S4 NCCIH](https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety) | Readable official content, including incomplete safety evidence and possible adverse experiences. | Contextual source only for creative variants; not proof of sand/cloud/one-minute game effects. |
| [S5 respiration trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947/) | NIH/PMC record verified independently. | Five minutes daily for about a month; protocol-specific breathing/retention arms do not validate Yên pacing. |
| [S6 gratitude experiments](https://pubmed.ncbi.nlm.nih.gov/12585811/) | Readable abstract, weekly/daily records and clinical-population distinction checked. | Repeated practice differs from three optional text boxes. |
| [S7 defusion experiment](https://pubmed.ncbi.nlm.nih.gov/20689153/) | Indexed primary abstract verified; nonclinical undergraduates and randomized conditions matched. | No animated leaves validation; exact dose stays unextracted. |
| [S8 affect labeling](https://pubmed.ncbi.nlm.nih.gov/17576282/) | PubMed bibliographic identity verified by independent reviewer; coordinator retrieval was partial, abstract/protocol not fully extracted. | Laboratory task, not a personal anger-relief trial; exact dose unextracted. |
| [S9 self-compassion](https://pubmed.ncbi.nlm.nih.gov/24691680/) | Independent primary-record search verified 52 female students, three meetings/three weeks, time-management control. | Not equivalent to a single kind sentence; direct PubMed partial. |
| [S10 nature walk](https://pubmed.ncbi.nlm.nih.gov/26124129/) | Independent NIH/publisher-record search verified healthy adults and 90-minute real walk. | Not equivalent to a screen forest; direct PubMed partial. |
| [S11 writing record](https://pubmed.ncbi.nlm.nih.gov/3745650/) | Bibliographic identity verified; protocol and safety not sufficiently extracted. | G10 remains deferred. No accepted dose or efficacy claim. |

No observed retrieval was a reported 404. Some URLs exposed only partial content, so this is **not** a universal direct HTTP-status check, full-text review of every paper, systematic search or certainty certification. The direct publisher/PMC alternatives are retained where available.

## Findings resolved

1. Added a direct research/official URL and explicit checked date to each of the 20 tool rows. Context-only references are labeled as such; they do not upgrade an exploratory/deferred row.
2. Independent peer found that gratitude bias/certainty was under-emphasized. S3 and G14 now explicitly mention high risk of bias and low/very-low certainty.
3. Clarified that F03 completion is the foundation matrix disposition, while exact protocol, privacy, UI and release gates remain mandatory. G02 and deferred G10/G11/G12/G16/G17 are not publication-ready.
4. SAFETY.md specifies a short detail disclaimer, method limitations disclosure and visible technique-specific caution beside start, preserving clear stop/skip controls.

## Claims comparison

Main source `index.html` had no `/lab/` link and no matches for the Vietnamese clinical/evidence terms checked (`khoa học`, `chứng minh`, `điều trị`, `chẩn đoán`, `kiểm chứng`). This source scan is scoped to Lab-related copy and is not a browser/production audit.

Proposed UX/wireframe copy includes the game-effect limitation, no forced breath holding, stop-if-dizzy/air-hungry/uncomfortable, own-pace/observation option, optional feedback with “Không rõ” and “Bỏ qua”. Muscle guidance stops at discomfort and avoids injured areas/holding breath. Sand, clouds and doing nothing remain exploratory. The selected breathing duration/cycle count is a product choice, not a clinically established dose.

## Actual browser editorial check

Root agent opened `https://yencafeday.netlify.app/docs/yen-lab/wireframes.html` on 19/11/2026 at a 1440×900 viewport and visually inspected its 360×800 mobile frame and state mockups. Enter on the actual “Mở bài thực hành” anchor navigated to `#intro`. The inspected copy includes gentle breathing/no hold, stop-if-dizzy/air-hungry wording, own pace/observation, neutral completion, “Không rõ”/“Bỏ qua” and the unvalidated short-adaptation limitation. Controls remain static labels; this is actual browser editorial evidence, not functional exercise, real touch/device, clinical or production-revision validation. F04's remaining walkthrough gate is separate.

## Actual checks and handoff

- Coordinator ran `node tools/check-yen-lab-foundation.mjs`: PASS, 37 unique tasks, acyclic dependencies, valid gates and required docs.
- Additional row check: exactly 20 tool rows, unique G01–G20, each with direct URL/date, consistent six-column table and no replacement characters.
- Independent source_review agent completed source identity and planned-copy editorial review on 19/11/2026; final edited-doc review approved readiness, with the material certainty finding addressed.
- PR/CI/merge evidence must be appended by the integrating agent before closing #127. No new runtime source, functional exercise QA, privacy/network inspection or production deployment is asserted.
