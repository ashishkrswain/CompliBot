/**
 * SOC 2 Policy Package Generator
 * Generates complete SOC 2 policy package mapped to AICPA Trust Services Criteria (TSC 2017)
 */

import { generateCompletion } from "../../lib/llm.js";
import { TRUST_SERVICES_CRITERIA, type TscCategory } from "../../data/tech/soc2-tsc.js";

export interface Soc2PolicyInput {
  companyName: string;
  productType: string;
  cloudProvider: "AWS" | "GCP" | "Azure";
  employeeCount: number;
  dataTypesProcessed: string[];
}

export interface Soc2Policy {
  id: string;
  title: string;
  tscCriteria: string[];
  purpose: string;
  scope: string;
  policyStatements: string[];
  responsibilities: PolicyResponsibility[];
  relatedPolicies: string[];
}

export interface PolicyResponsibility {
  role: string;
  duties: string[];
}

export interface Soc2PolicyPackage {
  companyName: string;
  generatedDate: string;
  version: string;
  policies: Soc2Policy[];
  summary: string;
}

export async function generateSoc2PolicyPackage(input: Soc2PolicyInput): Promise<Soc2PolicyPackage> {
  const policies = buildPolicyPackage(input);

  const systemPrompt = `You are an expert SOC 2 compliance consultant generating a comprehensive policy package mapped to AICPA Trust Services Criteria (TSC 2017). Generate professional, auditor-ready policy content tailored to the organization profile provided.`;

  const userPrompt = `Generate an executive summary for the following SOC 2 policy package:
Company: ${input.companyName}
Product Type: ${input.productType}
Cloud Provider: ${input.cloudProvider}
Employee Count: ${input.employeeCount}
Data Types: ${input.dataTypesProcessed.join(", ")}
Number of Policies: ${policies.length}
Policy Titles: ${policies.map((p) => p.title).join(", ")}

Provide a 3-4 paragraph executive summary describing the policy package scope, its alignment with TSC criteria, and how it supports the organization's SOC 2 readiness.`;

  const summary = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 2048,
  });

  return {
    companyName: input.companyName,
    generatedDate: new Date().toISOString().split("T")[0] ?? "",
    version: "1.0",
    policies,
    summary,
  };
}

function buildPolicyPackage(input: Soc2PolicyInput): Soc2Policy[] {
  const { companyName, productType, cloudProvider, employeeCount, dataTypesProcessed } = input;
  const isSmallOrg = employeeCount < 50;
  const cloudProviderName = getCloudProviderName(cloudProvider);

  return [
    buildInformationSecurityPolicy(companyName, productType),
    buildAccessControlPolicy(companyName, cloudProvider, cloudProviderName),
    buildChangeManagementPolicy(companyName, productType),
    buildRiskAssessmentPolicy(companyName),
    buildIncidentResponsePolicy(companyName),
    buildBusinessContinuityPolicy(companyName, cloudProvider, cloudProviderName),
    buildDataClassificationPolicy(companyName, dataTypesProcessed),
    buildEncryptionPolicy(companyName, cloudProvider, cloudProviderName),
    buildVendorManagementPolicy(companyName),
    buildHumanResourcesSecurityPolicy(companyName, isSmallOrg),
    buildPhysicalSecurityPolicy(companyName, cloudProvider, cloudProviderName),
    buildAcceptableUsePolicy(companyName),
    buildDataRetentionPolicy(companyName, dataTypesProcessed),
    buildMonitoringLoggingPolicy(companyName, cloudProvider, cloudProviderName),
    buildNetworkSecurityPolicy(companyName, cloudProvider, cloudProviderName),
  ];
}

function getCloudProviderName(provider: "AWS" | "GCP" | "Azure"): string {
  const names: Record<string, string> = {
    AWS: "Amazon Web Services (AWS)",
    GCP: "Google Cloud Platform (GCP)",
    Azure: "Microsoft Azure",
  };
  return names[provider] ?? provider;
}

function buildInformationSecurityPolicy(companyName: string, productType: string): Soc2Policy {
  return {
    id: "POL-IS-001",
    title: "Information Security Policy",
    tscCriteria: ["CC1.1", "CC1.2", "CC1.3", "CC1.4", "CC1.5"],
    purpose: `This policy establishes the information security governance framework for ${companyName}. It defines the organization's commitment to protecting the confidentiality, integrity, and availability of information assets and establishes the foundation for the information security management system (ISMS) supporting the ${productType} platform.`,
    scope: `This policy applies to all ${companyName} employees, contractors, temporary workers, and third-party service providers who access, process, store, or transmit ${companyName} information assets. It covers all information systems, applications, networks, and data repositories owned or operated by ${companyName}.`,
    policyStatements: [
      `${companyName} is committed to protecting all information assets from unauthorized access, disclosure, modification, destruction, or interference in accordance with business, legal, regulatory, and contractual requirements.`,
      "Executive leadership shall demonstrate commitment to information security through allocation of adequate resources, establishment of security objectives, and integration of security requirements into business processes.",
      "An information security governance structure shall be established with clearly defined roles, responsibilities, and reporting lines, headed by the Chief Information Security Officer (CISO) or equivalent role.",
      "Information security objectives shall be established at relevant functions and levels, shall be consistent with the information security policy, shall be measurable, and shall take into account applicable requirements and risk assessment results.",
      "All personnel shall receive appropriate awareness education and training relevant to their roles, with specialized training for personnel with information security responsibilities.",
      "The information security program shall be subject to regular independent review to ensure continuing suitability, adequacy, and effectiveness.",
      "Non-compliance with information security policies shall be addressed through a formal disciplinary process, up to and including termination of employment or contract.",
      "This policy shall be reviewed at minimum annually or upon significant organizational, technological, or regulatory changes.",
    ],
    responsibilities: [
      {
        role: "Board of Directors / Executive Leadership",
        duties: [
          "Approve the information security policy and strategic direction",
          "Allocate sufficient resources for information security program",
          "Ensure information security risks are integrated into enterprise risk management",
          "Review information security program effectiveness at least quarterly",
        ],
      },
      {
        role: "Chief Information Security Officer (CISO)",
        duties: [
          "Develop and maintain the information security strategy and policy framework",
          "Oversee implementation of security controls and risk management activities",
          "Report on security posture to executive leadership and board",
          "Ensure compliance with applicable regulations and contractual obligations",
          "Manage security incident response program",
        ],
      },
      {
        role: "Department Managers",
        duties: [
          "Implement security controls within their areas of responsibility",
          "Ensure personnel complete required security awareness training",
          "Report security events and participate in risk assessments",
          "Enforce compliance with security policies within their teams",
        ],
      },
      {
        role: "All Personnel",
        duties: [
          "Comply with all information security policies and procedures",
          "Complete assigned security awareness training",
          "Report suspected security incidents or vulnerabilities",
          "Protect credentials and information assets in their possession",
        ],
      },
    ],
    relatedPolicies: [
      "Access Control Policy",
      "Risk Assessment Policy",
      "Incident Response Policy",
      "Acceptable Use Policy",
      "Data Classification Policy",
    ],
  };
}

