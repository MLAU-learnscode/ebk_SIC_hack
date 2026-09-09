const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.3 x 7.5
pres.author = 'Vibe For Good 2026 — Challenge Statement #3';
pres.title = 'Groundwork';

/* ── palette ────────────────────────────────────────────────────────────── */
const INK = '123A47';
const INK_SOFT = '2C5566';
const TEAL = '1C7293';
const AMBER = 'C77D22';
const GREEN = '2E7D5B';
const MAROON = '8A5A5A';
const WHITE = 'FFFFFF';
const TINT = 'EDF2F3';
const TINT_G = 'E4EFEA';
const TINT_A = 'F7EEE1';
const MUTED = '6B7C83';
const RULE = 'D5DFE2';

const H = 'Cambria';
const B = 'Calibri';
const W = 13.3, HT = 7.5, M = 0.62;

/* ── helpers ────────────────────────────────────────────────────────────── */
const dark = () => { const s = pres.addSlide(); s.background = { color: INK }; return s; };

function light(title, kicker, tag) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  if (kicker) s.addText(kicker.toUpperCase(), {
    x: M, y: 0.36, w: 9, h: 0.26, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 10.5, bold: true, charSpacing: 2, color: TEAL,
  });
  if (tag) {
    s.addShape(pres.ShapeType.roundRect, {
      x: W - M - 1.5, y: 0.32, w: 1.5, h: 0.34, rectRadius: 0.17,
      fill: { color: TINT }, line: { color: RULE, width: 0.75 },
    });
    s.addText(tag, {
      x: W - M - 1.5, y: 0.32, w: 1.5, h: 0.34, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 9.5, bold: true, color: MUTED, align: 'center', valign: 'middle',
    });
  }
  if (title) s.addText(title, {
    x: M, y: 0.66, w: W - M * 2 - 1.7, h: 0.6, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 27, bold: true, color: INK,
  });
  return s;
}
function card(s, { x, y, w, h, fill = TINT, line = RULE }) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.07, fill: { color: fill }, line: { color: line, width: 0.75 },
  });
}
function pill(s, { x, y, w, text, color, h = 0.28, fs = 9.5 }) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: h / 2, fill: { color }, line: { color, width: 0 } });
  s.addText(text, {
    x, y, w, h, isTextBox: true, margin: 0,
    fontFace: B, fontSize: fs, bold: true, color: WHITE, align: 'center', valign: 'middle',
  });
}
function src(s, text, y = HT - 0.52) {
  s.addText(text, {
    x: M, y, w: W - M * 2, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 8.5, italic: true, color: MUTED,
  });
}
function body(s, text, o) {
  s.addText(text, Object.assign({
    isTextBox: true, margin: 0, fontFace: B, fontSize: 12, color: INK_SOFT, lineSpacing: 16,
    valign: 'top',
  }, o));
}

/* ═══════════════════════════════════════ 1 · TITLE ═══════════════════════ */
{
  const s = dark();
  s.addText('Groundwork', {
    x: M, y: 1.62, w: 9.4, h: 1.05, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 56, bold: true, color: WHITE,
  });
  s.addText('The first funding application, for founders who have never written one.', {
    x: M, y: 2.74, w: 10.4, h: 0.5, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 18, color: 'BFD3D9',
  });
  s.addShape(pres.ShapeType.line, { x: M, y: 3.5, w: 2.2, h: 0, line: { color: TEAL, width: 2.25 } });

  const facts = [
    ['Who it is for', 'Singapore youth, 18–35, with a disability, pre-incorporation, applying for the first time'],
    ['What it does', 'Tells you what you qualify for before you spend the hours, then drafts the application with you'],
    ['Why it is different', 'It assumes you have no documents to upload, and follows one funder across all five of its stages'],
  ];
  facts.forEach(([k, v], i) => {
    const y = 3.82 + i * 0.72;
    s.addText(k, {
      x: M, y, w: 2.5, h: 0.3, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 11, bold: true, color: TEAL,
    });
    s.addText(v, {
      x: M + 2.6, y, w: 8.4, h: 0.6, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 12.5, color: 'BFD3D9', lineSpacing: 16,
    });
  });

  s.addText('Vibe For Good 2026  ·  Challenge Statement #3, Social Impact Catalyst', {
    x: M, y: 6.34, w: 12, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 10.5, color: '7B9EAA',
  });
  s.addText('13 slides and a 4-slide appendix. Slides 3, 9 and 10 document how we researched the problem and what we chose not to build; they are written to be read, not presented.', {
    x: M, y: 6.66, w: 12, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 10, italic: true, color: '5E8593',
  });
  s.addNotes(`[0:00-0:08] "This is Groundwork. It gets first-time founders through funding applications they've never written before." Do not read the slide.`);
}

