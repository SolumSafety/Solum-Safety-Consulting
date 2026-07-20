export type TemplateItem = {
  name: string
  code: string
  description: string
  formats: string[]
}

/** Sub-groupings used to index the WHS Templates & Forms library. */
export type WhsSubcategoryId =
  | "safety-assessments"
  | "audits-inspections"
  | "permits"
  | "procedures"
  | "policies"
  | "analyses-investigations"
  | "registers"
  | "return-to-work"

export const whsSubcategories: { id: WhsSubcategoryId; label: string }[] = [
  { id: "safety-assessments", label: "Safety Assessments" },
  { id: "audits-inspections", label: "Audits, Inspections & Checklists" },
  { id: "permits", label: "Permits" },
  { id: "procedures", label: "Procedures & Plans" },
  { id: "policies", label: "Policies" },
  { id: "analyses-investigations", label: "Analyses & Investigations" },
  { id: "registers", label: "Registers & Records" },
  { id: "return-to-work", label: "Return to Work" },
]

/**
 * Maps each WHS template code to a sub-category so the catalogue can be
 * indexed. Any code not listed here falls back to "registers".
 */
export const whsSubcategoryByCode: Record<string, WhsSubcategoryId> = {
  // Safety assessments
  "SSC-WHS-ERG-001": "safety-assessments",
  "SSC-WHS-FAT-001": "safety-assessments",
  "SSC-WHS-HOC-001": "safety-assessments",
  "SSC-WHS-JDA-001": "safety-assessments",
  "SSC-WHS-JSA-001": "safety-assessments",
  "SSC-WHS-MHT-001": "safety-assessments",
  "SSC-WHS-MOC-001": "safety-assessments",
  "SSC-WHS-NOI-001": "safety-assessments",
  "SSC-WHS-RA-001": "safety-assessments",
  "SSC-WHS-RA-Office-001": "safety-assessments",
  "SSC-WHS-RA-PSY-001": "safety-assessments",
  "SSC-WHS-SWMS-001": "safety-assessments",
  "SSC-WHS-THS-001": "safety-assessments",
  "SSC-WHS-WFH-001": "safety-assessments",
  // Audits, inspections & checklists
  "SSC-WHS-AUD-008": "audits-inspections",
  "SSC-WHS-COR-001": "audits-inspections",
  "SSC-WHS-CSM-001": "audits-inspections",
  "SSC-WHS-CSM-003": "audits-inspections",
  "SSC-WHS-IND-001": "audits-inspections",
  "SSC-WHS-PMC-007": "audits-inspections",
  "SSC-WHS-PSHRW-001": "audits-inspections",
  "SSC-WHS-VEH-001": "audits-inspections",
  // Permits
  "SSC-WHS-PTW-000": "permits",
  "SSC-WHS-PTW-CS-001": "permits",
  "SSC-WHS-PTW-ELEC-001": "permits",
  "SSC-WHS-PTW-EXC-001": "permits",
  "SSC-WHS-PTW-HW-001": "permits",
  "SSC-WHS-PTW-LOTO-001": "permits",
  "SSC-WHS-PTW-WAH-001": "permits",
  // Procedures & plans
  "SSC-WHS-CSM-002": "procedures",
  "SSC-WHS-CWMP-001": "procedures",
  "SSC-WHS-EMR-001": "procedures",
  "SSC-WHS-IMS-001": "procedures",
  "SSC-WHS-LIB-001": "procedures",
  "SSC-WHS-PSY-001": "procedures",
  "SSC-WHS-SOP-001": "procedures",
  // Policies
  "SSC-WHS-POL-001": "policies",
  // Analyses & investigations
  "SSC-WHS-BBV-001": "analyses-investigations",
  "SSC-WHS-INC-002": "analyses-investigations",
  "SSC-WHS-RCA-5WHY-003": "analyses-investigations",
  "SSC-WHS-RCA-CAR-001": "analyses-investigations",
  "SSC-WHS-RCA-CAR-006": "analyses-investigations",
  "SSC-WHS-RCA-FISH-005": "analyses-investigations",
  "SSC-WHS-RCA-INC-001": "analyses-investigations",
  "SSC-WHS-RCA-PEEPO-004": "analyses-investigations",
  // Return to work
  "SSC-WHS-IMP-001": "return-to-work",
  "SSC-WHS-RTW-001": "return-to-work",
  "SSC-WHS-RTW-002": "return-to-work",
  "SSC-WHS-WCA-001": "return-to-work",
  // Registers & records (explicit; anything unlisted also defaults here)
  "SSC-WHS-ASB-001": "registers",
  "SSC-WHS-AUD-002": "registers",
  "SSC-WHS-BUL-001": "registers",
  "SSC-WHS-CAR-001": "registers",
  "SSC-WHS-CHEM-001": "registers",
  "SSC-WHS-CHEM-002": "registers",
  "SSC-WHS-COM-001": "registers",
  "SSC-WHS-CON-001": "registers",
  "SSC-WHS-DA-001": "registers",
  "SSC-WHS-DOC-001": "registers",
  "SSC-WHS-ELEC-001": "registers",
  "SSC-WHS-EMR-002": "registers",
  "SSC-WHS-EMR-003": "registers",
  "SSC-WHS-FA-001": "registers",
  "SSC-WHS-HSR-001": "registers",
  "SSC-WHS-HSR-001B": "registers",
  "SSC-WHS-INJ-001": "registers",
  "SSC-WHS-KPI-001": "registers",
  "SSC-WHS-LEG-001": "registers",
  "SSC-WHS-MPR-001": "registers",
  "SSC-WHS-PLANT-002": "registers",
  "SSC-WHS-PPE-001": "registers",
  "SSC-WHS-SIL-001": "registers",
  "SSC-WHS-TBT-005": "registers",
  "SSC-WHS-TRN-001": "registers",
}

