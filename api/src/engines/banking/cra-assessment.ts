import { generateCompletion } from "../../lib/llm.js";
import { parseReportSections } from "../../services/report-generator.js";
import type { GeneratedReport, GeneratedGap, GeneratedSection } from "../../services/report-generator.js";
import {
  CRA_LENDING_TEST_CRITERIA,
  CRA_INVESTMENT_TEST_CRITERIA,
  CRA_SERVICE_TEST_CRITERIA,
  CRA_INCOME_THRESHOLDS,
  TRACT_INCOME_THRESHOLDS,
} from "../../data/banking/cra-demographics.js";
import type {
  AssessmentAreaDemographics,
  LendingDistribution,
  InvestmentTestData,
  ServiceTestData,
  CommunityDevelopmentActivity,
  CRARating,
} from "../../data/banking/cra-demographics.js";

export interface CRAAssessmentInput {
  institutionName: string;
  institutionType: "national-bank" | "state-member-bank" | "state-nonmember-bank" | "savings-association";
  assetSize: number;
  examType: "large-bank" | "intermediate-small-bank" | "small-bank";
  assessmentPeriod: { start: string; end: string };
  assessmentAreas: AssessmentAreaDemographics[];
  lendingData: LendingDistribution;
  investmentData: InvestmentTestData;
  serviceData: ServiceTestData;
  communityDevelopmentActivities: CommunityDevelopmentActivity[];
  performanceContext: {
    economicConditions: string;
    lendingOpportunities: string;
    competitiveEnvironment: string;
    institutionCapacity: string;
    demographicChanges: string;
    priorCRARating: CRARating;
    priorExamDate: string;
  };
}

interface TestRating {
  test: string;
  rating: CRARating;
  rationale: string;
  strengths: string[];
  weaknesses: string[];
}

export async function generateCRAAssessmentReport(input: CRAAssessmentInput): Promise<GeneratedReport> {
  const lendingTestRating = assessLendingTest(input);
  const investmentTestRating = assessInvestmentTest(input);
  const serviceTestRating = assessServiceTest(input);
  const overallRating = determineOverallRating(lendingTestRating, investmentTestRating, serviceTestRating);

  const systemPrompt = `You are a CRA compliance expert generating a Community Reinvestment Act Self-Assessment per 12 CFR 25 (OCC), 12 CFR 228 (FRB), or 12 CFR 345 (FDIC).

Your output must be a professional regulatory document suitable for examination preparation. Include:
- Actual CRA performance criteria and evaluation methodology
- Data tables with lending, investment, and service test metrics
- Proper regulatory citations (12 CFR 25/228/345)
- Performance context analysis
- Assessment area delineation compliance
- Community development activities documentation

Write in formal regulatory assessment language appropriate for examiner review.`;

  const additionalContext = buildCRAContext(input, lendingTestRating, investmentTestRating, serviceTestRating, overallRating);

  const rawContent = await generateCompletion(systemPrompt, additionalContext, {
    temperature: 0.2,
    maxTokens: 8192,
  });

  const llmSections = parseReportSections(rawContent);
  const gaps = identifyCRAGaps(input, lendingTestRating, investmentTestRating, serviceTestRating);

  const sections: GeneratedSection[] = [
    buildAssessmentAreaSection(input),
    buildLendingTestSection(input, lendingTestRating),
    buildInvestmentTestSection(input, investmentTestRating),
    buildServiceTestSection(input, serviceTestRating),
    buildCommunityDevelopmentSection(input),
    buildPerformanceContextSection(input),
    buildOverallRatingSection(overallRating, lendingTestRating, investmentTestRating, serviceTestRating),
    ...llmSections,
  ];

  return {
    title: `CRA Self-Assessment — ${input.institutionName} — ${input.assessmentPeriod.start} to ${input.assessmentPeriod.end}`,
    summary: `CRA Self-Assessment per 12 CFR ${getRegPart(input.institutionType)} for ${input.institutionName} ($${formatAssetSize(input.assetSize)} in assets, ${input.examType} examination). Assessment Period: ${input.assessmentPeriod.start} through ${input.assessmentPeriod.end}. Overall Rating: ${overallRating.toUpperCase()}. Lending Test: ${lendingTestRating.rating.toUpperCase()}. Investment Test: ${investmentTestRating.rating.toUpperCase()}. Service Test: ${serviceTestRating.rating.toUpperCase()}.`,
    complianceScore: calculateCRAScore(overallRating),
    sections,
    gaps,
  };
}