/* ═══════════════════════════════════════ 2 · REN ═════════════════════════ */
{
  const s = light('Ren finds out five months in.', 'The founder we built for', 'Problem');

  card(s, { x: M, y: 1.46, w: 4.9, h: 4.5 });
  s.addText('Ren, 24', {
    x: M + 0.3, y: 1.72, w: 4.3, h: 0.42, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 21, bold: true, color: INK,
  });
  body(s, [
    { text: 'Visually impaired. Runs a peer-support group for young adults newly diagnosed with sight loss.', options: { breakLine: true } },
    { text: '', options: { breakLine: true, fontSize: 6 } },
    { text: 'Wants to turn it into disability-awareness training she sells to employers.', options: { breakLine: true } },
    { text: '', options: { breakLine: true, fontSize: 6 } },
    { text: 'At 19 she registered a tutoring company. It never traded. It was struck off.', options: { breakLine: true, bold: true, color: INK } },
    { text: '', options: { breakLine: true, fontSize: 6 } },
    { text: 'She has no idea that permanently disqualifies her from Startup SG Founder — a scheme she would otherwise be a textbook fit for.', options: { breakLine: true } },
    { text: '', options: { breakLine: true, fontSize: 6 } },
    { text: 'Today she learns this from a rejection, after months of work.', options: { italic: true } },
  ], { x: M + 0.3, y: 2.32, w: 4.3, h: 3.4, fontSize: 12.5, lineSpacing: 17.5 });

  const bx = M + 5.3;
  const rows = [
    ['1', 'Eligibility is invisible until you have already spent the hours',
      'Criteria sit on separate raiSE, EnterpriseSG and NYC pages, in different formats, none cross-referenced. Nothing tells a founder upfront that they already do not qualify.'],
    ['2', 'One funder makes you retell the venture five times',
      'raiSE VentureForGood is five stages over four to six months, each demanding the same venture described at greater depth. You cannot avoid this by choosing a different funder.'],
    ['3', 'The pipeline assumes a sighted, admin-fluent applicant',
      'Dense PDFs, portals that break screen readers, and an expectation that you produce a two-year financial projection and a formatted deck unaided.'],
  ];
  rows.forEach(([n, t, d], i) => {
    const y = 1.5 + i * 1.52;
    s.addShape(pres.ShapeType.ellipse, { x: bx, y: y + 0.02, w: 0.32, h: 0.32, fill: { color: TEAL }, line: { color: TEAL, width: 0 } });
    s.addText(n, { x: bx, y: y + 0.02, w: 0.32, h: 0.32, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    s.addText(t, { x: bx + 0.46, y, w: 6.5, h: 0.6, isTextBox: true, margin: 0, fontFace: B, fontSize: 14.5, bold: true, color: INK, lineSpacing: 18 });
    body(s, d, { x: bx + 0.46, y: y + 0.62, w: 6.5, h: 0.86, fontSize: 11.5, color: MUTED, lineSpacing: 15 });
  });

  src(s, 'Sources: raise.sg/ventureforgood-grant (five stages and their stated durations) · enterprisesg.gov.sg and Accredited Mentor Partner pages · nyc.gov.sg. Full register at A1.');
  s.addNotes(`[0:08-0:40 — 78 words. Slowest slide in the deck.]

"Ren is 24 and visually impaired. She runs a peer-support group for young adults losing their sight, and she wants to turn it into training she sells to employers.

At nineteen she registered a tutoring company. It never traded. It was struck off. She doesn't know that permanently disqualifies her from Startup SG Founder.

Right now she finds that out five months in, from a rejection email.

Three things are broken. Eligibility is invisible. One funder makes you retell your venture five times. And the whole pipeline assumes you can see."`);
}

/* ═══════════════════════════ 3 · HOW WE RESEARCHED ═══════════════════════ */
{
  const s = light('We read the funders’ own pages, not summaries of them.', 'Method', 'Research');

  const cols = [
    { t: 'What we did', c: TEAL, fill: TINT, items: [
      'Read the primary scheme pages for raiSE VentureForGood, Startup SG Founder and NYC Young ChangeMakers, and encoded each criterion separately',
      'Traced dependencies between schemes rather than treating them as a flat list',
      'Tagged every fact primary (a .gov.sg page), secondary, or unverified — and recorded the URL and the date checked',
      'Tested our own brief against the sources, and corrected it three times (slide 10)',
    ] },
    { t: 'What we could not confirm', c: AMBER, fill: TINT_A, items: [
      'Startup SG Founder’s current grant quantum and matching ratio — figures differ across sources and EnterpriseSG’s own page did not resolve',
      'Whether accepting a small grant formally closes off a later one. We surface it as a question to ask the funder, never as fact',
      'Any dedicated entrepreneurship track for disabled founders in Singapore. We found none — which is not the same as proving none exists',
    ] },
    { t: 'What that changed', c: GREEN, fill: TINT_G, items: [
      'Unverified figures are never allowed to block a founder. They appear as advisory notes only',
      'Every rule ships with its source URL and last-checked date, visible in the product, not just in our notes',
      'Claims about competitors are attributed to industry reviews, never asserted as our own findings',
    ] },
  ];
  cols.forEach((c, i) => {
    const x = M + i * 4.12;
    card(s, { x, y: 1.44, w: 3.86, h: 4.5, fill: c.fill });
    pill(s, { x: x + 0.26, y: 1.68, w: 1.86, text: c.t, color: c.c, h: 0.3, fs: 10 });
    body(s, c.items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c.items.length - 1 } })),
      { x: x + 0.26, y: 2.12, w: 3.34, h: 3.6, fontSize: 11, color: INK_SOFT, lineSpacing: 14.5, paraSpaceAfter: 9 });
  });

  src(s, 'We did not use any figure we could not trace to a page we had read. Where the number mattered and the page did not resolve, the figure is absent from this deck.');
  s.addNotes(`Not spoken in the 4 minutes. This slide exists so a judge reading the deck cold can see the work behind the rules engine.

If asked in Q&A: "Every criterion in the engine came off the funder's own page, and each one carries the URL and the date we checked it. Where we couldn't verify a number, it doesn't block anyone — it shows up as a note telling the founder to confirm."`);
}

/* ═══════════════════════ 4 · THE TWO STRUCTURAL GAPS ═════════════════════ */
{
  const s = light('Two gaps, and only one of them is avoidable.', 'Analysis', 'Problem');

  card(s, { x: M, y: 1.4, w: 6.06, h: 2.06 });
  pill(s, { x: M + 0.26, y: 1.62, w: 1.5, text: 'Cold start', color: TEAL });
  body(s, 'Every AI grant tool begins by ingesting what you have already written — past proposals, annual reports, logic models, outcome reports. A pre-incorporation founder has produced none of these. The tools are not badly built; they are built for organisations that already exist.',
    { x: M + 0.26, y: 2.04, w: 5.54, h: 1.26, fontSize: 12 });

  card(s, { x: M + 6.42, y: 1.4, w: 6.06, h: 2.06, fill: TINT_G, line: GREEN });
  pill(s, { x: M + 6.68, y: 1.62, w: 2.4, text: 'Vertical progression', color: GREEN });
  body(s, 'Every tool is built to fill one form, once. One funder makes you narrate the same venture five times, each at greater depth, over four to six months. A founder can dodge the first gap by picking a single funder. Nobody can dodge this one — which is why we treat it as the sharper claim.',
    { x: M + 6.68, y: 2.04, w: 5.54, h: 1.26, fontSize: 12, color: '1F4A38' });

  s.addText('raiSE VentureForGood, as raiSE describes it', {
    x: M, y: 3.68, w: 8, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 11, bold: true, charSpacing: 1, color: MUTED,
  });

  const stages = [
    ['1', 'Submit', 'Pitch deck +\nmanagement accounts', '3 weeks'],
    ['2', 'First meeting', 'One-to-one with a\nportfolio manager', '3 weeks'],
    ['3', 'Shortlisting', 'Only raiSE members\nproceed', '3 weeks'],
    ['4', 'Final evaluation', 'Detailed proposal +\n2-year projections', '4–8 weeks'],
    ['5', 'Committee pitch', 'Evaluation\ncommittee', '4–8 weeks'],
  ];
  stages.forEach(([n, t, d, dur], i) => {
    const x = M + i * 2.48;
    const gate = i === 2;
    card(s, { x, y: 4.06, w: 2.28, h: 1.72, fill: gate ? TINT_A : WHITE, line: gate ? AMBER : RULE });
    s.addText(`${n}. ${t}`, { x: x + 0.18, y: 4.2, w: 1.96, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 12, bold: true, color: gate ? AMBER : INK });
    body(s, d, { x: x + 0.18, y: 4.52, w: 1.96, h: 0.7, fontSize: 10.5, color: MUTED, lineSpacing: 13.5 });
    s.addText(dur, { x: x + 0.18, y: 5.32, w: 1.96, h: 0.28, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, bold: true, color: INK });
  });
  s.addText('Four to six months before any money — and the membership gate at stage 3 is invisible at stage 1.', {
    x: M, y: 5.94, w: 12, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 12, bold: true, italic: true, color: AMBER,
  });

  src(s, 'Stage names and durations are raiSE’s own, published on raise.sg/ventureforgood-grant.');
  s.addNotes(`[0:40-1:00 — part of the 74-word block with slide 5.]

"Every AI grant tool starts by asking you to upload your past proposals, your annual report, your logic model. Ren has none of those. That's the cold-start gap.

And every one of them is built to fill one form, once. Ren's funder makes her retell the same venture five times over four to six months. You can dodge the first gap by picking one funder. You cannot dodge this one."`);
}

