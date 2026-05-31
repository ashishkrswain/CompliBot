/**
 * HIPAA Penalty Tiers and Enforcement Data
 * Per 42 U.S.C. 1320d-5 and 1320d-6 (as amended by HITECH Act)
 */

export interface HIPAAPenaltyTier {
  tier: number;
  name: string;
  description: string;
  minimumPerViolation: number;
  maximumPerViolation: number;
  annualMaximum: number;
  criminalPenalties: string;
  knowledgeLevel: string;
}

export interface HIPAAEnforcementExample {
  year: number;
  entity: string;
  entityType: string;
  violationType: string;
  penaltyAmount: number;
  description: string;
  standardsViolated: string[];
  correctiveActionRequired: boolean;
}

export const HIPAA_PENALTY_TIERS: HIPAAPenaltyTier[] = [
  {
    tier: 1,
    name: "Lack of Knowledge",
    description: "The covered entity or business associate did not know and, by exercising reasonable diligence, would not have known that the act or omission was a violation.",
    minimumPerViolation: 137,
    maximumPerViolation: 68928,
    annualMaximum: 2067852,
    criminalPenalties: "N/A — no criminal liability at this tier",
    knowledgeLevel: "Did not know (and reasonable diligence would not have revealed)",
  },
  {
    tier: 2,
    name: "Reasonable Cause",
    description: "The violation was due to reasonable cause and not willful neglect.",
    minimumPerViolation: 1379,
    maximumPerViolation: 68928,
    annualMaximum: 2067852,
    criminalPenalties: "N/A — civil penalties only at this tier",
    knowledgeLevel: "Reasonable cause (knew or should have known, but not willful neglect)",
  },
  {
    tier: 3,
    name: "Willful Neglect — Corrected",
    description: "The violation was due to willful neglect and was corrected within the required time period (30 days from when the entity knew or should have known).",
    minimumPerViolation: 13785,
    maximumPerViolation: 68928,
    annualMaximum: 2067852,
    criminalPenalties: "Up to $50,000 fine and 1 year imprisonment for knowingly obtaining/disclosing PHI",
    knowledgeLevel: "Willful neglect, corrected within 30 days",
  },
  {
    tier: 4,
    name: "Willful Neglect — Not Corrected",
    description: "The violation was due to willful neglect and was NOT corrected within the required time period.",
    minimumPerViolation: 68928,
    maximumPerViolation: 2067852,
    annualMaximum: 2067852,
    criminalPenalties: "Up to $250,000 fine and up to 10 years imprisonment for offenses committed under false pretenses; up to $250,000 and 10 years for intent to sell, transfer, or use PHI for commercial advantage, personal gain, or malicious harm",
    knowledgeLevel: "Willful neglect, not corrected",
  },
];

