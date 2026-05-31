/**
 * CCPA/CPRA Compliance Package Generator
 * Generates complete compliance package per Cal. Civ. Code §1798.100-199
 */

import { generateCompletion } from "../../lib/llm.js";
import { getLawByState } from "../../data/tech/state-privacy-laws.js";

export interface CcpaInput {
  businessName: string;
  businessType: string;
  websiteUrl: string;
  annualRevenue: string;
  employeeCount: number;
  dataCollected: CcpaDataCategory[];
  sellingActivities: SellingActivity[];
  sharingActivities: SharingActivity[];
  serviceProviders: ServiceProviderInfo[];
  collectsMinorData: boolean;
  financialIncentivePrograms: FinancialIncentiveProgram[];
}

export type CcpaDataCategory =
  | "identifiers"
  | "customer_records"
  | "protected_classifications"
  | "commercial_information"
  | "biometric"
  | "internet_activity"
  | "geolocation"
  | "sensory_data"
  | "professional_employment"
  | "education"
  | "inferences"
  | "sensitive_personal_information";

export interface SellingActivity {
  dataCategory: CcpaDataCategory;
  recipient: string;
  purpose: string;
}

export interface SharingActivity {
  dataCategory: CcpaDataCategory;
  recipient: string;
  purpose: string;
}

export interface ServiceProviderInfo {
  name: string;
  service: string;
  dataAccessed: CcpaDataCategory[];
}

export interface FinancialIncentiveProgram {
  programName: string;
  description: string;
  personalInfoCollected: CcpaDataCategory[];
  valueCalculationMethod: string;
}

export interface CcpaCompliancePackage {
  businessName: string;
  generatedDate: string;
  sections: CcpaSection[];
  applicabilityAssessment: ApplicabilityAssessment;
  summary: string;
}

export interface CcpaSection {
  id: string;
  title: string;
  statutoryReference: string;
  content: string;
}

export interface ApplicabilityAssessment {
  ccpaApplicable: boolean;
  cpraApplicable: boolean;
  thresholdsMet: string[];
  exemptions: string[];
}

export async function generateCcpaCompliance(input: CcpaInput): Promise<CcpaCompliancePackage> {
  const applicability = assessApplicability(input);
  const sections = buildComplianceSections(input, applicability);

  const systemPrompt = `You are a California privacy law expert. Provide a compliance assessment summary for a CCPA/CPRA compliance package.`;

  const userPrompt = `Summarize compliance readiness for:
Business: ${input.businessName} (${input.businessType})
Revenue: ${input.annualRevenue}
Data Categories Collected: ${input.dataCollected.map(formatDataCategory).join(", ")}
Selling Activities: ${input.sellingActivities.length > 0 ? input.sellingActivities.map((s) => `${formatDataCategory(s.dataCategory)} to ${s.recipient}`).join(", ") : "None"}
Sharing Activities: ${input.sharingActivities.length > 0 ? input.sharingActivities.map((s) => `${formatDataCategory(s.dataCategory)} to ${s.recipient}`).join(", ") : "None"}
Service Providers: ${input.serviceProviders.length}
Minors' Data: ${input.collectsMinorData ? "Yes" : "No"}

Provide a 2-3 paragraph executive summary of CCPA/CPRA compliance status and key requirements.`;

  const summary = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 1024,
  });

  return {
    businessName: input.businessName,
    generatedDate: new Date().toISOString().split("T")[0] ?? "",
    sections,
    applicabilityAssessment: applicability,
    summary,
  };
}

function assessApplicability(input: CcpaInput): ApplicabilityAssessment {
  const thresholdsMet: string[] = [];
  const exemptions: string[] = [];

  const caLaw = getLawByState("CA");
  const revenueNum = parseFloat(input.annualRevenue.replace(/[$,]/g, ""));

  if (revenueNum > 25000000) {
    thresholdsMet.push("Annual gross revenue exceeds $25 million");
  }

  if (input.sellingActivities.length > 0 || input.sharingActivities.length > 0) {
    thresholdsMet.push("Business sells or shares personal information of consumers");
  }

  const ccpaApplicable = thresholdsMet.length > 0;
  const cpraApplicable = ccpaApplicable; // CPRA amends CCPA, effective 2023

  return {
    ccpaApplicable,
    cpraApplicable,
    thresholdsMet,
    exemptions,
  };
}

