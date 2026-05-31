import { generateCompletion } from "../../lib/llm.js";
import { parseReportSections } from "../../services/report-generator.js";
import type { GeneratedReport, GeneratedGap, GeneratedSection } from "../../services/report-generator.js";
import { BSA_CORE_REGULATIONS } from "../../data/banking/bsa-requirements.js";

export interface BSAProgramInput {
  institutionName: string;
  institutionType: "national-bank" | "state-member-bank" | "state-nonmember-bank" | "savings-association" | "credit-union";
  assetSize: number;
  employeeCount: number;
  branchCount: number;
  productsOffered: string[];
  riskProfile: "low" | "moderate" | "high";
  bsaOfficerName: string;
  bsaOfficerTitle: string;
  boardApprovalDate: string;
  lastAuditDate: string;
  automatedMonitoringSystem: string;
  existingPolicies: string[];
}

interface ProgramComponent {
  title: string;
  regulatoryBasis: string;
  content: string;
  subComponents: string[];
}

export async function generateBSAProgramReport(input: BSAProgramInput): Promise<GeneratedReport> {
  const components = buildProgramComponents(input);
  const cipProgram = buildCIPProgram(input);
  const cddProgram = buildCDDProgram(input);
  const eddProgram = buildEDDProgram(input);
  const sarProcedures = buildSARProcedures(input);
  const ctrProcedures = buildCTRProcedures(input);
  const ofacProcedures = buildOFACProcedures(input);
  const trainingProgram = buildTrainingProgram(input);
  const auditProgram = buildAuditProgram(input);

  const systemPrompt = `You are a BSA/AML compliance program documentation expert. Generate a complete BSA Compliance Program manual per 31 CFR 1010.210 and 12 CFR 21.21 (OCC), 12 CFR 208.63 (FRB), or 12 CFR 326.8 (FDIC) as applicable.

The program manual must be:
- Complete and ready for regulatory examination
- Specific to the institution's size, complexity, and risk profile
- Properly cited with regulatory references
- Written in formal compliance policy language
- Structured as an operational manual with actionable procedures

This is a formal regulatory document — not a summary or overview.`;

  const additionalContext = buildProgramContext(input, components);

  const rawContent = await generateCompletion(systemPrompt, additionalContext, {
    temperature: 0.2,
    maxTokens: 8192,
  });

  const llmSections = parseReportSections(rawContent);
  const gaps = identifyProgramGaps(input);

  const sections: GeneratedSection[] = [
    buildInternalControlsSection(components),
    buildBSAOfficerSection(input),
    buildCIPSection(cipProgram),
    buildCDDSection(cddProgram),
    buildEDDSection(eddProgram),
    buildSARSection(sarProcedures),
    buildCTRSection(ctrProcedures),
    buildOFACSection(ofacProcedures),
    buildTrainingSection(trainingProgram),
    buildAuditSection(auditProgram),
    ...llmSections,
  ];

  return {
    title: `BSA/AML Compliance Program Manual — ${input.institutionName}`,
    summary: `Complete BSA/AML Compliance Program per 31 CFR 1010.210 for ${input.institutionName} (${formatAssetSize(input.assetSize)} in assets, ${input.branchCount} branches, ${input.employeeCount} employees). Program addresses all four regulatory pillars plus CIP, CDD, EDD, SAR/CTR procedures, and OFAC compliance. Risk Profile: ${input.riskProfile.toUpperCase()}.`,
    complianceScore: calculateProgramComplianceScore(input, gaps),
    sections,
    gaps,
  };
}

