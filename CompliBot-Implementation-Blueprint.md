# CompliBot — Sector-Wise Implementation Blueprint

**What this document answers:** Exactly HOW CompliBot works for each industry — what data the customer provides, what the AI generates, what the output looks like, and how to build each compliance engine.

---

## How CompliBot Works (Universal Flow)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER SIDE                                  │
├─────────────────────────────────────────────────────────────────────┤
│  1. Customer selects industry + compliance type                      │
│  2. Customer uploads operational data (CSV, PDF, manual entry)       │
│  3. Customer answers guided questions (facility-specific)            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        COMPLIBOT ENGINE                               │
├─────────────────────────────────────────────────────────────────────┤
│  4. Data extraction & validation (parse uploads, normalize)          │
│  5. Regulation matching (which rules apply to THIS facility)         │
│  6. Gap analysis (compare data vs. requirements)                     │
│  7. Report generation (AI + templates + citations)                   │
│  8. Quality scoring (confidence level per section)                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        HUMAN REVIEW (10%)                             │
├─────────────────────────────────────────────────────────────────────┤
│  9. Certified reviewer checks flagged sections                       │
│ 10. Reviewer approves or requests AI regeneration                    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DELIVERY                                       │
├─────────────────────────────────────────────────────────────────────┤
│ 11. Customer receives completed report (PDF/DOCX)                    │
│ 12. Customer reviews, approves, submits to regulatory agency         │
│ 13. CompliBot stores for audit trail + continuous monitoring         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## SECTOR 1: INDUSTRIAL / MANUFACTURING

### What the Customer Provides

| Data Type | Format | Example |
|-----------|--------|---------|
| Incident/injury logs | CSV or manual entry | Date, employee, injury type, body part, days away |
| Chemical inventory | CSV or SDS upload | Chemical name, CAS#, quantity, location, NFPA ratings |
| Equipment list | CSV | Asset name, type, last inspection date, condition |
| Employee roster | CSV | Name, department, job title, hire date, training dates |
| Facility info | Form answers | Address, sq ft, NAICS code, employee count, operating hours |
| Training records | CSV or certificates | Course, employee, date, expiration |
| Previous filings | PDF upload | Last year's OSHA 300, prior EPA Tier II |

### What CompliBot Generates

#### OSHA 300 Log & 300A Summary
**Input needed:** Injury/illness records for the year
**Output delivered:**
```
OSHA Form 300 — Log of Work-Related Injuries and Illnesses
────────────────────────────────────────────────────────────
Establishment: Acme Manufacturing Corp
Location: 4500 Industrial Blvd, Houston, TX 77001
Industry: Metal Fabrication (NAICS 332710)
Year: 2026

Case  Employee    Job Title       Date    Where        Description          Death  Days   Restrict  Other  Days   Days
No.   Name                                                                         Away             Record  Away   Restr
───── ─────────── ─────────────── ─────── ──────────── ──────────────────── ────── ────── ──────── ────── ────── ──────
26-01 R. Martinez Welder          01/15   Fab Shop B   Burn to left forearm   ☐     ☐       ☒        ☐      0      5
26-02 T. Williams Forklift Op     03/22   Warehouse    Strain, lower back     ☐     ☒       ☐        ☐      8      0
26-03 S. Patel    CNC Operator    05/08   Machine Shop Laceration, right hand ☐     ☐       ☐        ☒      0      0

OSHA Form 300A — Summary of Work-Related Injuries and Illnesses
────────────────────────────────────────────────────────────
Total cases: 3
Total deaths: 0
Total days away from work cases: 1
Total job transfer/restriction cases: 1
Total other recordable cases: 1
Total days away from work: 8
Total days of restriction: 5
Total injury cases: 3
Annual average employees: 245
Total hours worked: 510,400
TRIR (Total Recordable Incident Rate): 1.18
DART Rate: 0.78

Certification: [Prepared by CompliBot — requires authorized signature]
Per 29 CFR 1904.32, this summary must be posted February 1 - April 30.
```

#### EPA Tier II Report
**Input needed:** Chemical inventory with quantities
**Output delivered:**
- Complete Tier II form with all 8 sections
- Chemical-by-chemical breakdown with physical/health hazards
- Storage locations with maximum daily amounts
- Emergency contact information section
- Certification page ready for signature
- Filed per 40 CFR 370.40-45