function buildComplianceSections(input: CcpaInput, applicability: ApplicabilityAssessment): CcpaSection[] {
  const sections: CcpaSection[] = [];

  // Section 1: Privacy Policy
  sections.push(buildPrivacyPolicy(input));

  // Section 2: Do Not Sell/Share Implementation
  sections.push(buildDoNotSellShare(input));

  // Section 3: Data Subject Rights Procedures
  sections.push(buildConsumerRightsProcedures(input));

  // Section 4: Financial Incentive Notice
  if (input.financialIncentivePrograms.length > 0) {
    sections.push(buildFinancialIncentiveNotice(input));
  }

  // Section 5: Service Provider Agreements
  sections.push(buildServiceProviderAgreements(input));

  // Section 6: Data Inventory and Mapping
  sections.push(buildDataInventory(input));

  // Section 7: Consumer Request Verification
  sections.push(buildVerificationProcedures(input));

  // Section 8: Response Timeline
  sections.push(buildResponseTimeline(input));

  return sections;
}

function buildPrivacyPolicy(input: CcpaInput): CcpaSection {
  const dataCategories = input.dataCollected.map((dc) => {
    const sources = getDataSources(dc);
    const purposes = getDataPurposes(dc);
    return `### ${formatDataCategory(dc)}
- **Examples:** ${getDataExamples(dc)}
- **Sources:** ${sources}
- **Business Purpose:** ${purposes}
- **Sold/Shared:** ${isSoldOrShared(dc, input) ? "Yes — see 'Sale and Sharing' section below" : "No"}
- **Retention Period:** ${getRetentionPeriod(dc)}`;
  });

  const sellingSection = input.sellingActivities.length > 0
    ? `## Sale of Personal Information

${input.businessName} sells the following categories of personal information:

${input.sellingActivities.map((s) => `- **${formatDataCategory(s.dataCategory)}** to ${s.recipient} for ${s.purpose}`).join("\n")}

You have the right to opt out of the sale of your personal information. See "Your Rights" below.`
    : `## Sale of Personal Information

${input.businessName} does not sell your personal information.`;

  const sharingSection = input.sharingActivities.length > 0
    ? `## Sharing of Personal Information for Cross-Context Behavioral Advertising

${input.businessName} shares the following categories for cross-context behavioral advertising:

${input.sharingActivities.map((s) => `- **${formatDataCategory(s.dataCategory)}** with ${s.recipient} for ${s.purpose}`).join("\n")}

You have the right to opt out of sharing. See "Your Rights" below.`
    : `## Sharing of Personal Information

${input.businessName} does not share your personal information for cross-context behavioral advertising.`;

  const minorsSection = input.collectsMinorData
    ? `## Children's Personal Information

${input.businessName} does not knowingly sell or share the personal information of consumers under 16 years of age. For consumers under 16, we will not sell or share personal information unless we receive affirmative authorization ("opt-in") from either the consumer (ages 13-15) or the consumer's parent or guardian (under 13).`
    : "";

  const sensitiveSection = input.dataCollected.includes("sensitive_personal_information")
    ? `## Sensitive Personal Information

${input.businessName} collects sensitive personal information as defined under Cal. Civ. Code §1798.140(ae). You have the right to limit the use and disclosure of your sensitive personal information to only those uses necessary to perform the services or provide the goods reasonably expected by an average consumer.

To exercise this right, click the "Limit the Use of My Sensitive Personal Information" link on our homepage or contact us at the methods described below.`
    : "";

  return {
    id: "CCPA-PP-001",
    title: "Privacy Policy (Consumer-Facing)",
    statutoryReference: "Cal. Civ. Code §1798.100, §1798.110, §1798.115, §1798.120, §1798.121, §1798.130",
    content: `# Privacy Policy — ${input.businessName}

**Last Updated:** ${new Date().toISOString().split("T")[0]}
**Effective Date:** ${new Date().toISOString().split("T")[0]}

This Privacy Policy describes how ${input.businessName} ("we," "us," or "our") collects, uses, discloses, and otherwise processes personal information in connection with our services and website (${input.websiteUrl}), as well as your rights and choices regarding your personal information.

This policy is provided pursuant to the California Consumer Privacy Act of 2018, as amended by the California Privacy Rights Act of 2020 (collectively, "CCPA"), Cal. Civ. Code §§ 1798.100-199.100.

## Categories of Personal Information Collected

In the preceding 12 months, we have collected the following categories of personal information:

${dataCategories.join("\n\n")}

${sellingSection}

${sharingSection}

${sensitiveSection}

${minorsSection}

## Your California Privacy Rights

As a California consumer, you have the following rights under the CCPA:

### Right to Know (§1798.100, §1798.110)
You have the right to request that we disclose:
- The categories of personal information we collected about you
- The categories of sources from which we collected your personal information
- Our business or commercial purpose for collecting, selling, or sharing your personal information
- The categories of third parties to whom we disclose your personal information
- The specific pieces of personal information we collected about you

### Right to Delete (§1798.105)
You have the right to request that we delete personal information we collected from you, subject to certain exceptions.

### Right to Correct (§1798.106)
You have the right to request that we correct inaccurate personal information that we maintain about you.

### Right to Opt-Out of Sale/Sharing (§1798.120, §1798.121)
You have the right to opt out of the sale of your personal information and the sharing of your personal information for cross-context behavioral advertising.

### Right to Limit Use of Sensitive Personal Information (§1798.121)
You have the right to limit our use of your sensitive personal information to only those uses necessary to perform the services or provide the goods you request.

### Right to Non-Discrimination (§1798.125)
We will not discriminate against you for exercising any of your privacy rights.

## How to Exercise Your Rights

You may submit a request by:
- Visiting: ${input.websiteUrl}/privacy/request
- Emailing: privacy@${getDomain(input.websiteUrl)}
- Calling: [toll-free number]

We will verify your identity before fulfilling your request. See "Verification Process" below.

## Verification Process
To verify your identity, we will ask you to provide at least two pieces of personal information that we can match against our records. For requests for specific pieces of personal information, we require three pieces of personal information plus a signed declaration under penalty of perjury.

## Authorized Agents
You may designate an authorized agent to submit a request on your behalf. The agent must provide proof of authorization (power of attorney or signed permission) and we may still verify your identity directly.

## Response Timing
We will confirm receipt of your request within 10 business days and provide a substantive response within 45 calendar days. If we need additional time, we will notify you of the extension (up to an additional 45 days) and explain the reason.

## Contact Us
Privacy inquiries: privacy@${getDomain(input.websiteUrl)}
Data Protection Officer: dpo@${getDomain(input.websiteUrl)}
Mailing address: [Business Address]

## Changes to This Policy
We will update this Privacy Policy as needed to reflect changes in our practices or applicable law. We will notify you of material changes by [posting a prominent notice on our website / email notification].`,
  };
}

