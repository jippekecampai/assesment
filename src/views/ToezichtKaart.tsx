// src/views/ToezichtKaart.tsx
// Logboek van de assessment (lib/toezicht.mjs). Alleen voor de logboekrol: zonder die rol geeft de server 403
// en toont deze kaart niets. Gespreksinformatie, geen oordeel: het telt niet mee in score of rol-fit.
import { useEffect, useState } from "react";
import { Badge, Box, Card, Group, List, Text } from "@mantine/core";
import { ApiError, getToezicht, type Toezicht, type ToezichtEvent } from "../lib/api";

const REDEN: Record<string, string> = {
  "ander-venster": "ander venster of programma",
  "ander-tabblad": "ander tabblad",
  "volledig-scherm-verlaten": "uit volledig scherm",
  onbekend: "onbekend",
};
const duur = (sec: number) => (sec < 60 ? `${sec} s` : `${Math.floor(sec / 60)} min ${sec % 60} s`);
const tijd = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "");

export function ToezichtKaart({ candidateId }: { candidateId: string }) {
  const [data, setData] = useState<Toezicht | null>(null);
  const [verborgen, setVerborgen] = useState(false);

  useEffect(() => {
    setData(null);
    getToezicht(candidateId)
      .then(setData)
      .catch((e) => { if (e instanceof ApiError && e.status === 403) setVerborgen(true); });
  }, [candidateId]);

  if (verborgen || !data) return null;
  const s = data.samenvatting;
  const weg = data.events.filter((e): e is ToezichtEvent & { sec: number } => e.type === "weg");

  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="xs">
        <Text size="xs" tt="uppercase" c="dimmed" fw={700} lts={0.5}>Logboek tijdens de test</Text>
        <Text size="xs" c="dimmed">telt niet mee in de score</Text>
      </Group>
      {!s ? (
        <Text size="sm" c="dimmed">Niets vastgelegd (test gemaakt vóór het logboek bestond).</Text>
      ) : (
        <>
          <Group gap="xs" mb="sm">
            <Badge variant="light" color={s.weg ? "campaiRed" : "campaiLime"} radius="sm">
              {s.weg}× weg{s.weg ? `, samen ${duur(s.wegSec)}` : ""}
            </Badge>
            <Badge variant="light" color={s.plak ? "campaiRed" : "gray"} radius="sm">{s.plak}× plakken geprobeerd</Badge>
            <Badge variant="light" color={s.kopieer ? "campaiRed" : "gray"} radius="sm">{s.kopieer}× kopiëren geprobeerd</Badge>
            <Badge variant="light" color="campaiCyan" radius="sm">
              {s.uitleg}× uitleg{s.uitlegGeblokkeerd ? ` (+${s.uitlegGeblokkeerd} tegengehouden)` : ""}
            </Badge>
            {!s.volledigScherm && <Badge variant="light" color="gray" radius="sm">zonder volledig scherm</Badge>}
            {s.herladen > 0 && <Badge variant="light" color="gray" radius="sm">{s.herladen}× opnieuw geladen</Badge>}
          </Group>
          {weg.length > 0 && (
            <Box>
              <List size="xs" spacing={2}>
                {weg.map((e, i) => (
                  <List.Item key={i}>
                    {tijd(e.at)}: {duur(e.sec)} weg, {REDEN[e.reden ?? "onbekend"]}
                    {e.vraag != null ? `, bij vraag ${e.vraag + 1}` : ""}
                  </List.Item>
                ))}
              </List>
            </Box>
          )}
        </>
      )}
    </Card>
  );
}