function buildProgramComponents(input: BSAProgramInput): ProgramComponent[] {
  return [
    {
      title: "System of Internal Controls",
      regulatoryBasis: "31 CFR 1010.210(b)(1); 12 CFR 21.21(c)(1)",
      content: `The institution shall maintain a system of internal controls to ensure ongoing compliance with the Bank Secrecy Act and implementing regulations. Internal controls include:`,
      subComponents: [
        "Board-approved BSA/AML policies and procedures reviewed at least annually",
        "Risk-based procedures for products, services, customers, and geographies identified in the risk assessment",
        "Defined roles and responsibilities for BSA compliance at all levels (Board, senior management, BSA Officer, line staff)",
        "Dual controls and segregation of duties for SAR/CTR filing and OFAC interdiction",
        "Management Information Systems (MIS) providing timely and accurate BSA-related data",
        "Quality assurance processes for SAR decision-making and CTR accuracy",
        "Escalation procedures for suspicious activity from frontline to BSA department",
        "Record retention procedures meeting 5-year requirement per 31 CFR 1010.430",
        "Change management procedures ensuring BSA impact assessed for new products/services",
        "Vendor management procedures for BSA-related third-party systems",
      ],
    },
    {
      title: "Independent Testing Program",
      regulatoryBasis: "31 CFR 1010.210(b)(2); 12 CFR 21.21(c)(2)",
      content: `Independent testing (audit) of the BSA/AML compliance program shall be conducted at intervals commensurate with the institution's risk profile.`,
      subComponents: [
        `Testing frequency: ${input.riskProfile === "high" ? "Every 12 months" : input.riskProfile === "moderate" ? "Every 12-18 months" : "Every 18 months"}`,
        "Testing performed by qualified independent party (internal audit, external firm, or combination)",
        "Scope covers all BSA program components including CIP, CDD, SAR/CTR, OFAC, and training",
        "Transaction testing using risk-based sampling methodology",
        "Assessment of suspicious activity monitoring system effectiveness",
        "Evaluation of CIP verification procedures and documentation",
        "Review of SAR decision-making quality and timeliness",
        "CTR accuracy and timeliness testing",
        "OFAC screening system testing including interdiction procedures",
        "Board and management reporting on audit findings with remediation tracking",
      ],
    },
    {
      title: "BSA/AML Compliance Officer",
      regulatoryBasis: "31 CFR 1010.210(b)(3); 12 CFR 21.21(c)(3)",
      content: `The institution designates a qualified individual as BSA/AML Compliance Officer responsible for day-to-day BSA/AML compliance.`,
      subComponents: [
        `Designated BSA Officer: ${input.bsaOfficerName}, ${input.bsaOfficerTitle}`,
        "BSA Officer has sufficient authority and resources to effectively execute responsibilities",
        "Direct reporting line to senior management with unrestricted access to the Board/Board committee",
        "Adequate staffing commensurate with institution risk profile and transaction volumes",
        "Responsible for: program oversight, SAR/CTR filing, OFAC administration, training coordination, regulatory exam liaison",
        "BSA Officer qualifications include relevant experience, BSA/AML certification (CAMS preferred), and ongoing professional development",
        "Succession plan documented for BSA Officer position",
        "BSA Officer not responsible for revenue-producing activities that could create conflicts of interest",
      ],
    },
    {
      title: "Training Program",
      regulatoryBasis: "31 CFR 1010.210(b)(4); 12 CFR 21.21(c)(4)",
      content: `All appropriate personnel receive BSA/AML training commensurate with their responsibilities and the institution's risk profile.`,
      subComponents: [
        "Board of Directors: Annual BSA/AML training covering governance responsibilities, risk assessment results, and regulatory developments",
        "Senior Management: Annual training on program oversight, emerging typologies, and enforcement trends",
        "BSA Department Staff: Ongoing specialized training (SAR writing, investigation techniques, typologies, regulatory updates)",
        "Frontline Staff (Tellers/CSRs): Initial and annual training on CIP, red flags, CTR procedures, and escalation procedures",
        "Lending Personnel: Annual training on CDD/EDD, loan fraud red flags, and SAR reporting obligations",
        "Operations Staff: Annual training specific to function (wire transfers, ACH, trade finance)",
        "New Employee Orientation: BSA/AML awareness training within 30 days of hire",
        "Training records maintained per personnel file for audit review",
        "Training effectiveness measured through testing and compliance metrics",
      ],
    },
  ];
}

function buildCIPProgram(input: BSAProgramInput): ProgramComponent {
  return {
    title: "Customer Identification Program (CIP)",
    regulatoryBasis: "31 CFR 1010.220; Section 326 of USA PATRIOT Act",
    content: "The institution's CIP is designed to form a reasonable belief that it knows the true identity of each customer.",
    subComponents: [
      "IDENTIFICATION REQUIREMENTS — Individual Customers: Full legal name, date of birth, residential address (not P.O. Box), government-issued identification number (SSN for U.S. persons; passport number, alien ID, or equivalent for non-U.S. persons)",
      "IDENTIFICATION REQUIREMENTS — Entity Customers: Legal entity name, principal place of business address, EIN/TIN, formation documents (articles of incorporation, partnership agreement)",
      "DOCUMENTARY VERIFICATION: Unexpired government-issued photo ID (driver's license, passport, state ID); verify document authenticity through visual inspection and, where available, electronic verification",
      "NON-DOCUMENTARY VERIFICATION: Used when documentary methods insufficient — contact customer, verify information through third-party databases (credit bureau, public records), check references",
      "VERIFICATION TIMEFRAME: Identity must be verified within a reasonable time after account opening; institution defines reasonable time as within 5 business days",
      "LACK OF VERIFICATION: If identity cannot be verified, institution will not open account or will close account and file SAR if suspicious activity identified during the process",
      "CUSTOMER NOTICE: Written or oral notice provided to customers explaining identification requirements before or during account opening",
      "GOVERNMENT LISTS: All new customers screened against OFAC SDN list prior to account opening; subsequent screening upon list updates",
      "RECORDKEEPING: CIP records retained for 5 years after account closure (identification information retained for 5 years; verification method/results retained for 5 years)",
      "RELIANCE ON OTHER FINANCIAL INSTITUTIONS: Any reliance on another institution for CIP documented in written agreement per 31 CFR 1010.220(a)(6)",
    ],
  };
}