function buildDoNotSellShare(input: CcpaInput): CcpaSection {
  return {
    id: "CCPA-DNS-001",
    title: "Do Not Sell/Share My Personal Information — Implementation Guide",
    statutoryReference: "Cal. Civ. Code §1798.120, §1798.135",
    content: `# "Do Not Sell or Share My Personal Information" Implementation Guide

## Link Placement Requirements (§1798.135)

### Homepage Link
A clear and conspicuous link titled "Do Not Sell or Share My Personal Information" must be:
- Placed on the business's internet homepage
- Visible without scrolling on the initial page load (above the fold where feasible)
- Clearly distinguishable as a link (underlined, button-style, or distinctly colored)
- Accessible on both desktop and mobile versions of the site

### Alternative: Single "Your Privacy Choices" Link
Per §1798.135(a)(2), businesses may alternatively provide a single link titled "Your Privacy Choices" or "Your California Privacy Choices" that combines:
- Opt-out of sale
- Opt-out of sharing
- Limit use of sensitive personal information

This link must be accompanied by the opt-out icon as specified by the CPPA.

## Technical Implementation Requirements

### 1. Opt-Out Mechanism
\`\`\`
Implementation Checklist:
[ ] Dedicated /do-not-sell-share or /privacy/opt-out page
[ ] No account creation required to opt out
[ ] No unnecessary steps before opt-out (no "dark patterns" per §1798.140(l))
[ ] Confirmation of opt-out provided immediately
[ ] Opt-out effective within 15 business days
[ ] Signal transmitted to all service providers and contractors
\`\`\`

### 2. Global Privacy Control (GPC) Signal Recognition
Per §1798.135(b), the business must:
- Detect the GPC signal from user's browser (Sec-GPC: 1 header)
- Treat the GPC signal as a valid opt-out request for that browser/device
- Apply opt-out to all sale/sharing activities linked to that browser/device
- Not require additional action from the consumer beyond enabling GPC

\`\`\`
Technical Implementation:
1. Check for Sec-GPC HTTP header on each page load
2. Check for navigator.globalPrivacyControl JavaScript property
3. If GPC detected: suppress all sale/sharing activities for that session
4. Persist the opt-out preference server-side if user is identifiable
5. Notify downstream recipients to cease sale/sharing for that consumer
\`\`\`

### 3. Opt-Out Preference Signal Framework
- Must honor browser-based opt-out preference signals
- Conflict resolution: if consumer has both opted-in and GPC is enabled, business may notify consumer of conflict and request clarification
- Annual reset prohibition: cannot ask consumer to re-opt-out annually

## Operational Procedures

### Processing Opt-Out Requests
1. Consumer submits opt-out (link, GPC, or verbal/written request)
2. System records opt-out with timestamp
3. Within 15 business days:
   - Cease all sale/sharing of that consumer's personal information
   - Notify all third parties to whom data was sold/shared in prior 90 days
   - Update internal systems to flag consumer as opted-out
4. Send confirmation to consumer (if contact info available)

### Record-Keeping
- Maintain records of opt-out requests for 24 months
- Track: request date, method, completion date, categories affected
- Document any exceptions applied (e.g., not actual consumer)

### Re-Authorization (§1798.135(c))
- Business may request re-authorization after 12 months
- Request must be clear and not use dark patterns
- Consumer has no obligation to respond
- Silence = continued opt-out

## Service Provider / Contractor Notification

Upon receiving an opt-out, notify all:
${input.serviceProviders.map((sp) => `- ${sp.name} (${sp.service})`).join("\n")}

Notification must include:
- Consumer identifier (hashed/pseudonymized as appropriate)
- Effective date of opt-out
- Instruction to cease sale/sharing of that consumer's data
- Instruction to delete data received via sale/sharing if directed

## Metrics and Reporting (§1798.185(a)(14))

Track and report annually:
- Total opt-out requests received
- Total opt-out requests completed
- Median days to completion
- Opt-out requests by method (link, GPC, verbal, written)`,
  };
}

