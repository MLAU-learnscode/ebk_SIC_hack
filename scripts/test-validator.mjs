#!/usr/bin/env node
/**
 * Adversarial tests for validate-rules.mjs.
 *
 * Run: node scripts/test-validator.mjs
 *
 * A validator nobody has tried to defeat is decoration. Each case below copies the repo to
 * a temp tree, injects one specific fault, and asserts the validator rejects it with the
 * right message. If any case passes validation, that layer has a hole.
 */

import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Each case: mutate the copied tree, then expect validation to fail mentioning `expect`. */
const CASES = [
  {
    layer: "L1",
    name: "invalid operator is rejected",
    expect: "invalid op",
    mutate: (dir) => patchRule(dir, "nyc-ycm.json", (d) => { d.criteria[0].op = "roughly_equals"; }),
  },
  {
    layer: "L1",
    name: "between with min > max matches nothing",
    expect: "matches nothing",
    mutate: (dir) => patchRule(dir, "nyc-ycm.json", (d) => { d.criteria[0].value = [35, 15]; }),
  },
  {
    layer: "L1",
    name: "operator/value shape mismatch",
    expect: "needs a non-empty array",
    mutate: (dir) => patchRule(dir, "nyc-ycm.json", (d) => { d.criteria[1].value = "SG"; }),
  },
  {
    layer: "L2",
    name: "THE BIG ONE — blocking criterion with no remedy and no terminal flag",
    expect: "not marked terminal:true",
    mutate: (dir) => patchRule(dir, "raise-vfg-youth.json", (d) => {
      const c = d.criteria.find((x) => x.field === "raise_member");
      delete c.remedy; delete c.remedy_order;
    }),
  },
  {
    layer: "L2",
    name: "terminal without a stated reason",
    expect: "requires terminal_reason",
    mutate: (dir) => patchRule(dir, "nyc-ycm.json", (d) => { delete d.criteria[0].terminal_reason; }),
  },
  {
    layer: "L2",
    name: "typo'd field name would silently read as null",
    expect: "unknown field",
    mutate: (dir) => patchRule(dir, "nyc-ycm.json", (d) => { d.criteria[0].field = "aeg"; }),
  },
  {
    layer: "L2",
    name: "prerequisite ordered after the step that depends on it",
    expect: "prerequisite must come first",
    mutate: (dir) => patchRule(dir, "raise-vfg-youth.json", (d) => {
      d.criteria.find((x) => x.field === "is_incorporated").remedy_order = 9;
    }),
  },
  {
    layer: "L2",
    name: "any_of group mixing blocking and non-blocking members",
    expect: "mixes blocking and non-blocking",
    mutate: (dir) => patchRule(dir, "raise-vfg-youth.json", (d) => {
      d.criteria.find((x) => x.field === "has_vwo_partnership").blocking = true;
    }),
  },
  {
    layer: "L3",
    name: "primary confidence backed by a vendor blog",
    expect: "cannot back a primary claim",
    mutate: (dir) => patchRule(dir, "startup-sg-founder.json", (d) => {
      d.confidence = "primary";
      d.source_url = "https://grants.sg/grants/startup-sg-founder";
    }),
  },
  {
    layer: "L3",
    name: "credential smuggled into the eligibility path",
    expect: "pure function over local JSON",
    mutate: (dir) => patchRule(dir, "nyc-ycm.json", (d) => { d.api_key = "sk-abc123"; }),
  },
  {
    layer: "L3",
    name: "future last_checked date",
    expect: "in the future",
    mutate: (dir) => patchRule(dir, "nyc-ycm.json", (d) => { d.last_checked = "2099-01-01"; }),
  },
  {
    layer: "L3",
    name: "dangling stages_ref",
    expect: "no matching entry in data/stages.json",
    mutate: (dir) => patchRule(dir, "raise-vfg-youth.json", (d) => { d.stages_ref = "nonexistent-model"; }),
  },
  {
    layer: "fixture",
    name: "DEMO DRIFT — a rules edit silently changes the persona's state",
    expect: "DEMO BROKEN",
    mutate: (dir) => patchRule(dir, "nyc-ycm.json", (d) => {
      d.criteria.find((x) => x.field === "age").value = [15, 20]; // persona is 24
    }),
  },
  {
    layer: "fixture",
    name: "fixture field not in the vocabulary",
    expect: "unknown field",
    mutate: (dir) => patchJson(dir, join("fixtures", "demo-founder.json"), (d) => {
      d.profile.favourite_colour = "blue";
    }),
  },
  {
    layer: "fixture",
    name: "fixture field of the wrong type",
    expect: "should be integer",
    mutate: (dir) => patchJson(dir, join("fixtures", "demo-founder.json"), (d) => {
      d.profile.age = "twenty-four";
    }),
  },
];

function patchJson(dir, relPath, fn) {
  const p = join(dir, relPath);
  const doc = JSON.parse(readFileSync(p, "utf8"));
  fn(doc);
  writeFileSync(p, JSON.stringify(doc, null, 2));
}
const patchRule = (dir, file, fn) => patchJson(dir, join("data", "rules", file), fn);

function runValidator(dir) {
  try {
    const stdout = execFileSync(process.execPath, [join(dir, "scripts", "validate-rules.mjs")], {
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, output: stdout };
  } catch (e) {
    return { code: e.status ?? 1, output: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

// Baseline: the real tree must pass, or every failure below is meaningless.
const baseline = runValidator(ROOT);
if (baseline.code !== 0) {
  console.error("FATAL: the repo does not pass validation, so these tests prove nothing.\n" + baseline.output);
  process.exit(2);
}
console.log("baseline: repo passes validation\n");

let failed = 0;
for (const c of CASES) {
  const dir = mkdtempSync(join(tmpdir(), "rules-test-"));
  try {
    for (const sub of ["data", "fixtures", "scripts"]) {
      cpSync(join(ROOT, sub), join(dir, sub), { recursive: true });
    }
    c.mutate(dir);
    const { code, output } = runValidator(dir);

    if (code === 0) {
      console.error(`FAIL [${c.layer}] ${c.name}\n      validation PASSED but should have failed`);
      failed++;
    } else if (!output.includes(c.expect)) {
      console.error(`FAIL [${c.layer}] ${c.name}\n      failed, but not for the expected reason (wanted "${c.expect}")\n${output}`);
      failed++;
    } else {
      console.log(`  ok  [${c.layer}] ${c.name}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log(
  failed === 0
    ? `\nAll ${CASES.length} adversarial cases correctly rejected.`
    : `\n${failed} of ${CASES.length} cases were NOT caught — those layers have holes.`,
);
process.exit(failed === 0 ? 0 : 1);
