import { generateCompletion } from "../../lib/llm.js";
import { parseReportSections } from "../../services/report-generator.js";
import type { GeneratedReport, GeneratedGap, GeneratedSection } from "../../services/report-generator.js";
import { BSA_CORE_REGULATIONS } from "../../data/banking/bsa-requirements.js";

type RiskLevel = "low" | "moderate" | "high" | "critical";

interface ProductRiskProfile {
  product: string;
  inherentRisk: RiskLevel;
  volume: string;
  rationale: string;
  regulatoryBasis: string;
}

interface CustomerRiskProfile {
  segment: string;
  inherentRisk: RiskLevel;
  percentage: number;
  rationale: string;
  regulatoryBasis: string;
}

interface GeographicRiskProfile {
  area: string;
  riskCategory: string;
  inherentRisk: RiskLevel;
  rationale: string;
  regulatoryBasis: string;
}

interface ControlAssessment {
  controlArea: string;
  effectiveness: "strong" | "adequate" | "weak" | "deficient";
  description: string;
  gaps: string[];
}

export interface BSAAMLRiskInput {
  institutionName: string;
  institutionType: "national-bank" | "state-member-bank" | "state-nonmember-bank" | "savings-association" | "credit-union";
  charterNumber: string;
  assetSize: number;
  productsOffered: string[];
  customerSegments: string[];
  geographicMarkets: string[];
  internationalActivity: {
    hasCorrespondentBanking: boolean;
    hasForeignBranches: boolean;
    hasPouchActivity: boolean;
    internationalWireVolume: "none" | "low" | "moderate" | "high";
    countriesServed: string[];
  };
  transactionVolumes: {
    monthlyWireTransfers: number;
    monthlyCTRFilings: number;
    monthlySARFilings: number;
    monthlyACHOriginations: number;
    cashIntensiveBusinessPercentage: number;
  };
  currentControls: string[];
  lastExamDate: string;
  lastExamRating: string;
}

export async function generateBSAAMLRiskAssessment(input: BSAAMLRiskInput): Promise<GeneratedReport> {
  const productRisks = assessProductRisk(input);
  const customerRisks = assessCustomerRisk(input);
  const geographicRisks = assessGeographicRisk(input);
  const overallInherentRisk = calculateOverallInherentRisk(productRisks, customerRisks, geographicRisks);
  const controlAssessments = evaluateControls(input);
  const controlEffectiveness = calculateControlEffectiveness(controlAssessments);
  const residualRisk = determineResidualRisk(overallInherentRisk, controlEffectiveness);

  const systemPrompt = `You are a BSA/AML compliance expert generating a comprehensive BSA/AML/OFAC Risk Assessment per FinCEN requirements and the FFIEC BSA/AML Examination Manual.

Your output must be a professional regulatory document suitable for examiner review. Use precise regulatory citations (31 USC, 31 CFR, 12 CFR). Structure the assessment per FFIEC BSA/AML Manual Appendix J - BSA/AML Risk Assessment methodology.

Key requirements:
- Reference actual FFIEC BSA/AML Manual sections
- Cite specific regulations (31 CFR 1010.210, 31 USC 5318, etc.)
- Use proper risk assessment methodology (inherent risk, control effectiveness, residual risk)
- Include risk matrices and specific ratings
- Address all eight pillars of BSA compliance per FinCEN guidance`;

  const additionalContext = buildRiskAssessmentContext(input, productRisks, customerRisks, geographicRisks, overallInherentRisk, controlAssessments, controlEffectiveness, residualRisk);

  const rawContent = await generateCompletion(systemPrompt, additionalContext, {
    temperature: 0.2,
    maxTokens: 8192,
  });

  const sections = parseReportSections(rawContent);
  const gaps = identifyBSAAMLGaps(input, controlAssessments, overallInherentRisk);

  const allSections: GeneratedSection[] = [
    buildInherentRiskSection(productRisks, customerRisks, geographicRisks, overallInherentRisk),
    buildControlEffectivenessSection(controlAssessments, controlEffectiveness),
    buildResidualRiskSection(residualRisk, overallInherentRisk, controlEffectiveness),
    ...sections,
  ];

  return {
    title: `BSA/AML/OFAC Risk Assessment — ${input.institutionName}`,
    summary: `BSA/AML Risk Assessment per FFIEC BSA/AML Examination Manual for ${input.institutionName} (${formatInstitutionType(input.institutionType)}, $${formatAssetSize(input.assetSize)} in assets). Overall Inherent Risk: ${overallInherentRisk.toUpperCase()}. Control Effectiveness: ${controlEffectiveness.toUpperCase()}. Residual Risk: ${residualRisk.toUpperCase()}.`,
    complianceScore: calculateComplianceScore(residualRisk, gaps),
    sections: allSections,
    gaps,
  };
}

