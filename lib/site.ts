export const site = {
  name: 'Solum Safety Consulting',
  shortName: 'Solum Safety',
  tagline: 'Building Safety from the Ground Up.',
  description: 'Practical WHS consulting for Australian organisations.',
  email: 'info@solumsafetyconsulting.com.au',
  emailHref: 'mailto:info@solumsafetyconsulting.com.au',
  serviceArea: 'Servicing clients Australia-wide',
  abn: 'ABN 5493 2321 683',
}

export const navLinks = [
  { label: 'Our Story', href: '/our-story' },
  { label: 'Services', href: '/services' },
  { label: 'Templates', href: '/templates' },
  { label: 'Guides', href: '/blog' },
  { label: 'Ask Solly', href: '/solly' },
  { label: 'Example Reports', href: '/reports' },
  { label: 'Sectors', href: '/#sectors' },
  { label: 'Contact', href: '/#contact' },
]

export const trustBadges = [
  { label: 'Australian-Based', icon: 'shield' },
  { label: 'No Lock-In Contracts', icon: 'check' },
  { label: 'ISO 45001 Aligned', icon: 'award' },
  { label: 'Responsive Local Support', icon: 'message' },
]

export type SectorIcon = 'building' | 'leaf' | 'landmark' | 'clipboard'

export const sectors: { title: string; description: string; icon: SectorIcon; accent: 'olive' | 'gold' | 'terracotta' }[] = [
  {
    title: 'Construction & Civil',
    description:
      'Practical, ISO 45001 aligned systems built for the way crews work on site, so safety holds up under real conditions rather than sitting in a folder.',
    icon: 'building',
    accent: 'olive',
  },
  {
    title: 'Environmental & Renewable',
    description:
      'Clear, low-burden WHS processes that protect your people and the environment while meeting project requirements and regulatory expectations.',
    icon: 'leaf',
    accent: 'gold',
  },
  {
    title: 'Private, Public & Government',
    description:
      'Straightforward, structured safety systems that are easy to put in place and maintain, keeping teams safe across every project.',
    icon: 'landmark',
    accent: 'olive',
  },
  {
    title: 'Project Management Consultants',
    description:
      'When WHS is built into project delivery, you reduce risk to the project and protect the wider business. We help you keep it there from start to finish.',
    icon: 'clipboard',
    accent: 'terracotta',
  },
]

export type StepIcon = 'shield' | 'chart' | 'file' | 'check'

export const steps: { step: string; title: string; description: string; icon: StepIcon }[] = [
  {
    step: 'STEP 01',
    title: 'Ground in the pillars',
    description:
      'We start with the four foundations that sit under every strong safety culture: communication, leadership, accountability and sound systems.',
    icon: 'shield',
  },
  {
    step: 'STEP 02',
    title: 'Assess your maturity',
    description:
      'Our Tier 2 and Tier 3 gap analysis shows where your team, department and organisation sit today, with a clear maturity rating and the areas that need attention first.',
    icon: 'chart',
  },
  {
    step: 'STEP 03',
    title: 'Equip with the toolkit',
    description:
      'We provide the forms, templates, toolbox talks and leadership guides your team needs to close the gaps, ready to put to work.',
    icon: 'file',
  },
  {
    step: 'STEP 04',
    title: 'Build the culture',
    description:
      'We reassess over time to lift your maturity rating, embed the habits and build a safety culture the whole organisation takes ownership of.',
    icon: 'check',
  },
]

export const pillars = [
  {
    number: '01',
    title: 'Clear Communication',
    description:
      'Good plans come undone when communication breaks down. Leaders need to set direction clearly and listen to what the frontline is telling them. That builds trust, alignment and better decisions.',
  },
  {
    number: '02',
    title: 'Leadership & Guidance',
    description:
      'Leadership shapes culture and performance. Strong leaders give people clarity, consistency and support, and set the standard through the way they work themselves.',
  },
  {
    number: '03',
    title: 'Self-Accountability',
    description:
      'Good organisations are built on people who take ownership of their responsibilities, their actions and the outcomes that follow.',
  },
  {
    number: '04',
    title: 'Strong Processes & Systems',
    description:
      'Clear systems cut confusion, improve consistency and strengthen accountability. They are what keep good performance going over the long term.',
  },
]

export const gapChecklist = [
  'Understand your current WHS maturity level',
  'Identify compliance gaps and weaknesses in your systems',
  'Analyse trends and underlying causes across the organisation',
  'Measure leadership, communication, accountability and system effectiveness',
  'Develop practical corrective action plans',
  'Set a clear plan for ongoing improvement',
]

export const tiers = [
  {
    tier: 'TIER 2',
    title: 'Internal Desktop WHS Gap Analysis',
    description:
      'An online assessment completed by your WHS representative and submitted to Solum Safety Consulting for review. Available to purchase online.',
  },
  {
    tier: 'TIER 3',
    title: 'Independent WHS Gap Analysis Field Assessment and Verification',
    description:
      'A full external WHS audit carried out on site by Solum Safety Consulting. Currently taking bookings for 2027.',
  },
]

