#!/usr/bin/env node
/**
 * Rules validator — defense in depth for the eligibility data path.
 *
 * Run: node scripts/validate-rules.mjs
 * Exits non-zero on any error. Warnings do not fail the build.
 *
 * WHY THIS EXISTS
 * ---------------
 * The dangerous operation in this product is not a file delete. It is telling a founder
 * they qualify when they do not, or that a door is closed when it is not. That answer is
 * assembled from hand-authored JSON, so the JSON is the thing that needs guarding.
 *
 * A single review pass over a rules file is a hope. These are the layers:
 *
 *   L1 entry      — structural: required keys, known operators, value shape matches operator
 *   L2 business   — semantic: field names resolve, remedy chains are ordered and reachable,
 *                   every dead end is declared deliberately rather than by omission
 *   L3 guards     — context: source freshness, and a primary claim cannot cite a vendor blog
 *   L4 tracing    — every finding names file, grant, criterion index and field
 *
 * The single most important check here is TERMINAL_WITHOUT_REASON (L2). A blocking
 * criterion with no remedy silently means "not_a_fit" — permanently disqualified. Forgetting
 * to write a remedy therefore looks exactly like deciding someone is beyond help. This
 * validator refuses to let that be implicit: a dead end must say it is a dead end and why.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RULES_DIR = join(ROOT, "data", "rules");
const FIELDS_FILE = join(ROOT, "data", "profile.fields.proposal.json");
const FIXTURE_FILE = join(ROOT, "fixtures", "demo-founder.json");
const STAGES_FILE = join(ROOT, "data", "stages.json");

const VALID_OPS = ["eq", "neq", "in", "not_in", "between", "gte", "lte", "gt", "lt", "exists"];
const STATES = ["eligible_now", "eligible_after_steps", "not_a_fit"];
const PRIMARY_DOMAINS = [".gov.sg", "raise.sg"];
const STALE_AFTER_DAYS = 30;

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push({ where, msg });
const warn = (where, msg) => warnings.push({ where, msg });

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    err(basename(path), `unreadable or invalid JSON: ${e.message}`);
    return null;
  }
};

// ---------------------------------------------------------------- load inputs

if (!existsSync(FIELDS_FILE)) {
  console.error(`FATAL: ${FIELDS_FILE} missing. It defines the field vocabulary every rule is checked against.`);
  process.exit(2);
}
const fieldsDoc = readJson(FIELDS_FILE);
const KNOWN_FIELDS = new Set(Object.keys(fieldsDoc?.fields ?? {}));
const FIELD_TYPES = Object.fromEntries(
  Object.entries(fieldsDoc?.fields ?? {}).map(([k, v]) => [k, v.type]),
);

if (KNOWN_FIELDS.size === 0) {
  console.error("FATAL: no fields defined. Every rule would validate against nothing.");
  process.exit(2);
}

const stagesDoc = existsSync(STAGES_FILE) ? readJson(STAGES_FILE) : null;
const KNOWN_STAGE_MODELS = new Set(Object.keys(stagesDoc?.stage_models ?? {}));

const ruleFiles = existsSync(RULES_DIR)
  ? readdirSync(RULES_DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  : [];

if (ruleFiles.length === 0) {
  console.error(`FATAL: no rule files in ${RULES_DIR}.`);
  process.exit(2);
}

// ------------------------------------------------- L1/L2/L3 per rules file

const grants = [];

for (const file of ruleFiles) {
  const doc = readJson(join(RULES_DIR, file));
  if (!doc) continue;
  const at = (extra = "") => `${file}${extra}`;

  // ---- L1: required top-level keys
  for (const key of ["grant_id", "name", "funder", "source_url", "last_checked", "confidence", "criteria"]) {
    if (doc[key] === undefined) err(at(), `missing required key "${key}"`);
  }
  if (!Array.isArray(doc.criteria) || doc.criteria.length === 0) {
    err(at(), "criteria must be a non-empty array");
    continue;
  }
  if (doc.grant_id && basename(file, ".json") !== doc.grant_id) {
    warn(at(), `filename does not match grant_id "${doc.grant_id}" — makes files hard to trace on stage`);
  }

  // ---- L3: provenance guards
  if (!["primary", "secondary"].includes(doc.confidence)) {
    err(at(), `confidence must be "primary" or "secondary", got ${JSON.stringify(doc.confidence)}`);
  }
  if (typeof doc.source_url === "string") {
    if (!doc.source_url.startsWith("https://")) {
      err(at(), `source_url must be https: ${doc.source_url}`);
    }
    const isPrimaryDomain = PRIMARY_DOMAINS.some((d) => doc.source_url.includes(d));
    if (doc.confidence === "primary" && !isPrimaryDomain) {
      err(
        at(),
        `confidence "primary" but source_url is not on an official domain (${PRIMARY_DOMAINS.join(", ")}). ` +
          `A vendor blog cannot back a primary claim — see docs/SOURCES.md claims discipline.`,
      );
    }
  }
  if (typeof doc.last_checked === "string") {
    const checked = Date.parse(doc.last_checked);
    if (Number.isNaN(checked)) {
      err(at(), `last_checked is not a parseable date: ${doc.last_checked}`);
    } else {
      const ageDays = Math.floor((Date.now() - checked) / 86_400_000);
      if (ageDays > STALE_AFTER_DAYS) {
        warn(at(), `last_checked is ${ageDays} days old — re-verify before quoting this on stage`);
      }
      if (ageDays < 0) err(at(), `last_checked is in the future: ${doc.last_checked}`);
    }
  }
  if (doc.stages_ref && !KNOWN_STAGE_MODELS.has(doc.stages_ref)) {
    err(at(), `stages_ref "${doc.stages_ref}" has no matching entry in data/stages.json`);
  }

  // ---- L1/L2: per criterion
  const remedyOrders = [];
  const groups = new Map();

  doc.criteria.forEach((c, i) => {
    const where = at(` criteria[${i}]${c.field ? ` field=${c.field}` : ""}`);

    // L1 structural
    if (!c.field) err(where, "missing field");
    else if (!KNOWN_FIELDS.has(c.field)) {
      err(where, `unknown field "${c.field}" — not in profile.fields.proposal.json. A typo'd field reads as null and silently changes the answer.`);
    }
    if (!VALID_OPS.includes(c.op)) {
      err(where, `invalid op ${JSON.stringify(c.op)}; allowed: ${VALID_OPS.join(", ")}`);
    }
    if (typeof c.blocking !== "boolean") err(where, "blocking must be an explicit boolean");
    if (!c.requirement) err(where, "missing human-readable requirement (needed by the UI and on stage)");

    checkValueShape(where, c.op, c.value);

    // L2 semantic: the dead-end guard
    const isDeadEnd = c.blocking === true && c.remedy === undefined;
    if (isDeadEnd && c.terminal !== true) {
      err(
        where,
        "blocking criterion has no remedy but is not marked terminal:true. This silently means " +
          "not_a_fit — permanently disqualified. Either write a remedy, or declare terminal:true " +
          "with a terminal_reason so the dead end is a decision and not an omission.",
      );
    }
    if (c.terminal === true) {
      if (!c.terminal_reason) err(where, "terminal:true requires terminal_reason explaining why no remedy can exist");
      if (c.remedy) err(where, "terminal:true contradicts having a remedy — a dead end cannot have a way out");
      if (c.blocking !== true) err(where, "terminal:true is meaningless on a non-blocking criterion");
    }

    // L2 semantic: remedy chain integrity
    if (c.remedy !== undefined) {
      if (typeof c.remedy_order !== "number") err(where, "remedy requires a numeric remedy_order — A renders the chain in this order");
      else remedyOrders.push(c.remedy_order);
      if (c.remedy_est_weeks !== undefined && typeof c.remedy_est_weeks !== "number") {
        err(where, "remedy_est_weeks must be a number");
      }
    }
    for (const dep of c.depends_on ?? []) {
      if (!KNOWN_FIELDS.has(dep)) err(where, `depends_on references unknown field "${dep}"`);
      const target = doc.criteria.find((o) => o.field === dep);
      if (!target) {
        err(where, `depends_on "${dep}" has no criterion in this grant — the chain cannot be ordered`);
      } else if (typeof target.remedy_order === "number" && typeof c.remedy_order === "number"
                 && target.remedy_order >= c.remedy_order) {
        err(where, `depends_on "${dep}" has remedy_order ${target.remedy_order} but this is ${c.remedy_order} — a prerequisite must come first, or the founder is told to do the impossible`);
      }
    }

    // L1/L2: when-guard
    if (c.when) {
      if (!KNOWN_FIELDS.has(c.when.field)) err(where, `when.field "${c.when.field}" is not a known field`);
      if (!VALID_OPS.includes(c.when.op)) err(where, `when.op ${JSON.stringify(c.when.op)} is not a valid operator`);
      checkValueShape(`${where} when`, c.when.op, c.when.value);
    }

    // L2: group consistency
    if (c.group) {
      if (c.group_mode !== "any_of") err(where, `group_mode must be "any_of" (only mode implemented)`);
      if (!groups.has(c.group)) groups.set(c.group, []);
      groups.get(c.group).push({ i, c });
    }

    if (c.applies_at_stage !== undefined) {
      if (!Number.isInteger(c.applies_at_stage) || c.applies_at_stage < 1) {
        err(where, "applies_at_stage must be a positive integer");
      }
    }
  });

  // L2: groups must be internally consistent, or the any_of semantics are ambiguous
  for (const [name, members] of groups) {
    if (members.length < 2) warn(at(), `group "${name}" has one member — any_of over a single criterion is just that criterion`);
    const blockingVals = new Set(members.map((m) => m.c.blocking));
    if (blockingVals.size > 1) {
      err(at(), `group "${name}" mixes blocking and non-blocking members — the group's effect on state would be ambiguous`);
    }
    const guards = new Set(members.map((m) => JSON.stringify(m.c.when ?? null)));
    if (guards.size > 1) {
      err(at(), `group "${name}" members have different when-guards — some could be skipped while others evaluate`);
    }
  }

  // L2: remedy_order should be a usable sequence
  if (remedyOrders.length > 0) {
    const sorted = [...remedyOrders].sort((a, b) => a - b);
    if (sorted[0] !== 1) warn(at(), `remedy_order starts at ${sorted[0]}, not 1 — the founder's first step should be numbered first`);
  }

  // L3: nothing in the eligibility path may reach a model or carry a credential
  const raw = readFileSync(join(RULES_DIR, file), "utf8");
  for (const pattern of [/api[_-]?key/i, /\bsk-[a-z0-9]/i, /openai/i, /\bgpt-/i, /api\.anthropic\.com/i, /\bprompt\b/i]) {
    if (pattern.test(raw)) {
      err(at(), `matches ${pattern} — the eligibility path must stay a pure function over local JSON with no model and no credential (CONTEXT §7, §11)`);
    }
  }

  if (doc.grant_id) grants.push(doc);
}

// L2: grant ids must be unique or results collide silently
const seen = new Set();
for (const g of grants) {
  if (seen.has(g.grant_id)) err("data/rules", `duplicate grant_id "${g.grant_id}"`);
  seen.add(g.grant_id);
}

// ------------------------------------------------------ fixture state check

/**
 * Reference evaluator — NOT the product implementation.
 *
 * B owns src/lib/eligibility.ts and must not import this. It exists so C can assert that
 * the demo fixture still produces the three states the pitch depends on, and so B has an
 * executable spec to diff against. If the two disagree, one of them is wrong and we want
 * to find out here rather than on stage.
 */
