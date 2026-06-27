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
      "Een gebruiker kan Outlook Web openen, maar niet inloggen op de Outlook desktop client na een security policy wijziging. Wat controleer je eerst?",
    options: [
      "Alleen de mailboxgrootte, omdat een volle mailbox de client blokkeert",
      "Conditional Access, sign-in logs, de authenticatiemethode en de client-app-policy",
      "Windows volledig opnieuw installeren om de client te resetten",
      "De gebruiker vragen om van internetprovider te wisselen",
    ],
    answer: 1,
  },
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Een gebruiker meldt dat hij vanuit een als risicovol aangemerkt land geen toegang heeft tot zijn e-mail via Outlook. De manager heeft goedkeuring gegeven voor tijdelijke toegang. Wat is de meest gecontroleerde aanpak?",
    options: [
      "Het Conditional Access-beleid volledig uitschakelen voor de duur van de reis",
      "De gebruiker toevoegen aan een uitsluitingsgroep van de betreffende Conditional Access-policy en een geplande taak instellen om hem op de einddatum te verwijderen",
      "Een nieuw M365-account aanmaken voor de gebruiker zonder Conditional Access-restricties",
      "De gebruiker adviseren een persoonlijk apparaat te gebruiken dat niet onder het bedrijfsbeleid valt",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Een klant meldt dat e-mails vanuit hun domein regelmatig in de spambox van ontvangers belanden. Bij analyse blijkt dat SPF correct is, maar DKIM en DMARC ontbreken. Wat is de juiste volgorde van acties?",
    options: [
      "Eerst DMARC instellen op p=reject, daarna DKIM activeren en tot slot SPF aanpassen",
      "DKIM activeren in de M365-beheerportal, de DKIM-records publiceren in DNS, daarna een DMARC-record toevoegen met een monitoring-policy (p=none) en geleidelijk aanscherpen",
      "Het SPF-record uitbreiden met alle mogelijke mailservers en DKIM en DMARC negeren",
      "De domeinnaam wijzigen zodat de slechte reputatie van het huidige domein geen rol meer speelt",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Microsoft 365",
    type: "Scenario",
    prompt:
      "Een gebruiker vraagt om een bericht uit quarantaine vrij te geven en heeft zelf al een release-verzoek ingediend dat je in het Security Center ziet. Wat is de juiste werkwijze?",
    options: [
      "Het bericht altijd direct vrijgeven, want de gebruiker heeft het zelf aangevraagd",
      "Het bericht beoordelen op basis van de headers, afzender en inhoud voordat het wordt vrijgegeven; bij twijfel blokkeren en de gebruiker informeren",
      "De volledige quarantaine-instelling uitschakelen zodat gebruikers geen last meer hebben van geblokkeerde berichten",
      "Het bericht vrijgeven en de afzender direct op de whitelist zetten om herhaling te voorkomen",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Microsoft 365",
    type: "Security assessment",
    prompt:
      "Welke combinatie geeft het beste startpunt voor een M365 security assessment bij een nieuwe klant?",
    options: [
      "Alleen Secure Score bekijken en het percentage rapporteren",
      "Identity, Conditional Access, legacy auth, adminrollen, external sharing, mailflow en endpoint compliance samen beoordelen",
      "Alleen de Exchange-mailboxgroottes controleren en opschonen",
      "Alleen vragen of de klant ergens MFA gebruikt",
    ],
    answer: 1,
  },
  {
    domain: "Microsoft 365",
    type: "Entra ID",
    prompt:
      "Je ziet risky sign-ins en er is geen duidelijk break-glass proces. Wat hoort in je advies?",
    options: [
      "Alle risky users direct verwijderen en later opnieuw aanmaken",
      "MFA en CA valideren, break-glass accounts borgen, adminrollen beperken en monitoring/alerting vastleggen",
      "Alle gebruikers global admin maken zodat support sneller kan helpen",
      "Alle sign-in logs wissen zodra de actie is afgerond",
    ],
    answer: 1,
  },

  // ── Azure ────────────────────────────────────────────────────────────────
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Een externe auditor vraagt om leesrechten in de Azure Entra-omgeving van een klant. De technicus overweegt de Global Reader-rol toe te kennen. Wat is de meest verantwoorde aanpak?",
    options: [
      "De Global Reader-rol direct toekennen, want het is een read-only rol en dus inherent veilig",
      "De auditor een tijdelijk gastaccount geven met Global Reader-rol en dit na de audit direct intrekken",
      "De risico's van Global Reader bespreken met de klant, een alternatief aanbieden (gerichte data-export) en de beslissing afstemmen met de verantwoordelijke accountmanager",
      "De auditor toegang geven via een gedeeld beheerdersaccount zodat er geen extra licentie nodig is",
    ],
    answer: 2,
    source: "Thread",
  },
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Microsoft kondigt aan dat Azure Blueprints wordt uitgefaseerd. Een klant gebruikt Blueprints actief voor resource-governance en deny-assignments. Wat is de aanbevolen migratiestrategie?",
    options: [
      "Wachten tot de retirement-datum en dan pas actie ondernemen, want bestaande resources worden niet verwijderd",
      "Overstappen naar Azure Policy voor alle governance-taken, want Blueprints en Policy zijn functioneel identiek",
      "Migreren naar Azure Deployment Stacks voor resource-groepering en deny-assignments, en blueprint-definities opslaan als template specs of in Git",
      "De Blueprints exporteren als ARM-templates en handmatig uitvoeren via de Azure CLI bij elke deployment",
    ],
    answer: 2,
    source: "Thread",
  },
  {
    domain: "Azure",
    type: "Scenario",
    prompt:
      "Een klant heeft meerdere Azure Reserved VM Instances voor oudere VM-series. Microsoft meldt dat aankoop en verlenging van deze RI's binnenkort niet meer mogelijk zijn. Wat is het grootste risico als de klant geen actie onderneemt?",
    options: [
      "De bestaande VM's worden automatisch uitgeschakeld zodra de RI verloopt",
      "De VM-workloads worden na het verlopen van de RI's gefactureerd tegen pay-as-you-go-tarieven, ook als auto-renew is ingesteld",
      "De klant verliest alle opgeslagen data op de VM's omdat de schijven worden verwijderd",
      "De RI's worden automatisch omgezet naar een nieuwere VM-serie zonder extra kosten",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Azure",
    type: "Fundamentals",
    prompt:
      "Een klant vraagt waarom een eenvoudige webworkload beter in Azure App Service dan op een losse VM kan draaien. Wat is het sterkste antwoord?",
    options: [
      "Omdat App Service altijd goedkoper is dan elke denkbare VM",
      "Omdat App Service platformbeheer, schaalopties en deployment vereenvoudigt terwijl de klant minder OS-beheer hoeft te doen",
      "Omdat App Service geen monitoring of back-up nodig heeft",
      "Omdat een VM technisch nooit geschikt is voor webapplicaties",
    ],
    answer: 1,
  },
  {
    domain: "Azure",
    type: "Governance",
    prompt:
      "Een engineer wil snel rechten op een hele Azure-subscription om een incident op te lossen. Wat is de beste MSP-aanpak?",
    options: [
      "Owner-rechten permanent toekennen zodat vertraging wordt voorkomen",
      "De minimaal benodigde rol en scope bepalen, tijdelijk (bv. via PIM) toekennen, logging vastleggen en achteraf intrekken",
      "Het wachtwoord van een global admin delen voor de duur van het incident",
      "Alle resource locks verwijderen zodat niets de oplossing blokkeert",
    ],
    answer: 1,
  },

  // ── Kaseya Stack ─────────────────────────────────────────────────────────
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Een monitoring-alert meldt dat een Datto-backup op meerdere servers mislukt met de fout 'Backup failed because backup image files have not been decrypted'. De fout herhaalt zich al meerdere dagen. Wat is de meest gerichte eerste actie?",
    options: [
      "Alle servers opnieuw opstarten en wachten of de backup de volgende nacht slaagt",
      "De Datto-encryptiesleutel controleren en resetten in de Datto-beheerconsole, en een ticket openen bij de leverancier als het probleem aanhoudt",
      "De backup-agent verwijderen en opnieuw installeren op alle betrokken servers",
      "De backup-policy verwijderen en een nieuwe aanmaken met dezelfde instellingen",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Bij een onboarding-verzoek ziet een technicus in het PSA-systeem de melding: 'Bekijk in IT Glue OOK de SOP-procedure voor de klantspecifieke onboarding!' Waarom is dit belangrijk?",
    options: [
      "IT Glue bevat de inloggegevens van de nieuwe medewerker die je nodig hebt om het account aan te maken",
      "Elke klant kan afwijkende onboarding-stappen hebben (specifieke apps, netwerkmappen, licenties) die niet in de standaard workflow zitten maar wel in de klantspecifieke SOP in IT Glue staan",
      "IT Glue stuurt automatisch een welkomstmail naar de nieuwe medewerker zodra je de SOP opent",
      "De SOP in IT Glue vervangt het onboarding-formulier en moet worden ingevuld in plaats van het standaard formulier",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Kaseya Stack",
    type: "Scenario",
    prompt:
      "Een technicus krijgt een EDR/BullPhish-gerelateerde alert dat een medewerker een automatische e-mailforwardingregel naar een extern adres heeft aangemaakt. Wat is de juiste eerste reactie?",
    options: [
      "De forwardingregel direct verwijderen omdat externe doorstuurregels altijd een beveiligingsrisico zijn",
      "Contact opnemen met de medewerker om te verifiëren of de regel bewust is aangemaakt; pas ingrijpen als dit niet zo is of als er andere verdachte signalen zijn",
      "Het account van de medewerker direct blokkeren en een wachtwoordreset forceren",
      "De alert negeren omdat forwardingregel-alerts altijd false positives zijn",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Kaseya Stack",
    type: "IT Glue / documentatie",
    prompt:
      "Je moet met spoed de juiste runbook en wachtwoorden vinden voor een server bij een klant die je niet kent. Hoe gebruik je IT Glue het meest effectief, inclusief de AI-zoekfunctie?",
    options: [
      "De documentatie van een vergelijkbare klant kopiëren en aannemen dat die ook hier klopt",
      "Op de juiste organisatie filteren, de gekoppelde configuration items en runbooks openen en de AI/Smart-zoekfunctie inzetten om snel de relevante asset te vinden",
      "In de algemene chat van het team vragen of iemand het wachtwoord toevallig weet",
      "Een nieuw document aanmaken met je eigen aannames omdat zoeken te lang duurt",
    ],
    answer: 1,
  },
  {
    domain: "Kaseya Stack",
    type: "Samenhang stack",
    prompt:
      "Een Datto RMM-alert over hoge schijfvulling komt binnen. Hoe laat je Autotask, IT Glue en de klantcommunicatie hier goed op aansluiten?",
    options: [
      "Alleen de schijf opschonen en het alert sluiten zonder verdere registratie",
      "Impact bepalen, een Autotask-ticket aanmaken of bijwerken, de klantspecifieke documentatie in IT Glue raadplegen, de oorzaak verhelpen en de klant of collega informeren",
      "Wachten tot de schijf vol is en de server vanzelf een melding geeft",
      "Het alert doorsturen naar de klant en hen zelf laten oplossen",
    ],
    answer: 1,
  },

  // ── Fortigate ────────────────────────────────────────────────────────────
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een medewerker meldt dat hij vanuit het buitenland geen verbinding kan maken met de SSL-VPN van het bedrijf. De technicus controleert de instellingen op de Fortigate en ziet dat alles correct geconfigureerd lijkt. Wat is de meest logische eerste diagnosestap?",
    options: [
      "De SSL-VPN-tunnel opnieuw aanmaken en de gebruiker een nieuw certificaat uitsturen",
      "Controleren of de gebruiker lid is van de juiste SSL-VPN-gebruikersgroep op de Fortigate",
      "De Fortigate-firmware updaten naar de nieuwste versie om mogelijke bugs op te lossen",
      "De firewall-policy voor SSL-VPN tijdelijk uitschakelen om te testen of de policy het probleem veroorzaakt",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een klant meldt dat er 's ochtends geen internetverbinding was. Na onderzoek blijkt dat de Fortigate-firewall een automatische firmware-update heeft uitgevoerd en daarna tijdelijk niet bereikbaar was. De klant vraagt of automatische updates uitgeschakeld moeten worden. Wat is het beste advies?",
    options: [
      "Automatische updates volledig uitschakelen, want stabiliteit is altijd belangrijker dan actuele firmware",
      "Automatische updates laten staan, maar een onderhoudsvenster instellen zodat updates buiten kantooruren plaatsvinden",
      "Overstappen op een andere firewall-leverancier die geen automatische updates uitvoert",
      "Automatische updates uitschakelen en firmware alleen handmatig bijwerken als er een kritieke CVE is gepubliceerd",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een monitoring-alert meldt dat een VPN-tunnel naar een vestiging volledig onbereikbaar is (ping faalt 10/10 keer). De Fortigate op de hoofdlocatie is online en reageert. Wat is de meest efficiënte eerste stap om de oorzaak te achterhalen?",
    options: [
      "Direct een nieuwe VPN-tunnel aanmaken tussen de twee locaties als tijdelijke workaround",
      "Controleren of de Fortigate of het netwerkapparaat op de externe vestiging stroom heeft en online is",
      "De VPN-configuratie op de hoofdlocatie volledig verwijderen en opnieuw opbouwen",
      "Een ticket aanmaken bij de internetprovider van de hoofdlocatie voor een lijnstoring",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Een gebruiker wil tijdelijk vanuit een land werken dat normaal geblokkeerd is door de geo-IP-policy op de Fortigate. De manager heeft goedkeuring gegeven. Wat is de meest gecontroleerde aanpak?",
    options: [
      "De geo-IP-policy permanent aanpassen zodat het betreffende land altijd toegang heeft",
      "De gebruiker een persoonlijk VPN-abonnement laten aanschaffen om de geo-blokkering te omzeilen",
      "Tijdelijk een uitzondering instellen voor de specifieke gebruiker of het IP-adres, met een geplande taak om de toegang op de einddatum automatisch in te trekken",
      "De volledige geo-IP-filtering uitschakelen voor de duur van de reis om problemen te voorkomen",
    ],
    answer: 2,
    source: "Thread",
  },
  {
    domain: "Fortigate",
    type: "Scenario",
    prompt:
      "Na een Fortigate-firmware-update meldt een klant dat de memory-usage structureel hoog is en de firewall traag reageert. De vorige firmware had dit probleem niet. Wat is de juiste aanpak?",
    options: [
      "De Fortigate vervangen door een model met meer RAM, want de hardware is verouderd",
      "De memory-conserving-instellingen op de Fortigate beoordelen en eventueel terugkeren naar de vorige stabiele firmware als het probleem aanhoudt",
      "Alle IPS- en applicatiecontrole-profielen uitschakelen om het geheugengebruik te verlagen",
      "De Fortigate een factory reset geven en de configuratie opnieuw handmatig invoeren",
    ],
    answer: 1,
    source: "Thread",
  },

  // ── AI / Copilot ─────────────────────────────────────────────────────────
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Je wilt een AI-assistent gebruiken om sneller een lastig PowerShell-probleem op te lossen voor een klantomgeving. Wat is de veiligste werkwijze?",
    options: [
      "De volledige tenant-id, gebruikersnamen en wachtwoorden plakken zodat de AI exact kan meedenken",
      "Het probleem geanonimiseerd beschrijven zonder klant-PII of secrets, en de voorgestelde code zelf reviewen voordat je die in productie draait",
      "De gegenereerde code direct als global admin uitvoeren omdat AI zelden fouten maakt",
      "De AI vragen om automatisch verbinding te maken met de klant-tenant en alles zelf te wijzigen",
    ],
    answer: 1,
  },
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Een klant wil Microsoft 365 Copilot uitrollen voor alle medewerkers. Wat is een essentiële voorbereiding die je adviseert vóór de uitrol?",
    options: [
      "Niets bijzonders; Copilot respecteert automatisch alle bedoelde beperkingen",
      "Eerst de SharePoint/OneDrive-rechten en oversharing opschonen, want Copilot toont gebruikers alles waar hun account al toegang toe heeft",
      "Eerst voor iedereen de bestaande mailboxen leegmaken om ruis te beperken",
      "Eerst alle gebruikers global admin maken zodat Copilot overal bij kan",
    ],
    answer: 1,
  },
  {
    domain: "AI / Copilot",
    type: "Scenario",
    prompt:
      "Een collega gebruikt een publieke AI-chatbot om een klantcontract samen te vatten en plakt de volledige tekst inclusief namen erin. Wat is de juiste reactie?",
    options: [
      "Niets zeggen; samenvatten is efficiënt en bespaart tijd",
      "Uitleggen dat vertrouwelijke klantgegevens niet in publieke AI-tools horen en wijzen op een goedgekeurde, afgeschermde tool met databorging",
      "Zelf ook contracten in dezelfde tool plakken omdat het blijkbaar mag",
      "De collega publiekelijk in de teamchat berispen zonder uitleg",
    ],
    answer: 1,
  },
  {
    domain: "AI / Copilot",
    type: "Praktijk",
    prompt:
      "Je laat een AI-tool een conceptantwoord op een complexe klantvraag schrijven. Hoe ga je verantwoord met het resultaat om voordat je het verstuurt?",
    options: [
      "Het antwoord ongelezen doorsturen omdat AI sneller en accurater is dan jij",
      "De inhoud zelf controleren op feitelijke juistheid en toon, aanpassen waar nodig en pas dan versturen onder je eigen verantwoordelijkheid",
      "Aan de klant melden dat het antwoord door AI is gemaakt en dus mogelijk fout is",
      "Het antwoord alleen versturen als het lang genoeg lijkt om professioneel over te komen",
    ],
    answer: 1,
  },
  {
    domain: "AI / Copilot",
    type: "Praktijk",
    prompt:
      "Wanneer is het inzetten van een GenAI-assistent in de eigen tooling (zoals AI-zoeken in IT Glue) het meest waardevol voor een servicedesk?",
    options: [
      "Om beslissingen volledig te automatiseren zonder dat een engineer meekijkt",
      "Om sneller de juiste documentatie, runbooks of eerdere oplossingen terug te vinden, terwijl de engineer het resultaat verifieert",
      "Om klanten rechtstreeks met de AI te laten chatten zonder tussenkomst",
      "Om tickets automatisch te sluiten zodra de AI denkt dat het is opgelost",
    ],
    answer: 1,
  },

  // ── VoIP ─────────────────────────────────────────────────────────────────
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Een klant belt dat bellers buiten kantooruren een foutmelding horen ('Deze actie kan niet worden voltooid') in plaats van een vriendelijk voicemailbericht. De technicus kijkt in de telefooncentrale. Wat is de meest waarschijnlijke oorzaak?",
    options: [
      "De SIP-trunk is uitgevallen waardoor inkomende gesprekken niet worden gerouteerd",
      "Het tijdschema in de telefooncentrale staat op een verkeerd tijdstip ingesteld, waardoor de overloop te vroeg of te laat activeert",
      "De voicemailbox is vol en accepteert geen nieuwe berichten meer",
      "De internetverbinding van de klant is te traag voor VoIP-verkeer buiten kantooruren",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Een klant heeft drie belgroepen. Oproepen die via het keuzemenu direct bij belgroep 3 binnenkomen, worden bij geen gehoor niet doorgeschakeld naar belgroep 1. Wat is de juiste oplossing?",
    options: [
      "Een apart inbelnummer aanmaken voor belgroep 3 zodat de routing onafhankelijk werkt",
      "Een overflow-instelling toevoegen aan belgroep 3 die na een ingesteld aantal seconden doorschakelt naar belgroep 1",
      "Belgroep 3 samenvoegen met belgroep 1 zodat alle oproepen altijd bij dezelfde groep terechtkomen",
      "De wachttijd in belgroep 3 verlengen zodat er meer tijd is om op te nemen",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Een klant wil het algemene telefoonnummer tijdelijk doorschakelen naar een intern toestelnummer omdat de receptie afwezig is. Wat is de snelste en meest gecontroleerde aanpak?",
    options: [
      "Het algemene nummer opheffen en een nieuw nummer aanmaken dat direct naar het interne toestel belt",
      "De doorschakeling instellen in de telefooncentrale en bij de klant bevestigen dat het werkt; bij een tijdelijke situatie ook een einddatum afspreken",
      "De klant instrueren om zelf de doorschakeling in te stellen via de app op zijn telefoon",
      "Een automatisch antwoordapparaat instellen dat bezoekers vraagt later terug te bellen",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Na een herstructurering bij een klant zijn veel contactpersonen en toestelnummers gewijzigd in het VoIP-platform. De klant vraagt of medewerkers dit zelf kunnen bijwerken. Wat is het juiste antwoord?",
    options: [
      "Ja, elke medewerker kan zijn eigen contactgegevens aanpassen via de gebruikersapp",
      "Nee, contactgegevens en toestelnummers worden centraal beheerd door de MSP via het beheersysteem en worden gesynchroniseerd naar alle gebruikers",
      "Nee, de klant moet een nieuw VoIP-contract afsluiten om wijzigingen door te voeren",
      "Ja, maar alleen de IT-beheerder van de klant heeft toegang tot de beheeromgeving",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "VoIP",
    type: "Scenario",
    prompt:
      "Een klant vraagt om de voicemail eenmalig twee uur eerder te activeren vanwege vroege sluiting. Wat is de professionele werkwijze?",
    options: [
      "De klant uitleggen dat eenmalige aanpassingen niet mogelijk zijn en een vast schema adviseren",
      "Het tijdschema in de telefooncentrale tijdelijk aanpassen voor die dag en de klant bevestigen dat de wijziging actief is",
      "De voicemail permanent twee uur eerder instellen zodat dit in de toekomst niet meer gevraagd hoeft te worden",
      "De klant instrueren om zelf de voicemail in te schakelen via de app op het moment dat ze willen sluiten",
    ],
    answer: 1,
    source: "Thread",
  },

  // ── Servers ──────────────────────────────────────────────────────────────
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een RDS-server reageert traag voor alle gebruikers tegelijk. Het CPU-gebruik is hoog, maar er is geen specifiek proces als boosdoener te identificeren. Gebruikers kunnen doorwerken maar ondervinden vertraging. Wat is de snelste en minst risicovolle eerste actie?",
    options: [
      "Direct alle gebruikerssessies beëindigen en de server opnieuw opstarten zonder overleg",
      "Alle gebruikers laten weten dat ze hun werk opslaan, daarna de server gecontroleerd herstarten na bevestiging",
      "De server uitbreiden met extra RAM via de hypervisor-console als tijdelijke maatregel",
      "Een nieuw RDS-profiel aanmaken voor elke gebruiker om sessiecorruptie uit te sluiten",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een monitoring-alert meldt een onverwachte server-shutdown (BSOD-event) op een productieserver. De server is inmiddels weer online en alles lijkt te werken. Wat is de juiste vervolgactie?",
    options: [
      "Het alert sluiten omdat de server vanzelf hersteld is en er geen gebruikersklachten zijn",
      "De Windows Event Viewer en minidump-bestanden analyseren om de oorzaak te achterhalen en herhaling te voorkomen",
      "De server direct opnieuw opstarten om eventuele geheugenproblemen te verhelpen",
      "De server vervangen, want een BSOD op een productieserver betekent altijd hardwarefalen",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een fileserver-volume nadert 95% schijfgebruik en de back-ups beginnen te falen. De klant kan niet meteen extra opslag aanschaffen. Wat is de meest verantwoorde eerste aanpak?",
    options: [
      "Direct de oudste bestanden permanent verwijderen om snel ruimte vrij te maken",
      "De grootste verbruikers analyseren, tijdelijke en logbestanden opschonen, de groei rapporteren en met de klant een opschaling of opschoning afspreken",
      "De back-up uitschakelen zodat die niet meer faalt op de alerts",
      "Het volume vergroten zonder overleg en de kosten achteraf doorbelasten",
    ],
    answer: 1,
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Je moet een kritieke beveiligingsupdate uitrollen op een productieserver die overdag intensief wordt gebruikt. Wat is de professioneelste aanpak?",
    options: [
      "Direct overdag patchen en herstarten, want beveiliging gaat boven alles",
      "Een onderhoudsvenster afstemmen, een recente back-up of snapshot borgen, patchen in het venster en de status terugkoppelen aan de klant",
      "De update overslaan omdat herstarten te veel impact heeft",
      "De update installeren maar het herstarten oneindig uitstellen",
    ],
    answer: 1,
  },
  {
    domain: "Servers",
    type: "Scenario",
    prompt:
      "Een Hyper-V-host draait meerdere VM's en je merkt dat één VM af en toe vastloopt door geheugendruk op de host. Wat is de meest gerichte stap?",
    options: [
      "Alle VM's op de host uitschakelen tot de klant nieuwe hardware koopt",
      "Het geheugengebruik en de dynamic-memory-instellingen per VM analyseren, prioriteiten/limieten bijstellen en zo nodig een VM verplaatsen of de host opschalen",
      "De vastlopende VM telkens handmatig herstarten zonder verdere analyse",
      "Alle VM's op vaste maximale geheugentoewijzing zetten om zekerheid te creëren",
    ],
    answer: 1,
  },

  // ── SharePoint / Teams ───────────────────────────────────────────────────
  {
    domain: "SharePoint / Teams",
    type: "Governance",
    prompt:
      "Een Teams-omgeving heeft veel gastgebruikers en niemand weet wie eigenaar is. Wat toets je eerst?",
    options: [
      "Alle gasten blokkeren zonder impactanalyse",
      "Owners, gasttoegang, external sharing, lifecycle, sensitivity labels en dataclassificatie",
      "Alle kanalen hernoemen voor een opgeruimde structuur",
      "Alleen controleren of Teams kan bellen",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een gebruiker heeft per ongeluk een hele documentbibliotheek met een 'iedereen'-link extern gedeeld. Wat is de juiste combinatie van acties?",
    options: [
      "De bibliotheek verwijderen en opnieuw aanmaken om de link kwijt te raken",
      "De gedeelde link intrekken, controleren of er ongewenste toegang is geweest, het organisatie-breed sharingbeleid herzien en de gebruiker uitleg geven",
      "Niets doen omdat alleen mensen met de link erbij kunnen",
      "Alleen de gebruiker waarschuwen en de link laten bestaan",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Een afdeling vraagt om een nieuwe Teams-omgeving voor een tijdelijk project met externe partners. Hoe richt je dit het beste in?",
    options: [
      "Een privékanaal in een bestaand algemeen team aanmaken en iedereen handmatig toevoegen",
      "Een nieuw team met duidelijke eigenaren opzetten, gerichte gasttoegang regelen, een sensitivity label en een einddatum/lifecycle voor opruiming afspreken",
      "Bestanden via persoonlijke OneDrive delen zodat er geen team nodig is",
      "De externe partners global guest-rechten op de hele tenant geven",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Teams",
    type: "Scenario",
    prompt:
      "Gebruikers klagen dat ze in Teams telkens de verkeerde of verouderde versie van een document openen. Wat is de beste structurele oplossing?",
    options: [
      "Iedereen vragen het bestand lokaal op te slaan en per e-mail te versturen",
      "Bestanden in het juiste SharePoint-gekoppelde kanaal centraal bewaren, co-authoring en versiegeschiedenis benutten en losse kopieën opruimen",
      "Voor elke versie een nieuw bestand met datum in de naam aanmaken",
      "Versiegeschiedenis uitschakelen zodat er maar één versie bestaat",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Teams",
    type: "Kennisdiepte",
    prompt:
      "Wat wil je minimaal in kaart brengen om iemands SharePoint/Teams-kennis goed te beoordelen?",
    options: [
      "Alleen of iemand bestanden kan uploaden",
      "Sitestructuur, Teams-kanalen, rechten, guests, sensitivity labels, lifecycle, governance en adoptie",
      "Alleen of iemand in Teams kan bellen",
      "Alleen of SharePoint Online überhaupt bestaat",
    ],
    answer: 1,
  },

  // ── SharePoint / Azure Migrations ────────────────────────────────────────
  {
    domain: "SharePoint / Azure Migrations",
    type: "Project",
    prompt:
      "Een klant wil een SharePoint-migratie met minimale downtime. Welk migratieplan is het sterkst?",
    options: [
      "Een big-bang copy in het weekend zonder voorafgaande discovery",
      "Inventarisatie, rechtenreview, pilot, gefaseerde migratie, delta-sync, communicatie en een rollback-plan",
      "Alleen de nieuwste bestanden kopiëren en de rest later",
      "Gebruikers zelf hun eigen data laten verplaatsen",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Tijdens een fileserver-naar-SharePoint-migratie ontdek je diepe mappenstructuren met paden die de URL-lengtelimiet overschrijden. Wat is de juiste aanpak?",
    options: [
      "De migratie afblazen omdat SharePoint hier niet geschikt voor is",
      "De structuur vooraf herontwerpen (vlakkere hiërarchie, metadata, kortere namen) en in de pilot valideren voordat je de volledige migratie uitvoert",
      "Alle bestanden hernoemen naar willekeurige korte codes en de betekenis loslaten",
      "De te lange paden gewoon overslaan en niet migreren",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Na een tenant-to-tenant-migratie melden gebruikers dat sommige gedeelde bestanden en machtigingen ontbreken. Wat is de juiste eerste stap?",
    options: [
      "Alle gebruikers opnieuw full control geven om de klachten te laten stoppen",
      "De migratie-rapportage en het rechtenmapping-overzicht raadplegen om te bepalen welke permissies niet zijn overgekomen en gericht herstellen",
      "De hele migratie terugdraaien en opnieuw beginnen",
      "Gebruikers vragen de bestanden zelf opnieuw te delen en het verder te laten rusten",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Scenario",
    prompt:
      "Je plant de cutover van een grote migratie. Hoe beperk je downtime en risico tijdens de overgang het beste?",
    options: [
      "De cutover op een drukke maandagochtend doen zodat je direct support kunt geven",
      "Vooraf het grootste deel kopiëren, vlak voor cutover een delta-sync draaien, in een rustig venster overzetten en een rollback- en communicatieplan klaarhebben",
      "Alle data pas tijdens de cutover in één keer kopiëren om dubbel werk te voorkomen",
      "De oude omgeving direct verwijderen zodra de kopie is gestart",
    ],
    answer: 1,
  },
  {
    domain: "SharePoint / Azure Migrations",
    type: "Migratiekennis",
    prompt:
      "Welke onderdelen tonen echte migratiekennis bij een SharePoint/Azure-migratie?",
    options: [
      "Alleen bestanden van A naar B slepen",
      "Discovery, rechtenanalyse, toolingkeuze, pilot, delta-sync, cutover, rollback, communicatie en nazorg",
      "Alleen een geschikte datum in de agenda plannen",
      "Alleen de benodigde licenties tellen",
    ],
    answer: 1,
  },

  // ── Inforcer ─────────────────────────────────────────────────────────────
  {
    domain: "Inforcer",
    type: "Configuratie",
    prompt:
      "Je past een Inforcer-baseline toe op een Microsoft 365-omgeving. Wat moet vóór deployment geborgd zijn?",
    options: [
      "Niets, baselines zijn altijd veilig om direct uit te rollen",
      "De baselineversie, de uitzonderingen, een rollout-ring, een rollback-plan en de audit-approval",
      "Alleen het aantal beschikbare licenties",
      "Alleen de browsercache van de eindgebruiker",
    ],
    answer: 1,
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Je wilt via Inforcer een Conditional Access-baseline naar meerdere klant-tenants uitrollen. Hoe beperk je het risico van een verkeerde uitrol?",
    options: [
      "In één keer naar alle tenants pushen zodat iedereen tegelijk compliant is",
      "Eerst in een pilot-tenant testen, gefaseerd uitrollen, monitoren op uitsluitingen voor break-glass accounts en pas daarna breed deployen",
      "De baseline alleen op papier documenteren en handmatig per tenant overtypen",
      "De baseline uitrollen buiten kantooruren zonder iemand te informeren",
    ],
    answer: 1,
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Bij een klant blijkt de live M365-configuratie afgeweken van de goedgekeurde Inforcer-baseline (configuration drift). Wat is de juiste reactie?",
    options: [
      "De drift negeren omdat de omgeving nog werkt",
      "De afwijkingen analyseren, beoordelen of het bewuste uitzonderingen of ongewenste wijzigingen zijn, en de baseline of de tenant gecontroleerd in lijn brengen",
      "Direct de hele baseline opnieuw forceren zonder de afwijkingen te onderzoeken",
      "De baseline aanpassen aan de huidige situatie zodat er geen drift meer wordt gemeld",
    ],
    answer: 1,
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Een klant vraagt om één specifieke beleidsregel uit de standaard-baseline uit te zetten omdat die hun workflow hindert. Hoe ga je hiermee om?",
    options: [
      "De volledige baseline voor die klant uitschakelen om gedoe te voorkomen",
      "Het beveiligingsrisico bespreken, een gerichte gedocumenteerde uitzondering vastleggen met goedkeuring en de rest van de baseline intact laten",
      "De regel stilletjes uitzetten zonder dit ergens vast te leggen",
      "De klant vertellen dat aanpassingen aan de baseline nooit mogelijk zijn",
    ],
    answer: 1,
  },
  {
    domain: "Inforcer",
    type: "Scenario",
    prompt:
      "Je onboardt een nieuwe klant en wilt hun beveiligingsniveau snel inzichtelijk maken met Inforcer. Wat is de meest zinvolle eerste stap?",
    options: [
      "Meteen de strengste baseline forceren voordat je de omgeving kent",
      "De huidige tenant-configuratie inlezen, vergelijken met de baseline om de gaps te zien en op basis daarvan een gefaseerd remediation-plan opstellen",
      "Alleen vragen of de klant tevreden is over zijn beveiliging",
      "De baseline pas inzetten nadat er een incident is geweest",
    ],
    answer: 1,
  },

  // ── Basic IT & Troubleshooting ───────────────────────────────────────────
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een gebruiker meldt dat Outlook niet meer synchroniseert, maar dat OWA (webmail) wél correct werkt. De technicus heeft al geprobeerd een nieuw Outlook-profiel aan te maken, maar krijgt een foutmelding. Wat is de meest logische vervolgstap?",
    options: [
      "De M365-licentie van de gebruiker intrekken en opnieuw toewijzen om de mailbox te resetten",
      "De opgeslagen credentials in Windows Referentiebeheer verwijderen en opnieuw inloggen; als dat niet werkt, overstappen op Outlook Classic",
      "De volledige Office-suite verwijderen en opnieuw installeren via de Microsoft 365-portal",
      "Een nieuwe mailbox aanmaken voor de gebruiker en de oude mailbox als gedeelde mailbox instellen",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een laptop verlaat automatisch de slaapstand, ook als hij in een tas zit. De gebruiker meldt dat dit al langer speelt op Windows 11. Wat is de meest gerichte diagnosestap?",
    options: [
      "De laptop direct resetten naar fabrieksinstellingen, want dit is een hardwareprobleem",
      "Controleren welke wake-timers actief zijn via powercfg en de energiebeheerinstellingen aanpassen om ongewenste wake-events te blokkeren",
      "De batterij vervangen, want een defecte batterij kan slaapstandproblemen veroorzaken",
      "Windows 11 downgraden naar Windows 10, want slaapstandproblemen zijn een bekend Windows 11-issue",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Scenario",
    prompt:
      "Een gebruiker meldt grafische problemen in een technische applicatie na een recente Windows-update; de applicatie werkt niet meer correct. Wat is de juiste aanpak?",
    options: [
      "De Windows-update terugdraaien via systeemherstel, want updates veroorzaken altijd grafische problemen",
      "De grafische drivers bijwerken via de GPU-beheertool en de juiste GPU (dedicated vs. geïntegreerd) toewijzen aan de applicatie in de driver-instellingen",
      "De applicatie verwijderen en opnieuw installeren zonder verdere diagnose",
      "De monitor vervangen, want het probleem zit in de beeldschermhardware",
    ],
    answer: 1,
    source: "Thread",
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Security scenario",
    prompt:
      "Een tenant heeft legacy auth, zwakke adminhygiëne en brede SharePoint-sharing. Hoe prioriteer je het herstel?",
    options: [
      "Eerst cosmetische branding en thema's aanpassen",
      "Het attack path bepalen, identity-risico's sluiten, datadeling beperken en changes met rollback en communicatie plannen",
      "Alle gebruikers tegelijk blokkeren tot alles is opgelost",
      "Alleen een rapport sturen zonder concreet hersteladvies",
    ],
    answer: 1,
  },
  {
    domain: "Basic IT & Troubleshooting",
    type: "Methodiek",
    prompt:
      "Een gebruiker meldt vaag 'het internet doet het niet', terwijl collega's geen problemen hebben. Wat is de meest gestructureerde eerste stap?",
    options: [
      "Direct de internetrouter van het hele kantoor herstarten",
      "De scope afbakenen: nagaan of het één apparaat, één applicatie of de hele verbinding betreft, en stap voor stap van lokaal naar netwerk uitsluiten",
      "Aannemen dat het de provider is en meteen een storingsticket indienen",
      "De gebruiker een nieuwe laptop geven om het probleem te omzeilen",
    ],
    answer: 1,
  },

  // ── Werkhouding & Communicatie ───────────────────────────────────────────
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Een collega draagt een ticket slecht over, waardoor jij extra werk hebt en de klant ontevreden is. Wat is de beste reactie?",
    options: [
      "De collega publiekelijk aanspreken in de groepschat",
      "Eerst de klant helpen, de feiten vastleggen, de overdracht rustig met de collega bespreken en een structurele verbetering voorstellen",
      "Het ticket zonder toelichting terugzetten naar de collega",
      "Niets doen, want het was tenslotte niet jouw fout",
    ],
    answer: 1,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Je ziet dat je planning volloopt en een klantissue waarschijnlijk niet op tijd wordt opgepakt. Wat doe je?",
    options: [
      "Wachten tot iemand er expliciet naar vraagt",
      "De prioriteit en impact bepalen, tijdig communiceren, om hulp vragen en de afspraken bijwerken",
      "Alleen de makkelijkste tickets sluiten om je aantallen op peil te houden",
      "Het ticket op pending zetten zonder uitleg",
    ],
    answer: 1,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Je ontdekt dat je zelf een wijziging hebt doorgevoerd die een korte storing bij een klant heeft veroorzaakt. Niemand heeft het gemerkt. Wat doe je?",
    options: [
      "Niets zeggen, want het is alweer opgelost en het valt verder niet op",
      "De oorzaak en je eigen aandeel transparant vastleggen, je teamlead informeren en een maatregel voorstellen om herhaling te voorkomen",
      "De logging aanpassen zodat de wijziging niet meer naar jou te herleiden is",
      "Wachten tot de klant er zelf over begint en dan pas reageren",
    ],
    answer: 1,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Je krijgt buiten je normale taken een dringend verzoek van een klant terwijl je al druk bent met een geplande opdracht. Wat is de beste aanpak?",
    options: [
      "Het verzoek negeren omdat het niet jouw verantwoordelijkheid is",
      "De urgentie en impact inschatten, dit kort afstemmen met je teamlead of de klant en samen de prioriteit en verwachting helder maken",
      "Direct alles laten vallen voor de nieuwe vraag zonder iemand te informeren",
      "De klant vertellen dat ze maar een ticket moeten aanmaken en verder niets doen",
    ],
    answer: 1,
  },
  {
    domain: "Werkhouding & Communicatie",
    type: "Situational judgement",
    prompt:
      "Je krijgt een bedrijfslaptop met toegang tot klantomgevingen en werkt regelmatig vanuit huis. Hoe ga je het meest verantwoord met dit bedrijfsmiddel en de toegang om?",
    options: [
      "Het toestel en de opgeslagen wachtwoorden delen met huisgenoten als dat handiger werkt",
      "Het toestel vergrendeld en up-to-date houden, geen credentials delen, en bij verlies of een vermoedelijk beveiligingsincident direct melden",
      "Beveiligingsupdates uitstellen omdat ze je werk onderbreken",
      "Klantgegevens lokaal op je privé-USB-stick bewaren voor het gemak",
    ],
    answer: 1,
  },

  // ── Engels ───────────────────────────────────────────────────────────────
  {
    domain: "Engels",
    type: "English assessment",
    prompt:
      "Write the best short customer update in English after a Microsoft 365 incident where service is restored but monitoring continues.",
    options: [
      "Fixed now, no worries.",
      "Service has been restored. We are monitoring the environment and will share a final update once we have confirmed stability.",
      "The problem is probably gone for now.",
      "You caused the issue and we already fixed it.",
    ],
    answer: 1,
  },
  {
    domain: "Engels",
    type: "English assessment",
    prompt:
      "A customer emails angrily that an issue is still not solved. Which reply is the most professional and clear in English?",
    options: [
      "Calm down, it is not as bad as you think.",
      "I understand this is frustrating. I have reviewed your ticket, here is the current status, and this is the next step with a timeframe.",
      "That is not really our problem, please contact your supplier.",
      "We are very busy right now, so please be patient and wait.",
    ],
    answer: 1,
  },
  {
    domain: "Engels",
    type: "English assessment",
    prompt:
      "You need to explain to a non-technical English-speaking user why they must enable multi-factor authentication. Which explanation is best?",
    options: [
      "You must enable MFA because the policy says so and there is no other option.",
      "MFA adds a second check after your password, so even if someone steals your password they still cannot sign in as you.",
      "MFA is a token-based challenge-response protocol layered on top of your primary credential store.",
      "Just turn it on, it is complicated to explain and you would not understand it anyway.",
    ],
    answer: 1,
  },
  {
    domain: "Engels",
    type: "English assessment",
    prompt:
      "Choose the most professional way to ask an English-speaking customer for more information needed to investigate their problem.",
    options: [
      "Send me everything you have so I can maybe figure it out.",
      "To investigate this further, could you let me know when the issue started and share a screenshot of the error message?",
      "I cannot do anything until you give me details, so hurry up.",
      "Your description is too vague for me to even begin working on this.",
    ],
    answer: 1,
  },
  {
    domain: "Engels",
    type: "English assessment",
    prompt:
      "During a call with an international colleague you did not fully understand a technical request. What is the best professional response in English?",
    options: [
      "Pretend you understood and hope you can figure it out later.",
      "Just to make sure I understand correctly, could you confirm whether you need X or Y before I proceed?",
      "Your English is hard to follow, please write it down instead.",
      "Let us skip this part, it is probably not that important anyway.",
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
