# SF Geographic Equity Tracker: research findings

Phase 1 output. Every claim below is sourced; anything I could not verify is marked **unverified**. Researched 2026-08-15/16.

## 1. The ordinance

### What passed

**Ordinance No. 172-25, Board File No. 250487**: "Administrative Code - Equitable Citywide Access to Shelters, Transitional Housing, and Behavioral Health Services." Codified as **Administrative Code Chapter 124, "Equitable Distribution of Shelter, Transitional Housing, and Behavioral Health Facilities."**

- Legistar record: https://sfgov.legistar.com/LegislationDetail.aspx?ID=7378690&GUID=095BAEAA-E85E-46D0-A097-B2E92C16A144
- Enacted text (PDF, shows all committee amendments in strikethrough/underline): https://sfbos.org/sites/default/files/o0172-25.pdf
- Codified chapter: https://codelibrary.amlegal.com/codes/san_francisco/latest/sf_admin/0-0-0-72544

Timeline (from the Legistar record and the enacted PDF):

| Date | Action |
|---|---|
| 2025-05-06 | Introduced by Supervisor Bilal Mahmood |
| 2025-07-16, 2025-07-23 | Amended twice in Budget and Finance Committee (7/23 version substantially rewrote the bill and retitled it) |
| 2025-07-29 | Passed first reading, 9-2 (Chan and Chen against, per SF Standard) |
| 2025-09-02 | Final passage |
| 2025-09-05 | Signed by Mayor Lurie |
| 2025-10-06 | Effective date |
| 2026-01-01 | **Operative date** (Sec. 4(b)) |
| 2031-12-31 | Sunset (Sec. 124.6) |

Sponsors on the enacted ordinance: **Mahmood; Walton, Dorsey, Sauter, Melgar** (page footer of o0172-25.pdf). Press coverage also lists Fielder as an early co-sponsor (KALW, April 2025).

**Correction to the project brief:** this is not "Walton's measure with a follow-on framework from Connie Chan." Mahmood is the lead author, Walton a co-author. Chan opposed the bill, argued the mayor needed flexibility under his Fentanyl State of Emergency powers, and voted against it along with Chyanne Chen (SF Standard, The Frisc). I found no Chan "geographic equity framework" ordinance; if the brief means something specific, it needs a pointer. There is a 2017 predecessor, File 170568, "Urging Geographic Equity and Appropriateness of Homeless Services and Facilities," a non-binding resolution that never left committee (status: Pending Committee Action).

### What the enacted law actually does

The committee amendments gutted the version the press covered in April/May 2025. Reading the enacted text (o0172-25.pdf, Sections 124.1-124.6):

**The one-facility-per-district mandate is gone.** The original required the City to approve at least one new Covered Facility in each of the 11 supervisorial districts by June 30, 2026. That entire section was struck on 7/23/2025. Any tracker framing that implies districts "owe" a facility by June 2026 would misstate current law.

What survives, operative January 1, 2026:

1. **Shelter Equity Analysis (Sec. 124.2(a)).** Within 15 days of the operative date (so by ~Jan 16, 2026), HSH and the Planning Department must publish an analysis based on the 2024 PIT Count showing, for each Neighborhood: unsheltered persons count, share of citywide unsheltered persons, shelter + transitional housing bed count, and share of citywide beds. A new analysis is due within 60 days of each biennial PIT release (so one is due ~mid-2026 keyed to the 2026 PIT).
2. **Fair Share Rule (Sec. 124.2(b)).** No City officer, department, or commission may approve a new Covered Facility in a Neighborhood whose share of citywide shelter + transitional housing beds exceeds its share of citywide unsheltered persons.
3. **300-foot rule (Sec. 124.2(c)).** No approval of a new City-funded homeless shelter within 300 feet of an existing or approved homeless shelter. (The original 1,000-foot buffer between all Covered Facilities was cut to 300 feet, shelters only.)
4. **Waiver (Sec. 124.2(d)).** The Board can waive either prohibition by resolution on a public-interest finding, considering demand, comparative cost, and the sponsoring department's commitments to the neighborhood.
5. **Exceptions (Sec. 124.3).** The prohibitions do not apply to: facilities with a financing application submitted before the effective date (explicitly including Prop 1 / SB 326 Health Infrastructure Bond applications); facilities sited within the footprint of an existing Covered Facility without added square footage; and one replacement facility per Covered Facility that closed in the same Neighborhood within the prior 12 months.
6. **Reporting (Sec. 124.4).** Every six months from the operative date, the Director of Real Estate, with DPH and HSH, must report to the Board all Covered Facilities approved in the period: address, Neighborhood and its percentage of citywide beds at approval, facility type, approval date, whether a waiver was needed, Neighborhoods considered but rejected and why, and, for any shelter approved in a Neighborhood that already has one, the steps taken to find a site in a shelter-less Neighborhood. HSH and DPH present at the committee hearing. **First report was due ~July 1, 2026.**
7. **Confidentiality (Sec. 124.5).** Nothing in the chapter overrides confidentiality laws for family violence shelter locations.