function assessLendingTest(input: CRAAssessmentInput): TestRating {
  const geo = input.lendingData.geographicDistribution;
  const borrower = input.lendingData.borrowerDistribution;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Geographic distribution assessment
  const lmiTractLendingPct = geo.lowIncomeTracts.percentageOfTotal + geo.moderateIncomeTracts.percentageOfTotal;
  const lmiTractDemographicPct = geo.lowIncomeTracts.demographicPercentage + geo.moderateIncomeTracts.demographicPercentage;
  const geoPenetrationRatio = lmiTractDemographicPct > 0 ? lmiTractLendingPct / lmiTractDemographicPct : 0;

  if (geoPenetrationRatio >= 1.1) {
    strengths.push(`Geographic distribution of loans in LMI tracts (${lmiTractLendingPct.toFixed(1)}%) exceeds the percentage of assessment area tracts designated as LMI (${lmiTractDemographicPct.toFixed(1)}%)`);
  } else if (geoPenetrationRatio >= 0.8) {
    strengths.push(`Geographic distribution in LMI tracts (${lmiTractLendingPct.toFixed(1)}%) reasonably reflects tract demographics (${lmiTractDemographicPct.toFixed(1)}%)`);
  } else {
    weaknesses.push(`Geographic distribution in LMI tracts (${lmiTractLendingPct.toFixed(1)}%) is below tract demographics (${lmiTractDemographicPct.toFixed(1)}%); penetration ratio: ${geoPenetrationRatio.toFixed(2)}`);
  }

  // Borrower distribution assessment
  const lmiBorrowerLendingPct = borrower.lowIncomeBorrowers.percentageOfTotal + borrower.moderateIncomeBorrowers.percentageOfTotal;
  const lmiBorrowerDemographicPct = borrower.lowIncomeBorrowers.demographicPercentage + borrower.moderateIncomeBorrowers.demographicPercentage;
  const borrowerPenetrationRatio = lmiBorrowerDemographicPct > 0 ? lmiBorrowerLendingPct / lmiBorrowerDemographicPct : 0;

  if (borrowerPenetrationRatio >= 1.1) {
    strengths.push(`Borrower distribution to LMI borrowers (${lmiBorrowerLendingPct.toFixed(1)}%) exceeds LMI family representation (${lmiBorrowerDemographicPct.toFixed(1)}%)`);
  } else if (borrowerPenetrationRatio >= 0.8) {
    strengths.push(`Borrower distribution to LMI borrowers (${lmiBorrowerLendingPct.toFixed(1)}%) reasonably reflects LMI family representation (${lmiBorrowerDemographicPct.toFixed(1)}%)`);
  } else {
    weaknesses.push(`Borrower distribution to LMI borrowers (${lmiBorrowerLendingPct.toFixed(1)}%) is below LMI family representation (${lmiBorrowerDemographicPct.toFixed(1)}%); penetration ratio: ${borrowerPenetrationRatio.toFixed(2)}`);
  }

  // Community development lending
  const cdLoans = input.communityDevelopmentActivities.filter((a) => a.category === "loan");
  if (cdLoans.length > 0) {
    const cdLoanTotal = cdLoans.reduce((sum, l) => sum + l.amount, 0);
    strengths.push(`Community development lending totals $${cdLoanTotal.toLocaleString()} across ${cdLoans.length} loan(s)`);
  }

  // Innovative/flexible lending
  const innovativeActivities = input.communityDevelopmentActivities.filter((a) => a.innovativeFlexible);
  if (innovativeActivities.length > 0) {
    strengths.push(`${innovativeActivities.length} innovative or flexible lending practice(s) identified`);
  }

  // Determine rating
  let rating: CRARating;
  if (geoPenetrationRatio >= 1.1 && borrowerPenetrationRatio >= 1.1 && cdLoans.length > 0) {
    rating = "outstanding";
  } else if (geoPenetrationRatio >= 0.8 && borrowerPenetrationRatio >= 0.8) {
    rating = "satisfactory";
  } else if (geoPenetrationRatio >= 0.5 || borrowerPenetrationRatio >= 0.5) {
    rating = "needs-to-improve";
  } else {
    rating = "substantial-noncompliance";
  }

  return {
    test: "Lending Test",
    rating,
    rationale: `Based on geographic distribution (penetration ratio: ${geoPenetrationRatio.toFixed(2)}), borrower distribution (penetration ratio: ${borrowerPenetrationRatio.toFixed(2)}), community development lending (${cdLoans.length} loans), and ${innovativeActivities.length} innovative/flexible practices`,
    strengths,
    weaknesses,
  };
}

function assessInvestmentTest(input: CRAAssessmentInput): TestRating {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const investmentRatio = input.assetSize > 0 ? input.investmentData.totalCurrentPeriod / input.assetSize : 0;
  const totalInvestments = input.investmentData.qualifiedInvestments.length;
  const innovativeInvestments = input.investmentData.qualifiedInvestments.filter((i) => i.innovative);
  const responsiveInvestments = input.investmentData.qualifiedInvestments.filter((i) => i.responsive);

  if (investmentRatio >= 0.01) {
    strengths.push(`Qualified investments represent ${(investmentRatio * 100).toFixed(2)}% of assets ($${input.investmentData.totalCurrentPeriod.toLocaleString()})`);
  } else if (investmentRatio >= 0.005) {
    strengths.push(`Qualified investment level is adequate at ${(investmentRatio * 100).toFixed(3)}% of assets`);
  } else {
    weaknesses.push(`Qualified investments at ${(investmentRatio * 100).toFixed(3)}% of assets may be below expectations for institution of this size`);
  }

  if (innovativeInvestments.length > 0) {
    strengths.push(`${innovativeInvestments.length} investment(s) demonstrate innovation or complexity`);
  }

  if (responsiveInvestments.length > 0) {
    strengths.push(`${responsiveInvestments.length} investment(s) demonstrate responsiveness to community development needs`);
  }

  if (totalInvestments === 0) {
    weaknesses.push("No qualified investments identified during assessment period");
  }

  let rating: CRARating;
  if (investmentRatio >= 0.01 && innovativeInvestments.length > 0 && responsiveInvestments.length > 0) {
    rating = "outstanding";
  } else if (investmentRatio >= 0.003 || totalInvestments >= 3) {
    rating = "satisfactory";
  } else if (totalInvestments > 0) {
    rating = "needs-to-improve";
  } else {
    rating = "substantial-noncompliance";
  }

  return {
    test: "Investment Test",
    rating,
    rationale: `Based on investment volume ($${input.investmentData.totalCurrentPeriod.toLocaleString()}, ${(investmentRatio * 100).toFixed(3)}% of assets), ${totalInvestments} qualified investments, ${innovativeInvestments.length} innovative, ${responsiveInvestments.length} responsive to needs`,
    strengths,
    weaknesses,
  };
}

