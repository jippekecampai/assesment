// src/views/VoiceKaarten.tsx
// Beheer · Voice-scenario's: kaarten uit VoiceAI (out/scenarios, gemaakt uit echte gesprekken) importeren en
// beoordelen. Alleen goedgekeurde kaarten komen in de voice training; de fictieve basiskaarten staan er altijd in.
import { Fragment, useEffect, useState } from "react";
import { Badge, Button, Card, Group, Stack, Table, Text, Textarea, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { besluitVoiceKaart, importVoiceKaarten, listVoiceKaarten, type VoiceKaart } from "../lib/api";
import { ViewHead } from "./_shared";

const KLEUR = { concept: "gray", goedgekeurd: "campaiLime", afgekeurd: "campaiRed" } as const;

export function VoiceKaarten() {
  const [kaarten, setKaarten] = useState<VoiceKaart[] | null>(null);
  const [json, setJson] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const laad = () => listVoiceKaarten().then(setKaarten).catch(() => setKaarten([]));
  useEffect(() => { laad(); }, []);

  async function importeer() {
    let data: unknown;
    try { data = JSON.parse(json); } catch { notifications.show({ message: "Dit is geen geldige JSON.", color: "red" }); return; }
    try {
      const r = await importVoiceKaarten(data);
      notifications.show({ message: `${r.toegevoegd} kaart(en) toegevoegd als concept, ${r.overgeslagen} overgeslagen.`, color: r.toegevoegd ? "campaiNavy" : "red" });
      setJson(""); laad();
    } catch { notifications.show({ message: "Importeren mislukte.", color: "red" }); }
  }
  async function besluit(id: string, status: "goedgekeurd" | "afgekeurd") {
    try { await besluitVoiceKaart(id, status); laad(); }
    catch { notifications.show({ message: "Opslaan mislukte.", color: "red" }); }
  }

  return (
    <Stack gap="lg">
      <ViewHead mode="governance" banner="voice training" title="Voice-scenario's">
        Kaarten uit echte gesprekken komen pas in de voice training als iemand ze heeft goedgekeurd. Controleer of er
        geen echte namen, bedrijven of nummers in staan. De vijf fictieve basiskaarten staan er altijd in.
      </ViewHead>

      <Card withBorder radius="md" padding="lg">
        <Title order={3} fz="md" c="campaiNavy.7" mb="xs">Kaarten importeren</Title>
        <Textarea
          autosize minRows={3} maxRows={10} radius="md"
          placeholder="Plak hier de inhoud van een of meer kaartbestanden uit VoiceAI/pipeline/out/scenarios (één kaart of een lijst)."
          value={json} onChange={(e) => setJson(e.currentTarget.value)}
        />
        <Group justify="flex-end" mt="sm"><Button color="campaiNavy" disabled={!json.trim()} onClick={importeer}>Importeren</Button></Group>
      </Card>

      <Card withBorder radius="md" padding="lg">
        <Title order={3} fz="md" c="campaiNavy.7" mb="sm">Kaarten ({kaarten?.length ?? 0})</Title>
        {kaarten && kaarten.length === 0 ? <Text size="sm" c="dimmed">Nog geen kaarten geïmporteerd.</Text> : (
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm">
              <Table.Thead><Table.Tr><Table.Th>Kaart</Table.Th><Table.Th>Beller</Table.Th><Table.Th>Status</Table.Th><Table.Th /></Table.Tr></Table.Thead>
              <Table.Tbody>
                {(kaarten ?? []).map((k) => (
                  <Fragment key={k.id}>
                    <Table.Tr style={{ cursor: "pointer" }} onClick={() => setOpen(open === k.id ? null : k.id)}>
                      <Table.Td><Text size="sm" fw={600}>{k.titel}</Text><Text size="xs" c="dimmed">{k.onderwerp} · {k.persona?.type}</Text></Table.Td>
                      <Table.Td><Text size="sm">{k.beller?.naam}</Text><Text size="xs" c="dimmed">{k.beller?.bedrijf}</Text></Table.Td>
                      <Table.Td><Badge variant="light" color={KLEUR[k.status]}>{k.status}</Badge></Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Group gap={6} justify="flex-end" wrap="nowrap">
                          {k.status !== "goedgekeurd" && <Button size="xs" color="campaiNavy" onClick={() => besluit(k.id, "goedgekeurd")}>Goedkeuren</Button>}
                          {k.status !== "afgekeurd" && <Button size="xs" variant="default" onClick={() => besluit(k.id, "afgekeurd")}>Afkeuren</Button>}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                    {open === k.id && (
                      <Table.Tr>
                        <Table.Td colSpan={4} bg="gray.0">
                          <Text size="sm" mb={4}>{k.situatie}</Text>
                          <Text size="xs" c="dimmed">Afvinkpunten: {k.afvinkpunten.join(" · ")}</Text>
                          {k.besluitDoor && <Text size="xs" c="dimmed" mt={4}>Besluit door {k.besluitDoor} op {new Date(k.besluitOp || "").toLocaleDateString("nl-NL")}</Text>}
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Fragment>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
    </Stack>
  );
}
