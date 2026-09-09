/**
 * Emits /fixtures/elicit-steps.json and /fixtures/responses/*.json
 * Run: node verify/gen-fixtures.mjs
 *
 * DEMO PERSONA — Ren. Matches the pitch deck and C's demo-founder.json.
 * 24, visually impaired. Runs a peer-support group for young adults newly
 * diagnosed with sight loss; wants to sell disability-awareness training to
 * employers. At 19 she registered a tutoring company that never traded and was
 * struck off — and does not know it permanently closes Startup SG Founder.
 *
 * Tuned so the readiness map lands on all three states at once:
 *   Young ChangeMakers   → eligible_now
 *   VentureForGood Youth → eligible_after_steps  (ACRA, then raiSE)
 *   Startup SG Founder   → not_a_fit            (previously incorporated)
 */
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('./fixtures/responses', { recursive: true });

const T = '2026-09-09T10:00:00+08:00';
const founder = (note) => ({ source: 'FOUNDER', confirmed_by_founder: true, updated_at: T, note: note ?? null });
const extracted = (note) => ({ source: 'AI_EXTRACTED', confirmed_by_founder: false, updated_at: T, note });
const estimated = (note) => ({ source: 'AI_ESTIMATED', confirmed_by_founder: false, updated_at: T, note });

/* ── the elicitation script (ElicitStep[]) ─────────────────────────────── */

