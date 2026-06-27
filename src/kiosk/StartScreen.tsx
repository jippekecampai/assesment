// src/kiosk/StartScreen.tsx
import { useState } from "react";
import { Button, Card, Center, Stack, Text, TextInput, ThemeIcon, Title } from "@mantine/core";
import { IconClipboardCheck } from "@tabler/icons-react";
import { startAssessment, ApiError, type StartResponse } from "../lib/api";

export function StartScreen({ onStarted }: { onStarted: (code: string, data: StartResponse) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function begin() {
    setBusy(true); setError(null);
    try {
      const data = await startAssessment(code.trim().toUpperCase());
      onStarted(code.trim().toUpperCase(), data);
    } catch (e) {
      const message =
        e instanceof ApiError && e.code === "already_done"
          ? "Deze test is al ingeleverd."
          : "Ongeldige code. Controleer en probeer opnieuw.";
      setError(message);
    } finally { setBusy(false); }
  }

  return (
    <Center mih="100vh" bg="campaiNavy.0" p="md">
      <Card withBorder radius="md" p="xl" w={420}>
        <Stack align="center" gap="md">
          <ThemeIcon size={56} radius="md" color="campaiNavy"><IconClipboardCheck size={32} /></ThemeIcon>
          <Title order={2} fz="xl" c="campaiNavy.7">Start assessment</Title>
          <Text c="dimmed" size="sm" ta="center">Voer de toegangscode in die je van Campai hebt gekregen.</Text>
          <TextInput
            value={code} onChange={(e) => setCode(e.currentTarget.value)} placeholder="BV. ABC234"
            size="lg" w="100%" styles={{ input: { textAlign: "center", letterSpacing: 4, textTransform: "uppercase" } }}
            error={error} onKeyDown={(e) => e.key === "Enter" && begin()}
          />
          <Button fullWidth size="md" color="campaiNavy" loading={busy} disabled={code.trim().length < 6} onClick={begin}>
            Start
          </Button>
        </Stack>
      </Card>
    </Center>
  );
}