function buildAccessControlPolicy(companyName: string, cloudProvider: string, cloudProviderName: string): Soc2Policy {
  return {
    id: "POL-AC-001",
    title: "Access Control Policy",
    tscCriteria: ["CC6.1", "CC6.2", "CC6.3", "CC6.4", "CC6.5", "CC6.6", "CC6.7", "CC6.8"],
    purpose: `This policy establishes requirements for managing logical and physical access to ${companyName}'s information systems and data, ensuring that only authorized individuals have access to resources appropriate to their roles and responsibilities.`,
    scope: `This policy applies to all access to ${companyName} information systems, applications, infrastructure, data repositories, and physical facilities. This includes production environments hosted on ${cloudProviderName}, corporate networks, SaaS applications, and physical office/data center spaces.`,
    policyStatements: [
      "All access to information systems shall be granted based on the principles of least privilege and need-to-know, with role-based access control (RBAC) as the primary access model.",
      "Every user shall be assigned a unique identifier (user ID). Shared or generic accounts are prohibited except where technically unavoidable, in which case compensating controls and accountability measures must be documented and approved.",
      "Multi-factor authentication (MFA) shall be required for all access to production systems, cloud management consoles, VPN connections, and administrative interfaces.",
      "Access requests shall follow a formal authorization workflow requiring manager approval and, for privileged access, security team review prior to provisioning.",
      "Access reviews shall be conducted quarterly for privileged accounts and semi-annually for standard accounts. Access that is no longer appropriate shall be revoked within 24 hours of identification.",
      "User access shall be immediately revoked or modified upon termination of employment, change in role, or end of contractor engagement. Termination revocation shall occur within 4 hours of separation.",
      "Service accounts shall be inventoried, assigned an owner, protected with strong credentials stored in a secrets management solution, and reviewed quarterly.",
      "Remote access shall require VPN or zero-trust network access with MFA, endpoint compliance verification, and encrypted communications.",
      `Physical access to ${cloudProvider} data center facilities is managed by the cloud service provider per their SOC 2 reports. Access to corporate offices shall require badge access with visitor management procedures.`,
      "Password requirements shall enforce minimum 14 characters with complexity requirements, 90-day maximum age, and restrictions on password reuse (last 12 passwords).",
    ],
    responsibilities: [
      {
        role: "Identity and Access Management (IAM) Team",
        duties: [
          "Administer identity lifecycle (provisioning, modification, deprovisioning)",
          "Maintain IAM systems (SSO, directory services, PAM)",
          "Execute periodic access reviews and generate reports",
          "Manage service accounts and API key lifecycle",
        ],
      },
      {
        role: "System Owners",
        duties: [
          "Define role-based access models for their systems",
          "Approve access requests for their systems",
          "Participate in access certification reviews",
          "Report unauthorized access attempts or anomalies",
        ],
      },
      {
        role: "Managers",
        duties: [
          "Approve access requests for their direct reports",
          "Certify appropriateness of access during periodic reviews",
          "Notify IAM team of role changes and terminations promptly",
        ],
      },
      {
        role: "Human Resources",
        duties: [
          "Notify IAM team of new hires, transfers, and terminations",
          "Ensure offboarding checklist includes access revocation verification",
        ],
      },
    ],
    relatedPolicies: [
      "Information Security Policy",
      "Encryption Policy",
      "Network Security Policy",
      "Human Resources Security Policy",
    ],
  };
}

function buildChangeManagementPolicy(companyName: string, productType: string): Soc2Policy {
  return {
    id: "POL-CM-001",
    title: "Change Management Policy",
    tscCriteria: ["CC8.1"],
    purpose: `This policy establishes the requirements for managing changes to ${companyName}'s information systems, infrastructure, and applications to minimize risk of disruption and ensure changes are authorized, tested, and documented.`,
    scope: `This policy applies to all changes to production systems, infrastructure, applications, configurations, and databases supporting the ${productType} platform and corporate IT environment. This includes but is not limited to code deployments, infrastructure modifications, configuration changes, database schema changes, and network modifications.`,
    policyStatements: [
      "All changes to production systems shall be authorized through a formal change management process before implementation. Emergency changes shall follow an expedited process with post-implementation review.",
      "Changes shall be classified by risk level (standard, normal, emergency) with corresponding approval requirements and testing thresholds.",
      "A Change Advisory Board (CAB) shall review and approve all normal and major changes. Standard changes with pre-approved procedures may be implemented without CAB review.",
      "All changes shall include a rollback plan documented before implementation. Changes without a viable rollback plan shall require additional executive approval.",
      "Changes shall be tested in a non-production environment that reasonably replicates the production configuration before deployment to production.",
      "Code changes shall undergo peer review (minimum one reviewer) before merge approval. Security-sensitive changes require security team review.",
      "All changes shall be recorded in the change management system with: description, business justification, risk assessment, test evidence, approvals, implementation steps, and rollback procedures.",
      "Post-implementation reviews shall be conducted for all failed changes and major changes to identify lessons learned.",
      "Separation of duties shall be maintained between change development, testing, approval, and production deployment roles.",
      "Deployment to production shall use automated CI/CD pipelines with appropriate gates (code review, automated tests, security scans) wherever technically feasible.",
    ],
    responsibilities: [
      {
        role: "Change Advisory Board (CAB)",
        duties: [
          "Review and approve/reject change requests based on risk and business impact",
          "Assess aggregate change risk for scheduled deployment windows",
          "Review failed changes and ensure corrective actions are implemented",
          "Establish and maintain change management policies and procedures",
        ],
      },
      {
        role: "Change Requestor / Developer",
        duties: [
          "Submit change requests with complete documentation",
          "Perform testing and provide evidence of successful testing",
          "Document rollback procedures",
          "Implement approved changes per documented procedures",
        ],
      },
      {
        role: "Engineering / Platform Team",
        duties: [
          "Maintain CI/CD pipelines and deployment automation",
          "Ensure separation of development, staging, and production environments",
          "Monitor deployments and provide support for rollbacks",
        ],
      },
    ],
    relatedPolicies: [
      "Information Security Policy",
      "Incident Response Policy",
      "Monitoring and Logging Policy",
    ],
  };
}

