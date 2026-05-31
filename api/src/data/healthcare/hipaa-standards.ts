/**
 * HIPAA Security Rule Standards — 45 CFR Part 164 Subpart C
 * Complete structured data for all Administrative, Physical, and Technical Safeguards
 */

export interface HIPAAStandard {
  section: string;
  title: string;
  category: "administrative" | "physical" | "technical" | "organizational" | "policies";
  requiredOrAddressable: "required" | "addressable";
  requirementText: string;
  implementationSpecs: HIPAAImplementationSpec[];
}

export interface HIPAAImplementationSpec {
  specId: string;
  title: string;
  requiredOrAddressable: "required" | "addressable";
  description: string;
}

// =====================================================================
// ADMINISTRATIVE SAFEGUARDS — 45 CFR 164.308
// =====================================================================

export const ADMINISTRATIVE_SAFEGUARDS: HIPAAStandard[] = [
  {
    section: "164.308(a)(1)",
    title: "Security Management Process",
    category: "administrative",
    requiredOrAddressable: "required",
    requirementText: "Implement policies and procedures to prevent, detect, contain, and correct security violations.",
    implementationSpecs: [
      {
        specId: "164.308(a)(1)(ii)(A)",
        title: "Risk Analysis",
        requiredOrAddressable: "required",
        description: "Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of electronic protected health information held by the covered entity or business associate.",
      },
      {
        specId: "164.308(a)(1)(ii)(B)",
        title: "Risk Management",
        requiredOrAddressable: "required",
        description: "Implement security measures sufficient to reduce risks and vulnerabilities to a reasonable and appropriate level to comply with 164.306(a).",
      },
      {
        specId: "164.308(a)(1)(ii)(C)",
        title: "Sanction Policy",
        requiredOrAddressable: "required",
        description: "Apply appropriate sanctions against workforce members who fail to comply with the security policies and procedures of the covered entity or business associate.",
      },
      {
        specId: "164.308(a)(1)(ii)(D)",
        title: "Information System Activity Review",
        requiredOrAddressable: "required",
        description: "Implement procedures to regularly review records of information system activity, such as audit logs, access reports, and security incident tracking reports.",
      },
    ],
  },
  {
    section: "164.308(a)(2)",
    title: "Assigned Security Responsibility",
    category: "administrative",
    requiredOrAddressable: "required",
    requirementText: "Identify the security official who is responsible for the development and implementation of the policies and procedures required by this subpart for the covered entity or business associate.",
    implementationSpecs: [],
  },
  {
    section: "164.308(a)(3)",
    title: "Workforce Security",
    category: "administrative",
    requiredOrAddressable: "required",
    requirementText: "Implement policies and procedures to ensure that all members of its workforce have appropriate access to electronic protected health information, as provided under paragraph (a)(4) of this section, and to prevent those workforce members who do not have access under paragraph (a)(4) of this section from obtaining access to electronic protected health information.",
    implementationSpecs: [
      {
        specId: "164.308(a)(3)(ii)(A)",
        title: "Authorization and/or Supervision",
        requiredOrAddressable: "addressable",
        description: "Implement procedures for the authorization and/or supervision of workforce members who work with electronic protected health information or in locations where it might be accessed.",
      },
      {
        specId: "164.308(a)(3)(ii)(B)",
        title: "Workforce Clearance Procedure",
        requiredOrAddressable: "addressable",
        description: "Implement procedures to determine that the access of a workforce member to electronic protected health information is appropriate.",
      },
      {
        specId: "164.308(a)(3)(ii)(C)",
        title: "Termination Procedures",
        requiredOrAddressable: "addressable",
        description: "Implement procedures for terminating access to electronic protected health information when the employment of, or other arrangement with, a workforce member ends or as required by determinations made as specified in paragraph (a)(3)(ii)(B) of this section.",
      },
    ],
  },
  {
    section: "164.308(a)(4)",
    title: "Information Access Management",
    category: "administrative",
    requiredOrAddressable: "required",
    requirementText: "Implement policies and procedures for authorizing access to electronic protected health information that are consistent with the applicable requirements of subpart E of this part.",
    implementationSpecs: [
      {
        specId: "164.308(a)(4)(ii)(A)",
        title: "Isolating Health Care Clearinghouse Functions",
        requiredOrAddressable: "required",
        description: "If a health care clearinghouse is part of a larger organization, the clearinghouse must implement policies and procedures that protect the electronic protected health information of the clearinghouse from unauthorized access by the larger organization.",
      },
      {
        specId: "164.308(a)(4)(ii)(B)",
        title: "Access Authorization",
        requiredOrAddressable: "addressable",
        description: "Implement policies and procedures for granting access to electronic protected health information, for example, through access to a workstation, transaction, program, process, or other mechanism.",
      },
      {
        specId: "164.308(a)(4)(ii)(C)",
        title: "Access Establishment and Modification",
        requiredOrAddressable: "addressable",
        description: "Implement policies and procedures that, based upon the covered entity's or the business associate's access authorization policies, establish, document, review, and modify a user's right of access to a workstation, transaction, program, or process.",
      },
    ],
  },
  {
    section: "164.308(a)(5)",
    title: "Security Awareness and Training",
    category: "administrative",
    requiredOrAddressable: "required",
    requirementText: "Implement a security awareness and training program for all members of its workforce (including management).",
    implementationSpecs: [
      {
        specId: "164.308(a)(5)(ii)(A)",
        title: "Security Reminders",
        requiredOrAddressable: "addressable",
        description: "Periodic security updates.",
      },
      {
        specId: "164.308(a)(5)(ii)(B)",
        title: "Protection from Malicious Software",
        requiredOrAddressable: "addressable",
        description: "Procedures for guarding against, detecting, and reporting malicious software.",
      },
      {
        specId: "164.308(a)(5)(ii)(C)",
        title: "Log-in Monitoring",
        requiredOrAddressable: "addressable",
        description: "Procedures for monitoring log-in attempts and reporting discrepancies.",
      },
      {
        specId: "164.308(a)(5)(ii)(D)",
        title: "Password Management",
        requiredOrAddressable: "addressable",
        description: "Procedures for creating, changing, and safeguarding passwords.",
      },
    ],
  },
  {
    section: "164.308(a)(6)",
    title: "Security Incident Procedures",
    category: "administrative",
    requiredOrAddressable: "required",
    requirementText: "Implement policies and procedures to address security incidents.",
    implementationSpecs: [
      {
        specId: "164.308(a)(6)(ii)",
        title: "Response and Reporting",
        requiredOrAddressable: "required",
        description: "Identify and respond to suspected or known security incidents; mitigate, to the extent practicable, harmful effects of security incidents that are known to the covered entity or business associate; and document security incidents and their outcomes.",
      },
    ],
  },
  {
    section: "164.308(a)(7)",
    title: "Contingency Plan",
    category: "administrative",
    requiredOrAddressable: "required",
    requirementText: "Establish (and implement as needed) policies and procedures for responding to an emergency or other occurrence (for example, fire, vandalism, system failure, and natural disaster) that damages systems that contain electronic protected health information.",
    implementationSpecs: [
      {
        specId: "164.308(a)(7)(ii)(A)",
        title: "Data Backup Plan",
        requiredOrAddressable: "required",
        description: "Establish and implement procedures to create and maintain retrievable exact copies of electronic protected health information.",
      },
      {
        specId: "164.308(a)(7)(ii)(B)",
        title: "Disaster Recovery Plan",
        requiredOrAddressable: "required",
        description: "Establish (and implement as needed) procedures to restore any loss of data.",
      },
      {
        specId: "164.308(a)(7)(ii)(C)",
        title: "Emergency Mode Operation Plan",
        requiredOrAddressable: "required",
        description: "Establish (and implement as needed) procedures to enable continuation of critical business processes for protection of the security of electronic protected health information while operating in emergency mode.",
      },
      {
        specId: "164.308(a)(7)(ii)(D)",
        title: "Testing and Revision Procedures",
        requiredOrAddressable: "addressable",
        description: "Implement procedures for periodic testing and revision of contingency plans.",
      },
      {
        specId: "164.308(a)(7)(ii)(E)",
        title: "Applications and Data Criticality Analysis",
        requiredOrAddressable: "addressable",
        description: "Assess the relative criticality of specific applications and data in support of other contingency plan components.",
      },
    ],
  },
  {
    section: "164.308(a)(8)",
    title: "Evaluation",
    category: "administrative",
    requiredOrAddressable: "required",
    requirementText: "Perform a periodic technical and nontechnical evaluation, based initially upon the standards implemented under this rule and, subsequently, in response to environmental or operational changes affecting the security of electronic protected health information, that establishes the extent to which a covered entity's or business associate's security policies and procedures meet the requirements of this subpart.",
    implementationSpecs: [],
  },
  {
    section: "164.308(b)(1)",
    title: "Business Associate Contracts and Other Arrangements",
    category: "administrative",
    requiredOrAddressable: "required",
    requirementText: "A covered entity may permit a business associate to create, receive, maintain, or transmit electronic protected health information on the covered entity's behalf only if the covered entity obtains satisfactory assurances, in accordance with 164.314(a), that the business associate will appropriately safeguard the information. A covered entity is not required to obtain such satisfactory assurances from a business associate that is a subcontractor.",
    implementationSpecs: [
      {
        specId: "164.308(b)(4)",
        title: "Written Contract or Other Arrangement",
        requiredOrAddressable: "required",
        description: "Document the satisfactory assurances required by paragraph (b)(1) of this section through a written contract or other arrangement with the business associate that meets the applicable requirements of 164.314(a).",
      },
    ],
  },
];

