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
      "Na een wijziging in het Conditional Access-beleid kan een gebruiker wel inloggen in Outlook Web, maar niet in de Outlook desktop client. Wat onderzoek je als eerste?",
    options: [
      "Je maakt een nieuw Outlook-profiel aan en laat de OST-cache opnieuw opbouwen voor deze gebruiker.",
      "Je bekijkt de Entra sign-in logs van de gebruiker en kijkt welke CA-policy en grant control de desktopsessie blokkeert.",
      "Je schakelt de betreffende CA-policy tijdelijk uit om te bevestigen dat die de oorzaak is.",
      "Je controleert of de Exchange Online mailboxlicentie van de gebruiker nog geldig is.",
    ],
    answer: 1,
    uitleg:
      "OWA werkt en desktop niet wijst op een client/grant-control die alleen op de richclient faalt. De sign-in logs tonen exact welke policy en control (bv. compliant device) struikelt. A lost geen CA-blokkade op, C is een ongecontroleerde ingreep in productie, D verklaart niet waarom OWA wel werkt.",
  },
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Je wilt legacy authentication tenant-breed blokkeren. Er draaien nog enkele SMTP-relays (scanner-to-mail) op SMTP AUTH. Wat is de juiste aanpak?",
    options: [
      "Je dwingt de CA-policy 'block legacy authentication' direct tenant-breed af; de scanners migreren daarna vanzelf naar OAuth.",
      "Je laat SMTP AUTH org-breed aan staan en blokkeert alleen interactieve legacy auth via CA.",
      "Je filtert eerst de sign-in logs op legacy auth clients, zet SMTP AUTH org-breed uit en laat het alleen per mailbox aan voor de geïdentificeerde serviceaccounts, daarna blokkeer je legacy breed.",
      "Je gebruikt authentication policies om basic auth per protocol uit te zetten zonder eerst te inventariseren welke accounts ze gebruiken.",
    ],
    answer: 2,
    uitleg:
      "SMTP AUTH staat los van de CA legacy-block; je moet eerst weten wie het gebruikt voordat je breed blokkeert. A breekt de scanners, B laat een open relay-pad staan, D zet dingen uit zonder impactanalyse.",
  },
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Een vertrokken medewerker is verwijderd. Het team kan nu niet meer bij diens OneDrive-bestanden. Welke uitspraak klopt?",
    options: [
      "De bestanden zijn definitief weg zodra het account is verwijderd.",
      "De OneDrive-retentieperiode bepaalt het behoud; wijs een secundaire beheerder aan voor overdracht.",
      "Een retention label op de mailbox bepaalt of de OneDrive-data behouden blijft.",
      "Een litigation hold op het bronaccount houdt de OneDrive-bestanden automatisch toegankelijk voor de collega's van het team.",
    ],
    answer: 1,
    uitleg:
      "Na verwijdering blijft OneDrive bestaan gedurende de ingestelde retentieperiode; je wijst een andere gebruiker als beheerder toe om over te dragen. A is onjuist, C verwart mailbox-retentie met OneDrive, D verwart hold met toegangsoverdracht.",
  },
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "E-mails vanuit het domein van een klant belanden regelmatig in de spambox. SPF is correct, DKIM en DMARC ontbreken. Wat is de juiste volgorde van acties?",
    options: [
      "DMARC direct op p=reject zetten zodat spoofing onmogelijk wordt, daarna DKIM publiceren.",
      "SPF uitbreiden met extra includes; DKIM en DMARC zijn dan niet meer nodig.",
      "DKIM en DMARC tegelijk hard afdwingen en de rapportages pas achteraf bekijken.",
      "DKIM signeren en publiceren, vervolgens DMARC op p=none voor monitoring en daarna gefaseerd verscherpen naar quarantine/reject.",
    ],
    answer: 3,
    uitleg:
      "DKIM eerst, dan DMARC monitoren (p=none) voordat je verscherpt, anders blokkeer je mogelijk legitieme stromen. A en C verscherpen zonder monitoring, B negeert dat SPF alleen onvoldoende is voor deliverability.",
  },
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Een gebruiker dient een release-verzoek in voor een bericht in quarantaine dat jij in het Security Center ziet staan. Wat is de juiste werkwijze?",
    options: [
      "Je beoordeelt het bericht zelf op afzender, headers en payload en geeft alleen vrij als het aantoonbaar legitiem is, waarna je onderzoekt waarom het in quarantaine kwam.",
      "Je geeft het bericht direct vrij omdat de gebruiker erom vraagt en het zijn eigen mail betreft.",
      "Je zet de afzender meteen op de tenant-allowlist zodat dit niet meer gebeurt.",
      "Je laat de gebruiker bevestigen dat het veilig is en geeft op basis daarvan vrij.",
    ],
    answer: 0,
    uitleg:
      "Je verifieert zelf voordat je vrijgeeft en lost de oorzaak op. B en D leunen op de gebruiker als beveiligingsoordeel, C creëert een permanente bypass op basis van één geval.",
  },
  // ── Azure ────────────────────────────────────────────────────────────────
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Een externe auditor heeft tijdelijk leesrechten nodig op de Entra-omgeving van een klant voor een eenmalige security-audit. Welke aanpak past het beste bij least-privilege en governance?",
    options: [
      "Je geeft de auditor een Global Reader-rol via een permanent account zodat de audit niet vastloopt.",
      "Je nodigt de auditor als gast uit en kent via PIM een time-bound, eligible Global Reader-assignment toe met activatie en verloop.",
      "Je deelt tijdelijk de inloggegevens van een bestaand read-only serviceaccount.",
      "Je geeft de auditor Security Reader op subscription-niveau in Azure RBAC.",
    ],
    answer: 1,
    uitleg:
      "Gast + PIM eligible met verloop dekt least-privilege, auditbaarheid en automatische intrekking. A is permanent, C deelt credentials en breekt herleidbaarheid, D is de verkeerde scope (RBAC vs Entra directory-rollen).",
  },
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Microsoft faseert Azure Blueprints uit. Een klant gebruikt Blueprints actief voor resource-governance en deny-assignments. Wat is de meest passende migratiestrategie?",
    options: [
      "Je laat de bestaande Blueprints staan tot ze stoppen met werken en handelt dan reactief.",
      "Je migreert alles naar ARM/Bicep-templates en laat governance verder los.",
      "Je zet de blueprint-definities om naar Template Specs voor de deployments en naar Azure Policy voor de governance- en deny-laag.",
      "Je vervangt Blueprints door een handmatige naming- en tagging-conventie in documentatie.",
    ],
    answer: 2,
    uitleg:
      "Template Specs nemen de deployment over, Azure Policy de governance/deny. A is reactief, B verliest de deny-laag, D vervangt afdwinging door een document.",
  },
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Een klant heeft Reserved VM Instances voor een VM-serie. Aankoop en verlenging vervallen binnenkort en auto-renew staat aan. Wat gebeurt er financieel als de klant niets doet?",
    options: [
      "De reservering verlengt automatisch tegen het dan geldende tarief en de klant blijft korting houden, mogelijk tegen een gewijzigde prijs.",
      "De reservering stopt direct en de VM's worden uitgeschakeld.",
      "De klant krijgt het resterende bedrag automatisch terugbetaald.",
      "De VM's blijven draaien maar zonder enige korting, ongeacht de auto-renew-instelling.",
    ],
    answer: 0,
    uitleg:
      "Met auto-renew aan verlengt de RI automatisch tegen het op dat moment geldende tarief; de korting loopt door maar de prijs kan veranderen. B en D negeren auto-renew, C klopt niet voor verlenging.",
  },
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "De kosten op een subscription verdubbelen binnen een week zonder dat er nieuwe VM's zijn aangemaakt. Hoe achterhaal je gericht de bron?",
    options: [
      "Je opent een support-ticket bij Microsoft omdat de facturatie waarschijnlijk fout is.",
      "Je verlaagt alvast de VM-sizes om de kosten te drukken terwijl je verder kijkt.",
      "Je analyseert Cost Management met groepering op resource en service over de betreffende periode en zoomt in op de grootste stijger.",
      "Je controleert of er onlangs reserveringen zijn verlopen.",
    ],
    answer: 2,
    uitleg:
      "Cost Management met grouping op service/resource toont direct waar de stijging zit (vaak egress, storage transactions of een nieuwe dienst). A gokt op een fout, B grijpt in zonder diagnose, D is één hypothese maar geen gerichte analyse.",
  },
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Een klant twijfelt tussen Azure App Service en een zelfbeheerde VM voor een eenvoudige webworkload. Wat is het sterkste argument vóór App Service in een MSP-context?",
    options: [
      "App Service is altijd goedkoper dan een VM voor elke workload.",
      "App Service neemt OS-patching, runtime-onderhoud en platformbeveiliging weg, wat de beheerlast en het aanvalsoppervlak per klant verlaagt.",
      "App Service geeft volledige controle over het onderliggende besturingssysteem.",
      "App Service vereist geen enkele vorm van monitoring of governance.",
    ],
    answer: 1,
    uitleg:
      "Het managed platform haalt patch- en onderhoudslast weg, schaalbaar over veel tenants. A is niet altijd waar, C is juist een eigenschap van de VM, D is onjuist.",
  },
  // ── Kaseya Stack ─────────────────────────────────────────────────────────
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Een Datto-backup mislukt op meerdere servers al dagen met 'Backup failed because backup image files have not been decrypted'. Wat is de meest gerichte eerste actie?",
    options: [
      "Je herinstalleert de Datto-agent op alle betrokken servers.",
      "Je controleert of het encryptie-wachtwoord van het apparaat is ingevoerd/ontgrendeld na de laatste reboot van de appliance.",
      "Je maakt een nieuwe backup-job aan met andere retentie.",
      "Je vervangt de backup-appliance omdat de schijven waarschijnlijk corrupt zijn.",
    ],
    answer: 1,
    uitleg:
      "De melding gaat specifiek over niet-ontsleutelde images, wat optreedt als het encryptie-wachtwoord niet is ingevoerd na een herstart. A, C en D pakken niet de oorzaak en kosten onnodig tijd.",
  },
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Bij een onboarding-ticket staat in de PSA: 'Bekijk in IT Glue OOK de klantspecifieke onboarding-SOP'. Waarom is die verwijzing belangrijk?",
    options: [
      "Omdat de SOP de standaardprocedure volledig overbodig maakt.",
      "Omdat IT Glue de enige plek is waar het wachtwoord van de klant staat.",
      "Omdat de klantspecifieke SOP afwijkingen, uitzonderingen en afspraken bevat die de generieke onboarding niet dekt.",
      "Omdat het ticket anders niet gesloten kan worden in Autotask.",
    ],
    answer: 2,
    uitleg:
      "Een klant-SOP legt de afwijkingen op de standaard vast; die negeren leidt tot fouten. A is te absoluut, B en D zijn onjuiste aannames over de reden.",
  },
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "De Autotask SLA-klok blijft doorlopen terwijl een ticket op 'Waiting Customer' staat. Wat configureer je om dit structureel correct te meten?",
    options: [
      "Je sluit het ticket en heropent het wanneer de klant reageert.",
      "Je koppelt 'Waiting Customer' als status aan een SLA-pauze (excluded/stopped time) in de service level agreement-configuratie.",
      "Je verhoogt de SLA-tijd zodat de overschrijding niet meer optreedt.",
      "Je zet de prioriteit lager zodat de klok trager loopt.",
    ],
    answer: 1,
    uitleg:
      "De statussen waarop de SLA pauzeert moeten als excluded time zijn geconfigureerd. A vervuilt rapportage en historie, C en D verbergen het probleem zonder het te meten.",
  },
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Een alert meldt dat een medewerker een automatische e-mailforwarding-regel naar een extern adres heeft aangemaakt. Wat is de juiste eerste reactie?",
    options: [
      "Je negeert de melding als de medewerker bekend is, want forwarding is normaal gedrag.",
      "Je verwijdert de regel stilletjes en sluit de melding.",
      "Je mailt de medewerker met de vraag of hij de regel zelf heeft aangemaakt.",
      "Je behandelt het als mogelijk gecompromitteerd account: regel uitzetten, sign-ins en inboxregels controleren en de gebruiker langs een ander kanaal verifiëren.",
    ],
    answer: 3,
    uitleg:
      "Externe auto-forwarding is een klassiek BEC-signaal; je containt eerst en verifieert via een out-of-band kanaal. A is gevaarlijk, B verwijdert bewijs zonder onderzoek, C vertrouwt op het mogelijk gekaapte kanaal zelf.",
  },
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Een Datto RMM-alert meldt hoge schijfvulling op een klantserver. Hoe laat je Autotask, IT Glue en de klantcommunicatie hier goed op aansluiten?",
    options: [
      "Je ruimt direct tijdelijke bestanden op de server op en doet verder niets.",
      "Je laat de RMM-alert een Autotask-ticket aanmaken, controleert de server-SOP in IT Glue, voert de opschoning of uitbreiding uit en informeert de klant via het ticket.",
      "Je belt de klant en vraagt of het mag wachten tot de volgende onderhoudsronde.",
      "Je breidt direct de schijf uit zonder de oorzaak van de groei te onderzoeken.",
    ],
    answer: 1,
    uitleg:
      "De keten alert -> ticket -> SOP -> actie -> klantcommunicatie borgt traceerbaarheid en context. A en D slaan documentatie en oorzaakanalyse over, C stelt een dreigend backup-/uptime-risico onnodig uit.",
  },
  // ── Fortigate ────────────────────────────────────────────────────────────
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een medewerker kan vanuit het buitenland geen SSL-VPN opzetten, terwijl anderen wel verbinden. De portal- en tunnelconfiguratie is ongewijzigd. Wat is de meest logische eerste diagnosestap?",
    options: [
      "Je controleert of er een geo-IP-restrictie of een local-in policy verkeer vanuit dat land naar de SSL-VPN blokkeert.",
      "Je reset de SSL-VPN-instellingen volledig naar de standaardwaarden.",
      "Je verhoogt de timeout-waarde van de VPN-sessie.",
      "Je geeft de gebruiker een nieuw certificaat.",
    ],
    answer: 0,
    uitleg:
      "Anderen verbinden wel en config is gelijk, dus de variabele is de bronlocatie: geo-blocking of een local-in policy is de eerste verdachte. B is destructief, C en D verklaren niet waarom alleen deze locatie faalt.",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een interne webserver moet vanaf internet bereikbaar zijn op poort 443. De technicus maakt een VIP met juiste port-forward, maar verkeer komt niet aan. Wat is de meest waarschijnlijke oorzaak?",
    options: [
      "De VIP is op de verkeerde interface aangemaakt.",
      "Er ontbreekt een firewall-policy die de VIP als destination toestaat van WAN naar de interne server.",
      "De webserver gebruikt een zelfondertekend certificaat.",
      "De DNS-record van de webserver wijst naar een privé-adres.",
    ],
    answer: 1,
    uitleg:
      "Een VIP alleen doet niets zonder een policy die het verkeer toestaat met de VIP als destination. A kan, maar de klassieke vergeten stap is de policy; C raakt TLS niet de bereikbaarheid, D zou ook intern falen.",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een IPsec site-to-site VPN blijft hangen in fase 1. De WAN werkt aan beide kanten en de peers pingen elkaar. Wat is de meest waarschijnlijke oorzaak?",
    options: [
      "De routering naar het remote subnet ontbreekt.",
      "De firewall-policy voor het tunnelverkeer is niet aangemaakt.",
      "Mismatchende fase 1-parameters zoals pre-shared key, IKE-versie, encryptie of DH-group tussen de peers.",
      "De interne DNS-servers zijn niet bereikbaar via de tunnel.",
    ],
    answer: 2,
    uitleg:
      "Fase 1 die niet opkomt terwijl de peers elkaar bereiken duidt vrijwel altijd op een proposal-mismatch (PSK/IKE/DH). A, B en D worden pas relevant nadat de tunnel up is.",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een gebruiker klaagt dat één SaaS-applicatie traag is terwijl algemeen internet snel werkt. De technicus vermoedt een security-profiel. Hoe stelt hij dit het gerichtst vast?",
    options: [
      "Hij zet alle security-profielen tegelijk uit en kijkt of het beter wordt.",
      "Hij vervangt de internetlijn omdat de bandbreedte tekortschiet.",
      "Hij verhoogt de bandbreedtelimiet in de traffic shaper.",
      "Hij gebruikt flow-/diagnose-logs en de policy-hitcount om te zien welke policy en welk profiel (bv. SSL-inspectie of IPS) het verkeer van die app raakt.",
    ],
    answer: 3,
    uitleg:
      "Gericht diagnosticeren via logs en hitcount wijst de policy en het profiel aan. A is een grove ingreep zonder isolatie, B en C gokken op bandbreedte terwijl algemeen internet juist snel is.",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Na een firmware-update blijft de memory-usage structureel hoog en gaat de Fortigate in conserve mode. Op de vorige firmware deed dit zich niet voor. Wat is de juiste aanpak?",
    options: [
      "Je herstart de firewall dagelijks om het geheugen vrij te maken.",
      "Je vergelijkt de release notes en known issues, controleert welk proces het geheugen verbruikt en overweegt een gerichte patch of rollback naar de stabiele firmware.",
      "Je zet logging volledig uit om geheugen te besparen.",
      "Je verlaagt het aantal toegestane sessies in de policies.",
    ],
    answer: 1,
    uitleg:
      "Het probleem is firmware-gerelateerd, dus release notes, procesanalyse en eventueel patch/rollback zijn de juiste route. A is een symptoombestrijdende workaround, C verzwakt zicht, D pakt de oorzaak niet.",
  },
  // ── AI / Copilot ─────────────────────────────────────────────────────────
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Je wilt een AI-assistent gebruiken om sneller een lastig PowerShell-probleem in een klantomgeving op te lossen. Wat is de veiligste werkwijze?",
    options: [
      "Je plakt de volledige output inclusief tenant-ID's en gebruikersnamen om de beste hulp te krijgen.",
      "Je laat de AI direct in productie draaien zodat je snel klaar bent.",
      "Je beschrijft het probleem geanonimiseerd, controleert het voorgestelde script regel voor regel en test het eerst in een veilige/te overziene context voordat je het in productie draait.",
      "Je vertrouwt het script omdat de AI doorgaans correcte syntax levert.",
    ],
    answer: 2,
    uitleg:
      "Anonimiseren, reviewen en testen vóór productie dekt zowel datalek- als uitvoerrisico. A lekt klantdata, B en D voeren ongecontroleerde code uit in productie.",
  },
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Copilot in Word citeert voor een gebruiker bestanden waar die eigenlijk geen toegang toe hoort te hebben. Wat is de structurele oorzaak en juiste volgorde?",
    options: [
      "Copilot heeft een bug; je dient een support-ticket in en wacht op een fix.",
      "De onderliggende SharePoint/OneDrive-permissies zijn te ruim; je inventariseert oversharing, scherpt machtigingen en sensitivity labels aan en zet waar nodig restricted content discovery in.",
      "Je schakelt Copilot uit voor deze gebruiker tot het probleem vanzelf weg is.",
      "Je verwijdert de betreffende bestanden uit de zoekindex.",
    ],
    answer: 1,
    uitleg:
      "Copilot respecteert bestaande permissies; oversharing in SharePoint/OneDrive is de werkelijke oorzaak. A miskent de oorzaak, C verbergt het symptoom voor één gebruiker, D is een lapmiddel dat de onderliggende rechten laat staan.",
  },
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Een collega gebruikt een publieke AI-chatbot om een klantcontract samen te vatten en plakt de volledige tekst inclusief namen erin. Wat is de juiste reactie?",
    options: [
      "Je laat het gaan omdat het om een samenvatting gaat en niet om verspreiding.",
      "Je vraagt of de chatbot wel een betaald abonnement heeft, want dan is het veilig.",
      "Je spreekt de collega aan, legt uit dat dit vertrouwelijke klantdata in een ongecontroleerde dienst is en wijst op het goedgekeurde alternatief en het databeleid.",
      "Je meldt het direct bij de klant zonder het intern te bespreken.",
    ],
    answer: 2,
    uitleg:
      "Dit is een datalek-risico met vertrouwelijke gegevens; aanspreken plus verwijzen naar de goedgekeurde tooling en het beleid is juist. A normaliseert het lek, B is een misvatting over betaald vs zakelijk/DPA, D escaleert extern zonder interne afhandeling.",
  },
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Een klant wil Microsoft 365 Copilot uitrollen voor alle medewerkers. Wat is een essentiële voorbereiding die je adviseert vóór de uitrol?",
    options: [
      "Eerst alle gebruikers een licentie geven en daarna pas naar permissies kijken.",
      "Een data governance- en oversharing-check uitvoeren op SharePoint/OneDrive zodat Copilot geen te breed toegankelijke data ontsluit.",
      "Wachten tot Microsoft een nieuwe versie uitbrengt.",
      "De netwerkbandbreedte verdubbelen.",
    ],
    answer: 1,
    uitleg:
      "Copilot vergroot de impact van bestaande oversharing, dus een data/permissie-readiness check is essentieel vooraf. A doet het in de verkeerde volgorde, C is geen voorbereiding, D is niet de bottleneck.",
  },
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Drie maanden na een Copilot-uitrol vraagt de klant of het rendement oplevert. Hoe onderbouw je dat met data in plaats van anekdotes?",
    options: [
      "Je verwijst naar de marketingcijfers van Microsoft over productiviteitswinst.",
      "Je vraagt een paar enthousiaste gebruikers om een quote.",
      "Je combineert de Copilot adoption-/usage-rapportage (actieve gebruikers, gebruikte apps, frequentie) met de eigen doelstellingen en, waar mogelijk, tijd-/proces-impact per use case.",
      "Je stelt dat ROI bij AI niet te meten is en adviseert af te wachten.",
    ],
    answer: 2,
    uitleg:
      "Echte onderbouwing combineert adoptiedata met afgesproken doelen en use-case-impact. A is generiek vendor-materiaal, B is anekdotisch, D ontwijkt de vraag.",
  },
  // ── VoIP ─────────────────────────────────────────────────────────────────
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Bellers naar de hoofdlijn horen buiten kantooruren een foutmelding ('Deze actie kan niet worden voltooid') in plaats van de avondvoicemail. Overdag werkt alles. Wat onderzoek je als eerste?",
    options: [
      "Of het tijdschema/de openingstijden-conditie correct naar de juiste avond-/voicemailbestemming verwijst.",
      "Of de internetverbinding 's avonds wegvalt.",
      "Of de SIP-trunk een capaciteitslimiet heeft.",
      "Of de telefoontoestellen 's nachts uitstaan.",
    ],
    answer: 0,
    uitleg:
      "Het probleem treedt alleen buiten kantooruren op, dus de tijdgebonden route (time condition naar voicemail) is de eerste verdachte. B, C en D zouden ook overdag of breder problemen geven.",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Oproepen die via het keuzemenu direct bij belgroep 3 binnenkomen, worden bij geen gehoor niet doorgeschakeld naar belgroep 1, terwijl dat wel de bedoeling is. Wat is de juiste oplossing?",
    options: [
      "Je verhoogt het aantal toestellen in belgroep 3.",
      "Je stelt de no-answer/overflow-bestemming van belgroep 3 in op belgroep 1 met een passende timeout.",
      "Je verlaagt de beltijd zodat sneller wordt opgenomen.",
      "Je voegt belgroep 1 toe aan het keuzemenu als losse optie.",
    ],
    answer: 1,
    uitleg:
      "De ontbrekende overflow-/no-answer-route van groep 3 naar groep 1 is de oorzaak. A en C raken de doorschakeling niet, D verandert het keuzemenu in plaats van de fallback.",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Een nieuw thuiswerkende medewerker hoort de beller wel, maar de beller hoort hem niet (eenrichtingsaudio). Registratie en bellen zelf werken. Wat is de meest waarschijnlijke oorzaak?",
    options: [
      "De microfoon van de headset is defect.",
      "Het toestel staat op het verkeerde extensienummer.",
      "Een NAT-/firewallprobleem waardoor de RTP-stream in één richting niet doorkomt.",
      "Het account heeft geen belrechten.",
    ],
    answer: 2,
    uitleg:
      "Eenrichtingsaudio met werkende registratie is het klassieke NAT/RTP-symptoom (mediapoorten in één richting geblokkeerd). A zou ook lokaal hoorbaar zijn, B en D zouden bellen helemaal verhinderen.",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "De spraakkwaliteit hapert zodra er tegelijk grote bestanden over hetzelfde netwerk gaan. De internetlijn heeft op papier ruim voldoende bandbreedte. Wat is de meest effectieve maatregel?",
    options: [
      "De totale bandbreedte verder verhogen.",
      "QoS toepassen zodat spraakverkeer prioriteit krijgt boven bulk-/databestanden.",
      "Een andere VoIP-provider kiezen.",
      "De codec naar een hogere bitrate zetten voor betere kwaliteit.",
    ],
    answer: 1,
    uitleg:
      "Het is een prioriterings-/jitterprobleem bij gelijktijdig verkeer, geen capaciteitsprobleem; QoS lost dit op. A negeert dat bandbreedte al voldoende is, C is voorbarig, D verergert de belasting.",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Na een wissel van internetprovider werkt uitgaand bellen normaal, maar inkomende oproepen komen niet aan. Wat is de waarschijnlijke oorzaak?",
    options: [
      "De nieuwe lijn blokkeert of NAT't het inkomende SIP-/registratieverkeer waardoor de registratie naar de provider niet stabiel doorkomt.",
      "De voicemail staat uit.",
      "Het uitgaande nummer is verkeerd geconfigureerd.",
      "De toestellen hebben een firmware-update nodig.",
    ],
    answer: 0,
    uitleg:
      "Uitgaand werkt, inkomend niet, direct na een lijnwissel wijst op SIP-registratie/NAT op de nieuwe verbinding. B raakt alleen onbeantwoorde oproepen, C raakt juist uitgaand, D zou beide richtingen treffen.",
  },
  // ── Servers ──────────────────────────────────────────────────────────────
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een RDS-server reageert traag voor alle gebruikers. Het totale CPU-gebruik schommelt rond 90%, maar in Taakbeheer staat geen enkel proces structureel bovenaan. Wat geeft het snelst inzicht?",
    options: [
      "Je herstart de server in de hoop dat het probleem verdwijnt.",
      "Je voegt direct extra vCPU's toe.",
      "Je gebruikt Resource Monitor/Performance Monitor per gebruikerssessie om te zien welke sessie of dienst het CPU-gebruik veroorzaakt.",
      "Je beëindigt willekeurig de zwaarste processen.",
    ],
    answer: 2,
    uitleg:
      "Geen enkel proces dat bovenaan staat duidt op verspreiding over sessies; per-sessie-analyse toont de bron. A en B pakken de oorzaak niet, D is gevaarlijk en ongericht.",
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een monitoring-alert meldt een onverwachte server-shutdown op een productieserver. De server is weer online en functioneert normaal. Wat is de juiste vervolgactie?",
    options: [
      "Niets doen, want de server draait weer.",
      "De System- en hardware-/iDRAC/iLO-logs onderzoeken op de oorzaak (stroom, oververhitting, kernel/bugcheck of geplande taak) en de bevinding vastleggen.",
      "De server uit monitoring halen om verdere alerts te voorkomen.",
      "De server preventief opnieuw installeren.",
    ],
    answer: 1,
    uitleg:
      "Een onverklaarde shutdown vereist root-cause-analyse via de event- en hardwarelogs voordat je het afsluit. A negeert herhaalrisico, C onderdrukt zicht, D is buitenproportioneel zonder diagnose.",
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een fileserver-volume nadert 95% schijfgebruik en de back-ups beginnen te falen. De klant kan niet meteen extra opslag aanschaffen. Wat is de meest verantwoorde eerste aanpak?",
    options: [
      "De back-ups uitschakelen tot er ruimte is.",
      "Willekeurig oude bestanden verwijderen om snel ruimte te maken.",
      "De retentie van de back-ups verlagen zodat ze weer slagen.",
      "Met een disk-analyse de grootste verbruikers in kaart brengen, veilige opschoning uitvoeren (temp, logs, shadow copies) en met de klant een opslagplan afstemmen.",
    ],
    answer: 3,
    uitleg:
      "Eerst gericht analyseren en veilig opschonen, dan plannen, houdt back-up en data intact. A vergroot het risico, B kan data vernietigen, C verzwakt de hersteldekking.",
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Domeingebruikers melden dat ze sinds vanmorgen niet kunnen inloggen op een nieuw aangesloten lid-server, terwijl bestaande servers wel werken. Wat onderzoek je als eerste?",
    options: [
      "Of de gebruikers hun wachtwoord zijn vergeten.",
      "Of de tijdsynchronisatie en de secure-channel/DNS van de nieuwe server kloppen, want een time skew of foutieve DNS breekt Kerberos-authenticatie.",
      "Of de licenties van de server geldig zijn.",
      "Of de server genoeg geheugen heeft.",
    ],
    answer: 1,
    uitleg:
      "Alleen de nieuwe lid-server faalt, klassiek voor time skew of DNS/secure-channel waardoor Kerberos faalt. A zou niet alle gebruikers tegelijk raken, C en D verklaren geen auth-falen.",
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Clients in één subnet krijgen geen IP van de DHCP-server, een ander subnet werkt prima. De DHCP-service draait en is geautoriseerd in AD. Wat is de meest gerichte controle?",
    options: [
      "Of de DHCP-service wel echt is gestart.",
      "Of de scope van dat subnet niet is uitgeput of uitgeschakeld en of de DHCP-relay/IP-helper op die VLAN-interface correct staat.",
      "Of de server genoeg schijfruimte heeft.",
      "Of het AD-wachtwoord van de serviceaccount is verlopen.",
    ],
    answer: 1,
    uitleg:
      "Eén subnet faalt terwijl een ander werkt, dus scope-uitputting of een ontbrekende DHCP-relay op die VLAN is de gerichte verdachte. A is al uitgesloten, C en D zouden alle subnets raken.",
  },
  // ── SharePoint / Teams ───────────────────────────────────────────────────
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een Teams-omgeving heeft veel gastgebruikers en niemand weet wie eigenaar is. Wat toets je eerst?",
    options: [
      "Je verwijdert alle gasten en kijkt wie klaagt.",
      "Je bepaalt via de groep/team-eigenaren en de membership wie verantwoordelijk is en review je de guest access en het verlooppbeleid.",
      "Je zet het hele team op read-only.",
      "Je maakt jezelf eigenaar en verwijdert de overige eigenaren.",
    ],
    answer: 1,
    uitleg:
      "Eerst eigenaarschap en guest access vaststellen voordat je ingrijpt. A is destructief, C blokkeert legitiem werk, D verstoort het beheer zonder vast te stellen wie verantwoordelijk is.",
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een gebruiker heeft per ongeluk een hele documentbibliotheek met een 'iedereen'-link extern gedeeld. Wat is de juiste combinatie van acties?",
    options: [
      "Alleen de gebruiker waarschuwen dat dit niet mag.",
      "De bibliotheek verwijderen en opnieuw aanmaken.",
      "De gedeelde 'anyone'-link intrekken, de toegang/sharing-instellingen op de site aanscherpen, controleren of de data al benaderd is (audit log) en de oorzaak met de gebruiker bespreken.",
      "Het organisatiebrede sharingbeleid op 'alleen intern' zetten voor alle klanten.",
    ],
    answer: 2,
    uitleg:
      "Link intrekken, scope herstellen, blootstelling beoordelen en oorzaak adresseren is de volledige remediatie. A laat de link staan, B vernietigt onnodig, D is een te brede maatregel buiten één geval.",
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een afdeling vraagt om een nieuwe Teams-omgeving voor een tijdelijk project met externe partners. Hoe richt je dit het beste in?",
    options: [
      "Je nodigt de externen toe aan een bestaand intern team zodat je snel klaar bent.",
      "Je maakt een apart team met een duidelijke eigenaar, gerichte guest access, een sensitivity label en een verloop-/opruimdatum passend bij de projectduur.",
      "Je geeft de externen volledige tenant-toegang voor het gemak.",
      "Je deelt de bestanden via publieke links zodat geen accounts nodig zijn.",
    ],
    answer: 1,
    uitleg:
      "Apart team, eigenaar, gerichte guest access, label en lifecycle dekt scope én opruimen. A vermengt intern met extern, C en D geven veel te brede toegang.",
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een afdeling wil dat documenten in een Teams-kanaal alleen voor het team zichtbaar zijn, maar collega's blijken de bestanden via zoeken te kunnen openen. Hoe pak je dit het beste aan?",
    options: [
      "Je zet de zoekfunctie tenant-breed uit.",
      "Je verplaatst de bestanden naar een private of shared channel met een eigen, afgeschermde SharePoint-site/permissies in plaats van het standaardkanaal.",
      "Je hernoemt de bestanden zodat ze niet gevonden worden.",
      "Je vraagt collega's de bestanden niet te openen.",
    ],
    answer: 1,
    uitleg:
      "Standaardkanalen erven de teamsite-permissies; een private/shared channel met eigen permissies schermt de data echt af. A is buitenproportioneel, C en D zijn geen technische afscherming.",
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Verlaten teams stapelen zich op: projecten zijn afgerond maar teams, sites en bestanden blijven bestaan. Wat is de beste structurele aanpak?",
    options: [
      "Periodiek handmatig teams verwijderen die niemand meer lijkt te gebruiken.",
      "Een Microsoft 365 groeps-expiration policy plus access reviews instellen, zodat eigenaren actief moeten bevestigen of verlengen en inactieve teams gecontroleerd worden opgeruimd.",
      "De aanmaak van nieuwe teams volledig blokkeren.",
      "Alle oude teams archiveren naar een netwerkschijf.",
    ],
    answer: 1,
    uitleg:
      "Expiration policy met owner-bevestiging en access reviews is de structurele lifecycle-oplossing. A is reactief en foutgevoelig, C beperkt legitiem gebruik, D is geen passend medium voor Teams/SharePoint-data.",
  },
  // ── SharePoint / Azure Migrations ────────────────────────────────────────
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Een klant wil een fileserver-naar-SharePoint-migratie met minimale downtime. Wat is de eerste stap die het projectrisico het meest beperkt?",
    options: [
      "Direct alle data kopiëren in één keer buiten kantooruren.",
      "Een discovery/assessment van datavolume, mappenstructuur, permissies, padlengtes en bestandstypen uitvoeren als basis voor de mapping en planning.",
      "De fileserver uitzetten zodat niemand nog wijzigt.",
      "Eerst alle gebruikers nieuwe licenties geven.",
    ],
    answer: 1,
    uitleg:
      "Discovery legt de risico's (rechten, padlengtes, volume) bloot vóór je migreert. A migreert blind, C veroorzaakt juist downtime, D is geen risicobeperkende eerste stap.",
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Tijdens een fileserver-naar-SharePoint-migratie ontdek je diepe mappenstructuren met paden die de URL-lengtelimiet overschrijden. Wat is de juiste aanpak?",
    options: [
      "De bestanden overslaan en aan de klant melden dat ze niet konden mee.",
      "Alles in één platte map zetten zonder structuur.",
      "De structuur in overleg herinrichten/inkorten of opsplitsen over sites/bibliotheken zodat paden binnen de limiet vallen, en dit in de mapping vastleggen.",
      "De URL-limiet van SharePoint Online verhogen.",
    ],
    answer: 2,
    uitleg:
      "Padlengtes los je op door de structuur te herzien/opsplitsen, in overleg en gedocumenteerd. A laat data achter, B vernietigt bruikbaarheid, D kan niet (de limiet is niet instelbaar).",
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Na een tenant-to-tenant-migratie melden gebruikers dat sommige gedeelde bestanden en machtigingen ontbreken. Wat is de juiste eerste stap?",
    options: [
      "Direct alles opnieuw migreren.",
      "De migratierapporten/logs raadplegen om te zien welke items en permissies faalden of niet zijn meegenomen en de scope van het probleem bepalen voordat je herstelt.",
      "De gebruikers vragen de bestanden zelf opnieuw te delen.",
      "De oude tenant direct opheffen.",
    ],
    answer: 1,
    uitleg:
      "De migratielogs tonen precies wat faalde en geven de scope voor gericht herstel. A is verspilling zonder diagnose, C schuift het probleem af, D vernietigt je fallback-bron.",
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Halverwege een fileserver-naar-SharePoint-migratie moet één afdeling toch al volgende week live. Discovery en rechtenanalyse zijn klaar, de pilot loopt nog. Wat is de meest verantwoorde keuze?",
    options: [
      "De volledige migratie versnellen zodat iedereen tegelijk live gaat.",
      "De afdeling als afgebakende, vervroegde golf migreren op basis van de afgeronde discovery/rechtenanalyse, met een korte gerichte validatie en duidelijke rollback, los van de bredere pilot.",
      "De deadline weigeren omdat de pilot nog loopt.",
      "De afdeling zonder validatie live zetten omdat de tijd dringt.",
    ],
    answer: 1,
    uitleg:
      "Een afgebakende vervroegde golf op de al klare analyse, met validatie en rollback, balanceert risico en deadline. A vergroot risico breed, C is star, D slaat validatie over.",
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Tijdens een grote migratie naar SharePoint Online lopen overdrachten vast met throttling-meldingen (HTTP 429). Wat is de juiste aanpak?",
    options: [
      "De migratie steeds opnieuw starten tot het toevallig lukt.",
      "De parallelle threads verder opvoeren om sneller klaar te zijn.",
      "De Retry-After-respons respecteren, de concurrency/snelheid terugschroeven en migreren tijdens daluren, conform de throttling-richtlijnen van het migratieplatform.",
      "Een support-ticket indienen om de throttling te laten uitzetten.",
    ],
    answer: 2,
    uitleg:
      "429 betekent backen-off: Retry-After volgen, concurrency verlagen en in daluren draaien. A negeert de oorzaak, B verergert het, D is geen reële optie (service-throttling zet je niet uit).",
  },
  // ── Inforcer ─────────────────────────────────────────────────────────────
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Je past een Inforcer-baseline toe op een Microsoft 365-omgeving. Wat moet vóór deployment geborgd zijn?",
    options: [
      "Dat de klant akkoord is dat alles wat afwijkt direct wordt overschreven.",
      "Dat je de huidige config en eventuele drift in kaart hebt, een break-glass account uitzondert en de impact van de baseline (m.n. CA) hebt beoordeeld vóór uitrol.",
      "Dat er een recente back-up van de mailboxen is.",
      "Dat alle gebruikers vooraf opnieuw inloggen.",
    ],
    answer: 1,
    uitleg:
      "Huidige staat kennen, break-glass uitzonderen en CA-impact beoordelen voorkomt lock-out en ongewenste overrides. A is roekeloos, C raakt niet de config-deployment, D heeft geen functie hier.",
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Je wilt via Inforcer een Conditional Access-baseline naar meerdere klant-tenants uitrollen. Hoe beperk je het risico van een verkeerde uitrol?",
    options: [
      "Alles tegelijk naar alle tenants pushen zodat ze gelijk zijn.",
      "Eerst naar één representatieve tenant uitrollen, in report-only valideren en pas na bevestiging gefaseerd naar de overige tenants uitrollen, met break-glass uitgezonderd.",
      "De baseline alleen documenteren en niet daadwerkelijk afdwingen.",
      "De uitrol 's nachts doen zonder validatie zodat niemand last heeft.",
    ],
    answer: 1,
    uitleg:
      "Pilot + report-only + gefaseerd met break-glass beperkt blast radius. A is alles-of-niets-risico, C dwingt niets af, D draait zonder validatie.",
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Bij een klant blijkt de live M365-configuratie afgeweken van de goedgekeurde Inforcer-baseline (configuration drift). Wat is de juiste reactie?",
    options: [
      "De drift direct automatisch terugzetten naar baseline.",
      "De baseline aanpassen aan de live config zodat er geen drift meer is.",
      "Onderzoeken waarom de afwijking ontstond, of die bewust/legitiem is, en dan beslissen om te remediëren naar baseline of de baseline gecontroleerd bij te werken met goedkeuring.",
      "De drift negeren zolang er geen incident is.",
    ],
    answer: 2,
    uitleg:
      "Eerst de oorzaak en legitimiteit bepalen, dan remediëren of de baseline met approval bijwerken. A kan een legitieme wijziging breken, B legitimeert klakkeloos elke afwijking, D laat governance los.",
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Een klant vraagt om één beleidsregel uit de standaard-baseline uit te zetten omdat die hun workflow hindert. Hoe ga je hiermee om?",
    options: [
      "Je zet de regel direct uit voor deze klant zonder verdere vastlegging.",
      "Je weigert, want de baseline is voor iedereen gelijk.",
      "Je beoordeelt het beveiligingsrisico, bespreekt een passend alternatief of scoped uitzondering, en legt de afwijking met akkoord vast als bewuste deviatie op de baseline.",
      "Je verwijdert de regel uit de centrale baseline voor alle klanten.",
    ],
    answer: 2,
    uitleg:
      "Risico beoordelen, alternatief zoeken en de uitzondering gedocumenteerd vastleggen is de governance-juiste route. A mist vastlegging/risicoweging, B is te rigide, D treft alle andere klanten.",
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Je onboardt een nieuwe klant en wilt hun beveiligingsniveau snel inzichtelijk maken met Inforcer. Wat is de meest zinvolle eerste stap?",
    options: [
      "Meteen de strengste baseline afdwingen.",
      "Een assessment/alignment-scan draaien tegen de baseline om de huidige staat en de gaps in kaart te brengen vóór je iets wijzigt.",
      "Wachten tot de klant zelf aangeeft wat er mis is.",
      "Alle gebruikers direct MFA-resetten.",
    ],
    answer: 1,
    uitleg:
      "Eerst meten (assessment/alignment) geeft de gaps zonder de omgeving te verstoren. A is roekeloos zonder nulmeting, C is passief, D is een ongerichte ingreep.",
  },
  // ── Basic IT & Troubleshooting ───────────────────────────────────────────
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Outlook synchroniseert niet meer terwijl OWA wel correct werkt. Een nieuw Outlook-profiel gaf een authenticatiefout. Wat is de meest gerichte vervolgstap?",
    options: [
      "Office volledig verwijderen en opnieuw installeren.",
      "De opgeslagen credentials in Windows Credential Manager voor dit account opschonen zodat de client opnieuw een schone modern-auth-token kan ophalen.",
      "De mailbox naar een andere database verplaatsen.",
      "De gebruiker een nieuwe licentie toewijzen.",
    ],
    answer: 1,
    uitleg:
      "OWA werkt, maar de client faalt op auth, wat wijst op vastgelopen cached credentials/tokens; die opschonen is gericht. A is een grof middel, C en D verklaren niet waarom OWA wel werkt.",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een laptop verlaat automatisch de slaapstand, ook in een tas, al langer op Windows 11. Wat is de meest gerichte diagnosestap?",
    options: [
      "De accu vervangen.",
      "Windows opnieuw installeren.",
      "Met 'powercfg /lastwake' en '/devicequery wake_armed' achterhalen welk apparaat of welke geplande taak de wake veroorzaakt en die wake-permissie uitzetten.",
      "De slaapstand helemaal uitschakelen.",
    ],
    answer: 2,
    uitleg:
      "powercfg toont precies de wake-bron (vaak NIC, muis of een taak). A en B zijn ongericht, D omzeilt het probleem in plaats van het op te lossen.",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een gebruiker meldt grafische artefacten in een technische applicatie kort na een recente Windows-update; andere apps werken normaal. Wat is de juiste aanpak?",
    options: [
      "De videokaart direct vervangen.",
      "De applicatie opnieuw installeren.",
      "Het beeldscherm vervangen.",
      "Nagaan of de update een GPU-driver heeft gewijzigd en de driver bijwerken of terugrollen naar een werkende versie.",
    ],
    answer: 3,
    uitleg:
      "Artefacten in één app na een update wijzen op een gewijzigde GPU-driver; update of rollback is de gerichte stap. A en C vervangen hardware zonder bewijs, B raakt de driver niet.",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een tenant heeft legacy auth, zwakke adminhygiëne en brede SharePoint-sharing. Hoe prioriteer je het herstel?",
    options: [
      "Eerst de SharePoint-sharing aanpakken, want dat is het zichtbaarst.",
      "Eerst de admin-accounts beveiligen (MFA, rolopschoning, break-glass) en legacy auth dichtzetten, daarna de brede sharing inperken.",
      "Alles tegelijk aanpakken in één wijziging.",
      "Eerst gebruikerstraining geven en daarna pas technische maatregelen.",
    ],
    answer: 1,
    uitleg:
      "Identiteit/admin en legacy auth zijn het grootste compromitterings-risico en gaan voor. A pakt niet de grootste dreiging eerst, C vergroot het risico op fouten, D stelt de kritieke maatregelen uit.",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een gebruiker meldt vaag 'het internet doet het niet', terwijl collega's geen problemen hebben. Wat is de meest gestructureerde eerste stap?",
    options: [
      "Direct de router herstarten.",
      "De pc opnieuw opstarten en hopen dat het werkt.",
      "Het probleem afbakenen: vaststellen wat 'internet' betekent voor deze gebruiker, of het lokaal of breder is, en laag voor laag toetsen (link, IP, DNS, applicatie).",
      "De provider bellen om een storing te melden.",
    ],
    answer: 2,
    uitleg:
      "Omdat collega's geen last hebben is het waarschijnlijk lokaal; gestructureerd afbakenen en per laag toetsen is juist. A en B gokken, D escaleert extern zonder dat een brede storing aannemelijk is.",
  },
  // ── Werkhouding & Communicatie ───────────────────────────────────────────
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Een collega heeft een ticket onvolledig overgedragen; de klant wacht inmiddels op een oplossing. Wat is de beste aanpak?",
    options: [
      "Je wacht tot de collega terug is om de context compleet te krijgen.",
      "Je stuurt het ticket terug met de opmerking dat het onvolledig is.",
      "Je pakt het ticket op, verzamelt de ontbrekende context uit het systeem en bij de klant, helpt verder en koppelt kort terug aan de collega zodat de overdracht volgende keer beter gaat.",
      "Je sluit het ticket en laat de klant een nieuw verzoek indienen.",
    ],
    answer: 2,
    uitleg:
      "De klant gaat voor; je vult de context aan, helpt en geeft feedback voor verbetering. A laat de klant wachten, B en D schuiven het probleem terug naar de klant of collega.",
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Je planning loopt vol en een klantissue dreigt zijn afgesproken deadline te missen. Wat is de beste aanpak?",
    options: [
      "Je werkt door en hoopt dat je de deadline net haalt.",
      "Je informeert proactief de betrokkenen, geeft een realistische nieuwe verwachting of vraagt om herprioritering/ondersteuning, en legt dit vast.",
      "Je verlegt de deadline stilletjes in het systeem.",
      "Je wacht tot de klant zelf vraagt waar het blijft.",
    ],
    answer: 1,
    uitleg:
      "Proactief communiceren en herprioriteren is professioneel verwachtingsmanagement. A is hopen, C is misleidend, D is reactief en beschadigt vertrouwen.",
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Je merkt dat een wijziging van jou een korte storing bij een klant heeft veroorzaakt. De storing is alweer voorbij en niemand lijkt het gemerkt te hebben. Wat is de beste aanpak?",
    options: [
      "Je zegt niets, want het is opgelost en niemand merkte het.",
      "Je legt de oorzaak en oplossing vast, meldt het intern volgens proces en bepaalt of de klant geïnformeerd moet worden.",
      "Je wacht af of er alsnog een klacht komt.",
      "Je past de logging aan zodat de storing niet zichtbaar is.",
    ],
    answer: 1,
    uitleg:
      "Transparantie en vastlegging horen bij verantwoord change-gedrag, ongeacht of iemand het merkte. A en C verzwijgen, D is het uitwissen van bewijs en ronduit fout.",
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Tijdens een geplande opdracht krijg je een dringend verzoek van een andere klant binnen. Wat is de beste aanpak?",
    options: [
      "Je stopt direct met je huidige taak en schakelt naar het nieuwe verzoek.",
      "Je negeert het nieuwe verzoek tot je huidige taak helemaal klaar is.",
      "Je beoordeelt de urgentie/impact van beide, stemt zo nodig met je team of de aanvrager af over prioriteit en communiceert de keuze naar de betrokkenen.",
      "Je laat een collega zonder overleg je huidige taak overnemen.",
    ],
    answer: 2,
    uitleg:
      "Bewust prioriteren op urgentie/impact en dat communiceren is juist. A en B kiezen blind voor één kant, D schuift werk door zonder afstemming.",
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Je werkt vanuit huis met een bedrijfslaptop die toegang heeft tot klantomgevingen. Welke werkwijze is het meest verantwoord?",
    options: [
      "Je laat de laptop ingelogd staan zodat je snel verder kunt na een pauze.",
      "Je gebruikt af en toe je privélaptop als de bedrijfslaptop traag is.",
      "Je vergrendelt het scherm bij weglopen, gebruikt alleen het beheerde toestel over een vertrouwde verbinding en houdt klantdata binnen de goedgekeurde systemen.",
      "Je slaat klantwachtwoorden lokaal op in een tekstbestand voor het gemak.",
    ],
    answer: 2,
    uitleg:
      "Vergrendelen, alleen het beheerde toestel en data binnen goedgekeurde systemen is de verantwoorde norm. A laat toegang open, B gebruikt onbeheerd, D is een ernstig datalek-risico.",
  },
  // ── Engels ───────────────────────────────────────────────────────────────
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "Fortinet security advisory: 'A heap-based buffer overflow in FortiOS SSL-VPN may allow a remote unauthenticated attacker to execute arbitrary code. Fortinet is aware of an instance where this was exploited in the wild. Upgrade to a fixed release. If you cannot upgrade immediately, disable SSL-VPN as a workaround.' Which interpretation best matches the advisory?",
    options: [
      "The flaw only affects authenticated users, so external exposure is limited.",
      "It is being actively exploited; upgrade to a fixed release as soon as possible and disable SSL-VPN only if you cannot upgrade right away.",
      "Disabling SSL-VPN is the permanent fix and upgrading is optional.",
      "The risk is theoretical because no real exploitation has been observed.",
    ],
    answer: 1,
    uitleg:
      "The advisory states real-world exploitation and prioritizes upgrading, with disabling SSL-VPN only as an interim workaround. A misreads 'unauthenticated', C reverses fix vs workaround, D contradicts 'exploited in the wild'.",
  },
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "Microsoft release note: 'Basic authentication for Exchange Online is deprecated and will be permanently disabled for all tenants. Connections still using Basic auth will fail after the cutoff date. Migrate affected clients and service accounts to Modern authentication (OAuth) before that date to avoid disruption.' What does this notice ask you to do?",
    options: [
      "Keep Basic auth enabled but monitor it more closely after the cutoff date.",
      "Wait until connections start failing and then switch to Modern auth reactively.",
      "Move affected clients and service accounts to Modern authentication (OAuth) before the cutoff so they keep working.",
      "Request an exemption so Basic auth remains available for service accounts.",
    ],
    answer: 2,
    uitleg:
      "The note instructs proactive migration to OAuth before the cutoff. A ignores 'permanently disabled', B waits for failure, D assumes an exemption the note does not offer.",
  },
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "A Windows backup job ends with: 'The operation failed because the volume shadow copy service (VSS) encountered an error. There is insufficient storage available to create either the shadow copy storage file or other shadow copy data.' What does this message indicate?",
    options: [
      "The VSS writer is corrupt and the service must be reinstalled.",
      "The backup target is offline and unreachable.",
      "The source files are locked by another application.",
      "There is not enough free space to create the shadow copy, so freeing or allocating storage is needed.",
    ],
    answer: 3,
    uitleg:
      "The message explicitly names insufficient storage for the shadow copy. A, B and C are different VSS/backup failure causes not stated in this error.",
  },
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "Datto KB note: 'If the agent shows as offline in the portal but the device is powered on, first verify outbound connectivity on TCP 443 to the cloud endpoints. Do not reinstall the agent until network connectivity has been confirmed, as a reinstall will not resolve a firewall or proxy issue.' According to this note, what should you do first?",
    options: [
      "Reinstall the agent immediately to restore the connection.",
      "Confirm outbound connectivity on TCP 443 to the cloud endpoints before considering a reinstall.",
      "Replace the device because it is no longer reporting in.",
      "Disable the firewall entirely to rule it out.",
    ],
    answer: 1,
    uitleg:
      "The note says verify 443 connectivity first and warns a reinstall will not fix a firewall/proxy issue. A and C act before diagnosing, D is an unsafe blanket change the note does not suggest.",
  },
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "Azure change notification: 'Starting next month, the TLS 1.0 and 1.1 protocols will no longer be supported for connections to this service. Clients that have not been updated to use TLS 1.2 or higher will be unable to connect. Review your applications and update any that still negotiate older TLS versions.' What is the correct understanding of this change?",
    options: [
      "Only new clients are affected; existing connections keep working on TLS 1.0/1.1.",
      "The service will auto-upgrade all clients to TLS 1.2 with no action needed.",
      "Any client still negotiating TLS 1.0 or 1.1 will fail to connect, so applications must be updated to TLS 1.2 or higher before the change.",
      "TLS 1.2 is being deprecated and clients must move to TLS 1.0/1.1.",
    ],
    answer: 2,
    uitleg:
      "Clients on TLS 1.0/1.1 will be unable to connect and must move to 1.2+ proactively. A misreads the scope, B assumes automatic remediation, D inverts which versions are deprecated.",
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
