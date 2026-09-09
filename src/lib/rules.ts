/**
 * rules.ts — loads the grant rule files.
 * Owner: B. The RULE CONTENT is C's (/data/rules/*.json); this file only finds it.
 *
 * C's files are picked up automatically by the glob below. Until they land, the
 * app falls back to the three example rules in rules.fallback.ts so the screens
 * are demoable — and says so on screen, loudly, so nobody mistakes an example
 * for a verified rule.
 *
 * When C pushes /data/rules/*.json, this file needs no change: the glob finds
 * them, `usingFallback` flips to false, and the banner disappears.
 */

import type { GrantRule } from '../types/contract';
import { FALLBACK_RULES } from './rules.fallback';

// Vite resolves this at build time. Empty object if the folder has no JSON yet.
const modules = import.meta.glob('../../data/rules/*.json', { eager: true }) as Record<
  string,
  { default: GrantRule }
>;

const loaded = Object.values(modules)
  .map((m) => m.default)
  .filter((r): r is GrantRule => !!r && typeof r.grant_id === 'string');

export const usingFallback = loaded.length === 0;

/** Sorted for a stable demo order regardless of filesystem order. */
export const RULES: GrantRule[] = (usingFallback ? FALLBACK_RULES : loaded)
  .slice()
  .sort((a, b) => a.grant_id.localeCompare(b.grant_id));

export function ruleById(id: string): GrantRule | undefined {
  return RULES.find((r) => r.grant_id === id);
}
