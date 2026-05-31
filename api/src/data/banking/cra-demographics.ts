/**
 * CRA Assessment Area Demographics Data Structures
 * Per 12 CFR 25/228/345 (OCC/FRB/FDIC CRA Regulations)
 */

export type IncomeLevel = "low" | "moderate" | "middle" | "upper";
export type CensusTractIncomeLevel = "low-income" | "moderate-income" | "middle-income" | "upper-income" | "unknown";
export type CRATestType = "lending" | "investment" | "service";
export type CRARating = "outstanding" | "satisfactory" | "needs-to-improve" | "substantial-noncompliance";

export interface AssessmentAreaDemographics {
  msaCode: string;
  msaName: string;
  stateCode: string;
  stateName: string;
  totalPopulation: number;
  medianFamilyIncome: number;
  totalCensusTracts: number;
  censusTractsByIncome: CensusTractDistribution;
  populationByTractIncome: PopulationDistribution;
  familiesByIncomeLevel: FamilyIncomeDistribution;
  housingCharacteristics: HousingCharacteristics;
  economicIndicators: EconomicIndicators;
  competitionData: CompetitionData;
}

export interface CensusTractDistribution {
  lowIncome: number;
  moderateIncome: number;
  middleIncome: number;
  upperIncome: number;
  unknown: number;
}

export interface PopulationDistribution {
  lowIncomeTracts: number;
  moderateIncomeTracts: number;
  middleIncomeTracts: number;
  upperIncomeTracts: number;
}

export interface FamilyIncomeDistribution {
  lowIncome: number;
  moderateIncome: number;
  middleIncome: number;
  upperIncome: number;
  lowIncomePercentage: number;
  moderateIncomePercentage: number;
  middleIncomePercentage: number;
  upperIncomePercentage: number;
}

export interface HousingCharacteristics {
  totalHousingUnits: number;
  ownerOccupied: number;
  renterOccupied: number;
  vacantUnits: number;
  medianHomeValue: number;
  medianRent: number;
  ownerOccupiedPercentage: number;
  affordabilityRatio: number;
}

export interface EconomicIndicators {
  unemploymentRate: number;
  povertyRate: number;
  medianHouseholdIncome: number;
  majorEmployers: string[];
  economicDrivers: string[];
  recentTrends: string[];
}

export interface CompetitionData {
  totalDepositoryInstitutions: number;
  totalBranches: number;
  herfindahlIndex: number;
  topCompetitors: CompetitorInfo[];
  marketShareRank: number;
  depositMarketShare: number;
}

export interface CompetitorInfo {
  name: string;
  branches: number;
  depositMarketShare: number;
}

export interface LendingDistribution {
  geographicDistribution: GeographicLendingData;
  borrowerDistribution: BorrowerLendingData;
  loanTypes: LoanTypeBreakdown;
}

export interface GeographicLendingData {
  lowIncomeTracts: LendingMetrics;
  moderateIncomeTracts: LendingMetrics;
  middleIncomeTracts: LendingMetrics;
  upperIncomeTracts: LendingMetrics;
}

export interface BorrowerLendingData {
  lowIncomeBorrowers: LendingMetrics;
  moderateIncomeBorrowers: LendingMetrics;
  middleIncomeBorrowers: LendingMetrics;
  upperIncomeBorrowers: LendingMetrics;
}

export interface LendingMetrics {
  numberOfLoans: number;
  dollarAmount: number;
  percentageOfTotal: number;
  demographicPercentage: number;
  penetrationRatio: number;
}

export interface LoanTypeBreakdown {
  homeMortgage: LoanCategoryData;
  smallBusiness: LoanCategoryData;
  smallFarm: LoanCategoryData;
  consumerLoans: LoanCategoryData;
}

export interface LoanCategoryData {
  totalOriginations: number;
  totalDollars: number;
  averageLoanSize: number;
  percentInsideAssessmentArea: number;
}

