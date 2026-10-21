// src/kiosk/AssessmentRunner.tsx
// De sollicitantentoets in dezelfde opbouw als de oefentoetsen (src/toets/Toetsvraag): één vraag per kaart,
// opties A–D, uitleg vragen. Verschil met oefenen: geen uitslag per vraag (keuze blijft te wijzigen tot inleveren)
// en geen illustraties, want die geven bij een kennistoets het antwoord prijs.
import { useState } from "react";
import { Box, Button, Center, Group, Modal, Stack, Text } from "@mantine/core";
import { submitAssessment, vraagUitleg, type StartResponse, type SubmitResponse, type WegReden } from "../lib/api";
import { domainIntros } from "../lib/data";
import { useToezicht, vraagVolledigScherm } from "./useToezicht";
import { Toetsvraag, Voortgang } from "../toets/Toetsvraag";
import { UitlegChat } from "../toets/UitlegChat";

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
    } catch {
      setError("Inleveren mislukt — probeer opnieuw.");
      setBusy(false);
    }
  }

  return (
    <Center mih="100vh" bg="var(--mantine-color-gray-0)" p="md" style={{ userSelect: "none", WebkitUserSelect: "none", alignItems: "flex-start" }}>
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

      <Box w={760} maw="100%" pt="lg">
        <Text size="xs" tt="uppercase" c="dimmed" fw={700} mb="xs">{data.candidate.naam} · Campai-assessment</Text>
        <Voortgang
          staten={data.questions.map((x) => (answers[x.id] != null ? "beantwoord" : null))}
          huidig={idx}
          rechts={<Text size="sm" ff="monospace" c="dimmed">{total - unanswered} beantwoord</Text>}
        />
        {domainIntros[q.domain] && (
          <Box mb="sm" p="sm" style={{ background: "var(--mantine-color-campaiNavy-0)", borderRadius: "var(--mantine-radius-md)", borderLeft: "3px solid var(--mantine-color-campaiNavy-4)" }}>
            <Text size="xs" c="campaiNavy.7">{domainIntros[q.domain]}</Text>
          </Box>
        )}
        <Toetsvraag
          onderwerp={q.domain}
          nummer={`Vraag ${idx + 1}`}
          prompt={q.prompt}
          options={q.options}
          gekozen={answers[q.id] ?? null}
          onKies={choose}
          uitlegPaneel={uitlegHier ? (
            <UitlegChat
              sleutel={q.id}
              plakMelding={toezicht.plakMelding}
              vraag={(tekst, history) => vraagUitleg(code, q.id, tekst, history)}
            />
          ) : null}
          acties={
            <>
              <Button variant="default" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Vorige</Button>
              {idx < total - 1
                ? <Button color="campaiNavy" onClick={() => { setIdx(idx + 1); window.scrollTo({ top: 0 }); }}>Volgende</Button>
                : <Button color="campaiNavy" loading={busy} onClick={() => submit()}>Inleveren</Button>}
            </>
          }
        />
        {error && <Text c="campaiRed.6" size="sm" mt="sm">{error}</Text>}
      </Box>
    </Center>
  );
}
