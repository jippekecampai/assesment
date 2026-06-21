# Campai Recruitment Assessment

Static prototype voor een Campai-only MSP recruitment assessment app.

## Scope

- Reviewdashboard voor Servicedesk Engineer, Cloud Engineer, Modern Work Consultant, Sales en Technical Account Manager.
- Kandidaattest met lokale autosave.
- Campai Skills Academy voor interne training met medewerker-home, career plan, leerpaden, modulevoortgang, XP, badges en teamchallenges.
- Technische domeinen, werkhouding, klantcommunicatie, samenwerking en Engelse taalvaardigheid.
- Vragenfabriek voor het omzetten van Campai-bronmateriaal naar gereviewde assessmentvragen.
- Governance-view voor auditability, rubricversies, brondataregels en menselijke review.
- Profiel- en adminpaneel met approllen, documentatiekaart en lokaal wijzigingslog.

## Aanbevolen Campai Databronnen

Gebruik geanonimiseerde bronpakketten in plaats van ruwe tickets in de app:

- Autotask tickets and escalations
- Datto RMM alerts and remediation notes
- IT Glue SOPs and client runbooks
- Microsoft 365, SharePoint, Teams, and Azure incidents
- SharePoint/Azure migration project retrospectives
- Inforcer baseline exceptions and rollout notes
- Kaseya-stack cases: Autotask, Datto RMM, IT Glue, EDR en BullPhish
- SharePoint/Teams governance cases: sites, Teams-kanalen, rechten, guests, lifecycle en sensitivity
- Migratiecases: discovery, tooling, pilot, cutover, delta sync, rollback en nazorg
- Fortigate and VoIP troubleshooting cases
- Sales discovery notes and QBR summaries
- Gedragsinterviews met senior engineers, consultants, TAM's en managers
- Engelse klantupdates, incidentcommunicatie en vendorcommunicatie

Vraaggeneratie moet altijd human-approved zijn. Toon geen klantnamen, gebruikers, domeinen, IP-adressen, contractwaardes, credentials of klant-specifieke geheimen aan kandidaten.

## Admin en wijzigingsdocumentatie

Deze app is voor nu single-tenant en Campai-only. Het dashboard bevat een profiel- en adminpaneel voor:

- Approllen: Assessment Admin, Reviewer, Question Author en Candidate.
- Documentatiekaart: wat wordt waar vastgelegd voor profiel, rollen, vragenbank, kandidaatresultaten, bronmateriaal, governancebesluiten en wijzigingen.
- Wijzigingslog: dashboardacties worden lokaal vastgelegd met actor, tijdstip, actie en context.

## Campai Skills Academy

De Academy gebruikt dezelfde domeinen en rolwegingen als recruitment, maar met een ander doel: interne ontwikkeling en coaching. Trainingrapporten krijgen `usageMode: campai-internal-training` en moeten gescheiden worden beoordeeld van kandidaatrapporten.

- Leerprofiel per medewerker met huidige rol, doelrol, XP, level en badges.
- Skill-gap analyse naar doelrol op basis van bestaande rolwegingen.
- Medewerker-home met inbox/next review/next 1:1/next steps, taken en coachingacties.
- Career plan met actieve rol, doelrol, vorige rolcontext, performance/XP en gekoppelde leerdoelen.
- Onboard & Learn tabel met modules, type, domein, progress, status en een detailmodal voor link, statusupdate, comment en timeline.
- Aanbevolen modules met praktijkbewijs, zoals Conditional Access triage, Azure restore, Datto RMM alertflow, Fortigate VPN, SharePoint governance en klantcommunicatie.
- Uitgebreide modules en vragen op basis van gereviewde open-source inspiratie rond Azure Fundamentals, M365 security assessments, attack-path analyse, secure automation en security awareness. Zie `CONTENT_SOURCES.md`.
- Gamification stuurt gewenst MSP-gedrag: veilige werkwijze, documentatie, klantcommunicatie en herbruikbare teamprocessen.
- Teamchallenge vermijdt individuele ranglijsten als primair mechanisme; samenwerking en bewijs wegen zwaarder dan snelheid.

Let op: trainingdata is ontwikkeldata. Gebruik dit niet als automatische HR-beoordeling zonder duidelijke governance, retentiebeleid en medewerkercommunicatie.

Let op: het huidige adminpaneel is functioneel voor prototype- en reviewdoeleinden. Productiegebruik vereist server-side autorisatie via Microsoft Entra ID, bij voorkeur met app roles of security groups. Vertrouw niet alleen op front-end rolweergave.

Elke codewijziging hoort kort vastgelegd te worden in `CHANGELOG.md` met datum, scope, reden en risico/follow-up.

## Starten

Gebruik:

```powershell
npm run dev
```

Open daarna `http://127.0.0.1:4173`.

## Azure testomgeving

Deze app is voor nu single-tenant en Campai-only opgezet.

- Resource group: `rg-cmp-assessment-test`
- Regio: `westeurope`
- App Service plan: `cmp-asp-assessment-test-weu-001`
- Web App: `cmp-app-assessment-test-weu-001`
- URL: `https://cmp-app-assessment-test-weu-001.azurewebsites.net`
- Storage account: `cmpassesstestweu001`
- Tabel: `AssessmentResults`
- SSO: App Service Authentication met Microsoft Entra ID

Let op: Azure Storage accountnamen mogen geen streepjes bevatten. Daarom volgt de storage accountnaam de `cmp` conventie zonder `-`.
