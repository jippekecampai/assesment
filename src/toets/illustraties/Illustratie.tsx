// src/toets/illustraties/Illustratie.tsx
// Rendert één illustratie in een omlijst kader met titel.
import { Box, Card, Group, Text } from "@mantine/core";
import { ILLUSTRATIES, type IllustratieKey } from "./index";

export function Illustratie({ k }: { k: IllustratieKey }) {
  const ill = ILLUSTRATIES[k];
  if (!ill) return null;
  const { titel, Component } = ill;
  return (
    <Card withBorder radius="md" padding={0} component="section" aria-label={`Illustratie: ${titel}`}>
      <Group p="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <Text fw={700} size="sm" c="campaiNavy.7">{titel}</Text>
      </Group>
      <Box p="md" bg="gray.0">
        {/* key: bij wisselen van illustratie start de component schoon (timers worden opgeruimd). */}
        <Component key={k} />
      </Box>
    </Card>
  );
}
