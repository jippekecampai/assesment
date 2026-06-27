// ============================================================================
// Campai Assessment — datamodel + assessment-voorbereiding.
// 1-op-1 geporteerd uit de vanilla app.js (datasectie + pure prep-logica),
// gedrag ongewijzigd. Alleen getypeerd voor TypeScript/React.
// ============================================================================

export interface Role {
  id: string;
  name: string;
  threshold: number;
  weights: Record<string, number>;
}

export interface Candidate {
  id: string;
  name: string;
  meta: string;
  scores: Record<string, number>;
  scenarioScores: number[];
  scenarioLabels: string[];
  type?: "candidate";
}

export interface Learner {
  id: string;
  name: string;
  role: string;
  targetRole: string;
  meta: string;
  scores: Record<string, number>;
  type?: "learner";
}

export type Person = (Candidate | Learner) & { type: "candidate" | "learner" };

export interface TrainingModule {
  id: string;
  title: string;
  domain: string;
  level: string;
  xp: number;
  format: string;
  proof: string;
  badge: string;
}

export interface TestQuestion {
  id?: string;
  domain: string;
  type: string;
  prompt: string;
  options: string[];
  answer: number;
  isFallback?: boolean;
  answerQuality?: {
    correctIndex: number;
    correctLength: number;
    maxDistractorLength: number;
  };
}

export interface DraftQuestion {
  domain: string;
  role: string;
  source: string;
  prompt: string;
}

export const roles: Role[] = [
  {
    id: "servicedesk",
    name: "Servicedesk Engineer",
    threshold: 68,
    weights: {
      "AI / Copilot": 0.07,
      "Microsoft 365": 0.15,
      Azure: 0.08,
      "Kaseya Stack": 0.12,
      Fortigate: 0.07,
      VoIP: 0.08,
      Servers: 0.08,
      "SharePoint / Teams": 0.09,
      "SharePoint / Azure Migrations": 0.04,
      Inforcer: 0.06,
      "Basic IT & Troubleshooting": 0.12,
      "Werkhouding & Communicatie": 0.09,
      Engels: 0.06,
    },
  },
  {
    id: "cloud",
    name: "Cloud Engineer",
    threshold: 72,
    weights: {
      "AI / Copilot": 0.08,
      "Microsoft 365": 0.1,
      Azure: 0.2,
      "Kaseya Stack": 0.06,
      Fortigate: 0.08,
      VoIP: 0.03,
      Servers: 0.12,
      "SharePoint / Teams": 0.08,
      "SharePoint / Azure Migrations": 0.14,
      Inforcer: 0.04,
      "Basic IT & Troubleshooting": 0.06,
      "Werkhouding & Communicatie": 0.06,
      Engels: 0.05,
    },
  },
  {
    id: "modernwork",
    name: "Modern Work Consultant",
    threshold: 72,
    weights: {
      "AI / Copilot": 0.14,
      "Microsoft 365": 0.17,
      Azure: 0.07,
      "Kaseya Stack": 0.03,
      Fortigate: 0.03,
      VoIP: 0.04,
      Servers: 0.04,
      "SharePoint / Teams": 0.2,
      "SharePoint / Azure Migrations": 0.14,
      Inforcer: 0.08,
      "Basic IT & Troubleshooting": 0.04,
      "Werkhouding & Communicatie": 0.07,
      Engels: 0.05,
    },
  },
  {
    id: "sales",
    name: "Sales",
    threshold: 64,
    weights: {
      "AI / Copilot": 0.1,
      "Microsoft 365": 0.12,
      Azure: 0.08,
      "Kaseya Stack": 0.1,
      Fortigate: 0.06,
      VoIP: 0.08,
      Servers: 0.04,
      "SharePoint / Teams": 0.09,
      "SharePoint / Azure Migrations": 0.07,
      Inforcer: 0.07,
      "Basic IT & Troubleshooting": 0.11,
      "Werkhouding & Communicatie": 0.13,
      Engels: 0.11,
    },
  },
  {
    id: "tam",
    name: "Technical Account Manager",
    threshold: 74,
    weights: {
      "AI / Copilot": 0.09,
      "Microsoft 365": 0.12,
      Azure: 0.11,
      "Kaseya Stack": 0.12,
      Fortigate: 0.08,
      VoIP: 0.06,
      Servers: 0.09,
      "SharePoint / Teams": 0.1,
      "SharePoint / Azure Migrations": 0.08,
      Inforcer: 0.08,
      "Basic IT & Troubleshooting": 0.05,
      "Werkhouding & Communicatie": 0.11,
      Engels: 0.07,
    },
  },
];

export const domains: string[] = [
  "Microsoft 365",
  "Azure",
  "Kaseya Stack",
  "Fortigate",
  "AI / Copilot",
  "VoIP",
  "Servers",
  "SharePoint / Teams",
  "SharePoint / Azure Migrations",
  "Inforcer",
  "Basic IT & Troubleshooting",
  "Werkhouding & Communicatie",
  "Engels",
];

export const domainDetails: Record<string, string> = {
  "Microsoft 365": "Exchange, Entra ID, Conditional Access, licenties, security defaults",
  Azure: "VM's, networking, storage, backup, identity, monitoring, kostenbewustzijn",
  "Kaseya Stack": "Autotask, Datto RMM, IT Glue, EDR, BullPhish, patching, alerts en documentatie",
  Fortigate: "Firewall policies, VPN, routing, NAT, logging en troubleshooting",
  "AI / Copilot": "Copilot-readiness, promptvaardigheid, dataveiligheid, governance en adoptie",
  VoIP: "Hosted VoIP, call routing, RTP/SIP, nummerplannen, audio-issues",
  Servers: "Windows Server, AD, DNS/DHCP, backup, event logs, performance en restore",
  "SharePoint / Teams": "Sites, Teams, rechten, guests, lifecycle, governance, sensitivity en adoptie",
  "SharePoint / Azure Migrations": "Intake, discovery, migratietooling, cutover, delta sync, rollback en nazorg",
  Inforcer: "Baselines, tenant policies, rollout rings, exceptions, drift en audit",
  "Basic IT & Troubleshooting": "Basisdiagnose, netwerk, endpoint, escalatie, documentatie en klantimpact",
  "Werkhouding & Communicatie": "Ownership, samenwerking, klanttoon, feedback, planning en omgaan met druk",
  Engels: "Engelse klantupdates, vendorcommunicatie, documentatie en incidentstatus",
};