Definitions that constrain the tracker's "covered" layer (Sec. 124.1):

- **Covered Facility** = a *City Project* (Admin Code Sec. 79.2 definition, i.e. City-funded) that is a Homeless Shelter, Transitional Housing Facility, or Behavioral Health Residential Care and Treatment Facility. **Outpatient clinics were removed** from the enacted version.
- **Behavioral Health Residential Care and Treatment Facility** covers respite facilities, crisis stabilization units, sobering centers, psychiatric respite, and "other low-barrier treatment facilities," and **explicitly excludes** state-licensed Adult Residential Facilities, RCFEs, DHCS-licensed residential SUD treatment, Social Rehabilitation Facilities, Mental Health Rehabilitation Centers, and Psychiatric Health Facilities. So most licensed treatment beds are *outside* the ordinance.
- **Neighborhood** = the "American Community Survey Neighborhood Profile Boundaries Map." This is DataSF's **Analysis Neighborhoods** (41 neighborhoods); the dataset description confirms it is the map referenced in Planning Code Sec. 415 under that ACS name.
- Private-sector facilities and zoning are untouched; the ordinance only governs how the City spends its own money.

**Framing consequence for the tool:** the legal mechanics run on 41 Analysis Neighborhoods and City-funded facilities only. Supervisor-district rollups are the political frame (useful, and the ordinance was sold that way), but the compliance math (fair share, over/under-served) must be computed per Neighborhood or the tool misstates the law. The tracker should show both geographies and label the covered-vs-not distinction per facility.

### Reports published under the ordinance so far

- **Shelter Equity Analysis:** not findable online as of 2026-08-16 (searched sf.gov, media.api.sf.gov, Legistar). Either unpublished, not indexed, or missed deadline. Records request target; the miss itself would be a story.
- **First Sec. 124.4 semiannual report (due ~July 2026):** likewise not findable. The Legistar public API (webapi.legistar.com/v1/sfgov) is stale, nothing after ~2018, so absence there proves little; it may exist as a Board file only visible in the Legistar web UI. Needs a manual Legistar UI search, then a records request if absent.

## 2. Facility data sources

All DataSF datasets are Socrata; API endpoint pattern `https://data.sfgov.org/resource/<id>.json`, GeoJSON export available for geo datasets. I verified every dataset ID below by querying it.

### Shelters and transitional housing

There is **no public DataSF dataset of shelter sites with addresses and bed counts**. Confirmed absences: catalog searches for shelter/interim housing/navigation center return only the HSH Shelter Waitlist (`w4sk-nq57`). HSH's dashboards (below) are aggregate. Mission Local built its April 2025 map from data "provided by HSH following a public records request," which confirms the site-level list exists internally and is releasable.

What is public:

