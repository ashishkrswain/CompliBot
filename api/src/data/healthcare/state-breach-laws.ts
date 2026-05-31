/**
 * State Breach Notification Laws — Top 10 States
 * Data for compliance with state-specific breach notification requirements
 */

export interface StateBreachLaw {
  state: string;
  stateCode: string;
  statuteCitation: string;
  notificationTimeline: string;
  timelineDays: number | null;
  whoMustBeNotified: string[];
  contentRequirements: string[];
  agNotificationThreshold: number | null;
  agNotificationRequired: boolean;
  additionalNotes: string;
}

export const STATE_BREACH_LAWS: StateBreachLaw[] = [
  {
    state: "California",
    stateCode: "CA",
    statuteCitation: "Cal. Civ. Code 1798.82",
    notificationTimeline: "Without unreasonable delay; no more than 72 hours to AG if more than 500 residents",
    timelineDays: null,
    whoMustBeNotified: [
      "Affected California residents",
      "California Attorney General (if 500+ residents affected)",
    ],
    contentRequirements: [
      "Name of entity that experienced the breach",
      "Name of the person subject to notice",
      "Date, estimated date, or date range of the breach",
      "Description of the types of personal information breached",
      "Whether notification was delayed due to law enforcement investigation",
      "General description of the breach incident",
      "Toll-free numbers and addresses of major credit reporting agencies (if SSN breached)",
      "Specific header: 'Notice of Data Breach'",
      "Specific format requirements (8-point type minimum)",
    ],
    agNotificationThreshold: 500,
    agNotificationRequired: true,
    additionalNotes: "California requires substitute notice if cost exceeds $250,000 or affected class exceeds 500,000 persons. Health data breaches also subject to CMIA (Cal. Civ. Code 56.06).",
  },
  {
    state: "Texas",
    stateCode: "TX",
    statuteCitation: "Tex. Bus. & Com. Code 521.053",
    notificationTimeline: "Without unreasonable delay; not later than 60 days after determination of breach",
    timelineDays: 60,
    whoMustBeNotified: [
      "Affected Texas residents",
      "Texas Attorney General (if 250+ residents affected)",
      "Consumer reporting agencies (if 10,000+ residents affected)",
    ],
    contentRequirements: [
      "Description of the incident in general terms",
      "Type of sensitive personal information subject to the breach",
      "Actions taken to protect the individual's information",
      "Procedures individuals can follow to protect themselves",
      "Contact information for the breaching entity",
    ],
    agNotificationThreshold: 250,
    agNotificationRequired: true,
    additionalNotes: "Texas HB 4390 (2023) reduced the AG notification threshold from 250 to 250 residents and imposed a strict 60-day deadline.",
  },
  {
    state: "New York",
    stateCode: "NY",
    statuteCitation: "N.Y. Gen. Bus. Law 899-aa; N.Y. State Tech. Law 208",
    notificationTimeline: "In the most expedient time possible and without unreasonable delay",
    timelineDays: null,
    whoMustBeNotified: [
      "Affected New York residents",
      "New York Attorney General",
      "Division of State Police",
      "Department of State (Division of Consumer Protection)",
    ],
    contentRequirements: [
      "Contact information for the entity making the notification",
      "Telephone numbers of major credit reporting agencies",
      "Description of categories of information that were or reasonably believed to have been accessed or acquired",
      "Toll-free numbers for state/federal agencies providing identity theft information",
    ],
    agNotificationThreshold: null,
    agNotificationRequired: true,
    additionalNotes: "New York SHIELD Act (2019) expanded the definition of private information and requires reasonable security safeguards. AG notification required regardless of number affected. Must also notify AG of timing delays due to law enforcement.",
  },
  {
    state: "Florida",
    stateCode: "FL",
    statuteCitation: "Fla. Stat. 501.171",
    notificationTimeline: "No later than 30 days after determination of breach; 10 days to AG if more than 500",
    timelineDays: 30,
    whoMustBeNotified: [
      "Affected Florida residents (within 30 days)",
      "Florida Department of Legal Affairs (within 30 days)",
      "Consumer reporting agencies (if 1,000+ residents affected)",
    ],
    contentRequirements: [
      "Date or estimated date range of breach",
      "Description of personal information accessed",
      "Contact information of the reporting entity",
      "Dates of individual notifications",
      "Number of individuals affected",
      "Services being offered (credit monitoring, etc.)",
      "Copy of template notification letter to individuals",
    ],
    agNotificationThreshold: null,
    agNotificationRequired: true,
    additionalNotes: "Florida has one of the strictest timelines (30 days). AG must be notified for all breaches affecting 500+ individuals within 30 days. Penalties up to $500,000 for violations.",
  },
  {
    state: "Illinois",
    stateCode: "IL",
    statuteCitation: "815 ILCS 530/10 (Personal Information Protection Act)",
    notificationTimeline: "In the most expedient time possible and without unreasonable delay; no more than 60 days",
    timelineDays: 60,
    whoMustBeNotified: [
      "Affected Illinois residents",
      "Illinois Attorney General",
      "Consumer reporting agencies (if 1,000+ residents affected)",
    ],
    contentRequirements: [
      "Contact information of the entity",
      "Description of the breach in general terms",
      "Type of personal information compromised",
      "Steps taken to protect individuals",
      "Contact information for consumer reporting agencies",
      "Information regarding identity theft resources",
    ],
    agNotificationThreshold: null,
    agNotificationRequired: true,
    additionalNotes: "Illinois also has BIPA (Biometric Information Privacy Act) with separate breach notification requirements for biometric data. AG notification required for all breaches regardless of number affected.",
  },
  {
    state: "Pennsylvania",
    stateCode: "PA",
    statuteCitation: "73 Pa. Stat. 2303 (Breach of Personal Information Notification Act)",
    notificationTimeline: "Without unreasonable delay",
    timelineDays: null,
    whoMustBeNotified: [
      "Affected Pennsylvania residents",
      "Pennsylvania Attorney General (if 1,000+ residents affected)",
      "Consumer reporting agencies (if 1,000+ residents affected)",
    ],
    contentRequirements: [
      "Nature of the breach",
      "Type of personal information compromised",
      "Remedial services offered",
      "Contact information",
    ],
    agNotificationThreshold: 1000,
    agNotificationRequired: true,
    additionalNotes: "Pennsylvania requires entities to notify AG and CRAs when 1,000 or more persons are affected. Notice may be delayed by law enforcement request.",
  },
  {
    state: "Ohio",
    stateCode: "OH",
    statuteCitation: "Ohio Rev. Code 1349.19",
    notificationTimeline: "In the most expedient time possible; not later than 45 days after discovery/notification",
    timelineDays: 45,
    whoMustBeNotified: [
      "Affected Ohio residents",
      "Ohio Attorney General (if 1,000+ residents affected)",
      "Consumer reporting agencies (if 1,000+ residents affected)",
    ],
    contentRequirements: [
      "Description of breach in general terms",
      "Type of personal information that was subject to the unauthorized access",
      "Contact information for the reporting entity",
      "Contact information for major credit reporting agencies",
      "Information about available identity theft resources",
    ],
    agNotificationThreshold: 1000,
    agNotificationRequired: true,
    additionalNotes: "Ohio Data Protection Act provides an affirmative defense for entities that maintain reasonable cybersecurity programs conforming to industry frameworks (NIST, HIPAA, etc.).",
  },
  {
    state: "Georgia",
    stateCode: "GA",
    statuteCitation: "O.C.G.A. 10-1-912",
    notificationTimeline: "In the most expedient time possible and without unreasonable delay",
    timelineDays: null,
    whoMustBeNotified: [
      "Affected Georgia residents",
      "Consumer reporting agencies (if 10,000+ residents affected)",
    ],
    contentRequirements: [
      "Description of the incident in general terms",
      "Description of the type of personal information breached",
      "Contact information for the entity providing the notice",
      "Contact information for consumer reporting agencies",
      "Advice to remain vigilant for unauthorized transactions",
    ],
    agNotificationThreshold: null,
    agNotificationRequired: false,
    additionalNotes: "Georgia does not currently require notification to the AG (though legislation has been proposed). CRA notification required if 10,000+ affected. No private right of action.",
  },
  {
    state: "North Carolina",
    stateCode: "NC",
    statuteCitation: "N.C. Gen. Stat. 75-65",
    notificationTimeline: "Without unreasonable delay",
    timelineDays: null,
    whoMustBeNotified: [
      "Affected North Carolina residents",
      "North Carolina Attorney General (if 1,000+ residents affected)",
      "Consumer reporting agencies (if 1,000+ residents affected)",
    ],
    contentRequirements: [
      "General description of the breach incident",
      "Type of personal information compromised",
      "General acts taken to protect the personal information from further breach",
      "Telephone number for further information and assistance",
      "Advice to remain vigilant by reviewing account statements and monitoring credit reports",
      "Toll-free numbers and addresses for major credit reporting agencies",
      "Toll-free numbers and addresses for FTC and NC AG office",
    ],
    agNotificationThreshold: 1000,
    agNotificationRequired: true,
    additionalNotes: "North Carolina has enhanced content requirements for notification letters and requires notice to the Consumer Protection Division of the AG's office.",
  },
  {
    state: "Massachusetts",
    stateCode: "MA",
    statuteCitation: "Mass. Gen. Laws ch. 93H, 3",
    notificationTimeline: "As soon as practicable and without unreasonable delay",
    timelineDays: null,
    whoMustBeNotified: [
      "Affected Massachusetts residents",
      "Massachusetts Attorney General",
      "Massachusetts Office of Consumer Affairs and Business Regulation (OCABR)",
      "Consumer reporting agencies (if applicable)",
    ],
    contentRequirements: [
      "Nature of the breach of security",
      "Number of Massachusetts residents affected",
      "Name and address of the entity experiencing the breach",
      "Name and title of person/agent reporting on behalf of the entity",
      "Type of entity reporting (individual, partnership, corporation, etc.)",
      "Whether the entity maintains a WISP (Written Information Security Program)",
      "Whether entity has a policy regarding notification of affected consumers",
      "Steps taken or planned regarding the incident",
      "Whether a law enforcement agency has provided a written statement that notification would impede an investigation",
    ],
    agNotificationThreshold: null,
    agNotificationRequired: true,
    additionalNotes: "Massachusetts requires a WISP (Written Information Security Program) under 201 CMR 17.00. AG and OCABR must be notified for ALL breaches, regardless of number affected. Specific notification form required.",
  },
];

export function getStateBreachLaw(stateCode: string): StateBreachLaw | undefined {
  return STATE_BREACH_LAWS.find((s) => s.stateCode === stateCode);
}

export function getStatesWithAGNotification(): StateBreachLaw[] {
  return STATE_BREACH_LAWS.filter((s) => s.agNotificationRequired);
}

export function getStatesWithStrictTimelines(): StateBreachLaw[] {
  return STATE_BREACH_LAWS.filter((s) => s.timelineDays !== null).sort(
    (a, b) => (a.timelineDays ?? Infinity) - (b.timelineDays ?? Infinity)
  );
}