// =====================================================================
// PHYSICAL SAFEGUARDS — 45 CFR 164.310
// =====================================================================

export const PHYSICAL_SAFEGUARDS: HIPAAStandard[] = [
  {
    section: "164.310(a)(1)",
    title: "Facility Access Controls",
    category: "physical",
    requiredOrAddressable: "required",
    requirementText: "Implement policies and procedures to limit physical access to its electronic information systems and the facility or facilities in which they are housed, while ensuring that properly authorized access is allowed.",
    implementationSpecs: [
      {
        specId: "164.310(a)(2)(i)",
        title: "Contingency Operations",
        requiredOrAddressable: "addressable",
        description: "Establish (and implement as needed) procedures that allow facility access in support of restoration of lost data under the disaster recovery plan and emergency mode operations plan in the event of an emergency.",
      },
      {
        specId: "164.310(a)(2)(ii)",
        title: "Facility Security Plan",
        requiredOrAddressable: "addressable",
        description: "Implement policies and procedures to safeguard the facility and the equipment therein from unauthorized physical access, tampering, and theft.",
      },
      {
        specId: "164.310(a)(2)(iii)",
        title: "Access Control and Validation Procedures",
        requiredOrAddressable: "addressable",
        description: "Implement procedures to control and validate a person's access to facilities based on their role or function, including visitor control, and control of access to software programs for testing and revision.",
      },
      {
        specId: "164.310(a)(2)(iv)",
        title: "Maintenance Records",
        requiredOrAddressable: "addressable",
        description: "Implement policies and procedures to document repairs and modifications to the physical components of a facility which are related to security (for example, hardware, walls, doors, and locks).",
      },
    ],
  },
  {
    section: "164.310(b)",
    title: "Workstation Use",
    category: "physical",
    requiredOrAddressable: "required",
    requirementText: "Implement policies and procedures that specify the proper functions to be performed, the manner in which those functions are to be performed, and the physical attributes of the surroundings of a specific workstation or class of workstation that can access electronic protected health information.",
    implementationSpecs: [],
  },
  {
    section: "164.310(c)",
    title: "Workstation Security",
    category: "physical",
    requiredOrAddressable: "required",
    requirementText: "Implement physical safeguards for all workstations that access electronic protected health information, to restrict access to authorized users.",
    implementationSpecs: [],
  },
  {
    section: "164.310(d)(1)",
    title: "Device and Media Controls",
    category: "physical",
    requiredOrAddressable: "required",
    requirementText: "Implement policies and procedures that govern the receipt and removal of hardware and electronic media that contain electronic protected health information into and out of a facility, and the movement of these items within the facility.",
    implementationSpecs: [
      {
        specId: "164.310(d)(2)(i)",
        title: "Disposal",
        requiredOrAddressable: "required",
        description: "Implement policies and procedures to address the final disposition of electronic protected health information, and/or the hardware or electronic media on which it is stored.",
      },
      {
        specId: "164.310(d)(2)(ii)",
        title: "Media Re-use",
        requiredOrAddressable: "required",
        description: "Implement procedures for removal of electronic protected health information from electronic media before the media are made available for re-use.",
      },
      {
        specId: "164.310(d)(2)(iii)",
        title: "Accountability",
        requiredOrAddressable: "addressable",
        description: "Maintain a record of the movements of hardware and electronic media and any person responsible therefore.",
      },
      {
        specId: "164.310(d)(2)(iv)",
        title: "Data Backup and Storage",
        requiredOrAddressable: "addressable",
        description: "Create a retrievable, exact copy of electronic protected health information, when needed, before movement of equipment.",
      },
    ],
  },
];