- **HSH Shelter and Crisis Interventions dashboard** (https://www.sf.gov/data--shelter-and-crisis-interventions): inventory and occupancy by program type, refreshed weekdays 10am from the ONE System. Aggregate, no addresses, no download.
- **HSH Housing Inventory dashboard** (https://www.sf.gov/data--housing-inventory, documentation at hsh.sfgov.org): units/beds by program type and household type, monthly refresh. Aggregate, no addresses.
- **HUD Housing Inventory Count (HIC)**, CoC CA-501 (San Francisco): project-level records with bed counts per project, annual. Distribution page: https://www.huduser.gov/portal/datasets/ahar.html ("PIT and HIC Data Since 2007"; the old hudexchange.info/resource/3031 link is dead). Addresses are frequently blank and DV projects are suppressed per HUD policy, so HIC gives project names + beds; addresses need matching against other sources.
- **2026 HIC/PIT topline** (HSH presentation to the Local Homeless Coordinating Board, 6/1/2026, https://media.api.sf.gov/documents/2026_HIC__PIT_Results_-_LHCB.pdf): 5,148 emergency shelter + transitional housing beds (all-time high, +5% vs 2025, +15% vs 2024); 89% utilization; 16,958 PSH/other-permanent-housing beds (+12% vs 2024); 2026 PIT total 7,973 (4,573 sheltered, 3,400 unsheltered, lowest unsheltered since 2011). Full 2026 PIT report due "summer" 2026 on the HSH site; not yet posted as of mid-August 2026.
- **sf.gov shelter directory pages** (per-population shelter listings under sf.gov services): names and some addresses, HTML, no bed counts. Usable to seed the site list.
- **Controller, Assessment of the San Francisco Shelter System, Dec 2024** (https://media.api.sf.gov/documents/CON_Shelter_Assessment_Report.pdf): system overview, equity analysis, "no shelters in the western half of the city." Check its appendix for a site list (PDF, extractable).
- **Controller, 2025 Homelessness Needs Assessment** (https://media.api.sf.gov/documents/2025_Homelessness_Needs_Assessment.pdf): ~75% of shelters/beds in eight neighborhoods.

**Conclusion:** the v1 shelter layer has to be assembled: HIC project-level bed counts + sf.gov directory pages + controller report appendix, reconciled by hand once, then maintained via records request and change tracking. This is the main data-assembly cost in the project.

### Permanent supportive housing

- **MOHCD Affordable Housing Portfolio, `pyxv-n29e`** (updated 2026-05-21): 109 developments with `homeless_units_rollup > 0`. Has `marketing_address`, `supervisor_district`, `latitude`/`longitude`, `total_project_units`, `homeless_units_rollup`, `treatment_beds`, `losp_units_rollup`, `vash_units_rollup`, tenure, status. This is the PSH backbone.
- Caveat: covers MOHCD/OCII-financed developments. HSH-leased or master-leased PSH (some hotel conversions, older master-lease SROs) may be missing. Cross-check totals against the HIC's ~16,958 PSH/OPH beds; the delta tells you how much is missing.

### Behavioral health

- **DPH MH and SUD Provider Directory - Site List, `p6m6-pkpk`** (updated daily; filtered views: MH `4xeb-pqnj`, SUD `i3eb-d76i`, combined `ymx3-kyz4` / `hmm5-755v`): 167 sites, full addresses, `level_of_care` (ASAM codes), `treatment_type`, `type_of_care`, phone, population served. Treatment types include "Opioid Treatment Programs & Medications for Opioid Use Disorder" (16 sites), Residential Treatment (8), Residential Step-Down (12), Withdrawal Management (1). City-contracted providers only; private-pay and non-Drug-Medi-Cal facilities are not in it.
- **DPH Substance Use Services, `ubf6-e57x`** (updated daily): metrics by service category (residential treatment, withdrawal management, methadone), no addresses. Good for citywide denominators, not mapping.
- **Overdose context** (optional layers): `jxrr-bmra` preliminary overdose deaths, `ed3a-sn39` overdose 911 responses.

### Methadone / OTP

- **SAMHSA Opioid Treatment Program Directory**: https://www.samhsa.gov/find-help/locators/opioid-treatment-program-directory (verified 200; the old dpt2.samhsa.gov directory.aspx redirects here). State-filtered list with addresses. Cross-check against the 16 OTP/MOUD rows in `p6m6-pkpk`.
- **FindTreatment.gov** (verified up): facility locator covering SUD/MH treatment nationally; usable as a second cross-check.

### Sobering / stabilization

- **SoMa RISE**, 1076 Howard St: drug sobering center, HealthRIGHT 360 under DPH (https://www.sf.gov/soma-rise-center). Open since 2022.
- **Crisis Stabilization Unit, 822 Geary St**: 16 beds, 23-hour stays, 24/7 drop-off, operator Crestwood Behavioral Health, opened spring 2025 under Lurie's fentanyl emergency authority (sf.gov news release; Health Commission presentation at https://media.api.sf.gov/documents/822_Geary_CSU_Health_Comm_Presentation_Final.pdf).
- A further SoMa sobering center was signed off by Lurie in 2025-26 (SF Examiner, KQED coverage of a legal risk memo). Address and status **unverified**; chase before mapping.
- The brief's "444 6th St triage center": **unverified**. I found no facility at that address in any source checked. Do not map without confirmation.

### Syringe access

- **Syringe Access Collaborative** page (https://www.sf.gov/information--syringe-access-collaborative) and SF AIDS Foundation Syringe Access Services (https://www.sfaf.org/programs/syringe-access-services/): services are substantially mobile and scheduled pop-ups (street corners at set hours), published as an HTML schedule and printable PDF, no machine-readable list, no stable "facility" addresses for many sites.
- Recommendation: syringe access does not fit a fixed-facility map. Either exclude from v1 with a methodology note, or list fixed storefront sites only (SFAF's 1035 Market etc.) manually. Mapping pop-up corners invites harassment of clients and staff and misrepresents "facility" siting anyway.

### State licensing cross-checks

- **DHCS SUD Recovery Treatment Facilities** (data.chhs.ca.gov, dataset `sud-recovery-treatment-facilities`, updated daily): licensed/certified SUD facilities statewide, CSV/GeoJSON/ArcGIS downloads via gis.dhcs.ca.gov. Catches private facilities the DPH directory misses.
- **DHCS Certified and Approved Residential Mental Health Programs** (data.ca.gov): residential MH cross-check.
- **CDSS Community Care Licensing Facilities** (data.ca.gov, dataset `community-care-licensing-facilities`): Adult Residential Facilities and similar licensed care, statewide.
- Note: these licensed categories are mostly *excluded* from the ordinance's Covered Facility definition, so they belong on the map as context layers, clearly labeled not-covered.

## 3. District assignment

- **Current Supervisor Districts, `cqbw-m5m3`** (2022 redistricting lines, updated 2025-12-02, includes current member names in `sup_name`): full boundaries with multipolygon geometry. **Trimmed version `hcgx-vtsb`** removes water/non-contiguous territory, better for choropleths. Both export as GeoJSON from Socrata. Point-in-polygon is sufficient for assignment; the only quirks are non-contiguous pieces (Treasure Island in D6, islands) which the full dataset handles.
- **Analysis Neighborhoods, `j2bu-swwd`**: the 41 neighborhoods that are the ordinance's legal geography. Same join approach.
- **Population per district: `4qbq-hvtt`** (SF Population and Demographic Census Data, ACS-derived), `geography='supervisor districts'`, `demographic_category='all'`, unit `population count`. Latest `end_year` 2023: D1 74,793; D2 67,028; D3 70,495; D4 75,504; D5 87,464; D6 67,853; D7 80,213; D8 71,160; D9 79,996; D10 77,413; D11 84,402. Rows with `end_year` ≤ 2021 predate the 2022 boundaries; filter to `end_year >= 2022`. (Verify vintage/boundary alignment note in the dataset docs during build.)

## 4. Prior art

- **Mission Local, April 2025** (https://missionlocal.org/2025/04/sf-map-homeless-shelters-restrictions/): mapped facilities and the then-proposed 1,000-foot buffers, from a records request to HSH. One-off snapshot of a bill that changed substantially before passage; not maintained; district counts cited: D4/D7/D8 zero shelters, D1/D11 no emergency shelters.
- **SF Examiner** facilities map ("See where San Francisco has put its homeless facilities"): one-off news interactive.
- **HSH dashboards**: aggregate inventory/occupancy, no maps, no site list, no equity math.
- **Controller reports** (Dec 2024 shelter assessment, 2025 needs assessment): the geographic analysis exists in PDF form, static, not tied to the enacted ordinance's fair-share test.
- **ShelterTech / sfserviceguide.org** (GitHub ShelterTechSF/askdarcel-web, GPL-3.0, 29 stars, actively developed, last push 2026-08-13; the org's newer `sheltertech-go` backend also active): a service *directory* for people seeking help. Different audience, no distribution/equity analysis, no bed counts by geography. Complementary, not competing. (The brief's "askdarcel" repo name is now under the ShelterTechSF org.)
- **2025-26 Civil Grand Jury, "At Scale, At Risk"** (https://media.api.sf.gov/documents/2026_CGJ_Rpt_At_Scale_At_Risk_-_Upgrading_Data_and_Oversight_to_Improve_Homele_woZ0ksh.pdf): critiques homelessness data and oversight. Useful context and justification, not a tracker.

**Nobody has built** a maintained tracker that maps the full facility set, computes district and neighborhood shares against population and unsheltered counts, applies the enacted Chapter 124 fair-share test, and tracks sitings over time. The niche is open, and the two artifacts the ordinance itself mandates (Shelter Equity Analysis, semiannual approval reports) give the tool an official data drumbeat to track against.

## 5. Data gaps and records access

| Gap | Holder | Path |
|---|---|---|
| Shelter/TH site list with addresses + bed counts | HSH (ONE System) | Sunshine/CPRA request; precedent: Mission Local got it in 2025. Ask for the same extract plus program type and capacity. |
| Shelter Equity Analysis (due ~Jan 2026) | HSH + Planning | Request if not published; also ask when it will be posted. |
| Sec. 124.4 semiannual approvals report (due ~Jul 2026) | Real Estate Division | Check Legistar web UI first (public API is stale post-2018); then request. |
| Siting pipeline / planned facilities | HSH, DPH, Real Estate | Request capital plans, site searches, LOIs; hardest ask, expect redactions on negotiations. |
| Bed counts per behavioral health facility | DPH | Contract exhibits via records request; DPH directory has sites but not capacity. |
| Master-leased PSH missing from MOHCD portfolio | HSH | Reconcile HIC project list vs `pyxv-n29e`; request the HSH housing site list to fill the delta. |

Process: the SF **Sunshine Ordinance** (Admin Code Ch. 67, text at codelibrary.amlegal.com) layers on the CPRA. CPRA response due in 10 calendar days (14-day extension possible); Sunshine adds the **Immediate Disclosure Request** option (response due close of next business day) and appeal to the Sunshine Ordinance Task Force on non-compliance. Design v1 to ship on public data alone; requests only enrich (bed counts, pipeline).

Address sensitivity: domestic violence / family violence shelters are confidential by law, Chapter 124.5 reaffirms it, and HUD suppresses them in the HIC. Exclude them from the map entirely; count them in citywide aggregates only where a source already aggregates them safely. Same instinct for any youth shelter a source marks confidential.

## 6. Risks and mitigations

- **Misstating the law.** The biggest one, per Phase 1 findings: the per-district mandate died in committee. Mitigation: methodology page states exactly what Ch. 124 does and does not require; compliance view runs on Neighborhoods; district view labeled as political geography.
- **Harassment vector.** A map of facilities can be used to picket sites or harass residents. Mitigations: only facilities already published in government datasets (every address in the tool must carry a public-source citation); no photos, no operator staff names, no resident information; DV/confidential sites excluded; syringe pop-up schedule excluded; a visible policy note saying all locations come from public government records.
- **NIMBY dual use.** The fair-share rule itself blocks new facilities in "over-served" neighborhoods, so the same chart that shames D2/D7 for carrying nothing can be waved to block a Tenderloin project. That is the ordinance's actual design, not a bug in the tool; the methodology page should say the tool measures distribution, and per-capita and absolute views are both shown so neither side can cherry-pick.
- **Staleness.** Facility lists rot; a closed shelter on the map is ammunition against the tool's credibility. Mitigation: every facility carries `as_of` and source; pipeline re-runs on a schedule; dashboard shows data vintage.
- **Bed-count semantics.** Shelter beds, TH units, PSH units, treatment "slots," and 23-hour stabilization chairs are not commensurable. Mitigation: never sum across categories into one number without labeling; the headline stat uses shelter + TH beds (the ordinance's own metric) and shows other categories separately.
- **Ecological inference.** District population vs facility count invites "per capita burden" claims; fine, but the ordinance's own test is beds vs *unsheltered population* share, which the tool should compute as the primary equity metric.

## Source table

| Source | ID / URL | Fields of interest | Cadence | License/terms |
|---|---|---|---|---|
| Ordinance 172-25 enacted text | sfbos.org/sites/default/files/o0172-25.pdf | Operative law | Static | Public record |
| Admin Code Ch. 124 codified | codelibrary.amlegal.com/codes/san_francisco/latest/sf_admin/0-0-0-72544 | Current law incl. future amendments | On amendment | Public record |
| Legistar file 250487 | sfgov.legistar.com/LegislationDetail.aspx?ID=7378690&… | History, votes, related files | On action | Public record |
| MOHCD Affordable Housing Portfolio | DataSF `pyxv-n29e` | address, supervisor_district, lat/long, homeless_units_rollup, treatment_beds | ~Annual+ (last 2026-05-21) | ODC-By/PDDL (DataSF terms) |
| DPH MH/SUD Provider Directory Site List | DataSF `p6m6-pkpk` (+ `4xeb-pqnj`, `i3eb-d76i`) | address, level_of_care, treatment_type (incl. OTP), population | Daily | DataSF terms |
| DPH Substance Use Services (metrics) | DataSF `ubf6-e57x` | citywide service volumes | Periodic | DataSF terms |
| HSH Shelter Waitlist | DataSF `w4sk-nq57` | demand context | Daily | DataSF terms |
| Current Supervisor Districts | DataSF `cqbw-m5m3` / trimmed `hcgx-vtsb` | boundaries, sup_dist, sup_name | On redistricting | DataSF terms |
| Analysis Neighborhoods | DataSF `j2bu-swwd` | the ordinance's legal geography (41) | Static | DataSF terms |
| SF Population & Demographic Census Data | DataSF `4qbq-hvtt` | population by supervisor district (ACS 5-yr) | Annual | DataSF terms |
| HSH Shelter & Crisis Interventions dashboard | sf.gov/data--shelter-and-crisis-interventions | aggregate inventory/occupancy by program type | Weekdays | Public |
| HSH Housing Inventory dashboard | sf.gov/data--housing-inventory | aggregate units/beds | Monthly | Public |
| HUD HIC/PIT raw data (CoC CA-501) | huduser.gov/portal/datasets/ahar.html | project-level beds; addresses spotty, DV suppressed | Annual | Public |
| 2026 HIC/PIT results deck | media.api.sf.gov/documents/2026_HIC__PIT_Results_-_LHCB.pdf | 2026 toplines (5,148 ES/TH beds; 16,958 PSH/OPH; PIT 7,973) | One-off | Public record |
| Controller Shelter System Assessment (Dec 2024) | media.api.sf.gov/documents/CON_Shelter_Assessment_Report.pdf | geographic findings, possible site appendix | One-off | Public record |
| Controller 2025 Homelessness Needs Assessment | media.api.sf.gov/documents/2025_Homelessness_Needs_Assessment.pdf | 75%-in-8-neighborhoods finding | One-off | Public record |
| SAMHSA OTP Directory | samhsa.gov/find-help/locators/opioid-treatment-program-directory | OTP addresses (CA filter) | Ongoing | Public |
| FindTreatment.gov | findtreatment.gov | treatment facility locator cross-check | Ongoing | Public |
| DHCS SUD Recovery Treatment Facilities | data.chhs.ca.gov `sud-recovery-treatment-facilities` (GeoJSON/CSV) | licensed SUD facilities incl. private | Daily | CA open data |
| DHCS Residential MH Programs | data.ca.gov `certified-and-approved-residential-mental-health-programs` | residential MH cross-check | Periodic | CA open data |
| CDSS Community Care Licensing | data.ca.gov `community-care-licensing-facilities` | ARF and licensed care cross-check | Periodic | CA open data |
| SoMa RISE / 822 Geary CSU | sf.gov/soma-rise-center; media.api.sf.gov 822 Geary presentation | sobering/stabilization sites | Static | Public |
| Syringe Access Collaborative | sf.gov/information--syringe-access-collaborative; sfaf.org | mobile schedule (recommend exclude) | Ongoing | Public |

Known-stale/dead paths, do not use: `webapi.legistar.com/v1/sfgov` (no matters after ~2018), `hudexchange.info/resource/3031` (404), `hsh.sfgov.org/*` (301s to sf.gov), `sfbos.org/ordinances-2025` (301 to sfbos.archive.sf.gov).

## Gaps table

| # | Missing | Blocks | Workaround for v1 |
|---|---|---|---|
| 1 | Shelter site list w/ addresses + beds | Shelter layer precision | Assemble from HIC + sf.gov pages + controller appendix; records request in parallel |
| 2 | Shelter Equity Analysis document | Official fair-share numbers | Compute independently from PIT neighborhood data + assembled bed list; request the doc |
| 3 | Sec. 124.4 semiannual report | Change tracking of approvals | Manual Legistar UI monitoring; request |
| 4 | Per-facility BH bed counts | BH bed rollups | Show facility counts, not beds, for BH in v1 |
| 5 | Siting pipeline | Leading-indicator tracking | Later phase; Legistar + news monitoring meanwhile |
| 6 | 2026 PIT full report (neighborhood-level unsheltered) | Ordinance-exact fair-share math on 2026 data | Use 2024 PIT neighborhood tables (published) until the summer 2026 report posts |