function buildCDDProgram(input: BSAProgramInput): ProgramComponent {
  return {
    title: "Customer Due Diligence (CDD) Procedures",
    regulatoryBasis: "31 CFR 1010.230; FinCEN CDD Final Rule (2016)",
    content: "The institution implements risk-based CDD procedures to understand the nature and purpose of customer relationships and develop customer risk profiles.",
    subComponents: [
      "BENEFICIAL OWNERSHIP IDENTIFICATION: For all legal entity customers, identify and verify identity of: (1) each individual owning 25% or more equity interest, and (2) one individual with significant management responsibility",
      "BENEFICIAL OWNERSHIP CERTIFICATION: Obtain completed FinCEN Beneficial Ownership Certification Form at account opening; retain for 5 years after account closure",
      "EXEMPTIONS FROM BENEFICIAL OWNERSHIP: Regulated entities (banks, broker-dealers, insurance companies), publicly traded companies, government entities, and other exempt entities per 31 CFR 1010.230(e)",
      "RISK PROFILING: Assign risk rating (low, moderate, high) to each customer based on: customer type, products/services used, geographic location, transaction patterns, and information obtained during CDD",
      "NATURE AND PURPOSE: Document expected account activity including transaction types, volumes, dollar amounts, and geographic patterns at account opening",
      "ONGOING MONITORING: Monitor customer activity against expected behavior; investigate material deviations; update customer risk profiles as new information obtained",
      "TRIGGERED REVIEWS: Re-evaluate customer risk profile upon: material change in activity, negative media, law enforcement inquiry, SAR filing, or information suggesting higher risk",
      "DOCUMENTATION: Maintain complete CDD documentation including risk rationale, beneficial ownership, and nature/purpose of relationship in centralized customer file",
    ],
  };
}

function buildEDDProgram(input: BSAProgramInput): ProgramComponent {
  return {
    title: "Enhanced Due Diligence (EDD) Program",
    regulatoryBasis: "31 USC 5318(i); 31 CFR 1010.610-670; FFIEC BSA/AML Manual",
    content: "Enhanced due diligence applied to higher-risk customers, products, services, and geographies as identified in the BSA/AML Risk Assessment.",
    subComponents: [
      "EDD TRIGGERS: PEPs and their associates, MSBs, foreign financial institutions (correspondent accounts), private banking relationships (>$1M), cash-intensive businesses, third-party payment processors, non-resident aliens from high-risk jurisdictions, customers in high-risk geographies, complex/unusual business structures with no apparent economic purpose",
      "EDD PROCEDURES — PEPs: Senior management approval for relationship; enhanced ongoing monitoring; source of wealth/funds documentation; periodic review of relationship (minimum annually)",
      "EDD PROCEDURES — MSBs: Obtain MSB registration confirmation with FinCEN; assess MSB's own BSA/AML program; understand MSB's customer base and geographic reach; enhanced transaction monitoring; periodic on-site visits for high-volume MSBs",
      "EDD PROCEDURES — Foreign Correspondent Accounts: Per 31 CFR 1010.610, assess respondent's AML program; understand respondent's customer base; determine jurisdiction and licensing; monitor for suspicious transactions including nested accounts and payable-through activity",
      "EDD PROCEDURES — Cash-Intensive Businesses: Obtain and verify business license; understand expected cash volumes; compare actual deposits to expected volumes; periodic reviews comparing activity to industry norms",
      "EDD PROCEDURES — Private Banking: Per 31 USC 5318(i)(3), ascertain identity of nominal and beneficial owners; source of funds documentation; enhanced monitoring; senior management oversight",
      "SENIOR MANAGEMENT APPROVAL: All EDD relationships require documented approval by BSA Officer or senior management prior to onboarding or continuation",
      "PERIODIC REVIEW FREQUENCY: High-risk customers reviewed at minimum annually; critical-risk customers reviewed semi-annually",
      "EXIT CRITERIA: Define triggers for relationship termination including inability to mitigate BSA/AML risk, refusal to provide information, repeated suspicious activity, or regulatory direction",
    ],
  };
}