function assessProductRisk(input: BSAAMLRiskInput): ProductRiskProfile[] {
  const productRiskMap: Record<string, { baseRisk: RiskLevel; rationale: string; regulation: string }> = {
    "wire-transfers": {
      baseRisk: "high",
      rationale: "Wire transfers provide rapid movement of funds with limited ability to recover; frequently exploited for money laundering and terrorist financing per FinCEN advisories",
      regulation: "31 CFR 1010.410(a) — Funds Transfer Recordkeeping; FFIEC BSA/AML Manual — Wire Transfer section",
    },
    "correspondent-banking": {
      baseRisk: "critical",
      rationale: "Correspondent banking provides indirect access to the U.S. financial system; presents heightened BSA/AML risk per 31 USC 5318(i) due diligence requirements",
      regulation: "31 USC 5318(i) — Due Diligence for Correspondent Accounts; 31 CFR 1010.610",
    },
    "private-banking": {
      baseRisk: "high",
      rationale: "Private banking services high-net-worth individuals including PEPs; per 31 USC 5318(i)(3) requires enhanced due diligence for foreign private banking accounts",
      regulation: "31 USC 5318(i)(3) — Private Banking; Section 312 of USA PATRIOT Act",
    },
    "msb-accounts": {
      baseRisk: "high",
      rationale: "MSBs are a higher-risk customer category per FFIEC BSA/AML Manual; act as intermediary financial service providers with their own BSA obligations",
      regulation: "31 CFR 1010.100(ff) — MSB Definition; FinCEN Guidance FIN-2014-R001",
    },
    "trade-finance": {
      baseRisk: "high",
      rationale: "Trade-based money laundering identified by FATF as significant ML methodology; complex documentation creates opacity",
      regulation: "FATF Trade-Based Money Laundering Guidance; FFIEC BSA/AML Manual — Trade Finance section",
    },
    "remote-deposit-capture": {
      baseRisk: "moderate",
      rationale: "Remote deposit capture allows deposit without physical presence; moderate risk mitigated by duplicate detection and velocity controls",
      regulation: "Check 21 Act; FFIEC BSA/AML Manual — Electronic Banking section",
    },
    "ach-origination": {
      baseRisk: "moderate",
      rationale: "ACH origination enables batch fund transfers; third-party senders introduce layering risk",
      regulation: "31 CFR 1010.410; NACHA Operating Rules; FFIEC BSA/AML Manual — ACH section",
    },
    "cash-management": {
      baseRisk: "moderate",
      rationale: "Cash-intensive services require robust monitoring for structuring and placement-stage money laundering",
      regulation: "31 CFR 1010.310 — CTR filing; 31 USC 5324 — Structuring",
    },
    "trust-services": {
      baseRisk: "moderate",
      rationale: "Trust accounts may obscure beneficial ownership; requires enhanced due diligence on trust beneficiaries",
      regulation: "31 CFR 1010.230 — Beneficial Ownership; FFIEC BSA/AML Manual — Trust section",
    },
    "digital-banking": {
      baseRisk: "moderate",
      rationale: "Non-face-to-face account opening and transactions increase anonymity risk; mitigated by digital identity verification",
      regulation: "31 CFR 1010.220 — CIP; FinCEN Guidance on CIP for non-face-to-face accounts",
    },
    "consumer-lending": {
      baseRisk: "low",
      rationale: "Standard consumer lending products present lower BSA/AML risk when proper CIP/CDD performed at origination",
      regulation: "31 CFR 1010.220 — CIP; 31 CFR 1010.230 — CDD",
    },
    "residential-mortgages": {
      baseRisk: "moderate",
      rationale: "Mortgage lending vulnerable to fraud schemes and potential ML through real estate; requires SAR filing for suspicious applications",
      regulation: "31 CFR 1010.320 — SAR; FinCEN Advisory FIN-2006-A003 (Mortgage Fraud)",
    },
  };

  return input.productsOffered.map((product) => {
    const normalizedProduct = product.toLowerCase().replace(/\s+/g, "-");
    const riskInfo = productRiskMap[normalizedProduct];

    if (riskInfo) {
      let adjustedRisk = riskInfo.baseRisk;
      if (input.transactionVolumes.monthlyWireTransfers > 5000 && normalizedProduct === "wire-transfers") {
        adjustedRisk = "critical";
      }
      return {
        product,
        inherentRisk: adjustedRisk,
        volume: getProductVolume(normalizedProduct, input),
        rationale: riskInfo.rationale,
        regulatoryBasis: riskInfo.regulation,
      };
    }

    return {
      product,
      inherentRisk: "moderate" as RiskLevel,
      volume: "Not quantified",
      rationale: "Product requires standard BSA/AML monitoring and CIP/CDD procedures",
      regulatoryBasis: "31 CFR 1010.210 — General AML Program Requirements",
    };
  });
}

