// src/toets/illustraties/Migratie.tsx
// Migratie naar SharePoint/Azure met cutover: fases op een tijdlijn, per fase wat er gebeurt, wat de
// gebruiker merkt en het risico; een rollback-pad bij een mislukte cutover; en waarom delta-syncs de
// cutover kort houden (in het venster gaat alleen over wat sinds de laatste sync veranderde).
import { useState } from "react";
import { Badge, Button, Group, Text } from "@mantine/core";
import { Keuzes, Klein, Kop } from "./_gedeeld";

// ---- Model: fases ----
type Fase = { id: string; naam: string; gebeurt: string; merkt: string; risico: string; bron: "in gebruik" | "alleen-lezen" | "uit" | "reserve" };
const FASES: Fase[] = [
  {
    id: "inv",
    naam: "Inventarisatie",
    gebeurt: "Sites, shares, mappen, rechten, eigenaren en grootte in kaart brengen. Te lange paden en ongeldige tekens vinden. Opruimen wat niet mee hoeft.",
    merkt: "Niets, hooguit een vraag van de eigenaar wat er mee moet.",
    risico: "Wat je hier mist (een vergeten share, rechten op één map) duikt pas na de cutover op.",
    bron: "in gebruik",
  },
  {
    id: "pilot",
    naam: "Pilot",
    gebeurt: "Een kleine groep migreert eerst en werkt een tijd in de nieuwe omgeving. Aanpak, rechten en instructies worden bijgesteld.",
    merkt: "Pilotgebruikers werken al in de nieuwe omgeving; de rest merkt niets.",
    risico: "Een te kleine of te makkelijke pilot verstopt de problemen van de echte groep.",
    bron: "in gebruik",
  },
  {
    id: "bulk",
    naam: "Bulkmigratie",
    gebeurt: "Het grootste deel van de data wordt gekopieerd terwijl iedereen gewoon in de bron blijft werken. Bij veel data duurt dit lang.",
    merkt: "Niets: iedereen werkt nog in de bron.",
    risico: "Throttling en bestanden die niet over kunnen. Lees de foutrapporten na, niet alleen het totaal.",
    bron: "in gebruik",
  },
  {
    id: "delta",
    naam: "Delta-syncs",
    gebeurt: "Herhaald alleen kopiëren wat sinds de vorige sync nieuw of gewijzigd is. Elke ronde is kleiner dan de vorige.",
    merkt: "Niets.",
    risico: "Wie nu al in de nieuwe omgeving werkt, ziet zijn werk overschreven worden. Afspraak: het doel is nog niet in gebruik.",
    bron: "in gebruik",
  },
  {
    id: "cutover",
    naam: "Cutover",
    gebeurt: "Bron op alleen-lezen, laatste delta-sync, verwijzingen omzetten (snelkoppelingen, OneDrive-sync, Teams-tabbladen, DNS), go/no-go-check, gebruikers starten in het doel.",
    merkt: "Een kort moment kan er niet worden opgeslagen; daarna werken ze in de nieuwe locatie.",
    risico: "Het spannendste moment. Leg vooraf vast wanneer je terugdraait, zodat dat geen discussie wordt.",
    bron: "alleen-lezen",
  },
  {
    id: "nazorg",
    naam: "Nazorg",
    gebeurt: "Hypercare: servicedesk extra bereikbaar, ontbrekende rechten of mappen snel herstellen. De bron blijft een afgesproken periode als reserve bestaan.",
    merkt: "Nieuwe locatie; soms mist er iets, dat wordt snel opgelost.",
    risico: "De bron te vroeg weggooien: dan is er geen weg terug meer.",
    bron: "reserve",
  },
];
const CUTOVER = FASES.findIndex((f) => f.id === "cutover");

const ROLLBACK = [
  { titel: "No-go", tekst: "De afgesproken check faalt binnen het cutovervenster: besluit terugdraaien." },
  { titel: "Bron weer open", tekst: "Alleen-lezen eraf: de bron is weer de werkplek." },
  { titel: "Verwijzingen terug", tekst: "Snelkoppelingen, sync en DNS weer naar de bron." },
  { titel: "Communicatie", tekst: "Gebruikers horen kort en duidelijk: werk verder op de oude plek." },
  { titel: "Opnieuw plannen", tekst: "Oorzaak oplossen, nieuwe datum. De data in het doel blijft: de volgende delta-sync bouwt erop verder." },
];

// ---- Model: delta-sync ----
// Voorbeeld-aanname, zichtbaar in de figuur: per dag verandert hooguit 1% van de data.
const WIJZIGING_PER_DAG = 1;
type Laatste = "geen" | "bulk" | "week" | "dag";
const LAATSTE: Record<Laatste, { label: string; dagen: number | null }> = {
  geen: { label: "Geen voorwerk: alles in het venster", dagen: null },
  bulk: { label: "Alleen bulk, 21 dagen terug", dagen: 21 },
  week: { label: "Delta-sync 7 dagen terug", dagen: 7 },
  dag: { label: "Delta-sync gisteren", dagen: 1 },
};
/** Deel van de data (%) dat in het cutovervenster nog over moet. Bovengrens: dezelfde bestanden kunnen vaker wijzigen. */
const inVenster = (l: Laatste) => {
  const d = LAATSTE[l].dagen;
  return d === null ? 100 : Math.min(100, d * WIJZIGING_PER_DAG);
};

