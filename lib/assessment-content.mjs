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
  // ── Microsoft 365 ────────────────────────────────────────────────────────
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Een gebruiker kan na een wijziging in het Conditional Access-beleid wel inloggen in Outlook Web, maar niet in de Outlook desktop client. Wat onderzoek je als eerste om de oorzaak te vinden?",
    options: [
      "De Outlook-client lokaal verwijderen en opnieuw installeren zodat een verse profielconfiguratie wordt opgehaald",
      "Het Outlook-cacheprofiel (OST) opnieuw laten opbouwen omdat een corrupte cache de aanmelding blokkeert",
      "De sign-in logs in Entra ID filteren op deze gebruiker en kijken welke CA-policy en client-app de aanmelding tegenhoudt",
      "De licentie van de gebruiker controleren omdat een ontbrekende Exchange-licentie de desktop client uitsluit",
    ],
    answer: 2,
  },
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Een gebruiker krijgt vanuit een als risicovol aangemerkt land geen toegang tot zijn mail; de manager heeft tijdelijke toegang goedgekeurd. Wat is de meest gecontroleerde aanpak?",
    options: [
      "De gebruiker tijdelijk toevoegen aan een uitsluitingsgroep van de betreffende CA-policy en de verwijdering op de einddatum vastleggen",
      "De landenlijst in het named-location-beleid aanpassen zodat dat land tijdelijk niet meer als risicovol geldt",
      "Het betreffende Conditional Access-beleid uitschakelen voor de duur van de reis en het daarna weer inschakelen",
      "Een sign-in risk-uitzondering instellen zodat aanmeldingen vanuit dat land niet meer als risico worden gescoord",
    ],
    answer: 0,
  },
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "E-mails vanuit het domein van een klant belanden regelmatig in de spambox. SPF is correct ingesteld, maar DKIM en DMARC ontbreken. Wat is de juiste volgorde van acties?",
    options: [
      "Direct een DMARC-record met p=reject publiceren en daarna DKIM activeren, zodat afdwinging meteen actief is",
      "DKIM activeren en de records publiceren, daarna DMARC op p=quarantine zetten en bij klachten terugschakelen naar p=none",
      "Eerst het SPF-record uitbreiden met de DKIM-selectors en pas daarna een DMARC-record met p=reject toevoegen",
      "DKIM inschakelen in M365 en de CNAME-records publiceren, daarna DMARC starten met p=none en op basis van rapporten geleidelijk aanscherpen",
    ],
    answer: 3,
  },
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Een gebruiker dient een release-verzoek in voor een bericht in quarantaine, dat je in het Security Center ziet staan. Wat is de juiste werkwijze?",
    options: [
      "Het bericht beoordelen op afzender, headers en inhoud, en het pas vrijgeven als het legitiem blijkt, anders geblokkeerd laten en de gebruiker informeren",
      "Het bericht vrijgeven omdat een door de gebruiker aangevraagde release een bewuste keuze van de eindgebruiker is",
      "Het bericht vrijgeven en de afzender aan de toegestane-afzenderslijst toevoegen om herhaalde quarantaine te voorkomen",
      "Het verzoek doorzetten naar de gebruiker zelf met de bevoegdheid om eigen berichten vrij te geven, zodat de helpdesk wordt ontlast",
    ],
    answer: 0,
  },
  {
    domain: "Microsoft 365",
    type: "Security assessment",
    prompt:
      "Wat is het beste startpunt voor een M365 security assessment bij een nieuwe klant?",
    options: [
      "De Secure Score-aanbevelingen op volgorde van puntenwinst afwerken tot een gezond percentage is bereikt",
      "De sign-in logs en audit logs van de afgelopen periode doornemen om uit het feitelijke gedrag de zwakke plekken af te leiden",
      "Identity, Conditional Access, adminrollen en external sharing in samenhang beoordelen tegen het risicoprofiel van de klant",
      "De licentiemix in kaart brengen om vast te stellen welke securityfeatures beschikbaar zijn voordat je verder onderzoekt",
    ],
    answer: 2,
  },
  {
    domain: "Microsoft 365",
    type: "Entra ID",
    prompt:
      "Je ziet risky sign-ins in Entra ID en er blijkt geen duidelijk break-glass proces te bestaan. Wat hoort in je advies?",
    options: [
      "Voor alle gemarkeerde gebruikers direct een wachtwoordreset en MFA-heraanmelding afdwingen om de risico's weg te nemen",
      "Een CA-beleid instellen dat bij verhoogd sign-in risk om MFA vraagt en risky users automatisch blokkeert",
      "De gevoeligheid van de risk-detectie tijdelijk verlagen zodat eerst de bekende false positives uit het beeld verdwijnen",
      "MFA en CA valideren, break-glass accounts inrichten en uitsluiten van blokkades, en monitoring met alerting op risico vastleggen",
    ],
    answer: 3,
  },

  // ── Azure ────────────────────────────────────────────────────────────────
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Een externe auditor heeft tijdelijk leesrechten nodig op de Entra-omgeving van een klant om een eenmalige security-audit uit te voeren. Welke aanpak past het beste bij least-privilege en governance?",
    options: [
      "De auditor uitnodigen als gastgebruiker en de Global Reader-rol permanent toekennen, zodat hij later opnieuw kan auditen zonder herconfiguratie",
      "De auditor toevoegen aan een bestaande beheergroep met de Security Reader-rol en die toewijzing handmatig verwijderen zodra de audit is afgerond",
      "De auditor als gastgebruiker uitnodigen en de benodigde leesrol via PIM eligible toekennen met een tijdslimiet en goedkeuring per activering",
      "Een dienstprincipaal met Directory Readers aanmaken en de auditor de bijbehorende secret laten gebruiken gedurende de audit",
    ],
    answer: 2,
    source: "Thread",
  },
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Microsoft faseert Azure Blueprints uit. Een klant gebruikt Blueprints actief voor resource-governance en deny-assignments. Wat is de meest passende migratiestrategie?",
    options: [
      "Deny-assignments en resource-groepering overzetten naar Azure Deployment Stacks en de blueprint-definities versiebeheren als template specs in Git",
      "Alle blueprint-functionaliteit één-op-één overzetten naar Azure Policy, omdat Policy zowel deny-assignments als resource-deployment afdwingt",
      "De blueprints exporteren als ARM-templates en via een pipeline herhaaldelijk deployen, waarmee ook de deny-assignments behouden blijven",
      "Management group-niveau RBAC met Deny-toewijzingen handmatig instellen en de bestaande blueprint-assignments ongewijzigd laten doorlopen",
    ],
    answer: 0,
    source: "Thread",
  },
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Een klant heeft Reserved VM Instances voor een VM-serie waarvan aankoop en verlenging binnenkort vervallen. Auto-renew staat aan. Wat gebeurt er financieel als de klant niets onderneemt?",
    options: [
      "De reservering wordt automatisch verlengd tegen het laatst geldende RI-tarief totdat de klant de auto-renew uitzet",
      "Microsoft migreert de reservering automatisch naar een vergelijkbare nieuwere serie met behoud van de kortingsperiode",
      "De auto-renew wordt genegeerd en de VM-workloads worden na afloop tegen pay-as-you-go-tarieven gefactureerd",
      "De lopende reservering blijft de korting geven, maar nieuwe VM's van die serie kunnen niet meer worden aangemaakt",
    ],
    answer: 2,
    source: "Thread",
  },
  {
    domain: "Azure",
    type: "Fundamentals",
    prompt:
      "Een klant twijfelt tussen Azure App Service en een zelfbeheerde VM voor een eenvoudige webworkload. Wat is het sterkste argument vóór App Service in een MSP-context?",
    options: [
      "App Service heeft een SLA terwijl een losse VM geen enkele beschikbaarheidsgarantie van Azure krijgt",
      "App Service neemt OS- en runtime-patching over en biedt ingebouwde schaal- en deployment-slots, wat het beheer vereenvoudigt",
      "App Service rekent alleen per request af, waardoor het voor elke webworkload structureel goedkoper uitvalt dan een VM",
      "App Service verzorgt automatisch back-up en monitoring, zodat hiervoor geen aparte configuratie meer nodig is",
    ],
    answer: 1,
  },
  {
    domain: "Azure",
    type: "Governance",
    prompt:
      "Een engineer heeft met spoed verhoogde rechten nodig op een subscription om een incident op te lossen. Wat is de beste MSP-aanpak qua toegangsbeheer?",
    options: [
      "Een dedicated break-glass-account met permanente Owner-rechten gebruiken, zodat tijdens incidenten geen vertraging ontstaat",
      "De engineer toevoegen aan de bestaande Contributor-groep van de subscription en de toewijzing na het incident weer verwijderen",
      "De vereiste rol op een tijdelijk verhoogd scope toekennen en dit na het incident terugdraaien met behoud van de activiteitenlog",
      "Via PIM de minimaal benodigde rol en scope eligible maken, deze just-in-time activeren met motivatie en automatisch laten verlopen",
    ],
    answer: 3,
  },

  // ── Kaseya Stack ─────────────────────────────────────────────────────────
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Een Datto-backup op meerdere servers mislukt al dagen met 'Backup failed because backup image files have not been decrypted'. Wat is de meest gerichte eerste actie?",
    options: [
      "De backup-policy opnieuw toewijzen aan de getroffen servers zodat de planning ververst wordt",
      "Een forced full base image plannen zodat er een verse backupketen wordt opgebouwd",
      "In de Datto-console de encryption passphrase opnieuw invoeren zodat de agent de image-bestanden weer kan ontsleutelen",
      "De agentservice op de servers herstarten en de eerstvolgende geplande backup afwachten",
    ],
    answer: 2,
    source: "Thread",
  },
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Bij een onboarding-ticket staat in de PSA: 'Bekijk in IT Glue OOK de klantspecifieke onboarding-SOP!' Waarom is die verwijzing belangrijk?",
    options: [
      "De klantspecifieke SOP bevat afwijkende stappen (apps, netwerkmappen, licenties) die niet in de standaard onboarding-workflow zitten",
      "De SOP in IT Glue vervangt het standaard onboarding-formulier dat daardoor niet meer ingevuld hoeft te worden",
      "In de SOP staan de inloggegevens van de nieuwe medewerker die nodig zijn om het account aan te maken",
      "Het openen van de SOP koppelt het ticket automatisch aan de juiste organisatie in Autotask",
    ],
    answer: 0,
    source: "Thread",
  },
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Een alert meldt dat een medewerker een automatische e-mailforwarding-regel naar een extern adres heeft aangemaakt. Wat is de juiste eerste reactie?",
    options: [
      "De forwarding-regel meteen verwijderen omdat externe doorstuurregels per definitie een datalek vormen",
      "Het wachtwoord van de medewerker resetten en de actieve sessies intrekken voordat je verder onderzoekt",
      "Een security-ticket aanmaken en de regel laten staan tot een senior het volledige mailbox-auditlog heeft bekeken",
      "Verifiëren of de medewerker de regel bewust heeft aangemaakt en pas ingrijpen bij geen verklaring of andere verdachte signalen",
    ],
    answer: 3,
    source: "Thread",
  },
  {
    domain: "Kaseya Stack",
    type: "IT Glue / documentatie",
    prompt:
      "Je zoekt met spoed het runbook en de wachtwoorden voor een server bij een klant die je niet kent. Hoe gebruik je IT Glue het meest effectief?",
    options: [
      "Het runbook van een vergelijkbare klant openen omdat de standaard-setup meestal identiek is",
      "Op de juiste organisatie filteren, de gekoppelde configuration items en runbooks openen en de Smart/AI-zoekfunctie inzetten om de asset te vinden",
      "Globaal op de servernaam zoeken over alle organisaties en het eerste passende resultaat gebruiken",
      "Het wachtwoord opvragen uit de password-export van vorige maand om sneller te kunnen handelen",
    ],
    answer: 1,
  },
  {
    domain: "Kaseya Stack",
    type: "Samenhang stack",
    prompt:
      "Er komt een Datto RMM-alert binnen over hoge schijfvulling op een klantserver. Hoe laat je Autotask, IT Glue en de klantcommunicatie hier goed op aansluiten?",
    options: [
      "Eerst de schijf opschonen, daarna het alert sluiten en pas een ticket aanmaken als het probleem terugkomt",
      "Een Autotask-ticket aanmaken, de schijf opschonen en het ticket sluiten zodra de RMM-waarde weer onder de drempel zakt",
      "Impact bepalen, een Autotask-ticket aanmaken of bijwerken, klantspecifieke documentatie in IT Glue raadplegen, de oorzaak verhelpen en klant of collega informeren",
      "Het alert in Datto RMM op snooze zetten, de melding in IT Glue noteren en de schijf bij het eerstvolgende onderhoudsvenster opschonen",
    ],
    answer: 2,
  },
  {
    domain: "Kaseya Stack",
    type: "Samenhang stack",
    prompt:
      "Een geautomatiseerde patchronde via Datto RMM meldt dat updates op een aantal endpoints zijn mislukt. Wat is de meest gerichte vervolgstap?",
    options: [
      "Een nieuwe patch-policy aanmaken en die aan de getroffen endpoints toewijzen om de configuratie te verversen",
      "De patchresultaten per endpoint bekijken, de foutcodes analyseren en de updates op de mislukte toestellen gericht opnieuw uitrollen",
      "Een Autotask-ticket aanmaken en de eerstvolgende geplande patchronde afwachten of die het vanzelf oplost",
      "De Datto RMM-agent op de mislukte endpoints opnieuw installeren zodat de patchengine schoon herstart",
    ],
    answer: 1,
  },

  // ── Fortigate ────────────────────────────────────────────────────────────
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een medewerker meldt dat hij vanuit het buitenland geen verbinding kan maken met de SSL-VPN, terwijl andere gebruikers wel verbinden. De technicus ziet dat de portal- en tunnelconfiguratie ongewijzigd is. Wat is de meest logische eerste diagnosestap?",
    options: [
      "De SSL-VPN-poort wijzigen naar een andere TCP-poort omdat het buitenlandse netwerk de standaardpoort waarschijnlijk filtert",
      "In de SSL-VPN-instellingen het verkeer naar 'all' (full tunnel) zetten zodat al het verkeer via de Fortigate loopt",
      "De FortiClient-versie van de gebruiker downgraden naar dezelfde build die de werkende gebruikers draaien",
      "In de VPN-events en de geo-IP/local-in policy controleren of de inkomende login van dat land wordt geweigerd of geblokkeerd",
    ],
    answer: 3,
    source: "Thread",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een interne webserver achter de Fortigate moet vanaf internet bereikbaar zijn op poort 443. De technicus maakt een VIP (Virtual IP) aan met de juiste port-forward, maar verkeer komt niet aan. Wat is de meest waarschijnlijke oorzaak?",
    options: [
      "Er is geen firewall-policy van wan naar de interne interface die de VIP als destination-address gebruikt",
      "De VIP moet een statische route naar het interne subnet bevatten, anders weet de Fortigate de server niet te bereiken",
      "Central NAT staat uit, waardoor de Fortigate de VIP niet kan vertalen naar het interne adres",
      "Het interne adres van de VIP moet in dezelfde subnet vallen als het externe WAN-adres",
    ],
    answer: 0,
    source: "Thread",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een IPsec site-to-site VPN tussen twee vestigingen blijft hangen in fase 1: de tunnel komt niet 'up'. De WAN-verbinding aan beide kanten werkt en de peers kunnen elkaar pingen. Wat is de meest waarschijnlijke oorzaak?",
    options: [
      "De interessante-verkeer (phase 2) selectors aan beide kanten overlappen niet correct",
      "De pre-shared key of het IKE-versie/encryptievoorstel komt niet overeen tussen de twee peers",
      "Er ontbreekt een statische route naar het remote subnet aan de hoofdlocatie",
      "De firewall-policy die het VPN-verkeer toestaat is aan een van de zijden uitgeschakeld",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een gebruiker klaagt dat een specifieke SaaS-applicatie traag is, terwijl algemeen internet snel werkt. Op de Fortigate vermoedt de technicus dat een security-profiel het verkeer afremt. Hoe stelt hij dit het gerichtst vast?",
    options: [
      "Tijdelijk alle UTM-profielen op de uitgaande policy verwijderen en kijken of het probleem verdwijnt",
      "De bandbreedte van de WAN-interface verhogen via traffic shaping zodat de applicatie meer prioriteit krijgt",
      "In de forward traffic logs filteren op de bestemming en bekijken welk policy- en security-profiel de sessies afhandelt en of er sessies worden geblokkeerd of geïnspecteerd",
      "Een aparte firewall-policy bovenaan plaatsen die het verkeer naar de applicatie volledig vrijstelt van inspectie",
    ],
    answer: 2,
    source: "Thread",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Na een Fortigate-firmware-update meldt een klant dat de memory-usage structureel hoog blijft en de firewall in conserve mode gaat. Op de vorige firmware deed dit zich niet voor. Wat is de juiste aanpak?",
    options: [
      "De sessie-timeout verlagen zodat sessies sneller opruimen en het geheugen vanzelf daalt",
      "De conserve-mode-drempels (memory thresholds) verhogen zodat de firewall niet meer in conserve mode schiet",
      "Het geheugengebruik per proces (diagnose) analyseren, de release notes/known issues van de nieuwe firmware checken en zo nodig terugrollen naar de vorige stabiele versie",
      "Het aantal gelijktijdige verbindingen beperken met een DoS-policy om de geheugendruk te verlichten",
    ],
    answer: 2,
    source: "Thread",
  },

  // ── AI / Copilot ─────────────────────────────────────────────────────────
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Je wilt een AI-assistent gebruiken om sneller een lastig PowerShell-probleem in een klantomgeving op te lossen. Wat is de veiligste werkwijze?",
    options: [
      "Het probleem geanonimiseerd beschrijven zonder klant-PII of secrets, en de voorgestelde code zelf reviewen en in een testomgeving valideren voor productie",
      "Een gerichte foutmelding delen en de code direct draaien, want zonder de echte tenant-context kan de AI geen werkbare oplossing geven",
      "Een betaald AI-abonnement gebruiken zodat je invoer niet voor training wordt gebruikt en de gegenereerde code daarna ongewijzigd toepassen",
      "Eerst zelf een oplossing bedenken en de AI alleen je eigen code laten herschrijven, zodat er nooit klantgegevens in het gesprek komen",
    ],
    answer: 0,
  },
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Een klant wil Microsoft 365 Copilot uitrollen voor alle medewerkers. Wat is een essentiële voorbereiding die je adviseert vóór de uitrol?",
    options: [
      "Sensitivity-labels en DLP-beleid inrichten, want Copilot mag alleen gelabelde documenten verwerken en valt zonder labels terug op handmatige selectie",
      "Per gebruiker bepalen welke SharePoint-sites in de Copilot-index mogen, want Copilot indexeert standaard niets tot je sites expliciet toevoegt",
      "De SharePoint- en OneDrive-rechten en oversharing opschonen, want Copilot toont een gebruiker alles waar diens account al toegang toe heeft",
      "Eerst een pilotgroep aanwijzen en de licenties pas breed uitrollen na positieve feedback over de antwoordkwaliteit",
    ],
    answer: 2,
  },
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Een collega gebruikt een publieke AI-chatbot om een klantcontract samen te vatten en plakt de volledige tekst inclusief namen erin. Wat is de juiste reactie?",
    options: [
      "Vragen of de chatgeschiedenis is uitgezet, want zonder bewaarde historie blijven de contractgegevens binnen de sessie en is het risico beheerst",
      "Uitleggen dat vertrouwelijke klantgegevens niet in een publieke AI-tool horen en wijzen op een goedgekeurde, afgeschermde tool met databorging",
      "Adviseren alleen de gevoelige namen te verwijderen, zodat de samenvatting van de overige contracttekst wel via de publieke tool mag",
      "De samenvatting laten staan maar de collega vragen het achteraf te melden bij de privacyverantwoordelijke als datalek-registratie",
    ],
    answer: 1,
  },
  {
    domain: "AI / Copilot",
    type: "Praktijk",
    prompt:
      "Je laat een AI-tool een conceptantwoord op een complexe klantvraag schrijven. Hoe ga je verantwoord met het resultaat om voordat je het verstuurt?",
    options: [
      "Het concept aan een collega ter review geven, want een tweede paar ogen weegt zwaarder dan je eigen controle op AI-output",
      "In het antwoord vermelden dat het door AI is opgesteld, zodat de klant de inhoud zelf op juistheid kan beoordelen",
      "Het concept terugleggen bij de AI met de vraag of alles klopt, en bij een bevestiging het antwoord versturen",
      "De inhoud zelf controleren op feitelijke juistheid en toon, aanpassen waar nodig en pas dan versturen onder je eigen verantwoordelijkheid",
    ],
    answer: 3,
  },
  {
    domain: "AI / Copilot",
    type: "Praktijk",
    prompt:
      "Wanneer is het inzetten van een GenAI-assistent in de eigen tooling (zoals AI-zoeken in IT Glue) het meest waardevol voor een servicedesk?",
    options: [
      "Om sneller de juiste documentatie, runbooks of eerdere oplossingen terug te vinden, terwijl de engineer het resultaat verifieert",
      "Om herhaalvragen van klanten volledig zelfstandig af te handelen, zodat engineers zich op complexe tickets kunnen richten",
      "Om op basis van eerdere tickets automatisch de waarschijnlijke oorzaak te kiezen en die als oplossing in het ticket vast te leggen",
      "Om ontbrekende documentatie aan te vullen door de AI op basis van algemene kennis nieuwe runbooks te laten genereren",
    ],
    answer: 0,
  },

  // ── VoIP ─────────────────────────────────────────────────────────────────
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Bellers naar de hoofdlijn horen buiten kantooruren een foutmelding ('Deze actie kan niet worden voltooid') in plaats van de avondvoicemail. Overdag werkt alles normaal. Wat onderzoekt de technicus als eerste?",
    options: [
      "De SIP-trunk-registratie, omdat inkomende gesprekken anders helemaal niet binnenkomen",
      "Het tijdschema, of de avond-actie verwijst naar een bestemming (voicemailbox of melding) die niet meer bestaat of leeg is",
      "De codec-instelling op de trunk, omdat een mismatch buiten kantooruren audiofouten geeft",
      "De internetbandbreedte 's avonds, omdat te weinig capaciteit de routering laat afbreken",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Oproepen die via het keuzemenu direct bij belgroep 3 binnenkomen, worden bij geen gehoor niet doorgeschakeld naar belgroep 1, terwijl dat wel de bedoeling is. Wat is de juiste oplossing?",
    options: [
      "Op belgroep 3 een overloopbestemming instellen die na het aantal rinkelseconden doorschakelt naar belgroep 1",
      "Het keuzemenu zo wijzigen dat optie 3 meteen naar belgroep 1 verwijst in plaats van naar belgroep 3",
      "De rinkeltijd van belgroep 3 verhogen zodat agents meer tijd krijgen om op te nemen",
      "Belgroep 1 toevoegen als extra lid binnen belgroep 3 zodat beide groepen samen rinkelen",
    ],
    answer: 0,
    source: "Thread",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Een nieuw thuiswerkende medewerker hoort de beller wel, maar de beller hoort hem niet (eenrichtingsaudio). Registratie en bellen zelf werken gewoon. Wat is de meest waarschijnlijke oorzaak?",
    options: [
      "De SIP-registratie verloopt te snel waardoor de spraakkanalen halverwege wegvallen",
      "Een verkeerde audiocodec op het toestel waardoor één richting niet wordt gedecodeerd",
      "De router/NAT laat de uitgaande RTP-stroom niet correct terug naar de provider doorkomen",
      "De jitterbuffer op het toestel staat te laag waardoor uitgaande pakketten worden verworpen",
    ],
    answer: 2,
    source: "Thread",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Gebruikers melden dat de spraakkwaliteit hapert (hakkelend, woorden vallen weg) zodra er tegelijk grote bestanden via hetzelfde netwerk worden verstuurd. De internetlijn heeft op papier ruim voldoende bandbreedte. Wat is de meest effectieve maatregel?",
    options: [
      "Overstappen op een codec met hogere bitrate zodat de spraak robuuster wordt",
      "De jitterbuffer op alle toestellen maximaal instellen om pakketvariatie op te vangen",
      "Een tweede SIP-trunk bijplaatsen zodat de gesprekken over meer kanalen verdeeld worden",
      "QoS instellen zodat spraakverkeer (RTP) voorrang krijgt boven het overige dataverkeer",
    ],
    answer: 3,
    source: "Thread",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Een klant vraagt om de voicemail eenmalig twee uur eerder te activeren vanwege een vroege sluiting. Wat is de professionele werkwijze?",
    options: [
      "Het tijdschema voor die ene dag een uitzondering geven die de avond-actie eerder activeert, en de klant bevestigen dat het actief is",
      "De standaard avondovergang permanent twee uur vervroegen zodat het verzoek niet meer terugkomt",
      "Een tijdelijke nachtstand handmatig forceren en die de volgende ochtend weer uitzetten",
      "De klant het toestel laten gebruiken om handmatig 'niet storen' in te schakelen op het sluitmoment",
    ],
    answer: 0,
    source: "Thread",
  },

  // ── Servers ──────────────────────────────────────────────────────────────
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een RDS-server reageert traag voor alle gebruikers. Het totale CPU-gebruik schommelt rond 90%, maar in Taakbeheer staat geen enkel proces structureel bovenaan. Wat geeft het snelst inzicht in de werkelijke oorzaak?",
    options: [
      "In Performance Monitor de processor-, schijf- en wachtrij-counters over tijd verzamelen om te zien welke resource verzadigd is en welke sessies de last veroorzaken",
      "De RDS-sessiehost-rol opnieuw configureren zodat sessies eerlijker over de processors worden verdeeld",
      "Het maximale aantal gelijktijdige sessies in de collectie verlagen zodat de gemiddelde belasting per gebruiker daalt",
      "Het paginabestand vergroten zodat de server onder piekbelasting meer geheugen kan adresseren",
    ],
    answer: 0,
    source: "Thread",
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een monitoring-alert meldt een onverwachte server-shutdown op een productieserver. De server is inmiddels weer online en lijkt normaal te functioneren. Wat is de juiste vervolgactie?",
    options: [
      "In Event Viewer alleen Event ID 6005/6006 controleren om vast te stellen dat de service netjes is gestart en gestopt",
      "Een geheugendiagnose plannen, want een onverwachte shutdown wijst vrijwel altijd op falend RAM",
      "De System- en Application-logs én eventuele minidumps rond het tijdstip analyseren om de oorzaak te bepalen en herhaling te voorkomen",
      "De laatste geïnstalleerde updates terugdraaien omdat die de meest waarschijnlijke trigger van de crash zijn",
    ],
    answer: 2,
    source: "Thread",
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een fileserver-volume nadert 95% schijfgebruik en de back-ups beginnen te falen. De klant kan niet meteen extra opslag aanschaffen. Wat is de meest verantwoorde eerste aanpak?",
    options: [
      "Schaduwkopieën (VSS) uitschakelen op het volume, want die nemen onnodig veel ruimte in beslag",
      "Met een rapportage de grootste verbruikers in kaart brengen, tijdelijke en logbestanden veilig opschonen en de groei plus een opschalings- of opschoningsvoorstel met de klant afstemmen",
      "Datadeduplicatie inschakelen op het volume zodat de bestaande bestanden direct minder ruimte innemen",
      "De oudste gebruikersmappen verplaatsen naar een tweede volume om de vrije ruimte snel te herstellen",
    ],
    answer: 1,
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Domeingebruikers melden dat ze sinds vanmorgen niet meer kunnen inloggen op een nieuw aangesloten lid-server, terwijl bestaande servers wél werken. Wat onderzoek je als eerste?",
    options: [
      "Of het computeraccount nog vertrouwen heeft in het domein, door de secure channel te testen en zo nodig het account te resetten of de server opnieuw aan te sluiten",
      "Of de wachtwoorden van de getroffen gebruikers zijn verlopen, door hun accounts in Active Directory Users and Computers te controleren",
      "Of er voldoende client-toegangslicenties vrij zijn, omdat een tekort nieuwe aanmeldingen kan blokkeren",
      "Of de tijd op de server klopt, want een afwijking van meer dan vijf minuten met de domeincontroller verhindert Kerberos-authenticatie",
    ],
    answer: 0,
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Clients in één subnet krijgen geen IP-adres meer van de DHCP-server, terwijl een ander subnet probleemloos werkt. De DHCP-service draait en is geautoriseerd in Active Directory. Wat is de meest gerichte controle?",
    options: [
      "De DHCP-service herstarten zodat de lease-database opnieuw wordt ingelezen en vastgelopen leases vrijkomen",
      "Controleren of de clients het juiste VLAN gebruiken, omdat een verkeerde VLAN-toewijzing aanvragen bij de verkeerde scope laat uitkomen",
      "De scope voor het getroffen subnet controleren op uitputting en op de DHCP-relay (IP-helper) van dat subnet, omdat aanvragen anders de server niet bereiken",
      "Een reservering aanmaken voor de getroffen clients zodat ze gegarandeerd een geldig adres uit de scope ontvangen",
    ],
    answer: 2,
  },

  // ── SharePoint / Teams ───────────────────────────────────────────────────
  {
    domain: "SharePoint / Teams",
    type: "Governance",
    prompt:
      "Een Teams-omgeving heeft veel gastgebruikers en niemand weet wie eigenaar is. Wat toets je eerst?",
    options: [
      "De inactieve gastaccounts opsporen via Access Reviews en die als eerste laten herbevestigen",
      "De tenant-brede external sharing-instellingen vergelijken met het gewenste governancebeleid",
      "Per team het huidige eigenaarschap, de gasttoegang en de sharinginstellingen in kaart brengen",
      "Een conditional-accessbeleid op gastaccounts richten zodat toegang afgeschermd is",
    ],
    answer: 2,
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een gebruiker heeft per ongeluk een hele documentbibliotheek met een 'iedereen'-link extern gedeeld. Wat is de juiste combinatie van acties?",
    options: [
      "De gedeelde link intrekken, in de auditlog nagaan of er externe toegang is geweest en het sharingbeleid en de gebruiker bijsturen",
      "De link intrekken en de bibliotheek-rechten resetten zodat alleen leden van de site weer toegang hebben",
      "Anonieme links tenant-breed uitzetten en de betrokken bibliotheek tijdelijk read-only zetten",
      "De link laten verlopen via een vervaldatum en daarna de externe toegang in de site-instellingen controleren",
    ],
    answer: 0,
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een afdeling vraagt om een nieuwe Teams-omgeving voor een tijdelijk project met externe partners. Hoe richt je dit het beste in?",
    options: [
      "Een privékanaal in een bestaand team maken met de partners als gast en het kanaal na afloop verwijderen",
      "Een nieuw team met benoemde eigenaren, gerichte gasttoegang, een sensitivity label en een afgesproken einddatum/lifecycle",
      "Een nieuw team met open gasttoegang opzetten en de externe partners zelf laten bepalen wie ze toevoegen",
      "Een gedeeld kanaal (shared channel) in een bestaand team koppelen aan de tenant van de partners",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Gebruikers klagen dat ze in Teams telkens de verkeerde of verouderde versie van een document openen. Wat is de beste structurele oplossing?",
    options: [
      "Versiegeschiedenis aanzetten en gebruikers leren via 'Versiegeschiedenis' de juiste versie terug te zetten",
      "Het document inchecken/uitchecken verplichten zodat maar één persoon tegelijk kan bewerken",
      "Per onderwerp een SharePoint-map met een vaste eigenaar instellen die wijzigingen samenvoegt",
      "Bestanden in het juiste SharePoint-gekoppelde kanaal centraal bewaren, co-authoring en versiebeheer benutten en losse kopieën opruimen",
    ],
    answer: 3,
  },
  {
    domain: "SharePoint / Teams",
    type: "Kennisdiepte",
    prompt:
      "Een afdeling wil dat documenten in een Teams-kanaal alleen voor het team zichtbaar zijn, maar collega's blijken de bestanden via de zoekfunctie te kunnen openen. Hoe pak je dit het beste aan?",
    options: [
      "Een sensitivity label met versleuteling op de bestanden zetten zodat alleen teamleden ze kunnen openen",
      "De rechten op de onderliggende SharePoint-site corrigeren en zo nodig een privé- of gedeeld kanaal met eigen rechtenscope inzetten",
      "De overerving op de documentbibliotheek breken en alleen de teamleden expliciet toegang geven",
      "De map uitsluiten van zoekresultaten via 'Geen zoekfunctie' in de site-instellingen",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Teams",
    type: "Governance",
    prompt:
      "Verlaten teams stapelen zich op: projecten zijn afgerond maar de teams, sites en bestanden blijven bestaan. Wat is de beste structurele aanpak?",
    options: [
      "Een retentielabelbeleid op alle teamsites toepassen zodat inhoud automatisch na een termijn wordt verwijderd",
      "Inactieve teams periodiek opsporen en de eigenaren handmatig vragen of het team gearchiveerd of verwijderd mag worden",
      "Een verloop-/lifecyclebeleid instellen dat eigenaren bij inactiviteit om herbevestiging vraagt en teams zonder reactie archiveert of opruimt",
      "Een naamgevingsbeleid met einddatum afdwingen zodat verlopen teams herkenbaar zijn en handmatig kunnen worden opgeschoond",
    ],
    answer: 2,
  },

  // ── SharePoint / Azure Migrations ────────────────────────────────────────
  {
    domain: "SharePoint / Azure Migrations",
    type: "Project",
    prompt:
      "Een klant wil een fileserver-naar-SharePoint-migratie met minimale downtime. Wat is de eerste stap die het projectrisico het meest beperkt?",
    options: [
      "Een pre-migratie discovery draaien op datavolume, lange paden, machtigingen en actieve bestanden om scope en risico's vast te leggen",
      "Direct een pilot met één afdeling starten om snel werkende ervaring met de tooling op te doen",
      "Het migratievenster en de delta-sync-momenten inplannen op basis van de verwachte hoeveelheid data",
      "De doel-tenant inrichten met sites, hubs en bibliotheken zodat de bestemming klaarstaat",
    ],
    answer: 0,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Tijdens een fileserver-naar-SharePoint-migratie ontdek je diepe mappenstructuren met paden die de URL-lengtelimiet overschrijden. Wat is de juiste aanpak?",
    options: [
      "De diepe mappen migreren naar aparte documentbibliotheken zodat elke bibliotheek z'n eigen padlengte krijgt",
      "Tijdens de migratie de mapnesting behouden en achteraf de te lange paden in SharePoint inkorten",
      "De structuur vooraf herontwerpen naar een vlakkere hiërarchie met metadata en dit in de pilot valideren voor de volledige migratie",
      "De migratietool de lange paden automatisch laten afkappen en doorgaan met de overige bestanden",
    ],
    answer: 2,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Na een tenant-to-tenant-migratie melden gebruikers dat sommige gedeelde bestanden en machtigingen ontbreken. Wat is de juiste eerste stap?",
    options: [
      "De getroffen gebruikers tijdelijk full control geven op de site zodat ze direct verder kunnen werken",
      "De migratie-rapportage en het rechtenmapping-overzicht raadplegen om te bepalen welke permissies niet zijn overgekomen en gericht herstellen",
      "Een nieuwe delta-sync vanaf de bron draaien zodat de ontbrekende bestanden en rechten opnieuw worden overgezet",
      "De brongroepen opnieuw koppelen in de doel-tenant en de permissies handmatig per bibliotheek herinrichten",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Je plant de cutover van een grote migratie. Hoe beperk je downtime en risico tijdens de overgang het beste?",
    options: [
      "Het migratievenster ruim plannen en pas tijdens de cutover de volledige dataset in één keer overzetten",
      "Vooraf één volledige kopie maken en de bron read-only zetten tot de gebruikers op de doelomgeving zijn",
      "Tijdens kantooruren cutoveren zodat je bij problemen direct gebruikers kunt ondersteunen",
      "Vooraf het grootste deel kopiëren, vlak voor cutover een delta-sync draaien, in een rustig venster overzetten en een rollback- en communicatieplan klaarhebben",
    ],
    answer: 3,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Migratiekennis",
    prompt:
      "Halverwege een fileserver-naar-SharePoint-migratie meldt de klant dat een afdeling toch al volgende week live moet. Je discovery en rechtenanalyse zijn klaar, maar de pilot loopt nog. Wat is de meest verantwoorde keuze?",
    options: [
      "De resterende fasen versnellen zodat de hele migratie samenvalt met de deadline van die afdeling",
      "De betreffende afdeling als afgebakende eerste fase migreren met een delta-sync en rollback, en de rest volgens planning houden",
      "De lopende pilot ombouwen tot productie voor die afdeling zodat de testresultaten meteen meetellen",
      "De afdeling alvast read-only toegang tot de doelomgeving geven en de definitieve migratie na de pilot doen",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Tijdens een grote migratie naar SharePoint Online lopen overdrachten vast met throttling-meldingen (HTTP 429). Wat is de juiste aanpak?",
    options: [
      "De migratie over meer parallelle threads verdelen zodat elke afzonderlijke stroom minder verkeer genereert",
      "Overstappen op handmatige uploads via de browser om de API-limieten te omzeilen",
      "De Retry-After-header respecteren, throughput terugschalen en zwaar verkeer naar daluren verplaatsen",
      "Een hogere servicelaag of extra licenties aanvragen om de tenant-limieten te verhogen",
    ],
    answer: 2,
  },

  // ── Inforcer ─────────────────────────────────────────────────────────────
  {
    domain: "Inforcer",
    type: "Configuratie",
    prompt:
      "Je past een Inforcer-baseline toe op een Microsoft 365-omgeving. Wat moet vóór deployment geborgd zijn?",
    options: [
      "De vastgelegde uitzonderingen, de doel-rollout-ring en een goedgekeurde baselineversie met rollback-pad",
      "Een vergelijking met de Microsoft Secure Score zodat je de winst achteraf kunt aantonen",
      "Een onderhoudsvenster buiten kantooruren zodat eindgebruikers geen onderbreking merken",
      "Een verse tenant-back-up zodat je de configuratie na de uitrol volledig kunt terugzetten",
    ],
    answer: 0,
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Je wilt via Inforcer een Conditional Access-baseline naar meerdere klant-tenants uitrollen. Hoe beperk je het risico van een verkeerde uitrol?",
    options: [
      "Per tenant de baseline handmatig narekenen en pas daarna in alle tenants tegelijk activeren",
      "Eerst report-only inschakelen in alle tenants en na een week ongezien naar enforce overzetten",
      "Eerst in een pilot-ring uitrollen, controleren of break-glass accounts uitgesloten zijn en daarna gefaseerd opschalen",
      "Per tenant een aparte afwijkende baseline maken zodat elke klant zijn eigen versie houdt",
    ],
    answer: 2,
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Bij een klant blijkt de live M365-configuratie afgeweken van de goedgekeurde Inforcer-baseline (configuration drift). Wat is de juiste reactie?",
    options: [
      "De baseline updaten naar de live configuratie zodat de drift-melding verdwijnt",
      "De afwijkingen beoordelen op bewuste uitzondering of ongewenste wijziging en de tenant gecontroleerd terugbrengen",
      "De volledige baseline opnieuw forceren zodat de tenant zeker weer compliant is",
      "Alleen de afwijkende instellingen als nieuwe uitzondering vastleggen en verder ongemoeid laten",
    ],
    answer: 1,
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Een klant vraagt om één specifieke beleidsregel uit de standaard-baseline uit te zetten omdat die hun workflow hindert. Hoe ga je hiermee om?",
    options: [
      "De regel direct uitzetten en de wijziging achteraf in het auditlog terugvinden",
      "De klant doorverwijzen naar een eigen losstaande policy buiten de baseline om",
      "De baseline voor die klant naar een lagere strengheidstier zetten zodat de regel vervalt",
      "Het risico bespreken, een gerichte uitzondering met goedkeuring documenteren en de rest van de baseline intact laten",
    ],
    answer: 3,
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Je onboardt een nieuwe klant en wilt hun beveiligingsniveau snel inzichtelijk maken met Inforcer. Wat is de meest zinvolle eerste stap?",
    options: [
      "De huidige configuratie inlezen, tegen de baseline afzetten om de gaps te zien en een gefaseerd remediation-plan opstellen",
      "De strengste baseline in report-only zetten en de meldingen als nulmeting gebruiken",
      "Een interview met de klant doen en het beveiligingsniveau op basis daarvan inschatten",
      "De baseline meteen toepassen zodat de tenant vanaf dag één compliant is",
    ],
    answer: 0,
  },

  // ── Basic IT & Troubleshooting ───────────────────────────────────────────
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een gebruiker meldt dat Outlook niet meer synchroniseert, terwijl OWA (webmail) wél correct werkt. Een nieuw Outlook-profiel aanmaken gaf een authenticatiefout. Wat is de meest gerichte vervolgstap?",
    options: [
      "De cached OST-bestanden verwijderen zodat Outlook de mailbox volledig opnieuw downloadt",
      "De opgeslagen credentials in Windows Referentiebeheer opschonen en opnieuw aanmelden om de authenticatiefout te isoleren",
      "Modern Authentication tenant-breed forceren via de M365-tenantinstellingen",
      "Outlook in safe mode starten met add-ins uitgeschakeld om een conflict uit te sluiten",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een laptop verlaat automatisch de slaapstand, ook in een tas, en dit speelt al langer op Windows 11. Wat is de meest gerichte diagnosestap?",
    options: [
      "In Event Viewer onder Power-Troubleshooter nakijken welke bron de laatste wake-events veroorzaakte",
      "In Apparaatbeheer per netwerkadapter en muis de optie 'mag dit apparaat de computer uit slaapstand halen' uitvinken",
      "Met powercfg de actieve wake-timers en wake-armed devices opvragen en de veroorzaker gericht uitschakelen",
      "Het energieschema terugzetten naar standaard om afwijkende slaapinstellingen uit te sluiten",
    ],
    answer: 2,
    source: "Thread",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een gebruiker meldt grafische artefacten in een technische applicatie kort na een recente Windows-update; andere apps werken normaal. Wat is de juiste aanpak?",
    options: [
      "De grafische driver bijwerken en in de GPU-instellingen de juiste GPU (dedicated vs. geïntegreerd) aan de applicatie koppelen",
      "De applicatierenderingsmodus van GPU naar software wisselen om een driverconflict te bevestigen",
      "Het updatelogboek raadplegen en bepalen of de update een driver heeft overschreven",
      "De vorige grafische driver via Apparaatbeheer terugrollen om de update als oorzaak te toetsen",
    ],
    answer: 0,
    source: "Thread",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Security scenario",
    prompt:
      "Een tenant heeft legacy auth, zwakke adminhygiëne en brede SharePoint-sharing. Hoe prioriteer je het herstel?",
    options: [
      "Eerst de brede SharePoint-sharing afschermen omdat zichtbare datalekken de hoogste impact hebben",
      "Eerst MFA tenant-breed afdwingen omdat dat de meeste identity-risico's tegelijk dekt",
      "Het attack path bepalen, identity-risico's sluiten, datadeling beperken en changes met rollback en communicatie plannen",
      "Eerst legacy auth blokkeren omdat dat de meest gebruikte aanvalsroute dichtzet",
    ],
    answer: 2,
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Methodiek",
    prompt:
      "Een gebruiker meldt vaag 'het internet doet het niet', terwijl collega's geen problemen hebben. Wat is de meest gestructureerde eerste stap?",
    options: [
      "Op het toestel pingen naar gateway en publiek IP om lokaal van netwerk te scheiden",
      "Bij de provider en monitoring nagaan of er een bekende storing op de lijn is",
      "De bekabeling en switchpoort van het toestel controleren als eerste fysieke laag",
      "De scope afbakenen: nagaan of het één apparaat, één applicatie of de hele verbinding betreft en stap voor stap van lokaal naar netwerk uitsluiten",
    ],
    answer: 3,
  },

  // ── Werkhouding & Communicatie ───────────────────────────────────────────
  // Bewust subtiele SJT: alle vier de opties zijn op zich verdedigbaar; de beste
  // wint op professioneel oordeel (volgorde, afstemming, balans), niet doordat de
  // andere overduidelijk fout zijn.
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Een collega heeft een ticket onvolledig overgedragen; de klant wacht inmiddels op een oplossing. Wat is de beste aanpak?",
    options: [
      "Eerst de klant verder helpen, daarna de collega rechtstreeks aanspreken op de overdracht en samen een checklist afspreken om het te voorkomen",
      "Het ticket zelf afronden met uitgebreide aantekeningen, maar de overdracht verder laten rusten omdat het nu toch is opgelost",
      "Eerst je teamlead op de hoogte brengen van de gebrekkige overdracht zodat het gedocumenteerd is, en dan pas verder gaan",
      "De collega vragen de overdracht eerst alsnog correct te doen, zodat het proces netjes gevolgd wordt voordat jij verdergaat",
    ],
    answer: 0,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Je planning loopt vol en een klantissue dreigt zijn afgesproken deadline te missen. Wat is de beste aanpak?",
    options: [
      "Zelf een tandje bijzetten en proberen alles toch af te krijgen voordat je er iemand mee lastigvalt",
      "Het deadline-kritische issue oppakken en de minder urgente tickets stil laten uitlopen",
      "Op impact herprioriteren, het risico tijdig bij je teamlead en de klant melden en de afspraken bijstellen",
      "Het issue doorzetten naar een collega met ruimte, zodat jij op je eigen planning kunt blijven",
    ],
    answer: 2,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Je merkt dat een wijziging van jou een korte storing bij een klant heeft veroorzaakt. De storing is alweer voorbij en niemand lijkt het gemerkt te hebben. Wat is de beste aanpak?",
    options: [
      "De technische fix netjes in het ticket vastleggen en verdergaan, omdat de storing inmiddels is opgelost",
      "Het kort met een collega bespreken voor advies voordat je beslist of je het verder meldt",
      "Voor jezelf vastleggen wat er gebeurde, zodat je het kunt toelichten als iemand er ooit naar vraagt",
      "De oorzaak én je eigen aandeel transparant vastleggen, je teamlead proactief informeren en een maatregel tegen herhaling voorstellen",
    ],
    answer: 3,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Tijdens een geplande opdracht krijg je een dringend verzoek van een andere klant binnen. Wat is de beste aanpak?",
    options: [
      "De urgentie en impact inschatten en kort met je teamlead of de klant afstemmen welke taak voorgaat en wat ze kunnen verwachten",
      "Het dringende verzoek meteen oppakken omdat de klant wacht, en je geplande werk daarna inhalen",
      "Eerst je geplande opdracht afmaken en het nieuwe verzoek daarna oppakken",
      "Het verzoek doorgeven aan een collega zodat jij op je geplande werk kunt blijven",
    ],
    answer: 0,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Je werkt vanuit huis met een bedrijfslaptop die toegang heeft tot klantomgevingen. Welke werkwijze is het meest verantwoord?",
    options: [
      "Het toestel vergrendeld en gepatcht houden, alleen via de goedgekeurde/beveiligde verbinding werken en verlies of een vermoed incident direct melden",
      "Het toestel vergrendeld en gepatcht houden, en werkbestanden lokaal bewaren zodat je ook offline door kunt werken",
      "Klantcredentials in je eigen wachtwoordmanager zetten zodat ze sterk en uniek zijn",
      "Via je thuisnetwerk werken en grote updates buiten werktijd plannen zodat ze je werk niet onderbreken",
    ],
    answer: 0,
  },

  // ── Engels ───────────────────────────────────────────────────────────────
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "Fortinet security advisory: \"A heap-based buffer overflow in FortiOS SSL-VPN may allow a remote unauthenticated attacker to execute arbitrary code. Fortinet is aware of an instance where this was exploited in the wild. Upgrade to a fixed release. If you cannot upgrade immediately, disable SSL-VPN as a workaround.\" Which interpretation best matches the advisory?",
    options: [
      "A fixed release exists and the flaw is already being exploited, so patch now and disable SSL-VPN only if you cannot patch yet.",
      "The flaw needs valid credentials to exploit, so patching is advisable but not urgent for now.",
      "Disabling SSL-VPN removes the vulnerability for good, so upgrading the firmware afterwards is optional.",
      "Exploitation is still only theoretical, so scheduling the upgrade in the next maintenance window is sufficient.",
    ],
    answer: 0,
  },
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "Microsoft release note: \"Basic authentication for Exchange Online is deprecated and will be permanently disabled for all tenants. Connections still using Basic auth will fail after the cutoff date. Migrate affected clients and service accounts to Modern authentication (OAuth) before that date to avoid disruption.\" What does this notice ask you to do?",
    options: [
      "Re-enable Basic auth on the affected service accounts so they keep working past the cutoff date.",
      "Confirm your clients already use OAuth, since only unattended service accounts are affected by the change.",
      "Move both clients and service accounts to Modern authentication before the cutoff, or those connections will fail.",
      "Wait for the cutoff and migrate the connections that break afterwards, as the change is rolled out gradually.",
    ],
    answer: 2,
  },
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "A Windows backup job ends with this error: \"The operation failed because the volume shadow copy service (VSS) encountered an error. There is insufficient storage available to create either the shadow copy storage file or other shadow copy data.\" What does this message indicate?",
    options: [
      "The shadow copy was created but could not be copied to the backup destination over the network.",
      "VSS lacks enough free storage to create the shadow copy, which is why the backup failed.",
      "The VSS writer for a database is in an inconsistent state and must be reset before retrying.",
      "The shadow copy storage limit is set too high and should be reduced to let the job complete.",
    ],
    answer: 1,
  },
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "Datto KB troubleshooting note: \"If the agent shows as offline in the portal but the device is powered on, first verify outbound connectivity on TCP 443 to the cloud endpoints. Do not reinstall the agent until network connectivity has been confirmed, as a reinstall will not resolve a firewall or proxy issue.\" According to this note, what should you do first?",
    options: [
      "Reinstall the agent first, then check TCP 443 only if the reinstall does not bring it back online.",
      "Open TCP 443 inbound to the device, since the portal needs to reach the agent on that port.",
      "Restart the agent service locally, because an offline status usually clears after a service restart.",
      "Verify outbound connectivity on TCP 443 to the cloud endpoints before considering a reinstall.",
    ],
    answer: 3,
  },
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "Azure change notification: \"Starting next month, the TLS 1.0 and 1.1 protocols will no longer be supported for connections to this service. Clients that have not been updated to use TLS 1.2 or higher will be unable to connect. Review your applications and update any that still negotiate older TLS versions.\" What is the correct understanding of this change?",
    options: [
      "Clients still negotiating TLS 1.0 or 1.1 will be unable to connect, so update them to TLS 1.2 or higher beforehand.",
      "The service will keep accepting TLS 1.0 and 1.1 but warn you, giving extra time to update older clients.",
      "Only clients running TLS 1.2 are affected, because that version is the one being phased out next month.",
      "Updating the service endpoint to TLS 1.2 is enough; the protocol each client negotiates does not matter.",
    ],
    answer: 0,
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