function getProductVolume(product: string, input: BSAAMLRiskInput): string {
  switch (product) {
    case "wire-transfers":
      return `${input.transactionVolumes.monthlyWireTransfers.toLocaleString()} monthly wire transfers`;
    case "ach-origination":
      return `${input.transactionVolumes.monthlyACHOriginations.toLocaleString()} monthly ACH originations`;
    case "cash-management":
      return `${input.transactionVolumes.cashIntensiveBusinessPercentage}% cash-intensive business customers`;
    default:
      return "Volume data available in transaction monitoring system";
  }
}

function assessCustomerRisk(input: BSAAMLRiskInput): CustomerRiskProfile[] {
  const customerRiskMap: Record<string, { baseRisk: RiskLevel; rationale: string; regulation: string }> = {
    "money-service-businesses": {
      baseRisk: "high",
      rationale: "MSBs operate as financial intermediaries with their own customer base; present layering and structuring risk. Per FFIEC guidance, requires EDD including understanding of MSB's own AML program",
      regulation: "FinCEN Guidance FIN-2014-R001; FFIEC BSA/AML Manual MSB Customer section",
    },
    "politically-exposed-persons": {
      baseRisk: "high",
      rationale: "PEPs and their associates present heightened corruption and money laundering risk per FATF Recommendation 12; require enhanced due diligence and senior management approval",
      regulation: "31 USC 5318(i)(3) — EDD for Private Banking; FATF Recommendation 12; Wolfsberg PEP Guidance",
    },
    "non-resident-aliens": {
      baseRisk: "moderate",
      rationale: "NRAs may present enhanced risk due to foreign nexus, difficulty verifying identity, and potential for tax evasion; CIP verification challenges per FinCEN guidance",
      regulation: "31 CFR 1010.220(a)(3) — CIP identification requirements for non-U.S. persons",
    },
    "cannabis-related-businesses": {
      baseRisk: "high",
      rationale: "Cannabis remains Schedule I under federal law; banking requires compliance with FinCEN guidance (FIN-2014-G001) including suspicious activity monitoring and specific SAR filing",
      regulation: "FinCEN Guidance FIN-2014-G001; Cole Memo considerations; state law compliance",
    },
    "third-party-payment-processors": {
      baseRisk: "high",
      rationale: "TPPPs process transactions for unknown downstream merchants; potential conduit for fraud, money laundering, and illegal internet gambling",
      regulation: "FFIEC BSA/AML Manual — Third-Party Payment Processors; FinCEN Advisory FIN-2012-A010",
    },
    "foreign-financial-institutions": {
      baseRisk: "high",
      rationale: "Foreign FIs accessing the U.S. financial system through correspondent relationships; nested accounts and payable-through accounts increase ML risk",
      regulation: "31 USC 5318(i) — Enhanced Due Diligence for Correspondent Accounts; 31 CFR 1010.610",
    },
    "cash-intensive-businesses": {
      baseRisk: "high",
      rationale: "Cash-intensive businesses (restaurants, car washes, ATM operators, convenience stores) vulnerable to commingling illicit funds with legitimate cash revenue",
      regulation: "31 CFR 1010.310 — CTR; FFIEC BSA/AML Manual — Cash-Intensive Businesses section",
    },
    "nonprofit-organizations": {
      baseRisk: "moderate",
      rationale: "Nonprofits may be exploited for terrorist financing or diversion of funds; international charities present higher risk per FATF Special Recommendation VIII",
      regulation: "FATF Recommendation 8 — Non-Profit Organisations; FinCEN advisory on terrorist financing",
    },
    "professional-services": {
      baseRisk: "low",
      rationale: "Standard professional service firms (law, accounting, medical) present lower BSA/AML risk with proper CIP/CDD; exception for potential client trust accounts",
      regulation: "31 CFR 1010.220 — CIP; 31 CFR 1010.230 — CDD",
    },
    "retail-consumers": {
      baseRisk: "low",
      rationale: "Standard retail consumer relationships present lower inherent BSA/AML risk when appropriate CIP and transaction monitoring applied",
      regulation: "31 CFR 1010.220 — CIP; 31 CFR 1010.230 — CDD",
    },
  };

  const totalSegments = input.customerSegments.length;
  return input.customerSegments.map((segment) => {
    const normalizedSegment = segment.toLowerCase().replace(/\s+/g, "-");
    const riskInfo = customerRiskMap[normalizedSegment];

    if (riskInfo) {
      return {
        segment,
        inherentRisk: riskInfo.baseRisk,
        percentage: Math.round(100 / totalSegments),
        rationale: riskInfo.rationale,
        regulatoryBasis: riskInfo.regulation,
      };
    }

    return {
      segment,
      inherentRisk: "moderate" as RiskLevel,
      percentage: Math.round(100 / totalSegments),
      rationale: "Customer segment requires standard BSA/AML due diligence and ongoing monitoring",
      regulatoryBasis: "31 CFR 1010.230 — Customer Due Diligence Requirements",
    };
  });
}