function buildSARProcedures(input: BSAProgramInput): ProgramComponent {
  return {
    title: "Suspicious Activity Monitoring and Reporting",
    regulatoryBasis: "31 CFR 1010.320; 31 USC 5318(g); 12 CFR 21.11 (OCC); 12 CFR 208.62 (FRB); 12 CFR 353.3 (FDIC)",
    content: "The institution maintains a suspicious activity monitoring and reporting program designed to identify, evaluate, and report suspicious transactions to FinCEN.",
    subComponents: [
      "SAR FILING THRESHOLDS: File SAR for known subjects at $5,000 or more; file for unknown subjects at $25,000 or more; file for any amount when involving potential terrorist financing, ongoing criminal scheme, or insider abuse",
      `AUTOMATED MONITORING: ${input.automatedMonitoringSystem || "Automated transaction monitoring system"} deployed with scenarios covering: structuring, rapid movement of funds, unusual wire activity, cash activity inconsistent with business type, round-dollar transactions, funnel account activity, and high-risk geographic transactions`,
      "ALERT DISPOSITION: Analysts review system-generated alerts within 5 business days; document disposition rationale; escalate to BSA Officer when suspicious activity identified",
      "MANUAL REFERRALS: All employees trained to identify and report suspicious activity through internal referral process; referrals reviewed by BSA department within 2 business days",
      "SAR DECISION: BSA Officer or designee makes final SAR filing determination; document rationale for both filings and decisions not to file; maintain decision log",
      "SAR FILING TIMELINE: Initial SAR filed within 30 calendar days of detection; if no suspect identified, may extend to 60 days for identification; continuing activity SARs filed every 90 days",
      "SAR NARRATIVE QUALITY: Narratives must include the five essential elements: who, what, when, where, why/how; factual and detailed; avoid legal conclusions; include relevant account/transaction data",
      "CONFIDENTIALITY: SAR filings are confidential per 31 USC 5318(g)(2); no disclosure to subject or unauthorized parties; violation subject to civil and criminal penalties",
      "SAFE HARBOR: Institution and employees protected from liability for SAR filings made in good faith per 31 USC 5318(g)(3)",
      "CONTINUING ACTIVITY: Monitor subjects of prior SARs; file continuing activity SARs every 90 days if activity persists; include cumulative totals and reference prior SAR filing numbers",
      "LAW ENFORCEMENT REQUESTS: Maintain procedures for responding to 314(a) requests within required 14-day timeframe; designate 314(a) point of contact with FinCEN",
      "VOLUNTARY INFORMATION SHARING: Participate in 314(b) information sharing with other financial institutions where appropriate; maintain safe harbor documentation",
    ],
  };
}

function buildCTRProcedures(input: BSAProgramInput): ProgramComponent {
  return {
    title: "Currency Transaction Reporting",
    regulatoryBasis: "31 CFR 1010.310-313; 31 USC 5313; 31 CFR 1010.311 (Exemptions)",
    content: "The institution files Currency Transaction Reports (CTRs) for all currency transactions exceeding $10,000 and manages CTR exemption designations.",
    subComponents: [
      "CTR FILING THRESHOLD: File FinCEN Form 112 (CTR) for each deposit, withdrawal, exchange, or other currency transaction exceeding $10,000 in a single business day",
      "AGGREGATION: Multiple currency transactions by or on behalf of the same person totaling more than $10,000 in a single business day treated as a single transaction requiring CTR filing",
      "FILING DEADLINE: CTR filed with FinCEN within 15 calendar days of transaction date via BSA E-Filing System",
      "IDENTIFICATION: Obtain government-issued photo identification from person conducting transaction; record identification information on CTR; if conducted on behalf of another, identify both conductor and person on whose behalf transaction is conducted",
      "STRUCTURING DETECTION: Monitor for patterns indicating structuring (transactions just below $10,000, multiple transactions to avoid single CTR, use of multiple branches/locations); file SAR if structuring suspected per 31 USC 5324",
      "EXEMPTION MANAGEMENT — Phase I: Banks, government agencies, and NYSE/AMEX listed companies exempt per 31 CFR 1010.311(a); document eligibility annually",
      "EXEMPTION MANAGEMENT — Phase II: Eligible non-listed businesses meeting criteria (operates domestic U.S. business, maintains transaction account for 12+ months, frequently engages in currency transactions exceeding $10,000); file FinCEN Form 110 (Designation of Exempt Person)",
      "EXEMPTION REVOCATION: Revoke exemption if customer no longer qualifies, suspicious activity identified, or significant change in transaction patterns; notify FinCEN of revocation",
      "QUALITY CONTROL: BSA department reviews CTR accuracy before filing; tracks error rates; implements corrective training for recurring errors",
      "RECORDKEEPING: Maintain copies of CTRs and supporting identification documentation for 5 years per 31 CFR 1010.430",
    ],
  };
}

