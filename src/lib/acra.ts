/**
 * acra.ts — the one real network call in the build.
 * Owner: B.
 *
 * data.gov.sg ACRA registered entities. Free under the Open Data Licence, no auth
 * required (an API key only raises rate limits, so we ship none). 1.5M+ records.
 *
 * Why this is worth having on stage: it's a live, official, zero-cost lookup that
 * proves the "never re-enter what the system already knows" half of our thesis —
 * the half Myinfo Business does for companies that exist. Our founder has no ACRA
 * record yet, which is exactly the gap we sit in.
 *
 * ── ONE THING TO DO BEFORE THE DEMO ──────────────────────────────────────────
 * The ACRA data is split into 27 datasets, one per first letter of entity name.
 * Fill RESOURCE_IDS below with one or two real ids. To get them, open this in a
 * browser and read the `datasetId` values out of the JSON:
 *
 *   https://api-production.data.gov.sg/v2/public/api/collections/2/metadata
 *
 * Do NOT guess an id — a wrong one returns an empty result set, which looks
 * exactly like "no such company" and will waste twenty minutes on Day 3.
 * Until they're filled, lookupEntity returns a clean NOT_FOUND and the UI degrades
 * to manual entry, which is a fine demo path.
 */

import type { AcraMatch, Result } from '../types/contract';

const DATASTORE = 'https://data.gov.sg/api/action/datastore_search';

/**
 * Keyed by first letter of the entity name. Fill at least the letter your demo
 * company starts with. Empty is safe; it just disables the lookup.
 */
export const RESOURCE_IDS: Partial<Record<string, string>> = {
  // Example shape — replace with real ids from the metadata endpoint above:
  // Q: 'd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
};

export function isAcraConfigured(): boolean {
  return Object.keys(RESOURCE_IDS).length > 0;
}

interface DatastoreRecord {
  uen?: string;
  entity_name?: string;
  entity_type?: string;
  entity_status_description?: string;
  registration_incorporation_date?: string;
  primary_ssic_code?: string;
  primary_ssic_description?: string;
}

function toMatch(r: DatastoreRecord): AcraMatch {
  return {
    uen: r.uen ?? '',
    entity_name: r.entity_name ?? '',
    entity_type: r.entity_type ?? null,
    entity_status: r.entity_status_description ?? null,
    registration_incorporation_date: r.registration_incorporation_date ?? null,
    primary_ssic_code: r.primary_ssic_code ?? null,
    primary_ssic_description: r.primary_ssic_description ?? null,
  };
}

/**
 * Look up a company by name. Chooses the dataset from the first letter.
 * Always resolves — never throws — so A renders `error.message` and moves on.
 */
export async function lookupEntity(query: string, limit = 8): Promise<Result<AcraMatch[]>> {
  const q = query.trim();
  if (q.length < 2) {
    return { ok: true, data: [] };
  }

  const letter = q[0].toUpperCase();
  const resourceId = RESOURCE_IDS[letter];

  if (!resourceId) {
    return {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: "We can't check the business registry right now — you can type your details in instead.",
        detail: `No resource_id configured for letter "${letter}". See the note at the top of acra.ts.`,
      },
    };
  }

  const url = `${DATASTORE}?resource_id=${encodeURIComponent(resourceId)}&q=${encodeURIComponent(q)}&limit=${limit}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      return {
        ok: false,
        error: {
          code: res.status === 429 ? 'RATE_LIMITED' : 'NETWORK',
          message: "We couldn't reach the business registry. You can type your details in instead.",
          detail: `data.gov.sg returned ${res.status}`,
        },
      };
    }

    const json = (await res.json()) as { result?: { records?: DatastoreRecord[] } };
    return { ok: true, data: (json.result?.records ?? []).map(toMatch) };
  } catch (e) {
    return {
      ok: false,
      error: {
        code: 'NETWORK',
        message: "We couldn't reach the business registry. You can type your details in instead.",
        detail: e instanceof Error ? e.message : String(e),
      },
    };
  }
}

/** Dev helper: prints available dataset ids. Run once, paste results into RESOURCE_IDS. */
export async function discoverResourceIds(): Promise<Result<unknown>> {
  try {
    const res = await fetch('https://api-production.data.gov.sg/v2/public/api/collections/2/metadata');
    if (!res.ok) {
      return { ok: false, error: { code: 'NETWORK', message: 'Could not load dataset list.', detail: `HTTP ${res.status}` } };
    }
    return { ok: true, data: await res.json() };
  } catch (e) {
    return {
      ok: false,
      error: { code: 'NETWORK', message: 'Could not load dataset list.', detail: e instanceof Error ? e.message : String(e) },
    };
  }
}
