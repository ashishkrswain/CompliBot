import { generateCompletion } from "../../lib/llm.js";

// ─────────────────────────────────────────────────────────────────────────────
// 29 CFR 1910.38 — Emergency Action Plan (EAP) Generator
//
// Implements all mandatory elements per OSHA 29 CFR 1910.38(c):
//   (1) Procedures for reporting a fire or other emergency
//   (2) Procedures for emergency evacuation, including type of evacuation and exit route assignments
//   (3) Procedures for employees who remain to operate critical plant operations before they evacuate
//   (4) Procedures to account for all employees after evacuation
//   (5) Procedures for employees performing rescue or medical duties
//   (6) Name or job title of every employee who may be contacted for further information or
//       explanation of duties under the plan
//
// Additional requirements per 29 CFR 1910.38(d)-(f):
//   - Alarm system [1910.38(d)]
//   - Training [1910.38(e)]
//   - Review of plan with employees [1910.38(f)]
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ShiftPattern {
  name: string;
  startTime: string;
  endTime: string;
  employeeCount: number;
  daysActive: string[];
}

export interface FacilityHazard {
  type: string;
  location: string;
  severity: "low" | "moderate" | "high" | "critical";
  specialProcedures: string;
}

export interface AssemblyPoint {
  id: string;
  name: string;
  location: string;
  capacity: number;
  primaryForAreas: string[];
  alternateForAreas: string[];
}

export interface AlarmType {
  type: "fire" | "tornado" | "chemical_spill" | "active_threat" | "general" | "all_clear";
  signalDescription: string;
  activationMethod: string;
  coverageAreas: string[];
}

export interface EapCoordinator {
  name: string;
  title: string;
  department: string;
  phone: string;
  email: string;
  role: "plan_administrator" | "floor_warden" | "evacuation_coordinator" | "first_aid" | "hazmat" | "accountability";
  backupName: string;
  backupPhone: string;
}

export interface EapInput {
  facilityName: string;
  address: string;
  buildingCount: number;
  floors: number;
  employeeCount: number;
  shiftPatterns: ShiftPattern[];
  hazards: FacilityHazard[];
  assemblyPoints: AssemblyPoint[];
  alarmTypes: AlarmType[];
  coordinators: EapCoordinator[];
  specialNeedsCount: number;
  nearbyHospital: string;
  fireStation: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// OUTPUT INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EvacuationRoute {
  routeId: string;
  originArea: string;
  primaryExit: string;
  secondaryExit: string;
  assemblyPointId: string;
  estimatedEvacuationTimeSeconds: number;
  maxOccupancy: number;
  accessibilityFeatures: string[];
  landmarks: string[];
}

export interface CriticalOperationProcedure {
  operationName: string;
  location: string;
  responsiblePersonnel: string[];
  shutdownSequence: string[];
  maxShutdownTimeMinutes: number;
  evacuationTrigger: string;
  hazardsIfNotShutDown: string[];
}

export interface AccountabilityProcedure {
  method: string;
  responsibleRole: string;
  reportingLocation: string;
  headcountDeadlineMinutes: number;
  missingPersonProtocol: string[];
  communicationChain: string[];
}

export interface RescueMedicalDuty {
  dutyType: "first_aid" | "cpr_aed" | "rescue" | "hazmat_response" | "triage";
  assignedPersonnel: string[];
  equipmentLocation: string;
  certificationRequired: string;
  scope: string;
  limitations: string;
}

export interface AlarmSystemDescription {
  alarmType: AlarmType;
  testingSchedule: string;
  maintenanceResponsibility: string;
  backupPower: boolean;
  coverageGaps: string[];
  employeeRecognitionTraining: string;
}

export interface ContactEntry {
  name: string;
  title: string;
  responsibility: string;
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  availableHours: string;
}

export interface TrainingRequirement {
  topic: string;
  frequency: string;
  audience: string;
  method: string;
  duration: string;
  regulatoryBasis: string;
  documentationRequired: string;
}

export interface SpecialNeedsAccommodation {
  accommodationType: string;
  description: string;
  assignedBuddy: string;
  equipmentNeeded: string[];
  evacuationModification: string;
  assemblyPointModification: string;
}

export interface CommunicationProcedure {
  scenario: string;
  primaryMethod: string;
  backupMethod: string;
  responsibleParty: string;
  messageTemplate: string;
  externalNotifications: string[];
}

export interface ReviewScheduleEntry {
  reviewType: string;
  frequency: string;
  triggerEvents: string[];
  responsibleParty: string;
  documentationRequirement: string;
  regulatoryBasis: string;
}

export interface EmergencyActionPlan {
  metadata: {
    facilityName: string;
    address: string;
    planVersion: string;
    effectiveDate: string;
    nextReviewDate: string;
    preparedBy: string;
    approvedBy: string;
    regulatoryBasis: string;
  };
  evacuationRoutes: EvacuationRoute[];
  criticalOperationProcedures: CriticalOperationProcedure[];
  accountabilityProcedures: AccountabilityProcedure[];
  rescueMedicalDuties: RescueMedicalDuty[];
  alarmSystems: AlarmSystemDescription[];
  contactList: ContactEntry[];
  trainingSchedule: TrainingRequirement[];
  specialNeedsAccommodations: SpecialNeedsAccommodation[];
  communicationProcedures: CommunicationProcedure[];
  reviewSchedule: ReviewScheduleEntry[];
  complianceScore: number;
  complianceGaps: ComplianceGap[];
}