function buildConsumerRightsProcedures(input: CcpaInput): CcpaSection {
  return {
    id: "CCPA-CR-001",
    title: "Data Subject Rights Procedures",
    statutoryReference: "Cal. Civ. Code §1798.100-§1798.106, §1798.130",
    content: `# Consumer Rights Request Procedures

## Right to Know (Access) — §1798.100, §1798.110

### Request Intake
- Channels: Web form (${input.websiteUrl}/privacy/request), email (privacy@${getDomain(input.websiteUrl)}), toll-free number
- Collect: Consumer name, email, account ID (if applicable), request type
- Acknowledge receipt within 10 business days

### Identity Verification
**Standard requests (categories of data):**
- Verify at least 2 data points against records
- Match to reasonable degree of certainty

**Specific pieces requests:**
- Verify at least 3 data points against records
- Match to reasonably high degree of certainty
- Require signed declaration under penalty of perjury

### Response Content
Disclose for the 12-month period preceding the request:
1. Categories of personal information collected
2. Categories of sources
3. Business or commercial purpose for collecting/selling/sharing
4. Categories of third parties to whom disclosed
5. Specific pieces of personal information (if requested)

### Response Delivery
- Deliver in readily usable format (portable where technically feasible)
- Transmitted securely (encrypted delivery or secure portal)
- Provide at no cost to consumer (maximum 2 requests per 12 months)

---

## Right to Delete — §1798.105

### Processing Steps
1. Receive and verify request (same verification as Right to Know — categories)
2. Identify all systems containing consumer's personal information
3. Delete from active systems within 45 days
4. Direct service providers and contractors to delete
5. Notify consumer of completion or exceptions

### Exceptions (§1798.105(d))
The business may deny deletion if data is needed to:
- Complete a transaction or provide a requested service
- Detect security incidents or protect against malicious/fraudulent activity
- Debug to identify and repair errors
- Exercise free speech or another legal right
- Comply with California Electronic Communications Privacy Act
- Engage in public or peer-reviewed research in the public interest
- Comply with a legal obligation
- Use internally in ways compatible with consumer's reasonable expectations

### Service Provider Notification
Upon deletion, notify:
${input.serviceProviders.map((sp) => `- ${sp.name}: Delete all data for the identified consumer`).join("\n")}

---

## Right to Correct — §1798.106

### Processing Steps
1. Receive request with indication of inaccurate information
2. Verify consumer identity (same as Right to Know — categories)
3. Evaluate accuracy of challenged information
4. If confirmed inaccurate: correct in all systems within 45 days
5. Direct service providers/contractors to correct their records
6. Notify consumer of action taken

### Business May Request Documentation
- May ask consumer to provide documentation supporting correction
- Must weigh totality of circumstances in determining accuracy
- Must not impose unreasonable documentation burden

---

## Right to Opt-Out of Sale/Sharing — §1798.120, §1798.121

See dedicated "Do Not Sell/Share" Implementation Guide (CCPA-DNS-001).

---

## Right to Limit Use of Sensitive Personal Information — §1798.121

### Applicable Data Categories
${input.dataCollected.includes("sensitive_personal_information") ? `Sensitive personal information collected by ${input.businessName}:
- Social security, driver's license, state ID, or passport numbers
- Account log-in credentials (username + password/security question)
- Financial account numbers with access codes
- Precise geolocation
- Racial or ethnic origin
- Religious or philosophical beliefs
- Union membership
- Contents of mail, email, and text messages (unless intended recipient is the business)
- Genetic data
- Biometric data for identification
- Health information
- Sex life or sexual orientation information` : "Not applicable — business does not collect sensitive personal information."}

### Processing Steps
1. Consumer submits "limit use" request via dedicated link or general request channel
2. No identity verification required for opt-out-type requests
3. Within 15 business days, limit processing to:
   - Performing the services or providing the goods requested
   - Ensuring security and integrity
   - Short-term transient use (not building a profile)
   - Performing services on behalf of the business
   - Verifying or maintaining quality/safety of a product or service
   - Collecting or processing where not for inferring characteristics

---

## Response Timelines

| Milestone | Deadline |
|-----------|----------|
| Acknowledge receipt | 10 business days |
| Substantive response | 45 calendar days |
| Extension notice (if needed) | Before initial 45-day deadline |
| Maximum extended deadline | 90 calendar days total |
| Opt-out effective | 15 business days |
| Inform consumer if denied | Within 45 calendar days with reasons |

## Metrics Tracking
- Requests received (by type and method)
- Median response time (by type)
- Requests fulfilled vs. denied (with denial reasons)
- Report annually per CPPA regulations`,
  };
}