// Kandidaat-gerichte introtekst per domein: wat je kunt verwachten en waarom we
// het toetsen. Wordt in de testomgeving (kiosk) boven de vragen van dat domein
// getoond. Kort en geruststellend houden.
export const domainIntros: Record<string, string> = {
  "Microsoft 365":
    "Praktijksituaties rond Microsoft 365 (identiteit, e-mail, beveiliging). We kijken hoe je een probleem aanpakt, niet of je definities uit je hoofd kent.",
  Azure:
    "Scenario's rond Azure (resources, netwerk, identiteit, kosten). Het gaat om je redenering en keuzes, niet om losse feitjes.",
  "Kaseya Stack":
    "Werken met de Kaseya-tooling (Autotask, Datto RMM, IT Glue, EDR). We toetsen hoe je tickets, monitoring en documentatie aan elkaar knoopt.",
  Fortigate:
    "Firewall- en netwerksituaties (policies, VPN, routing). We kijken naar je troubleshooting-aanpak.",
  "AI / Copilot":
    "Verantwoord en praktisch AI-gebruik (Copilot, dataveiligheid). Het gaat om beoordelingsvermogen, niet om hypes.",
  VoIP:
    "Telefonie-situaties (call routing, audio-issues). We kijken hoe je een storing logisch terugbrengt naar de oorzaak.",
  Servers:
    "Windows Server-situaties (AD, DNS, backup, herstel). Het gaat om diagnose en veilige herstelstappen.",
  "SharePoint / Teams":
    "Samenwerken en rechten in SharePoint/Teams (gasten, governance). We kijken naar veilige, werkbare keuzes.",
  "SharePoint / Azure Migrations":
    "Migratiesituaties (intake, cutover, rollback). We toetsen je planmatige en risicobewuste aanpak.",
  Inforcer:
    "Beheer van baselines en tenant-policies (rollout, exceptions, drift). Het gaat om controle en zorgvuldigheid.",
  "Basic IT & Troubleshooting":
    "Algemene IT-diagnose (netwerk, endpoint, escalatie). We kijken naar een gestructureerde aanpak en klantimpact.",
  "Werkhouding & Communicatie":
    "Situaties uit de praktijk over samenwerking, klanttoon en omgaan met druk. Er is geen trucvraag — kies wat jij professioneel zou doen.",
  Engels:
    "Engels leesbegrip: je leest korte technische Engelse teksten en beantwoordt vragen erover. Je hoeft zelf niets te schrijven; we testen begrip, niet schrijfstijl.",
};

export const competencies = [
  "Concepten",
  "Configuratie",
  "Implementatie",
  "Operations",
  "Troubleshooting",
  "Security",
  "Samenwerking",
];

export const candidates: Candidate[] = [
  {
    id: "AP",
    name: "Arjun Patel",
    meta: "Cloud Engineer kandidaat / Amsterdam / test afgerond",
    scores: {
      "AI / Copilot": 76,
      "Microsoft 365": 82,
      Azure: 86,
      "Kaseya Stack": 68,
      Fortigate: 72,
      VoIP: 55,
      Servers: 81,
      "SharePoint / Teams": 74,
      "SharePoint / Azure Migrations": 79,
      Inforcer: 62,
      "Basic IT & Troubleshooting": 84,
      "Werkhouding & Communicatie": 78,
      Engels: 82,
    },
    scenarioScores: [84, 82, 67, 74, 55, 80, 78, 63, 78, 82],
    scenarioLabels: [
      "Entra toegang",
      "Azure VM herstel",
      "Kaseya patch failure",
      "Fortigate VPN",
      "VoIP audio",
      "SharePoint rechten",
      "Server backup",
      "Inforcer baseline",
      "Klantupdate",
      "Engelse samenvatting",
    ],
  },
  {
    id: "LS",
    name: "Lisa Smit",
    meta: "Modern Work Consultant kandidaat / Utrecht / test afgerond",
    scores: {
      "AI / Copilot": 84,
      "Microsoft 365": 88,
      Azure: 66,
      "Kaseya Stack": 54,
      Fortigate: 46,
      VoIP: 58,
      Servers: 62,
      "SharePoint / Teams": 91,
      "SharePoint / Azure Migrations": 86,
      Inforcer: 79,
      "Basic IT & Troubleshooting": 76,
      "Werkhouding & Communicatie": 86,
      Engels: 84,
    },
    scenarioScores: [77, 66, 52, 48, 59, 92, 69, 81, 88, 84],
    scenarioLabels: [
      "Copilot adoptie",
      "Teams governance",
      "Kaseya melding",
      "Firewall change",
      "VoIP intake",
      "SharePoint migratie",
      "Server overdracht",
      "Inforcer policy",
      "Collega-overdracht",
      "Engelse klantmail",
    ],
  },
  {
    id: "MB",
    name: "Milan Bakker",
    meta: "Technical Account Manager kandidaat / Rotterdam / test afgerond",
    scores: {
      "AI / Copilot": 72,
      "Microsoft 365": 78,
      Azure: 74,
      "Kaseya Stack": 82,
      Fortigate: 75,
      VoIP: 71,
      Servers: 77,
      "SharePoint / Teams": 76,
      "SharePoint / Azure Migrations": 70,
      Inforcer: 84,
      "Basic IT & Troubleshooting": 80,
      "Werkhouding & Communicatie": 88,
      Engels: 83,
    },
    scenarioScores: [76, 74, 82, 78, 72, 75, 79, 86, 89, 83],
    scenarioLabels: [
      "QBR risico-review",
      "Azure kosten",
      "Kaseya SLA-trend",
      "Fortigate renewal",
      "VoIP roadmap",
      "Teams governance",
      "Server lifecycle",
      "Inforcer compliance",
      "Escalatiegesprek",
      "Engelse management update",
    ],
  },
];