#### Maintenance Compliance Audit
**Input needed:** Equipment list, inspection records, maintenance logs
**Output delivered:**
- Pressure vessel inspection status (per ASME BPVC / National Board)
- Electrical maintenance compliance (per NFPA 70B)
- Elevator/escalator inspection status (per ANSI/ASME A17.1)
- Fire protection system testing (per NFPA 25)
- Gap analysis with criticality ratings
- Corrective action plan with deadlines

### Implementation Architecture

```
api/src/engines/industrial/
├── osha-300.ts          — OSHA 300/300A log generator
├── osha-ita.ts          — Electronic submission formatter
├── epa-tier2.ts         — EPA Tier II chemical reporting
├── spcc.ts              — Spill Prevention Control plan
├── pms.ts               — Process Safety Management docs
├── lockout-tagout.ts    — LOTO procedure generator
├── respiratory.ts       — Respiratory protection program
├── confined-space.ts    — Confined space program
├── maintenance-audit.ts — Equipment compliance audit
└── safety-inspection.ts — General safety inspection report

api/src/data/industrial/
├── osha-standards.json      — All 29 CFR 1910 standards (structured)
├── epa-chemicals.json       — Reportable chemicals + thresholds
├── penalty-schedule.json    — Current penalty amounts
└── state-requirements.json  — State-specific additions (CA-OSHA, etc.)
```

### Key Technical Challenge
- Parse CSV/PDF injury data into structured OSHA 300 format
- Correctly classify injuries per 29 CFR 1904.7 decision tree
- Calculate TRIR and DART rates correctly (formulas are specific)
- Generate valid ITA submission XML

---

## SECTOR 2: HEALTHCARE / MEDICAL

### What the Customer Provides

| Data Type | Format | Example |
|-----------|--------|---------|
| Facility info | Form | Practice type, specialties, # providers, EHR system |
| Patient volume | Number | Annual patient encounters, records stored |
| IT inventory | Form/CSV | Systems, servers, endpoints, cloud services, vendors |
| Vendor list | CSV | Name, service, access to PHI (yes/no), BAA status |
| Incident log | Manual entry | Security incidents, breaches, near-misses |
| Training records | CSV | Staff name, HIPAA training date, role |
| Physical security | Checklist | Locked areas, badge access, camera coverage |
| Current policies | PDF upload | Existing policies (we compare and identify gaps) |

### What CompliBot Generates

#### HIPAA Security Risk Assessment (Required by 45 CFR 164.308(a)(1))
**Output delivered:**
```
HIPAA SECURITY RISK ASSESSMENT
═══════════════════════════════════════════════════════════════

Practice: Summit Internal Medicine Associates
Assessment Date: May 19, 2026
Assessor: CompliBot AI (reviewed by [CHC Reviewer Name])
Standard: 45 CFR Parts 160 and 164

─────────────────────────────────────────────────────────────
SECTION 1: ADMINISTRATIVE SAFEGUARDS (§164.308)
─────────────────────────────────────────────────────────────

§164.308(a)(1) — Security Management Process
┌──────────────────────────────┬────────┬──────────────────────────────┐
│ Requirement                  │ Status │ Finding                      │
├──────────────────────────────┼────────┼──────────────────────────────┤
│ Risk Analysis                │ PARTIAL│ Last assessment dated 2024.  │
│                              │        │ Must be conducted annually.  │
├──────────────────────────────┼────────┼──────────────────────────────┤
│ Risk Management              │ MET    │ Policies in place, reviewed  │
│                              │        │ quarterly.                   │
├──────────────────────────────┼────────┼──────────────────────────────┤
│ Sanction Policy              │ MET    │ Employee handbook §4.7       │
│                              │        │ addresses violations.        │
├──────────────────────────────┼────────┼──────────────────────────────┤
│ Information System Activity  │ GAP    │ No centralized audit log     │
│ Review                       │        │ review process documented.   │
└──────────────────────────────┴────────┴──────────────────────────────┘

COMPLIANCE SCORE: 78/100
CRITICAL GAPS: 3
HIGH PRIORITY GAPS: 5
CORRECTIVE ACTIONS RECOMMENDED: 12

─────────────────────────────────────────────────────────────
GAP #1 (CRITICAL): Audit Log Review
Standard: 45 CFR 164.308(a)(1)(ii)(D)
Current State: No documented process for regular review of
               information system activity records.
Required Action: Implement monthly audit log review process
                 with documented sign-off.
Deadline: Within 30 days
Citation: "A covered entity must implement procedures to
          regularly review records of information system
          activity, such as audit logs, access reports,
          and security incident tracking reports."
─────────────────────────────────────────────────────────────
```