const steps = [
  {
    step_id: 'who_you_are',
    question: 'First — what should we call you, and how old are you?',
    why: 'Some funding is only open to founders in a certain age range, so this tells us early what you can go for.',
    input_kind: 'SHORT_TEXT',
    writes_fields: ['founder.full_name', 'founder.age'],
    optional: false,
    fixture: 'elicit-01-who_you_are.json',
  },
  {
    step_id: 'citizenship',
    question: 'Are you a Singapore citizen or PR, and living in Singapore?',
    why: 'All three schemes we track need the main applicant to be a citizen or PR.',
    input_kind: 'SINGLE_CHOICE',
    choices: [
      { value: 'SG', label: 'Singapore citizen, living here' },
      { value: 'PR', label: 'Permanent resident, living here', funder_term: 'PR' },
      { value: 'OTHER', label: 'Neither' },
    ],
    writes_fields: ['founder.citizenship', 'founder.is_key_applicant', 'founder.residing_in_sg'],
    optional: false,
    fixture: 'elicit-02-citizenship.json',
  },
  {
    step_id: 'access_needs',
    question: 'Anything we should change about how this page works for you?',
    why: 'This only changes how we show things to you. It never affects what you qualify for.',
    input_kind: 'MULTI_CHOICE',
    choices: [
      { value: 'PLAIN_LANGUAGE', label: 'Keep the language simple' },
      { value: 'LARGE_TEXT', label: 'Bigger text' },
      { value: 'VOICE_INPUT', label: 'Let me speak instead of type' },
      { value: 'EXTRA_TIME', label: 'No time limits' },
      { value: 'SCREEN_READER', label: 'I use a screen reader' },
      { value: 'REDUCED_MOTION', label: 'Less movement on screen' },
    ],
    writes_fields: ['founder.access_needs'],
    optional: true,
    fixture: 'elicit-03-access_needs.json',
  },
  {
    step_id: 'venture_idea',
    question: 'Tell us about your idea, in your own words.',
    why: "However it comes out is fine. We'll tidy it up and show you exactly what we wrote.",
    input_kind: 'FREE_TEXT',
    writes_fields: ['venture.name', 'venture.one_liner', 'venture.problem_statement'],
    optional: false,
    fixture: 'elicit-04-venture_idea.json',
  },
  {
    step_id: 'who_it_helps',
    question: 'Who does this help, and roughly how many people?',
    why: 'Social enterprise funders ask this in almost every form. A rough number is fine for now.',
    input_kind: 'FREE_TEXT',
    writes_fields: ['impact.beneficiary_group', 'impact.beneficiary_count_est', 'impact.impact_description'],
    optional: false,
    fixture: 'elicit-05-who_it_helps.json',
  },
  {
    step_id: 'venture_stage',
    question: 'Where are you up to, and how long would your first phase run?',
    why: 'Some grants need a registered business. Most do not — being early is fine, and one of them caps the project length.',
    input_kind: 'SINGLE_CHOICE',
    choices: [
      { value: 'IDEA', label: "It's still an idea" },
      { value: 'PROTOTYPE', label: "I've tried it out in a small way" },
      { value: 'OPERATING', label: "It's running and registered", funder_term: 'incorporated' },
    ],
    writes_fields: ['venture.stage', 'venture.incorporated', 'venture.project_duration_months'],
    optional: false,
    fixture: 'elicit-06-venture_stage.json',
  },
  {
    step_id: 'founding_history',
    question: 'Have you ever registered a company before? Even one that never traded.',
    why: 'One scheme is strictly for first-time founders, and a company you registered years ago still counts.',
    input_kind: 'YES_NO',
    writes_fields: ['founder.first_time_founder', 'founder.previously_incorporated', 'founder.equity_pct'],
    optional: false,
    fixture: 'elicit-07-founding_history.json',
  },
  {
    step_id: 'support_network',
    question: 'Is any organisation backing you yet?',
    why: 'Membership and partnerships are the most common thing standing between a founder and a grant — and the most fixable.',
    input_kind: 'MULTI_CHOICE',
    choices: [
      { value: 'RAISE_MEMBER', label: "I'm a raiSE member", funder_term: 'raiSE membership' },
      { value: 'AMP_TALKING', label: "I've spoken to a university or accelerator", funder_term: 'Accredited Mentor Partner' },
      { value: 'VWO_PARTNER', label: 'A registered charity or non-profit backs us', funder_term: 'VWO partnership' },
      { value: 'BENEFICIARY_EVIDENCE', label: 'I can show who I help and why they need it', funder_term: 'beneficiary validation' },
      { value: 'NONE', label: 'Not yet' },
    ],
    writes_fields: [
      'memberships.raise_member',
      'memberships.amp_relationship',
      'memberships.amp_name',
      'impact.sso_partnership',
      'impact.beneficiary_validation',
    ],
    optional: false,
    fixture: 'elicit-08-support_network.json',
  },
  {
    step_id: 'money',
    question: 'Roughly how much would you need to get going?',
    why: "A rough figure is fine. We'll help you break it down properly later.",
    input_kind: 'NUMBER',
    writes_fields: ['funding.amount_sought_sgd', 'funding.other_govt_funding', 'funding.can_match_capital_sgd'],
    optional: false,
    fixture: 'elicit-09-money.json',
  },
  {
    step_id: 'what_you_have',
    question: 'Which of these do you already have?',
    why: "This is the paperwork funders ask for. Most founders have none of it yet — that's normal, and we'll show you what to do about each one.",
    input_kind: 'MULTI_CHOICE',
    choices: [
      { value: 'PITCH_DECK', label: 'Slides about your idea', funder_term: 'pitch deck' },
      { value: 'ACRA', label: 'A business registration document', funder_term: 'ACRA profile' },
      { value: 'ACCOUNTS', label: 'Records of money in and out', funder_term: 'management accounts' },
      { value: 'PROJECTIONS', label: 'A guess at the next 2 years of money', funder_term: 'financial projections' },
      { value: 'RESUMES', label: 'CVs for you and your team', funder_term: 'founding team resumes' },
    ],
    writes_fields: [
      'readiness.has_pitch_deck',
      'readiness.has_acra_profile',
      'readiness.has_management_accounts',
      'readiness.has_financial_projections',
      'readiness.has_team_resumes',
      'readiness.team_size',
    ],
    optional: false,
    fixture: 'elicit-10-what_you_have.json',
  },
];

writeFileSync('./fixtures/elicit-steps.json', JSON.stringify(steps, null, 2) + '\n');

/* ── the cached responses (ElicitResult) ───────────────────────────────── */

