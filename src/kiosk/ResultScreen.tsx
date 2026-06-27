// src/kiosk/ResultScreen.tsx
import { Badge, Card, Center, Group, Progress, RingProgress, Stack, Text, Title } from "@mantine/core";
import type { SubmitResponse } from "../lib/api";

const color = (s: number) => (s >= 75 ? "campaiLime" : s >= 60 ? "campaiCyan" : "campaiRed");

export function ResultScreen({ result }: { result: SubmitResponse }) {
  const domains = Object.entries(result.domeinScores).sort((a, b) => b[1] - a[1]);
  return (
    <Center mih="100vh" bg="campaiNavy.0" p="md">
      <Card withBorder radius="md" p="xl" w={620} maw="100%">
        <Stack align="center" gap="lg">
          <Title order={2} c="campaiNavy.7">Bedankt — je test is ingeleverd</Title>
          <RingProgress size={150} thickness={12} roundCaps
            sections={[{ value: result.totaalScore, color: color(result.totaalScore) }]}
            label={<Stack gap={0} align="center"><Text fw={800} fz={28} ff="heading" c="campaiNavy.7">{result.totaalScore}</Text><Text size="10px" tt="uppercase" c="dimmed">score</Text></Stack>} />
          <Stack gap="sm" w="100%">
            <Text size="xs" tt="uppercase" c="dimmed" fw={700}>Uitslag per onderdeel</Text>
            {domains.map(([d, s]) => (
              <Group key={d} justify="space-between" wrap="nowrap" gap="md">
                <Text size="sm" w={220} truncate>{d}</Text>
                <Progress flex={1} value={s} size="sm" radius="xl" color={color(s)} />
                <Text size="sm" ff="monospace" w={32} ta="right">{s}</Text>
              </Group>
            ))}
          </Stack>
          <Text c="dimmed" size="sm" ta="center">Campai neemt contact met je op over de vervolgstappen.</Text>
        </Stack>
      </Card>
    </Center>
  );
}
