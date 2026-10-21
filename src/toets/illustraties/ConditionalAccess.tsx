// src/toets/illustraties/ConditionalAccess.tsx
// Conditional Access (Entra ID): een aanmelding gaat langs signalen en beleidsregels. Alle regels
// die raken tellen mee; de strengste uitkomst wint (blokkeren > MFA > toestaan).
import { useEffect, useState } from "react";
import { Badge, Button, Group, Text } from "@mantine/core";
import { Keuzes, Klein, Kop } from "./_gedeeld";

type Gebruiker = "medewerker" | "beheerder";
type Locatie = "kantoor" | "buitenland";
type Apparaat = "compliant" | "onbekend";
type App = "outlook" | "legacy";
type Signalen = { gebruiker: Gebruiker; locatie: Locatie; apparaat: Apparaat; app: App };
type Uitkomst = "toegestaan" | "mfa" | "geblokkeerd";

// ---- Model: de echte regels, puur en zonder UI ----
type Regel = {
  id: string;
  naam: string;
  voorwaarde: string;
  actie: Exclude<Uitkomst, "toegestaan">;
  actieLabel: string;
  raakt: (s: Signalen) => boolean;
};

const REGELS: Regel[] = [
  {
    id: "legacy",
    naam: "Blokkeer legacy-authenticatie",
    voorwaarde: "App gebruikt een oud protocol (IMAP, POP3, SMTP AUTH). Die kan geen MFA tonen.",
    actie: "geblokkeerd",
    actieLabel: "Blokkeren",
    raakt: (s) => s.app === "legacy",
  },
  {
    id: "beheerder",
    naam: "Beheerders: phishingbestendige MFA",
    voorwaarde: "Gebruiker heeft een beheerdersrol.",
    actie: "mfa",
    actieLabel: "MFA (passkey / FIDO2 / Windows Hello)",
    raakt: (s) => s.gebruiker === "beheerder",
  },
  {
    id: "apparaat",
    naam: "Mail alleen vanaf compliant apparaat",
    voorwaarde: "Apparaat is niet als compliant bekend in Intune.",
    actie: "geblokkeerd",
    actieLabel: "Blokkeren",
    raakt: (s) => s.apparaat === "onbekend",
  },
  {
    id: "locatie",
    naam: "Buiten vertrouwde locatie: MFA",
    voorwaarde: "Aanmelding komt niet van het kantoor-IP (named location).",
    actie: "mfa",
    actieLabel: "MFA",
    raakt: (s) => s.locatie === "buitenland",
  },
];

const STRENGHEID: Record<Uitkomst, number> = { toegestaan: 0, mfa: 1, geblokkeerd: 2 };

function beoordeel(s: Signalen) {
  const geraakt = REGELS.filter((r) => r.raakt(s));
  const uitkomst = geraakt.reduce<Uitkomst>((u, r) => (STRENGHEID[r.actie] > STRENGHEID[u] ? r.actie : u), "toegestaan");
  const winnaars = geraakt.filter((r) => r.actie === uitkomst).map((r) => r.id);
  const phishingbestendig = uitkomst === "mfa" && geraakt.some((r) => r.id === "beheerder");
  return { geraakt, uitkomst, winnaars, phishingbestendig };
}

// ---- Weergave ----
const UITKOMST_LABEL: Record<Uitkomst, string> = { toegestaan: "Toegestaan", mfa: "MFA vereist", geblokkeerd: "Geblokkeerd" };
const STAPPEN = ["Aanmelden", "Signalen", "Beleidsregels", "Uitkomst"] as const;
const STAP_MS = 700;

