const roles = [
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
      Engels: 0.06
    }
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
      Engels: 0.05
    }
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
      Engels: 0.05
    }
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
      Engels: 0.11
    }
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
      Engels: 0.07
    }
  }
];

const domains = [
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
  "Engels"
];

const domainDetails = {
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
  Engels: "Engelse klantupdates, vendorcommunicatie, documentatie en incidentstatus"
};
const competencies = ["Concepten", "Configuratie", "Implementatie", "Operations", "Troubleshooting", "Security", "Samenwerking"];

const candidates = [
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
      Engels: 82
    },
    scenarioScores: [84, 82, 67, 74, 55, 80, 78, 63, 78, 82],
    scenarioLabels: ["Entra toegang", "Azure VM herstel", "Kaseya patch failure", "Fortigate VPN", "VoIP audio", "SharePoint rechten", "Server backup", "Inforcer baseline", "Klantupdate", "Engelse samenvatting"]
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
      Engels: 84
    },
    scenarioScores: [77, 66, 52, 48, 59, 92, 69, 81, 88, 84],
    scenarioLabels: ["Copilot adoptie", "Teams governance", "Kaseya melding", "Firewall change", "VoIP intake", "SharePoint migratie", "Server overdracht", "Inforcer policy", "Collega-overdracht", "Engelse klantmail"]
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
      Engels: 83
    },
    scenarioScores: [76, 74, 82, 78, 72, 75, 79, 86, 89, 83],
    scenarioLabels: ["QBR risico-review", "Azure kosten", "Kaseya SLA-trend", "Fortigate renewal", "VoIP roadmap", "Teams governance", "Server lifecycle", "Inforcer compliance", "Escalatiegesprek", "Engelse management update"]
  }
];

const learners = [
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
      Engels: 72
    }
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
      Engels: 74
    }
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
      Engels: 80
    }
  }
];

const trainingModules = [
  {
    id: "m365-ca-triage",
    title: "Conditional Access incident triage",
    domain: "Microsoft 365",
    level: "L2",
    xp: 90,
    format: "Scenario + loganalyse",
    proof: "Sign-in logs, impactanalyse, rollback en klantupdate",
    badge: "Conditional Access Responder"
  },
  {
    id: "azure-restore",
    title: "Azure VM herstel zonder paniek",
    domain: "Azure",
    level: "L2",
    xp: 110,
    format: "Praktijklab",
    proof: "Restore point, boot diagnostics, validatie en kostenbewuste nazorg",
    badge: "Azure Recovery Operator"
  },
  {
    id: "kaseya-alert-flow",
    title: "Datto RMM alert naar Autotask ticket",
    domain: "Kaseya Stack",
    level: "L1",
    xp: 70,
    format: "Workflow-drill",
    proof: "Ticket, IT Glue check, EDR-context en interne overdracht",
    badge: "RMM Triage Starter"
  },
  {
    id: "fortigate-vpn",
    title: "Fortigate VPN storing ontleden",
    domain: "Fortigate",
    level: "L2",
    xp: 100,
    format: "Troubleshooting case",
    proof: "Phase 1/2, routes, NAT, logging en testplan",
    badge: "Firewall Triage"
  },
  {
    id: "sharepoint-permissions",
    title: "SharePoint rechten en gasttoegang herstellen",
    domain: "SharePoint / Teams",
    level: "L2",
    xp: 95,
    format: "Governance case",
    proof: "Owner-model, sensitivity, guest review en preventieve controls",
    badge: "Permission Fixer"
  },
  {
    id: "migration-cutover",
    title: "SharePoint/Azure migratie cutover",
    domain: "SharePoint / Azure Migrations",
    level: "L3",
    xp: 130,
    format: "Projectsimulatie",
    proof: "Discovery, pilot, delta sync, rollback, communicatie en nazorg",
    badge: "Migration Planner"
  },
  {
    id: "inforcer-baseline",
    title: "Inforcer baseline rollout met uitzonderingen",
    domain: "Inforcer",
    level: "L2",
    xp: 90,
    format: "Policy-review",
    proof: "Baselineversie, rollout ring, exception governance en audit",
    badge: "Baseline Steward"
  },
  {
    id: "customer-update",
    title: "Klantupdate onder druk",
    domain: "Werkhouding & Communicatie",
    level: "L1",
    xp: 75,
    format: "Communicatie-drill",
    proof: "Heldere status, impact, eigenaar, vervolgstap en toon",
    badge: "Customer Update Pro"
  },
  {
    id: "english-incident",
    title: "English incident communication",
    domain: "Engels",
    level: "L1",
    xp: 65,
    format: "Schrijfopdracht",
    proof: "Short customer update with impact, restoration status and next update",
    badge: "English Incident Communicator"
  },
  {
    id: "copilot-readiness",
    title: "Copilot-readiness zonder datarisico",
    domain: "AI / Copilot",
    level: "L2",
    xp: 100,
    format: "Consulting scenario",
    proof: "Permissions, labels, adoption, governance en realistische verwachting",
    badge: "Copilot Governance Advisor"
  },
  {
    id: "az900-cloud-fundamentals",
    title: "Azure Fundamentals voor MSP-context",
    domain: "Azure",
    level: "L1",
    xp: 80,
    format: "Kennischeck + klantscenario",
    proof: "IaaS/PaaS/SaaS, regions, availability zones, cost control en shared responsibility uitgelegd in klanttaal",
    badge: "Azure Fundamentals"
  },
  {
    id: "azure-governance-rbac-policy",
    title: "Azure governance: RBAC, Policy en locks",
    domain: "Azure",
    level: "L2",
    xp: 115,
    format: "Governance case",
    proof: "Resource groups, tags, RBAC-scope, Azure Policy, locks en change-impact vastgelegd",
    badge: "Azure Governance Steward"
  },
  {
    id: "m365-security-assessment",
    title: "M365 security assessment uitvoeren",
    domain: "Microsoft 365",
    level: "L3",
    xp: 140,
    format: "Assessmentlab",
    proof: "Identity, Conditional Access, Exchange, Teams, SharePoint en Intune findings geprioriteerd met attack-path impact",
    badge: "M365 Security Assessor"
  },
  {
    id: "entra-identity-hardening",
    title: "Entra ID identity hardening",
    domain: "Microsoft 365",
    level: "L2",
    xp: 110,
    format: "Security review",
    proof: "MFA, break-glass, risky sign-ins, legacy auth, app consent en adminrollen beoordeeld",
    badge: "Identity Hardening Analyst"
  },
  {
    id: "teams-sharepoint-secure-collab",
    title: "Teams en SharePoint secure collaboration review",
    domain: "SharePoint / Teams",
    level: "L2",
    xp: 105,
    format: "Governance review",
    proof: "Guest access, external sharing, ownership, lifecycle, sensitivity labels en herstelplan beschreven",
    badge: "Secure Collaboration Reviewer"
  },
  {
    id: "intune-baseline-drift",
    title: "Intune baseline drift en endpoint risico",
    domain: "Microsoft 365",
    level: "L2",
    xp: 105,
    format: "Endpoint security case",
    proof: "Compliance, configuration profiles, excluded devices, rollout rings en rollback vastgelegd",
    badge: "Endpoint Baseline Analyst"
  },
  {
    id: "attack-path-triage",
    title: "Attack-path triage voor MSP-klanten",
    domain: "Basic IT & Troubleshooting",
    level: "L3",
    xp: 135,
    format: "Security scenario",
    proof: "Initial access, privilege escalation, lateral movement, data exposure en mitigaties geprioriteerd",
    badge: "Attack Path Mapper"
  },
  {
    id: "secure-code-review-foundations",
    title: "Secure review foundations voor scripts en automations",
    domain: "Basic IT & Troubleshooting",
    level: "L2",
    xp: 95,
    format: "Review-opdracht",
    proof: "Inputvalidatie, secrets, least privilege, logging en rollback-risico benoemd",
    badge: "Secure Automation Reviewer"
  },
  {
    id: "security-awareness-consulting",
    title: "Security awareness zonder bangmakerij",
    domain: "Werkhouding & Communicatie",
    level: "L1",
    xp: 70,
    format: "Consulting rollenspel",
    proof: "Risico, gedrag, training, meetbare opvolging en realistische toon in klantgesprek",
    badge: "Security Awareness Coach"
  }
];

const teamChallenge = {
  title: "Van RMM-alert naar veilige klantupdate",
  goal: "Los als team een ketenincident op waarin Datto RMM, Autotask, IT Glue, Microsoft 365 en klantcommunicatie samenkomen.",
  rules: ["Geen klantdata in screenshots", "Elke stap krijgt een eigenaar", "Documentatie telt mee als bewijs", "De beste score is herbruikbare werkwijze"],
  reward: "Team XP + workflow-template voor de vragenbank"
};

const evidence = [
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
  ["Schrijf een korte Engelse klantupdate na een incident", "Engels", "Taalvaardigheid", 82, "Duidelijke Engelse statusupdate met impact, next step en zakelijke toon."]
];