function assessServiceTest(input: CRAAssessmentInput): TestRating {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const branchDist = input.serviceData.branchDistribution;
  const lmiBranchPct = branchDist.lowIncomeTracts.percentageOfTotal + branchDist.moderateIncomeTracts.percentageOfTotal;
  const lmiTractPct = branchDist.lowIncomeTracts.tractPercentage + branchDist.moderateIncomeTracts.tractPercentage;
  const branchPenetrationRatio = lmiTractPct > 0 ? lmiBranchPct / lmiTractPct : 0;

  if (branchPenetrationRatio >= 1.0) {
    strengths.push(`Branch distribution in LMI tracts (${lmiBranchPct.toFixed(1)}%) meets or exceeds LMI tract representation (${lmiTractPct.toFixed(1)}%)`);
  } else if (branchPenetrationRatio >= 0.7) {
    strengths.push(`Branch distribution in LMI tracts (${lmiBranchPct.toFixed(1)}%) reasonably reflects LMI geography (${lmiTractPct.toFixed(1)}%)`);
  } else {
    weaknesses.push(`Branch distribution in LMI tracts (${lmiBranchPct.toFixed(1)}%) is below LMI tract representation (${lmiTractPct.toFixed(1)}%)`);
  }

  // Branch openings/closings in LMI areas
  const lmiBranchChanges = input.serviceData.branchOpeningsClosings.filter((b) =>
    b.tractIncomeLevel === "low-income" || b.tractIncomeLevel === "moderate-income"
  );
  const lmiClosures = lmiBranchChanges.filter((b) => b.action === "closed");
  const lmiOpenings = lmiBranchChanges.filter((b) => b.action === "opened");

  if (lmiOpenings.length > 0) {
    strengths.push(`${lmiOpenings.length} branch opening(s) in LMI geographies during assessment period`);
  }
  if (lmiClosures.length > 0) {
    weaknesses.push(`${lmiClosures.length} branch closure(s) in LMI geographies during assessment period`);
  }

  // Community development services
  const cdServices = input.serviceData.communityDevelopmentServices;
  if (cdServices.length > 0) {
    const totalHours = cdServices.reduce((sum, s) => sum + s.hoursContributed, 0);
    strengths.push(`${cdServices.length} community development services provided (${totalHours.toLocaleString()} total hours)`);
  }

  // Alternative delivery systems
  const lmiAlternatives = input.serviceData.alternativeDeliverySystems.filter((a) => a.servesLMI);
  if (lmiAlternatives.length > 0) {
    strengths.push(`${lmiAlternatives.length} alternative delivery system(s) specifically serving LMI geographies/individuals`);
  }

  let rating: CRARating;
  if (branchPenetrationRatio >= 1.0 && cdServices.length > 5 && lmiClosures.length === 0) {
    rating = "outstanding";
  } else if (branchPenetrationRatio >= 0.7 && cdServices.length > 0) {
    rating = "satisfactory";
  } else if (branchPenetrationRatio >= 0.4) {
    rating = "needs-to-improve";
  } else {
    rating = "substantial-noncompliance";
  }

  return {
    test: "Service Test",
    rating,
    rationale: `Based on branch distribution (LMI penetration: ${branchPenetrationRatio.toFixed(2)}), ${lmiOpenings.length} LMI openings / ${lmiClosures.length} LMI closures, ${cdServices.length} community development services, and ${lmiAlternatives.length} alternative delivery systems serving LMI`,
    strengths,
    weaknesses,
  };
}