function buildRiskAssessmentPolicy(companyName: string): Soc2Policy {
  return {
    id: "POL-RA-001",
    title: "Risk Assessment Policy",
    tscCriteria: ["CC3.1", "CC3.2", "CC3.3", "CC3.4"],
    purpose: `This policy establishes the framework for identifying, analyzing, evaluating, and treating information security risks at ${companyName}. It ensures that risk management activities are systematic, repeatable, and aligned with business objectives.`,
    scope: `This policy applies to all information assets, business processes, third-party relationships, and technology systems within ${companyName}. It covers strategic, operational, compliance, and technology risks that may impact the confidentiality, integrity, or availability of information and services.`,
    policyStatements: [
      `${companyName} shall maintain a formal risk management program that identifies, assesses, and treats information security risks on an ongoing basis.`,
      "A comprehensive risk assessment shall be conducted at minimum annually, and additionally when significant changes occur to the threat landscape, technology environment, business operations, or regulatory requirements.",
      "Risk assessments shall use a consistent methodology that evaluates risk based on threat likelihood, vulnerability exploitability, and potential business impact using a defined risk scoring matrix.",
      "All identified risks shall be documented in a risk register that includes: risk description, risk owner, likelihood rating, impact rating, inherent risk score, existing controls, residual risk score, and treatment plan.",
      "Risk treatment decisions (accept, mitigate, transfer, avoid) shall be documented with supporting justification. Risk acceptance shall require approval from the risk owner and CISO for risks above the defined risk appetite threshold.",
      "Fraud risk shall be explicitly assessed as part of the risk assessment process, considering incentives/pressures, opportunities, and rationalization factors.",
      "Third-party and supply chain risks shall be assessed during vendor onboarding and reviewed annually for existing critical vendors.",
      "Risk assessment results shall be reported to executive leadership quarterly and to the board at minimum annually.",
      "The risk management framework and methodology shall be reviewed annually for effectiveness and alignment with industry best practices (NIST CSF, ISO 27005, FAIR).",
    ],
    responsibilities: [
      {
        role: "CISO / Security Leadership",
        duties: [
          "Own the risk management program and methodology",
          "Facilitate annual and ad-hoc risk assessments",
          "Maintain the enterprise risk register",
          "Report risk posture to executive leadership and board",
          "Define risk appetite and acceptance thresholds",
        ],
      },
      {
        role: "Risk Owners (Department Heads)",
        duties: [
          "Accept ownership of risks within their domain",
          "Implement risk treatment plans within defined timelines",
          "Report changes in risk profile to security team",
          "Approve or escalate risk acceptance decisions",
        ],
      },
      {
        role: "All Personnel",
        duties: [
          "Report identified risks or emerging threats to security team",
          "Participate in risk assessments as subject matter experts",
          "Implement risk mitigation actions assigned to them",
        ],
      },
    ],
    relatedPolicies: [
      "Information Security Policy",
      "Vendor Management Policy",
      "Incident Response Policy",
      "Business Continuity and Disaster Recovery Policy",
    ],
  };
}

function buildIncidentResponsePolicy(companyName: string): Soc2Policy {
  return {
    id: "POL-IR-001",
    title: "Incident Response Policy",
    tscCriteria: ["CC7.1", "CC7.2", "CC7.3", "CC7.4", "CC7.5"],
    purpose: `This policy establishes ${companyName}'s approach to detecting, responding to, and recovering from security incidents. It ensures rapid containment, appropriate communication, and systematic improvement based on lessons learned.`,
    scope: `This policy applies to all confirmed or suspected security incidents affecting ${companyName}'s information systems, data, personnel, or operations. This includes incidents affecting customer data, production systems, corporate systems, and third-party integrations.`,
    policyStatements: [
      `${companyName} shall maintain a formal Incident Response Plan (IRP) that defines roles, responsibilities, communication procedures, and technical response procedures for all severity levels.`,
      "All security events shall be reported to the security team within 1 hour of detection. Events shall be triaged and classified within 4 hours of report.",
      "Incident severity levels shall be classified as: Critical (P1) — active data breach or complete service outage; High (P2) — confirmed compromise with contained impact; Medium (P3) — suspicious activity requiring investigation; Low (P4) — minor security events with no confirmed impact.",
      "Critical (P1) incidents shall trigger immediate engagement of the Incident Response Team (IRT) with 15-minute response SLA. Incident Commander shall be designated within 30 minutes.",
      "Containment actions shall prioritize: (1) stopping ongoing data loss, (2) preserving evidence, (3) maintaining service availability where safe to do so, (4) eradicating the threat.",
      "All incident response activities shall be documented in the incident management system with timestamped entries. Chain of custody shall be maintained for all evidence.",
      "Post-incident reviews (PIR) shall be conducted within 5 business days of incident closure for all P1 and P2 incidents. PIR findings shall result in documented action items with owners and deadlines.",
      "External notification requirements shall be assessed for every confirmed breach, including regulatory obligations (72-hour GDPR notification, state breach notification laws), contractual obligations, and law enforcement referral.",
      "Incident response capabilities shall be tested at minimum quarterly through tabletop exercises and annually through full simulation exercises.",
      "Threat intelligence shall be monitored continuously and integrated into detection rules, with indicators of compromise (IOCs) distributed to security tools within 4 hours of receipt.",
    ],
    responsibilities: [
      {
        role: "Incident Commander",
        duties: [
          "Lead the incident response effort and make critical decisions",
          "Coordinate between technical responders, communications, and leadership",
          "Authorize containment and eradication actions",
          "Determine when to escalate or engage external parties",
          "Approve external communications and notifications",
        ],
      },
      {
        role: "Incident Response Team (IRT)",
        duties: [
          "Perform technical investigation, containment, and eradication",
          "Collect and preserve forensic evidence",
          "Implement recovery actions and verify system integrity",
          "Document all response activities with timestamps",
        ],
      },
      {
        role: "Communications Lead",
        duties: [
          "Manage internal and external communications",
          "Prepare customer notifications per contractual SLAs",
          "Coordinate regulatory notifications with legal counsel",
          "Manage public statements if required",
        ],
      },
      {
        role: "All Personnel",
        duties: [
          "Report suspected incidents immediately via defined channels",
          "Preserve potential evidence (do not modify or delete)",
          "Cooperate with investigation activities",
          "Follow instructions from the Incident Response Team",
        ],
      },
    ],
    relatedPolicies: [
      "Information Security Policy",
      "Monitoring and Logging Policy",
      "Business Continuity and Disaster Recovery Policy",
      "Data Classification Policy",
    ],
  };
}

