/**
 * FFIEC Cybersecurity Assessment Tool (CAT) Framework
 * Structured data for inherent risk profile and cybersecurity maturity assessment
 */

export type InherentRiskLevel = "least" | "minimal" | "moderate" | "significant" | "most";
export type MaturityLevel = "baseline" | "evolving" | "intermediate" | "advanced" | "innovative";

export interface InherentRiskCategory {
  id: string;
  name: string;
  description: string;
  assessmentCriteria: InherentRiskCriterion[];
}

export interface InherentRiskCriterion {
  factor: string;
  leastRisk: string;
  minimalRisk: string;
  moderateRisk: string;
  significantRisk: string;
  mostRisk: string;
}

export interface MaturityDomain {
  id: string;
  name: string;
  description: string;
  assessmentFactors: MaturityAssessmentFactor[];
}

export interface MaturityAssessmentFactor {
  id: string;
  name: string;
  components: MaturityComponent[];
}

export interface MaturityComponent {
  id: string;
  name: string;
  declarativeStatements: Record<MaturityLevel, string[]>;
}

export interface RiskMaturityMapping {
  inherentRiskLevel: InherentRiskLevel;
  minimumExpectedMaturity: MaturityLevel;
  description: string;
}

export const INHERENT_RISK_CATEGORIES: InherentRiskCategory[] = [
  {
    id: "technologies_connections",
    name: "Technologies and Connection Types",
    description: "Types of technology and connection types used by the institution",
    assessmentCriteria: [
      {
        factor: "Total number of Internet service provider (ISP) connections",
        leastRisk: "No direct ISP connections",
        minimalRisk: "1 ISP connection",
        moderateRisk: "2-5 ISP connections",
        significantRisk: "6-15 ISP connections",
        mostRisk: "More than 15 ISP connections",
      },
      {
        factor: "Unsecured external connections",
        leastRisk: "No unsecured connections",
        minimalRisk: "Minimal unsecured connections, tightly controlled",
        moderateRisk: "Some unsecured connections with compensating controls",
        significantRisk: "Numerous unsecured connections",
        mostRisk: "Extensive unsecured connections with limited controls",
      },
      {
        factor: "Wireless network access",
        leastRisk: "No wireless networks",
        minimalRisk: "Guest wireless only, isolated from internal network",
        moderateRisk: "Wireless for internal use with WPA2/3 and segmentation",
        significantRisk: "Multiple wireless networks with some accessing critical systems",
        mostRisk: "Extensive wireless with direct access to critical infrastructure",
      },
      {
        factor: "Third-party connections",
        leastRisk: "No third-party connections",
        minimalRisk: "1-5 third-party connections, all closely monitored",
        moderateRisk: "6-20 third-party connections",
        significantRisk: "21-50 third-party connections",
        mostRisk: "More than 50 third-party connections",
      },
      {
        factor: "Cloud computing services",
        leastRisk: "No cloud services",
        minimalRisk: "Limited SaaS for non-critical functions",
        moderateRisk: "Cloud used for some core banking functions",
        significantRisk: "Significant reliance on cloud for core operations",
        mostRisk: "Core banking platform hosted entirely in cloud; multi-cloud environment",
      },
    ],
  },
  {
    id: "delivery_channels",
    name: "Delivery Channels",
    description: "Products and services delivered electronically",
    assessmentCriteria: [
      {
        factor: "Online/internet banking presence",
        leastRisk: "No online banking or web presence",
        minimalRisk: "Informational website only; no transactional capability",
        moderateRisk: "Online banking with standard bill pay and transfers",
        significantRisk: "Full-featured online banking with ACH origination and wire transfers",
        mostRisk: "Advanced online services including real-time payments, API banking, and open banking",
      },
      {
        factor: "Mobile banking services",
        leastRisk: "No mobile services",
        minimalRisk: "Mobile app with view-only access",
        moderateRisk: "Mobile app with standard transaction capability",
        significantRisk: "Mobile app with RDC, P2P, and advanced features",
        mostRisk: "Full mobile-first platform with biometric auth and digital wallet integration",
      },
      {
        factor: "ATM operations",
        leastRisk: "No ATMs",
        minimalRisk: "1-10 owned ATMs",
        moderateRisk: "11-50 owned/leased ATMs",
        significantRisk: "51-200 ATMs including shared network participation",
        mostRisk: "200+ ATMs with network sponsorship/ISO relationships",
      },
      {
        factor: "Debit/credit card services",
        leastRisk: "No card programs",
        minimalRisk: "Debit card only through third-party processor",
        moderateRisk: "Debit and credit cards through third-party processor",
        significantRisk: "Card issuing with in-house processing capabilities",
        mostRisk: "Card issuing, acquiring, and merchant processing",
      },
    ],
  },
  {
    id: "online_mobile_products",
    name: "Online/Mobile Products and Technology Services",
    description: "Volume and complexity of technology-based products and services",
    assessmentCriteria: [
      {
        factor: "ACH origination volume",
        leastRisk: "No ACH origination",
        minimalRisk: "Low volume, employee payroll only",
        moderateRisk: "Moderate volume, limited business customers",
        significantRisk: "High volume, third-party sender relationships",
        mostRisk: "Very high volume with third-party senders and international ACH (IAT)",
      },
      {
        factor: "Wire transfer volume and type",
        leastRisk: "No wire capability",
        minimalRisk: "Domestic wires only, low volume (<50/month)",
        moderateRisk: "Domestic and limited international wires (50-500/month)",
        significantRisk: "High-volume domestic and international (500-5000/month)",
        mostRisk: "Very high volume with correspondent banking and cover payments (5000+/month)",
      },
      {
        factor: "Remote Deposit Capture",
        leastRisk: "No RDC services",
        minimalRisk: "RDC for limited commercial customers only",
        moderateRisk: "RDC for commercial and consumer mobile deposit",
        significantRisk: "High-volume RDC with elevated limits",
        mostRisk: "Extensive RDC with high limits and third-party item processing",
      },
      {
        factor: "Hosting or cloud services provided to others",
        leastRisk: "No hosting services provided",
        minimalRisk: "Hosting for affiliated entities only",
        moderateRisk: "Limited hosting/technology services for third parties",
        significantRisk: "Significant technology services for multiple third parties",
        mostRisk: "Extensive technology service provider (TSP) role",
      },
    ],
  },
  {
    id: "organizational_characteristics",
    name: "Organizational Characteristics",
    description: "Size, complexity, and operational characteristics",
    assessmentCriteria: [
      {
        factor: "Total assets",
        leastRisk: "Under $100 million",
        minimalRisk: "$100 million - $500 million",
        moderateRisk: "$500 million - $5 billion",
        significantRisk: "$5 billion - $50 billion",
        mostRisk: "Over $50 billion",
      },
      {
        factor: "Number of employees with privileged access",
        leastRisk: "1-5 privileged users",
        minimalRisk: "6-20 privileged users",
        moderateRisk: "21-50 privileged users",
        significantRisk: "51-200 privileged users",
        mostRisk: "200+ privileged users",
      },
      {
        factor: "Merger/acquisition/integration activity",
        leastRisk: "No M&A activity",
        minimalRisk: "Completed M&A with full integration",
        moderateRisk: "M&A in progress with integration underway",
        significantRisk: "Multiple concurrent M&A integrations",
        mostRisk: "Frequent M&A with complex multi-system integrations",
      },
      {
        factor: "Geographic dispersion of operations",
        leastRisk: "Single location",
        minimalRisk: "Single state, limited branches",
        moderateRisk: "Multi-state operations",
        significantRisk: "National operations with regional data centers",
        mostRisk: "International operations with global data centers",
      },
    ],
  },
  {
    id: "external_threats",
    name: "External Threats",
    description: "Threat environment and attacks targeting the institution or sector",
    assessmentCriteria: [
      {
        factor: "Attempted cyber attacks (volume)",
        leastRisk: "Minimal detected attempts",
        minimalRisk: "Low volume, primarily automated scanning",
        moderateRisk: "Moderate volume including targeted phishing",
        significantRisk: "High volume with sophisticated targeted attacks",
        mostRisk: "Constant high-volume attacks including APT activity",
      },
      {
        factor: "Prior cybersecurity incidents",
        leastRisk: "No significant incidents in 3+ years",
        minimalRisk: "Minor incidents, quickly contained",
        moderateRisk: "Moderate incidents requiring response plan activation",
        significantRisk: "Significant breach within past 2 years",
        mostRisk: "Major breach with regulatory action within past year",
      },
      {
        factor: "Industry threat intelligence",
        leastRisk: "Low threat to sector",
        minimalRisk: "Moderate general threats to sector",
        moderateRisk: "Active campaigns targeting community banks/CUs",
        significantRisk: "Active campaigns targeting institutions of similar size/type",
        mostRisk: "Specific institution named in threat intelligence",
      },
    ],
  },
];