function buildOFACProcedures(input: BSAProgramInput): ProgramComponent {
  return {
    title: "Office of Foreign Assets Control (OFAC) Compliance",
    regulatoryBasis: "31 CFR Part 501; Executive Orders per IEEPA (50 USC 1701-1706); Trading with the Enemy Act (50 USC 4301-4341)",
    content: "The institution maintains an OFAC compliance program to ensure no transactions are processed involving sanctioned persons, entities, countries, or programs.",
    subComponents: [
      "SDN SCREENING — Account Opening: All new customers screened against OFAC Specially Designated Nationals (SDN) and Blocked Persons List prior to account opening",
      "SDN SCREENING — Ongoing: All existing customers re-screened upon OFAC list updates (published multiple times per week); wire transfers screened in real-time",
      "SDN SCREENING — Transactions: Incoming and outgoing wire transfers, ACH transactions, and trade finance documents screened against SDN list, Sectoral Sanctions, and country-based programs",
      "SCREENING METHODOLOGY: Automated OFAC screening system with fuzzy-matching capability; configured to minimize false negatives while managing false-positive volume; match threshold settings documented and periodically evaluated",
      "POTENTIAL MATCH HANDLING: Potential matches (hits) reviewed by trained OFAC analyst within 24 hours for wire transfers, 48 hours for other alerts; escalation to BSA/OFAC Officer for confirmed or uncertain matches",
      "BLOCKING: Property of blocked persons/entities (SDN list) blocked immediately upon identification; funds held in interest-bearing blocked account; blocking report filed with OFAC within 10 business days via OFAC Reporting System",
      "REJECTING: Prohibited transactions that cannot be blocked are rejected; rejection report filed with OFAC within 10 business days",
      "ANNUAL REPORTING: Annual report of blocked property filed with OFAC by September 30 per 31 CFR 501.603",
      "SANCTIONS PROGRAMS: Monitor all applicable sanctions programs including country-based (Cuba, Iran, North Korea, Syria, Crimea region), list-based (SDN, SSI, NS-ISA), and secondary sanctions",
      "FALSE POSITIVE MANAGEMENT: Document and maintain false positive dispositions; update screening system disposition logic to reduce recurring false positives while maintaining detection effectiveness",
      "OFAC LICENSE APPLICATIONS: Procedures for requesting specific licenses from OFAC when legitimate transactions involve sanctioned parties; BSA/OFAC Officer approval required before application",
    ],
  };
}

function buildTrainingProgram(input: BSAProgramInput): ProgramComponent {
  return {
    title: "BSA/AML Training Program Detail",
    regulatoryBasis: "31 CFR 1010.210(b)(4); 12 CFR 21.21(c)(4); FFIEC BSA/AML Examination Manual",
    content: "Comprehensive training program ensuring all personnel understand their BSA/AML responsibilities.",
    subComponents: [
      `BOARD OF DIRECTORS (Annual — ${input.riskProfile === "high" ? "2 hours minimum" : "1 hour minimum"}): BSA/AML risk assessment results, program effectiveness metrics, regulatory developments, enforcement actions and industry trends, governance and oversight responsibilities`,
      "SENIOR MANAGEMENT (Annual — 2 hours): Program performance metrics, SAR/CTR filing trends, exam findings and remediation status, emerging typologies, staffing and resource adequacy",
      "BSA DEPARTMENT STAFF (Ongoing — 40+ hours/year): Advanced SAR writing workshops, investigation techniques, new regulations and guidance, system training, typology deep-dives, CAMS/CFCS certification support",
      "FRONTLINE STAFF — Tellers/CSRs (Initial + Annual — 2 hours): Customer identification requirements, CTR procedures and structuring detection, red flags for suspicious activity, escalation/referral procedures, privacy and confidentiality requirements",
      "LENDING PERSONNEL (Annual — 2 hours): CDD/EDD requirements for commercial borrowers, loan fraud indicators, SAR filing obligations for suspicious loan applications, beneficial ownership requirements, trade-based money laundering indicators",
      "WIRE/OPERATIONS STAFF (Annual — 3 hours): Funds Travel Rule requirements (31 CFR 1010.410), OFAC screening procedures, high-risk wire patterns, correspondent banking due diligence, international transaction red flags",
      "NEW HIRE TRAINING: BSA/AML awareness within first 30 days of employment; role-specific training within first 60 days; must complete before assuming BSA-sensitive responsibilities",
      "TRAINING METHODS: Instructor-led, computer-based learning, case studies, role-based scenarios, regulatory updates via email/bulletin",
      "EFFECTIVENESS MEASUREMENT: Post-training assessments with 80% minimum passing score; annual compliance testing; metric tracking (referral quality, CTR error rates, alert disposition quality)",
      "RECORDS: Training attendance, completion certificates, and assessment scores maintained in HR/compliance system for minimum 5 years; available for examiner review",
    ],
  };
}

