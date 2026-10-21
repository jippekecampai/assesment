// src/views/AiBewijs.tsx
// Beheer · AI-geletterdheid: bewijs voor ISO 42001 (en de AI Act-plicht tot AI-geletterdheid) per medewerker.
// Alleen zichtbaar voor de logboekrol; de server geeft anders 403.
import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Group, Stack, Table, Text } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { ApiError, getAiBewijs, type AiBewijsRij } from "../lib/api";
import { ViewHead } from "./_shared";

const datum = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—");

function csv(rows: AiBewijsRij[]) {
  const kop = ["Naam", "E-mail", "Wat is AI bevestigd", "10 gouden regels bevestigd", "Beste score AI / Copilot (%)", "Score behaald op", "Pogingen", "AI-geletterd"];
  const cel = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const regels = rows.map((r) => [r.naam, r.email, r.watIsAi, r.goudenRegels, r.besteScore, r.scoreOp, r.pogingen, r.compleet ? "ja" : "nee"].map(cel).join(";"));
  return "﻿" + [kop.map(cel).join(";"), ...regels].join("\r\n");
}

export function AiBewijs() {
  const [rows, setRows] = useState<AiBewijsRij[] | null>(null);
  const [geenRol, setGeenRol] = useState(false);
  useEffect(() => { getAiBewijs().then(setRows).catch((e) => { if (e instanceof ApiError && e.status === 403) setGeenRol(true); else setRows([]); }); }, []);

  function download() {
    if (!rows) return;
    const url = URL.createObjectURL(new Blob([csv(rows)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `ai-geletterdheid-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  const compleet = rows?.filter((r) => r.compleet).length ?? 0;
  return (
    <Stack gap="lg">
      <ViewHead mode="governance" banner="ISO 42001" title="AI-geletterdheid">
        Bewijs per medewerker: 'Wat is AI' en de 10 gouden regels bevestigd, en de toets AI-geletterdheid gehaald met minstens 70%.
      </ViewHead>
      {geenRol ? (
        <Alert radius="md" color="yellow">Dit overzicht is alleen zichtbaar voor de beoordelaarsrol.</Alert>
      ) : (
        <Card withBorder radius="md" padding="lg">
          <Group justify="space-between" mb="md">
            <Text size="sm">{rows ? `${compleet} van ${rows.length} medewerkers AI-geletterd` : "Laden…"}</Text>
            <Button size="xs" variant="light" color="campaiNavy" leftSection={<IconDownload size={14} />} disabled={!rows?.length} onClick={download}>Exporteren (CSV)</Button>
          </Group>
          {rows && rows.length === 0 ? <Text size="sm" c="dimmed">Nog niemand heeft iets bevestigd of de toets gemaakt.</Text> : (
            <Table.ScrollContainer minWidth={720}>
              <Table verticalSpacing="sm" striped>
                <Table.Thead><Table.Tr>
                  <Table.Th>Medewerker</Table.Th><Table.Th>Wat is AI</Table.Th><Table.Th>Gouden regels</Table.Th>
                  <Table.Th ta="right">Beste score</Table.Th><Table.Th>Behaald op</Table.Th><Table.Th>Status</Table.Th>
                </Table.Tr></Table.Thead>
                <Table.Tbody>
                  {(rows ?? []).map((r) => (
                    <Table.Tr key={r.entraOid}>
                      <Table.Td><Text size="sm" fw={600}>{r.naam || "Onbekend"}</Text><Text size="xs" c="dimmed">{r.email || r.entraOid}</Text></Table.Td>
                      <Table.Td>{datum(r.watIsAi)}</Table.Td>
                      <Table.Td>{datum(r.goudenRegels)}</Table.Td>
                      <Table.Td ta="right" ff="monospace">{r.besteScore === null ? "—" : `${r.besteScore}%`}</Table.Td>
                      <Table.Td>{datum(r.scoreOp)}</Table.Td>
                      <Table.Td><Badge variant="light" color={r.compleet ? "green" : "yellow"}>{r.compleet ? "AI-geletterd" : "nog niet compleet"}</Badge></Table.Td>
                    </Table.Tr>
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
