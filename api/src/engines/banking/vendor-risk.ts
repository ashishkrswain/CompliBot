import { generateCompletion } from "../../lib/llm.js";
import { parseReportSections } from "../../services/report-generator.js";
import type { GeneratedReport, GeneratedGap, GeneratedSection } from "../../services/report-generator.js";

type VendorCriticality = "critical" | "significant" | "limited";
type DataAccessLevel = "none" | "public-only" | "non-sensitive-internal" | "sensitive-pii" | "regulated-data" | "full-system-access";
type VendorRiskRating = "high" | "moderate" | "low";

interface VendorProfile {
  vendorName: string;
  serviceDescription: string;
  contractStartDate: string;
  contractEndDate: string;
  annualSpend: number;
  criticality: VendorCriticality;
  dataAccess: DataAccessLevel;
  serviceLocation: "domestic" | "offshore" | "hybrid";
  subcontractors: boolean;
  regulatoryReporting: boolean;
  businessContinuityImpact: "critical-no-workaround" | "significant-manual-workaround" | "limited-alternatives-exist";
  lastDueDiligenceDate: string;
  lastOnSiteReview: string;
  incidentHistory: string[];
  contractualProtections: string[];
}

interface VendorAssessmentResult {
  vendor: VendorProfile;
  overallRiskRating: VendorRiskRating;
  inherentRisk: VendorRiskRating;
  residualRisk: VendorRiskRating;
  riskFactors: string[];
  mitigatingControls: string[];
  dueDiligenceStatus: "current" | "overdue" | "never-performed";
  monitoringFrequency: "continuous" | "quarterly" | "semi-annual" | "annual";
  findings: string[];
  recommendations: string[];
}

export interface VendorRiskInput {
  institutionName: string;
  assetSize: number;
  vendors: VendorProfile[];
  existingPolicies: string[];
  boardOversightFrequency: string;
  riskAppetiteStatement: string;
  lastProgramAuditDate: string;
}

export async function generateVendorRiskReport(input: VendorRiskInput): Promise<GeneratedReport> {
  const assessments = input.vendors.map((vendor) => assessVendor(vendor));
  const concentrationAnalysis = analyzeConcentration(input.vendors, assessments);
  const programGaps = assessProgramCompleteness(input);

  const systemPrompt = `You are a third-party risk management expert generating documentation per OCC Bulletin 2013-29 (Third-Party Relationships: Risk Management Guidance), FFIEC IT Examination Handbook — Outsourcing Technology Services, and Federal Reserve SR 13-19.

The documentation must be professional, suitable for regulatory examination, and address all lifecycle phases: planning, due diligence, contract negotiation, ongoing monitoring, and termination.

Key regulatory expectations:
- Board oversight of critical vendor relationships
- Risk-based due diligence commensurate with relationship criticality
- Comprehensive contract provisions including audit rights, data protection, business continuity
- Ongoing monitoring with defined metrics and triggers
- Concentration risk management
- Contingency planning for vendor termination`;

  const additionalContext = buildVendorContext(input, assessments, concentrationAnalysis);

  const rawContent = await generateCompletion(systemPrompt, additionalContext, {
    temperature: 0.2,
    maxTokens: 8192,
  });

  const llmSections = parseReportSections(rawContent);
  const gaps = identifyVendorGaps(input, assessments, programGaps);

  const sections: GeneratedSection[] = [
    buildVendorInventorySection(assessments),
    buildRiskAssessmentSection(assessments),
    buildDueDiligenceSection(assessments),
    buildContractReviewSection(input),
    buildConcentrationRiskSection(concentrationAnalysis),
    buildMonitoringSection(assessments),
    buildBoardReportingSection(input, assessments),
    ...llmSections,
  ];

  return {
    title: `Third-Party Risk Management Assessment — ${input.institutionName}`,
    summary: `Third-Party Risk Management documentation per OCC Bulletin 2013-29 for ${input.institutionName}. ${input.vendors.length} vendors assessed: ${assessments.filter((a) => a.vendor.criticality === "critical").length} critical, ${assessments.filter((a) => a.vendor.criticality === "significant").length} significant, ${assessments.filter((a) => a.vendor.criticality === "limited").length} limited. ${assessments.filter((a) => a.overallRiskRating === "high").length} high-risk relationships identified.`,
    complianceScore: calculateVendorScore(gaps, programGaps),
    sections,
    gaps,
  };
}

