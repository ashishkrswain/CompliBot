/**
 * SOC 2 Control Matrix Generator
 * Maps control objectives to control activities to evidence per AICPA Trust Services Criteria
 */

import { generateCompletion } from "../../lib/llm.js";
import {
  TRUST_SERVICES_CRITERIA,
  TSC_CATEGORY_NAMES,
  type TscCategory,
  type TrustServicesCriterion,
} from "../../data/tech/soc2-tsc.js";

export interface Soc2ControlMatrixInput {
  companyName: string;
  productType: string;
  cloudProvider: "AWS" | "GCP" | "Azure";
  employeeCount: number;
  selectedCategories: TscCategory[];
  currentTools: CurrentTooling;
}

export interface CurrentTooling {
  sso: string | null;
  siem: string | null;
  endpointProtection: string | null;
  vulnerabilityScanner: string | null;
  codeRepository: string | null;
  ciCd: string | null;
  ticketing: string | null;
  cloudSecurityPosture: string | null;
  secretsManagement: string | null;
  backupSolution: string | null;
  mdm: string | null;
  securityAwarenessTraining: string | null;
}

export interface Soc2Control {
  controlId: string;
  tscCriteria: string;
  tscCriteriaTitle: string;
  controlDescription: string;
  controlActivity: string;
  frequency: ControlFrequency;
  evidenceRequired: string[];
  owner: string;
  automationLevel: "Manual" | "Semi-Automated" | "Fully Automated";
  tooling: string;
}

export type ControlFrequency =
  | "Continuous"
  | "Real-time"
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Semi-annually"
  | "Annually"
  | "Per occurrence"
  | "As needed";

export interface Soc2ControlMatrix {
  companyName: string;
  generatedDate: string;
  selectedCategories: TscCategory[];
  totalControls: number;
  controls: Soc2Control[];
  summary: string;
}

export async function generateSoc2ControlMatrix(input: Soc2ControlMatrixInput): Promise<Soc2ControlMatrix> {
  const controls = buildControlMatrix(input);

  const systemPrompt = `You are an expert SOC 2 auditor generating a control matrix summary. Provide a concise assessment of the organization's control coverage.`;

  const userPrompt = `Summarize the SOC 2 control matrix for:
Company: ${input.companyName}
Trust Service Categories: ${input.selectedCategories.map((c) => `${c} (${TSC_CATEGORY_NAMES[c]})`).join(", ")}
Total Controls: ${controls.length}
Current Tools: ${formatTooling(input.currentTools)}

Provide a 2-3 paragraph summary covering: overall coverage assessment, areas of strong control, and areas that may require additional attention based on the tooling gaps.`;

  const summary = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 1024,
  });

  return {
    companyName: input.companyName,
    generatedDate: new Date().toISOString().split("T")[0] ?? "",
    selectedCategories: input.selectedCategories,
    totalControls: controls.length,
    controls,
    summary,
  };
}

function formatTooling(tools: CurrentTooling): string {
  const entries = Object.entries(tools)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => `${key}: ${value}`);
  return entries.length > 0 ? entries.join(", ") : "No tools specified";
}

function buildControlMatrix(input: Soc2ControlMatrixInput): Soc2Control[] {
  const controls: Soc2Control[] = [];
  let controlCounter = 1;

  for (const category of input.selectedCategories) {
    const criteria = TRUST_SERVICES_CRITERIA.filter((c) => c.category === category);
    for (const criterion of criteria) {
      const categoryControls = generateControlsForCriterion(criterion, input, controlCounter);
      controls.push(...categoryControls);
      controlCounter += categoryControls.length;
    }
  }

  return controls;
}

function generateControlsForCriterion(
  criterion: TrustServicesCriterion,
  input: Soc2ControlMatrixInput,
  startId: number
): Soc2Control[] {
  const controls: Soc2Control[] = [];
  const { currentTools, cloudProvider } = input;
  let idCounter = startId;

  const controlDefs = getControlDefinitionsForCriterion(criterion.id, currentTools, cloudProvider);

  for (const def of controlDefs) {
    controls.push({
      controlId: `CTRL-${String(idCounter).padStart(3, "0")}`,
      tscCriteria: criterion.id,
      tscCriteriaTitle: criterion.title,
      controlDescription: def.description,
      controlActivity: def.activity,
      frequency: def.frequency,
      evidenceRequired: def.evidence,
      owner: def.owner,
      automationLevel: def.automation,
      tooling: def.tooling,
    });
    idCounter++;
  }

  return controls;
}

