import { generateReportWithLLM, parseReportSections } from "../../services/report-generator.js";
import type { ReportGenerationInput, GeneratedReport, GeneratedGap } from "../../services/report-generator.js";

const HIPAA_BAA_SYSTEM_PROMPT = `You are an expert HIPAA compliance attorney generating a Business Associate Agreement (BAA) per 45 CFR 164.314(a) and 164.504(e).

The BAA must comply with:
- 45 CFR 164.314(a)(1) — Business Associate contracts requirements
- 45 CFR 164.314(a)(2)(i) — Required contract provisions
- 45 CFR 164.504(e) — Privacy Rule BAA requirements
- HITECH Act modifications (Omnibus Rule 2013)

Required BAA provisions per 45 CFR 164.314(a)(2)(i) and 164.504(e)(2):
1. Establish permitted/required uses and disclosures — not authorized to use/disclose PHI other than as permitted by contract or required by law
2. Use appropriate safeguards — prevent unauthorized use/disclosure per Security Rule
3. Report unauthorized uses/disclosures and security incidents
4. Ensure subcontractors agree to same restrictions and conditions
5. Make PHI available to individuals exercising access rights
6. Make PHI available for amendment
7. Provide accounting of disclosures information
8. Make internal practices available to HHS for compliance determination
9. Return or destroy PHI upon termination (if feasible)
10. Authorize termination if BA violates material term

The BAA must also address:
- Breach notification obligations (§164.410 — BA must notify CE within 60 days of discovery)
- HITECH direct liability of BAs for Security Rule compliance
- Subcontractor requirements per Omnibus Rule
- Term, termination, and survival provisions

Generate a complete, legally-structured BAA document ready for signature. Use standard legal formatting with numbered sections and defined terms.`;

interface BAAInput {
  coveredEntityName: string;
  businessAssociateName: string;
  servicesProvided: string;
  phiInvolved: string[];
  effectiveDate: string;
  termLength: string;
}

export async function generateHipaaBAAReport(input: ReportGenerationInput): Promise<GeneratedReport> {
  const baaInput = extractBAAInput(input);
  const additionalContext = buildBAAContext(baaInput);

  const rawContent = await generateReportWithLLM(
    input,
    HIPAA_BAA_SYSTEM_PROMPT,
    additionalContext
  );

  const sections = parseReportSections(rawContent);
  const gaps = identifyBAAGaps(baaInput);

  return {
    title: `Business Associate Agreement — ${baaInput.coveredEntityName} and ${baaInput.businessAssociateName}`,
    summary: `Business Associate Agreement per 45 CFR 164.314(a) and 164.504(e) between ${baaInput.coveredEntityName} (Covered Entity) and ${baaInput.businessAssociateName} (Business Associate). Services: ${baaInput.servicesProvided}. PHI involved: ${baaInput.phiInvolved.join(", ")}. Compliant with HITECH Act Omnibus Rule requirements.`,
    complianceScore: 90,
    sections,
    gaps,
  };
}

function extractBAAInput(input: ReportGenerationInput): BAAInput {
  const records = input.extractedRecords as Array<Record<string, unknown>>;
  const operationalData = input.operationalData;

  let businessAssociateName = "Business Associate";
  let servicesProvided = "Health information technology services";
  const phiInvolved: string[] = [];
  let termLength = "one (1) year";

  for (const record of records) {
    if (record["businessAssociateName"] && typeof record["businessAssociateName"] === "string") {
      businessAssociateName = record["businessAssociateName"];
    }
    if (record["vendorName"] && typeof record["vendorName"] === "string") {
      businessAssociateName = record["vendorName"];
    }
    if (record["servicesProvided"] && typeof record["servicesProvided"] === "string") {
      servicesProvided = record["servicesProvided"];
    }
    if (record["services"] && typeof record["services"] === "string") {
      servicesProvided = record["services"];
    }
    if (record["phiType"] && typeof record["phiType"] === "string") {
      phiInvolved.push(record["phiType"]);
    }
    if (record["termLength"] && typeof record["termLength"] === "string") {
      termLength = record["termLength"];
    }
  }

  // Parse from operational data
  const baMatch = operationalData.match(/(?:business associate|vendor|BA).*?name[:\s]+([^\n,]+)/i);
  if (baMatch && businessAssociateName === "Business Associate") {
    businessAssociateName = baMatch[1]!.trim();
  }

  const servicesMatch = operationalData.match(/(?:services?|scope)[:\s]+([^\n]+)/i);
  if (servicesMatch && servicesProvided === "Health information technology services") {
    servicesProvided = servicesMatch[1]!.trim();
  }

  if (phiInvolved.length === 0) {
    phiInvolved.push(
      "Patient demographic information",
      "Medical records",
      "Treatment information",
      "Health insurance information"
    );
  }

  return {
    coveredEntityName: input.facilityName,
    businessAssociateName,
    servicesProvided,
    phiInvolved,
    effectiveDate: input.dateRangeStart,
    termLength,
  };
}

