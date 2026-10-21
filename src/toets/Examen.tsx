// src/toets/Examen.tsx
// Een examen voor een rol (Cloud Engineer, AI Engineer). Opbouw: spelregels → examen in volledig scherm (alleen het
// examen, niet de hele site) → inleveren → uitslag met uitleg per vraag. Geen uitslag per vraag tijdens het examen;
// uitleg vragen en de illustraties mogen wel. Slagen = hooguit `maxFout` vragen fout. De server rekent de uitslag uit.
import { useCallback, useRef, useState } from "react";
import { Alert, Badge, Box, Button, Card, Group, List, Modal, Progress, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react";
import { examenEvents, examenUitleg, leverExamenIn, startExamen, type Examen as ExamenType, type ExamenMeta, type ExamenUitslag, type WegReden } from "../lib/api";
import { kanVolledigScherm, useToezicht, vraagVolledigScherm } from "../kiosk/useToezicht";
import { illustratieVoor, isIllustratieKey, type IllustratieKey } from "./illustraties";
import { Toetsvraag, Voortgang } from "./Toetsvraag";
import { UitlegChat } from "./UitlegChat";

const L = "ABCD";
const REDEN: Record<WegReden, string> = {
  "ander-venster": "naar een ander venster of programma",
  "ander-tabblad": "naar een ander tabblad",
  "volledig-scherm-verlaten": "uit volledig scherm",
};
const duur = (sec: number) => (sec < 60 ? `${sec} seconden` : `${Math.floor(sec / 60)} min ${sec % 60} s`);

function illustratieBij(e: ExamenType, v: ExamenType["vragen"][number]): IllustratieKey | null {
  const perOnderwerp = e.illustratiePerOnderwerp?.[v.onderwerp];
  return illustratieVoor({ prompt: v.prompt, illustratie: v.illustratie }) ?? (isIllustratieKey(perOnderwerp) ? perOnderwerp : null);
}

export function Examen({ meta, onTerug }: { meta: ExamenMeta; onTerug: () => void }) {
  const kader = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<"regels" | "bezig" | "uitslag">("regels");
  const [poging, setPoging] = useState<{ id: string; examen: ExamenType } | null>(null);
  const [uitslag, setUitslag] = useState<ExamenUitslag | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function begin() {
    setBusy(true); setFout(null);
    await vraagVolledigScherm(kader.current);
    try {
      const r = await startExamen(meta.id);
      setPoging({ id: r.poging, examen: r.examen }); setFase("bezig");
    } catch { setFout("Het examen kon niet starten. Probeer het opnieuw."); }
    finally { setBusy(false); }
  }

  return (
    <Box ref={kader} className="examen-kader">
      {fase === "regels" && (
        <Stack gap="md" maw={760} mx="auto">
          <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={onTerug} px={0} w="fit-content">Terug</Button>
          <Card withBorder radius="lg" padding="xl">
            <Text size="xs" tt="uppercase" fw={700} c="campaiCyan.7" lts={0.6}>Examen · {meta.rol}</Text>
            <Title order={2} fz={26} c="campaiNavy.8" mt={4}>{meta.titel}</Title>
            <Text c="dimmed" mt="xs">{meta.omschrijving}</Text>
            <SimpleGrid cols={{ base: 1, sm: 3 }} mt="lg">
              <Regel titel={`${meta.aantal} vragen`} tekst="Eén beste antwoord per vraag." />
              <Regel titel={`Hooguit ${meta.maxFout} fout`} tekst={`Je slaagt met ${meta.aantal - meta.maxFout} of meer goed.`} />
              <Regel titel="Uitleg mag" tekst="Vraag om uitleg en open de illustratie. Lees die goed." />
            </SimpleGrid>
            <List size="sm" spacing={6} mt="lg">
              <List.Item>Het examen draait in volledig scherm. Ga je weg of uit volledig scherm, dan wordt dat vastgelegd.</List.Item>
              <List.Item>Plakken in het uitlegveld werkt niet; typ je vraag zelf. De uitleg geeft nooit het antwoord.</List.Item>
              <List.Item>Je ziet je uitslag en de uitleg per vraag na het inleveren. De beoordelaar ziet je uitslag ook.</List.Item>
            </List>
            {!kanVolledigScherm() && <Text size="xs" c="campaiRed.7" mt="sm">Volledig scherm werkt niet op dit apparaat; weggaan wordt wel vastgelegd.</Text>}
            {fout && <Alert color="red" radius="md" mt="md">{fout}</Alert>}
            <Group justify="flex-end" mt="xl">
              <Button size="md" color="campaiNavy" loading={busy} onClick={begin}>Start het examen</Button>
            </Group>
          </Card>
        </Stack>
      )}
      {fase === "bezig" && poging && (
        <ExamenBezig
          pogingId={poging.id}
          examen={poging.examen}
          onKlaar={(r) => { setUitslag(r); setFase("uitslag"); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); }}
        />
      )}
      {fase === "uitslag" && uitslag && poging && <Uitslag examen={poging.examen} uitslag={uitslag} onTerug={onTerug} />}
    </Box>
  );
}