function buildAuditProgram(input: BSAProgramInput): ProgramComponent {
  const frequency = input.riskProfile === "high" ? "12 months" : input.riskProfile === "moderate" ? "12-18 months" : "18 months";
  return {
    title: "Independent Testing Program (BSA/AML Audit)",
    regulatoryBasis: "31 CFR 1010.210(b)(2); 12 CFR 21.21(c)(2); FFIEC BSA/AML Examination Manual — Independent Testing",
    content: `Independent testing of the BSA/AML program conducted every ${frequency}, commensurate with the institution's ${input.riskProfile} risk profile.`,
    subComponents: [
      `FREQUENCY: Every ${frequency} (risk-adjusted); more frequent testing of high-risk areas between full-scope audits`,
      "INDEPENDENCE: Testing performed by party independent of BSA/AML function (internal audit department, qualified external firm, or combination); testers must not have operational BSA responsibilities",
      "QUALIFICATIONS: Testers must have demonstrated BSA/AML expertise (CAMS, CIA, or equivalent); understanding of institution's products, services, and risk profile",
      "SCOPE — Program Components: Evaluate adequacy of policies/procedures, BSA Officer qualifications and resources, training program effectiveness, board/management oversight",
      "SCOPE — Transaction Testing: Risk-based sample of transactions to validate SAR identification, CTR accuracy, CIP compliance, and CDD/EDD procedures; sample size based on volume and risk",
      "SCOPE — System Validation: Evaluate transaction monitoring system scenarios, thresholds, and alert disposition; validate OFAC screening system effectiveness; test above/below-the-line tuning",
      "SCOPE — Regulatory Compliance: Verify compliance with all applicable BSA regulatory requirements, FinCEN guidance, and examination recommendations",
      "SCOPE — Risk Assessment: Evaluate whether risk assessment accurately reflects current risk profile and whether controls are commensurate with identified risks",
      "REPORTING: Written report to Board/Audit Committee within 60 days of testing completion; include scope, methodology, findings, risk ratings, and recommended corrective actions",
      "FINDING MANAGEMENT: All findings tracked in centralized system with ownership, target resolution dates, and status; Board receives quarterly updates on remediation progress",
      `LAST AUDIT COMPLETED: ${input.lastAuditDate}`,
    ],
  };
}

function buildInternalControlsSection(components: ProgramComponent[]): GeneratedSection {
  const controlsComponent = components[0]!;
  return {
    order: 1,
    title: "System of Internal Controls",
    content: `## ${controlsComponent.title}\n**Regulatory Basis:** ${controlsComponent.regulatoryBasis}\n\n${controlsComponent.content}\n\n${controlsComponent.subComponents.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    citations: ["31 CFR 1010.210(b)(1)", "12 CFR 21.21(c)(1)"],
    findings: [],
    recommendations: ["Review and update internal controls annually", "Ensure dual controls for all SAR/CTR filing processes"],
  };
}

function buildBSAOfficerSection(input: BSAProgramInput): GeneratedSection {
  return {
    order: 2,
    title: "BSA/AML Officer Designation",
    content: `## BSA/AML Compliance Officer
**Regulatory Basis:** 31 CFR 1010.210(b)(3); 12 CFR 21.21(c)(3)

**Designated Officer:** ${input.bsaOfficerName}
**Title:** ${input.bsaOfficerTitle}
**Board Approval Date:** ${input.boardApprovalDate}

### Responsibilities
1. Day-to-day administration of the BSA/AML compliance program
2. Coordination and filing of all required BSA reports (SARs, CTRs, CTR exemptions)
3. Administration of OFAC compliance program
4. Coordination of independent testing and regulatory examinations
5. Development and delivery of BSA/AML training
6. Maintenance of BSA/AML risk assessment
7. Oversight of automated transaction monitoring system
8. Reporting to senior management and Board on BSA program status
9. Liaison with FinCEN, law enforcement, and regulatory agencies
10. Management of 314(a) and 314(b) information sharing programs

### Authority
The BSA/AML Officer has authority to:
- Access all customer records and transaction data
- Halt transactions when sanctions match identified
- Recommend account closure for BSA/AML risk
- Direct staffing and resource allocation within BSA department
- Report directly to Board without management filter on BSA matters

### Resources
- Dedicated BSA/AML staff: Commensurate with institution size and risk profile
- Automated monitoring system: ${input.automatedMonitoringSystem || "Deployed and maintained"}
- Budget authority for program enhancements, training, and technology
- Access to legal counsel for complex BSA/AML matters`,
    citations: ["31 CFR 1010.210(b)(3)", "12 CFR 21.21(c)(3)"],
    findings: [],
    recommendations: [],
  };
}

function buildCIPSection(cipProgram: ProgramComponent): GeneratedSection {
  return {
    order: 3,
    title: "Customer Identification Program (CIP)",
    content: `## ${cipProgram.title}\n**Regulatory Basis:** ${cipProgram.regulatoryBasis}\n\n${cipProgram.content}\n\n${cipProgram.subComponents.map((s) => `### ${s.split(":")[0]}\n${s.split(":").slice(1).join(":").trim()}`).join("\n\n")}`,
    citations: ["31 CFR 1010.220", "Section 326 USA PATRIOT Act"],
    findings: [],
    recommendations: [],
  };
}

function buildCDDSection(cddProgram: ProgramComponent): GeneratedSection {
  return {
    order: 4,
    title: "Customer Due Diligence (CDD)",
    content: `## ${cddProgram.title}\n**Regulatory Basis:** ${cddProgram.regulatoryBasis}\n\n${cddProgram.content}\n\n${cddProgram.subComponents.map((s) => `- ${s}`).join("\n")}`,
    citations: ["31 CFR 1010.230", "FinCEN CDD Final Rule (2016)"],
    findings: [],
    recommendations: [],
  };
}