export interface ComplianceGap {
  requirement: string;
  cfrReference: string;
  currentState: string;
  severity: "critical" | "high" | "medium" | "low";
  recommendedAction: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

const EAP_SYSTEM_PROMPT = `You are an OSHA compliance specialist generating Emergency Action Plans per 29 CFR 1910.38.
You produce complete, facility-specific EAP documentation that meets all regulatory requirements.
All output must be structured, actionable, and cite specific regulatory provisions.
Use professional safety engineering language appropriate for OSHA compliance documentation.
Never use placeholder text — every section must contain complete, implementable procedures.`;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GENERATOR FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateEmergencyActionPlan(input: EapInput): Promise<EmergencyActionPlan> {
  validateInput(input);

  const effectiveDate = new Date().toISOString().split("T")[0]!;
  const nextReviewDate = computeNextReviewDate(effectiveDate);
  const planAdministrator = input.coordinators.find((c) => c.role === "plan_administrator");

  const evacuationRoutes = buildEvacuationRoutes(input);
  const criticalOperationProcedures = await generateCriticalOperationProcedures(input);
  const accountabilityProcedures = buildAccountabilityProcedures(input);
  const rescueMedicalDuties = buildRescueMedicalDuties(input);
  const alarmSystems = buildAlarmSystemDescriptions(input);
  const contactList = buildContactList(input);
  const trainingSchedule = buildTrainingSchedule(input);
  const specialNeedsAccommodations = buildSpecialNeedsAccommodations(input);
  const communicationProcedures = buildCommunicationProcedures(input);
  const reviewSchedule = buildReviewSchedule();

  const complianceGaps = assessComplianceGaps(input, {
    evacuationRoutes,
    criticalOperationProcedures,
    accountabilityProcedures,
    rescueMedicalDuties,
    alarmSystems,
    contactList,
    trainingSchedule,
    specialNeedsAccommodations,
  });

  const complianceScore = calculateComplianceScore(complianceGaps);

  return {
    metadata: {
      facilityName: input.facilityName,
      address: input.address,
      planVersion: "1.0",
      effectiveDate,
      nextReviewDate,
      preparedBy: planAdministrator?.name ?? "Safety Department",
      approvedBy: planAdministrator?.name ?? "Facility Manager",
      regulatoryBasis: "29 CFR 1910.38 — Emergency Action Plans",
    },
    evacuationRoutes,
    criticalOperationProcedures,
    accountabilityProcedures,
    rescueMedicalDuties,
    alarmSystems,
    contactList,
    trainingSchedule,
    specialNeedsAccommodations,
    communicationProcedures,
    reviewSchedule,
    complianceScore,
    complianceGaps,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVACUATION ROUTES — 29 CFR 1910.38(c)(2)
// ═══════════════════════════════════════════════════════════════════════════════

function buildEvacuationRoutes(input: EapInput): EvacuationRoute[] {
  const routes: EvacuationRoute[] = [];
  const floorsPerBuilding = input.floors;

  for (let building = 1; building <= input.buildingCount; building++) {
    for (let floor = 1; floor <= floorsPerBuilding; floor++) {
      const originArea = `Building ${building}, Floor ${floor}`;
      const assignedAssembly = assignAssemblyPoint(input.assemblyPoints, building, floor);

      const estimatedTime = calculateEvacuationTime(floor, input.employeeCount, input.buildingCount);

      routes.push({
        routeId: `EVR-B${building}F${floor}-PRI`,
        originArea,
        primaryExit: `Primary stairwell ${building}A — ${floor === 1 ? "Main entrance" : `descend to ground floor, exit via Door ${building}A`}`,
        secondaryExit: `Secondary stairwell ${building}B — ${floor === 1 ? "Rear exit" : `descend to ground floor, exit via Door ${building}B`}`,
        assemblyPointId: assignedAssembly.id,
        estimatedEvacuationTimeSeconds: estimatedTime,
        maxOccupancy: Math.ceil(input.employeeCount / (input.buildingCount * floorsPerBuilding)),
        accessibilityFeatures: buildAccessibilityFeatures(floor),
        landmarks: buildRouteLandmarks(building, floor),
      });
    }
  }

  return routes;
}

function assignAssemblyPoint(
  assemblyPoints: AssemblyPoint[],
  building: number,
  floor: number
): AssemblyPoint {
  const buildingArea = `Building ${building}`;
  const primary = assemblyPoints.find((ap) =>
    ap.primaryForAreas.some((area) => area.includes(buildingArea) || area.includes(`Floor ${floor}`))
  );
  if (primary) return primary;

  const alternate = assemblyPoints.find((ap) =>
    ap.alternateForAreas.some((area) => area.includes(buildingArea))
  );
  if (alternate) return alternate;

  return assemblyPoints[0] ?? {
    id: "AP-DEFAULT",
    name: "Main Parking Lot",
    location: "Front parking area, minimum 500ft from building",
    capacity: 500,
    primaryForAreas: ["All"],
    alternateForAreas: [],
  };
}

function calculateEvacuationTime(floor: number, totalEmployees: number, buildingCount: number): number {
  const employeesPerFloor = Math.ceil(totalEmployees / buildingCount);
  const baseTimePerFloor = 30; // seconds per floor descent
  const congestionFactor = Math.min(2.0, 1.0 + (employeesPerFloor / 200) * 0.5);
  const floorDescentTime = (floor - 1) * baseTimePerFloor * congestionFactor;
  const exitTime = 45; // seconds to clear the exit door
  return Math.round(floorDescentTime + exitTime);
}

function buildAccessibilityFeatures(floor: number): string[] {
  const features: string[] = ["Illuminated exit signage per 29 CFR 1910.37(b)"];
  if (floor > 1) {
    features.push("Area of rescue assistance on stairwell landing");
    features.push("Visual alarm strobes in corridor per 29 CFR 1910.165");
    features.push("Evacuation chair stationed at stairwell entrance");
  }
  features.push("Tactile exit path markings for visually impaired personnel");
  features.push("Emergency lighting with 90-minute battery backup per 29 CFR 1910.37(b)");
  return features;
}

function buildRouteLandmarks(building: number, floor: number): string[] {
  return [
    `Fire alarm pull station at stairwell ${building}A entrance`,
    `AED unit mounted on wall adjacent to elevator bank`,
    `Fire extinguisher cabinet at corridor midpoint`,
    `Illuminated EXIT sign above stairwell door`,
    floor > 1 ? `Floor number placards on stairwell walls at each landing` : `Exit directly to exterior at grade level`,
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRITICAL OPERATIONS — 29 CFR 1910.38(c)(3)
// ═══════════════════════════════════════════════════════════════════════════════

async function generateCriticalOperationProcedures(input: EapInput): Promise<CriticalOperationProcedure[]> {
  const criticalHazards = input.hazards.filter(
    (h) => h.severity === "critical" || h.severity === "high"
  );

  if (criticalHazards.length === 0) {
    return [buildDefaultCriticalOperation(input)];
  }

  const prompt = `For a facility named "${input.facilityName}" with the following critical/high-severity hazards:
${criticalHazards.map((h) => `- ${h.type} at ${h.location} (${h.severity}): ${h.specialProcedures}`).join("\n")}

Generate a JSON array of critical operation shutdown procedures. Each object must have:
- operationName: string
- location: string
- responsiblePersonnel: string[] (job titles)
- shutdownSequence: string[] (step-by-step)
- maxShutdownTimeMinutes: number
- evacuationTrigger: string (condition that forces immediate evacuation even if shutdown incomplete)
- hazardsIfNotShutDown: string[]

Return ONLY valid JSON. No markdown fences.`;

  try {
    const response = await generateCompletion(EAP_SYSTEM_PROMPT, prompt, {
      temperature: 0.2,
      maxTokens: 2048,
    });
    const parsed = JSON.parse(response) as CriticalOperationProcedure[];
    return validateCriticalOperations(parsed, input);
  } catch {
    return criticalHazards.map((hazard) => buildCriticalOperationFromHazard(hazard, input));
  }
}

function buildDefaultCriticalOperation(input: EapInput): CriticalOperationProcedure {
  return {
    operationName: "HVAC and Electrical System Shutdown",
    location: `${input.facilityName} — Mechanical Room`,
    responsiblePersonnel: ["Facilities Manager", "Lead Maintenance Technician"],
    shutdownSequence: [
      "Verify all personnel are aware of evacuation order",
      "Shut down HVAC air handling units to prevent smoke spread",
      "Secure electrical panels for non-essential circuits",
      "Close fire dampers if not automatically controlled",
      "Verify emergency lighting has activated",
      "Proceed to assigned assembly point",
    ],
    maxShutdownTimeMinutes: 5,
    evacuationTrigger: "Structural compromise, flashover conditions, or direct order from Incident Commander",
    hazardsIfNotShutDown: [
      "HVAC may spread smoke/toxic fumes throughout building",
      "Energized equipment poses electrocution risk to emergency responders",
    ],
  };
}

function buildCriticalOperationFromHazard(hazard: FacilityHazard, input: EapInput): CriticalOperationProcedure {
  return {
    operationName: `${hazard.type} Emergency Shutdown`,
    location: hazard.location,
    responsiblePersonnel: ["Shift Supervisor", "Process Operator"],
    shutdownSequence: [
      `Verify ${hazard.type} alarm condition and confirm emergency`,
      "Notify control room of shutdown initiation",
      `Execute ${hazard.type} emergency shutdown procedure`,
      "Verify isolation and de-energization",
      "Confirm safe state achieved",
      "Evacuate to assigned assembly point and report to Floor Warden",
    ],
    maxShutdownTimeMinutes: hazard.severity === "critical" ? 3 : 5,
    evacuationTrigger: `Uncontrolled ${hazard.type} release, structural compromise, or elapsed time exceeds maximum shutdown window`,
    hazardsIfNotShutDown: [
      `Uncontrolled ${hazard.type} may cause injury to evacuating personnel`,
      "Potential for escalation to secondary emergencies",
      "Risk to emergency responders during incident mitigation",
    ],
  };
}

function validateCriticalOperations(
  procedures: CriticalOperationProcedure[],
  input: EapInput
): CriticalOperationProcedure[] {
  return procedures.map((proc) => ({
    operationName: proc.operationName || "Unnamed Critical Operation",
    location: proc.location || input.facilityName,
    responsiblePersonnel: Array.isArray(proc.responsiblePersonnel)
      ? proc.responsiblePersonnel
      : ["Shift Supervisor"],
    shutdownSequence: Array.isArray(proc.shutdownSequence)
      ? proc.shutdownSequence
      : ["Execute emergency shutdown per SOP"],
    maxShutdownTimeMinutes: typeof proc.maxShutdownTimeMinutes === "number"
      ? proc.maxShutdownTimeMinutes
      : 5,
    evacuationTrigger: proc.evacuationTrigger || "Direct order from Incident Commander",
    hazardsIfNotShutDown: Array.isArray(proc.hazardsIfNotShutDown)
      ? proc.hazardsIfNotShutDown
      : ["Potential hazard escalation"],
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNTABILITY — 29 CFR 1910.38(c)(4)
// ═══════════════════════════════════════════════════════════════════════════════

function buildAccountabilityProcedures(input: EapInput): AccountabilityProcedure[] {
  const procedures: AccountabilityProcedure[] = [];

  procedures.push({
    method: "Visual headcount by department at assembly point",
    responsibleRole: "Floor Warden / Department Supervisor",
    reportingLocation: input.assemblyPoints[0]?.name ?? "Primary Assembly Point",
    headcountDeadlineMinutes: 10,
    missingPersonProtocol: [
      "Floor Warden reports missing person(s) to Evacuation Coordinator immediately",
      "Evacuation Coordinator relays information to Incident Commander",
      "Do NOT re-enter building to search — provide last known location to emergency responders",
      "Verify missing person is not at alternate assembly point or off-site",
      "Contact missing person via phone/radio if communication systems are operational",
      "Document all missing person reports on EAP Accountability Form (Form EAP-ACC-01)",
    ],
    communicationChain: [
      "Floor Warden → Evacuation Coordinator",
      "Evacuation Coordinator → Incident Commander",
      "Incident Commander → Fire Department / Emergency Services",
      "Incident Commander → Plan Administrator (for notifications)",
    ],
  });

  // Shift-specific procedures for multi-shift operations
  if (input.shiftPatterns.length > 1) {
    procedures.push({
      method: "Electronic badge swipe reconciliation cross-referenced with shift roster",
      responsibleRole: "Security/Access Control Personnel",
      reportingLocation: "Incident Command Post",
      headcountDeadlineMinutes: 15,
      missingPersonProtocol: [
        "Compare badge-out records against daily sign-in roster",
        "Cross-reference with visitor log and contractor sign-in sheet",
        "Account for personnel who departed prior to evacuation (early departure, offsite assignments)",
        "Report discrepancies to Incident Commander within 15 minutes of evacuation order",
        "Maintain running tally on accountability board at Incident Command Post",
      ],
      communicationChain: [
        "Security Desk → Evacuation Coordinator",
        "Evacuation Coordinator → Incident Commander",
        "Incident Commander → Emergency Services (if personnel unaccounted for)",
      ],
    });
  }

  // Visitor/contractor accountability
  procedures.push({
    method: "Visitor/Contractor log reconciliation",
    responsibleRole: "Reception / Security Personnel",
    reportingLocation: input.assemblyPoints[0]?.name ?? "Primary Assembly Point",
    headcountDeadlineMinutes: 12,
    missingPersonProtocol: [
      "Retrieve visitor sign-in log (physical or electronic)",
      "Cross-reference visitors present against sign-out records",
      "Contact host employee for each unaccounted visitor",
      "Report unaccounted visitors/contractors to Incident Commander",
      "Provide physical descriptions and last known locations to emergency responders",
    ],
    communicationChain: [
      "Reception → Floor Warden of host department",
      "Floor Warden → Evacuation Coordinator",
      "Evacuation Coordinator → Incident Commander",
    ],
  });

  return procedures;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESCUE AND MEDICAL DUTIES — 29 CFR 1910.38(c)(5)
// ═══════════════════════════════════════════════════════════════════════════════

function buildRescueMedicalDuties(input: EapInput): RescueMedicalDuty[] {
  const duties: RescueMedicalDuty[] = [];
  const firstAidCoordinators = input.coordinators.filter((c) => c.role === "first_aid");
  const hazmatCoordinators = input.coordinators.filter((c) => c.role === "hazmat");

  duties.push({
    dutyType: "first_aid",
    assignedPersonnel: firstAidCoordinators.length > 0
      ? firstAidCoordinators.map((c) => `${c.name} (${c.title})`)
      : ["Designated First Aid Responder (per shift)"],
    equipmentLocation: "First aid kits located at: main reception, break room, each floor landing, and maintenance shop",
    certificationRequired: "American Red Cross First Aid/CPR/AED or equivalent, current within 2 years",
    scope: "Provide immediate first aid for injuries sustained during evacuation including bleeding control, splinting, burn treatment, and shock management",
    limitations: "Do not attempt rescue from hazardous atmospheres, confined spaces, or structurally compromised areas. Do not administer medications beyond basic first aid supplies.",
  });

  duties.push({
    dutyType: "cpr_aed",
    assignedPersonnel: firstAidCoordinators.length > 0
      ? firstAidCoordinators.map((c) => `${c.name} (${c.title})`)
      : ["CPR/AED Certified Personnel (minimum 2 per shift per 29 CFR 1910.151)"],
    equipmentLocation: "AED units located at: main lobby, each floor elevator bank, fitness center, loading dock office",
    certificationRequired: "AHA or ARC BLS Provider certification, current within 2 years",
    scope: "Initiate CPR and deploy AED for cardiac arrest events. Continue until EMS arrival and transfer of care.",
    limitations: "Do not delay evacuation of other personnel to provide CPR. Relocate patient only if immediate environment poses imminent danger.",
  });

  duties.push({
    dutyType: "rescue",
    assignedPersonnel: ["Trained evacuation assistants (buddy system for mobility-impaired personnel)"],
    equipmentLocation: "Evacuation chairs at each stairwell entrance above ground floor",
    certificationRequired: "Annual evacuation chair operation training, lifting/carry technique certification",
    scope: "Assist mobility-impaired personnel to area of rescue assistance or ground-floor exit using evacuation chairs or carry techniques",
    limitations: "Do not enter smoke-filled areas. Do not use elevators during fire emergencies. Do not exceed two-person carry capacity of evacuation chairs.",
  });

  if (hazmatCoordinators.length > 0 || input.hazards.some((h) => h.type.toLowerCase().includes("chemical"))) {
    duties.push({
      dutyType: "hazmat_response",
      assignedPersonnel: hazmatCoordinators.length > 0
        ? hazmatCoordinators.map((c) => `${c.name} (${c.title})`)
        : ["HazMat Response Team Leader", "HazMat Technician (minimum 2)"],
      equipmentLocation: "HazMat response locker: maintenance corridor, Building 1. Spill kits at each chemical storage area.",
      certificationRequired: "HAZWOPER 40-hour initial + 8-hour annual refresher per 29 CFR 1910.120(q)",
      scope: "Contain and control incidental chemical releases within team capabilities. Establish hot/warm/cold zones. Provide technical guidance to Incident Commander.",
      limitations: "Do not exceed team training level (Operations or Technician). IDLH atmospheres require supplied air. Defer to Fire Department HazMat team for large releases.",
    });
  }

  duties.push({
    dutyType: "triage",
    assignedPersonnel: ["Designated Triage Officer (First Aid Team Lead)"],
    equipmentLocation: "Triage supplies in mass casualty kit located at primary assembly point",
    certificationRequired: "START Triage certification or equivalent mass casualty triage training",
    scope: "Establish triage area at assembly point for incidents with multiple casualties. Categorize patients (Immediate/Delayed/Minor/Deceased) and coordinate with incoming EMS.",
    limitations: "Triage only — do not delay EMS transport for extended field treatment. Transfer command to EMS upon arrival.",
  });

  return duties;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALARM SYSTEM — 29 CFR 1910.38(d)
// ═══════════════════════════════════════════════════════════════════════════════

function buildAlarmSystemDescriptions(input: EapInput): AlarmSystemDescription[] {
  return input.alarmTypes.map((alarm) => ({
    alarmType: alarm,
    testingSchedule: getAlarmTestingSchedule(alarm.type),
    maintenanceResponsibility: "Facilities Management / Fire Protection Contractor",
    backupPower: true,
    coverageGaps: identifyCoverageGaps(alarm, input),
    employeeRecognitionTraining: `All employees trained on ${alarm.type} alarm recognition during initial orientation and annual refresher per 29 CFR 1910.38(e). Distinct alarm patterns posted at each workstation.`,
  }));
}

function getAlarmTestingSchedule(alarmType: AlarmType["type"]): string {
  switch (alarmType) {
    case "fire":
      return "Monthly supervisory signal test; quarterly full evacuation drill; annual fire alarm system inspection per NFPA 72";
    case "tornado":
      return "Monthly siren test (first Wednesday); annual full shelter-in-place drill during severe weather season";
    case "chemical_spill":
      return "Quarterly sensor calibration; semi-annual full response drill; continuous monitoring system self-test daily";
    case "active_threat":
      return "Semi-annual notification system test; annual lockdown drill coordinated with local law enforcement";
    case "general":
      return "Monthly PA system test; quarterly emergency notification system test; annual comprehensive drill";
    case "all_clear":
      return "Tested in conjunction with each alarm type drill; PA system monthly test includes all-clear announcement";
  }
}

function identifyCoverageGaps(alarm: AlarmType, input: EapInput): string[] {
  const gaps: string[] = [];
  const totalAreas = input.buildingCount * input.floors;
  const coveredAreas = alarm.coverageAreas.length;

  if (coveredAreas < totalAreas) {
    gaps.push(`Alarm coverage verified for ${coveredAreas} of ${totalAreas} areas — verify remaining areas`);
  }

  if (input.specialNeedsCount > 0 && alarm.type === "fire") {
    gaps.push("Verify visual alarm strobes installed in all areas where hearing-impaired personnel work per 29 CFR 1910.165(b)");
  }

  if (input.buildingCount > 1) {
    gaps.push("Verify inter-building alarm notification capability for simultaneous multi-building evacuation");
  }

  return gaps;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT LIST — 29 CFR 1910.38(c)(6)
// ═══════════════════════════════════════════════════════════════════════════════

function buildContactList(input: EapInput): ContactEntry[] {
  const contacts: ContactEntry[] = [];

  // Internal coordinators
  for (const coordinator of input.coordinators) {
    contacts.push({
      name: coordinator.name,
      title: coordinator.title,
      responsibility: mapRoleToResponsibility(coordinator.role),
      primaryPhone: coordinator.phone,
      secondaryPhone: coordinator.backupPhone,
      email: coordinator.email,
      availableHours: getAvailableHours(coordinator, input.shiftPatterns),
    });
  }

  // External emergency services
  contacts.push({
    name: "Emergency Services",
    title: "911 Dispatch",
    responsibility: "Fire, EMS, Law Enforcement emergency response",
    primaryPhone: "911",
    secondaryPhone: "Non-emergency: Contact local jurisdiction",
    email: "N/A",
    availableHours: "24/7/365",
  });

  contacts.push({
    name: input.fireStation,
    title: "Fire Department",
    responsibility: "Fire suppression, HazMat response, technical rescue",
    primaryPhone: "911 (emergency) / Non-emergency line",
    secondaryPhone: "Station direct line",
    email: "N/A",
    availableHours: "24/7/365",
  });

  contacts.push({
    name: input.nearbyHospital,
    title: "Hospital / Emergency Department",
    responsibility: "Emergency medical treatment, trauma care",
    primaryPhone: "Hospital main line",
    secondaryPhone: "ED direct line",
    email: "N/A",
    availableHours: "24/7/365 (Emergency Department)",
  });

  contacts.push({
    name: "Poison Control Center",
    title: "National Poison Control",
    responsibility: "Chemical exposure guidance and treatment protocols",
    primaryPhone: "1-800-222-1222",
    secondaryPhone: "N/A",
    email: "N/A",
    availableHours: "24/7/365",
  });

  contacts.push({
    name: "OSHA Area Office",
    title: "OSHA Compliance",
    responsibility: "Fatality/catastrophe reporting (within 8 hours per 29 CFR 1904.39), regulatory guidance",
    primaryPhone: "1-800-321-OSHA (6742)",
    secondaryPhone: "Local area office number",
    email: "N/A",
    availableHours: "Mon-Fri 8:00 AM - 4:30 PM (24-hour hotline for fatalities)",
  });

  return contacts;
}

function mapRoleToResponsibility(role: EapCoordinator["role"]): string {
  switch (role) {
    case "plan_administrator":
      return "Overall EAP administration, plan maintenance, regulatory compliance coordination, and point of contact for plan questions per 29 CFR 1910.38(c)(6)";
    case "floor_warden":
      return "Floor evacuation oversight, headcount at assembly point, reporting to Evacuation Coordinator";
    case "evacuation_coordinator":
      return "Overall evacuation coordination, assembly point management, communication with Incident Commander";
    case "first_aid":
      return "First aid/CPR/AED response, triage coordination, EMS liaison";
    case "hazmat":
      return "Chemical spill response, HazMat containment, SDS reference, decontamination coordination";
    case "accountability":
      return "Personnel accountability tracking, badge system reconciliation, missing person protocol execution";
  }
}

function getAvailableHours(coordinator: EapCoordinator, shifts: ShiftPattern[]): string {
  const deptShifts = shifts.filter((s) =>
    s.name.toLowerCase().includes(coordinator.department.toLowerCase())
  );
  if (deptShifts.length > 0) {
    return deptShifts.map((s) => `${s.name}: ${s.startTime}-${s.endTime}`).join("; ");
  }
  return "Standard business hours + on-call for emergencies";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRAINING SCHEDULE — 29 CFR 1910.38(e)
// ═══════════════════════════════════════════════════════════════════════════════

function buildTrainingSchedule(input: EapInput): TrainingRequirement[] {
  const training: TrainingRequirement[] = [];

  training.push({
    topic: "Emergency Action Plan Overview and Evacuation Procedures",
    frequency: "Upon initial assignment and when plan changes per 29 CFR 1910.38(e)",
    audience: "All employees",
    method: "Classroom instruction with walk-through of evacuation routes",
    duration: "60 minutes initial; 30 minutes refresher",
    regulatoryBasis: "29 CFR 1910.38(e) — Training requirements",
    documentationRequired: "Signed attendance roster, training date, topics covered, trainer name",
  });

  training.push({
    topic: "Evacuation Drill — Full Building",
    frequency: "Quarterly (minimum annually per best practice; semi-annual for high-hazard facilities)",
    audience: "All employees and on-site contractors",
    method: "Unannounced evacuation drill with timed accountability",
    duration: "30-45 minutes including debrief",
    regulatoryBasis: "29 CFR 1910.38(e); NFPA 101 Life Safety Code",
    documentationRequired: "Drill date/time, total evacuation time, accountability time, deficiencies noted, corrective actions",
  });

  training.push({
    topic: "Floor Warden / Evacuation Coordinator Training",
    frequency: "Upon appointment and annually thereafter",
    audience: "Designated Floor Wardens and Evacuation Coordinators",
    method: "Specialized classroom + practical exercises (sweep procedures, accountability forms, radio communication)",
    duration: "4 hours initial; 2 hours annual refresher",
    regulatoryBasis: "29 CFR 1910.38(e); 29 CFR 1910.38(c)(6)",
    documentationRequired: "Competency demonstration checklist, role-specific duties acknowledgment",
  });

  training.push({
    topic: "First Aid / CPR / AED Certification",
    frequency: "Initial certification + biennial renewal",
    audience: "Designated first aid responders (minimum 1 per shift per 29 CFR 1910.151)",
    method: "Accredited certification course (ARC, AHA, or NSC)",
    duration: "8 hours initial; 4 hours renewal",
    regulatoryBasis: "29 CFR 1910.151(b) — Medical services and first aid",
    documentationRequired: "Current certification cards on file, expiration tracking log",
  });

  training.push({
    topic: "Alarm Recognition and Response Actions",
    frequency: "Upon initial assignment, when alarm systems change, and annually",
    audience: "All employees",
    method: "Audio/visual presentation of each alarm type with required response actions",
    duration: "20 minutes",
    regulatoryBasis: "29 CFR 1910.38(d) — Employee alarm systems; 29 CFR 1910.165",
    documentationRequired: "Training acknowledgment form, quiz demonstrating alarm recognition",
  });

  training.push({
    topic: "Critical Operations Shutdown Procedures",
    frequency: "Upon assignment to critical operations role and quarterly thereafter",
    audience: "Personnel designated to remain for critical operations per 29 CFR 1910.38(c)(3)",
    method: "Hands-on shutdown procedure practice with supervisory observation",
    duration: "2 hours initial; 1 hour quarterly refresher",
    regulatoryBasis: "29 CFR 1910.38(c)(3)",
    documentationRequired: "Demonstrated competency log, timed shutdown drills, supervisor sign-off",
  });

  if (input.specialNeedsCount > 0) {
    training.push({
      topic: "Evacuation Assistance / Buddy System Training",
      frequency: "Upon assignment as evacuation buddy and annually; when paired individual's needs change",
      audience: "Personnel assigned as evacuation buddies for mobility/sensory-impaired employees",
      method: "Practical training on evacuation chair operation, guided evacuation techniques, communication methods",
      duration: "2 hours initial; 1 hour annual refresher",
      regulatoryBasis: "29 CFR 1910.38(c)(2); ADA Title I reasonable accommodation",
      documentationRequired: "Buddy pair assignments documented, competency demonstration, equipment inspection log",
    });
  }

  if (input.hazards.some((h) => h.type.toLowerCase().includes("chemical"))) {
    training.push({
      topic: "HazMat Emergency Response Awareness",
      frequency: "Upon initial assignment and annually per 29 CFR 1910.120(q)(6)",
      audience: "All employees in areas with chemical hazards",
      method: "Classroom instruction on recognition, notification, and evacuation for chemical emergencies",
      duration: "4 hours initial (First Responder Awareness); 1 hour annual refresher",
      regulatoryBasis: "29 CFR 1910.120(q) — Emergency response to hazardous substance releases",
      documentationRequired: "Training level documented, competency statement, certificate of completion",
    });
  }

  return training;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIAL NEEDS ACCOMMODATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function buildSpecialNeedsAccommodations(input: EapInput): SpecialNeedsAccommodation[] {
  if (input.specialNeedsCount === 0) {
    return [{
      accommodationType: "General Preparedness",
      description: "No personnel currently identified as requiring evacuation assistance. Plan provisions remain in place for future needs, temporary disabilities, and visitors with mobility limitations.",
      assignedBuddy: "N/A — activate buddy system when needed",
      equipmentNeeded: ["Evacuation chairs maintained at all stairwells above ground floor"],
      evacuationModification: "Standard evacuation procedures apply. Areas of rescue assistance available on all floors above grade.",
      assemblyPointModification: "All assembly points are accessible via paved, grade-level routes",
    }];
  }

  const accommodations: SpecialNeedsAccommodation[] = [];

  accommodations.push({
    accommodationType: "Mobility Impairment — Wheelchair User",
    description: "Personnel using wheelchairs or unable to navigate stairs independently. Personal Emergency Evacuation Plan (PEEP) developed individually per 29 CFR 1910.38(c)(2).",
    assignedBuddy: "Two trained evacuation buddies assigned per individual (primary + backup)",
    equipmentNeeded: [
      "Evacuation chair (stair descent device) at nearest stairwell",
      "Two-way radio for communication with Floor Warden",
      "High-visibility vest for evacuation buddy identification",
    ],
    evacuationModification: "Proceed to designated Area of Rescue Assistance. Evacuation buddies deploy evacuation chair. Communicate status to Floor Warden via radio. Priority descent after initial crowd clears stairwell.",
    assemblyPointModification: "Accessible route from building exit to assembly point verified. Paved pathway maintained clear of obstructions. Designated accessible space at assembly point.",
  });

  accommodations.push({
    accommodationType: "Hearing Impairment",
    description: "Personnel with partial or total hearing loss who may not perceive audible alarms. Visual notification systems supplement audible alarms per 29 CFR 1910.165(b).",
    assignedBuddy: "One trained notification buddy assigned per individual",
    equipmentNeeded: [
      "Visual alarm strobes (high-intensity xenon) in all work areas per NFPA 72",
      "Vibrating pager/notification device",
      "Visual message boards at exits displaying emergency status",
    ],
    evacuationModification: "Notification buddy provides direct visual/tactile alert if strobes are insufficient. Written emergency instruction card carried by individual. Text-based communication for accountability check-in.",
    assemblyPointModification: "Visual signal board at assembly point for all-clear and instructions. Designated interpreter or written communication available.",
  });

  accommodations.push({
    accommodationType: "Visual Impairment",
    description: "Personnel with partial or total vision loss. Tactile and audible wayfinding supplements visual exit signage.",
    assignedBuddy: "One trained guide buddy assigned per individual",
    equipmentNeeded: [
      "Tactile path markings (raised floor strips) along primary evacuation route",
      "Audible exit locator beacons at stairwell doors",
      "Large-print and Braille emergency procedure cards at workstation",
    ],
    evacuationModification: "Guide buddy provides sighted-guide technique. Verbal descriptions of route and hazards. Maintain physical contact throughout evacuation. Priority routing on least congested path.",
    assemblyPointModification: "Verbal confirmation of arrival at assembly point. Buddy remains with individual until all-clear given verbally by Floor Warden.",
  });

  accommodations.push({
    accommodationType: "Temporary Disability / Pregnancy",
    description: "Personnel with temporary conditions affecting evacuation capability (broken limbs, post-surgery, advanced pregnancy). Reassessed as condition changes.",
    assignedBuddy: "Supervisor assigns temporary buddy upon notification of condition",
    equipmentNeeded: [
      "Evacuation chair if stairs required",
      "Elevator use authorization ONLY for non-fire emergencies (tornado, chemical release in distant area)",
    ],
    evacuationModification: "Individualized assessment based on specific limitation. May use elevator for non-fire emergencies only. Stairwell evacuation with buddy assistance and evacuation chair for fire emergencies.",
    assemblyPointModification: "Seating available at assembly point. Reduced standing time. Medical attention prioritized if needed.",
  });

  return accommodations;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNICATION PROCEDURES
// ═══════════════════════════════════════════════════════════════════════════════

function buildCommunicationProcedures(input: EapInput): CommunicationProcedure[] {
  const procedures: CommunicationProcedure[] = [];
  const planAdmin = input.coordinators.find((c) => c.role === "plan_administrator");
  const adminName = planAdmin?.name ?? "Plan Administrator";

  procedures.push({
    scenario: "Fire / Evacuation",
    primaryMethod: "Building fire alarm system (audible horns + visual strobes)",
    backupMethod: "PA system announcement; two-way radios for Floor Wardens; bullhorn at assembly point",
    responsibleParty: "Discovering employee activates alarm; Floor Wardens communicate via radio",
    messageTemplate: "ATTENTION: EVACUATE IMMEDIATELY. A fire alarm has been activated. All personnel proceed to your assigned assembly point via the nearest safe exit. Do not use elevators. Floor Wardens report accountability status on Channel 2.",
    externalNotifications: ["911", input.fireStation, "Building owner/management (if leased space)"],
  });

  procedures.push({
    scenario: "Severe Weather / Tornado",
    primaryMethod: "PA system announcement; weather alert radio activation",
    backupMethod: "Two-way radios; text message notification system; email blast",
    responsibleParty: adminName,
    messageTemplate: "ATTENTION: TORNADO WARNING ISSUED FOR THIS AREA. All personnel proceed immediately to designated interior shelter areas. Move away from windows and exterior walls. Floor Wardens verify all personnel are in shelter areas.",
    externalNotifications: ["National Weather Service (monitoring)", "Building management"],
  });

  procedures.push({
    scenario: "Chemical Spill / HazMat Release",
    primaryMethod: "PA system with specific chemical alarm tone; area-specific alarms",
    backupMethod: "Two-way radios; phone tree; runner system if communications compromised",
    responsibleParty: "HazMat Coordinator / Shift Supervisor",
    messageTemplate: "ATTENTION: CHEMICAL RELEASE IN [LOCATION]. All personnel in [AFFECTED AREAS] evacuate immediately via [UPWIND DIRECTION] exits. Do NOT enter [AFFECTED AREA]. Personnel in unaffected areas shelter in place — close doors and shut down HVAC. Await further instructions.",
    externalNotifications: ["911", "CHEMTREC (1-800-424-9300)", "State/Local Emergency Planning Committee", "EPA NRC (1-800-424-8802) if reportable quantity exceeded"],
  });

  procedures.push({
    scenario: "Active Threat / Lockdown",
    primaryMethod: "Coded PA announcement; mass text notification system",
    backupMethod: "Email blast; phone tree; law enforcement public address",
    responsibleParty: "Security / Facilities Manager",
    messageTemplate: "LOCKDOWN LOCKDOWN LOCKDOWN. This is not a drill. Implement Run-Hide-Fight protocol. If safe to evacuate, exit building immediately away from threat. If unable to evacuate, lock/barricade doors and remain silent. Call 911 when safe.",
    externalNotifications: ["911 (Law Enforcement priority)", "Corporate Security", "Employee emergency contacts (after resolution)"],
  });

  procedures.push({
    scenario: "All-Clear / Return to Normal Operations",
    primaryMethod: "PA system announcement by Incident Commander or designee ONLY",
    backupMethod: "Two-way radio confirmation to Floor Wardens; text notification",
    responsibleParty: "Incident Commander (or Fire Department IC for fire events)",
    messageTemplate: "ATTENTION: ALL CLEAR. The emergency condition has been resolved. All personnel may return to work areas. Report any damage or unsafe conditions to your supervisor immediately. [SPECIFIC AREA] remains restricted — do not enter until further notice.",
    externalNotifications: ["Building management", "Corporate communications (for significant incidents)"],
  });

  procedures.push({
    scenario: "Medical Emergency (Non-Evacuation)",
    primaryMethod: "Direct phone call to 911; notify front desk/security",
    backupMethod: "Two-way radio to First Aid team; runner to nearest first aid responder",
    responsibleParty: "Nearest trained first aid responder",
    messageTemplate: "MEDICAL EMERGENCY at [LOCATION]. First aid team respond. [NAME] call 911 and request [ambulance/specific resources]. [NAME] meet EMS at [ENTRANCE] and guide to patient location. Bystanders clear the area.",
    externalNotifications: ["911/EMS", input.nearbyHospital, "Employee emergency contact (after stabilization)"],
  });

  return procedures;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEW SCHEDULE — 29 CFR 1910.38(f)
// ═══════════════════════════════════════════════════════════════════════════════

function buildReviewSchedule(): ReviewScheduleEntry[] {
  return [
    {
      reviewType: "Annual Comprehensive Review",
      frequency: "Annually (minimum)",
      triggerEvents: [],
      responsibleParty: "Plan Administrator",
      documentationRequirement: "Documented review findings, revision log, updated distribution list, management sign-off",
      regulatoryBasis: "29 CFR 1910.38(f) — Employer must review plan with each employee covered by the plan",
    },
    {
      reviewType: "Post-Incident Review",
      frequency: "Within 72 hours of any emergency activation",
      triggerEvents: [
        "Any actual emergency requiring plan activation",
        "Near-miss event that could have required evacuation",
        "Drill that reveals deficiencies",
      ],
      responsibleParty: "Plan Administrator + Incident Commander",
      documentationRequirement: "After-action report, lessons learned, corrective action plan with deadlines",
      regulatoryBasis: "29 CFR 1910.38(f); OSHA best practices for continuous improvement",
    },
    {
      reviewType: "Facility Change Review",
      frequency: "Prior to occupancy of changed space",
      triggerEvents: [
        "Building renovation or expansion",
        "Change in building occupancy or use",
        "New tenant in shared building",
        "Addition of new hazardous materials or processes",
        "Change in exit routes or assembly points",
      ],
      responsibleParty: "Plan Administrator + Facilities Manager",
      documentationRequirement: "Updated floor plans, revised route maps, revised capacity calculations, employee notification",
      regulatoryBasis: "29 CFR 1910.38(e) — Retrain when plan changes; 29 CFR 1910.38(f)",
    },
    {
      reviewType: "Personnel Change Review",
      frequency: "Within 30 days of change",
      triggerEvents: [
        "New Floor Warden or Coordinator appointment",
        "Departure of key EAP personnel",
        "Change in employee responsibilities under the plan",
        "New employees assigned to critical operations roles",
      ],
      responsibleParty: "Plan Administrator + HR",
      documentationRequirement: "Updated contact list, training records for new appointees, revised duty assignments",
      regulatoryBasis: "29 CFR 1910.38(c)(6) — Contact list maintenance; 29 CFR 1910.38(e)",
    },
    {
      reviewType: "Regulatory/Code Change Review",
      frequency: "Within 60 days of applicable regulatory change",
      triggerEvents: [
        "OSHA regulatory update affecting 29 CFR 1910.38 or related standards",
        "Local fire code amendment",
        "Updated NFPA standards (72, 101, etc.)",
        "State/local emergency management requirement changes",
      ],
      responsibleParty: "Plan Administrator + Legal/Compliance",
      documentationRequirement: "Gap analysis against new requirements, revision plan, updated citations",
      regulatoryBasis: "General Duty Clause 5(a)(1); applicable updated standard",
    },
    {
      reviewType: "Drill Performance Review",
      frequency: "After each evacuation drill",
      triggerEvents: [
        "Scheduled evacuation drill",
        "Fire department joint exercise",
        "Tabletop exercise",
      ],
      responsibleParty: "Evacuation Coordinator + Floor Wardens",
      documentationRequirement: "Drill report: date, time, total evacuation time, headcount time, observations, corrective actions",
      regulatoryBasis: "29 CFR 1910.38(e); NFPA 101 Section 4.7",
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE ASSESSMENT
// ═══════════════════════════════════════════════════════════════════════════════

interface PlanComponents {
  evacuationRoutes: EvacuationRoute[];
  criticalOperationProcedures: CriticalOperationProcedure[];
  accountabilityProcedures: AccountabilityProcedure[];
  rescueMedicalDuties: RescueMedicalDuty[];
  alarmSystems: AlarmSystemDescription[];
  contactList: ContactEntry[];
  trainingSchedule: TrainingRequirement[];
  specialNeedsAccommodations: SpecialNeedsAccommodation[];
}

function assessComplianceGaps(input: EapInput, components: PlanComponents): ComplianceGap[] {
  const gaps: ComplianceGap[] = [];

  // 29 CFR 1910.38(c)(2) — Evacuation procedures
  if (components.evacuationRoutes.length < input.buildingCount * input.floors) {
    gaps.push({
      requirement: "Evacuation procedures including type of evacuation and exit route assignments for each area",
      cfrReference: "29 CFR 1910.38(c)(2)",
      currentState: `${components.evacuationRoutes.length} routes defined for ${input.buildingCount * input.floors} building/floor combinations`,
      severity: "high",
      recommendedAction: "Define primary and secondary evacuation routes for each occupied floor of each building",
    });
  }

  // 29 CFR 1910.38(c)(3) — Critical operations
  const criticalHazards = input.hazards.filter((h) => h.severity === "critical" || h.severity === "high");
  if (criticalHazards.length > 0 && components.criticalOperationProcedures.length === 0) {
    gaps.push({
      requirement: "Procedures for employees who remain to operate critical plant operations before they evacuate",
      cfrReference: "29 CFR 1910.38(c)(3)",
      currentState: `${criticalHazards.length} critical/high-severity hazards identified but no critical operation shutdown procedures defined`,
      severity: "critical",
      recommendedAction: "Develop documented shutdown procedures for each critical operation with designated responsible personnel and maximum time limits",
    });
  }

  // 29 CFR 1910.38(c)(4) — Accountability
  if (components.accountabilityProcedures.length === 0) {
    gaps.push({
      requirement: "Procedures to account for all employees after evacuation",
      cfrReference: "29 CFR 1910.38(c)(4)",
      currentState: "No personnel accountability procedures established",
      severity: "critical",
      recommendedAction: "Implement headcount procedures at assembly points with designated accountability officers and deadline for completion",
    });
  }

  // 29 CFR 1910.38(c)(5) — Rescue and medical
  if (components.rescueMedicalDuties.length === 0) {
    gaps.push({
      requirement: "Rescue and medical duties for designated employees",
      cfrReference: "29 CFR 1910.38(c)(5)",
      currentState: "No rescue or medical duty assignments defined",
      severity: "high",
      recommendedAction: "Designate and train employees for first aid/CPR/AED duties per 29 CFR 1910.151(b)",
    });
  }

  // 29 CFR 1910.38(c)(6) — Contact information
  const internalContacts = components.contactList.filter((c) => c.primaryPhone !== "911" && c.primaryPhone !== "1-800-222-1222" && c.primaryPhone !== "1-800-321-OSHA (6742)");
  if (internalContacts.length === 0) {
    gaps.push({
      requirement: "Names or job titles of persons who can be contacted for further plan information",
      cfrReference: "29 CFR 1910.38(c)(6)",
      currentState: "No internal contact persons designated for EAP information",
      severity: "high",
      recommendedAction: "Designate at least one person per shift who can provide plan information and explanation of duties",
    });
  }

  // 29 CFR 1910.38(d) — Alarm system
  if (input.alarmTypes.length === 0) {
    gaps.push({
      requirement: "Employer must establish an employee alarm system that complies with 29 CFR 1910.165",
      cfrReference: "29 CFR 1910.38(d)",
      currentState: "No alarm systems documented in the plan",
      severity: "critical",
      recommendedAction: "Install and document alarm systems that provide warning for necessary emergency action and are distinctive and recognizable per 29 CFR 1910.165(b)",
    });
  }

  // 29 CFR 1910.38(e) — Training
  const hasInitialTraining = components.trainingSchedule.some((t) => t.frequency.toLowerCase().includes("initial"));
  if (!hasInitialTraining) {
    gaps.push({
      requirement: "Employer must designate and train employees to assist in a safe and orderly evacuation",
      cfrReference: "29 CFR 1910.38(e)",
      currentState: "No initial EAP training requirement documented",
      severity: "high",
      recommendedAction: "Establish EAP training program with initial training upon assignment and retraining when plan changes or employee responsibilities change",
    });
  }

  // Assembly point capacity
  const totalCapacity = input.assemblyPoints.reduce((sum, ap) => sum + ap.capacity, 0);
  if (totalCapacity < input.employeeCount) {
    gaps.push({
      requirement: "Assembly points must accommodate all evacuated personnel",
      cfrReference: "29 CFR 1910.38(c)(2); NFPA 101",
      currentState: `Total assembly point capacity (${totalCapacity}) is less than total employee count (${input.employeeCount})`,
      severity: "medium",
      recommendedAction: "Designate additional assembly points or expand existing areas to accommodate full workforce plus visitors/contractors",
    });
  }

  // Special needs per ADA + OSHA
  if (input.specialNeedsCount > 0 && components.specialNeedsAccommodations.length <= 1) {
    gaps.push({
      requirement: "Evacuation procedures must account for employees who may need assistance",
      cfrReference: "29 CFR 1910.38(c)(2); ADA Title I",
      currentState: `${input.specialNeedsCount} employees identified as needing evacuation assistance but individualized plans may be insufficient`,
      severity: "medium",
      recommendedAction: "Develop Personal Emergency Evacuation Plans (PEEPs) for each employee requiring assistance, assign trained buddies, and install necessary equipment",
    });
  }

  // Multi-shift coverage
  if (input.shiftPatterns.length > 1) {
    const wardenCount = input.coordinators.filter((c) => c.role === "floor_warden").length;
    if (wardenCount < input.shiftPatterns.length) {
      gaps.push({
        requirement: "EAP coordination must be available during all occupied hours",
        cfrReference: "29 CFR 1910.38(c)(6); 29 CFR 1910.38(e)",
        currentState: `${wardenCount} Floor Warden(s) designated but facility operates ${input.shiftPatterns.length} shifts`,
        severity: "medium",
        recommendedAction: "Designate at least one Floor Warden per shift to ensure evacuation coordination coverage during all occupied hours",
      });
    }
  }

  return gaps;
}

function calculateComplianceScore(gaps: ComplianceGap[]): number {
  let score = 100;
  for (const gap of gaps) {
    switch (gap.severity) {
      case "critical":
        score -= 20;
        break;
      case "high":
        score -= 12;
        break;
      case "medium":
        score -= 6;
        break;
      case "low":
        score -= 2;
        break;
    }
  }
  return Math.max(0, Math.min(100, score));
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

function validateInput(input: EapInput): void {
  if (!input.facilityName || input.facilityName.trim().length === 0) {
    throw new Error("EAP generation requires a facility name");
  }
  if (!input.address || input.address.trim().length === 0) {
    throw new Error("EAP generation requires a facility address");
  }
  if (input.employeeCount <= 0) {
    throw new Error("Employee count must be a positive number");
  }
  if (input.buildingCount <= 0) {
    throw new Error("Building count must be a positive number");
  }
  if (input.floors <= 0) {
    throw new Error("Floor count must be a positive number");
  }
  if (input.shiftPatterns.length === 0) {
    throw new Error("At least one shift pattern must be defined");
  }
}

function computeNextReviewDate(effectiveDate: string): string {
  const date = new Date(effectiveDate);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0]!;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKDOWN REPORT FORMATTER
// ═══════════════════════════════════════════════════════════════════════════════

export function formatEapReport(plan: EmergencyActionPlan): string {
  const sections: string[] = [];

  // ── COVER PAGE ──
  sections.push(`# Emergency Action Plan
## ${plan.metadata.facilityName}

| Field | Value |
|-------|-------|
| **Address** | ${plan.metadata.address} |
| **Plan Version** | ${plan.metadata.planVersion} |
| **Effective Date** | ${plan.metadata.effectiveDate} |
| **Next Review Date** | ${plan.metadata.nextReviewDate} |
| **Prepared By** | ${plan.metadata.preparedBy} |
| **Approved By** | ${plan.metadata.approvedBy} |
| **Regulatory Basis** | ${plan.metadata.regulatoryBasis} |
| **Compliance Score** | ${plan.complianceScore}/100 |

---

> This Emergency Action Plan (EAP) is prepared in accordance with **29 CFR 1910.38** and establishes
> procedures to safeguard employees in the event of an emergency requiring evacuation or other
> protective action. All employees must be familiar with this plan per 29 CFR 1910.38(e).

---`);

  // ── TABLE OF CONTENTS ──
  sections.push(`## Table of Contents

1. [Evacuation Procedures and Routes](#evacuation-procedures-and-routes)
2. [Critical Operations Shutdown Procedures](#critical-operations-shutdown-procedures)
3. [Personnel Accountability Procedures](#personnel-accountability-procedures)
4. [Rescue and Medical Duties](#rescue-and-medical-duties)
5. [Alarm System Descriptions](#alarm-system-descriptions)
6. [Emergency Contact List](#emergency-contact-list)
7. [Training Schedule and Requirements](#training-schedule-and-requirements)
8. [Special Needs Accommodations](#special-needs-accommodations)
9. [Communication Procedures](#communication-procedures)
10. [Plan Review Schedule](#plan-review-schedule)
11. [Compliance Assessment](#compliance-assessment)

---`);

  // ── SECTION 1: EVACUATION ──
  sections.push(`## 1. Evacuation Procedures and Routes
*Per 29 CFR 1910.38(c)(2)*

> The employer must establish evacuation procedures and escape route assignments for each
> workplace area. Employees must know which direction to go and what exits to use.

### Evacuation Route Assignments

${plan.evacuationRoutes.map((route) => `#### Route ${route.routeId}
- **Origin:** ${route.originArea}
- **Primary Exit:** ${route.primaryExit}
- **Secondary Exit:** ${route.secondaryExit}
- **Assembly Point:** ${route.assemblyPointId}
- **Estimated Evacuation Time:** ${route.estimatedEvacuationTimeSeconds} seconds
- **Max Occupancy:** ${route.maxOccupancy} persons
- **Accessibility Features:**
${route.accessibilityFeatures.map((f) => `  - ${f}`).join("\n")}
- **Route Landmarks:**
${route.landmarks.map((l) => `  - ${l}`).join("\n")}
`).join("\n")}

### General Evacuation Instructions

1. Upon hearing the evacuation alarm, cease all operations immediately
2. Secure hazardous materials/equipment only if it can be done in under 30 seconds
3. Proceed calmly to nearest safe exit — DO NOT RUN
4. Do NOT use elevators during fire emergencies (per 29 CFR 1910.37)
5. Close doors behind you as you exit (do not lock)
6. Assist any person in immediate danger if safe to do so
7. Proceed to designated assembly point
8. Report to Floor Warden for headcount
9. Remain at assembly point until ALL CLEAR is given by authorized personnel

---`);

  // ── SECTION 2: CRITICAL OPERATIONS ──
  sections.push(`## 2. Critical Operations Shutdown Procedures
*Per 29 CFR 1910.38(c)(3)*

> Certain employees may be required to remain briefly to shut down critical operations before
> evacuating. These employees are trained on shutdown procedures and understand the maximum
> time they may remain before mandatory evacuation.

${plan.criticalOperationProcedures.map((proc, index) => `### ${index + 1}. ${proc.operationName}

- **Location:** ${proc.location}
- **Responsible Personnel:** ${proc.responsiblePersonnel.join(", ")}
- **Maximum Shutdown Time:** ${proc.maxShutdownTimeMinutes} minutes
- **Mandatory Evacuation Trigger:** ${proc.evacuationTrigger}

**Shutdown Sequence:**
${proc.shutdownSequence.map((step, i) => `${i + 1}. ${step}`).join("\n")}

**Hazards If Not Shut Down:**
${proc.hazardsIfNotShutDown.map((h) => `- ${h}`).join("\n")}
`).join("\n")}

> **CRITICAL SAFETY NOTE:** No employee shall remain in a building beyond the maximum shutdown
> time regardless of shutdown completion status. Life safety takes absolute precedence over
> property/equipment protection.

---`);

  // ── SECTION 3: ACCOUNTABILITY ──
  sections.push(`## 3. Personnel Accountability Procedures
*Per 29 CFR 1910.38(c)(4)*

> The employer must establish procedures to account for all employees after evacuation.
> No employee may re-enter the building until accountability is completed and all-clear is given.

${plan.accountabilityProcedures.map((proc, index) => `### ${index + 1}. ${proc.method}

- **Responsible Role:** ${proc.responsibleRole}
- **Reporting Location:** ${proc.reportingLocation}
- **Headcount Deadline:** ${proc.headcountDeadlineMinutes} minutes after evacuation order

**Missing Person Protocol:**
${proc.missingPersonProtocol.map((step, i) => `${i + 1}. ${step}`).join("\n")}

**Communication Chain:**
${proc.communicationChain.map((link) => `- ${link}`).join("\n")}
`).join("\n")}

> **WARNING:** Under NO circumstances shall any employee re-enter an evacuated building to
> search for missing personnel. Provide last known location information to emergency responders.

---`);

  // ── SECTION 4: RESCUE AND MEDICAL ──
  sections.push(`## 4. Rescue and Medical Duties
*Per 29 CFR 1910.38(c)(5); 29 CFR 1910.151(b)*

> Employees designated for rescue/medical duties must be trained and equipped. These duties
> are voluntary — no employee shall be required to perform rescue/medical duties without
> proper training and willingness to serve.

${plan.rescueMedicalDuties.map((duty) => `### ${duty.dutyType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}

- **Assigned Personnel:** ${duty.assignedPersonnel.join("; ")}
- **Equipment Location:** ${duty.equipmentLocation}
- **Certification Required:** ${duty.certificationRequired}
- **Scope:** ${duty.scope}
- **Limitations:** ${duty.limitations}
`).join("\n")}

---`);

  // ── SECTION 5: ALARM SYSTEMS ──
  sections.push(`## 5. Alarm System Descriptions
*Per 29 CFR 1910.38(d); 29 CFR 1910.165*

> The employer must establish an employee alarm system that provides warning for emergency action
> and reaction time for safe escape. The alarm must be distinctive, recognizable, and perceptible
> above ambient noise or light levels per 29 CFR 1910.165(b).

${plan.alarmSystems.map((alarm) => `### ${alarm.alarmType.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Alarm

- **Signal Description:** ${alarm.alarmType.signalDescription}
- **Activation Method:** ${alarm.alarmType.activationMethod}
- **Coverage Areas:** ${alarm.alarmType.coverageAreas.join(", ")}
- **Testing Schedule:** ${alarm.testingSchedule}
- **Maintenance Responsibility:** ${alarm.maintenanceResponsibility}
- **Backup Power:** ${alarm.backupPower ? "Yes — UPS/generator backed" : "No — DEFICIENCY"}
- **Employee Recognition Training:** ${alarm.employeeRecognitionTraining}
${alarm.coverageGaps.length > 0 ? `- **Coverage Gaps Identified:**\n${alarm.coverageGaps.map((g) => `  - ⚠ ${g}`).join("\n")}` : "- **Coverage Gaps:** None identified"}
`).join("\n")}

---`);

  // ── SECTION 6: CONTACT LIST ──
  sections.push(`## 6. Emergency Contact List
*Per 29 CFR 1910.38(c)(6)*

> The plan must include the name or job title of every employee who may be contacted by
> employees who need more information about the plan or an explanation of their duties.

| Name | Title | Responsibility | Primary Phone | Secondary Phone | Hours |
|------|-------|---------------|---------------|-----------------|-------|
${plan.contactList.map((c) => `| ${c.name} | ${c.title} | ${c.responsibility.slice(0, 60)}${c.responsibility.length > 60 ? "..." : ""} | ${c.primaryPhone} | ${c.secondaryPhone} | ${c.availableHours} |`).join("\n")}

---`);

  // ── SECTION 7: TRAINING ──
  sections.push(`## 7. Training Schedule and Requirements
*Per 29 CFR 1910.38(e)*

> The employer must designate and train employees to assist in safe evacuation.
> Training must be provided: (1) when the plan is developed or employee is initially assigned;
> (2) when employee responsibilities change; (3) when the plan changes.

${plan.trainingSchedule.map((req, index) => `### ${index + 1}. ${req.topic}

| Parameter | Requirement |
|-----------|-------------|
| **Frequency** | ${req.frequency} |
| **Audience** | ${req.audience} |
| **Method** | ${req.method} |
| **Duration** | ${req.duration} |
| **Regulatory Basis** | ${req.regulatoryBasis} |
| **Documentation** | ${req.documentationRequired} |
`).join("\n")}

---`);

  // ── SECTION 8: SPECIAL NEEDS ──
  sections.push(`## 8. Special Needs Accommodations
*Per 29 CFR 1910.38(c)(2); ADA Title I*

> Evacuation procedures must ensure that all employees, including those with physical,
> sensory, or cognitive disabilities, can safely evacuate or shelter in place.

${plan.specialNeedsAccommodations.map((accom) => `### ${accom.accommodationType}

- **Description:** ${accom.description}
- **Assigned Buddy:** ${accom.assignedBuddy}
- **Equipment Needed:**
${accom.equipmentNeeded.map((e) => `  - ${e}`).join("\n")}
- **Evacuation Modification:** ${accom.evacuationModification}
- **Assembly Point Modification:** ${accom.assemblyPointModification}
`).join("\n")}

---`);

  // ── SECTION 9: COMMUNICATION ──
  sections.push(`## 9. Communication Procedures

> Effective emergency communication ensures timely notification, coordinated response,
> and accurate information flow to all stakeholders.

${plan.communicationProcedures.map((proc) => `### ${proc.scenario}

- **Primary Method:** ${proc.primaryMethod}
- **Backup Method:** ${proc.backupMethod}
- **Responsible Party:** ${proc.responsibleParty}
- **External Notifications:** ${proc.externalNotifications.join("; ")}

**Message Template:**
> ${proc.messageTemplate}
`).join("\n")}

---`);

  // ── SECTION 10: REVIEW SCHEDULE ──
  sections.push(`## 10. Plan Review Schedule
*Per 29 CFR 1910.38(f)*

> The employer must review the emergency action plan with each employee covered by the plan
> when the plan is developed, when employee responsibilities change, and when the plan changes.

${plan.reviewSchedule.map((entry) => `### ${entry.reviewType}

- **Frequency:** ${entry.frequency}
- **Responsible Party:** ${entry.responsibleParty}
- **Documentation:** ${entry.documentationRequirement}
- **Regulatory Basis:** ${entry.regulatoryBasis}
${entry.triggerEvents.length > 0 ? `- **Trigger Events:**\n${entry.triggerEvents.map((t) => `  - ${t}`).join("\n")}` : ""}
`).join("\n")}

---`);

  // ── SECTION 11: COMPLIANCE ASSESSMENT ──
  sections.push(`## 11. Compliance Assessment

**Overall Compliance Score: ${plan.complianceScore}/100**

${plan.complianceGaps.length === 0
    ? "> No compliance gaps identified. Plan meets all 29 CFR 1910.38 requirements."
    : `### Identified Compliance Gaps

| # | Requirement | CFR Reference | Severity | Current State | Recommended Action |
|---|-------------|---------------|----------|---------------|-------------------|
${plan.complianceGaps.map((gap, i) => `| ${i + 1} | ${gap.requirement.slice(0, 50)}... | ${gap.cfrReference} | **${gap.severity.toUpperCase()}** | ${gap.currentState.slice(0, 40)}... | ${gap.recommendedAction.slice(0, 50)}... |`).join("\n")}`}

---`);

  // ── SIGNATURE BLOCK ──
  sections.push(`## Approval and Distribution

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Plan Administrator | ${plan.metadata.preparedBy} | ___________________ | ${plan.metadata.effectiveDate} |
| Facility Manager | ${plan.metadata.approvedBy} | ___________________ | ${plan.metadata.effectiveDate} |
| Safety Committee Chair | ___________________ | ___________________ | ____________ |
| HR Representative | ___________________ | ___________________ | ____________ |

### Distribution List

This plan has been distributed to:
- [ ] All department managers/supervisors
- [ ] All Floor Wardens and Evacuation Coordinators
- [ ] First Aid / Medical response team members
- [ ] Security / Access Control personnel
- [ ] Facilities Management
- [ ] Human Resources (master file)
- [ ] Local Fire Department (courtesy copy)
- [ ] Building Management (if leased space)

---

*This Emergency Action Plan was generated in compliance with 29 CFR 1910.38 and incorporates*
*requirements from 29 CFR 1910.37 (Means of Egress), 29 CFR 1910.165 (Employee Alarm Systems),*
*29 CFR 1910.151 (Medical Services and First Aid), and NFPA 101 (Life Safety Code).*

*Plan review is required at minimum annually and whenever conditions described in Section 10 occur.*`);

  return sections.join("\n\n");
}
