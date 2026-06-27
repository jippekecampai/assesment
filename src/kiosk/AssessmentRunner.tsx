// src/kiosk/AssessmentRunner.tsx
import { useState } from "react";
import { Badge, Box, Button, Card, Center, Group, Progress, Radio, Stack, Text, Title } from "@mantine/core";
import { submitAssessment, type StartResponse, type SubmitResponse } from "../lib/api";

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

  function choose(choice: number) {
    const next = { ...answers, [q.id]: choice };
    setAnswers(next);
    try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
  }
  async function submit() {
    setError(null);
    const unanswered = data.questions.filter((x) => answers[x.id] == null).length;
    if (unanswered > 0 && !window.confirm(`${unanswered} vraag/vragen niet beantwoord — toch inleveren?`)) return;
    setBusy(true);
    try {
      const result = await submitAssessment(code, data.questions.map((x) => ({ questionId: x.id, choice: answers[x.id] ?? -1 })));
      try { sessionStorage.removeItem(key); } catch { /* ignore */ }
      onDone(result);
    } catch (e) {
      setError("Inleveren mislukt — probeer opnieuw.");
      setBusy(false);
    }
  }

  return (
    <Center mih="100vh" bg="var(--mantine-color-gray-0)" p="md">
      <Card withBorder radius="md" p="xl" w={720} maw="100%">
        <Stack gap="lg">
          <Group justify="space-between">
            <Text size="xs" tt="uppercase" c="dimmed" fw={700}>{data.candidate.naam} · vraag {idx + 1}/{total}</Text>
            <Badge variant="light" color="campaiCyan">Autosave</Badge>
          </Group>
          <Progress value={((idx + 1) / total) * 100} size="sm" radius="xl" color="campaiNavy" />
          <Box>
            <Badge variant="light" color="gray" radius="sm" mb="sm">{q.domain} / {q.type}</Badge>
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
          {error && <Text c="campaiRed.6" size="sm">{error}</Text>}
          <Group justify="space-between">
            <Button variant="default" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Vorige</Button>
            {idx < total - 1
              ? <Button color="campaiNavy" onClick={() => setIdx(idx + 1)}>Volgende</Button>
              : <Button color="campaiNavy" loading={busy} onClick={submit}>Inleveren</Button>}
          </Group>
        </Stack>
      </Card>
    </Center>
  );
}
