// src/toets/illustraties/BaselineDrift.tsx
// Tenant-baseline (Inforcer): de baseline is de gewenste toestand, drift is een afwijking, een uitzondering
// is een bewuste en vastgelegde afwijking. Opnieuw toepassen herstelt alleen wat afwijkt (idempotent).
import { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { Klein, Kop } from "./_gedeeld";

// ---- Model ----
type Instelling = { id: string; naam: string; gewenst: string; afwijkend: string };
const BASELINE: Instelling[] = [
  { id: "mfa", naam: "MFA voor iedereen", gewenst: "Aan", afwijkend: "Uit" },
  { id: "legacy", naam: "Legacy-authenticatie", gewenst: "Geblokkeerd", afwijkend: "Toegestaan" },
  { id: "forward", naam: "Automatisch doorsturen naar extern", gewenst: "Uit", afwijkend: "Aan" },
  { id: "audit", naam: "Audit log", gewenst: "Aan", afwijkend: "Uit" },
  { id: "defender", naam: "Defender for Office 365 preset", gewenst: "Standard-preset actief", afwijkend: "Preset uitgezet" },
  { id: "gast", naam: "Gasten uitnodigen", gewenst: "Alleen beheerders", afwijkend: "Iedereen mag uitnodigen" },
];

type Stand = Record<string, { afwijkend: boolean; uitzondering: boolean }>;
type Status = "conform" | "drift" | "uitzondering";

const beginStand = (): Stand => Object.fromEntries(BASELINE.map((i) => [i.id, { afwijkend: false, uitzondering: false }]));

function status(st: Stand, id: string): Status {
  const x = st[id];
  if (!x.afwijkend) return "conform";
  return x.uitzondering ? "uitzondering" : "drift";
}

/** Baseline opnieuw toepassen: alleen drift wordt hersteld; conform en uitzonderingen blijven zoals ze zijn. */
function pasToe(st: Stand) {
  const telling = { hersteld: 0, ongewijzigd: 0, uitzondering: 0 };
  const nieuw: Stand = {};
  for (const i of BASELINE) {
    const s = status(st, i.id);
    if (s === "drift") {
      telling.hersteld++;
      nieuw[i.id] = { afwijkend: false, uitzondering: false };
    } else {
      if (s === "conform") telling.ongewijzigd++;
      else telling.uitzondering++;
      nieuw[i.id] = st[i.id];
    }
  }
  return { nieuw, telling };
}

type Melding = { soort: "drift" | "toepassen" | "info"; tekst: string };

export function BaselineDrift() {
  const [st, setSt] = useState<Stand>(beginStand);
  const [laatst, setLaatst] = useState<string | null>(null);
  const [melding, setMelding] = useState<Melding>({ soort: "info", tekst: "Alles staat zoals de baseline het voorschrijft." });

  const conform = BASELINE.filter((i) => status(st, i.id) === "conform").length;
  const drift = BASELINE.filter((i) => status(st, i.id) === "drift").length;
  const uitz = BASELINE.filter((i) => status(st, i.id) === "uitzondering").length;

  const wijzig = () => {
    const kandidaten = BASELINE.filter((i) => status(st, i.id) === "conform");
    if (!kandidaten.length) {
      setMelding({ soort: "info", tekst: "Er is niets meer om af te laten wijken: alle instellingen wijken al af." });
      return;
    }
    const i = kandidaten[Math.floor(Math.random() * kandidaten.length)];
    setSt((o) => ({ ...o, [i.id]: { afwijkend: true, uitzondering: false } }));
    setLaatst(i.id);
    setMelding({ soort: "drift", tekst: `Drift: iemand zette "${i.naam}" handmatig op "${i.afwijkend}". De tenant wijkt nu af van de baseline.` });
  };

  const toepassen = () => {
    const { nieuw, telling } = pasToe(st);
    setSt(nieuw);
    setLaatst(null);
    setMelding({
      soort: "toepassen",
      tekst:
        telling.hersteld === 0
          ? `hersteld=0 ongewijzigd=${telling.ongewijzigd} uitzondering=${telling.uitzondering}. Niets te doen: opnieuw toepassen is veilig, net als een Ansible-playbook dat changed=0 geeft.`
          : `hersteld=${telling.hersteld} ongewijzigd=${telling.ongewijzigd} uitzondering=${telling.uitzondering}. Alleen de afwijkingen zijn teruggezet; de rest is niet aangeraakt.`,
    });
  };

  const wisselUitz = (id: string) => {
    setSt((o) => ({ ...o, [id]: { ...o[id], uitzondering: !o[id].uitzondering } }));
  };

  const opnieuw = () => {
    setSt(beginStand());
    setLaatst(null);
    setMelding({ soort: "info", tekst: "Alles staat zoals de baseline het voorschrijft." });
  };

  return (
    <div className="ill">
      <Kop titel="Baseline, drift en uitzondering">
        De Campai-baseline beschrijft hoe een tenant hoort te staan. Laat iemand iets wijzigen en pas daarna de baseline opnieuw toe.
      </Kop>
      <Group gap={8}>
        <Button size="xs" color="campaiRed" variant="outline" onClick={wijzig}>Iemand wijzigt iets</Button>
        <Button size="xs" color="campaiNavy" onClick={toepassen}>Baseline opnieuw toepassen</Button>
        <Button size="xs" variant="default" onClick={opnieuw}>Opnieuw beginnen</Button>
      </Group>

      <div className="ill-bl-meter" aria-live="polite">
        <div className="ill-bl-balk" aria-hidden="true">
          {BASELINE.map((i) => (
            <span key={i.id} className={`is-${status(st, i.id)}`} />
          ))}
        </div>
        <Text fw={700} size="md">
          {conform} van {BASELINE.length} conform
          {uitz > 0 && <span className="ill-bl-sub"> · {uitz} bewuste uitzondering{uitz > 1 ? "en" : ""}</span>}
          {drift > 0 && <span className="ill-bl-sub is-drift"> · {drift} afwijking{drift > 1 ? "en" : ""}</span>}
        </Text>
      </div>

      <ul className="ill-bl-lijst" aria-label="Instellingen uit de baseline">
        {BASELINE.map((i) => {
          const s = status(st, i.id);
          return (
            <li key={i.id} className={`ill-bl-rij is-${s} ${laatst === i.id ? "is-nieuw" : ""}`}>
              <span className="ill-bl-stip" aria-hidden="true">{s === "drift" ? "!" : "✓"}</span>
              <div className="ill-bl-tekst">
                <b>{i.naam}</b>
                <small>
                  Baseline: {i.gewenst}
                  {s !== "conform" && <> · Nu: <span className="ill-bl-nu">{i.afwijkend}</span></>}
                </small>
                {s === "uitzondering" && <small className="ill-bl-label">Bewuste uitzondering vastgelegd</small>}
              </div>
              <button
                type="button"
                className="ill-bl-uitz"
                aria-pressed={st[i.id].uitzondering}
                disabled={s === "conform"}
                onClick={() => wisselUitz(i.id)}
                aria-label={`Bewuste uitzondering vastgelegd voor ${i.naam}`}
              >
                {st[i.id].uitzondering ? "Uitzondering ✓" : "Uitzondering"}
              </button>
            </li>
          );
        })}
      </ul>

      <pre className={`ill-bl-log is-${melding.soort}`} aria-live="polite">{melding.tekst}</pre>

      <Klein>
        Baseline = de gewenste toestand. Drift = de tenant wijkt daar ongemerkt van af. Uitzondering = een afwijking die bewust is
        gekozen en vastgelegd (wie, waarom, tot wanneer); die laat opnieuw toepassen staan.
      </Klein>
    </div>
  );
}
