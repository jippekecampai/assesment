// src/views/Oefentoetsen.tsx
// Artifacts uit claude.ai die hier achter SSO draaien (lib/artifacts.mjs). De pagina opent in een frame;
// "Openen in nieuw tabblad" geeft hem het hele scherm.
import { useEffect, useState } from "react";
import { Anchor, Box, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { listApps, type ArtifactApp } from "../lib/api";

export function Oefentoetsen() {
  const [apps, setApps] = useState<ArtifactApp[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    listApps().then((a) => { setApps(a); setOpen((o) => o ?? a[0]?.slug ?? null); }).catch(() => setApps([]));
  }, []);

  const current = apps?.find((a) => a.slug === open) ?? null;

  return (
    <Stack gap="lg">
      {apps && apps.length === 0 && <Text c="dimmed" size="sm">Nog geen oefeningen beschikbaar.</Text>}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {(apps ?? []).map((a) => (
          <Card
            key={a.slug}
            withBorder
            radius="md"
            padding="md"
            style={{ cursor: "pointer", borderColor: a.slug === open ? "var(--mantine-color-campaiNavy-6)" : undefined }}
            onClick={() => setOpen(a.slug)}
          >
            <Title order={3} fz="md" c="campaiNavy.7">{a.titel}</Title>
            <Text size="sm" c="dimmed" mt={4}>{a.omschrijving}</Text>
          </Card>
        ))}
      </SimpleGrid>

      {current && (
        <Card withBorder radius="md" padding={0}>
          <Group justify="space-between" p="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
            <Text fw={700} size="sm" c="campaiNavy.7">{current.titel}</Text>
            <Anchor href={`/apps/${current.slug}`} target="_blank" rel="noopener">
              <Button size="xs" variant="light" color="campaiNavy" leftSection={<IconExternalLink size={14} />}>
                Openen in nieuw tabblad
              </Button>
            </Anchor>
          </Group>
          <Box h="78vh">
            <iframe
              key={current.slug}
              src={`/apps/${current.slug}`}
              title={current.titel}
              allow="fullscreen"
              style={{ width: "100%", height: "100%", border: 0, display: "block" }}
            />
          </Box>
        </Card>
      )}
    </Stack>
  );
}