export const learners: Learner[] = [
  {
    id: "LV",
    name: "Lotte Vermeer",
    role: "Servicedesk Engineer",
    targetRole: "Cloud Engineer",
    meta: "Interne medewerker / 7 maanden in dienst / service desk naar cloud",
    scores: {
      "AI / Copilot": 58,
      "Microsoft 365": 74,
      Azure: 51,
      "Kaseya Stack": 78,
      Fortigate: 48,
      VoIP: 62,
      Servers: 69,
      "SharePoint / Teams": 71,
      "SharePoint / Azure Migrations": 46,
      Inforcer: 54,
      "Basic IT & Troubleshooting": 82,
      "Werkhouding & Communicatie": 86,
      Engels: 72,
    },
  },
  {
    id: "DK",
    name: "Daan Koster",
    role: "Cloud Engineer",
    targetRole: "Technical Account Manager",
    meta: "Interne medewerker / projectengineer / groeit naar klantregie",
    scores: {
      "AI / Copilot": 76,
      "Microsoft 365": 84,
      Azure: 88,
      "Kaseya Stack": 66,
      Fortigate: 74,
      VoIP: 56,
      Servers: 82,
      "SharePoint / Teams": 78,
      "SharePoint / Azure Migrations": 80,
      Inforcer: 61,
      "Basic IT & Troubleshooting": 83,
      "Werkhouding & Communicatie": 68,
      Engels: 74,
    },
  },
  {
    id: "NO",
    name: "Nora Otten",
    role: "Modern Work Consultant",
    targetRole: "Modern Work Consultant",
    meta: "Interne medewerker / adoptie en governance / senior verdieping",
    scores: {
      "AI / Copilot": 81,
      "Microsoft 365": 86,
      Azure: 62,
      "Kaseya Stack": 44,
      Fortigate: 42,
      VoIP: 50,
      Servers: 58,
      "SharePoint / Teams": 90,
      "SharePoint / Azure Migrations": 82,
      Inforcer: 76,
      "Basic IT & Troubleshooting": 72,
      "Werkhouding & Communicatie": 84,
      Engels: 80,
    },
  },
];

export const trainingModules: TrainingModule[] = [
  {
    id: "m365-ca-triage",
    title: "Conditional Access incident triage",
    domain: "Microsoft 365",
    level: "L2",
    xp: 90,
    format: "Scenario + loganalyse",
    proof: "Sign-in logs, impactanalyse, rollback en klantupdate",
    badge: "Conditional Access Responder",
  },
  {
    id: "azure-restore",
    title: "Azure VM herstel zonder paniek",
    domain: "Azure",
    level: "L2",
    xp: 110,
    format: "Praktijklab",
    proof: "Restore point, boot diagnostics, validatie en kostenbewuste nazorg",
    badge: "Azure Recovery Operator",
  },
  {
    id: "kaseya-alert-flow",
    title: "Datto RMM alert naar Autotask ticket",
    domain: "Kaseya Stack",
    level: "L1",
    xp: 70,
    format: "Workflow-drill",
    proof: "Ticket, IT Glue check, EDR-context en interne overdracht",
    badge: "RMM Triage Starter",
  },
  {
    id: "fortigate-vpn",
    title: "Fortigate VPN storing ontleden",
    domain: "Fortigate",
    level: "L2",
    xp: 100,
    format: "Troubleshooting case",
    proof: "Phase 1/2, routes, NAT, logging en testplan",
    badge: "Firewall Triage",
  },
  {
    id: "sharepoint-permissions",
    title: "SharePoint rechten en gasttoegang herstellen",
    domain: "SharePoint / Teams",
    level: "L2",
    xp: 95,
    format: "Governance case",
    proof: "Owner-model, sensitivity, guest review en preventieve controls",
    badge: "Permission Fixer",
  },
  {
    id: "migration-cutover",
    title: "SharePoint/Azure migratie cutover",
    domain: "SharePoint / Azure Migrations",
    level: "L3",
    xp: 130,
    format: "Projectsimulatie",
    proof: "Discovery, pilot, delta sync, rollback, communicatie en nazorg",
    badge: "Migration Planner",
  },
  {
    id: "inforcer-baseline",
    title: "Inforcer baseline rollout met uitzonderingen",
    domain: "Inforcer",
    level: "L2",
    xp: 90,
    format: "Policy-review",
    proof: "Baselineversie, rollout ring, exception governance en audit",
    badge: "Baseline Steward",
  },
  {
    id: "customer-update",
    title: "Klantupdate onder druk",
    domain: "Werkhouding & Communicatie",
    level: "L1",
    xp: 75,
    format: "Communicatie-drill",
    proof: "Heldere status, impact, eigenaar, vervolgstap en toon",
    badge: "Customer Update Pro",
  },
  {
    id: "english-incident",
    title: "English incident communication",
    domain: "Engels",
    level: "L1",
    xp: 65,
    format: "Schrijfopdracht",
    proof: "Short customer update with impact, restoration status and next update",
    badge: "English Incident Communicator",
  },
  {
    id: "copilot-readiness",
    title: "Copilot-readiness zonder datarisico",
    domain: "AI / Copilot",
    level: "L2",
    xp: 100,
    format: "Consulting scenario",
    proof: "Permissions, labels, adoption, governance en realistische verwachting",
    badge: "Copilot Governance Advisor",
  },
  {
    id: "az900-cloud-fundamentals",
    title: "Azure Fundamentals voor MSP-context",
    domain: "Azure",
    level: "L1",
    xp: 80,
    format: "Kennischeck + klantscenario",
    proof:
      "IaaS/PaaS/SaaS, regions, availability zones, cost control en shared responsibility uitgelegd in klanttaal",
    badge: "Azure Fundamentals",
  },
  {
    id: "azure-governance-rbac-policy",
    title: "Azure governance: RBAC, Policy en locks",
    domain: "Azure",
    level: "L2",
    xp: 115,
    format: "Governance case",
    proof: "Resource groups, tags, RBAC-scope, Azure Policy, locks en change-impact vastgelegd",
    badge: "Azure Governance Steward",
  },
  {
    id: "m365-security-assessment",
    title: "M365 security assessment uitvoeren",
    domain: "Microsoft 365",
    level: "L3",
    xp: 140,
    format: "Assessmentlab",
    proof:
      "Identity, Conditional Access, Exchange, Teams, SharePoint en Intune findings geprioriteerd met attack-path impact",
    badge: "M365 Security Assessor",
  },
  {
    id: "entra-identity-hardening",
    title: "Entra ID identity hardening",
    domain: "Microsoft 365",
    level: "L2",
    xp: 110,
    format: "Security review",
    proof: "MFA, break-glass, risky sign-ins, legacy auth, app consent en adminrollen beoordeeld",
    badge: "Identity Hardening Analyst",
  },
  {
    id: "teams-sharepoint-secure-collab",
    title: "Teams en SharePoint secure collaboration review",
    domain: "SharePoint / Teams",
    level: "L2",
    xp: 105,
    format: "Governance review",
    proof:
      "Guest access, external sharing, ownership, lifecycle, sensitivity labels en herstelplan beschreven",
    badge: "Secure Collaboration Reviewer",
  },
  {
    id: "intune-baseline-drift",
    title: "Intune baseline drift en endpoint risico",
    domain: "Microsoft 365",
    level: "L2",
    xp: 105,
    format: "Endpoint security case",
    proof:
      "Compliance, configuration profiles, excluded devices, rollout rings en rollback vastgelegd",
    badge: "Endpoint Baseline Analyst",
  },
  {
    id: "attack-path-triage",
    title: "Attack-path triage voor MSP-klanten",
    domain: "Basic IT & Troubleshooting",
    level: "L3",
    xp: 135,
    format: "Security scenario",
    proof:
      "Initial access, privilege escalation, lateral movement, data exposure en mitigaties geprioriteerd",
    badge: "Attack Path Mapper",
  },
  {
    id: "secure-code-review-foundations",
    title: "Secure review foundations voor scripts en automations",
    domain: "Basic IT & Troubleshooting",
    level: "L2",
    xp: 95,
    format: "Review-opdracht",
    proof: "Inputvalidatie, secrets, least privilege, logging en rollback-risico benoemd",
    badge: "Secure Automation Reviewer",
  },
  {
    id: "security-awareness-consulting",
    title: "Security awareness zonder bangmakerij",
    domain: "Werkhouding & Communicatie",
    level: "L1",
    xp: 70,
    format: "Consulting rollenspel",
    proof: "Risico, gedrag, training, meetbare opvolging en realistische toon in klantgesprek",
    badge: "Security Awareness Coach",
  },
];

