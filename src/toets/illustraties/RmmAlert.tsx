// src/toets/illustraties/RmmAlert.tsx
// De keten van een monitoring-alert in de Kaseya-stack: Datto RMM → Autotask-ticket → IT Glue → klant.
// Waarheid eerst: één klein model (ALERTS + STAPPEN + slaStand) bepaalt elke getoonde prioriteit,
// SLA-reactietijd, ticketstatus en uitkomst. De SLA-waarden zijn een voorbeeld-SLA, geen contract.
import "./illustraties-2.css";
import { Fragment, useEffect, useRef, useState } from "react";
import { Badge, Button, Group, Text } from "@mantine/core";
import { Keuzes, Kop } from "./_gedeeld";

// ---------- Model ----------
type AlertSoort = "schijf" | "backup" | "offline";
type Prio = { code: "P1" | "P2" | "P3"; naam: string; kleur: string };

const ALERTS: Record<AlertSoort, {
  knop: string;
  monitor: string; // wat de Datto RMM-monitor meet
  device: string;
  prio: Prio;
  reactieMin: number; // voorbeeld-SLA: tijd tot een engineer het oppakt
  oplossing: string;
  itglue: string;
  klantUpdate: string;
}> = {
  schijf: {
    knop: "Schijf loopt vol",
    monitor: "Disk usage C: > 90% (gemeten 94%)",
    device: "SRV-FS01",
    prio: { code: "P3", naam: "Gemiddeld", kleur: "campaiCyan" },
    reactieMin: 240,
    oplossing: "Oude logbestanden en de WinSxS-cache opruimen; schijf vergroten als dat structureel nodig is.",
    itglue: "Configuratie van SRV-FS01 en de afspraak over schijfgrootte opzoeken in IT Glue.",
    klantUpdate: "Schijfruimte op de fileserver opgeruimd, geen impact gehad. We houden het in de gaten.",
  },
  backup: {
    knop: "Back-up mislukt",
    monitor: "Backup job status = Failed (2e keer op rij)",
    device: "SRV-DC01",
    prio: { code: "P2", naam: "Hoog", kleur: "orange" },
    reactieMin: 120,
    oplossing: "Oorzaak in het back-uplog zoeken, job opnieuw starten en een geslaagde run controleren.",
    itglue: "Back-upschema en het wachtwoord van het back-upaccount uit IT Glue halen (niet in het ticket zetten).",
    klantUpdate: "De back-up van vannacht was mislukt; hij is opnieuw gedraaid en nu geslaagd.",
  },
  offline: {
    knop: "Server offline",
    monitor: "Device offline > 5 minuten (geen heartbeat)",
    device: "SRV-APP02",
    prio: { code: "P1", naam: "Kritiek", kleur: "campaiRed" },
    reactieMin: 30,
    oplossing: "Bereikbaarheid controleren (stroom, netwerk, hypervisor), server herstarten en services nalopen.",
    itglue: "iLO/iDRAC-adres, netwerkschema en het admin-wachtwoord uit IT Glue (alleen daar, nooit in het ticket).",
    klantUpdate: "Applicatieserver was 25 minuten onbereikbaar, draait weer. Oorzaak: vastgelopen update.",
  },
};

type Stap = {
  id: string;
  wie: string; // systeem of persoon
  titel: string;
  auto: boolean; // gebeurt vanzelf, zonder engineer
  doet: (a: AlertSoort) => string;
  valkuil: string;
  ticket: "geen" | "Nieuw" | "In behandeling" | "Wacht op klant" | "Voltooid";
};

