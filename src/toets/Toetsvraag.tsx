// src/toets/Toetsvraag.tsx
// Eén vraag per kaart, in de opbouw van het oefen-artifact: onderwerp en vraagnummer, de vraag, opties A–D
// (ook met de toetsen A–D of 1–4), na het antwoord de uitslag met uitleg (alleen bij oefenen), een illustratie
// om te openen en ruimte voor "uitleg vragen". Gedeeld door de sollicitantentoets en alle oefentoetsen.
import { useEffect, useState, type ReactNode } from "react";
import { Badge, Box, Button, Card, Group, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { IconChartDots3 } from "@tabler/icons-react";
import { ILLUSTRATIES, type IllustratieKey } from "./illustraties";
import { Illustratie } from "./illustraties/Illustratie";
import "./toets.css";

const L = "ABCD";

export type Uitslag = { juist: number; uitleg: string };

export function Toetsvraag({
  onderwerp, nummer, prompt, options, gekozen, onKies, uitslag, illustratie, uitlegPaneel, acties, toetsenbord = true,
}: {
  onderwerp: string;
  nummer: string;
  prompt: string;
  options: string[];
  gekozen: number | null;
  onKies: (i: number) => void;
  /** Alleen bij oefenen: na het kiezen het juiste antwoord en de uitleg. Zonder uitslag kun je je keuze nog wijzigen. */
  uitslag?: Uitslag | null;
  illustratie?: IllustratieKey | null;
  uitlegPaneel?: ReactNode;
  acties: ReactNode;
  toetsenbord?: boolean;
}) {
  const [toon, setToon] = useState(false);
  const vast = Boolean(uitslag);

  useEffect(() => { setToon(false); }, [prompt]);
  useEffect(() => {
    if (!toetsenbord) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest("input,textarea,[contenteditable],[role=dialog]")) return;
      const k = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 }[e.key.toLowerCase()];
      if (k !== undefined && k < options.length && !vast) onKies(k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toetsenbord, options.length, vast, onKies]);

  return (
    <Card withBorder radius="md" padding="lg" className="toetsvraag">
      <Stack gap="md">
        <Group justify="space-between" gap="xs">
          <Badge variant="light" color="campaiCyan" radius="sm" tt="none">{onderwerp}</Badge>
          <Text size="xs" c="dimmed" ff="monospace">{nummer}</Text>
        </Group>
        <Title order={2} fz={20} lh={1.35} c="campaiNavy.8">{prompt}</Title>
        <Stack gap={10} role="radiogroup" aria-label="Antwoorden">
          {options.map((o, i) => {
            const staat = !uitslag ? (gekozen === i ? "gekozen" : "")
              : i === uitslag.juist ? "goed" : i === gekozen ? "fout" : "dim";
            return (
              <UnstyledButton
                key={i}
                className={`toets-optie ${staat}`}
                role="radio"
                aria-checked={gekozen === i}
                disabled={vast}
                onClick={() => onKies(i)}
              >
                <span className="toets-letter">{L[i]}</span>
                <span>{o}</span>
              </UnstyledButton>
            );
          })}
        </Stack>
        {uitslag && (
          <Box className="toets-uitleg">
            <Text fw={700} c={gekozen === uitslag.juist ? "green.8" : "campaiRed.7"}>
              {gekozen === uitslag.juist ? "Goed!" : "Niet goed."} Het juiste antwoord is {L[uitslag.juist]}.
            </Text>
            {uitslag.uitleg && <Text size="sm" mt={4}>{uitslag.uitleg}</Text>}
          </Box>
        )}
        {illustratie && (
          <Box>
            <Button variant="light" color="campaiNavy" size="sm" leftSection={<IconChartDots3 size={16} />} aria-expanded={toon} onClick={() => setToon((t) => !t)}>
              {toon ? "Verberg illustratie" : "Toon illustratie"}: {ILLUSTRATIES[illustratie].titel}
            </Button>
            {toon && <Box mt="sm"><Illustratie k={illustratie} /></Box>}
          </Box>
        )}
        {uitlegPaneel}
        <Group justify="space-between" gap="xs">
          {acties}
        </Group>
        {toetsenbord && <Text size="xs" c="dimmed" ff="monospace" visibleFrom="sm">toets A–D of 1–4 om te kiezen</Text>}
      </Stack>
    </Card>
  );
}

/** Voortgangsbalk zoals in het artifact: per vraag een segment, groen goed, rood fout, blauw beantwoord. */
export function Voortgang({ staten, huidig, rechts }: { staten: Array<"goed" | "fout" | "beantwoord" | null>; huidig: number; rechts?: ReactNode }) {
  return (
    <Group gap="sm" wrap="nowrap" className="toets-voortgang" aria-live="polite">
      <Text size="sm" ff="monospace" c="dimmed">{Math.min(huidig + 1, staten.length)} / {staten.length}</Text>
      <Box className="toets-balk">
        {staten.map((s, i) => <span key={i} className={`${s ?? ""} ${i === huidig ? "nu" : ""}`} />)}
      </Box>
      {rechts}
    </Group>
  );
}
