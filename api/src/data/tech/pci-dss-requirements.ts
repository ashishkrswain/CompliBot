/**
 * PCI DSS v4.0 Requirements Reference Data
 * Payment Card Industry Data Security Standard — published March 2022, mandatory March 2025
 * Source: PCI Security Standards Council, PCI DSS v4.0
 */

export interface PciRequirement {
  id: string;
  title: string;
  description: string;
  subRequirements: PciSubRequirement[];
}

export interface PciSubRequirement {
  id: string;
  title: string;
  description: string;
  testingProcedures: string[];
  guidance: string;
  applicability: SaqApplicability;
}

export interface SaqApplicability {
  saqA: boolean;
  saqAEP: boolean;
  saqB: boolean;
  saqBIP: boolean;
  saqC: boolean;
  saqCVT: boolean;
  saqD: boolean;
  saqP2PE: boolean;
}

export interface SaqTypeDefinition {
  type: SaqType;
  name: string;
  description: string;
  eligibilityCriteria: string[];
  excludedActivities: string[];
  channelType: string;
}

export type SaqType = "A" | "A-EP" | "B" | "B-IP" | "C" | "C-VT" | "D" | "P2PE";

export interface MerchantLevelDefinition {
  level: MerchantLevel;
  description: string;
  transactionThreshold: string;
  validationRequirements: string[];
  reportingEntity: string;
}

export type MerchantLevel = 1 | 2 | 3 | 4;

export const MERCHANT_LEVELS: MerchantLevelDefinition[] = [
  {
    level: 1,
    description: "Any merchant processing over 6 million transactions per year across all channels",
    transactionThreshold: "> 6,000,000 transactions/year",
    validationRequirements: [
      "Annual Report on Compliance (ROC) by a Qualified Security Assessor (QSA)",
      "Quarterly network scan by Approved Scanning Vendor (ASV)",
      "Attestation of Compliance (AoC) form",
      "Annual penetration testing",
    ],
    reportingEntity: "Qualified Security Assessor (QSA)",
  },
  {
    level: 2,
    description: "Any merchant processing 1 million to 6 million transactions per year",
    transactionThreshold: "1,000,000 – 6,000,000 transactions/year",
    validationRequirements: [
      "Annual Self-Assessment Questionnaire (SAQ)",
      "Quarterly network scan by Approved Scanning Vendor (ASV)",
      "Attestation of Compliance (AoC) form",
      "Annual penetration testing (may be required by acquirer)",
    ],
    reportingEntity: "Internal Security Assessor (ISA) or QSA",
  },
  {
    level: 3,
    description: "Any merchant processing 20,000 to 1 million e-commerce transactions per year",
    transactionThreshold: "20,000 – 1,000,000 e-commerce transactions/year",
    validationRequirements: [
      "Annual Self-Assessment Questionnaire (SAQ)",
      "Quarterly network scan by Approved Scanning Vendor (ASV)",
      "Attestation of Compliance (AoC) form",
    ],
    reportingEntity: "Merchant (self-assessment)",
  },
  {
    level: 4,
    description: "Any merchant processing fewer than 20,000 e-commerce transactions and up to 1 million other transactions per year",
    transactionThreshold: "< 20,000 e-commerce and < 1,000,000 other transactions/year",
    validationRequirements: [
      "Annual Self-Assessment Questionnaire (SAQ) — recommended",
      "Quarterly network scan by ASV — if applicable",
      "Compliance validation requirements set by acquirer",
    ],
    reportingEntity: "Merchant (self-assessment per acquirer requirements)",
  },
];

export const SAQ_TYPE_DEFINITIONS: SaqTypeDefinition[] = [
  {
    type: "A",
    name: "SAQ A — Card-not-present Merchants (All Cardholder Data Functions Outsourced)",
    description:
      "For e-commerce or mail/telephone-order merchants that have fully outsourced all cardholder data functions to PCI DSS validated third-party service providers with no electronic storage, processing, or transmission of cardholder data on the merchant's systems or premises.",
    eligibilityCriteria: [
      "All processing of cardholder data is entirely outsourced to PCI DSS validated third-party service providers",
      "No electronic storage, processing, or transmission of cardholder data on merchant systems or premises",
      "Merchant retains only paper reports or receipts with cardholder data (not received electronically)",
      "Merchant does not store cardholder data in electronic format",
      "Merchant has confirmed that all third-party handlers are PCI DSS compliant",
      "Applicable only to card-not-present (e-commerce, MOTO) channels",
    ],
    excludedActivities: [
      "Face-to-face payment channels",
      "Any electronic storage of cardholder data",
      "Processing or transmitting cardholder data through merchant systems",
    ],
    channelType: "E-commerce / Mail-Order / Telephone-Order (fully outsourced)",
  },
  {
    type: "A-EP",
    name: "SAQ A-EP — E-commerce Merchants with Partial Outsourcing",
    description:
      "For e-commerce merchants that partially outsource payment processing. The merchant website does not directly receive cardholder data but controls how consumers are redirected to/from a third-party payment processor.",
    eligibilityCriteria: [
      "E-commerce channel only — no face-to-face transactions",
      "All payment processing is outsourced to a PCI DSS validated third party",
      "Merchant website does not directly receive cardholder data",
      "Merchant website may control how consumers are redirected (e.g., iFrame, URL redirect, JavaScript from payment processor)",
      "Merchant systems do not store, process, or transmit cardholder data",
      "All elements of payment pages delivered to consumer browser originate from PCI DSS compliant service provider(s)",
      "Merchant has confirmed third-party service providers are PCI DSS compliant",
    ],
    excludedActivities: [
      "Face-to-face transactions",
      "Direct handling of cardholder data",
      "Payment page elements served from merchant infrastructure",
    ],
    channelType: "E-commerce (partial outsource with redirect/iFrame)",
  },
  {
    type: "B",
    name: "SAQ B — Imprint Machines or Standalone Dial-Out Terminals",
    description:
      "For merchants using only imprint machines and/or standalone dial-out terminals (connected via phone line to the processor) with no electronic cardholder data storage.",
    eligibilityCriteria: [
      "Uses only imprint machines and/or standalone dial-out terminals",
      "Standalone dial-out terminals are not connected to the internet",
      "Standalone dial-out terminals are not connected to any other systems within the merchant environment",
      "Standalone dial-out terminals connect via analog phone line only",
      "No electronic cardholder data storage",
      "Retains only paper copies of receipts",
    ],
    excludedActivities: [
      "E-commerce channels",
      "Any IP-connected payment terminals",
      "Electronic storage of cardholder data",
      "Any internet connectivity on payment devices",
    ],
    channelType: "Face-to-face (imprint/dial-out only)",
  },
  {
    type: "B-IP",
    name: "SAQ B-IP — Standalone IP-Connected PTS POI Terminals",
    description:
      "For merchants using only standalone PTS-approved point-of-interaction (POI) devices connected via IP to the payment processor, with no electronic cardholder data storage.",
    eligibilityCriteria: [
      "Uses only standalone PTS-approved POI devices (i.e., the device is listed on PCI SSC's list of validated PTS devices)",
      "POI devices are connected via IP to the payment processor",
      "POI devices are not connected to any other systems in the merchant environment",
      "POI device is the only device that stores, processes, or transmits cardholder data",
      "No electronic cardholder data storage beyond what is on the POI device",
      "POI device does not rely on any other device for payment processing",
      "Merchant confirms service provider is PCI DSS compliant",
    ],
    excludedActivities: [
      "E-commerce channels",
      "Terminals connected to other merchant systems",
      "Electronic cardholder data storage on merchant systems",
      "Non-PTS-approved devices",
    ],
    channelType: "Face-to-face (standalone IP PTS POI terminals)",
  },
  {
    type: "C",
    name: "SAQ C — Payment Application Systems Connected to the Internet",
    description:
      "For merchants with payment application systems connected to the internet, but no electronic cardholder data storage. The payment application system is on a segmented network — not connected to other merchant systems.",
    eligibilityCriteria: [
      "Payment application system is connected to the internet for payment processing",
      "Payment application system is not connected to any other systems within the merchant environment (segmented)",
      "Physical POS terminal is connected to payment application (if applicable)",
      "Payment application system is the only system in the merchant environment that stores, processes, or transmits cardholder data",
      "No electronic cardholder data storage outside the payment application system",
      "All software on payment application system is from validated payment applications",
      "Merchant retains only paper reports/receipts",
    ],
    excludedActivities: [
      "E-commerce channels",
      "Interconnected payment systems with other merchant environments",
      "Electronic cardholder data storage beyond the PA system",
    ],
    channelType: "Face-to-face / Mail / Telephone (internet-connected PA, segmented)",
  },
  {
    type: "C-VT",
    name: "SAQ C-VT — Web-Based Virtual Terminals",
    description:
      "For merchants that manually enter a single transaction at a time via a keyboard into an internet-based virtual terminal solution provided by a PCI DSS validated third-party service provider.",
    eligibilityCriteria: [
      "Payment processing is via a web-based virtual terminal accessed through a web browser",
      "Virtual terminal solution is provided and hosted by a PCI DSS validated third-party service provider",
      "Virtual terminal is accessed on a dedicated computing device isolated from other functions",
      "The dedicated computing device is not connected to other systems within the merchant environment",
      "No electronic cardholder data storage",
      "No payment application software installed on merchant systems",
      "Merchant manually enters one transaction at a time via keyboard",
    ],
    excludedActivities: [
      "Batch processing of transactions",
      "E-commerce channels accepting customer-entered data",
      "Virtual terminals on shared/multi-purpose computers",
      "Electronic cardholder data storage",
    ],
    channelType: "Mail-Order / Telephone-Order (web-based virtual terminal)",
  },
  {
    type: "D",
    name: "SAQ D — All Other Merchants and Service Providers",
    description:
      "For all merchants that do not fit into any other SAQ type, and for all service providers defined by a payment brand as eligible to complete an SAQ. SAQ D covers all PCI DSS requirements.",
    eligibilityCriteria: [
      "Merchant does not qualify for any other SAQ type",
      "Merchant stores cardholder data electronically",
      "Merchant has complex cardholder data environments",
      "Service providers eligible for SAQ (as defined by payment brands)",
      "Merchant processes cardholder data on their own systems",
    ],
    excludedActivities: [],
    channelType: "All channels / Complex environments",
  },
  {
    type: "P2PE",
    name: "SAQ P2PE — Hardware Payment Terminals in a PCI-Listed P2PE Solution",
    description:
      "For merchants using only hardware payment terminals included in and managed via a validated PCI-listed Point-to-Point Encryption (P2PE) solution, with no electronic cardholder data storage.",
    eligibilityCriteria: [
      "All payment processing is through hardware payment terminals managed via a validated and PCI-listed P2PE solution",
      "Only payment terminals in the P2PE solution's approved terminal list are used",
      "P2PE solution is listed on PCI SSC's list of Validated P2PE Solutions",
      "No electronic cardholder data storage",
      "Merchant does not otherwise store, process, or transmit cardholder data outside the P2PE hardware terminals",
      "Merchant has verified that the P2PE solution provider's P2PE Instruction Manual (PIM) is followed",
    ],
    excludedActivities: [
      "E-commerce channels",
      "Non-P2PE validated terminals",
      "Electronic cardholder data storage",
      "Cardholder data processing outside P2PE hardware",
    ],
    channelType: "Face-to-face (validated P2PE solution only)",
  },
];

