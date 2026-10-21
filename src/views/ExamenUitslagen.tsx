// src/views/ExamenUitslagen.tsx
// Beoordelen → Examens: wie heeft welk examen gemaakt, geslaagd of niet, per onderwerp, en wat het toezicht zag.
// Alleen voor de beoordelaarsrol (de server geeft anders 403). Een uitslag is gespreksinformatie, geen automatisch besluit.
import { Fragment, useEffect, useState } from "react";
import { Alert, Badge, Card, Group, MultiSelect, Progress, Stack, Table, Text } from "@mantine/core";
import { ApiError, getExamenResultaten, type ExamenPoging } from "../lib/api";
import { ViewHead } from "./_shared";

const datum = (iso: string) => new Date(iso).toLocaleString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function ExamenUitslagen({ search }: { search: string }) {
  const [rijen, setRijen] = useState<ExamenPoging[] | null>(null);
  const [geenRol, setGeenRol] = useState(false);
  const [examen, setExamen] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { getExamenResultaten().then(setRijen).catch((e) => { if (e instanceof ApiError && e.status === 403) setGeenRol(true); else setRijen([]); }); }, []);

  const titels = [...new Set((rijen ?? []).map((r) => r.titel))];
  const q = search.trim().toLowerCase();
  const zichtbaar = (rijen ?? []).filter((r) => (!examen.length || examen.includes(r.titel)) && (!q || `${r.naam} ${r.email} ${r.titel}`.toLowerCase().includes(q)));

  return (
    <Stack gap="lg">
      <ViewHead mode="recruitment" banner="examens" title="Examenuitslagen">
        Wie heeft welk examen gemaakt en is geslaagd (hooguit één vraag fout). Gebruik de uitslag in het gesprek; het is geen automatisch besluit.
      </ViewHead>
      {geenRol ? <Alert radius="md" color="yellow">Dit overzicht is alleen zichtbaar voor de beoordelaarsrol.</Alert> : (
        <Card withBorder radius="md" padding="lg">
          <Group justify="space-between" mb="md" align="flex-end">
            <Text size="sm">{rijen ? `${zichtbaar.length} uitslag${zichtbaar.length === 1 ? "" : "en"}` : "Laden…"}</Text>
            <MultiSelect w={320} placeholder="Alle examens" data={titels} value={examen} onChange={setExamen} clearable aria-label="Filter op examen" />
          </Group>
          {rijen && zichtbaar.length === 0 ? <Text size="sm" c="dimmed">Nog geen ingeleverde examens.</Text> : (
            <Table.ScrollContainer minWidth={760}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead><Table.Tr>
                  <Table.Th>Deelnemer</Table.Th><Table.Th>Examen</Table.Th><Table.Th>Uitslag</Table.Th><Table.Th ta="right">Score</Table.Th><Table.Th>Toezicht</Table.Th><Table.Th>Ingeleverd</Table.Th>
                </Table.Tr></Table.Thead>
                <Table.Tbody>
                  {zichtbaar.map((r) => (
                    <Fragment key={r.id}>
                      <Table.Tr style={{ cursor: "pointer" }} onClick={() => setOpen(open === r.id ? null : r.id)}>
                        <Table.Td><Text size="sm" fw={600}>{r.naam || "Onbekend"}</Text><Text size="xs" c="dimmed">{r.email}</Text></Table.Td>
                        <Table.Td>{r.titel}</Table.Td>
                        <Table.Td><Badge variant="light" color={r.geslaagd ? "green" : "campaiRed"}>{r.geslaagd ? "geslaagd" : "niet geslaagd"}</Badge></Table.Td>
                        <Table.Td ta="right" ff="monospace">{r.goed}/{r.totaal} · {r.fout} fout</Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            {r.toezicht && r.toezicht.weg > 0 && <Badge size="xs" variant="light" color="campaiRed">{r.toezicht.weg}× weg</Badge>}
                            {r.toezicht && r.toezicht.plak > 0 && <Badge size="xs" variant="light" color="campaiRed">{r.toezicht.plak}× plakken</Badge>}
                            <Badge size="xs" variant="light" color="campaiCyan">{r.uitleg}× uitleg</Badge>
                          </Group>
                        </Table.Td>
                        <Table.Td><Text size="sm">{datum(r.ingeleverd)}</Text></Table.Td>
                      </Table.Tr>
                      {open === r.id && (
                        <Table.Tr>
                          <Table.Td colSpan={6} bg="gray.0">
                            <Stack gap={6}>
                              {Object.entries(r.perOnderwerp).map(([o, p]) => (
                                <Group key={o} gap="sm" wrap="nowrap">
                                  <Text size="sm" w={200} truncate>{o}</Text>
                                  <Progress flex={1} value={(p.goed / p.totaal) * 100} color={p.goed === p.totaal ? "green" : "campaiRed"} radius="xl" />
                                  <Text size="sm" ff="monospace" w={48} ta="right">{p.goed}/{p.totaal}</Text>
                                </Group>
                              ))}
                              {r.toezicht && <Text size="xs" c="dimmed">Weg: {r.toezicht.weg}× ({r.toezicht.wegSec} s) · plakken: {r.toezicht.plak} · kopiëren: {r.toezicht.kopieer} · {r.toezicht.volledigScherm ? "volledig scherm" : "zonder volledig scherm"} · uitleg tegengehouden: {r.uitlegGeblokkeerd}</Text>}
                            </Stack>
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
      )}
    </Stack>
  );
}