export type PlatformModule = {
  name: string
  role: string
  description: string
  meta: string
  accent: 'olive' | 'gold' | 'terracotta'
}

export const platformModules: PlatformModule[] = [
  { name: 'WHSMS', role: 'The Guardian', description: 'Safety, compliance and audit readiness across every site.', meta: '40+ FORMS', accent: 'olive' },
  { name: 'Business Management', role: 'The Steward', description: 'Governance, structure and organisational control.', meta: '8 TEMPLATES', accent: 'gold' },
  { name: 'Project Management', role: 'The Coordinator', description: 'Delivery, tasks, teams and field-to-office tracking.', meta: '10 TEMPLATES', accent: 'olive' },
  { name: 'Finance Management', role: 'The Custodian', description: 'Invoicing, quotes, budgets and financial tracking.', meta: '10 TEMPLATES', accent: 'terracotta' },
  { name: 'Staff', role: 'The Operator', description: 'Onboarding, workload visibility and execution focus.', meta: '10 TEMPLATES', accent: 'olive' },
  { name: 'Service Requests', role: 'The Requestor', description: 'Submit, track and manage internal requests.', meta: 'LIVE QUEUE', accent: 'gold' },
  { name: 'Reports', role: 'Business Intelligence', description: 'Analytics, dashboards and exportable reports.', meta: 'TIER 2 & 3', accent: 'olive' },
  { name: 'Subcontractor Portal', role: 'The Field Partner', description: 'Tasks, WHS forms, timesheets, invoicing and compliance.', meta: 'FIELD ACCESS', accent: 'terracotta' },
  { name: 'Client Access', role: 'Transparency Portal', description: 'Client-facing view of project progress and compliance.', meta: 'CLIENT VIEW', accent: 'olive' },
]

export const platformTags = ['WHS', 'Stakeholders', 'Projects', 'Business', 'Finance']

export const lifecycleStages = ['Understand', 'Build', 'Implement', 'Verify', 'Improve']

export type WhatWeDoIcon = 'settings' | 'file-text' | 'hard-hat' | 'compass'

export const whatWeDo: { title: string; description: string; icon: WhatWeDoIcon; href?: string; linkLabel?: string }[] = [
  {
    title: 'WHS System Development',
    description:
      'WHS management systems built around the way your business runs. Practical, structured and aligned with current legislation.',
    icon: 'settings',
  },
  {
    title: 'Templates & Forms',
    description:
      'WHS templates and forms in digital and Word formats, ready to edit, complete and fold into your existing systems.',
    icon: 'file-text',
    href: '/templates',
    linkLabel: 'Browse catalogue',
  },
  {
    title: 'Project WHS Support',
    description:
      'We help you build WHS into project delivery, which reduces risk to the project and to the wider business.',
    icon: 'hard-hat',
  },
  {
    title: 'Our Approach',
    description:
      'Clear, practical and evidence-based. We build systems that strengthen communication, accountability, leadership and compliance, so the things that matter do not get missed.',
    icon: 'compass',
  },
]

export const TIER2_CODE = 'SSC-TIER2-GAP'

/**
 * Base URL of the live assessment portal app. Override with
 * NEXT_PUBLIC_ASSESSMENT_SITE_URL in project settings if the domain changes.
 */
export const ASSESSMENT_SITE_URL =
  process.env.NEXT_PUBLIC_ASSESSMENT_SITE_URL ?? 'https://assessorsolumsafetyconsulting.app'

/** Returning clients log back in to their assessment here. */
export const ASSESSMENT_LOGIN_HREF = `${ASSESSMENT_SITE_URL}/login`

export const serviceTiers: {
  tier: string
  title: string
  description: string
  points: string[]
  outcome: string
  popular?: boolean
  /** How the buyer proceeds: buy the assessment online, or enquire to book. */
  action: 'purchase' | 'enquire'
  /** Product code to purchase (only for action: 'purchase'). */
  purchaseCode?: string
  /** Optional availability note shown above the CTA. */
  availabilityNote?: string
}[] = [
  {
    tier: 'TIER 2',
    title: 'Internal Desktop WHS Gap Analysis',
    description:
      'An assessment your WHS representative completes through our online assessment app, then submits to Solum Safety Consulting for review.',
    points: [
      'Structured assessment across 18 core WHS domains',
      'Completed online using your own knowledge, systems and evidence',
      'Submitted to Solum for an independent desktop review',
      'A detailed report based on the evidence you provide',
      'Maturity rating and corrective action plan included',
    ],
    outcome:
      'Gives you a clear, evidence-based picture of where you stand and what to work on next.',
    popular: true,
    action: 'purchase',
    purchaseCode: TIER2_CODE,
  },
  {
    tier: 'TIER 3',
    title: 'Independent WHS Gap Analysis Field Assessment and Verification',
    description: 'A full external WHS audit carried out on site by Solum Safety Consulting.',
    points: [
      'Carried out on site by an experienced assessor',
      'Verification of how your systems work in practice',
      'Review of implementation, controls and workplace behaviours',
      'Independent assessment of compliance and performance',
      'Formal WHS assurance outcome',
    ],
    outcome:
      'Confirms your systems are working as intended and reduces risk to both your projects and the wider business.',
    action: 'enquire',
    availabilityNote: 'Currently taking bookings for 2027',
  },
]

