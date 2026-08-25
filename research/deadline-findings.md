# SF deadline-compliance tracker: research findings

Phase 1 for the pivot from facility map to compliance ledger. Researched 2026-08-24/25 across two
agent workflows (17 agents, ~1,000 tool calls) plus first-hand verification. Every row below was
checked against primary sources. Where a claim died under adversarial review, it is marked.

## The headline correction

An earlier draft of this project asserted that **both** Chapter 124 deliverables were missing. That
was wrong, and the adversarial pass caught it. **The Sec. 124.4 report exists.** It was found by two
independent refuters and then confirmed by hand in the Board's own agenda PDF.

This is the single most important methodological lesson: absence claims must be attacked before they
are published, not after.

## The ledger (verified status as of 2026-08-25)

### Missing

| # | Obligation | Cite | Due | Days | Evidence |
|---|---|---|---|---|---|
| 1 | **Shelter Equity Analysis** (per-Neighborhood unsheltered persons and shelter/TH beds with citywide shares) | Admin Code 124.2(a) | 2026-01-16 | **221** | Two adversarial refuters failed to find it. One enumerated all **58,905** sf.gov CMS documents and all **5,547** `sf.Report` pages; the other paginated 18,000 records (ids 43443 to 62484, covering 2025-08-14 through 2026-08-24, bracketing the deadline). Full enumeration, not search results. |
| 2 | **Street Teams report** | Admin Code 20.11-2 | 2025-09-26 | **333** | Clearest failure of the set. 20.11-2(e) requires DEM to post each report on its own site within 10 days. DEM's site carries exactly one PDF, a 2021 security-camera policy. The only such report that exists is a *voluntary* FY23-24 predecessor from Oct 2024, published before the ordinance took effect. |
| 3 | **Rapid Rehousing hearing + report** | Admin Code 20.21-4 | 2025-12-01 | **267** | Every Homelessness Oversight Commission agenda from Jan 2025 through Aug 2026 was checked. HOC cancelled its Oct 2, Nov 6, Dec 4 and Jan 1 meetings. No agenda in that span contains a Rapid Rehousing hearing. |
| 4 | **CGJ "At Scale, At Risk" 60-day responses** (Mayor, City Attorney; requested from HOC, HSH, Controller, OCA) | Cal. Penal Code 933(c), 933.05 | 2026-08-24 (60d from 6/23 publication; Sat 8/22 rolls to next business day) | **1** | The sf.gov jury-year collection page carries only the report and press release. The same page is actively maintained (jails-report responses posted 2026-08-07), so the absence is real, not staleness. The Board's 90-day response is due **2026-09-21** and is upcoming. |

### Filed, but effectively unfindable

| # | Obligation | Cite | Due | Filed | The problem |
|---|---|---|---|---|---|
| 5 | Semiannual report on Covered Facilities Approved | Admin Code 124.4 | 2026-07-01 | Received 2026-07-16 through 07-23, roughly **2 to 3 weeks late** | Filed by the Office of the City Administrator, but it appears **only** as Petitions and Communications item (9) inside the July 28 2026 Board agenda packet. It has no sf.gov page, **no CMS document record**, and nothing on the Real Estate Division or City Administrator sites. It is titled *"June 2026 Shelter Equity Analysis Report"*, colliding with the name of the **different** deliverable owed under 124.2(a). It is a one-page letter reporting that nothing happened. |

Verified by hand: `https://www.sf.gov/documents/61026/bag072826_agenda.pdf`, line 2342:
> "From the Office of the City Administrator (ADM), pursuant to Administrative Code, Section 124.4,
> submitting the June 2026 Shelter Equity Analysis Report. Copy: Each Supervisor. (9)"

### Complied

