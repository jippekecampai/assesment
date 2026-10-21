// src/views/Oefentoetsen.tsx
// Training → Oefenen → Oefentoetsen: kies een set; elke set gebruikt dezelfde toetsvraag als de sollicitantentoets.
import { useEffect, useState } from "react";
import { Badge, Card, Group, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { getOefenSet, listOefenSets, type OefenSet, type OefenSetMeta } from "../lib/api";
import { OefenToets } from "../toets/OefenToets";

export function Oefentoetsen() {
  const [sets, setSets] = useState<OefenSetMeta[] | null>(null);
  const [open, setOpen] = useState<OefenSet | null>(null);
  const [laden, setLaden] = useState<string | null>(null);

  useEffect(() => { listOefenSets().then(setSets).catch(() => setSets([])); }, []);

  async function start(id: string) {
    setLaden(id);
    try { setOpen(await getOefenSet(id)); } finally { setLaden(null); }
  }

  if (open) return <OefenToets set={open} onTerug={() => setOpen(null)} />;
  if (!sets) return <Loader size="sm" />;
  if (!sets.length) return <Text c="dimmed" size="sm">Nog geen oefentoetsen beschikbaar.</Text>;

  const kaart = (s: OefenSetMeta) => (
    <Card key={s.id} withBorder radius="md" padding="md" style={{ cursor: "pointer" }} onClick={() => start(s.id)}
      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); start(s.id); } }}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Title order={3} fz="md" c="campaiNavy.7">{s.titel}</Title>
        {laden === s.id ? <Loader size="xs" /> : <Badge variant="light" color="gray" radius="sm">{s.aantal} vragen</Badge>}
      </Group>
      <Text size="sm" c="dimmed" mt={4}>{s.omschrijving}</Text>
      {s.slaaggrens && <Badge mt="sm" variant="light" color="campaiLime" radius="sm">Telt mee voor ISO 42001</Badge>}
    </Card>
  );

  const vast = sets.filter((s) => s.soort === "vast");
  const domein = sets.filter((s) => s.soort === "domein");
  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 2 }}>{vast.map(kaart)}</SimpleGrid>
      <div>
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.5} mb="xs">Per onderwerp uit de Vragenbank</Text>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>{domein.map(kaart)}</SimpleGrid>
      </div>
    </Stack>
  );
}