export function Migratie() {
  const [fase, setFase] = useState(0);
  const [fout, setFout] = useState(false);
  const [laatste, setLaatste] = useState<Laatste>("dag");
  const f = FASES[fase];

  const kies = (i: number) => {
    setFase(i);
    if (i !== CUTOVER) setFout(false);
  };
  const wisselFout = () => {
    if (!fout) setFase(CUTOVER);
    setFout(!fout);
  };
  const pct = inVenster(laatste);
  const bronStand = fout ? "weer in gebruik" : f.bron;

  return (
    <div className="ill">
      <Kop titel="Een migratie met cutover">
        Klik door de fases. Tot de cutover werkt iedereen gewoon in de bron; daarna in het doel.
      </Kop>

      <ol className="ill-mg-tl" aria-label="Fases van de migratie">
        {FASES.map((x, i) => (
          <li key={x.id}>
            <button
              type="button"
              className={`ill-mg-fase ${i < fase ? "is-klaar" : ""} ${i === fase ? "is-nu" : ""} ${fout && i === CUTOVER ? "is-fout" : ""}`}
              aria-current={i === fase ? "step" : undefined}
              aria-pressed={i === fase}
              onClick={() => kies(i)}
            >
              <span className="ill-mg-nr">{i + 1}</span>
              <span>{x.naam}</span>
            </button>
          </li>
        ))}
      </ol>
      <Group gap={8}>
        <Button size="xs" variant="default" disabled={fase === 0} onClick={() => kies(fase - 1)}>← Vorige</Button>
        <Button size="xs" variant="default" disabled={fase === FASES.length - 1} onClick={() => kies(fase + 1)}>Volgende →</Button>
        <Button size="xs" color="campaiRed" variant={fout ? "filled" : "outline"} aria-pressed={fout} onClick={wisselFout}>
          Fout bij cutover
        </Button>
      </Group>

      <div className="ill-mg-omg" aria-hidden="true">
        <div className={`ill-mg-box ${bronStand === "in gebruik" || bronStand === "weer in gebruik" ? "is-actief" : ""}`}>
          <b>Bron</b>
          <small>{bronStand}</small>
        </div>
        <span className={`ill-mg-pijl ${fout ? "is-terug" : ""}`}>{fout ? "← terug" : fase >= 2 && fase <= CUTOVER ? "kopieert →" : "→"}</span>
        <div className={`ill-mg-box ${!fout && fase >= CUTOVER ? "is-actief" : ""}`}>
          <b>Doel</b>
          <small>{fout ? "niet in gebruik" : fase > CUTOVER ? "in gebruik" : fase === CUTOVER ? "gebruikers starten" : fase === 1 ? "alleen pilotgroep" : fase > 1 ? "wordt gevuld" : "nog niet in gebruik"}</small>
        </div>
      </div>

      <div className="ill-mg-kaarten" aria-live="polite">
        <div className="ill-mg-kaart">
          <Badge size="sm" color="campaiNavy" variant="light">Wat er gebeurt</Badge>
          <Text size="sm">{f.gebeurt}</Text>
        </div>
        <div className="ill-mg-kaart">
          <Badge size="sm" color="campaiCyan" variant="light">Wat de gebruiker merkt</Badge>
          <Text size="sm">{f.merkt}</Text>
        </div>
        <div className="ill-mg-kaart is-risico">
          <Badge size="sm" color="campaiRed" variant="light">Risico</Badge>
          <Text size="sm">{f.risico}</Text>
        </div>
      </div>

      {fout && (
        <div className="ill-mg-rollback" aria-live="polite">
          <Text size="sm" fw={700}>Rollback-pad</Text>
          <ol className="ill-mg-rb">
            {ROLLBACK.map((r, i) => (
              <li key={r.titel}>
                <span className="ill-mg-nr">{i + 1}</span>
                <div><b>{r.titel}</b><small>{r.tekst}</small></div>
              </li>
            ))}
          </ol>
          <Klein>Terugdraaien kan alleen omdat de bron nog bestaat en alleen op alleen-lezen stond. Daarom ruim je de bron pas op na de nazorg.</Klein>
        </div>
      )}

      <div className="ill-mg-delta">
        <Text size="sm" fw={700}>Waarom delta-sync de downtime kort houdt</Text>
        <Keuzes label="Laatste sync vóór de cutover" waarde={laatste} onKies={setLaatste}
          opties={(Object.keys(LAATSTE) as Laatste[]).map((l) => ({ waarde: l, label: LAATSTE[l].label }))} />
        <div className="ill-mg-meter" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <Text size="sm" aria-live="polite">
          In het cutovervenster moet nog <b className="ill-mono">≤ {pct}%</b> van de data over
          {pct === 100 ? ": de hele kopie terwijl niemand kan werken." : ". Hoe recenter de laatste sync, hoe korter gebruikers niet kunnen opslaan."}
        </Text>
        <Klein>Voorbeeld-aanname: per dag verandert hooguit {WIJZIGING_PER_DAG}% van de data. Het is een bovengrens; vaak wijzigen dezelfde bestanden.</Klein>
      </div>
    </div>
  );
}