export function getWhsSubcategory(code: string): WhsSubcategoryId {
  return whsSubcategoryByCode[code] ?? "registers"
}

export type Bundle = {
  name: string
  code: string
  description: string
  bestValue?: boolean
}

export type IndustryBundle = {
  name: string
  code: string
}

export const bundles: Bundle[] = [
  {
    name: "Solum WHS Package",
    code: "SLMPKG-WHS-Bundle-001",
    description:
      "Everything in one package: every WHS form and template, all Project Management WHS documents, generic toolbox talks and the full leadership series — plus Solly, our AI agent who helps you complete your forms. Industry-specific toolbox talks are the only thing not included. The quickest way to stand up a full safety system.",
    bestValue: true,
  },
  {
    name: "WHS Templates & Forms Bundle",
    code: "WHS-SSC-Bundle-001",
    description:
      "The full set of core WHS templates, registers and forms. Everything you need to build and run a compliant WHS management system.",
  },
  {
    name: "Project Management WHS Bundle",
    code: "PM-WHS-SSC-Bundle-001",
    description:
      "WHS documents built for project delivery, including management plans, gate reviews, pre-mobilisation and close-out checklists. Keeps safety embedded across the project lifecycle.",
  },
  {
    name: "Generic Toolbox Talks Bundle",
    code: "GTBT-SSC-Bundle-001",
    description:
      "68 ready-to-run toolbox talks covering hazards, PPE, wellbeing and site safety. Delivered as slides and documents for quick pre-start briefings.",
  },
  {
    name: "Leadership Series Guides Bundle",
    code: "LDSG-SSC-Bundle-001",
    description:
      "A guide series on safety leadership, covering communication, accountability, culture and coaching. Builds the leadership habits that drive WHS performance.",
  },
]