function buildBusinessContinuityPolicy(companyName: string, cloudProvider: string, cloudProviderName: string): Soc2Policy {
  return {
    id: "POL-BC-001",
    title: "Business Continuity and Disaster Recovery Policy",
    tscCriteria: ["A1.1", "A1.2", "A1.3"],
    purpose: `This policy establishes ${companyName}'s requirements for maintaining business operations and recovering from disruptions, ensuring that critical services continue to meet availability commitments to customers.`,
    scope: `This policy covers all critical business processes, information systems, and infrastructure supporting ${companyName}'s operations. This includes production systems hosted on ${cloudProviderName}, corporate systems, and supporting processes.`,
    policyStatements: [
      `${companyName} shall maintain Business Continuity Plans (BCPs) and Disaster Recovery Plans (DRPs) for all critical business processes and systems, updated at minimum annually.`,
      "Business Impact Analyses (BIA) shall be conducted annually to identify critical processes, determine Recovery Time Objectives (RTOs) and Recovery Point Objectives (RPOs), and establish recovery priorities.",
      "Production systems shall be designed with redundancy and failover capabilities sufficient to meet defined availability SLAs (99.9% minimum for customer-facing services).",
      "Data backups shall be performed per defined schedules: database — continuous replication with point-in-time recovery capability; application data — daily incremental, weekly full; configuration — version controlled with ability to rebuild.",
      "Backup integrity shall be verified through automated validation checks daily and full restoration testing monthly.",
      `Disaster recovery infrastructure shall be maintained in a geographically separate ${cloudProvider} region, capable of assuming production workloads within the defined RTO.`,
      "DR testing shall be conducted at minimum semi-annually, including full failover testing to the DR environment at least once per year.",
      "Communication plans shall define notification procedures for internal teams, customers, vendors, and regulatory bodies during service disruptions.",
      "Capacity management shall include monitoring of resource utilization, trend analysis, and capacity planning to prevent availability impacts from resource exhaustion.",
      "Post-disruption reviews shall be conducted within 10 business days of any unplanned outage exceeding 30 minutes, with improvement actions tracked to completion.",
    ],
    responsibilities: [
      {
        role: "VP of Engineering / CTO",
        duties: [
          "Approve BCP/DRP plans and recovery priorities",
          "Allocate resources for DR infrastructure and testing",
          "Sponsor DR test exercises and review results",
        ],
      },
      {
        role: "Platform / Infrastructure Team",
        duties: [
          "Implement and maintain DR infrastructure",
          "Execute backup procedures and verify integrity",
          "Conduct DR tests and document results",
          "Monitor capacity and availability metrics",
          "Implement auto-scaling and failover mechanisms",
        ],
      },
      {
        role: "Service Owners",
        duties: [
          "Define RTO/RPO requirements for their services",
          "Participate in BIA and DR planning activities",
          "Validate recovery procedures for their services",
          "Maintain runbooks for service recovery",
        ],
      },
    ],
    relatedPolicies: [
      "Information Security Policy",
      "Incident Response Policy",
      "Change Management Policy",
      "Monitoring and Logging Policy",
    ],
  };
}

function buildDataClassificationPolicy(companyName: string, dataTypes: string[]): Soc2Policy {
  return {
    id: "POL-DC-001",
    title: "Data Classification Policy",
    tscCriteria: ["C1.1", "C1.2"],
    purpose: `This policy establishes ${companyName}'s data classification framework, ensuring that information assets are categorized according to their sensitivity and criticality, enabling appropriate protection controls to be applied consistently.`,
    scope: `This policy applies to all data created, collected, processed, stored, or transmitted by ${companyName}, regardless of format (digital or physical) or storage location. This includes customer data, employee data, business data, and operational data. Data types processed include: ${dataTypes.join(", ")}.`,
    policyStatements: [
      "All data shall be classified into one of four levels: Restricted (highest sensitivity — breach would cause severe harm), Confidential (internal business data requiring protection), Internal (general internal information not for public release), Public (information approved for public distribution).",
      "Data classification shall be performed by the data owner at the point of creation or collection, using the classification criteria defined in the Data Classification Standard.",
      "Customer personal data and authentication credentials shall be classified as Restricted by default. Customer business data shall be classified as Confidential minimum.",
      "Restricted data shall be encrypted at rest and in transit, access-logged, subject to DLP controls, and accessible only to personnel with explicit business need verified through formal access request.",
      "Confidential data shall be encrypted in transit, access-controlled to authorized personnel, and stored only on approved systems with appropriate security controls.",
      "Data handling procedures (storage, transmission, sharing, disposal) shall correspond to the classification level as defined in the Data Handling Standard.",
      "Data labeling shall be applied to documents and data stores to indicate classification level. Automated classification tools shall be deployed where technically feasible.",
      "Data shall be reclassified when circumstances change (e.g., public disclosure, regulatory change, contract termination). Reclassification shall be documented.",
      "Data disposal shall follow secure destruction procedures appropriate to the classification level, per the Data Retention and Disposal Policy.",
    ],
    responsibilities: [
      {
        role: "Data Owners (Business Unit Leaders)",
        duties: [
          "Classify data within their domain per policy criteria",
          "Approve access to classified data",
          "Ensure classification remains current with periodic reviews",
          "Define retention requirements for their data",
        ],
      },
      {
        role: "Security Team",
        duties: [
          "Define classification criteria and handling standards",
          "Implement technical controls per classification level",
          "Monitor compliance with classification requirements",
          "Deploy and manage DLP and labeling tools",
        ],
      },
      {
        role: "All Personnel",
        duties: [
          "Apply classification labels when creating data",
          "Handle data per its classification level requirements",
          "Report misclassified or unclassified data to data owner",
        ],
      },
    ],
    relatedPolicies: [
      "Information Security Policy",
      "Encryption Policy",
      "Data Retention and Disposal Policy",
      "Access Control Policy",
    ],
  };
}