function evaluate(profile, grant) {
  const satisfied = [], blockers = [], unknowns = [];
  const guardHolds = (when) => {
    if (!when) return true;
    const v = profile[when.field];
    return v === null || v === undefined ? false : compare(v, when.op, when.value) === true;
  };

  const grouped = new Map(), singles = [];
  for (const c of grant.criteria) {
    if (!guardHolds(c.when)) continue;
    if (c.group) {
      if (!grouped.has(c.group)) grouped.set(c.group, []);
      grouped.get(c.group).push(c);
    } else singles.push(c);
  }

  const record = (c, outcome) => {
    if (outcome === true) satisfied.push({ field: c.field, requirement: c.requirement });
    else if (outcome === null) unknowns.push({ field: c.field, requirement: c.requirement });
    else if (c.blocking) {
      blockers.push({
        field: c.field, requirement: c.requirement, remedy: c.remedy ?? null,
        remedy_order: c.remedy_order ?? null, terminal: c.terminal === true,
      });
    }
  };

  for (const c of singles) record(c, evalCriterion(profile, c));

  for (const members of grouped.values()) {
    const outcomes = members.map((c) => evalCriterion(profile, c));
    const groupOutcome = outcomes.includes(true) ? true : outcomes.includes(null) ? null : false;
    record(members[0], groupOutcome);
  }

  blockers.sort((a, b) => (a.remedy_order ?? 99) - (b.remedy_order ?? 99));

  const state = blockers.some((b) => b.terminal)
    ? "not_a_fit"
    : blockers.length > 0 || unknowns.length > 0
      ? "eligible_after_steps"
      : "eligible_now";

  return { state, satisfied, blockers, unknowns };
}