#### HIPAA Policies & Procedures Package
**Output delivered:**
- Privacy Policy (Notice of Privacy Practices)
- Security Policy (30+ individual policies covering all §164.308/310/312 standards)
- Breach Notification Policy & Procedures
- Business Associate Agreement template
- Workforce Training Program documentation
- Minimum Necessary Standard implementation guide
- Patient Rights procedures (access, amendment, accounting of disclosures)
- All cross-referenced to specific CFR sections

#### Breach Response Documentation
**Input needed:** Incident details (what happened, when, who affected, what data)
**Output delivered:**
- Breach risk assessment (4-factor test per 45 CFR 164.402)
- Individual notification letters (within 60 days per §164.404)
- HHS notification (if 500+ individuals affected)
- Media notification template (if 500+ in a state per §164.406)
- Mitigation documentation
- Post-incident corrective action plan

### Implementation Architecture

```
api/src/engines/healthcare/
├── hipaa-risk-assessment.ts  — Full SRA per NIST/OCR guidance
├── hipaa-policies.ts         — Policy document generator
├── hipaa-breach.ts           — Breach assessment & notifications
├── hipaa-baa.ts              — Business Associate Agreement generator
├── osha-bloodborne.ts        — Bloodborne Pathogens Exposure Control Plan
├── cms-conditions.ts         — Conditions of Participation documentation
├── joint-commission.ts       — Joint Commission standards documentation
├── state-licensure.ts        — State-specific facility licensing
└── dea-controlled.ts         — DEA Schedule II-V documentation

api/src/data/healthcare/
├── hipaa-standards.json      — All 45 CFR 164 requirements (structured)
├── state-breach-laws.json    — 50-state breach notification requirements
├── cms-requirements.json     — CMS CoP requirements by facility type
└── ocr-enforcement.json      — Recent OCR enforcement actions (guidance)
```

### Key Technical Challenge
- Map customer's IT systems to specific HIPAA technical safeguard requirements
- Generate facility-type-specific policies (hospital vs. dental vs. home health)
- Correctly apply the 4-factor breach assessment test
- Track state-specific variations (50 different breach notification laws)

---

## SECTOR 3: BANKING / FINANCIAL SERVICES

### What the Customer Provides

| Data Type | Format | Example |
|-----------|--------|---------|
| Institution profile | Form | Charter type, asset size, branches, products offered |
| Customer data metrics | Form | # accounts, transaction volume, high-risk customers |
| BSA/AML program docs | PDF upload | Current BSA Officer designation, existing policies |
| SAR filing history | CSV | Previous Suspicious Activity Reports filed |
| CRA lending data | CSV | Loan applications, approvals, denials by geography/demographics |
| HMDA LAR data | CSV | Home Mortgage Disclosure Act loan records |
| Vendor management | CSV | Third-party service providers with access levels |
| IT infrastructure | Form | Core banking system, cybersecurity tools, incident history |
| Audit findings | PDF | Previous regulatory exam findings |
| Board minutes | PDF | Compliance committee meeting records |

### What CompliBot Generates

#### BSA/AML Risk Assessment
**Output delivered:**
```
BSA/AML/OFAC RISK ASSESSMENT
═══════════════════════════════════════════════════════════════

Institution: First Community National Bank
Charter: National Bank (OCC Regulated)
Total Assets: $1.2 Billion
Assessment Period: January 1 - December 31, 2026
Prepared: CompliBot AI (reviewed by [CRCM Reviewer])

─────────────────────────────────────────────────────────────
OVERALL BSA/AML RISK RATING: MODERATE
─────────────────────────────────────────────────────────────

RISK CATEGORY ASSESSMENT:

Products & Services Risk:
┌───────────────────────────────┬─────────┬──────────┬────────────────┐
│ Product                       │ Volume  │ Risk     │ Rationale      │
├───────────────────────────────┼─────────┼──────────┼────────────────┤
│ Consumer checking             │ 45,000  │ Low      │ Standard KYC   │
├───────────────────────────────┼─────────┼──────────┼────────────────┤
│ Wire transfers (domestic)     │ 12,000  │ Moderate │ > $10K volume  │
├───────────────────────────────┼─────────┼──────────┼────────────────┤
│ Wire transfers (international)│ 800     │ High     │ OFAC screening │
│                               │         │          │ required       │
├───────────────────────────────┼─────────┼──────────┼────────────────┤
│ Correspondent banking         │ 3       │ High     │ Enhanced DD    │
│                               │         │          │ per FinCEN     │
├───────────────────────────────┼─────────┼──────────┼────────────────┤
│ Private banking               │ 200     │ Moderate │ Higher balances│
│                               │         │          │ require EDD    │
└───────────────────────────────┴─────────┴──────────┴────────────────┘

Geographic Risk:
- Primary market: [City, State] — Low inherent risk
- International exposure: 12 countries (3 high-risk per FATF)
- HIDTA proximity: Within 2 designated HIDTA areas

Customer Risk:
- MSBs served: 8 (High risk — 31 CFR 1010.100(ff))
- PEPs identified: 3 (Enhanced Due Diligence applied)
- Cannabis-related businesses: 0

REGULATORY CITATIONS:
- 31 USC 5311-5332 (Bank Secrecy Act)
- 31 CFR 1010-1022 (FinCEN regulations)
- 12 CFR 21.21 (OCC BSA compliance program requirements)
- FFIEC BSA/AML Examination Manual (2023 revision)

GAPS IDENTIFIED: 4
REQUIRED ACTIONS: 7
NEXT EXAM READINESS SCORE: 82/100
```