function determineOverallRating(lending: TestRating, investment: TestRating, service: TestRating): CRARating {
  const ratingValues: Record<CRARating, number> = {
    "outstanding": 4,
    "satisfactory": 3,
    "needs-to-improve": 2,
    "substantial-noncompliance": 1,
  };

  // Per 12 CFR 25.28/228.28/345.28, lending test is weighted most heavily
  const weightedScore =
    ratingValues[lending.rating] * CRA_LENDING_TEST_CRITERIA.weight +
    ratingValues[investment.rating] * CRA_INVESTMENT_TEST_CRITERIA.weight +
    ratingValues[service.rating] * CRA_SERVICE_TEST_CRITERIA.weight;

  // Cannot receive overall Outstanding without at least Satisfactory on all tests
  // Cannot receive overall Satisfactory with Substantial Noncompliance on any test
  if (lending.rating === "substantial-noncompliance" || investment.rating === "substantial-noncompliance" || service.rating === "substantial-noncompliance") {
    return weightedScore >= 2.5 ? "needs-to-improve" : "substantial-noncompliance";
  }

  if (weightedScore >= 3.5) return "outstanding";
  if (weightedScore >= 2.5) return "satisfactory";
  if (weightedScore >= 1.5) return "needs-to-improve";
  return "substantial-noncompliance";
}

function buildAssessmentAreaSection(input: CRAAssessmentInput): GeneratedSection {
  const areas = input.assessmentAreas.map((area) => {
    return `### ${area.msaName} (MSA Code: ${area.msaCode})
**State:** ${area.stateName}
**Total Population:** ${area.totalPopulation.toLocaleString()}
**Median Family Income:** $${area.medianFamilyIncome.toLocaleString()}
**Total Census Tracts:** ${area.totalCensusTracts}

| Income Level | Tracts | % of Total |
|---|---|---|
| Low-Income (<50% MFI) | ${area.censusTractsByIncome.lowIncome} | ${((area.censusTractsByIncome.lowIncome / area.totalCensusTracts) * 100).toFixed(1)}% |
| Moderate-Income (50-79% MFI) | ${area.censusTractsByIncome.moderateIncome} | ${((area.censusTractsByIncome.moderateIncome / area.totalCensusTracts) * 100).toFixed(1)}% |
| Middle-Income (80-119% MFI) | ${area.censusTractsByIncome.middleIncome} | ${((area.censusTractsByIncome.middleIncome / area.totalCensusTracts) * 100).toFixed(1)}% |
| Upper-Income (>=120% MFI) | ${area.censusTractsByIncome.upperIncome} | ${((area.censusTractsByIncome.upperIncome / area.totalCensusTracts) * 100).toFixed(1)}% |

**Housing:** ${area.housingCharacteristics.ownerOccupiedPercentage}% owner-occupied; Median home value: $${area.housingCharacteristics.medianHomeValue.toLocaleString()}
**Economic Indicators:** Unemployment: ${area.economicIndicators.unemploymentRate}%; Poverty rate: ${area.economicIndicators.povertyRate}%
**Competition:** ${area.competitionData.totalDepositoryInstitutions} depository institutions; ${area.competitionData.totalBranches} total branches; HHI: ${area.competitionData.herfindahlIndex}; Market share rank: #${area.competitionData.marketShareRank}`;
  });

  return {
    order: 1,
    title: "Assessment Area Delineation",
    content: `## Assessment Area Delineation
Per 12 CFR ${getRegPart(input.institutionType)}.41, the institution's assessment area(s) must:
- Consist of one or more MSAs/MDs or contiguous political subdivisions
- Include geographies where the institution has its main office, branches, and deposit-taking ATMs
- Not arbitrarily exclude low- or moderate-income geographies
- Not extend substantially beyond a CBSA boundary or state boundary unless the area is a multistate MSA

### Income Level Definitions (per 12 CFR ${getRegPart(input.institutionType)}.12(n))
- **Low-Income:** ${CRA_INCOME_THRESHOLDS.lowIncome.description}
- **Moderate-Income:** ${CRA_INCOME_THRESHOLDS.moderateIncome.description}
- **Middle-Income:** ${CRA_INCOME_THRESHOLDS.middleIncome.description}
- **Upper-Income:** ${CRA_INCOME_THRESHOLDS.upperIncome.description}

### Census Tract Classification (per 12 CFR ${getRegPart(input.institutionType)}.12(n))
- **Low-Income Tract:** ${TRACT_INCOME_THRESHOLDS.lowIncome.description}
- **Moderate-Income Tract:** ${TRACT_INCOME_THRESHOLDS.moderateIncome.description}
- **Middle-Income Tract:** ${TRACT_INCOME_THRESHOLDS.middleIncome.description}
- **Upper-Income Tract:** ${TRACT_INCOME_THRESHOLDS.upperIncome.description}

${areas.join("\n\n")}`,
    citations: [
      `12 CFR ${getRegPart(input.institutionType)}.41`,
      `12 CFR ${getRegPart(input.institutionType)}.12(n)`,
    ],
    findings: [],
    recommendations: [],
  };
}