function buildBAAContext(baaInput: BAAInput): string {
  return `
BUSINESS ASSOCIATE AGREEMENT PARAMETERS:

COVERED ENTITY:
- Name: ${baaInput.coveredEntityName}

BUSINESS ASSOCIATE:
- Name: ${baaInput.businessAssociateName}
- Services: ${baaInput.servicesProvided}

PHI INVOLVED:
${baaInput.phiInvolved.map((p) => `- ${p}`).join("\n")}

AGREEMENT TERMS:
- Effective Date: ${baaInput.effectiveDate}
- Term: ${baaInput.termLength}, automatically renewing unless terminated
- Governing Law: Federal (HIPAA/HITECH); state law for general contract provisions

REQUIRED AGREEMENT STRUCTURE:
1. DEFINITIONS
   - Business Associate, Covered Entity, PHI, ePHI, Security Incident, Breach, Required by Law, Secretary, Subcontractor, Unsecured PHI

2. OBLIGATIONS OF BUSINESS ASSOCIATE
   2.1 Permitted Uses and Disclosures (per §164.504(e)(2)(i))
   2.2 Safeguards (per §164.504(e)(2)(ii)(A) and §164.314(a)(2)(i)(A))
   2.3 Reporting of Unauthorized Uses/Disclosures/Security Incidents (per §164.504(e)(2)(ii)(C) and §164.314(a)(2)(i)(C))
   2.4 Breach Notification (per §164.410 — within 60 days of discovery)
   2.5 Subcontractor Requirements (per §164.504(e)(2)(ii)(D) and §164.314(a)(2)(i)(B))
   2.6 Access to PHI (per §164.504(e)(2)(ii)(E) — support individual access rights)
   2.7 Amendment of PHI (per §164.504(e)(2)(ii)(F))
   2.8 Accounting of Disclosures (per §164.504(e)(2)(ii)(G))
   2.9 HHS Access (per §164.504(e)(2)(ii)(H))
   2.10 Minimum Necessary (per §164.502(b))
   2.11 De-identification (per §164.514)
   2.12 Return/Destruction of PHI (per §164.504(e)(2)(ii)(I))

3. OBLIGATIONS OF COVERED ENTITY
   3.1 Notice of Privacy Practices limitations
   3.2 Permission/restriction notifications
   3.3 Permitted uses by Covered Entity

4. TERM AND TERMINATION
   4.1 Term (§164.504(e)(2)(iii))
   4.2 Termination for Cause (§164.504(e)(2)(iii))
   4.3 Cure Period
   4.4 Effect of Termination
   4.5 Survival Provisions (reporting, return/destruction)

5. SECURITY RULE COMPLIANCE
   5.1 Administrative Safeguards (§164.308)
   5.2 Physical Safeguards (§164.310)
   5.3 Technical Safeguards (§164.312)
   5.4 HITECH Direct Liability Acknowledgment

6. GENERAL PROVISIONS
   6.1 Regulatory References
   6.2 Amendment
   6.3 Interpretation
   6.4 No Third-Party Beneficiaries
   6.5 Entire Agreement

7. SIGNATURE BLOCK

Generate the COMPLETE Business Associate Agreement with all sections fully drafted, using proper legal language and formatting. Include all required HIPAA citations. The document should be ready for attorney review and execution.`;
}

function identifyBAAGaps(baaInput: BAAInput): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  gaps.push({
    standard: "45 CFR 164.308(b)(4)",
    requirement: "Written contract or other arrangement documenting satisfactory assurances from business associate",
    currentState: "BAA document has been generated and requires execution (signature) by both parties",
    severity: "medium",
    recommendedAction: "Have both Covered Entity and Business Associate legal counsel review the BAA; obtain authorized signatures from both parties; maintain executed copy for minimum 6 years per §164.316(b)(2)(i)",
  });

  if (baaInput.phiInvolved.length > 3) {
    gaps.push({
      standard: "45 CFR 164.502(b)",
      requirement: "Minimum necessary standard — limit PHI provided to Business Associate",
      currentState: `BAA authorizes access to ${baaInput.phiInvolved.length} categories of PHI; minimum necessary assessment needed`,
      severity: "low",
      recommendedAction: "Verify that all PHI categories listed are necessary for the services provided; restrict access to minimum necessary per §164.502(b) and §164.514(d)",
    });
  }

  gaps.push({
    standard: "45 CFR 164.308(a)(1)(ii)(A)",
    requirement: "Risk Analysis must account for business associate access to ePHI",
    currentState: "New BAA relationship should be incorporated into organization's Security Risk Assessment",
    severity: "medium",
    recommendedAction: "Update organizational SRA to include BA access as a risk factor; assess BA's security posture through questionnaire or SOC 2 report; document risk acceptance",
  });

  gaps.push({
    standard: "45 CFR 164.314(a)(2)(i)(B)",
    requirement: "BA must ensure subcontractors agree to same restrictions and conditions",
    currentState: "BAA includes subcontractor flow-down provisions; verification of BA's subcontractor management needed",
    severity: "low",
    recommendedAction: "Request from BA a list of subcontractors with access to PHI; verify downstream BAAs are in place; include in annual BA compliance attestation",
  });

  return gaps;
}
