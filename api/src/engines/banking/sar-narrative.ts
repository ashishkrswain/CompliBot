import { generateCompletion } from "../../lib/llm.js";
import { parseReportSections } from "../../services/report-generator.js";
import type { GeneratedReport, GeneratedGap, GeneratedSection } from "../../services/report-generator.js";

type TransactionType = "cash-deposit" | "cash-withdrawal" | "wire-transfer-domestic" | "wire-transfer-international" | "ach" | "check" | "monetary-instrument" | "account-transfer" | "loan-payment" | "other";

interface SARSubject {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  dateOfBirth: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  idType: string;
  idNumber: string;
  idIssuingState: string;
  occupation: string;
  phoneNumber: string;
  email: string;
  relationship: "accountholder" | "agent" | "borrower" | "customer" | "former-employee" | "employee" | "officer" | "director" | "shareholder" | "no-relationship" | "other";
  relationshipDescription: string;
  accountNumbers: string[];
  branchOfActivity: string;
}

interface SuspiciousTransaction {
  date: string;
  type: TransactionType;
  amount: number;
  fromAccount: string;
  toAccount: string;
  beneficiary: string;
  originatorBank: string;
  beneficiaryBank: string;
  referenceNumber: string;
  description: string;
  suspiciousIndicators: string[];
}

interface RedFlag {
  category: string;
  description: string;
  observedDate: string;
  evidence: string;
}

interface TimelineEvent {
  date: string;
  event: string;
  actors: string[];
  significance: string;
}

export interface SARNarrativeInput {
  filingInstitution: {
    name: string;
    rssd: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    primaryRegulator: "OCC" | "FRB" | "FDIC" | "NCUA" | "SEC" | "FinCEN";
  };
  subjects: SARSubject[];
  suspiciousActivityType: string[];
  cumulativeAmount: number;
  activityDateRangeStart: string;
  activityDateRangeEnd: string;
  transactions: SuspiciousTransaction[];
  redFlags: RedFlag[];
  timeline: TimelineEvent[];
  actionsTaken: string[];
  lawEnforcementContact: {
    contacted: boolean;
    agencyName: string;
    agentName: string;
    phoneNumber: string;
    caseNumber: string;
  };
  priorSARs: {
    hasPriorFilings: boolean;
    priorSARNumbers: string[];
    cumulativePriorAmount: number;
  };
  isContinuingActivity: boolean;
  narrativeNotes: string;
}

export async function generateSARNarrativeReport(input: SARNarrativeInput): Promise<GeneratedReport> {
  const narrative = buildSARNarrative(input);
  const qualityAssessment = assessNarrativeQuality(input);

  const systemPrompt = `You are a BSA/AML analyst generating a SAR narrative per FinCEN filing requirements. The narrative must:

1. Be completely FACTUAL — no legal conclusions, no statements about criminal intent
2. Follow the "5 Ws" structure: Who, What, When, Where, Why/How
3. Include specific transaction details (dates, amounts, account numbers)
4. Describe the suspicious activity pattern clearly
5. Reference specific red flags observed
6. Use past tense and third person
7. Avoid jargon, abbreviations, or acronyms without first spelling out
8. Include all subjects with identifying information
9. Reference institution's relationship with subject
10. Note any actions taken by the institution

Per FinCEN guidance, a quality SAR narrative should tell a complete story that would allow law enforcement to understand the activity without accessing other SAR fields.

CRITICAL: Do NOT state or imply that any crime occurred. Use language like "appears to be," "may indicate," "is consistent with patterns associated with," rather than definitive statements.`;

  const additionalContext = buildNarrativeContext(input, narrative);

  const rawContent = await generateCompletion(systemPrompt, additionalContext, {
    temperature: 0.15,
    maxTokens: 6144,
  });

  const sections: GeneratedSection[] = [
    {
      order: 1,
      title: "SAR Narrative (Filing-Ready)",
      content: narrative,
      citations: ["31 CFR 1010.320", "31 USC 5318(g)", "FinCEN SAR Activity Review (Narrative Quality)"],
      findings: input.redFlags.map((rf) => `${rf.category}: ${rf.description}`),
      recommendations: [],
    },
    {
      order: 2,
      title: "Narrative Quality Assessment",
      content: formatQualityAssessment(qualityAssessment),
      citations: ["FinCEN SAR Narrative Guidance", "FFIEC BSA/AML Manual — SAR Quality"],
      findings: qualityAssessment.deficiencies,
      recommendations: qualityAssessment.suggestions,
    },
    ...parseReportSections(rawContent),
  ];

  const gaps = identifySARGaps(input, qualityAssessment);

  return {
    title: `SAR Narrative — ${input.subjects.map((s) => `${s.lastName}, ${s.firstName}`).join("; ")} — ${input.activityDateRangeStart} to ${input.activityDateRangeEnd}`,
    summary: `Suspicious Activity Report narrative for ${input.subjects.length} subject(s). Activity type: ${input.suspiciousActivityType.join(", ")}. Cumulative amount: $${input.cumulativeAmount.toLocaleString()}. Activity period: ${input.activityDateRangeStart} through ${input.activityDateRangeEnd}. ${input.isContinuingActivity ? "CONTINUING ACTIVITY — prior SARs on file." : "Initial filing."}`,
    complianceScore: calculateSARComplianceScore(qualityAssessment),
    sections,
    gaps,
  };
}

