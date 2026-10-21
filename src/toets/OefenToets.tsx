// src/toets/OefenToets.tsx
// Een oefentoets voor medewerkers in de opbouw van het oefen-artifact: eventueel eerst een uitleg met illustratie,
// dan één vraag per kaart met direct de uitslag en uitleg, en een resultaat per onderwerp. Voortgang blijft in
// deze browser staan; de eindscore gaat naar Mijn voortgang (en telt bij AI-geletterdheid als bewijs).
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Box, Button, Card, Group, List, Stack, Table, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { ackPolicy, bewaarOefenResultaat, getPolicyAcks, oefenUitleg, type OefenSet } from "../lib/api";
import { POLICIES } from "../views/Beleid";
import { illustratieVoor, isIllustratieKey } from "./illustraties";
import { Illustratie } from "./illustraties/Illustratie";
import { Toetsvraag, Voortgang } from "./Toetsvraag";
import { UitlegChat } from "./UitlegChat";

type Stand = { volgorde: number[]; i: number; antwoorden: Record<string, number>; gestart: boolean };
const L = "ABCD";

function laad(set: OefenSet): Stand {
  const leeg = { volgorde: set.vragen.map((_, k) => k), i: 0, antwoorden: {}, gestart: !set.intro?.length };
  try {
    const s = JSON.parse(localStorage.getItem(`oefen.${set.id}`) || "null") as Stand | null;
    if (s && Array.isArray(s.volgorde) && s.volgorde.every((n) => n >= 0 && n < set.vragen.length)) return s;
  } catch { /* geen opslag */ }
  return leeg;
}