function buildLendingTestSection(input: CRAAssessmentInput, rating: TestRating): GeneratedSection {
  const geo = input.lendingData.geographicDistribution;
  const borrower = input.lendingData.borrowerDistribution;
  const loans = input.lendingData.loanTypes;

  return {
    order: 2,
    title: "Lending Test",
    content: `## Lending Test — Rating: ${rating.rating.toUpperCase()}
**Regulatory Basis:** 12 CFR ${getRegPart(input.institutionType)}.22
**Weight:** ${(CRA_LENDING_TEST_CRITERIA.weight * 100).toFixed(0)}% of overall rating

### Evaluation Criteria
${CRA_LENDING_TEST_CRITERIA.factors.map((f) => `- ${f}`).join("\n")}

### Geographic Distribution of Lending
| Census Tract Income Level | % of Loans | % of Tracts | Penetration Ratio |
|---|---|---|---|
| Low-Income | ${geo.lowIncomeTracts.percentageOfTotal.toFixed(1)}% | ${geo.lowIncomeTracts.demographicPercentage.toFixed(1)}% | ${geo.lowIncomeTracts.penetrationRatio.toFixed(2)} |
| Moderate-Income | ${geo.moderateIncomeTracts.percentageOfTotal.toFixed(1)}% | ${geo.moderateIncomeTracts.demographicPercentage.toFixed(1)}% | ${geo.moderateIncomeTracts.penetrationRatio.toFixed(2)} |
| Middle-Income | ${geo.middleIncomeTracts.percentageOfTotal.toFixed(1)}% | ${geo.middleIncomeTracts.demographicPercentage.toFixed(1)}% | ${geo.middleIncomeTracts.penetrationRatio.toFixed(2)} |
| Upper-Income | ${geo.upperIncomeTracts.percentageOfTotal.toFixed(1)}% | ${geo.upperIncomeTracts.demographicPercentage.toFixed(1)}% | ${geo.upperIncomeTracts.penetrationRatio.toFixed(2)} |

### Borrower Distribution by Income Level
| Borrower Income Level | % of Loans | % of Families | Penetration Ratio |
|---|---|---|---|
| Low-Income (<50% MFI) | ${borrower.lowIncomeBorrowers.percentageOfTotal.toFixed(1)}% | ${borrower.lowIncomeBorrowers.demographicPercentage.toFixed(1)}% | ${borrower.lowIncomeBorrowers.penetrationRatio.toFixed(2)} |
| Moderate-Income (50-79% MFI) | ${borrower.moderateIncomeBorrowers.percentageOfTotal.toFixed(1)}% | ${borrower.moderateIncomeBorrowers.demographicPercentage.toFixed(1)}% | ${borrower.moderateIncomeBorrowers.penetrationRatio.toFixed(2)} |
| Middle-Income (80-119% MFI) | ${borrower.middleIncomeBorrowers.percentageOfTotal.toFixed(1)}% | ${borrower.middleIncomeBorrowers.demographicPercentage.toFixed(1)}% | ${borrower.middleIncomeBorrowers.penetrationRatio.toFixed(2)} |
| Upper-Income (>=120% MFI) | ${borrower.upperIncomeBorrowers.percentageOfTotal.toFixed(1)}% | ${borrower.upperIncomeBorrowers.demographicPercentage.toFixed(1)}% | ${borrower.upperIncomeBorrowers.penetrationRatio.toFixed(2)} |

### Loan Product Breakdown
| Product | Originations | Dollar Volume | Avg Loan Size | % Inside AA |
|---|---|---|---|---|
| Home Mortgage | ${loans.homeMortgage.totalOriginations.toLocaleString()} | $${loans.homeMortgage.totalDollars.toLocaleString()} | $${loans.homeMortgage.averageLoanSize.toLocaleString()} | ${loans.homeMortgage.percentInsideAssessmentArea}% |
| Small Business | ${loans.smallBusiness.totalOriginations.toLocaleString()} | $${loans.smallBusiness.totalDollars.toLocaleString()} | $${loans.smallBusiness.averageLoanSize.toLocaleString()} | ${loans.smallBusiness.percentInsideAssessmentArea}% |
| Small Farm | ${loans.smallFarm.totalOriginations.toLocaleString()} | $${loans.smallFarm.totalDollars.toLocaleString()} | $${loans.smallFarm.averageLoanSize.toLocaleString()} | ${loans.smallFarm.percentInsideAssessmentArea}% |
| Consumer | ${loans.consumerLoans.totalOriginations.toLocaleString()} | $${loans.consumerLoans.totalDollars.toLocaleString()} | $${loans.consumerLoans.averageLoanSize.toLocaleString()} | ${loans.consumerLoans.percentInsideAssessmentArea}% |

### Strengths
${rating.strengths.map((s) => `- ${s}`).join("\n")}

### Weaknesses
${rating.weaknesses.length > 0 ? rating.weaknesses.map((w) => `- ${w}`).join("\n") : "- No significant weaknesses identified"}

### Rationale
${rating.rationale}`,
    citations: [`12 CFR ${getRegPart(input.institutionType)}.22`],
    findings: rating.weaknesses,
    recommendations: rating.weaknesses.map((w) => `Address: ${w}`),
  };
}