const STAPPEN: Stap[] = [
  { id: "mon", wie: "Datto RMM", titel: "Monitor", auto: true, ticket: "geen",
    doet: (a) => `De agent op ${ALERTS[a].device} meet continu. Drempel overschreden: ${ALERTS[a].monitor}.`,
    valkuil: "Drempels te krap zetten levert ruis op; te ruim en je mist het echte probleem." },
  { id: "alert", wie: "Datto RMM", titel: "Alert", auto: true, ticket: "geen",
    doet: () => "Datto RMM maakt een alert aan en stuurt die via de PSA-koppeling door naar Autotask.",
    valkuil: "Alert-moeheid: alerts wegklikken in de RMM zonder ticket. Dan ziet niemand het en loopt er geen SLA." },
  { id: "ticket", wie: "Autotask", titel: "Ticket", auto: true, ticket: "Nieuw",
    doet: (a) => `Autotask maakt automatisch een ticket in de queue Monitoring met prioriteit ${ALERTS[a].prio.code} (${ALERTS[a].prio.naam}). De SLA-klok start.`,
    valkuil: "Dubbele tickets: dezelfde alert opnieuw, of iemand maakt er handmatig nóg een. Koppel aan het bestaande ticket." },
  { id: "op", wie: "Engineer", titel: "Oppakken", auto: false, ticket: "In behandeling",
    doet: () => "Engineer wijst het ticket aan zichzelf toe, zet het op In behandeling en schrijft de tijd.",
    valkuil: "Ticket wel openen maar niet toewijzen: twee collega's werken eraan, of juist niemand." },
  { id: "doc", wie: "IT Glue", titel: "Documentatie", auto: false, ticket: "In behandeling",
    doet: (a) => ALERTS[a].itglue,
    valkuil: "Wachtwoorden of configuratie in de ticketnotitie plakken. Die is zichtbaar voor meer mensen en soms voor de klant." },
  { id: "los", wie: "Engineer", titel: "Oplossen", auto: false, ticket: "In behandeling",
    doet: (a) => ALERTS[a].oplossing,
    valkuil: "Alleen het symptoom wegnemen (alert resetten) zonder oorzaak. Morgen staat hij er weer." },
  { id: "klant", wie: "Engineer → klant", titel: "Klantupdate", auto: false, ticket: "Wacht op klant",
    doet: (a) => `Korte update naar de contactpersoon: "${ALERTS[a].klantUpdate}"`,
    valkuil: "Stil oplossen. De klant merkte er misschien wel iets van en hoort niets." },
  { id: "dicht", wie: "Autotask", titel: "Sluiten", auto: false, ticket: "Voltooid",
    doet: () => "Oplossing en oorzaak in de resolution, tijd geschreven, ticket op Voltooid. Alert in Datto RMM is vanzelf opgelost.",
    valkuil: "Sluiten zonder resolution: bij de volgende keer weet niemand wat er gedaan is." },
];

const OPPAK_OPTIES = [
  { waarde: 15, label: "na 15 min" },
  { waarde: 60, label: "na 1 uur" },
  { waarde: 180, label: "na 3 uur" },
];

function duur(min: number) {
  return min < 60 ? `${min} min` : `${min / 60} uur`;
}

/** SLA-stand: gehaald als de engineer binnen de reactietijd van de prioriteit oppakt. */
function slaStand(a: AlertSoort, oppakMin: number) {
  const norm = ALERTS[a].reactieMin;
  return { norm, gehaald: oppakMin <= norm, fractie: Math.min(1, oppakMin / norm) };
}

const AUTO_MS = 900;
const AANTAL_AUTO = STAPPEN.filter((s) => s.auto).length;