function evalCriterion(profile, c) {
  const v = profile[c.field];
  if (c.op === "exists") return (v !== null && v !== undefined) === c.value;
  if (v === null || v === undefined) return null; // unknown, not failure
  return compare(v, c.op, c.value);
}

function compare(v, op, value) {
  switch (op) {
    case "eq": return v === value;
    case "neq": return v !== value;
    case "in": return value.includes(v);
    case "not_in": return !value.includes(v);
    case "between": return v >= value[0] && v <= value[1];
    case "gte": return v >= value;
    case "lte": return v <= value;
    case "gt": return v > value;
    case "lt": return v < value;
    default: return false;
  }
}

function checkValueShape(where, op, value) {
  const isScalar = ["string", "number", "boolean"].includes(typeof value);
  switch (op) {
    case "eq": case "neq":
      if (!isScalar) err(where, `op "${op}" needs a scalar value, got ${JSON.stringify(value)}`); break;
    case "in": case "not_in":
      if (!Array.isArray(value) || value.length === 0) err(where, `op "${op}" needs a non-empty array`); break;
    case "between":
      if (!Array.isArray(value) || value.length !== 2 || value.some((n) => typeof n !== "number")) {
        err(where, `op "between" needs [min, max] numbers, got ${JSON.stringify(value)}`);
      } else if (value[0] > value[1]) {
        err(where, `op "between" has min ${value[0]} > max ${value[1]} — matches nothing`);
      }
      break;
    case "gte": case "lte": case "gt": case "lt":
      if (typeof value !== "number") err(where, `op "${op}" needs a number, got ${JSON.stringify(value)}`); break;
    case "exists":
      if (typeof value !== "boolean") err(where, `op "exists" needs a boolean`); break;
  }
}