function buildEncryptionPolicy(companyName: string, cloudProvider: string, cloudProviderName: string): Soc2Policy {
  return {
    id: "POL-EN-001",
    title: "Encryption Policy",
    tscCriteria: ["CC6.1", "CC6.7"],
    purpose: `This policy establishes ${companyName}'s requirements for the use of cryptographic controls to protect the confidentiality and integrity of data at rest and in transit.`,
    scope: `This policy applies to all data classified as Confidential or Restricted that is stored, processed, or transmitted by ${companyName} systems. This includes production databases, backups, inter-service communications, client-server communications, removable media, and endpoint storage.`,
    policyStatements: [
      "All data in transit shall be encrypted using TLS 1.2 or higher. TLS 1.0 and 1.1 are prohibited. Certificate-based mutual TLS (mTLS) shall be used for inter-service communications in production.",
      `All data at rest classified as Confidential or Restricted shall be encrypted using AES-256 (or equivalent) via ${cloudProviderName}'s managed encryption services or application-level encryption.`,
      "Encryption keys shall be managed through a dedicated key management system (KMS). Customer-managed keys (CMK) shall be used for production data encryption.",
      "Key rotation shall occur at minimum annually for master keys. Data encryption keys shall be rotated per industry best practices for the specific use case.",
      "Private keys and secrets shall be stored exclusively in approved secrets management solutions (KMS, vault). Hard-coding of secrets in source code, configuration files, or environment variables in version control is strictly prohibited.",
      "Certificate management shall include automated renewal with minimum 30-day advance warning, inventory of all certificates, and monitoring for expiration.",
      "Cryptographic algorithms shall meet current NIST recommendations: AES-256 for symmetric encryption, RSA-2048 (minimum) or ECDSA P-256 for asymmetric encryption, SHA-256 (minimum) for hashing.",
      "Database field-level encryption shall be applied to highly sensitive fields (credentials, SSN, financial account numbers) in addition to storage-level encryption.",
      "Full-disk encryption shall be enabled on all endpoints (laptops, workstations) using the operating system's built-in encryption (BitLocker, FileVault).",
      "Deprecated or weak cryptographic algorithms (MD5, SHA-1, DES, 3DES, RC4) shall not be used for any security purpose.",
    ],
    responsibilities: [
      {
        role: "Security Engineering Team",
        duties: [
          "Define and maintain approved cryptographic standards",
          "Manage KMS infrastructure and key lifecycle",
          "Review and approve cryptographic implementations",
          "Monitor for weak cipher usage and certificate expiration",
        ],
      },
      {
        role: "Development Teams",
        duties: [
          "Implement encryption per approved standards in applications",
          "Use approved libraries for cryptographic operations",
          "Never implement custom cryptographic algorithms",
          "Store secrets only in approved secrets management solutions",
        ],
      },
      {
        role: "IT Operations",
        duties: [
          "Enable storage-level encryption on all data stores",
          "Manage endpoint encryption enrollment",
          "Maintain certificate inventory and renewal automation",
        ],
      },
    ],
    relatedPolicies: [
      "Data Classification Policy",
      "Access Control Policy",
      "Network Security Policy",
      "Information Security Policy",
    ],
  };
}

function buildVendorManagementPolicy(companyName: string): Soc2Policy {
  return {
    id: "POL-VM-001",
    title: "Vendor Management Policy",
    tscCriteria: ["CC9.1", "CC9.2"],
    purpose: `This policy establishes ${companyName}'s requirements for managing information security risks associated with third-party vendors, suppliers, and business partners who access, process, or store company or customer data.`,
    scope: `This policy applies to all third-party relationships where the vendor accesses, processes, stores, or could impact the security of ${companyName}'s information assets or customer data. This includes SaaS providers, infrastructure vendors, professional services firms, and subprocessors.`,
    policyStatements: [
      "All vendors that access, process, or store Confidential or Restricted data shall undergo a security assessment prior to engagement and periodically thereafter.",
      "Vendors shall be classified by risk tier: Critical (access to customer data or critical systems), High (access to Confidential internal data), Medium (limited system access), Low (no data access). Assessment depth shall correspond to tier.",
      "Critical and High-tier vendors shall provide evidence of their security program through SOC 2 Type II reports, ISO 27001 certification, or completion of a detailed security questionnaire assessed by the security team.",
      "All vendor agreements involving data access shall include contractual security requirements: data protection obligations, breach notification (within 48 hours), audit rights, data return/destruction upon termination, insurance requirements, and compliance with applicable regulations.",
      "Vendor security posture shall be reassessed annually for Critical tier, every 18 months for High tier, and every 24 months for Medium tier.",
      "A vendor inventory shall be maintained documenting: vendor name, services provided, data accessed, risk tier, contract owner, assessment date, next review date, and SOC report expiration.",
      "Vendor security incidents that impact or could impact ${companyName} data shall be treated per the Incident Response Policy with vendor cooperation mandated contractually.",
      "Subprocessor use by vendors shall require prior notification and ${companyName} shall maintain the right to object to subprocessors that do not meet security requirements.",
      "Vendor access shall follow least privilege principles and shall be revoked within 24 hours of contract termination.",
    ],
    responsibilities: [
      {
        role: "Security Team",
        duties: [
          "Conduct vendor security assessments and risk ratings",
          "Review SOC reports and security documentation",
          "Define security requirements for vendor contracts",
          "Track vendor assessment schedules and drive renewals",
          "Monitor vendor security posture through continuous monitoring tools",
        ],
      },
      {
        role: "Procurement / Legal",
        duties: [
          "Ensure security clauses are included in all applicable vendor agreements",
          "Coordinate with security team before finalizing vendor contracts",
          "Manage contract renewals and terminations",
        ],
      },
      {
        role: "Contract Owners (Business Stakeholders)",
        duties: [
          "Initiate vendor security assessments for new vendors",
          "Escalate vendor performance or security concerns",
          "Ensure vendor access is appropriate and current",
        ],
      },
    ],
    relatedPolicies: [
      "Risk Assessment Policy",
      "Access Control Policy",
      "Data Classification Policy",
      "Information Security Policy",
    ],
  };
}