function buildInvestmentTestSection(input: CRAAssessmentInput, rating: TestRating): GeneratedSection {
  const investments = input.investmentData;

  const investmentTable = investments.qualifiedInvestments.map((inv) =>
    `| ${inv.type} | ${inv.description.slice(0, 50)}${inv.description.length > 50 ? "..." : ""} | $${inv.amount.toLocaleString()} | ${inv.purpose} | ${inv.responsive ? "Yes" : "No"} | ${inv.innovative ? "Yes" : "No"} |`
  ).join("\n");

  return {
    order: 3,
    title: "Investment Test",
    content: `## Investment Test — Rating: ${rating.rating.toUpperCase()}
**Regulatory Basis:** 12 CFR ${getRegPart(input.institutionType)}.23
**Weight:** ${(CRA_INVESTMENT_TEST_CRITERIA.weight * 100).toFixed(0)}% of overall rating

### Evaluation Criteria
${CRA_INVESTMENT_TEST_CRITERIA.factors.map((f) => `- ${f}`).join("\n")}

### Qualified Investment Summary
- **Current Period Total:** $${investments.totalCurrentPeriod.toLocaleString()}
- **Prior Period Outstanding:** $${investments.totalPriorPeriod.toLocaleString()}
- **As % of Assets:** ${((investments.totalCurrentPeriod / input.assetSize) * 100).toFixed(3)}%
- **Number of Investments:** ${investments.qualifiedInvestments.length}

### Qualified Investments Detail
| Type | Description | Amount | Purpose | Responsive | Innovative |
|---|---|---|---|---|---|
${investmentTable}

### Strengths
${rating.strengths.map((s) => `- ${s}`).join("\n")}

### Weaknesses
${rating.weaknesses.length > 0 ? rating.weaknesses.map((w) => `- ${w}`).join("\n") : "- No significant weaknesses identified"}`,
    citations: [`12 CFR ${getRegPart(input.institutionType)}.23`],
    findings: rating.weaknesses,
    recommendations: rating.weaknesses.map((w) => `Address: ${w}`),
  };
}

function buildServiceTestSection(input: CRAAssessmentInput, rating: TestRating): GeneratedSection {
  const branchDist = input.serviceData.branchDistribution;
  const changes = input.serviceData.branchOpeningsClosings;

  const changesTable = changes.map((c) =>
    `| ${c.action.toUpperCase()} | ${c.address} | ${c.tractIncomeLevel} | ${c.date} | ${c.reason} |`
  ).join("\n");

  return {
    order: 4,
    title: "Service Test",
    content: `## Service Test — Rating: ${rating.rating.toUpperCase()}
**Regulatory Basis:** 12 CFR ${getRegPart(input.institutionType)}.24
**Weight:** ${(CRA_SERVICE_TEST_CRITERIA.weight * 100).toFixed(0)}% of overall rating

### Evaluation Criteria
${CRA_SERVICE_TEST_CRITERIA.factors.map((f) => `- ${f}`).join("\n")}

### Branch Distribution by Census Tract Income Level
| Tract Income Level | Branches | % of Total | % of Tracts | Full Service | Limited Service |
|---|---|---|---|---|---|
| Low-Income | ${branchDist.lowIncomeTracts.numberOfBranches} | ${branchDist.lowIncomeTracts.percentageOfTotal.toFixed(1)}% | ${branchDist.lowIncomeTracts.tractPercentage.toFixed(1)}% | ${branchDist.lowIncomeTracts.fullService} | ${branchDist.lowIncomeTracts.limitedService} |
| Moderate-Income | ${branchDist.moderateIncomeTracts.numberOfBranches} | ${branchDist.moderateIncomeTracts.percentageOfTotal.toFixed(1)}% | ${branchDist.moderateIncomeTracts.tractPercentage.toFixed(1)}% | ${branchDist.moderateIncomeTracts.fullService} | ${branchDist.moderateIncomeTracts.limitedService} |
| Middle-Income | ${branchDist.middleIncomeTracts.numberOfBranches} | ${branchDist.middleIncomeTracts.percentageOfTotal.toFixed(1)}% | ${branchDist.middleIncomeTracts.tractPercentage.toFixed(1)}% | ${branchDist.middleIncomeTracts.fullService} | ${branchDist.middleIncomeTracts.limitedService} |
| Upper-Income | ${branchDist.upperIncomeTracts.numberOfBranches} | ${branchDist.upperIncomeTracts.percentageOfTotal.toFixed(1)}% | ${branchDist.upperIncomeTracts.tractPercentage.toFixed(1)}% | ${branchDist.upperIncomeTracts.fullService} | ${branchDist.upperIncomeTracts.limitedService} |

### Branch Openings and Closings
| Action | Address | Tract Income | Date | Reason |
|---|---|---|---|---|
${changesTable || "| No changes | — | — | — | — |"}

### Alternative Delivery Systems
${input.serviceData.alternativeDeliverySystems.map((a) => `- **${a.type}**: ${a.description} (Serves LMI: ${a.servesLMI ? "Yes" : "No"})`).join("\n")}

### Community Development Services
${input.serviceData.communityDevelopmentServices.map((s) => `- ${s.description} (${s.hoursContributed} hours, ${s.employeesInvolved} employees, purpose: ${s.purpose})`).join("\n")}

### Strengths
${rating.strengths.map((s) => `- ${s}`).join("\n")}

### Weaknesses
${rating.weaknesses.length > 0 ? rating.weaknesses.map((w) => `- ${w}`).join("\n") : "- No significant weaknesses identified"}`,
    citations: [`12 CFR ${getRegPart(input.institutionType)}.24`],
    findings: rating.weaknesses,
    recommendations: rating.weaknesses.map((w) => `Address: ${w}`),
  };
}