export const industryBundles: IndustryBundle[] = [
  { name: "Carpentry & Building", code: "Industry-Specific-001" },
  { name: "Construction", code: "Industry-Specific-002" },
  { name: "Councils & Government", code: "Industry-Specific-003" },
  { name: "Ecological & Environmental", code: "Industry-Specific-004" },
  { name: "Electrician", code: "Industry-Specific-005" },
  { name: "Farming Operations", code: "Industry-Specific-006" },
  { name: "Lawn & Garden Maintenance", code: "Industry-Specific-007" },
  { name: "Logistics & Transport", code: "Industry-Specific-008" },
  { name: "Plumbing", code: "Industry-Specific-009" },
  { name: "Remote & Hybrid Work", code: "Industry-Specific-010" },
  { name: "Renewable Energy", code: "Industry-Specific-011" },
  { name: "Retail", code: "Industry-Specific-012" },
  { name: "Security", code: "Industry-Specific-013" },
]

const DIGITAL_WORD = ["Digital form", "Editable Word"]

export const whsTemplates: TemplateItem[] = [
  {
    name: "Asbestos Register Management Plan",
    code: "SSC-WHS-ASB-001",
    description:
      "Editable asbestos register management plan template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Audiometric Testing Record",
    code: "SSC-WHS-AUD-002",
    description:
      "Editable audiometric testing record template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WHS Internal Audit Checklist",
    code: "SSC-WHS-AUD-008",
    description:
      "A structured checklist for conducting internal WHS audits. Used to systematically verify that your safety management system is implemented and working across the organisation.",
    formats: DIGITAL_WORD,
  },
  {
    name: "BBV Exposure Incident Record",
    code: "SSC-WHS-BBV-001",
    description:
      "Editable bbv exposure incident record template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Bullying Harassment Complaint Record",
    code: "SSC-WHS-BUL-001",
    description:
      "Editable bullying harassment complaint record template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Corrective Action Tracking Register",
    code: "SSC-WHS-CAR-001",
    description:
      "A live register for logging and tracking corrective actions to completion. Used to make sure issues raised from audits, incidents and inspections are actually closed out.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Hazardous Chemicals Register",
    code: "SSC-WHS-CHEM-001",
    description:
      "Editable hazardous chemicals register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "SDS Register Review Log",
    code: "SSC-WHS-CHEM-002",
    description:
      "Editable sds register review log template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WHS Committee Minutes",
    code: "SSC-WHS-COM-001",
    description:
      "Editable whs committee minutes template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WHS Consultation Record",
    code: "SSC-WHS-CON-001",
    description:
      "Editable whs consultation record template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Chain of Responsibility Checklist",
    code: "SSC-WHS-COR-001",
    description:
      "Editable chain of responsibility checklist template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Contractor WHS Prequalification Questionnaire",
    code: "SSC-WHS-CSM-001",
    description:
      "Editable contractor whs prequalification questionnaire template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Contractor Site WHS Plan Induction",
    code: "SSC-WHS-CSM-002",
    description:
      "Editable contractor site whs plan induction template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Contractor Performance Review",
    code: "SSC-WHS-CSM-003",
    description:
      "Editable contractor performance review template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Construction WHS Management Plan",
    code: "SSC-WHS-CWMP-001",
    description:
      "Editable construction whs management plan template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Fitness for Work DA Register",
    code: "SSC-WHS-DA-001",
    description:
      "Editable fitness for work da register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Document Register Master Index",
    code: "SSC-WHS-DOC-001",
    description:
      "Editable document register master index template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Electrical Test Tag Register",
    code: "SSC-WHS-ELEC-001",
    description:
      "Editable electrical test tag register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Emergency Response Plan",
    code: "SSC-WHS-EMR-001",
    description:
      "A documented plan covering emergency scenarios, roles and response procedures. Used to prepare your team to respond quickly and safely to fires, injuries and other emergencies.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Emergency Warden Drill Record",
    code: "SSC-WHS-EMR-002",
    description:
      "Editable emergency warden drill record template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Fire Emergency Equipment Register",
    code: "SSC-WHS-EMR-003",
    description:
      "Editable fire emergency equipment register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Ergonomic Workstation Assessment",
    code: "SSC-WHS-ERG-001",
    description:
      "Editable ergonomic workstation assessment template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "First Aid Register",
    code: "SSC-WHS-FA-001",
    description:
      "Editable first aid register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Fatigue Risk Assessment",
    code: "SSC-WHS-FAT-001",
    description:
      "Editable fatigue risk assessment template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Hierarchy of Controls Selection - Effectiveness Review",
    code: "SSC-WHS-HOC-001",
    description:
      "Editable hierarchy of controls selection - effectiveness review template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Health Surveillance Register",
    code: "SSC-WHS-HSR-001",
    description:
      "Editable health surveillance register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "HSR Election Work Group Record",
    code: "SSC-WHS-HSR-001B",
    description:
      "Editable hsr election work group record template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Injury Management Plan",
    code: "SSC-WHS-IMP-001",
    description:
      "Editable injury management plan template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WHSMS Implementation Plan",
    code: "SSC-WHS-IMS-001",
    description:
      "A staged rollout plan for establishing a WHS management system. Used to guide a business step-by-step from no system to a fully implemented WHSMS.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Incident Report Form",
    code: "SSC-WHS-INC-002",
    description:
      "A standard form for reporting workplace incidents and near misses. Used to capture what happened immediately so it can be reviewed and investigated.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Induction Checklist",
    code: "SSC-WHS-IND-001",
    description:
      "A checklist for inducting new workers, visitors and contractors. Used to confirm everyone understands site rules, hazards and emergency procedures before starting.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Injury Register",
    code: "SSC-WHS-INJ-001",
    description:
      "A register recording workplace injuries and treatment. Used to track injury trends and meet record-keeping obligations.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Job Demands - Work Design Assessment",
    code: "SSC-WHS-JDA-001",
    description:
      "Editable job demands - work design assessment template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Job Safety Analysis",
    code: "SSC-WHS-JSA-001",
    description:
      "A job-by-job breakdown of tasks, hazards and controls. Used to plan how a specific task will be done safely before work begins.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WHS Key Performance Indicators Dashboard",
    code: "SSC-WHS-KPI-001",
    description:
      "Editable whs key performance indicators dashboard template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Multi-Jurisdiction Legal Compliance Register",
    code: "SSC-WHS-LEG-001",
    description:
      "Editable multi-jurisdiction legal compliance register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Lithium-Ion Battery Emergency Response Plan",
    code: "SSC-WHS-LIB-001",
    description:
      "An emergency response plan specific to lithium-ion battery fires and thermal runaway. Used to prepare for the unique risks of battery storage, charging and transport.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Hazardous Manual Task RA",
    code: "SSC-WHS-MHT-001",
    description:
      "Editable hazardous manual task ra template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Management of Change Review",
    code: "SSC-WHS-MOC-001",
    description:
      "Editable management of change review template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Monthly WHS Performance Report",
    code: "SSC-WHS-MPR-001",
    description:
      "Editable monthly whs performance report template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Noise Risk Assessment",
    code: "SSC-WHS-NOI-001",
    description:
      "Editable noise risk assessment template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "HRW Licence Competency Register",
    code: "SSC-WHS-PLANT-002",
    description:
      "Editable hrw licence competency register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Plant & Machinery Inspection",
    code: "SSC-WHS-PMC-007",
    description:
      "An inspection record for plant, machinery and equipment. Used to confirm equipment is safe, maintained and fit for use.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WHS Policy Template",
    code: "SSC-WHS-POL-001",
    description:
      "A ready-to-brand WHS policy statement of commitment. Used as the top-level document setting out your organisation's safety intentions and responsibilities.",
    formats: DIGITAL_WORD,
  },
  {
    name: "PPE Register",
    code: "SSC-WHS-PPE-001",
    description:
      "Editable ppe register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Regulatory Notification Checklist",
    code: "SSC-WHS-PSHRW-001",
    description:
      "Editable regulatory notification checklist template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Psychosocial Hazard Control Plan",
    code: "SSC-WHS-PSY-001",
    description:
      "A plan for identifying and controlling psychosocial hazards. Used to manage workplace risks such as stress, bullying, fatigue and workload.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Permit Master Register",
    code: "SSC-WHS-PTW-000",
    description:
      "Editable permit master register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Confined Space Entry Permit",
    code: "SSC-WHS-PTW-CS-001",
    description:
      "Editable confined space entry permit template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Work Near Electric Lines Permit",
    code: "SSC-WHS-PTW-ELEC-001",
    description:
      "Editable work near electric lines permit template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Excavation Permit",
    code: "SSC-WHS-PTW-EXC-001",
    description:
      "Editable excavation permit template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Hot Work Permit",
    code: "SSC-WHS-PTW-HW-001",
    description:
      "Editable hot work permit template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Isolation LOTO Permit",
    code: "SSC-WHS-PTW-LOTO-001",
    description:
      "Editable isolation loto permit template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Working at Heights Permit",
    code: "SSC-WHS-PTW-WAH-001",
    description:
      "Editable working at heights permit template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WHS Risk Assessment",
    code: "SSC-WHS-RA-001",
    description:
      "A general-purpose risk assessment for identifying hazards and rating risk. Used to assess and control workplace risks across any activity or site.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Office Risk Assessment",
    code: "SSC-WHS-RA-Office-001",
    description:
      "A risk assessment tailored to office environments. Used to identify and control common office hazards such as ergonomics, electrical and slips/trips.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Psychosocial Risk Assessment",
    code: "SSC-WHS-RA-PSY-001",
    description:
      "A risk assessment focused on psychosocial hazards. Used to systematically evaluate and control risks to psychological health at work.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Why Root Cause Analysis",
    code: "SSC-WHS-RCA-5WHY-003",
    description:
      "A 5 Whys root cause analysis template. Used to drill past symptoms to the underlying cause of an incident or problem.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Corrective Action Tracking Register",
    code: "SSC-WHS-RCA-CAR-001",
    description:
      "Editable corrective action tracking register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: ["Digital form"],
  },
  {
    name: "Corrective Action Register",
    code: "SSC-WHS-RCA-CAR-006",
    description:
      "A corrective action register linked to investigations. Used to assign, track and verify actions arising from root cause analysis.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Fishbone Ishikawa Analysis",
    code: "SSC-WHS-RCA-FISH-005",
    description:
      "A Fishbone (Ishikawa) diagram template for cause analysis. Used to map the contributing factors behind an incident across categories.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Incident Investigation Form",
    code: "SSC-WHS-RCA-INC-001",
    description:
      "A detailed form for investigating incidents. Used to gather facts, analyse causes and recommend controls after an event.",
    formats: DIGITAL_WORD,
  },
  {
    name: "PEEPO Root Cause Analysis",
    code: "SSC-WHS-RCA-PEEPO-004",
    description:
      "A PEEPO (People, Environment, Equipment, Procedures, Organisation) analysis template. Used to structure evidence-gathering during an incident investigation.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Return to Work Case Management Form",
    code: "SSC-WHS-RTW-001",
    description:
      "Editable return to work case management form template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Graduated Return to Work Schedule",
    code: "SSC-WHS-RTW-002",
    description:
      "Editable graduated return to work schedule template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Silica Worker Register",
    code: "SSC-WHS-SIL-001",
    description:
      "A register of workers exposed to respirable crystalline silica. Used to track exposure and health monitoring for silica-related work.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Standard Operating Procedure",
    code: "SSC-WHS-SOP-001",
    description:
      "A standard operating procedure template. Used to document the correct, safe step-by-step method for performing a task.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Safe Work Method Statement",
    code: "SSC-WHS-SWMS-001",
    description:
      "A Safe Work Method Statement for high-risk construction work. Used to document hazards and controls for high-risk activities, as required by law.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Toolbox Talk Record",
    code: "SSC-WHS-TBT-005",
    description:
      "A record form for toolbox talks and pre-start meetings. Used to document the topic discussed and confirm worker attendance.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Thermal Stress Assessment",
    code: "SSC-WHS-THS-001",
    description:
      "Editable thermal stress assessment template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Training Register",
    code: "SSC-WHS-TRN-001",
    description:
      "A register of worker training, licences and competencies. Used to track who is trained and flag when refreshers are due.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Vehicle Mobile Plant Prestart",
    code: "SSC-WHS-VEH-001",
    description:
      "Editable vehicle mobile plant prestart template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Workers Compensation Data Analysis Register",
    code: "SSC-WHS-WCA-001",
    description:
      "Editable workers compensation data analysis register template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WFH Remote Work RA",
    code: "SSC-WHS-WFH-001",
    description:
      "Editable wfh remote work ra template. A ready-to-use WHS document you can customise and brand for your workplace.",
    formats: DIGITAL_WORD,
  },
]

