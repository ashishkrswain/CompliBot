export interface RegulatoryStandard {
  code: string;
  title: string;
  agency: "OSHA" | "EPA" | "NFPA" | "ASME";
  subparts: RegulatorySubpart[];
}

export interface RegulatorySubpart {
  section: string;
  title: string;
  requirements: string[];
  recordkeepingFrequency: string;
  applicability: string;
}

export const OSHA_RECORDKEEPING: RegulatoryStandard = {
  code: "29 CFR 1904",
  title: "Recording and Reporting Occupational Injuries and Illnesses",
  agency: "OSHA",
  subparts: [
    {
      section: "1904.4",
      title: "Recording Criteria",
      requirements: [
        "Record each fatality",
        "Record each injury or illness resulting in loss of consciousness",
        "Record each injury or illness requiring medical treatment beyond first aid",
        "Record each injury or illness resulting in days away from work",
        "Record each injury or illness resulting in restricted work or transfer",
        "Record significant injuries/illnesses diagnosed by physician or licensed healthcare professional",
      ],
      recordkeepingFrequency: "Within 7 calendar days of receiving information",
      applicability: "Employers with >10 employees (partial exemptions for low-hazard industries per 1904.2)",
    },
    {
      section: "1904.5",
      title: "Determination of Work-Relatedness",
      requirements: [
        "An injury or illness is work-related if an event in the work environment either caused or contributed to the condition",
        "Work environment includes the establishment and other locations where employees are working",
        "Presumption of work-relatedness for injuries in work environment unless specific exception applies",
        "Exceptions: voluntary participation in wellness program, eating/drinking/self-medication for non-work condition, personal tasks outside work hours, personal grooming, motor vehicle accident in parking lot",
      ],
      recordkeepingFrequency: "Determination required for each case",
      applicability: "All recordable cases",
    },
    {
      section: "1904.7",
      title: "General Recording Criteria",
      requirements: [
        "Death - record regardless of time between injury and death",
        "Days away from work - record if employee misses one or more days",
        "Restricted work or transfer - record if employee cannot perform routine functions",
        "Medical treatment beyond first aid - record treatments exceeding first aid measures",
        "Count calendar days for days away and restricted work",
        "Cap day count at 180 days",
      ],
      recordkeepingFrequency: "Ongoing - record within 7 days",
      applicability: "All covered employers",
    },
    {
      section: "1904.29",
      title: "Forms",
      requirements: [
        "OSHA 300 Log - Log of Work-Related Injuries and Illnesses",
        "OSHA 300A - Summary of Work-Related Injuries and Illnesses",
        "OSHA 301 - Injury and Illness Incident Report",
        "Maintain records for 5 years following end of calendar year",
        "Update records to reflect changes that occur after initial recording",
      ],
      recordkeepingFrequency: "Maintain for 5 years; update as needed",
      applicability: "All covered employers",
    },
    {
      section: "1904.32",
      title: "Annual Summary",
      requirements: [
        "Review OSHA 300 Log to verify completeness and accuracy",
        "Prepare annual summary on OSHA 300A form",
        "Certify summary (company executive must sign)",
        "Post summary February 1 through April 30",
        "Include total hours worked by all employees",
      ],
      recordkeepingFrequency: "Annual (prepare by February 1, post through April 30)",
      applicability: "All covered employers",
    },
  ],
};