function buildCommunityDevelopmentSection(input: CRAAssessmentInput): GeneratedSection {
  const activities = input.communityDevelopmentActivities;
  const byType = {
    affordableHousing: activities.filter((a) => a.type === "affordable-housing"),
    communityServices: activities.filter((a) => a.type === "community-services"),
    economicDevelopment: activities.filter((a) => a.type === "economic-development"),
    revitalization: activities.filter((a) => a.type === "revitalization-stabilization"),
  };

  const totalAmount = activities.reduce((sum, a) => sum + a.amount, 0);

  return {
    order: 5,
    title: "Community Development Activities",
    content: `## Community Development Activities Log
**Assessment Period:** ${input.assessmentPeriod.start} to ${input.assessmentPeriod.end}
**Total Activities:** ${activities.length}
**Total Dollar Amount:** $${totalAmount.toLocaleString()}

### By Purpose (per 12 CFR ${getRegPart(input.institutionType)}.12(h))
| Purpose | Count | Total Amount |
|---|---|---|
| Affordable Housing | ${byType.affordableHousing.length} | $${byType.affordableHousing.reduce((s, a) => s + a.amount, 0).toLocaleString()} |
| Community Services (LMI) | ${byType.communityServices.length} | $${byType.communityServices.reduce((s, a) => s + a.amount, 0).toLocaleString()} |
| Economic Development | ${byType.economicDevelopment.length} | $${byType.economicDevelopment.reduce((s, a) => s + a.amount, 0).toLocaleString()} |
| Revitalization/Stabilization | ${byType.revitalization.length} | $${byType.revitalization.reduce((s, a) => s + a.amount, 0).toLocaleString()} |

### Activity Detail
${activities.map((a) => `- **[${a.category.toUpperCase()}]** ${a.description} — $${a.amount.toLocaleString()} (${a.date}) — Purpose: ${a.type}${a.innovativeFlexible ? " [INNOVATIVE/FLEXIBLE]" : ""} — Beneficiaries: ${a.beneficiaries}`).join("\n")}`,
    citations: [`12 CFR ${getRegPart(input.institutionType)}.12(h)`, `12 CFR ${getRegPart(input.institutionType)}.12(i)`],
    findings: [],
    recommendations: [],
  };
}

function buildPerformanceContextSection(input: CRAAssessmentInput): GeneratedSection {
  const ctx = input.performanceContext;
  return {
    order: 6,
    title: "Performance Context",
    content: `## Performance Context
Per 12 CFR ${getRegPart(input.institutionType)}.21(b), the following performance context factors inform the evaluation:

### Economic Conditions
${ctx.economicConditions}

### Lending Opportunities
${ctx.lendingOpportunities}

### Competitive Environment
${ctx.competitiveEnvironment}

### Institution Capacity and Constraints
${ctx.institutionCapacity}

### Demographic Changes
${ctx.demographicChanges}

### Prior CRA Performance
- **Prior Rating:** ${ctx.priorCRARating.toUpperCase()}
- **Prior Exam Date:** ${ctx.priorExamDate}`,
    citations: [`12 CFR ${getRegPart(input.institutionType)}.21(b)`],
    findings: [],
    recommendations: [],
  };
}

function buildOverallRatingSection(
  overall: CRARating,
  lending: TestRating,
  investment: TestRating,
  service: TestRating
): GeneratedSection {
  return {
    order: 7,
    title: "Overall CRA Rating Determination",
    content: `## Overall CRA Rating: ${overall.toUpperCase()}

### Rating Summary
| Test | Rating | Weight |
|---|---|---|
| Lending Test | ${lending.rating.toUpperCase()} | ${(CRA_LENDING_TEST_CRITERIA.weight * 100).toFixed(0)}% |
| Investment Test | ${investment.rating.toUpperCase()} | ${(CRA_INVESTMENT_TEST_CRITERIA.weight * 100).toFixed(0)}% |
| Service Test | ${service.rating.toUpperCase()} | ${(CRA_SERVICE_TEST_CRITERIA.weight * 100).toFixed(0)}% |
| **Overall** | **${overall.toUpperCase()}** | **100%** |

### Rating Methodology
Per 12 CFR ${CRA_LENDING_TEST_CRITERIA.weight > 0 ? "25.28/228.28/345.28" : ""}, the overall rating is determined by weighting the individual test ratings with the Lending Test carrying the most weight. An institution cannot receive an Outstanding overall rating unless it receives at least a Satisfactory on each test. An institution with a Substantial Noncompliance rating on any test cannot receive an overall Satisfactory rating.

### Key Strengths
${[...lending.strengths, ...investment.strengths, ...service.strengths].map((s) => `- ${s}`).join("\n")}

### Key Weaknesses
${[...lending.weaknesses, ...investment.weaknesses, ...service.weaknesses].map((w) => `- ${w}`).join("\n") || "- No significant weaknesses identified across all tests"}`,
    citations: ["12 CFR 25.28", "12 CFR 228.28", "12 CFR 345.28"],
    findings: [...lending.weaknesses, ...investment.weaknesses, ...service.weaknesses],
    recommendations: [],
  };
}

