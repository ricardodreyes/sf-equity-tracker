# SF Accountability Ledger

San Francisco writes reporting deadlines into its own ordinances. This tracks whether the documents actually show up, across homelessness, behavioral health and drug policy. Every row cites the law that creates the duty, the date the law sets, and the full list of places we looked.

Live at https://site-slpwlk.vercel.app.

The thesis: filed is not findable. A department can submit a report to the Board of Supervisors and it still has no page on sf.gov, no catalogue record, and nothing on the department's own site. It exists as one line in the Petitions and Communications section of a meeting agenda PDF. That's a different failure from not filing, so the ledger scores the two separately.

## The ledger

12 obligations, every row checked against primary sources, last on 2026-08-25. As the site reads today:

- 6 filed
- 2 missing
- 1 partial
- 1 undeterminable (the enacted text stops mid-sentence, so no deadline can be computed)
- 1 repealed
- 1 not yet due

On findability: 6 published, 2 buried, 4 not found.

The data is `data/manual/obligations.json`. It's hand curated and the site reads it as is. The page dates itself from the newest timestamp in the evidence, never from today's clock, and says so plainly when that check is more than 2 weeks old.

## How a row is scored

Status asks whether the duty was discharged: missing, filed, partial, undeterminable, or repealed. A filed row also reads "filed late" when the filing date on the record is after the deadline.

Findability asks whether a member of the public could locate the document: published (it has its own page or catalogue record), buried (it exists only inside a meeting packet or attachment), or not found.

## Two findings

**Admin Code 124.2(a), the Shelter Equity Analysis.** The site launched saying this had never been published, 221 days overdue, against two named departments. That was false. HSH submitted it to the Board in January 2026, and it sits in the Petitions and Communications section of the 2026-01-27 agenda. The agenda records a receipt window (2026-01-08 to 01-22) rather than a date, and the 2026-01-16 deadline falls inside it, so we don't claim early or late. What we do claim is that it has no page on sf.gov, no catalogue record, and no entry on HSH's own reporting and compliance page. Filed, buried.

**Admin Code 124.4, the semiannual Covered Facilities report.** Due 2026-07-01, received by the Clerk between 2026-07-16 and 07-23, so 2 to 3 weeks late. It appears only as item (9) in the 2026-07-28 Board agenda, under the title "June 2026 Shelter Equity Analysis Report", which is the name of the other Chapter 124 deliverable. An earlier draft listed it as missing. Two independent adversarial checks found it, and it was then confirmed by hand in the agenda PDF. Filed late, buried.

Both corrections stay on the site on purpose, dated, with the original claim still visible. An absence claim is the most fragile thing a site like this can publish, and the method exists to catch exactly this.

Two rows still read missing. The Rapid Rehousing hearing and report (Admin Code 20.21-4, due 2025-12-01) is the one absence claim that survived a search of the venue that falsified the others. The Street Teams annual report (Admin Code 20.11-2, due 2025-09-26) has no located copy either, but DEM asked the Board for an extension before the deadline, so that row isn't a clean failure and says so.

## How absence is verified

We enumerate, we don't search. `https://api.sf.gov/api/v2/` is a public, unauthenticated Wagtail API over roughly 94k pages and 59k documents. `documents/?order=-id&limit=1000&fields=title,created_at` walks the whole store. We listed all 58,905 documents and all 5,547 `sf.Report` pages and filtered the titles ourselves.

Board filings never enter that store. Every department filing is listed under Petitions and Communications in a Board of Supervisors agenda, and those agendas are plain PDFs at a predictable address, `https://media.api.sf.gov/documents/bag{MMDDYY}_agenda.pdf`, with `https://sfbos.archive.sf.gov/sites/default/files/bag{MMDDYY}_agenda.pdf` as the fallback. `pipeline/board_agendas.py` pulls every agenda since July 2025 and searches the full text on every run. Skipping that venue is what produced the three false absence claims.

Every check records the URL, the HTTP status, the result and the date, and new checks need a full timestamp or the data file refuses them. Every missing row lists the near misses it considered and rejected, and states the boundary of its own search.

## What doesn't work

Written down so nobody repeats it.