export const OSHA_GENERAL_INDUSTRY: RegulatoryStandard = {
  code: "29 CFR 1910",
  title: "Occupational Safety and Health Standards - General Industry",
  agency: "OSHA",
  subparts: [
    {
      section: "1910.132-140",
      title: "Personal Protective Equipment (Subpart I)",
      requirements: [
        "Hazard assessment to determine PPE needs (1910.132(d))",
        "Written certification of hazard assessment",
        "Provide appropriate PPE at no cost to employees",
        "Train employees on proper use, care, and limitations",
        "Ensure PPE properly fits each employee",
        "Eye/face protection per 1910.133 (ANSI Z87.1)",
        "Head protection per 1910.135 (ANSI Z89.1)",
        "Foot protection per 1910.136 (ASTM F2413)",
      ],
      recordkeepingFrequency: "Written certification required; retraining as needed",
      applicability: "All general industry employers where hazards exist",
    },
    {
      section: "1910.146",
      title: "Permit-Required Confined Spaces",
      requirements: [
        "Evaluate workplace for permit-required confined spaces",
        "Develop written permit space program",
        "Inform exposed employees of space existence and dangers",
        "Implement permit system for entry operations",
        "Atmospheric testing before and during entry",
        "Attendant stationed outside each permit space during entry",
        "Rescue and emergency services arranged",
        "Annual review of permit space program and entry permits",
      ],
      recordkeepingFrequency: "Annual program review; retain canceled permits for 1 year",
      applicability: "General industry with permit-required confined spaces",
    },
    {
      section: "1910.147",
      title: "Control of Hazardous Energy (Lockout/Tagout)",
      requirements: [
        "Develop and document energy control procedures for each machine",
        "Provide lockout/tagout devices for authorized employees",
        "Train employees (authorized, affected, other)",
        "Conduct periodic inspection of each procedure at least annually",
        "Inspection by authorized employee other than one using procedure",
        "Group lockout/tagout procedures for complex operations",
        "Sequence for lockout: notify, shutdown, isolate, apply device, release stored energy, verify",
      ],
      recordkeepingFrequency: "Annual inspection of each energy control procedure",
      applicability: "Servicing/maintenance of machines with potential for unexpected energization",
    },
    {
      section: "1910.134",
      title: "Respiratory Protection",
      requirements: [
        "Written respiratory protection program",
        "Medical evaluation before fit testing",
        "Initial and annual fit testing (qualitative or quantitative)",
        "Proper selection of respirators based on hazard",
        "Training on use, maintenance, and limitations",
        "Regular cleaning, inspection, and maintenance",
        "Proper storage of respirators",
        "Program evaluation at least annually",
      ],
      recordkeepingFrequency: "Annual fit testing; medical evaluations retained per 1910.1020",
      applicability: "Employers requiring respirator use",
    },
    {
      section: "1910.178",
      title: "Powered Industrial Trucks (Forklifts)",
      requirements: [
        "Only trained and evaluated operators may operate PITs",
        "Training includes formal instruction, practical training, and evaluation",
        "Refresher training when unsafe operation observed or after accident",
        "Performance evaluation every 3 years minimum",
        "Daily pre-operation inspection of truck",
        "Report defects/unsafe conditions immediately",
      ],
      recordkeepingFrequency: "Evaluation every 3 years; document training completion",
      applicability: "Employers using powered industrial trucks",
    },
    {
      section: "1910.179",
      title: "Overhead and Gantry Cranes",
      requirements: [
        "Frequent inspection (daily to monthly): operating mechanisms, hooks, hoist chains/ropes",
        "Periodic inspection (1-12 months): deformed/cracked members, loose bolts, wear on components",
        "Load test before initial use and after modification",
        "Only designated personnel operate cranes",
        "No hoisting loads over people",
        "Rope inspection criteria for replacement",
      ],
      recordkeepingFrequency: "Monthly to annual depending on component; document periodic inspections",
      applicability: "Facilities with overhead or gantry cranes",
    },
  ],
};

export const EPA_EPCRA: RegulatoryStandard = {
  code: "40 CFR 370",
  title: "Hazardous Chemical Reporting: Community Right-to-Know (EPCRA Section 312)",
  agency: "EPA",
  subparts: [
    {
      section: "370.20",
      title: "Applicability",
      requirements: [
        "Owner/operator of facility with hazardous chemicals above threshold quantities",
        "Extremely Hazardous Substances (EHS): above Threshold Planning Quantity (TPQ)",
        "All other hazardous chemicals: above 10,000 pounds",
        "Gasoline at gas stations: above 75,000 gallons (all grades combined)",
        "Diesel fuel at gas stations: above 100,000 gallons",
      ],
      recordkeepingFrequency: "Annual report due March 1",
      applicability: "Facilities with OSHA HazCom chemicals above thresholds",
    },
    {
      section: "370.40",
      title: "Tier II Information Requirements",
      requirements: [
        "Chemical name (or trade secret generic class)",
        "CAS registry number",
        "Physical hazard categories (gas under pressure, explosive, flammable, oxidizer, self-reactive, pyrophoric, self-heating, organic peroxide, corrosive to metal, hazard not otherwise classified)",
        "Health hazard categories (acute toxicity, skin corrosion/irritation, eye damage/irritation, sensitization, germ cell mutagenicity, carcinogenicity, reproductive toxicity, target organ toxicity, aspiration hazard, hazard not otherwise classified)",
        "Maximum amount present at any time during preceding year",
        "Average daily amount",
        "Number of days on site",
        "Specific location within facility",
        "Storage type and conditions (pressure, temperature)",
        "Mixture component information if applicable",
      ],
      recordkeepingFrequency: "Annual submission by March 1",
      applicability: "All covered facilities",
    },
    {
      section: "370.42",
      title: "Amount Ranges",
      requirements: [
        "Range 01: 0-99 lbs",
        "Range 02: 100-999 lbs",
        "Range 03: 1,000-9,999 lbs",
        "Range 04: 10,000-99,999 lbs",
        "Range 05: 100,000-999,999 lbs",
        "Range 06: 1,000,000-9,999,999 lbs",
        "Range 07: 10,000,000-49,999,999 lbs",
        "Range 08: 50,000,000-99,999,999 lbs",
        "Range 09: 100,000,000-499,999,999 lbs",
        "Range 10: 500,000,000-999,999,999 lbs",
        "Range 11: 1 billion lbs or greater",
      ],
      recordkeepingFrequency: "Use ranges for reporting quantities",
      applicability: "Tier II reporting",
    },
    {
      section: "370.45",
      title: "Submission Requirements",
      requirements: [
        "Submit to State Emergency Response Commission (SERC)",
        "Submit to Local Emergency Planning Committee (LEPC)",
        "Submit to local fire department with jurisdiction",
        "Include facility identification (name, address, SIC/NAICS, D&B number)",
        "Include emergency coordinator contact information (name, phone, 24-hour phone)",
        "Certification by owner/operator or authorized representative",
      ],
      recordkeepingFrequency: "Annual by March 1; updated if significant changes occur",
      applicability: "All covered facilities",
    },
  ],
};

