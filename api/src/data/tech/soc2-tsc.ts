/**
 * AICPA Trust Services Criteria (TSC) 2017 with 2022 revisions
 * Complete criteria for SOC 2 Type I and Type II examinations
 */

export interface TrustServicesCriterion {
  id: string;
  category: TscCategory;
  title: string;
  description: string;
  pointsOfFocus: string[];
}

export type TscCategory =
  | "CC1"
  | "CC2"
  | "CC3"
  | "CC4"
  | "CC5"
  | "CC6"
  | "CC7"
  | "CC8"
  | "CC9"
  | "A1"
  | "C1"
  | "PI1"
  | "P1"
  | "P2"
  | "P3"
  | "P4"
  | "P5"
  | "P6"
  | "P7"
  | "P8";

export const TSC_CATEGORY_NAMES: Record<TscCategory, string> = {
  CC1: "Control Environment",
  CC2: "Communication and Information",
  CC3: "Risk Assessment",
  CC4: "Monitoring Activities",
  CC5: "Control Activities",
  CC6: "Logical and Physical Access Controls",
  CC7: "System Operations",
  CC8: "Change Management",
  CC9: "Risk Mitigation",
  A1: "Availability",
  C1: "Confidentiality",
  PI1: "Processing Integrity",
  P1: "Privacy — Notice",
  P2: "Privacy — Choice and Consent",
  P3: "Privacy — Collection",
  P4: "Privacy — Use, Retention, and Disposal",
  P5: "Privacy — Access",
  P6: "Privacy — Disclosure",
  P7: "Privacy — Quality",
  P8: "Privacy — Monitoring and Enforcement",
};