function buildSARNarrative(input: SARNarrativeInput): string {
  const parts: string[] = [];

  // Opening paragraph — institution identification and filing summary
  parts.push(buildOpeningParagraph(input));

  // Subject information
  parts.push(buildSubjectParagraph(input));

  // Relationship to institution
  parts.push(buildRelationshipParagraph(input));

  // Suspicious activity description (What/When/Where/How)
  parts.push(buildActivityDescriptionParagraph(input));

  // Transaction details
  parts.push(buildTransactionDetailParagraph(input));

  // Red flags and indicators
  parts.push(buildRedFlagsParagraph(input));

  // Actions taken by institution
  parts.push(buildActionsTakenParagraph(input));

  // Law enforcement contact
  if (input.lawEnforcementContact.contacted) {
    parts.push(buildLawEnforcementParagraph(input));
  }

  // Prior SARs
  if (input.priorSARs.hasPriorFilings) {
    parts.push(buildPriorSARsParagraph(input));
  }

  return parts.join("\n\n");
}

function buildOpeningParagraph(input: SARNarrativeInput): string {
  const subjectNames = input.subjects.map((s) => `${s.firstName} ${s.lastName}`).join(" and ");
  const activityTypes = input.suspiciousActivityType.join(", ");

  return `${input.filingInstitution.name}, located at ${input.filingInstitution.address}, ${input.filingInstitution.city}, ${input.filingInstitution.state} ${input.filingInstitution.zipCode}, is filing this Suspicious Activity Report to report activity involving ${subjectNames} that is consistent with ${activityTypes}. The suspicious activity occurred during the period of ${input.activityDateRangeStart} through ${input.activityDateRangeEnd}, and involved a cumulative amount of approximately $${input.cumulativeAmount.toLocaleString()}.${input.isContinuingActivity ? " This is a continuing activity report." : ""}`;
}

function buildSubjectParagraph(input: SARNarrativeInput): string {
  const subjectDescriptions = input.subjects.map((subject) => {
    const nameParts = [subject.firstName, subject.middleName, subject.lastName, subject.suffix].filter((p) => p.trim() !== "");
    const fullName = nameParts.join(" ");

    let description = `${fullName}`;
    if (subject.dateOfBirth) {
      description += `, date of birth ${subject.dateOfBirth}`;
    }
    if (subject.ssn) {
      description += `, Social Security Number xxx-xx-${subject.ssn.slice(-4)}`;
    }
    if (subject.address) {
      description += `, residing at ${subject.address}, ${subject.city}, ${subject.state} ${subject.zipCode}`;
    }
    if (subject.idType && subject.idNumber) {
      description += `. Subject's identification is a ${subject.idType}, number ${subject.idNumber}`;
      if (subject.idIssuingState) {
        description += `, issued by ${subject.idIssuingState}`;
      }
    }
    if (subject.occupation) {
      description += `. Subject's stated occupation is ${subject.occupation}`;
    }

    return description;
  });

  return `SUBJECT INFORMATION:\n${subjectDescriptions.map((d) => d + ".").join("\n")}`;
}

