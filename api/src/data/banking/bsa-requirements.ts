/**
 * BSA/AML Regulatory Requirements Data
 * Per FinCEN regulations (31 CFR 1010-1022), OCC (12 CFR 21.21),
 * Federal Reserve (12 CFR 208.63), FDIC (12 CFR 326.8)
 */

export interface BSARegulation {
  citation: string;
  title: string;
  agency: "FinCEN" | "OCC" | "FRB" | "FDIC" | "NCUA";
  requirements: string[];
  applicability: string;
  penaltyRange: string;
}

export interface CTRRequirement {
  threshold: number;
  currency: "USD";
  filingDeadline: string;
  exemptionCategories: string[];
  aggregationRule: string;
  recordRetention: string;
}

export interface SARRequirement {
  thresholdKnownSubject: number;
  thresholdUnknownSubject: number;
  filingDeadline: string;
  continuingActivityFiling: string;
  recordRetention: string;
  categories: string[];
}

export interface RecordkeepingRequirement {
  citation: string;
  description: string;
  threshold: string;
  retentionPeriod: string;
}

export const BSA_CORE_REGULATIONS: BSARegulation[] = [
  {
    citation: "31 CFR 1010.210",
    title: "Anti-Money Laundering Program Requirements",
    agency: "FinCEN",
    requirements: [
      "Develop and implement a written AML program",
      "Program must be reasonably designed to prevent the institution from being used to facilitate money laundering or terrorist financing",
      "Program must be approved by the board of directors or equivalent governing body",
      "Program must be made available for inspection by FinCEN or its delegated examiners",
    ],
    applicability: "All financial institutions as defined in 31 USC 5312(a)(2)",
    penaltyRange: "Civil: up to $500,000 per violation; Criminal: up to $250,000 and/or 5 years imprisonment",
  },
  {
    citation: "31 CFR 1010.220",
    title: "Customer Identification Program (CIP)",
    agency: "FinCEN",
    requirements: [
      "Implement written CIP appropriate to bank size and type of business",
      "Collect minimum identifying information: name, date of birth, address, identification number",
      "Verify customer identity using documentary or non-documentary methods within reasonable time after account opening",
      "Maintain records of information used to verify identity for 5 years after account closure",
      "Screen customers against government lists (OFAC SDN list)",
      "Provide adequate notice to customers that information is being obtained for identity verification",
    ],
    applicability: "All banks, savings associations, credit unions, and certain non-bank financial institutions",
    penaltyRange: "Civil: up to $100,000 per violation; Criminal: up to $250,000 and/or 5 years imprisonment",
  },
  {
    citation: "31 CFR 1010.230",
    title: "Beneficial Ownership Requirements (CDD Rule)",
    agency: "FinCEN",
    requirements: [
      "Identify and verify identity of beneficial owners of legal entity customers at account opening",
      "Beneficial owner: each individual who owns 25% or more of the legal entity",
      "Beneficial owner: one individual with significant responsibility to control or manage the legal entity",
      "Develop risk profiles for customers based on CDD information",
      "Conduct ongoing monitoring to maintain and update customer information",
      "Understand nature and purpose of customer relationships",
    ],
    applicability: "Covered financial institutions opening new accounts for legal entity customers",
    penaltyRange: "Civil: up to $500,000 per violation; assessed under AML program requirements",
  },
  {
    citation: "31 CFR 1010.310",
    title: "Currency Transaction Reports (CTR)",
    agency: "FinCEN",
    requirements: [
      "File CTR for each transaction in currency exceeding $10,000",
      "Include multiple transactions that aggregate to over $10,000 in a single business day",
      "Report on FinCEN Form 112 (FinCEN CTR)",
      "File within 15 calendar days of transaction date",
      "Obtain and record identification of person conducting the transaction",
      "Maintain copy of CTR for 5 years from date of filing",
    ],
    applicability: "All financial institutions conducting currency transactions",
    penaltyRange: "Civil: up to $500,000 per violation; Criminal: up to $250,000 and/or 10 years (structuring: 31 USC 5324)",
  },
  {
    citation: "31 CFR 1010.320",
    title: "Suspicious Activity Reports (SAR)",
    agency: "FinCEN",
    requirements: [
      "File SAR for transactions involving $5,000 or more when subject is known",
      "File SAR for transactions involving $25,000 or more regardless of whether subject is known",
      "File within 30 calendar days of initial detection (60 days if no suspect identified initially)",
      "Continue filing every 90 days for ongoing suspicious activity",
      "Maintain copy and supporting documentation for 5 years",
      "SAR filing is confidential — no disclosure to subject of SAR",
      "Provide safe harbor protection to filers per 31 USC 5318(g)(3)",
    ],
    applicability: "Banks, savings associations, credit unions, broker-dealers, MSBs, insurance companies, casinos",
    penaltyRange: "Civil: willful violation up to $500,000; Criminal: up to $250,000 and/or 5 years",
  },
  {
    citation: "31 CFR 1010.340",
    title: "OFAC Compliance",
    agency: "FinCEN",
    requirements: [
      "Screen all customers, transactions, and relationships against OFAC SDN list",
      "Block property of designated persons per Executive Orders and OFAC regulations",
      "File blocking reports with OFAC within 10 business days",
      "File annual reports for blocked property by September 30",
      "Reject prohibited transactions and file rejection reports",
      "Implement risk-based OFAC compliance program appropriate to institution risk profile",
    ],
    applicability: "All U.S. persons and financial institutions (31 CFR Part 501)",
    penaltyRange: "Civil: up to $356,579 per violation (IEEPA) or greater of $1,190,762 or twice transaction value",
  },
  {
    citation: "12 CFR 21.21",
    title: "OCC BSA/AML Compliance Program",
    agency: "OCC",
    requirements: [
      "System of internal controls to ensure ongoing compliance",
      "Independent testing of BSA/AML compliance (audit)",
      "Designation of BSA/AML compliance officer",
      "Training for appropriate personnel",
      "Customer Identification Program per 31 CFR 1010.220",
      "Customer Due Diligence procedures per 31 CFR 1010.230",
    ],
    applicability: "National banks and federal savings associations supervised by OCC",
    penaltyRange: "Civil money penalties per 12 USC 1818; consent orders; cease and desist",
  },
  {
    citation: "12 CFR 208.63",
    title: "Federal Reserve BSA Program Requirements",
    agency: "FRB",
    requirements: [
      "Establish and maintain BSA compliance program",
      "System of internal controls including policies, procedures, and processes",
      "Independent testing conducted by qualified party",
      "BSA compliance officer with adequate resources and authority",
      "Training program for all appropriate personnel",
      "Risk-based CDD and EDD procedures",
    ],
    applicability: "State member banks supervised by the Federal Reserve",
    penaltyRange: "Civil money penalties per 12 USC 1818; enforcement actions",
  },
  {
    citation: "12 CFR 326.8",
    title: "FDIC BSA Program Requirements",
    agency: "FDIC",
    requirements: [
      "Written BSA compliance program approved by board of directors",
      "Internal controls including approved policies and procedures",
      "Independent testing commensurate with institution risk profile",
      "Designated BSA compliance officer",
      "Training of appropriate personnel",
      "CIP implementation per Section 326 of USA PATRIOT Act",
    ],
    applicability: "State nonmember banks supervised by the FDIC",
    penaltyRange: "Civil money penalties; cease and desist orders; formal enforcement actions",
  },
];

