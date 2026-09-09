/**
 * glossary.ts — jargon to plain language.
 * Owner: B (this loader). The WORDS are C's (/data/glossary.json).
 *
 * CONTEXT.md §4: plain language sits ALONGSIDE the real funder term, never
 * replacing it. A founder who only ever sees "money coming in and going out"
 * will not recognise "management accounts" on the funder's actual form, and we
 * will have made their life worse, not better. Always show both.
 *
 * Never a model call. This is a lookup table and always was.
 *
 * ── HANDOVER TO C ────────────────────────────────────────────────────────────
 * SEED below is a starter set so A is not blocked. When C ships
 * /data/glossary.json, B replaces SEED with a static import of it in ONE commit.
 * C: same shape, keys lowercased.
 */

interface GlossaryEntry {
  /** The funder's own term, properly cased for display. */
  term: string;
  /** One sentence, plain language, second person where natural. */
  plain: string;
  /** Optional: where the term comes from, shown as "raiSE calls this…" */
  used_by?: string;
}

const SEED: Record<string, GlossaryEntry> = {
  'management accounts': {
    term: 'Management accounts',
    plain: 'A simple record of money coming in and going out of your business.',
    used_by: 'raiSE',
  },
  'financial projections': {
    term: 'Financial projections',
    plain: 'Your best guess at what you will earn and spend over the next couple of years.',
    used_by: 'raiSE',
  },
  'acra profile': {
    term: 'ACRA profile',
    plain: 'The official record showing your business is registered in Singapore.',
  },
  uen: {
    term: 'UEN',
    plain: "The ID number a registered Singapore business gets. You won't have one until you register.",
  },
  incorporation: {
    term: 'Incorporation',
    plain: 'Officially registering your business as a company.',
  },
  // NOTE: the profile field is `impact.sso_partnership`, but SSO is the wrong
  // term — raiSE says VWO. The key is frozen; every founder-facing string here
  // says VWO. See the comment on that field in contract.ts.
  vwo: {
    term: 'Voluntary Welfare Organisation (VWO)',
    plain: 'A registered charity or non-profit that provides social services in Singapore.',
    used_by: 'raiSE',
  },
  'vwo partnership': {
    term: 'VWO partnership',
    plain: 'A written arrangement with a registered charity or non-profit that vouches for the people you help.',
    used_by: 'raiSE',
  },
  'social service office': {
    term: 'Social Service Office (SSO)',
    plain: 'A government office that helps people in a specific area of Singapore. Not the same as a VWO — raiSE asks about VWOs.',
  },
  'beneficiary validation': {
    term: 'Beneficiary validation',
    plain: 'Proof that the people you say you help really do need the help.',
    used_by: 'raiSE',
  },
  'raise membership': {
    term: 'raiSE membership',
    plain: 'Joining raiSE, the national body for social enterprises. Free to apply, and needed before VentureForGood.',
    used_by: 'raiSE',
  },
  'accredited mentor partner': {
    term: 'Accredited Mentor Partner (AMP)',
    plain: 'An approved organisation — like a university enterprise centre — that has to back your application before you can apply.',
    used_by: 'Startup SG Founder',
  },
  'letter of recommendation': {
    term: 'Letter of Recommendation',
    plain: 'A letter from an approved mentor organisation saying they support your idea.',
    used_by: 'Startup SG Founder',
  },
  equity: {
    term: 'Equity',
    plain: 'The share of the business you own.',
  },
  'pitch deck': {
    term: 'Pitch deck',
    plain: 'A short set of slides explaining your idea, who it helps, and what you need.',
  },
  'social impact': {
    term: 'Social impact',
    plain: 'The difference your business makes to people, beyond making money.',
  },
  'theory of change': {
    term: 'Theory of change',
    plain: 'The story of how what you do leads to the change you want to see.',
  },
};

/** Plain-language sentence for a term, or null if we don't have one. */
export function explain(term: string): string | null {
  return SEED[term.trim().toLowerCase()]?.plain ?? null;
}

/** Full entry, when A wants to render the funder's term alongside the plain one. */
export function lookup(term: string): GlossaryEntry | null {
  return SEED[term.trim().toLowerCase()] ?? null;
}

/** Every term we can explain — for a glossary screen, or to auto-underline in body text. */
export function allTerms(): GlossaryEntry[] {
  return Object.values(SEED).sort((a, b) => a.term.localeCompare(b.term));
}

/**
 * Find glossary terms occurring in a block of text, longest-first so
 * "sso partnership" wins over "sso". Returns character ranges A can wrap
 * in a <button> that opens the plain-language tooltip.
 */
export function findTerms(text: string): Array<{ start: number; end: number; entry: GlossaryEntry }> {
  const hits: Array<{ start: number; end: number; entry: GlossaryEntry }> = [];
  const lower = text.toLowerCase();
  const keys = Object.keys(SEED).sort((a, b) => b.length - a.length);

  const taken: boolean[] = new Array(text.length).fill(false);
  for (const key of keys) {
    let from = 0;
    for (;;) {
      const i = lower.indexOf(key, from);
      if (i === -1) break;
      const end = i + key.length;
      const overlaps = taken.slice(i, end).some(Boolean);
      const leftOk = i === 0 || !/[a-z0-9]/i.test(text[i - 1]);
      const rightOk = end === text.length || !/[a-z0-9]/i.test(text[end]);
      if (!overlaps && leftOk && rightOk) {
        hits.push({ start: i, end, entry: SEED[key] });
        for (let k = i; k < end; k++) taken[k] = true;
      }
      from = i + 1;
    }
  }
  return hits.sort((a, b) => a.start - b.start);
}
