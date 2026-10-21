// src/views/MijnVoortgang.tsx
// Training · Mijn voortgang: het overzicht en de Skills Academy als twee tabbladen van één plek.
import { useState } from "react";
import { SegmentedControl } from "@mantine/core";
import { MedewerkerOverview } from "./MedewerkerOverview";
import { SkillsAcademy } from "./SkillsAcademy";

export function MijnVoortgang() {
  const [tab, setTab] = useState<"overzicht" | "academy">("overzicht");
  return (
    <>
      <SegmentedControl
        mb="lg"
        radius="md"
        value={tab}
        onChange={(v) => setTab(v as "overzicht" | "academy")}
        data={[{ value: "overzicht", label: "Overzicht" }, { value: "academy", label: "Skills Academy" }]}
      />
      {tab === "overzicht" ? <MedewerkerOverview onOpenAcademy={() => setTab("academy")} /> : <SkillsAcademy />}
    </>
  );
}