function assessVendor(vendor: VendorProfile): VendorAssessmentResult {
  const riskFactors: string[] = [];
  const mitigatingControls: string[] = [];
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Assess inherent risk
  let inherentRiskScore = 0;

  // Criticality factor
  switch (vendor.criticality) {
    case "critical": inherentRiskScore += 3; riskFactors.push("Critical service — no immediate alternative available"); break;
    case "significant": inherentRiskScore += 2; riskFactors.push("Significant service — manual workaround possible but disruptive"); break;
    case "limited": inherentRiskScore += 1; riskFactors.push("Limited criticality — alternatives readily available"); break;
  }

  // Data access factor
  switch (vendor.dataAccess) {
    case "full-system-access": inherentRiskScore += 3; riskFactors.push("Full system access — highest data risk"); break;
    case "regulated-data": inherentRiskScore += 3; riskFactors.push("Access to regulated data (GLBA, PCI)"); break;
    case "sensitive-pii": inherentRiskScore += 2; riskFactors.push("Access to sensitive PII"); break;
    case "non-sensitive-internal": inherentRiskScore += 1; riskFactors.push("Access to non-sensitive internal data"); break;
    default: riskFactors.push("No data access or public data only"); break;
  }

  // Location factor
  if (vendor.serviceLocation === "offshore") {
    inherentRiskScore += 2;
    riskFactors.push("Offshore service delivery — additional jurisdictional and data sovereignty risk");
  } else if (vendor.serviceLocation === "hybrid") {
    inherentRiskScore += 1;
    riskFactors.push("Hybrid delivery model — partial offshore exposure");
  }

  // Subcontractors (fourth-party risk)
  if (vendor.subcontractors) {
    inherentRiskScore += 1;
    riskFactors.push("Uses subcontractors (fourth-party risk)");
  }

  // BCI impact
  if (vendor.businessContinuityImpact === "critical-no-workaround") {
    inherentRiskScore += 2;
    riskFactors.push("Service disruption would critically impact operations with no workaround");
  }

  const inherentRisk: VendorRiskRating = inherentRiskScore >= 7 ? "high" : inherentRiskScore >= 4 ? "moderate" : "low";

  // Assess residual risk (based on controls)
  let controlScore = 0;

  for (const protection of vendor.contractualProtections) {
    const protectionLower = protection.toLowerCase();
    if (protectionLower.includes("audit") || protectionLower.includes("right to audit")) {
      controlScore += 1; mitigatingControls.push("Right-to-audit clause in contract");
    }
    if (protectionLower.includes("sla") || protectionLower.includes("service level")) {
      controlScore += 1; mitigatingControls.push("Defined SLAs with remedies");
    }
    if (protectionLower.includes("data") || protectionLower.includes("security")) {
      controlScore += 1; mitigatingControls.push("Data security requirements in contract");
    }
    if (protectionLower.includes("termination") || protectionLower.includes("exit")) {
      controlScore += 1; mitigatingControls.push("Termination/exit provisions defined");
    }
    if (protectionLower.includes("insurance") || protectionLower.includes("indemnification")) {
      controlScore += 1; mitigatingControls.push("Insurance/indemnification requirements");
    }
    if (protectionLower.includes("bcp") || protectionLower.includes("business continuity") || protectionLower.includes("disaster recovery")) {
      controlScore += 1; mitigatingControls.push("BCP/DR requirements in contract");
    }
    if (protectionLower.includes("notification") || protectionLower.includes("breach notification")) {
      controlScore += 1; mitigatingControls.push("Incident/breach notification requirements");
    }
    if (protectionLower.includes("subcontract") || protectionLower.includes("fourth-party")) {
      controlScore += 1; mitigatingControls.push("Subcontractor/fourth-party controls");
    }
  }

  // Due diligence status
  let dueDiligenceStatus: VendorAssessmentResult["dueDiligenceStatus"];
  if (!vendor.lastDueDiligenceDate || vendor.lastDueDiligenceDate === "") {
    dueDiligenceStatus = "never-performed";
    findings.push("Due diligence has never been performed on this vendor");
    recommendations.push("Conduct initial due diligence assessment immediately");
  } else {
    const monthsSinceDueDiligence = getMonthsSince(vendor.lastDueDiligenceDate);
    const maxMonths = vendor.criticality === "critical" ? 12 : vendor.criticality === "significant" ? 18 : 24;
    if (monthsSinceDueDiligence > maxMonths) {
      dueDiligenceStatus = "overdue";
      findings.push(`Due diligence overdue (last performed ${vendor.lastDueDiligenceDate}; ${monthsSinceDueDiligence} months ago)`);
      recommendations.push(`Schedule due diligence refresh within 60 days (${maxMonths}-month cycle for ${vendor.criticality} vendors)`);
    } else {
      dueDiligenceStatus = "current";
    }
  }

  // Incident history
  if (vendor.incidentHistory.length > 0) {
    findings.push(`${vendor.incidentHistory.length} incident(s) in history: ${vendor.incidentHistory.join("; ")}`);
    if (vendor.incidentHistory.length > 2) {
      recommendations.push("Recurring incidents indicate need for enhanced monitoring or vendor performance review");
    }
  }

  // Missing contract protections for critical vendors
  if (vendor.criticality === "critical") {
    const requiredProtections = ["audit", "sla", "data", "termination", "bcp", "notification"];
    const protectionsLower = vendor.contractualProtections.map((p) => p.toLowerCase()).join(" ");
    for (const required of requiredProtections) {
      if (!protectionsLower.includes(required)) {
        findings.push(`Critical vendor missing contractual protection: ${required}`);
        recommendations.push(`Add ${required} clause to contract at next renewal per OCC Bulletin 2013-29`);
      }
    }
  }

  // Calculate residual risk
  const controlReduction = Math.min(controlScore * 0.5, inherentRiskScore * 0.5);
  const residualScore = inherentRiskScore - controlReduction;
  const residualRisk: VendorRiskRating = residualScore >= 5 ? "high" : residualScore >= 3 ? "moderate" : "low";

  // Monitoring frequency
  let monitoringFrequency: VendorAssessmentResult["monitoringFrequency"];
  if (vendor.criticality === "critical" && inherentRisk === "high") monitoringFrequency = "continuous";
  else if (vendor.criticality === "critical" || inherentRisk === "high") monitoringFrequency = "quarterly";
  else if (vendor.criticality === "significant") monitoringFrequency = "semi-annual";
  else monitoringFrequency = "annual";

  return {
    vendor,
    overallRiskRating: residualRisk,
    inherentRisk,
    residualRisk,
    riskFactors,
    mitigatingControls,
    dueDiligenceStatus,
    monitoringFrequency,
    findings,
    recommendations,
  };
}