function buildEDDSection(eddProgram: ProgramComponent): GeneratedSection {
  return {
    order: 5,
    title: "Enhanced Due Diligence (EDD)",
    content: `## ${eddProgram.title}\n**Regulatory Basis:** ${eddProgram.regulatoryBasis}\n\n${eddProgram.content}\n\n${eddProgram.subComponents.map((s) => `- ${s}`).join("\n")}`,
    citations: ["31 USC 5318(i)", "31 CFR 1010.610-670"],
    findings: [],
    recommendations: [],
  };
}

function buildSARSection(sarProcedures: ProgramComponent): GeneratedSection {
  return {
    order: 6,
    title: "Suspicious Activity Monitoring and Reporting",
    content: `## ${sarProcedures.title}\n**Regulatory Basis:** ${sarProcedures.regulatoryBasis}\n\n${sarProcedures.content}\n\n${sarProcedures.subComponents.map((s) => `- ${s}`).join("\n")}`,
    citations: ["31 CFR 1010.320", "31 USC 5318(g)", "12 CFR 21.11"],
    findings: [],
    recommendations: [],
  };
}

function buildCTRSection(ctrProcedures: ProgramComponent): GeneratedSection {
  return {
    order: 7,
    title: "Currency Transaction Reporting",
    content: `## ${ctrProcedures.title}\n**Regulatory Basis:** ${ctrProcedures.regulatoryBasis}\n\n${ctrProcedures.content}\n\n${ctrProcedures.subComponents.map((s) => `- ${s}`).join("\n")}`,
    citations: ["31 CFR 1010.310-313", "31 USC 5313", "31 CFR 1010.311"],
    findings: [],
    recommendations: [],
  };
}

function buildOFACSection(ofacProcedures: ProgramComponent): GeneratedSection {
  return {
    order: 8,
    title: "OFAC Compliance Procedures",
    content: `## ${ofacProcedures.title}\n**Regulatory Basis:** ${ofacProcedures.regulatoryBasis}\n\n${ofacProcedures.content}\n\n${ofacProcedures.subComponents.map((s) => `- ${s}`).join("\n")}`,
    citations: ["31 CFR Part 501", "50 USC 1701-1706 (IEEPA)", "Executive Orders"],
    findings: [],
    recommendations: [],
  };
}

function buildTrainingSection(trainingProgram: ProgramComponent): GeneratedSection {
  return {
    order: 9,
    title: "Training Program",
    content: `## ${trainingProgram.title}\n**Regulatory Basis:** ${trainingProgram.regulatoryBasis}\n\n${trainingProgram.content}\n\n${trainingProgram.subComponents.map((s) => `- ${s}`).join("\n")}`,
    citations: ["31 CFR 1010.210(b)(4)", "12 CFR 21.21(c)(4)"],
    findings: [],
    recommendations: [],
  };
}

function buildAuditSection(auditProgram: ProgramComponent): GeneratedSection {
  return {
    order: 10,
    title: "Independent Testing / Audit Program",
    content: `## ${auditProgram.title}\n**Regulatory Basis:** ${auditProgram.regulatoryBasis}\n\n${auditProgram.content}\n\n${auditProgram.subComponents.map((s) => `- ${s}`).join("\n")}`,
    citations: ["31 CFR 1010.210(b)(2)", "12 CFR 21.21(c)(2)"],
    findings: [],
    recommendations: [],
  };
}