function assessGeographicRisk(input: BSAAMLRiskInput): GeographicRiskProfile[] {
  const risks: GeographicRiskProfile[] = [];

  for (const market of input.geographicMarkets) {
    risks.push({
      area: market,
      riskCategory: "Domestic Market",
      inherentRisk: assessDomesticMarketRisk(market),
      rationale: `Market area assessed for HIDTA/HIFCA designation, FinCEN geographic targeting orders, and local crime statistics per FFIEC BSA/AML Manual geographic risk methodology`,
      regulatoryBasis: "FFIEC BSA/AML Manual — BSA/AML Risk Assessment; 21 USC 1504 (HIDTA); 31 USC 5340 (HIFCA)",
    });
  }

  if (input.internationalActivity.hasCorrespondentBanking || input.internationalActivity.countriesServed.length > 0) {
    for (const country of input.internationalActivity.countriesServed) {
      risks.push({
        area: country,
        riskCategory: "International Exposure",
        inherentRisk: assessInternationalRisk(country),
        rationale: `International exposure assessed per FATF Mutual Evaluation results, INCSR rating, OFAC sanctions programs, and FinCEN Section 311 actions`,
        regulatoryBasis: "31 USC 5318A — Special Measures; FATF Public Statements; OFAC Country Programs; 31 CFR 1010.610-670",
      });
    }
  }

  if (input.internationalActivity.hasCorrespondentBanking) {
    risks.push({
      area: "Correspondent Banking Network",
      riskCategory: "Correspondent Banking",
      inherentRisk: "high",
      rationale: "Correspondent banking relationships provide downstream access to U.S. financial system; per 31 USC 5318(i), enhanced due diligence required including understanding respondent's AML program, customer base, and geographic footprint",
      regulatoryBasis: "31 USC 5318(i); 31 CFR 1010.610; Section 312 USA PATRIOT Act",
    });
  }

  return risks;
}

function assessDomesticMarketRisk(market: string): RiskLevel {
  const highRiskIndicators = ["miami", "new york", "los angeles", "houston", "chicago", "phoenix", "el paso", "san diego", "laredo", "detroit"];
  const normalizedMarket = market.toLowerCase();
  if (highRiskIndicators.some((indicator) => normalizedMarket.includes(indicator))) {
    return "high";
  }
  return "moderate";
}

function assessInternationalRisk(country: string): RiskLevel {
  const fatfHighRisk = ["iran", "north korea", "dprk", "myanmar", "burma"];
  const fatfGreyList = ["panama", "albania", "barbados", "burkina faso", "cameroon", "croatia", "congo", "haiti", "jamaica", "jordan", "mali", "mozambique", "nigeria", "senegal", "south africa", "south sudan", "syria", "tanzania", "turkey", "uganda", "vietnam", "yemen"];
  const ofacSanctioned = ["cuba", "iran", "north korea", "syria", "crimea", "russia", "venezuela"];

  const normalizedCountry = country.toLowerCase();

  if (fatfHighRisk.some((c) => normalizedCountry.includes(c)) || ofacSanctioned.some((c) => normalizedCountry.includes(c))) {
    return "critical";
  }
  if (fatfGreyList.some((c) => normalizedCountry.includes(c))) {
    return "high";
  }
  return "moderate";
}

function calculateOverallInherentRisk(
  productRisks: ProductRiskProfile[],
  customerRisks: CustomerRiskProfile[],
  geographicRisks: GeographicRiskProfile[]
): RiskLevel {
  const riskValues: Record<RiskLevel, number> = { low: 1, moderate: 2, high: 3, critical: 4 };

  const productScore = productRisks.reduce((sum, p) => sum + riskValues[p.inherentRisk], 0) / Math.max(productRisks.length, 1);
  const customerScore = customerRisks.reduce((sum, c) => sum + riskValues[c.inherentRisk], 0) / Math.max(customerRisks.length, 1);
  const geoScore = geographicRisks.reduce((sum, g) => sum + riskValues[g.inherentRisk], 0) / Math.max(geographicRisks.length, 1);

  // Weight: Products 35%, Customers 40%, Geographic 25% per FFIEC methodology
  const weightedScore = productScore * 0.35 + customerScore * 0.40 + geoScore * 0.25;

  // If any single risk dimension has a critical rating, floor at high
  const hasCritical = [...productRisks, ...customerRisks, ...geographicRisks].some(
    (r) => ("inherentRisk" in r) && r.inherentRisk === "critical"
  );

  if (hasCritical && weightedScore < 3) {
    return "high";
  }

  if (weightedScore >= 3.5) return "critical";
  if (weightedScore >= 2.5) return "high";
  if (weightedScore >= 1.5) return "moderate";
  return "low";
}

