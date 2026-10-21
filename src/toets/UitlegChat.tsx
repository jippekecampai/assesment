// src/toets/UitlegChat.tsx
// "Uitleg vragen" bij een toetsvraag: alleen typen (plakken werkt niet), per vraag een eigen gesprek.
// De server controleert vóór het antwoord of de uitleg niets verklapt; een tegengehouden antwoord komt niet in de geschiedenis.
import { useEffect, useState } from "react";
import { Box, Button, Card, Group, Stack, Text, TextInput } from "@mantine/core";
import { ApiError, type UitlegTurn } from "../lib/api";

type Bericht = UitlegTurn | { role: "note"; content: string };
export type UitlegVraag = (tekst: string, history: UitlegTurn[]) => Promise<{ antwoord?: string; geblokkeerd?: boolean }>;

const FOUT: Record<string, string> = {
  uitleg_max: "Je hebt het maximale aantal uitlegvragen gebruikt.",
  rate_limited: "Even te veel vragen achter elkaar. Probeer het over een paar minuten opnieuw.",
  not_running: "De test is al ingeleverd.",
  ai_not_configured: "Uitleg is nu niet beschikbaar.",
};

export function UitlegChat({ sleutel, vraag, plakMelding = 0 }: { sleutel: string; vraag: UitlegVraag; plakMelding?: number }) {
  const [gesprekken, setGesprekken] = useState<Record<string, Bericht[]>>({});
  const [tekst, setTekst] = useState("");
  const [busy, setBusy] = useState(false);
  const [plak, setPlak] = useState(0);
  const berichten = gesprekken[sleutel] || [];

  useEffect(() => {
    const t = plakMelding || plak;
    if (!t) return;
    const id = window.setTimeout(() => { setPlak(0); }, 4000);
    return () => window.clearTimeout(id);
  }, [plakMelding, plak]);
  const plakZichtbaar = Boolean(plak) || (plakMelding > 0 && Date.now() - plakMelding < 4000);

  const voegToe = (b: Bericht) => setGesprekken((g) => ({ ...g, [sleutel]: [...(g[sleutel] || []), b] }));

  async function stuur() {
    const t = tekst.trim();
    if (!t || busy) return;
    setTekst(""); setBusy(true);
    const history = berichten.filter((b): b is UitlegTurn => b.role !== "note");
    voegToe({ role: "user", content: t });
    try {
      const r = await vraag(t, history);
      voegToe(r.antwoord
        ? { role: "assistant", content: r.antwoord }
        : { role: "note", content: "Dit antwoord zou het juiste antwoord verklappen, daarom zie je het niet. Vraag naar een begrip, bijvoorbeeld ‘wat doet een switch?’." });
    } catch (e) {
      voegToe({ role: "note", content: (e instanceof ApiError && e.code && FOUT[e.code]) || "Uitleg ophalen lukte niet. Probeer het opnieuw." });
    } finally { setBusy(false); }
  }

  return (
    <Card withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
      <Stack gap="sm">
        <Text size="sm" fw={700} c="campaiNavy.7">Uitleg vragen</Text>
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
            value={tekst}
            onChange={(e) => setTekst(e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); stuur(); } }}
            onPaste={(e) => { e.preventDefault(); setPlak(Date.now()); }}
            onDrop={(e) => { e.preventDefault(); setPlak(Date.now()); }}
            placeholder="Bijvoorbeeld: wat is het verschil tussen IaaS en PaaS?"
            maxLength={300}
            autoComplete="off"
            aria-label="Je vraag om uitleg"
          />
          <Button color="campaiNavy" loading={busy} disabled={!tekst.trim()} onClick={stuur}>Vraag</Button>
        </Group>
        {plakZichtbaar && <Text size="xs" c="campaiRed.7">Plakken werkt hier niet. Typ je vraag zelf.</Text>}
      </Stack>
    </Card>
  );
}