export function OefenToets({ set, onTerug }: { set: OefenSet; onTerug: () => void }) {
  const [stand, setStand] = useState<Stand>(() => laad(set));
  const [bewaard, setBewaard] = useState<"" | "ok" | "fout">("");
  // Bevestigingen ('Wat is AI', gouden regels) voor sets die ze vragen; null = niet op te halen (dan niet blokkeren).
  const [acks, setAcks] = useState<Record<string, string> | null>(set.bevestigingen?.length ? {} : null);
  const [ackFout, setAckFout] = useState(false);
  useEffect(() => {
    if (!set.bevestigingen?.length) return;
    getPolicyAcks().then((r) => setAcks(r.acks)).catch(() => setAcks(null));
  }, [set.bevestigingen]);
  useEffect(() => { try { localStorage.setItem(`oefen.${set.id}`, JSON.stringify(stand)); } catch { /* geen opslag */ } }, [set.id, stand]);

  const { volgorde, i, antwoorden } = stand;
  const klaar = i >= volgorde.length;
  const vraag = !klaar ? set.vragen[volgorde[i]] : null;
  const telling = useMemo(() => {
    let goed = 0, fout = 0;
    for (const n of volgorde) { const v = set.vragen[n]; if (v.id in antwoorden) antwoorden[v.id] === v.answer ? goed++ : fout++; }
    return { goed, fout };
  }, [volgorde, antwoorden, set.vragen]);

  const kies = useCallback((k: number) => {
    if (!vraag || vraag.id in antwoorden) return;
    setStand((s) => ({ ...s, antwoorden: { ...s.antwoorden, [vraag.id]: k } }));
  }, [vraag, antwoorden]);

  // Eindscore één keer bewaren (alleen voor sets die bij een domein horen, zoals AI / Copilot).
  useEffect(() => {
    if (!klaar || bewaard || !set.domein || volgorde.length !== set.vragen.length) return;
    bewaarOefenResultaat({ domain: set.domein, score: telling.goed, total: volgorde.length, set: set.id })
      .then(() => setBewaard("ok")).catch(() => setBewaard("fout"));
  }, [klaar, bewaard, set, telling.goed, volgorde.length]);

  const terug = <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={onTerug} px={0} w="fit-content">Alle oefentoetsen</Button>;

  if (!stand.gestart && set.intro?.length) {
    const ill = set.vragen.map((v) => v.illustratie).find(isIllustratieKey) ?? null;
    const nodig = POLICIES.filter((p) => set.bevestigingen?.includes(p.id));
    const open = acks === null ? nodig : nodig.filter((p) => !acks[p.id]);
    return (
      <Stack gap="md">
        {terug}
        <Card withBorder radius="md" padding="lg">
          <Title order={2} fz={22} c="campaiNavy.7">{set.titel}</Title>
          <Text size="sm" c="dimmed" mt={4}>{set.omschrijving}</Text>
          <List spacing="xs" size="sm" mt="md">{set.intro.map((t, k) => <List.Item key={k}>{t}</List.Item>)}</List>
        </Card>
        {ill && <Illustratie k={ill} />}
        {nodig.map((p, n) => (
          <Card key={p.id} withBorder radius="md" padding="lg">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.5}>Stap {n + 1} · {p.label}</Text>
                <Title order={3} fz="md" c="campaiNavy.7">{p.title}</Title>
              </div>
              {acks?.[p.id] && <Badge variant="light" color="green">bevestigd {new Date(acks[p.id]).toLocaleDateString("nl-NL")}</Badge>}
            </Group>
            {p.intro && <Text size="sm" mt="xs">{p.intro}</Text>}
            <List spacing={4} size="sm" mt="xs" type={p.items.length > 5 ? "ordered" : "unordered"}>{p.items.map((t, k) => <List.Item key={k}>{t}</List.Item>)}</List>
            {!acks?.[p.id] && (
              <Button mt="md" size="sm" w="fit-content" variant="light" color="campaiNavy" onClick={() => ackPolicy(p.id).then((r) => setAcks(r.acks)).catch(() => setAckFout(true))}>
                Gelezen en begrepen
              </Button>
            )}
          </Card>
        ))}
        {ackFout && <Alert radius="md" color="yellow">Bevestigen lukte niet. Probeer het opnieuw of laad de pagina opnieuw.</Alert>}
        <Group justify="flex-end" gap="sm">
          {open.length > 0 && acks !== null && <Text size="sm" c="dimmed">Bevestig eerst {open.length === 1 ? "de stap hierboven" : "de stappen hierboven"}.</Text>}
          <Button color="campaiNavy" disabled={open.length > 0 && acks !== null} onClick={() => setStand((s) => ({ ...s, gestart: true }))}>
            Start de toets ({set.vragen.length} vragen)
          </Button>
        </Group>
      </Stack>
    );
  }

  if (klaar) {
    const totaal = volgorde.length, pct = Math.round((telling.goed / totaal) * 100);
    const grens = set.slaaggrens ?? 55;
    const per: Record<string, { g: number; t: number }> = {};
    for (const n of volgorde) { const v = set.vragen[n]; per[v.onderwerp] ??= { g: 0, t: 0 }; per[v.onderwerp].t++; if (antwoorden[v.id] === v.answer) per[v.onderwerp].g++; }
    const fout = volgorde.filter((n) => antwoorden[set.vragen[n].id] !== set.vragen[n].answer);
    return (
      <Stack gap="md">
        {terug}
        <Card withBorder radius="md" padding="lg">
          <Title order={2} fz={20} c="campaiNavy.7">Resultaat: {set.titel}</Title>
          <Group align="baseline" gap="md" mt="sm">
            <Text fz={44} fw={800} ff="monospace" c="campaiNavy.8">{telling.goed}/{totaal}</Text>
            <Text fw={700} c={pct >= grens ? "green.8" : "campaiRed.7"}>{pct}% · {pct >= grens ? "voldoende" : `nog onder de ${grens}%`}</Text>
          </Group>
          {set.slaaggrens && set.domein && volgorde.length === set.vragen.length && (
            <Alert mt="sm" radius="md" color={pct >= grens ? "green" : "yellow"}>
              {pct >= grens
                ? `Gehaald. Je score is vastgelegd${bewaard === "fout" ? " (opslaan mislukte, probeer later opnieuw)" : ""} en telt als bewijs in Mijn voortgang.`
                : `Haal minstens ${grens}% om deze toets af te ronden. Oefen de foute vragen en probeer het opnieuw.`}
            </Alert>
          )}
          <Table mt="md" verticalSpacing={6}>
            <Table.Tbody>
              {Object.entries(per).map(([o, p]) => (
                <Table.Tr key={o}>
                  <Table.Td>{set.onderwerpen[o] || o}</Table.Td>
                  <Table.Td ta="right" ff="monospace">{p.g}/{p.t}</Table.Td>
                  <Table.Td ta="right"><Badge variant="light" color={p.g === p.t ? "green" : p.g / p.t >= 0.6 ? "campaiCyan" : "campaiRed"}>{p.g === p.t ? "beheerst" : p.g / p.t >= 0.6 ? "bijna" : "herhalen"}</Badge></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Group mt="md" gap="xs">
            {fout.length > 0 && <Button color="campaiNavy" onClick={() => { setBewaard("ok"); setStand({ volgorde: fout, i: 0, antwoorden: Object.fromEntries(Object.entries(antwoorden).filter(([id]) => !fout.some((n) => set.vragen[n].id === id))), gestart: true }); }}>Alleen de {fout.length} foute opnieuw</Button>}
            <Button variant="default" onClick={() => { setBewaard(""); setStand({ volgorde: set.vragen.map((_, k) => k), i: 0, antwoorden: {}, gestart: true }); }}>Alles opnieuw</Button>
          </Group>
        </Card>
        {fout.length > 0 && (
          <Card withBorder radius="md" padding="lg">
            <Title order={3} fz={16} c="campaiNavy.7" mb="sm">Fout beantwoord</Title>
            <Stack gap="sm">
              {fout.map((n) => { const v = set.vragen[n]; const k = antwoorden[v.id]; return (
                <Box key={v.id} p="sm" style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}>
                  <Text size="sm" fw={600}>{v.prompt}</Text>
                  <Text size="sm" c="campaiRed.7">Jouw antwoord: {k !== undefined ? `${L[k]}. ${v.options[k]}` : "geen"}</Text>
                  <Text size="sm" c="green.8">Juist: {L[v.answer]}. {v.options[v.answer]}</Text>
                  <Text size="sm" c="dimmed">{v.uitleg}</Text>
                </Box>
              ); })}
            </Stack>
          </Card>
        )}
      </Stack>
    );
  }

  const v = vraag!;
  const gekozen = v.id in antwoorden ? antwoorden[v.id] : null;
  const staten = volgorde.map((n) => { const x = set.vragen[n]; return x.id in antwoorden ? (antwoorden[x.id] === x.answer ? "goed" : "fout") : null; }) as Array<"goed" | "fout" | null>;

  return (
    <Stack gap={0}>
      <Group justify="space-between" mb="sm">{terug}<Text size="sm" c="dimmed">{set.titel}</Text></Group>
      <Voortgang staten={staten} huidig={i} rechts={<Text size="sm" ff="monospace" c="dimmed">{telling.goed} goed · {telling.fout} fout</Text>} />
      <Toetsvraag
        onderwerp={set.onderwerpen[v.onderwerp] || v.onderwerp}
        nummer={`Vraag ${volgorde[i] + 1}`}
        prompt={v.prompt}
        options={v.options}
        gekozen={gekozen}
        onKies={kies}
        uitslag={gekozen !== null ? { juist: v.answer, uitleg: v.uitleg } : null}
        illustratie={illustratieVoor({ prompt: v.prompt, illustratie: v.illustratie })}
        uitlegPaneel={
          <UitlegChat
            sleutel={v.id}
            ondertitel={gekozen === null ? "verklapt het antwoord niet" : "bespreek je antwoord"}
            vraag={(tekst, history) => oefenUitleg(set.id, { vraagId: v.id, vraag: tekst, history, ...(gekozen !== null ? { gekozen } : {}) })}
          />
        }
        acties={
          <>
            <Button variant="default" disabled={i === 0} onClick={() => setStand((s) => ({ ...s, i: s.i - 1 }))}>Vorige</Button>
            <Button color="campaiNavy" disabled={gekozen === null} onClick={() => { setStand((s) => ({ ...s, i: s.i + 1 })); window.scrollTo({ top: 0 }); }}>
              {i === volgorde.length - 1 ? "Bekijk resultaat" : "Volgende vraag"}
            </Button>
          </>
        }
      />
    </Stack>
  );
}
