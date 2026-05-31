import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://complibot:complibot@localhost:5432/complibot";

async function seed(): Promise<void> {
  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  console.log("Seeding database...");

  const orgId = uuidv4();
  const facilityId = uuidv4();
  const userId = uuidv4();
  const projectId = uuidv4();

  // Create sample organization
  await db.execute(sql`
    INSERT INTO organizations (id, name, industry, size, locations)
    VALUES (${orgId}, 'Acme Manufacturing Corp', 'Manufacturing', 'mid-market', 3)
    ON CONFLICT DO NOTHING;
  `);

  // Create sample facility
  await db.execute(sql`
    INSERT INTO facilities (id, org_id, name, address, city, state, zip, facility_type, employee_count, naics_code)
    VALUES (${facilityId}, ${orgId}, 'Acme Plant #1 - Houston', '4500 Industrial Blvd', 'Houston', 'TX', '77001', 'Manufacturing Plant', 245, '332710')
    ON CONFLICT DO NOTHING;
  `);

  // Create sample user (password: "complibot123" hashed with bcrypt)
  await db.execute(sql`
    INSERT INTO users (id, org_id, email, password_hash, name, role)
    VALUES (${userId}, ${orgId}, 'admin@acmemfg.com', '$2b$10$Z0cwg3JYLaMMM6y5kKygD.BiXWrxHt2HPuG63cffamIKOIvZM9wsW', 'Sarah Johnson', 'admin')
    ON CONFLICT (email) DO NOTHING;
  `);

  // Create sample project
  await db.execute(sql`
    INSERT INTO projects (id, org_id, facility_id, name, type, status, description, date_range_start, date_range_end, due_date)
    VALUES (${projectId}, ${orgId}, ${facilityId}, '2026 OSHA 300 Annual Log', 'OSHA_300', 'in_progress', 'Annual OSHA 300 Log compilation for Houston plant', '2026-01-01', '2026-12-31', '2027-02-01')
    ON CONFLICT DO NOTHING;
  `);

  // Seed regulatory requirements
  const regs = [
    {
      standard: "OSHA",
      section: "29 CFR 1904.7",
      title: "General Recording Criteria for Cases",
      description: "Each employer required by this part to keep records of fatalities, injuries, and illnesses must record each fatality, injury and illness that is work-related, is a new case, and meets one or more of the general recording criteria.",
      applicability: "All employers with more than 10 employees",
      frequency: "Ongoing (within 7 days of receiving information)",
      penalties: "Up to $15,625 per violation (2024 adjusted)",
    },
    {
      standard: "OSHA",
      section: "29 CFR 1904.29",
      title: "Forms",
      description: "Employers must use OSHA 300 (Log of Work-Related Injuries and Illnesses), OSHA 300A (Summary of Work-Related Injuries and Illnesses), and OSHA 301 (Injury and Illness Incident Report) forms, or equivalent forms.",
      applicability: "All covered employers",
      frequency: "Annual summary posted February 1 - April 30",
      penalties: "Up to $15,625 per violation",
    },
    {
      standard: "OSHA",
      section: "29 CFR 1904.32",
      title: "Annual Summary",
      description: "At the end of each calendar year, the employer must review the OSHA 300 Log, verify entries are complete and accurate, and certify the summary using the OSHA 300A form.",
      applicability: "All covered employers",
      frequency: "Annual (certify by February 1)",
      penalties: "Up to $15,625 per violation",
    },
    {
      standard: "OSHA",
      section: "29 CFR 1910.147",
      title: "Control of Hazardous Energy (Lockout/Tagout)",
      description: "Covers the servicing and maintenance of machines and equipment in which the unexpected energization or start up of the machines or equipment, or release of stored energy, could harm employees.",
      applicability: "General industry employers with machinery requiring servicing",
      frequency: "Annual inspection of energy control procedures",
      penalties: "Up to $156,259 for willful violations",
    },
    {
      standard: "OSHA",
      section: "29 CFR 1910.134",
      title: "Respiratory Protection",
      description: "Employers must establish and maintain a respiratory protection program for employees required to use respirators, including medical evaluations, fit testing, and training.",
      applicability: "Employers where respirators are necessary",
      frequency: "Annual fit testing; training as needed",
      penalties: "Up to $15,625 per serious violation",
    },
    {
      standard: "OSHA",
      section: "29 CFR 1926.501",
      title: "Fall Protection - Duty to Have Fall Protection",
      description: "Each employee on a walking/working surface with an unprotected side or edge which is 6 feet or more above a lower level shall be protected from falling by the use of guardrail systems, safety net systems, or personal fall arrest systems.",
      applicability: "Construction employers",
      frequency: "Continuous compliance required",
      penalties: "Up to $15,625 per serious violation",
    },
    {
      standard: "EPA",
      section: "40 CFR 370.40",
      title: "Tier II Reporting - What information must I provide?",
      description: "Facilities must report the maximum amount and average daily amount of hazardous chemicals present at the facility, the location of hazardous chemicals, and storage conditions.",
      applicability: "Facilities with hazardous chemicals above threshold planning quantities",
      frequency: "Annual (due March 1)",
      penalties: "Up to $62,689 per day of violation",
    },
    {
      standard: "EPA",
      section: "40 CFR 370.30",
      title: "Tier II Reporting - Who must comply?",
      description: "The owner or operator of a facility that is required to prepare or have available a Material Safety Data Sheet (MSDS/SDS) under OSHA HazCom standard and where hazardous chemicals are present above threshold quantities.",
      applicability: "Facilities storing EHS chemicals above TPQs or hazardous chemicals above 10,000 lbs",
      frequency: "Annual reporting",
      penalties: "Up to $62,689 per day for failure to report",
    },
    {
      standard: "EPA",
      section: "40 CFR 68",
      title: "Chemical Accident Prevention - Risk Management Plan",
      description: "Facilities that use extremely hazardous substances must develop a Risk Management Plan that includes a hazard assessment, prevention program, and emergency response program.",
      applicability: "Facilities with listed substances above threshold quantities",
      frequency: "Updated every 5 years or after significant changes",
      penalties: "Up to $62,689 per day of violation",
    },
    {
      standard: "OSHA",
      section: "29 CFR 1910.146",
      title: "Permit-Required Confined Spaces",
      description: "Employers must evaluate the workplace to determine if any spaces are permit-required confined spaces, and implement a written permit space program.",
      applicability: "General industry with confined spaces",
      frequency: "Annual review of permit space program; entry permits per entry",
      penalties: "Up to $15,625 per serious violation",
    },
    {
      standard: "OSHA",
      section: "29 CFR 1910.303-308",
      title: "Electrical Safety - Design and Installation",
      description: "Electrical equipment shall be free from recognized hazards, properly installed, and maintained in a safe condition. Covers wiring design, protection, methods, and equipment.",
      applicability: "All general industry employers",
      frequency: "Continuous compliance; periodic inspections recommended",
      penalties: "Up to $15,625 per serious violation",
    },
    {
      standard: "OSHA",
      section: "29 CFR 1910.179",
      title: "Overhead and Gantry Cranes",
      description: "Covers overhead and gantry cranes, including design, inspection, testing, maintenance, and operation requirements. Requires periodic and frequent inspections.",
      applicability: "Facilities with overhead or gantry cranes",
      frequency: "Daily (frequent) and monthly/annual (periodic) inspections",
      penalties: "Up to $15,625 per serious violation",
    },
  ];

  for (const reg of regs) {
    await db.execute(sql`
      INSERT INTO regulatory_requirements (id, standard, section, title, description, applicability, frequency, penalties)
      VALUES (${uuidv4()}, ${reg.standard}, ${reg.section}, ${reg.title}, ${reg.description}, ${reg.applicability}, ${reg.frequency}, ${reg.penalties})
    `);
  }

  // Seed some compliance gaps for the project
  const gaps = [
    {
      standard: "29 CFR 1904.7",
      requirement: "Record all work-related injuries resulting in days away from work within 7 calendar days",
      currentState: "3 incidents from Q2 were recorded 12-15 days after occurrence",
      severity: "high" as const,
      recommendedAction: "Implement automated incident notification system with 48-hour recording reminder escalation",
    },
    {
      standard: "29 CFR 1904.29",
      requirement: "Maintain OSHA 300 Log with complete and accurate entries for all recordable cases",
      currentState: "Log entries missing employee department for 5 cases; 2 cases lack injury classification",
      severity: "medium" as const,
      recommendedAction: "Audit all current year entries for completeness; update intake form to require all OSHA fields",
    },
    {
      standard: "29 CFR 1910.147",
      requirement: "Annual inspection of energy control procedures by authorized employee",
      currentState: "Last LOTO procedure audit was 14 months ago; 2 new machines added without procedures",
      severity: "critical" as const,
      recommendedAction: "Immediately schedule LOTO audit; develop energy control procedures for new CNC machines before next shift operation",
    },
  ];

  for (const gap of gaps) {
    await db.execute(sql`
      INSERT INTO compliance_gaps (id, org_id, project_id, facility_id, standard, requirement, current_state, severity, recommended_action)
      VALUES (${uuidv4()}, ${orgId}, ${projectId}, ${facilityId}, ${gap.standard}, ${gap.requirement}, ${gap.currentState}, ${gap.severity}, ${gap.recommendedAction})
    `);
  }

  console.log("Seed complete.");
  console.log(`  Organization: ${orgId}`);
  console.log(`  Facility: ${facilityId}`);
  console.log(`  User: admin@acmemfg.com / complibot123`);
  console.log(`  Project: ${projectId}`);

  await client.end();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