const responses = [
  {
    step_id: 'who_you_are',
    patch: { founder: { full_name: 'Ren', age: 24 } },
    field_meta_patch: { 'founder.full_name': founder(), 'founder.age': founder() },
    confirm_back: 'Got it — Ren, 24. That puts you inside the age range every scheme we track uses.',
    next_step_id: 'citizenship',
  },
  {
    step_id: 'citizenship',
    patch: { founder: { citizenship: 'SG', is_key_applicant: true, residing_in_sg: true } },
    field_meta_patch: {
      'founder.citizenship': founder(),
      'founder.is_key_applicant': founder(),
      'founder.residing_in_sg': founder(),
    },
    confirm_back: "Singapore citizen, living here, and you're the main applicant. That clears the citizenship rule on all three.",
    next_step_id: 'access_needs',
  },
  {
    step_id: 'access_needs',
    patch: { founder: { access_needs: ['PLAIN_LANGUAGE', 'VOICE_INPUT', 'LARGE_TEXT'] } },
    field_meta_patch: { 'founder.access_needs': founder() },
    confirm_back: 'Plain language, voice input and larger text are on. You can change these any time from the top of the page.',
    next_step_id: 'venture_idea',
  },
  {
    step_id: 'venture_idea',
    patch: {
      venture: {
        name: 'Sightlines',
        one_liner: 'Disability-awareness training for employers, designed and delivered by people who are losing their sight.',
        problem_statement:
          'Young adults newly diagnosed with sight loss in Singapore lose their footing at work at exactly the moment employers are least equipped to keep them. Sightlines turns that lived experience into training the employer pays for, delivered by the people it is about.',
      },
    },
    field_meta_patch: {
      'venture.name': founder(),
      'venture.one_liner': extracted('We wrote this from what you told us. Change anything that sounds off.'),
      'venture.problem_statement': extracted('We wrote this from what you told us. Change anything that sounds off.'),
    },
    confirm_back:
      'Here is how we would say it: "Sightlines is disability-awareness training for employers, designed and delivered by people who are losing their sight." Does that sound like your idea?',
    next_step_id: 'who_it_helps',
  },
  {
    step_id: 'who_it_helps',
    patch: {
      impact: {
        beneficiary_group: 'Young adults in Singapore newly diagnosed with sight loss, aged 18 to 35',
        beneficiary_count_est: 40,
        impact_description:
          'Peer support at the point of diagnosis, then paid work delivering training to the employers most likely to hire people like them.',
      },
    },
    field_meta_patch: {
      'impact.beneficiary_group': founder(),
      'impact.beneficiary_count_est': estimated('We estimated this from your first three years. Confirm before you submit.'),
      'impact.impact_description': extracted('We wrote this from what you told us.'),
    },
    confirm_back:
      'So: young adults newly diagnosed with sight loss, and we have put roughly 40 people over three years. That number is our estimate, not yours — we have flagged it so you can correct it.',
    next_step_id: 'venture_stage',
  },
  {
    step_id: 'venture_stage',
    patch: { venture: { stage: 'PROTOTYPE', incorporated: false, project_duration_months: 6 } },
    field_meta_patch: {
      'venture.stage': founder(),
      'venture.incorporated': founder(),
      'venture.project_duration_months': estimated('We assumed a six-month first phase. Change it if yours is longer.'),
    },
    confirm_back:
      'You have run it in a small way but the business is not registered. That is fine — none of these need you registered to apply.',
    next_step_id: 'founding_history',
  },
  {
    step_id: 'founding_history',
    patch: { founder: { first_time_founder: false, previously_incorporated: true, equity_pct: 100 } },
    field_meta_patch: {
      'founder.first_time_founder': founder(),
      'founder.previously_incorporated': founder(),
      'founder.equity_pct': estimated('We assumed you would hold all of it to start. Correct this if you have co-founders.'),
    },
    confirm_back:
      'You registered a tutoring company at 19 that never traded and was struck off. That still counts as having incorporated before — and it matters more than you would expect. We will show you exactly where.',
    next_step_id: 'support_network',
  },
  {
    step_id: 'support_network',
    patch: {
      memberships: { raise_member: false, amp_relationship: 'IN_DISCUSSION', amp_name: 'SMU IIE' },
      impact: { sso_partnership: false, beneficiary_validation: true },
    },
    field_meta_patch: {
      'memberships.raise_member': founder(),
      'memberships.amp_relationship': founder(),
      'memberships.amp_name': founder(),
      'impact.sso_partnership': founder(),
      'impact.beneficiary_validation': founder(),
    },
    confirm_back:
      'Talking to SMU IIE, not a raiSE member yet, no VWO partner — but you can show who you help and why. Two of those are steps we can put in order for you.',
    next_step_id: 'money',
  },
  {
    step_id: 'money',
    patch: { funding: { amount_sought_sgd: 25000, other_govt_funding: false, can_match_capital_sgd: 0 } },
    field_meta_patch: {
      'funding.amount_sought_sgd': founder(),
      'funding.other_govt_funding': founder(),
      'funding.can_match_capital_sgd': founder(),
    },
    confirm_back:
      'Around $25,000, no government funding for this idea before, and no money of your own to put in yet. All three noted.',
    next_step_id: 'what_you_have',
  },
  {
    step_id: 'what_you_have',
    patch: {
      readiness: {
        has_pitch_deck: false,
        has_acra_profile: false,
        has_management_accounts: false,
        has_financial_projections: false,
        has_team_resumes: true,
        team_size: 2,
      },
    },
    field_meta_patch: {
      'readiness.has_pitch_deck': founder(),
      'readiness.has_acra_profile': founder(),
      'readiness.has_management_accounts': founder(),
      'readiness.has_financial_projections': founder(),
      'readiness.has_team_resumes': founder(),
      'readiness.team_size': founder(),
    },
    confirm_back:
      "CVs yes, everything else not yet. That is the normal starting point — next we will show you which of these actually block an application and which can wait.",
    next_step_id: null,
  },
];

