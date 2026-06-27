// src/kiosk/Kiosk.tsx
import { Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconClipboardCheck } from "@tabler/icons-react";

export default function Kiosk() {
  return (
    <Center mih="100vh" bg="campaiNavy.0">
      <Stack align="center" gap="md">
        <ThemeIcon size={56} radius="md" color="campaiNavy"><IconClipboardCheck size={32} /></ThemeIcon>
        <Text fw={800} ff="heading" c="campaiNavy.7">Campai Assessment</Text>
        <Text c="dimmed" size="sm">Kiosk — wordt gevuld in de volgende stap.</Text>
      </Stack>
    </Center>
  );
}