// =====================================================================
// TECHNICAL SAFEGUARDS — 45 CFR 164.312
// =====================================================================

export const TECHNICAL_SAFEGUARDS: HIPAAStandard[] = [
  {
    section: "164.312(a)(1)",
    title: "Access Control",
    category: "technical",
    requiredOrAddressable: "required",
    requirementText: "Implement technical policies and procedures for electronic information systems that maintain electronic protected health information to allow access only to those persons or software programs that have been granted access rights as specified in 164.308(a)(4).",
    implementationSpecs: [
      {
        specId: "164.312(a)(2)(i)",
        title: "Unique User Identification",
        requiredOrAddressable: "required",
        description: "Assign a unique name and/or number for identifying and tracking user identity.",
      },
      {
        specId: "164.312(a)(2)(ii)",
        title: "Emergency Access Procedure",
        requiredOrAddressable: "required",
        description: "Establish (and implement as needed) procedures for obtaining necessary electronic protected health information during an emergency.",
      },
      {
        specId: "164.312(a)(2)(iii)",
        title: "Automatic Logoff",
        requiredOrAddressable: "addressable",
        description: "Implement electronic procedures that terminate an electronic session after a predetermined time of inactivity.",
      },
      {
        specId: "164.312(a)(2)(iv)",
        title: "Encryption and Decryption",
        requiredOrAddressable: "addressable",
        description: "Implement a mechanism to encrypt and decrypt electronic protected health information.",
      },
    ],
  },
  {
    section: "164.312(b)",
    title: "Audit Controls",
    category: "technical",
    requiredOrAddressable: "required",
    requirementText: "Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information.",
    implementationSpecs: [],
  },
  {
    section: "164.312(c)(1)",
    title: "Integrity",
    category: "technical",
    requiredOrAddressable: "required",
    requirementText: "Implement policies and procedures to protect electronic protected health information from improper alteration or destruction.",
    implementationSpecs: [
      {
        specId: "164.312(c)(2)",
        title: "Mechanism to Authenticate Electronic Protected Health Information",
        requiredOrAddressable: "addressable",
        description: "Implement electronic mechanisms to corroborate that electronic protected health information has not been altered or destroyed in an unauthorized manner.",
      },
    ],
  },
  {
    section: "164.312(d)",
    title: "Person or Entity Authentication",
    category: "technical",
    requiredOrAddressable: "required",
    requirementText: "Implement procedures to verify that a person or entity seeking access to electronic protected health information is the one claimed.",
    implementationSpecs: [],
  },
  {
    section: "164.312(e)(1)",
    title: "Transmission Security",
    category: "technical",
    requiredOrAddressable: "required",
    requirementText: "Implement technical security measures to guard against unauthorized access to electronic protected health information that is being transmitted over an electronic communications network.",
    implementationSpecs: [
      {
        specId: "164.312(e)(2)(i)",
        title: "Integrity Controls",
        requiredOrAddressable: "addressable",
        description: "Implement security measures to ensure that electronically transmitted electronic protected health information is not improperly modified without detection until disposed of.",
      },
      {
        specId: "164.312(e)(2)(ii)",
        title: "Encryption",
        requiredOrAddressable: "addressable",
        description: "Implement a mechanism to encrypt electronic protected health information whenever deemed appropriate.",
      },
    ],
  },
];