export interface CommunityDevelopmentActivity {
  id: string;
  type: "affordable-housing" | "community-services" | "economic-development" | "revitalization-stabilization";
  category: "loan" | "investment" | "service" | "grant";
  description: string;
  amount: number;
  date: string;
  censusTracts: string[];
  qualifiedAs: string;
  beneficiaries: string;
  innovativeFlexible: boolean;
}

export interface InvestmentTestData {
  qualifiedInvestments: QualifiedInvestment[];
  totalCurrentPeriod: number;
  totalPriorPeriod: number;
  percentOfAssets: number;
}

export interface QualifiedInvestment {
  type: string;
  description: string;
  amount: number;
  purpose: "affordable-housing" | "community-services" | "economic-development" | "revitalization-stabilization";
  responsive: boolean;
  innovative: boolean;
}

export interface ServiceTestData {
  branchDistribution: BranchDistribution;
  branchOpeningsClosings: BranchChange[];
  communityDevelopmentServices: CommunityDevelopmentService[];
  alternativeDeliverySystems: AlternativeDeliverySystem[];
}

export interface BranchDistribution {
  lowIncomeTracts: BranchMetrics;
  moderateIncomeTracts: BranchMetrics;
  middleIncomeTracts: BranchMetrics;
  upperIncomeTracts: BranchMetrics;
}

export interface BranchMetrics {
  numberOfBranches: number;
  percentageOfTotal: number;
  tractPercentage: number;
  fullService: number;
  limitedService: number;
}

export interface BranchChange {
  action: "opened" | "closed" | "relocated";
  address: string;
  tractIncomeLevel: CensusTractIncomeLevel;
  date: string;
  reason: string;
}

export interface CommunityDevelopmentService {
  description: string;
  hoursContributed: number;
  employeesInvolved: number;
  benefitArea: string;
  purpose: "affordable-housing" | "community-services" | "economic-development" | "revitalization-stabilization";
}

export interface AlternativeDeliverySystem {
  type: "ATM" | "online-banking" | "mobile-banking" | "loan-production-office" | "community-development-corporation";
  description: string;
  servesLMI: boolean;
  accessibilityFeatures: string[];
}

/**
 * CRA Income Level Thresholds
 * Per FFIEC CRA regulations, income levels are defined as percentages of MSA/MD median family income:
 */
export const CRA_INCOME_THRESHOLDS = {
  lowIncome: { maxPercentOfMedian: 50, description: "Less than 50% of area median family income" },
  moderateIncome: { maxPercentOfMedian: 80, description: "50% to less than 80% of area median family income" },
  middleIncome: { maxPercentOfMedian: 120, description: "80% to less than 120% of area median family income" },
  upperIncome: { maxPercentOfMedian: Infinity, description: "120% or more of area median family income" },
} as const;

/**
 * Census Tract Income Level Thresholds
 * Tracts are classified based on their median family income relative to the MSA/MD median:
 */
export const TRACT_INCOME_THRESHOLDS = {
  lowIncome: { maxPercentOfMSAMedian: 50, description: "Tract median family income less than 50% of MSA median" },
  moderateIncome: { maxPercentOfMSAMedian: 80, description: "Tract median family income 50% to less than 80% of MSA median" },
  middleIncome: { maxPercentOfMSAMedian: 120, description: "Tract median family income 80% to less than 120% of MSA median" },
  upperIncome: { maxPercentOfMSAMedian: Infinity, description: "Tract median family income 120% or more of MSA median" },
} as const;

/**
 * CRA Performance Criteria per regulation
 */
export const CRA_LENDING_TEST_CRITERIA = {
  weight: 0.50,
  factors: [
    "Geographic distribution of lending (loans in low- and moderate-income census tracts)",
    "Borrower distribution (loans to low- and moderate-income borrowers)",
    "Community development lending activity",
    "Innovative or flexible lending practices",
    "Volume of lending inside vs. outside assessment areas",
  ],
  geographicDistributionBenchmarks: {
    outstanding: "Lending in LMI tracts significantly exceeds tract demographics",
    satisfactory: "Lending in LMI tracts reasonably reflects tract demographics",
    needsImprovement: "Lending in LMI tracts is below what tract demographics would suggest",
    substantialNoncompliance: "Very poor geographic distribution with significant disparities",
  },
  borrowerDistributionBenchmarks: {
    outstanding: "Lending to LMI borrowers significantly exceeds their representation in the assessment area",
    satisfactory: "Lending to LMI borrowers reasonably reflects their representation",
    needsImprovement: "Lending to LMI borrowers is below their representation",
    substantialNoncompliance: "Very poor borrower distribution with significant disparities",
  },
} as const;

