# Campai Recruitment Assessment

Static prototype voor een Campai-only MSP recruitment assessment app.

## Scope

- Reviewdashboard voor Servicedesk Engineer, Cloud Engineer, Modern Work Consultant, Sales en Technical Account Manager.
- Kandidaattest met lokale autosave.
- Technische domeinen, werkhouding, klantcommunicatie, samenwerking en Engelse taalvaardigheid.
- Vragenfabriek voor het omzetten van Campai-bronmateriaal naar gereviewde assessmentvragen.
- Governance-view voor auditability, rubricversies, brondataregels en menselijke review.

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

## Starten

Gebruik:

```powershell
npm run dev
```

Open daarna `http://127.0.0.1:4173`.
