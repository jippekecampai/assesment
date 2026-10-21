// src/toets/illustraties/VoipGesprek.tsx
// Een VoIP-gesprek over internet: SIP (signalering) en RTP (spraak) als aparte stromen, en wat
// jitter, pakketverlies, latency en een SIP ALG op de firewall doen met wat de beller hoort.
// Waarheid eerst: beoordeel() is het hele model; elke kleur, label en tip komt daaruit.
import "./illustraties-2.css";
import { Fragment, useState } from "react";
import { Badge, Button, Group, Slider, Text } from "@mantine/core";
import { Kop } from "./_gedeeld";

// ---------- Model ----------
type Niveau = "goed" | "matig" | "slecht";
type Meting = "latency" | "jitter" | "verlies";

/** Vuistregels (geen norm): onder `goed` is goed, tot `matig` is matig, daarboven slecht. */
const DREMPELS: Record<Meting, { naam: string; eenheid: string; goed: number; matig: number; max: number; stap: number }> = {
  latency: { naam: "Latency", eenheid: "ms", goed: 150, matig: 300, max: 500, stap: 10 },
  jitter: { naam: "Jitter", eenheid: "ms", goed: 30, matig: 50, max: 100, stap: 1 },
  verlies: { naam: "Pakketverlies", eenheid: "%", goed: 1, matig: 3, max: 10, stap: 0.1 },
};

const RANG: Record<Niveau, number> = { goed: 0, matig: 1, slecht: 2 };

function niveauVan(m: Meting, w: number): Niveau {
  const d = DREMPELS[m];
  return w < d.goed ? "goed" : w <= d.matig ? "matig" : "slecht";
}

type Waarden = Record<Meting, number>;

function beoordeel(w: Waarden, sipAlg: boolean) {
  const per = { latency: niveauVan("latency", w.latency), jitter: niveauVan("jitter", w.jitter), verlies: niveauVan("verlies", w.verlies) };
  const slechtste = (Object.values(per) as Niveau[]).reduce((a, b) => (RANG[b] > RANG[a] ? b : a), "goed");
  const totaal: Niveau = sipAlg ? "slecht" : slechtste;

  let hoort: string;
  if (sipAlg) hoort = "Eén kant hoort niets (eenrichtingsgeluid), of het gesprek valt na ±30 seconden weg.";
  else if (totaal === "goed") hoort = "Helder: de stem komt vloeiend en zonder vertraging aan.";
  else if (per.verlies === "slecht" || per.jitter === "slecht") hoort = "Wegvallend: hele woorden vallen weg, robotstem.";
  else if (per.verlies === "matig" || per.jitter === "matig") hoort = "Haperend: af en toe een tik of een weggevallen klank.";
  else hoort = "Vertraagd: je praat door elkaar heen, soms echo.";

  const tips: string[] = [];
  if (sipAlg) tips.push("Zet SIP ALG uit op de firewall. De ALG herschrijft SIP-berichten verkeerd, waardoor RTP naar het verkeerde adres of de verkeerde poort gaat.");
  if (per.jitter !== "goed" || per.verlies !== "goed") tips.push("QoS: geef spraak voorrang (DSCP EF) en zet de toestellen in een eigen voice-VLAN.");
  if (per.verlies !== "goed" || per.latency !== "goed") tips.push("Zorg voor voldoende bandbreedte: reken ±100 kbit/s per gesprek per richting, en kijk of iemand de lijn volzet (back-up, updates).");
  if (per.latency !== "goed") tips.push("Hoge latency: kijk naar de route (VPN, wifi, ver weg gelegen centrale) en gebruik bekabeld waar het kan.");
  if (!tips.length) tips.push("Niets te doen. Houd QoS en het voice-VLAN zo, en laat SIP ALG uit.");

  return { per, totaal, hoort, tips };
}

const NIVEAU_KLEUR: Record<Niveau, string> = { goed: "campaiLime", matig: "orange", slecht: "campaiRed" };
const NIVEAU_LABEL: Record<Niveau, string> = { goed: "Goed", matig: "Matig", slecht: "Slecht" };