export const PCI_DSS_REQUIREMENTS: PciRequirement[] = [
  // Requirement 1: Install and Maintain Network Security Controls
  {
    id: "1",
    title: "Install and Maintain Network Security Controls",
    description:
      "Network security controls (NSCs), such as firewalls and other network security technologies, are network policy enforcement points that typically control network traffic between two or more logical or physical network segments based on pre-defined policies or rules.",
    subRequirements: [
      {
        id: "1.1",
        title: "Processes and mechanisms for installing and maintaining network security controls are defined and understood",
        description: "All security policies and operational procedures identified in Requirement 1 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "1.1.1 Examine documentation to verify policies and procedures are defined per requirement elements",
          "1.1.2 Interview personnel to verify processes are documented, assigned, and understood",
        ],
        guidance: "Requirement 1.1 establishes the overall governance for network security controls, including documentation of policies, assignment of responsibilities, and management of NSC configurations.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "1.2",
        title: "Network security controls (NSCs) are configured and maintained",
        description: "NSC rulesets are configured to restrict traffic to and from the cardholder data environment (CDE), and connections to untrusted networks are specifically managed.",
        testingProcedures: [
          "1.2.1 Examine NSC configuration standards and verify all rule sets restrict inbound and outbound traffic to that which is necessary",
          "1.2.2 Examine network diagrams and NSC configurations to verify connections between trusted and untrusted networks are controlled",
          "1.2.3 Examine NSC configurations to verify that NSCs are installed between all wireless networks and the CDE",
          "1.2.4 Examine documentation and interview personnel to verify accurate network diagrams are maintained",
          "1.2.5 Examine NSC configurations to verify that services, protocols, and ports allowed are documented with business justification",
          "1.2.6 Examine NSC configurations to verify security features are defined for insecure services, protocols, and ports",
          "1.2.7 Examine NSC configurations to verify rulesets are reviewed at least every six months",
          "1.2.8 Examine NSC configuration files to verify they are secured from unauthorized access and synchronized",
        ],
        guidance: "NSCs must be properly configured with restrictive rules, documented justifications, and regular review cycles to maintain effective segmentation.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "1.3",
        title: "Network access to and from the cardholder data environment is restricted",
        description: "Network access to and from the CDE is limited to only necessary and authorized traffic as defined in the NSC ruleset.",
        testingProcedures: [
          "1.3.1 Examine NSC configurations to verify inbound traffic to the CDE is restricted to only necessary traffic",
          "1.3.2 Examine NSC configurations to verify outbound traffic from the CDE is restricted to only necessary traffic",
          "1.3.3 Examine NSC configurations to verify NSCs are implemented between all wireless networks and the CDE",
        ],
        guidance: "Access restrictions between the CDE and other networks limit the potential for unauthorized access to cardholder data.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "1.4",
        title: "Network connections between trusted and untrusted networks are controlled",
        description: "NSCs are implemented to control connections between trusted and untrusted networks.",
        testingProcedures: [
          "1.4.1 Examine NSC configurations to verify that NSCs are implemented between trusted and untrusted networks",
          "1.4.2 Examine NSC configurations to verify inbound traffic from untrusted networks to trusted networks is restricted to authorized communications",
          "1.4.3 Examine NSC configurations to verify anti-spoofing measures are implemented to detect and block forged source IP addresses",
          "1.4.4 Examine NSC configurations to verify cardholder data is not accessible from untrusted networks",
          "1.4.5 Examine configurations to verify the disclosure of internal IP addresses and routing information is limited to authorized parties",
        ],
        guidance: "Controlling connections between trusted and untrusted networks prevents unauthorized entities from accessing the CDE from external networks.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "1.5",
        title: "Risks to the CDE from computing devices that connect to both untrusted networks and the CDE are mitigated",
        description: "Computing devices (including company and employee-owned) that connect to both untrusted networks and the CDE have controls that prevent threats introduced via the untrusted network from impacting the CDE.",
        testingProcedures: [
          "1.5.1 Examine policies and configurations to verify security controls are implemented on any computing device connecting to both untrusted networks and the CDE",
        ],
        guidance: "Devices connecting to both the internet and the CDE introduce a path for external threats. Personal firewalls or equivalent controls mitigate this risk.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: false, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
    ],
  },
  // Requirement 2: Apply Secure Configurations to All System Components
  {
    id: "2",
    title: "Apply Secure Configurations to All System Components",
    description:
      "Malicious individuals often use vendor default passwords and other vendor default settings to compromise systems. These passwords and settings are well known and easily determined.",
    subRequirements: [
      {
        id: "2.1",
        title: "Processes and mechanisms for applying secure configurations are defined and understood",
        description: "All security policies and operational procedures for Requirement 2 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "2.1.1 Examine documentation to verify security policies and operational procedures are documented and assigned",
          "2.1.2 Interview personnel to verify processes for secure configurations are understood and followed",
        ],
        guidance: "Documentation and ownership of secure configuration processes ensures consistent application across the environment.",
        applicability: { saqA: true, saqAEP: true, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "2.2",
        title: "System components are configured and managed securely",
        description: "Vendor defaults are changed and unnecessary functionality is removed or disabled before installing a system on the network.",
        testingProcedures: [
          "2.2.1 Examine system configuration standards to verify they address changing all vendor-supplied defaults",
          "2.2.2 Examine system configurations to verify vendor default accounts are managed (removed or disabled or passwords changed)",
          "2.2.3 Examine system configurations to verify primary functions requiring different security levels are managed on separate systems or virtual instances",
          "2.2.4 Examine system configurations to verify only necessary services, protocols, daemons, and functions are enabled",
          "2.2.5 Examine system configurations to verify insecure services, protocols, and daemons are secured with appropriate security features",
          "2.2.6 Examine system configurations to verify system security parameters are set to prevent misuse",
          "2.2.7 Examine system configurations to verify all non-console administrative access is encrypted using strong cryptography",
        ],
        guidance: "Default settings are often published and known to attackers. Secure configuration eliminates these known vulnerabilities before deployment.",
        applicability: { saqA: true, saqAEP: true, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "2.3",
        title: "Wireless environments are configured and managed securely",
        description: "Where wireless technology is used, all wireless vendor defaults are changed at installation and wireless environments are configured securely.",
        testingProcedures: [
          "2.3.1 Examine configurations to verify Wi-Fi vendor defaults are changed (passwords, SSID, encryption keys, SNMP strings)",
          "2.3.2 Examine wireless configurations to verify encryption is strong cryptography for authentication and transmission",
        ],
        guidance: "Wireless networks introduce additional attack vectors. Default wireless settings must be secured to prevent unauthorized access.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: false, saqD: true, saqP2PE: false },
      },
    ],
  },
  // Requirement 3: Protect Stored Account Data
  {
    id: "3",
    title: "Protect Stored Account Data",
    description:
      "Protection methods such as encryption, truncation, masking, and hashing are critical components of cardholder data protection. If an intruder circumvents other security controls, the data is rendered unreadable and unusable without proper cryptographic keys.",
    subRequirements: [
      {
        id: "3.1",
        title: "Processes and mechanisms for protecting stored account data are defined and understood",
        description: "All security policies and operational procedures for Requirement 3 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "3.1.1 Examine documentation to verify policies and procedures are defined and assigned for protecting stored account data",
          "3.1.2 Interview personnel to verify procedures for protecting stored account data are understood",
        ],
        guidance: "Governance over stored data protection ensures all personnel understand their responsibilities regarding sensitive authentication data and cardholder data.",
        applicability: { saqA: false, saqAEP: false, saqB: false, saqBIP: false, saqC: true, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "3.2",
        title: "Storage of account data is kept to a minimum",
        description: "Data storage amount and retention time is limited to that which is required for legal, regulatory, and/or business requirements.",
        testingProcedures: [
          "3.2.1 Examine data retention and disposal policies to verify they define retention requirements and secure disposal for all stored account data",
          "3.2.2 Examine storage locations and interview personnel to verify stored account data does not exceed defined retention requirements",
        ],
        guidance: "Minimizing stored cardholder data reduces risk exposure. Only data needed for business, legal, or regulatory purposes should be retained.",
        applicability: { saqA: false, saqAEP: false, saqB: false, saqBIP: false, saqC: true, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "3.3",
        title: "Sensitive authentication data (SAD) is not stored after authorization",
        description: "SAD is not retained after authorization, even if encrypted. SAD includes full track data, CAV2/CVC2/CVV2/CID, and PINs/PIN blocks.",
        testingProcedures: [
          "3.3.1 Examine data stores and system configurations to verify full track data from the magnetic stripe is not stored after authorization",
          "3.3.2 Examine data stores and system configurations to verify card verification codes/values are not stored after authorization",
          "3.3.3 Examine data stores and system configurations to verify PINs and encrypted PIN blocks are not stored after authorization",
        ],
        guidance: "Storage of SAD post-authorization is explicitly prohibited. SAD is used only during the authorization process and must be securely deleted immediately after.",
        applicability: { saqA: false, saqAEP: false, saqB: true, saqBIP: true, saqC: true, saqCVT: false, saqD: true, saqP2PE: true },
      },
      {
        id: "3.4",
        title: "Access to displays of full PAN and ability to copy cardholder data are restricted",
        description: "PAN is masked when displayed (the first six and last four digits are the maximum number of digits to be displayed). Full PAN can only be viewed by those with a legitimate business need.",
        testingProcedures: [
          "3.4.1 Examine policies and system configurations to verify PAN is masked when displayed, showing at most first six and last four digits",
          "3.4.2 Examine system configurations to verify full PAN is viewable only by personnel with documented business need",
        ],
        guidance: "Masking PAN reduces exposure from visual interception while still allowing identification for legitimate business purposes.",
        applicability: { saqA: false, saqAEP: false, saqB: false, saqBIP: false, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "3.5",
        title: "Primary account number (PAN) is secured wherever it is stored",
        description: "PAN is rendered unreadable anywhere it is stored (including on portable digital media, backup media, and in logs) using strong cryptography.",
        testingProcedures: [
          "3.5.1 Examine documentation to verify PAN is rendered unreadable using one-way hashes, truncation, index tokens, or strong cryptography with associated key-management processes",
          "3.5.2 Examine system configurations and encryption keys to verify disk-level or partition-level encryption meets additional requirements (not sole mechanism on removable media)",
          "3.5.3 Examine configurations to verify if disk-level encryption is used, it is managed independently of the native OS authentication mechanism",
        ],
        guidance: "Strong cryptographic protection of stored PAN ensures data remains protected even if physical media is compromised.",
        applicability: { saqA: false, saqAEP: false, saqB: false, saqBIP: false, saqC: true, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "3.6",
        title: "Cryptographic keys used to protect stored account data are secured",
        description: "Key-management processes and procedures are implemented for cryptographic keys used for protection of stored account data.",
        testingProcedures: [
          "3.6.1 Examine key-management policies and procedures to verify processes are defined for key generation, distribution, storage, access, retirement/replacement, and destruction",
          "3.6.2 Examine configurations to verify secret and private keys used to encrypt/decrypt stored account data are managed in one (or more) secure forms at all times",
        ],
        guidance: "Cryptographic keys are themselves sensitive data. Compromised keys render encryption ineffective. Key management must follow industry best practices.",
        applicability: { saqA: false, saqAEP: false, saqB: false, saqBIP: false, saqC: true, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "3.7",
        title: "Where cryptography is used to protect stored account data, key management processes are defined and implemented",
        description: "Key-management processes include key generation, distribution, secure storage, key changes, retirement, and destruction per industry standards.",
        testingProcedures: [
          "3.7.1 Examine key-management procedures to verify they include generation of strong cryptographic keys",
          "3.7.2 Examine key-management procedures to verify they include secure cryptographic key distribution",
          "3.7.3 Examine key-management procedures to verify they include secure cryptographic key storage",
          "3.7.4 Examine key-management procedures to verify cryptographic key changes are performed for keys at the end of their cryptoperiod",
          "3.7.5 Examine key-management procedures to verify retirement or replacement of keys when integrity has been weakened or keys are suspected of being compromised",
          "3.7.6 Examine key-management procedures to verify manual clear-text cryptographic key-management operations use split knowledge and dual control",
          "3.7.7 Examine key-management procedures to verify prevention of unauthorized substitution of cryptographic keys",
          "3.7.8 Examine key-management procedures to verify key custodians formally acknowledge their key-custodian responsibilities",
          "3.7.9 Examine documentation and interview personnel to verify service-provider cryptographic architecture documentation is maintained",
        ],
        guidance: "Complete key lifecycle management ensures encryption remains effective throughout the life of the protected data.",
        applicability: { saqA: false, saqAEP: false, saqB: false, saqBIP: false, saqC: true, saqCVT: false, saqD: true, saqP2PE: false },
      },
    ],
  },
  // Requirement 4: Protect Cardholder Data with Strong Cryptography During Transmission
  {
    id: "4",
    title: "Protect Cardholder Data with Strong Cryptography During Transmission Over Open, Public Networks",
    description:
      "Use of strong cryptography provides assurance that data transmitted over open, public networks (e.g., the internet, wireless technologies, cellular technologies, satellite communications) cannot be easily intercepted and read by unauthorized individuals.",
    subRequirements: [
      {
        id: "4.1",
        title: "Processes and mechanisms for protecting cardholder data with strong cryptography during transmission are defined",
        description: "All security policies and operational procedures for Requirement 4 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "4.1.1 Examine documentation to verify policies and procedures are defined and assigned for encrypting cardholder data during transmission",
          "4.1.2 Interview personnel to verify encryption procedures during data transmission are understood",
        ],
        guidance: "Documented processes ensure consistent application of encryption controls for data in transit.",
        applicability: { saqA: true, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "4.2",
        title: "PAN is protected with strong cryptography during transmission",
        description: "PAN is protected with strong cryptography whenever it is sent via open, public networks or end-user messaging technologies.",
        testingProcedures: [
          "4.2.1 Examine system configurations and network diagrams to verify PAN is encrypted with strong cryptography when transmitted over open, public networks",
          "4.2.2 Examine system configurations to verify PAN is secured with strong cryptography when sent via end-user messaging technologies (e.g., email, IM, SMS, chat)",
          "4.2.3 Examine documented policies to verify certificates used for PAN transmission over open, public networks are confirmed as valid and not expired or revoked",
          "4.2.4 Examine system configurations to verify only trusted keys and/or certificates are accepted",
          "4.2.5 Examine system configurations to verify the protocol in use supports only secure versions or configurations and does not fall back to insecure versions",
        ],
        guidance: "Strong cryptography (TLS 1.2+, IPSec, etc.) prevents interception of PAN during transmission over untrusted networks.",
        applicability: { saqA: true, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
    ],
  },
  // Requirement 5: Protect All Systems and Networks from Malicious Software
  {
    id: "5",
    title: "Protect All Systems and Networks from Malicious Software",
    description:
      "Malicious software (malware) is software or firmware intentionally designed to cause damage to computer systems and data. Requirement 5 focuses on protecting all systems from malware through anti-malware mechanisms maintained on all systems commonly affected by malware.",
    subRequirements: [
      {
        id: "5.1",
        title: "Processes and mechanisms for protecting all systems from malware are defined and understood",
        description: "All security policies and operational procedures for Requirement 5 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "5.1.1 Examine documentation to verify policies and procedures for malware protection are defined and assigned",
          "5.1.2 Interview personnel to verify malware protection processes are understood",
        ],
        guidance: "Governance over anti-malware ensures consistent deployment and maintenance of protective mechanisms.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "5.2",
        title: "Malware is prevented or detected and addressed",
        description: "Anti-malware solution(s) are deployed on all system components except those identified as not commonly affected by malware, with periodic evaluations.",
        testingProcedures: [
          "5.2.1 Examine system components to verify an anti-malware solution is deployed on all system components, except for those identified as not at risk from malware",
          "5.2.2 Examine anti-malware configurations to verify the solution performs periodic scans and active or real-time scans, OR performs continuous behavioral analysis",
          "5.2.3 Examine anti-malware configurations and examine the list of system components not protected by anti-malware to verify periodic evaluations are performed to confirm components remain not at risk from malware",
        ],
        guidance: "Anti-malware must be deployed comprehensively with both scheduled and real-time scanning capabilities.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "5.3",
        title: "Anti-malware mechanisms and processes are active, maintained, and monitored",
        description: "Anti-malware mechanisms are kept current, actively running, generating audit logs, and cannot be disabled or altered by users unless specifically documented and authorized.",
        testingProcedures: [
          "5.3.1 Examine anti-malware configurations to verify definitions are kept current via automatic updates",
          "5.3.2 Examine anti-malware configurations to verify the solution generates audit logs and logs are retained per Requirement 10",
          "5.3.3 Examine anti-malware configurations to verify the solution cannot be disabled or altered by users, unless specifically documented case-by-case basis authorized by management",
          "5.3.4 Examine anti-malware configurations to verify logs are reviewed periodically",
          "5.3.5 Examine anti-malware configurations to verify anti-phishing mechanisms are deployed to protect users against phishing attacks",
        ],
        guidance: "Ongoing maintenance and monitoring of anti-malware ensures continued protection against evolving threats.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "5.4",
        title: "Anti-phishing mechanisms protect users against phishing attacks",
        description: "Technical controls are in place to detect and protect personnel against phishing, including at least one mechanism for email and web-based phishing.",
        testingProcedures: [
          "5.4.1 Examine system configurations and interview personnel to verify anti-phishing mechanisms are deployed to protect against both email and web-based phishing",
        ],
        guidance: "Phishing is a primary attack vector for compromise. Technical controls complement security awareness training.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: false, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
    ],
  },
  // Requirement 6: Develop and Maintain Secure Systems and Software
  {
    id: "6",
    title: "Develop and Maintain Secure Systems and Software",
    description:
      "Security vulnerabilities in systems and software may allow criminals to gain unauthorized access to cardholder data. Many of these vulnerabilities are eliminated by installing vendor-provided security patches and maintaining secure development practices.",
    subRequirements: [
      {
        id: "6.1",
        title: "Processes and mechanisms for developing and maintaining secure systems and software are defined and understood",
        description: "All security policies and operational procedures for Requirement 6 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "6.1.1 Examine documentation to verify policies and procedures for secure development are defined and assigned",
          "6.1.2 Interview personnel to verify secure development processes are understood and assigned",
        ],
        guidance: "Governance ensures secure development lifecycle practices are consistently applied.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "6.2",
        title: "Bespoke and custom software is developed securely",
        description: "Bespoke and custom software is developed according to secure development practices, integrating security at each stage of the software development life cycle.",
        testingProcedures: [
          "6.2.1 Examine software-development procedures to verify they are based on industry standards and/or best practices for secure development",
          "6.2.2 Examine software development procedures to verify software developers are trained in secure coding techniques at least once every 12 months",
          "6.2.3 Examine software development procedures to verify bespoke and custom software is reviewed prior to release to production to identify and correct potential coding vulnerabilities",
          "6.2.4 Examine software engineering techniques to verify software uses techniques to prevent or mitigate common software attacks (e.g., injection, buffer overflow, XSS, CSRF)",
        ],
        guidance: "Secure SDLC practices prevent vulnerabilities from being introduced during development.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: false, saqC: false, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "6.3",
        title: "Security vulnerabilities are identified and addressed",
        description: "Security vulnerabilities are identified and addressed using a risk ranking process and vendor-provided security patches are installed in a timely manner.",
        testingProcedures: [
          "6.3.1 Examine policies and procedures to verify a process is defined for identifying security vulnerabilities using reputable outside sources and assigning a risk ranking",
          "6.3.2 Examine system components and related software to verify an inventory of bespoke and custom software and third-party software components is maintained to facilitate vulnerability and patch management",
          "6.3.3 Examine policies and procedures and examine system components to verify all applicable security patches/updates are installed within the timeframe defined in the entity's policy (e.g., critical and high patches within one month of release)",
        ],
        guidance: "Prompt patching and vulnerability management reduces the window of exposure to known attacks.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "6.4",
        title: "Public-facing web applications are protected against attacks",
        description: "Public-facing web applications are protected from known attacks (e.g., via a WAF or automated vulnerability assessment tool).",
        testingProcedures: [
          "6.4.1 Examine documentation and interview personnel to verify that for public-facing web applications, new threats and vulnerabilities are addressed on an ongoing basis and applications remain protected against known attacks",
          "6.4.2 Examine web applications and system configurations to verify an automated technical solution is deployed that detects and prevents web-based attacks (e.g., WAF) for public-facing web applications",
          "6.4.3 Examine configurations to verify all payment page scripts that are loaded and executed in the consumer's browser are managed (authorized, integrity assured, inventoried)",
        ],
        guidance: "Web applications are frequent targets for attack. WAFs and script management protect against exploitation of web vulnerabilities.",
        applicability: { saqA: true, saqAEP: true, saqB: false, saqBIP: false, saqC: false, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "6.5",
        title: "Changes to all system components are managed securely",
        description: "Change control processes for all changes to system components in the production environment address: documentation of impact, documented change approval, functionality testing, and back-out procedures.",
        testingProcedures: [
          "6.5.1 Examine change control documentation to verify documentation of impact, documented change approval by authorized parties, functionality testing, and back-out procedures are maintained",
          "6.5.2 Examine system configurations to verify a change detection mechanism is deployed on the payment page to alert personnel to unauthorized modification",
          "6.5.3 Examine pre-production and production environments to verify they are separated with access controls to enforce the separation",
          "6.5.4 Examine change management procedures to verify roles and functions are separated between development/test and production environments",
          "6.5.5 Examine change management procedures to verify live PANs are not used in pre-production environments (or protected per PCI DSS if used)",
          "6.5.6 Examine change management procedures to verify test data and test accounts are removed from system components before production deployment",
        ],
        guidance: "Formal change management prevents unintended introduction of security weaknesses during system modifications.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
    ],
  },
  // Requirement 7: Restrict Access to System Components and Cardholder Data by Business Need-to-Know
  {
    id: "7",
    title: "Restrict Access to System Components and Cardholder Data by Business Need-to-Know",
    description:
      "Unauthorized individuals may gain access to critical data or systems due to ineffective access control rules and definitions. To ensure only authorized personnel can access critical data, access must be limited to only the data and resources needed for business purposes.",
    subRequirements: [
      {
        id: "7.1",
        title: "Processes and mechanisms for restricting access are defined and understood",
        description: "All security policies and operational procedures for Requirement 7 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "7.1.1 Examine documentation to verify access control policies and procedures are defined and assigned",
          "7.1.2 Interview personnel to verify access restriction processes are understood",
        ],
        guidance: "Access control governance ensures consistent enforcement of need-to-know and least privilege principles.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "7.2",
        title: "Access to system components and data is appropriately defined and assigned",
        description: "Access control model is defined and includes granting access based on individual job classification, business need-to-know, and least privilege.",
        testingProcedures: [
          "7.2.1 Examine policies and settings to verify an access control model is defined that includes granting access based on job classification and function",
          "7.2.2 Examine access control settings to verify access is assigned based on documented job classification and function",
          "7.2.3 Examine access control settings to verify required privileges are approved by authorized management",
          "7.2.4 Examine access control lists to verify user accounts and access privileges are reviewed at least semi-annually",
          "7.2.5 Examine access configurations to verify all application and system accounts and related access privileges are assigned and managed based on least privilege",
          "7.2.6 Examine access configurations to verify all user access to query repositories of stored cardholder data is restricted to authorized users with documented business need",
        ],
        guidance: "Role-based access control with documented business justification ensures only authorized personnel access cardholder data.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "7.3",
        title: "Access to system components and data is managed via an access control system",
        description: "An access control system(s) is implemented to restrict access based on user's need-to-know and is set to 'deny all' unless specifically allowed.",
        testingProcedures: [
          "7.3.1 Examine system configurations to verify an access control system(s) is in place on all system components that restricts access based on user need-to-know",
          "7.3.2 Examine access control system configurations to verify the system is configured to enforce authorization assigned to individuals based on job classification and function",
          "7.3.3 Examine access control system configurations to verify the system is set to 'deny all' by default",
        ],
        guidance: "Technical enforcement of access controls prevents circumvention of administrative access policies.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
    ],
  },
  // Requirement 8: Identify Users and Authenticate Access to System Components
  {
    id: "8",
    title: "Identify Users and Authenticate Access to System Components",
    description:
      "Two fundamental principles of identifying and authenticating users are: 1) Establish the identity of all users (human and system) with unique IDs, and 2) Authenticate that identity to verify the user is who they claim to be using one or more authentication factors.",
    subRequirements: [
      {
        id: "8.1",
        title: "Processes and mechanisms for identifying users and authenticating access are defined and understood",
        description: "All security policies and operational procedures for Requirement 8 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "8.1.1 Examine documentation to verify identification and authentication policies and procedures are defined and assigned",
          "8.1.2 Interview personnel to verify identification and authentication processes are understood",
        ],
        guidance: "Governance over identity management ensures consistent identification and authentication of all users.",
        applicability: { saqA: true, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "8.2",
        title: "User identification and related accounts are strictly managed throughout the lifecycle",
        description: "User accounts are assigned to individual users rather than shared, and user account lifecycle (add, modify, delete) is managed.",
        testingProcedures: [
          "8.2.1 Examine system configurations to verify all users are assigned a unique ID before access is allowed to system components or cardholder data",
          "8.2.2 Examine system configurations to verify group, shared, or generic accounts (or other shared authentication credentials) are managed per exception only",
          "8.2.3 Examine user account configurations to verify accounts are managed through their lifecycle (created upon hire/onboarding, modified for role changes, terminated upon separation)",
          "8.2.4 Examine user lists and interview personnel to verify terminated user accounts are promptly deactivated or removed",
          "8.2.5 Examine system configurations to verify third-party/vendor access accounts are managed per requirements (enabled only during needed time frame, monitored during use)",
          "8.2.6 Examine authentication configurations to verify inactive user accounts are removed or disabled within 90 days of inactivity",
          "8.2.7 Examine system configurations to verify accounts used by third parties for remote access are managed per applicable requirements",
          "8.2.8 Examine system configurations to verify user sessions are automatically timed out after a period of inactivity (no more than 15 minutes)",
        ],
        guidance: "Unique IDs enable traceability and accountability. Account lifecycle management prevents orphaned access.",
        applicability: { saqA: true, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "8.3",
        title: "Strong authentication for users and administrators is established and managed",
        description: "Strong authentication (MFA) is required for all access into the CDE and for all non-console administrative access.",
        testingProcedures: [
          "8.3.1 Examine authentication configurations to verify all user access to system components in the CDE is authenticated using at least one authentication factor",
          "8.3.2 Examine authentication configurations to verify strong cryptography is used to render all authentication factors unreadable during storage and transmission",
          "8.3.3 Examine authentication configurations to verify user identity is verified before modifying any authentication factor (e.g., password resets)",
          "8.3.4 Examine system configurations to verify invalid authentication attempts are limited (locked out after not more than 10 attempts) with lockout duration of at least 30 minutes or until administrator unlocks",
          "8.3.5 Examine system configurations to verify passwords/passphrases meet minimum complexity requirements (at least 12 characters with both numeric and alphabetic characters)",
          "8.3.6 Examine system configurations to verify passwords/passphrases are changed at least once every 90 days, or security posture of accounts is dynamically analyzed with risk-based access accordingly",
          "8.3.7 Examine system configurations to verify new passwords are not the same as any of the last four passwords used",
          "8.3.8 Examine system configurations to verify authentication policies require that if a user session has been idle for more than 15 minutes, the user is required to re-authenticate",
          "8.3.9 Examine system configurations to verify multi-factor authentication (MFA) is implemented for all non-console access into the CDE",
          "8.3.10 Examine system configurations to verify MFA is implemented for all non-console administrative access",
          "8.3.11 Examine system configurations to verify where passwords/passphrases are used as sole authentication factor for customer user access, either passwords are changed at least every 90 days, or access is via dynamic risk analysis",
        ],
        guidance: "Strong authentication prevents unauthorized access even if credentials are compromised. MFA provides additional assurance beyond passwords.",
        applicability: { saqA: true, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "8.4",
        title: "Multi-factor authentication (MFA) is implemented to secure access into the CDE",
        description: "MFA requires at least two of the three authentication factors: something you know, something you have, something you are.",
        testingProcedures: [
          "8.4.1 Examine network and/or system configurations to verify MFA is implemented for all non-console access into the CDE for personnel with administrative access",
          "8.4.2 Examine network and/or system configurations to verify MFA is implemented for all access into the CDE",
          "8.4.3 Examine system configurations to verify MFA is implemented for all remote network access that could access or impact the CDE",
        ],
        guidance: "MFA significantly reduces the risk of unauthorized access when passwords are compromised through phishing, brute force, or other means.",
        applicability: { saqA: true, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "8.5",
        title: "Multi-factor authentication (MFA) systems are configured to prevent misuse",
        description: "MFA implementation details ensure the MFA system itself is not vulnerable to attack or bypass.",
        testingProcedures: [
          "8.5.1 Examine MFA system configurations to verify the MFA system is not susceptible to replay attacks",
          "8.5.2 Examine MFA system configurations to verify MFA is enforced for all users (no exceptions unless specifically documented and approved by management)",
        ],
        guidance: "MFA systems must be properly implemented to prevent bypass or replay attacks that would negate the security benefit.",
        applicability: { saqA: true, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "8.6",
        title: "Use of application and system accounts is strictly managed",
        description: "Application and system accounts (service accounts, application IDs, batch IDs) are managed with security controls proportionate to the risk they present.",
        testingProcedures: [
          "8.6.1 Examine system and application accounts to verify accounts used by systems or applications can only be used programmatically (interactive login disabled where applicable)",
          "8.6.2 Examine system configurations to verify passwords/passphrases for application/system accounts are changed periodically or managed via strong controls (complexity, rotation, or certificate-based)",
          "8.6.3 Examine system configurations to verify passwords/passphrases for application/system accounts are protected against misuse (not hardcoded, stored securely)",
        ],
        guidance: "Service and application accounts present unique risks due to their elevated privileges and non-interactive nature.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
    ],
  },
  // Requirement 9: Restrict Physical Access to Cardholder Data
  {
    id: "9",
    title: "Restrict Physical Access to Cardholder Data",
    description:
      "Any physical access to cardholder data or systems that store, process, or transmit cardholder data provides the opportunity for individuals to access devices or data and to remove systems or hardcopies, and should be appropriately restricted.",
    subRequirements: [
      {
        id: "9.1",
        title: "Processes and mechanisms for restricting physical access are defined and understood",
        description: "All security policies and operational procedures for Requirement 9 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "9.1.1 Examine documentation to verify physical access policies and procedures are defined and assigned",
          "9.1.2 Interview personnel to verify physical access procedures are understood",
        ],
        guidance: "Governance over physical security ensures consistent protection of physical assets and cardholder data.",
        applicability: { saqA: false, saqAEP: false, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "9.2",
        title: "Physical access controls manage entry into facilities and systems",
        description: "Physical access to sensitive areas is controlled by facilities entry controls that verify identity and authorization before granting access.",
        testingProcedures: [
          "9.2.1 Examine documented processes and observe badge/access mechanisms to verify appropriate facility entry controls are in place to limit and monitor physical access to systems in the CDE",
          "9.2.2 Examine access controls and observe visitor management to verify procedures are in place to identify and authorize visitors before granting access to the CDE",
          "9.2.3 Examine visitor logs and interview personnel to verify visitor logs are maintained for all visitors to facilities with access to the CDE",
          "9.2.4 Examine configurations and observe to verify visitor badges or identification are visually distinguishable from onsite personnel",
        ],
        guidance: "Facility entry controls prevent unauthorized physical access to systems and media containing cardholder data.",
        applicability: { saqA: false, saqAEP: false, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "9.3",
        title: "Physical access for personnel and visitors is authorized and managed",
        description: "Physical access to sensitive areas is restricted and managed for both employees and visitors based on individual job function.",
        testingProcedures: [
          "9.3.1 Examine physical access control configurations to verify access is controlled based on individual job function",
          "9.3.2 Examine system configurations to verify access to sensitive areas is controlled and access is revoked promptly upon termination",
          "9.3.3 Examine visitor logs and observe to verify visitors are escorted at all times in areas where cardholder data is present",
          "9.3.4 Examine access logs and interview personnel to verify physical access logs are reviewed periodically to identify suspicious activity",
        ],
        guidance: "Managed physical access ensures only authorized individuals with a business need can access cardholder data environments.",
        applicability: { saqA: false, saqAEP: false, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "9.4",
        title: "Media with cardholder data is managed and secured",
        description: "All media is physically secured, controlled during distribution, and destroyed when no longer needed for business or legal reasons.",
        testingProcedures: [
          "9.4.1 Examine media handling procedures to verify all media with cardholder data is physically secured",
          "9.4.2 Examine procedures and tracking logs to verify media distribution is classified and controlled (secure courier, tracked delivery, management approval for off-site)",
          "9.4.3 Examine destruction procedures and interview personnel to verify media containing cardholder data is destroyed when no longer needed via cross-cut shredding, incineration, pulping, or secure data destruction of electronic media",
          "9.4.4 Examine procedures and documentation to verify electronic media containing cardholder data is rendered unrecoverable when destroyed",
          "9.4.5 Examine periodic media inventory logs to verify media inventories are conducted at least annually",
          "9.4.6 Examine policies and interview personnel to verify hard-copy materials containing cardholder data are destroyed when no longer needed for business or legal reasons",
          "9.4.7 Examine policies and interview personnel to verify electronic media containing cardholder data is destroyed using an approved method when no longer needed",
        ],
        guidance: "Secure handling, distribution, and destruction of media prevents unauthorized access to cardholder data from discarded or mishandled media.",
        applicability: { saqA: false, saqAEP: false, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "9.5",
        title: "Point-of-interaction (POI) devices are protected from tampering and unauthorized substitution",
        description: "POI device surfaces are periodically inspected, and personnel are trained to detect tampering and unauthorized substitution.",
        testingProcedures: [
          "9.5.1 Examine the list of POI devices to verify an up-to-date list is maintained including make, model, location, and serial number (or unique identifier)",
          "9.5.2 Examine POI device inspection procedures and interview personnel to verify devices are periodically inspected for tampering or substitution",
          "9.5.3 Examine training materials and interview personnel to verify personnel are trained to be aware of attempted tampering or replacement of POI devices",
        ],
        guidance: "POI device inspection prevents installation of skimming devices or substitution of compromised terminals.",
        applicability: { saqA: false, saqAEP: false, saqB: true, saqBIP: true, saqC: true, saqCVT: false, saqD: true, saqP2PE: true },
      },
    ],
  },
  // Requirement 10: Log and Monitor All Access to System Components and Cardholder Data
  {
    id: "10",
    title: "Log and Monitor All Access to System Components and Cardholder Data",
    description:
      "Logging mechanisms and the ability to track user activities are critical in preventing, detecting, or minimizing the impact of a data compromise. The presence of logs in all environments allows thorough tracking, alerting, and analysis when something does go wrong.",
    subRequirements: [
      {
        id: "10.1",
        title: "Processes and mechanisms for logging and monitoring are defined and understood",
        description: "All security policies and operational procedures for Requirement 10 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "10.1.1 Examine documentation to verify logging and monitoring policies and procedures are defined and assigned",
          "10.1.2 Interview personnel to verify logging and monitoring processes are understood and roles are assigned",
        ],
        guidance: "Governance over logging ensures complete audit trails are maintained for the CDE.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "10.2",
        title: "Audit logs are implemented to support detection of anomalies and suspicious activity",
        description: "Audit logs record all individual user access to cardholder data, actions taken by users with root/administrative privileges, access to audit trails, invalid access attempts, use of identification and authentication mechanisms, and other critical activities.",
        testingProcedures: [
          "10.2.1 Examine system configurations and audit log samples to verify audit logs are enabled and active for all system components in and connected to the CDE",
          "10.2.2 Examine audit log configurations to verify all events in Requirement 10.2.1 are recorded for all system components",
        ],
        guidance: "Comprehensive audit logging enables detection of unauthorized activity and supports forensic investigation.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "10.3",
        title: "Audit logs are protected from destruction and unauthorized modifications",
        description: "Audit logs are protected so they cannot be deleted or modified. Access to audit logs is limited to those with a job-related need.",
        testingProcedures: [
          "10.3.1 Examine system configurations to verify audit logs cannot be disabled or deleted by non-authorized personnel",
          "10.3.2 Examine system configurations and access control lists to verify current audit log files are protected from unauthorized modifications via access control mechanisms, physical segregation, and/or network segregation",
          "10.3.3 Examine configurations and observe to verify current audit log files are promptly backed up to a centralized log server or media that is difficult to alter",
          "10.3.4 Examine system configurations to verify file-integrity monitoring or change-detection mechanisms are used on audit logs",
        ],
        guidance: "Log protection ensures that evidence of compromise cannot be destroyed by an attacker who gains access to systems.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "10.4",
        title: "Audit logs are reviewed to identify anomalies or suspicious activity",
        description: "Audit logs are reviewed at least once daily. Automated mechanisms are used to perform audit log reviews.",
        testingProcedures: [
          "10.4.1 Examine security policies and procedures to verify processes are defined for reviewing audit logs at least once daily, including all security events, logs of all system components in the CDE, and logs of all critical system components",
          "10.4.2 Examine log review mechanisms and interview personnel to verify automated mechanisms perform audit log reviews",
          "10.4.3 Examine log review mechanisms to verify anomalies or suspicious activities identified during the review are addressed",
        ],
        guidance: "Regular log review enables timely detection of and response to security incidents.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "10.5",
        title: "Audit log history is retained and available for analysis",
        description: "Audit log history is retained for at least 12 months, with at least the most recent three months immediately available for analysis.",
        testingProcedures: [
          "10.5.1 Examine documentation to verify audit log retention policies require at least 12 months of history with a minimum of three months immediately available online for analysis",
        ],
        guidance: "Log retention supports forensic investigation of incidents that may not be detected immediately.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "10.6",
        title: "Time-synchronization mechanisms support consistent time across all systems",
        description: "All critical system clocks and times are synchronized using time-synchronization technology, and systems are configured to acquire, distribute, and store the correct time.",
        testingProcedures: [
          "10.6.1 Examine system configurations to verify time-synchronization technology is implemented and kept current (NTP or equivalent)",
          "10.6.2 Examine system configurations to verify systems receive time data only from designated, industry-accepted time sources",
          "10.6.3 Examine system configurations to verify time settings are received from industry-accepted external sources and based on International Atomic Time or UTC",
        ],
        guidance: "Accurate time synchronization ensures log entries across multiple systems can be correlated during investigation.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "10.7",
        title: "Failures of critical security control systems are detected, reported, and responded to promptly",
        description: "Failures of critical security control systems (firewalls, IDS/IPS, anti-malware, audit logging, segmentation controls, etc.) are detected, alerted, and addressed in a timely manner.",
        testingProcedures: [
          "10.7.1 Examine system configurations and interview personnel to verify failures of critical security control systems are detected and result in alerts",
          "10.7.2 Examine detection and alerting processes to verify failures of critical security control systems are responded to promptly with documented procedures",
          "10.7.3 Examine policies and procedures to verify failures of any critical security controls are responded to promptly per documented response procedures",
        ],
        guidance: "Monitoring the monitoring systems ensures that a gap in security controls does not go undetected.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
    ],
  },
  // Requirement 11: Test Security of Systems and Networks Regularly
  {
    id: "11",
    title: "Test Security of Systems and Networks Regularly",
    description:
      "Vulnerabilities are continually discovered by researchers and introduced by new software. System components, processes, and bespoke and custom software should be tested frequently to ensure security controls continue to reflect a changing environment.",
    subRequirements: [
      {
        id: "11.1",
        title: "Processes and mechanisms for regularly testing security are defined and understood",
        description: "All security policies and operational procedures for Requirement 11 are documented, kept up to date, in use, and known to all affected parties.",
        testingProcedures: [
          "11.1.1 Examine documentation to verify security testing policies and procedures are defined and assigned",
          "11.1.2 Interview personnel to verify security testing processes are understood and roles are assigned",
        ],
        guidance: "Governance over security testing ensures consistent assessment of the environment's security posture.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "11.2",
        title: "Wireless access points are identified and monitored, and unauthorized wireless access points are addressed",
        description: "A process is implemented to detect and identify both authorized and unauthorized wireless access points on a quarterly basis.",
        testingProcedures: [
          "11.2.1 Examine policies and procedures and interview personnel to verify processes are defined to manage all authorized and unauthorized wireless access points",
          "11.2.2 Examine wireless scanning results and interview personnel to verify authorized and unauthorized wireless access points are identified and detected at least once every three months",
        ],
        guidance: "Unauthorized wireless access points present an unmonitored entry point to the cardholder data environment.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "11.3",
        title: "External and internal vulnerabilities are regularly identified, prioritized, and addressed",
        description: "Internal vulnerability scans are performed at least quarterly and after significant changes. External vulnerability scans are performed at least quarterly by an ASV.",
        testingProcedures: [
          "11.3.1 Examine vulnerability scan reports and interview personnel to verify internal vulnerability scans are performed at least once every three months and rescans confirm all high-risk and critical vulnerabilities are resolved",
          "11.3.2 Examine ASV scan reports to verify external vulnerability scans are performed at least once every three months and passing scan results are achieved",
        ],
        guidance: "Regular vulnerability scanning identifies new weaknesses before they can be exploited.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "11.4",
        title: "External and internal penetration testing is regularly performed and exploitable vulnerabilities are corrected",
        description: "Penetration testing is performed at least annually and after significant infrastructure or application changes. The test covers the network perimeter and critical systems, and includes both network-layer and application-layer tests.",
        testingProcedures: [
          "11.4.1 Examine the scope of penetration testing and verify it covers the entire CDE perimeter and critical systems",
          "11.4.2 Examine penetration testing results to verify internal penetration testing is performed at least once every 12 months",
          "11.4.3 Examine penetration testing results to verify external penetration testing is performed at least once every 12 months",
          "11.4.4 Examine penetration testing results to verify exploitable vulnerabilities found during penetration testing are corrected and testing is repeated to verify corrections",
          "11.4.5 Examine penetration testing methodology to verify the penetration test approach is defined, documented, and includes industry-accepted approaches",
          "11.4.6 Examine penetration testing results to verify network-segmentation controls are tested at least once every 12 months (every six months for service providers)",
          "11.4.7 Examine penetration testing results to verify multi-tenant service providers test segmentation controls between tenant environments at least every six months",
        ],
        guidance: "Penetration testing simulates real-world attacks to validate that security controls are effective.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: false, saqC: false, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "11.5",
        title: "Network intrusions and unexpected file changes are detected and responded to",
        description: "Intrusion-detection and/or intrusion-prevention techniques are used to detect and/or prevent intrusions into the network. Change-detection mechanisms are deployed on critical systems.",
        testingProcedures: [
          "11.5.1 Examine system configurations and network diagrams to verify intrusion-detection and/or intrusion-prevention techniques are in place to monitor all traffic at the perimeter and at critical points in the CDE",
          "11.5.2 Examine change-detection mechanism configurations to verify mechanisms are deployed to alert personnel to unauthorized modification of critical system files, configuration files, or content files",
        ],
        guidance: "IDS/IPS and file integrity monitoring provide detection of compromise in progress or after the fact.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: false, saqC: false, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "11.6",
        title: "Unauthorized changes on payment pages are detected and responded to",
        description: "A change- and tamper-detection mechanism is deployed on payment pages to alert personnel to unauthorized modification.",
        testingProcedures: [
          "11.6.1 Examine system configurations and change-detection mechanism results to verify a change- and tamper-detection mechanism is deployed on payment pages (e.g., to detect modifications to HTTP headers, payment page content, and script execution in the consumer browser)",
        ],
        guidance: "Payment page monitoring detects magecart-style attacks that inject malicious scripts into checkout pages.",
        applicability: { saqA: true, saqAEP: true, saqB: false, saqBIP: false, saqC: false, saqCVT: false, saqD: true, saqP2PE: false },
      },
    ],
  },
  // Requirement 12: Support Information Security with Organizational Policies and Programs
  {
    id: "12",
    title: "Support Information Security with Organizational Policies and Programs",
    description:
      "A strong security policy sets the security tone for the whole entity and informs personnel what is expected of them. All personnel should be aware of the sensitivity of cardholder data and their responsibilities for protecting it.",
    subRequirements: [
      {
        id: "12.1",
        title: "A comprehensive information security policy is established and maintained",
        description: "An overall information security policy is established, published, maintained, and disseminated to all relevant personnel and vendors/business partners.",
        testingProcedures: [
          "12.1.1 Examine the information security policy to verify it is established, published, maintained, and disseminated to all relevant personnel",
          "12.1.2 Examine the information security policy to verify it is reviewed at least once every 12 months and updated as needed to reflect changes to business objectives or the risk environment",
          "12.1.3 Examine the information security policy to verify it clearly defines information security roles and responsibilities for all personnel",
          "12.1.4 Examine the information security policy and interview personnel to verify responsibility for information security is formally assigned to a Chief Information Security Officer or other knowledgeable security representative",
        ],
        guidance: "A comprehensive security policy provides the foundation for all PCI DSS security requirements.",
        applicability: { saqA: true, saqAEP: true, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "12.2",
        title: "Acceptable use policies for end-user technologies are defined and implemented",
        description: "Acceptable use policies for critical technologies (remote access, wireless, removable media, laptops, tablets, email, internet) are documented and implemented.",
        testingProcedures: [
          "12.2.1 Examine acceptable use policies to verify they are documented and address usage requirements for critical technologies",
        ],
        guidance: "Acceptable use policies establish boundaries for personnel interaction with information assets.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "12.3",
        title: "Risks to the cardholder data environment are formally identified, evaluated, and managed",
        description: "A formal risk assessment is performed at least annually and upon significant changes to identify threats, vulnerabilities, and resulting risk to the CDE.",
        testingProcedures: [
          "12.3.1 Examine documentation to verify a formal risk assessment is performed at least once every 12 months and upon significant changes to the environment",
          "12.3.2 Examine documentation to verify the risk assessment identifies assets, threats, and vulnerabilities and results in a formal, documented analysis of risk",
          "12.3.3 Examine documentation to verify the risk assessment is performed by qualified personnel (internal or external)",
          "12.3.4 Examine documentation to verify targeted risk analyses are performed for each PCI DSS requirement identified by the entity as met via the customized approach",
        ],
        guidance: "Risk assessment provides the basis for prioritizing security controls and allocating resources.",
        applicability: { saqA: true, saqAEP: true, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "12.4",
        title: "PCI DSS compliance is managed (service providers)",
        description: "Service providers establish responsibility for the protection of cardholder data and a PCI DSS compliance program, including executive management assignment of overall accountability.",
        testingProcedures: [
          "12.4.1 Examine documentation to verify service providers establish responsibility and a PCI DSS compliance program (additional requirement for service providers only)",
          "12.4.2 Examine documentation to verify service providers perform reviews at least quarterly to confirm personnel are following security policies and operational procedures (additional requirement for service providers only)",
        ],
        guidance: "Service providers must demonstrate ongoing commitment to PCI DSS compliance with executive accountability.",
        applicability: { saqA: false, saqAEP: false, saqB: false, saqBIP: false, saqC: false, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "12.5",
        title: "PCI DSS scope is documented and validated",
        description: "The PCI DSS scope is documented and confirmed by the entity, and all in-scope system components are identified. Scope is validated and confirmed at least annually and upon significant changes.",
        testingProcedures: [
          "12.5.1 Examine documentation to verify an inventory of system components in scope for PCI DSS is maintained and includes a description of function/use for each",
          "12.5.2 Examine documentation and interview personnel to verify PCI DSS scope is documented and confirmed at least once every 12 months and upon significant changes to the in-scope environment",
          "12.5.3 Examine documentation to verify significant organizational changes result in a documented review of PCI DSS scope and applicability of controls (additional requirement for service providers only)",
        ],
        guidance: "Accurate scope definition ensures all relevant systems are included in the assessment and no gaps in protection exist.",
        applicability: { saqA: true, saqAEP: true, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "12.6",
        title: "Security awareness education is an ongoing activity",
        description: "A formal security awareness program educates all personnel upon hire and at least annually thereafter. The program includes awareness of threats, responsibilities, and the entity's information security policy.",
        testingProcedures: [
          "12.6.1 Examine the security awareness program to verify it provides awareness to all personnel upon hire and at least once every 12 months",
          "12.6.2 Examine security awareness program content to verify it includes awareness of threats and vulnerabilities that could impact the security of cardholder data (e.g., phishing, social engineering)",
          "12.6.3 Examine security awareness materials and interview personnel to verify personnel acknowledge at least once every 12 months that they have read and understood the information security policy and procedures",
        ],
        guidance: "Security-aware personnel are a critical line of defense against social engineering and human error.",
        applicability: { saqA: true, saqAEP: true, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "12.7",
        title: "Personnel are screened to reduce risks from insider threats",
        description: "Background checks are performed prior to hire for personnel with access to the CDE, cardholder data, or sensitive areas, within constraints of local laws.",
        testingProcedures: [
          "12.7.1 Examine policies and procedures to verify background checks are performed (within constraints of local laws) prior to hire for personnel who will have access to the CDE or cardholder data",
        ],
        guidance: "Background screening helps identify individuals who may present a risk to cardholder data security.",
        applicability: { saqA: false, saqAEP: true, saqB: false, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: false },
      },
      {
        id: "12.8",
        title: "Risk to information assets from third-party service provider relationships is managed",
        description: "A list of all third-party service providers (TPSPs) with which cardholder data is shared or that could affect the security of the CDE is maintained, including the PCI DSS requirements managed by each TPSP.",
        testingProcedures: [
          "12.8.1 Examine documentation to verify a list of all TPSPs with which account data is shared or that could affect the security of account data is maintained",
          "12.8.2 Examine written agreements to verify they include acknowledgments from TPSPs that they are responsible for the security of account data they possess or otherwise manage on behalf of the entity",
          "12.8.3 Examine policies and procedures to verify an established process exists for engaging TPSPs including proper due diligence prior to engagement",
          "12.8.4 Examine policies and procedures and supporting documentation to verify a program is in place to monitor TPSPs' PCI DSS compliance status at least once every 12 months",
          "12.8.5 Examine policies and procedures and supporting documentation to verify information is maintained about which PCI DSS requirements are managed by each TPSP, which are managed by the entity, and which are shared",
        ],
        guidance: "Third-party risk management ensures the security of cardholder data is maintained when shared with or accessible to external parties.",
        applicability: { saqA: true, saqAEP: true, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
      {
        id: "12.9",
        title: "Third-party service providers support their customers' PCI DSS compliance",
        description: "TPSPs acknowledge in writing to customers that they are responsible for the security of account data the TPSP possesses or otherwise stores, processes, or transmits on behalf of the customer.",
        testingProcedures: [
          "12.9.1 Examine TPSP policies and procedures and evidence of processes to verify the TPSP provides written acknowledgment to customers (additional requirement for TPSPs only)",
          "12.9.2 Examine TPSP policies and procedures to verify the TPSP supports their customers' requests for information about PCI DSS compliance status and requirements managed by the TPSP (additional requirement for TPSPs only)",
        ],
        guidance: "TPSPs must provide transparency about their PCI DSS compliance to their customers.",
        applicability: { saqA: false, saqAEP: false, saqB: false, saqBIP: false, saqC: false, saqCVT: false, saqD: true, saqP2PE: false },
      },
      {
        id: "12.10",
        title: "Security incidents and suspected security incidents are responded to immediately",
        description: "An incident response plan is implemented and ready to be activated immediately upon a suspected or confirmed security incident.",
        testingProcedures: [
          "12.10.1 Examine the incident response plan to verify it includes: roles, responsibilities, communication/contact strategies, specific incident response procedures, business recovery/continuity procedures, data back-up processes, legal requirements for reporting compromises, coverage of all critical system components, and reference to or inclusion of incident response procedures from payment brands",
          "12.10.2 Examine documentation and interview personnel to verify the incident response plan is reviewed and tested at least annually (including all elements listed in 12.10.1)",
          "12.10.3 Examine documentation to verify specific personnel are designated to be available on a 24/7 basis to respond to suspected or confirmed security incidents",
          "12.10.4 Examine training documentation and interview personnel to verify personnel responsible for responding to security incidents are trained at least annually",
          "12.10.5 Examine documentation and observe processes to verify the incident response plan includes monitoring and responding to alerts from security monitoring systems (e.g., IDS/IPS, file-integrity monitoring, change-detection, audit logs)",
          "12.10.6 Examine documentation to verify the incident response plan is modified and evolved based on lessons learned and industry developments",
          "12.10.7 Examine incident response procedures to verify procedures are in place to initiate forensic investigations upon detection of unauthorized PAN anywhere outside the CDE (e.g., from a data loss prevention tool)",
        ],
        guidance: "A well-prepared and tested incident response plan minimizes damage from security breaches and enables rapid recovery.",
        applicability: { saqA: true, saqAEP: true, saqB: true, saqBIP: true, saqC: true, saqCVT: true, saqD: true, saqP2PE: true },
      },
    ],
  },
];