// Assert the demo still produces the states the pitch is built on.
if (existsSync(FIXTURE_FILE)) {
  const fx = readJson(FIXTURE_FILE);
  const profile = fx?.profile ?? {};
  const expected = fx?.expected_states ?? {};

  for (const key of Object.keys(profile)) {
    if (!KNOWN_FIELDS.has(key)) {
      err("fixtures/demo-founder.json", `profile has unknown field "${key}" — it would be ignored by the engine and read as null`);
    } else if (profile[key] !== null) {
      const expectedType = FIELD_TYPES[key];
      const actual = Array.isArray(profile[key]) ? "array" : typeof profile[key];
      const ok = expectedType === "integer" ? Number.isInteger(profile[key])
        : expectedType === "enum" ? actual === "string"
        : expectedType === actual;
      if (!ok) err("fixtures/demo-founder.json", `field "${key}" should be ${expectedType}, got ${actual}`);
    }
  }

  for (const [grantId, want] of Object.entries(expected)) {
    if (grantId.startsWith("_")) continue;
    if (!STATES.includes(want)) {
      err("fixtures/demo-founder.json", `expected state "${want}" for ${grantId} is not one of ${STATES.join(", ")}`);
      continue;
    }
    const grant = grants.find((g) => g.grant_id === grantId);
    if (!grant) {
      err("fixtures/demo-founder.json", `expected_states names "${grantId}" but no such rules file exists`);
      continue;
    }
    const got = evaluate(profile, grant);
    if (got.state !== want) {
      err(
        "fixtures/demo-founder.json",
        `DEMO BROKEN — ${grantId} evaluates to "${got.state}" but the demo needs "${want}". ` +
          `blockers=[${got.blockers.map((b) => b.field).join(", ")}] unknowns=[${got.unknowns.map((u) => u.field).join(", ")}]`,
      );
    }
  }

  const producedStates = new Set(
    Object.entries(expected).filter(([k]) => !k.startsWith("_"))
      .map(([id]) => {
        const g = grants.find((x) => x.grant_id === id);
        return g ? evaluate(profile, g).state : null;
      }).filter(Boolean),
  );
  if (producedStates.size < 3) {
    warn("fixtures/demo-founder.json",
      `the readiness map shows ${producedStates.size} distinct state(s): ${[...producedStates].join(", ")}. ` +
      `CONTEXT §9 calls for three grants in three different states.`);
  }
}

