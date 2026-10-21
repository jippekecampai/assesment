// src/views/Oefenen.tsx
// Training · Oefenen: een telefoongesprek oefenen (Oefenlijn) of een oefentoets maken.
import { Tabs } from "@mantine/core";
import { IconFileText, IconHeadset } from "@tabler/icons-react";
import { Oefenlijn } from "../voice/Oefenlijn";
import { Oefentoetsen } from "./Oefentoetsen";
import { ViewHead } from "./_shared";

export function Oefenen() {
  return (
    <>
      <ViewHead mode="academy" banner="oefenen" title="Oefenen">
        Oefen een telefoongesprek met een AI-beller of maak een oefentoets. Alleen jij ziet je resultaten.
      </ViewHead>
      <Tabs defaultValue="gesprek" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="gesprek" leftSection={<IconHeadset size={16} />}>Telefoongesprek</Tabs.Tab>
          <Tabs.Tab value="toetsen" leftSection={<IconFileText size={16} />}>Oefentoetsen</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="gesprek"><Oefenlijn /></Tabs.Panel>
        <Tabs.Panel value="toetsen"><Oefentoetsen /></Tabs.Panel>
      </Tabs>
    </>
  );
}