function buildRelationshipParagraph(input: SARNarrativeInput): string {
  const relationships = input.subjects.map((subject) => {
    const accounts = subject.accountNumbers.length > 0
      ? `account number(s) ${subject.accountNumbers.join(", ")}`
      : "no known accounts";
    return `${subject.firstName} ${subject.lastName} is a ${subject.relationship.replace("-", " ")} of ${input.filingInstitution.name}${subject.relationshipDescription ? ` (${subject.relationshipDescription})` : ""}, maintaining ${accounts} at the ${subject.branchOfActivity} branch`;
  });

  return `RELATIONSHIP TO INSTITUTION:\n${relationships.map((r) => r + ".").join("\n")}`;
}

function buildActivityDescriptionParagraph(input: SARNarrativeInput): string {
  const chronologicalEvents = [...input.timeline].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let paragraph = "DESCRIPTION OF SUSPICIOUS ACTIVITY:\n";

  if (chronologicalEvents.length > 0) {
    paragraph += chronologicalEvents
      .map((event) => `On ${event.date}, ${event.event}${event.actors.length > 0 ? ` (involving ${event.actors.join(", ")})` : ""}.${event.significance ? ` ${event.significance}.` : ""}`)
      .join(" ");
  } else {
    // Build from transactions if no timeline provided
    const sortedTransactions = [...input.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = sortedTransactions[0]?.date ?? input.activityDateRangeStart;
    const lastDate = sortedTransactions[sortedTransactions.length - 1]?.date ?? input.activityDateRangeEnd;
    const totalAmount = input.transactions.reduce((sum, t) => sum + t.amount, 0);

    paragraph += `Between ${firstDate} and ${lastDate}, ${input.subjects.map((s) => `${s.firstName} ${s.lastName}`).join(" and ")} conducted ${input.transactions.length} transactions totaling approximately $${totalAmount.toLocaleString()} that appear suspicious in nature.`;
  }

  return paragraph;
}

function buildTransactionDetailParagraph(input: SARNarrativeInput): string {
  if (input.transactions.length === 0) {
    return "TRANSACTION DETAILS:\nSpecific transaction details are maintained in the institution's records and available upon law enforcement request.";
  }

  const sortedTransactions = [...input.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const transactionDescriptions = sortedTransactions.map((txn) => {
    let desc = `On ${txn.date}, a ${formatTransactionType(txn.type)} in the amount of $${txn.amount.toLocaleString()}`;
    if (txn.fromAccount) desc += ` from account ${txn.fromAccount}`;
    if (txn.toAccount) desc += ` to account ${txn.toAccount}`;
    if (txn.beneficiary) desc += ` for the benefit of ${txn.beneficiary}`;
    if (txn.beneficiaryBank) desc += ` at ${txn.beneficiaryBank}`;
    if (txn.description) desc += `. ${txn.description}`;
    if (txn.suspiciousIndicators.length > 0) {
      desc += `. This transaction ${txn.suspiciousIndicators.join("; ")}`;
    }
    return desc;
  });

  const totalAmount = sortedTransactions.reduce((sum, t) => sum + t.amount, 0);

  return `TRANSACTION DETAILS:\nThe following transactions were identified as suspicious:\n\n${transactionDescriptions.map((d) => d + ".").join("\n\n")}\n\nThe total amount of suspicious activity identified is approximately $${totalAmount.toLocaleString()}.`;
}

function buildRedFlagsParagraph(input: SARNarrativeInput): string {
  if (input.redFlags.length === 0) {
    return "";
  }

  const flagsByCategory = new Map<string, RedFlag[]>();
  for (const flag of input.redFlags) {
    const existing = flagsByCategory.get(flag.category) ?? [];
    existing.push(flag);
    flagsByCategory.set(flag.category, existing);
  }

  let paragraph = "RED FLAGS AND INDICATORS:\nThe following indicators of potentially suspicious activity were identified:\n\n";

  for (const [category, flags] of flagsByCategory) {
    paragraph += `${category}:\n`;
    for (const flag of flags) {
      paragraph += `- ${flag.description}`;
      if (flag.observedDate) paragraph += ` (observed ${flag.observedDate})`;
      if (flag.evidence) paragraph += `. Supporting evidence: ${flag.evidence}`;
      paragraph += ".\n";
    }
    paragraph += "\n";
  }

  return paragraph.trim();
}

function buildActionsTakenParagraph(input: SARNarrativeInput): string {
  if (input.actionsTaken.length === 0) {
    return "ACTIONS TAKEN:\nThe institution is filing this SAR and will continue to monitor the subject's account activity.";
  }

  return `ACTIONS TAKEN:\nIn response to the identified suspicious activity, ${input.filingInstitution.name} has taken the following actions:\n${input.actionsTaken.map((a) => `- ${a}`).join("\n")}`;
}

function buildLawEnforcementParagraph(input: SARNarrativeInput): string {
  const le = input.lawEnforcementContact;
  let paragraph = `LAW ENFORCEMENT CONTACT:\n${input.filingInstitution.name} has contacted law enforcement regarding this activity. `;
  paragraph += `Contact was made with ${le.agencyName}`;
  if (le.agentName) paragraph += `, Agent/Detective ${le.agentName}`;
  if (le.phoneNumber) paragraph += `, telephone ${le.phoneNumber}`;
  paragraph += ".";
  if (le.caseNumber) paragraph += ` A case number of ${le.caseNumber} was assigned.`;

  return paragraph;
}

function buildPriorSARsParagraph(input: SARNarrativeInput): string {
  const prior = input.priorSARs;
  let paragraph = `PRIOR SAR FILINGS:\n${input.filingInstitution.name} has previously filed ${prior.priorSARNumbers.length} Suspicious Activity Report(s) regarding this subject/activity.`;

  if (prior.priorSARNumbers.length > 0) {
    paragraph += ` Prior SAR document control number(s): ${prior.priorSARNumbers.join(", ")}.`;
  }

  if (prior.cumulativePriorAmount > 0) {
    paragraph += ` The cumulative amount of suspicious activity reported in prior filings is approximately $${prior.cumulativePriorAmount.toLocaleString()}.`;
  }

  const totalCumulative = input.cumulativeAmount + prior.cumulativePriorAmount;
  paragraph += ` The total cumulative amount of suspicious activity (all filings) is approximately $${totalCumulative.toLocaleString()}.`;

  return paragraph;
}

function formatTransactionType(type: TransactionType): string {
  const typeMap: Record<TransactionType, string> = {
    "cash-deposit": "cash deposit",
    "cash-withdrawal": "cash withdrawal",
    "wire-transfer-domestic": "domestic wire transfer",
    "wire-transfer-international": "international wire transfer",
    "ach": "ACH transaction",
    "check": "check transaction",
    "monetary-instrument": "monetary instrument purchase",
    "account-transfer": "internal account transfer",
    "loan-payment": "loan payment",
    "other": "transaction",
  };
  return typeMap[type];
}

interface NarrativeQualityAssessment {
  overallQuality: "excellent" | "good" | "adequate" | "deficient";
  completenessScore: number;
  elements: QualityElement[];
  deficiencies: string[];
  suggestions: string[];
}

interface QualityElement {
  element: string;
  present: boolean;
  quality: "complete" | "partial" | "missing";
  note: string;
}

function assessNarrativeQuality(input: SARNarrativeInput): NarrativeQualityAssessment {
  const elements: QualityElement[] = [
    {
      element: "Who — Subject identification",
      present: input.subjects.length > 0 && input.subjects[0]!.lastName.trim() !== "",
      quality: input.subjects.every((s) => s.lastName && s.firstName && s.dateOfBirth) ? "complete" : input.subjects[0]!.lastName ? "partial" : "missing",
      note: input.subjects.every((s) => s.lastName && s.firstName && s.dateOfBirth)
        ? "All subjects fully identified with name, DOB, and identification"
        : "Some subject identifying information is incomplete",
    },
    {
      element: "What — Activity description",
      present: input.suspiciousActivityType.length > 0,
      quality: input.suspiciousActivityType.length > 0 && input.transactions.length > 0 ? "complete" : input.suspiciousActivityType.length > 0 ? "partial" : "missing",
      note: input.transactions.length > 0 ? "Specific transactions documented" : "Activity type identified but specific transaction detail needed",
    },
    {
      element: "When — Activity timeframe",
      present: Boolean(input.activityDateRangeStart && input.activityDateRangeEnd),
      quality: input.activityDateRangeStart && input.activityDateRangeEnd && input.transactions.length > 0 ? "complete" : input.activityDateRangeStart ? "partial" : "missing",
      note: input.transactions.every((t) => t.date) ? "All transactions dated" : "Some transaction dates missing",
    },
    {
      element: "Where — Location/account information",
      present: input.subjects.some((s) => s.accountNumbers.length > 0 || s.branchOfActivity !== ""),
      quality: input.subjects.every((s) => s.accountNumbers.length > 0 && s.branchOfActivity !== "") ? "complete" : input.subjects.some((s) => s.accountNumbers.length > 0) ? "partial" : "missing",
      note: input.subjects.some((s) => s.branchOfActivity !== "") ? "Branch of activity identified" : "Location information needed",
    },
    {
      element: "Why/How — Suspicious indicators",
      present: input.redFlags.length > 0,
      quality: input.redFlags.length >= 3 ? "complete" : input.redFlags.length > 0 ? "partial" : "missing",
      note: input.redFlags.length > 0 ? `${input.redFlags.length} red flag(s) documented` : "No red flags documented — narrative must explain why activity is suspicious",
    },
    {
      element: "Amount — Cumulative suspicious amount",
      present: input.cumulativeAmount > 0,
      quality: input.cumulativeAmount > 0 && input.transactions.length > 0 ? "complete" : input.cumulativeAmount > 0 ? "partial" : "missing",
      note: input.cumulativeAmount > 0 ? `$${input.cumulativeAmount.toLocaleString()} cumulative amount` : "Amount not specified",
    },
    {
      element: "Actions taken",
      present: input.actionsTaken.length > 0,
      quality: input.actionsTaken.length >= 2 ? "complete" : input.actionsTaken.length > 0 ? "partial" : "missing",
      note: input.actionsTaken.length > 0 ? `${input.actionsTaken.length} action(s) documented` : "No actions taken documented",
    },
    {
      element: "Prior SAR history",
      present: !input.priorSARs.hasPriorFilings || input.priorSARs.priorSARNumbers.length > 0,
      quality: !input.priorSARs.hasPriorFilings ? "complete" : input.priorSARs.priorSARNumbers.length > 0 ? "complete" : "partial",
      note: input.priorSARs.hasPriorFilings ? `${input.priorSARs.priorSARNumbers.length} prior SAR(s) referenced` : "No prior SAR history (initial filing)",
    },
  ];

  const completeCount = elements.filter((e) => e.quality === "complete").length;
  const completenessScore = Math.round((completeCount / elements.length) * 100);

  const deficiencies: string[] = [];
  const suggestions: string[] = [];

  for (const element of elements) {
    if (element.quality === "missing") {
      deficiencies.push(`MISSING: ${element.element} — ${element.note}`);
    } else if (element.quality === "partial") {
      suggestions.push(`ENHANCE: ${element.element} — ${element.note}`);
    }
  }

  if (input.transactions.length > 0 && input.transactions.some((t) => t.suspiciousIndicators.length === 0)) {
    suggestions.push("Some transactions lack specific suspicious indicators — add details on why each transaction is suspicious");
  }

  if (!input.narrativeNotes) {
    suggestions.push("Consider adding analyst notes with additional context or investigative findings");
  }

  let overallQuality: NarrativeQualityAssessment["overallQuality"];
  if (completenessScore >= 90 && deficiencies.length === 0) overallQuality = "excellent";
  else if (completenessScore >= 75 && deficiencies.length <= 1) overallQuality = "good";
  else if (completenessScore >= 50) overallQuality = "adequate";
  else overallQuality = "deficient";

  return { overallQuality, completenessScore, elements, deficiencies, suggestions };
}

function formatQualityAssessment(assessment: NarrativeQualityAssessment): string {
  let content = `## Narrative Quality Assessment\n`;
  content += `**Overall Quality:** ${assessment.overallQuality.toUpperCase()}\n`;
  content += `**Completeness Score:** ${assessment.completenessScore}%\n\n`;
  content += `### Element Assessment (per FinCEN SAR Narrative Guidance)\n\n`;
  content += `| Element | Status | Assessment |\n|---|---|---|\n`;

  for (const element of assessment.elements) {
    const statusIcon = element.quality === "complete" ? "COMPLETE" : element.quality === "partial" ? "PARTIAL" : "MISSING";
    content += `| ${element.element} | ${statusIcon} | ${element.note} |\n`;
  }

  if (assessment.deficiencies.length > 0) {
    content += `\n### Deficiencies Requiring Correction\n${assessment.deficiencies.map((d) => `- ${d}`).join("\n")}`;
  }

  if (assessment.suggestions.length > 0) {
    content += `\n### Suggestions for Enhancement\n${assessment.suggestions.map((s) => `- ${s}`).join("\n")}`;
  }

  return content;
}

function identifySARGaps(input: SARNarrativeInput, quality: NarrativeQualityAssessment): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  if (quality.overallQuality === "deficient") {
    gaps.push({
      standard: "31 CFR 1010.320 / FinCEN SAR Quality Guidance",
      requirement: "SAR narrative must provide a clear, complete, and concise description of the suspicious activity including all essential elements (who, what, when, where, why/how)",
      currentState: `Narrative quality rated DEFICIENT (${quality.completenessScore}% completeness); missing elements: ${quality.deficiencies.map((d) => d.split("—")[0]).join(", ")}`,
      severity: "high",
      recommendedAction: "Supplement narrative with missing information before filing; deficient narratives may result in examiner criticism and reduced law enforcement utility",
    });
  }

  const subjectsWithoutAccounts = input.subjects.filter((s) => s.accountNumbers.length === 0);
  if (subjectsWithoutAccounts.length > 0) {
    gaps.push({
      standard: "FinCEN Form 111 Instructions — Part I (Subject Information)",
      requirement: "SAR must include all known account numbers associated with the suspicious activity",
      currentState: `${subjectsWithoutAccounts.length} subject(s) have no account numbers associated`,
      severity: "medium",
      recommendedAction: "Research all accounts linked to subject(s) and include in SAR filing; check for related accounts, joint accounts, and accounts at other branches",
    });
  }

  if (input.transactions.length === 0 && input.cumulativeAmount > 0) {
    gaps.push({
      standard: "FinCEN SAR Narrative Guidance — Transaction Detail",
      requirement: "SAR narrative should include specific transaction details (dates, amounts, types) to support the suspicious activity description",
      currentState: "Cumulative amount reported but no individual transaction details provided",
      severity: "medium",
      recommendedAction: "Document individual transactions with dates, amounts, types, and accounts to provide law enforcement with actionable information",
    });
  }

  // Filing timeliness check
  const detectionToNow = Math.floor((new Date().getTime() - new Date(input.activityDateRangeEnd).getTime()) / (1000 * 60 * 60 * 24));
  if (detectionToNow > 30) {
    gaps.push({
      standard: "31 CFR 1010.320(b)(3)",
      requirement: "SAR must be filed no later than 30 calendar days after the date of initial detection of facts that may constitute a basis for filing",
      currentState: `Activity end date was ${detectionToNow} days ago; if initial detection aligned with activity end, filing deadline may have passed`,
      severity: detectionToNow > 60 ? "critical" : "high",
      recommendedAction: "File SAR immediately if not already filed; document reason for any delay in the SAR narrative; late filing is preferable to no filing",
    });
  }

  return gaps;
}

function calculateSARComplianceScore(quality: NarrativeQualityAssessment): number {
  switch (quality.overallQuality) {
    case "excellent": return 95;
    case "good": return 80;
    case "adequate": return 65;
    case "deficient": return 40;
  }
}

function buildNarrativeContext(input: SARNarrativeInput, generatedNarrative: string): string {
  return `Review and enhance the following SAR narrative. Provide analysis of the suspicious activity pattern and any additional context that would be valuable for the filing.

FILING INSTITUTION: ${input.filingInstitution.name} (RSSD: ${input.filingInstitution.rssd})
PRIMARY REGULATOR: ${input.filingInstitution.primaryRegulator}

GENERATED NARRATIVE:
${generatedNarrative}

ACTIVITY TYPE: ${input.suspiciousActivityType.join(", ")}
CUMULATIVE AMOUNT: $${input.cumulativeAmount.toLocaleString()}
PERIOD: ${input.activityDateRangeStart} to ${input.activityDateRangeEnd}
SUBJECTS: ${input.subjects.length}
TRANSACTIONS: ${input.transactions.length}
RED FLAGS: ${input.redFlags.length}
CONTINUING ACTIVITY: ${input.isContinuingActivity ? "Yes" : "No"}
${input.priorSARs.hasPriorFilings ? `PRIOR SARs: ${input.priorSARs.priorSARNumbers.join(", ")} (cumulative prior: $${input.priorSARs.cumulativePriorAmount.toLocaleString()})` : "PRIOR SARs: None (initial filing)"}

${input.narrativeNotes ? `ANALYST NOTES: ${input.narrativeNotes}` : ""}

Generate:
1. Pattern analysis — identify the typology (structuring, layering, integration, fraud scheme, etc.)
2. Additional regulatory context (applicable FinCEN advisories, typology guidance)
3. Investigative leads for law enforcement
4. Monitoring recommendations for continuing activity`;
}