export const MAINTENANCE_STANDARDS: RegulatoryStandard = {
  code: "Multiple",
  title: "Maintenance Compliance Standards",
  agency: "OSHA",
  subparts: [
    {
      section: "ASME BPVC / National Board",
      title: "Pressure Vessel Inspections",
      requirements: [
        "Internal inspection per jurisdictional requirements (typically every 2-5 years)",
        "External inspection annually or per state schedule",
        "Relief valve testing and certification",
        "Repairs by NBIC-certified repair organizations",
        "Alteration documentation per NBIC Part 3",
        "Operating log maintenance (pressure, temperature readings)",
      ],
      recordkeepingFrequency: "Per state jurisdiction - typically annual external, 2-5 year internal",
      applicability: "Facilities with pressure vessels (boilers, unfired pressure vessels, pressure piping)",
    },
    {
      section: "NFPA 70B",
      title: "Recommended Practice for Electrical Equipment Maintenance",
      requirements: [
        "Establish an Electrical Preventive Maintenance (EPM) program",
        "Frequency based on equipment condition, environment, and reliability requirements",
        "Thermographic surveys of electrical systems",
        "Circuit breaker testing and maintenance",
        "Transformer oil testing and analysis",
        "Ground fault protection testing",
        "Emergency/standby power system testing (monthly engine run, annual load test)",
      ],
      recordkeepingFrequency: "Monthly to annual depending on equipment type and criticality",
      applicability: "All facilities with electrical distribution systems",
    },
    {
      section: "ANSI/ASME A17.1",
      title: "Safety Code for Elevators and Escalators",
      requirements: [
        "Periodic inspections and tests per schedule",
        "Category 1 test annually (no-load safety device test)",
        "Category 5 test every 5 years (full-load safety device test)",
        "Monthly maintenance by qualified personnel",
        "Fire service operation testing semi-annually",
        "Emergency communication device testing monthly",
      ],
      recordkeepingFrequency: "Monthly maintenance; annual/5-year testing",
      applicability: "Facilities with elevators, escalators, or moving walks",
    },
    {
      section: "NFPA 25",
      title: "Inspection, Testing, and Maintenance of Water-Based Fire Protection Systems",
      requirements: [
        "Weekly visual inspection of gauges and valve positions",
        "Monthly inspection of sprinkler heads and piping",
        "Quarterly flow tests and alarm tests",
        "Annual full inspection of all system components",
        "5-year internal pipe inspection",
        "10-year hydrostatic test of FDC",
        "Maintain records of all inspections, tests, and maintenance",
      ],
      recordkeepingFrequency: "Weekly through 10-year intervals depending on component",
      applicability: "Facilities with water-based fire protection systems",
    },
  ],
};

export const ALL_STANDARDS = [OSHA_RECORDKEEPING, OSHA_GENERAL_INDUSTRY, EPA_EPCRA, MAINTENANCE_STANDARDS];

export function getRequirementsForStandard(standardCode: string): RegulatorySubpart[] {
  for (const standard of ALL_STANDARDS) {
    for (const subpart of standard.subparts) {
      if (subpart.section.includes(standardCode) || standard.code.includes(standardCode)) {
        return standard.subparts;
      }
    }
  }
  return [];
}

export function getStandardByAgency(agency: "OSHA" | "EPA" | "NFPA" | "ASME"): RegulatoryStandard[] {
  return ALL_STANDARDS.filter((s) => s.agency === agency);
}