function buildHumanResourcesSecurityPolicy(companyName: string, isSmallOrg: boolean): Soc2Policy {
  return {
    id: "POL-HR-001",
    title: "Human Resources Security Policy",
    tscCriteria: ["CC1.4", "CC1.5"],
    purpose: `This policy establishes information security requirements throughout the employment lifecycle at ${companyName}, from pre-employment screening through termination, ensuring personnel are suitable, aware of their responsibilities, and properly offboarded.`,
    scope: `This policy applies to all ${companyName} employees, contractors, interns, and temporary workers throughout their engagement lifecycle.`,
    policyStatements: [
      "Background checks shall be conducted on all personnel prior to granting access to information systems. Checks shall be proportional to the role and include at minimum: identity verification, criminal history (where legally permitted), and employment history verification.",
      "For roles with access to Restricted data or administrative privileges, enhanced screening shall include: education verification, credit check (where legally permitted), and reference checks from prior security-related roles.",
      "All personnel shall sign confidentiality/non-disclosure agreements and acceptable use agreements before receiving system access.",
      "Security awareness training shall be completed by all personnel within 30 days of hire and refreshed annually. Training shall cover: data handling, phishing recognition, incident reporting, physical security, and policy requirements.",
      `Role-specific security training shall be provided for: developers (secure coding — OWASP), ${isSmallOrg ? "administrators" : "system administrators"} (hardening, monitoring), managers (risk management, access reviews), and incident responders (forensics, containment).`,
      "Personnel performance evaluations shall include assessment of adherence to information security responsibilities.",
      "A formal disciplinary process shall address information security policy violations, with consequences ranging from additional training to termination depending on severity and intent.",
      "Offboarding procedures shall include: access revocation (within 4 hours of separation), return of all company assets (devices, badges, documents), removal from communication channels, reminder of ongoing confidentiality obligations, and exit interview covering security obligations.",
      "Personnel transfers between roles shall trigger access review and modification within 5 business days, with previous role access removed unless explicitly re-authorized.",
    ],
    responsibilities: [
      {
        role: "Human Resources",
        duties: [
          "Conduct pre-employment screening per policy requirements",
          "Maintain employment agreements including security obligations",
          "Execute offboarding procedures for separating personnel",
          "Track completion of security awareness training",
          "Administer disciplinary process for security violations",
        ],
      },
      {
        role: "Security Team",
        duties: [
          "Define and maintain security awareness training content",
          "Deliver role-specific security training",
          "Conduct phishing simulations and measure response",
          "Verify completion of offboarding access revocation",
        ],
      },
      {
        role: "Managers",
        duties: [
          "Ensure direct reports complete required training",
          "Report security violations through appropriate channels",
          "Initiate offboarding process promptly upon separation decision",
          "Review and validate role-appropriate access for team members",
        ],
      },
    ],
    relatedPolicies: [
      "Information Security Policy",
      "Access Control Policy",
      "Acceptable Use Policy",
      "Data Classification Policy",
    ],
  };
}

function buildPhysicalSecurityPolicy(companyName: string, cloudProvider: string, cloudProviderName: string): Soc2Policy {
  return {
    id: "POL-PS-001",
    title: "Physical Security Policy",
    tscCriteria: ["CC6.4", "CC6.5"],
    purpose: `This policy establishes ${companyName}'s requirements for physical security controls protecting facilities, equipment, and information assets from unauthorized physical access, damage, and environmental threats.`,
    scope: `This policy applies to all ${companyName} physical facilities including offices, server rooms (if applicable), and any spaces where company information is processed or stored. Data center physical security is managed by ${cloudProviderName} per their SOC 2 reports.`,
    policyStatements: [
      "All office facilities shall employ multi-layered physical access controls: building perimeter access, floor/suite access, and restricted area access (server rooms, network closets).",
      "Access to facilities shall require electronic badge/key card authentication. Badge access logs shall be retained for minimum 90 days.",
      "Visitor access shall require: registration at reception, valid identification, escort by an employee at all times in secure areas, visible visitor badge, and sign-out upon departure.",
      "Restricted areas (server rooms, network closets, executive offices with sensitive materials) shall require additional access controls and access limited to explicitly authorized personnel.",
      "Security cameras shall monitor building entrances/exits, server room entrances, and common areas. Recordings shall be retained for minimum 30 days.",
      "Environmental controls (HVAC, fire suppression, water detection) shall be maintained for areas housing IT equipment.",
      "Clean desk procedures shall be enforced: sensitive documents secured when unattended, screens locked when away from desk, whiteboards containing sensitive information erased after meetings.",
      "Equipment disposal shall follow secure media sanitization procedures per NIST SP 800-88. Certificates of destruction shall be obtained for all media containing Restricted data.",
      "Physical access shall be reviewed quarterly for restricted areas and semi-annually for general office access.",
      `Data center physical security controls are inherited from ${cloudProviderName} and validated through review of their SOC 2 Type II report and complementary user entity controls (CUECs).`,
    ],
    responsibilities: [
      {
        role: "Facilities / Office Management",
        duties: [
          "Manage physical access control systems (badge readers, cameras)",
          "Administer visitor management procedures",
          "Maintain environmental controls and monitoring",
          "Coordinate equipment disposal with security team",
        ],
      },
      {
        role: "Security Team",
        duties: [
          "Define physical security requirements and standards",
          "Conduct periodic physical security assessments",
          "Review camera footage when investigating incidents",
          "Validate physical access reviews",
          "Review cloud provider SOC 2 reports for physical security",
        ],
      },
      {
        role: "All Personnel",
        duties: [
          "Follow clean desk procedures",
          "Not allow tailgating or hold doors for unverified individuals",
          "Report lost badges or unauthorized physical access attempts",
          "Escort visitors at all times in secure areas",
        ],
      },
    ],
    relatedPolicies: [
      "Access Control Policy",
      "Data Classification Policy",
      "Data Retention and Disposal Policy",
      "Information Security Policy",
    ],
  };
}

