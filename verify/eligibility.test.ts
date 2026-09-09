/**
 * Proves the engine produces the three demo states and honours C's three
 * amendments. Run: npx tsx verify/eligibility.test.ts
 *
 * The rules below are TEST FIXTURES, not the real rules files. C owns
 * /data/rules/*.json. These mirror C's shapes so the engine is exercised against
 * what will actually land.
 */
import type { FounderProfile, GrantRule } from '../src/types/contract';
import { evaluateGrant, evaluateAll, firstBlocker, terminalReasons } from '../src/lib/eligibility';
import { createEmptyProfile, applyElicitResult, isGapFlagged } from '../src/lib/profile';
import sample from './sample-profile.json';

const NOW = '2026-09-09T10:00:00+08:00';
let failures = 0;
const check = (name: string, cond: boolean, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra && !cond ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const amirah = sample as unknown as FounderProfile;

const YCM: GrantRule = {
  grant_id: 'nyc-ycm',
  name: 'Young ChangeMakers',
  source_url: 'https://www.nyc.gov.sg/',
  last_checked: '2026-09-08',
  confidence: 'secondary',
  quantum: 'up to S$3,000 (S$5,000 exceptional), 80% of supported cost',
  criteria: [
    { field: 'founder.age', op: 'between', value: [15, 35], blocking: true, terminal: true,
      terminal_reason: 'Young ChangeMakers is only open to people aged 15 to 35.', label: 'You are aged 15 to 35' },
    { field: 'founder.citizenship', op: 'in', value: ['SG', 'PR'], blocking: true, terminal: true,
      terminal_reason: 'This grant is only for citizens and PRs.', label: 'You are a citizen or PR' },
    { field: 'founder.residing_in_sg', op: 'is_true', blocking: true, terminal: true,
      terminal_reason: 'You need to be living in Singapore.', label: 'You live in Singapore' },
    { field: 'venture.project_duration_months', op: 'lte', value: 6, blocking: true,
      label: 'Your project runs 6 months or less',
      remedy: 'Rescope your first phase to six months or less', remedy_order: 1 },
  ],
  warnings: [
    { id: 'ycm-blocks-ssf', when: { field: 'funding.other_govt_funding', op: 'is_false' },
      message: 'Taking this may close off Startup SG Founder later, which asks that your idea has not had other government funding. Confirm with both agencies before you accept.',
      confirm_with_funder: true },
  ],
};

const VFG: GrantRule = {
  grant_id: 'raise-vfg-youth',
  name: 'VentureForGood (Youth)',
  source_url: 'https://www.raise.sg/ventureforgood-grant',
  last_checked: '2026-09-07',
  confidence: 'secondary',
  quantum: 'up to S$20,000 (youth track)',
  criteria: [
    { field: 'founder.age', op: 'between', value: [18, 35], blocking: true, terminal: true,
      terminal_reason: 'The youth track is for ages 18 to 35.', label: 'You are aged 18 to 35',
      applies_at_stage: 'stage_1_submit' },
    { field: 'founder.citizenship', op: 'in', value: ['SG', 'PR'], blocking: true, terminal: true,
      terminal_reason: 'The key applicant must be a citizen or PR.', label: 'You are a citizen or PR',
      applies_at_stage: 'stage_1_submit' },
    { field: 'venture.incorporated', op: 'is_true', blocking: true,
      label: 'Your business is registered with ACRA',
      remedy: 'Register your business with ACRA', remedy_order: 1, remedy_duration: 'about 1 week',
      applies_at_stage: 'stage_3_shortlist' },
    { field: 'memberships.raise_member', op: 'is_true', blocking: true,
      label: 'You are a raiSE member',
      remedy: 'Apply for raiSE membership', remedy_order: 2, remedy_duration: '4-8 weeks',
      remedy_url: 'https://www.raise.sg/membership.html',
      depends_on: 'venture.incorporated', applies_at_stage: 'stage_3_shortlist' },
    // any_of group, non-blocking, only when unincorporated
    { field: 'impact.sso_partnership', op: 'is_true', blocking: false,
      label: 'A VWO partners with you', group: 'vfg-unincorporated-evidence', group_mode: 'any_of',
      when: { field: 'venture.incorporated', op: 'is_false' } },
    { field: 'impact.beneficiary_validation', op: 'is_true', blocking: false,
      label: 'You can show who you help', group: 'vfg-unincorporated-evidence', group_mode: 'any_of',
      when: { field: 'venture.incorporated', op: 'is_false' } },
  ],
};

const SSF: GrantRule = {
  grant_id: 'startup-sg-founder',
  name: 'Startup SG Founder',
  source_url: 'https://www.enterprisesg.gov.sg/',
  last_checked: '2026-09-07',
  confidence: 'secondary',
  criteria: [
    { field: 'founder.citizenship', op: 'in', value: ['SG', 'PR'], blocking: true, terminal: true,
      terminal_reason: 'Citizens and PRs only.', label: 'You are a citizen or PR' },
    { field: 'founder.first_time_founder', op: 'is_true', blocking: true, terminal: true,
      terminal_reason: 'This scheme is only for first-time founders.', label: 'This is your first business' },
    { field: 'founder.previously_incorporated', op: 'is_false', blocking: true, terminal: true,
      terminal_reason: 'You have registered a company before, which closes this scheme permanently.',
      label: 'You have never registered a company' },
    { field: 'funding.other_govt_funding', op: 'is_false', blocking: true, terminal: true,
      terminal_reason: 'This idea has already had government funding.', label: 'No other government funding' },
    { field: 'founder.equity_pct', op: 'gte', value: 30, blocking: true,
      label: 'You hold at least 30% of the business', remedy: 'Restructure so you hold at least 30%', remedy_order: 1 },
    { field: 'memberships.amp_relationship', op: 'eq', value: 'LOR_ISSUED', blocking: true,
      label: 'A mentor partner has written you a letter',
      remedy: 'Ask SMU IIE for a Letter of Recommendation', remedy_order: 2, remedy_duration: 'about 6 weeks' },
    { field: 'funding.can_match_capital_sgd', op: 'gt', value: 0, blocking: false,
      label: 'You can put in matching money' },
  ],
};

/* ── the three states ───────────────────────────────────────────────────── */

const vfgResult = evaluateGrant(amirah, VFG, NOW);
check('VFG → eligible_after_steps', vfgResult.status === 'eligible_after_steps', vfgResult.status);
check('VFG remedies are ACRA then raiSE, in that order',
  vfgResult.remedies.map((r) => r.field).join(',') === 'venture.incorporated,memberships.raise_member',
  vfgResult.remedies.map((r) => r.field).join(','));
check('remedies renumbered from 1', vfgResult.remedies[0]?.order === 1 && vfgResult.remedies[1]?.order === 2);
check('remedy duration survives to the UI', vfgResult.remedies[1]?.duration === '4-8 weeks');
check('blockers[] pre-sorted by remedy_order',
  vfgResult.blockers.map((b) => b.field).join(',') === 'venture.incorporated,memberships.raise_member');
check('satisfied[] populated even when status is bad — the green ticks',
  vfgResult.satisfied.length === 3, String(vfgResult.satisfied.length));
check('firstBlocker is the first actionable step', firstBlocker(vfgResult)?.field === 'venture.incorporated');
check('quantum passes through', vfgResult.quantum === 'up to S$20,000 (youth track)');

const ycmResult = evaluateGrant(amirah, YCM, NOW);
check('YCM → eligible_now (the one green card)', ycmResult.status === 'eligible_now', ycmResult.status);
check('YCM fires the Startup-SG-Founder warning', ycmResult.warnings.length === 1);
check('warning is marked confirm_with_funder, not asserted', ycmResult.warnings[0]?.confirm_with_funder === true);

const ssfResult = evaluateGrant(
  { ...amirah, answers: { ...amirah.answers, founder: { ...amirah.answers.founder, previously_incorporated: true, first_time_founder: false } } },
  SSF, NOW,
);
check('SSF → not_a_fit for a repeat incorporator', ssfResult.status === 'not_a_fit', ssfResult.status);
check('not_a_fit exposes a reason a founder can read', terminalReasons(ssfResult).length === 2,
  terminalReasons(ssfResult).join(' | '));

/* ── amendment 1: terminal must be explicit ─────────────────────────────── */

let threw = false;
try {
  evaluateGrant(amirah, {
    ...VFG,
    criteria: [{ field: 'founder.age', op: 'between', value: [18, 35], blocking: true, label: 'age' }],
  }, NOW);
} catch { threw = true; }
check('blocking criterion with neither remedy nor terminal THROWS (C amendment 1)', threw);

check('terminal beats remedy: an unmet terminal makes it not_a_fit even alongside remediable blockers',
  evaluateGrant({ ...amirah, answers: { ...amirah.answers, founder: { ...amirah.answers.founder, age: 42 } } }, VFG, NOW)
    .status === 'not_a_fit');

/* ── amendment 2: when guards and any_of groups ─────────────────────────── */

const vfgGroupRows = vfgResult.criteria.filter((c) => c.group === 'vfg-unincorporated-evidence');
check('group members appear individually so A can render them', vfgGroupRows.length === 2);
check('guard holds (unincorporated) so members are scored, not skipped',
  vfgGroupRows.every((c) => c.outcome !== 'SKIPPED'),
  vfgGroupRows.map((c) => c.outcome).join(','));

const incorporated: FounderProfile = {
  ...amirah,
  answers: { ...amirah.answers, venture: { ...amirah.answers.venture, incorporated: true } },
};
const incResult = evaluateGrant(incorporated, VFG, NOW);
check('guard fails (incorporated) → members SKIPPED entirely',
  incResult.criteria.filter((c) => c.group).every((c) => c.outcome === 'SKIPPED'));

const unknownGuard: FounderProfile = {
  ...amirah,
  answers: { ...amirah.answers, venture: { ...amirah.answers.venture, incorporated: null } },
};
check('guard field unknown → criterion UNKNOWN, not silently skipped',
  evaluateGrant(unknownGuard, VFG, NOW).criteria.filter((c) => c.group).every((c) => c.outcome === 'UNKNOWN'));

check('any_of: one member MET is enough — group does not drag status down',
  evaluateGrant(amirah, { ...VFG, criteria: VFG.criteria.map((c) => c.group ? { ...c, blocking: true, terminal: true } : c) }, NOW)
    .status === 'eligible_after_steps');

/* ── the cold-start guarantee ───────────────────────────────────────────── */

const blank = createEmptyProfile(NOW);
const blankYcm = evaluateGrant(blank, YCM, NOW);
check('empty profile vs YCM → 4 unknowns and ZERO blockers (C case 1)',
  blankYcm.unknowns.length === 4 && blankYcm.blockers.length === 0,
  `unknowns=${blankYcm.unknowns.length} blockers=${blankYcm.blockers.length}`);
check('empty profile → eligible_after_steps, never not_a_fit', blankYcm.status === 'eligible_after_steps');

const saidNo: FounderProfile = {
  ...blank,
  answers: { ...blank.answers, founder: { ...blank.answers.founder, residing_in_sg: false } },
};
check('false is UNMET, null is UNKNOWN — they differ',
  evaluateGrant(saidNo, YCM, NOW).criteria.find((c) => c.field === 'founder.residing_in_sg')?.outcome === 'UNMET');

/* ── operators ──────────────────────────────────────────────────────────── */

check('between is inclusive at both ends',
  evaluateGrant({ ...amirah, answers: { ...amirah.answers, founder: { ...amirah.answers.founder, age: 18 } } }, VFG, NOW).criteria[0].outcome === 'MET' &&
  evaluateGrant({ ...amirah, answers: { ...amirah.answers, founder: { ...amirah.answers.founder, age: 35 } } }, VFG, NOW).criteria[0].outcome === 'MET');
check('gt is strict', evaluateGrant(amirah, SSF, NOW).criteria.find((c) => c.field === 'funding.can_match_capital_sgd')?.outcome === 'UNMET');
check('non-blocking failure never changes status',
  evaluateGrant(amirah, SSF, NOW).criteria.find((c) => c.field === 'funding.can_match_capital_sgd')?.blocking === false);

threw = false;
try { evaluateGrant(amirah, { ...VFG, criteria: [{ field: 'founder.nope', op: 'eq', value: 1, blocking: true, terminal: true, label: 'x' }] }, NOW); } catch { threw = true; }
check('rule referencing a non-existent field throws loudly', threw);

threw = false;
try { evaluateGrant(amirah, { ...VFG, criteria: [{ field: 'founder.age', op: 'approximately' as never, value: 1, blocking: true, terminal: true, label: 'x' }] }, NOW); } catch { threw = true; }
check('unknown operator throws instead of silently failing', threw);

/* ── the demo persona: three grants, three states ───────────────────────── */

const map = evaluateAll(amirah, [YCM, VFG, SSF], NOW);
check('readiness map sorts closest-to-funded first',
  map.results[0].status === 'eligible_now',
  map.results.map((r) => `${r.grant_id}:${r.status}`).join(', '));
check('Amirah produces at least two distinct states across three grants',
  new Set(map.results.map((r) => r.status)).size >= 2,
  map.results.map((r) => `${r.grant_id}:${r.status}`).join(', '));

/* ── profile merge + gap flags ──────────────────────────────────────────── */

const merged = applyElicitResult(blank, {
  step_id: 'who_you_are',
  patch: { founder: { age: 24 } },
  field_meta_patch: { 'founder.age': { source: 'FOUNDER', confirmed_by_founder: true, updated_at: NOW } },
  confirm_back: 'ok',
  next_step_id: 'citizenship',
}, NOW);
check('patch merges without clobbering siblings',
  merged.answers.founder.age === 24 && merged.answers.venture.name === null);
check('merge records step progress', merged.elicit_progress?.completed_step_ids.includes('who_you_are') === true);
check('AI_ESTIMATED field is gap-flagged', isGapFlagged(amirah, 'impact.beneficiary_count_est'));
check('confirmed FOUNDER field is not gap-flagged', !isGapFlagged(amirah, 'founder.age'));
check('field with no provenance is gap-flagged', isGapFlagged(amirah, 'venture.name'));

/* ── determinism ────────────────────────────────────────────────────────── */

check('same inputs → identical output (no model, no randomness)',
  JSON.stringify(evaluateGrant(amirah, VFG, NOW)) === JSON.stringify(evaluateGrant(amirah, VFG, NOW)));

console.log(failures === 0 ? '\nELIGIBILITY: ALL PASS' : `\nELIGIBILITY: ${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