| # | Obligation | Cite | Evidence |
|---|---|---|---|
| 6 | OCOH triennial homelessness needs assessment | BTRC 2810(e)(2)(B) / Admin Code 5.41-2(d) | Controller's *2025 Homelessness Needs Assessment*, 2025-12-10, states on its face that it fulfils the section. Due 2025-12-31 on a three-year cycle from a 2019 base. |
| 7 | OCOH annual appropriations recommendations | Admin Code 5.41-2(a) | 2026-06-01 memo covering FY26-27 and FY27-28, to the Mayor and Board, copied to the Health Commission and HOC: exactly the statutory recipients. |
| 8 | Homeward Bound annual report | Admin Code 20.19-4 | Posted 2025-10-02 against an Oct 1 deadline. |
| 9 | Chapter 21B quarterly Core Initiative contract reports | Admin Code 21B.6(b) | **Partial.** HSH has filed four (2025-07-31, 2025-10-31, 2026-01-28, 2026-07-17). The other nine Designated Departments under 21B.2 have none published, but the duty is conditional on having executed a Core Initiative contract, so silence is not automatically breach. HSH also folds Q3 and Q4 into one July filing rather than filing every three months. |

### Not trackable, and why that matters

| # | Item | Why |
|---|---|---|
| 10 | 21B.4 annual donations report | The **enacted sentence is truncated mid-clause**; American Legal carries a "So in Ord. 10-25" codification note. There is no ascertainable deadline. A duty that cannot be computed cannot be tracked, and saying so is itself the finding. |
| 11 | Cash Not Drugs Pilot assessment | Program is real and in force (Ord. 257-24, sunsets 2027-12-15), but 20.20-5 runs from "the start date of the Pilot Program" and there is no evidence the pilot started or that the 20.20-4 implementation plan (due ~2025-06-15) was produced. No instance has come due. |
| 12 | Navigation Centers semiannual Controller report | **Repealed.** Admin Code 106.5(d) was struck in its entirety by Ord. 137-26 (item 38), verified by rendering the page rather than trusting text extraction. |

## Traps that would have produced false accusations

1. **The codified code is stale.** amlegal (2026 S-96, current as of today) **still shows Sec. 106.5(d) intact** even though Ord. 137-26 struck it. A tracker that scrapes the code would report a repealed duty as live. Repeals must be tracked from ordinances, not from the code.
2. **sf.gov CMS search is AND-semantics.** A zero for a multi-word phrase is weak evidence: it only means no document contains every word. Absence must be established by **enumerating** the document store and regex-filtering titles, which is what the surviving refuters did.
3. **Legistar is the only venue for Board filings and the hardest to monitor.** Its public API responds but its matter data stops at **2018-12-11**. All RSS feeds return "Invalid feed"; Calendar.aspx renders an empty Telerik grid. The 124.4 report was findable *only* inside a Legistar/agenda packet PDF. sf.gov has no Board meeting pages at all.
4. **Near-miss documents.** Three documents look like the missing analysis and are not: the Nov 2025 *Home by the Bay Equity Addendum* (racial-disparity analysis of outcomes, predating the operative date), the Shelter Monitoring Committee's March 2026 emergency report (wrong author, no neighborhood table), and the Controller's Dec 2024 shelter assessment (which contains a section headed "Shelter System Demographics and Equity Analysis" at p. 30). Each must be listed as considered-and-rejected with a reason.
5. **A live lead worth chasing.** KQED (2025-11-11) reports that a **Budget and Legislative Analyst** analysis showed neighborhood-level service-versus-need discrepancies using the very figures 124.2(a) calls for. If the BLA product is public, the city had the analysis before the deadline.

## Why the missing analysis actually matters

Sec. 124.2(b)'s Fair Share Rule blocks new City-funded Covered Facilities in any Neighborhood whose
share of shelter/TH beds exceeds its share of unsheltered persons. That test **cannot be computed by
anyone outside the City**: the 2024 PIT Count publishes unsheltered counts by **supervisorial
district only**, there is no PIT dataset on DataSF, and no neighborhood-level unsheltered table has
ever been published. The ordinance's central operative mechanism has no public input.

Run as a district-level proxy against our own bed data, only **D3 and D6** are over-served and
blocked. D5 reads as *under*-served (22.4% of unsheltered people, 9.4% of beds), which is
counterintuitive and a direct consequence of the Tenderloin spanning D3, D5 and D6. Geography
changes the answer, the statute uses Neighborhood, and our bed denominator covers 3,020 of a
citywide 5,148. Details and caveats: `research/raw/fair-share-feasibility.md`.

## The thesis this research produced