/* ═══════════════════════════ 5 · COMPETITORS ═════════════════════════════ */
{
  const s = light('Nobody covers both gaps, and nobody covers Singapore.', 'Landscape', 'Viability');

  const cols = [
    { name: 'GoBusiness', sub: 'SG gov directory', v: ['◐', '○', '○', '○'], stop: 'Search-shaped, not answer-shaped. Returns schemes; you do the cross-referencing. No VentureForGood, no drafting.' },
    { name: 'SME Centres', sub: 'SG gov advisory', v: ['◐', '○', '○', '○'], stop: 'Free and genuinely good, but capacity-bound, appointment-based, SME-framed, and assumes a business that already operates.' },
    { name: 'Grantable', sub: 'US SaaS', v: ['○', '●', '○', '○'], stop: 'Requires the documents you do not have. No eligibility gate. Its unit of work is one document, not a funnel.' },
    { name: 'Instrumentl', sub: 'US SaaS', v: ['◐', '◐', '◐', '○'], stop: 'US funder database — surfaces no Singapore grants. Priced and shaped for teams managing 20+ relationships.' },
    { name: 'Groundwork', sub: 'us', v: ['●', '●', '●', '●'], stop: 'Built for the founder with nothing to upload, following one funder across every stage.' },
  ];
  const labels = ['Eligibility answered upfront', 'Reformats across funders', 'Follows one funder across stages', 'Accessible by design'];
  const tx = M, ty = 1.44, lw = 3.0, cw = 1.88, rh = 0.5;

  labels.forEach((l, r) => s.addText(l, {
    x: tx, y: ty + 0.56 + r * rh, w: lw - 0.14, h: rh, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 11.5, color: INK, valign: 'middle',
  }));

  cols.forEach((c, i) => {
    const x = tx + lw + i * cw;
    const us = i === 4;
    if (us) s.addShape(pres.ShapeType.roundRect, {
      x: x - 0.05, y: ty - 0.1, w: cw - 0.08, h: 0.66 + 4 * rh + 0.12,
      rectRadius: 0.07, fill: { color: TINT_G }, line: { color: GREEN, width: 1 },
    });
    s.addText(c.name, { x, y: ty, w: cw - 0.16, h: 0.26, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, bold: true, color: us ? GREEN : INK, align: 'center' });
    s.addText(c.sub, { x, y: ty + 0.24, w: cw - 0.16, h: 0.24, isTextBox: true, margin: 0, fontFace: B, fontSize: 9, italic: true, color: MUTED, align: 'center' });
    c.v.forEach((mk, r) => s.addText(mk, {
      x, y: ty + 0.56 + r * rh, w: cw - 0.16, h: rh, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 16, color: mk === '●' ? (us ? GREEN : INK) : mk === '◐' ? AMBER : 'B9C6CB',
      align: 'center', valign: 'middle',
    }));
  });
  s.addText('●  full        ◐  partial        ○  none', {
    x: tx, y: ty + 2.66, w: 4, h: 0.26, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 9.5, color: MUTED,
  });

  s.addText('Where each one stops', {
    x: M, y: 4.24, w: 6, h: 0.28, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 11, bold: true, charSpacing: 1, color: MUTED,
  });
  cols.forEach((c, i) => {
    const x = M + i * 2.5;
    s.addText(c.name, { x, y: 4.56, w: 2.3, h: 0.26, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, bold: true, color: i === 4 ? GREEN : INK });
    body(s, c.stop, { x, y: 4.84, w: 2.3, h: 1.1, fontSize: 10, color: MUTED, lineSpacing: 13 });
  });

  s.addText('Grantable helps organisations that have already written things write more things faster. Our founders have never written anything.', {
    x: M, y: 6.06, w: 12, h: 0.4, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 14.5, bold: true, color: INK,
  });

  src(s, 'Pricing, positioning and feature claims for Grantable and Instrumentl are per published industry reviews, not our own testing. We found no agentic tool covering Singapore social enterprise and youth grants.');
  s.addNotes(`[1:00-1:10]

"The third row is the one that matters — following a single funder across every stage. Nobody else solves it.

Grantable helps organisations that have already written things write more things faster. Our founders have never written anything."

If pressed on competitors: say "according to industry reviews". Never assert their pricing as fact.`);
}

/* ═══════════════════════════ 6 · WHAT WE BUILT ═══════════════════════════ */
{
  const s = light('Three parts, one profile, one guarantee.', 'Solution', 'Solution');

  const mods = [
    { tag: 'Gap 1', c: TEAL, n: 'Readiness Check',
      d: 'The founder talks; we build a structured profile and test it against hand-written rules.',
      ai: 'AI turns free speech into structured fields.',
      guard: 'Eligibility is decided by a rules engine, never by a model. Every result carries its source and last-checked date.' },
    { tag: 'Gap 2', c: AMBER, n: 'One profile, many applications',
      d: 'Every funder and every stage drafts from the same profile. Nothing is ever retyped.',
      ai: 'AI drafts funder-formatted answers and a first-pass projection.',
      guard: 'Nothing submits without founder review. Every AI-supplied number carries a visible gap flag.' },
    { tag: 'Gap 3', c: GREEN, n: 'Accessible-first intake',
      d: 'One question per screen, voice input, no time limits, plain language beside the funder’s own words.',
      ai: 'AI rewrites jargon on demand and says answers back for confirmation.',
      guard: 'Plain language sits alongside the real term, never replacing it — she must recognise it on the real form.' },
  ];
  mods.forEach((m, i) => {
    const x = M + i * 4.12;
    card(s, { x, y: 1.4, w: 3.86, h: 3.7 });
    pill(s, { x: x + 0.26, y: 1.62, w: 0.94, text: m.tag, color: m.c });
    s.addText(m.n, { x: x + 0.26, y: 2.02, w: 3.34, h: 0.6, isTextBox: true, margin: 0, fontFace: H, fontSize: 16, bold: true, color: INK, lineSpacing: 20 });
    body(s, m.d, { x: x + 0.26, y: 2.66, w: 3.34, h: 0.8, fontSize: 11.5 });
    s.addText('AI does', { x: x + 0.26, y: 3.5, w: 3.34, h: 0.22, isTextBox: true, margin: 0, fontFace: B, fontSize: 9, bold: true, charSpacing: 1, color: m.c });
    body(s, m.ai, { x: x + 0.26, y: 3.72, w: 3.34, h: 0.5, fontSize: 10.5, color: MUTED, lineSpacing: 13 });
    s.addText('Guardrail', { x: x + 0.26, y: 4.24, w: 3.34, h: 0.22, isTextBox: true, margin: 0, fontFace: B, fontSize: 9, bold: true, charSpacing: 1, color: m.c });
    body(s, m.guard, { x: x + 0.26, y: 4.46, w: 3.34, h: 0.62, fontSize: 10.5, color: MUTED, lineSpacing: 13 });
  });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.36, w: W - M * 2, h: 1.16, rectRadius: 0.07, fill: { color: INK }, line: { color: INK, width: 0 } });
  s.addText([
    { text: 'AI drafts, extracts and translates. It never decides eligibility and it never submits.', options: { breakLine: true, bold: true, fontSize: 16 } },
    { text: 'Every output shows a visible seam: what the founder said, and what we estimated on her behalf.', options: { fontSize: 12.5, color: 'BFD3D9' } },
  ], { x: M + 0.32, y: 5.52, w: W - M * 2 - 0.64, h: 0.88, isTextBox: true, margin: 0, fontFace: B, color: WHITE, lineSpacing: 22 });

  s.addNotes(`[1:10-1:32 — 52 words]

"Three parts. A readiness check that tells you where you stand before you spend the hours. One profile that feeds every funder and every stage. And an intake built for someone using a screen reader.

One line to remember: AI drafts, extracts and translates. It never decides eligibility, and it never submits."`);
}

