// src/toets/illustraties/RtoRpo.tsx
// RTO en RPO op een tijdlijn van 08:00 tot 14:00: herstelpunten, storing en hersteltijd.
import { useState } from "react";
import { Badge, Group, Slider, Text } from "@mantine/core";
import { Keuzes, Klein, Kop, Legenda } from "./_gedeeld";

const VENSTER = 360; // minuten op de tijdlijn (08:00–14:00)
const RPO_DOEL = 15;
const RTO_DOEL = 120;

const klok = (m: number) => {
  const t = 480 + m;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};
const duur = (r: number) => (r >= 60 ? `${(r / 60).toString().replace(".", ",")} uur` : `${r} min`);
const pc = (x: number) => Math.min(100, (x / VENSTER) * 100);

export function RtoRpo() {
  const [interval, setInterval_] = useState(60);
  const [storing, setStoring] = useState(200);
  const [herstel, setHerstel] = useState(90);

  const laatsteBackup = Math.floor(storing / interval) * interval;
  const verloren = storing - laatsteBackup;
  const ticks: number[] = [];
  for (let m = 0; m <= VENSTER; m += interval) ticks.push(m);

  return (
    <div className="ill">
      <Kop titel="Back-up, RPO en RTO">
        Kies hoe vaak er een herstelpunt is, schuif het moment van de storing en de hersteltijd. Voorbeelddoelen: RPO 15 min, RTO 2 uur.
      </Kop>
      <Keuzes
        label="Herstelpunt"
        opties={[15, 60, 240].map((m) => ({ waarde: m, label: `elke ${m < 60 ? `${m} min` : `${m / 60} uur`}` }))}
        waarde={interval}
        onKies={setInterval_}
      />
      <div>
        <Text size="sm" c="dimmed">
          Storing om <b className="ill-mono" style={{ color: "var(--mantine-color-text)" }}>{klok(storing)}</b>
        </Text>
        <Slider min={5} max={355} value={storing} onChange={setStoring} label={klok} thumbLabel="Moment van de storing" color="campaiNavy" mt={6} />
      </div>
      <div>
        <Text size="sm" c="dimmed">
          Herstel duurt <b className="ill-mono" style={{ color: "var(--mantine-color-text)" }}>{duur(herstel)}</b>
        </Text>
        <Slider min={15} max={240} step={15} value={herstel} onChange={setHerstel} label={duur} thumbLabel="Hersteltijd" color="campaiNavy" mt={6} />
      </div>
      <div
        className="ill-tl"
        role="img"
        aria-label={`Tijdlijn: laatste herstelpunt ${klok(laatsteBackup)}, storing ${klok(storing)}, ${verloren} minuten data verloren, ${herstel} minuten plat.`}
      >
        <div className="ill-tl-seg ill-tl-safe" style={{ left: 0, width: `${pc(laatsteBackup)}%` }} />
        <div className="ill-tl-seg ill-tl-lost" style={{ left: `${pc(laatsteBackup)}%`, width: `${pc(verloren)}%` }} />
        <div className="ill-tl-seg ill-tl-down" style={{ left: `${pc(storing)}%`, width: `${pc(herstel)}%` }} />
        {ticks.map((m) => (
          <div key={m} className="ill-tick" style={{ left: `${pc(m)}%` }} />
        ))}
        <div className="ill-inc" style={{ left: `${pc(storing)}%` }} />
      </div>
      <div className="ill-tlaxis">
        <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span>
      </div>
      <Legenda
        items={[
          { label: "veilig in herstelpunt", stijl: { background: "var(--ill-ok-soft)", border: "1px solid var(--ill-ok)" } },
          { label: "verloren data (RPO)", stijl: { background: "var(--ill-bad)" } },
          { label: "webshop plat (RTO)", stijl: { background: "var(--ill-hi-soft)", border: "1px solid var(--ill-hi-strong)" } },
        ]}
      />
      <Group gap={8} aria-live="polite">
        <Badge
          variant="light"
          tt="none"
          className="ill-mono"
          color={verloren <= RPO_DOEL ? "campaiLime" : "campaiRed"}
          c={verloren <= RPO_DOEL ? "campaiLime.9" : undefined}
        >
          Verloren: {verloren} min data (RPO-doel {RPO_DOEL} min)
        </Badge>
        <Badge
          variant="light"
          tt="none"
          className="ill-mono"
          color={herstel <= RTO_DOEL ? "campaiLime" : "campaiRed"}
          c={herstel <= RTO_DOEL ? "campaiLime.9" : undefined}
        >
          Plat: {herstel} min (RTO-doel {RTO_DOEL} min)
        </Badge>
      </Group>
      <Klein>
        Een replica vervangt geen back-up: een per ongeluk verwijderde tabel wordt direct mee gekopieerd. Alleen een herstelpunt van vóór de fout helpt.
      </Klein>
    </div>
  );
}