export const teamChallenge = {
  title: "Van RMM-alert naar veilige klantupdate",
  goal: "Los als team een ketenincident op waarin Datto RMM, Autotask, IT Glue, Microsoft 365 en klantcommunicatie samenkomen.",
  rules: [
    "Geen klantdata in screenshots",
    "Elke stap krijgt een eigenaar",
    "Documentatie telt mee als bewijs",
    "De beste score is herbruikbare werkwijze",
  ],
  reward: "Team XP + workflow-template voor de vragenbank",
};

export interface PerformanceLoopModule {
  id: string;
  title: string;
  purpose: string;
  campaiUse: string;
  owner: string;
  status: string;
}

export interface DevelopmentGoal {
  id: string;
  learnerId: string;
  title: string;
  metric: string;
  linkedDomain: string;
  progress: number;
  status: string;
  due: string;
}

export interface CoachingMoment {
  learnerId: string;
  type: "1:1" | "Review";
  title: string;
  date: string;
  focus: string;
  action: string;
}

export interface ReviewTemplate {
  id: string;
  title: string;
  cadence: string;
  questions: string[];
}

export interface SurveyTheme {
  title: string;
  score: number;
  state: "good" | "warn" | "risk";
  signal: string;
}

export const performanceLoopModules: PerformanceLoopModule[] = [
  {
    id: "career",
    title: "Career plan",
    purpose: "Rolprofiel, huidige functiecontext en doelrol in een vaste ontwikkelroute.",
    campaiUse: "Gebruik rolwegingen en skill gaps als ontwikkelkompas, niet als automatische HR-score.",
    owner: "Coach + medewerker",
    status: "Actief",
  },
  {
    id: "reviews",
    title: "Reviews",
    purpose: "Formele evaluatiemomenten met self-review, coachinput en bewijs.",
    campaiUse: "Koppel reviews aan modulebewijs, klantveilige feedback en senior review.",
    owner: "Teamlead",
    status: "Template",
  },
  {
    id: "one-on-ones",
    title: "1:1s",
    purpose: "Continue dialoog over blockers, voortgang en volgende acties.",
    campaiUse: "Leg per 1:1 eigenaar, deadline en praktijkbewijs vast.",
    owner: "Coach",
    status: "Actief",
  },
  {
    id: "goals",
    title: "Goals",
    purpose: "SMART ontwikkeldoelen met status en voortgang.",
    campaiUse: "Doelen leveren MSP-output op: SOP, script, klantupdate, checklist of runbook.",
    owner: "Medewerker",
    status: "Actief",
  },
  {
    id: "onboard-learn",
    title: "Onboard & Learn",
    purpose: "Learning paths, courses, articles en onboarding-items.",
    campaiUse: "Gebruik modules voor Campai-stack, security, klantcommunicatie en tooling.",
    owner: "Academy admin",
    status: "Actief",
  },
  {
    id: "surveys",
    title: "Surveys",
    purpose: "Korte pulse-metingen voor betrokkenheid, focus en teamfrictie.",
    campaiUse: "Alleen geaggregeerd tonen; niet mengen met recruitment of individuele beoordeling.",
    owner: "HR / management",
    status: "Governance nodig",
  },
  {
    id: "insights",
    title: "Insights",
    purpose: "Doorlopende feedback en complimenten als gespreksinput.",
    campaiUse: "Maak feedback concreet: gedrag, impact, voorbeeld en vervolgactie.",
    owner: "Iedereen",
    status: "Template",
  },
  {
    id: "reports",
    title: "Reports",
    purpose: "Trendrapportage over ontwikkeling, engagement en opvolging.",
    campaiUse: "Rapporteer op teamniveau en scheid trainingdata van HR-besluiten.",
    owner: "Management",
    status: "Prototype",
  },
];

export const developmentGoals: DevelopmentGoal[] = [
  {
    id: "goal-secure-runbook",
    learnerId: "LV",
    title: "Maak een herbruikbaar incident-runbook",
    metric: "Runbook gereviewd door senior engineer en toegepast op 2 scenario's",
    linkedDomain: "Basic IT & Troubleshooting",
    progress: 65,
    status: "progress",
    due: "Q3",
  },
  {
    id: "goal-customer-update",
    learnerId: "LV",
    title: "Verbeter klantupdates bij P1/P2-incidenten",
    metric: "3 updates met impact, eigenaar, ETA en volgende update",
    linkedDomain: "Werkhouding & Communicatie",
    progress: 40,
    status: "progress",
    due: "Q3",
  },
  {
    id: "goal-azure-governance",
    learnerId: "DK",
    title: "Standaardiseer Azure governance intake",
    metric: "Checklist voor RBAC, Policy, tagging en cost guardrails",
    linkedDomain: "Azure",
    progress: 55,
    status: "progress",
    due: "Q4",
  },
  {
    id: "goal-copilot-governance",
    learnerId: "NO",
    title: "Bouw Copilot-readiness gespreksscript",
    metric: "Script met permissions, labels, adoptie en risicoacceptatie",
    linkedDomain: "AI / Copilot",
    progress: 70,
    status: "progress",
    due: "Q3",
  },
];