export const projectDocs: TemplateItem[] = [
  {
    name: "Project WHS Management Plan",
    code: "SSC-PM-WHS-001",
    description:
      "The master WHS plan for a project. Sets out roles, responsibilities, risks, controls and reporting for delivering the whole project safely.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Pre-Mobilisation Safety Checklist",
    code: "SSC-PM-PRE-001",
    description:
      "A checklist completed before work starts on site. Confirms permits, inductions, plant and controls are all in place before mobilising.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WHS Gate Review Checklist",
    code: "SSC-PM-GRC-001",
    description:
      "A stage-gate WHS review for key project milestones. Verifies safety readiness before the project progresses to the next phase.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WHS Procurement Checklist",
    code: "SSC-PM-PRO-001",
    description:
      "A checklist for embedding WHS into procurement. Ensures suppliers and contractors meet safety requirements before engagement.",
    formats: DIGITAL_WORD,
  },
  {
    name: "WHS Site Briefing Record",
    code: "SSC-PM-SBR-001",
    description:
      "A record of site safety briefings delivered to workers. Captures the topics covered and confirms attendance on site.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Worker Consultation Log",
    code: "SSC-PM-WCL-001",
    description:
      "A log of worker consultation on WHS matters. Documents how workers were engaged and their feedback recorded.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Sub-contractor WHS Performance Scorecard",
    code: "SSC-PM-SCS-001",
    description:
      "A scorecard rating sub-contractor safety performance. Used to monitor, compare and manage contractor WHS on a project.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Project Stakeholder WHS Register",
    code: "SSC-PM-STK-001",
    description:
      "A register of project stakeholders and their WHS interests. Tracks who needs to be consulted and informed on safety.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Project Risk & WHS Combined Register",
    code: "SSC-PM-RCR-001",
    description:
      "A single register combining project and WHS risks. Gives one view of all risks, controls and owners across the project.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Management of Change — WHS Impact Assessment",
    code: "SSC-PM-MOC-001",
    description:
      "A form for assessing the WHS impact of project changes. Ensures changes are reviewed for new hazards before they proceed.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Monthly WHS Project Progress Report",
    code: "SSC-PM-RPT-001",
    description:
      "A monthly report on project WHS performance. Summarises incidents, actions and metrics for management and clients.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Project Close-Out WHS Inspection Checklist",
    code: "SSC-PM-CLO-001",
    description:
      "A checklist for the WHS close-out of a completed project. Confirms the site is left safe and all WHS obligations are met.",
    formats: DIGITAL_WORD,
  },
  {
    name: "Project WHS Lessons Learned Register",
    code: "SSC-PM-LLR-001",
    description:
      "A register capturing WHS lessons from the project. Records what worked, what didn't, and improvements for future projects.",
    formats: DIGITAL_WORD,
  },
]

