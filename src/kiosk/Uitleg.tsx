// src/kiosk/Uitleg.tsx
// Uitleg bij de huidige vraag. Typen alleen: plakken houdt useToezicht tegen. De server controleert elk
// antwoord op verklappen (lib/uitleg.mjs); een geblokkeerd antwoord komt niet in de geschiedenis.
import { useEffect, useState } from "react";
import { Box, Button, Card, Group, Stack, Text, TextInput } from "@mantine/core";
import { ApiError, vraagUitleg, type UitlegTurn } from "../lib/api";

type Bericht = UitlegTurn | { role: "note"; content: string };

const FOUT: Record<string, string> = {
  uitleg_max: "Je hebt het maximale aantal uitlegvragen voor deze test gebruikt.",
  not_running: "De test is al ingeleverd.",
  ai_not_configured: "Uitleg is nu niet beschikbaar.",
};

export function Uitleg({ code, questionId, plakMelding }: { code: string; questionId: string; plakMelding: number }) {
  const [gesprekken, setGesprekken] = useState<Record<string, Bericht[]>>({});
  const [vraag, setVraag] = useState("");
  const [busy, setBusy] = useState(false);
  const [plakZichtbaar, setPlakZichtbaar] = useState(false);
  const berichten = gesprekken[questionId] || [];

  useEffect(() => {
    if (!plakMelding) return;
    setPlakZichtbaar(true);
    const t = window.setTimeout(() => setPlakZichtbaar(false), 4000);
    return () => window.clearTimeout(t);
  }, [plakMelding]);

  const voegToe = (b: Bericht) => setGesprekken((g) => ({ ...g, [questionId]: [...(g[questionId] || []), b] }));

  async function stuur() {
    const tekst = vraag.trim();
    if (!tekst || busy) return;
    setVraag("");
    setBusy(true);
    const history = berichten.filter((b): b is UitlegTurn => b.role !== "note");
    voegToe({ role: "user", content: tekst });
    try {
      const r = await vraagUitleg(code, questionId, tekst, history);
      voegToe(r.antwoord
        ? { role: "assistant", content: r.antwoord }
        : { role: "note", content: "Dit antwoord zou het juiste antwoord verklappen, daarom zie je het niet. Vraag naar een begrip, bijvoorbeeld ‘wat doet een switch?’." });
    } catch (e) {
      voegToe({ role: "note", content: (e instanceof ApiError && e.code && FOUT[e.code]) || "Uitleg ophalen mislukte. Probeer het opnieuw." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
      <Stack gap="sm">
        <Group justify="space-between" align="baseline">
          <Text size="sm" fw={700} c="campaiNavy.7">Uitleg vragen</Text>
          <Text size="xs" c="dimmed">je krijgt uitleg, nooit het antwoord</Text>
        </Group>
        {berichten.map((b, i) => (
          <Box
            key={i}
            p="xs"
            style={{
              alignSelf: b.role === "user" ? "flex-end" : "stretch",
              maxWidth: b.role === "user" ? "85%" : undefined,
              background: b.role === "user" ? "var(--mantine-color-campaiNavy-0)" : "var(--mantine-color-body)",
              border: b.role === "user" ? undefined : "1px solid var(--mantine-color-gray-3)",
              borderRadius: "var(--mantine-radius-md)",
            }}
          >
            <Text size="sm" c={b.role === "note" ? "dimmed" : undefined} style={{ whiteSpace: "pre-wrap" }}>{b.content}</Text>
          </Box>
        ))}
        <Group gap="xs" wrap="nowrap">
          <TextInput
            flex={1}
            value={vraag}
            onChange={(e) => setVraag(e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); stuur(); } }}
            placeholder="Bijvoorbeeld: wat is het verschil tussen IaaS en PaaS?"
            maxLength={300}
            autoComplete="off"
            aria-label="Je vraag om uitleg"
          />
          <Button color="campaiNavy" loading={busy} disabled={!vraag.trim()} onClick={stuur}>Vraag</Button>
        </Group>
        {plakZichtbaar && <Text size="xs" c="campaiRed.7">Plakken werkt hier niet. Typ je vraag zelf.</Text>}
      </Stack>
    </Card>
  );
}