function buildFinancialIncentiveNotice(input: CcpaInput): CcpaSection {
  const programs = input.financialIncentivePrograms.map((p) => `### ${p.programName}

**Description:** ${p.description}

**Personal Information Collected:** ${p.personalInfoCollected.map(formatDataCategory).join(", ")}

**Value of Consumer's Data:** ${p.valueCalculationMethod}

**How to Opt-In:** Consumers may opt in by [describe sign-up process]. Participation is voluntary and opt-in only.

**How to Opt-Out:** Consumers may opt out at any time by [describe withdrawal process]. Opting out will result in [describe consequence of withdrawal].

**Material Terms:** The financial incentive is reasonably related to the value of the consumer's data to the business, calculated by ${p.valueCalculationMethod}.`).join("\n\n");

  return {
    id: "CCPA-FI-001",
    title: "Financial Incentive Notice",
    statutoryReference: "Cal. Civ. Code §1798.125(b)",
    content: `# Notice of Financial Incentive Programs

Per Cal. Civ. Code §1798.125(b), ${input.businessName} offers the following financial incentive programs that involve the collection of personal information:

${programs}

## Non-Discrimination
${input.businessName} does not discriminate against consumers who exercise their privacy rights. Financial incentive programs are offered as separate, opt-in programs and participation is not required to use our services.`,
  };
}

function buildServiceProviderAgreements(input: CcpaInput): CcpaSection {
  return {
    id: "CCPA-SPA-001",
    title: "Service Provider and Contractor Agreements",
    statutoryReference: "Cal. Civ. Code §1798.100(d), §1798.140(ag), §1798.140(j)",
    content: `# Service Provider and Contractor Agreement Requirements

## Required Contract Terms (§1798.100(d))

All service provider and contractor agreements must include:

### Mandatory Clauses
1. **Purpose Limitation:** Personal information is provided solely for the specified business purpose and shall not be used for any other purpose.
2. **Prohibition on Selling/Sharing:** Service provider shall not sell or share the personal information.
3. **Prohibition on Retention/Use/Disclosure Outside Relationship:** Service provider shall not retain, use, or disclose personal information outside the direct business relationship.
4. **Prohibition on Combining Data:** Service provider shall not combine personal information received from the business with personal information received from other sources or collected from its own interactions with the consumer (except as expressly permitted by CCPA).
5. **Compliance Obligation:** Service provider shall comply with applicable obligations under the CCPA.
6. **Notification Obligation:** Service provider shall notify the business if it determines it can no longer meet its CCPA obligations.
7. **Audit Rights:** Business has the right to take reasonable and appropriate steps to ensure service provider uses personal information in a manner consistent with the business's obligations.
8. **Sub-Contractor Flow-Down:** If service provider engages sub-contractors, same restrictions must flow down contractually.

### Recommended Additional Clauses
- Data breach notification within 48 hours
- Data return/deletion upon contract termination within 30 days
- Cooperation with consumer rights requests within 10 business days
- Annual certification of compliance
- Limitation on sub-processing without prior written authorization

## Current Service Provider Inventory

| Provider | Service | Data Categories Accessed | Agreement Status |
|----------|---------|------------------------|------------------|
${input.serviceProviders.map((sp) => `| ${sp.name} | ${sp.service} | ${sp.dataAccessed.map(formatDataCategory).join(", ")} | [Pending Review] |`).join("\n")}

## Contract Review Schedule
- All existing service provider agreements must be reviewed and updated to include CCPA-compliant terms
- New agreements must include all mandatory clauses before data access is granted
- Annual re-certification required for all service providers accessing personal information`,
  };
}