function identifyProgramGaps(input: BSAProgramInput): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  const requiredPolicies = [
    { name: "BSA/AML Policy", regulation: "31 CFR 1010.210" },
    { name: "CIP", regulation: "31 CFR 1010.220" },
    { name: "CDD/Beneficial Ownership", regulation: "31 CFR 1010.230" },
    { name: "SAR", regulation: "31 CFR 1010.320" },
    { name: "CTR", regulation: "31 CFR 1010.310" },
    { name: "OFAC", regulation: "31 CFR Part 501" },
  ];

  for (const required of requiredPolicies) {
    const hasPolicy = input.existingPolicies.some((p) =>
      p.toLowerCase().includes(required.name.toLowerCase().split("/")[0]!)
    );
    if (!hasPolicy) {
      gaps.push({
        standard: required.regulation,
        requirement: `Written ${required.name} policy/procedure required per regulatory mandate`,
        currentState: `No documented ${required.name} policy identified in existing policy inventory`,
        severity: "critical",
        recommendedAction: `Develop and implement written ${required.name} policy; obtain board approval; train applicable staff; implement within 90 days`,
      });
    }
  }

  if (!input.bsaOfficerName || input.bsaOfficerName.trim() === "") {
    gaps.push({
      standard: "31 CFR 1010.210(b)(3) / 12 CFR 21.21(c)(3)",
      requirement: "Institution must designate a qualified individual as BSA/AML Compliance Officer",
      currentState: "BSA/AML Officer designation not documented",
      severity: "critical",
      recommendedAction: "Immediately designate qualified BSA/AML Officer with board resolution; ensure adequate authority, resources, and independence",
    });
  }

  if (!input.automatedMonitoringSystem && input.riskProfile !== "low") {
    gaps.push({
      standard: "31 CFR 1010.320 / FFIEC BSA/AML Manual",
      requirement: "Suspicious activity monitoring must be commensurate with institution's risk profile",
      currentState: `Institution rated ${input.riskProfile.toUpperCase()} risk but no automated monitoring system identified`,
      severity: input.riskProfile === "high" ? "critical" : "high",
      recommendedAction: "Evaluate and implement automated transaction monitoring system with scenarios appropriate to institution's risk profile; manual monitoring insufficient for moderate/high risk institutions",
    });
  }

  const lastAudit = new Date(input.lastAuditDate);
  const now = new Date();
  const monthsSinceAudit = (now.getFullYear() - lastAudit.getFullYear()) * 12 + (now.getMonth() - lastAudit.getMonth());
  const maxMonths = input.riskProfile === "high" ? 12 : input.riskProfile === "moderate" ? 18 : 24;

  if (monthsSinceAudit > maxMonths) {
    gaps.push({
      standard: "31 CFR 1010.210(b)(2)",
      requirement: `Independent testing must be conducted at intervals commensurate with risk profile (${maxMonths} months for ${input.riskProfile} risk)`,
      currentState: `Last independent test completed ${input.lastAuditDate} (${monthsSinceAudit} months ago); exceeds ${maxMonths}-month threshold`,
      severity: "high",
      recommendedAction: `Schedule independent BSA/AML testing immediately; engage qualified internal audit or external firm; complete within 90 days`,
    });
  }

  return gaps;
}

function calculateProgramComplianceScore(input: BSAProgramInput, gaps: GeneratedGap[]): number {
  let score = 100;

  for (const gap of gaps) {
    switch (gap.severity) {
      case "critical":
        score -= 20;
        break;
      case "high":
        score -= 10;
        break;
      case "medium":
        score -= 5;
        break;
      case "low":
        score -= 2;
        break;
      case "informational":
        score -= 1;
        break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

function buildProgramContext(input: BSAProgramInput, components: ProgramComponent[]): string {
  const regulations = BSA_CORE_REGULATIONS
    .filter((r) => r.agency === getRegulatorForType(input.institutionType))
    .map((r) => `${r.citation}: ${r.title}`)
    .join("\n");

  return `Generate additional sections for a BSA/AML Compliance Program Manual.

INSTITUTION:
- Name: ${input.institutionName}
- Type: ${formatInstitutionType(input.institutionType)}
- Asset Size: $${formatAssetSize(input.assetSize)}
- Employees: ${input.employeeCount}
- Branches: ${input.branchCount}
- Risk Profile: ${input.riskProfile.toUpperCase()}
- BSA Officer: ${input.bsaOfficerName}, ${input.bsaOfficerTitle}
- Products: ${input.productsOffered.join(", ")}
- Board Approval: ${input.boardApprovalDate}
- Last Audit: ${input.lastAuditDate}

APPLICABLE REGULATIONS:
${regulations}

ALREADY DOCUMENTED (do not repeat):
${components.map((c) => c.title).join(", ")}

Generate these additional sections:
1. Recordkeeping Requirements (all BSA recordkeeping obligations with retention periods)
2. Information Sharing (314(a) and 314(b) procedures)
3. Regulatory Examination Procedures (exam preparation and response)
4. Program Governance (board oversight, reporting, approval matrix)
5. Compliance Calendar (annual schedule of BSA/AML obligations)`;
}

function getRegulatorForType(institutionType: string): "FinCEN" | "OCC" | "FRB" | "FDIC" | "NCUA" {
  switch (institutionType) {
    case "national-bank":
    case "savings-association":
      return "OCC";
    case "state-member-bank":
      return "FRB";
    case "state-nonmember-bank":
      return "FDIC";
    case "credit-union":
      return "NCUA";
    default:
      return "FinCEN";
  }
}

function formatInstitutionType(type: string): string {
  const typeMap: Record<string, string> = {
    "national-bank": "National Bank (OCC-supervised)",
    "state-member-bank": "State Member Bank (FRB-supervised)",
    "state-nonmember-bank": "State Nonmember Bank (FDIC-supervised)",
    "savings-association": "Savings Association (OCC-supervised)",
    "credit-union": "Credit Union (NCUA-supervised)",
  };
  return typeMap[type] ?? type;
}

function formatAssetSize(assets: number): string {
  if (assets >= 1_000_000_000) return `${(assets / 1_000_000_000).toFixed(1)}B`;
  if (assets >= 1_000_000) return `${(assets / 1_000_000).toFixed(0)}M`;
  return assets.toLocaleString();
}