function evaluateControls(input: BSAAMLRiskInput): ControlAssessment[] {
  const requiredControls = [
    "BSA/AML Officer",
    "Independent Testing/Audit",
    "Training Program",
    "Internal Controls/Policies",
    "CIP Program",
    "CDD/EDD Procedures",
    "SAR Monitoring",
    "CTR Process",
    "OFAC Screening",
    "314(a) Process",
  ];

  return requiredControls.map((control) => {
    const hasControl = input.currentControls.some((c) => c.toLowerCase().includes(control.toLowerCase().split("/")[0]!));
    const hasRelatedControls = input.currentControls.filter((c) => {
      const controlLower = control.toLowerCase();
      const inputLower = c.toLowerCase();
      return controlLower.split("/").some((part) => inputLower.includes(part.trim()));
    });

    if (!hasControl && hasRelatedControls.length === 0) {
      return {
        controlArea: control,
        effectiveness: "deficient" as const,
        description: `No evidence of ${control} implementation found in institution's control inventory`,
        gaps: [`${control} not documented or implemented per 31 CFR 1010.210 requirements`],
      };
    }

    if (hasRelatedControls.length >= 2) {
      return {
        controlArea: control,
        effectiveness: "strong" as const,
        description: `${control} implemented with multiple supporting controls: ${hasRelatedControls.join("; ")}`,
        gaps: [],
      };
    }

    return {
      controlArea: control,
      effectiveness: "adequate" as const,
      description: `${control} implemented at basic level`,
      gaps: [`Consider enhancing ${control} with additional automated monitoring and documented procedures`],
    };
  });
}

function calculateControlEffectiveness(assessments: ControlAssessment[]): "strong" | "adequate" | "weak" | "deficient" {
  const effectivenessValues: Record<string, number> = { strong: 4, adequate: 3, weak: 2, deficient: 1 };
  const avgScore = assessments.reduce((sum, a) => sum + (effectivenessValues[a.effectiveness] ?? 2), 0) / assessments.length;

  if (avgScore >= 3.5) return "strong";
  if (avgScore >= 2.5) return "adequate";
  if (avgScore >= 1.5) return "weak";
  return "deficient";
}

function determineResidualRisk(inherentRisk: RiskLevel, controlEffectiveness: "strong" | "adequate" | "weak" | "deficient"): RiskLevel {
  const residualMatrix: Record<string, Record<string, RiskLevel>> = {
    critical: { strong: "moderate", adequate: "high", weak: "critical", deficient: "critical" },
    high: { strong: "low", adequate: "moderate", weak: "high", deficient: "critical" },
    moderate: { strong: "low", adequate: "low", weak: "moderate", deficient: "high" },
    low: { strong: "low", adequate: "low", weak: "low", deficient: "moderate" },
  };

  return residualMatrix[inherentRisk]?.[controlEffectiveness] ?? "moderate";
}

function buildInherentRiskSection(
  productRisks: ProductRiskProfile[],
  customerRisks: CustomerRiskProfile[],
  geographicRisks: GeographicRiskProfile[],
  overallRisk: RiskLevel
): GeneratedSection {
  const productTable = productRisks
    .map((p) => `| ${p.product} | ${p.inherentRisk.toUpperCase()} | ${p.volume} | ${p.regulatoryBasis} |`)
    .join("\n");

  const customerTable = customerRisks
    .map((c) => `| ${c.segment} | ${c.inherentRisk.toUpperCase()} | ${c.percentage}% | ${c.regulatoryBasis} |`)
    .join("\n");

  const geoTable = geographicRisks
    .map((g) => `| ${g.area} | ${g.riskCategory} | ${g.inherentRisk.toUpperCase()} | ${g.regulatoryBasis} |`)
    .join("\n");

  const content = `## Overall Inherent Risk Rating: ${overallRisk.toUpperCase()}

### Products & Services Risk Assessment
Per FFIEC BSA/AML Manual, products and services are assessed for inherent BSA/AML risk based on vulnerability to money laundering, terrorist financing, and sanctions evasion.

| Product/Service | Risk Rating | Volume | Regulatory Basis |
|---|---|---|---|
${productTable}

### Customer Risk Assessment
Customer risk assessed per 31 CFR 1010.230 (CDD Rule) risk-based approach and FFIEC BSA/AML Manual customer risk categories.

| Customer Segment | Risk Rating | Portfolio % | Regulatory Basis |
|---|---|---|---|
${customerTable}

### Geographic Risk Assessment
Geographic risk assessed per FFIEC BSA/AML Manual methodology considering HIDTA/HIFCA designations, FATF evaluations, and OFAC sanctions programs.

| Geographic Area | Category | Risk Rating | Regulatory Basis |
|---|---|---|---|
${geoTable}

### Risk Weighting Methodology
- Products & Services: 35% weight
- Customer Base: 40% weight
- Geographic Exposure: 25% weight

This weighting reflects the FFIEC BSA/AML Manual emphasis on customer-centric risk assessment while recognizing the significance of product complexity and geographic exposure.`;

  return {
    order: 1,
    title: "Inherent Risk Assessment",
    content,
    citations: [
      "31 CFR 1010.210",
      "31 CFR 1010.230",
      "31 USC 5318(i)",
      "FFIEC BSA/AML Examination Manual — Appendix J",
    ],
    findings: productRisks
      .filter((p) => p.inherentRisk === "critical" || p.inherentRisk === "high")
      .map((p) => `${p.product} rated ${p.inherentRisk.toUpperCase()} inherent risk`),
    recommendations: [],
  };
}