function analyzeConcentration(vendors: VendorProfile[], assessments: VendorAssessmentResult[]): ConcentrationAnalysis {
  const totalSpend = vendors.reduce((sum, v) => sum + v.annualSpend, 0);
  const criticalVendors = vendors.filter((v) => v.criticality === "critical");
  const offshoreVendors = vendors.filter((v) => v.serviceLocation === "offshore" || v.serviceLocation === "hybrid");

  // Service concentration — are multiple critical services from one vendor?
  const vendorServiceCount = new Map<string, number>();
  for (const vendor of vendors) {
    const count = vendorServiceCount.get(vendor.vendorName) ?? 0;
    vendorServiceCount.set(vendor.vendorName, count + 1);
  }
  const concentratedVendors = Array.from(vendorServiceCount.entries()).filter(([_, count]) => count > 1);

  // Spend concentration
  const spendConcentration = vendors
    .map((v) => ({ name: v.vendorName, percentage: totalSpend > 0 ? (v.annualSpend / totalSpend) * 100 : 0 }))
    .sort((a, b) => b.percentage - a.percentage);

  const topVendorSpendPct = spendConcentration[0]?.percentage ?? 0;

  const risks: string[] = [];
  if (criticalVendors.length > 0 && criticalVendors.length <= 2) {
    risks.push(`Only ${criticalVendors.length} critical vendor(s) — high concentration risk if one fails`);
  }
  if (topVendorSpendPct > 30) {
    risks.push(`Top vendor accounts for ${topVendorSpendPct.toFixed(1)}% of total third-party spend`);
  }
  if (offshoreVendors.length > 0) {
    risks.push(`${offshoreVendors.length} vendor(s) with offshore/hybrid delivery — geographic concentration risk`);
  }
  if (concentratedVendors.length > 0) {
    risks.push(`Service concentration: ${concentratedVendors.map(([name, count]) => `${name} (${count} services)`).join(", ")}`);
  }

  return {
    totalVendors: vendors.length,
    totalSpend,
    criticalCount: criticalVendors.length,
    significantCount: vendors.filter((v) => v.criticality === "significant").length,
    limitedCount: vendors.filter((v) => v.criticality === "limited").length,
    spendConcentration,
    offshoreCount: offshoreVendors.length,
    concentrationRisks: risks,
    highRiskCount: assessments.filter((a) => a.overallRiskRating === "high").length,
  };
}