const testQuestions = [
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt: "Een gebruiker kan Outlook Web openen, maar niet inloggen op de Outlook desktop client na een security policy wijziging. Wat controleer je eerst?",
    options: ["Alleen mailboxgrootte", "Conditional Access, sign-in logs, authenticatiemethode en client app policy", "Windows opnieuw installeren", "De gebruiker vragen van internetprovider te wisselen"],
    answer: 1
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Project",
    prompt: "Een klant wil een SharePoint migratie met minimale downtime. Welk migratieplan is het sterkst?",
    options: ["Big bang copy zonder discovery", "Inventarisatie, rechtenreview, pilot, gefaseerde migratie, delta sync, communicatie en rollback", "Alleen de nieuwste bestanden kopiëren", "Gebruikers hun eigen data laten verplaatsen"],
    answer: 1
  },
  {
    domain: "Kaseya Stack",
    type: "Stackkennis",
    prompt: "Welke onderdelen horen bij de Kaseya-stack die wij willen toetsen?",
    options: ["Alleen Autotask", "Autotask, Datto RMM, IT Glue, EDR en BullPhish, inclusief hoe tickets, monitoring, documentatie en security-awareness samenhangen", "Alleen Microsoft Teams", "Alleen Fortigate en VoIP"],
    answer: 1
  },
  {
    domain: "SharePoint / Teams",
    type: "Kennisdiepte",
    prompt: "Wat wil je minimaal weten om iemands SharePoint/Teams-kennis goed te beoordelen?",
    options: ["Alleen of iemand bestanden kan uploaden", "Sitestructuur, Teams-kanalen, rechten, guests, sensitivity labels, lifecycle, governance en adoptie", "Alleen of iemand Teams kan bellen", "Alleen of SharePoint Online bestaat"],
    answer: 1
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Migratiekennis",
    prompt: "Welke onderdelen tonen echte migratiekennis bij een SharePoint/Azure migratie?",
    options: ["Alleen bestanden slepen", "Discovery, rechtenanalyse, toolingkeuze, pilot, delta sync, cutover, rollback, communicatie en nazorg", "Alleen een datum plannen", "Alleen licenties tellen"],
    answer: 1
  },
  {
    domain: "Technical Account Manager",
    type: "Klantinschatting",
    prompt: "Tijdens een QBR blijken er herhaalde backup failures en unmanaged endpoints te zijn. Wat moet de TAM doen?",
    options: ["Negeren omdat er geen open ticket is", "Risico concreet maken, owners afspreken, remediation prioriteren en besluiten opvolgen", "Alleen een groter contract proberen te verkopen", "Escaleren zonder context"],
    answer: 1
  },
  {
    domain: "Inforcer",
    type: "Configuratie",
    prompt: "Je past een Inforcer baseline toe op een Microsoft 365 omgeving. Wat moet vóór deployment geborgd zijn?",
    options: ["Niets, baselines zijn altijd veilig", "Baselineversie, uitzonderingen, rollout ring, rollback en audit approval", "Alleen het aantal licenties", "De browsercache van de gebruiker"],
    answer: 1
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Gedrag",
    prompt: "Een collega draagt een ticket slecht over, waardoor jij extra werk hebt en de klant ontevreden is. Wat is de beste reactie?",
    options: ["De collega publiek aanspreken in de groepschat", "Eerst de klant helpen, feiten vastleggen, de overdracht rustig met de collega bespreken en een structurele verbetering voorstellen", "Het ticket terugzetten zonder toelichting", "Niets doen, want het was niet jouw fout"],
    answer: 1
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Werkethiek",
    prompt: "Je ziet dat je planning volloopt en een klantissue waarschijnlijk niet op tijd wordt opgepakt. Wat doe je?",
    options: ["Wachten tot iemand ernaar vraagt", "Prioriteit en impact bepalen, tijdig communiceren, hulp vragen en afspraken bijwerken", "Alleen de makkelijkste tickets sluiten", "Het ticket op pending zetten zonder uitleg"],
    answer: 1
  },
  {
    domain: "Engels",
    type: "English assessment",
    prompt: "Write the best short customer update in English after a Microsoft 365 incident where service is restored but monitoring continues.",
    options: ["Fixed now.", "Service has been restored. We are monitoring the environment and will share a final update once we have confirmed stability.", "Problem gone maybe.", "You caused the issue and we fixed it."],
    answer: 1
  },
  {
    domain: "Azure",
    type: "Fundamentals",
    prompt: "Een klant vraagt waarom een workload beter in Azure App Service dan op een losse VM kan draaien. Wat is het sterkste antwoord?",
    options: ["Omdat App Service altijd goedkoper is dan elke VM", "Omdat App Service platformbeheer, schaalopties en deployment vereenvoudigt terwijl de klant minder OS-beheer hoeft te doen", "Omdat App Service geen monitoring nodig heeft", "Omdat een VM nooit geschikt is voor webapplicaties"],
    answer: 1
  },
  {
    domain: "Azure",
    type: "Governance",
    prompt: "Een engineer wil snel rechten op een hele Azure subscription om een incident op te lossen. Wat is de beste MSP-aanpak?",
    options: ["Owner-rechten permanent toekennen zodat vertraging wordt voorkomen", "Minimaal benodigde rol en scope bepalen, tijdelijk toekennen, logging vastleggen en achteraf intrekken", "Het wachtwoord van een global admin delen", "Alle resource locks verwijderen zodat niets blokkeert"],
    answer: 1
  },
  {
    domain: "Microsoft 365",
    type: "Security assessment",
    prompt: "Welke combinatie geeft het beste startpunt voor een M365 security assessment bij een nieuwe klant?",
    options: ["Alleen Secure Score bekijken en het percentage rapporteren", "Identity, Conditional Access, legacy auth, adminrollen, external sharing, mailflow en endpoint compliance samen beoordelen", "Alleen de Exchange mailboxgroottes controleren", "Alleen vragen of de klant MFA gebruikt"],
    answer: 1
  },
  {
    domain: "Microsoft 365",
    type: "Entra ID",
    prompt: "Je ziet risky sign-ins en geen duidelijk break-glass proces. Wat hoort in je advies?",
    options: ["Alle risky users direct verwijderen", "MFA en CA valideren, break-glass accounts borgen, adminrollen beperken en monitoring/alerting vastleggen", "Alle gebruikers global admin maken zodat support sneller kan helpen", "Alle sign-in logs wissen na afronding"],
    answer: 1
  },
  {
    domain: "SharePoint / Teams",
    type: "Governance",
    prompt: "Een Teams-omgeving heeft veel gastgebruikers en niemand weet wie eigenaar is. Wat toets je eerst?",
    options: ["Alle gasten blokkeren zonder impactanalyse", "Owners, gasttoegang, external sharing, lifecycle, sensitivity labels en dataclassificatie", "Alle kanalen hernoemen", "Alleen controleren of Teams kan bellen"],
    answer: 1
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Security scenario",
    prompt: "Een tenant heeft legacy auth, zwakke adminhygiëne en brede SharePoint sharing. Hoe prioriteer je?",
    options: ["Eerst cosmetic branding aanpassen", "Attack path bepalen, identity-risico's sluiten, datadeling beperken en changes met rollback en communicatie plannen", "Alle gebruikers tegelijk blokkeren", "Alleen een rapport sturen zonder hersteladvies"],
    answer: 1
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Consulting",
    prompt: "Een klant wil security awareness inkopen maar reageert slecht op bangmakerij. Wat is de beste aanpak?",
    options: ["Vooral incidenten overdrijven zodat urgentie ontstaat", "Risico concreet maken, gedrag meetbaar trainen, positieve toon houden en opvolging afspreken", "Alle medewerkers verplicht dagelijks testen zonder uitleg", "Alleen phishingstatistieken tonen"],
    answer: 1
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Secure automation",
    prompt: "Je reviewt een PowerShell-script dat tenantinstellingen wijzigt. Welke review is minimaal nodig?",
    options: ["Alleen kijken of het script snel draait", "Permissions, inputvalidatie, logging, secrets, dry-run/rollback en tenant-scope controleren", "Het script direct als global admin uitvoeren", "Alle foutmeldingen onderdrukken"],
    answer: 1
  }
];