const LEADER_FORMATS = ["Leader guide", "+ How-To guide"]

export const leadershipGuides: TemplateItem[] = [
  { name: "Spotting the Signs", code: "SSC-LDR-01", description: "Helps leaders recognise the early signs a team member may be struggling. Used to identify and respond to wellbeing concerns before they escalate.", formats: LEADER_FORMATS },
  { name: "Having the Difficult Conversation", code: "SSC-LDR-02", description: "A guide to approaching sensitive wellbeing conversations. Used to prepare leaders to talk with staff supportively and with confidence.", formats: LEADER_FORMATS },
  { name: "Referral Pathways Overview", code: "SSC-LDR-03", description: "Maps the support options available to workers. Used to guide leaders on where and how to refer staff for help.", formats: LEADER_FORMATS },
  { name: "Workers Compensation Basics", code: "SSC-LDR-04", description: "Explains the workers compensation system in plain language. Used to help leaders understand claims and their role in the process.", formats: LEADER_FORMATS },
  { name: "EAP Access Guide", code: "SSC-LDR-05", description: "Explains how the Employee Assistance Program works. Used to help leaders promote and facilitate confidential EAP access.", formats: LEADER_FORMATS },
  { name: "Allied Health & Mental Health Providers", code: "SSC-LDR-06", description: "An overview of allied health and mental health supports. Used to connect workers with the right professional help.", formats: LEADER_FORMATS },
  { name: "Supporting a Staff Member Caring for Family", code: "SSC-LDR-07", description: "Guidance for supporting workers with caring responsibilities. Used to help leaders offer practical, compassionate support.", formats: LEADER_FORMATS },
  { name: "Leader Self-Care", code: "SSC-LDR-08", description: "Strategies for leaders to manage their own wellbeing. Used to prevent burnout while supporting others.", formats: LEADER_FORMATS },
  { name: "Prevention & Early Intervention Programs", code: "SSC-LDR-09", description: "An overview of proactive wellbeing programs. Used to help leaders act early and prevent harm before it occurs.", formats: LEADER_FORMATS },
  { name: "Biopsychosocial Model Explainer", code: "SSC-LDR-10", description: "Explains the biopsychosocial approach to health and recovery. Used to give leaders a framework for understanding wellbeing.", formats: LEADER_FORMATS },
  { name: "Leading Through Change", code: "SSC-LDR-11", description: "Guidance for supporting teams through organisational change. Used to maintain wellbeing and trust during transitions.", formats: LEADER_FORMATS },
  { name: "Managing an Active Claim", code: "SSC-LDR-12", description: "A guide to supporting a worker with an open claim. Used to help leaders stay engaged and compliant throughout the claim.", formats: LEADER_FORMATS },
  { name: "Keeping Workers Connected", code: "SSC-LDR-13", description: "Strategies to keep injured or absent workers connected. Used to maintain the connection that supports recovery and return to work.", formats: LEADER_FORMATS },
  { name: "Improving Team Culture", code: "SSC-LDR-14", description: "Practical steps to build a positive team culture. Used to strengthen trust, psychological safety and engagement.", formats: LEADER_FORMATS },
  { name: "HR & WHS Leading Indicators", code: "SSC-LDR-15", description: "Explains leading indicators across HR and WHS. Used to help leaders measure and act on early-warning metrics.", formats: LEADER_FORMATS },
  { name: "Pre-Employment Assessment", code: "SSC-LDR-16", description: "Guidance on pre-employment health assessments. Used to support fair, safe and compliant hiring.", formats: LEADER_FORMATS },
  { name: "Embedding Wellbeing into Culture", code: "SSC-LDR-17", description: "Strategies to make wellbeing part of everyday culture. Used to move from one-off initiatives to lasting practice.", formats: LEADER_FORMATS },
  { name: "Reasonable Adjustments", code: "SSC-LDR-18", description: "Explains reasonable adjustments for workers. Used to help leaders support staff to stay at or return to work.", formats: LEADER_FORMATS },
  { name: "Grief & Critical Incident Response", code: "SSC-LDR-19", description: "Guidance on responding to grief and critical incidents. Used to help leaders support teams after traumatic events.", formats: LEADER_FORMATS },
  { name: "Documentation & File Notes", code: "SSC-LDR-20", description: "Best practice for documenting wellbeing conversations. Used to keep accurate, appropriate and confidential records.", formats: LEADER_FORMATS },
]