function buildAcceptableUsePolicy(companyName: string): Soc2Policy {
  return {
    id: "POL-AU-001",
    title: "Acceptable Use Policy",
    tscCriteria: ["CC1.4"],
    purpose: `This policy defines acceptable and prohibited use of ${companyName}'s information systems, networks, and devices by all personnel, protecting both the organization and its personnel.`,
    scope: `This policy applies to all use of ${companyName}'s information systems, networks, email, internet access, computing devices (company-owned and BYOD), software, cloud services, and data by all employees, contractors, and authorized third parties.`,
    policyStatements: [
      `${companyName}'s information systems are provided primarily for business use. Limited personal use is permitted provided it does not interfere with job performance, consume excessive resources, or violate any policy provisions.`,
      "Users shall not attempt to access systems, data, or networks for which they are not authorized. Unauthorized access attempts will be treated as security incidents regardless of intent.",
      "Users shall not install unauthorized software on company devices. All software must be approved through the IT procurement process or be on the pre-approved software list.",
      "Users shall not disable or circumvent security controls including antivirus, endpoint detection, disk encryption, screen locks, or network security tools.",
      "Company email shall not be used for: mass unsolicited emails, forwarding chain letters, distribution of offensive/discriminatory content, personal business ventures, or activities that could damage the company's reputation.",
      "Users shall not store company data classified as Confidential or above on personal devices, personal cloud storage, or unapproved SaaS applications without explicit security team authorization.",
      "Users shall lock their workstations (Ctrl+L / Cmd+L) when stepping away from their desk. Auto-lock shall be configured at maximum 5 minutes of inactivity.",
      "Users shall not share their credentials with any other person. Each user is accountable for all activities performed under their credentials.",
      "Violations of this policy may result in disciplinary action up to and including termination, and where applicable, criminal prosecution or civil proceedings.",
      "Users shall immediately report any suspected policy violation, security incident, or unauthorized access to the security team.",
    ],
    responsibilities: [
      {
        role: "Security Team",
        duties: [
          "Maintain and communicate the acceptable use policy",
          "Monitor compliance through technical controls",
          "Investigate reported violations",
          "Maintain approved software list",
        ],
      },
      {
        role: "IT Team",
        duties: [
          "Enforce technical controls supporting acceptable use (MDM, DLP, web filtering)",
          "Manage software deployment and approved application catalog",
          "Support endpoint security configuration",
        ],
      },
      {
        role: "Managers",
        duties: [
          "Ensure personnel understand acceptable use requirements",
          "Address minor violations through coaching",
          "Escalate significant violations to HR and security",
        ],
      },
      {
        role: "All Personnel",
        duties: [
          "Read, understand, and comply with this policy",
          "Report violations or concerns through appropriate channels",
          "Complete annual policy acknowledgment",
        ],
      },
    ],
    relatedPolicies: [
      "Information Security Policy",
      "Data Classification Policy",
      "Human Resources Security Policy",
    ],
  };
}

function buildDataRetentionPolicy(companyName: string, dataTypes: string[]): Soc2Policy {
  return {
    id: "POL-DR-001",
    title: "Data Retention and Disposal Policy",
    tscCriteria: ["CC6.5", "P4.2"],
    purpose: `This policy establishes ${companyName}'s requirements for retaining and disposing of data, ensuring compliance with legal and regulatory obligations while minimizing risk from retaining data beyond its useful life.`,
    scope: `This policy applies to all data created, collected, or processed by ${companyName} in any format (digital or physical), across all storage systems and locations. Data types in scope include: ${dataTypes.join(", ")}.`,
    policyStatements: [
      "All data shall be retained only as long as necessary for its stated business purpose or as required by applicable law, regulation, or contractual obligation — whichever is longer.",
      "A data retention schedule shall be maintained defining retention periods for each data category. The schedule shall be reviewed annually and updated for regulatory changes.",
      "Default retention periods shall be: customer personal data — duration of account plus 30 days (unless required longer by law); financial records — 7 years; employment records — 7 years post-separation; security logs — 1 year; backup data — per backup rotation schedule not exceeding 90 days.",
      "When a legal hold is issued, affected data shall be preserved regardless of retention schedule until the hold is released. Legal holds take precedence over deletion schedules.",
      "Upon expiration of the retention period (and absence of legal hold), data shall be securely disposed of within 90 days.",
      "Digital data disposal shall use methods appropriate to sensitivity: Restricted data — cryptographic erasure or physical destruction; Confidential data — secure overwrite (NIST 800-88 Clear minimum); Internal/Public — standard deletion.",
      "Physical media and documents shall be disposed of via cross-cut shredding (minimum P-4 per DIN 66399) or certified destruction service with certificate of destruction.",
      "Customer data shall be deleted or returned within 30 days of contract termination unless a longer retention period is required by law and communicated to the customer.",
      "Automated data lifecycle management shall be implemented where feasible to enforce retention periods and trigger disposal workflows.",
      "Records of disposal activities shall be maintained for audit purposes, including: data category, disposal date, disposal method, personnel performing disposal, and verification.",
    ],
    responsibilities: [
      {
        role: "Data Owners",
        duties: [
          "Define retention requirements for data in their domain",
          "Approve disposal of data per retention schedule",
          "Ensure legal holds are communicated to the security/legal team",
        ],
      },
      {
        role: "Security / IT Team",
        duties: [
          "Implement automated retention and disposal mechanisms",
          "Execute secure data disposal procedures",
          "Maintain disposal records and certificates of destruction",
          "Verify backup data aligns with retention schedule",
        ],
      },
      {
        role: "Legal / Compliance",
        duties: [
          "Issue and manage legal holds",
          "Advise on regulatory retention requirements",
          "Review and approve retention schedule annually",
        ],
      },
    ],
    relatedPolicies: [
      "Data Classification Policy",
      "Encryption Policy",
      "Physical Security Policy",
      "Information Security Policy",
    ],
  };
}

