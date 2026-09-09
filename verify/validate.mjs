import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';

const schema = JSON.parse(readFileSync('./data/profile.schema.json', 'utf8'));
const sample = JSON.parse(readFileSync('./verify/sample-profile.json', 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

let fails = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) fails++;
};

// 1. The good sample validates.
check('valid sample profile validates', validate(sample),
  validate.errors ? JSON.stringify(validate.errors.slice(0,2)) : '');

// 2. NEGATIVE: a camelCase field is rejected (this is the bug we are preventing).
const camel = structuredClone(sample);
camel.answers.memberships.raiseMember = true;
delete camel.answers.memberships.raise_member;
check('camelCase field `raiseMember` is REJECTED', !validate(camel));

// 3. NEGATIVE: empty string instead of null is rejected where typed.
const badEnum = structuredClone(sample);
badEnum.answers.founder.citizenship = '';
check('empty string for citizenship is REJECTED', !validate(badEnum));

// 4. NEGATIVE: unknown enum value rejected.
const badStage = structuredClone(sample);
badStage.answers.venture.stage = 'LAUNCHED';
check('unknown venture.stage `LAUNCHED` is REJECTED', !validate(badStage));

// 5. NEGATIVE: field_meta missing required provenance is rejected.
const badMeta = structuredClone(sample);
badMeta.field_meta['founder.age'] = { source: 'FOUNDER' };
check('field_meta without confirmed_by_founder is REJECTED', !validate(badMeta));

// 6. NEGATIVE: a stray top-level key is rejected.
const stray = structuredClone(sample);
stray.userProfile = {};
check('stray top-level key is REJECTED', !validate(stray));

// 7. POSITIVE: nulls everywhere (a brand-new profile) validates.
const blank = {
  profile_version: '1.0.0',
  profile_id: 'a'.repeat(8),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  answers: {
    founder: { full_name: null, age: null, citizenship: null, is_key_applicant: null,
      first_time_founder: null, previously_incorporated: null, equity_pct: null, access_needs: [] },
    venture: { name: null, one_liner: null, problem_statement: null, stage: null,
      incorporated: null, uen: null, incorporation_date: null, entity_type: null,
      entity_status: null, ssic_code: null },
    impact: { beneficiary_group: null, beneficiary_count_est: null, impact_description: null,
      beneficiary_validation: null, sso_partnership: null, sso_partner_name: null },
    memberships: { raise_member: null, raise_member_since: null, amp_relationship: null, amp_name: null },
    funding: { amount_sought_sgd: null, other_govt_funding: null, other_govt_funding_detail: null },
    readiness: { has_pitch_deck: null, has_acra_profile: null, has_management_accounts: null,
      has_financial_projections: null, has_team_resumes: null, team_size: null }
  },
  field_meta: {}
};
check('a brand-new all-null profile validates', validate(blank),
  validate.errors ? JSON.stringify(validate.errors.slice(0,2)) : '');

console.log(fails === 0 ? '\nSCHEMA VERIFICATION: ALL PASS' : `\nSCHEMA VERIFICATION: ${fails} FAILED`);
process.exit(fails === 0 ? 0 : 1);
