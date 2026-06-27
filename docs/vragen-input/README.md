# Vragen-input (drop-zone voor gegenereerde vragen)

Zet hier je gegenereerde vragen neer als **één of meer `.json`-bestanden** (bv.
`thread-batch-1.json`, `azure.json`). Ik valideer ze, controleer kwaliteit
(diepgang, geen klant-PII, exact één juist antwoord) en verwerk ze in de
vragenbank (seed of via de goedkeurflow).

## Verwacht formaat
Een JSON-**array** van vraag-objecten, exact zo:

```json
[
  {
    "domain": "Azure",
    "type": "Scenario",
    "prompt": "Een klantworkload draait op een losse VM met handmatige patches en geen schaalopties. Wat is de sterkste verbetering en waarom?",
    "options": [
      "Een grotere VM nemen zodat er meer capaciteit is.",
      "Migreren naar een PaaS/managed dienst zodat patching, schaal en beschikbaarheid door het platform geregeld worden.",
      "Handmatig een tweede VM bijzetten als koude reserve.",
      "Niets wijzigen; documenteren als acceptabel risico."
    ],
    "answer": 1,
    "source": "Thread"
  }
]
```

## Regels
- `domain` = exact één van: `Microsoft 365`, `Azure`, `Kaseya Stack`, `Fortigate`,
  `AI / Copilot`, `VoIP`, `Servers`, `SharePoint / Teams`,
  `SharePoint / Azure Migrations`, `Inforcer`, `Basic IT & Troubleshooting`,
  `Werkhouding & Communicatie`, `Engels`. (IT Glue → `Kaseya Stack`; AI-tooling → `AI / Copilot`.)
- `options` = precies 4, alle plausibel; `answer` = index 0–3 van het beste antwoord.
- `source` = herkomst (bv. `Thread`, `IT Glue`, `Ticket`). Optioneel.
- Geen klantnamen/PII; diepgang boven definities.

Laat me weten zodra je een bestand hebt neergezet, dan pak ik 'm op.
