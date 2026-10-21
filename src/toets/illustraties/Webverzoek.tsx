// src/toets/illustraties/Webverzoek.tsx
// De weg van een webverzoek: van PC via switch, router/NAT en internet naar Azure, stap voor stap.
import { Fragment, useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { Kop } from "./_gedeeld";

type Knoop = { id: string; naam: string; sub: string };
const KNOPEN: Knoop[] = [
  { id: "pc", naam: "PC-1", sub: "192.168.1.10" },
  { id: "sw", naam: "Switch", sub: "laag 2 · MAC" },
  { id: "rt", naam: "Router + NAT", sub: "gateway .1" },
  { id: "net", naam: "Internet", sub: "" },
  { id: "az", naam: "Azure", sub: "webshop :443" },
];

const STAPPEN: Array<{ aan: string[]; titel: string; uitleg: string }> = [
  { aan: ["pc"], titel: "DHCP", uitleg: "De PC krijgt automatisch zijn IP-configuratie van DHCP: 192.168.1.10/24, gateway 192.168.1.1 en een DNS-server." },
  { aan: ["pc", "dns"], titel: "DNS", uitleg: "De browser vraagt aan DNS: wat is het IP-adres van www.voorbeeldwinkel.nl? Werkt een site wel via het IP-adres maar niet via de naam, dan zit het probleem hier." },
  { aan: ["pc"], titel: "Eigen subnet?", uitleg: "De PC vergelijkt het doel-IP met zijn eigen subnet (/24). Het doel valt erbuiten, dus het pakket gaat naar de default gateway." },
  { aan: ["pc", "sw"], titel: "Switch (laag 2)", uitleg: "Het frame krijgt het MAC-adres van de gateway. De switch kijkt in zijn MAC-tabel en stuurt het naar de juiste poort." },
  { aan: ["sw", "rt"], titel: "Router (laag 3)", uitleg: "De router kijkt naar het IP-adres en kiest een route naar buiten. Kan een PC zijn gateway wel pingen maar een ander subnet niet? Controleer dan de routerinterfaces (shutdown?), de routes, de firewall en de gateway van de doelhost." },
  { aan: ["rt"], titel: "NAT", uitleg: "NAT vertaalt het privé-adres 192.168.1.10:51234 naar het publieke adres van het kantoor, bijvoorbeeld 84.10.20.30:40001. Zo delen alle PC's één publiek IP." },
  { aan: ["rt", "net", "az"], titel: "HTTPS naar Azure", uitleg: "Het verzoek gaat via internet naar poort 443 in Azure. TLS versleutelt het onderweg; TCP zorgt dat alles compleet en op volgorde aankomt." },
  { aan: ["az", "net", "rt", "pc"], titel: "Antwoord terug", uitleg: "De webshop antwoordt. NAT vertaalt het publieke adres terug naar 192.168.1.10 en de pagina verschijnt." },
];

export function Webverzoek() {
  const [k, setK] = useState(0);
  const stap = STAPPEN[k];
  const aan = (id: string) => stap.aan.includes(id);

  return (
    <div className="ill">
      <Kop titel="Van PC naar webshop, stap voor stap" />
      <Group justify="center">
        <div className={`ill-nd ${aan("dns") ? "is-on" : ""}`}>
          DNS-server<small>naam → IP</small>
        </div>
      </Group>
      <div className="ill-path">
        {KNOPEN.map((n, j) => (
          <Fragment key={n.id}>
            {j > 0 && <span className={`ill-ln ${aan(KNOPEN[j - 1].id) && aan(n.id) ? "is-on" : ""}`} aria-hidden="true" />}
            <div className={`ill-nd ${aan(n.id) ? "is-on" : ""}`}>
              {n.naam}
              {n.sub && <small>{n.sub}</small>}
            </div>
          </Fragment>
        ))}
      </div>
      <div className="ill-detail" aria-live="polite">
        <b>{k + 1}. {stap.titel}</b>
        <span>{stap.uitleg}</span>
      </div>
      <Group justify="space-between" wrap="wrap" gap={10}>
        <Button variant="outline" color="campaiNavy" disabled={k === 0} onClick={() => setK((x) => Math.max(0, x - 1))}>
          Vorige stap
        </Button>
        <Text size="xs" c="dimmed" className="ill-mono">stap {k + 1} van {STAPPEN.length}</Text>
        <Button color="campaiNavy" disabled={k === STAPPEN.length - 1} onClick={() => setK((x) => Math.min(STAPPEN.length - 1, x + 1))}>
          Volgende stap
        </Button>
      </Group>
    </div>
  );
}