interface ConcentrationAnalysis {
  totalVendors: number;
  totalSpend: number;
  criticalCount: number;
  significantCount: number;
  limitedCount: number;
  spendConcentration: Array<{ name: string; percentage: number }>;
  offshoreCount: number;
  concentrationRisks: string[];
  highRiskCount: number;
}

function assessProgramCompleteness(input: VendorRiskInput): string[] {
  const requiredElements = [
    { element: "Third-party risk management policy", keywords: ["third-party", "vendor", "tprm"] },
    { element: "Risk assessment methodology", keywords: ["risk assessment", "risk rating", "criticality"] },
    { element: "Due diligence procedures", keywords: ["due diligence", "onboarding"] },
    { element: "Ongoing monitoring procedures", keywords: ["monitoring", "ongoing", "oversight"] },
    { element: "Contract review standards", keywords: ["contract", "legal review"] },
    { element: "Concentration risk policy", keywords: ["concentration", "single point"] },
    { element: "Contingency/exit planning", keywords: ["contingency", "exit", "termination"] },
    { element: "Board reporting procedures", keywords: ["board", "reporting", "governance"] },
  ];

  const gaps: string[] = [];
  for (const required of requiredElements) {
    const exists = input.existingPolicies.some((policy) =>
      required.keywords.some((kw) => policy.toLowerCase().includes(kw))
    );
    if (!exists) {
      gaps.push(`Missing: ${required.element}`);
    }
  }

  return gaps;
}

function buildVendorInventorySection(assessments: VendorAssessmentResult[]): GeneratedSection {
  const inventoryTable = assessments.map((a) =>
    `| ${a.vendor.vendorName} | ${a.vendor.serviceDescription.slice(0, 40)} | ${a.vendor.criticality.toUpperCase()} | ${a.overallRiskRating.toUpperCase()} | ${a.vendor.dataAccess} | ${a.monitoringFrequency} |`
  ).join("\n");

  return {
    order: 1,
    title: "Third-Party Vendor Inventory",
    content: `## Third-Party Vendor Inventory
Per OCC Bulletin 2013-29, the institution must maintain a complete inventory of all third-party relationships with risk ratings and monitoring assignments.

### Vendor Summary
| Vendor | Service | Criticality | Risk Rating | Data Access | Monitoring |
|---|---|---|---|---|---|
${inventoryTable}

### Statistics
- **Total Relationships:** ${assessments.length}
- **Critical:** ${assessments.filter((a) => a.vendor.criticality === "critical").length}
- **Significant:** ${assessments.filter((a) => a.vendor.criticality === "significant").length}
- **Limited:** ${assessments.filter((a) => a.vendor.criticality === "limited").length}
- **High Risk:** ${assessments.filter((a) => a.overallRiskRating === "high").length}
- **Total Annual Spend:** $${assessments.reduce((sum, a) => sum + a.vendor.annualSpend, 0).toLocaleString()}`,
    citations: ["OCC Bulletin 2013-29", "FFIEC IT Examination Handbook — Outsourcing"],
    findings: [],
    recommendations: [],
  };
}

