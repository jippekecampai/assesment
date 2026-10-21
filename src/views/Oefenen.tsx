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
        Oefen een telefoongesprek, oefen per onderwerp of doe een examen voor een rol.
      </ViewHead>
      <Tabs defaultValue="toetsen" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="toetsen" leftSection={<IconFileText size={16} />}>Toetsen en examens</Tabs.Tab>
          <Tabs.Tab value="gesprek" leftSection={<IconHeadset size={16} />}>Telefoongesprek</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="gesprek"><Oefenlijn /></Tabs.Panel>
        <Tabs.Panel value="toetsen"><Oefentoetsen /></Tabs.Panel>
      </Tabs>
    </>
  );
}