// =====================================================================
// ORGANIZATIONAL REQUIREMENTS — 45 CFR 164.314
// =====================================================================

export const ORGANIZATIONAL_REQUIREMENTS: HIPAAStandard[] = [
  {
    section: "164.314(a)(1)",
    title: "Business Associate Contracts or Other Arrangements",
    category: "organizational",
    requiredOrAddressable: "required",
    requirementText: "The contract or other arrangement between the covered entity and its business associate required by 164.308(b)(4) must meet the requirements of paragraph (a)(2)(i), (a)(2)(ii), or (a)(2)(iii) of this section, as applicable.",
    implementationSpecs: [
      {
        specId: "164.314(a)(2)(i)",
        title: "Business Associate Contracts",
        requiredOrAddressable: "required",
        description: "The contract must provide that the business associate will: implement administrative, physical, and technical safeguards; ensure any agent/subcontractor agrees to same restrictions; report any security incident; authorize termination if BA violates a material term.",
      },
      {
        specId: "164.314(a)(2)(ii)",
        title: "Other Arrangements",
        requiredOrAddressable: "required",
        description: "When a covered entity and its business associate are both governmental entities, the covered entity may comply through a memorandum of understanding.",
      },
    ],
  },
  {
    section: "164.314(b)(1)",
    title: "Requirements for Group Health Plans",
    category: "organizational",
    requiredOrAddressable: "required",
    requirementText: "Except when the only electronic protected health information disclosed to a plan sponsor is disclosed pursuant to 164.504(f)(1)(ii) or (iii), or as authorized under 164.508, a group health plan must ensure that its plan documents provide that the plan sponsor will reasonably and appropriately safeguard electronic protected health information created, received, maintained, or transmitted to or by the plan sponsor on behalf of the group health plan.",
    implementationSpecs: [
      {
        specId: "164.314(b)(2)",
        title: "Implementation Specifications",
        requiredOrAddressable: "required",
        description: "The plan documents of the group health plan must be amended to incorporate provisions to: implement administrative, physical, and technical safeguards; ensure adequate separation; ensure agents/subcontractors agree to same; report any security incident; and ensure return/destruction of ePHI when no longer needed.",
      },
    ],
  },
];