function buildRiskAssessmentSection(assessments: VendorAssessmentResult[]): GeneratedSection {
  const detailedAssessments = assessments.map((a) => `### ${a.vendor.vendorName}
**Service:** ${a.vendor.serviceDescription}
**Inherent Risk:** ${a.inherentRisk.toUpperCase()} | **Residual Risk:** ${a.residualRisk.toUpperCase()}
**Criticality:** ${a.vendor.criticality.toUpperCase()} | **Data Access:** ${a.vendor.dataAccess}

**Risk Factors:**
${a.riskFactors.map((f) => `- ${f}`).join("\n")}

**Mitigating Controls:**
${a.mitigatingControls.length > 0 ? a.mitigatingControls.map((c) => `- ${c}`).join("\n") : "- No mitigating controls identified"}

**Findings:**
${a.findings.length > 0 ? a.findings.map((f) => `- ${f}`).join("\n") : "- No findings"}

**Recommendations:**
${a.recommendations.length > 0 ? a.recommendations.map((r) => `- ${r}`).join("\n") : "- No recommendations"}`).join("\n\n");

  return {
    order: 2,
    title: "Individual Vendor Risk Assessments",
    content: `## Individual Vendor Risk Assessments
Per OCC Bulletin 2013-29, risk assessment should be commensurate with the level of risk and complexity of each third-party relationship.

### Risk Rating Methodology
- **Critical:** Service disruption would halt business operations; no immediate alternative; access to most sensitive data
- **Significant:** Service disruption would materially impact operations; manual workaround possible; access to sensitive data
- **Limited:** Service disruption manageable; alternatives readily available; minimal data access

${detailedAssessments}`,
    citations: ["OCC Bulletin 2013-29 — Risk Assessment", "Federal Reserve SR 13-19"],
    findings: assessments.flatMap((a) => a.findings),
    recommendations: assessments.flatMap((a) => a.recommendations),
  };
}

function buildDueDiligenceSection(assessments: VendorAssessmentResult[]): GeneratedSection {
  const overdueVendors = assessments.filter((a) => a.dueDiligenceStatus === "overdue" || a.dueDiligenceStatus === "never-performed");
  const currentVendors = assessments.filter((a) => a.dueDiligenceStatus === "current");

  return {
    order: 3,
    title: "Due Diligence Status",
    content: `## Due Diligence Program
Per OCC Bulletin 2013-29, due diligence should be commensurate with the level of risk and complexity of the third-party relationship.

### Due Diligence Checklist (Critical Vendors)
- [ ] Financial condition (audited financials, Dun & Bradstreet, credit reports)
- [ ] Business experience and reputation (references, FOIA/public records, legal/regulatory actions)
- [ ] Qualifications and backgrounds of company principals
- [ ] Risk management programs (BCP/DR, information security, internal controls)
- [ ] Ability to comply with applicable laws and regulations
- [ ] IT environment (security certifications, SOC reports, penetration testing)
- [ ] Insurance coverage (cyber liability, E&O, general liability)
- [ ] Reliance on and oversight of subcontractors (fourth-party risk)
- [ ] Geographic location and associated risks (data sovereignty, geopolitical)
- [ ] Ability to meet SLA requirements

### Status Summary
- **Current:** ${currentVendors.length} vendor(s)
- **Overdue/Never Performed:** ${overdueVendors.length} vendor(s)

### Vendors Requiring Due Diligence Action
${overdueVendors.length > 0 ? overdueVendors.map((a) => `- **${a.vendor.vendorName}** (${a.vendor.criticality}): ${a.dueDiligenceStatus === "never-performed" ? "Never assessed — immediate action required" : `Last assessed ${a.vendor.lastDueDiligenceDate} — overdue`}`).join("\n") : "All vendors current on due diligence."}

### Due Diligence Frequency
| Criticality | Minimum Frequency | Scope |
|---|---|---|
| Critical | Annual | Full-scope (all checklist items) |
| Significant | Every 18 months | Standard (financial, security, compliance) |
| Limited | Every 24 months | Abbreviated (financial viability, basic compliance) |`,
    citations: ["OCC Bulletin 2013-29 — Due Diligence and Third-Party Selection"],
    findings: overdueVendors.map((a) => `Due diligence ${a.dueDiligenceStatus} for ${a.vendor.vendorName}`),
    recommendations: overdueVendors.map((a) => `Complete due diligence for ${a.vendor.vendorName} within 60 days`),
  };
}