#### CRA Self-Assessment
**Input needed:** HMDA data, lending volumes by census tract, community development activities
**Output delivered:**
- Lending Test analysis (geographic distribution, borrower characteristics)
- Investment Test documentation
- Service Test assessment
- Community development activity log with qualified amounts
- Comparison to assessment area demographics
- Projected CRA rating with improvement recommendations

#### FFIEC Cybersecurity Assessment
**Input needed:** IT infrastructure details, security controls, incident history
**Output delivered:**
- Inherent Risk Profile (5 categories per FFIEC CAT)
- Cybersecurity Maturity assessment (5 domains, 5 levels)
- Gap analysis between risk and maturity
- Board-ready executive summary
- Corrective action plan mapped to FFIEC expectations

### Implementation Architecture

```
api/src/engines/banking/
├── bsa-aml-risk.ts        — BSA/AML/OFAC risk assessment
├── bsa-program.ts         — BSA compliance program documentation
├── sar-narrative.ts       — Suspicious Activity Report narrative generator
├── cra-assessment.ts      — CRA self-assessment and performance context
├── hmda-lar.ts            — HMDA LAR data validation and submission prep
├── ffiec-cyber.ts         — FFIEC Cybersecurity Assessment Tool
├── glba-privacy.ts        — GLBA privacy notice generator
├── vendor-risk.ts         — Third-party vendor risk assessments
├── fair-lending.ts        — Fair lending analysis (disparate impact)
└── sox-controls.ts        — SOX 404 internal controls documentation

api/src/data/banking/
├── bsa-requirements.json     — FinCEN requirements by institution type
├── cra-demographics.json     — Census tract data for CRA analysis
├── ofac-sdn.json             — OFAC SDN list reference (or API)
├── ffiec-cat.json            — FFIEC CAT assessment framework
├── state-regulations.json    — State banking department requirements
└── exam-procedures.json      — FFIEC examination procedures mapping
```

### Key Technical Challenge
- BSA/AML risk scoring requires understanding of product mix, geography, and customer base
- SAR narratives require natural language generation that meets FinCEN quality expectations
- CRA analysis requires mapping loans to census tracts and demographic data
- Must handle multiple regulator expectations (OCC vs. Fed vs. FDIC vs. State)

---

## SECTOR 4: TECHNOLOGY / DATA PRIVACY

### What the Customer Provides

| Data Type | Format | Example |
|-----------|--------|---------|
| Company profile | Form | Size, product type, data processed, customers |
| Data inventory | Form/CSV | What personal data, where stored, who accesses, retention |
| Vendor/subprocessor list | CSV | Name, service, data access, location, DPA status |
| Security controls | Checklist | Encryption, access controls, monitoring, backups |
| Incident history | Manual entry | Past breaches, near-misses, response actions |
| Architecture diagram | Upload/describe | Cloud services, data flows, integrations |
| Current policies | PDF upload | Existing security/privacy policies (gap analysis) |
| Employee list | CSV | Roles with access levels (for access review) |

### What CompliBot Generates

#### SOC 2 Type II Readiness Package
**Output delivered:**
- System Description (per AICPA Trust Services Criteria)
- All required policies (30+):
  - Information Security Policy
  - Access Control Policy
  - Change Management Policy
  - Incident Response Plan
  - Business Continuity / Disaster Recovery Plan
  - Data Classification Policy
  - Encryption Policy
  - Vendor Management Policy
  - Acceptable Use Policy
  - Physical Security Policy
  - HR Security Policy
  - Risk Assessment Methodology
  - And 18+ more mapped to specific TSC
