// src/toets/illustraties/Klantupdate.tsx
// Werkhouding & communicatie: een goede klantupdate bij een storing, opgebouwd uit zes bouwstenen.
// Waarheid eerst: BOUWSTENEN + beoordeel() bepalen het bericht, de checklist, de status en de
// vragen die de klant terugstuurt. Voorbeeldsituatie en klant zijn fictief.
import "./illustraties-2.css";
import { useState } from "react";
import { Badge, Group, Text } from "@mantine/core";
import { Keuzes, Kop } from "./_gedeeld";

// ---------- Model ----------
type Toon = "zakelijk" | "jip";
type SteenId = "wat" | "impact" | "doen" | "volgende" | "zelf" | "contact";

const TICKET = "T20261021.0042"; // fictief
const VOLGENDE = "11:30";

const BOUWSTENEN: Array<{
  id: SteenId;
  naam: string;
  tekst: Record<Toon, string>;
  klantVraagtAnders: string; // wat de klant terugvraagt als dit ontbreekt
}> = [
  { id: "wat", naam: "Wat er aan de hand is",
    tekst: {
      zakelijk: "Sinds 09:10 komt inkomende e-mail niet aan in de mailboxen van Voorbeeld BV. Uitgaande mail werkt normaal.",
      jip: "Sinds 09:10 komt er geen nieuwe mail binnen. Mail versturen lukt wel gewoon.",
    },
    klantVraagtAnders: "Wat is er eigenlijk aan de hand?" },
  { id: "impact", naam: "Impact (wie merkt wat)",
    tekst: {
      zakelijk: "Dit geldt voor alle medewerkers. Mail die nu naar u verstuurd wordt, gaat niet verloren: die wordt vastgehouden en later afgeleverd.",
      jip: "Iedereen heeft hier last van. Mail die nu naar jullie gestuurd wordt, raakt niet kwijt. Die komt binnen zodra het weer werkt.",
    },
    klantVraagtAnders: "Geldt dit voor iedereen? Ben ik mail kwijt?" },
  { id: "doen", naam: "Wat we doen",
    tekst: {
      zakelijk: "Wij onderzoeken de mailflow en de mailfilter-instellingen en hebben contact met Microsoft.",
      jip: "We zoeken uit waar de mail blijft hangen. Ook hebben we Microsoft gevraagd mee te kijken.",
    },
    klantVraagtAnders: "Wordt er wel aan gewerkt?" },
  { id: "volgende", naam: "Volgende update (tijdstip)",
    tekst: {
      zakelijk: `U ontvangt uiterlijk om ${VOLGENDE} een volgende update, ook als er nog geen oplossing is.`,
      jip: `Om ${VOLGENDE} hoor je weer van ons, ook als het dan nog niet opgelost is.`,
    },
    klantVraagtAnders: "Wanneer hoor ik meer? (de klant gaat bellen)" },
  { id: "zelf", naam: "Wat de klant zelf kan doen",
    tekst: {
      zakelijk: "Verwacht u een dringend bericht, vraag de afzender dan om te bellen. Mail opnieuw laten versturen is niet nodig.",
      jip: "Wacht je op iets belangrijks? Vraag degene die het stuurt om even te bellen. Opnieuw sturen hoeft niet.",
    },
    klantVraagtAnders: "Kan ik zelf iets doen?" },
  { id: "contact", naam: "Contact / ticketnummer",
    tekst: {
      zakelijk: `Vragen? Neem contact op met de servicedesk van Campai en noem ticket ${TICKET}.`,
      jip: `Vragen? Bel of mail de servicedesk en noem ticketnummer ${TICKET}.`,
    },
    klantVraagtAnders: "Waar kan ik dit volgen?" },
];

const AANHEF: Record<Toon, { kop: string; groet: string; slot: string }> = {
  zakelijk: { kop: "Storing: inkomende e-mail", groet: "Beste mevrouw Jansen,", slot: "Met vriendelijke groet,\nServicedesk Campai" },
  jip: { kop: "Mail komt niet binnen", groet: "Hoi Sanne,", slot: "Groet,\nde servicedesk van Campai" },
};

function beoordeel(aan: Set<SteenId>) {
  const mist = BOUWSTENEN.filter((b) => !aan.has(b.id));
  const status: "compleet" | "bellen" | "onvolledig" | "leeg" =
    aan.size === 0 ? "leeg" : mist.length === 0 ? "compleet" : !aan.has("volgende") ? "bellen" : "onvolledig";
  return { mist, status, aantal: aan.size };
}