function Regel({ titel, tekst }: { titel: string; tekst: string }) {
  return (
    <Box p="md" style={{ background: "var(--mantine-color-campaiNavy-0)", borderRadius: "var(--mantine-radius-md)" }}>
      <Text fw={800} c="campaiNavy.8">{titel}</Text>
      <Text size="sm" c="dimmed">{tekst}</Text>
    </Box>
  );
}

function ExamenBezig({ pogingId, examen, onKlaar }: { pogingId: string; examen: ExamenType; onKlaar: (r: ExamenUitslag) => void }) {
  const [antwoorden, setAntwoorden] = useState<Record<string, number>>({});
  const [i, setI] = useState(0);
  const [bevestig, setBevestig] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const verstuur = useCallback((events: Parameters<typeof examenEvents>[1]) => examenEvents(pogingId, events), [pogingId]);
  const toezicht = useToezicht(`examen-${pogingId}`, i, verstuur);
  const v = examen.vragen[i];
  const open = examen.vragen.filter((x) => antwoorden[x.id] === undefined).length;
  const kies = useCallback((k: number) => setAntwoorden((a) => ({ ...a, [v.id]: k })), [v.id]);

  async function inleveren() {
    setBevestig(false); setBusy(true); setFout(null);
    try { await toezicht.afronden(); onKlaar(await leverExamenIn(pogingId, antwoorden, [])); }
    catch { setFout("Inleveren lukte niet. Probeer het opnieuw."); setBusy(false); }
  }

  return (
    <Box maw={820} mx="auto" style={{ userSelect: "none", WebkitUserSelect: "none" }}>
      <Modal withinPortal={false} opened={toezicht.buitenVolledigScherm && !toezicht.melding} onClose={() => {}} withCloseButton={false} closeOnClickOutside={false} closeOnEscape={false} centered title="Je bent uit volledig scherm gegaan">
        <Stack gap="md">
          <Text size="sm">Het examen gaat verder in volledig scherm. Zolang je hier bent, telt het als weg.</Text>
          <Button color="campaiNavy" onClick={() => vraagVolledigScherm(document.querySelector<HTMLElement>(".examen-kader"))}>Terug naar volledig scherm</Button>
        </Stack>
      </Modal>
      <Modal withinPortal={false} opened={Boolean(toezicht.melding)} onClose={toezicht.sluitMelding} withCloseButton={false} closeOnClickOutside={false} centered title="Ik zag dat je even weg was">
        {toezicht.melding && (
          <Stack gap="md">
            <Box style={{ borderLeft: "3px solid var(--mantine-color-campaiRed-5)", paddingLeft: 12 }}>
              <Text fw={800} fz={26} ff="monospace" c="campaiRed.7">{duur(toezicht.melding.sec)}</Text>
              <Text size="sm" c="dimmed">{REDEN[toezicht.melding.reden]}{toezicht.melding.vraag != null ? `, bij vraag ${toezicht.melding.vraag + 1}` : ""}</Text>
            </Box>
            <Text size="sm">Dit is vastgelegd. Maak het examen zelf; uitleg vragen mag hier.</Text>
            <Group justify="flex-end"><Button color="campaiNavy" onClick={toezicht.sluitMelding}>Verder</Button></Group>
          </Stack>
        )}
      </Modal>
      <Modal withinPortal={false} opened={bevestig} onClose={() => setBevestig(false)} centered title="Examen inleveren?">
        <Stack gap="md">
          <Text size="sm">{open === 0 ? "Je hebt alle vragen beantwoord." : `${open === 1 ? "1 vraag is" : `${open} vragen zijn`} nog niet beantwoord; die tellen als fout.`} Na inleveren kun je niets meer wijzigen.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setBevestig(false)}>Terug naar de vragen</Button>
            <Button color="campaiNavy" onClick={inleveren}>Inleveren</Button>
          </Group>
        </Stack>
      </Modal>

      <Group justify="space-between" mb="xs">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.5}>Examen · {examen.titel}</Text>
        <Text size="xs" c="dimmed">hooguit {examen.maxFout} fout om te slagen</Text>
      </Group>
      <Voortgang
        staten={examen.vragen.map((x) => (antwoorden[x.id] !== undefined ? "beantwoord" : null))}
        huidig={i}
        rechts={<Text size="sm" ff="monospace" c="dimmed">{examen.vragen.length - open} beantwoord</Text>}
      />
      <Toetsvraag
        onderwerp={examen.onderwerpen[v.onderwerp] || v.onderwerp}
        nummer={`Vraag ${i + 1}`}
        prompt={v.prompt}
        options={v.options}
        gekozen={antwoorden[v.id] ?? null}
        onKies={kies}
        illustratie={illustratieBij(examen, v)}
        uitlegPaneel={<UitlegChat sleutel={v.id} plakMelding={toezicht.plakMelding} vraag={(tekst, history) => examenUitleg(pogingId, { vraagId: v.id, vraag: tekst, history })} />}
        acties={
          <>
            <Button variant="default" disabled={i === 0} onClick={() => setI(i - 1)}>Vorige</Button>
            <Group gap="xs">
              {i < examen.vragen.length - 1 && <Button variant="subtle" color="gray" onClick={() => setBevestig(true)}>Inleveren</Button>}
              {i < examen.vragen.length - 1
                ? <Button color="campaiNavy" onClick={() => { setI(i + 1); document.querySelector(".examen-kader")?.scrollTo({ top: 0 }); }}>Volgende</Button>
                : <Button color="campaiNavy" loading={busy} onClick={() => setBevestig(true)}>Inleveren</Button>}
            </Group>
          </>
        }
      />
      {fout && <Alert color="red" radius="md" mt="sm">{fout}</Alert>}
    </Box>
  );
}