/* ═══════════════════════════ 7 · DEMO STORYBOARD ═════════════════════════ */
{
  const s = light('What the founder actually sees.', 'Prototype', 'Demo');

  const beats = [
    { n: '1', t: 'Intake, mid-conversation', d: 'One question per screen. She can speak instead of type. The screen says back what it understood — “you help around forty people a year, have I got that right?” — and she corrects it here, not five months later.' },
    { n: '2', t: 'The readiness map', d: 'Three grants, three different answers, each with the funder’s own link and the date we checked it. Green ticks show what she already satisfies, even on the card that says no.' },
    { n: '3', t: 'The blocked one, in order', d: 'Not a checklist — a sequence. Register with ACRA, then apply to raiSE, because raiSE will not accept an unregistered business. Reversing those two steps asks her to do something impossible.' },
    { n: '4', t: 'The draft, with its seams showing', d: 'A funder-formatted answer built from her profile, with every number we estimated highlighted so she confirms it before a funder ever sees it.' },
  ];
  beats.forEach((b, i) => {
    const y = 1.42 + i * 1.2;
    s.addShape(pres.ShapeType.ellipse, { x: M, y: y + 0.02, w: 0.32, h: 0.32, fill: { color: TEAL }, line: { color: TEAL, width: 0 } });
    s.addText(b.n, { x: M, y: y + 0.02, w: 0.32, h: 0.32, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    s.addText(b.t, { x: M + 0.46, y, w: 7.1, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 13.5, bold: true, color: INK });
    body(s, b.d, { x: M + 0.46, y: y + 0.32, w: 7.1, h: 0.82, fontSize: 11, color: MUTED, lineSpacing: 14 });
  });

  card(s, { x: 8.34, y: 1.42, w: 4.34, h: 4.5 });
  s.addText('Readiness map — Ren’s three results', {
    x: 8.6, y: 1.64, w: 3.9, h: 0.28, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 10, bold: true, charSpacing: 1, color: MUTED,
  });
  const states = [
    ['Young ChangeMakers', 'You can apply now', GREEN, 'All four criteria met.'],
    ['VentureForGood (Youth)', 'You can apply after 2 steps', AMBER, '1. Register with ACRA  ·  ~1 week\n2. Join raiSE  ·  4–8 weeks'],
    ['Startup SG Founder', 'Not a fit right now', MAROON, 'The company she registered at 19 closes this permanently. We say so, and why.'],
  ];
  states.forEach(([g, st, c, note], i) => {
    const y = 2.02 + i * 1.32;
    card(s, { x: 8.6, y, w: 3.82, h: 1.14, fill: WHITE, line: c });
    s.addText(g, { x: 8.78, y: y + 0.12, w: 3.5, h: 0.26, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, bold: true, color: INK });
    s.addText(st, { x: 8.78, y: y + 0.38, w: 3.5, h: 0.24, isTextBox: true, margin: 0, fontFace: B, fontSize: 10.5, bold: true, color: c });
    body(s, note, { x: 8.78, y: y + 0.62, w: 3.5, h: 0.46, fontSize: 9.5, color: MUTED, lineSpacing: 12 });
  });

  src(s, 'Demoed live from the presenting laptop. The readiness map is a pure function over local rule files — it runs with the network disconnected.');
  s.addNotes(`[1:32-3:02 — 90 SECONDS. THE MOST HEAVILY SCORED PART OF THE PITCH.]

Open already mid-conversation. Do NOT type questions live.

BEAT 1 (20s) — "Ren has been talking for two minutes. Notice it doesn't just take what she said, it says it back: 'So you'd be training employers, and you help around forty people a year. Have I got that right?' She corrects it here, not five months later."

BEAT 2 (25s) — "Three grants. Three different answers. Young ChangeMakers: apply now. VentureForGood: after two steps. Startup SG Founder: not a fit, and we tell her why — that struck-off company from when she was nineteen. Five months of work she now doesn't do."

BEAT 3 (25s) — "And it's not a checklist, it's an order. ACRA first, then raiSE, because raiSE won't accept an unregistered business. Reverse those and you've told her to do something impossible."

BEAT 4 (20s) — "Here's her answer in the funder's format. This highlight is the seam — that number came from us, not her. She confirms it before it goes near a funder."

IF IT BREAKS: talk the four beats off this slide, say "the engine behind it runs offline — I'll show you after", and move on. Do not debug on stage.`);
}

/* ═══════════════════════════ 8 · ARCHITECTURE ════════════════════════════ */
{
  const s = light('The part that decides has no model in it.', 'How it works', 'Feasibility');

  card(s, { x: M, y: 1.4, w: 5.96, h: 2.66 });
  pill(s, { x: M + 0.28, y: 1.62, w: 1.44, text: 'The model does', color: TEAL });
  body(s, [
    { text: 'Draws facts out of a founder who has never written them down', options: { bullet: true, breakLine: true } },
    { text: 'Says them back for confirmation before storing them', options: { bullet: true, breakLine: true } },
    { text: 'Formats answers into each funder’s own wording', options: { bullet: true, breakLine: true } },
    { text: 'Rewrites jargon into plain language on request', options: { bullet: true, breakLine: true } },
    { text: 'Marks every value it supplied rather than heard', options: { bullet: true } },
  ], { x: M + 0.28, y: 2.06, w: 5.4, h: 1.86, fontSize: 11.5, paraSpaceAfter: 6 });

  card(s, { x: M + 6.24, y: 1.4, w: 5.96, h: 2.66, fill: TINT_G, line: GREEN });
  pill(s, { x: M + 6.52, y: 1.62, w: 2.06, text: 'A pure function does', color: GREEN });
  body(s, [
    { text: 'Decides eligibility, from rules we wrote by hand', options: { bullet: true, breakLine: true } },
    { text: 'Cites a source URL and a last-checked date on every rule', options: { bullet: true, breakLine: true } },
    { text: 'Separates “not asked yet” from “answered no” — an empty profile shows unknowns, never rejections', options: { bullet: true, breakLine: true } },
    { text: 'Returns the same answer for the same input, every time', options: { bullet: true, breakLine: true } },
    { text: 'Runs with the network disconnected', options: { bullet: true } },
  ], { x: M + 6.52, y: 2.06, w: 5.4, h: 1.86, fontSize: 11.5, color: '1F4A38', paraSpaceAfter: 6 });

  s.addText('That split is the whole soundness argument: a model cannot invent an eligibility result, because no model is in that path.', {
    x: M, y: 4.22, w: 12, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 12.5, bold: true, italic: true, color: INK,
  });

  const stats = [
    ['36', 'automated tests on the\nrules engine, all passing'],
    ['3', 'grant schemes encoded, each\ncriterion traced to its source'],
    ['$0', 'to build and to run — no paid\nAPI, no paid hosting'],
    ['0', 'API keys anywhere in the\nrepository or the browser'],
  ];
  stats.forEach(([n, l], i) => {
    const x = M + i * 3.1;
    card(s, { x, y: 4.66, w: 2.86, h: 1.28 });
    s.addText(n, { x: x + 0.22, y: 4.8, w: 1.0, h: 0.6, isTextBox: true, margin: 0, fontFace: H, fontSize: 30, bold: true, color: INK });
    body(s, l, { x: x + 1.06, y: 4.86, w: 1.64, h: 0.94, fontSize: 9.5, color: MUTED, lineSpacing: 12 });
  });

  src(s, 'There is no public API for Singapore grant criteria — not GoBusiness, not raiSE, not EnterpriseSG. Rules are hand-authored and auditable by anyone. Company verification uses the free data.gov.sg ACRA dataset.');
  s.addNotes(`[3:02-3:22 — 48 words]

"The obvious question is what happens when the AI gets eligibility wrong. It can't. Eligibility isn't generated — it's a lookup against rules we wrote by hand, each carrying the funder's own URL and the date we checked it.

The screen you just saw works with the wifi switched off. That's the same design decision that makes it free to run."

IF ASKED whether the demo is live: "The eligibility engine you saw IS live — deterministic by design, which is why it can't hallucinate. The drafting outputs are pre-generated so the demo doesn't depend on venue wifi."`);
}

/* ═══════════════════ 9 · DECISIONS AND TRADE-OFFS ════════════════════════ */
{
  const s = light('What we chose not to do, and why.', 'Design decisions', 'Rigour');

  const rows = [
    ['Alternative credit scoring for the informal economy',
      'Rejected for this build',
      'A real problem, and tempting. But we cannot demo a lender agreeing to underwrite on it, and it drags a student prototype into credit regulation. On the roadmap, not in the product.'],
    ['Myinfo Business auto-fill',
      'Mocked, labelled roadmap',
      'It proves our thesis — never re-enter what the system already knows. But integration needs a government-assessed linkup through the Singpass partner portal, which is not obtainable in three days. And it cannot help Ren: she has no ACRA record to prefill.'],
    ['Putting a model in the eligibility path',
      'Ruled out permanently',
      'It would be easier to build and impossible to defend. A wrong eligibility answer is one a founder acts on for months. Determinism is not a limitation here, it is the product.'],
    ['Blocking on unverified figures',
      'Ruled out',
      'Startup SG Founder’s matching ratio appears only in vendor blogs. Blocking a founder on a number we could not verify is precisely the failure this product exists to prevent, so it is advisory only.'],
    ['Using disability data in eligibility',
      'Walled off in the schema',
      'Access needs shape the interface and nothing else. No rule file is permitted to read that field, and the build fails if one tries. Accessibility is our design constraint, never an eligibility input.'],
  ];
  rows.forEach(([t, verdict, why], i) => {
    const y = 1.36 + i * 1.02;
    card(s, { x: M, y, w: W - M * 2, h: 0.92, fill: i % 2 ? WHITE : TINT, line: RULE });
    s.addText(t, { x: M + 0.24, y: y + 0.13, w: 3.5, h: 0.66, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, bold: true, color: INK, valign: 'middle', lineSpacing: 14 });
    s.addText(verdict, { x: M + 3.86, y: y + 0.13, w: 1.9, h: 0.66, isTextBox: true, margin: 0, fontFace: B, fontSize: 10.5, bold: true, color: MAROON, valign: 'middle', lineSpacing: 13 });
    body(s, why, { x: M + 5.9, y: y + 0.11, w: 6.14, h: 0.72, fontSize: 10.5, color: MUTED, lineSpacing: 13, valign: 'middle' });
  });

  src(s, 'Scope discipline was a deliberate choice: three screens that work beat eight that do not, and every cut above bought time for the eligibility engine.');
  s.addNotes(`Not spoken in the 4 minutes — this is for the reader, and it is the answer to "did you actually think about this, or did you just generate it?"

If asked in Q&A why no credit scoring: "Real problem. But we can't demo a lender agreeing to underwrite on it, and it puts a student prototype inside credit regulation. It's on the roadmap."`);
}

/* ═══════════════════ 10 · CORRECTIONS WE MADE ════════════════════════════ */
{
  const s = light('Three things we got wrong, and caught.', 'Source discipline', 'Rigour');

  body(s, 'Our own working brief contained errors. We found them by checking it against the funders’ pages rather than trusting the summary we had written. Each of these would have been visible to a judge who knows the sector.',
    { x: M, y: 1.32, w: 9.6, h: 0.6, fontSize: 12.5, color: INK });

  const items = [
    { wrong: 'VentureForGood (Youth) awards up to S$300,000',
      right: 'S$300,000 is the general VentureForGood track. The youth track is a different, much smaller figure.',
      lesson: 'The number is absent from this deck rather than guessed. Putting it beside the word “Youth” would have been a factual error on a slide.' },
    { wrong: 'raiSE expects an SSO partnership for unincorporated applicants',
      right: 'raiSE says VWO — Voluntary Welfare Organisation. A Social Service Office is a different kind of body entirely.',
      lesson: 'The product now shows the funder’s own term everywhere a founder reads it, so she recognises the wording on the real form.' },
    { wrong: 'A blocking criterion with no fix means “permanently disqualified”',
      right: 'Then forgetting to write the fix looks identical to deciding someone is beyond help.',
      lesson: 'Rules must now declare a remedy or state a terminal reason explicitly. The build fails if a criterion does neither.' },
  ];
  items.forEach((it, i) => {
    const x = M + i * 4.12;
    card(s, { x, y: 2.1, w: 3.86, h: 3.86 });
    pill(s, { x: x + 0.26, y: 2.32, w: 1.34, text: 'We believed', color: MAROON });
    body(s, it.wrong, { x: x + 0.26, y: 2.72, w: 3.34, h: 0.72, fontSize: 11.5, color: INK, lineSpacing: 15 });
    pill(s, { x: x + 0.26, y: 3.5, w: 1.34, text: 'Actually', color: GREEN });
    body(s, it.right, { x: x + 0.26, y: 3.9, w: 3.34, h: 0.94, fontSize: 11, color: INK_SOFT, lineSpacing: 14 });
    s.addText('What changed', { x: x + 0.26, y: 4.9, w: 3.34, h: 0.22, isTextBox: true, margin: 0, fontFace: B, fontSize: 9, bold: true, charSpacing: 1, color: TEAL });
    body(s, it.lesson, { x: x + 0.26, y: 5.12, w: 3.34, h: 0.76, fontSize: 10.5, color: MUTED, lineSpacing: 13 });
  });

  src(s, 'We treat “we found no evidence of X” and “X does not exist” as different statements, and only ever claim the first.');
  s.addNotes(`Not spoken unless there is time or a judge asks how we know the rules are right.

Strong Q&A answer: "Our own brief had three errors in it. We caught them by going back to the funders' pages. That's why every rule in the engine carries its source URL and the date we checked it — so the next error is findable too."`);
}

/* ═══════════════════════════ 11 · IMPACT ═════════════════════════════════ */
{
  const s = light('Built for the hardest case, on purpose.', 'Impact and scale', 'Impact');

  const tiers = [
    ['Now', TEAL, 'Singapore youth aged 18–35, with a disability, pre-incorporation, applying for the first time.', 'The wedge. Accessibility is the design constraint that produces the differentiator.'],
    ['Next', AMBER, 'Low-income youth in informal micro-business — home-based food, gig work, tuition.', 'Same cold start, same forms, no new product surface needed.'],
    ['Then', GREEN, 'Underserved youth across ASEAN, the challenge statement’s “developing countries” clause.', 'Rules are data, not code. A new country is a new rules file, reviewed by a local partner.'],
  ];
  tiers.forEach(([k, c, d, why], i) => {
    const y = 1.4 + i * 1.16;
    pill(s, { x: M, y: y + 0.14, w: 0.84, text: k, color: c });
    s.addText(d, { x: M + 1.04, y, w: 6.4, h: 0.56, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, bold: true, color: INK, lineSpacing: 16 });
    body(s, why, { x: M + 1.04, y: y + 0.56, w: 6.4, h: 0.46, fontSize: 11, color: MUTED, lineSpacing: 14 });
  });

  card(s, { x: 8.24, y: 1.4, w: 4.44, h: 3.48 });
  s.addText('32.7%', { x: 8.52, y: 1.62, w: 3.9, h: 0.66, isTextBox: true, margin: 0, fontFace: H, fontSize: 36, bold: true, color: INK });
  body(s, 'employment rate for persons with disabilities in Singapore, 2022/2023. The national target is 40% by 2030.',
    { x: 8.52, y: 2.3, w: 3.9, h: 0.86, fontSize: 11, color: MUTED, lineSpacing: 14 });
  s.addText('We found no dedicated entrepreneurship track for disabled founders here.', {
    x: 8.52, y: 3.22, w: 3.9, h: 0.7, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, bold: true, color: INK, lineSpacing: 15,
  });
  body(s, 'Employment is being worked on. Self-employment is not. We state this as a gap we could not disprove, not a proven absence.',
    { x: 8.52, y: 3.94, w: 3.9, h: 0.8, fontSize: 10.5, color: MUTED, lineSpacing: 13.5 });

  s.addText('What we would measure', {
    x: M, y: 5.06, w: 6, h: 0.28, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, bold: true, charSpacing: 1, color: MUTED,
  });
  const metrics = [
    ['Founders who reach a decision', 'rather than abandoning mid-process'],
    ['Applications completed', 'per founder, and per advisory hour spent'],
    ['Time to first “no”', 'the earlier a bad fit surfaces, the more it is worth'],
  ];
  metrics.forEach(([m, d], i) => {
    const x = M + i * 4.12;
    s.addText(m, { x, y: 5.38, w: 3.9, h: 0.28, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, bold: true, color: INK });
    body(s, d, { x, y: 5.66, w: 3.9, h: 0.5, fontSize: 10.5, color: MUTED, lineSpacing: 13 });
  });

  src(s, 'Disability employment figures: Ministry of Social and Family Development.');
  s.addNotes(`[3:22-3:40 — 44 words]

"We built for the hardest case on purpose. Design that works for a founder using a screen reader works for everyone behind her.

Persons with disabilities in Singapore have a 32.7% employment rate. Employment is being worked on. Self-employment isn't — we found no dedicated track."

Always "we found no", never "there is no".`);
}

/* ═══════════════════════════ 12 · VIABILITY ══════════════════════════════ */
{
  const s = light('Free for founders. The intermediary pays.', 'Business model', 'Viability');

  card(s, { x: M, y: 1.4, w: 6.06, h: 2.5 });
  body(s, [
    { text: 'raiSE, SG Enable and Accredited Mentor Partners such as NUS Enterprise and SMU IIE screen these founders by hand today. The mentor partner route exists precisely because first-time founders need something drawn out of them before they can apply — and it does not scale.', options: { breakLine: true } },
    { text: '', options: { breakLine: true, fontSize: 7 } },
    { text: 'We hand them pre-qualified, complete applications and take the mechanical eighty percent off their desks, so their scarce hours go to judgement calls.', options: {} },
  ], { x: M + 0.28, y: 1.64, w: 5.5, h: 2.06, fontSize: 12, lineSpacing: 16 });

  card(s, { x: M + 6.42, y: 1.4, w: 6.06, h: 2.5, fill: TINT_A, line: AMBER });
  s.addText('Stated honestly', { x: M + 6.7, y: 1.62, w: 5.5, h: 0.28, isTextBox: true, margin: 0, fontFace: B, fontSize: 10, bold: true, charSpacing: 1, color: AMBER });
  body(s, [
    { text: 'This is a pathway to revenue, not confirmed revenue. Nobody has told us they would pay.', options: { breakLine: true, bold: true, color: INK } },
    { text: '', options: { breakLine: true, fontSize: 7 } },
    { text: 'We are not replacing advisors and would not claim to. We feed their pipeline. The validation step we would run next is a single conversation with one intermediary about screening cost per applicant — not a pilot, not a letter of intent, just the number.', options: {} },
  ], { x: M + 6.7, y: 1.96, w: 5.5, h: 1.76, fontSize: 12, lineSpacing: 16 });

  s.addText('Team and how we worked', {
    x: M, y: 4.08, w: 6, h: 0.28, isTextBox: true, margin: 0, fontFace: B, fontSize: 11, bold: true, charSpacing: 1, color: MUTED,
  });
  const team = [
    ['Experience Lead', 'Screens, voice input, accessibility, the demo click path.'],
    ['Intelligence Lead', 'Profile schema, elicitation and drafting pipeline, ACRA lookup, integration.'],
    ['Rules & Strategy Lead', 'Grant rules and source verification, stage model, eligibility specification, competitive analysis.'],
  ];
  team.forEach(([r, d], i) => {
    const x = M + i * 4.12;
    card(s, { x, y: 4.4, w: 3.86, h: 1.16 });
    s.addText(r, { x: x + 0.24, y: 4.56, w: 3.4, h: 0.28, isTextBox: true, margin: 0, fontFace: B, fontSize: 12, bold: true, color: INK });
    body(s, d, { x: x + 0.24, y: 4.84, w: 3.4, h: 0.62, fontSize: 10.5, color: MUTED, lineSpacing: 13 });
  });
  s.addText('Three people, three days. The data schema was frozen on day one and the rules author never wrote the engine that reads them — so every rule is reviewable by someone who did not write the code.', {
    x: M, y: 5.72, w: 12, h: 0.44, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 11, italic: true, color: MUTED, lineSpacing: 14,
  });

  s.addNotes(`[3:40-4:05 — 60 words]

"Founders never pay. The intermediaries do — raiSE, SG Enable, the mentor partners who screen these applications by hand today. They get pre-qualified, complete applications instead of half-finished ones.

To be straight with you: that's a pathway to revenue, not confirmed revenue. Nobody has told us they'd pay yet.

Three of us, three days, and every rule in the engine cites its source."

Say the "not confirmed revenue" line out loud. It defuses the obvious question and judges reward it.`);
}

/* ═══════════════════════════ 13 · CLOSE ══════════════════════════════════ */
{
  const s = dark();
  s.addText('Ren finds out on day one,\nnot month five.', {
    x: M, y: 1.44, w: 10.6, h: 1.7, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 40, bold: true, color: WHITE, lineSpacing: 50,
  });

  const halves = [
    ['Singapore already built half of this', 'Myinfo Business proves you should never re-enter what the system already knows. It cannot help a founder with no ACRA record yet.'],
    ['And the other half', 'The Accredited Mentor Partner network proves first-time founders need something drawn out of them before they can apply. It does not scale, and it gates on whether you are worth a mentor’s hour.'],
  ];
  halves.forEach(([t, d], i) => {
    const x = M + i * 6.24;
    s.addShape(pres.ShapeType.roundRect, { x, y: 3.42, w: 5.92, h: 1.72, rectRadius: 0.07, fill: { color: '1B4A59' }, line: { color: '2C6577', width: 1 } });
    s.addText(t, { x: x + 0.28, y: 3.62, w: 5.36, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 12.5, bold: true, color: WHITE });
    s.addText(d, { x: x + 0.28, y: 3.94, w: 5.36, h: 1.0, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, color: '9FBCC6', lineSpacing: 15 });
  });

  s.addText('We sit between the two: the pre-incorporation founder who has nothing for Myinfo to prefill, and has not yet earned an advisor’s hour.', {
    x: M, y: 5.42, w: 12, h: 0.4, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 14, bold: true, color: 'BFD3D9',
  });
  s.addText('Groundwork', {
    x: M, y: 6.16, w: 5, h: 0.4, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 18, bold: true, color: TEAL,
  });

  s.addNotes(`[4:05-4:15 — 24 words. Land it and stop.]

"Singapore already built both halves of this for people who already have a company. Ren doesn't have one yet. That's the gap we sit in.

She finds out on day one, not month five."

Stop talking. Take the questions.`);
}

/* ═══════════════════════ A1 · SOURCE REGISTER ════════════════════════════ */
{
  const s = light('Every fact, and where it came from.', 'Appendix A1', 'Appendix');

  const head = ['Claim', 'Source', 'Confidence'];
  const rows = [
    ['VentureForGood runs five stages over roughly 4–6 months, with the stated per-stage durations', 'raise.sg/ventureforgood-grant', 'Primary'],
    ['VFG (Youth): ages 18–35, key applicant Singaporean or PR, raiSE membership required', 'raise.sg', 'Primary'],
    ['raiSE membership requires an ACRA-registered business, so the ordering ACRA → raiSE → VFG is forced', 'raise.sg membership + grant pages', 'Primary'],
    ['Startup SG Founder: first-time founders only, must not have previously incorporated, ≥30% equity, applies via an Accredited Mentor Partner', 'enterprisesg.gov.sg, AMP pages', 'Primary'],
    ['Startup SG Founder grant quantum and matching ratio', 'Vendor blogs only; agency page did not resolve', 'Unverified — never blocks'],
    ['Myinfo Business auto-populates corporate data with consent; integration requires a government-assessed linkup', 'singpass.gov.sg, GovTech', 'Primary'],
    ['ACRA registered-entity data is free under the Open Data Licence and needs no authentication', 'data.gov.sg', 'Primary'],
    ['Persons with disabilities employment rate 32.7% (2022/2023); target 40% by 2030', 'Ministry of Social and Family Development', 'Primary'],
    ['SME Centres: EnterpriseSG plus five trade associations, ten centres, free advisory', 'enterprisesg.gov.sg', 'Primary'],
    ['Grantable and Instrumentl pricing, mechanics and positioning', 'Published industry reviews', 'Secondary — attributed'],
    ['68% of nonprofits cite time as their main grant-seeking challenge; 24% cite lack of staff', 'Sector report cited in reviews', 'Secondary — attributed'],
  ];

  const cw = [7.0, 3.5, 1.56];
  const x0 = M;
  head.forEach((h, i) => s.addText(h, {
    x: x0 + cw.slice(0, i).reduce((a, b) => a + b, 0), y: 1.3, w: cw[i] - 0.12, h: 0.28,
    isTextBox: true, margin: 0, fontFace: B, fontSize: 10, bold: true, charSpacing: 1, color: MUTED,
  }));
  rows.forEach((r, ri) => {
    const y = 1.64 + ri * 0.44;
    if (ri % 2 === 0) s.addShape(pres.ShapeType.rect, {
      x: x0 - 0.1, y: y - 0.03, w: W - M * 2 + 0.2, h: 0.42, fill: { color: TINT }, line: { color: TINT, width: 0 },
    });
    r.forEach((cell, ci) => {
      const cx = x0 + cw.slice(0, ci).reduce((a, b) => a + b, 0);
      const isConf = ci === 2;
      const col = isConf
        ? (cell.startsWith('Primary') ? GREEN : cell.startsWith('Unverified') ? MAROON : AMBER)
        : (ci === 0 ? INK : MUTED);
      s.addText(cell, {
        x: cx, y, w: cw[ci] - 0.12, h: 0.4, isTextBox: true, margin: 0,
        fontFace: B, fontSize: 9.5, bold: isConf, color: col, valign: 'middle', lineSpacing: 11.5,
      });
    });
  });

  src(s, 'Rules in the product carry the same source URL and a last-checked date, shown to the founder on the result. When a funder changes a criterion, that is a one-line data edit, not a code change.');
  s.addNotes('Appendix. Not presented. Exists so a judge reading the deck can audit any claim we make.');
}

/* ═══════════════════════ A2 · THE CHAIN ══════════════════════════════════ */
{
  const s = light('Why the order of the steps is the product.', 'Appendix A2', 'Appendix');

  body(s, 'A readiness checklist that lists what is missing is not enough. The steps depend on each other, and getting the order wrong tells a founder to do something impossible.',
    { x: M, y: 1.28, w: 10.4, h: 0.5, fontSize: 12.5, color: INK });

  const chain = [
    ['Ren today', 'Pre-incorporation. No ACRA record, no raiSE membership.', RULE, WHITE],
    ['Step 1 · Register with ACRA', 'About one week. Cannot be skipped, because the next step requires it.', TEAL, TINT],
    ['Step 2 · Apply for raiSE membership', 'Four to eight weeks. raiSE will not accept an unregistered business.', AMBER, TINT_A],
    ['Then VentureForGood', 'Five stages, four to six months — and only raiSE members pass stage 3 shortlisting.', GREEN, TINT_G],
  ];
  chain.forEach(([t, d, line, fill], i) => {
    const x = M + i * 3.14;
    card(s, { x, y: 2.0, w: 2.86, h: 1.6, fill, line });
    s.addText(t, { x: x + 0.2, y: 2.18, w: 2.46, h: 0.56, isTextBox: true, margin: 0, fontFace: B, fontSize: 12, bold: true, color: INK, lineSpacing: 15 });
    body(s, d, { x: x + 0.2, y: 2.76, w: 2.46, h: 0.72, fontSize: 10.5, color: MUTED, lineSpacing: 13 });
    if (i < 3) s.addText('→', { x: x + 2.86, y: 2.6, w: 0.28, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 18, color: MUTED, align: 'center' });
  });

  card(s, { x: M, y: 3.9, w: 6.06, h: 1.9, fill: TINT_A, line: AMBER });
  s.addText('The consequence nobody states upfront', { x: M + 0.28, y: 4.1, w: 5.5, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 12, bold: true, color: AMBER });
  body(s, 'A pre-incorporation founder can submit a VentureForGood application at stage 1 and can never be shortlisted at stage 3, because shortlisting passes only raiSE members and raiSE requires registration. Nothing on the application page says so. That is months of work with a ceiling built into it.',
    { x: M + 0.28, y: 4.44, w: 5.5, h: 1.24, fontSize: 11.5, lineSpacing: 15 });

  card(s, { x: M + 6.42, y: 3.9, w: 6.06, h: 1.9 });
  s.addText('What the engine does with it', { x: M + 6.7, y: 4.1, w: 5.5, h: 0.3, isTextBox: true, margin: 0, fontFace: B, fontSize: 12, bold: true, color: TEAL });
  body(s, 'Each remedy carries an order and a realistic duration, and the rules record which step depends on which. The founder receives a sequence, not a checklist — and a validator refuses any rule file that orders a prerequisite after the step that needs it.',
    { x: M + 6.7, y: 4.44, w: 5.5, h: 1.24, fontSize: 11.5, lineSpacing: 15 });

  src(s, 'Sources: raise.sg membership requirements and raise.sg/ventureforgood-grant stage descriptions.');
  s.addNotes('Appendix. Strong Q&A material — this is the clearest example of analysis a directory cannot do for you.');
}

/* ═══════════════════════ A3 · ROADMAP ════════════════════════════════════ */
{
  const s = light('What exists today, and what comes next.', 'Appendix A3', 'Appendix');

  const groups = [
    { t: 'Working in the prototype', c: GREEN, fill: TINT_G, items: [
      'Rules engine covering three Singapore schemes, deterministic and offline',
      'Conversational intake, one question per screen, with voice input',
      'Readiness map with three outcome states and ordered remedies',
      'Drafted funder answers with visible provenance flags',
      'Live company verification against the free ACRA dataset',
      'Profile persisted across stages in the browser',
    ] },
    { t: 'Mocked, and labelled as such', c: AMBER, fill: TINT_A, items: [
      'Myinfo Business prefill — government-gated integration',
      'Submission to any funder portal — we never submit on a founder’s behalf',
      'Partner dashboard for intermediaries',
      'Live model calls; demo outputs are pre-generated for reliability, and the pipeline is wired behind a single flag',
    ] },
    { t: 'Next, in order', c: TEAL, fill: TINT, items: [
      'One conversation with an intermediary about screening cost per applicant',
      'Usability testing with founders using screen readers — not a proxy, the actual users',
      'Two more schemes, and a review process with a partner who owns the criteria',
      'Alternative credit signals for the informal economy, once there is a counterparty willing to act on them',
    ] },
  ];
  groups.forEach((g, i) => {
    const x = M + i * 4.12;
    card(s, { x, y: 1.34, w: 3.86, h: 4.6, fill: g.fill });
    pill(s, { x: x + 0.26, y: 1.58, w: 2.2, text: g.t, color: g.c, h: 0.3, fs: 10 });
    body(s, g.items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < g.items.length - 1 } })),
      { x: x + 0.26, y: 2.02, w: 3.34, h: 3.76, fontSize: 10.5, lineSpacing: 14, paraSpaceAfter: 8 });
  });

  src(s, 'The prototype runs locally on the presenting laptop, with no network dependency and no API key anywhere in the repository.');
  s.addNotes('Appendix. Use the middle column if a judge asks what is real — being first to say what is mocked is much stronger than being caught.');
}

