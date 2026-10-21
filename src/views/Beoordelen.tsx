// src/views/Beoordelen.tsx
// Recruitment → Beoordelen: de uitslagen van sollicitanten en van de rol-examens op één plek.
import { useState } from "react";
import { SegmentedControl } from "@mantine/core";
import { Reviewdashboard } from "./Reviewdashboard";
import { ExamenUitslagen } from "./ExamenUitslagen";

export function Beoordelen({ search }: { search: string }) {
  const [tab, setTab] = useState<"sollicitanten" | "examens">("sollicitanten");
  return (
    <>
      <SegmentedControl mb="lg" radius="md" value={tab} onChange={(v) => setTab(v as "sollicitanten" | "examens")}
        data={[{ value: "sollicitanten", label: "Sollicitanten" }, { value: "examens", label: "Examens" }]} />
      {tab === "sollicitanten" ? <Reviewdashboard search={search} /> : <ExamenUitslagen search={search} />}
    </>
  );
}