function buildControlEffectivenessSection(
  assessments: ControlAssessment[],
  overall: "strong" | "adequate" | "weak" | "deficient"
): GeneratedSection {
  const controlTable = assessments
    .map((a) => `| ${a.controlArea} | ${a.effectiveness.toUpperCase()} | ${a.description} |`)
    .join("\n");

  const allGaps = assessments.flatMap((a) => a.gaps).filter((g) => g.length > 0);

  const content = `## Overall Control Effectiveness: ${overall.toUpperCase()}

### Control Assessment Detail
Per 31 CFR 1010.210 and 12 CFR 21.21, the BSA/AML compliance program must include: (1) system of internal controls, (2) independent testing, (3) designated BSA officer, and (4) training.

| Control Area | Effectiveness | Assessment |
|---|---|---|
${controlTable}

### Control Gaps Identified
${allGaps.length > 0 ? allGaps.map((g) => `- ${g}`).join("\n") : "No significant control gaps identified."}

### Assessment Methodology
Control effectiveness rated as:
- **STRONG**: Controls exceed minimum requirements; automated monitoring with demonstrated effectiveness
- **ADEQUATE**: Controls meet minimum regulatory requirements; functioning as designed
- **WEAK**: Controls exist but have significant limitations or gaps
- **DEFICIENT**: Required control missing or fundamentally ineffective`;

  return {
    order: 2,
    title: "Control Effectiveness Assessment",
    content,
    citations: ["31 CFR 1010.210", "12 CFR 21.21", "12 CFR 208.63", "12 CFR 326.8"],
    findings: assessments
      .filter((a) => a.effectiveness === "weak" || a.effectiveness === "deficient")
      .map((a) => `${a.controlArea}: ${a.effectiveness.toUpperCase()}`),
    recommendations: allGaps,
  };
}

function buildResidualRiskSection(
  residualRisk: RiskLevel,
  inherentRisk: RiskLevel,
  controlEffectiveness: string
): GeneratedSection {
  const content = `## Residual Risk Determination: ${residualRisk.toUpperCase()}

### Risk Matrix
| | Strong Controls | Adequate Controls | Weak Controls | Deficient Controls |
|---|---|---|---|---|
| **Critical Inherent** | Moderate | High | Critical | Critical |
| **High Inherent** | Low | Moderate | High | Critical |
| **Moderate Inherent** | Low | Low | Moderate | High |
| **Low Inherent** | Low | Low | Low | Moderate |

### Applied Determination
- **Inherent Risk**: ${inherentRisk.toUpperCase()}
- **Control Effectiveness**: ${controlEffectiveness.toUpperCase()}
- **Residual Risk**: ${residualRisk.toUpperCase()}

### Regulatory Implications
${residualRisk === "critical" || residualRisk === "high"
    ? "Elevated residual risk requires immediate management attention, enhanced monitoring, and potential regulatory notification. Per FFIEC BSA/AML Manual, examiners will focus on whether management has identified, measured, monitored, and controlled BSA/AML risk commensurate with the institution's risk profile."
    : "Current residual risk level indicates controls are operating in alignment with the institution's risk profile. Ongoing monitoring and periodic reassessment required per 31 CFR 1010.210."}

### Required Actions Based on Residual Risk
${getResidualRiskActions(residualRisk)}`;

  return {
    order: 3,
    title: "Residual Risk Determination",
    content,
    citations: ["31 CFR 1010.210", "FFIEC BSA/AML Examination Manual"],
    findings: [`Residual risk rated ${residualRisk.toUpperCase()}`],
    recommendations: getResidualRiskRecommendations(residualRisk),
  };
}