const STATUS_TEKST = {
  compleet: { kleur: "campaiLime", tekst: "Compleet: de klant weet waar hij aan toe is en hoeft niet te bellen." },
  bellen: { kleur: "campaiRed", tekst: "Klant gaat bellen: zonder tijdstip voor de volgende update weet niemand wanneer er nieuws komt." },
  onvolledig: { kleur: "orange", tekst: "Onvolledig: verwacht een vraag terug van de klant." },
  leeg: { kleur: "gray", tekst: "Nog leeg. Zet bouwstenen aan." },
} as const;

// ---------- Weergave ----------
export function Klantupdate() {
  const [aan, setAan] = useState<Set<SteenId>>(() => new Set<SteenId>(["wat", "doen"]));
  const [toon, setToon] = useState<Toon>("zakelijk");
  const r = beoordeel(aan);
  const st = STATUS_TEKST[r.status];
  const kop = AANHEF[toon];

  const wissel = (id: SteenId) =>
    setAan((x) => {
      const n = new Set(x);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="ill">
      <Kop titel="Een goede klantupdate bij een storing">
        Situatie (fictief): bij Voorbeeld BV komt de mail niet binnen. Zet de bouwstenen aan of uit en kijk hoe de update en de reactie van de klant veranderen.
      </Kop>

      <Group justify="space-between" wrap="wrap" gap={8}>
        <Keuzes<Toon>
          label="Toon"
          opties={[{ waarde: "zakelijk", label: "Zakelijk" }, { waarde: "jip", label: "Jip-en-Janneke" }]}
          waarde={toon}
          onKies={setToon}
        />
        <Text size="xs" c="dimmed" className="ill-mono">{r.aantal} van {BOUWSTENEN.length} bouwstenen</Text>
      </Group>

      <div className="ill-ku-grid">
        {/* Bouwstenen als schakelbare blokken */}
        <div className="ill-ku-stenen" role="group" aria-label="Bouwstenen van de update">
          {BOUWSTENEN.map((b, k) => {
            const on = aan.has(b.id);
            return (
              <button key={b.id} type="button" className={`ill-ku-steen ${on ? "is-on" : ""} ${b.id === "volgende" ? "is-sleutel" : ""}`} aria-pressed={on} onClick={() => wissel(b.id)}>
                <span className="ill-ku-vink" aria-hidden="true">{on ? "✓" : k + 1}</span>
                <span>{b.naam}</span>
              </button>
            );
          })}
        </div>

        {/* Het samengestelde bericht */}
        <div className="ill-ku-bericht" aria-live="polite">
          <div className="ill-ku-mailkop">
            <span className="ill-ku-avatar" aria-hidden="true">C</span>
            <div>
              <b>{kop.kop}</b>
              <small>Aan: contactpersoon Voorbeeld BV{aan.has("contact") ? ` · ${TICKET}` : ""}</small>
            </div>
          </div>
          <div className="ill-ku-body">
            <p>{kop.groet}</p>
            {r.aantal === 0 && <p className="ill-ku-leeg">(nog geen inhoud)</p>}
            {BOUWSTENEN.filter((b) => aan.has(b.id)).map((b) => (
              <p key={b.id} className={`ill-ku-zin is-${b.id}`}>{b.tekst[toon]}</p>
            ))}
            <p className="ill-ku-slot">{kop.slot}</p>
          </div>
        </div>
      </div>

      {/* Uitkomst: status en wat de klant terugvraagt */}
      <div className={`ill-ku-status is-${r.status}`} aria-live="polite">
        <Badge color={st.kleur} variant="filled">{r.status === "bellen" ? "Klant gaat bellen" : r.status === "compleet" ? "Compleet" : r.status === "leeg" ? "Leeg" : "Onvolledig"}</Badge>
        <Text size="sm">{st.tekst}</Text>
      </div>
      {r.mist.length > 0 && r.aantal > 0 && (
        <div className="ill-ku-vragen">
          <Text size="xs" c="dimmed" fw={700}>De klant stuurt terug:</Text>
          {r.mist.map((b) => (
            <span key={b.id} className={`ill-ku-vraag ${b.id === "volgende" ? "is-bad" : ""}`}>“{b.klantVraagtAnders}”</span>
          ))}
        </div>
      )}
      <Text size="xs" c="dimmed">
        Jip-en-Janneke is dezelfde inhoud in eenvoudiger woorden, geen andere boodschap. Kies de toon die bij de contactpersoon past.
      </Text>
    </div>
  );
}