function identifyCRAGaps(input: CRAAssessmentInput, lending: TestRating, investment: TestRating, service: TestRating): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  if (lending.rating === "needs-to-improve" || lending.rating === "substantial-noncompliance") {
    gaps.push({
      standard: `12 CFR ${getRegPart(input.institutionType)}.22`,
      requirement: "Lending Test performance must demonstrate reasonable distribution of loans among geographies of different income levels and among borrowers of different income levels",
      currentState: `Lending Test rated ${lending.rating.toUpperCase()}: ${lending.weaknesses.join("; ")}`,
      severity: lending.rating === "substantial-noncompliance" ? "critical" : "high",
      recommendedAction: "Develop targeted lending strategies for LMI geographies and borrowers; consider CRA-specific lending products, partnerships with CDFIs, and participation in government-sponsored lending programs",
    });
  }

  if (investment.rating === "needs-to-improve" || investment.rating === "substantial-noncompliance") {
    gaps.push({
      standard: `12 CFR ${getRegPart(input.institutionType)}.23`,
      requirement: "Investment Test evaluates the institution's record of making qualified investments that benefit assessment areas",
      currentState: `Investment Test rated ${investment.rating.toUpperCase()}: ${investment.weaknesses.join("; ")}`,
      severity: investment.rating === "substantial-noncompliance" ? "critical" : "high",
      recommendedAction: "Identify qualified investment opportunities including LIHTC, municipal bonds in LMI areas, CDFI investments, and affordable housing development",
    });
  }

  if (service.rating === "needs-to-improve" || service.rating === "substantial-noncompliance") {
    gaps.push({
      standard: `12 CFR ${getRegPart(input.institutionType)}.24`,
      requirement: "Service Test evaluates accessibility of institution's delivery systems and community development services",
      currentState: `Service Test rated ${service.rating.toUpperCase()}: ${service.weaknesses.join("; ")}`,
      severity: service.rating === "substantial-noncompliance" ? "critical" : "high",
      recommendedAction: "Evaluate branch network accessibility in LMI areas; expand alternative delivery systems; increase community development service hours",
    });
  }

  // Assessment area compliance
  for (const area of input.assessmentAreas) {
    const lmiTractPct = ((area.censusTractsByIncome.lowIncome + area.censusTractsByIncome.moderateIncome) / area.totalCensusTracts) * 100;
    if (lmiTractPct < 10) {
      gaps.push({
        standard: `12 CFR ${getRegPart(input.institutionType)}.41(e)`,
        requirement: "Assessment area must not arbitrarily exclude low- or moderate-income geographies",
        currentState: `Assessment area ${area.msaName} has only ${lmiTractPct.toFixed(1)}% LMI tracts, which may indicate exclusion of LMI geographies`,
        severity: "medium",
        recommendedAction: "Review assessment area delineation to ensure LMI geographies are not arbitrarily excluded; document rationale for current boundaries",
      });
    }
  }

  return gaps;
}

function calculateCRAScore(rating: CRARating): number {
  switch (rating) {
    case "outstanding": return 95;
    case "satisfactory": return 78;
    case "needs-to-improve": return 50;
    case "substantial-noncompliance": return 25;
  }
}

function buildCRAContext(
  input: CRAAssessmentInput,
  lending: TestRating,
  investment: TestRating,
  service: TestRating,
  overall: CRARating
): string {
  return `Generate supplemental CRA self-assessment analysis.

INSTITUTION: ${input.institutionName}
TYPE: ${input.institutionType}
ASSETS: $${formatAssetSize(input.assetSize)}
EXAM TYPE: ${input.examType}
PERIOD: ${input.assessmentPeriod.start} to ${input.assessmentPeriod.end}

RATINGS (already determined):
- Lending Test: ${lending.rating.toUpperCase()}
- Investment Test: ${investment.rating.toUpperCase()}
- Service Test: ${service.rating.toUpperCase()}
- Overall: ${overall.toUpperCase()}

PRIOR RATING: ${input.performanceContext.priorCRARating.toUpperCase()} (${input.performanceContext.priorExamDate})

Generate:
1. Executive summary with key findings
2. Comparison to prior exam performance
3. Peer analysis context (how performance compares to similarly-situated institutions)
4. Strategic recommendations for improving CRA performance
5. Upcoming regulatory changes affecting CRA compliance
6. Data integrity assessment (HMDA, CRA data quality)`;
}

function getRegPart(institutionType: string): string {
  switch (institutionType) {
    case "national-bank":
    case "savings-association":
      return "25";
    case "state-member-bank":
      return "228";
    case "state-nonmember-bank":
      return "345";
    default:
      return "25";
  }
}

function formatAssetSize(assets: number): string {
  if (assets >= 1_000_000_000) return `${(assets / 1_000_000_000).toFixed(1)}B`;
  if (assets >= 1_000_000) return `${(assets / 1_000_000).toFixed(0)}M`;
  return assets.toLocaleString();
}