export const coachingMoments: CoachingMoment[] = [
  {
    learnerId: "LV",
    type: "1:1",
    title: "Skill-gap check Servicedesk → Cloud",
    date: "2026-07-03",
    focus: "Azure restore, klantupdate en escalatiegrenzen",
    action: "Koppel labbewijs aan doel en plan senior review",
  },
  {
    learnerId: "DK",
    type: "Review",
    title: "Cloud governance review",
    date: "2026-07-10",
    focus: "RBAC, policy, rollback en kostenbewuste nazorg",
    action: "Senior review op governance checklist",
  },
  {
    learnerId: "NO",
    type: "1:1",
    title: "Modern Work verdieping",
    date: "2026-07-08",
    focus: "SharePoint governance, guests en Copilot-readiness",
    action: "Feedback verzamelen uit projectretro",
  },
];

export const reviewTemplates: ReviewTemplate[] = [
  {
    id: "self-review",
    title: "Self-review",
    cadence: "Per kwartaal",
    questions: [
      "Wat heb je aantoonbaar verbeterd?",
      "Welke MSP-werkwijze is herbruikbaar geworden?",
      "Waar is senior hulp nodig?",
    ],
  },
  {
    id: "coach-review",
    title: "Coachreview",
    cadence: "Na rolpad-mijlpaal",
    questions: [
      "Is bewijs klantveilig?",
      "Past gedrag bij de doelrol?",
      "Welke volgende stap verlaagt operationeel risico?",
    ],
  },
  {
    id: "peer-feedback",
    title: "Peer feedback",
    cadence: "Doorlopend",
    questions: [
      "Wat was de impact?",
      "Welk concreet voorbeeld hoort erbij?",
      "Welke vervolgactie helpt het team?",
    ],
  },
];

export const surveyThemes: SurveyTheme[] = [
  { title: "Werkdruk en focus", score: 72, state: "warn", signal: "Let op structurele interrupties bij escalaties." },
  { title: "Kennisdeling", score: 81, state: "good", signal: "SOP's en teamchallenges werken als teamritme." },
  { title: "Security awareness", score: 68, state: "warn", signal: "Meer bewijs vragen bij uitzonderingen en klantdata." },
  { title: "Rolduidelijkheid", score: 76, state: "good", signal: "Career plans maken verwachtingen zichtbaar." },
];

export type EvidenceRow = [string, string, string, number, string];

export const evidence: EvidenceRow[] = [
  ["Troubleshoot Entra ID sign-in met Conditional Access", "Microsoft 365", "Scenario", 82, "Vond geblokkeerde locatiepolicy en stelde een least-privilege uitzondering voor."],
  ["Herstel een Azure VM na mislukte update", "Azure", "Lab", 86, "Gebruikte restore point, boot diagnostics en documenteerde rollback-risico."],
  ["Los Datto RMM patch deployment failure op", "Kaseya Stack", "Troubleshooting", 68, "Vond ontbrekende policy inheritance, maar miste impact op maintenance window en Autotask-communicatie."],
  ["Ontwerp Fortigate site-to-site VPN validatie", "Fortigate", "Scenario", 72, "Behandelde phase 1/2, routes, NAT exemption en testplan."],
  ["Diagnoseer one-way audio in hosted VoIP", "VoIP", "Scenario", 55, "Checkte codecs en firewall, maar RTP/NAT-uitleg was zwak."],
  ["Beoordeel SharePoint/Teams governance en rechten", "SharePoint / Teams", "Scenario", 74, "Scheidde ownership, guests, sensitivity labels, lifecycle controls en Teams-kanaalstructuur."],
  ["Leg Windows Server backup failure triage uit", "Servers", "Troubleshooting", 81, "Checkte VSS writers, storage, event logs en restore verification."],
  ["Pas een Inforcer baseline toe", "Inforcer", "Configuratie", 62, "Begrijpt policy deployment, maar mist exception governance."],
  ["Maak een SharePoint/Azure migratie cutover-plan", "SharePoint / Azure Migrations", "Project", 79, "Behandelde discovery, migratietooling, pilot, delta sync, DNS, rollback en nazorg."],
  ["Leg uit hoe Autotask, Datto RMM, IT Glue, EDR en BullPhish samenwerken", "Kaseya Stack", "Kennischeck", 71, "Ziet de relatie tussen tickets, monitoring, documentatie, security awareness en endpoint security, maar mist rapportageflow."],
  ["Beoordeel Copilot-readiness voor een klant", "AI / Copilot", "Consulting", 76, "Noemde datasecurity, permissions, adoptie en governance."],
  ["Leg DNS en DHCP failure modes uit", "Basic IT & Troubleshooting", "Kennischeck", 84, "Heldere diagnoseflow en goede escalatiegrenzen."],
  ["Reageer op een gefrustreerde collega na een overdrachtsfout", "Werkhouding & Communicatie", "Gedrag", 78, "Neemt verantwoordelijkheid, vraagt feiten uit en stelt herstelactie voor zonder schuld te schuiven."],
  ["Schrijf een korte Engelse klantupdate na een incident", "Engels", "Taalvaardigheid", 82, "Duidelijke Engelse statusupdate met impact, next step en zakelijke toon."],
];

