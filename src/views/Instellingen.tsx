// src/views/Instellingen.tsx
// Beheer (onderaan in het menu): cijfers en rechten, het AI-beleid en de voice-scenario's op één plek.
import { useState } from "react";
import { SegmentedControl } from "@mantine/core";
import { Beheer } from "./Beheer";
import { Beleid } from "./Beleid";
import { VoiceKaarten } from "./VoiceKaarten";

type Tab = "beheer" | "beleid" | "voice";

export function Instellingen() {
  const [tab, setTab] = useState<Tab>("beheer");
  return (
    <>
      <SegmentedControl
        mb="lg"
        radius="md"
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        data={[{ value: "beheer", label: "Rollen & cijfers" }, { value: "beleid", label: "Beleid" }, { value: "voice", label: "Voice-scenario's" }]}
      />
      {tab === "beheer" && <Beheer />}
      {tab === "beleid" && <Beleid />}
      {tab === "voice" && <VoiceKaarten />}
    </>
  );
}
