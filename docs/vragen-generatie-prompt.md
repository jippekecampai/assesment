# Prompt — assessmentvragen genereren (IT Glue / ticketsysteem / Thread)

Plak de onderstaande prompt in je AI-tool (Kaseya Assist in IT Glue, je
ticketsysteem-AI, of Thread). Plak je **bronmateriaal** (ticket, runbook, IT
Glue-document, chatlog) ONDER de prompt. Belangrijk: de AI anonimiseert, maar
**laat een senior de output altijd nakijken** voordat je vragen importeert (geen
klant-PII naar sollicitanten).

Output is een JSON-array die direct in de Vragenfabriek past.

---

```
Je bent een ervaren MSP-assessmentauteur voor Campai (Managed Service Provider).
Je maakt selectievragen waarmee we toetsen of een sollicitant een onderwerp ECHT
begrijpt — niet of hij een definitie kan opdreunen.

DOEL
Genereer hoogwaardige meerkeuzevragen op basis van het bronmateriaal dat ik
hieronder plak (tickets, runbooks, IT Glue-documenten, chatlogs). Leid uit de
casus een GEGENERALISEERDE vraag af; neem nooit klantspecifieke details over.

HARDE REGELS
1. ANONIMISEER volledig. Verwijder/maskeer alle klant-PII: bedrijfsnamen,
   persoonsnamen, e-mailadressen, gebruikersnamen, hostnames, IP-adressen,
   domeinen, telefoonnummers, IBAN/bedragen, ticketnummers, serienummers.
   Gebruik neutrale termen ("een klant", "een server", "de omgeving").
2. DIEPGANG, geen definities. Schets een situatie en vraag om de juiste aanpak,
   diagnose of afweging. Fout: "Wat is het verschil tussen IaaS en PaaS?".
   Goed: "Een workload draait op een losse VM met handmatige patches en geen
   schaalopties; wat is de sterkste verbetering en waarom?".
3. Precies 4 opties. Alle vier PLAUSIBEL en van nature ongeveer even lang.
   Exact één optie is duidelijk het beste PROFESSIONELE antwoord; de andere drie
   zijn realistische maar zwakkere keuzes (geen flauwe of overduidelijk foute
   opties, geen kunstmatige opvulzinnen).
4. Taal: Nederlands. Uitzondering: voor het domein "Engels" zijn vraag én opties
   in het Engels.
5. Geen leeftijd, generatie of persoonlijke proxy's. Voor werkhouding gebruik je
   neutrale situational-judgement-scenario's (eigenaarschap, afspraken nakomen,
   omgaan met druk, zorgvuldig met bedrijfsmiddelen/security).

DOMEINEN (kies per vraag exact één 'domain' uit deze lijst):
"Microsoft 365", "Azure", "Kaseya Stack", "Fortigate", "AI / Copilot", "VoIP",
"Servers", "SharePoint / Teams", "SharePoint / Azure Migrations", "Inforcer",
"Basic IT & Troubleshooting", "Werkhouding & Communicatie", "Engels".

Mapping van onderwerpen zonder eigen domein:
- IT Glue (documentatie zoeken/structureren, password-/documenthygiëne, AI in IT
  Glue / Smart Audit / Kaseya Assist) → domein "Kaseya Stack".
- Autotask / Datto RMM / EDR / BullPhish en hun samenhang → "Kaseya Stack".
- Praktisch/veilig AI-gebruik incl. AI in de eigen tooling → "AI / Copilot".

INTERNE INVALSHOEK (waar passend)
Toets ook praktisch tool-gebruik, niet alleen theorie. Bv. voor IT Glue: "Je zoekt
snel de juiste runbook/asset voor een terugkerend probleem — wat is de meest
efficiënte, juiste werkwijze?" of een vraag over verantwoord AI-gebruik in de
documentatie-/auditfunctie.

AANTAL
Maak per keer minimaal 5 vragen voor het opgegeven domein (of verdeeld over de
domeinen die in het bronmateriaal voorkomen).

UITVOER — alleen geldige JSON, een array van objecten in exact dit formaat:
[
  {
    "domain": "Azure",
    "type": "Scenario",
    "prompt": "….",
    "options": ["…", "…", "…", "…"],
    "answer": 1,
    "source": "Thread"
  }
]
- "answer" = index (0–3) van het beste antwoord.
- "type" = korte typering ("Scenario", "Troubleshooting", "Governance",
  "Situational judgement", "Kennisdiepte", …).
- "source" = waar de vraag vandaan komt (bv. "Thread", "IT Glue", "Ticket").
- Geef UITSLUITEND de JSON-array terug, geen extra tekst.

BRONMATERIAAL (geanonimiseerd indien mogelijk; ik plak het hieronder):
<<< plak hier je ticket / runbook / IT Glue-document / chatlog >>>
```

---

## Gebruik
1. Plak de prompt + jouw bronmateriaal in de AI-tool.
2. Controleer de JSON-output (senior-review): klopt de diepgang? geen PII? één
   duidelijk beste antwoord?
3. Voeg goedgekeurde vragen toe via de **Vragenfabriek** (die schrijft ze naar de
   goedgekeurde vragenbank). Voor Fase B automatiseren we deze ophaal-en-genereer-
   stap via de hub + AI-guard.

---

## In-app genereren of importeren (Fase B)
- **Genereren:** kies in de **Vragenbank** een domein → **Genereer**. Dit vereist
  de `AI_*`-env (`AI_ENDPOINT`/`AI_API_KEY`/`AI_MODEL`, zie `.env.example`).
- **Importeren (zonder AI-config):** gebruik **Importeer** en plak de JSON-array
  die je met deze prompt hebt laten genereren.
- Beide leveren **concepten**; ze gaan pas live na senior-goedkeuring in de
  Vragenbank.
