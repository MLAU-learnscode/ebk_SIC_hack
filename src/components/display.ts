import type { FieldPath } from '../types/contract';

/**
 * Turning stored values into words a founder would actually use.
 * Owner: A.
 *
 * Enum values like IN_DISCUSSION and SG are storage, not language. Showing
 * them to a founder is a small betrayal of the whole premise — this is the
 * product that is supposed to stop people being handed the system's own
 * vocabulary. Anything missing from the map falls through to the raw value,
 * which looks wrong on purpose so it gets noticed and fixed.
 */

const WORDS: Record<string, string> = {
  SG: 'Singapore citizen',
  PR: 'Permanent resident',
  OTHER: 'Neither',

  IDEA: 'Still an idea',
  PROTOTYPE: 'Tried out in a small way',
  OPERATING: 'Running and registered',

  NONE: 'Not yet',
  IN_DISCUSSION: 'In conversation with one',
  LOR_ISSUED: 'They have written your letter',

  SCREEN_READER: 'Screen reader',
  PLAIN_LANGUAGE: 'Plain language',
  EXTRA_TIME: 'No time limits',
  LARGE_TEXT: 'Bigger text',
  VOICE_INPUT: 'Voice input',
  REDUCED_MOTION: 'Less movement',
};

const MONEY = new Set<FieldPath>(['funding.amount_sought_sgd', 'funding.can_match_capital_sgd']);
const MONTHS = new Set<FieldPath>(['venture.project_duration_months']);
const PERCENT = new Set<FieldPath>(['founder.equity_pct']);
const PEOPLE = new Set<FieldPath>(['impact.beneficiary_count_est', 'readiness.team_size']);

export function humanise(value: unknown, path?: FieldPath): string {
  if (value === null || value === undefined || value === '') return 'not answered';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (Array.isArray(value)) {
    return value.length ? value.map((v) => WORDS[String(v)] ?? String(v)).join(', ') : 'none';
  }
  if (typeof value === 'number' && path) {
    if (MONEY.has(path)) return value === 0 ? 'nothing yet' : `S$${value.toLocaleString('en-SG')}`;
    if (MONTHS.has(path)) return `${value} month${value === 1 ? '' : 's'}`;
    if (PERCENT.has(path)) return `${value}%`;
    if (PEOPLE.has(path)) return `about ${value} people`;
  }
  return WORDS[String(value)] ?? String(value);
}

/** Provenance, said plainly. This is the seam, in words. */
export const SOURCE_WORD: Record<string, string> = {
  FOUNDER: 'Your own words',
  AI_EXTRACTED: 'We rephrased what you said',
  AI_ESTIMATED: 'We estimated this',
  ACRA: 'From the business registry',
  DEFAULT: 'A default we filled in',
};