function buildDataInventory(input: CcpaInput): CcpaSection {
  return {
    id: "CCPA-DI-001",
    title: "Data Inventory and Mapping",
    statutoryReference: "Cal. Civ. Code §1798.100, §1798.110",
    content: `# Personal Information Data Inventory

## Data Categories Collected

| Category | Examples | Source | Business Purpose | Sold | Shared | Retention |
|----------|----------|--------|-----------------|------|--------|-----------|
${input.dataCollected.map((dc) => `| ${formatDataCategory(dc)} | ${getDataExamples(dc)} | ${getDataSources(dc)} | ${getDataPurposes(dc)} | ${input.sellingActivities.some((s) => s.dataCategory === dc) ? "Yes" : "No"} | ${input.sharingActivities.some((s) => s.dataCategory === dc) ? "Yes" : "No"} | ${getRetentionPeriod(dc)} |`).join("\n")}

## Data Flow Diagram

\`\`\`
Consumer → [Collection Point] → [${input.businessName} Systems]
                                        ↓
                               [Service Providers]
                                        ↓
                         ${input.sellingActivities.length > 0 ? "[Third-Party Buyers] (with opt-out)" : "[No Sale]"}
                                        ↓
                         ${input.sharingActivities.length > 0 ? "[Advertising Partners] (with opt-out)" : "[No Sharing]"}
\`\`\`

## Third-Party Disclosures (Prior 12 Months)

### Categories Sold
${input.sellingActivities.length > 0 ? input.sellingActivities.map((s) => `- ${formatDataCategory(s.dataCategory)} → ${s.recipient} (${s.purpose})`).join("\n") : "No personal information sold in the prior 12 months."}

### Categories Shared for Cross-Context Behavioral Advertising
${input.sharingActivities.length > 0 ? input.sharingActivities.map((s) => `- ${formatDataCategory(s.dataCategory)} → ${s.recipient} (${s.purpose})`).join("\n") : "No personal information shared for cross-context behavioral advertising in the prior 12 months."}

### Categories Disclosed for Business Purpose
${input.serviceProviders.map((sp) => `- ${sp.dataAccessed.map(formatDataCategory).join(", ")} → ${sp.name} (${sp.service})`).join("\n")}

## Sensitive Personal Information Inventory
${input.dataCollected.includes("sensitive_personal_information")
  ? `The following sensitive personal information is collected and processed:
- [List specific sensitive data elements]
- Uses limited to: performing services, ensuring security, short-term transient use, quality verification
- Consumer may limit use via dedicated "Limit Use" link`
  : "No sensitive personal information as defined under §1798.140(ae) is knowingly collected."}`,
  };
}