- The codified Municipal Code on amlegal lags the ordinances. It still showed Admin Code 106.5(d) in force months after Ordinance 137-26 struck it. Never scrape the code to detect repeals. Track them from the ordinances, by hand.
- sf.gov CMS search matches all terms (AND semantics). Zero results for a multi-word phrase proves almost nothing.
- Legistar's public API responds, but its matter data stops at 2018-12-11. Every RSS feed returns "Invalid feed" and Calendar.aspx renders an empty grid. Board filings are visible only through the agenda PDFs above.
- Records requests for HSH, DPH and ADM (Real Estate) go through https://sanfrancisco.nextrequest.com. Planning is email only, CPC-RecordRequest@sfgov.org.
- Filing a request isn't a remedy. The Sunshine Ordinance Task Force averaged 138 days to hear complaints in 2025 against a 45 day statutory limit.

## Running it

The pipeline is stdlib Python. There's no requirements file because there's nothing to install.

```
python3 pipeline/run.py            # fetch every source, then build
python3 pipeline/run.py --no-fetch # reuse the raw snapshots in data/raw
```

Run it without `--no-fetch` the first time. The Mission Local facility list isn't in this repo (see Data sources), and `--no-fetch` fails without a snapshot of it on disk.

Tests:

```
python3 pipeline/test_ledger.py
python3 pipeline/test_pipeline.py
node site/src/common.test.mjs
```

Site:

```
cd site && npm ci && npm run dev
```

`site/verify.mjs` holds the built site to the design standards it states for itself: contrast, motion, print, internal links, viewport overflow. It needs Playwright, which isn't a dependency here. Build and preview, then point it at the preview, with `PLAYWRIGHT_PKG` set to a Playwright install if there's none in `site/node_modules`:

```
cd site && npx vite build && npx vite preview --port 4173
node verify.mjs http://localhost:4173
```

Deploys are `vercel deploy --prod --yes` from `site/`. Nothing is wired to git.

## Data sources

From `SOURCE_CITATIONS` in `pipeline/config.py`:

- Shelter capacity: HSH Temporary Shelter Programs report, 4/13/2026, https://media.api.sf.gov/documents/HSH_Shelter_System_Capacity_and_Occupancy_Report_4.13.26.pdf
- Shelter locations: Mission Local facility dataset (from HSH records request), https://missionlocal.org/2025/04/sf-map-homeless-shelters-restrictions/
- Permanent supportive housing: DataSF pyxv-n29e (MOHCD Affordable Housing Portfolio)
- Behavioral health sites: DataSF p6m6-pkpk (DPH MH and SUD Provider Directory)
- Districts: DataSF cqbw-m5m3 (Current Supervisor Districts, 2022 lines)
- Neighborhoods: DataSF j2bu-swwd (Analysis Neighborhoods, the ordinance's ACS Neighborhood Profile geography)
- Population: DataSF 4qbq-hvtt (ACS 5-year, supervisor districts)
- Citywide context: HSH 2026 HIC & PIT results, LHCB 6/1/2026, https://media.api.sf.gov/documents/2026_HIC__PIT_Results_-_LHCB.pdf

The Mission Local list supplies shelter addresses and coordinates only. Capacities come from the HSH report. Mission Local publishes the list without a reuse license, so the raw copy is gitignored (`data/raw/ml_facilities/`) and the pipeline fetches it from their Datawrapper chart on a first run.

Obligations, deadlines and evidence live in `data/manual/obligations.json`, with the research behind them in `research/`. `research/deadline-findings.md` is the research snapshot from 2026-08-25, written before two of the corrections above, so where it disagrees with the ledger the ledger wins. Ordinance PDFs come from the Clerk of the Board, code text from amlegal, and the Civil Grand Jury response clocks from the California Penal Code.

## Affiliation

An independent public record. Not a City and County of San Francisco website. No residents are named, and nothing here argues that any policy is good or bad. If you can show that anything listed as missing does exist, that's the correction we most want.

Built and maintained by Ricardo Reyes.

## License

Code is MIT (see LICENSE). The hand-curated data in `data/manual` and the findings in `research/` are CC BY 4.0.