function seededRandom(seedStr) {
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

function shuffledIndices(length, seed) {
  const rng = seededRandom(seed);
  const order = Array.from({ length }, (_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function prepareAssessmentQuestion(question, index) {
  question.id = question.id || `q-${index + 1}`;
  const originalOptions = question.options.map((text, optionIndex) => ({
    text,
    originalIndex: optionIndex
  }));
  const correct = originalOptions.find((option) => option.originalIndex === question.answer);
  const distractors = originalOptions.filter((option) => option.originalIndex !== question.answer);
  const distractorOrder = shuffledIndices(distractors.length, `${question.id}:distractors`).map((item) => distractors[item]);
  const targetCorrectIndex = [2, 0, 3, 1][index % 4];
  const prepared = [];

  for (let optionIndex = 0; optionIndex < 4; optionIndex += 1) {
    if (optionIndex === targetCorrectIndex) {
      prepared.push(correct);
    } else {
      prepared.push(distractorOrder.shift());
    }
  }

  question.options = prepared.map((option) => option.text);
  question.answer = targetCorrectIndex;
  question.options = balanceOptionLengths(question.options, question.answer, question.domain);
  question.answerQuality = {
    correctIndex: targetCorrectIndex,
    correctLength: question.options[targetCorrectIndex].length,
    maxDistractorLength: Math.max(...question.options.filter((_, optionIndex) => optionIndex !== targetCorrectIndex).map((option) => option.length))
  };
}

function balanceOptionLengths(options, correctIndex, domain) {
  const correctLength = options[correctIndex].length;
  return options.map((option, index) => {
    if (index === correctIndex) return option;
    return expandDistractor(option, Math.max(58, correctLength - 8), domain);
  });
}

function expandDistractor(option, targetLength, domain) {
  if (option.length >= targetLength) return option;
  const suffixes = [
    " waarbij loganalyse, impactbepaling en vervolgactie niet aantoonbaar worden vastgelegd.",
    " en daarbij scope, risico, rollback en klantcommunicatie onvoldoende worden meegenomen.",
    ` waarbij de ${domain}-context, governance en auditspoor ontbreken.`,
    " en pas achteraf beoordelen of dit bij het klantprobleem paste."
  ];
  let expanded = option;
  for (const suffix of suffixes) {
    if (expanded.length >= targetLength) break;
    expanded += suffix;
  }
  return expanded;
}

function prepareAssessmentQuestions(questions) {
  questions.forEach(prepareAssessmentQuestion);
}

prepareAssessmentQuestions(testQuestions);

const unknownOptionLabel = "Dit onderwerp is mij niet bekend";
const assessmentSchemaVersion = "20260622-balanced-options-v1";

const knownSystemOptions = {
  "Kaseya Stack": ["TOPdesk", "HaloPSA", "NinjaOne", "N-able", "ConnectWise", "Freshservice", "Zendesk", "Microsoft Intune"],
  "SharePoint / Teams": ["Google Workspace", "Slack", "Confluence", "Dropbox Business", "Box"],
  "SharePoint / Azure Migrations": ["Google Drive migratie", "Dropbox migratie", "fileserver migratie", "tenant-to-tenant migratie"],
  Inforcer: ["Microsoft Intune baselines", "CIPP", "native Microsoft 365 policies", "Conditional Access templates"],
  Fortigate: ["SonicWall", "Sophos", "Palo Alto", "Cisco Meraki", "WatchGuard"],
  VoIP: ["3CX", "Teams Phone", "Broadsoft", "Mitel", "Yealink beheer"],
  Azure: ["AWS", "Google Cloud", "VMware", "Hyper-V"],
  "AI / Copilot": ["ChatGPT", "Claude", "Gemini", "Power Platform AI", "Microsoft Copilot Chat"]
};

const fallbackQuestions = {
  "Kaseya Stack": {
    id: "fallback-kaseya-stack",
    domain: "Kaseya Stack",
    type: "Algemene stackvraag",
    isFallback: true,
    prompt: "Je kent de Kaseya-stack niet goed, maar je hebt mogelijk andere ITSM/RMM/PSA tooling gezien. Hoe zou je in algemene zin een monitoring alert omzetten naar ticket, documentatiecheck, securitycontrole en klantupdate?",
    options: [
      "Ik zou alleen het alert sluiten als het groen wordt.",
      "Ik zou impact bepalen, ticket aanmaken of bijwerken, relevante documentatie controleren, security/endpointstatus meenemen en de klant of collega duidelijk informeren.",
      "Ik zou wachten tot de klant belt.",
      "Ik zou alleen een screenshot maken."
    ],
    answer: 1
  },
  "SharePoint / Teams": {
    id: "fallback-sharepoint-teams",
    domain: "SharePoint / Teams",
    type: "Algemene samenwerkingsvraag",
    isFallback: true,
    prompt: "Je kent SharePoint/Teams beperkt. Welke algemene punten controleer je bij een samenwerkingsomgeving met documenten, teams, gasten en rechten?",
    options: [
      "Alleen of gebruikers kunnen chatten.",
      "Eigenaarschap, rechten, gasttoegang, documentstructuur, lifecycle, dataclassificatie en adoptieafspraken.",
      "Alleen opslagruimte.",
      "Alleen of de app op de telefoon staat."
    ],
    answer: 1
  },
  "SharePoint / Azure Migrations": {
    id: "fallback-migrations",
    domain: "SharePoint / Azure Migrations",
    type: "Algemene migratievraag",
    isFallback: true,
    prompt: "Je hebt weinig SharePoint/Azure migratiekennis. Welke algemene migratiestappen verwacht je minimaal bij een zakelijke IT-migratie?",
    options: [
      "Direct alles kopiëren op vrijdagmiddag.",
      "Inventarisatie, risicoanalyse, pilot, communicatie, planning, validatie, rollback en nazorg.",
      "Alleen de data zippen.",
      "Alleen na afloop controleren."
    ],
    answer: 1
  },
  Inforcer: {
    id: "fallback-inforcer",
    domain: "Inforcer",
    type: "Algemene policyvraag",
    isFallback: true,
    prompt: "Je kent Inforcer niet. Hoe zou je algemeen omgaan met het uitrollen van security baselines of tenant policies?",
    options: [
      "Alles direct naar iedereen pushen.",
      "Baselineversie vastleggen, uitzonderingen bepalen, gefaseerd uitrollen, rollback plannen en wijzigingen auditen.",
      "Alleen de naam van de policy wijzigen.",
      "Wachten tot Microsoft iets blokkeert."
    ],
    answer: 1
  },
  default: {
    id: "fallback-general",
    domain: "Algemeen",
    type: "Algemene denkvraag",
    isFallback: true,
    prompt: "Dit specifieke onderwerp is onbekend. Hoe pak je een onbekend technisch probleem professioneel aan?",
    options: [
      "Gokken en hopen dat het klopt.",
      "Impact bepalen, informatie verzamelen, documentatie raadplegen, hulp vragen waar nodig, klantverwachting managen en bevindingen vastleggen.",
      "Het ticket sluiten.",
      "Alleen zoeken naar het eerste forumantwoord."
    ],
    answer: 1
  }
};

prepareAssessmentQuestions(Object.values(fallbackQuestions));

let activeTestQuestions = [...testQuestions];

// Unified people array: recruitment kandidaten en interne learners delen hetzelfde
// scoremodel, maar blijven expliciet gescheiden via type voor governance en UX.
candidates.forEach((candidate) => {
  candidate.type = "candidate";
});
learners.forEach((learner) => {
  learner.type = "learner";
});
const people = [...candidates, ...learners];

const dashboardModules = [
  { id: "overview-stats", title: "Statistieken", view: "overview", dataSource: ["people", "domains", "trainingModules"], panel: "overviewStatsPanel" },
  { id: "overview-candidates", title: "Kandidaten", view: "overview", dataSource: ["candidates", "roles"], panel: "overviewCandidateCards" },
  { id: "overview-learners", title: "Medewerkers", view: "overview", dataSource: ["learners", "roles", "trainingModules"], panel: "overviewLearnerCards" },
  { id: "overview-heatmap", title: "Domeindekking", view: "overview", dataSource: ["people", "domains"], panel: "domainHeatmap" },
  { id: "candidate-detail", title: "Kandidaatdetail", view: "overview", dataSource: ["selectedCandidate", "selectedRole"], panel: "overviewDetailAnchor" },
  { id: "academy", title: "Skills Academy", view: "academy", dataSource: ["selectedLearner", "selectedLearningRole", "trainingModules"], panel: "academyView" },
  { id: "test", title: "Kandidaattest", view: "test", dataSource: ["testQuestions"], panel: "testView" },
  { id: "questions", title: "Vragenbank", view: "questions", dataSource: ["draftQuestions"], panel: "questionsView" },
  { id: "admin", title: "Beheer", view: "admin", dataSource: ["auditLog"], panel: "adminView" }
];

const draftQuestions = [
  {
    domain: "Servers",
    role: "Servicedesk Engineer",
    source: "Datto RMM alertpatroon",
    prompt: "Een Windows Server meldt drie nachten mislukte backups. Laat de kandidaat VSS, storage, service health en restore verification triageren."
  },
  {
    domain: "Sales",
    role: "Sales",
    source: "Discovery call notes",
    prompt: "Een prospect vraagt of Copilot veilig is. Laat de kandidaat readiness uitleggen zonder te overpromisen."
  },
  {
    domain: "SharePoint / Teams",
    role: "Modern Work Consultant",
    source: "SharePoint rechtenincident",
    prompt: "Een Teams owner heeft per ongeluk gevoelige bestanden aan gasten blootgesteld. Vraag naar herstel en governancepreventie."
  },
  {
    domain: "Kaseya Stack",
    role: "Servicedesk Engineer",
    source: "Autotask / Datto RMM / IT Glue case",
    prompt: "Laat de kandidaat uitleggen hoe een Datto RMM alert naar Autotask-ticket, IT Glue-documentatie, EDR-check en klantupdate loopt."
  },
  {
    domain: "Kaseya Stack",
    role: "Sales",
    source: "BullPhish security awareness",
    prompt: "Laat de kandidaat uitleggen wanneer BullPhish relevant is in een klantgesprek en hoe je security awareness niet als bangmakerij verkoopt."
  },
  {
    domain: "SharePoint / Azure Migrations",
    role: "Cloud Engineer",
    source: "Migratieproject retrospective",
    prompt: "Laat de kandidaat een migratieplan maken met discovery, pilot, tooling, cutover, delta sync, rollback, communicatie en nazorg."
  },
  {
    domain: "Werkhouding & Communicatie",
    role: "Servicedesk Engineer",
    source: "Escalatiegesprek",
    prompt: "Een klant is boos omdat hij geen update heeft gehad. Laat de kandidaat een kalme reactie formuleren met erkenning, status en concrete vervolgstap."
  },
  {
    domain: "Engels",
    role: "Cloud Engineer",
    source: "Engelse klantcommunicatie",
    prompt: "Laat de kandidaat in het Engels een korte incidentupdate schrijven met impact, herstelstatus, monitoring en next update."
  },
  {
    domain: "Azure",
    role: "Cloud Engineer",
    source: "Azure interview en AZ-900 bronmateriaal",
    prompt: "Laat de kandidaat aan een MKB-klant uitleggen wanneer IaaS, PaaS en SaaS logisch zijn, inclusief shared responsibility, kosten en beheerimpact."
  },
  {
    domain: "Azure",
    role: "Technical Account Manager",
    source: "Azure governance bronmateriaal",
    prompt: "Laat de kandidaat een governanceadvies maken voor resource groups, tags, RBAC, locks, Policy en kostenbewaking in een multi-customer MSP-omgeving."
  },
  {
    domain: "Microsoft 365",
    role: "Modern Work Consultant",
    source: "M365 Assessment Toolkit",
    prompt: "Laat de kandidaat een M365 security intake ontwerpen met identity, Conditional Access, Exchange, Teams, SharePoint, Intune en attack-path prioritering."
  },
  {
    domain: "Microsoft 365",
    role: "Servicedesk Engineer",
    source: "M365 Assessment Toolkit",
    prompt: "Laat de kandidaat triageren waarom MFA/Conditional Access onverwacht blokkeert, inclusief sign-in logs, policy scope, exclusions en break-glass risico."
  },
  {
    domain: "SharePoint / Teams",
    role: "Modern Work Consultant",
    source: "M365 Assessment Toolkit",
    prompt: "Laat de kandidaat een secure collaboration review doen voor gasten, external sharing, owners, lifecycle, sensitivity labels en herstelmaatregelen."
  },
  {
    domain: "Basic IT & Troubleshooting",
    role: "Cloud Engineer",
    source: "UnitOneAI SecuritySkills",
    prompt: "Laat de kandidaat een attack path uitschrijven vanaf zwakke identity controls naar datalekrisico en dit vertalen naar MSP-remediationstappen."
  },
  {
    domain: "Basic IT & Troubleshooting",
    role: "Servicedesk Engineer",
    source: "UnitOneAI SecuritySkills",
    prompt: "Laat de kandidaat een automation-script reviewen op secrets, permissies, tenant-scope, logging, dry-run en rollback."
  },
  {
    domain: "Werkhouding & Communicatie",
    role: "Sales",
    source: "Security awareness bronmateriaal",
    prompt: "Laat de kandidaat security awareness positioneren zonder angstverkoop: gedrag, risico, meetbaarheid, opvolging en realistische klantverwachting."
  }
];

const currentUserProfile = {
  name: "Campai gebruiker",
  email: "local@campai.nl",
  role: "Assessment Admin",
  source: "Entra ID",
  permissions: ["Dashboard review", "Vraagbeheer", "Rollenbeheer", "Auditlog bekijken"]
};

const adminRoles = [
  {
    name: "Assessment Admin",
    scope: "Rollen, rubrics, auditlog",
    permissions: ["Alle dashboardviews", "Vraagbeheer", "Rubricbeheer", "Auditlog", "Export"]
  },
  {
    name: "Reviewer",
    scope: "Kandidaatbeoordeling",
    permissions: ["Dashboard", "Kandidaatrapport", "Export"]
  },
  {
    name: "Question Author",
    scope: "Vraagbeheer",
    permissions: ["Vragenbank", "Conceptvragen", "Bronregistratie"]
  },
  {
    name: "Candidate",
    scope: "Assessmentflow",
    permissions: ["Kandidaattest", "Eigen autosave"]
  }
];

const documentationMap = [
  ["Profiel en rol", "Entra ID", "Naam, e-mail, approl"],
  ["Vragenbank", "Dashboard", "Domein, rol, type, bron, reviewstatus"],
  ["Kandidaatresultaat", "Azure Table Storage", "Score, antwoorden, rolfit, exportmoment"],
  ["Trainingresultaat", "Azure Table Storage", "Medewerker, leerpad, XP, badges, modulebewijs"],
  ["Bronmateriaal", "Afgeschermde opslag", "Geanonimiseerde bronpakketten"],
  ["Open source inspiratie", "CONTENT_SOURCES.md", "Repo, licentie, gebruikstype en Campai-afleiding"],
  ["Wijzigingen", "Auditlog", "Actor, tijdstip, actie, context"],
  ["Beleid", "Repository", "Thresholds, rubricversies, rolrechten"]
];

const appSettingsMap = [
  ["Tenantmodus", "Single-tenant prototype", "Voor Campai intern. Multi-tenant scheiding hoort in auth, opslag en deployment."],
  ["Identity", "Entra ID met lokale fallback", "Profiel en rol komen uit de omgeving zodra de app achter Azure auth draait."],
  ["Assessmentbeleid", "Human review verplicht", "Geen automatische afwijzing zonder reviewercontrole."],
  ["Bronbeleid", "Geanonimiseerd", "Geen klantnamen, domeinen, IP-adressen of credentials in kandidaatvragen."],
  ["Opslagrichting", "Azure Table Storage-ready", "Prototype gebruikt lokale state; productiestate hoort tenantgescheiden te worden opgeslagen."],
  ["Vraagstructuur", assessmentSchemaVersion, "Antwoordvolgorde en optie-lengtes worden bij schemawijziging opnieuw voorbereid."]
];

let selectedCandidate = candidates[0];
let selectedRole = roles[1];
let selectedDomain = "Alle domeinen";
let selectedLearner = learners[0];
let selectedLearningRole = roles.find((role) => role.name === selectedLearner.targetRole) || roles[1];
let currentQuestion = Number(localStorage.getItem("camaiQuestionIndex") || 0);
let answers = JSON.parse(localStorage.getItem("camaiAnswers") || "{}");
let auditLog = JSON.parse(localStorage.getItem("camaiAuditLog") || "[]");
let completedModules = JSON.parse(localStorage.getItem("camaiCompletedModules") || "{}");
let moduleUpdates = JSON.parse(localStorage.getItem("camaiModuleUpdates") || "{}");
let activeModuleId = "";
let activeDraftIndex = 0;

const $ = (selector) => document.querySelector(selector);

function roleScore(candidate, role) {
  const totalWeight = Object.values(role.weights).reduce((total, weight) => total + weight, 0);
  return Math.round(
    Object.entries(role.weights).reduce((total, [domain, weight]) => total + candidate.scores[domain] * (weight / totalWeight), 0)
  );
}

function scoreState(score, threshold = 70) {
  if (score >= threshold + 10) return "Sterke fit";
  if (score >= threshold) return "Geschikt";
  if (score >= threshold - 8) return "Borderline";
  return "Niet geschikt";
}

function scoreClass(score) {
  if (score >= 75) return "score-good";
  if (score >= 60) return "score-mid";
  return "score-risk";
}

// 5-staps sequentiële encoding voor de heatmap (echte lichtheidssprongen).
function heatClass(score) {
  if (score >= 80) return "hm-q4";
  if (score >= 70) return "hm-q3";
  if (score >= 60) return "hm-q2";
  if (score >= 50) return "hm-q1";
  return "hm-q0";
}

// Fit-state → kleur/encoding voor de cockpit (ring + risico-badge).
function fitEncoding(state) {
  switch (state) {
    case "Sterke fit":
      return { ring: "var(--good)", badge: "risk-strong", risk: "Laag risico" };
    case "Geschikt":
      return { ring: "var(--cyan)", badge: "risk-ok", risk: "Beperkt risico" };
    case "Borderline":
      return { ring: "var(--warn)", badge: "risk-watch", risk: "Aandacht nodig" };
    default:
      return { ring: "var(--risk)", badge: "risk-high", risk: "Hoog risico" };
  }
}

function init() {
  bindNavigation();
  bindNavToggle();
  bindTabs();
  populateControls();
  bindEvents();
  resetStaleAssessmentState();
  restoreFallbackQuestions();
  loadIdentity();
  ensureInitialAuditEntry();
  renderAll();
  renderTest();
  renderAcademy();
  renderQuestionFactory();
  renderAdminPanel();
}

function resetStaleAssessmentState() {
  if (localStorage.getItem("camaiAssessmentSchemaVersion") === assessmentSchemaVersion) return;
  answers = {};
  currentQuestion = 0;
  activeTestQuestions = [...testQuestions];
  localStorage.setItem("camaiAssessmentSchemaVersion", assessmentSchemaVersion);
  localStorage.removeItem("camaiAnswers");
  localStorage.removeItem("camaiQuestionIndex");
  recordAudit("Assessmentvragen opnieuw gebalanceerd", assessmentSchemaVersion);
}

const viewTitles = {
  overview: "Reviewdashboard",
  test: "Kandidaattest",
  questions: "Vragenfabriek",
  academy: "Skills Academy",
  governance: "Beleid",
  admin: "Beheer"
};

function bindNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const view = button.dataset.view;
      document.querySelectorAll(".view").forEach((section) => section.classList.remove("active"));
      $(`#${view}View`).classList.add("active");
      const title = $("#topbarTitle");
      if (title) title.textContent = viewTitles[view] || "Campai Assessment";
      $("#sidebar")?.classList.remove("open");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function bindNavToggle() {
  $("#navToggle")?.addEventListener("click", () => $("#sidebar")?.classList.toggle("open"));
}

function bindTabs() {
  document.querySelectorAll(".tabstrip").forEach((strip) => {
    const tabs = Array.from(strip.querySelectorAll(".tab"));
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((other) => {
          const active = other === tab;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-selected", active ? "true" : "false");
          const panel = $(`#${other.dataset.tab}`);
          if (panel) panel.classList.toggle("is-active", active);
        });
      });
    });
  });
}

