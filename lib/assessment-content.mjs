// lib/assessment-content.mjs
// Eén bron van waarheid voor rollen + vragenbank (server + frontend).
// Verbatim uit src/lib/data.ts; rauwe testQuestions (vóór voorbereiding).

export const unknownOptionLabel = "Dit onderwerp is mij niet bekend";

export const roles = [
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

export const domains = [
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

// NOTE: The question originally listed domain "Technical Account Manager" in src/lib/data.ts,
// which is a role name, not a domain. It is corrected to "Werkhouding & Communicatie" here so
// that every question maps to a valid domain (required by the sanity test). See task-1-report.md.
export const testQuestions = [
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
    domain: "Werkhouding & Communicatie",
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

export const fallbackQuestions = {
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

export const knownSystemOptions = {
  "Kaseya Stack": ["TOPdesk", "HaloPSA", "NinjaOne", "N-able", "ConnectWise", "Freshservice", "Zendesk", "Microsoft Intune"],
  "SharePoint / Teams": ["Google Workspace", "Slack", "Confluence", "Dropbox Business", "Box"],
  "SharePoint / Azure Migrations": ["Google Drive migratie", "Dropbox migratie", "fileserver migratie", "tenant-to-tenant migratie"],
  Inforcer: ["Microsoft Intune baselines", "CIPP", "native Microsoft 365 policies", "Conditional Access templates"],
  Fortigate: ["SonicWall", "Sophos", "Palo Alto", "Cisco Meraki", "WatchGuard"],
  VoIP: ["3CX", "Teams Phone", "Broadsoft", "Mitel", "Yealink beheer"],
  Azure: ["AWS", "Google Cloud", "VMware", "Hyper-V"],
  "AI / Copilot": ["ChatGPT", "Claude", "Gemini", "Power Platform AI", "Microsoft Copilot Chat"],
};