/** Eén seconde spraak = 50 RTP-pakketjes (20 ms per pakket). Het aantal weggevallen pakketjes is
 *  precies verlies% van 50; jitter bepaalt hoe ongelijk ze aankomen. Vaste volgorde, geen toeval. */
const PAKKETTEN = 50;
const VOLGORDE = Array.from({ length: PAKKETTEN }, (_, i) => (i * 17 + 7) % PAKKETTEN); // vaste "willekeurige" volgorde
function pakketten(w: Waarden) {
  const weg = new Set(VOLGORDE.slice(0, Math.round((w.verlies / 100) * PAKKETTEN)));
  return Array.from({ length: PAKKETTEN }, (_, i) => ({
    weg: weg.has(i),
    schuif: ((((i * 37) % 11) / 10) - 0.5) * Math.min(w.jitter, 100) / 100 * 8, // px: ongelijke aankomst
  }));
}

const KNOPEN = [
  { id: "tel", naam: "Toestel", sub: "IP-telefoon / softphone" },
  { id: "sw", naam: "Switch", sub: "voice-VLAN" },
  { id: "fw", naam: "Firewall", sub: "NAT" },
  { id: "net", naam: "Internet", sub: "" },
  { id: "pbx", naam: "Centrale", sub: "provider / hosted PBX" },
];