/* ═══════════════════════ A4 · RISKS ══════════════════════════════════════ */
{
  const s = light('What could go wrong, and what we do about it.', 'Appendix A4', 'Appendix');

  const rows = [
    ['A funder changes a criterion and our rule goes stale',
      'Every rule carries a last-checked date, shown to the founder alongside the funder’s own link. Updating a criterion is a one-line data edit. At scale, the maintainer is the intermediary who already owns that criterion.'],
    ['A founder relies on an eligibility result that is wrong',
      'Results are never phrased as a guarantee. Each carries its source and the instruction to confirm with the funder. Eligibility is deterministic and auditable, so an error is findable rather than mysterious.'],
    ['A founder submits an AI-estimated number believing they wrote it',
      'Every value the system supplied rather than heard is flagged in the draft and must be confirmed. This is the single failure we designed hardest against.'],
    ['Accessibility claims that were never tested with disabled users',
      'We built to WCAG structure and to the interaction patterns the research points to, but we have not yet tested with screen-reader users. That is the first thing we would do next, and we would not claim otherwise.'],
    ['Our stated business model never materialises',
      'It is presented as a pathway, not as revenue. The founder side is free and stays free; the product remains useful to a founder even if no intermediary ever pays.'],
  ];
  rows.forEach(([r, m], i) => {
    const y = 1.32 + i * 1.06;
    card(s, { x: M, y, w: W - M * 2, h: 0.96, fill: i % 2 ? WHITE : TINT });
    s.addText(r, { x: M + 0.24, y: y + 0.12, w: 4.3, h: 0.72, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, bold: true, color: INK, valign: 'middle', lineSpacing: 14 });
    body(s, m, { x: M + 4.78, y: y + 0.1, w: 7.26, h: 0.76, fontSize: 10.5, color: MUTED, lineSpacing: 13, valign: 'middle' });
  });

  src(s, 'We would rather name a limitation than be asked about it. Every row above is a live constraint, not a hypothetical.');
  s.addNotes('Appendix. If a judge opens with a hard question, it is probably on this slide — answer from here.');
}

pres.writeFile({ fileName: 'groundwork-deck.pptx' }).then(() => console.log('written'));
