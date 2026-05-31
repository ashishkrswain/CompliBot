/**
 * US State Privacy Laws — Comprehensive reference data
 * Covers all enacted comprehensive state privacy laws as of 2025
 */

export interface StatePrivacyLaw {
  state: string;
  abbreviation: string;
  lawName: string;
  citation: string;
  effectiveDate: string;
  applicabilityThresholds: string[];
  consumerRights: string[];
  optOutRequirements: string[];
  enforcement: string;
  penalties: string;
  privateRightOfAction: boolean;
  cureProvision: string;
}

export const STATE_PRIVACY_LAWS: StatePrivacyLaw[] = [
  {
    state: "California",
    abbreviation: "CA",
    lawName: "California Consumer Privacy Act / California Privacy Rights Act (CCPA/CPRA)",
    citation: "Cal. Civ. Code §§ 1798.100-1798.199.100",
    effectiveDate: "2020-01-01 (CCPA); 2023-01-01 (CPRA amendments)",
    applicabilityThresholds: [
      "Annual gross revenue exceeds $25 million",
      "Annually buys, sells, or shares personal information of 100,000+ consumers or households",
      "Derives 50% or more of annual revenue from selling or sharing consumers' personal information",
    ],
    consumerRights: [
      "Right to know/access personal information collected",
      "Right to delete personal information",
      "Right to correct inaccurate personal information",
      "Right to opt out of sale or sharing of personal information",
      "Right to limit use and disclosure of sensitive personal information",
      "Right to non-discrimination for exercising rights",
      "Right to data portability",
    ],
    optOutRequirements: [
      "Must provide 'Do Not Sell or Share My Personal Information' link on homepage",
      "Must honor Global Privacy Control (GPC) signals",
      "Must provide opt-out preference signals mechanism",
      "Service provider and contractor agreements must restrict use of data",
      "Must provide opt-out for cross-context behavioral advertising",
    ],
    enforcement: "California Privacy Protection Agency (CPPA) and California Attorney General",
    penalties: "$2,500 per unintentional violation; $7,500 per intentional violation or violations involving minors",
    privateRightOfAction: true,
    cureProvision: "30-day cure period for AG enforcement (removed for CPPA enforcement under CPRA)",
  },
  {
    state: "Colorado",
    abbreviation: "CO",
    lawName: "Colorado Privacy Act (CPA)",
    citation: "C.R.S. §§ 6-1-1301 to 6-1-1313",
    effectiveDate: "2023-07-01",
    applicabilityThresholds: [
      "Controls or processes personal data of 100,000+ Colorado residents per year",
      "Controls or processes personal data of 25,000+ Colorado residents AND derives revenue or receives discount from sale of personal data",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to correct inaccuracies",
      "Right to delete personal data",
      "Right to data portability",
      "Right to opt out of targeted advertising, sale of personal data, or profiling in furtherance of decisions with legal/similarly significant effects",
    ],
    optOutRequirements: [
      "Must provide clear and conspicuous method to opt out",
      "Must honor universal opt-out mechanisms (required from July 1, 2024)",
      "Must provide opt-out for targeted advertising and sale of personal data",
      "Must provide opt-out for profiling producing legal or similarly significant effects",
    ],
    enforcement: "Colorado Attorney General",
    penalties: "Up to $20,000 per violation under the Colorado Consumer Protection Act; $50,000 for pattern violations",
    privateRightOfAction: false,
    cureProvision: "60-day cure period (expires January 1, 2025)",
  },
  {
    state: "Connecticut",
    abbreviation: "CT",
    lawName: "Connecticut Data Privacy Act (CTDPA)",
    citation: "Conn. Gen. Stat. §§ 42-515 to 42-525",
    effectiveDate: "2023-07-01",
    applicabilityThresholds: [
      "Controls or processes personal data of 100,000+ Connecticut residents (excluding for payment transactions only)",
      "Controls or processes personal data of 25,000+ Connecticut residents AND derives more than 25% of gross revenue from sale of personal data",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to correct inaccuracies",
      "Right to delete personal data",
      "Right to data portability",
      "Right to opt out of sale of personal data, targeted advertising, or profiling with legal/similarly significant effects",
      "Right to know if personal data is being processed",
    ],
    optOutRequirements: [
      "Must provide clear mechanism to opt out of sale and targeted advertising",
      "Must honor universal opt-out mechanisms (required from January 1, 2025)",
      "Must provide opt-out from profiling producing legal or similarly significant effects",
    ],
    enforcement: "Connecticut Attorney General",
    penalties: "Up to $5,000 per violation under Connecticut Unfair Trade Practices Act",
    privateRightOfAction: false,
    cureProvision: "60-day cure period (expires December 31, 2024)",
  },
  {
    state: "Virginia",
    abbreviation: "VA",
    lawName: "Virginia Consumer Data Protection Act (VCDPA)",
    citation: "Va. Code §§ 59.1-575 to 59.1-585",
    effectiveDate: "2023-01-01",
    applicabilityThresholds: [
      "Controls or processes personal data of 100,000+ Virginia consumers per year",
      "Controls or processes personal data of 25,000+ Virginia consumers AND derives over 50% of gross revenue from sale of personal data",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to correct inaccuracies",
      "Right to delete personal data",
      "Right to data portability",
      "Right to opt out of sale of personal data, targeted advertising, or profiling with legal/similarly significant effects",
    ],
    optOutRequirements: [
      "Must provide clear and conspicuous opt-out mechanism for sale of personal data",
      "Must provide opt-out from targeted advertising",
      "Must provide opt-out from profiling producing legal or similarly significant effects",
    ],
    enforcement: "Virginia Attorney General (exclusive enforcement authority)",
    penalties: "Up to $7,500 per violation",
    privateRightOfAction: false,
    cureProvision: "30-day cure period (permanent, no sunset)",
  },
  {
    state: "Utah",
    abbreviation: "UT",
    lawName: "Utah Consumer Privacy Act (UCPA)",
    citation: "Utah Code §§ 13-61-101 to 13-61-404",
    effectiveDate: "2023-12-31",
    applicabilityThresholds: [
      "Annual revenue of $25,000,000 or more AND controls or processes personal data of 100,000+ Utah consumers per year",
      "Annual revenue of $25,000,000 or more AND derives over 50% of gross revenue from sale of personal data AND controls or processes data of 25,000+ consumers",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to delete personal data provided by the consumer",
      "Right to data portability",
      "Right to opt out of sale of personal data or targeted advertising",
    ],
    optOutRequirements: [
      "Must provide clear notice of sale activities and opt-out mechanism",
      "Must provide opt-out from targeted advertising",
      "No requirement to honor universal opt-out signals",
    ],
    enforcement: "Utah Attorney General (exclusive, with Division of Consumer Protection investigation)",
    penalties: "Up to $7,500 per violation",
    privateRightOfAction: false,
    cureProvision: "30-day cure period (permanent, no sunset)",
  },
  {
    state: "Texas",
    abbreviation: "TX",
    lawName: "Texas Data Privacy and Security Act (TDPSA)",
    citation: "Tex. Bus. & Com. Code §§ 541.001-541.205",
    effectiveDate: "2024-07-01",
    applicabilityThresholds: [
      "Conducts business in Texas or produces products/services consumed by Texas residents",
      "Processes or engages in sale of personal data",
      "Is not a small business as defined by the U.S. Small Business Administration",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to correct inaccuracies",
      "Right to delete personal data",
      "Right to data portability",
      "Right to opt out of sale of personal data, targeted advertising, or profiling producing legal/similarly significant effects",
    ],
    optOutRequirements: [
      "Must provide clear mechanism to opt out of sale and targeted advertising",
      "Must honor universal opt-out mechanisms (required from January 1, 2025)",
      "Must provide opt-out from profiling with legal or similarly significant effects",
    ],
    enforcement: "Texas Attorney General",
    penalties: "Up to $7,500 per violation",
    privateRightOfAction: false,
    cureProvision: "30-day cure period (permanent)",
  },
  {
    state: "Oregon",
    abbreviation: "OR",
    lawName: "Oregon Consumer Privacy Act (OCPA)",
    citation: "ORS §§ 646A.570 to 646A.604",
    effectiveDate: "2024-07-01",
    applicabilityThresholds: [
      "Controls or processes personal data of 100,000+ Oregon consumers (excluding data controlled/processed solely for completing payment transactions)",
      "Controls or processes personal data of 25,000+ Oregon consumers AND derives 25% or more of annual gross revenue from selling personal data",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to correct inaccuracies",
      "Right to delete personal data",
      "Right to data portability",
      "Right to opt out of sale of personal data, targeted advertising, or profiling with legal/similarly significant effects",
      "Right to obtain list of third parties to whom data has been disclosed",
    ],
    optOutRequirements: [
      "Must provide clear opt-out mechanism for sale and targeted advertising",
      "Must honor universal opt-out mechanisms (required from January 1, 2026)",
      "Must provide opt-out from profiling with legal or similarly significant effects",
    ],
    enforcement: "Oregon Attorney General",
    penalties: "Up to $7,500 per violation",
    privateRightOfAction: false,
    cureProvision: "30-day cure period (expires January 1, 2026)",
  },
  {
    state: "Montana",
    abbreviation: "MT",
    lawName: "Montana Consumer Data Privacy Act (MCDPA)",
    citation: "MCA §§ 30-14-2801 to 30-14-2817",
    effectiveDate: "2024-10-01",
    applicabilityThresholds: [
      "Controls or processes personal data of 50,000+ Montana consumers (excluding payment transaction data only)",
      "Controls or processes personal data of 25,000+ Montana consumers AND derives more than 25% of gross revenue from sale of personal data",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to correct inaccuracies",
      "Right to delete personal data",
      "Right to data portability",
      "Right to opt out of sale of personal data, targeted advertising, or profiling producing legal/similarly significant effects",
    ],
    optOutRequirements: [
      "Must provide clear opt-out mechanism for sale and targeted advertising",
      "Must honor universal opt-out mechanisms (required from January 1, 2025)",
      "Must provide opt-out from profiling with legal or similarly significant effects",
    ],
    enforcement: "Montana Attorney General",
    penalties: "Up to $7,500 per violation",
    privateRightOfAction: false,
    cureProvision: "60-day cure period (expires April 1, 2026)",
  },
  {
    state: "Delaware",
    abbreviation: "DE",
    lawName: "Delaware Personal Data Privacy Act (DPDPA)",
    citation: "6 Del. C. §§ 12D-101 to 12D-113",
    effectiveDate: "2025-01-01",
    applicabilityThresholds: [
      "Controls or processes personal data of 35,000+ Delaware residents (excluding payment transactions only)",
      "Controls or processes personal data of 10,000+ Delaware residents AND derives more than 20% of gross revenue from sale of personal data",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to correct inaccuracies",
      "Right to delete personal data",
      "Right to data portability",
      "Right to opt out of sale of personal data, targeted advertising, or profiling with legal/similarly significant effects",
      "Right to obtain list of specific third parties to which data has been disclosed",
    ],
    optOutRequirements: [
      "Must provide clear opt-out mechanism for sale and targeted advertising",
      "Must honor universal opt-out mechanisms (required from January 1, 2026)",
      "Must provide opt-out from profiling with legal or similarly significant effects",
    ],
    enforcement: "Delaware Attorney General (Department of Justice)",
    penalties: "Up to $10,000 per violation",
    privateRightOfAction: false,
    cureProvision: "60-day cure period (expires December 31, 2025)",
  },
  {
    state: "Iowa",
    abbreviation: "IA",
    lawName: "Iowa Consumer Data Protection Act (ICDPA)",
    citation: "Iowa Code §§ 715D.1 to 715D.8",
    effectiveDate: "2025-01-01",
    applicabilityThresholds: [
      "Controls or processes personal data of 100,000+ Iowa consumers",
      "Controls or processes personal data of 25,000+ Iowa consumers AND derives more than 50% of gross revenue from sale of personal data",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to delete personal data",
      "Right to data portability",
      "Right to opt out of sale of personal data or targeted advertising",
    ],
    optOutRequirements: [
      "Must provide clear opt-out mechanism for sale of personal data",
      "Must provide opt-out from targeted advertising",
      "No universal opt-out signal requirement",
    ],
    enforcement: "Iowa Attorney General",
    penalties: "Up to $7,500 per violation",
    privateRightOfAction: false,
    cureProvision: "90-day cure period (permanent, no sunset)",
  },
  {
    state: "Tennessee",
    abbreviation: "TN",
    lawName: "Tennessee Information Protection Act (TIPA)",
    citation: "Tenn. Code §§ 47-18-3201 to 47-18-3213",
    effectiveDate: "2025-07-01",
    applicabilityThresholds: [
      "Annual revenue exceeds $25,000,000",
      "Controls or processes personal information of 175,000+ Tennessee consumers per year",
      "Controls or processes personal information of 25,000+ Tennessee consumers AND derives more than 50% of gross revenue from sale of personal information",
    ],
    consumerRights: [
      "Right to access personal information",
      "Right to correct inaccuracies",
      "Right to delete personal information",
      "Right to data portability",
      "Right to opt out of sale of personal information, targeted advertising, or profiling with legal/similarly significant effects",
    ],
    optOutRequirements: [
      "Must provide clear opt-out mechanism for sale and targeted advertising",
      "Must provide opt-out from profiling with legal or similarly significant effects",
      "No mandatory universal opt-out signal recognition (but may be adopted by rule)",
    ],
    enforcement: "Tennessee Attorney General and Reporter",
    penalties: "Up to $7,500 per violation; treble damages for willful/knowing violations",
    privateRightOfAction: false,
    cureProvision: "60-day cure period (permanent, no sunset)",
  },
  {
    state: "Indiana",
    abbreviation: "IN",
    lawName: "Indiana Consumer Data Protection Act (INCDPA)",
    citation: "Ind. Code §§ 24-15-1-1 to 24-15-9-2",
    effectiveDate: "2026-01-01",
    applicabilityThresholds: [
      "Controls or processes personal data of 100,000+ Indiana consumers per year",
      "Controls or processes personal data of 25,000+ Indiana consumers AND derives more than 50% of gross revenue from sale of personal data",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to correct inaccuracies",
      "Right to delete personal data",
      "Right to data portability",
      "Right to opt out of sale of personal data, targeted advertising, or profiling producing legal/similarly significant effects",
    ],
    optOutRequirements: [
      "Must provide clear opt-out mechanism for sale and targeted advertising",
      "Must provide opt-out from profiling with legal or similarly significant effects",
    ],
    enforcement: "Indiana Attorney General",
    penalties: "Up to $7,500 per violation",
    privateRightOfAction: false,
    cureProvision: "30-day cure period (permanent, no sunset)",
  },
  {
    state: "Florida",
    abbreviation: "FL",
    lawName: "Florida Digital Bill of Rights (FDBR)",
    citation: "Fla. Stat. §§ 501.701-501.721",
    effectiveDate: "2024-07-01",
    applicabilityThresholds: [
      "Conducts business in Florida or makes products/services available to Florida residents",
      "Annual global gross revenue exceeds $1 billion",
      "Meets one of: derives 50% of global gross revenue from sale of ads online; operates a consumer smart speaker or voice command service with integrated virtual assistant; operates an app store or digital distribution platform with 250,000+ apps",
    ],
    consumerRights: [
      "Right to access personal data",
      "Right to correct inaccuracies",
      "Right to delete personal data",
      "Right to data portability",
      "Right to opt out of sale of personal data, targeted advertising, or profiling with legal/similarly significant effects",
      "Right to opt out of collection of sensitive personal data",
      "Right to opt out of collection of precise geolocation data",
    ],
    optOutRequirements: [
      "Must provide clear opt-out mechanism for sale and targeted advertising",
      "Must provide mechanism to opt out of collection of sensitive data and precise geolocation",
      "Must not use dark patterns to subvert opt-out",
      "Children's data (under 18): additional protections and restrictions on targeted advertising",
    ],
    enforcement: "Florida Attorney General (Department of Legal Affairs)",
    penalties: "Up to $50,000 per violation; $100,000 for willful violations after notice",
    privateRightOfAction: false,
    cureProvision: "45-day cure period (permanent)",
  },
];

export function getLawByState(abbreviation: string): StatePrivacyLaw | undefined {
  return STATE_PRIVACY_LAWS.find((l) => l.abbreviation === abbreviation);
}

export function getLawsWithPrivateRightOfAction(): StatePrivacyLaw[] {
  return STATE_PRIVACY_LAWS.filter((l) => l.privateRightOfAction);
}

export function getLawsEffectiveBefore(date: string): StatePrivacyLaw[] {
  return STATE_PRIVACY_LAWS.filter((l) => l.effectiveDate <= date);
}

export function getAllStateAbbreviations(): string[] {
  return STATE_PRIVACY_LAWS.map((l) => l.abbreviation);
}