// ------------------------------------------------- eligibility case assertions

const CASES_FILE = join(ROOT, "fixtures", "eligibility-cases.json");
let caseCount = 0;
if (existsSync(CASES_FILE)) {
  const casesDoc = readJson(CASES_FILE);
  caseCount = (casesDoc?.cases ?? []).length;
  if (caseCount === 0) warn("fixtures/eligibility-cases.json", "no cases — B has nothing to code against");
  const demoProfile = existsSync(FIXTURE_FILE) ? (readJson(FIXTURE_FILE)?.profile ?? {}) : {};

  for (const [i, tc] of (casesDoc?.cases ?? []).entries()) {
    const where = `fixtures/eligibility-cases.json cases[${i}] "${tc.name ?? "unnamed"}"`;
    const grant = grants.find((g) => g.grant_id === tc.grant_id);
    if (!grant) { err(where, `no rules file for grant_id "${tc.grant_id}"`); continue; }

    const profile = tc.profile_ref === "demo-founder" ? demoProfile : (tc.profile ?? {});
    for (const key of Object.keys(profile)) {
      if (!KNOWN_FIELDS.has(key)) err(where, `profile has unknown field "${key}"`);
    }

    const got = evaluate(profile, grant);
    const want = tc.expect ?? {};
    const gotBlockers = got.blockers.map((b) => b.field);
    const gotUnknowns = got.unknowns.map((u) => u.field);
    const sameSet = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

    if (want.state && got.state !== want.state) {
      err(where, `state "${got.state}" but expected "${want.state}" (blockers=[${gotBlockers}] unknowns=[${gotUnknowns}])`);
    }
    if (want.blocker_fields && !sameSet(gotBlockers, want.blocker_fields)) {
      err(where, `blockers [${gotBlockers}] but expected [${want.blocker_fields}]`);
    }
    if (want.unknown_fields && !sameSet(gotUnknowns, want.unknown_fields)) {
      err(where, `unknowns [${gotUnknowns}] but expected [${want.unknown_fields}]`);
    }
    if (want.blockers_in_order && got.blockers.map((b) => b.field).join() !== want.blockers_in_order.join()) {
      err(where, `blocker order [${gotBlockers}] but expected [${want.blockers_in_order}] — A renders this array as given, so order is the founder's instruction sequence`);
    }
    if (want.first_remedy_order !== undefined && got.blockers[0]?.remedy_order !== want.first_remedy_order) {
      err(where, `first remedy_order ${got.blockers[0]?.remedy_order} but expected ${want.first_remedy_order}`);
    }
    if (want.has_terminal_blocker !== undefined && got.blockers.some((b) => b.terminal) !== want.has_terminal_blocker) {
      err(where, `has_terminal_blocker expected ${want.has_terminal_blocker}`);
    }
    if (want.satisfied_not_empty && got.satisfied.length === 0) {
      err(where, "satisfied is empty — the green ticks are the payoff of the readiness map, not decoration");
    }
  }
}

// ------------------------------------------------------------------ L4 report

const line = (o) => `  ${o.where}\n    ${o.msg}`;
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log(line(w)));
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.error(line(e)));
  console.error(`\nFAILED — ${ruleFiles.length} rule file(s) checked against ${KNOWN_FIELDS.size} known fields.`);
  process.exit(1);
}
console.log(
  `\nOK — ${ruleFiles.length} rule file(s), ${grants.length} grant(s), ${KNOWN_FIELDS.size} known fields, ` +
  `${caseCount} eligibility case(s), demo states verified.`,
);