function populateControls() {
  $("#candidateSelect").innerHTML = candidates.map((candidate) => `<option value="${candidate.id}">${candidate.name}</option>`).join("");
  $("#roleSelect").innerHTML = roles.map((role) => `<option value="${role.id}">${role.name}</option>`).join("");
  $("#roleSelect").value = selectedRole.id;
  $("#domainSelect").innerHTML = ["Alle domeinen", ...domains].map((domain) => `<option>${domain}</option>`).join("");
  $("#authorDomain").innerHTML = domains.map((domain) => `<option>${domain}</option>`).join("");
  $("#authorRole").innerHTML = roles.map((role) => `<option>${role.name}</option>`).join("");
  $("#learnerSelect").innerHTML = learners.map((learner) => `<option value="${learner.id}">${learner.name}</option>`).join("");
  $("#learningRoleSelect").innerHTML = roles.map((role) => `<option value="${role.id}">${role.name}</option>`).join("");
  $("#learnerSelect").value = selectedLearner.id;
  $("#learningRoleSelect").value = selectedLearningRole.id;
}

function bindEvents() {
  $("#candidateSelect").addEventListener("change", (event) => {
    selectedCandidate = candidates.find((candidate) => candidate.id === event.target.value);
    recordAudit("Kandidaat geselecteerd", selectedCandidate.name);
    renderAll();
  });
  $("#roleSelect").addEventListener("change", (event) => {
    selectedRole = roles.find((role) => role.id === event.target.value);
    recordAudit("Doelrol geselecteerd", selectedRole.name);
    renderAll();
  });
  $("#domainSelect").addEventListener("change", (event) => {
    selectedDomain = event.target.value;
    recordAudit("Domeinfilter gewijzigd", selectedDomain);
    renderEvidence();
  });
  $("#resetViewBtn").addEventListener("click", () => {
    selectedRole = roles[1];
    selectedDomain = "Alle domeinen";
    $("#roleSelect").value = selectedRole.id;
    $("#domainSelect").value = selectedDomain;
    recordAudit("Dashboardweergave gereset", "Cloud Engineer / alle domeinen");
    renderAll();
    toast("Weergave teruggezet naar Cloud Engineer en alle domeinen.");
  });
  $("#showAllEvidenceBtn").addEventListener("click", () => {
    selectedDomain = "Alle domeinen";
    $("#domainSelect").value = selectedDomain;
    recordAudit("Vraagbewijsfilter gereset", "Alle domeinen");
    renderEvidence();
  });
  $("#learnerSelect").addEventListener("change", (event) => {
    selectedLearner = learners.find((learner) => learner.id === event.target.value);
    selectedLearningRole = roles.find((role) => role.name === selectedLearner.targetRole) || selectedLearningRole;
    $("#learningRoleSelect").value = selectedLearningRole.id;
    recordAudit("Leerprofiel geselecteerd", selectedLearner.name);
    renderAcademy();
  });
  $("#learningRoleSelect").addEventListener("change", (event) => {
    selectedLearningRole = roles.find((role) => role.id === event.target.value);
    recordAudit("Leerdoel geselecteerd", `${selectedLearner.name} / ${selectedLearningRole.name}`);
    renderAcademy();
  });
  $("#exportTrainingBtn").addEventListener("click", exportTrainingReport);
  $("#moduleModalClose").addEventListener("click", closeModuleModal);
  $("#moduleModal").addEventListener("click", (event) => {
    if (event.target.id === "moduleModal") closeModuleModal();
  });
  $("#moduleSaveBtn").addEventListener("click", saveModuleUpdate);
  $("#moduleConnectGoalBtn").addEventListener("click", () => {
    if (!activeModuleId) return;
    const module = trainingModules.find((item) => item.id === activeModuleId);
    recordAudit("Module aan leerdoel gekoppeld", `${selectedLearner.name} / ${module?.title || activeModuleId}`);
    toast("Module gekoppeld aan leerdoel.");
  });
  $("#exportBtn").addEventListener("click", exportReport);
  $("#prevQuestionBtn").addEventListener("click", () => {
    currentQuestion = Math.max(0, currentQuestion - 1);
    localStorage.setItem("camaiQuestionIndex", currentQuestion);
    renderTest();
  });
  $("#nextQuestionBtn").addEventListener("click", () => {
    currentQuestion = Math.min(activeTestQuestions.length - 1, currentQuestion + 1);
    localStorage.setItem("camaiQuestionIndex", currentQuestion);
    renderTest();
  });
  $("#questionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    draftQuestions.unshift({
      domain: $("#authorDomain").value,
      role: $("#authorRole").value,
      type: $("#authorType").value,
      source: $("#authorSource").value || "Handmatige Campai-bron",
      prompt: $("#authorPrompt").value || "Conceptvraag wacht op senior review.",
      options: defaultDraftOptions({}),
      answer: 1
    });
    activeDraftIndex = 0;
    recordAudit("Conceptvraag toegevoegd", `${$("#authorDomain").value} / ${$("#authorRole").value}`);
    event.target.reset();
    renderQuestionFactory();
    toast("Conceptvraag toegevoegd voor review.");
  });
  $("#hubLoadCompaniesBtn")?.addEventListener("click", async () => {
    const hint = $("#hubSourceHint");
    try {
      const res = await fetch("/api/hub/companies");
      if (res.status === 503) { hint.textContent = "Hub niet geconfigureerd (HUB_BASE_URL/HUB_APP_TOKEN ontbreekt)."; return; }
      if (!res.ok) { hint.textContent = "Kon klanten niet laden."; return; }
      const companies = await res.json();
      $("#hubCompany").innerHTML = `<option value="">— kies klant —</option>` +
        companies.map((c) => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.name)}</option>`).join("");
      hint.textContent = `${companies.length} klant(en) geladen.`;
    } catch (error) {
      hint.textContent = "Kon klanten niet laden.";
    }
  });

  $("#hubSourceBtn")?.addEventListener("click", async () => {
    const hint = $("#hubSourceHint");
    const companyId = $("#hubCompany").value;
    if (!companyId) { hint.textContent = "Kies eerst een klant."; return; }
    hint.textContent = "Bezig met ophalen…";
    try {
      const res = await fetch(`/api/hub/source-material?companyId=${encodeURIComponent(companyId)}`);
      if (res.status === 503) { hint.textContent = "Hub niet geconfigureerd."; return; }
      if (!res.ok) { hint.textContent = "Ophalen mislukt."; return; }
      const { items } = await res.json();
      if (!items || !items.length) { hint.textContent = "Geen bronmateriaal gevonden."; return; }
      for (const item of items.reverse()) {
        draftQuestions.unshift({
          domain: item.domain,
          role: item.role,
          type: "Scenario",
          source: item.source,
          prompt: item.prompt,
          options: defaultDraftOptions({}),
          answer: 1
        });
      }
      activeDraftIndex = 0;
      recordAudit("Hub-bronmateriaal opgehaald", `${items.length} concepten / klant ${companyId}`);
      renderQuestionFactory();
      hint.textContent = `${items.length} conceptvraag(en) toegevoegd voor review.`;
      toast("Hub-bronmateriaal toegevoegd aan de Vragenbank.");
    } catch (error) {
      hint.textContent = "Ophalen mislukt.";
    }
  });
  $("#globalSearch").addEventListener("input", (event) => {
    selectedDomain = domains.find((domain) => domain.toLowerCase().includes(event.target.value.toLowerCase())) || "Alle domeinen";
    $("#domainSelect").value = selectedDomain;
    if (event.target.value.trim()) recordAudit("Zoekfilter gebruikt", event.target.value.trim());
    renderEvidence();
  });
  $("#clearAuditBtn").addEventListener("click", () => {
    auditLog = [];
    localStorage.setItem("camaiAuditLog", JSON.stringify(auditLog));
    recordAudit("Auditlog gereset", "Lokale dashboardlog opnieuw gestart");
    renderAdminPanel();
  });
}

function renderOverviewStats() {
  const el = $("#overviewStatsPanel");
  if (!el) return;
  el.innerHTML = [
    ["Kandidaten", candidates.length],
    ["Medewerkers", learners.length],
    ["Domeinen", domains.length],
    ["Trainingsmodules", trainingModules.length]
  ]
    .map(
      ([label, value]) => `
        <div class="stat-card">
          <span class="stat-num">${value}</span>
          <span class="stat-label">${label}</span>
        </div>
      `
    )
    .join("");
}

function renderOverviewPeople() {
  const candidateEl = $("#overviewCandidateCards");
  const learnerEl = $("#overviewLearnerCards");
  if (!candidateEl || !learnerEl) return;

  candidateEl.innerHTML = candidates
    .map((candidate) => {
      const bestRole = [...roles].sort((a, b) => roleScore(candidate, b) - roleScore(candidate, a))[0];
      const score = roleScore(candidate, bestRole);
      return `
        <button class="person-card${candidate.id === selectedCandidate.id ? " person-card--active" : ""}" data-candidate-id="${candidate.id}" type="button">
          <span class="person-avatar">${candidate.id}</span>
          <span class="person-info">
            <strong>${candidate.name}</strong>
            <span class="label">${bestRole.name} · ${scoreState(score, bestRole.threshold)}</span>
          </span>
          <span class="person-score">
            <span class="score-badge ${scoreClass(score)}">${score}</span>
            <span class="label">fit</span>
          </span>
        </button>
      `;
    })
    .join("");

  learnerEl.innerHTML = learners
    .map((learner) => {
      const targetRole = roles.find((role) => role.name === learner.targetRole) || roles[0];
      const score = roleScore(learner, targetRole);
      const completed = (completedModules[learner.id] || []).length;
      return `
        <button class="person-card person-card--learner${learner.id === selectedLearner.id ? " person-card--active" : ""}" data-learner-id="${learner.id}" type="button">
          <span class="person-avatar person-avatar--learner">${learner.id}</span>
          <span class="person-info">
            <strong>${learner.name}</strong>
            <span class="label">${learner.role} → ${learner.targetRole}</span>
          </span>
          <span class="person-score">
            <span class="score-badge ${scoreClass(score)}">${score}</span>
            <span class="label">${completed}/${trainingModules.length}</span>
          </span>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll("[data-candidate-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const found = candidates.find((candidate) => candidate.id === card.dataset.candidateId);
      if (!found) return;
      selectedCandidate = found;
      $("#candidateSelect").value = found.id;
      recordAudit("Kandidaat geselecteerd via overzicht", found.name);
      renderAll();
      $("#overviewDetailAnchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-learner-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const found = learners.find((learner) => learner.id === card.dataset.learnerId);
      if (!found) return;
      selectedLearner = found;
      selectedLearningRole = roles.find((role) => role.name === found.targetRole) || selectedLearningRole;
      $("#learnerSelect").value = found.id;
      $("#learningRoleSelect").value = selectedLearningRole.id;
      recordAudit("Medewerker geselecteerd via overzicht", found.name);
      document.querySelector('[data-view="academy"]')?.click();
      renderAcademy();
    });
  });

  $("#candidateCountPill").textContent = `${candidates.length} actief`;
  $("#learnerCountPill").textContent = `${learners.length} actief`;
}