function Uitslag({ examen, uitslag, onTerug }: { examen: ExamenType; uitslag: ExamenUitslag; onTerug: () => void }) {
  const [alles, setAlles] = useState(false);
  const detail = new Map(uitslag.details.map((d) => [d.id, d]));
  const getoond = examen.vragen.filter((v) => alles || !detail.get(v.id)?.goed);
  return (
    <Stack gap="md" maw={820} mx="auto">
      <Card withBorder radius="lg" padding="xl">
        <Group gap="md" wrap="nowrap" align="flex-start">
          <ThemeIcon size={56} radius="xl" color={uitslag.geslaagd ? "green" : "campaiRed"} variant="light">
            {uitslag.geslaagd ? <IconCheck size={30} /> : <IconX size={30} />}
          </ThemeIcon>
          <Box>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.5}>Examen · {examen.rol}</Text>
            <Title order={2} fz={24} c={uitslag.geslaagd ? "green.8" : "campaiRed.7"}>{uitslag.geslaagd ? "Geslaagd" : "Nog niet geslaagd"}</Title>
            <Text mt={4}>
              {uitslag.goed} van {uitslag.totaal} goed ({uitslag.pct}%), {uitslag.fout} fout.{" "}
              {uitslag.geslaagd ? "Je uitslag is vastgelegd voor de beoordelaar." : `Om te slagen mag je hooguit ${examen.maxFout} vraag fout hebben. Lees de uitleg hieronder en probeer het later opnieuw.`}
            </Text>
          </Box>
        </Group>
        <Stack gap={8} mt="lg">
          {Object.entries(uitslag.perOnderwerp).map(([o, p]) => (
            <Group key={o} gap="sm" wrap="nowrap">
              <Text size="sm" w={220} truncate>{examen.onderwerpen[o] || o}</Text>
              <Progress flex={1} value={(p.goed / p.totaal) * 100} color={p.goed === p.totaal ? "green" : "campaiRed"} radius="xl" />
              <Text size="sm" ff="monospace" w={48} ta="right">{p.goed}/{p.totaal}</Text>
            </Group>
          ))}
        </Stack>
      </Card>
      <Card withBorder radius="lg" padding="lg">
        <Group justify="space-between" mb="sm">
          <Title order={3} fz={16} c="campaiNavy.7">{alles ? "Alle vragen" : uitslag.fout ? "Wat ging er mis" : "Alles goed"}</Title>
          <Button size="xs" variant="subtle" color="campaiNavy" onClick={() => setAlles((a) => !a)}>{alles ? "Alleen fouten" : "Alle vragen tonen"}</Button>
        </Group>
        <Stack gap="sm">
          {getoond.map((v) => {
            const d = detail.get(v.id)!;
            return (
              <Box key={v.id} p="sm" style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}>
                <Group gap={6} mb={4}><Badge size="xs" variant="light" color={d.goed ? "green" : "campaiRed"}>{d.goed ? "goed" : "fout"}</Badge><Text size="xs" c="dimmed">{examen.onderwerpen[v.onderwerp] || v.onderwerp}</Text></Group>
                <Text size="sm" fw={600}>{v.prompt}</Text>
                {!d.goed && <Text size="sm" c="campaiRed.7">Jouw antwoord: {d.gekozen >= 0 ? `${L[d.gekozen]}. ${v.options[d.gekozen]}` : "geen"}</Text>}
                <Text size="sm" c="green.8">Juist: {L[d.juist]}. {v.options[d.juist]}</Text>
                <Text size="sm" c="dimmed" mt={2}>{d.uitleg}</Text>
              </Box>
            );
          })}
        </Stack>
      </Card>
      <Group justify="flex-end"><Button variant="default" onClick={onTerug}>Naar het overzicht</Button></Group>
    </Stack>
  );
}