const pad = (n) => String(n).padStart(2, '0');
responses.forEach((r, i) => {
  writeFileSync(`./fixtures/responses/elicit-${pad(i + 1)}-${r.step_id}.json`, JSON.stringify(r, null, 2) + '\n');
});

/* ── one drafted answer, with gap flags ────────────────────────────────── */

const impactText =
  'Sightlines trains employers in how to keep and support staff who are losing their sight, using trainers who are going through it themselves. ' +
  'Over our first three years we expect to reach approximately 40 people newly diagnosed with sight loss, each moving from peer support into paid delivery work. ' +
  'Our aim is that every trainer leaves with paid hours on their CV and a reference from an employer.';

const problemText =
  'Young adults in Singapore who are newly diagnosed with sight loss tend to lose their footing at work at exactly the moment their employer is least equipped to keep them. ' +
  'The gap is not the person; it is that nobody in the workplace has been shown what to change. Sightlines closes that gap using the people it is about.';

const draft = {
  grant_id: 'raise-vfg-youth',
  stage_id: 'stage_1_submit',
  sections: [
    {
      funder_question: 'Describe the social impact your venture intends to create.',
      plain_question: 'Who does your idea help, and what changes for them?',
      text: impactText,
      word_limit: 300,
      gaps: [
        {
          field: 'impact.beneficiary_count_est',
          start: impactText.indexOf('approximately 40 people'),
          end: impactText.indexOf('approximately 40 people') + 'approximately 40 people'.length,
          source: 'AI_ESTIMATED',
          note: 'We estimated this. Confirm before you submit.',
        },
      ],
    },
    {
      funder_question: 'What is the problem your venture addresses?',
      plain_question: 'What is going wrong today that you want to fix?',
      text: problemText,
      word_limit: 300,
      gaps: [],
    },
  ],
  generated_at: T,
  from_live_model: false,
};

writeFileSync('./fixtures/responses/draft-raise-vfg-youth-stage_1.json', JSON.stringify(draft, null, 2) + '\n');

console.log(`Wrote fixtures/elicit-steps.json (${steps.length} steps)`);
console.log(`Wrote ${responses.length} response fixtures + 1 draft fixture — persona: Ren / Sightlines`);