export const CTR_REQUIREMENTS: CTRRequirement = {
  threshold: 10000,
  currency: "USD",
  filingDeadline: "15 calendar days from date of transaction",
  exemptionCategories: [
    "Phase I Exempt: Banks, government agencies, NYSE/AMEX listed companies",
    "Phase II Exempt: Payroll customers meeting specific criteria",
    "Phase II Exempt: Certain non-listed businesses meeting eligibility criteria",
    "Annual renewal of exemptions required",
    "Must file FinCEN Form 110 (Designation of Exempt Person)",
  ],
  aggregationRule: "Multiple currency transactions by or on behalf of the same person totaling more than $10,000 in a single business day must be treated as a single transaction",
  recordRetention: "5 years from date of filing",
};

export const SAR_REQUIREMENTS: SARRequirement = {
  thresholdKnownSubject: 5000,
  thresholdUnknownSubject: 25000,
  filingDeadline: "30 calendar days from initial detection; 60 days if no suspect identified (with 30-day extension)",
  continuingActivityFiling: "Every 90 days for ongoing suspicious activity; include cumulative amounts",
  recordRetention: "5 years from date of filing; maintain supporting documentation",
  categories: [
    "Structuring / Smurfing",
    "Terrorist financing",
    "Fraud (mortgage, check, wire, credit card, loan, securities)",
    "Money laundering",
    "Identification/documentation concerns",
    "Insider abuse",
    "Bribery/gratuity",
    "Counterfeit instruments",
    "Embezzlement/theft",
    "Computer intrusion/unauthorized electronic access",
    "Identity theft",
    "Significant cash transactions below CTR threshold (potential structuring)",
    "Unusual wire transfer activity",
    "Correspondent banking activity (suspicious)",
    "Narcotics-related",
    "Other (specify)",
  ],
};