The interesting finding is not "government misses deadlines." It is that **filed is not findable**.
Row 5 was submitted, is on the public record, and is invisible: no CMS record, no department page, a
name that collides with a different statutory deliverable, buried on page 36 of an agenda packet.
Row 1 is the analysis that would let the public check the law, and it is 221 days absent. A ledger
that shows both, and that scores *discoverability* alongside compliance, says something no existing
SF resource says.

## Prior art

No SF tracker of mandated-report compliance exists: not the Controller, the Board, SPUR, GrowSF,
TogetherSF, Mission Local, SF Standard, SF Public Press, or the Chronicle. The Controller's City
Performance Scorecards track service outcomes, never whether a document was filed, and went stale
from early 2020 to a roughly 2023 relaunch. Mission Local's Lurie bed tracker is a cautionary tale:
it promised "check back on this page" and froze at dateModified 2025-05-28, while SF Standard
reported Lurie abandoned the pledge in July 2025. Its in-page correction notice is a pattern worth
copying.

## Method for asserting absence

- **Never** write "the department did not produce the report." Write: "No published X was found at
  these URLs as of this timestamp," and publish the search log with HTTP status codes.
- Enumerate the document store; do not rely on search.
- Publish the considered-and-rejected list so the obvious rebuttal is pre-answered.
- **Cal. Evidence Code 1284**: a writing by the official custodian reciting a diligent search and
  failure to find a record is admissible to prove absence. Request that certificate so the *City*
  attests the absence rather than us.
- Corrections live in-page, dated, never silently edited.

## Tooling that works

- `https://api.sf.gov/api/v2/`: public unauthenticated Wagtail CMS API, ~94k pages and ~59k
  documents, typed (`sf.Report`, `sf.Meeting`, `sf.News`), with `meta.download_url`. Enumerate with
  `documents/?order=-id&limit=1000&fields=title,created_at`.
- `https://www.sf.gov/sitemap.xml`: 17,253 URLs with lastmod.
- sf.gov search: `?q=` (the `search_api_fulltext` param is silently ignored).
- `https://sanfrancisco.nextrequest.com`: records portal, 18 departments including HSH, DPH and ADM
  (Real Estate). Public citable request IDs; JSON at `/client/requests?page=N` and
  `/client/requests/{id}/timeline`. Planning is off-portal: CPC-RecordRequest@sfgov.org.
- DataSF new-dataset detection: `order=createdAt+DESC`, never `updatedAt`, which churns.
- Records-request deadlines: Admin Code 67.21(b) 10 days; 67.21(c) 7-day existence statement;
  **67.25(a) Immediate Disclosure Request, response by close of business the next day** if the
  phrase appears across the top of the request and in the subject line.
- Enforcement reality: the Supervisor of Records (City Attorney) does not decide timeliness; SOTF
  averaged **138 days** to hear complaints in 2025 against a 45-day statutory limit, and its 2025
  annual report records 54 orders, 6 confirmed refusals, and **zero** confirmed compliances.
  Precedent on point: SOTF Files 26035 and 26037 (2026-05-06) found HSH violated 67.21(b), (c) and
  (e) over shelter operating contracts, and HSH did not attend the hearing.

## Context worth carrying into the product

- **Ord. 137-26** (File 250630, passed 7 to 4 on 2026-07-21, mayor-approved 7/23, 362 pages, built
  with Stanford RegLab using AI) removed ~150 code sections and rewrote 111 reporting categories.
  Chapter 124 was untouched (zero hits for "Chapter 124", "Shelter Equity", "Covered Facilit").
  Reporting duties are being actively deleted, which is an argument for tracking them now.
- **Ord. 99-26** (eff. 2026-06-29) abolished the Shelter Monitoring Committee and the Shelter
  Grievance Advisory Committee. CGJ Finding 5 records that this leaves **no independent body**
  empowered to make unannounced inspections of any City-funded shelter or PSH. The SMC's own final
  act was a March 2026 emergency report warning of unaddressed inequities and data gaps.
- **Charter Sec. 4.133** (Homelessness Oversight Commission) contains no reporting cadence and no
  report deadline at all.
- Mission Local, April 2026: 450+ Tenderloin shelter beds closing (Adante and Monarch already shut;
  711 Post, 280 beds, slated within a year). 711 Post is 280 of D3's 707 mapped beds.