function buildContractReviewSection(input: VendorRiskInput): GeneratedSection {
  return {
    order: 4,
    title: "Contract Risk Review",
    content: `## Contract Risk Review Elements
Per OCC Bulletin 2013-29, contracts should be written to allow the institution to manage the risks of the third-party relationship.

### Required Contract Provisions (Critical/Significant Vendors)
| Provision | Requirement | Regulatory Basis |
|---|---|---|
| Scope of Services | Clear, detailed description of services and responsibilities | OCC 2013-29 |
| Performance Standards | Measurable SLAs with remedies for non-performance | OCC 2013-29 |
| Right to Audit | Unrestricted right to audit vendor, including subcontractors | OCC 2013-29; 12 CFR 30 |
| Data Ownership | Institution owns all data; vendor is custodian only | GLBA; OCC 2013-29 |
| Data Security | Security standards, encryption requirements, access controls | GLBA 501(b); 12 CFR 30 |
| Breach Notification | Notification within 24-72 hours of security incident | GLBA; state breach notification laws |
| Business Continuity | Vendor BCP/DR plan; RPO/RTO requirements; testing obligations | FFIEC BCP Handbook |
| Insurance | Adequate cyber liability, E&O, and general liability coverage | OCC 2013-29 |
| Compliance | Compliance with all applicable laws and regulations | OCC 2013-29 |
| Subcontracting | Prior approval required; vendor responsible for subcontractor oversight | OCC 2013-29 |
| Termination | Right to terminate for cause; data return/destruction procedures; transition assistance | OCC 2013-29 |
| Indemnification | Vendor indemnifies institution for vendor-caused losses | OCC 2013-29 |
| Regulatory Access | Regulators have right to examine vendor's activities | 12 USC 1867(c) |
| Dispute Resolution | Process for resolving disagreements | OCC 2013-29 |
| Foreign-Based Services | Additional provisions for country risk, data sovereignty | OCC 2013-29 |

### Contract Renewal Schedule
${input.vendors.filter((v) => v.contractEndDate).map((v) => {
  const monthsToExpiry = getMonthsUntil(v.contractEndDate);
  return `- **${v.vendorName}**: Expires ${v.contractEndDate}${monthsToExpiry <= 6 ? " (**RENEWAL ACTION NEEDED**)" : ""}`;
}).join("\n")}`,
    citations: ["OCC Bulletin 2013-29 — Contract Negotiation", "12 USC 1867(c)", "GLBA Section 501(b)"],
    findings: [],
    recommendations: [],
  };
}

function buildConcentrationRiskSection(analysis: ConcentrationAnalysis): GeneratedSection {
  return {
    order: 5,
    title: "Concentration Risk Analysis",
    content: `## Concentration Risk Analysis
Per OCC Bulletin 2013-29 and FFIEC guidance, institutions must identify and manage concentration risk from third-party relationships.

### Spend Concentration
| Vendor | % of Total Spend |
|---|---|
${analysis.spendConcentration.slice(0, 10).map((s) => `| ${s.name} | ${s.percentage.toFixed(1)}% |`).join("\n")}

### Concentration Risk Summary
- **Total Vendors:** ${analysis.totalVendors}
- **Critical Vendors:** ${analysis.criticalCount}
- **Offshore/Hybrid Delivery:** ${analysis.offshoreCount}
- **High Risk Relationships:** ${analysis.highRiskCount}

### Identified Concentration Risks
${analysis.concentrationRisks.length > 0 ? analysis.concentrationRisks.map((r) => `- ${r}`).join("\n") : "- No significant concentration risks identified"}

### Mitigation Strategies
- Maintain contingency plans for all critical vendor relationships
- Diversify service providers where economically feasible
- Ensure contractual portability of data and services
- Conduct periodic market scans for alternative providers
- Include concentration risk in annual third-party risk reporting to board`,
    citations: ["OCC Bulletin 2013-29 — Ongoing Monitoring", "FFIEC IT Examination Handbook"],
    findings: analysis.concentrationRisks,
    recommendations: analysis.concentrationRisks.map((r) => `Mitigate: ${r}`),
  };
}

