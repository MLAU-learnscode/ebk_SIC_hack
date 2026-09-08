# Source ledger — Role C

Every rule in `/data/rules/` cites a row here. If a fact is not in this file with a live
URL, it does not go into a rules file and it does not get said on stage (CONTEXT §11).

Verification pass run **2026-09-08**. Re-check `last_checked` before the pitch.

Legend: ✅ verified against primary source · ⚠️ secondary source only, attribute don't
assert · ❌ broken or contradicted, do not use

---

## ✅ Verified — safe to state flat

### raiSE VentureForGood — general track
Source: <https://www.raise.sg/ventureforgood-grant/> (fetched 2026-09-08)

- Eligibility: "growth stage **Social Enterprise members of raiSE**"
- Quantum: **up to $300,000**
- Five stages, raiSE's own durations: Submit application (3 wks) → First meeting (3 wks)
  → Shortlisting, *only raiSE members proceed* (3 wks) → Final evaluation, detailed
  proposal + financial projections (4–8 wks) → Pitching to Grants Committee (4–8 wks)
- Documents to start: pitch deck, ACRA profile, management accounts up to 2 years
  (if applicable), financial projections min 2 years, founding team resumes

### raiSE membership
Source: <https://www.raise.sg/become-a-member/> (fetched 2026-09-08)

- **Requires an ACRA-registered business.** This is the load-bearing fact for our demo.
- Assessed on Intentionality / Additionality / Proportionality; majority of revenue from
  trading activities; identified beneficiaries and social need
- Tiers: raiSE Impact Community (aspiring) · Emerging · Leading · Verified Leading
- **$100 processing fee** (Emerging and Leading), annual renewal at same rate
- **Processing takes 4–8 weeks**

### PwD employment (CONTEXT §5, source MSF)
- 32.7% in 2022/2023; aspirational target 40% by 2030

---

## ⚠️ Secondary sources only — attribute, do not assert

Phrase these as "according to published grant listings…" per CONTEXT §10 claims discipline.

### VentureForGood (Youth)
- Quantum: **up to S$20,000** — source: StartupXs grant listing
- Age: youths under 35
- Unincorporated applicants "in the process of prototyping should illustrate a partnership
  with a relevant **Voluntary Welfare Organisation (VWO)** and/or validations with intended
  beneficiary groups"; prior validation from SSAs / sector experts / beneficiary groups
  encouraged

### Startup SG Founder
- **S$20,000 – S$50,000**, **1:1 matching** (revised from 3:1 effective 1 Apr 2024)
- At least half the co-matching capital must already be paid-up in ACRA Bizfile at
  application
- Must apply through an Accredited Mentor Partner; direct applications not accepted
- Sources: grants.sg, grantla.com, singaporesecretaryservices.com — **all vendor blogs.**
  ESG's own page was not reachable at the URL tried. Get a primary source or do not quote
  a number on stage.
- Criteria from CONTEXT §5 (first-time entrepreneurs only, SG/PR, ≥30% equity, must not
  have previously incorporated, concept must not have received other government funding,
  incorporation not required to apply) are unchanged and consistent across sources.

### Young ChangeMakers (YCM) — National Youth Council
Programme page: <https://www.nyc.gov.sg/programmes-grants/grants/young-changemakers/>

Criteria are consistent across NYC-adjacent and gov partner pages but are published in a
factsheet PDF rather than inline on nyc.gov.sg:
- Singaporean or Singapore PR youths, **aged 15–35**, residing locally
- Group applications: majority of members must be Singaporean/PR youths
- Projects must benefit the Singapore community, completed within **6 months** of award
- Apply **at least 8 weeks** before project commencement via OurSG Grants Portal
- Base grant: **up to $3,000, or up to 80% of supported cost, whichever is lower**;
  exceptional merit up to **$5,000** @ 80%

### Enabling Lives Initiative (ELI) — SG Enable / Tote Board
<https://www.sgenable.sg/your-first-stop/schemes-grants> · <https://www.eli-grant.sg/>
- Singapore's only grant dedicated to disability innovation; Tote Board funded, SG Enable
  managed
- Minimum grant **SGD 80,000**, covering **50–90%** of eligible project costs
- Projects commit **1–3 years**
- Aimed at collaborations between social service agencies, social enterprises, research
  institutions, healthcare orgs, commercial companies
- **Not in MVP scope** — carry as the roadmap/expansion grant, and as evidence there *is*
  a disability funding track (which strengthens rather than weakens our PwD gap claim,
  since ELI funds projects, not first-time founders)

---

## ❌ Corrections to CONTEXT.md — raise these with the team

| # | CONTEXT.md says | Finding | Action |
|---|---|---|---|
| 1 | §5: VFG (Youth) "Grants up to $300,000" | $300k is the **general** VFG figure, confirmed on raise.sg. The Youth track appears to be **up to S$20,000** | **Do not put $300k next to "Youth" on a slide.** A judge who knows the sector will catch it. Say "up to $20,000 for the youth track; the main VFG track goes to $300,000" |
| 2 | §7 example rules JSON `source_url: raise.sg/ventureforgood-youth.html` | **404 — dead URL** | Every rule needs a live `source_url`. Use the general VFG page plus the youth listing until raiSE's own youth page is located |
| 3 | §5: unincorporated applicants need "an **SSO** partnership" | Sources say **VWO** (Voluntary Welfare Organisation) / SSA (Social Service Agency). SSO = Social Service Office, a different thing | Use VWO/SSA in rules and on stage |
| 4 | §8 roles table gives C the "eligibility function" | §7 layout and non-negotiable #2 both give `eligibility.ts` to **B** | Resolved in `INTERFACE_CONTRACT.md`: B owns the file, C owns the rules and the test cases |

---

## Still open

| Item | Owner | Blocks | Notes |
|---|---|---|---|
| Primary-source URL for Startup SG Founder quantum | C | Nothing (display metadata only) | Try enterprisesg.gov.sg site search |
| Primary-source URL for VFG (Youth) criteria | C | Nothing (criteria unchanged) | raiSE may have folded youth into the main page |
| ACRA `resource_id` on data.gov.sg | C → B | `acra.ts` | Datasets split into 27 by first letter; hardcode one or two (CONTEXT §7) |