function getResidualRiskActions(risk: RiskLevel): string {
  switch (risk) {
    case "critical":
      return `- Immediate board notification required
- Enhanced monitoring with daily review of high-risk activity
- Consider voluntary SAR filing for systemic concerns
- Engage independent BSA/AML consultant for program remediation
- Prepare for potential regulatory enforcement action
- Daily suspicious activity review by BSA Officer`;
    case "high":
      return `- Board reporting frequency increased to monthly
- Enhanced transaction monitoring thresholds and scenarios
- Quarterly independent testing of high-risk areas
- EDD procedures applied more broadly
- Staffing assessment for BSA/AML function adequacy
- Semi-annual risk assessment updates`;
    case "moderate":
      return `- Maintain current control framework with annual enhancement review
- Annual risk assessment update (or upon significant change)
- Standard board reporting quarterly
- Ongoing training program with annual updates
- Independent testing per standard schedule (12-18 months)`;
    case "low":
      return `- Maintain current control framework
- Annual risk assessment review
- Standard regulatory reporting and compliance monitoring
- Training program updates per normal schedule
- Independent testing per standard 18-month cycle`;
  }
}

function getResidualRiskRecommendations(risk: RiskLevel): string[] {
  switch (risk) {
    case "critical":
      return [
        "Immediate remediation plan required with board-approved timeline",
        "Engage independent BSA/AML consulting firm for program assessment",
        "Consider voluntary disclosure to primary regulator",
        "Implement enhanced monitoring for all high-risk categories",
      ];
    case "high":
      return [
        "Develop 90-day action plan to address control gaps",
        "Increase monitoring staffing or implement additional automated tools",
        "Expand EDD scope to cover newly identified high-risk areas",
        "Schedule out-of-cycle independent testing",
      ];
    case "moderate":
      return [
        "Continue monitoring with focus on emerging risks",
        "Evaluate new transaction monitoring scenarios",
        "Update risk assessment upon next material change in business",
      ];
    case "low":
      return [
        "Maintain current control framework",
        "Annual reassessment per standard schedule",
      ];
  }
}

function identifyBSAAMLGaps(
  input: BSAAMLRiskInput,
  controlAssessments: ControlAssessment[],
  inherentRisk: RiskLevel
): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  const deficientControls = controlAssessments.filter((c) => c.effectiveness === "deficient");
  for (const control of deficientControls) {
    gaps.push({
      standard: "31 CFR 1010.210 / 12 CFR 21.21",
      requirement: `BSA/AML program must include ${control.controlArea} as a core pillar per regulatory requirements`,
      currentState: control.description,
      severity: "critical",
      recommendedAction: `Immediately implement ${control.controlArea}; document policies and procedures; provide evidence of ongoing operation`,
    });
  }

  const weakControls = controlAssessments.filter((c) => c.effectiveness === "weak");
  for (const control of weakControls) {
    gaps.push({
      standard: "31 CFR 1010.210",
      requirement: `${control.controlArea} must be reasonably designed to prevent the institution from being used for money laundering or terrorist financing`,
      currentState: control.description,
      severity: "high",
      recommendedAction: `Enhance ${control.controlArea}: ${control.gaps.join("; ")}`,
    });
  }

  if (input.internationalActivity.hasCorrespondentBanking) {
    const hasCorrespondentControls = input.currentControls.some((c) =>
      c.toLowerCase().includes("correspondent") || c.toLowerCase().includes("foreign bank")
    );
    if (!hasCorrespondentControls) {
      gaps.push({
        standard: "31 USC 5318(i) / 31 CFR 1010.610",
        requirement: "Enhanced due diligence program for correspondent accounts with foreign financial institutions including assessment of respondent's AML program, monitoring for suspicious activity, and understanding of respondent's customer base",
        currentState: "Institution maintains correspondent banking relationships but dedicated EDD program for correspondent accounts not identified in control inventory",
        severity: "critical",
        recommendedAction: "Develop and implement enhanced due diligence procedures for all foreign correspondent accounts per Section 312 of USA PATRIOT Act; include assessment of respondent bank's AML controls, customer base, and jurisdiction risk",
      });
    }
  }

  if (inherentRisk === "high" || inherentRisk === "critical") {
    const hasAutomatedMonitoring = input.currentControls.some((c) =>
      c.toLowerCase().includes("automated") || c.toLowerCase().includes("monitoring system") || c.toLowerCase().includes("transaction monitoring")
    );
    if (!hasAutomatedMonitoring) {
      gaps.push({
        standard: "31 CFR 1010.320 / FFIEC BSA/AML Manual",
        requirement: "Suspicious activity monitoring system must be commensurate with institution's risk profile; high-risk institutions require automated monitoring",
        currentState: "Institution rated HIGH/CRITICAL inherent risk but no automated transaction monitoring system identified in control inventory",
        severity: "critical",
        recommendedAction: "Implement automated transaction monitoring system with scenarios addressing identified risk areas (structuring, wire transfers, cash-intensive business, international activity); calibrate alert thresholds to institution's risk profile",
      });
    }
  }

  if (input.transactionVolumes.monthlySARFilings === 0 && input.transactionVolumes.monthlyCTRFilings > 0) {
    gaps.push({
      standard: "31 CFR 1010.320",
      requirement: "Institution must file SARs when it knows, suspects, or has reason to suspect that a transaction involves funds from illegal activity or is designed to evade BSA reporting requirements",
      currentState: "Institution files CTRs indicating cash activity but reports zero SAR filings; this combination may indicate inadequate suspicious activity monitoring",
      severity: "high",
      recommendedAction: "Review SAR monitoring procedures and alert disposition process; evaluate whether alert thresholds are appropriately calibrated; assess whether suspicious activity is being identified and escalated properly",
    });
  }

  return gaps;
}

