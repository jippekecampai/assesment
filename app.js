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
  }
];

testQuestions.forEach((question, index) => {
  question.id = `q-${index + 1}`;
});

const unknownOptionLabel = "Dit onderwerp is mij niet bekend";

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

let activeTestQuestions = [...testQuestions];

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
  }
];

const sourceOptions = [
  ["Vendorcertificeringen", "Gebruik Microsoft, Fortinet, Kaseya en Inforcer objectives als dekking, maar herschrijf ze naar Campai-scenario's."],
  ["Interne SOP's en runbooks", "Zet IT Glue procedures om naar praktijkvragen die toetsen of kandidaten volgens de Campai-werkwijze denken."],
  ["Post-incident reviews", "Gebruik geanonimiseerde lessons learned uit escalaties om judgement, communicatie en root-cause thinking te toetsen."],
  ["Shadow interviews", "Vraag senior engineers, consultants en TAM's naar vijf casussen die goede kandidaten onderscheiden van zwakke kandidaten."],
  ["Projectretrospectives", "Haal migratie-, adoptie- en changevragen uit afgeronde SharePoint-, Azure- en Teams-projecten."],
  ["Gedragsinterviews", "Gebruik STAR-vragen over ownership, samenwerken, feedback, klantdruk, planning en omgaan met fouten."],
  ["Rolkalibratie", "Laat sterke huidige medewerkers de test maken om drempelwaardes te tunen en vage of oneerlijke vragen te vinden."]
];

let selectedCandidate = candidates[0];
let selectedRole = roles[1];
let selectedDomain = "Alle domeinen";
let currentQuestion = Number(localStorage.getItem("camaiQuestionIndex") || 0);
let answers = JSON.parse(localStorage.getItem("camaiAnswers") || "{}");

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

function init() {
  bindNavigation();
  populateControls();
  bindEvents();
  restoreFallbackQuestions();
  loadIdentity();
  renderAll();
  renderTest();
  renderQuestionFactory();
}

function bindNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const view = button.dataset.view;
      document.querySelectorAll(".view").forEach((section) => section.classList.remove("active"));
      $(`#${view}View`).classList.add("active");
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
}

function bindEvents() {
  $("#candidateSelect").addEventListener("change", (event) => {
    selectedCandidate = candidates.find((candidate) => candidate.id === event.target.value);
    renderAll();
  });
  $("#roleSelect").addEventListener("change", (event) => {
    selectedRole = roles.find((role) => role.id === event.target.value);
    renderAll();
  });
  $("#domainSelect").addEventListener("change", (event) => {
    selectedDomain = event.target.value;
    renderEvidence();
  });
  $("#resetViewBtn").addEventListener("click", () => {
    selectedRole = roles[1];
    selectedDomain = "Alle domeinen";
    $("#roleSelect").value = selectedRole.id;
    $("#domainSelect").value = selectedDomain;
    renderAll();
    toast("Weergave teruggezet naar Cloud Engineer en alle domeinen.");
  });
  $("#showAllEvidenceBtn").addEventListener("click", () => {
    selectedDomain = "Alle domeinen";
    $("#domainSelect").value = selectedDomain;
    renderEvidence();
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
      source: $("#authorSource").value || "Handmatige Campai-bron",
      prompt: $("#authorPrompt").value || "Conceptvraag wacht op senior review."
    });
    event.target.reset();
    renderQuestionFactory();
    toast("Conceptvraag toegevoegd voor review.");
  });
  $("#globalSearch").addEventListener("input", (event) => {
    selectedDomain = domains.find((domain) => domain.toLowerCase().includes(event.target.value.toLowerCase())) || "Alle domeinen";
    $("#domainSelect").value = selectedDomain;
    renderEvidence();
  });
}

function renderAll() {
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
  $("#candidateAvatar").textContent = selectedCandidate.id;
  $("#candidateName").textContent = selectedCandidate.name;
  $("#candidateMeta").textContent = selectedCandidate.meta;
  $("#decisionLabel").textContent = state;
  $("#qualificationStatus").textContent = state;
  $("#qualificationText").textContent = `${score}/100 tegenover drempel ${selectedRole.threshold} voor ${selectedRole.name}.`;
  $("#scoreRing").style.setProperty("--score", score);
  $("#scoreRing span").textContent = score;
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
  const cx = 210;
  const cy = 158;
  const radius = 112;
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
  const score = roleScore(selectedCandidate, selectedRole);
  const sortedDomains = domains.map((domain) => ({ domain, score: selectedCandidate.scores[domain] })).sort((a, b) => b.score - a.score);
  const strengths = sortedDomains.slice(0, 3);
  const gaps = sortedDomains.slice(-3).reverse();
  $("#decisionInspector").innerHTML = `
    <div class="decision-score">
      <span class="label">Geselecteerde rol</span>
      <strong>${selectedRole.name}</strong>
      <div class="bar-track"><span class="bar-fill" style="width:${score}%"></span></div>
      <small>${score}/100, drempel ${selectedRole.threshold}. ${scoreState(score, selectedRole.threshold)}.</small>
    </div>
    <span class="label">Sterke punten</span>
    <ul class="strength-list">${strengths.map((item) => `<li>${item.domain}: ${item.score}</li>`).join("")}</ul>
    <span class="label">Aandachtspunten</span>
    <ul class="gap-list">${gaps.map((item) => `<li>${item.domain}: ${item.score}</li>`).join("")}</ul>
    <span class="label">Reviewernotitie</span>
    <div class="decision-note">Gebruik dit als interviewbewijs, niet als automatische afwijzing. Valideer praktische gaten en werkhouding in een gesprek met een senior engineer, consultant of manager wanneer de kandidaat rond de drempel zit.</div>
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

function renderQuestionFactory() {
  $("#draftQuestions").innerHTML = draftQuestions
    .map(
      (item) => `
      <article class="draft-item">
        <div>
          <span class="label">${item.domain} / ${item.role}</span>
          <h3>${item.prompt}</h3>
          <p>${item.source}</p>
        </div>
        <span class="status-pill">Review nodig</span>
      </article>
    `
    )
    .join("");
  $("#sourceOptions").innerHTML = sourceOptions
    .map(
      ([title, copy]) => `
      <article class="source-item">
        <strong>${title}</strong>
        <p>${copy}</p>
      </article>
    `
    )
    .join("");
}

async function loadIdentity() {
  const pill = $("#identityPill");
  if (!pill) return;

  try {
    const response = await fetch("/api/me", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Identity endpoint niet beschikbaar");
    const identity = await response.json();
    pill.querySelector("strong").textContent = identity.authenticated ? identity.name || identity.email : "Lokale testmodus";
  } catch {
    pill.querySelector("strong").textContent = "Geen SSO-status";
  }
}

function buildReport() {
  return {
    usageMode: "campai-only",
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
    toast("Assessmentrapport opgeslagen en geexporteerd als JSON.");
  } catch {
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

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 2600);
}

init();