export const HIPAA_ENFORCEMENT_EXAMPLES: HIPAAEnforcementExample[] = [
  {
    year: 2023,
    entity: "Doctors' Management Services",
    entityType: "Business Associate",
    violationType: "Risk Analysis Failure + Ransomware",
    penaltyAmount: 100000,
    description: "Failed to conduct an accurate and thorough risk analysis prior to a ransomware attack that affected over 200,000 individuals. Failed to have sufficient monitoring of health information systems activity.",
    standardsViolated: ["164.308(a)(1)(ii)(A)", "164.308(a)(1)(ii)(D)", "164.312(b)"],
    correctiveActionRequired: true,
  },
  {
    year: 2023,
    entity: "Banner Health",
    entityType: "Covered Entity - Health System",
    violationType: "Large-Scale Breach - Hacking Incident",
    penaltyAmount: 1250000,
    description: "Data breach affecting approximately 2.81 million individuals due to hacking incident. OCR found longstanding noncompliance with the HIPAA Security Rule including failure to conduct enterprise-wide risk analysis.",
    standardsViolated: ["164.308(a)(1)(ii)(A)", "164.308(a)(1)(ii)(B)", "164.312(a)(1)", "164.312(e)(1)"],
    correctiveActionRequired: true,
  },
  {
    year: 2023,
    entity: "LA Care Health Plan",
    entityType: "Covered Entity - Health Plan",
    violationType: "Impermissible Disclosure",
    penaltyAmount: 1300000,
    description: "Two breaches involving unauthorized access to member portals affecting over 1,400 individuals. Processing errors allowed members to access other members' PHI.",
    standardsViolated: ["164.308(a)(4)", "164.312(a)(1)", "164.308(a)(1)(ii)(A)"],
    correctiveActionRequired: true,
  },
  {
    year: 2022,
    entity: "Oklahoma State University Center for Health Sciences",
    entityType: "Covered Entity - Academic Medical Center",
    violationType: "Risk Analysis + Breach",
    penaltyAmount: 875000,
    description: "Web server breach exposed ePHI of nearly 280,000 individuals. OCR found the entity failed to have sufficient risk analysis, security incident procedures, and audit controls.",
    standardsViolated: ["164.308(a)(1)(ii)(A)", "164.308(a)(6)(ii)", "164.312(b)"],
    correctiveActionRequired: true,
  },
  {
    year: 2022,
    entity: "Health Educators Inc. (HICA)",
    entityType: "Business Associate",
    violationType: "Right of Access Failure",
    penaltyAmount: 55000,
    description: "Failed to provide a patient with timely access to their medical records. Patient filed complaint after entity failed to respond to multiple requests over a 7-month period.",
    standardsViolated: ["164.524"],
    correctiveActionRequired: true,
  },
  {
    year: 2021,
    entity: "Excellus Health Plan",
    entityType: "Covered Entity - Health Plan",
    violationType: "Large-Scale Breach - Cyberattack",
    penaltyAmount: 5100000,
    description: "Cyberattack affecting over 9.3 million individuals. Hackers installed malware and had access for over 2 years. OCR found failures in risk analysis, risk management, access controls, and audit controls.",
    standardsViolated: ["164.308(a)(1)(ii)(A)", "164.308(a)(1)(ii)(B)", "164.312(a)(1)", "164.312(b)"],
    correctiveActionRequired: true,
  },
  {
    year: 2021,
    entity: "Peachstate Health Management",
    entityType: "Business Associate",
    violationType: "Risk Analysis + Security Management",
    penaltyAmount: 25000,
    description: "Small business associate failed to conduct a security risk analysis and implement security measures. Discovered during breach investigation of a ransomware attack.",
    standardsViolated: ["164.308(a)(1)(ii)(A)", "164.308(a)(1)(ii)(B)"],
    correctiveActionRequired: true,
  },
  {
    year: 2020,
    entity: "Premera Blue Cross",
    entityType: "Covered Entity - Health Plan",
    violationType: "Large-Scale Breach - Hacking",
    penaltyAmount: 6850000,
    description: "Breach affecting over 10.4 million individuals resulting from an advanced persistent threat. OCR investigation revealed longstanding noncompliance with HIPAA Rules including risk analysis, risk management, and audit controls.",
    standardsViolated: ["164.308(a)(1)(ii)(A)", "164.308(a)(1)(ii)(B)", "164.312(a)(1)", "164.312(b)", "164.312(e)(1)"],
    correctiveActionRequired: true,
  },
  {
    year: 2020,
    entity: "CHSPSC LLC",
    entityType: "Business Associate",
    violationType: "Large-Scale Breach - APT Attack",
    penaltyAmount: 2300000,
    description: "Business associate to Community Health Systems. Breach affected 6.12 million individuals from an APT group attack in 2014. Failed to implement information system activity review, risk analysis, and access controls.",
    standardsViolated: ["164.308(a)(1)(ii)(A)", "164.308(a)(1)(ii)(D)", "164.312(a)(1)"],
    correctiveActionRequired: true,
  },
  {
    year: 2019,
    entity: "University of Rochester Medical Center",
    entityType: "Covered Entity - Academic Medical Center",
    violationType: "Encryption Failure + Lost Devices",
    penaltyAmount: 3000000,
    description: "Lost unencrypted flash drive and stolen unencrypted laptop containing ePHI. Investigation revealed failure to implement encryption on portable devices despite prior similar incidents.",
    standardsViolated: ["164.312(a)(2)(iv)", "164.310(d)(1)", "164.308(a)(1)(ii)(A)"],
    correctiveActionRequired: true,
  },
];

export function getPenaltyTier(tier: number): HIPAAPenaltyTier | undefined {
  return HIPAA_PENALTY_TIERS.find((t) => t.tier === tier);
}

export function getMaxPenaltyForViolation(): number {
  return HIPAA_PENALTY_TIERS[3]!.maximumPerViolation;
}

export function getEnforcementExamplesByYear(year: number): HIPAAEnforcementExample[] {
  return HIPAA_ENFORCEMENT_EXAMPLES.filter((e) => e.year === year);
}

export function getEnforcementExamplesByEntityType(entityType: string): HIPAAEnforcementExample[] {
  return HIPAA_ENFORCEMENT_EXAMPLES.filter((e) =>
    e.entityType.toLowerCase().includes(entityType.toLowerCase())
  );
}

export function getLargestPenalties(count: number): HIPAAEnforcementExample[] {
  return [...HIPAA_ENFORCEMENT_EXAMPLES]
    .sort((a, b) => b.penaltyAmount - a.penaltyAmount)
    .slice(0, count);
}