function wilMinderBeweging() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function ConditionalAccess() {
  const [s, setS] = useState<Signalen>({ gebruiker: "medewerker", locatie: "kantoor", apparaat: "compliant", app: "outlook" });
  const [stap, setStap] = useState<number>(STAPPEN.length - 1);
  const [speelt, setSpeelt] = useState(false);
  const r = beoordeel(s);

  useEffect(() => {
    if (!speelt) return;
    if (stap >= STAPPEN.length - 1) {
      setSpeelt(false);
      return;
    }
    const t = window.setTimeout(() => setStap((x) => Math.min(x + 1, STAPPEN.length - 1)), STAP_MS);
    return () => window.clearTimeout(t);
  }, [speelt, stap]);

  const zet = <K extends keyof Signalen>(k: K, v: Signalen[K]) => {
    setS((o) => ({ ...o, [k]: v }));
    setSpeelt(false);
    setStap(STAPPEN.length - 1);
  };
  const speel = () => {
    if (wilMinderBeweging()) {
      setStap(STAPPEN.length - 1);
      return;
    }
    setStap(0);
    setSpeelt(true);
  };

  const signaalChips: Array<{ label: string; risico: boolean }> = [
    { label: s.gebruiker === "beheerder" ? "Beheerdersrol" : "Gewone medewerker", risico: s.gebruiker === "beheerder" },
    { label: s.locatie === "buitenland" ? "IP in het buitenland" : "Kantoor-IP", risico: s.locatie === "buitenland" },
    { label: s.apparaat === "onbekend" ? "Apparaat onbekend" : "Compliant (Intune)", risico: s.apparaat === "onbekend" },
    { label: s.app === "legacy" ? "Legacy-protocol" : "Outlook (moderne auth)", risico: s.app === "legacy" },
  ];

  const uitleg =
    r.uitkomst === "geblokkeerd"
      ? r.winnaars.includes("legacy")
        ? "Geblokkeerd: een legacy-protocol kan geen MFA vragen, dus deze route gaat altijd dicht. Ook als andere regels MFA willen, wint blokkeren."
        : "Geblokkeerd: mail mag alleen vanaf een apparaat dat Intune als compliant kent. Een onbekend apparaat kan MFA doen, maar dat helpt niet: blokkeren wint. (Wil je webmail wél toestaan, dan maak je daar een aparte regel voor, bijvoorbeeld browser zonder download.)"
      : r.uitkomst === "mfa"
        ? r.phishingbestendig
          ? "MFA vereist, en omdat het een beheerder is moet het phishingbestendig zijn (passkey, FIDO2-sleutel of Windows Hello). Een code via sms of een pushmelding is niet genoeg."
          : "MFA vereist: de aanmelding komt van buiten de vertrouwde locatie, dus het wachtwoord alleen is niet genoeg."
        : "Toegestaan: geen enkele regel raakt. Bekende gebruiker, op kantoor, op een compliant apparaat, met moderne authenticatie.";

  const toon = (i: number) => i <= stap;

  return (
    <div className="ill">
      <Kop titel="Een aanmelding langs Conditional Access">
        Kies wie zich aanmeldt, waarvandaan, op welk apparaat en met welke app. Elke regel die raakt telt mee; de strengste uitkomst wint.
      </Kop>
      <div className="ill-ca-bed">
        <Keuzes label="Gebruiker" waarde={s.gebruiker} onKies={(v) => zet("gebruiker", v)}
          opties={[{ waarde: "medewerker", label: "Gewone medewerker" }, { waarde: "beheerder", label: "Beheerder" }]} />
        <Keuzes label="Locatie" waarde={s.locatie} onKies={(v) => zet("locatie", v)}
          opties={[{ waarde: "kantoor", label: "Kantoor" }, { waarde: "buitenland", label: "Buitenland" }]} />
        <Keuzes label="Apparaat" waarde={s.apparaat} onKies={(v) => zet("apparaat", v)}
          opties={[{ waarde: "compliant", label: "Compliant in Intune" }, { waarde: "onbekend", label: "Onbekend apparaat" }]} />
        <Keuzes label="App" waarde={s.app} onKies={(v) => zet("app", v)}
          opties={[{ waarde: "outlook", label: "Outlook" }, { waarde: "legacy", label: "Legacy-protocol (IMAP/POP)" }]} />
      </div>

      <ol className="ill-ca-pad" aria-label="Pad van de aanmelding">
        <li className={`ill-ca-stap ${toon(0) ? "is-on" : ""}`}>
          <span className="ill-ca-nr">1</span>
          <b>Aanmelden</b>
          <small>{s.gebruiker === "beheerder" ? "Beheerder" : "Medewerker"} met wachtwoord via {s.app === "legacy" ? "IMAP/POP" : "Outlook"}</small>
        </li>
        <li className={`ill-ca-stap ${toon(1) ? "is-on" : ""}`}>
          <span className="ill-ca-nr">2</span>
          <b>Signalen</b>
          <span className="ill-ca-chips">
            {signaalChips.map((c) => (
              <span key={c.label} className={`ill-ca-chip ${c.risico ? "is-risico" : ""}`}>{c.label}</span>
            ))}
          </span>
        </li>
        <li className={`ill-ca-stap ${toon(2) ? "is-on" : ""}`}>
          <span className="ill-ca-nr">3</span>
          <b>Beleidsregels</b>
          <small>{r.geraakt.length} van {REGELS.length} regels raken</small>
        </li>
        <li className={`ill-ca-stap ill-ca-eind is-${r.uitkomst} ${toon(3) ? "is-on" : ""}`}>
          <span className="ill-ca-nr">4</span>
          <b>Uitkomst</b>
          <span className="ill-ca-uit">{toon(3) ? UITKOMST_LABEL[r.uitkomst] : "…"}</span>
          {toon(3) && r.phishingbestendig && <small>phishingbestendig</small>}
        </li>
      </ol>

      <Group gap={8}>
        <Button size="xs" color="campaiNavy" variant="light" onClick={speel} disabled={speelt}>Aanmelding afspelen</Button>
      </Group>

      <div className={`ill-ca-regels ${toon(2) ? "" : "is-dicht"}`}>
        {REGELS.map((regel) => {
          const raakt = regel.raakt(s);
          const wint = r.winnaars.includes(regel.id);
          return (
            <div key={regel.id} className={`ill-ca-regel ${raakt ? `is-raakt is-${regel.actie}` : ""} ${wint ? "is-wint" : ""}`}>
              <div className="ill-ca-regelkop">
                <b>{regel.naam}</b>
                <Badge size="sm" variant={raakt ? "filled" : "outline"} color={raakt ? (regel.actie === "geblokkeerd" ? "campaiRed" : "campaiCyan") : "gray"}>
                  {raakt ? "raakt" : "raakt niet"}
                </Badge>
              </div>
              <small>Als: {regel.voorwaarde}</small>
              <small>Dan: {regel.actieLabel}{wint ? " — bepaalt de uitkomst" : ""}</small>
            </div>
          );
        })}
      </div>

      <div className="ill-ca-ladder" aria-label="Strengheid">
        {(["toegestaan", "mfa", "geblokkeerd"] as Uitkomst[]).map((u, i) => (
          <span key={u} className={`ill-ca-trede is-${u} ${r.uitkomst === u ? "is-hier" : ""}`}>
            {i > 0 && <i aria-hidden="true">‹</i>}
            {UITKOMST_LABEL[u]}
          </span>
        ))}
      </div>

      <Text size="sm" aria-live="polite">{uitleg}</Text>
      <Klein>
        Conditional Access werkt niet als een firewall met "eerste regel die past". Alle regels die raken worden samengevoegd: alle
        eisen gelden tegelijk, en zodra één regel blokkeert, is het antwoord nee.
      </Klein>
    </div>
  );
}
