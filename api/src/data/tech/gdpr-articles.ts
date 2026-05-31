/**
 * GDPR (General Data Protection Regulation) — Key Articles
 * Regulation (EU) 2016/679
 */

export interface GdprArticle {
  number: number;
  title: string;
  chapter: GdprChapter;
  summary: string;
  requirements: string[];
}

export type GdprChapter =
  | "Principles"
  | "Data Subject Rights"
  | "Controller and Processor"
  | "International Transfers";

export const GDPR_ARTICLES: GdprArticle[] = [
  // ===== CHAPTER II: PRINCIPLES (Articles 5-11) =====
  {
    number: 5,
    title: "Principles relating to processing of personal data",
    chapter: "Principles",
    summary: "Establishes the core principles that govern all personal data processing activities.",
    requirements: [
      "Lawfulness, fairness, and transparency — data must be processed lawfully, fairly, and in a transparent manner",
      "Purpose limitation — data collected for specified, explicit, and legitimate purposes and not further processed incompatibly",
      "Data minimisation — data must be adequate, relevant, and limited to what is necessary",
      "Accuracy — data must be accurate and, where necessary, kept up to date",
      "Storage limitation — data kept in identifiable form no longer than necessary for the purposes",
      "Integrity and confidentiality — processed with appropriate security including protection against unauthorized or unlawful processing, accidental loss, destruction, or damage",
      "Accountability — the controller is responsible for and must be able to demonstrate compliance with these principles",
    ],
  },
  {
    number: 6,
    title: "Lawfulness of processing",
    chapter: "Principles",
    summary: "Defines the six legal bases for processing personal data.",
    requirements: [
      "Consent — the data subject has given consent to the processing for one or more specific purposes",
      "Contract — processing is necessary for performance of a contract to which the data subject is party",
      "Legal obligation — processing is necessary for compliance with a legal obligation to which the controller is subject",
      "Vital interests — processing is necessary to protect vital interests of the data subject or another natural person",
      "Public interest — processing is necessary for performance of a task carried out in the public interest or in exercise of official authority",
      "Legitimate interests — processing is necessary for the purposes of the legitimate interests pursued by the controller or a third party, except where overridden by the interests of the data subject",
    ],
  },
  {
    number: 7,
    title: "Conditions for consent",
    chapter: "Principles",
    summary: "Sets requirements for valid consent as a legal basis for processing.",
    requirements: [
      "Controller must demonstrate that the data subject has consented to processing",
      "Request for consent must be clearly distinguishable from other matters, in an intelligible and easily accessible form, using clear and plain language",
      "Data subject has the right to withdraw consent at any time — must be as easy to withdraw as to give",
      "When assessing whether consent is freely given, account shall be taken of whether performance of a contract is conditional on consent to processing not necessary for that contract",
    ],
  },
  {
    number: 8,
    title: "Conditions applicable to child's consent in relation to information society services",
    chapter: "Principles",
    summary: "Establishes age-based consent requirements for children's data in digital services.",
    requirements: [
      "Where consent applies to offering information society services directly to a child, processing is lawful where the child is at least 16 years old",
      "Member States may provide for a lower age provided it is not below 13 years",
      "Where the child is below the applicable age, processing is lawful only if consent is given or authorized by the holder of parental responsibility",
      "The controller shall make reasonable efforts to verify parental consent, taking into consideration available technology",
    ],
  },
  {
    number: 9,
    title: "Processing of special categories of personal data",
    chapter: "Principles",
    summary: "Prohibits processing of sensitive data unless specific exceptions apply.",
    requirements: [
      "Processing of racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data, health data, or sex life/orientation is prohibited unless an exception applies",
      "Exceptions include: explicit consent, employment/social security obligations, vital interests, legitimate activities by bodies with political/philosophical/religious/trade union aims, data manifestly made public, legal claims, substantial public interest, health/social care purposes, public health, archiving/research/statistics",
      "Member States may maintain or introduce further conditions including limitations with regard to processing of genetic data, biometric data, or health data",
    ],
  },
  {
    number: 10,
    title: "Processing of personal data relating to criminal convictions and offences",
    chapter: "Principles",
    summary: "Restricts processing of criminal records data to authorized bodies.",
    requirements: [
      "Processing relating to criminal convictions and offences or related security measures shall be carried out only under the control of official authority",
      "Or when processing is authorized by Union or Member State law providing for appropriate safeguards for the rights and freedoms of data subjects",
      "Any comprehensive register of criminal convictions shall be kept only under the control of official authority",
    ],
  },
  {
    number: 11,
    title: "Processing which does not require identification",
    chapter: "Principles",
    summary: "Addresses situations where the controller does not need to identify the data subject.",
    requirements: [
      "If the purposes for which a controller processes personal data do not require identification of a data subject, the controller is not obliged to maintain or process additional information to identify the data subject",
      "Where the controller can demonstrate it is not in a position to identify the data subject, the controller shall inform the data subject accordingly if possible",
      "Articles 15-20 (data subject rights) shall not apply where the controller demonstrates it cannot identify the data subject, except where the data subject provides additional information enabling identification",
    ],
  },
  // ===== CHAPTER III: RIGHTS OF THE DATA SUBJECT (Articles 12-23) =====
  {
    number: 12,
    title: "Transparent information, communication, and modalities for exercise of rights",
    chapter: "Data Subject Rights",
    summary: "Establishes the manner in which controllers must communicate with data subjects about their rights.",
    requirements: [
      "Information provided in a concise, transparent, intelligible, and easily accessible form using clear and plain language",
      "Information provided in writing, or by other means including electronic means; verbally when requested if identity is proven",
      "Controller shall facilitate the exercise of data subject rights",
      "Information on action taken on a request must be provided without undue delay and within one month (extendable to three months for complex requests)",
      "If not taking action, controller must inform data subject within one month of reasons and right to lodge complaint",
      "Information and communications provided free of charge; controller may charge reasonable fee or refuse to act for manifestly unfounded or excessive requests",
    ],
  },
  {
    number: 13,
    title: "Information to be provided where personal data are collected from the data subject",
    chapter: "Data Subject Rights",
    summary: "Requires specific information to be provided at the time of direct data collection.",
    requirements: [
      "Identity and contact details of the controller (and DPO where applicable)",
      "Purposes of processing and legal basis",
      "Legitimate interests pursued by the controller or third party (where applicable)",
      "Recipients or categories of recipients of the personal data",
      "Details of transfers to third countries, including safeguards",
      "Retention period or criteria used to determine that period",
      "Existence of data subject rights (access, rectification, erasure, restriction, objection, portability)",
      "Right to withdraw consent at any time (where consent is the legal basis)",
      "Right to lodge a complaint with a supervisory authority",
      "Whether provision of personal data is statutory/contractual requirement and consequences of failure to provide",
      "Existence of automated decision-making including profiling, with meaningful information about the logic involved",
    ],
  },
  {
    number: 14,
    title: "Information to be provided where personal data have not been obtained from the data subject",
    chapter: "Data Subject Rights",
    summary: "Requires specific information to be provided when data is obtained from third-party sources.",
    requirements: [
      "All items required under Article 13 must be provided",
      "Additionally: the categories of personal data concerned",
      "Additionally: from which source the personal data originate, and whether it came from publicly accessible sources",
      "Information must be provided within a reasonable period (at most within one month) or at the time of first communication or first disclosure to another recipient",
      "Exemptions: where data subject already has the information, where provision is impossible or would involve disproportionate effort, where obtaining is expressly laid down by law, or where data must remain confidential under professional secrecy",
    ],
  },
  {
    number: 15,
    title: "Right of access by the data subject",
    chapter: "Data Subject Rights",
    summary: "Grants data subjects the right to obtain confirmation of processing and access to their personal data.",
    requirements: [
      "Right to obtain confirmation of whether personal data is being processed",
      "Access to the personal data and information including: purposes, categories of data, recipients, retention period, existence of rights, source of data, automated decision-making",
      "Right to obtain a copy of the personal data undergoing processing (first copy free, reasonable fee for further copies)",
      "Where data is transferred to a third country, right to be informed of the appropriate safeguards",
      "Right to access shall not adversely affect rights and freedoms of others (trade secrets, intellectual property, etc.)",
    ],
  },
  {
    number: 16,
    title: "Right to rectification",
    chapter: "Data Subject Rights",
    summary: "Grants data subjects the right to correct inaccurate personal data.",
    requirements: [
      "Right to obtain rectification of inaccurate personal data without undue delay",
      "Right to have incomplete personal data completed, including by means of a supplementary statement",
    ],
  },
  {
    number: 17,
    title: "Right to erasure ('right to be forgotten')",
    chapter: "Data Subject Rights",
    summary: "Grants data subjects the right to have their personal data erased in certain circumstances.",
    requirements: [
      "Right to erasure where: data no longer necessary for purpose collected, consent withdrawn and no other legal ground, data subject objects and no overriding legitimate grounds, data unlawfully processed, erasure required by law, data collected in relation to information society services offered to children",
      "Where the controller has made data public, reasonable steps (including technical measures) to inform other controllers of the erasure request",
      "Does not apply where processing is necessary for: freedom of expression, legal obligation, public health, archiving/research/statistics, or legal claims",
    ],
  },
  {
    number: 18,
    title: "Right to restriction of processing",
    chapter: "Data Subject Rights",
    summary: "Grants data subjects the right to restrict processing in certain circumstances.",
    requirements: [
      "Right to restriction where: accuracy is contested (for period allowing verification), processing is unlawful but data subject opposes erasure, controller no longer needs data but data subject requires it for legal claims, data subject has objected pending verification of overriding grounds",
      "Where restriction is obtained, data shall only be processed with consent or for legal claims, protection of another person's rights, or important public interest",
      "Controller must inform data subject before restriction is lifted",
    ],
  },
  {
    number: 19,
    title: "Notification obligation regarding rectification or erasure of personal data or restriction of processing",
    chapter: "Data Subject Rights",
    summary: "Requires controllers to notify recipients of any rectification, erasure, or restriction.",
    requirements: [
      "Controller shall communicate any rectification, erasure, or restriction to each recipient to whom the personal data has been disclosed, unless this proves impossible or involves disproportionate effort",
      "Controller shall inform the data subject about those recipients if the data subject requests it",
    ],
  },
  {
    number: 20,
    title: "Right to data portability",
    chapter: "Data Subject Rights",
    summary: "Grants data subjects the right to receive their data in a machine-readable format and transmit it to another controller.",
    requirements: [
      "Right to receive personal data in a structured, commonly used, and machine-readable format",
      "Right to transmit that data to another controller without hindrance",
      "Applies where processing is based on consent or contract AND processing is carried out by automated means",
      "Right to have data transmitted directly from one controller to another, where technically feasible",
      "Shall not adversely affect the rights and freedoms of others",
    ],
  },
  {
    number: 21,
    title: "Right to object",
    chapter: "Data Subject Rights",
    summary: "Grants data subjects the right to object to processing based on legitimate interests or public interest.",
    requirements: [
      "Right to object at any time to processing based on public interest or legitimate interests, including profiling",
      "Controller shall no longer process unless it demonstrates compelling legitimate grounds overriding interests/rights/freedoms of data subject, or for legal claims",
      "Where data is processed for direct marketing, data subject has the right to object at any time — controller must cease processing for that purpose",
      "Right to object must be explicitly brought to attention of data subject at latest at time of first communication, presented clearly and separately",
      "In the context of information society services, the data subject may exercise the right by automated means using technical specifications",
    ],
  },
  {
    number: 22,
    title: "Automated individual decision-making, including profiling",
    chapter: "Data Subject Rights",
    summary: "Grants data subjects protections against decisions based solely on automated processing.",
    requirements: [
      "Right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or similarly significantly affects the data subject",
      "Does not apply if decision is: necessary for a contract, authorized by law with suitable safeguards, or based on explicit consent",
      "In cases of contract or consent, the controller must implement suitable measures to safeguard the data subject's rights, freedoms, and legitimate interests, at least the right to obtain human intervention, express their point of view, and contest the decision",
      "Decisions shall not be based on special categories of data unless explicit consent or substantial public interest applies, with suitable safeguards",
    ],
  },
  {
    number: 23,
    title: "Restrictions",
    chapter: "Data Subject Rights",
    summary: "Allows Member States to restrict data subject rights in certain circumstances through legislative measures.",
    requirements: [
      "Union or Member State law may restrict the scope of obligations and rights in Articles 12-22 and Article 34 as well as Article 5",
      "Restriction must respect the essence of fundamental rights and be a necessary and proportionate measure to safeguard: national security, defence, public security, prevention/detection/prosecution of criminal offences, other important public interest objectives, protection of judicial independence, enforcement of civil law claims, protection of the data subject or rights of others, important economic or financial interest of the Union or Member State",
      "Legislative measures must contain specific provisions (purposes, categories of data, scope of restrictions, safeguards, storage periods, risks to rights and freedoms)",
    ],
  },
  // ===== CHAPTER IV: CONTROLLER AND PROCESSOR (Articles 24-43) =====
  {
    number: 24,
    title: "Responsibility of the controller",
    chapter: "Controller and Processor",
    summary: "Establishes the controller's obligation to implement appropriate technical and organizational measures.",
    requirements: [
      "Controller shall implement appropriate technical and organizational measures to ensure and demonstrate compliance",
      "Measures shall take into account the nature, scope, context, and purposes of processing as well as the risks to rights and freedoms",
      "Measures shall be reviewed and updated where necessary",
      "Where proportionate, implementation of appropriate data protection policies",
      "Adherence to approved codes of conduct or certification mechanisms may be used as an element to demonstrate compliance",
    ],
  },
  {
    number: 25,
    title: "Data protection by design and by default",
    chapter: "Controller and Processor",
    summary: "Requires data protection principles to be embedded into processing from the design stage.",
    requirements: [
      "Controller shall implement appropriate technical and organizational measures (such as pseudonymisation) designed to implement data-protection principles (such as data minimisation) effectively at the time of determination of means and at the time of processing",
      "Controller shall implement measures to ensure only personal data necessary for each specific purpose is processed — applies to amount, extent, storage period, and accessibility",
      "By default, personal data shall not be made accessible without the individual's intervention to an indefinite number of natural persons",
      "Approved certification mechanisms may be used to demonstrate compliance",
    ],
  },
  {
    number: 26,
    title: "Joint controllers",
    chapter: "Controller and Processor",
    summary: "Addresses situations where two or more controllers jointly determine purposes and means of processing.",
    requirements: [
      "Where two or more controllers jointly determine the purposes and means, they are joint controllers and shall determine their respective responsibilities by means of an arrangement",
      "The arrangement shall reflect the respective roles and relationships vis-a-vis the data subjects, particularly regarding exercising rights and providing information under Articles 13 and 14",
      "The essence of the arrangement shall be made available to the data subject",
      "Data subject may exercise rights under the Regulation in respect of and against each of the controllers regardless of the arrangement",
    ],
  },
  {
    number: 27,
    title: "Representatives of controllers or processors not established in the Union",
    chapter: "Controller and Processor",
    summary: "Requires non-EU controllers/processors to designate a representative in the Union.",
    requirements: [
      "Controller or processor not established in the Union shall designate in writing a representative in the Union where Article 3(2) applies",
      "Representative shall be established in one of the Member States where data subjects are located",
      "Not applicable where processing is occasional, does not include large-scale processing of special categories, and is unlikely to result in risk to rights and freedoms; or where the controller is a public authority or body",
    ],
  },
  {
    number: 28,
    title: "Processor",
    chapter: "Controller and Processor",
    summary: "Sets requirements for the use of processors and the content of processing agreements.",
    requirements: [
      "Controller shall use only processors providing sufficient guarantees to implement appropriate technical and organizational measures",
      "Processor shall not engage another processor without prior specific or general written authorization of the controller",
      "Processing by a processor shall be governed by a contract or other legal act, setting out: subject-matter and duration, nature and purpose, type of data, categories of data subjects, and obligations and rights of the controller",
      "Contract must include: processor acts only on documented instructions, confidentiality obligations, appropriate security measures, sub-processor obligations, assistance with data subject rights, deletion or return of data after services end, audits and inspections, information provision",
      "Where processor engages sub-processor, same data protection obligations shall be imposed",
    ],
  },
  {
    number: 30,
    title: "Records of processing activities",
    chapter: "Controller and Processor",
    summary: "Requires controllers and processors to maintain records of processing activities.",
    requirements: [
      "Each controller shall maintain a record containing: name/contact details, purposes of processing, categories of data subjects and personal data, categories of recipients, transfers to third countries, envisaged time limits for erasure, general description of security measures",
      "Each processor shall maintain a record containing: name/contact details of each controller and processor, categories of processing carried out on behalf of each controller, transfers to third countries, general description of security measures",
      "Records shall be in writing, including electronic form",
      "Records shall be made available to the supervisory authority on request",
      "Exemption for organizations employing fewer than 250 persons, unless processing is likely to result in a risk to rights and freedoms, processing is not occasional, or processing includes special categories of data or criminal convictions data",
    ],
  },
  {
    number: 32,
    title: "Security of processing",
    chapter: "Controller and Processor",
    summary: "Requires appropriate technical and organizational measures to ensure security of processing.",
    requirements: [
      "Controller and processor shall implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including: pseudonymisation and encryption, ability to ensure ongoing confidentiality/integrity/availability/resilience, ability to restore access to data in a timely manner, process for regularly testing/assessing/evaluating effectiveness of measures",
      "In assessing the appropriate level of security, account shall be taken of risks from accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to personal data",
      "Adherence to approved codes of conduct or certification mechanisms may be used as an element to demonstrate compliance",
      "Controller and processor shall take steps to ensure any person acting under their authority with access to personal data does not process it except on instructions from the controller",
    ],
  },
  {
    number: 33,
    title: "Notification of a personal data breach to the supervisory authority",
    chapter: "Controller and Processor",
    summary: "Requires controllers to notify supervisory authorities of data breaches within 72 hours.",
    requirements: [
      "In case of a personal data breach, the controller shall without undue delay and where feasible within 72 hours notify the supervisory authority, unless the breach is unlikely to result in a risk to rights and freedoms",
      "Where notification is not made within 72 hours, it shall be accompanied by reasons for the delay",
      "The processor shall notify the controller without undue delay after becoming aware of a personal data breach",
      "Notification must include: nature of the breach (categories and approximate number of data subjects and records), name and contact details of DPO or other contact point, likely consequences, measures taken or proposed to address the breach and mitigate possible adverse effects",
      "Where it is not possible to provide all information at the same time, information may be provided in phases without undue further delay",
      "Controller shall document all personal data breaches, comprising the facts, effects, and remedial action taken",
    ],
  },
  {
    number: 34,
    title: "Communication of a personal data breach to the data subject",
    chapter: "Controller and Processor",
    summary: "Requires communication of high-risk breaches to affected data subjects.",
    requirements: [
      "When a breach is likely to result in a high risk to the rights and freedoms of natural persons, the controller shall communicate the breach to the data subject without undue delay",
      "Communication shall describe in clear and plain language the nature of the breach and contain at minimum: DPO contact, likely consequences, measures taken or proposed",
      "Communication not required if: controller has implemented appropriate protection measures rendering data unintelligible (encryption), controller has taken subsequent measures ensuring high risk is no longer likely to materialise, or it would involve disproportionate effort (in which case public communication or similar measure is required)",
    ],
  },
  {
    number: 35,
    title: "Data protection impact assessment",
    chapter: "Controller and Processor",
    summary: "Requires impact assessments for processing likely to result in high risk to data subjects.",
    requirements: [
      "Where processing is likely to result in a high risk to rights and freedoms, the controller shall carry out a DPIA prior to processing",
      "Required in particular for: systematic and extensive evaluation of personal aspects based on automated processing (including profiling) on which decisions producing legal effects are based; processing on a large scale of special categories or criminal convictions data; systematic monitoring of a publicly accessible area on a large scale",
      "DPIA shall contain at minimum: systematic description of processing operations and purposes, assessment of necessity and proportionality, assessment of risks to rights and freedoms, measures envisaged to address risks (safeguards, security measures, mechanisms to ensure protection)",
      "Controller shall seek advice of the DPO where designated",
      "Controller shall seek the views of data subjects or their representatives where appropriate",
      "Supervisory authorities shall establish and make public a list of processing operations requiring a DPIA",
    ],
  },
  {
    number: 36,
    title: "Prior consultation",
    chapter: "Controller and Processor",
    summary: "Requires consultation with the supervisory authority where a DPIA indicates high residual risk.",
    requirements: [
      "Controller shall consult the supervisory authority prior to processing where a DPIA indicates processing would result in a high risk in the absence of measures taken by the controller to mitigate the risk",
      "Where the supervisory authority is of the opinion that the intended processing would infringe the Regulation, it shall provide written advice to the controller within up to eight weeks (may be extended by six weeks)",
      "When consulting the supervisory authority, the controller shall provide: respective responsibilities of controller and joint controllers; purposes and means of intended processing; measures and safeguards to protect rights of data subjects; DPO contact details; the DPIA; any other information requested",
    ],
  },
  {
    number: 37,
    title: "Designation of the data protection officer",
    chapter: "Controller and Processor",
    summary: "Requires designation of a DPO in certain circumstances.",
    requirements: [
      "Controller and processor shall designate a DPO where: processing is carried out by a public authority or body; core activities consist of processing operations requiring regular and systematic monitoring of data subjects on a large scale; core activities consist of processing on a large scale of special categories of data or criminal convictions data",
      "A group of undertakings may appoint a single DPO provided they are easily accessible from each establishment",
      "DPO shall be designated on the basis of professional qualities, in particular expert knowledge of data protection law and practices",
      "DPO may be a staff member or fulfill the tasks based on a service contract",
      "Controller or processor shall publish contact details of the DPO and communicate them to the supervisory authority",
    ],
  },
  {
    number: 38,
    title: "Position of the data protection officer",
    chapter: "Controller and Processor",
    summary: "Defines the organizational position and independence of the DPO.",
    requirements: [
      "Controller and processor shall ensure the DPO is involved properly and in a timely manner in all issues relating to the protection of personal data",
      "Controller and processor shall support the DPO by providing resources necessary to carry out tasks, maintain expert knowledge, and access to personal data and processing operations",
      "Controller and processor shall ensure the DPO does not receive any instructions regarding the exercise of those tasks; shall not be dismissed or penalized for performing tasks; shall report directly to the highest management level",
      "Data subjects may contact the DPO with regard to all issues related to processing of their data and exercise of their rights",
      "DPO shall be bound by secrecy or confidentiality concerning performance of tasks",
      "DPO may fulfil other tasks and duties provided they do not result in a conflict of interests",
    ],
  },
  {
    number: 39,
    title: "Tasks of the data protection officer",
    chapter: "Controller and Processor",
    summary: "Defines the minimum tasks assigned to the DPO.",
    requirements: [
      "Inform and advise the controller/processor and employees of their obligations under data protection law",
      "Monitor compliance with the Regulation, other Union or Member State data protection provisions, and policies of the controller/processor including assignment of responsibilities, awareness-raising, training, and audits",
      "Provide advice where requested regarding the DPIA and monitor its performance",
      "Cooperate with the supervisory authority",
      "Act as the contact point for the supervisory authority on issues relating to processing, including prior consultation, and consult on any other matter",
      "DPO shall in the performance of tasks have due regard to the risk associated with processing operations, taking into account nature, scope, context, and purposes of processing",
    ],
  },
  {
    number: 42,
    title: "Certification",
    chapter: "Controller and Processor",
    summary: "Establishes data protection certification mechanisms, seals, and marks.",
    requirements: [
      "Member States, supervisory authorities, the Board, and the Commission shall encourage establishment of data protection certification mechanisms and seals/marks for the purpose of demonstrating compliance",
      "Certification shall be voluntary and available via transparent process",
      "Certification shall not reduce the responsibility of the controller or processor for compliance and shall be without prejudice to tasks and powers of supervisory authorities",
      "Certification shall be issued for a maximum period of three years and may be renewed",
      "Certification shall be withdrawn where requirements for the certification are not or are no longer met",
    ],
  },
  {
    number: 43,
    title: "Certification bodies",
    chapter: "Controller and Processor",
    summary: "Defines requirements for bodies issuing data protection certifications.",
    requirements: [
      "Certification bodies shall have an appropriate level of expertise in data protection",
      "Certification bodies shall be accredited by the supervisory authority or the national accreditation body, or both",
      "Accreditation shall be issued for a maximum period of five years and may be renewed",
      "Certification bodies shall inform the supervisory authority of the reasons for granting or withdrawing the requested certification",
    ],
  },
  // ===== CHAPTER V: INTERNATIONAL TRANSFERS (Articles 44-49) =====
  {
    number: 44,
    title: "General principle for transfers",
    chapter: "International Transfers",
    summary: "Establishes that international transfers must meet Chapter V conditions to not undermine GDPR protections.",
    requirements: [
      "Any transfer of personal data to a third country or international organization shall only take place if the conditions in Chapter V are complied with by the controller and processor",
      "All provisions of Chapter V shall be applied to ensure the level of protection afforded by the Regulation is not undermined",
      "This includes onward transfers from the third country or international organization to another third country or international organization",
    ],
  },
  {
    number: 45,
    title: "Transfers on the basis of an adequacy decision",
    chapter: "International Transfers",
    summary: "Allows transfers to third countries with adequate data protection as determined by the Commission.",
    requirements: [
      "Transfer may take place where the Commission has decided that the third country, territory, sector, or international organization ensures an adequate level of protection",
      "Commission shall take into account: rule of law, respect for human rights, relevant legislation, existence of supervisory authorities, international commitments",
      "Commission shall monitor developments that could affect functioning of adequacy decisions",
      "Adequacy decisions shall be reviewed at least every four years",
      "Commission shall publish in the Official Journal and on its website a list of third countries, territories, and sectors where it has decided an adequate level is or is no longer ensured",
    ],
  },
  {
    number: 46,
    title: "Transfers subject to appropriate safeguards",
    chapter: "International Transfers",
    summary: "Allows transfers where appropriate safeguards are provided and enforceable data subject rights are available.",
    requirements: [
      "In the absence of an adequacy decision, transfer may take place only if the controller or processor has provided appropriate safeguards and on condition that enforceable data subject rights and effective legal remedies are available",
      "Appropriate safeguards may be provided by (without supervisory authority authorization): legally binding instrument between public authorities, binding corporate rules, standard data protection clauses adopted by the Commission (SCCs), standard data protection clauses adopted by a supervisory authority and approved by the Commission, approved code of conduct with binding and enforceable commitments, approved certification mechanism with binding and enforceable commitments",
      "Appropriate safeguards may be provided by (with supervisory authority authorization): contractual clauses between the parties, provisions in administrative arrangements between public authorities",
    ],
  },
  {
    number: 47,
    title: "Binding corporate rules",
    chapter: "International Transfers",
    summary: "Defines requirements for binding corporate rules as a transfer mechanism within corporate groups.",
    requirements: [
      "Binding corporate rules shall be approved by the competent supervisory authority",
      "Binding corporate rules shall be legally binding and apply to and be enforced by every member of the group of undertakings or group of enterprises engaged in a joint economic activity",
      "Binding corporate rules shall expressly confer enforceable rights on data subjects with regard to the processing of their personal data",
      "Content must specify: structure and contact details, data transfers or set of transfers, legally binding nature, application of general data protection principles, rights of data subjects, liability, how information is provided to data subjects, tasks of the DPO, complaint procedures, mechanisms for ensuring compliance verification, mechanisms for reporting and recording changes, cooperation mechanism with supervisory authorities, reporting mechanisms to competent supervisory authority",
    ],
  },
  {
    number: 48,
    title: "Transfers or disclosures not authorized by Union law",
    chapter: "International Transfers",
    summary: "Provides that foreign judgments/administrative decisions requiring transfer are not recognized unless based on international agreement.",
    requirements: [
      "Any judgment of a court or tribunal and any decision of an administrative authority of a third country requiring a controller or processor to transfer or disclose personal data may only be recognized or enforceable if based on an international agreement, such as a mutual legal assistance treaty, in force between the requesting third country and the Union or a Member State",
      "This is without prejudice to other grounds for transfer under Chapter V",
    ],
  },
  {
    number: 49,
    title: "Derogations for specific situations",
    chapter: "International Transfers",
    summary: "Allows transfers in specific situations where neither adequacy decision nor appropriate safeguards exist.",
    requirements: [
      "In the absence of an adequacy decision or appropriate safeguards, a transfer may take place only if one of the following applies:",
      "Data subject has explicitly consented after being informed of the possible risks of such transfers due to the absence of an adequacy decision and appropriate safeguards",
      "Transfer is necessary for the performance of a contract between the data subject and the controller or the implementation of pre-contractual measures taken at the data subject's request",
      "Transfer is necessary for the conclusion or performance of a contract concluded in the interest of the data subject between the controller and another natural or legal person",
      "Transfer is necessary for important reasons of public interest",
      "Transfer is necessary for the establishment, exercise, or defence of legal claims",
      "Transfer is necessary to protect the vital interests of the data subject or of other persons where the data subject is physically or legally incapable of giving consent",
      "Transfer is made from a register intended to provide information to the public and open to consultation (with conditions)",
      "Where none of the above apply, a transfer may take place only if it is not repetitive, concerns only a limited number of data subjects, is necessary for compelling legitimate interests not overridden by the interests/rights/freedoms of the data subject, and the controller has assessed all circumstances and has provided suitable safeguards",
    ],
  },
];

export function getArticlesByChapter(chapter: GdprChapter): GdprArticle[] {
  return GDPR_ARTICLES.filter((a) => a.chapter === chapter);
}

export function getArticleByNumber(num: number): GdprArticle | undefined {
  return GDPR_ARTICLES.find((a) => a.number === num);
}

export function getAllChapters(): GdprChapter[] {
  return ["Principles", "Data Subject Rights", "Controller and Processor", "International Transfers"];
}