- Control matrix (control objective → control activity → evidence)
- Evidence collection guide (what auditor needs, where to find it)
- Gap report (what's missing before you can pass)
- Remediation plan with timeline

#### GDPR Compliance Package
**Output delivered:**
- Data Protection Impact Assessment (DPIA) per Article 35
- Records of Processing Activities (ROPA) per Article 30
- Privacy Notice (customer-facing) per Articles 13/14
- Data Processing Agreement (DPA) template per Article 28
- International Data Transfer assessment (SCCs, adequacy, TIA)
- Data Subject Rights procedures (access, erasure, portability)
- Breach notification procedure (72-hour requirement per Article 33)
- Cookie consent implementation guide
- Legitimate Interest Assessment (LIA) template

#### ISO 27001 Documentation
**Output delivered:**
- Information Security Management System (ISMS) scope
- Statement of Applicability (SoA) — all 93 Annex A controls with justification
- Risk Assessment methodology and risk register
- Risk Treatment Plan
- Security objectives and metrics
- Internal audit program
- Management review agenda and minutes template
- Continual improvement procedure

### Implementation Architecture

```
api/src/engines/tech/
├── soc2-policies.ts      — Generate all SOC 2 policy documents
├── soc2-controls.ts      — Control matrix mapping to TSC criteria
├── soc2-evidence.ts      — Evidence collection guide generator
├── gdpr-dpia.ts          — Data Protection Impact Assessment
├── gdpr-ropa.ts          — Records of Processing Activities
├── gdpr-privacy-notice.ts — Privacy notice generator
├── gdpr-dpa.ts           — Data Processing Agreement generator
├── iso27001-soa.ts       — Statement of Applicability
├── iso27001-risk.ts      — Risk assessment and treatment plan
├── ccpa-compliance.ts    — CCPA/CPRA privacy program
├── pci-saq.ts            — PCI DSS Self-Assessment Questionnaire
└── ai-governance.ts      — EU AI Act conformity documentation

api/src/data/tech/
├── soc2-tsc.json           — Trust Services Criteria (full framework)
├── iso27001-annex-a.json   — All 93 controls with descriptions
├── gdpr-articles.json      — All GDPR articles with requirements
├── ccpa-requirements.json  — CCPA/CPRA obligations by business type
├── pci-requirements.json   — PCI DSS v4.0 requirements
└── state-privacy-laws.json — All US state privacy laws mapped
```

---

## SECTOR 5: AGRICULTURE / FOOD & BEVERAGE

### What the Customer Provides

| Data Type | Format | Example |
|-----------|--------|---------|
| Facility/farm profile | Form | Type (farm/processor/distributor), products, volume |
| Product list | CSV | Product name, category, ingredients, allergens |
| Process flow | Describe/upload | Steps from raw material to finished product |
| Hazard history | CSV | Past contamination events, recalls, customer complaints |
| Chemical/pesticide use | CSV | Product applied, rate, date, applicator, field |
| Water testing results | CSV | Test date, parameter, result, limit |
| Supplier list | CSV | Supplier, product, country of origin, certifications |
| Temperature logs | CSV | Date/time, equipment, temperature reading |
| Sanitation records | CSV | Date, area, procedure, person, verification |

### What CompliBot Generates

#### FSMA Preventive Controls Food Safety Plan (21 CFR 117)
**Output delivered:**
```
FOOD SAFETY PLAN
Per 21 CFR Part 117 — Current Good Manufacturing Practice,
Hazard Analysis, and Risk-Based Preventive Controls for Human Food
═══════════════════════════════════════════════════════════════

Facility: Green Valley Foods, Inc.
Products: Frozen vegetable blends, Fresh-cut salads
Registration: FDA FEI# 3004567890
PCQI: [Name], certified [date]

─────────────────────────────────────────────────────────────
HAZARD ANALYSIS (§117.130)
─────────────────────────────────────────────────────────────

Process Step: Raw Material Receiving
┌──────────────────┬────────────────┬────────────┬───────────┬──────────────┐
│ Hazard           │ Type           │ Likely?    │ Severity  │ Preventive   │
│                  │                │            │           │ Control?     │
├──────────────────┼────────────────┼────────────┼───────────┼──────────────┤
│ Salmonella       │ Biological     │ Yes        │ Serious   │ YES — Supply │
│                  │                │            │ (illness) │ chain control│
├──────────────────┼────────────────┼────────────┼───────────┼──────────────┤
│ Metal fragments  │ Physical       │ Yes        │ Serious   │ YES — Process│
│                  │                │            │ (injury)  │ control      │
├──────────────────┼────────────────┼────────────┼───────────┼──────────────┤
│ Pesticide residue│ Chemical       │ Possible   │ Moderate  │ YES — Supply │
│                  │                │            │           │ chain control│
└──────────────────┴────────────────┴────────────┴───────────┴──────────────┘

PREVENTIVE CONTROLS (§117.135):
- Process controls: Time/temperature during blanching (≥165°F for 15 sec)
- Sanitation controls: Environmental monitoring for Listeria spp.
- Supply-chain controls: Supplier verification (audit every 2 years)
- Recall plan: Written per §117.139

MONITORING (§117.145):
- What: Core product temperature at blancher exit
- How: Calibrated thermocouple probe
- Frequency: Every 30 minutes during production
- Who: QA Technician on duty

CORRECTIVE ACTIONS (§117.150):
- If temperature <165°F: Hold product, re-process through blancher
- Document deviation, identify root cause, verify correction
```

#### HACCP Plan (21 CFR 120 / 9 CFR 417)
**Output delivered:**
- Preliminary steps (product description, intended use, flow diagram)
- Hazard analysis worksheet (Principle 1)
- CCP determination (Principle 2) with decision tree documentation
- Critical limits (Principle 3) with scientific justification
- Monitoring procedures (Principle 4)
- Corrective actions (Principle 5)
- Verification procedures (Principle 6)
- Record-keeping system (Principle 7)
- Validation summary

### Implementation Architecture

```
api/src/engines/agriculture/
├── fsma-food-safety-plan.ts  — Full HARPC food safety plan
├── haccp.ts                  — HACCP plan (7 principles)
├── fsma-produce.ts           — Produce Safety Rule documentation
├── organic-system-plan.ts    — USDA NOP organic certification docs
├── pesticide-records.ts      — FIFRA pesticide application records
├── wps-compliance.ts         — Worker Protection Standard docs
├── gap-ghp-audit.ts          — Good Agricultural Practices audit prep
├── sanitation-sop.ts         — Sanitation Standard Operating Procedures
├── allergen-control.ts       — Allergen control plan
├── recall-plan.ts            — Product recall procedures
└── labeling.ts               — Nutrition facts + allergen labeling

api/src/data/agriculture/
├── fda-hazards.json        — FDA recognized hazards by food category
├── critical-limits.json    — Scientific basis for common CCPs
├── allergen-list.json      — Major food allergens (Big 9)
├── organic-standards.json  — NOP standards and allowed substances
└── state-ag-reqs.json      — State department of agriculture requirements
```

---

## SECTOR 6: CONSTRUCTION

### What the Customer Provides

| Data Type | Format | Example |
|-----------|--------|---------|
| Project details | Form | Type, location, duration, GC/sub, $ value |
| Scope of work | Description | What work is being performed (steel erection, excavation, etc.) |
| Hazard inventory | Checklist | Fall hazards, electrical, trenching, silica, lead, etc. |
| Worker list | CSV | Name, trade, certifications, training dates |
| Equipment list | CSV | Cranes, scaffolds, ladders, aerial lifts |
| Subcontractor list | CSV | Name, trade, insurance status, safety record |
| Site conditions | Form | Soil type, utilities, adjacent structures, traffic |
| Incident history | CSV | Prior incidents on this or similar projects |

### What CompliBot Generates

#### Site-Specific Safety Plan (SSSP)
**Output delivered:**
- Project hazard analysis (per scope of work)
- Fall protection plan (per 29 CFR 1926 Subpart M)
- Excavation/trenching plan (per 1926 Subpart P)
- Crane and rigging plan (per 1926 Subpart CC)
- Scaffolding plan (per 1926 Subpart L)
- Electrical safety procedures (per 1926 Subpart K)
- Personal Protective Equipment requirements
- Emergency action plan
- Hot work permit procedures
- Competent person designations
- Site orientation checklist
- Daily inspection forms

#### Silica Exposure Control Plan (29 CFR 1926.1153)
**Output delivered:**
- Table 1 compliance documentation (engineering controls per task)
- Exposure assessment (if not using Table 1)
- Written exposure control plan per §1926.1153(g)
- Medical surveillance program per §1926.1153(h)
- Housekeeping procedures
- Employee training documentation
- Competent person designation

### Implementation Architecture

```
api/src/engines/construction/
├── site-safety-plan.ts      — Complete SSSP generator
├── fall-protection.ts       — Fall protection plan (Subpart M)
├── excavation.ts            — Excavation/trenching plan (Subpart P)
├── crane-plan.ts            — Crane and rigging plan (Subpart CC)
├── scaffold-plan.ts         — Scaffolding plan (Subpart L)
├── silica-plan.ts           — Silica exposure control plan
├── confined-space.ts        — Construction confined space (Subpart AA)
├── electrical.ts            — Electrical safety plan (Subpart K)
├── lead-plan.ts             — Lead in construction plan (1926.62)
├── asbestos-plan.ts         — Asbestos management plan (1926.1101)
└── stormwater-swppp.ts      — Construction SWPPP

api/src/data/construction/
├── osha-1926.json          — All construction standards
├── table1-silica.json      — Table 1 engineering controls by task
├── soil-classification.json — OSHA soil type classifications
└── competent-person.json   — CP requirements by standard
```

---

## SECTOR 7: ENERGY / UTILITIES

### What the Customer Provides

| Data Type | Format | Example |
|-----------|--------|---------|
| Facility type | Form | Power plant, substation, pipeline, refinery |
| Emissions data | CSV | Pollutant, quantity, stack/vent, monitoring method |
| Discharge data | CSV | Outfall, parameter, monthly averages, daily max |
| Waste streams | CSV | Waste type, EPA code, quantity, disposal method |
| Critical assets | CSV | BES cyber systems, critical infrastructure |
| Pipeline data | CSV | Segments, age, material, inspection history |
| Process chemicals | CSV | Chemical, quantity, process use |
| Operating permits | PDF | Current Title V, NPDES, RCRA permits |

### What CompliBot Generates

- Title V operating permit compliance certifications (per CAA)
- Emissions inventory reports (annual)
- NPDES Discharge Monitoring Reports (monthly/quarterly)
- RCRA hazardous waste biennial reports
- NERC CIP evidence packages (cybersecurity)
- Pipeline integrity management documentation
- Greenhouse Gas Reporting (40 CFR 98)
- SPCC Plan updates
- State PUC/PSC regulatory filings

### Implementation Architecture

```
api/src/engines/energy/
├── title-v.ts             — Clean Air Act Title V compliance
├── emissions-inventory.ts — Annual emissions inventory report
├── npdes-dmr.ts           — Discharge Monitoring Reports
├── rcra-biennial.ts       — RCRA hazardous waste biennial report
├── nerc-cip.ts            — NERC CIP evidence packages
├── pipeline-integrity.ts  — Pipeline IM documentation (PHMSA)
├── ghg-reporting.ts       — Greenhouse gas reporting (40 CFR 98)
├── spcc-plan.ts           — SPCC Plan development/update
└── state-puc.ts           — State utility commission filings
```

---

## SECTOR 8: INSURANCE

### What the Customer Provides

| Data Type | Format | Example |
|-----------|--------|---------|
| Company profile | Form | Lines of business, states, premium volume |
| Financial statements | PDF/CSV | Annual statement data, surplus, RBC |
| Product portfolio | CSV | Products, states filed, forms, rates |
| Claims data | CSV | Volume, paid, reserved, litigation |
| Market conduct | Form | Complaint ratios, claims handling metrics |
| Anti-fraud program | PDF | Current SIU structure and procedures |

### What CompliBot Generates

- State rate/form filing documentation
- Own Risk and Solvency Assessment (ORSA)
- Market conduct exam preparation packages
- Anti-fraud compliance plans (per state requirements)
- Holding company registration filings
- Annual/quarterly statement supplements
- Risk-Based Capital (RBC) calculations and documentation

---

## How to Build Each Sector (Implementation Priority)

### Engineering Effort Estimate

| Sector | Engines to Build | Effort (weeks) | Revenue Potential | Priority |
|--------|-----------------|----------------|-------------------|----------|
| Industrial | 10 engines | 2 (ALREADY DONE) | $40K MRR | DONE |
| Healthcare | 9 engines | 4-6 weeks | $45K MRR | NEXT |
| Tech/Privacy | 12 engines | 4-6 weeks | $20K MRR | Phase 3 |
| Banking | 10 engines | 6-8 weeks | $40K MRR | Phase 4 |
| Agriculture | 11 engines | 4-5 weeks | $22K MRR | Phase 5 |
| Construction | 11 engines | 3-4 weeks | $20K MRR | Phase 6 |
| Energy | 9 engines | 5-7 weeks | $30K MRR | Phase 7 |
| Insurance | 7 engines | 4-5 weeks | $25K MRR | Phase 8 |

### Each Engine Follows the Same Pattern

```typescript
interface ComplianceEngine {
  // What data does this engine need?
  inputSchema: ZodSchema;

  // What regulatory framework does it map to?
  regulatoryFramework: {
    agency: string;        // "OSHA" | "FDA" | "FinCEN" | etc.
    standard: string;      // "29 CFR 1904" | "45 CFR 164" | etc.
    version: string;       // Track regulation version
    lastUpdated: string;   // When was this regulation last changed
  };

  // Generate the compliance output
  generate(input: EngineInput): Promise<ComplianceReport>;

  // Validate output against requirements
  validate(report: ComplianceReport): ValidationResult;

  // Identify gaps between data and requirements
  analyzeGaps(input: EngineInput): Promise<GapAnalysis>;
}
```

### Shared Infrastructure (Build Once, Use Across All Sectors)

```
api/src/shared/
├── report-renderer.ts     — Renders reports to PDF/DOCX/HTML
├── citation-engine.ts     — Validates and formats regulatory citations
├── gap-analyzer.ts        — Generic gap analysis framework
├── deadline-tracker.ts    — Tracks filing deadlines across all sectors
├── change-monitor.ts      — Monitors Federal Register for regulatory changes
├── reviewer-queue.ts      — Routes reports to appropriate human reviewers
├── confidence-scorer.ts   — Scores AI confidence per report section
├── data-extractor.ts      — Universal CSV/PDF/form data extraction
├── template-engine.ts     — Reusable report section templates
└── audit-trail.ts         — Records all generations for compliance history
```

---

## Revenue Model by Sector

### Pricing Matrix (Per Report)

| Report Type | Small Facility | Medium | Large/Complex |
|-------------|---------------|--------|---------------|
| **OSHA 300 Log** | $400 | $600 | $1,000 |
| **EPA Tier II** | $600 | $1,200 | $2,500 |
| **HIPAA Risk Assessment** | $1,500 | $3,000 | $5,000 |
| **SOC 2 Policy Package** | $2,000 | $4,000 | $8,000 |
| **BSA/AML Risk Assessment** | $3,000 | $8,000 | $15,000 |
| **FSMA Food Safety Plan** | $800 | $1,500 | $3,000 |
| **Site Safety Plan** | $400 | $800 | $1,500 |
| **Title V Compliance Cert** | $3,000 | $5,000 | $10,000 |
| **NERC CIP Evidence Package** | $5,000 | $10,000 | $20,000 |

### Monthly Retainer (Ongoing Compliance Management)

| Sector | Small | Medium | Enterprise |
|--------|-------|--------|-----------|
| Industrial | $500/mo | $2,000/mo | $8,000/mo |
| Healthcare | $800/mo | $3,000/mo | $10,000/mo |
| Banking | $2,000/mo | $5,000/mo | $20,000/mo |
| Tech | $500/mo | $1,500/mo | $5,000/mo |
| Agriculture | $400/mo | $1,500/mo | $5,000/mo |
| Construction | $300/mo | $1,000/mo | $4,000/mo |
| Energy | $2,000/mo | $5,000/mo | $15,000/mo |

---

## What Makes CompliBot DIFFERENT in Each Sector

| Sector | Current Solution | CompliBot Advantage |
|--------|-----------------|---------------------|
| Industrial | Hire EHS consultant ($150-350/hr) | 80% cheaper, same citations, instant delivery |
| Healthcare | Hire HIPAA consultant ($200-400/hr) | Automated risk assessment in hours, not weeks |
| Banking | Hire compliance firm ($300-600/hr) | AI + human review = audit-quality at 1/5 cost |
| Tech | Buy Vanta ($10K-50K/yr) + still do work | We deliver finished policies, not a dashboard |
| Agriculture | Hire food safety consultant ($150-300/hr) | HACCP plans in days, not months |
| Construction | Safety director creates manually | Per-project plans generated from scope description |
| Energy | Hire environmental consultant ($200-500/hr) | Automated permit compliance tracking |
| Insurance | Hire actuaries + compliance lawyers | State filing packages generated automatically |

---

*This is the implementation playbook. Build healthcare engines next — highest ACV after banking, fastest sales cycle.*