export const whyWeStarted = {
  intro:
    'We kept seeing the same thing. Businesses were growing quickly, but their understanding of WHS was not keeping pace. As operations expanded, safety obligations, responsibilities and systems were left behind, which opened up gaps in compliance and pushed risk up across the business.',
  atSameTime: [
    {
      text: 'Owners and managers were often unclear on their WHS duties and responsibilities.',
      accent: 'olive' as const,
    },
    {
      text: 'Workers were frustrated by the lack of simple, usable forms and templates.',
      accent: 'gold' as const,
    },
    {
      text: 'Where systems did exist, they were often overcomplicated, inconsistent, or quietly ignored.',
      accent: 'terracotta' as const,
    },
  ],
  atSameTimeSummary:
    'There was rarely a practical, easy to use system that teams could rely on day to day.',
  whatWeFound: [
    'WHS due diligence was not being done properly',
    'Risk maturity was standing still rather than improving',
    'Many had no idea what level they were operating at, let alone how to improve it',
  ],
  whatWeFoundTags: ['Too complex', 'Too unclear', 'Not embedded'],
  builtToDeliver: [
    'Clear, structured WHS systems',
    'Practical tools that are easy to use',
    'Measurable assessments that show where you stand',
    'A clear path to improve your WHS maturity',
  ],
}

export const testimonials: {
  quote: string
  name: string
  role: string
  company: string
  accent: 'olive' | 'gold' | 'terracotta'
}[] = [
  {
    quote:
      'Solum gave us a WHS system the crews will actually pick up. The templates fitted the way we already work, so there is no more guessing about which form to use or how to fill it in.',
    name: 'Daniel M.',
    role: 'Operations Manager',
    accent: 'olive',
  },
  {
    quote:
      'The gap analysis showed us exactly where we stood and what to fix first. For the first time our leaders understood their duties and had a clear plan to work to.',
    name: 'Sarah T.',
    role: 'General Manager',
    accent: 'gold',
  },
  {
    quote:
      'Practical, clear and easy to deal with. WHS used to be an afterthought on our projects. Now it is part of delivery from day one.',
    name: 'James R.',
    role: 'Project Director',
    accent: 'terracotta',
  },
]

export const templateInclusions = [
  'SWMS, JSA & Risk Assessments',
  'Incident reporting & investigation forms',
  'Registers for training, inspections and corrective actions',
  'Inspection & audit checklists',
  'Environmental compliance & monitoring tools',
]

export const focusAreas = [
  {
    title: 'Simple, structured systems',
    description: 'Clear processes your team can follow on the ground, not documents that sit on a shelf.',
  },
  {
    title: 'Clear accountability & leadership',
    description: 'Defined responsibilities and strong leadership across the whole business.',
  },
  {
    title: 'Compliance embedded daily',
    description: 'Compliance built into daily operations, not written down once and forgotten.',
  },
]

export const sampleReports: {
  tier: string
  title: string
  description: string
  cover: string
}[] = [
  {
    tier: 'TIER 2',
    title: 'WHS Management System Gap Analysis',
    description:
      'Desktop gap analysis with an overall maturity score, an 18 domain summary, the methodology used and a prioritised action register.',
    cover: '/report-cover-1.png',
  },
  {
    tier: 'TIER 3',
    title: 'Independent WHS Gap Analysis Field Assessment and Verification',
    description:
      'Full governance assessment with a department by domain maturity matrix, legal exposure analysis and an organisation-wide action plan.',
    cover: '/report-cover-0.png',
  },
]

export const footerColumns = [
  {
    title: 'Services',
    links: [
      { label: 'WHS Gap Analysis (Tier 2 & 3)', href: '/services' },
      { label: 'WHS System Development', href: '/services' },
      { label: 'Templates & Forms', href: '/templates' },
      { label: 'Example Reports', href: '/reports' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Services', href: '/services' },
      { label: 'Our Approach', href: '/#approach' },
      { label: 'Contact', href: '/#contact' },
      { label: 'Policies & Legal', href: '/policies' },
    ],
  },
]

export const footerLegal: { label: string; href: string }[] = [
  { label: 'Copyright', href: '/policies#copyright' },
  { label: 'Privacy', href: '/policies#privacy' },
  { label: 'Refunds', href: '/policies#refunds' },
  { label: 'Template Licence', href: '/policies#licence' },
  { label: 'Disclaimer', href: '/policies#disclaimers' },
]
