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
  // ── Microsoft 365 ─────────────────────────────────────────────────────────────
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Na een wijziging in het Conditional Access-beleid kan een gebruiker wel inloggen in Outlook Web, maar niet in de Outlook desktop client. Wat onderzoek je als eerste?",
    options: [
      "Je bouwt een nieuw Outlook-profiel op en laat de OST-cache van de gebruiker volledig opnieuw synchroniseren.",
      "Je opent de Entra sign-in logs en zoekt welke CA-policy en grant control de desktopsessie blokkeert.",
      "Je schakelt de betreffende CA-policy tijdelijk tenant-breed uit om te bevestigen dat die de oorzaak is.",
      "Je verifieert of de Exchange Online mailboxlicentie van de gebruiker nog actief en geldig is.",
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
      "Je dwingt de CA-policy 'block legacy authentication' direct tenant-breed af; de scanners schakelen daarna vanzelf over op modern OAuth.",
      "Je laat SMTP AUTH org-breed gewoon aanstaan en blokkeert alleen interactieve legacy auth via een gerichte CA-policy zonder verdere stappen.",
      "Je filtert eerst de sign-in logs op legacy auth, zet SMTP AUTH org-breed uit en laat het per serviceaccount aan; daarna blokkeer je legacy breed.",
      "Je zet via authentication policies basic auth per protocol uit zonder eerst te inventariseren welke accounts die nog actief gebruiken.",
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
      "De bestanden zijn definitief en onherstelbaar weg op het moment dat het gebruikersaccount wordt verwijderd.",
      "De OneDrive-retentieperiode bepaalt het behoud; wijs een secundaire beheerder aan voor de overdracht.",
      "Een retention label op de mailbox van het account bepaalt of de OneDrive-data behouden blijft.",
      "Een litigation hold op het bronaccount houdt de OneDrive-bestanden automatisch toegankelijk voor het team.",
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
      "DMARC meteen op p=reject zetten zodat spoofing direct onmogelijk wordt en pas daarna DKIM publiceren.",
      "SPF verder uitbreiden met extra includes, want DKIM en DMARC zijn dan helemaal niet meer nodig.",
      "DKIM en DMARC tegelijk in één keer hard afdwingen en de DMARC-rapportages pas achteraf bekijken.",
      "DKIM signeren, dan DMARC op p=none monitoren en daarna gefaseerd verscherpen naar reject.",
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
      "Je beoordeelt afzender, headers en payload zelf en geeft pas vrij bij aantoonbare legitimiteit.",
      "Je geeft het bericht meteen vrij omdat de gebruiker erom vraagt en het zijn eigen inkomende mail betreft.",
      "Je plaatst de afzender direct op de tenant-brede allowlist zodat dit in de toekomst niet opnieuw gebeurt.",
      "Je laat de gebruiker schriftelijk bevestigen dat het veilig is en geeft op basis daarvan vrij.",
    ],
    answer: 0,
    uitleg:
      "Je verifieert zelf voordat je vrijgeeft en lost daarna de oorzaak op. B en D leunen op de gebruiker als beveiligingsoordeel, C creëert een permanente bypass op basis van één geval.",
  },
  // ── Azure ─────────────────────────────────────────────────────────────────────
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Een externe auditor heeft tijdelijk leesrechten nodig op de Entra-omgeving van een klant voor een eenmalige security-audit. Welke aanpak past het beste bij least-privilege en governance?",
    options: [
      "Je kent de auditor een permanente Global Reader-rol toe via een vast account zodat de audit nergens op vastloopt.",
      "Je nodigt de auditor als gast uit en kent via PIM een eligible, time-bound Global Reader met verloop toe.",
      "Je deelt tijdelijk de inloggegevens van een bestaand read-only serviceaccount dat hiervoor al klaarstaat in de tenant.",
      "Je geeft de auditor een Security Reader-rol op subscription-niveau binnen Azure RBAC voor de audit.",
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
      "Je laat de bestaande Blueprints draaien tot ze vanzelf stoppen met werken en handelt de gevolgen daarna pas reactief af.",
      "Je migreert alles naar losse ARM/Bicep-templates en laat de governance- en deny-laag daarbij verder gewoon los.",
      "Je zet de blueprint-definities om naar Template Specs voor de deployments en naar Azure Policy voor de governance- en deny-laag.",
      "Je vervangt de Blueprints door een handmatige naming- en tagging-conventie die je uitsluitend in de documentatie vastlegt.",
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
      "De reservering wordt netjes afgesloten en het resterende tegoed wordt automatisch naar de klant terugbetaald.",
      "De reservering stopt direct, de korting vervalt per direct en de betrokken VM's worden uitgeschakeld.",
      "De reservering verlengt automatisch tegen het dan geldende tarief; de korting loopt door, mogelijk anders.",
      "De VM's blijven gewoon doordraaien maar dan volledig zonder korting, ongeacht hoe auto-renew precies is ingesteld.",
    ],
    answer: 2,
    uitleg:
      "Met auto-renew aan verlengt de RI automatisch tegen het op dat moment geldende tarief; de korting loopt door maar de prijs kan veranderen. A klopt niet voor verlenging, B en D negeren auto-renew.",
  },
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "De kosten op een subscription verdubbelen binnen een week zonder dat er nieuwe VM's zijn aangemaakt. Hoe achterhaal je gericht de bron?",
    options: [
      "Je opent meteen een support-ticket bij Microsoft omdat de facturatie hoogstwaarschijnlijk een fout bevat.",
      "Je verlaagt vast preventief de VM-sizes om de kosten te drukken terwijl je intussen nog verder onderzoek doet.",
      "Je analyseert Cost Management gegroepeerd op resource en service en zoomt in op de grootste piek.",
      "Je controleert eerst uitsluitend of er recent reserveringen zijn verlopen en neemt dat aan als de oorzaak.",
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
      "App Service pakt zonder uitzondering altijd goedkoper uit dan een eigen VM voor werkelijk elke denkbare workload.",
      "App Service neemt OS-patching, runtime-onderhoud en platformbeveiliging weg en verlaagt zo de beheerlast.",
      "App Service geeft je volledige en feitelijk ongelimiteerde controle over het volledige onderliggende besturingssysteem.",
      "App Service vereist daarna echt geen enkele monitoring, governance of operationeel toezicht meer.",
    ],
    answer: 1,
    uitleg:
      "Het managed platform haalt patch- en onderhoudslast weg, schaalbaar over veel tenants. A is niet altijd waar, C is juist een eigenschap van de VM, D is onjuist.",
  },
  // ── Kaseya Stack ──────────────────────────────────────────────────────────────
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Een Datto-backup mislukt op meerdere servers al dagen met 'Backup failed because backup image files have not been decrypted'. Wat is de meest gerichte eerste actie?",
    options: [
      "Je herinstalleert de Datto-agent op alle betrokken servers en wacht een volledige cyclus af.",
      "Je controleert of het encryptiewachtwoord na de laatste reboot opnieuw is ingevoerd.",
      "Je maakt een nieuwe backup-job aan met afwijkende retentie en planning.",
      "Je vervangt de backup-appliance omdat de onderliggende schijven vermoedelijk corrupt zijn.",
    ],
    answer: 1,
    uitleg:
      "De melding gaat specifiek over niet-ontsleutelde images, wat optreedt als het encryptiewachtwoord niet is ingevoerd na een herstart. A, C en D pakken niet de oorzaak en kosten onnodig tijd.",
  },
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Bij een onboarding-ticket staat in de PSA: 'Bekijk in IT Glue OOK de klantspecifieke onboarding-SOP'. Waarom is die verwijzing belangrijk?",
    options: [
      "Omdat de klantspecifieke SOP de generieke standaardprocedure in haar geheel volledig overbodig maakt.",
      "Omdat IT Glue de enige plek is waar het beheerderswachtwoord van de klant veilig wordt opgeslagen.",
      "Omdat de klantspecifieke SOP afwijkingen, uitzonderingen en afspraken bevat die de generieke onboarding mist.",
      "Omdat het onboarding-ticket anders administratief niet kan worden afgesloten binnen Autotask.",
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
      "Je sluit het ticket en heropent het zodra de klant uiteindelijk weer reageert op de zaak.",
      "Je koppelt 'Waiting Customer' als status aan een SLA-pauze in de SLA-configuratie.",
      "Je verhoogt de SLA-tijd ruim zodat de overschrijding niet optreedt.",
      "Je verlaagt de prioriteit van het ticket zodat de SLA-klok merkbaar trager doortikt.",
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
      "Je negeert de melding zodra de medewerker bekend is, want forwarding hoort bij normaal gedrag.",
      "Je verwijdert de aangemaakte forwarding-regel stilletjes en sluit daarna de melding netjes af.",
      "Je behandelt het als mogelijk gecompromitteerd account en containt het account eerst.",
      "Je mailt de medewerker zelf met de vraag of hij deze forwarding-regel bewust heeft aangemaakt.",
    ],
    answer: 2,
    uitleg:
      "Externe auto-forwarding is een klassiek BEC-signaal; je containt eerst en verifieert via een out-of-band kanaal. A is gevaarlijk, B verwijdert bewijs zonder onderzoek, D vertrouwt op het mogelijk gekaapte kanaal zelf.",
  },
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Een Datto RMM-alert meldt hoge schijfvulling op een klantserver. Hoe laat je Autotask, IT Glue en de klantcommunicatie hier goed op aansluiten?",
    options: [
      "Je ruimt direct tijdelijke bestanden op de betrokken server op en doet verder niets.",
      "Je laat de alert een Autotask-ticket maken, checkt de SOP en informeert daarna de klant.",
      "Je belt de klant met de vraag of het kan wachten tot de eerstvolgende geplande onderhoudsronde.",
      "Je breidt direct de schijfcapaciteit uit zonder de werkelijke oorzaak van de groei te onderzoeken.",
    ],
    answer: 1,
    uitleg:
      "De keten alert -> ticket -> SOP -> actie -> klantcommunicatie borgt traceerbaarheid en context. A en D slaan documentatie en oorzaakanalyse over, C stelt een dreigend backup-/uptime-risico onnodig uit.",
  },
  // ── Fortigate ─────────────────────────────────────────────────────────────────
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een medewerker kan vanuit het buitenland geen SSL-VPN opzetten, terwijl anderen wel verbinden. De portal- en tunnelconfiguratie is ongewijzigd. Wat is de meest logische eerste diagnosestap?",
    options: [
      "Je controleert of een geo-IP-restrictie of local-in policy het verkeer vanuit dat land blokkeert.",
      "Je herstelt eerst alle SSL-VPN-instellingen volledig terug naar de standaard fabrieksconfiguratie.",
      "Je verhoogt de sessie-timeout van de SSL-VPN ruim zodat trage buitenlandverbindingen blijven staan.",
      "Je trekt het certificaat in en rolt voor deze medewerker een vers exemplaar uit.",
    ],
    answer: 0,
    uitleg:
      "Anderen verbinden wel en de config is gelijk, dus de variabele is de bronlocatie: geo-blocking of een local-in policy is de eerste verdachte. B is destructief, C en D verklaren niet waarom alleen deze locatie faalt.",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een interne webserver moet vanaf internet bereikbaar zijn op poort 443. De technicus maakt een VIP met juiste port-forward, maar verkeer komt niet aan. Wat is de meest waarschijnlijke oorzaak?",
    options: [
      "De VIP is per ongeluk aan de verkeerde uitgaande interface van de firewall gekoppeld.",
      "Er ontbreekt een firewall-policy die de VIP als destination toestaat van WAN naar de interne webserver.",
      "De webserver presenteert op poort 443 een verlopen, zelfondertekend TLS-certificaat aan clients.",
      "De publieke DNS-record van de webserver wijst per abuis naar een intern privé-IP-adres.",
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
      "De statische routering naar het remote subnet ontbreekt aan minstens één van de beide peers nog.",
      "De firewall-policy die het tunnelverkeer over de IPsec-interface toestaat is nog niet aangemaakt.",
      "Mismatchende fase 1-parameters zoals pre-shared key, IKE-versie of DH-group tussen de peers.",
      "De interne DNS-servers achter de tunnel zijn vanaf de andere locatie niet bereikbaar.",
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
      "Hij schakelt in één keer alle security-profielen op de policy uit en kijkt of het sneller wordt.",
      "Hij laat de complete internetlijn vervangen omdat de beschikbare bandbreedte structureel tekortschiet.",
      "Hij verhoogt voor al het verkeer de bandbreedtelimiet die in de traffic shaper staat ingesteld.",
      "Hij gebruikt flow-logs en de policy-hitcount om te zien welk profiel het verkeer raakt.",
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
      "Je plant een dagelijkse herstart van de firewall in zodat het geheugen telkens weer vrijkomt.",
      "Je vergelijkt de release notes, bepaalt welk proces het geheugen opslokt en overweegt rollback.",
      "Je schakelt de logging op het toestel volledig uit om geheugen voor andere processen vrij te spelen.",
      "Je verlaagt in de policies het maximaal aantal gelijktijdige sessies om het geheugengebruik te drukken.",
    ],
    answer: 1,
    uitleg:
      "Het probleem is firmware-gerelateerd, dus release notes, procesanalyse en eventueel patch/rollback zijn de juiste route. A is een symptoombestrijdende workaround, C verzwakt zicht, D pakt de oorzaak niet.",
  },
  // ── AI / Copilot ──────────────────────────────────────────────────────────────
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Je wilt een AI-assistent gebruiken om sneller een lastig PowerShell-probleem in een klantomgeving op te lossen. Wat is de veiligste werkwijze?",
    options: [
      "Je plakt de volledige output met tenant-ID's en gebruikersnamen erin.",
      "Je laat het voorgestelde script meteen in productie draaien zonder tussenstappen.",
      "Je beschrijft het probleem geanonimiseerd en test het in een veilige context.",
      "Je vertrouwt het script, omdat een AI doorgaans correcte PowerShell-syntax levert.",
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
      "Copilot kent een bug; je dient een support-ticket in en wacht op de fix.",
      "De SharePoint/OneDrive-permissies zijn te ruim; je scherpt machtigingen en labels aan.",
      "Je schakelt Copilot uit voor deze specifieke gebruiker, tot het probleem weg is.",
      "Je haalt de bestanden uit de zoekindex, zodat Copilot ze niet meer vindt.",
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
      "Je laat het gaan, want het is enkel een interne samenvatting van het contract.",
      "Je vraagt of de chatbot een betaald abonnement heeft, want dan is het verwerken van die data veilig.",
      "Je spreekt de collega aan en wijst op het goedgekeurde alternatief voor klantdata.",
      "Je meldt het incident direct bij de betrokken klant, nog voordat je het intern besproken hebt.",
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
      "Eerst alle gebruikers een licentie geven, dan permissies zien.",
      "Een governance-check op SharePoint/OneDrive doen.",
      "Wachten op een volgende Copilot-versie vanuit Microsoft.",
      "De netwerkbandbreedte op alle locaties laten verdubbelen.",
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
      "Je verwijst naar de gepubliceerde marketingcijfers van Microsoft over productiviteit.",
      "Je vraagt enkele enthousiaste gebruikers om een positieve quote.",
      "Je combineert de Copilot usage-rapportage met de afgesproken doelen.",
      "Je legt uit dat ROI bij AI in de praktijk niet betrouwbaar valt te meten.",
    ],
    answer: 2,
    uitleg:
      "Echte onderbouwing combineert adoptiedata met afgesproken doelen en use-case-impact. A is generiek vendor-materiaal, B is anekdotisch, D ontwijkt de vraag.",
  },
  // ── VoIP ──────────────────────────────────────────────────────────────────────
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Bellers naar de hoofdlijn horen buiten kantooruren een foutmelding ('Deze actie kan niet worden voltooid') in plaats van de avondvoicemail. Overdag werkt alles. Wat onderzoek je als eerste?",
    options: [
      "Of de openingstijden-conditie correct naar de avond-/voicemailbestemming verwijst.",
      "Of de internetverbinding buiten kantooruren structureel even helemaal lijkt weg te vallen.",
      "Of de SIP-trunk 's avonds tegen een harde gelijktijdigheidslimiet aanloopt.",
      "Of alle telefoontoestellen na sluitingstijd door iemand handmatig worden uitgezet.",
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
      "Je verhoogt het aantal aangesloten toestellen binnen belgroep 3 flink.",
      "Je stelt de no-answer/overflow-bestemming van belgroep 3 in op belgroep 1 met een timeout.",
      "Je verlaagt de beltijd van belgroep 3 zodat oproepen sneller worden opgenomen.",
      "Je voegt belgroep 1 als losse keuzeoptie aan het hoofdmenu toe.",
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
      "De microfoon van de aangesloten USB-headset is hardwarematig kapot gegaan.",
      "Het toestel is per ongeluk geregistreerd op een verkeerd intern extensienummer.",
      "Een NAT-/firewallprobleem waardoor de RTP-stream in één richting niet doorkomt.",
      "Het belaccount mist de benodigde rechten om uitgaande gesprekken te mogen opzetten.",
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
      "De totale beschikbare bandbreedte op de internetlijn nog verder ophogen.",
      "QoS toepassen zodat spraak voorrang krijgt op bulk-/dataverkeer.",
      "Overstappen naar een andere VoIP-provider met aantoonbaar betere routes.",
      "De gebruikte audiocodec op een hogere bitrate instellen voor kwaliteit.",
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
      "De nieuwe lijn NAT't/blokkeert het inkomende SIP-verkeer waardoor de registratie hapert.",
      "De voicemail van de centrale staat sinds de providerwissel volledig uitgeschakeld geraakt.",
      "Het meegestuurde uitgaande nummer is sinds de providerwissel verkeerd geconfigureerd.",
      "De aangesloten toestellen hebben sinds de wissel dringend een nieuwe firmware-update nodig.",
    ],
    answer: 0,
    uitleg:
      "Uitgaand werkt, inkomend niet, direct na een lijnwissel wijst op SIP-registratie/NAT op de nieuwe verbinding. B raakt alleen onbeantwoorde oproepen, C raakt juist uitgaand, D zou beide richtingen treffen.",
  },
  // ── Servers ───────────────────────────────────────────────────────────────────
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een RDS-server reageert traag voor alle gebruikers. Het totale CPU-gebruik schommelt rond 90%, maar in Taakbeheer staat geen enkel proces structureel bovenaan. Wat geeft het snelst inzicht?",
    options: [
      "Je herstart de server meteen en hoopt dat de traagheid daarna verdwijnt.",
      "Je schaalt de VM direct op met extra vCPU's om de hoge belasting op te vangen.",
      "Je analyseert per sessie met Resource Monitor wie het CPU-gebruik opstuwt.",
      "Je beëindigt de ogenschijnlijk zwaarste processen om snel CPU-ruimte vrij te maken.",
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
      "Niets ondernemen, omdat de server inmiddels weer normaal draait.",
      "De System- en iDRAC/iLO-logs op stroom, oververhitting of bugcheck onderzoeken.",
      "De server uit monitoring halen zodat zulke alerts je niet langer storen.",
      "De server preventief volledig opnieuw installeren om herhaling uit te sluiten.",
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
      "De back-uptaken voorlopig uitschakelen tot er weer voldoende ruimte beschikbaar is.",
      "De retentie van de back-ups fors verlagen zodat de jobs voortaan weer netjes slagen.",
      "Grootverbruikers analyseren, temp/logs/shadow copies opschonen en plannen.",
      "Lukraak oude bestanden verwijderen om snel wat ruimte te maken.",
    ],
    answer: 2,
    uitleg:
      "Eerst gericht analyseren en veilig opschonen, dan plannen, houdt back-up en data intact. A vergroot het risico, B verzwakt de hersteldekking, D kan data vernietigen.",
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Domeingebruikers melden dat ze sinds vanmorgen niet kunnen inloggen op een nieuw aangesloten lid-server, terwijl bestaande servers wel werken. Wat onderzoek je als eerste?",
    options: [
      "Of de betrokken gebruikers misschien hun domeinwachtwoord vergeten zijn.",
      "Of tijdsync en secure-channel/DNS kloppen voor Kerberos.",
      "Of de Windows Server-licenties op de nieuwe server geactiveerd zijn.",
      "Of de nieuwe server genoeg werkgeheugen heeft voor inlogsessies.",
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
      "Of de DHCP-service op de server wel echt is gestart en actief draait.",
      "Of de scope niet uitgeput is en de IP-helper op die VLAN klopt.",
      "Of de DHCP-server zelf nog wel voldoende vrije schijfruimte heeft.",
      "Of het wachtwoord van de AD-serviceaccount soms is verlopen.",
    ],
    answer: 1,
    uitleg:
      "Een subnet faalt terwijl een ander werkt, dus scope-uitputting of een ontbrekende DHCP-relay op die VLAN is de gerichte verdachte. A is al uitgesloten, C en D zouden alle subnets raken.",
  },
  // ── SharePoint / Teams ────────────────────────────────────────────────────────
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een Teams-omgeving heeft veel gastgebruikers en niemand weet wie eigenaar is. Wat toets je eerst?",
    options: [
      "Je verwijdert per direct alle gastaccounts en wacht vervolgens rustig af welke gebruikers daarover nog een melding indienen.",
      "Je stelt via de groeps-/teameigenaren en de membership vast wie verantwoordelijk is en reviewt de guest access.",
      "Je zet het volledige team meteen op read-only totdat de eigenaarsvraag intern volledig is uitgezocht en bevestigd.",
      "Je benoemt jezelf tot enige eigenaar en verwijdert per direct alle bestaande eigenaren uit het betrokken team.",
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
      "Je waarschuwt enkel de gebruiker nadrukkelijk dat extern delen via zo'n volledig open link echt niet is toegestaan.",
      "Je verwijdert de getroffen bibliotheek volledig en bouwt die daarna helemaal vanaf nul opnieuw op voor de klant.",
      "Je trekt de 'anyone'-link in, scherpt de sharing aan, checkt in de audit log de blootstelling en bespreekt de oorzaak.",
      "Je zet het organisatiebrede sharingbeleid voor al je klanten direct, breed en blijvend op 'uitsluitend intern delen'.",
    ],
    answer: 2,
    uitleg:
      "Link intrekken, scope herstellen, blootstelling beoordelen en oorzaak adresseren is de volledige remediatie. A laat de link staan, B vernietigt onnodig, D is een te brede maatregel buiten dit ene geval.",
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een afdeling vraagt om een nieuwe Teams-omgeving voor een tijdelijk project met externe partners. Hoe richt je dit het beste in?",
    options: [
      "Je nodigt de externe partners uit in een bestaand intern team zodat je snel operationeel bent.",
      "Je maakt een apart team met een eigenaar, gerichte guest access, een sensitivity label en een passende verloopdatum.",
      "Je geeft de externe partners voor het gemak volledige toegang tot de hele tenant en alle daarin beschikbare resources.",
      "Je deelt de projectbestanden via openbare publieke links zodat de externen helemaal geen eigen account hoeven te maken.",
    ],
    answer: 1,
    uitleg:
      "Apart team, eigenaar, gerichte guest access, label en lifecycle dekt scope en opruimen. A vermengt intern met extern, C en D geven veel te brede toegang.",
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een afdeling wil dat documenten in een Teams-kanaal alleen voor het team zichtbaar zijn, maar collega's blijken de bestanden via zoeken te kunnen openen. Hoe pak je dit het beste aan?",
    options: [
      "Je schakelt de zoekfunctie voor de volledige tenant uit zodat de bestanden niet meer in resultaten opduiken.",
      "Je verplaatst de bestanden naar een private of shared channel met een eigen afgeschermde site.",
      "Je hernoemt alle bestanden naar volledig onherkenbare termen zodat collega's ze niet meer via zoeken vinden.",
      "Je verzoekt de collega's vriendelijk om de via zoeken gevonden bestanden niet te openen of te delen.",
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
      "Je verwijdert periodiek handmatig de teams die door niemand meer gebruikt lijken te worden.",
      "Je stelt een Microsoft 365 groeps-expiration policy plus access reviews in zodat eigenaren actief verlengen.",
      "Je blokkeert het aanmaken van nieuwe teams volledig zodat de totale hoeveelheid niet verder kan blijven doorgroeien.",
      "Je archiveert alle oude teams en hun bijbehorende bestanden naar een centrale netwerkschijf buiten Microsoft 365 om.",
    ],
    answer: 1,
    uitleg:
      "Expiration policy met owner-bevestiging en access reviews is de structurele lifecycle-oplossing. A is reactief en foutgevoelig, C beperkt legitiem gebruik, D is geen passend medium voor Teams/SharePoint-data.",
  },
  // ── SharePoint / Azure Migrations ─────────────────────────────────────────────
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Een klant wil een fileserver-naar-SharePoint-migratie met minimale downtime. Wat is de eerste stap die het projectrisico het meest beperkt?",
    options: [
      "Buiten kantooruren in één keer alle data overzetten zonder enige voorafgaande analyse of zorgvuldige voorbereiding.",
      "Een discovery van datavolume, mappenstructuur, permissies en padlengtes doen als basis voor de mapping.",
      "De fileserver direct uitschakelen zodat niemand de brondata nog kan wijzigen tijdens de geplande overzetting.",
      "Vooraf alle gebruikers van nieuwe M365-licenties en bijbehorende accounts voorzien voor de migratie.",
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
      "De betreffende bestanden simpelweg overslaan en aan de klant melden dat ze helaas niet mee konden.",
      "Alle bestanden in één enkele volledig platte bibliotheek plaatsen, geheel zonder enige mappenstructuur of indeling.",
      "De structuur in overleg opsplitsen over sites zodat de paden binnen de limiet vallen, gedocumenteerd in de mapping.",
      "De vaste URL-lengtelimiet van SharePoint Online gewoon verhogen in de tenantinstellingen van de klant zelf.",
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
      "Direct de volledige dataset opnieuw migreren zonder eerst de werkelijke oorzaak grondig te onderzoeken.",
      "De migratierapporten raadplegen om te zien welke items en permissies faalden en zo de scope bepalen.",
      "De getroffen gebruikers vragen de ontbrekende bestanden zelf opnieuw te delen en helemaal in te richten.",
      "De oude bron-tenant per direct opheffen omdat de migratie nu formeel is afgerond en opgeleverd.",
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
      "De volledige migratie voor alle afdelingen tegelijk versnellen zodat iedereen meteen live kan gaan.",
      "De afdeling als afgebakende, vervroegde golf migreren, met validatie en rollback.",
      "De deadline weigeren en de afdeling laten wachten omdat de bredere pilot nog niet is afgerond.",
      "De afdeling meteen live zetten zonder enige validatie, omdat de tijd nu eenmaal echt dringt.",
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
      "De migratiejob telkens opnieuw starten tot het toevallig een keer zonder enige melding doorloopt.",
      "Het aantal parallelle threads juist nog verder opvoeren om de overdracht alsnog veel sneller af te ronden.",
      "De Retry-After respecteren, de concurrency terugschroeven en draaien in daluren conform de richtlijnen.",
      "Een support-ticket indienen met het dringende verzoek de throttling tijdelijk helemaal te laten uitschakelen.",
    ],
    answer: 2,
    uitleg:
      "429 betekent backen-off: Retry-After volgen, concurrency verlagen en in daluren draaien. A negeert de oorzaak, B verergert het, D is geen reële optie (service-throttling zet je niet uit).",
  },
  // ── Inforcer ──────────────────────────────────────────────────────────────────
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Je past een Inforcer-baseline toe op een Microsoft 365-omgeving. Wat moet vóór deployment geborgd zijn?",
    options: [
      "Dat de klant getekend akkoord geeft dat elke afwijking voortaan zonder vooraankondiging door de baseline wordt overschreven.",
      "Dat je de huidige config en drift kent, een break-glass account uitzondert en de CA-impact hebt beoordeeld.",
      "Dat er een recente, volledig geverifieerde en aantoonbaar herstelbare back-up van alle gebruikersmailboxen klaarstaat.",
      "Dat alle gebruikers vooraf hun sessies afmelden en zich daarna opnieuw aanmelden op de getroffen tenant.",
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
      "Naar alle tenants tegelijk pushen, zodat ze gegarandeerd identiek geconfigureerd en gelijkgeschakeld blijven.",
      "Eerst naar één tenant uitrollen, in report-only valideren en pas na bevestiging gefaseerd verder, met break-glass uitgezonderd.",
      "De baseline uitsluitend documenteren als referentie en bewust niet daadwerkelijk in de tenants afdwingen.",
      "De volledige uitrol 's nachts uitvoeren zonder enige voorafgaande validatie, zodat eindgebruikers er geen hinder van hebben.",
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
      "De gedetecteerde drift onmiddellijk en volledig automatisch terugzetten naar de goedgekeurde baseline op de tenant.",
      "De goedgekeurde baseline meteen aanpassen aan de live config zodat de drift formeel verdwijnt.",
      "Onderzoeken waarom de afwijking ontstond en of die legitiem is, en dan remediëren of de baseline bijwerken.",
      "De geconstateerde drift voorlopig volledig negeren zolang er nog geen concreet beveiligingsincident uit voortvloeit.",
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
      "Je zet de regel direct voor deze klant uit, zonder enige vastlegging of weging vooraf.",
      "Je weigert het verzoek principieel; de standaard-baseline geldt voor klanten gelijk.",
      "Je weegt risico, biedt een scoped uitzondering en legt de afwijking vast.",
      "Je verwijdert de regel definitief uit de centrale baseline die voor al je klanten geldt.",
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
      "Direct de strengst beschikbare baseline zonder nulmeting volledig afdwingen op de gehele klant-tenant.",
      "Een assessment- of alignment-scan draaien om de huidige staat en gaps in kaart te brengen.",
      "Wachten tot de klant zelf concreet aangeeft welke beveiligingsproblemen er spelen.",
      "Voor alle gebruikers meteen een MFA-reset forceren om het niveau ongericht en breed op te hogen.",
    ],
    answer: 1,
    uitleg:
      "Eerst meten (assessment/alignment) geeft de gaps zonder de omgeving te verstoren. A is roekeloos zonder nulmeting, C is passief, D is een ongerichte ingreep.",
  },
  // ── Basic IT & Troubleshooting ────────────────────────────────────────────────
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Outlook synchroniseert niet meer terwijl OWA wel correct werkt. Een nieuw Outlook-profiel gaf een authenticatiefout. Wat is de meest gerichte vervolgstap?",
    options: [
      "Office volledig de-installeren en daarna de hele Office-suite opnieuw uitrollen op dit klanttoestel.",
      "De opgeslagen credentials in Credential Manager opschonen zodat de client een schoon token ophaalt.",
      "De mailbox naar een andere database verplaatsen en daarna de volledige inhoud opnieuw laten indexeren.",
      "De gebruiker een nieuwe Exchange-licentie toewijzen en het account opnieuw activeren.",
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
      "De accu vervangen, omdat een zwakke cel mogelijk de slaapstand voortijdig onderbreekt op dit toestel.",
      "Windows opnieuw installeren om mogelijk beschadigde energie-instellingen volledig te herstellen.",
      "Met 'powercfg /lastwake' en '/devicequery wake_armed' de wake-bron achterhalen en die permissie uitzetten.",
      "De slaapstand volledig uitschakelen, zodat het toestel niet meer onverwacht uit zichzelf ontwaakt.",
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
      "De videokaart direct vervangen, omdat dergelijke artefacten meestal op defecte GPU-hardware wijzen.",
      "De applicatie volledig verwijderen en daarna schoon opnieuw laten installeren.",
      "Nagaan of de update de GPU-driver wijzigde en die gericht bijwerken of terugrollen.",
      "Het beeldscherm en de videokabel vervangen, omdat de weergave duidelijk verstoord oogt.",
    ],
    answer: 2,
    uitleg:
      "Artefacten in één app na een update wijzen op een gewijzigde GPU-driver; update of rollback is de gerichte stap. A en D vervangen hardware zonder bewijs, B raakt de driver niet.",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een tenant heeft legacy auth, zwakke adminhygiëne en brede SharePoint-sharing. Hoe prioriteer je het herstel?",
    options: [
      "Eerst de brede SharePoint-sharing inperken, want dat is voor gebruikers het zichtbaarst.",
      "Eerst admin-accounts beveiligen en legacy auth dichtzetten, dan pas de sharing.",
      "Alle drie de bevindingen gelijktijdig aanpakken in één gecombineerde tenantwijziging.",
      "Eerst gebruikers trainen op veilig delen en pas daarna de technische maatregelen treffen.",
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
      "Direct de centrale router herstarten en vervolgens afwachten of de verbinding daarna vanzelf terugkeert.",
      "De pc een paar keer opnieuw opstarten in de hoop dat de verbinding vanzelf herstelt.",
      "Afbakenen wat 'internet' is voor deze gebruiker en laag voor laag toetsen (link, IP, DNS, applicatie).",
      "De provider alvast bellen om een mogelijke regionale storing op de lijn voor deze locatie te laten controleren.",
    ],
    answer: 2,
    uitleg:
      "Omdat collega's geen last hebben is het waarschijnlijk lokaal; gestructureerd afbakenen en per laag toetsen is juist. A en B gokken, D escaleert extern zonder dat een brede storing aannemelijk is.",
  },
  // ── Werkhouding & Communicatie ────────────────────────────────────────────────
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Een collega heeft een ticket onvolledig overgedragen; de klant wacht inmiddels op een oplossing. Wat is de beste aanpak?",
    options: [
      "Je wacht eerst op de terugkomst van je collega zodat je de volledige context van het ticket compleet en duidelijk in beeld krijgt.",
      "Je stuurt het ticket meteen terug naar je collega met de mededeling dat de overdracht onvolledig was.",
      "Je pakt het ticket op, vult de ontbrekende context aan via het systeem en de klant, en koppelt kort terug aan je collega.",
      "Je sluit het ticket en verzoekt de klant het verzoek opnieuw en volledig in te dienen bij de servicedesk.",
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
      "Je werkt onverstoorbaar door en gaat ervan uit dat je de afgesproken deadline waarschijnlijk net haalt.",
      "Je informeert de betrokkenen proactief, geeft een realistische nieuwe verwachting of vraagt om herprioritering en legt dit vast.",
      "Je verlegt de deadline ongemerkt in het planningssysteem zodat de oorspronkelijke afspraak niet meer opvalt.",
      "Je wacht rustig af tot de klant zelf contact opneemt om te vragen waar de oplossing precies blijft.",
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
      "Je houdt het volledig voor je, want het probleem is opgelost en niemand binnen of buiten het team heeft het gemerkt.",
      "Je legt oorzaak en oplossing vast, meldt het intern volgens proces en bepaalt of de klant geïnformeerd moet worden.",
      "Je wacht rustig af of er vanuit de klant alsnog een klacht of melding over de korte storing binnenkomt.",
      "Je past de logging achteraf aan zodat de korte storing niet langer terug te vinden of zichtbaar is voor anderen.",
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
      "Je legt je huidige taak direct helemaal stil en schakelt volledig over naar het nieuwe, dringende verzoek toe.",
      "Je negeert het binnengekomen verzoek volledig totdat je huidige opdracht tot in detail is afgerond.",
      "Je weegt urgentie en impact van beide, stemt zo nodig de prioriteit af en communiceert je keuze.",
      "Je laat een beschikbare collega zonder enige vorm van overleg of afstemming je huidige taak overnemen.",
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
      "Je laat de bedrijfslaptop ingelogd staan zodat je na een korte pauze direct weer verder kunt werken eraan.",
      "Je gebruikt af en toe je eigen privélaptop wanneer de bedrijfslaptop op dat moment te traag aanvoelt om er vlot mee te werken.",
      "Je vergrendelt het scherm bij weglopen, werkt alleen op het beheerde toestel en houdt klantdata in goedgekeurde systemen.",
      "Je bewaart klantwachtwoorden voor het gemak lokaal in een los tekstbestand op de bedrijfslaptop zelf.",
    ],
    answer: 2,
    uitleg:
      "Vergrendelen, alleen het beheerde toestel en data binnen goedgekeurde systemen is de verantwoorde norm. A laat toegang open, B gebruikt onbeheerd, D is een ernstig datalek-risico.",
  },
  // ── Engels ────────────────────────────────────────────────────────────────────
  {
    domain: "Engels",
    type: "Leesbegrip",
    prompt:
      "Fortinet security advisory: 'A heap-based buffer overflow in FortiOS SSL-VPN may allow a remote unauthenticated attacker to execute arbitrary code. Fortinet is aware of an instance where this was exploited in the wild. Upgrade to a fixed release. If you cannot upgrade immediately, disable SSL-VPN as a workaround.' Which interpretation best matches the advisory?",
    options: [
      "The flaw only affects authenticated users, so the external network exposure stays quite limited.",
      "It is actively exploited; upgrade promptly and disable SSL-VPN only if you truly cannot upgrade now.",
      "Disabling SSL-VPN is the permanent fix, so upgrading the firmware is entirely optional in this case.",
      "The risk is only theoretical, since no real exploitation of this flaw has been observed yet anywhere.",
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
      "Keep Basic auth enabled for now but monitor those connections closely after the cutoff.",
      "Wait until the connections begin failing and then switch them over to Modern auth reactively.",
      "Move affected clients and service accounts to Modern authentication (OAuth) before the cutoff so they keep working.",
      "Request a tenant exemption so Basic auth keeps working for service accounts past the date.",
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
      "The VSS writer has become corrupt, so the shadow copy service itself must be reinstalled now.",
      "The configured backup target is currently offline and cannot be reached over the network at all.",
      "The source files are locked open by another running application holding them during the backup.",
      "There is not enough free space for the shadow copy, so storage must be freed or allocated soon.",
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
      "Reinstall the agent right away to restore the connection to the portal as quickly as you can.",
      "Confirm outbound TCP 443 connectivity to the cloud endpoints before any reinstall.",
      "Replace the device entirely because it is clearly no longer reporting in to the portal at all.",
      "Disable the firewall completely on the device so you can rule it out as the cause here.",
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
      "Only brand-new clients are affected, while existing connections keep working on TLS 1.0 or 1.1 fine.",
      "The service will automatically upgrade every client to TLS 1.2, so no action is needed at all here.",
      "Any client still using TLS 1.0 or 1.1 will fail to connect, so update applications to TLS 1.2+ first.",
      "TLS 1.2 is the protocol version being deprecated here, so clients must move back down to TLS 1.0 or 1.1.",
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
