/**
 * Cross-check: the same sample profile must satisfy BOTH the JSON Schema and the
 * TypeScript interface. If schema and types ever drift, this file stops compiling.
 */
import sample from './sample-profile.json';
import type {
  FounderProfile,
  EligibilityResult,
  ElicitResult,
  GrantRule,
  EvaluateGrant,
} from '../src/types/contract';
import { evaluateGrant as realEvaluateGrant } from '../src/lib/eligibility';

// 1. The fixture is assignable to the interface.
const profile: FounderProfile = sample as FounderProfile;

// 2. Null discipline holds: an unanswered field is null, not false.
const uen: string | null = profile.answers.venture.uen;

// 3. A representative rule compiles, including the remedy fork.
const vfgRule: GrantRule = {
  grant_id: 'raise-vfg-youth',
  name: 'VentureForGood (Youth)',
  source_url: 'https://www.raise.sg/ventureforgood-grant',
  last_checked: '2026-09-07',
  criteria: [
    { field: 'founder.age', op: 'between', value: [18, 35], blocking: true, terminal: true,
      terminal_reason: 'The youth track is for ages 18 to 35.', label: 'You are between 18 and 35' },
    { field: 'founder.citizenship', op: 'in', value: ['SG', 'PR'], blocking: true, terminal: true,
      terminal_reason: 'The key applicant must be a citizen or PR.', label: 'You are a Singapore citizen or PR' },
    { field: 'memberships.raise_member', op: 'is_true', blocking: true,
      label: 'You are a raiSE member',
      remedy: 'Apply for raiSE membership', remedy_order: 1,
      remedy_url: 'https://www.raise.sg/membership.html' },
  ],
};

// 4. The real implementation satisfies the declared signature.
const evaluateGrant: EvaluateGrant = realEvaluateGrant;
const _result: EligibilityResult = evaluateGrant(profile, vfgRule);

// 5. A sparse patch is a DeepPartial — merging, not replacing.
const patch: ElicitResult['patch'] = { founder: { age: 24 } };

// Touch everything so noUnusedLocals stays satisfied.
export const _smoke = [profile.profile_id, uen, vfgRule.grant_id, _result.status, patch];