export const RECORDKEEPING_REQUIREMENTS: RecordkeepingRequirement[] = [
  {
    citation: "31 CFR 1010.410(a)",
    description: "Funds transfers of $3,000 or more — transmittor information",
    threshold: "$3,000",
    retentionPeriod: "5 years",
  },
  {
    citation: "31 CFR 1010.410(e)",
    description: "Funds transfers of $3,000 or more — intermediary and recipient institution records",
    threshold: "$3,000",
    retentionPeriod: "5 years",
  },
  {
    citation: "31 CFR 1010.415",
    description: "Purchases of monetary instruments (cashier's checks, money orders, traveler's checks) of $3,000-$10,000",
    threshold: "$3,000-$10,000",
    retentionPeriod: "5 years",
  },
  {
    citation: "31 CFR 1010.420",
    description: "Records to be made and retained by persons having financial interests in foreign financial accounts (FBAR)",
    threshold: "$10,000 aggregate value",
    retentionPeriod: "5 years",
  },
  {
    citation: "31 CFR 1010.430",
    description: "Extension of credit exceeding $10,000",
    threshold: "$10,000",
    retentionPeriod: "5 years",
  },
  {
    citation: "31 CFR 1010.440",
    description: "Records of transactions with foreign financial agencies",
    threshold: "All transactions",
    retentionPeriod: "5 years",
  },
  {
    citation: "12 CFR 21.11",
    description: "Suspicious activity reports filed with FinCEN and supporting documentation",
    threshold: "Per SAR thresholds",
    retentionPeriod: "5 years from date of filing",
  },
];

export const BSA_EXAM_PRIORITIES = [
  "Scoping and Planning (risk-focused approach)",
  "BSA/AML Risk Assessment adequacy",
  "BSA/AML Compliance Program (four pillars)",
  "Customer Identification Program (CIP) effectiveness",
  "Customer Due Diligence (CDD) and Beneficial Ownership",
  "Suspicious Activity Monitoring and Reporting",
  "Currency Transaction Reporting and Exemptions",
  "Information Sharing (314(a) and 314(b))",
  "OFAC Compliance",
  "Special measures and prohibitions under Section 311",
  "Foreign Correspondent Account and Private Banking requirements",
  "Purchase and Sale of Monetary Instruments recordkeeping",
  "Funds Travel Rule compliance",
  "Office of Foreign Assets Control (OFAC)",
] as const;

export type BSAExamPriority = typeof BSA_EXAM_PRIORITIES[number];