function buildMonitoringSection(assessments: VendorAssessmentResult[]): GeneratedSection {
  const monitoringSchedule = assessments.map((a) =>
    `| ${a.vendor.vendorName} | ${a.vendor.criticality.toUpperCase()} | ${a.monitoringFrequency} | ${a.dueDiligenceStatus === "current" ? a.vendor.lastDueDiligenceDate : "**OVERDUE**"} |`
  ).join("\n");

  return {
    order: 6,
    title: "Ongoing Monitoring Program",
    content: `## Ongoing Monitoring Program
Per OCC Bulletin 2013-29, ongoing monitoring should confirm the third-party's ability to meet contractual obligations and comply with regulations.

### Monitoring Schedule
| Vendor | Criticality | Frequency | Last Review |
|---|---|---|---|
${monitoringSchedule}

### Monitoring Activities by Frequency
**Continuous (Critical/High-Risk):**
- Service availability and SLA metrics
- Security incident notifications
- Regulatory enforcement actions (public records)
- Financial distress indicators (credit rating, stock price)
- OFAC/sanctions list changes

**Quarterly:**
- SLA performance review
- Complaint/issue tracking
- Security posture changes
- SOC report review (when available)

**Semi-Annual:**
- Financial condition assessment
- Compliance status verification
- Subcontractor/staffing changes
- Business continuity plan validation

**Annual:**
- Full due diligence refresh
- Contract compliance review
- On-site assessment (critical vendors)
- Independent control validation

### Escalation Triggers
- SLA performance below threshold for 2 consecutive periods
- Security breach or significant incident
- Adverse regulatory action against vendor
- Material change in financial condition
- Key personnel departure (critical relationships)
- Acquisition/merger of vendor
- Subcontractor change without prior approval`,
    citations: ["OCC Bulletin 2013-29 — Ongoing Monitoring", "Federal Reserve SR 13-19"],
    findings: assessments.filter((a) => a.dueDiligenceStatus !== "current").map((a) => `${a.vendor.vendorName}: monitoring ${a.dueDiligenceStatus}`),
    recommendations: [],
  };
}

function buildBoardReportingSection(input: VendorRiskInput, assessments: VendorAssessmentResult[]): GeneratedSection {
  const criticalVendors = assessments.filter((a) => a.vendor.criticality === "critical");
  const highRiskVendors = assessments.filter((a) => a.overallRiskRating === "high");

  return {
    order: 7,
    title: "Board Reporting Template",
    content: `## Board/Committee Reporting
Per OCC Bulletin 2013-29, the board of directors is responsible for overseeing third-party risk management.

### Board Oversight Requirements
- Approve third-party risk management policy
- Approve relationships with critical third parties
- Review and approve risk management processes
- Receive regular reports on significant third-party activities
- Ensure adequate resources for third-party risk management

### Board Report — Executive Summary
**Reporting Period:** Current quarter
**Board Reporting Frequency:** ${input.boardOversightFrequency}

**Portfolio Summary:**
- Total Relationships: ${assessments.length}
- Critical: ${criticalVendors.length}
- High Risk: ${highRiskVendors.length}
- Due Diligence Overdue: ${assessments.filter((a) => a.dueDiligenceStatus !== "current").length}
- Total Annual Spend: $${assessments.reduce((sum, a) => sum + a.vendor.annualSpend, 0).toLocaleString()}

**Items Requiring Board Attention:**
${criticalVendors.length > 0 ? criticalVendors.map((a) => `- ${a.vendor.vendorName}: ${a.overallRiskRating.toUpperCase()} risk — ${a.findings.length > 0 ? a.findings[0] : "No findings"}`).join("\n") : "- No items requiring immediate board attention"}

**Key Metrics:**
- SLA Compliance Rate: [To be calculated from monitoring data]
- Vendor Incident Count: ${assessments.reduce((sum, a) => sum + a.vendor.incidentHistory.length, 0)}
- Contracts Expiring Within 6 Months: ${input.vendors.filter((v) => getMonthsUntil(v.contractEndDate) <= 6).length}
- Open Findings: ${assessments.reduce((sum, a) => sum + a.findings.length, 0)}

### Risk Appetite Statement
${input.riskAppetiteStatement || "The institution's third-party risk appetite has not been formally documented. Recommendation: Develop and obtain board approval for third-party risk appetite statement."}`,
    citations: ["OCC Bulletin 2013-29 — Board and Management Responsibilities"],
    findings: [],
    recommendations: !input.riskAppetiteStatement ? ["Develop formal third-party risk appetite statement for board approval"] : [],
  };
}