function renderDomainHeatmap() {
  const el = $("#domainHeatmap");
  if (!el) return;
  const shortLabels = {
    "Microsoft 365": "M365",
    "Kaseya Stack": "Kaseya",
    Fortigate: "FGT",
    Servers: "Srv",
    "SharePoint / Teams": "SPT",
    "SharePoint / Azure Migrations": "Mig",
    Inforcer: "Inf",
    "Basic IT & Troubleshooting": "Basic",
    "Werkhouding & Communicatie": "Werk",
    "AI / Copilot": "AI"
  };
  const header = domains.map((domain) => `<th title="${domain}">${shortLabels[domain] || domain}</th>`).join("");
  const lowestDomains = (person) =>
    domains
      .map((domain) => ({ domain, score: person.scores[domain] ?? 0 }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);
  const roleLabelOf = (person) => (person.type === "learner" ? person.role : person.meta.split(" / ")[0]);

  const row = (person) => {
    const low = lowestDomains(person)[0];
    const cells = domains
      .map((domain) => {
        const score = person.scores[domain] ?? 0;
        return `<td class="hm-cell ${heatClass(score)}" title="${person.name} · ${domain}: ${score}">${score}</td>`;
      })
      .join("");
    return `
      <tr>
        <td class="hm-name">
          <span class="person-avatar person-avatar--sm${person.type === "learner" ? " person-avatar--learner" : ""}">${person.id}</span>
          <span><strong>${person.name}</strong><small>${roleLabelOf(person)} · laag: ${shortDomain(low.domain)}</small></span>
        </td>
        ${cells}
      </tr>
    `;
  };

  const fallbackRow = (person) => {
    const lows = lowestDomains(person)
      .map((item) => `<b>${shortDomain(item.domain)} ${item.score}</b>`)
      .join(" · ");
    const avg = Math.round(domains.reduce((total, domain) => total + (person.scores[domain] ?? 0), 0) / domains.length);
    return `
      <div class="hm-fallback-row">
        <span class="person-avatar person-avatar--sm${person.type === "learner" ? " person-avatar--learner" : ""}">${person.id}</span>
        <span class="gaps"><strong>${person.name}</strong><br />grootste gaten: ${lows}</span>
        <span class="score-badge ${scoreClass(avg)}">${avg}</span>
      </div>
    `;
  };

  const candidatesList = people.filter((person) => person.type === "candidate");
  const learnersList = people.filter((person) => person.type === "learner");

  el.innerHTML = `
    <div class="hm-scroll">
      <table class="hm-table">
        <thead><tr><th class="hm-name-col">Persoon</th>${header}</tr></thead>
        <tbody>
          <tr class="hm-separator"><td colspan="${domains.length + 1}">Kandidaten</td></tr>
          ${candidatesList.map(row).join("")}
          <tr class="hm-separator"><td colspan="${domains.length + 1}">Medewerkers</td></tr>
          ${learnersList.map(row).join("")}
        </tbody>
      </table>
    </div>
    <div class="hm-fallback">
      <span class="label">Kandidaten</span>
      ${candidatesList.map(fallbackRow).join("")}
      <span class="label" style="margin-top:8px;">Medewerkers</span>
      ${learnersList.map(fallbackRow).join("")}
    </div>
  `;
}

function renderAll() {
  renderOverviewStats();
  renderOverviewPeople();
  renderDomainHeatmap();
  renderCandidate();
  renderRoles();
  renderRadar();
  renderBenchmarkTable();
  renderInspector();
  renderTopicMatrix();
  renderTimeline();
  renderEvidence();
}

function renderCandidate() {
  const score = roleScore(selectedCandidate, selectedRole);
  const state = scoreState(score, selectedRole.threshold);
  const encoding = fitEncoding(state);

  // Beste rol-fit (advies voor een mens) bovenaan, naast de geselecteerde rol.
  const bestRole = [...roles]
    .map((role) => ({ role, score: roleScore(selectedCandidate, role) }))
    .sort((a, b) => b.score - a.score)[0];

  const sorted = domains
    .map((domain) => ({ domain, score: selectedCandidate.scores[domain] }))
    .sort((a, b) => b.score - a.score);
  const topStrength = sorted[0];
  const topGap = sorted[sorted.length - 1];

  $("#candidateAvatar").textContent = selectedCandidate.id;
  $("#candidateName").textContent = selectedCandidate.name;
  $("#candidateMeta").textContent = selectedCandidate.meta;

  $("#cockpitConclusion").innerHTML =
    `Beste rol-fit: <strong>${bestRole.role.name}</strong> · <span class="mono">${bestRole.score}</span>/100. ` +
    `Geselecteerde rol ${selectedRole.name}: <span class="mono">${score}</span>/100 — advies <strong>${state.toLowerCase()}</strong> ` +
    `(drempel ${selectedRole.threshold}).`;

  $("#cockpitChips").innerHTML =
    `<span class="chip chip--up">Sterkste: ${shortDomain(topStrength.domain)} <span class="mono">${topStrength.score}</span></span>` +
    `<span class="chip chip--down">Aandacht: ${shortDomain(topGap.domain)} <span class="mono">${topGap.score}</span></span>`;

  const ring = $("#scoreRing");
  ring.style.setProperty("--score", score);
  ring.style.setProperty("--ring-color", encoding.ring);
  ring.querySelector("span").textContent = score;

  const badge = $("#riskBadge");
  badge.textContent = encoding.risk;
  badge.className = `risk-badge ${encoding.badge}`;

  $("#fitPill").textContent = state;
}

function renderRoles() {
  const sorted = roles
    .map((role) => ({ ...role, score: roleScore(selectedCandidate, role) }))
    .sort((a, b) => b.score - a.score);
  $("#roleBars").innerHTML = sorted
    .map((role) => {
      const color = role.score >= role.threshold ? "var(--cyan)" : role.score >= role.threshold - 8 ? "var(--warn)" : "var(--risk)";
      return `
        <div class="role-bar">
          <div>
            <div class="bar-label"><span>${role.name}</span><span>${scoreState(role.score, role.threshold)}</span></div>
            <div class="bar-track"><span class="bar-fill" style="width:${role.score}%; background:${color}"></span></div>
          </div>
          <strong>${role.score}</strong>
        </div>
      `;
    })
    .join("");
}

function renderRadar() {
  const svg = $("#radarChart");
  const cx = 220;
  const cy = 180;
  const radius = 124;
  const points = domains.map((domain, index) => {
    const angle = (Math.PI * 2 * index) / domains.length - Math.PI / 2;
    const score = selectedCandidate.scores[domain];
    return {
      domain,
      x: cx + Math.cos(angle) * radius * (score / 100),
      y: cy + Math.sin(angle) * radius * (score / 100),
      lx: cx + Math.cos(angle) * (radius + 34),
      ly: cy + Math.sin(angle) * (radius + 34),
      gx: cx + Math.cos(angle) * radius,
      gy: cy + Math.sin(angle) * radius,
      score
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");
  const grid = [0.25, 0.5, 0.75, 1]
    .map((scale) => {
      const ring = domains
        .map((_, index) => {
          const angle = (Math.PI * 2 * index) / domains.length - Math.PI / 2;
          return `${cx + Math.cos(angle) * radius * scale},${cy + Math.sin(angle) * radius * scale}`;
        })
        .join(" ");
      return `<polygon points="${ring}" fill="none" stroke="#d9e1ea" stroke-width="1" />`;
    })
    .join("");
  const axes = points.map((point) => `<line x1="${cx}" y1="${cy}" x2="${point.gx}" y2="${point.gy}" stroke="#e4e9ef" />`).join("");
  const labels = points
    .map((point) => `<text x="${point.lx}" y="${point.ly}" text-anchor="middle">${shortDomain(point.domain)} ${point.score}</text>`)
    .join("");
  svg.innerHTML = `
    ${grid}
    ${axes}
    <polygon points="${polygon}" fill="rgba(11, 177, 239, .16)" stroke="var(--cyan)" stroke-width="3" />
    ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="var(--cyan)" />`).join("")}
    ${labels}
  `;
}

function shortDomain(domain) {
  return domain
    .replace("SharePoint / Azure Migrations", "SP/Azure Mig.")
    .replace("Basic IT & Troubleshooting", "Basic IT")
    .replace("SharePoint / Teams", "SP/Teams")
    .replace("Kaseya Stack", "Kaseya stack")
    .replace("Werkhouding & Communicatie", "Werkhouding");
}

function renderBenchmarkTable() {
  const rows = domains
    .map((domain) => {
      const score = selectedCandidate.scores[domain];
      const weight = selectedRole.weights[domain] || 0;
      const domainNorm = Math.round(selectedRole.threshold - 6 + weight * 60);
      const status = score >= domainNorm + 8 ? "Sterk" : score >= domainNorm ? "Voldoende" : "Aandacht";
      return `
        <div class="benchmark-row">
          <span><strong>${shortDomain(domain)}</strong></span>
          <span>${domainDetails[domain]}</span>
          <span>${score}</span>
          <span>${domainNorm}</span>
          <span class="${score >= domainNorm ? "ok" : "attention"}">${status}</span>
        </div>
      `;
    })
    .join("");
  $("#benchmarkTable").innerHTML = `<div class="benchmark-row header"><span>Domein</span><span>Wat meten we?</span><span>Score</span><span>Norm</span><span>Status</span></div>${rows}`;
}

function renderInspector() {
  const sortedDomains = domains.map((domain) => ({ domain, score: selectedCandidate.scores[domain] })).sort((a, b) => b.score - a.score);
  const strengths = sortedDomains.slice(0, 3);
  const gaps = sortedDomains.slice(-3).reverse();
  $("#decisionInspector").innerHTML = `
    <span class="label">Sterke punten</span>
    <ul class="strength-list">${strengths
      .map((item) => `<li><span>${shortDomain(item.domain)}</span><span class="mono">${item.score}</span></li>`)
      .join("")}</ul>
    <span class="label" style="margin-top:8px;">Aandachtspunten</span>
    <ul class="gap-list">${gaps
      .map((item) => `<li><span>${shortDomain(item.domain)}</span><span class="mono">${item.score}</span></li>`)
      .join("")}</ul>
  `;
}

function renderTopicMatrix() {
  const rows = competencies
    .map((competency, rowIndex) => {
      const cells = domains
        .map((domain, domainIndex) => {
          const base = selectedCandidate.scores[domain];
          const modifier = ((rowIndex + domainIndex) % 4) * 3 - 4;
          const value = Math.max(35, Math.min(96, base + modifier));
          return `<div class="${scoreClass(value)}">${value}</div>`;
        })
        .join("");
      return `<div class="row-head">${competency}</div>${cells}`;
    })
    .join("");
  $("#topicMatrix").innerHTML = `<div class="matrix"><div class="head">Vaardigheid</div>${domains
    .map((domain) => `<div class="head">${shortDomain(domain)}</div>`)
    .join("")}${rows}</div>`;
}

function renderTimeline() {
  $("#scenarioTimeline").innerHTML = selectedCandidate.scenarioScores
    .map((score, index) => {
      const color = score >= selectedRole.threshold ? "var(--cyan)" : score >= selectedRole.threshold - 8 ? "var(--warn)" : "var(--risk)";
      return `
        <div class="scenario-row">
          <strong>${selectedCandidate.scenarioLabels[index]}</strong>
          <div class="mini-track"><span class="mini-fill" style="width:${score}%; background:${color}"></span></div>
          <span>${score}</span>
        </div>
      `;
    })
    .join("");
}

function renderEvidence() {
  const rows = evidence
    .filter((row) => selectedDomain === "Alle domeinen" || row[1] === selectedDomain)
    .map(
      ([question, domain, type, score, response]) => `
      <tr>
        <td><strong>${question}</strong></td>
        <td>${domain}</td>
        <td>${type}</td>
        <td><div class="mini-track"><span class="mini-fill" style="width:${score}%; background:${score >= selectedRole.threshold ? "var(--cyan)" : "var(--warn)"}"></span></div><small>${score}%</small></td>
        <td>${response}</td>
      </tr>
    `
    )
    .join("");
  $("#evidenceRows").innerHTML = rows || `<tr><td colspan="5">Geen bewijs gevonden voor dit filter.</td></tr>`;
}

function renderTest() {
  const question = activeTestQuestions[currentQuestion];
  const questionId = question.id;
  const storedAnswer = answers[questionId];
  const selectedValue = typeof storedAnswer === "object" ? storedAnswer.choice : storedAnswer;
  const allOptions = [...question.options, unknownOptionLabel];
  $("#testProgress").style.width = `${((currentQuestion + 1) / activeTestQuestions.length) * 100}%`;
  $("#testQuestion").innerHTML = `
    <span class="label">${question.domain} / ${question.type}</span>
    <h2>${question.prompt}</h2>
    <div class="question-options">
      ${allOptions
        .map(
          (option, index) => `
        <label class="option ${selectedValue === index ? "selected" : ""} ${index === question.options.length ? "unknown-option" : ""}">
          <input type="radio" name="answer" value="${index}" ${selectedValue === index ? "checked" : ""} />
          <span>${option}</span>
        </label>
      `
        )
        .join("")}
    </div>
    ${renderUnknownContext(question, selectedValue)}
  `;
  document.querySelectorAll("input[name='answer']").forEach((input) => {
    input.addEventListener("change", (event) => {
      const selected = Number(event.target.value);
      if (selected === question.options.length) {
        answers[questionId] = {
          choice: selected,
          status: "unknown",
          knownSystems: getKnownSystems(question.domain),
          note: getUnknownNote(question.domain)
        };
        insertFallbackQuestion(question.domain, currentQuestion);
      } else {
        answers[questionId] = selected;
      }
      localStorage.setItem("camaiAnswers", JSON.stringify(answers));
      recordAudit("Kandidaatantwoord opgeslagen", `${question.domain} / vraag ${currentQuestion + 1}`);
      renderTest();
    });
  });
  document.querySelectorAll("input[name='knownSystems']").forEach((input) => {
    input.addEventListener("change", () => {
      answers[questionId] = {
        choice: question.options.length,
        status: "unknown",
        knownSystems: getKnownSystems(question.domain),
        note: getUnknownNote(question.domain)
      };
      localStorage.setItem("camaiAnswers", JSON.stringify(answers));
      recordAudit("Bekende systemen bijgewerkt", question.domain);
    });
  });
  const note = $("#unknownNote");
  if (note) {
    note.addEventListener("input", () => {
      answers[questionId] = {
        choice: question.options.length,
        status: "unknown",
        knownSystems: getKnownSystems(question.domain),
        note: getUnknownNote(question.domain)
      };
      localStorage.setItem("camaiAnswers", JSON.stringify(answers));
      recordAudit("Toelichting onbekend onderwerp bijgewerkt", question.domain);
    });
  }
  $("#prevQuestionBtn").disabled = currentQuestion === 0;
  $("#nextQuestionBtn").textContent = currentQuestion === activeTestQuestions.length - 1 ? "Review afronden" : "Opslaan en verder";
  renderComposition();
}

function renderUnknownContext(question, selectedValue) {
  if (selectedValue !== question.options.length) return "";
  const systems = knownSystemOptions[question.domain] || [];
  const stored = answers[question.id] || {};
  const selectedSystems = Array.isArray(stored.knownSystems) ? stored.knownSystems : [];
  const chips = systems
    .map(
      (system) => `
      <label class="system-chip ${selectedSystems.includes(system) ? "selected" : ""}">
        <input type="checkbox" name="knownSystems" value="${system}" ${selectedSystems.includes(system) ? "checked" : ""} />
        <span>${system}</span>
      </label>
    `
    )
    .join("");
  const fallback = getFallbackQuestion(question.domain);
  return `
    <div class="unknown-panel">
      <strong>Prima, dan meten we dit niet als gok.</strong>
      <p>Deze keuze wordt vastgelegd als onbekend onderwerp. De volgende vraag wordt algemener binnen hetzelfde domein: <em>${fallback.type}</em>.</p>
      ${
        systems.length
          ? `<div class="known-systems"><span class="label">Welke vergelijkbare systemen ken je wel?</span><div class="system-chip-list">${chips}</div></div>`
          : ""
      }
      <label class="unknown-note-label">
        Toelichting of vergelijkbare ervaring
        <textarea id="unknownNote" rows="3" placeholder="Bijvoorbeeld: ik ken TOPdesk en NinjaOne, maar niet Autotask/Datto RMM.">${stored.note || ""}</textarea>
      </label>
    </div>
  `;
}

function getKnownSystems(domain) {
  if (!knownSystemOptions[domain]) return [];
  return Array.from(document.querySelectorAll("input[name='knownSystems']:checked")).map((input) => input.value);
}

function getUnknownNote() {
  return $("#unknownNote")?.value || "";
}

function getFallbackQuestion(domain) {
  const fallback = fallbackQuestions[domain] || { ...fallbackQuestions.default, domain };
  return { ...fallback, id: `${fallback.id}-${domain.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` };
}

function insertFallbackQuestion(domain, index) {
  const fallback = getFallbackQuestion(domain);
  const exists = activeTestQuestions.some((question) => question.id === fallback.id);
  if (exists) return;
  activeTestQuestions.splice(index + 1, 0, fallback);
  toast("Algemene vervolgvraag toegevoegd voor dit onderwerp.");
}

function restoreFallbackQuestions() {
  testQuestions.forEach((question, index) => {
    const stored = answers[question.id];
    if (stored && typeof stored === "object" && stored.status === "unknown") {
      const fallback = getFallbackQuestion(question.domain);
      const exists = activeTestQuestions.some((item) => item.id === fallback.id);
      if (!exists) activeTestQuestions.splice(index + 1, 0, fallback);
    }
  });
  currentQuestion = Math.min(currentQuestion, activeTestQuestions.length - 1);
}

function renderComposition() {
  const composition = domains.map((domain) => ({ domain, value: Math.max(4, Math.round((selectedRole.weights[domain] || 0.04) * 100)) }));
  $("#testComposition").innerHTML = composition
    .map(
      (item) => `
      <div class="composition-row">
        <span>${shortDomain(item.domain)}</span>
        <strong>${item.value}%</strong>
        <div class="mini-track" style="grid-column: 1 / -1"><span class="mini-fill" style="width:${item.value * 4}%"></span></div>
      </div>
    `
    )
    .join("");
}

function learnerCompletedIds(learner = selectedLearner) {
  return completedModules[learner.id] || [];
}

function learnerModuleUpdates(learner = selectedLearner) {
  return moduleUpdates[learner.id] || {};
}

function getModuleUpdate(moduleId) {
  return learnerModuleUpdates()[moduleId] || {};
}

function moduleStatus(moduleId) {
  if (isModuleCompleted(moduleId)) return "completed";
  return getModuleUpdate(moduleId).status || "todo";
}

function moduleProgress(moduleId) {
  const status = moduleStatus(moduleId);
  if (status === "completed") return 100;
  if (status === "progress") return 50;
  return 0;
}

function isModuleCompleted(moduleId) {
  return learnerCompletedIds().includes(moduleId);
}

function recommendedDomains() {
  return domains
    .map((domain) => {
      const weight = selectedLearningRole.weights[domain] || 0;
      const target = Math.round(selectedLearningRole.threshold - 4 + weight * 70);
      const current = selectedLearner.scores[domain] || 0;
      return {
        domain,
        current,
        target,
        gap: Math.max(0, target - current),
        weight
      };
    })
    .sort((a, b) => b.gap + b.weight * 10 - (a.gap + a.weight * 10));
}

function recommendedModules() {
  const priority = recommendedDomains();
  return trainingModules
    .map((module) => {
      const domain = priority.find((item) => item.domain === module.domain);
      const completed = isModuleCompleted(module.id);
      return {
        ...module,
        completed,
        gap: domain?.gap || 0,
        current: domain?.current || 0,
        target: domain?.target || selectedLearningRole.threshold,
        priority: completed ? -1 : (domain?.gap || 0) + (domain?.weight || 0) * 80
      };
    })
    .sort((a, b) => b.priority - a.priority || b.xp - a.xp);
}

function learnerXp() {
  return trainingModules
    .filter((module) => isModuleCompleted(module.id))
    .reduce((total, module) => total + module.xp, 0);
}

function learnerLevel(xp = learnerXp()) {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

function toggleModule(moduleId) {
  const current = new Set(learnerCompletedIds());
  if (current.has(moduleId)) {
    current.delete(moduleId);
    setModuleUpdate(moduleId, { status: "todo" });
    recordAudit("Trainingsmodule heropend", `${selectedLearner.name} / ${moduleId}`);
  } else {
    current.add(moduleId);
    setModuleUpdate(moduleId, { status: "completed" });
    recordAudit("Trainingsmodule afgerond", `${selectedLearner.name} / ${moduleId}`);
  }
  completedModules[selectedLearner.id] = Array.from(current);
  localStorage.setItem("camaiCompletedModules", JSON.stringify(completedModules));
  renderAcademy();
}

function setModuleUpdate(moduleId, patch) {
  const learnerUpdates = learnerModuleUpdates();
  learnerUpdates[moduleId] = {
    ...learnerUpdates[moduleId],
    ...patch,
    updatedAt: new Date().toISOString()
  };
  moduleUpdates[selectedLearner.id] = learnerUpdates;
  localStorage.setItem("camaiModuleUpdates", JSON.stringify(moduleUpdates));
}

function setCompletedFromStatus(moduleId, status) {
  const current = new Set(learnerCompletedIds());
  if (status === "completed") current.add(moduleId);
  else current.delete(moduleId);
  completedModules[selectedLearner.id] = Array.from(current);
  localStorage.setItem("camaiCompletedModules", JSON.stringify(completedModules));
}

function moduleType(module) {
  if (module.format.includes("Praktijk") || module.format.includes("simulatie")) return "Course";
  if (module.format.includes("Workflow") || module.format.includes("Policy")) return "Path";
  if (module.format.includes("Schrijf")) return "Other";
  return "Article";
}

function moduleSourceLink(module) {
  return `https://campai.eu.itglue.com/search?query=${encodeURIComponent(module.title)}`;
}

function statusLabel(status) {
  if (status === "completed") return "Completed";
  if (status === "progress") return "In progress";
  return "To do";
}

function statusClass(status) {
  if (status === "completed") return "completed";
  if (status === "progress") return "progress";
  return "todo";
}

function renderAcademy() {
  const xp = learnerXp();
  const level = learnerLevel(xp);
  const completedCount = learnerCompletedIds().length;
  const roleFit = roleScore(selectedLearner, selectedLearningRole);
  const domainsWithGap = recommendedDomains();
  const criticalGaps = domainsWithGap.filter((item) => item.gap >= 10).length;
  const completedBadges = trainingModules.filter((module) => isModuleCompleted(module.id)).map((module) => module.badge);

  const conclusion = $("#academyConclusion");
  if (conclusion) {
    conclusion.innerHTML =
      `<strong>${selectedLearner.name}</strong> → ${selectedLearningRole.name}: rolfit <span class="mono">${roleFit}</span>/100, ` +
      `${criticalGaps} kritieke ${criticalGaps === 1 ? "gap" : "gaten"}, level <span class="mono">${level}</span>.`;
  }

  $("#learnerName").textContent = selectedLearner.name;
  $("#learnerAvatar").textContent = selectedLearner.id;
  $("#learnerRole").textContent = `${selectedLearner.role} → ${selectedLearningRole.name}`;
  $("#learnerMeta").textContent = selectedLearner.meta;
  $("#learnerLevel").textContent = `Level ${level}`;
  $("#learnerXp").textContent = `${xp} XP`;
  $("#learnerXpBar").style.width = `${Math.min(100, (xp % 250) / 2.5)}%`;
  $("#academyQuickCards").innerHTML = renderAcademyQuickCards(completedCount, criticalGaps);
  $("#academyKpis").innerHTML = `
    <div><span class="label">Rolfit</span><strong>${roleFit}/100</strong></div>
    <div><span class="label">Modules klaar</span><strong>${completedCount}/${trainingModules.length}</strong></div>
    <div><span class="label">Badges</span><strong>${completedBadges.length}</strong></div>
    <div><span class="label">Achterstanden</span><strong>${criticalGaps}</strong></div>
  `;

  $("#learningPath").innerHTML = domainsWithGap
    .slice(0, 7)
    .map((item) => {
      const status = item.gap >= 12 ? "Achterstand" : item.gap > 0 ? "Oefenen" : "Op niveau";
      const color = item.gap >= 12 ? "var(--risk)" : item.gap > 0 ? "var(--warn)" : "var(--cyan)";
      return `
        <article class="path-row">
          <div>
            <strong>${shortDomain(item.domain)}</strong>
            <span>${item.current}/100 naar norm ${item.target}</span>
          </div>
          <div class="mini-track"><span class="mini-fill" style="width:${Math.min(100, item.current)}%; background:${color}"></span></div>
          <em>${status}</em>
        </article>
      `;
    })
    .join("");

  $("#academyTasks").innerHTML = renderAcademyTasks(domainsWithGap);

  $("#badgeWall").innerHTML = trainingModules
    .map((module) => {
      const earned = isModuleCompleted(module.id);
      return `
        <article class="badge-card ${earned ? "earned" : ""}">
          <div class="badge-icon">${earned ? "✓" : "+"}</div>
          <div>
            <strong>${module.badge}</strong>
            <span>${shortDomain(module.domain)} / ${module.level}</span>
          </div>
        </article>
      `;
    })
    .join("");

  $("#moduleBoard").innerHTML = recommendedModules()
    .map((module) => {
      const status = moduleStatus(module.id);
      const progress = moduleProgress(module.id);
      const risk = !module.completed && module.gap >= 12;
      return `
        <tr class="${risk ? "module-risk-row" : ""}">
          <td>
            <button class="module-title-button" data-open-module="${module.id}">${module.title}</button>
            <small>${module.proof}</small>
          </td>
          <td><span class="type-chip">${moduleType(module)}</span></td>
          <td>${shortDomain(module.domain)}</td>
          <td>
            <div class="progress-cell">
              <span>${progress}%</span>
              <div class="mini-track"><span class="mini-fill" style="width:${progress}%"></span></div>
            </div>
          </td>
          <td><span class="learning-status ${statusClass(status)}">${statusLabel(status)}</span></td>
          <td><button class="ghost-button compact" data-open-module="${module.id}">Open</button></td>
        </tr>
      `;
    })
    .join("");
  document.querySelectorAll("[data-open-module]").forEach((button) => {
    button.addEventListener("click", () => openModuleModal(button.dataset.openModule));
  });

  $("#teamChallenge").innerHTML = `
    <div>
      <h3>${teamChallenge.title}</h3>
      <p>${teamChallenge.goal}</p>
      <div class="challenge-rules">${teamChallenge.rules.map((rule) => `<span>${rule}</span>`).join("")}</div>
    </div>
    <strong>${teamChallenge.reward}</strong>
  `;
}

function renderAcademyQuickCards(completedCount, criticalGaps) {
  const todoCount = trainingModules.length - completedCount;
  const nextReview = criticalGaps > 2 ? "Plan senior review" : "Geen review gepland";
  return [
    ["Inbox", `${criticalGaps} skill alerts`, "Insights waiting for review"],
    ["Next review", nextReview, "Coachmoment voor doelrol"],
    ["Next 1:1", "30 min growth check", "Bespreek blockers en bewijs"],
    ["Next steps", `${todoCount} modules`, "Assigned to you"]
  ]
    .map(
      ([title, value, copy]) => `
      <article class="quick-card">
        <div>
          <strong>${title}</strong>
          <span>${copy}</span>
        </div>
        <em>${value}</em>
      </article>
    `
    )
    .join("");
}

function renderAcademyTasks(domainsWithGap) {
  const modules = recommendedModules().filter((module) => !module.completed).slice(0, 4);
  const gap = domainsWithGap.find((item) => item.gap > 0);
  const tasks = [
    gap ? `Bespreek ${gap.domain} gap in de volgende 1:1` : "Houd het huidige rolpad actueel",
    "Koppel minimaal een module aan een leerdoel",
    ...modules.map((module) => `Rond af: ${module.title}`)
  ].slice(0, 5);

  return tasks
    .map(
      (task, index) => `
      <article class="academy-task">
        <span>${index + 1}</span>
        <p>${task}</p>
      </article>
    `
    )
    .join("");
}

function openModuleModal(moduleId) {
  const module = trainingModules.find((item) => item.id === moduleId);
  if (!module) return;
  activeModuleId = moduleId;
  const update = getModuleUpdate(moduleId);
  $("#moduleModalMeta").textContent = `${module.domain} / ${module.level} / ${module.xp} XP`;
  $("#moduleModalTitle").textContent = module.title;
  $("#moduleModalDescription").textContent = module.proof;
  $("#moduleModalProof").textContent = `Bewijs: ${module.proof}. Gebruik deze module om praktijkervaring vast te leggen, niet alleen om kennis af te vinken.`;
  $("#moduleStatusSelect").value = moduleStatus(moduleId);
  $("#moduleComment").value = update.comment || "";
  $("#moduleModalLink").href = moduleSourceLink(module);
  $("#moduleModalLink").textContent = "Open IT Glue / bron";
  $("#moduleModalType").textContent = moduleType(module);
  $("#moduleTimeline").innerHTML = renderModuleTimeline(module, update);
  $("#moduleModal").classList.add("show");
  $("#moduleModal").setAttribute("aria-hidden", "false");
}

function closeModuleModal() {
  $("#moduleModal").classList.remove("show");
  $("#moduleModal").setAttribute("aria-hidden", "true");
  activeModuleId = "";
}

function saveModuleUpdate() {
  if (!activeModuleId) return;
  const status = $("#moduleStatusSelect").value;
  const comment = $("#moduleComment").value.trim();
  setModuleUpdate(activeModuleId, { status, comment });
  setCompletedFromStatus(activeModuleId, status);
  const module = trainingModules.find((item) => item.id === activeModuleId);
  recordAudit("Learning update opgeslagen", `${selectedLearner.name} / ${module?.title || activeModuleId} / ${statusLabel(status)}`);
  renderAcademy();
  openModuleModal(activeModuleId);
  toast("Learning update opgeslagen.");
}

function renderModuleTimeline(module, update) {
  const entries = [
    ["Aangemaakt", "Campai Skills Academy", "Seedmodule uit MSP-skillmatrix"],
    update.updatedAt ? ["Laatste update", formatAuditTime(update.updatedAt), statusLabel(update.status || "todo")] : null,
    update.comment ? ["Comment", selectedLearner.name, update.comment] : null
  ].filter(Boolean);

  return entries
    .map(
      ([title, meta, copy]) => `
      <article>
        <strong>${title}</strong>
        <span>${meta}</span>
        <p>${copy}</p>
      </article>
    `
    )
    .join("");
}

function renderQuestionFactory() {
  $("#draftQuestions").innerHTML = draftQuestions
    .map((item, index) => {
      const isActive = index === activeDraftIndex;
      const options = item.options || defaultDraftOptions(item);
      const answer = Number.isInteger(item.answer) ? item.answer : 1;
      return `
      <article class="draft-item ${isActive ? "draft-item--active" : ""}" data-draft-index="${index}">
        <div class="draft-copy">
          <span class="label">${escapeHtml(item.domain)} / ${escapeHtml(item.role)}${item.type ? ` / ${escapeHtml(item.type)}` : ""}</span>
          <button class="draft-title" type="button" data-draft-title-open="${index}">
            ${escapeHtml(item.prompt)}
          </button>
          <p>${escapeHtml(item.source)}</p>
          ${
            isActive
              ? `
                <div class="draft-editor">
                  <label>Bron
                    <input data-draft-field="source" value="${escapeAttr(item.source)}" />
                  </label>
                  <label>Conceptvraag
                    <textarea data-draft-field="prompt" rows="4">${escapeHtml(item.prompt)}</textarea>
                  </label>
                  <div class="draft-options-editor">
                    ${options
                      .map(
                        (option, optionIndex) => `
                          <label>
                            <span>Optie ${String.fromCharCode(65 + optionIndex)}</span>
                            <input data-draft-option="${optionIndex}" value="${escapeAttr(option)}" />
                          </label>
                        `
                      )
                      .join("")}
                  </div>
                  <label>Correct antwoord
                    <select data-draft-field="answer">
                      ${options
                        .map((_, optionIndex) => `<option value="${optionIndex}" ${answer === optionIndex ? "selected" : ""}>${String.fromCharCode(65 + optionIndex)}</option>`)
                        .join("")}
                    </select>
                  </label>
                  <div class="draft-actions">
                    <button class="ghost-button" type="button" data-draft-save="${index}">Wijziging opslaan</button>
                    <button class="primary-button" type="button" data-draft-promote="${index}">Toevoegen aan assessment</button>
                  </div>
                </div>
              `
              : ""
          }
        </div>
        <button class="review-chip" type="button" data-draft-open="${index}">${isActive ? "Open" : "Openen"}</button>
      </article>
    `;
    })
    .join("");

  document.querySelectorAll("[data-draft-open]").forEach((button) => {
    button.addEventListener("click", () => {
      activeDraftIndex = Number(button.dataset.draftOpen);
      renderQuestionFactory();
    });
  });
  document.querySelectorAll("[data-draft-title-open]").forEach((button) => {
    button.addEventListener("click", () => {
      activeDraftIndex = Number(button.dataset.draftTitleOpen);
      renderQuestionFactory();
    });
  });
  document.querySelectorAll("[data-draft-save]").forEach((button) => {
    button.addEventListener("click", () => {
      saveDraftFromEditor(Number(button.dataset.draftSave));
      renderQuestionFactory();
      toast("Conceptvraag bijgewerkt.");
    });
  });
  document.querySelectorAll("[data-draft-promote]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.draftPromote);
      saveDraftFromEditor(index);
      promoteDraftToAssessment(index);
      renderQuestionFactory();
      renderTest();
      toast("Conceptvraag toegevoegd aan kandidaattest.");
    });
  });
}