export const TRUST_SERVICES_CRITERIA: TrustServicesCriterion[] = [
  // CC1 — Control Environment
  {
    id: "CC1.1",
    category: "CC1",
    title: "COSO Principle 1: Demonstrates Commitment to Integrity and Ethical Values",
    description:
      "The entity demonstrates a commitment to integrity and ethical values.",
    pointsOfFocus: [
      "Sets the tone at the top — the board of directors and management demonstrate importance of integrity and ethical values",
      "Establishes standards of conduct — expectations are defined in a code of conduct or equivalent",
      "Evaluates adherence to standards of conduct — deviations are identified and remediated timely",
      "Addresses deviations in a timely manner — corrective action is taken for violations",
    ],
  },
  {
    id: "CC1.2",
    category: "CC1",
    title: "COSO Principle 2: Exercises Oversight Responsibility",
    description:
      "The board of directors demonstrates independence from management and exercises oversight of the development and performance of internal control.",
    pointsOfFocus: [
      "Establishes oversight responsibilities — board identifies and accepts its oversight role",
      "Applies relevant expertise — board defines, maintains, and evaluates skills needed",
      "Operates independently — sufficient independent members exist",
      "Provides oversight for the system of internal control — board retains oversight responsibility",
    ],
  },
  {
    id: "CC1.3",
    category: "CC1",
    title: "COSO Principle 3: Establishes Structure, Authority, and Responsibility",
    description:
      "Management establishes, with board oversight, structures, reporting lines, and appropriate authorities and responsibilities in pursuit of objectives.",
    pointsOfFocus: [
      "Considers all structures of the entity — management and board consider business, operating, legal, and reporting structures",
      "Establishes reporting lines — reporting lines are defined enabling authority and responsibility flow",
      "Defines, assigns, and limits authorities and responsibilities — delegation of authority is defined",
    ],
  },
  {
    id: "CC1.4",
    category: "CC1",
    title: "COSO Principle 4: Demonstrates Commitment to Competence",
    description:
      "The entity demonstrates a commitment to attract, develop, and retain competent individuals in alignment with objectives.",
    pointsOfFocus: [
      "Establishes policies and practices — HR policies are defined for recruitment, training, compensation",
      "Evaluates competence and addresses shortcomings — performance is measured, shortcomings identified",
      "Attracts, develops, and retains individuals — succession plans exist for key roles",
      "Plans and prepares for succession — critical roles have backup personnel",
    ],
  },
  {
    id: "CC1.5",
    category: "CC1",
    title: "COSO Principle 5: Enforces Accountability",
    description:
      "The entity holds individuals accountable for their internal control responsibilities in pursuit of objectives.",
    pointsOfFocus: [
      "Enforces accountability through structures, authorities, and responsibilities",
      "Establishes performance measures, incentives, and rewards",
      "Evaluates performance measures, incentives, and rewards for ongoing relevance",
      "Considers excessive pressures — management evaluates and adjusts when excessive",
      "Evaluates performance and rewards or disciplines individuals — evaluations are objective",
    ],
  },
  // CC2 — Communication and Information
  {
    id: "CC2.1",
    category: "CC2",
    title: "COSO Principle 13: Uses Relevant Information",
    description:
      "The entity obtains or generates and uses relevant, quality information to support the functioning of internal control.",
    pointsOfFocus: [
      "Identifies information requirements — information required to support internal control is identified",
      "Captures internal and external sources of data — relevant data from both sources is captured",
      "Processes relevant data into information — data is processed into useful information",
      "Maintains quality throughout processing — accuracy, completeness, timeliness maintained",
      "Considers costs and benefits — cost-benefit analysis informs data collection decisions",
    ],
  },
  {
    id: "CC2.2",
    category: "CC2",
    title: "COSO Principle 14: Communicates Internally",
    description:
      "The entity internally communicates information, including objectives and responsibilities for internal control, necessary to support the functioning of internal control.",
    pointsOfFocus: [
      "Communicates internal control information — policies, updates, and expectations are communicated",
      "Communicates with the board of directors — critical information flows to the board",
      "Provides separate communication lines — whistleblower channels exist",
      "Selects relevant method of communication — considers audience, nature, cost, regulatory requirements",
    ],
  },
  {
    id: "CC2.3",
    category: "CC2",
    title: "COSO Principle 15: Communicates Externally",
    description:
      "The entity communicates with external parties regarding matters affecting the functioning of internal control.",
    pointsOfFocus: [
      "Communicates to external parties — information about policies, actions, and performance",
      "Enables inbound communications — external parties can communicate relevant information",
      "Communicates with the board of directors — external communication matters are reported",
      "Provides separate communication lines — mechanisms for anonymous external reporting",
      "Selects relevant method of communication — method matches audience and regulatory requirements",
    ],
  },
  // CC3 — Risk Assessment
  {
    id: "CC3.1",
    category: "CC3",
    title: "COSO Principle 6: Specifies Suitable Objectives",
    description:
      "The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks relating to objectives.",
    pointsOfFocus: [
      "Operations objectives — reflect management choices about structure, industry, and performance",
      "External financial reporting objectives — compliance with standards and regulations",
      "External non-financial reporting objectives — established standards and frameworks",
      "Internal reporting objectives — reflect management choices",
      "Compliance objectives — consider laws and regulations from external authorities",
    ],
  },
  {
    id: "CC3.2",
    category: "CC3",
    title: "COSO Principle 7: Identifies and Analyzes Risk",
    description:
      "The entity identifies risks to the achievement of its objectives across the entity and analyzes risks as a basis for determining how the risks should be managed.",
    pointsOfFocus: [
      "Includes entity, subsidiary, division, operating unit, and functional levels",
      "Analyzes internal and external factors — technology changes, business model changes, geopolitical",
      "Involves appropriate levels of management — risk assessment includes relevant management",
      "Estimates significance of risks identified — likelihood and impact assessed",
      "Determines how to respond to risks — accept, avoid, reduce, or share risks",
    ],
  },
  {
    id: "CC3.3",
    category: "CC3",
    title: "COSO Principle 8: Assesses Fraud Risk",
    description:
      "The entity considers the potential for fraud in assessing risks to the achievement of objectives.",
    pointsOfFocus: [
      "Considers various types of fraud — fraudulent reporting, asset misappropriation, corruption",
      "Assesses incentive and pressures — operating and financial targets create incentive",
      "Assesses opportunities — nature of business or activity provides opportunity",
      "Assesses attitudes and rationalizations — management and personnel may have attitudes that allow fraud",
    ],
  },
  {
    id: "CC3.4",
    category: "CC3",
    title: "COSO Principle 9: Identifies and Analyzes Significant Change",
    description:
      "The entity identifies and assesses changes that could significantly impact the system of internal control.",
    pointsOfFocus: [
      "Assesses changes in the external environment — regulatory, economic, physical changes",
      "Assesses changes in the business model — new technology, new products, new geography",
      "Assesses changes in leadership — attitudes and philosophies of new leaders",
    ],
  },
  // CC4 — Monitoring Activities
  {
    id: "CC4.1",
    category: "CC4",
    title: "COSO Principle 16: Selects, Develops, and Performs Ongoing and/or Separate Evaluations",
    description:
      "The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning.",
    pointsOfFocus: [
      "Considers a mix of ongoing and separate evaluations",
      "Considers rate of change — frequency is adjusted to match pace of change",
      "Establishes baseline understanding — control system design and current state",
      "Uses knowledgeable personnel — evaluators understand what is being evaluated",
      "Integrates with business processes — ongoing evaluations are built into operations",
      "Adjusts scope and frequency — risk drives the evaluation approach",
      "Objectively evaluates — separate evaluations provide objective assessment",
    ],
  },
  {
    id: "CC4.2",
    category: "CC4",
    title: "COSO Principle 17: Evaluates and Communicates Deficiencies",
    description:
      "The entity evaluates and communicates internal control deficiencies in a timely manner to those parties responsible for taking corrective action, including senior management and the board of directors, as appropriate.",
    pointsOfFocus: [
      "Assesses results — management and board assess results of evaluations",
      "Communicates deficiencies — deficiencies are communicated to appropriate parties",
      "Monitors corrective actions — management tracks whether deficiencies are resolved",
    ],
  },
  // CC5 — Control Activities
  {
    id: "CC5.1",
    category: "CC5",
    title: "COSO Principle 10: Selects and Develops Control Activities",
    description:
      "The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels.",
    pointsOfFocus: [
      "Integrates with risk assessment — control activities are responsive to identified risks",
      "Considers entity-specific factors — complexity, nature, scope of operations",
      "Determines relevant business processes — business processes feeding risks are identified",
      "Evaluates a mix of control activity types — preventive, detective, manual, automated",
      "Considers at what level activities are applied — transaction, organizational",
      "Addresses segregation of duties — management separates incompatible functions",
    ],
  },
  {
    id: "CC5.2",
    category: "CC5",
    title: "COSO Principle 11: Selects and Develops General Controls over Technology",
    description:
      "The entity selects and develops general control activities over technology to support the achievement of objectives.",
    pointsOfFocus: [
      "Determines dependency between the use of technology and general controls",
      "Establishes relevant technology infrastructure control activities",
      "Establishes relevant security management process control activities",
      "Establishes relevant technology acquisition, development, and maintenance activities",
    ],
  },
  {
    id: "CC5.3",
    category: "CC5",
    title: "COSO Principle 12: Deploys Through Policies and Procedures",
    description:
      "The entity deploys control activities through policies that establish what is expected and procedures that put policies into action.",
    pointsOfFocus: [
      "Establishes policies and procedures to support deployment of management directives",
      "Establishes responsibility and accountability for executing policies and procedures",
      "Performs in a timely manner — control activities occur as required",
      "Takes corrective action — responsible personnel investigate and act",
      "Performs using competent personnel — qualified individuals execute controls",
      "Reassesses policies and procedures — management periodically reviews",
    ],
  },
  // CC6 — Logical and Physical Access Controls
  {
    id: "CC6.1",
    category: "CC6",
    title: "Logical and Physical Access — Security Software, Infrastructure, and Architectures",
    description:
      "The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entity's objectives.",
    pointsOfFocus: [
      "Identifies and manages the inventory of information assets",
      "Restricts logical access — authentication and authorization mechanisms",
      "Identifies and authenticates users — unique IDs and credentials",
      "Considers network segmentation — networks are segmented to prevent unauthorized access",
      "Manages points of access — entry points are inventoried and controlled",
      "Restricts access of information assets — physical and logical protections",
      "Manages identification and authentication credentials — lifecycle management",
      "Encryption of data — in-transit and at-rest encryption is deployed",
    ],
  },
  {
    id: "CC6.2",
    category: "CC6",
    title: "Logical and Physical Access — Registration and Authorization",
    description:
      "Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users whose access is administered by the entity.",
    pointsOfFocus: [
      "Controls access credentials based on authorization — only authorized users receive access",
      "Removes access that is no longer appropriate — terminations and transfers trigger removal",
      "Reviews appropriateness of access credentials — periodic access reviews",
    ],
  },
  {
    id: "CC6.3",
    category: "CC6",
    title: "Logical and Physical Access — Role-Based Access and Least Privilege",
    description:
      "The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets based on roles, responsibilities, or the system design and changes, giving consideration to the concepts of least privilege and segregation of duties.",
    pointsOfFocus: [
      "Creates or modifies access based on authorization — documented approval required",
      "Removes access when no longer needed — offboarding and role-change processes",
      "Uses role-based access controls — access is defined by role, not individual",
      "Reviews access periodically — access reviews conducted at defined intervals",
    ],
  },
  {
    id: "CC6.4",
    category: "CC6",
    title: "Physical Access — Restricts Physical Access",
    description:
      "The entity restricts physical access to facilities and protected information assets (e.g., data center, backup media storage, other sensitive locations) to authorized personnel.",
    pointsOfFocus: [
      "Creates or modifies physical access — based on authorization",
      "Removes physical access when no longer needed",
      "Reviews physical access periodically",
    ],
  },
  {
    id: "CC6.5",
    category: "CC6",
    title: "Logical and Physical Access — Disposal of Assets",
    description:
      "The entity discontinues logical and physical protections over physical assets only after the ability to read or recover data and software from those assets has been diminished and is no longer required to meet the entity's objectives.",
    pointsOfFocus: [
      "Identifies data and software on assets to be disposed — data is identified before disposal",
      "Removes data and software from entity assets — sanitization or destruction per NIST 800-88",
      "Retains data and software as required — legal/regulatory retention met before disposal",
    ],
  },
  {
    id: "CC6.6",
    category: "CC6",
    title: "Logical Access — Security Measures Against Threats Outside System Boundaries",
    description:
      "The entity implements logical access security measures to protect against threats from sources outside its system boundaries.",
    pointsOfFocus: [
      "Restricts access — boundary protection devices (firewalls, IPS, WAF)",
      "Protects identification and authentication credentials — MFA, password policies",
      "Requires additional authentication for remote access — VPN, MFA",
      "Implements boundary protection systems — network monitoring at boundaries",
    ],
  },
  {
    id: "CC6.7",
    category: "CC6",
    title: "Logical Access — Restricts Transmission of Data to Authorized Users",
    description:
      "The entity restricts the transmission, movement, and removal of information to authorized internal and external users and processes, and protects it during transmission, movement, or removal to meet the entity's objectives.",
    pointsOfFocus: [
      "Restricts the ability to perform transmission — DLP controls",
      "Uses encryption technologies — TLS, VPN, disk encryption",
      "Protects removal media — encrypted removable media, USB controls",
      "Protects mobile devices — MDM, encryption, remote wipe",
    ],
  },
  {
    id: "CC6.8",
    category: "CC6",
    title: "Logical Access — Controls Against Malicious Software",
    description:
      "The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software to meet the entity's objectives.",
    pointsOfFocus: [
      "Restricts installation of software — administrative control over installations",
      "Detects unauthorized/malicious software — endpoint protection, anti-malware",
      "Implements detective and corrective controls — monitoring, quarantine, remediation",
    ],
  },
  // CC7 — System Operations
  {
    id: "CC7.1",
    category: "CC7",
    title: "System Operations — Detects and Monitors Security Events",
    description:
      "To meet its objectives, the entity uses detection and monitoring procedures to identify (1) changes to configurations that result in the introduction of new vulnerabilities, and (2) susceptibilities to newly discovered vulnerabilities.",
    pointsOfFocus: [
      "Uses defined configuration standards — baselines are established and deviations detected",
      "Monitors infrastructure and software — SIEM, log aggregation, alerting",
      "Implements change-detection mechanisms — FIM, configuration monitoring",
      "Detects unknown or unauthorized components — asset discovery, network scanning",
      "Conducts vulnerability scans — regular scanning per defined frequency",
    ],
  },
  {
    id: "CC7.2",
    category: "CC7",
    title: "System Operations — Monitors System Components for Anomalies",
    description:
      "The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors affecting the entity's ability to meet its objectives; anomalies are analyzed to determine whether they represent security events.",
    pointsOfFocus: [
      "Implements detection policies, procedures, and tools — IDS/IPS, SIEM correlation rules",
      "Designs detection measures — measures are designed to identify anomalies",
      "Implements filters to analyze anomalies — false positive reduction, prioritization",
      "Monitors detection tools for effective operation — tool health monitoring",
    ],
  },
  {
    id: "CC7.3",
    category: "CC7",
    title: "System Operations — Evaluates Security Events",
    description:
      "The entity evaluates detected security events and determines whether they could or have resulted in a failure of the entity to meet its objectives (security incidents) and, if so, takes actions to prevent or address such failures.",
    pointsOfFocus: [
      "Responds to security incidents — incident response procedures are followed",
      "Communicates and reviews detected security events — SOC/security team triage",
      "Develops and implements procedures to analyze security incidents — root cause analysis",
      "Assesses the impact on personal information — privacy impact assessment for incidents",
      "Determines personal information used or disclosed — data breach analysis",
    ],
  },
  {
    id: "CC7.4",
    category: "CC7",
    title: "System Operations — Responds to Security Incidents",
    description:
      "The entity responds to identified security incidents by executing a defined incident response program to understand, contain, remediate, and communicate security incidents, as appropriate.",
    pointsOfFocus: [
      "Assigns roles and responsibilities — incident response team defined",
      "Contains security incidents — isolation and containment procedures",
      "Mitigates ongoing security incidents — remediation activities",
      "Restores operations — recovery to normal operations",
      "Develops and implements communication protocols — internal and external notifications",
      "Obtains understanding of nature of incident and determines response strategy",
      "Remediates identified vulnerabilities — post-incident remediation",
      "Communicates remediation activities — stakeholder notification",
    ],
  },
  {
    id: "CC7.5",
    category: "CC7",
    title: "System Operations — Identifies and Develops Recovery Activities",
    description:
      "The entity identifies, develops, and implements activities to recover from identified security incidents.",
    pointsOfFocus: [
      "Restores the affected environment — brings systems back to a known-good state",
      "Communicates information about the event — post-incident communication",
      "Determines root cause of the event — root cause analysis conducted",
      "Implements changes to prevent and detect recurrences — lessons learned applied",
    ],
  },
  // CC8 — Change Management
  {
    id: "CC8.1",
    category: "CC8",
    title: "Change Management — Manages Changes to Infrastructure and Software",
    description:
      "The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure and software.",
    pointsOfFocus: [
      "Manages changes throughout the system lifecycle — development, testing, approval, implementation",
      "Authorizes changes — documented approval for changes",
      "Designs and develops changes — architecture and design reviews",
      "Documents changes — change records maintained",
      "Tracks system changes — configuration management",
      "Configures software — secure configuration standards",
      "Tests system changes — testing before production deployment",
      "Approves system changes — sign-off by appropriate parties",
      "Deploys system changes — controlled deployment processes",
      "Identifies and evaluates system changes — impact assessment",
      "Identifies changes in infrastructure and software — automated change detection",
    ],
  },
  // CC9 — Risk Mitigation
  {
    id: "CC9.1",
    category: "CC9",
    title: "Risk Mitigation — Identifies and Assesses Risks from Business Partners",
    description:
      "The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.",
    pointsOfFocus: [
      "Considers the use of insurance to mitigate financial risks",
      "Considers use of additional resources — staffing, outsourcing decisions",
      "Identifies risk mitigation activities — specific actions to reduce identified risks",
    ],
  },
  {
    id: "CC9.2",
    category: "CC9",
    title: "Risk Mitigation — Assesses and Manages Risks from Vendors and Business Partners",
    description:
      "The entity assesses and manages risks associated with vendors and business partners.",
    pointsOfFocus: [
      "Establishes requirements for vendor/business partner engagements",
      "Assesses vendor/business partner risks — due diligence and ongoing monitoring",
      "Implements activities to address vendor/partner risks — contracts, SLAs, audits",
      "Assesses changes in vendor/partner environment — ongoing risk re-assessment",
    ],
  },
  // A1 — Availability
  {
    id: "A1.1",
    category: "A1",
    title: "Availability — Maintains, Monitors, and Evaluates Current Processing Capacity",
    description:
      "The entity maintains, monitors, and evaluates current processing capacity and use of system components (infrastructure, data, and software) to manage capacity demand and to enable the implementation of additional capacity to help meet its objectives.",
    pointsOfFocus: [
      "Manages capacity demand and use — capacity planning and trending",
      "Monitors and evaluates capacity — dashboards, alerts, forecasting",
      "Enables additional capacity — scalability mechanisms",
    ],
  },
  {
    id: "A1.2",
    category: "A1",
    title: "Availability — Provides for Recovery of Data and Infrastructure",
    description:
      "The entity authorizes, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections, software, data backup, and recovery infrastructure and processes to meet its objectives.",
    pointsOfFocus: [
      "Implements recovery infrastructure — backup systems, redundancy, replication",
      "Tests recovery procedures — DR testing, backup restoration testing",
      "Maintains and monitors recovery infrastructure — backup health monitoring",
    ],
  },
  {
    id: "A1.3",
    category: "A1",
    title: "Availability — Tests Recovery Plan Procedures",
    description:
      "The entity tests recovery plan procedures supporting system recovery to meet its objectives.",
    pointsOfFocus: [
      "Develops recovery plan testing procedures — defines scope, scenarios, and success criteria",
      "Tests the recovery plan — tabletop exercises, partial failovers, full DR tests",
      "Tests integrity and completeness of backup data — validates recoverability",
    ],
  },
  // C1 — Confidentiality
  {
    id: "C1.1",
    category: "C1",
    title: "Confidentiality — Identifies and Maintains Confidential Information",
    description:
      "The entity identifies and maintains confidential information to meet the entity's objectives related to confidentiality.",
    pointsOfFocus: [
      "Identifies confidential information — data classification procedures",
      "Determines scope of confidentiality protections — what data requires protection",
      "Identifies data on information assets — maps confidential data to systems and assets",
    ],
  },
  {
    id: "C1.2",
    category: "C1",
    title: "Confidentiality — Disposes of Confidential Information",
    description:
      "The entity disposes of confidential information to meet the entity's objectives related to confidentiality.",
    pointsOfFocus: [
      "Identifies information for disposal — retention schedules are followed",
      "Disposes of identified information — secure destruction per NIST 800-88",
    ],
  },
  // PI1 — Processing Integrity
  {
    id: "PI1.1",
    category: "PI1",
    title: "Processing Integrity — Obtains or Generates, Uses, and Communicates Relevant Quality Information",
    description:
      "The entity obtains or generates, uses, and communicates relevant, quality information regarding the objectives related to processing, including definitions of data processed and product and service specifications, to support the use of products and services.",
    pointsOfFocus: [
      "Defines processing specifications — inputs, outputs, and processing steps documented",
      "Defines meaningful outputs — product/service specifications tied to processing requirements",
      "Uses relevant data — only relevant, quality data used in processing",
    ],
  },
  {
    id: "PI1.2",
    category: "PI1",
    title: "Processing Integrity — Implements Policies and Procedures over System Inputs",
    description:
      "The entity implements policies and procedures over system inputs, including controls over completeness and accuracy, to result in products, services, and reporting to meet the entity's objectives.",
    pointsOfFocus: [
      "Defines characteristics of processing inputs — quality and validation criteria",
      "Evaluates processing inputs — validation checks and error handling",
      "Creates and maintains records of system inputs — audit trails",
    ],
  },
  {
    id: "PI1.3",
    category: "PI1",
    title: "Processing Integrity — Implements Policies and Procedures over System Processing",
    description:
      "The entity implements policies and procedures over system processing to result in products, services, and reporting to meet the entity's objectives.",
    pointsOfFocus: [
      "Addresses processing integrity — data is processed accurately and completely",
      "Defines processing and acceptable variances — normal and exceptional processing",
      "Implements processing error correction — errors are identified and corrected",
    ],
  },
  {
    id: "PI1.4",
    category: "PI1",
    title: "Processing Integrity — Implements Policies over System Outputs",
    description:
      "The entity implements policies and procedures to make available or deliver output completely, accurately, and timely in accordance with specifications to meet the entity's objectives.",
    pointsOfFocus: [
      "Protects output — system output is protected against unauthorized modification",
      "Distributes output only to intended parties — access controls on outputs",
      "Distributes output completely and accurately — validation of output delivery",
    ],
  },
  {
    id: "PI1.5",
    category: "PI1",
    title: "Processing Integrity — Stores Inputs and Outputs Completely and Accurately",
    description:
      "The entity implements policies and procedures to store inputs, items in processing, and outputs completely, accurately, and timely in accordance with system specifications to meet the entity's objectives.",
    pointsOfFocus: [
      "Protects stored items — data integrity maintained in storage",
      "Archives and protects system records — audit trail preserved",
    ],
  },
  // Privacy Criteria
  {
    id: "P1.1",
    category: "P1",
    title: "Privacy Notice — Provides Notice to Data Subjects",
    description:
      "The entity provides notice to data subjects about its privacy practices to meet the entity's objectives related to privacy.",
    pointsOfFocus: [
      "Communicates to data subjects — purpose, types of data, sharing, retention, rights",
      "Provides notice at or before collection",
      "Covers entities and activities — scope of notice is comprehensive",
      "Uses clear and conspicuous language",
    ],
  },
  {
    id: "P2.1",
    category: "P2",
    title: "Privacy Choice and Consent — Communicates Choices",
    description:
      "The entity communicates choices available regarding the collection, use, retention, disclosure, and disposal of personal information to data subjects.",
    pointsOfFocus: [
      "Communicates to data subjects — opt-in/opt-out mechanisms explained",
      "Communicates consequences of denying or withdrawing consent",
      "Obtains implicit or explicit consent — appropriate basis for processing",
    ],
  },
  {
    id: "P3.1",
    category: "P3",
    title: "Privacy Collection — Collects Personal Information for Identified Purposes",
    description:
      "Personal information is collected consistent with the entity's objectives related to privacy.",
    pointsOfFocus: [
      "Limits the collection of personal information — data minimization",
      "Collects information by fair and lawful means",
      "Collects information from reliable sources",
      "Informs data subjects when additional data will be collected",
    ],
  },
  {
    id: "P3.2",
    category: "P3",
    title: "Privacy Collection — Collects Personal Information with Consent",
    description:
      "For information requiring explicit consent, the entity communicates the need for such consent, as well as the consequences of a failure to provide consent to the data subject, and obtains the consent prior to the collection of the information.",
    pointsOfFocus: [
      "Documents and obtains consent — consent is recorded and auditable",
      "Obtains explicit consent for sensitive information — special category data",
      "Treats collected information consistently — processing aligns with consent",
    ],
  },
  {
    id: "P4.1",
    category: "P4",
    title: "Privacy Use, Retention, and Disposal — Limits Use and Retention",
    description:
      "The entity limits the use of personal information to the purposes identified in the entity's objectives related to privacy.",
    pointsOfFocus: [
      "Uses personal information for identified purposes only — purpose limitation",
      "Retains personal information — for no longer than necessary",
      "Defines retention periods — documented retention schedule",
    ],
  },
  {
    id: "P4.2",
    category: "P4",
    title: "Privacy Use, Retention, and Disposal — Disposes of Personal Information",
    description:
      "The entity securely disposes of personal information to meet the entity's objectives related to privacy.",
    pointsOfFocus: [
      "Captures, identifies, and flags personal information for disposal",
      "Disposes of, destroys, and redacts personal information — secure destruction methods",
      "Tracks the disposal of personal information — records of deletion/destruction",
    ],
  },
  {
    id: "P5.1",
    category: "P5",
    title: "Privacy Access — Grants Data Subjects Access",
    description:
      "The entity grants identified and authenticated data subjects the ability to access their stored personal information for review and, upon request, provides physical or electronic copies of that information to data subjects.",
    pointsOfFocus: [
      "Authenticates identity of data subjects — before providing access",
      "Permits data subjects to access their personal information — self-service or request",
      "Provides data in an understandable format — structured, commonly used format",
      "Informs data subjects if access is denied — and the basis for denial",
    ],
  },
  {
    id: "P5.2",
    category: "P5",
    title: "Privacy Access — Corrects, Amends, or Appends Personal Information",
    description:
      "The entity corrects, amends, or appends personal information based on information provided by data subjects and communicates such information to third parties, as committed or required.",
    pointsOfFocus: [
      "Communicates denial of requests — and the basis for denial",
      "Permits correction, amendment, or appending of information — when appropriate",
      "Communicates changes to third parties — when data was shared",
    ],
  },
  {
    id: "P6.1",
    category: "P6",
    title: "Privacy Disclosure — Discloses Personal Information with Consent",
    description:
      "The entity discloses personal information to third parties with the explicit consent of data subjects, and such consent is obtained prior to disclosure.",
    pointsOfFocus: [
      "Communicates privacy commitments to third parties — contractual requirements",
      "Discloses personal information — only with appropriate consent or legal basis",
      "Discloses information to third parties — per stated purposes",
    ],
  },
  {
    id: "P6.2",
    category: "P6",
    title: "Privacy Disclosure — Creates and Retains Record of Authorized Disclosure",
    description:
      "The entity creates and retains a complete, accurate, and timely record of authorized disclosures of personal information.",
    pointsOfFocus: [
      "Records of disclosures are accurate — reflects actual disclosures",
      "Records of disclosures are complete — all disclosures logged",
      "Records of disclosures are timely — logged at or near time of disclosure",
    ],
  },
  {
    id: "P7.1",
    category: "P7",
    title: "Privacy Quality — Maintains Accurate, Complete, and Relevant Personal Information",
    description:
      "The entity collects and maintains accurate, up-to-date, complete, and relevant personal information for the purposes identified in the notice.",
    pointsOfFocus: [
      "Ensures personal information is accurate — validation and verification",
      "Ensures personal information is complete — no missing required fields",
      "Ensures personal information is relevant — related to identified purpose",
      "Ensures personal information is up-to-date — refresh mechanisms",
    ],
  },
  {
    id: "P8.1",
    category: "P8",
    title: "Privacy Monitoring and Enforcement — Manages Compliance with Privacy Commitments",
    description:
      "The entity implements a process for receiving, addressing, resolving, and communicating the resolution of inquiries, complaints, and disputes from data subjects and others and periodically monitors compliance with the entity's privacy commitments.",
    pointsOfFocus: [
      "Creates a process for receiving privacy inquiries and complaints",
      "Addresses, resolves, and communicates resolution — timely responses",
      "Documents and communicates dispute resolution — to data subjects",
      "Monitors compliance — periodic assessments of privacy program effectiveness",
      "Reports compliance monitoring results — to management and board",
    ],
  },
];

export function getCriteriaByCategory(category: TscCategory): TrustServicesCriterion[] {
  return TRUST_SERVICES_CRITERIA.filter((c) => c.category === category);
}

export function getCriterionById(id: string): TrustServicesCriterion | undefined {
  return TRUST_SERVICES_CRITERIA.find((c) => c.id === id);
}

export function getAllCategories(): TscCategory[] {
  return Object.keys(TSC_CATEGORY_NAMES) as TscCategory[];
}
