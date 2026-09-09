import { useEffect, useMemo, useState } from 'react';
import type { FounderProfile, GrantId, ScreenId } from './types/contract';
import { SCREEN } from './types/contract';
import { createEmptyProfile, loadProfile, saveProfile, clearProfile } from './lib/profile';
import { usingFallback } from './lib/rules';

import Welcome from './screens/Welcome';
import Intake from './screens/Intake';
import ReadinessMap from './screens/ReadinessMap';
import GrantDetail from './screens/GrantDetail';
import Draft from './screens/Draft';
import ProfileReview from './screens/ProfileReview';

type TextSize = 'normal' | 'large' | 'larger';

export default function App() {
  const [profile, setProfile] = useState<FounderProfile>(() => loadProfile() ?? createEmptyProfile());
  const [screen, setScreen] = useState<ScreenId>(SCREEN.WELCOME);
  const [grantId, setGrantId] = useState<GrantId | null>(null);
  const [textSize, setTextSize] = useState<TextSize>('normal');

  const needs = profile.answers.founder.access_needs;

  /* Access needs picked during intake drive the interface immediately.
     They never touch eligibility — see the walled-off field in the schema. */
  useEffect(() => {
    if (needs.includes('LARGE_TEXT') && textSize === 'normal') setTextSize('large');
    if (needs.includes('REDUCED_MOTION')) document.documentElement.dataset.motion = 'reduced';
  }, [needs, textSize]);

  useEffect(() => {
    document.documentElement.dataset.textSize = textSize;
  }, [textSize]);

  function update(next: FounderProfile) {
    setProfile(next);
    saveProfile(next);
  }

  function restart() {
    clearProfile();
    setProfile(createEmptyProfile());
    setGrantId(null);
    setScreen(SCREEN.WELCOME);
  }

  const started = useMemo(
    () => (profile.elicit_progress?.completed_step_ids.length ?? 0) > 0,
    [profile],
  );

  return (
    <div className="app">
      <a className="skip" href="#main">Skip to the main content</a>

      <header className="topbar">
        <a className="brand" href="#main" onClick={(e) => { e.preventDefault(); setScreen(SCREEN.WELCOME); }}>
          Groundwork
        </a>

        <div className="tools">
          <span className="small" id="text-size-label">Text size</span>
          <div role="group" aria-labelledby="text-size-label" className="btn-row" style={{ gap: '0.25rem' }}>
            {(['normal', 'large', 'larger'] as TextSize[]).map((s, i) => (
              <button
                key={s}
                type="button"
                className={textSize === s ? 'btn' : 'btn btn-secondary'}
                style={{ minHeight: '2.4em', minWidth: '2.6em', padding: '0.25em 0.6em' }}
                aria-pressed={textSize === s}
                onClick={() => setTextSize(s)}
              >
                <span aria-hidden="true" style={{ fontSize: `${0.85 + i * 0.3}em`, lineHeight: 1 }}>A</span>
                <span className="sr-only">{['Normal', 'Large', 'Largest'][i]} text</span>
              </button>
            ))}
          </div>
          {started && (
            <button type="button" className="btn btn-ghost" onClick={restart}>Start over</button>
          )}
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <div className="stack-lg">
          {usingFallback && (
            <div className="notice notice-warn page" role="note">
              <p className="notice-title">Running on example rules</p>
              <p className="small">
                No files found in <code>/data/rules/</code>, so these three schemes come from the
                built-in examples. They follow the documented criteria but are not the
                source-verified versions. Drop the real rule files in and this banner disappears.
              </p>
            </div>
          )}

          {screen === SCREEN.WELCOME && (
            <Welcome
              hasSaved={started}
              onStart={() => { update(createEmptyProfile()); setScreen(SCREEN.INTAKE); }}
              onResume={() => setScreen(SCREEN.INTAKE)}
              onSeed={(seeded) => { update(seeded); setScreen(SCREEN.INTAKE); }}
            />
          )}

          {screen === SCREEN.INTAKE && (
            <Intake
              profile={profile}
              onProfile={update}
              onDone={() => setScreen(SCREEN.READINESS_MAP)}
            />
          )}

          {screen === SCREEN.READINESS_MAP && (
            <ReadinessMap
              profile={profile}
              onOpenGrant={(id) => { setGrantId(id); setScreen(SCREEN.GRANT_DETAIL); }}
              onReview={() => setScreen(SCREEN.PROFILE_REVIEW)}
              onBackToIntake={() => setScreen(SCREEN.INTAKE)}
            />
          )}

          {screen === SCREEN.GRANT_DETAIL && grantId && (
            <GrantDetail
              profile={profile}
              grantId={grantId}
              onBack={() => setScreen(SCREEN.READINESS_MAP)}
              onDraft={() => setScreen(SCREEN.DRAFT)}
            />
          )}

          {screen === SCREEN.DRAFT && grantId && (
            <Draft
              profile={profile}
              grantId={grantId}
              onBack={() => setScreen(SCREEN.GRANT_DETAIL)}
            />
          )}

          {screen === SCREEN.PROFILE_REVIEW && (
            <ProfileReview
              profile={profile}
              onProfile={update}
              onBack={() => setScreen(SCREEN.READINESS_MAP)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