export const CRA_INVESTMENT_TEST_CRITERIA = {
  weight: 0.25,
  factors: [
    "Dollar amount of qualified investments relative to institution capacity",
    "Innovativeness and complexity of investments",
    "Responsiveness to community development needs",
    "Whether investments are not routinely provided by private investors",
  ],
} as const;

export const CRA_SERVICE_TEST_CRITERIA = {
  weight: 0.25,
  factors: [
    "Distribution of branches among geographies of different income levels",
    "Record of opening and closing of branches in low- and moderate-income geographies",
    "Availability and effectiveness of alternative systems for delivering services in LMI geographies",
    "Range of services provided in low- and moderate-income geographies",
    "Community development services provided",
  ],
} as const;

/**
 * Sample assessment area demographic data for reference/testing
 */
export const SAMPLE_ASSESSMENT_AREA: AssessmentAreaDemographics = {
  msaCode: "12060",
  msaName: "Atlanta-Sandy Springs-Alpharetta, GA MSA",
  stateCode: "13",
  stateName: "Georgia",
  totalPopulation: 6089815,
  medianFamilyIncome: 82700,
  totalCensusTracts: 1134,
  censusTractsByIncome: {
    lowIncome: 136,
    moderateIncome: 272,
    middleIncome: 408,
    upperIncome: 295,
    unknown: 23,
  },
  populationByTractIncome: {
    lowIncomeTracts: 548584,
    moderateIncomeTracts: 1339158,
    middleIncomeTracts: 2496772,
    upperIncomeTracts: 1644253,
  },
  familiesByIncomeLevel: {
    lowIncome: 243593,
    moderateIncome: 304491,
    middleIncome: 365389,
    upperIncome: 608982,
    lowIncomePercentage: 16,
    moderateIncomePercentage: 20,
    middleIncomePercentage: 24,
    upperIncomePercentage: 40,
  },
  housingCharacteristics: {
    totalHousingUnits: 2345000,
    ownerOccupied: 1450000,
    renterOccupied: 745000,
    vacantUnits: 150000,
    medianHomeValue: 285000,
    medianRent: 1350,
    ownerOccupiedPercentage: 61.8,
    affordabilityRatio: 3.45,
  },
  economicIndicators: {
    unemploymentRate: 3.8,
    povertyRate: 12.4,
    medianHouseholdIncome: 72800,
    majorEmployers: [
      "Delta Air Lines",
      "The Home Depot",
      "UPS",
      "Emory University/Healthcare",
      "Coca-Cola Company",
    ],
    economicDrivers: [
      "Transportation and logistics hub",
      "Technology sector growth",
      "Healthcare and education",
      "Film and entertainment industry",
    ],
    recentTrends: [
      "Sustained population growth driving housing demand",
      "Tech sector expansion attracting high-income workers",
      "Rising housing costs in core areas pushing LMI families to outer suburbs",
      "Gentrification in historically LMI neighborhoods near transit",
    ],
  },
  competitionData: {
    totalDepositoryInstitutions: 87,
    totalBranches: 1823,
    herfindahlIndex: 1245,
    topCompetitors: [
      { name: "Truist Financial", branches: 245, depositMarketShare: 18.2 },
      { name: "Wells Fargo", branches: 198, depositMarketShare: 15.7 },
      { name: "Bank of America", branches: 187, depositMarketShare: 14.3 },
      { name: "JPMorgan Chase", branches: 156, depositMarketShare: 11.8 },
      { name: "Synovus Financial", branches: 78, depositMarketShare: 5.4 },
    ],
    marketShareRank: 12,
    depositMarketShare: 2.1,
  },
};
