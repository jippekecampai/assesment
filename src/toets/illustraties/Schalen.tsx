// src/toets/illustraties/Schalen.tsx
// Scale up versus scale out: één groeiende VM tegenover 2–5 instanties met autoscaling.
import { useState } from "react";
import { Badge, Slider, Text } from "@mantine/core";
import { Klein, Kop } from "./_gedeeld";

// [formaat, capaciteit in verzoeken/s, afmeting in px]
const FORMATEN: Array<[string, number, number]> = [
  ["S", 100, 44],
  ["M", 200, 62],
  ["L", 300, 80],
  ["XL", 400, 100],
];

export function Schalen() {
  const [drukte, setDrukte] = useState(120);

  const f = FORMATEN.find((x) => x[1] >= drukte) ?? FORMATEN[3];
  const cpuUp = Math.min(100, Math.round((drukte / f[1]) * 100));

  const n = Math.min(5, Math.max(2, Math.ceil(drukte / 75)));
  const cpuOut = Math.min(100, Math.round((drukte / (n * 100)) * 100));

  return (
    <div className="ill">
      <Kop titel="Opschalen: groter of meer?">
        Schuif met de drukte. Links groeit één server (scale up), rechts komen er instanties bij (scale out, autoscaling 2–5).
      </Kop>
      <div>
        <Text size="sm" c="dimmed">
          Drukte: <b className="ill-mono" style={{ color: "var(--mantine-color-text)" }}>{drukte}</b> verzoeken per seconde
        </Text>
        <Slider min={0} max={420} value={drukte} onChange={setDrukte} thumbLabel="Drukte in verzoeken per seconde" color="campaiNavy" mt={6} />
      </div>
      <div className="ill-scale">
        <div className="ill-pane">
          <Text fw={700} size="sm">Scale up (verticaal)</Text>
          <div className="ill-floor">
            <div className={`ill-srv ${cpuUp > 80 ? "is-hot" : ""}`} style={{ width: f[2] + 20, height: f[2] + 30 }}>
              <div className="ill-cpu" style={{ height: `${cpuUp}%` }} />
              <span>{f[0]} · {cpuUp}%</span>
            </div>
          </div>
          {cpuUp > 80 ? (
            <Badge color="campaiRed" variant="light" tt="none" className="ill-mono">Alert: CPU {cpuUp}% (&gt; 80%)</Badge>
          ) : (
            <Badge color="campaiLime" variant="light" c="campaiLime.9" tt="none" className="ill-mono">VM-formaat {f[0]}</Badge>
          )}
          <Klein>Meer CPU en RAM in dezelfde machine. Herstart nodig en er is een maximum. Valt hij uit, dan ligt alles plat.</Klein>
        </div>
        <div className="ill-pane">
          <Text fw={700} size="sm">Scale out (horizontaal)</Text>
          <div className="ill-floor">
            {Array.from({ length: 5 }, (_, k) =>
              k < n ? (
                <div key={k} className={`ill-srv ${cpuOut > 80 ? "is-hot" : ""}`} style={{ width: 42, height: 70 }}>
                  <div className="ill-cpu" style={{ height: `${cpuOut}%` }} />
                  <span>{cpuOut}%</span>
                </div>
              ) : (
                <div key={k} className="ill-srv is-ghost" style={{ width: 42, height: 70 }}>
                  <span>—</span>
                </div>
              ),
            )}
          </div>
          <Badge color={cpuOut > 80 ? "campaiRed" : "campaiNavy"} variant="light" tt="none" className="ill-mono">
            {n} instances{n === 5 && cpuOut > 75 ? " · maximum bereikt" : ""}
          </Badge>
          <Klein>Regel: CPU boven 75% → +1 instance, onder 30% → −1. Een alert meldt alleen; autoscaling handelt.</Klein>
        </div>
      </div>
    </div>
  );
}