function buildMonitoringLoggingPolicy(companyName: string, cloudProvider: string, cloudProviderName: string): Soc2Policy {
  return {
    id: "POL-ML-001",
    title: "Monitoring and Logging Policy",
    tscCriteria: ["CC7.1", "CC7.2", "CC7.3"],
    purpose: `This policy establishes ${companyName}'s requirements for monitoring information systems and maintaining audit logs to enable detection of security events, support incident investigation, and demonstrate compliance.`,
    scope: `This policy applies to all production systems, infrastructure, applications, security tools, and network devices operated by ${companyName}, including ${cloudProviderName} services, SaaS applications, and corporate systems.`,
    policyStatements: [
      "All production systems shall generate audit logs capturing security-relevant events. Logs must include at minimum: timestamp (UTC), event type, source system, user/service identity, action performed, target resource, and outcome (success/failure).",
      "Security-relevant events that must be logged include: authentication attempts (success/failure), authorization failures, privilege escalation, data access to Restricted data, administrative actions, configuration changes, system start/stop, and error conditions.",
      "Logs shall be collected centrally in a SIEM or log management platform within 5 minutes of generation. Logs shall not be stored only on the originating system.",
      "Log integrity shall be protected through: write-once storage or append-only log streams, access controls limiting log modification to authorized security personnel, and tamper-detection mechanisms.",
      "Log retention periods shall be: security event logs — 1 year online, 2 years archived; application logs — 90 days; infrastructure logs — 90 days; access logs — 1 year.",
      "Real-time alerting shall be configured for: failed authentication exceeding threshold (5 failures in 5 minutes), privileged account usage outside normal patterns, data exfiltration indicators, malware detection, configuration changes to security controls, and system availability degradation.",
      "Alert response SLAs shall be: Critical alerts — 15 minutes acknowledgment; High alerts — 1 hour; Medium alerts — 4 hours; Low alerts — next business day.",
      `${cloudProviderName} service logs (CloudTrail/Activity Log/Audit Log) shall be enabled for all services and forwarded to the centralized SIEM.`,
      "Vulnerability scanning shall be performed weekly on external-facing assets and monthly on internal assets. Critical vulnerabilities shall be remediated within 7 days, high within 30 days.",
      "Monitoring dashboards shall be maintained for: security posture overview, system availability, access patterns, and compliance metrics. Dashboards shall be reviewed daily by the security/operations team.",
    ],
    responsibilities: [
      {
        role: "Security Operations (SecOps)",
        duties: [
          "Monitor SIEM alerts and investigate security events",
          "Tune detection rules to reduce false positives while maintaining coverage",
          "Conduct threat hunting activities using log data",
          "Produce security monitoring reports for leadership",
          "Manage vulnerability scanning program",
        ],
      },
      {
        role: "Platform / Infrastructure Team",
        duties: [
          "Ensure logging is enabled and configured per policy on all systems",
          "Maintain log collection pipeline reliability",
          "Implement system-level monitoring and availability alerts",
          "Manage log storage and retention infrastructure",
        ],
      },
      {
        role: "Development Teams",
        duties: [
          "Implement application-level logging per security logging requirements",
          "Include security-relevant events in application log output",
          "Not log sensitive data (passwords, tokens, PII) in application logs",
        ],
      },
    ],
    relatedPolicies: [
      "Incident Response Policy",
      "Access Control Policy",
      "Information Security Policy",
      "Network Security Policy",
    ],
  };
}

function buildNetworkSecurityPolicy(companyName: string, cloudProvider: string, cloudProviderName: string): Soc2Policy {
  return {
    id: "POL-NS-001",
    title: "Network Security Policy",
    tscCriteria: ["CC6.6"],
    purpose: `This policy establishes ${companyName}'s requirements for securing network infrastructure and communications, protecting against unauthorized access, interception, and disruption.`,
    scope: `This policy applies to all network infrastructure operated by or on behalf of ${companyName}, including ${cloudProviderName} virtual networks, corporate LAN/WAN, wireless networks, VPN, and interconnections with third parties.`,
    policyStatements: [
      "Network architecture shall follow defense-in-depth principles with segmentation between environments (production, staging, development, corporate) and between security zones (DMZ, application, database, management).",
      "Firewall rules shall follow default-deny (whitelist) approach. All traffic not explicitly permitted shall be denied. Rules shall be reviewed quarterly and stale rules removed.",
      "Production networks shall be isolated from corporate networks and development/staging environments. No direct connectivity shall exist between corporate endpoints and production databases.",
      "Internet-facing services shall be protected by a Web Application Firewall (WAF) and DDoS mitigation services.",
      "Network intrusion detection/prevention systems (IDS/IPS) shall monitor traffic at network boundaries and between security zones.",
      "All administrative access to network devices shall use encrypted protocols (SSH, HTTPS) with MFA. Telnet, HTTP, and SNMPv1/v2 are prohibited for management access.",
      "Wireless networks shall use WPA3-Enterprise (or WPA2-Enterprise minimum) with 802.1X authentication. Guest wireless shall be isolated from corporate networks with no access to internal resources.",
      "Network device configurations shall be version-controlled, backed up, and compared against security baselines. Changes to network configurations shall follow the Change Management Policy.",
      `${cloudProviderName} security groups and network ACLs shall implement micro-segmentation, with each service allowed only the minimum required network connectivity.`,
      "DNS security extensions (DNSSEC) shall be enabled for external domains. Internal DNS shall be restricted to authorized resolvers.",
      "Regular penetration testing (at minimum annually) shall assess network security controls, with findings remediated per the vulnerability management timeline.",
    ],
    responsibilities: [
      {
        role: "Network / Platform Engineering",
        duties: [
          "Design, implement, and maintain network infrastructure",
          "Manage firewall rules and network ACLs",
          "Monitor network health and performance",
          "Implement network segmentation and access controls",
          "Respond to network security alerts",
        ],
      },
      {
        role: "Security Team",
        duties: [
          "Define network security architecture requirements",
          "Review firewall rule changes and conduct quarterly reviews",
          "Manage IDS/IPS rules and alert tuning",
          "Coordinate penetration testing activities",
          "Monitor for network-based threats and anomalies",
        ],
      },
      {
        role: "IT Operations",
        duties: [
          "Manage corporate network and wireless infrastructure",
          "Maintain VPN infrastructure for remote access",
          "Ensure network devices are patched and updated",
        ],
      },
    ],
    relatedPolicies: [
      "Access Control Policy",
      "Encryption Policy",
      "Monitoring and Logging Policy",
      "Change Management Policy",
    ],
  };
}