function wilWeinigBeweging() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// ---------- Weergave ----------
export function RmmAlert() {
  const [soort, setSoort] = useState<AlertSoort | null>(null);
  const [stap, setStap] = useState(-1); // index van de laatst bereikte stap
  const [weggeklikt, setWeggeklikt] = useState(false);
  const [moe, setMoe] = useState(false); // alert-moeheid nabootsen: de alert wordt weggeklikt
  const [oppak, setOppak] = useState(15);
  const [gekozen, setGekozen] = useState<number | null>(null); // stap waar de uitleg van getoond wordt
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = (s: AlertSoort, wegklik = moe) => {
    window.clearTimeout(timer.current);
    setSoort(s);
    setWeggeklikt(false);
    setGekozen(null);
    // Bij alert-moeheid stopt de keten bij de alert: hij wordt weggeklikt en er komt geen ticket.
    const eind = wegklik ? 1 : AANTAL_AUTO - 1;
    const afronden = () => {
      if (wegklik) {
        setWeggeklikt(true);
        setGekozen(1);
      }
    };
    if (wilWeinigBeweging()) {
      setStap(eind);
      afronden();
      return;
    }
    setStap(0);
    // De automatische stappen (monitor → alert → ticket) lopen vanzelf door.
    const verder = (k: number) => {
      timer.current = window.setTimeout(() => {
        setStap(k);
        if (k < eind) verder(k + 1);
        else afronden();
      }, AUTO_MS);
    };
    verder(1);
  };

  const wisselMoe = () => {
    const nieuw = !moe;
    setMoe(nieuw);
    if (soort) start(soort, nieuw);
  };

  const actief = gekozen ?? stap;
  const s = actief >= 0 ? STAPPEN[actief] : null;
  const a = soort ? ALERTS[soort] : null;
  const sla = soort ? slaStand(soort, oppak) : null;
  const ticketStatus = weggeklikt ? "geen" : stap >= 0 ? STAPPEN[stap].ticket : "geen";
  const autoBezig = soort !== null && !weggeklikt && stap < (moe ? 1 : AANTAL_AUTO - 1);
  const klaar = stap === STAPPEN.length - 1;

  return (
    <div className="ill">
      <Kop titel="Van alert tot gesloten ticket">
        Kies een alert. Datto RMM, Autotask en IT Glue werken samen; de eerste drie stappen gaan vanzelf, daarna is de engineer aan zet.
      </Kop>

      <Group gap={8} justify="space-between" wrap="wrap">
        <Group gap={8} role="group" aria-label="Start een alert">
          {(Object.keys(ALERTS) as AlertSoort[]).map((k) => (
            <Button key={k} size="xs" color="campaiNavy" variant={soort === k ? "filled" : "default"} aria-pressed={soort === k} onClick={() => start(k)}>
              {ALERTS[k].knop}
            </Button>
          ))}
        </Group>
        <Button size="xs" color="campaiRed" variant={moe ? "filled" : "outline"} aria-pressed={moe} onClick={wisselMoe}>
          Alert-moeheid: wegklikken
        </Button>
      </Group>

      {/* De keten */}
      <ol className="ill-rmm-keten" aria-label="Stappen van de alert-keten">
        {STAPPEN.map((st, k) => {
          const bereikt = !weggeklikt ? k <= stap : k <= 1;
          const gebroken = weggeklikt && k > 1;
          return (
            <Fragment key={st.id}>
              {k > 0 && <li aria-hidden="true" className={`ill-rmm-pijl ${bereikt ? "is-on" : ""} ${gebroken && k === 2 ? "is-kapot" : ""}`}>{gebroken && k === 2 ? "✕" : "→"}</li>}
              <li>
                <button
                  type="button"
                  className={`ill-rmm-stap ${bereikt ? "is-on" : ""} ${actief === k ? "is-cur" : ""} ${gebroken ? "is-dood" : ""} is-${st.wie.startsWith("Datto") ? "rmm" : st.wie.startsWith("Autotask") ? "at" : st.wie.startsWith("IT Glue") ? "itg" : "eng"}`}
                  disabled={!bereikt}
                  aria-pressed={actief === k}
                  onClick={() => setGekozen(k)}
                >
                  <span className="ill-rmm-nr">{k + 1}</span>
                  <b>{st.titel}</b>
                  <small>{st.wie}</small>
                  {st.auto && <span className="ill-rmm-auto">auto</span>}
                </button>
              </li>
            </Fragment>
          );
        })}
      </ol>

      <div className="ill-rmm-grid">
        {/* Ticketkaart uit het model */}
        <div className={`ill-rmm-ticket ${ticketStatus === "geen" ? "is-leeg" : ""}`} aria-live="polite">
          <div className="ill-rmm-ticketkop">
            <span className="ill-mono">Autotask-ticket</span>
            {a && ticketStatus !== "geen" && <Badge color={a.prio.kleur} variant="filled" size="sm">{a.prio.code} · {a.prio.naam}</Badge>}
          </div>
          {!a && <Text size="sm" c="dimmed">Nog geen alert. Kies hierboven een alert.</Text>}
          {a && ticketStatus === "geen" && !weggeklikt && <Text size="sm" c="dimmed">Wacht op de alert… ({autoBezig ? "RMM meet" : "nog geen ticket"})</Text>}
          {a && weggeklikt && (
            <Text size="sm" className="ill-status-bad" fw={700}>Geen ticket. De alert is weggeklikt: geen SLA-klok, niemand pakt het op. Straks belt de klant.</Text>
          )}
          {a && sla && ticketStatus !== "geen" && (
            <>
              <dl className="ill-kv ill-rmm-kv">
                <dt>Titel</dt><dd>{a.device}: {a.knop.toLowerCase()}</dd>
                <dt>Queue</dt><dd>Monitoring</dd>
                <dt>Status</dt><dd><span className={`ill-rmm-status is-${ticketStatus === "Voltooid" ? "ok" : "open"}`}>{ticketStatus}</span></dd>
                <dt>Reactie-SLA</dt><dd>{duur(sla.norm)} <small className="ill-rmm-dim">(voorbeeld-SLA)</small></dd>
              </dl>
              <div className="ill-rmm-sla">
                <div className="ill-rmm-slabalk" role="img" aria-label={`Opgepakt na ${duur(oppak)} van de ${duur(sla.norm)}: ${sla.gehaald ? "SLA gehaald" : "SLA verlopen"}`}>
                  <span className={sla.gehaald ? "is-ok" : "is-bad"} style={{ width: `${sla.fractie * 100}%` }} />
                </div>
                <Text size="xs" c="dimmed">
                  Opgepakt {duur(oppak)} na de alert →{" "}
                  <b className={sla.gehaald ? "ill-status-ok" : "ill-status-bad"}>{sla.gehaald ? "SLA gehaald" : `SLA verlopen (norm ${duur(sla.norm)})`}</b>
                </Text>
              </div>
            </>
          )}
        </div>

        {/* Uitleg bij de stap */}
        <div className="ill-detail ill-rmm-uitleg" aria-live="polite">
          {s && soort ? (
            <>
              <b>{actief + 1}. {s.titel} <small className="ill-rmm-dim">· {s.wie}{s.auto ? " · automatisch" : ""}</small></b>
              <span>{s.doet(soort)}</span>
              <span className="ill-rmm-valkuil"><b>Valkuil:</b> {s.valkuil}</span>
            </>
          ) : (
            <span>Elke alert wordt een ticket met een prioriteit. Die prioriteit bepaalt hoe snel iemand moet reageren.</span>
          )}
        </div>
      </div>

      {soort && (
        <Group justify="space-between" wrap="wrap" gap={10}>
          <Group gap={8}>
            {!autoBezig && !weggeklikt && !klaar && (
              <Button size="xs" color="campaiNavy" onClick={() => { setStap((x) => Math.min(STAPPEN.length - 1, x + 1)); setGekozen(null); }}>
                Volgende stap: {STAPPEN[stap + 1]?.titel}
              </Button>
            )}
            {(weggeklikt || klaar) && <Button size="xs" variant="default" onClick={() => start(soort)}>Opnieuw</Button>}
          </Group>
          <Keuzes label="Engineer pakt op" opties={OPPAK_OPTIES} waarde={oppak} onKies={setOppak} />
        </Group>
      )}

      <Text size="xs" c="dimmed">
        Voorbeeld-SLA: P1 Kritiek reageren binnen 30 min, P2 Hoog binnen 2 uur, P3 Gemiddeld binnen 4 uur. De echte waarden staan in het contract van de klant.
      </Text>
    </div>
  );
}