export const MATURITY_DOMAINS: MaturityDomain[] = [
  {
    id: "cyber_risk_mgmt",
    name: "Cyber Risk Management and Oversight",
    description: "Board and management oversight of cybersecurity strategy and program",
    assessmentFactors: [
      {
        id: "governance",
        name: "Governance",
        components: [
          {
            id: "governance_structure",
            name: "Organizational Structure",
            declarativeStatements: {
              baseline: [
                "Information security function exists (either in-house or outsourced)",
                "Designated information security officer reports to management",
                "Responsibility for cybersecurity is assigned",
              ],
              evolving: [
                "CISO or equivalent role established with direct report to senior management",
                "Cybersecurity responsibilities clearly defined in job descriptions",
                "Cybersecurity is included in enterprise risk management framework",
              ],
              intermediate: [
                "CISO reports independently to board or board committee",
                "Cross-functional cybersecurity committee with business line representation",
                "Cybersecurity integrated into strategic planning process",
              ],
              advanced: [
                "Board has dedicated technology/cyber risk committee",
                "CISO has authority to halt initiatives that pose unacceptable cyber risk",
                "Cybersecurity metrics drive executive compensation decisions",
              ],
              innovative: [
                "Industry leadership role in cybersecurity governance standards",
                "Governance model adapts in real-time to threat landscape changes",
                "Board possesses independent cybersecurity expertise",
              ],
            },
          },
          {
            id: "board_oversight",
            name: "Board Oversight",
            declarativeStatements: {
              baseline: [
                "Board or board committee receives cybersecurity updates at least annually",
                "Board approves information security program/policy",
                "Board is informed of significant cyber events",
              ],
              evolving: [
                "Board receives quarterly cybersecurity reports with metrics",
                "Board reviews and approves risk appetite for cybersecurity",
                "Board members receive cybersecurity awareness training",
              ],
              intermediate: [
                "Board engages in cybersecurity tabletop exercises",
                "Board reviews independent assessments and audit findings",
                "Board challenges management on cybersecurity strategy",
              ],
              advanced: [
                "Board uses independent experts to evaluate cyber program effectiveness",
                "Board monitors key risk indicators and threat intelligence",
                "Board drives proactive cyber risk investment decisions",
              ],
              innovative: [
                "Board continuously evaluates emerging technologies and threats",
                "Board mentorship and knowledge sharing with peer institutions",
                "Governance frameworks published as industry reference",
              ],
            },
          },
        ],
      },
      {
        id: "risk_management",
        name: "Risk Management",
        components: [
          {
            id: "risk_assessment_process",
            name: "Risk Assessment",
            declarativeStatements: {
              baseline: [
                "Risk assessment process exists for information assets",
                "Risk assessments updated when significant changes occur",
                "Critical assets and systems identified",
              ],
              evolving: [
                "Formal risk assessment methodology documented and followed",
                "Risk assessments conducted at least annually",
                "Risk register maintained with ownership and treatment plans",
              ],
              intermediate: [
                "Quantitative risk analysis for critical assets",
                "Risk assessments integrated into change management",
                "Risk tolerance levels defined per asset classification",
              ],
              advanced: [
                "Continuous risk assessment leveraging automation",
                "Predictive risk modeling incorporating threat intelligence",
                "Risk scenarios modeled for emerging threats",
              ],
              innovative: [
                "Real-time risk scoring drives automated control adjustments",
                "AI/ML-based risk identification and prioritization",
                "Industry-leading risk quantification frameworks",
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "threat_intelligence",
    name: "Threat Intelligence and Collaboration",
    description: "Processes to discover, analyze, and understand cyber threats",
    assessmentFactors: [
      {
        id: "threat_intel_collection",
        name: "Threat Intelligence",
        components: [
          {
            id: "intel_sources",
            name: "Intelligence Sources and Integration",
            declarativeStatements: {
              baseline: [
                "Subscribes to basic threat intelligence feeds (US-CERT, FS-ISAC alerts)",
                "Processes for receiving and distributing threat information exist",
                "Staff assigned to review threat intelligence",
              ],
              evolving: [
                "Multiple threat intelligence sources actively monitored",
                "Threat intelligence incorporated into vulnerability management",
                "Automated distribution of relevant threat indicators",
              ],
              intermediate: [
                "Threat intelligence drives proactive security control adjustments",
                "Dedicated threat intelligence function or analyst",
                "Threat profiles developed for institution-specific risks",
              ],
              advanced: [
                "Advanced threat hunting program using intelligence",
                "Bi-directional information sharing with sector partners",
                "Custom threat indicators developed from internal analysis",
              ],
              innovative: [
                "Predictive threat modeling using AI and machine learning",
                "Leading contributor to sector-wide intelligence sharing",
                "Real-time automated response to threat intelligence",
              ],
            },
          },
        ],
      },
      {
        id: "collaboration",
        name: "Information Sharing",
        components: [
          {
            id: "external_collaboration",
            name: "External Collaboration",
            declarativeStatements: {
              baseline: [
                "Participates in FS-ISAC or equivalent at basic membership level",
                "Contacts established with law enforcement for cyber incidents",
                "Receives alerts from banking regulators",
              ],
              evolving: [
                "Active participant in information sharing organizations",
                "Shares indicators of compromise with trusted peers",
                "Engages with sector-specific working groups",
              ],
              intermediate: [
                "Contributes threat intelligence back to sharing communities",
                "Joint exercises with peer institutions and law enforcement",
                "Established relationships with multiple sharing partners",
              ],
              advanced: [
                "Leadership role in sector information sharing",
                "Automated bi-directional indicator sharing (STIX/TAXII)",
                "Cross-sector collaboration partnerships established",
              ],
              innovative: [
                "Drives development of new sharing frameworks and standards",
                "Public-private partnership leadership",
                "Pioneering new forms of cross-sector collaboration",
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "cybersecurity_controls",
    name: "Cybersecurity Controls",
    description: "Practices and processes to protect assets, infrastructure, and information",
    assessmentFactors: [
      {
        id: "preventative_controls",
        name: "Preventative Controls",
        components: [
          {
            id: "access_controls",
            name: "Access and Data Management",
            declarativeStatements: {
              baseline: [
                "Access controls implemented for all systems (user ID and password minimum)",
                "Access granted based on job responsibilities (least privilege)",
                "Access reviewed and revoked upon termination",
                "Sensitive data encryption at rest and in transit",
              ],
              evolving: [
                "Multi-factor authentication for privileged access and remote access",
                "Periodic access recertification (at least annually)",
                "Data classification scheme implemented and enforced",
                "Network segmentation separates critical systems",
              ],
              intermediate: [
                "MFA for all external-facing applications",
                "Privileged access management (PAM) solution implemented",
                "Data loss prevention (DLP) tools active for sensitive data",
                "Micro-segmentation for critical assets",
              ],
              advanced: [
                "Adaptive/risk-based authentication across all channels",
                "Just-in-time privileged access provisioning",
                "Advanced DLP with content inspection and machine learning",
                "Zero-trust architecture implementation in progress",
              ],
              innovative: [
                "Passwordless/continuous authentication across enterprise",
                "Fully implemented zero-trust architecture",
                "AI-driven anomaly detection on all access patterns",
                "Industry-leading data governance framework",
              ],
            },
          },
          {
            id: "infrastructure_mgmt",
            name: "Infrastructure Management",
            declarativeStatements: {
              baseline: [
                "Antivirus/anti-malware deployed on endpoints",
                "Firewall configured at network perimeter",
                "Patch management process exists with defined timelines",
                "System configurations based on vendor recommendations",
              ],
              evolving: [
                "Endpoint detection and response (EDR) on critical systems",
                "Network intrusion detection/prevention systems deployed",
                "Patch management automated with risk-based prioritization",
                "Hardened baseline configurations maintained",
              ],
              intermediate: [
                "EDR on all endpoints with 24/7 monitoring",
                "Web application firewalls protecting internet-facing applications",
                "Vulnerability scanning at least monthly with remediation SLAs",
                "Configuration management database maintained",
              ],
              advanced: [
                "Advanced threat detection using behavioral analytics",
                "Deception technology (honeypots/honeynets) deployed",
                "Automated remediation for common vulnerabilities",
                "Software-defined perimeter for critical assets",
              ],
              innovative: [
                "AI-driven security orchestration and automated response",
                "Self-healing infrastructure with automated rollback",
                "Advanced persistent threat detection through ML models",
                "Industry benchmark for infrastructure security",
              ],
            },
          },
        ],
      },
      {
        id: "detective_controls",
        name: "Detective Controls",
        components: [
          {
            id: "monitoring",
            name: "Anomalous Activity Detection",
            declarativeStatements: {
              baseline: [
                "Log collection from critical systems",
                "Alerts for known attack signatures",
                "Process for reviewing security alerts exists",
              ],
              evolving: [
                "SIEM deployed with correlation rules for key scenarios",
                "Security logs retained for minimum 1 year",
                "Dedicated personnel review alerts on business days",
              ],
              intermediate: [
                "24/7 security monitoring (SOC or managed service)",
                "User and entity behavior analytics (UEBA) implemented",
                "Automated alerting with defined escalation procedures",
              ],
              advanced: [
                "Advanced analytics with machine learning-based detection",
                "Real-time correlation across all data sources including cloud",
                "Proactive threat hunting program with defined cadence",
              ],
              innovative: [
                "Autonomous detection and response for known threat patterns",
                "Predictive detection of zero-day threats",
                "Continuous optimization of detection using adversarial testing",
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "external_dependency",
    name: "External Dependency Management",
    description: "Programs to oversee and manage third-party connections and dependencies",
    assessmentFactors: [
      {
        id: "third_party_mgmt",
        name: "Connections and Relationship Management",
        components: [
          {
            id: "vendor_oversight",
            name: "Third-Party Oversight",
            declarativeStatements: {
              baseline: [
                "Inventory of third-party service providers maintained",
                "Contracts include security requirements and right-to-audit",
                "Due diligence performed before engaging critical vendors",
              ],
              evolving: [
                "Risk-based categorization of third-party relationships",
                "Annual review of critical vendor security posture",
                "Incident notification requirements in contracts",
              ],
              intermediate: [
                "Continuous monitoring of critical vendor security posture",
                "Fourth-party (subcontractor) risk evaluated",
                "Vendor security assessments include onsite evaluations",
              ],
              advanced: [
                "Real-time monitoring of vendor security indicators",
                "Contractual performance metrics with security KPIs",
                "Joint incident response exercises with critical vendors",
              ],
              innovative: [
                "Automated vendor risk scoring with dynamic adjustments",
                "Industry-leading vendor management framework shared as model",
                "Collaborative security improvement programs with vendors",
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "incident_resilience",
    name: "Cyber Incident Management and Resilience",
    description: "Programs to respond, contain, and recover from cyber incidents",
    assessmentFactors: [
      {
        id: "incident_response",
        name: "Incident Response",
        components: [
          {
            id: "planning_strategy",
            name: "Planning and Strategy",
            declarativeStatements: {
              baseline: [
                "Written incident response plan exists",
                "Roles and responsibilities defined for incident response",
                "Contact information for key personnel and external parties maintained",
                "Plan addresses regulatory notification requirements",
              ],
              evolving: [
                "Incident response plan tested at least annually (tabletop)",
                "Incident classification and severity levels defined",
                "Communication templates prepared for various scenarios",
                "Forensic investigation capability (internal or contracted)",
              ],
              intermediate: [
                "Technical incident response exercises conducted",
                "Lessons learned from incidents drive plan improvements",
                "Automated containment procedures for common scenarios",
                "Metrics track incident detection-to-containment time",
              ],
              advanced: [
                "Orchestrated response playbooks for all critical scenarios",
                "Full-scale simulations including executive crisis management",
                "Intelligence-driven incident response procedures",
                "Sector-wide exercises with peer participation",
              ],
              innovative: [
                "Automated response and self-healing for known attack patterns",
                "Predictive incident modeling prevents incidents before occurrence",
                "Industry leadership in incident response methodology",
                "Published case studies drive sector-wide improvement",
              ],
            },
          },
          {
            id: "resilience",
            name: "Cyber Resilience",
            declarativeStatements: {
              baseline: [
                "Business continuity plan addresses cyber events",
                "Data backup procedures implemented and tested",
                "Recovery time and point objectives defined for critical systems",
              ],
              evolving: [
                "Disaster recovery testing includes cyber scenarios",
                "Backup integrity verified regularly",
                "Alternative processing capabilities identified",
              ],
              intermediate: [
                "Cyber resilience testing at least annually",
                "Immutable backups protect against ransomware",
                "Recovery procedures tested to meet RTOs/RPOs",
              ],
              advanced: [
                "Continuous resilience validation through chaos engineering",
                "Automated failover for critical systems",
                "Recovery procedures tested against sophisticated attack scenarios",
              ],
              innovative: [
                "Zero-downtime recovery capability for all critical functions",
                "Self-healing architecture eliminates single points of failure",
                "Industry benchmark for cyber resilience",
              ],
            },
          },
        ],
      },
    ],
  },
];

export const RISK_MATURITY_MAPPING: RiskMaturityMapping[] = [
  {
    inherentRiskLevel: "least",
    minimumExpectedMaturity: "baseline",
    description: "Institutions with least inherent risk should, at minimum, achieve Baseline maturity across all domains",
  },
  {
    inherentRiskLevel: "minimal",
    minimumExpectedMaturity: "baseline",
    description: "Institutions with minimal inherent risk should achieve Baseline maturity, with progression toward Evolving in key areas",
  },
  {
    inherentRiskLevel: "moderate",
    minimumExpectedMaturity: "evolving",
    description: "Institutions with moderate inherent risk should achieve at least Evolving maturity across all domains",
  },
  {
    inherentRiskLevel: "significant",
    minimumExpectedMaturity: "intermediate",
    description: "Institutions with significant inherent risk should achieve at least Intermediate maturity across all domains",
  },
  {
    inherentRiskLevel: "most",
    minimumExpectedMaturity: "advanced",
    description: "Institutions with most inherent risk should achieve at least Advanced maturity across all domains",
  },
];

export const MATURITY_LEVEL_ORDER: MaturityLevel[] = ["baseline", "evolving", "intermediate", "advanced", "innovative"];
export const INHERENT_RISK_ORDER: InherentRiskLevel[] = ["least", "minimal", "moderate", "significant", "most"];