function defaultDraftOptions(item) {
  return [
    "Alleen een losse technische actie uitvoeren zonder impact of communicatie.",
    "Impact bepalen, relevante logs of brondata controleren, herstelstap kiezen en opvolging vastleggen.",
    "De vraag direct escaleren zonder eigen analyse of context.",
    "Wachten tot de klant of collega opnieuw contact opneemt."
  ];
}

function saveDraftFromEditor(index) {
  const article = document.querySelector(`[data-draft-index="${index}"]`);
  if (!article) return;
  const item = draftQuestions[index];
  const source = article.querySelector('[data-draft-field="source"]')?.value.trim();
  const prompt = article.querySelector('[data-draft-field="prompt"]')?.value.trim();
  const answer = Number(article.querySelector('[data-draft-field="answer"]')?.value || 1);
  const options = Array.from(article.querySelectorAll("[data-draft-option]")).map((input) => input.value.trim() || "Nog uitwerken");
  item.source = source || item.source;
  item.prompt = prompt || item.prompt;
  item.options = options;
  item.answer = answer;
  recordAudit("Conceptvraag bijgewerkt", `${item.domain} / ${item.role}`);
}

function promoteDraftToAssessment(index) {
  const item = draftQuestions[index];
  const nextQuestion = {
    id: `q-custom-${Date.now()}`,
    domain: item.domain,
    type: item.type || "Conceptvraag",
    prompt: item.prompt,
    options: item.options || defaultDraftOptions(item),
    answer: Number.isInteger(item.answer) ? item.answer : 1
  };
  prepareAssessmentQuestion(nextQuestion, testQuestions.length);
  testQuestions.push(nextQuestion);
  activeTestQuestions = [...testQuestions];
  currentQuestion = activeTestQuestions.length - 1;
  localStorage.setItem("camaiQuestionIndex", currentQuestion);
  recordAudit("Conceptvraag toegevoegd aan assessment", `${item.domain} / ${item.role}`);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function dataStructureItems() {
  return [
    ["people[]", `${people.length} personen`, "Unified array met kandidaten en medewerkers via type candidate/learner."],
    ["candidates[]", `${candidates.length} kandidaten`, "Recruitmentprofielen met scores, assessmentstatus en rol-fit."],
    ["learners[]", `${learners.length} medewerkers`, "Interne ontwikkelprofielen met doelrol, XP, badges en modulevoortgang."],
    ["domains[]", `${domains.length} domeinen`, "MSP-domeinen voor scoring, heatmap, competentiekaart en vragen."],
    ["roles[]", `${roles.length} rollen`, "Doelrollen met domeingewichten, thresholds en advieslogica."],
    ["trainingModules[]", `${trainingModules.length} modules`, "Skills Academy registry voor artikel, course, path en practice."],
    ["testQuestions[]", `${testQuestions.length} vragen`, "Gebalanceerde assessmentvragen met antwoordindex en domeinkoppeling."],
    ["draftQuestions[]", `${draftQuestions.length} concepten`, "Vragenbankconcepten die bewerkt en naar het assessment gepromoveerd kunnen worden."],
    ["dashboardModules[]", `${dashboardModules.length} views`, "Dashboardregistry die navigatie, panels en databronnen bij elkaar houdt."],
    ["DATASTRUCTURE.md", "Canoniek protocol", "Toevoegen van kandidaat, medewerker, domein, rol of module volgt dit document."]
  ];
}

function memoryItems() {
  const localAnswers = Object.keys(answers).length;
  const completedCount = Object.keys(completedModules).length;
  const updateCount = Object.values(moduleUpdates).reduce((total, updates) => total + (Array.isArray(updates) ? updates.length : 0), 0);
  return [
    ["camaiAnswers", `${localAnswers} antwoorden`, "Autosave voor kandidaatantwoorden in de browser."],
    ["camaiQuestionIndex", `Vraag ${currentQuestion + 1}`, "Laatste positie in de adaptieve kandidaatflow."],
    ["camaiAssessmentSchemaVersion", assessmentSchemaVersion, "Reset oude antwoorden wanneer de vraagstructuur wijzigt."],
    ["camaiCompletedModules", `${completedCount} modules`, "Lokale voortgang voor Skills Academy modules."],
    ["camaiModuleUpdates", `${updateCount} updates`, "Comments/statusupdates per trainingsmodule."],
    ["camaiAuditLog", `${auditLog.length} events`, "Laatste 100 beheer- en dashboardacties."]
  ];
}

function renderAdminInfo(targetSelector, items) {
  const target = $(targetSelector);
  if (!target) return;
  target.innerHTML = items
    .map(
      ([key, value, description]) => `
      <article class="admin-info-item">
        <span>${key}</span>
        <strong>${value}</strong>
        <p>${description}</p>
      </article>
    `
    )
    .join("");
}

function renderAdminPanel() {
  $("#profileRolePill").textContent = currentUserProfile.role;
  $("#profileAvatar").textContent = initials(currentUserProfile.name || currentUserProfile.email);
  $("#profileName").textContent = currentUserProfile.name;
  $("#profileEmail").textContent = currentUserProfile.email;
  $("#profileMeta").innerHTML = `
    <div><span class="label">Identity</span><strong>${currentUserProfile.source}</strong></div>
    <div><span class="label">Approl</span><strong>${currentUserProfile.role}</strong></div>
    <div><span class="label">Rechten</span><strong>${currentUserProfile.permissions.join(", ")}</strong></div>
  `;

  $("#roleMatrix").innerHTML = adminRoles
    .map(
      (role) => `
      <article class="role-card ${role.name === currentUserProfile.role ? "active" : ""}">
        <div>
          <strong>${role.name}</strong>
          <p>${role.scope}</p>
        </div>
        <span>${role.permissions.join(" / ")}</span>
      </article>
    `
    )
    .join("");

  $("#documentationMap").innerHTML = documentationMap
    .map(
      ([subject, location, rule]) => `
      <article class="documentation-item">
        <strong>${subject}</strong>
        <span>${location}</span>
        <p>${rule}</p>
      </article>
    `
    )
    .join("");

  renderAdminInfo("#dataStructureMap", dataStructureItems());
  renderAdminInfo("#memoryMap", memoryItems());
  renderAdminInfo("#settingsMap", appSettingsMap);

  $("#auditLog").innerHTML = auditLog.length
    ? auditLog
        .map(
          (entry) => `
        <article class="audit-item">
          <time>${formatAuditTime(entry.at)}</time>
          <strong>${entry.action}</strong>
          <span>${entry.detail}</span>
          <small>${entry.actor}</small>
        </article>
      `
        )
        .join("")
    : `<p class="empty-state">Nog geen dashboardwijzigingen vastgelegd.</p>`;
}

function recordAudit(action, detail) {
  auditLog.unshift({
    at: new Date().toISOString(),
    actor: currentUserProfile.email || currentUserProfile.name,
    action,
    detail
  });
  auditLog = auditLog.slice(0, 100);
  localStorage.setItem("camaiAuditLog", JSON.stringify(auditLog));
  renderAdminPanel();
}

function ensureInitialAuditEntry() {
  if (auditLog.length) return;
  recordAudit("Dashboard geopend", "Nieuwe lokale auditlog gestart");
}

function initials(value) {
  const parts = String(value || "Campai gebruiker")
    .replace(/@.*/, "")
    .split(/[.\s_-]+/)
    .filter(Boolean);
  return (parts[0]?.[0] || "C").toUpperCase() + (parts[1]?.[0] || "P").toUpperCase();
}

function formatAuditTime(value) {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

async function loadIdentity() {
  try {
    const response = await fetch("/api/me", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Identity endpoint niet beschikbaar");
    const identity = await response.json();
    currentUserProfile.name = identity.name || identity.email || currentUserProfile.name;
    currentUserProfile.email = identity.email || currentUserProfile.email;
    currentUserProfile.source = identity.authenticated ? "Entra ID" : "Lokale testmodus";
    recordAudit("Profiel geladen", currentUserProfile.source);
  } catch {
    currentUserProfile.source = "Niet beschikbaar";
    renderAdminPanel();
  }
}

function buildReport() {
  return {
    usageMode: "campai-only",
    reportType: "recruitment-assessment",
    candidate: selectedCandidate.name,
    candidateId: selectedCandidate.id,
    role: selectedRole.name,
    roleId: selectedRole.id,
    score: roleScore(selectedCandidate, selectedRole),
    status: scoreState(roleScore(selectedCandidate, selectedRole), selectedRole.threshold),
    domains: selectedCandidate.scores,
    answers,
    generatedAt: new Date().toISOString(),
    caveat: "Assessmentresultaat ondersteunt recruitmentreview, maar vervangt geen gestructureerd interview."
  };
}

function buildTrainingReport() {
  const completed = trainingModules.filter((module) => isModuleCompleted(module.id));
  const gaps = recommendedDomains().slice(0, 5);
  return {
    usageMode: "campai-internal-training",
    reportType: "skills-academy",
    learner: selectedLearner.name,
    learnerId: selectedLearner.id,
    currentRole: selectedLearner.role,
    targetRole: selectedLearningRole.name,
    roleFit: roleScore(selectedLearner, selectedLearningRole),
    xp: learnerXp(),
    level: learnerLevel(),
    badges: completed.map((module) => module.badge),
    completedModules: completed.map((module) => ({
      id: module.id,
      title: module.title,
      domain: module.domain,
      xp: module.xp,
      proof: module.proof
    })),
    priorityGaps: gaps,
    generatedAt: new Date().toISOString(),
    caveat: "Trainingdata ondersteunt ontwikkeling en coaching; gebruik dit niet als automatische HR-beoordeling."
  };
}

async function saveReport(report) {
  const response = await fetch("/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(report)
  });

  if (!response.ok) throw new Error("Opslaan mislukt");
  return response.json();
}

async function exportReport() {
  const report = buildReport();

  try {
    await saveReport(report);
    recordAudit("Assessmentrapport opgeslagen", `${report.candidate} / ${report.role}`);
    toast("Assessmentrapport opgeslagen en geexporteerd als JSON.");
  } catch {
    recordAudit("Assessmentrapport lokaal geexporteerd", `${report.candidate} / ${report.role}`);
    toast("Opslaan in database mislukt; JSON-export is wel gemaakt.");
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${selectedCandidate.id}-${selectedRole.id}-assessmentrapport.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function exportTrainingReport() {
  const report = buildTrainingReport();

  try {
    await saveReport(report);
    recordAudit("Trainingrapport opgeslagen", `${report.learner} / ${report.targetRole}`);
    toast("Trainingrapport opgeslagen en geexporteerd als JSON.");
  } catch {
    recordAudit("Trainingrapport lokaal geexporteerd", `${report.learner} / ${report.targetRole}`);
    toast("Opslaan in database mislukt; trainingexport is wel gemaakt.");
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${selectedLearner.id}-${selectedLearningRole.id}-skills-academy.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 2600);
}

init();