function buildVerificationProcedures(input: CcpaInput): CcpaSection {
  return {
    id: "CCPA-VP-001",
    title: "Consumer Request Verification Procedures",
    statutoryReference: "Cal. Civ. Code §1798.185; CCPA Regulations §7060-7064",
    content: `# Consumer Request Identity Verification Procedures

## Verification Standards

### Reasonable Degree of Certainty (Categories Requests)
Match at least **2** of the following data points:
- Email address on file
- Phone number on file
- Account username (if applicable)
- Last four digits of payment method
- Physical mailing address
- Date of birth

### Reasonably High Degree of Certainty (Specific Pieces Requests)
Match at least **3** of the following:
- Email address on file
- Phone number on file
- Account username AND last login date
- Last four digits of payment method
- Physical mailing address
- Date of birth
- **Plus:** Signed declaration under penalty of perjury

## Verification Process by Channel

### Online (Web Form at ${input.websiteUrl}/privacy/request)
1. Consumer completes request form
2. System sends verification email with one-time code
3. Consumer enters code to verify email ownership
4. If authenticated account holder: request proceeds (1 factor verified)
5. If not authenticated: additional verification questions presented
6. For specific pieces requests: signed declaration form provided

### Email (privacy@${getDomain(input.websiteUrl)})
1. Acknowledge receipt from the sender address
2. Request verification information via reply
3. Match responses against records
4. For specific pieces: mail signed declaration form for return

### Phone (Toll-Free Number)
1. Collect verbal identification information
2. Verify against records in real-time
3. If unable to verify verbally: direct to online form
4. Document verification outcome in case record

## Account Holders vs. Non-Account Holders

### Account Holders (Password-Protected Account)
- Authenticated login satisfies verification for Right to Know (categories)
- Additional factor required for Right to Know (specific pieces)
- Password reset procedures serve as fallback verification

### Non-Account Holders
- Must verify via data matching as described above
- May be more limited in specific pieces disclosure if verification cannot reach "reasonably high" standard
- Document inability to verify and inform consumer

## Authorized Agents

### Verification of Agent Authority
1. Power of Attorney (notarized): Accept as sufficient
2. Signed written permission from consumer:
   - Verify consumer's identity directly (even with agent present)
   - Verify agent's identity
   - Confirm consumer authorized the specific request

### Agent Registration
- California Secretary of State registration verification (if claiming registered status)
- Document agent authorization in request record

## Failure to Verify

If unable to verify identity:
- Inform consumer within 45 days
- Explain why verification failed
- Describe alternative verification options
- Do not deny request solely due to inability to verify without attempting all reasonable methods
- Document decision rationale

## Anti-Fraud Protections
- Maximum 2 Right to Know requests per consumer per 12-month period
- Monitor for patterns of fraudulent requests
- Do not disclose specific pieces that could be used for identity theft (e.g., full SSN, financial account numbers) — provide categories only
- Flag requests from known data broker IP ranges for enhanced review`,
  };
}

function buildResponseTimeline(input: CcpaInput): CcpaSection {
  return {
    id: "CCPA-RT-001",
    title: "Response Timeline Documentation",
    statutoryReference: "Cal. Civ. Code §1798.130, §1798.145",
    content: `# Response Timeline and SLA Documentation

## Standard Timelines (§1798.130)

| Request Type | Acknowledge | Initial Response | Extension | Max Total |
|-------------|-------------|-----------------|-----------|-----------|
| Right to Know | 10 business days | 45 calendar days | +45 days with notice | 90 calendar days |
| Right to Delete | 10 business days | 45 calendar days | +45 days with notice | 90 calendar days |
| Right to Correct | 10 business days | 45 calendar days | +45 days with notice | 90 calendar days |
| Opt-Out (Sale/Share) | N/A | 15 business days | N/A | 15 business days |
| Limit Use (Sensitive PI) | N/A | 15 business days | N/A | 15 business days |

## Internal Processing Workflow

### Day 0: Request Received
- Log in request management system
- Assign case ID
- Classify request type
- Route to privacy team

### Days 1-10: Acknowledgment Phase
- Send acknowledgment to consumer
- Begin identity verification
- If verification fails: request additional information

### Days 10-30: Processing Phase
- Complete identity verification
- Search all data systems for consumer's information
- Compile response based on request type
- For deletion: queue deletion jobs
- Legal review (if exceptions apply)

### Days 30-45: Response Phase
- Quality review of response
- Deliver response to consumer via secure channel
- For deletion: confirm completion to consumer
- Close case if complete

### Days 45-90: Extension Phase (if needed)
- Notify consumer of extension before Day 45
- Explain reason for extension
- Provide estimated completion date
- Continue processing
- Complete by Day 90 maximum

## Extension Justification Criteria

Extension is permitted only when "reasonably necessary" considering:
- Complexity of the request (e.g., data across many systems)
- Volume of concurrent requests
- Technical limitations in data retrieval
- Need to verify identity with additional factors
- Consumer requests clarification/modification during processing

## Denial Response Requirements

If request is denied (in whole or in part), response must include:
- Specific statutory basis for denial
- Description of the exception applied
- For partial denial: fulfill the portions that can be completed
- Right to appeal or lodge complaint with California AG or CPPA

## Record-Keeping Requirements

Maintain for 24 months:
- Request date and method
- Request type
- Consumer identifier (pseudonymized)
- Verification method and outcome
- Response date
- Action taken (fulfilled, partially fulfilled, denied)
- Denial reason (if applicable)
- Extension used (yes/no, reason)

## Annual Metrics Compilation

Per CPPA regulations, compile annually:
- Number of requests received by type
- Median days to substantive response by type
- Number fulfilled in whole, in part, and denied by type

These metrics must be posted on the business's website or provided upon request by [date specified by CPPA regulations].`,
  };
}

