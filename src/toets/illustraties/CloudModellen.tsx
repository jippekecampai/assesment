// src/toets/illustraties/CloudModellen.tsx
// "Wie beheert wat?": de beheerlagen als 3D-stapel per cloudmodel.
import { useState } from "react";
import { Text } from "@mantine/core";
import { Keuzes, Klein, Kop, Legenda } from "./_gedeeld";

const LAGEN = ["Applicatie", "Data", "Runtime", "Middleware", "Besturingssysteem", "Virtualisatie", "Servers", "Opslag", "Netwerk"];

type Model = "On-premises" | "IaaS" | "PaaS" | "SaaS";
const KLANTLAGEN: Record<Model, number> = { "On-premises": 9, IaaS: 5, PaaS: 2, SaaS: 0 };
const VOORBEELD: Record<Model, string> = {
  "On-premises": "Eigen serverruimte: alles is van jou, ook stroom en hardware.",
  IaaS: "Azure-VM: jij beheert het besturingssysteem en alles erboven.",
  PaaS: "App Service / Azure SQL: jij levert code en data, Microsoft de rest.",
  SaaS: "Microsoft 365: je gebruikt en configureert alleen de dienst.",
};
const MODELLEN = Object.keys(KLANTLAGEN) as Model[];

export function CloudModellen() {
  const [model, setModel] = useState<Model>("IaaS");
  const n = KLANTLAGEN[model];

  return (
    <div className="ill">
      <Kop titel="Cloudmodellen als stapel">Kies een model. Gekleurde lagen beheert de klant, grijze lagen de provider.</Kop>
      <Keuzes label="Model" opties={MODELLEN.map((m) => ({ waarde: m, label: m }))} waarde={model} onKies={setModel} />
      <div className="ill-stack">
        {LAGEN.map((l, i) => (
          <div key={l} className={`ill-slab ${i < n ? "is-klant" : "is-provider"}`}>
            <span>{l}</span>
            <small>{i < n ? "klant" : "provider"}</small>
          </div>
        ))}
      </div>
      <Text size="sm" aria-live="polite">{VOORBEELD[model]}</Text>
      <Legenda
        items={[
          { label: "klant beheert", stijl: { background: "var(--ill-accent)" } },
          { label: "provider beheert", stijl: { background: "var(--ill-surface)", border: "1px solid var(--ill-line)" } },
        ]}
      />
      <Klein>Bij elk model blijft de klant verantwoordelijk voor gebruikers, toegangsrechten en zijn eigen data (gedeelde verantwoordelijkheid).</Klein>
    </div>
  );
}
