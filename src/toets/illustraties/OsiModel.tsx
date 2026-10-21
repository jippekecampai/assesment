// src/toets/illustraties/OsiModel.tsx
// Het OSI-model: klikbare lagen plus een geanimeerd webverzoek dat van laag 7 naar 1 inpakt.
import { useEffect, useRef, useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { Klein, Kop } from "./_gedeeld";

type Laag = { nr: number; naam: string; pdu: string; voorbeelden: string; apparaat: string; uitleg: string };
const LAGEN: Laag[] = [
  { nr: 7, naam: "Applicatie", pdu: "Data", voorbeelden: "HTTP(S), DNS, SSH, SMTP", apparaat: "—", uitleg: "De dienst die de gebruiker ziet: de webshop, e-mail." },
  { nr: 6, naam: "Presentatie", pdu: "Data", voorbeelden: "TLS-versleuteling, JPEG, UTF-8", apparaat: "—", uitleg: "Vertaalt en versleutelt gegevens zodat beide kanten ze begrijpen." },
  { nr: 5, naam: "Sessie", pdu: "Data", voorbeelden: "Sessies opzetten en afsluiten", apparaat: "—", uitleg: "Houdt een gesprek tussen twee programma's bij." },
  { nr: 4, naam: "Transport", pdu: "Segment", voorbeelden: "TCP (betrouwbaar), UDP (snel); poorten 22, 53, 80, 443", apparaat: "Firewall / NSG op poort", uitleg: "Zorgt dat data bij het juiste programma (poort) aankomt, bij TCP compleet en op volgorde." },
  { nr: 3, naam: "Netwerk", pdu: "Pakket", voorbeelden: "IP-adressen, routering, ICMP (ping)", apparaat: "Router", uitleg: "Kiest de route tussen netwerken op basis van IP-adressen." },
  { nr: 2, naam: "Datalink", pdu: "Frame", voorbeelden: "MAC-adressen, Ethernet, VLAN", apparaat: "Switch", uitleg: "Brengt frames naar het juiste apparaat binnen hetzelfde netwerk via MAC-adressen." },
  { nr: 1, naam: "Fysiek", pdu: "Bits", voorbeelden: "Kabel, glasvezel, wifi-signaal", apparaat: "Kabel, hub", uitleg: "Zet nullen en enen om in elektrische, licht- of radiosignalen." },
];

const INPAK: Record<number, string[]> = {
  7: ["Data"],
  4: ["TCP :443", "Data"],
  3: ["IP 192.168.1.10 → 20.50.1.2", "TCP :443", "Data"],
  2: ["ETH MAC", "IP", "TCP", "Data", "FCS"],
  1: ["0101 1100 0011…"],
};
const inpak = (laag: number) => INPAK[laag] ?? INPAK[7];

const STAPTEKST: Record<number, string> = {
  4: "TCP-header met poort erbij",
  3: "IP-header erbij",
  2: "Ethernet-header en controlesom erbij",
  1: "alles wordt bits op de kabel",
};
const VOLGORDE = [7, 6, 5, 4, 3, 2, 1];
const STAP_MS = 1100;

type Blok = { tekst: string; nieuw: boolean };

export function OsiModel() {
  const [sel, setSel] = useState(3);
  const [pakket, setPakket] = useState<Blok[]>([]);
  const [status, setStatus] = useState("");
  const timers = useRef<number[]>([]);

  const stopTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => stopTimers, []);

  const verstuur = () => {
    stopTimers();
    const stap = (k: number) => {
      const laag = VOLGORDE[k];
      const enc = inpak(laag);
      const vorigeLengte = k ? inpak(VOLGORDE[k - 1]).length : 0;
      setSel(laag);
      setPakket(enc.map((x, j) => ({ tekst: x, nieuw: enc.length > vorigeLengte && (j === 0 || x === "FCS") })));
      setStatus(`Laag ${laag}: ${STAPTEKST[laag] ?? "data van de browser"}`);
      const volgende =
        k + 1 < VOLGORDE.length
          ? () => stap(k + 1)
          : () => setStatus("Bij de ontvanger gaat het precies andersom: van laag 1 omhoog, elke laag haalt zijn eigen header eraf.");
      timers.current.push(window.setTimeout(volgende, STAP_MS));
    };
    stap(0);
  };

  const o = LAGEN.find((x) => x.nr === sel)!;

  return (
    <div className="ill">
      <Kop titel="OSI-model: 7 lagen">
        Klik een laag voor uitleg. Ezelsbruggetje van 7 naar 1: <b>A</b>lle <b>P</b>rogrammeurs <b>S</b>turen <b>T</b>och <b>N</b>ooit{" "}
        <b>D</b>omme <b>F</b>outen.
      </Kop>
      <div className="ill-osi">
        <div className="ill-stack" role="group" aria-label="OSI-lagen">
          {LAGEN.map((l) => (
            <button
              key={l.nr}
              type="button"
              className={`ill-slab ${l.nr === sel ? "is-on" : "is-provider"}`}
              aria-pressed={l.nr === sel}
              onClick={() => setSel(l.nr)}
            >
              <span>{l.nr} · {l.naam}</span>
              <small>{l.pdu}</small>
            </button>
          ))}
        </div>
        <div className="ill-detail" aria-live="polite">
          <b>Laag {o.nr}: {o.naam}</b>
          <span>{o.uitleg}</span>
          <span><Text span size="sm" c="dimmed">Voorbeelden:</Text> {o.voorbeelden}</span>
          <span><Text span size="sm" c="dimmed">Apparaat:</Text> {o.apparaat}</span>
          <span><Text span size="sm" c="dimmed">Eenheid (PDU):</Text> {o.pdu}</span>
        </div>
      </div>
      <Group gap={8}>
        <Button color="campaiNavy" onClick={verstuur}>Verstuur een webverzoek</Button>
        <Klein>{status}</Klein>
      </Group>
      <div className="ill-pkt" aria-label="Pakket">
        {pakket.map((b, j) => (
          <span key={j} className={b.nieuw ? "is-new" : undefined}>{b.tekst}</span>
        ))}
      </div>
    </div>
  );
}