interface ControlDefinition {
  description: string;
  activity: string;
  frequency: ControlFrequency;
  evidence: string[];
  owner: string;
  automation: "Manual" | "Semi-Automated" | "Fully Automated";
  tooling: string;
}

function getControlDefinitionsForCriterion(
  criterionId: string,
  tools: CurrentTooling,
  cloudProvider: string
): ControlDefinition[] {
  const controlMap: Record<string, ControlDefinition[]> = {
    "CC1.1": [
      {
        description: "Code of conduct is established, communicated, and acknowledged by all personnel",
        activity: "Annual distribution and acknowledgment of code of conduct and ethics policy to all employees and contractors",
        frequency: "Annually",
        evidence: [
          "Signed code of conduct acknowledgments",
          "Code of conduct policy document with version history",
          "Distribution records (email/system logs)",
        ],
        owner: "Human Resources",
        automation: "Semi-Automated",
        tooling: "HRIS / Policy Management System",
      },
      {
        description: "Ethics violations are tracked and remediated",
        activity: "Management reviews reported ethics concerns and ensures timely investigation and resolution",
        frequency: "Per occurrence",
        evidence: [
          "Ethics hotline/reporting system logs",
          "Investigation records and resolution documentation",
          "Board reporting on ethics matters",
        ],
        owner: "Human Resources / Legal",
        automation: "Manual",
        tooling: "Ethics hotline / Case management system",
      },
    ],
    "CC1.2": [
      {
        description: "Board exercises oversight of information security program",
        activity: "Board reviews information security program status, risk posture, and incident reports at regular intervals",
        frequency: "Quarterly",
        evidence: [
          "Board meeting minutes documenting security discussion",
          "Security program presentation materials",
          "Board-approved risk acceptance decisions",
        ],
        owner: "CISO / Executive Leadership",
        automation: "Manual",
        tooling: "Board portal / Document management",
      },
    ],
    "CC1.3": [
      {
        description: "Organizational structure with defined security roles and reporting lines",
        activity: "Maintain current organizational chart with information security roles, responsibilities, and reporting lines documented",
        frequency: "Annually",
        evidence: [
          "Organizational chart showing security reporting lines",
          "Job descriptions with security responsibilities",
          "RACI matrix for security functions",
        ],
        owner: "CISO",
        automation: "Manual",
        tooling: "HRIS / Document management",
      },
    ],
    "CC1.4": [
      {
        description: "Security awareness training program is maintained and completion tracked",
        activity: "All personnel complete security awareness training upon hire and annually thereafter; completion is tracked and non-completion escalated",
        frequency: "Annually",
        evidence: [
          "Training completion records with dates and scores",
          "Training content/curriculum",
          "Non-completion escalation records",
          "Phishing simulation results",
        ],
        owner: "Security Team",
        automation: "Fully Automated",
        tooling: tools.securityAwarenessTraining ?? "Security awareness platform",
      },
    ],
    "CC1.5": [
      {
        description: "Personnel accountability through performance evaluation",
        activity: "Security responsibilities are included in performance evaluations and violations are addressed through disciplinary process",
        frequency: "Annually",
        evidence: [
          "Performance review templates including security criteria",
          "Completed performance reviews",
          "Disciplinary action records for security violations",
        ],
        owner: "Human Resources / Managers",
        automation: "Manual",
        tooling: "HRIS / Performance management system",
      },
    ],
    "CC2.1": [
      {
        description: "Security information is communicated to support internal control functioning",
        activity: "Security team publishes and maintains security policies, procedures, and standards in an accessible knowledge base; communicates updates via appropriate channels",
        frequency: "Continuous",
        evidence: [
          "Policy management system access logs",
          "Communication records (emails, announcements)",
          "Policy acknowledgment records",
        ],
        owner: "Security Team",
        automation: "Semi-Automated",
        tooling: "Policy management / Knowledge base",
      },
    ],
    "CC2.2": [
      {
        description: "Internal communication of security information and responsibilities",
        activity: "Security advisories, policy updates, and incident notifications are communicated internally through defined channels",
        frequency: "Per occurrence",
        evidence: [
          "Security advisory distribution records",
          "All-hands/team meeting agendas covering security topics",
          "Internal communication platform logs",
        ],
        owner: "Security Team",
        automation: "Semi-Automated",
        tooling: "Communication platform / Email",
      },
    ],
    "CC2.3": [
      {
        description: "External communication channels for security matters",
        activity: "Maintain external-facing security contact (security@), vulnerability disclosure program, and customer communication procedures for security events",
        frequency: "Continuous",
        evidence: [
          "Security page/contact information on website",
          "Vulnerability disclosure policy",
          "Customer security notification records",
        ],
        owner: "Security Team",
        automation: "Semi-Automated",
        tooling: "VDP platform / Customer communication system",
      },
    ],
    "CC3.1": [
      {
        description: "Security objectives are defined aligned with business objectives",
        activity: "Annual establishment of information security objectives mapped to business strategy and risk appetite",
        frequency: "Annually",
        evidence: [
          "Documented security objectives and KPIs",
          "Mapping of security objectives to business objectives",
          "Quarterly progress reports on security objectives",
        ],
        owner: "CISO",
        automation: "Manual",
        tooling: "GRC platform / Document management",
      },
    ],
    "CC3.2": [
      {
        description: "Risk assessments are performed to identify and analyze risks",
        activity: "Formal risk assessment conducted annually and upon significant change, identifying threats, vulnerabilities, likelihood, and impact",
        frequency: "Annually",
        evidence: [
          "Risk assessment reports with methodology",
          "Risk register with scoring",
          "Risk treatment plans",
          "Management risk acceptance documentation",
        ],
        owner: "Security Team",
        automation: "Semi-Automated",
        tooling: "GRC platform / Risk management system",
      },
    ],
    "CC3.3": [
      {
        description: "Fraud risk is assessed as part of risk management",
        activity: "Assessment of fraud risk considering incentives, opportunities, and rationalizations across organizational functions",
        frequency: "Annually",
        evidence: [
          "Fraud risk assessment documentation",
          "Anti-fraud controls mapping",
          "Segregation of duties matrix",
        ],
        owner: "Security Team / Internal Audit",
        automation: "Manual",
        tooling: "GRC platform",
      },
    ],
    "CC3.4": [
      {
        description: "Changes that could impact internal control are identified and assessed",
        activity: "Significant changes to technology, business, personnel, or regulations are evaluated for impact to security controls",
        frequency: "Per occurrence",
        evidence: [
          "Change impact assessment records",
          "Technology change risk evaluations",
          "Regulatory change tracking logs",
        ],
        owner: "Security Team",
        automation: "Semi-Automated",
        tooling: "Change management system / GRC platform",
      },
    ],
    "CC4.1": [
      {
        description: "Ongoing monitoring and separate evaluations of security controls",
        activity: "Continuous monitoring of security controls through automated tools supplemented by periodic manual assessments and internal audits",
        frequency: "Continuous",
        evidence: [
          "Security monitoring dashboard reports",
          "Internal audit reports",
          "Control testing results",
          "Compliance scan results",
        ],
        owner: "Security Team / Internal Audit",
        automation: "Semi-Automated",
        tooling: `${tools.siem ?? "SIEM"} / ${tools.cloudSecurityPosture ?? "CSPM"} / GRC platform`,
      },
    ],
    "CC4.2": [
      {
        description: "Control deficiencies are communicated and remediated",
        activity: "Identified control gaps are logged, assigned owners, tracked to remediation, and reported to management",
        frequency: "Per occurrence",
        evidence: [
          "Deficiency tracking records with status",
          "Remediation plans with timelines",
          "Management reporting on open deficiencies",
          "Closure evidence for remediated deficiencies",
        ],
        owner: "Security Team",
        automation: "Semi-Automated",
        tooling: `${tools.ticketing ?? "Ticketing system"} / GRC platform`,
      },
    ],
    "CC5.1": [
      {
        description: "Control activities are selected and developed to mitigate risks",
        activity: "Controls are designed and implemented in response to identified risks, with a mix of preventive and detective controls",
        frequency: "Per occurrence",
        evidence: [
          "Controls-to-risks mapping",
          "Control design documentation",
          "Control implementation evidence",
        ],
        owner: "Security Team",
        automation: "Manual",
        tooling: "GRC platform",
      },
    ],
    "CC5.2": [
      {
        description: "Technology general controls are implemented",
        activity: "IT general controls over infrastructure, security management, and technology maintenance are implemented and operating effectively",
        frequency: "Continuous",
        evidence: [
          "IT general controls documentation",
          "System hardening configuration evidence",
          "Patch management records",
          "Security tool deployment evidence",
        ],
        owner: "IT / Platform Team",
        automation: "Fully Automated",
        tooling: `${cloudProvider} / ${tools.endpointProtection ?? "Endpoint protection"} / Configuration management`,
      },
    ],
    "CC5.3": [
      {
        description: "Policies and procedures support control deployment",
        activity: "Control activities are documented in policies and procedures, assigned to responsible parties, and reviewed for continued relevance",
        frequency: "Annually",
        evidence: [
          "Policy and procedure documents with review dates",
          "Policy acknowledgment records",
          "Procedure execution evidence",
        ],
        owner: "Security Team",
        automation: "Manual",
        tooling: "Policy management system",
      },
    ],
    "CC6.1": [
      {
        description: "Logical access security software and infrastructure are implemented",
        activity: "Identity provider with SSO and MFA enforced for all production and critical systems; secrets managed through dedicated vault",
        frequency: "Continuous",
        evidence: [
          "SSO configuration and enforcement evidence",
          "MFA enrollment reports (100% coverage)",
          "Secrets management tool audit logs",
          `${cloudProvider} IAM policies and configuration`,
        ],
        owner: "Security Engineering",
        automation: "Fully Automated",
        tooling: `${tools.sso ?? "SSO/IdP"} / ${tools.secretsManagement ?? "Secrets management"} / ${cloudProvider} IAM`,
      },
      {
        description: "Information asset inventory is maintained",
        activity: "Automated discovery and manual validation of information assets including systems, applications, data stores, and endpoints",
        frequency: "Monthly",
        evidence: [
          "Asset inventory report",
          "Asset owner assignments",
          "Discovery scan results",
        ],
        owner: "IT / Security Team",
        automation: "Semi-Automated",
        tooling: `${cloudProvider} resource inventory / ${tools.endpointProtection ?? "Endpoint management"}`,
      },
    ],
    "CC6.2": [
      {
        description: "User registration and authorization precede access provisioning",
        activity: "Formal access request and approval workflow required before credentials are issued or access is granted to systems",
        frequency: "Per occurrence",
        evidence: [
          "Access request tickets with approvals",
          "Provisioning logs showing request-to-grant workflow",
          "New hire onboarding access checklist",
        ],
        owner: "IT / IAM Team",
        automation: "Semi-Automated",
        tooling: `${tools.ticketing ?? "Ticketing system"} / ${tools.sso ?? "IdP"} / HRIS integration`,
      },
    ],
    "CC6.3": [
      {
        description: "Access is managed based on roles with least privilege",
        activity: "RBAC model maintained with periodic access reviews to verify appropriateness; privileged access subject to enhanced controls",
        frequency: "Quarterly",
        evidence: [
          "RBAC role definitions and membership",
          "Quarterly access review completion records",
          "Privileged access justifications",
          "Deprovisioning records for role changes",
        ],
        owner: "Security Team / Managers",
        automation: "Semi-Automated",
        tooling: `${tools.sso ?? "IdP"} / Access review platform`,
      },
    ],
    "CC6.4": [
      {
        description: "Physical access to facilities is restricted to authorized personnel",
        activity: "Badge-based access control for offices; visitor management procedures enforced; access logs reviewed",
        frequency: "Continuous",
        evidence: [
          "Badge access system configuration",
          "Visitor sign-in logs",
          "Physical access review records",
          "Badge deactivation records for terminated personnel",
        ],
        owner: "Facilities / Security",
        automation: "Fully Automated",
        tooling: "Physical access control system / Visitor management",
      },
    ],
    "CC6.5": [
      {
        description: "Data on assets is securely disposed before decommissioning",
        activity: "Media sanitization procedures per NIST 800-88 applied before disposal; certificates of destruction obtained for sensitive media",
        frequency: "Per occurrence",
        evidence: [
          "Media sanitization records",
          "Certificates of destruction",
          "Asset disposal tracking log",
          "Verification of data removal before reassignment",
        ],
        owner: "IT Operations",
        automation: "Manual",
        tooling: "Asset management / Destruction vendor",
      },
    ],
    "CC6.6": [
      {
        description: "Security measures protect against external threats",
        activity: "Firewalls, WAF, IDS/IPS, and DDoS protection deployed at network boundaries; rules reviewed quarterly",
        frequency: "Continuous",
        evidence: [
          "Firewall rule sets and review records",
          "WAF configuration and block logs",
          "IDS/IPS alert logs",
          "Penetration test reports",
          "DDoS mitigation configuration",
        ],
        owner: "Security Engineering / Platform",
        automation: "Fully Automated",
        tooling: `${cloudProvider} security groups / WAF / ${tools.siem ?? "SIEM"}`,
      },
    ],
    "CC6.7": [
      {
        description: "Data transmission is restricted and encrypted",
        activity: "TLS 1.2+ enforced for all data in transit; DLP controls monitor for unauthorized data movement",
        frequency: "Continuous",
        evidence: [
          "TLS configuration scan results",
          "Certificate inventory and management records",
          "DLP policy configuration and alert logs",
          "Encryption in transit verification",
        ],
        owner: "Security Engineering",
        automation: "Fully Automated",
        tooling: `Certificate management / ${cloudProvider} encryption / DLP tool`,
      },
    ],
    "CC6.8": [
      {
        description: "Controls prevent or detect malicious software",
        activity: "Endpoint protection deployed to all endpoints with real-time scanning, behavioral detection, and centralized management",
        frequency: "Continuous",
        evidence: [
          "Endpoint protection deployment coverage report (100%)",
          "Malware detection and response logs",
          "Endpoint protection configuration settings",
          "Signature/definition update frequency logs",
        ],
        owner: "Security Operations",
        automation: "Fully Automated",
        tooling: tools.endpointProtection ?? "EDR/Endpoint protection platform",
      },
    ],
    "CC7.1": [
      {
        description: "Configuration changes and vulnerabilities are detected and monitored",
        activity: "Vulnerability scanning performed on defined schedule; configuration drift monitored against baselines; results triaged and remediated",
        frequency: "Weekly",
        evidence: [
          "Vulnerability scan reports with trending",
          "Configuration compliance scan results",
          "Remediation tickets and closure evidence",
          "Vulnerability SLA compliance metrics",
        ],
        owner: "Security Operations",
        automation: "Fully Automated",
        tooling: `${tools.vulnerabilityScanner ?? "Vulnerability scanner"} / ${tools.cloudSecurityPosture ?? "CSPM"}`,
      },
    ],
    "CC7.2": [
      {
        description: "System components are monitored for anomalies indicating security events",
        activity: "SIEM correlates events across systems to detect anomalous behavior; detection rules tuned and expanded based on threat intelligence",
        frequency: "Real-time",
        evidence: [
          "SIEM correlation rule inventory",
          "Alert volumes and response metrics",
          "Detection rule tuning records",
          "Threat intelligence integration logs",
        ],
        owner: "Security Operations",
        automation: "Fully Automated",
        tooling: tools.siem ?? "SIEM platform",
      },
    ],
    "CC7.3": [
      {
        description: "Detected events are evaluated for security impact",
        activity: "Security events are triaged, classified by severity, investigated, and escalated per incident response procedures",
        frequency: "Per occurrence",
        evidence: [
          "Security event triage records",
          "Investigation documentation",
          "Escalation records",
          "Mean time to detect/respond metrics",
        ],
        owner: "Security Operations",
        automation: "Semi-Automated",
        tooling: `${tools.siem ?? "SIEM"} / ${tools.ticketing ?? "Incident management"}`,
      },
    ],
    "CC7.4": [
      {
        description: "Incident response program is executed for confirmed incidents",
        activity: "Formal incident response process followed for confirmed security incidents including containment, eradication, recovery, and communication",
        frequency: "Per occurrence",
        evidence: [
          "Incident response records with timestamps",
          "Containment and eradication documentation",
          "Communication records (internal and external)",
          "Post-incident review reports",
        ],
        owner: "Security Team / Incident Commander",
        automation: "Manual",
        tooling: `${tools.ticketing ?? "Incident management"} / Communication platform`,
      },
    ],
    "CC7.5": [
      {
        description: "Recovery from security incidents is managed",
        activity: "Affected systems are recovered to known-good state; root cause determined; preventive measures implemented; lessons learned documented",
        frequency: "Per occurrence",
        evidence: [
          "Recovery procedure execution records",
          "Root cause analysis documentation",
          "Preventive action implementation evidence",
          "Lessons learned/post-mortem reports",
        ],
        owner: "Security Team / Engineering",
        automation: "Manual",
        tooling: `${tools.ticketing ?? "Incident management"} / Runbook automation`,
      },
    ],
    "CC8.1": [
      {
        description: "Changes are authorized, tested, and implemented through formal process",
        activity: "All production changes go through change management workflow: request, review, approve, test, implement, verify; emergency change process for urgent fixes",
        frequency: "Per occurrence",
        evidence: [
          "Change request tickets with approvals",
          "Code review records (pull request approvals)",
          "Test evidence (CI/CD pipeline results)",
          "Deployment logs",
          "Rollback procedure documentation",
        ],
        owner: "Engineering / Change Advisory Board",
        automation: "Fully Automated",
        tooling: `${tools.codeRepository ?? "Code repository"} / ${tools.ciCd ?? "CI/CD platform"} / ${tools.ticketing ?? "Ticketing"}`,
      },
      {
        description: "Separation of environments is maintained",
        activity: "Production, staging, and development environments are logically separated with independent access controls and no direct promotion paths without approval",
        frequency: "Continuous",
        evidence: [
          "Environment architecture diagrams",
          "Access control differences between environments",
          "Deployment pipeline configuration showing gates",
          "Production access audit logs",
        ],
        owner: "Platform Team",
        automation: "Fully Automated",
        tooling: `${cloudProvider} / ${tools.ciCd ?? "CI/CD platform"}`,
      },
    ],
    "CC9.1": [
      {
        description: "Risk mitigation activities for business disruptions are identified",
        activity: "Business disruption risks are identified through BIA, with mitigation strategies (insurance, redundancy, contingency planning) implemented",
        frequency: "Annually",
        evidence: [
          "Business Impact Analysis documentation",
          "Insurance certificates covering cyber and business interruption",
          "BCP/DRP plans",
          "BCP/DRP test results",
        ],
        owner: "Security Team / Business Operations",
        automation: "Manual",
        tooling: "GRC platform / BCP management tool",
      },
    ],
    "CC9.2": [
      {
        description: "Vendor and business partner risks are assessed and managed",
        activity: "Third-party vendor security assessments conducted during onboarding and periodically; contracts include security requirements",
        frequency: "Annually",
        evidence: [
          "Vendor risk assessment records",
          "Vendor SOC 2 report reviews",
          "Contract security clauses",
          "Vendor inventory with risk ratings",
          "Vendor reassessment schedule and completion",
        ],
        owner: "Security Team / Procurement",
        automation: "Semi-Automated",
        tooling: "Vendor risk management platform / GRC",
      },
    ],
    "A1.1": [
      {
        description: "Processing capacity is maintained and monitored",
        activity: "Infrastructure capacity is monitored with automated alerting and scaling; capacity planning conducted quarterly",
        frequency: "Continuous",
        evidence: [
          "Capacity monitoring dashboards and alert history",
          "Auto-scaling configuration and trigger logs",
          "Quarterly capacity planning reviews",
          "Resource utilization trending reports",
        ],
        owner: "Platform / Infrastructure Team",
        automation: "Fully Automated",
        tooling: `${cloudProvider} auto-scaling / Monitoring platform`,
      },
    ],
    "A1.2": [
      {
        description: "Backup and recovery infrastructure is maintained",
        activity: "Automated backups per defined schedule with integrity verification; recovery infrastructure maintained in separate region",
        frequency: "Daily",
        evidence: [
          "Backup job completion logs",
          "Backup integrity verification results",
          "DR infrastructure configuration documentation",
          "Backup restoration test results (monthly)",
        ],
        owner: "Platform / Infrastructure Team",
        automation: "Fully Automated",
        tooling: `${tools.backupSolution ?? `${cloudProvider} backup services`}`,
      },
    ],
    "A1.3": [
      {
        description: "Recovery plans are tested",
        activity: "DR failover testing conducted semi-annually; full DR exercise annually; results documented with improvement actions",
        frequency: "Semi-annually",
        evidence: [
          "DR test plan and schedule",
          "DR test execution results with RTO/RPO measurements",
          "Improvement actions from DR tests",
          "Updated runbooks based on test findings",
        ],
        owner: "Platform / Infrastructure Team",
        automation: "Semi-Automated",
        tooling: `${cloudProvider} / DR orchestration tool`,
      },
    ],
    "C1.1": [
      {
        description: "Confidential information is identified and maintained",
        activity: "Data classification applied per policy; confidential data mapped to systems and access-controlled per classification level",
        frequency: "Quarterly",
        evidence: [
          "Data classification inventory",
          "Data flow diagrams showing confidential data",
          "Access control lists for confidential data stores",
          "DLP policy configuration for confidential data",
        ],
        owner: "Data Owners / Security Team",
        automation: "Semi-Automated",
        tooling: "Data classification tool / DLP / GRC platform",
      },
    ],
    "C1.2": [
      {
        description: "Confidential information is disposed of securely",
        activity: "Data disposed per retention schedule using appropriate sanitization method for sensitivity level; disposal records maintained",
        frequency: "Per occurrence",
        evidence: [
          "Data retention schedule compliance reports",
          "Disposal execution records",
          "Certificates of destruction for physical media",
          "Automated data lifecycle management logs",
        ],
        owner: "IT Operations / Security Team",
        automation: "Semi-Automated",
        tooling: "Data lifecycle management / Asset management",
      },
    ],
    "PI1.1": [
      {
        description: "Processing specifications are defined and communicated",
        activity: "System processing requirements documented including input specifications, processing logic, and expected outputs; validated against requirements",
        frequency: "Per occurrence",
        evidence: [
          "System design documentation",
          "Data processing specifications",
          "Input/output validation rules",
          "Processing accuracy reports",
        ],
        owner: "Product / Engineering",
        automation: "Semi-Automated",
        tooling: `${tools.codeRepository ?? "Code repository"} / Documentation platform`,
      },
    ],
    "PI1.2": [
      {
        description: "System inputs are controlled for completeness and accuracy",
        activity: "Input validation controls (type checking, range validation, format verification) implemented and tested; rejected inputs logged",
        frequency: "Continuous",
        evidence: [
          "Input validation rule documentation",
          "Test results for input validation",
          "Rejected input logs and error handling evidence",
        ],
        owner: "Engineering",
        automation: "Fully Automated",
        tooling: `${tools.codeRepository ?? "Code repository"} / ${tools.ciCd ?? "CI/CD"} / Application logs`,
      },
    ],
    "PI1.3": [
      {
        description: "System processing controls ensure accuracy",
        activity: "Processing controls verify data integrity through checksums, reconciliation, and error detection; anomalies trigger alerts",
        frequency: "Continuous",
        evidence: [
          "Processing reconciliation reports",
          "Error detection and correction logs",
          "Data integrity verification results",
        ],
        owner: "Engineering",
        automation: "Fully Automated",
        tooling: "Application monitoring / Data quality platform",
      },
    ],
    "PI1.4": [
      {
        description: "System outputs are delivered completely and accurately",
        activity: "Output validation ensures completeness and accuracy before delivery; output access restricted to authorized recipients",
        frequency: "Continuous",
        evidence: [
          "Output validation logs",
          "Delivery confirmation records",
          "Output access control configuration",
        ],
        owner: "Engineering",
        automation: "Fully Automated",
        tooling: "Application platform / Delivery system",
      },
    ],
    "PI1.5": [
      {
        description: "Stored data maintains integrity",
        activity: "Data storage integrity verified through checksums, backup verification, and periodic reconciliation",
        frequency: "Daily",
        evidence: [
          "Storage integrity check results",
          "Backup verification logs",
          "Data reconciliation reports",
        ],
        owner: "Platform / Infrastructure Team",
        automation: "Fully Automated",
        tooling: `${cloudProvider} storage / Database platform`,
      },
    ],
    "P1.1": [
      {
        description: "Privacy notice is provided to data subjects",
        activity: "Privacy notice published on website and provided at point of data collection; reviewed and updated for regulatory changes",
        frequency: "Annually",
        evidence: [
          "Privacy notice/policy with version history",
          "Notice placement screenshots/documentation",
          "Annual review records",
          "Update communication records",
        ],
        owner: "Legal / Privacy Team",
        automation: "Manual",
        tooling: "Website CMS / Policy management",
      },
    ],
    "P2.1": [
      {
        description: "Consent mechanisms are implemented and managed",
        activity: "Consent collection, recording, and withdrawal mechanisms implemented; consent records maintained with audit trail",
        frequency: "Continuous",
        evidence: [
          "Consent management platform configuration",
          "Consent collection records",
          "Consent withdrawal processing records",
          "Consent audit trail",
        ],
        owner: "Privacy Team / Engineering",
        automation: "Fully Automated",
        tooling: "Consent management platform",
      },
    ],
    "P3.1": [
      {
        description: "Personal information collection is limited to identified purposes",
        activity: "Data collection points reviewed to ensure only necessary data is collected per stated purposes; data minimization enforced",
        frequency: "Quarterly",
        evidence: [
          "Data collection inventory mapped to purposes",
          "Data minimization review records",
          "Collection point audit results",
        ],
        owner: "Privacy Team / Product",
        automation: "Semi-Automated",
        tooling: "Data mapping platform / Privacy impact tool",
      },
    ],
    "P3.2": [
      {
        description: "Explicit consent obtained for sensitive data collection",
        activity: "Sensitive personal data collected only with explicit, documented consent; separate consent flows for special categories",
        frequency: "Per occurrence",
        evidence: [
          "Sensitive data consent records",
          "Consent flow screenshots/documentation",
          "Sensitive data processing register",
        ],
        owner: "Privacy Team / Product",
        automation: "Semi-Automated",
        tooling: "Consent management platform",
      },
    ],
    "P4.1": [
      {
        description: "Use of personal information limited to stated purposes",
        activity: "Processing activities mapped to legal bases and stated purposes; new uses require privacy impact assessment and updated notice",
        frequency: "Quarterly",
        evidence: [
          "Processing activities register (ROPA)",
          "Purpose limitation review records",
          "Privacy impact assessments for new processing",
        ],
        owner: "Privacy Team",
        automation: "Semi-Automated",
        tooling: "Privacy management platform / GRC",
      },
    ],
    "P4.2": [
      {
        description: "Personal information is disposed of per retention schedule",
        activity: "Automated and manual data disposal per defined retention periods; disposal verified and recorded",
        frequency: "Monthly",
        evidence: [
          "Retention schedule with compliance status",
          "Automated deletion job logs",
          "Manual disposal verification records",
          "Exception handling documentation",
        ],
        owner: "Privacy Team / Engineering",
        automation: "Semi-Automated",
        tooling: "Data lifecycle management / Database tools",
      },
    ],
    "P5.1": [
      {
        description: "Data subjects can access their personal information",
        activity: "Data subject access request (DSAR) process implemented with identity verification, data retrieval, and response within regulatory timelines",
        frequency: "Per occurrence",
        evidence: [
          "DSAR procedure documentation",
          "DSAR request and response logs with timelines",
          "Identity verification records",
          "Compliance with response deadlines",
        ],
        owner: "Privacy Team",
        automation: "Semi-Automated",
        tooling: "DSAR management platform / Case management",
      },
    ],
    "P5.2": [
      {
        description: "Data subjects can correct their personal information",
        activity: "Correction/amendment requests processed and propagated to downstream systems; requestor notified of completion",
        frequency: "Per occurrence",
        evidence: [
          "Correction request records",
          "Data update propagation evidence",
          "Notification to requestor records",
        ],
        owner: "Privacy Team / Engineering",
        automation: "Semi-Automated",
        tooling: "DSAR management platform / Application platform",
      },
    ],
    "P6.1": [
      {
        description: "Disclosure of personal information requires consent",
        activity: "Third-party data sharing controlled through consent, contracts, and DPA requirements; disclosures logged",
        frequency: "Per occurrence",
        evidence: [
          "Data sharing agreements / DPAs",
          "Consent records for disclosed data",
          "Third-party disclosure logs",
        ],
        owner: "Privacy Team / Legal",
        automation: "Semi-Automated",
        tooling: "Contract management / Privacy platform",
      },
    ],
    "P6.2": [
      {
        description: "Records of disclosures are maintained",
        activity: "Complete records of all authorized disclosures of personal data maintained with recipient, purpose, date, and data categories",
        frequency: "Per occurrence",
        evidence: [
          "Disclosure register/log",
          "Authorization documentation for disclosures",
          "Audit trail of data transfers",
        ],
        owner: "Privacy Team",
        automation: "Semi-Automated",
        tooling: "Privacy management platform / DLP",
      },
    ],
    "P7.1": [
      {
        description: "Personal information is maintained accurately",
        activity: "Data quality controls ensure accuracy and completeness; mechanisms for data subjects to update their information",
        frequency: "Continuous",
        evidence: [
          "Data quality monitoring reports",
          "Self-service update mechanism documentation",
          "Data accuracy validation results",
        ],
        owner: "Engineering / Privacy Team",
        automation: "Semi-Automated",
        tooling: "Application platform / Data quality tools",
      },
    ],
    "P8.1": [
      {
        description: "Privacy program compliance is monitored and enforced",
        activity: "Privacy program effectiveness assessed through audits, metrics, and complaint tracking; issues resolved and reported",
        frequency: "Quarterly",
        evidence: [
          "Privacy program audit results",
          "Privacy metrics and KPIs",
          "Complaint resolution records",
          "Privacy program reporting to management",
        ],
        owner: "Privacy Team / DPO",
        automation: "Semi-Automated",
        tooling: "Privacy management platform / GRC",
      },
    ],
  };

  return controlMap[criterionId] ?? [
    {
      description: `Control activity supporting ${criterionId} requirements`,
      activity: `Implement and maintain controls per ${criterionId} criterion requirements as documented in the information security policy`,
      frequency: "Continuous" as ControlFrequency,
      evidence: [
        "Control documentation",
        "Implementation evidence",
        "Periodic review records",
      ],
      owner: "Security Team",
      automation: "Semi-Automated" as const,
      tooling: "GRC platform / Security tools",
    },
  ];
}