// =====================================================================
// POLICIES, PROCEDURES, AND DOCUMENTATION — 45 CFR 164.316
// =====================================================================

export const POLICIES_AND_PROCEDURES: HIPAAStandard[] = [
  {
    section: "164.316(a)",
    title: "Policies and Procedures",
    category: "policies",
    requiredOrAddressable: "required",
    requirementText: "Implement reasonable and appropriate policies and procedures to comply with the standards, implementation specifications, or other requirements of this subpart, taking into account those factors specified in 164.306(b)(2)(i), (ii), (iii), and (iv). This standard is not to be construed to permit or excuse an action that violates any other standard, implementation specification, or other requirements of this subpart. A covered entity or business associate may change its policies and procedures at any time, provided that the changes are documented and are implemented in accordance with this subpart.",
    implementationSpecs: [],
  },
  {
    section: "164.316(b)(1)",
    title: "Documentation",
    category: "policies",
    requiredOrAddressable: "required",
    requirementText: "Maintain the policies and procedures implemented to comply with this subpart in written (which may be electronic) form; and if an action, activity or assessment is required by this subpart to be documented, maintain a written (which may be electronic) record of the action, activity, or assessment.",
    implementationSpecs: [
      {
        specId: "164.316(b)(2)(i)",
        title: "Time Limit",
        requiredOrAddressable: "required",
        description: "Retain the documentation required by paragraph (b)(1) of this section for 6 years from the date of its creation or the date when it last was in effect, whichever is later.",
      },
      {
        specId: "164.316(b)(2)(ii)",
        title: "Availability",
        requiredOrAddressable: "required",
        description: "Make documentation available to those persons responsible for implementing the procedures to which the documentation pertains.",
      },
      {
        specId: "164.316(b)(2)(iii)",
        title: "Updates",
        requiredOrAddressable: "required",
        description: "Review documentation periodically, and update as needed, in response to environmental or operational changes affecting the security of the electronic protected health information.",
      },
    ],
  },
];

// =====================================================================
// Combined export
// =====================================================================

export const ALL_HIPAA_STANDARDS: HIPAAStandard[] = [
  ...ADMINISTRATIVE_SAFEGUARDS,
  ...PHYSICAL_SAFEGUARDS,
  ...TECHNICAL_SAFEGUARDS,
  ...ORGANIZATIONAL_REQUIREMENTS,
  ...POLICIES_AND_PROCEDURES,
];

export function getHIPAAStandardsByCategory(category: HIPAAStandard["category"]): HIPAAStandard[] {
  return ALL_HIPAA_STANDARDS.filter((s) => s.category === category);
}

export function getHIPAAStandardBySection(section: string): HIPAAStandard | undefined {
  return ALL_HIPAA_STANDARDS.find((s) => s.section === section);
}

export function getAllImplementationSpecs(): HIPAAImplementationSpec[] {
  return ALL_HIPAA_STANDARDS.flatMap((s) => s.implementationSpecs);
}

export function getRequiredSpecs(): HIPAAImplementationSpec[] {
  return getAllImplementationSpecs().filter((s) => s.requiredOrAddressable === "required");
}

export function getAddressableSpecs(): HIPAAImplementationSpec[] {
  return getAllImplementationSpecs().filter((s) => s.requiredOrAddressable === "addressable");
}