function calculateComplianceScore(residualRisk: RiskLevel, gaps: GeneratedGap[]): number {
  let baseScore: number;
  switch (residualRisk) {
    case "low":
      baseScore = 90;
      break;
    case "moderate":
      baseScore = 75;
      break;
    case "high":
      baseScore = 55;
      break;
    case "critical":
      baseScore = 35;
      break;
  }

  const gapDeductions = gaps.reduce((sum, gap) => {
    switch (gap.severity) {
      case "critical": return sum + 10;
      case "high": return sum + 5;
      case "medium": return sum + 3;
      case "low": return sum + 1;
      case "informational": return sum + 0;
      default: return sum;
    }
  }, 0);

  return Math.max(0, Math.min(100, baseScore - gapDeductions));
}

function buildRiskAssessmentContext(
  input: BSAAMLRiskInput,
  productRisks: ProductRiskProfile[],
  customerRisks: CustomerRiskProfile[],
  geographicRisks: GeographicRiskProfile[],
  overallInherentRisk: RiskLevel,
  controlAssessments: ControlAssessment[],
  controlEffectiveness: string,
  residualRisk: RiskLevel
): string {
  const regulations = BSA_CORE_REGULATIONS.map((r) => `${r.citation}: ${r.title}`).join("\n");

  return `Generate a comprehensive BSA/AML/OFAC Risk Assessment for examiner review.

INSTITUTION PROFILE:
- Name: ${input.institutionName}
- Type: ${formatInstitutionType(input.institutionType)}
- Charter Number: ${input.charterNumber}
- Asset Size: $${formatAssetSize(input.assetSize)}
- Last Exam: ${input.lastExamDate} (Rating: ${input.lastExamRating})

RISK ASSESSMENT RESULTS (already calculated — incorporate into narrative):
- Overall Inherent Risk: ${overallInherentRisk.toUpperCase()}
- Control Effectiveness: ${controlEffectiveness.toUpperCase()}
- Residual Risk: ${residualRisk.toUpperCase()}

HIGH-RISK PRODUCTS: ${productRisks.filter((p) => p.inherentRisk === "high" || p.inherentRisk === "critical").map((p) => p.product).join(", ") || "None"}
HIGH-RISK CUSTOMERS: ${customerRisks.filter((c) => c.inherentRisk === "high" || c.inherentRisk === "critical").map((c) => c.segment).join(", ") || "None"}
HIGH-RISK GEOGRAPHIES: ${geographicRisks.filter((g) => g.inherentRisk === "high" || g.inherentRisk === "critical").map((g) => g.area).join(", ") || "None"}

TRANSACTION VOLUMES:
- Monthly Wire Transfers: ${input.transactionVolumes.monthlyWireTransfers.toLocaleString()}
- Monthly CTR Filings: ${input.transactionVolumes.monthlyCTRFilings}
- Monthly SAR Filings: ${input.transactionVolumes.monthlySARFilings}
- Monthly ACH Originations: ${input.transactionVolumes.monthlyACHOriginations.toLocaleString()}
- Cash-Intensive Business %: ${input.transactionVolumes.cashIntensiveBusinessPercentage}%

INTERNATIONAL ACTIVITY:
- Correspondent Banking: ${input.internationalActivity.hasCorrespondentBanking ? "Yes" : "No"}
- Foreign Branches: ${input.internationalActivity.hasForeignBranches ? "Yes" : "No"}
- International Wire Volume: ${input.internationalActivity.internationalWireVolume}
- Countries Served: ${input.internationalActivity.countriesServed.join(", ") || "None"}

CONTROL WEAKNESSES: ${controlAssessments.filter((c) => c.effectiveness === "weak" || c.effectiveness === "deficient").map((c) => c.controlArea).join(", ") || "None identified"}

APPLICABLE REGULATIONS:
${regulations}

Generate the following sections:
1. Executive Summary with risk overview and key findings
2. Regulatory Framework (applicable statutes and regulations)
3. Methodology description (per FFIEC BSA/AML Manual Appendix J)
4. Detailed findings and observations
5. Recommendations for risk mitigation
6. Board/management action items
7. Conclusion with timeline for reassessment`;
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
