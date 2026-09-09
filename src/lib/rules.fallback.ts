/**
 * rules.fallback.ts — EXAMPLE RULES ONLY. Delete this file once C's
 * /data/rules/*.json are in the repo.
 *
 * Owner: B, temporarily. THE RULE CONTENT IS C'S TERRITORY (CONTRACT.md §7).
 * These exist so the screens can be built and demoed before C's branch merges.
 * They encode the criteria documented in CONTEXT.md §5 and C's handoff, but the
 * authoritative versions are C's files, and the app prefers those automatically.
 *
 * The app shows a visible banner whenever these are in use. Do not present a
 * fallback rule to a judge as a verified rule.
 */

import type { GrantRule } from '../types/contract';

export const FALLBACK_RULES: GrantRule[] = [
  {
    grant_id: 'nyc-ycm',
    name: 'Young ChangeMakers',
    source_url: 'https://www.nyc.gov.sg/',
    last_checked: '2026-09-08',
    confidence: 'secondary',
    quantum: 'up to S$3,000 (S$5,000 exceptional), 80% of supported cost',
    criteria: [
      {
        field: 'founder.age', op: 'between', value: [15, 35], blocking: true, terminal: true,
        terminal_reason: 'Young ChangeMakers is only open to people aged 15 to 35.',
        label: 'You are aged 15 to 35',
      },
      {
        field: 'founder.citizenship', op: 'in', value: ['SG', 'PR'], blocking: true, terminal: true,
        terminal_reason: 'This grant is only for Singapore citizens and permanent residents.',
        label: 'You are a Singapore citizen or PR',
      },
      {
        field: 'founder.residing_in_sg', op: 'is_true', blocking: true, terminal: true,
        terminal_reason: 'You need to be living in Singapore to apply.',
        label: 'You are living in Singapore',
      },
      {
        field: 'venture.project_duration_months', op: 'lte', value: 6, blocking: true,
        label: 'Your first phase runs six months or less',
        remedy: 'Rescope your first phase to six months or less',
        remedy_order: 1, remedy_duration: 'a planning decision, not a wait',
      },
    ],
    warnings: [
      {
        id: 'ycm-may-close-ssf',
        when: { field: 'funding.other_govt_funding', op: 'is_false' },
        message:
          'Taking this may close off Startup SG Founder later, which asks that your business concept has not received other government funding. Check with both agencies before you accept.',
        confirm_with_funder: true,
      },
    ],
  },

  {
    grant_id: 'raise-vfg-youth',
    name: 'VentureForGood (Youth)',
    source_url: 'https://www.raise.sg/ventureforgood-grant',
    last_checked: '2026-09-07',
    confidence: 'secondary',
    quantum: 'youth track — verify the current figure with raiSE before quoting it',
    required_documents: [
      'Pitch deck',
      'ACRA business profile',
      'Management accounts, up to 2 years, if applicable',
      'Financial projections, at least 2 years',
      'Founding team resumes',
    ],
    criteria: [
      {
        field: 'founder.age', op: 'between', value: [18, 35], blocking: true, terminal: true,
        terminal_reason: 'The youth track is for founders aged 18 to 35.',
        label: 'You are aged 18 to 35',
        applies_at_stage: 'stage_1_submit',
      },
      {
        field: 'founder.citizenship', op: 'in', value: ['SG', 'PR'], blocking: true, terminal: true,
        terminal_reason: 'The key applicant must be a Singapore citizen or PR.',
        label: 'You are a Singapore citizen or PR',
        applies_at_stage: 'stage_1_submit',
      },
      {
        field: 'venture.incorporated', op: 'is_true', blocking: true,
        label: 'Your business is registered with ACRA',
        remedy: 'Register your business with ACRA',
        remedy_order: 1, remedy_duration: 'about 1 week',
        applies_at_stage: 'stage_3_shortlist',
      },
      {
        field: 'memberships.raise_member', op: 'is_true', blocking: true,
        label: 'You are a raiSE member',
        remedy: 'Apply for raiSE membership',
        remedy_order: 2, remedy_duration: '4 to 8 weeks',
        remedy_url: 'https://www.raise.sg/membership.html',
        depends_on: 'venture.incorporated',
        applies_at_stage: 'stage_3_shortlist',
      },
      {
        field: 'impact.sso_partnership', op: 'is_true', blocking: false,
        label: 'A VWO partners with you',
        group: 'vfg-unincorporated-evidence', group_mode: 'any_of',
        when: { field: 'venture.incorporated', op: 'is_false' },
      },
      {
        field: 'impact.beneficiary_validation', op: 'is_true', blocking: false,
        label: 'You can show who you help and why they need it',
        group: 'vfg-unincorporated-evidence', group_mode: 'any_of',
        when: { field: 'venture.incorporated', op: 'is_false' },
      },
    ],
  },

  {
    grant_id: 'startup-sg-founder',
    name: 'Startup SG Founder',
    source_url: 'https://www.enterprisesg.gov.sg/',
    last_checked: '2026-09-07',
    confidence: 'secondary',
    quantum: 'grant quantum and matching ratio differ across sources — verify before quoting',
    criteria: [
      {
        field: 'founder.citizenship', op: 'in', value: ['SG', 'PR'], blocking: true, terminal: true,
        terminal_reason: 'This scheme is for Singapore citizens and permanent residents.',
        label: 'You are a Singapore citizen or PR',
      },
      {
        field: 'founder.first_time_founder', op: 'is_true', blocking: true, terminal: true,
        terminal_reason: 'Startup SG Founder is strictly for first-time entrepreneurs.',
        label: 'This is your first business',
      },
      {
        field: 'founder.previously_incorporated', op: 'is_false', blocking: true, terminal: true,
        terminal_reason:
          'You have registered a company before. That closes this scheme permanently, even if the company never traded and was struck off.',
        label: 'You have never registered a company',
      },
      {
        field: 'funding.other_govt_funding', op: 'is_false', blocking: true, terminal: true,
        terminal_reason: 'This business concept has already received government funding.',
        label: 'This idea has not had other government funding',
      },
      {
        field: 'founder.equity_pct', op: 'gte', value: 30, blocking: true,
        label: 'You hold at least 30% of the business',
        remedy: 'Restructure so you hold at least 30%', remedy_order: 1,
      },
      {
        field: 'memberships.amp_relationship', op: 'eq', value: 'LOR_ISSUED', blocking: true,
        label: 'A mentor partner has written you a Letter of Recommendation',
        remedy: 'Ask your Accredited Mentor Partner for a Letter of Recommendation',
        remedy_order: 2, remedy_duration: 'about 6 weeks',
      },
      {
        field: 'funding.can_match_capital_sgd', op: 'gt', value: 0, blocking: false,
        label: 'You can put in matching money of your own',
      },
    ],
  },
];
