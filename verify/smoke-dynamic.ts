import { submitAnswer } from '../src/lib/elicit';

async function main() {
  const a = await submitAnswer({}, 'citizenship', 'PR');
  const b = await submitAnswer({}, 'citizenship', 'OTHER');
  console.assert(a.ok && a.data.patch.founder?.citizenship === 'PR', 'citizenship PR');
  console.assert(b.ok && b.data.patch.founder?.residing_in_sg === null, 'citizenship OTHER -> residing unknown');
  console.assert(a.ok && b.ok && a.data.confirm_back !== b.data.confirm_back, 'confirm_back differs by answer');

  const yes = await submitAnswer({}, 'founding_history', true);
  const no = await submitAnswer({}, 'founding_history', false);
  console.assert(yes.ok && yes.data.patch.founder?.first_time_founder === false, 'yes -> not first-time');
  console.assert(no.ok && no.data.patch.founder?.first_time_founder === true, 'no -> first-time');

  const money1 = await submitAnswer({}, 'money', 5000);
  const money2 = await submitAnswer({}, 'money', 90000);
  console.assert(money1.ok && money1.data.confirm_back.includes('5,000'), 'money reflects input 1');
  console.assert(money2.ok && money2.data.confirm_back.includes('90,000'), 'money reflects input 2');

  const wyh = await submitAnswer({}, 'what_you_have', ['PITCH_DECK', 'RESUMES']);
  console.assert(wyh.ok && wyh.data.patch.readiness?.has_pitch_deck === true, 'wyh pitch deck true');
  console.assert(wyh.ok && wyh.data.patch.readiness?.has_acra_profile === false, 'wyh acra false (not picked)');

  // still-cached free-text step must be unaffected
  const idea = await submitAnswer({}, 'venture_idea', 'some rambling founder text about widgets');
  console.assert(idea.ok && idea.data.patch.venture?.name === 'Sightlines', 'venture_idea still uses cached fixture');

  console.log('SMOKE: all assertions passed (any failure above prints "Assertion failed")');
}
main();