export const testQuestions: TestQuestion[] = [
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Een gebruiker kan Outlook Web openen, maar niet inloggen op de Outlook desktop client na een security policy wijziging. Wat controleer je eerst?",
    options: [
      "Alleen mailboxgrootte",
      "Conditional Access, sign-in logs, authenticatiemethode en client app policy",
      "Windows opnieuw installeren",
      "De gebruiker vragen van internetprovider te wisselen",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Project",
    prompt:
      "Een klant wil een SharePoint migratie met minimale downtime. Welk migratieplan is het sterkst?",
    options: [
      "Big bang copy zonder discovery",
      "Inventarisatie, rechtenreview, pilot, gefaseerde migratie, delta sync, communicatie en rollback",
      "Alleen de nieuwste bestanden kopiëren",
      "Gebruikers hun eigen data laten verplaatsen",
    ],
    answer: 1,
  },
  {
    domain: "Kaseya Stack",
    type: "Stackkennis",
    prompt: "Welke onderdelen horen bij de Kaseya-stack die wij willen toetsen?",
    options: [
      "Alleen Autotask",
      "Autotask, Datto RMM, IT Glue, EDR en BullPhish, inclusief hoe tickets, monitoring, documentatie en security-awareness samenhangen",
      "Alleen Microsoft Teams",
      "Alleen Fortigate en VoIP",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Teams",
    type: "Kennisdiepte",
    prompt: "Wat wil je minimaal weten om iemands SharePoint/Teams-kennis goed te beoordelen?",
    options: [
      "Alleen of iemand bestanden kan uploaden",
      "Sitestructuur, Teams-kanalen, rechten, guests, sensitivity labels, lifecycle, governance en adoptie",
      "Alleen of iemand Teams kan bellen",
      "Alleen of SharePoint Online bestaat",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Migratiekennis",
    prompt: "Welke onderdelen tonen echte migratiekennis bij een SharePoint/Azure migratie?",
    options: [
      "Alleen bestanden slepen",
      "Discovery, rechtenanalyse, toolingkeuze, pilot, delta sync, cutover, rollback, communicatie en nazorg",
      "Alleen een datum plannen",
      "Alleen licenties tellen",
    ],
    answer: 1,
  },
  {
    domain: "Technical Account Manager",
    type: "Klantinschatting",
    prompt:
      "Tijdens een QBR blijken er herhaalde backup failures en unmanaged endpoints te zijn. Wat moet de TAM doen?",
    options: [
      "Negeren omdat er geen open ticket is",
      "Risico concreet maken, owners afspreken, remediation prioriteren en besluiten opvolgen",
      "Alleen een groter contract proberen te verkopen",
      "Escaleren zonder context",
    ],
    answer: 1,
  },
  {
    domain: "Inforcer",
    type: "Configuratie",
    prompt:
      "Je past een Inforcer baseline toe op een Microsoft 365 omgeving. Wat moet vóór deployment geborgd zijn?",
    options: [
      "Niets, baselines zijn altijd veilig",
      "Baselineversie, uitzonderingen, rollout ring, rollback en audit approval",
      "Alleen het aantal licenties",
      "De browsercache van de gebruiker",
    ],
    answer: 1,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Gedrag",
    prompt:
      "Een collega draagt een ticket slecht over, waardoor jij extra werk hebt en de klant ontevreden is. Wat is de beste reactie?",
    options: [
      "De collega publiek aanspreken in de groepschat",
      "Eerst de klant helpen, feiten vastleggen, de overdracht rustig met de collega bespreken en een structurele verbetering voorstellen",
      "Het ticket terugzetten zonder toelichting",
      "Niets doen, want het was niet jouw fout",
    ],
    answer: 1,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Werkethiek",
    prompt:
      "Je ziet dat je planning volloopt en een klantissue waarschijnlijk niet op tijd wordt opgepakt. Wat doe je?",
    options: [
      "Wachten tot iemand ernaar vraagt",
      "Prioriteit en impact bepalen, tijdig communiceren, hulp vragen en afspraken bijwerken",
      "Alleen de makkelijkste tickets sluiten",
      "Het ticket op pending zetten zonder uitleg",
    ],
    answer: 1,
  },
  {
    domain: "Engels",
    type: "English assessment",
    prompt:
      "Write the best short customer update in English after a Microsoft 365 incident where service is restored but monitoring continues.",
    options: [
      "Fixed now.",
      "Service has been restored. We are monitoring the environment and will share a final update once we have confirmed stability.",
      "Problem gone maybe.",
      "You caused the issue and we fixed it.",
    ],
    answer: 1,
  },
  {
    domain: "Azure",
    type: "Fundamentals",
    prompt:
      "Een klant vraagt waarom een workload beter in Azure App Service dan op een losse VM kan draaien. Wat is het sterkste antwoord?",
    options: [
      "Omdat App Service altijd goedkoper is dan elke VM",
      "Omdat App Service platformbeheer, schaalopties en deployment vereenvoudigt terwijl de klant minder OS-beheer hoeft te doen",
      "Omdat App Service geen monitoring nodig heeft",
      "Omdat een VM nooit geschikt is voor webapplicaties",
    ],
    answer: 1,
  },
  {
    domain: "Azure",
    type: "Governance",
    prompt:
      "Een engineer wil snel rechten op een hele Azure subscription om een incident op te lossen. Wat is de beste MSP-aanpak?",
    options: [
      "Owner-rechten permanent toekennen zodat vertraging wordt voorkomen",
      "Minimaal benodigde rol en scope bepalen, tijdelijk toekennen, logging vastleggen en achteraf intrekken",
      "Het wachtwoord van een global admin delen",
      "Alle resource locks verwijderen zodat niets blokkeert",
    ],
    answer: 1,
  },
  {
    domain: "Microsoft 365",
    type: "Security assessment",
    prompt:
      "Welke combinatie geeft het beste startpunt voor een M365 security assessment bij een nieuwe klant?",
    options: [
      "Alleen Secure Score bekijken en het percentage rapporteren",
      "Identity, Conditional Access, legacy auth, adminrollen, external sharing, mailflow en endpoint compliance samen beoordelen",
      "Alleen de Exchange mailboxgroottes controleren",
      "Alleen vragen of de klant MFA gebruikt",
    ],
    answer: 1,
  },
  {
    domain: "Microsoft 365",
    type: "Entra ID",
    prompt: "Je ziet risky sign-ins en geen duidelijk break-glass proces. Wat hoort in je advies?",
    options: [
      "Alle risky users direct verwijderen",
      "MFA en CA valideren, break-glass accounts borgen, adminrollen beperken en monitoring/alerting vastleggen",
      "Alle gebruikers global admin maken zodat support sneller kan helpen",
      "Alle sign-in logs wissen na afronding",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Teams",
    type: "Governance",
    prompt:
      "Een Teams-omgeving heeft veel gastgebruikers en niemand weet wie eigenaar is. Wat toets je eerst?",
    options: [
      "Alle gasten blokkeren zonder impactanalyse",
      "Owners, gasttoegang, external sharing, lifecycle, sensitivity labels en dataclassificatie",
      "Alle kanalen hernoemen",
      "Alleen controleren of Teams kan bellen",
    ],
    answer: 1,
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Security scenario",
    prompt:
      "Een tenant heeft legacy auth, zwakke adminhygiëne en brede SharePoint sharing. Hoe prioriteer je?",
    options: [
      "Eerst cosmetic branding aanpassen",
      "Attack path bepalen, identity-risico's sluiten, datadeling beperken en changes met rollback en communicatie plannen",
      "Alle gebruikers tegelijk blokkeren",
      "Alleen een rapport sturen zonder hersteladvies",
    ],
    answer: 1,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Consulting",
    prompt:
      "Een klant wil security awareness inkopen maar reageert slecht op bangmakerij. Wat is de beste aanpak?",
    options: [
      "Vooral incidenten overdrijven zodat urgentie ontstaat",
      "Risico concreet maken, gedrag meetbaar trainen, positieve toon houden en opvolging afspreken",
      "Alle medewerkers verplicht dagelijks testen zonder uitleg",
      "Alleen phishingstatistieken tonen",
    ],
    answer: 1,
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Secure automation",
    prompt:
      "Je reviewt een PowerShell-script dat tenantinstellingen wijzigt. Welke review is minimaal nodig?",
    options: [
      "Alleen kijken of het script snel draait",
      "Permissions, inputvalidatie, logging, secrets, dry-run/rollback en tenant-scope controleren",
      "Het script direct als global admin uitvoeren",
      "Alle foutmeldingen onderdrukken",
    ],
    answer: 1,
  },
];

// ---------------------------------------------------------------------------
// Assessment-voorbereiding (deterministische optie-shuffle + lengte-balans).
// Pure logica, gedrag identiek aan de vanilla app.
// ---------------------------------------------------------------------------
function seededRandom(seedStr: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i += 1) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return (h >>> 0) / 4294967296;
  };
}

function shuffledIndices(length: number, seed: string): number[] {
  const rng = seededRandom(seed);
  const order = Array.from({ length }, (_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function expandDistractor(option: string, targetLength: number, domain: string): string {
  if (option.length >= targetLength) return option;
  const suffixes = [
    " waarbij loganalyse, impactbepaling en vervolgactie niet aantoonbaar worden vastgelegd.",
    " en daarbij scope, risico, rollback en klantcommunicatie onvoldoende worden meegenomen.",
    ` waarbij de ${domain}-context, governance en auditspoor ontbreken.`,
    " en pas achteraf beoordelen of dit bij het klantprobleem paste.",
  ];
  let expanded = option;
  for (const suffix of suffixes) {
    if (expanded.length >= targetLength) break;
    expanded += suffix;
  }
  return expanded;
}

function balanceOptionLengths(options: string[], correctIndex: number, domain: string): string[] {
  const correctLength = options[correctIndex].length;
  return options.map((option, index) => {
    if (index === correctIndex) return option;
    return expandDistractor(option, Math.max(58, correctLength - 8), domain);
  });
}

function prepareAssessmentQuestion(question: TestQuestion, index: number): void {
  question.id = question.id || `q-${index + 1}`;
  const originalOptions = question.options.map((text, optionIndex) => ({
    text,
    originalIndex: optionIndex,
  }));
  const correct = originalOptions.find((option) => option.originalIndex === question.answer)!;
  const distractors = originalOptions.filter((option) => option.originalIndex !== question.answer);
  const distractorOrder = shuffledIndices(distractors.length, `${question.id}:distractors`).map(
    (item) => distractors[item],
  );
  const targetCorrectIndex = [2, 0, 3, 1][index % 4];
  const prepared: Array<{ text: string; originalIndex: number }> = [];

  for (let optionIndex = 0; optionIndex < 4; optionIndex += 1) {
    if (optionIndex === targetCorrectIndex) {
      prepared.push(correct);
    } else {
      prepared.push(distractorOrder.shift()!);
    }
  }

  question.options = prepared.map((option) => option.text);
  question.answer = targetCorrectIndex;
  question.options = balanceOptionLengths(question.options, question.answer, question.domain);
  question.answerQuality = {
    correctIndex: targetCorrectIndex,
    correctLength: question.options[targetCorrectIndex].length,
    maxDistractorLength: Math.max(
      ...question.options
        .filter((_, optionIndex) => optionIndex !== targetCorrectIndex)
        .map((option) => option.length),
    ),
  };
}

export function prepareAssessmentQuestions(questions: TestQuestion[]): void {
  questions.forEach(prepareAssessmentQuestion);
}

prepareAssessmentQuestions(testQuestions);

export const unknownOptionLabel = "Dit onderwerp is mij niet bekend";
export const assessmentSchemaVersion = "20260622-balanced-options-v1";

export const knownSystemOptions: Record<string, string[]> = {
  "Kaseya Stack": ["TOPdesk", "HaloPSA", "NinjaOne", "N-able", "ConnectWise", "Freshservice", "Zendesk", "Microsoft Intune"],
  "SharePoint / Teams": ["Google Workspace", "Slack", "Confluence", "Dropbox Business", "Box"],
  "SharePoint / Azure Migrations": ["Google Drive migratie", "Dropbox migratie", "fileserver migratie", "tenant-to-tenant migratie"],
  Inforcer: ["Microsoft Intune baselines", "CIPP", "native Microsoft 365 policies", "Conditional Access templates"],
  Fortigate: ["SonicWall", "Sophos", "Palo Alto", "Cisco Meraki", "WatchGuard"],
  VoIP: ["3CX", "Teams Phone", "Broadsoft", "Mitel", "Yealink beheer"],
  Azure: ["AWS", "Google Cloud", "VMware", "Hyper-V"],
  "AI / Copilot": ["ChatGPT", "Claude", "Gemini", "Power Platform AI", "Microsoft Copilot Chat"],
};

export const fallbackQuestions: Record<string, TestQuestion> = {
  "Kaseya Stack": {
    id: "fallback-kaseya-stack",
    domain: "Kaseya Stack",
    type: "Algemene stackvraag",
    isFallback: true,
    prompt:
      "Je kent de Kaseya-stack niet goed, maar je hebt mogelijk andere ITSM/RMM/PSA tooling gezien. Hoe zou je in algemene zin een monitoring alert omzetten naar ticket, documentatiecheck, securitycontrole en klantupdate?",
    options: [
      "Ik zou alleen het alert sluiten als het groen wordt.",
      "Ik zou impact bepalen, ticket aanmaken of bijwerken, relevante documentatie controleren, security/endpointstatus meenemen en de klant of collega duidelijk informeren.",
      "Ik zou wachten tot de klant belt.",
      "Ik zou alleen een screenshot maken.",
    ],
    answer: 1,
  },
  "SharePoint / Teams": {
    id: "fallback-sharepoint-teams",
    domain: "SharePoint / Teams",
    type: "Algemene samenwerkingsvraag",
    isFallback: true,
    prompt:
      "Je kent SharePoint/Teams beperkt. Welke algemene punten controleer je bij een samenwerkingsomgeving met documenten, teams, gasten en rechten?",
    options: [
      "Alleen of gebruikers kunnen chatten.",
      "Eigenaarschap, rechten, gasttoegang, documentstructuur, lifecycle, dataclassificatie en adoptieafspraken.",
      "Alleen opslagruimte.",
      "Alleen of de app op de telefoon staat.",
    ],
    answer: 1,
  },
  "SharePoint / Azure Migrations": {
    id: "fallback-migrations",
    domain: "SharePoint / Azure Migrations",
    type: "Algemene migratievraag",
    isFallback: true,
    prompt:
      "Je hebt weinig SharePoint/Azure migratiekennis. Welke algemene migratiestappen verwacht je minimaal bij een zakelijke IT-migratie?",
    options: [
      "Direct alles kopiëren op vrijdagmiddag.",
      "Inventarisatie, risicoanalyse, pilot, communicatie, planning, validatie, rollback en nazorg.",
      "Alleen de data zippen.",
      "Alleen na afloop controleren.",
    ],
    answer: 1,
  },
  Inforcer: {
    id: "fallback-inforcer",
    domain: "Inforcer",
    type: "Algemene policyvraag",
    isFallback: true,
    prompt:
      "Je kent Inforcer niet. Hoe zou je algemeen omgaan met het uitrollen van security baselines of tenant policies?",
    options: [
      "Alles direct naar iedereen pushen.",
      "Baselineversie vastleggen, uitzonderingen bepalen, gefaseerd uitrollen, rollback plannen en wijzigingen auditen.",
      "Alleen de naam van de policy wijzigen.",
      "Wachten tot Microsoft iets blokkeert.",
    ],
    answer: 1,
  },
  default: {
    id: "fallback-general",
    domain: "Algemeen",
    type: "Algemene denkvraag",
    isFallback: true,
    prompt:
      "Dit specifieke onderwerp is onbekend. Hoe pak je een onbekend technisch probleem professioneel aan?",
    options: [
      "Gokken en hopen dat het klopt.",
      "Impact bepalen, informatie verzamelen, documentatie raadplegen, hulp vragen waar nodig, klantverwachting managen en bevindingen vastleggen.",
      "Het ticket sluiten.",
      "Alleen zoeken naar het eerste forumantwoord.",
    ],
    answer: 1,
  },
};

prepareAssessmentQuestions(Object.values(fallbackQuestions));

// People: kandidaten en learners delen het scoremodel maar blijven gescheiden
// via `type` voor governance en UX.
candidates.forEach((candidate) => {
  candidate.type = "candidate";
});
learners.forEach((learner) => {
  learner.type = "learner";
});
export const people: Person[] = [...(candidates as Person[]), ...(learners as Person[])];

// Recruitment-Vragenbank start leeg: alleen échte meerkeuzevragen horen hier.
// Vullen gebeurt via de goedgekeurde server-bank + "Genereer" (AI) / "Importeer" (JSON)
// in de Vragenbank. Open instructie-/coachingteksten en interne-trainingstof horen
// hier NIET thuis (interne ontwikkeling staat gescheiden in de Skills Academy).
export const draftQuestions: DraftQuestion[] = [];

export const dashboardModules = [
  { id: "overview-stats", title: "Statistieken", view: "overview" },
  { id: "overview-candidates", title: "Kandidaten", view: "overview" },
  { id: "overview-learners", title: "Medewerkers", view: "overview" },
  { id: "overview-heatmap", title: "Domeindekking", view: "overview" },
  { id: "candidate-detail", title: "Kandidaatdetail", view: "overview" },
  { id: "academy", title: "Skills Academy", view: "academy" },
  { id: "test", title: "Kandidaattest", view: "test" },
  { id: "questions", title: "Vragenbank", view: "questions" },
  { id: "admin", title: "Beheer", view: "admin" },
];

export const currentUserProfile = {
  name: "Campai gebruiker",
  email: "local@campai.nl",
  role: "Assessment Admin",
  source: "Entra ID",
  permissions: ["Dashboard review", "Vraagbeheer", "Rollenbeheer", "Auditlog bekijken"],
};

export const adminRoles = [
  { name: "Assessment Admin", scope: "Rollen, rubrics, auditlog", permissions: ["Alle dashboardviews", "Vraagbeheer", "Rubricbeheer", "Auditlog", "Export"] },
  { name: "Reviewer", scope: "Kandidaatbeoordeling", permissions: ["Dashboard", "Kandidaatrapport", "Export"] },
  { name: "Question Author", scope: "Vraagbeheer", permissions: ["Vragenbank", "Conceptvragen", "Bronregistratie"] },
  { name: "Candidate", scope: "Assessmentflow", permissions: ["Kandidaattest", "Eigen autosave"] },
];

export const documentationMap: Array<[string, string, string]> = [
  ["Profiel en rol", "Entra ID", "Naam, e-mail, approl"],
  ["Vragenbank", "Dashboard", "Domein, rol, type, bron, reviewstatus"],
  ["Kandidaatresultaat", "Azure Table Storage", "Score, antwoorden, rolfit, exportmoment"],
  ["Trainingresultaat", "Azure Table Storage", "Medewerker, leerpad, XP, badges, modulebewijs"],
  ["Bronmateriaal", "Afgeschermde opslag", "Geanonimiseerde bronpakketten"],
  ["Open source inspiratie", "CONTENT_SOURCES.md", "Repo, licentie, gebruikstype en Campai-afleiding"],
  ["Wijzigingen", "Auditlog", "Actor, tijdstip, actie, context"],
  ["Beleid", "Repository", "Thresholds, rubricversies, rolrechten"],
];

export const appSettingsMap: Array<[string, string, string]> = [
  ["Tenantmodus", "Single-tenant prototype", "Voor Campai intern. Multi-tenant scheiding hoort in auth, opslag en deployment."],
  ["Identity", "Entra ID met lokale fallback", "Profiel en rol komen uit de omgeving zodra de app achter Azure auth draait."],
  ["Assessmentbeleid", "Human review verplicht", "Geen automatische afwijzing zonder reviewercontrole."],
  ["Bronbeleid", "Geanonimiseerd", "Geen klantnamen, domeinen, IP-adressen of credentials in kandidaatvragen."],
  ["Opslagrichting", "Azure Table Storage-ready", "Prototype gebruikt lokale state; productiestate hoort tenantgescheiden te worden opgeslagen."],
  ["Vraagstructuur", assessmentSchemaVersion, "Antwoordvolgorde en optie-lengtes worden bij schemawijziging opnieuw voorbereid."],
];
