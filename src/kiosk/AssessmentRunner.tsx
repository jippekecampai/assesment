// src/kiosk/AssessmentRunner.tsx
import { useState } from "react";
import { Badge, Box, Button, Card, Center, Group, Modal, Progress, Radio, Stack, Text, Title } from "@mantine/core";
import { submitAssessment, type StartResponse, type SubmitResponse, type WegReden } from "../lib/api";
import { domainIntros } from "../lib/data";
import { useToezicht, vraagVolledigScherm } from "./useToezicht";
import { Uitleg } from "./Uitleg";

const REDEN: Record<WegReden, string> = {
  "ander-venster": "naar een ander venster of programma",
  "ander-tabblad": "naar een ander tabblad",
  "volledig-scherm-verlaten": "uit volledig scherm",
};
const duur = (sec: number) => (sec < 60 ? `${sec} seconden` : `${Math.floor(sec / 60)} min ${sec % 60} s`);

export function AssessmentRunner({ code, data, onDone }: { code: string; data: StartResponse; onDone: (r: SubmitResponse) => void }) {
  const key = `camai-kiosk-${code}`;
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    try { return JSON.parse(sessionStorage.getItem(key) || "{}"); } catch { return {}; }
  });
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const q = data.questions[idx];
  const total = data.questions.length;
  const toezicht = useToezicht(code, idx);
  const uitlegHier = Boolean(data.uitleg?.aan) && !data.uitleg?.uitDomeinen.includes(q.domain);

  function choose(choice: number) {
    const next = { ...answers, [q.id]: choice };
    setAnswers(next);
    try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
  }
  const unanswered = data.questions.filter((x) => answers[x.id] == null).length;
  const [bevestig, setBevestig] = useState(false);
  // Bevestigen in de pagina, niet met window.confirm: een browserdialoog pakt de focus en telt dan als weg.
  async function submit(bevestigd = false) {
    setError(null);
    if (unanswered > 0 && !bevestigd) { setBevestig(true); return; }
    setBevestig(false);
    setBusy(true);
    try {
      await toezicht.afronden();
      const result = await submitAssessment(code, data.questions.map((x) => ({ questionId: x.id, choice: answers[x.id] ?? -1 })));
      try { sessionStorage.removeItem(key); } catch { /* ignore */ }
      onDone(result);
    } catch (e) {
      setError("Inleveren mislukt — probeer opnieuw.");
      setBusy(false);
    }
  }

  return (
    <Center mih="100vh" bg="var(--mantine-color-gray-0)" p="md" style={{ userSelect: "none", WebkitUserSelect: "none" }}>
      <Modal
        opened={toezicht.buitenVolledigScherm && !toezicht.melding}
        onClose={() => {}}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
        title="Je bent uit volledig scherm gegaan"
      >
        <Stack gap="md">
          <Text size="sm">De test gaat verder in volledig scherm. Zolang je hier bent, telt het als weg.</Text>
          <Button color="campaiNavy" onClick={() => vraagVolledigScherm()}>Terug naar volledig scherm</Button>
        </Stack>
      </Modal>
      <Modal
        opened={Boolean(toezicht.melding)}
        onClose={toezicht.sluitMelding}
        withCloseButton={false}
        closeOnClickOutside={false}
        centered
        title="Ik zag dat je even weg was"
      >
        {toezicht.melding && (
          <Stack gap="md">
            <Box style={{ borderLeft: "3px solid var(--mantine-color-campaiRed-5)", paddingLeft: 12 }}>
              <Text fw={800} fz={26} ff="monospace" c="campaiRed.7">{duur(toezicht.melding.sec)}</Text>
              <Text size="sm" c="dimmed">
                {REDEN[toezicht.melding.reden]}
                {toezicht.melding.vraag != null ? `, bij vraag ${toezicht.melding.vraag + 1}` : ""}
              </Text>
            </Box>
            <Text size="sm">
              Dit is vastgelegd. Maak de vragen zelf, zonder andere hulpmiddelen. Uitleg vragen mag hier in de test.
            </Text>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                {toezicht.melding.totaal}× weg, samen {duur(toezicht.melding.totaalSec)}
              </Text>
              <Button color="campaiNavy" onClick={toezicht.sluitMelding}>Verder</Button>
            </Group>
          </Stack>
        )}
      </Modal>
      <Modal opened={bevestig} onClose={() => setBevestig(false)} centered title="Toch inleveren?">
        <Stack gap="md">
          <Text size="sm">{unanswered === 1 ? "1 vraag is" : `${unanswered} vragen zijn`} nog niet beantwoord.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setBevestig(false)}>Terug naar de vragen</Button>
            <Button color="campaiNavy" onClick={() => submit(true)}>Toch inleveren</Button>
          </Group>
        </Stack>
      </Modal>
      <Card withBorder radius="md" p="xl" w={720} maw="100%">
        <Stack gap="lg">
          <Group justify="space-between">
            <Text size="xs" tt="uppercase" c="dimmed" fw={700}>{data.candidate.naam} · vraag {idx + 1}/{total}</Text>
            <Badge variant="light" color="campaiCyan">Autosave</Badge>
          </Group>
          <Progress value={((idx + 1) / total) * 100} size="sm" radius="xl" color="campaiNavy" />
          <Box>
            <Badge variant="light" color="gray" radius="sm" mb="sm">{q.domain} / {q.type}</Badge>
            {domainIntros[q.domain] && (
              <Box
                mb="sm"
                p="sm"
                style={{
                  background: "var(--mantine-color-campaiNavy-0, #e6f0f7)",
                  borderRadius: "var(--mantine-radius-md)",
                  borderLeft: "3px solid var(--mantine-color-campaiNavy-4, #6fa8d6)",
                }}
              >
                <Text size="xs" c="campaiNavy.7">{domainIntros[q.domain]}</Text>
              </Box>
            )}
            <Title order={2} fz="xl" c="campaiNavy.8" lh={1.3}>{q.prompt}</Title>
          </Box>
          <Radio.Group value={answers[q.id] != null ? String(answers[q.id]) : null} onChange={(v) => choose(Number(v))}>
            <Stack gap="sm">
              {q.options.map((opt, i) => (
                <Card key={i} withBorder radius="md" p="sm" style={{ cursor: "pointer", borderColor: answers[q.id] === i ? "var(--mantine-color-campaiNavy-6)" : undefined }} onClick={() => choose(i)}>
                  <Radio value={String(i)} label={<Text size="sm">{opt}</Text>} />
                </Card>
              ))}
            </Stack>
          </Radio.Group>
          {uitlegHier && <Uitleg key={q.id} code={code} questionId={q.id} plakMelding={toezicht.plakMelding} />}
          {error && <Text c="campaiRed.6" size="sm">{error}</Text>}
          <Group justify="space-between">
            <Button variant="default" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Vorige</Button>
            {idx < total - 1
              ? <Button color="campaiNavy" onClick={() => setIdx(idx + 1)}>Volgende</Button>
              : <Button color="campaiNavy" loading={busy} onClick={() => submit()}>Inleveren</Button>}
          </Group>
        </Stack>
      </Card>
    </Center>
  );
}