function identifyVendorGaps(input: VendorRiskInput, assessments: VendorAssessmentResult[], programGaps: string[]): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  // Program completeness gaps
  for (const programGap of programGaps) {
    gaps.push({
      standard: "OCC Bulletin 2013-29",
      requirement: `Third-party risk management program must include ${programGap.replace("Missing: ", "")}`,
      currentState: programGap,
      severity: programGap.includes("policy") || programGap.includes("risk assessment") ? "critical" : "high",
      recommendedAction: `Develop and implement ${programGap.replace("Missing: ", "")}; obtain board approval; train responsible staff`,
    });
  }

  // Vendor-specific gaps
  const overdueAssessments = assessments.filter((a) => a.dueDiligenceStatus !== "current");
  if (overdueAssessments.length > 0) {
    gaps.push({
      standard: "OCC Bulletin 2013-29 — Due Diligence",
      requirement: "Due diligence must be conducted and refreshed at intervals commensurate with vendor criticality",
      currentState: `${overdueAssessments.length} vendor(s) have overdue or never-performed due diligence: ${overdueAssessments.map((a) => a.vendor.vendorName).join(", ")}`,
      severity: overdueAssessments.some((a) => a.vendor.criticality === "critical") ? "critical" : "high",
      recommendedAction: "Schedule and complete due diligence for all overdue vendors within 60 days; prioritize critical vendors",
    });
  }

  // High-risk without adequate controls
  const highRiskWeakControls = assessments.filter((a) => a.overallRiskRating === "high" && a.mitigatingControls.length < 3);
  if (highRiskWeakControls.length > 0) {
    gaps.push({
      standard: "OCC Bulletin 2013-29 — Contract Negotiation",
      requirement: "Contracts with high-risk vendors must include comprehensive risk mitigation provisions",
      currentState: `${highRiskWeakControls.length} high-risk vendor(s) have inadequate contractual protections: ${highRiskWeakControls.map((a) => a.vendor.vendorName).join(", ")}`,
      severity: "high",
      recommendedAction: "Negotiate enhanced contractual provisions at next renewal including audit rights, security requirements, breach notification, and BCP obligations",
    });
  }

  // Audit program
  if (!input.lastProgramAuditDate || getMonthsSince(input.lastProgramAuditDate) > 18) {
    gaps.push({
      standard: "OCC Bulletin 2013-29 / FFIEC IT Handbook",
      requirement: "Third-party risk management program should be subject to independent testing/audit",
      currentState: input.lastProgramAuditDate
        ? `Last program audit was ${input.lastProgramAuditDate} (${getMonthsSince(input.lastProgramAuditDate)} months ago)`
        : "No independent audit of TPRM program identified",
      severity: "medium",
      recommendedAction: "Schedule independent audit of third-party risk management program; include scope of policies, procedures, monitoring, and board reporting",
    });
  }

  return gaps;
}

function calculateVendorScore(gaps: GeneratedGap[], programGaps: string[]): number {
  let score = 100;

  for (const gap of gaps) {
    switch (gap.severity) {
      case "critical": score -= 15; break;
      case "high": score -= 10; break;
      case "medium": score -= 5; break;
      case "low": score -= 2; break;
      case "informational": score -= 1; break;
    }
  }

  // Additional deduction for program incompleteness
  score -= programGaps.length * 5;

  return Math.max(0, Math.min(100, score));
}

function getMonthsSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
}

function getMonthsUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
}

function buildVendorContext(input: VendorRiskInput, assessments: VendorAssessmentResult[], concentration: ConcentrationAnalysis): string {
  return `Generate supplemental third-party risk management analysis.

INSTITUTION: ${input.institutionName}
ASSETS: $${formatAssetSize(input.assetSize)}
VENDORS: ${input.vendors.length} total (${concentration.criticalCount} critical, ${concentration.significantCount} significant, ${concentration.limitedCount} limited)
HIGH RISK: ${concentration.highRiskCount}
TOTAL SPEND: $${concentration.totalSpend.toLocaleString()}

CONCENTRATION RISKS:
${concentration.concentrationRisks.join("\n- ")}

OVERDUE DUE DILIGENCE:
${assessments.filter((a) => a.dueDiligenceStatus !== "current").map((a) => `- ${a.vendor.vendorName} (${a.vendor.criticality}): ${a.dueDiligenceStatus}`).join("\n")}

Generate:
1. Executive summary of third-party risk posture
2. Peer comparison context (industry benchmarks for vendor management)
3. Regulatory examination focus areas for TPRM
4. Recommended program enhancements (prioritized)
5. Emerging risks in third-party management (concentration in cloud/fintech)
6. Contingency planning recommendations for critical vendor failure`;
}

function formatAssetSize(assets: number): string {
  if (assets >= 1_000_000_000) return `${(assets / 1_000_000_000).toFixed(1)}B`;
  if (assets >= 1_000_000) return `${(assets / 1_000_000).toFixed(0)}M`;
  return assets.toLocaleString();
}