// ---------- Weergave ----------
export function VoipGesprek() {
  const [w, setW] = useState<Waarden>({ latency: 40, jitter: 8, verlies: 0.2 });
  const [sipAlg, setSipAlg] = useState(false);
  const r = beoordeel(w, sipAlg);
  const pk = pakketten(w);
  const zet = (m: Meting) => (v: number) => setW((x) => ({ ...x, [m]: v }));

  return (
    <div className="ill">
      <Kop titel="Een telefoongesprek over internet">
        Het toestel meldt zich met SIP aan bij de centrale (REGISTER). Bij bellen regelt SIP het gesprek; de stem zelf gaat als losse RTP-pakketjes. Schuif aan de lijn en hoor wat er gebeurt.
      </Kop>

      {/* Het pad */}
      <div className="ill-path">
        {KNOPEN.map((n, j) => (
          <Fragment key={n.id}>
            {j > 0 && <span className="ill-ln is-on" aria-hidden="true" />}
            <div className={`ill-nd ${n.id === "fw" && sipAlg ? "ill-voip-fwalg" : ""}`}>
              {n.naam}
              {n.sub && <small>{n.sub}</small>}
              {n.id === "fw" && <span className={`ill-voip-alg ${sipAlg ? "is-aan" : ""}`}>SIP ALG {sipAlg ? "aan" : "uit"}</span>}
            </div>
          </Fragment>
        ))}
      </div>

      {/* Twee stromen */}
      <div className="ill-voip-stromen">
        <div className="ill-voip-stroom is-sip">
          <span className="ill-voip-label"><b>SIP</b> signalering<small>UDP/TCP 5060 · bellen, opnemen, ophangen</small></span>
          <span className="ill-voip-lijn is-sip" aria-hidden="true">
            <span className="ill-voip-msg">REGISTER → 200 OK</span>
            <span className="ill-voip-msg">INVITE → 180 → 200 OK</span>
            {sipAlg && <span className="ill-voip-msg is-bad">ALG herschrijft adres ✕</span>}
          </span>
        </div>
        <div className="ill-voip-stroom">
          <span className="ill-voip-label"><b>RTP</b> spraak heen<small>UDP · 1 seconde = 50 pakketjes · {pk.filter((p) => p.weg).length} weg</small></span>
          <span className="ill-voip-lijn" role="img" aria-label={`Spraakpakketjes heen: ${pk.filter((p) => p.weg).length} van ${PAKKETTEN} weg`}>
            {pk.map((p, i) => (
              <i key={i} className={`ill-voip-pk ${p.weg ? "is-weg" : ""}`} style={{ transform: `translateX(${p.schuif}px)` }} />
            ))}
          </span>
        </div>
        <div className="ill-voip-stroom">
          <span className="ill-voip-label"><b>RTP</b> spraak terug<small>UDP · aparte stroom</small></span>
          <span className={`ill-voip-lijn ${sipAlg ? "is-kapot" : ""}`} role="img" aria-label={sipAlg ? "Spraak terug komt niet aan door de SIP ALG" : "Spraak terug komt aan"}>
            {sipAlg ? (
              <span className="ill-voip-msg is-bad">geen geluid: RTP gaat naar verkeerd adres/poort</span>
            ) : (
              pk.map((p, i) => <i key={i} className={`ill-voip-pk is-terug ${pk[(i + 23) % PAKKETTEN].weg ? "is-weg" : ""}`} style={{ transform: `translateX(${-p.schuif}px)` }} />)
            )}
          </span>
        </div>
      </div>

      {/* Schuifregelaars met meter */}
      <div className="ill-voip-meters">
        {(Object.keys(DREMPELS) as Meting[]).map((m) => {
          const d = DREMPELS[m];
          const nv = r.per[m];
          return (
            <div key={m} className="ill-voip-meter">
              <Group justify="space-between" gap={6} wrap="nowrap">
                <Text size="sm" fw={700}>{d.naam}</Text>
                <Group gap={6} wrap="nowrap">
                  <Text size="sm" className="ill-mono">{m === "verlies" ? w[m].toFixed(1) : w[m]} {d.eenheid}</Text>
                  <Badge size="xs" color={NIVEAU_KLEUR[nv]} variant="light">{NIVEAU_LABEL[nv]}</Badge>
                </Group>
              </Group>
              <div className="ill-voip-zones" aria-hidden="true">
                <span className="is-goed" style={{ width: `${(d.goed / d.max) * 100}%` }} />
                <span className="is-matig" style={{ width: `${((d.matig - d.goed) / d.max) * 100}%` }} />
                <span className="is-slecht" />
              </div>
              <Slider
                min={0}
                max={d.max}
                step={d.stap}
                value={w[m]}
                onChange={zet(m)}
                label={null}
                color={NIVEAU_KLEUR[nv]}
                aria-label={`${d.naam} in ${d.eenheid}`}
              />
              <Text size="xs" c="dimmed">goed &lt; {d.goed} {d.eenheid} · matig tot {d.matig} {d.eenheid}</Text>
            </div>
          );
        })}
      </div>

      <Group gap={8}>
        <Button size="xs" color="campaiRed" variant={sipAlg ? "filled" : "outline"} aria-pressed={sipAlg} onClick={() => setSipAlg((x) => !x)}>
          SIP ALG aan op de firewall
        </Button>
        <Button size="xs" variant="default" onClick={() => { setW({ latency: 40, jitter: 8, verlies: 0.2 }); setSipAlg(false); }}>
          Gezonde lijn
        </Button>
        <Button size="xs" variant="default" onClick={() => setW({ latency: 120, jitter: 45, verlies: 2.5 })}>
          Volle lijn zonder QoS
        </Button>
      </Group>

      <div className={`ill-voip-uitkomst is-${r.totaal}`} aria-live="polite">
        <Group gap={8} wrap="nowrap" align="flex-start">
          <Badge color={NIVEAU_KLEUR[r.totaal]} variant="filled">Gesprek: {NIVEAU_LABEL[r.totaal]}</Badge>
          <Text size="sm"><b>Wat je hoort:</b> {r.hoort}</Text>
        </Group>
        <ul className="ill-voip-tips">
          {r.tips.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
      <Text size="xs" c="dimmed">
        Drempels zijn vuistregels: latency &lt; 150 ms, jitter &lt; 30 ms en pakketverlies &lt; 1% is goed. De slechtste van de drie bepaalt het gesprek.
      </Text>
    </div>
  );
}