function formatDataCategory(category: CcpaDataCategory): string {
  const names: Record<CcpaDataCategory, string> = {
    identifiers: "Identifiers",
    customer_records: "California Customer Records",
    protected_classifications: "Protected Classification Characteristics",
    commercial_information: "Commercial Information",
    biometric: "Biometric Information",
    internet_activity: "Internet or Electronic Network Activity",
    geolocation: "Geolocation Data",
    sensory_data: "Sensory Data",
    professional_employment: "Professional or Employment Information",
    education: "Education Information",
    inferences: "Inferences",
    sensitive_personal_information: "Sensitive Personal Information",
  };
  return names[category];
}

function getDataExamples(category: CcpaDataCategory): string {
  const examples: Record<CcpaDataCategory, string> = {
    identifiers: "Name, email, IP address, account name, SSN, driver's license",
    customer_records: "Name, address, telephone, financial information, medical information",
    protected_classifications: "Age, race, gender, disability, veteran status",
    commercial_information: "Purchase history, products/services purchased, consuming histories",
    biometric: "Fingerprint, voice recording, facial recognition data",
    internet_activity: "Browsing history, search history, interactions with website/app",
    geolocation: "Physical location, GPS coordinates, IP-based location",
    sensory_data: "Audio, electronic, visual, thermal, olfactory information",
    professional_employment: "Job title, employer, work history, performance evaluations",
    education: "Student records, grades, enrollment information",
    inferences: "Consumer profiles reflecting preferences, characteristics, behavior, aptitudes",
    sensitive_personal_information: "SSN, financial account + access code, precise geolocation, racial/ethnic origin, religious beliefs, biometric data, health data, sex life/orientation",
  };
  return examples[category];
}

function getDataSources(category: CcpaDataCategory): string {
  const sources: Record<CcpaDataCategory, string> = {
    identifiers: "Directly from consumer, automatically via website",
    customer_records: "Directly from consumer during account creation/purchase",
    protected_classifications: "Directly from consumer (voluntary disclosure)",
    commercial_information: "Transaction records, consumer account activity",
    biometric: "Directly from consumer with explicit consent",
    internet_activity: "Automatically collected via cookies, pixels, and analytics",
    geolocation: "Mobile app with location permissions, IP-based inference",
    sensory_data: "Customer service interactions, security systems",
    professional_employment: "Directly from consumer, public professional profiles",
    education: "Directly from consumer",
    inferences: "Derived from other collected categories",
    sensitive_personal_information: "Directly from consumer for identity verification and service delivery",
  };
  return sources[category];
}

function getDataPurposes(category: CcpaDataCategory): string {
  const purposes: Record<CcpaDataCategory, string> = {
    identifiers: "Account management, communication, identity verification",
    customer_records: "Processing transactions, providing services, legal compliance",
    protected_classifications: "Equal opportunity compliance, product personalization",
    commercial_information: "Order fulfillment, recommendations, business analytics",
    biometric: "Security authentication, identity verification",
    internet_activity: "Website improvement, personalization, security monitoring",
    geolocation: "Service delivery, location-based features, fraud prevention",
    sensory_data: "Quality assurance, security, service improvement",
    professional_employment: "Account management, service customization",
    education: "Service eligibility verification",
    inferences: "Personalization, recommendations, product development",
    sensitive_personal_information: "Identity verification, account security, service delivery",
  };
  return purposes[category];
}

function getRetentionPeriod(category: CcpaDataCategory): string {
  const retention: Record<CcpaDataCategory, string> = {
    identifiers: "Duration of account + 30 days",
    customer_records: "7 years (financial records requirement)",
    protected_classifications: "Duration of account + 30 days",
    commercial_information: "3 years from transaction",
    biometric: "Until purpose fulfilled, max 3 years",
    internet_activity: "13 months from collection",
    geolocation: "30 days unless user-initiated save",
    sensory_data: "90 days unless subject to legal hold",
    professional_employment: "Duration of account + 30 days",
    education: "Duration of account + 30 days",
    inferences: "Until next profile refresh or deletion request",
    sensitive_personal_information: "Minimum necessary, max per primary category",
  };
  return retention[category];
}

function isSoldOrShared(category: CcpaDataCategory, input: CcpaInput): boolean {
  return (
    input.sellingActivities.some((s) => s.dataCategory === category) ||
    input.sharingActivities.some((s) => s.dataCategory === category)
  );
}

function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch {
    return "company.com";
  }
}
