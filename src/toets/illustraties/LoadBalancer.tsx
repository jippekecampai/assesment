// src/toets/illustraties/LoadBalancer.tsx
// Load balancer en health probe: verkeer round-robin over gezonde servers, probe elke 2 seconden.
import { useEffect, useRef, useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { Kop } from "./_gedeeld";

type Server = { naam: string; zone: string; up: boolean; ok: boolean; teller: number };

const PROBE_MS = 2000;
const VERZOEK_MS = 650;
const FLITS_MS = 200;

const maakServers = (n: number): Server[] =>
  Array.from({ length: n }, (_, k) => ({ naam: `Web ${k + 1}`, zone: `Zone ${k + 1}`, up: true, ok: true, teller: 0 }));

export function LoadBalancer() {
  const [modus, setModus] = useState(3);
  const [servers, setServersState] = useState<Server[]>(() => maakServers(3));
  const [flits, setFlits] = useState<number | null>(null);
  // Spiegel van de state, zodat de intervallen altijd met de actuele servers rekenen
  // zonder bijwerkingen in een state-updater (die React in StrictMode dubbel aanroept).
  const serversRef = useRef(servers);
  const rr = useRef(0);
  const zet = (next: Server[]) => {
    serversRef.current = next;
    setServersState(next);
  };

  useEffect(() => {
    let flitsTimer: number | undefined;
    const probe = window.setInterval(() => {
      zet(serversRef.current.map((s) => ({ ...s, ok: s.up })));
    }, PROBE_MS);
    const verkeer = window.setInterval(() => {
      const huidig = serversRef.current;
      const gezond = huidig.map((s, k) => (s.ok ? k : -1)).filter((k) => k >= 0);
      if (!gezond.length) return;
      const k = gezond[rr.current++ % gezond.length];
      zet(huidig.map((s, i) => (i === k ? { ...s, teller: s.teller + 1 } : s)));
      setFlits(k);
      window.clearTimeout(flitsTimer);
      flitsTimer = window.setTimeout(() => setFlits(null), FLITS_MS);
    }, VERZOEK_MS);
    return () => {
      window.clearInterval(probe);
      window.clearInterval(verkeer);
      window.clearTimeout(flitsTimer);
    };
  }, []);

  const kiesModus = (m: number) => {
    setModus(m);
    zet(maakServers(m));
  };
  const wissel = (k: number) => zet(serversRef.current.map((s, i) => (i === k ? { ...s, up: !s.up } : s)));
  const regioUit = () => zet(serversRef.current.map((s) => ({ ...s, up: false })));

  const gezond = servers.filter((s) => s.ok).length;
  const uitleg =
    modus === 1
      ? "Met één server is die server een single point of failure: valt hij uit, dan ligt alles plat."
      : servers.every((s) => !s.up)
        ? "Zones beschermen tegen uitval van één datacenter, niet tegen uitval van de hele regio. Daarvoor heb je een tweede regio met replicatie en failover nodig."
        : "Valt één zone uit, dan nemen de andere servers het verkeer over.";

  return (
    <div className="ill">
      <Kop titel="Verkeer verdelen">
        Klik een webserver om hem te laten uitvallen. De health probe controleert elke 2 seconden en stuurt daarna geen verkeer meer naar een ongezonde server.
      </Kop>
      <Group gap={8} role="group" aria-label="Opzet">
        {[
          { m: 1, label: "1 server" },
          { m: 3, label: "3 servers in 3 zones" },
        ].map(({ m, label }) => (
          <Button key={m} size="xs" color="campaiNavy" variant={modus === m ? "filled" : "default"} aria-pressed={modus === m} onClick={() => kiesModus(m)}>
            {label}
          </Button>
        ))}
        <Button size="xs" color="campaiRed" variant="outline" onClick={regioUit}>Regio valt uit</Button>
      </Group>
      <div className="ill-lb">
        <div className="ill-lbnode">Klanten → Load balancer</div>
        <div className="ill-lbsrv">
          {servers.map((s, k) => (
            <button
              key={s.naam}
              type="button"
              className={`ill-ws ${s.up ? "" : "is-down"} ${flits === k ? "is-flash" : ""}`}
              aria-pressed={!s.up}
              aria-label={`${s.naam}, ${s.zone}: ${s.up ? "draait" : "uitgevallen"}. Klik om ${s.up ? "te laten uitvallen" : "te herstellen"}.`}
              onClick={() => wissel(k)}
            >
              <b>{s.naam}</b>
              <small>{s.zone}</small>
              <span className="ill-c">{s.teller} verzoeken</span>
              <small>{s.up ? (s.ok ? "gezond" : "probe…") : s.ok ? "uitgevallen, probe nog niet" : "ongezond"}</small>
            </button>
          ))}
        </div>
      </div>
      <Text fw={700} size="md" aria-live="polite">
        {gezond ? (
          <span className="ill-status-ok">Webshop bereikbaar via {gezond} server{gezond > 1 ? "s" : ""}</span>
        ) : (
          <span className="ill-status-bad">503: webshop onbereikbaar</span>
        )}
      </Text>
      <Text size="sm" c="dimmed">{uitleg}</Text>
    </div>
  );
}
