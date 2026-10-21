// src/toets/illustraties/SharePointDelen.tsx
// Delen in SharePoint/Teams/OneDrive en Copilot-oversharing: de deeloptie van een link bepaalt wie
// erbij kan. Copilot krijgt nooit meer rechten dan de gebruiker, maar vindt wél alles wat die mag openen.
import { useState } from "react";
import { Badge, Text } from "@mantine/core";
import { Keuzes, Klein, Kop } from "./_gedeeld";

type Deel = "specifiek" | "organisatie" | "iedereen";
type Kijker = "team" | "buiten" | "gast" | "copilot";

// ---- Model ----
const DEEL_LABEL: Record<Deel, string> = {
  specifiek: "Specifieke personen",
  organisatie: "Personen in je organisatie",
  iedereen: "Iedereen met de link",
};

const KIJKERS: Array<{ id: Kijker; naam: string; rol: string }> = [
  { id: "team", naam: "Collega in team", rol: "lid van Team Financiën" },
  { id: "buiten", naam: "Collega buiten team", rol: "zelfde organisatie, ander team" },
  { id: "gast", naam: "Externe gast", rol: "buiten je organisatie" },
  { id: "copilot", naam: "Copilot van collega buiten team", rol: "zoekt met de rechten van die collega" },
];

/** Kan deze kijker het bestand openen (of laten vinden), en waarom. */
function toegang(deel: Deel, kijker: Kijker): { kan: boolean; waarom: string } {
  if (kijker === "team") {
    return { kan: true, waarom: "Lid van het team: de rechten komen van de site zelf (overgeërfd), los van welke link er bestaat." };
  }
  const buitenKan = deel !== "specifiek";
  if (kijker === "buiten") {
    return buitenKan
      ? {
          kan: true,
          waarom:
            deel === "organisatie"
              ? "De link werkt voor iedereen met een account in je organisatie. Wordt hij doorgestuurd in een mail of chat, dan kan deze collega het openen."
              : "Een Iedereen-link werkt voor wie hem heeft, ook zonder aan te melden.",
        }
      : { kan: false, waarom: "Niet genoemd in de link en geen lid van de site." };
  }
  if (kijker === "gast") {
    if (deel === "iedereen") {
      return { kan: true, waarom: "Zonder aanmelden: je ziet niet wie het opent, en de link kan eindeloos doorgestuurd worden." };
    }
    return {
      kan: false,
      waarom: deel === "organisatie" ? "Een gast hoort niet bij je organisatie, dus een organisatielink werkt niet voor hem." : "Niet genoemd in de link.",
    };
  }
  // Copilot: precies dezelfde rechten als de collega buiten het team.
  return buitenKan
    ? {
        kan: true,
        waarom:
          "Copilot zoekt met de rechten van die collega. Kan de collega het openen, dan kan Copilot het vinden en samenvatten, ook als de collega nooit wist dat het bestand bestond.",
      }
    : { kan: false, waarom: "Copilot heeft dezelfde rechten als de gebruiker. Die collega kan er niet bij, Copilot dus ook niet." };
}

const TIP: Record<Deel, string> = {
  specifiek: "Zo hoort het bij gevoelige bestanden. Controleer wel af en toe wie op de lijst staat; oude namen blijven anders staan.",
  organisatie:
    "Dit is de klassieke oversharing voor Copilot. Ruim brede links en rechten op, zet een gevoeligheidslabel (bijvoorbeeld Vertrouwelijk) op gevoelige bestanden en geef elke site een eigenaar die de toegang periodiek nakijkt.",
  iedereen:
    "Gebruik Iedereen-links niet voor bedrijfsdata. Beperk of verbied ze in de tenant, laat ze verlopen, en wijs per site een eigenaar aan die openstaande links opruimt.",
};

export function SharePointDelen() {
  const [deel, setDeel] = useState<Deel>("organisatie");
  const [kijker, setKijker] = useState<Kijker>("copilot");
  const gekozen = toegang(deel, kijker);
  const aantal = KIJKERS.filter((k) => toegang(deel, k.id).kan).length;
  const naam = KIJKERS.find((k) => k.id === kijker)?.naam ?? "";

  return (
    <div className="ill">
      <Kop titel="Wie kan dit bestand zien?">
        Kies hoe het bestand gedeeld is en klik op een kijker. Copilot kan alleen wat de gebruiker zelf mag openen, maar vindt dat dan ook echt.
      </Kop>
      <Keuzes label="Deeloptie van de link" waarde={deel} onKies={setDeel}
        opties={(Object.keys(DEEL_LABEL) as Deel[]).map((d) => ({ waarde: d, label: DEEL_LABEL[d] }))} />

      <div className="ill-sp-veld">
        <div className="ill-sp-bestand">
          <span className="ill-sp-doc" aria-hidden="true">XLSX</span>
          <div>
            <b>Salarisoverzicht.xlsx</b>
            <small>Site: Team Financiën</small>
            <span className={`ill-sp-link is-${deel}`}>Link: {DEEL_LABEL[deel]}</span>
            {deel === "specifiek" && <small>Gedeeld met: de collega in het team</small>}
          </div>
        </div>
        <div className="ill-sp-kijkers" role="group" aria-label="Wie kijkt">
          {KIJKERS.map((k) => {
            const t = toegang(deel, k.id);
            const aan = k.id === kijker;
            return (
              <button
                key={k.id}
                type="button"
                className={`ill-sp-kijker ${t.kan ? "is-ja" : "is-nee"} ${aan ? "is-aan" : ""}`}
                aria-pressed={aan}
                onClick={() => setKijker(k.id)}
              >
                <span className="ill-sp-teken" aria-hidden="true">{t.kan ? "✓" : "✕"}</span>
                <b>{k.naam}</b>
                <small>{k.rol}</small>
                <span className="ill-sp-oordeel">{t.kan ? "kan erbij" : "geen toegang"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`ill-sp-waarom ${gekozen.kan ? "is-ja" : "is-nee"}`} aria-live="polite">
        <Text size="sm" fw={700}>{naam}: {gekozen.kan ? "kan erbij" : "geen toegang"}</Text>
        <Text size="sm">{gekozen.waarom}</Text>
      </div>

      <div className="ill-sp-tip">
        <Badge size="sm" color={deel === "specifiek" ? "campaiLime" : "campaiRed"} variant="light">
          {aantal} van {KIJKERS.length} kijkers kan erbij
        </Badge>
        <Text size="sm">{TIP[deel]}</Text>
      </div>
      <Klein>Copilot maakt geen nieuwe rechten. Het maakt zichtbaar wat al te ruim openstond: oversharing was er al, Copilot vindt het alleen sneller.</Klein>
    </div>
  );
}
