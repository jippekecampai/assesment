// src/voice/Oefenlijn.tsx
// Telefoongesprek oefenen met een AI-beller, met een korte terugblik voor de medewerker zelf.
// Overgenomen uit VoiceAI/pipeline/oefenlijn_test.html. De terugblik is een AI-observatie, geen beoordeling;
// transcript en terugblik bewaart alleen deze browser (30 dagen) en de medewerker kan ze zelf wissen.
import { useEffect, useRef, useState } from "react";
import {
  Accordion, ActionIcon, Alert, Badge, Box, Button, Card, Checkbox, Group, List, Select, Stack, Tabs, Text, ThemeIcon, Title,
} from "@mantine/core";
import { IconPhone, IconPhoneOff, IconPhoneIncoming, IconTrash } from "@tabler/icons-react";
import { getVoiceAanbod, maakTerugblik, type Terugblik, type VoiceAanbod, type VoiceScenario } from "../lib/api";
import { Gesprek, STEMMEN, type Regel } from "./gesprek";

type Toestand = "rust" | "wachten" | "rinkelt" | "gesprek";
type Sessie = {
  id: string; datum: string; scenarioId: string; titel: string; beller: VoiceScenario["beller"]; persona: VoiceScenario["persona"];
  onderwerp: string; verloop: string; duur: number; transcript: Regel[]; terugblik: Terugblik | null; melding?: string;
};

const SLEUTEL = "oefenlijn.gesprekken";
const BEWAAR_DAGEN = 30;
const NET = /netwerk|vpn|forti|wifi|internet|firewall|access point|verbinding/i;
const STEM_KEUZES = [
  { value: "auto", label: "Willekeurig (past bij de beller)" },
  { value: "nl-NL-Harper:MAI-Voice-2.1-Flash", label: "Harper (vrouw)" },
  { value: "nl-NL-Fleur:MAI-Voice-2-Flash", label: "Fleur (vrouw)" },
  { value: "nl-NL-Sander:MAI-Voice-2.1-Flash", label: "Sander (man)" },
  { value: "nl-NL-Grant:MAI-Voice-2.1-Flash", label: "Grant (man)" },
];
const willekeurig = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const mmss = (sec: number) => `${Math.floor((sec || 0) / 60)}:${String((sec || 0) % 60).padStart(2, "0")}`;

function lees(): Sessie[] {
  try {
    const grens = Date.now() - BEWAAR_DAGEN * 864e5;
    return (JSON.parse(localStorage.getItem(SLEUTEL) || "[]") as Sessie[]).filter((s) => new Date(s.datum).getTime() > grens);
  } catch { return []; }
}
function schrijf(lijst: Sessie[]) { try { localStorage.setItem(SLEUTEL, JSON.stringify(lijst.slice(0, 200))); } catch { /* geen opslag */ } }

export function Oefenlijn() {
  const [aanbod, setAanbod] = useState<VoiceAanbod | null>(null);
  const [laadFout, setLaadFout] = useState(false);
  const [toestand, setToestand] = useState<Toestand>("rust");
  const [status, setStatus] = useState("Zet je headset op. Klik op de knop: binnen een paar seconden belt er een klant.");
  const [kop, setKop] = useState("Klaar om te oefenen?");
  const [transcript, setTranscript] = useState<Regel[]>([]);
  const [tijd, setTijd] = useState(0);
  const [onderwerp, setOnderwerp] = useState<string>("");
  const [bellerKeuze, setBellerKeuze] = useState<string | null>(null);
  const [stemKeuze, setStemKeuze] = useState<string>("auto");
  const [verloopKeuze, setVerloopKeuze] = useState<string>("");
  const [toonTranscript, setToonTranscript] = useState(false);
  const [sessie, setSessie] = useState<Sessie | null>(null);
  const [historie, setHistorie] = useState<Sessie[]>(() => lees());
  const [wisBevestig, setWisBevestig] = useState(false);

  const gesprek = useRef<Gesprek | null>(null);
  const gekozen = useRef<{ k: VoiceScenario; verloop: string } | null>(null);
  const regels = useRef<Regel[]>([]);
  const start = useRef(0);
  const gedaan = useRef(new Set<string>());
  const laatste = useRef<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => { getVoiceAanbod().then(setAanbod).catch(() => setLaadFout(true)); return () => opruimen(); }, []);
  useEffect(() => {
    if (toestand !== "gesprek") return;
    const id = window.setInterval(() => setTijd(Math.floor((Date.now() - start.current) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [toestand]);

  const scenarios = aanbod?.scenarios ?? [];

  function kiesVerloop() {
    if (verloopKeuze) return verloopKeuze;
    let r = Math.random();
    for (const [v, kans] of Object.entries(aanbod?.verlopen ?? {})) { if ((r -= kans) < 0) return v; }
    return "gewoon";
  }
  function kiesBeller(): VoiceScenario {
    if (bellerKeuze) return scenarios.find((k) => k.id === bellerKeuze)!;
    const past = (k: VoiceScenario) => onderwerp !== "net" || NET.test(`${k.onderwerp} ${k.titel}`);
    let pool = scenarios.filter((k) => past(k) && !gedaan.current.has(k.id));
    if (!pool.length) pool = scenarios.filter((k) => past(k) && k.id !== laatste.current);
    if (!pool.length) { gedaan.current.clear(); pool = scenarios.filter((k) => k.id !== laatste.current); }
    return willekeurig(pool.length ? pool : scenarios);
  }

  function opruimen() {
    timers.current.forEach((t) => window.clearTimeout(t)); timers.current = [];
    gesprek.current?.stop(); gesprek.current = null;
  }
  function fout(melding: string) {
    opruimen(); setToestand("rust"); setKop("Er ging iets mis"); setStatus(melding);
  }

  async function wachten(vast?: VoiceScenario) {
    if (!scenarios.length) return;
    const k = vast ?? kiesBeller();
    gekozen.current = { k, verloop: kiesVerloop() };
    regels.current = []; setTranscript([]); setSessie(null); setTijd(0);
    setToestand("wachten"); setKop("Wachten op een beller…"); setStatus("");
    const g = new Gesprek({
      onRegel: (r) => { regels.current = [...regels.current, r]; setTranscript(regels.current); },
      onFout: fout,
    });
    gesprek.current = g;
    const stem = stemKeuze !== "auto" ? stemKeuze : willekeurig(STEMMEN[k.persona.stem] || STEMMEN.vrouw);
    try { await g.verbind(k.instructies[gekozen.current.verloop], stem); }
    catch (e) {
      fout(e instanceof DOMException && e.name === "NotAllowedError"
        ? "Geef de browser toestemming voor je microfoon en probeer het opnieuw."
        : "Verbinden met de oefenlijn lukte niet. Probeer het zo opnieuw.");
      return;
    }
    timers.current.push(window.setTimeout(() => {
      g.rinkel(); setToestand("rinkelt"); setKop("Inkomend gesprek"); setStatus("Onbekend nummer — neem op");
    }, 1500 + Math.random() * 3000));
  }

  function neemOp() {
    gesprek.current?.neemOp();
    start.current = Date.now(); setToestand("gesprek"); setKop("In gesprek"); setStatus('Meld je: "Goedemorgen, Campai, met …"');
  }

  async function hangOp() {
    const duur = Math.floor((Date.now() - start.current) / 1000);
    opruimen(); setToestand("rust");
    const g = gekozen.current!; laatste.current = g.k.id; gedaan.current.add(g.k.id);
    setKop("Opgehangen"); setStatus("Klik op de knop voor de volgende beller.");
    const s: Sessie = { id: Date.now().toString(36), datum: new Date().toISOString(), scenarioId: g.k.id, titel: g.k.titel, beller: g.k.beller,
      persona: g.k.persona, onderwerp: g.k.onderwerp, verloop: g.verloop, duur, transcript: regels.current, terugblik: null };
    if (!s.transcript.some((r) => r.wie === "jij")) { s.melding = "Er is niets van jou gehoord, dus geen terugblik."; setSessie(s); return; }
    setSessie({ ...s, melding: "Even nadenken…" });
    try { s.terugblik = await maakTerugblik({ titel: s.titel, verloop: s.verloop, afvinkpunten: g.k.afvinkpunten, transcript: s.transcript }); }
    catch { s.melding = "De terugblik lukte niet. Het gesprek staat hieronder."; }
    setSessie({ ...s });
    const nieuw = [s, ...lees()]; schrijf(nieuw); setHistorie(nieuw);
  }

  if (laadFout) return <Alert color="red" radius="md">De voice training kon niet laden. Laad de pagina opnieuw.</Alert>;
  if (aanbod && !aanbod.beschikbaar) {
    return <Alert color="yellow" radius="md">De voice training is op deze site nog niet ingesteld (Voice Live-koppeling ontbreekt).</Alert>;
  }

  const knop = { rust: { kleur: "campaiNavy", icoon: <IconPhone size={34} />, label: "Start", actie: () => wachten() },
    wachten: { kleur: "gray", icoon: <IconPhone size={34} />, label: "Wachten…", actie: () => {} },
    rinkelt: { kleur: "green", icoon: <IconPhoneIncoming size={34} />, label: "Opnemen", actie: neemOp },
    gesprek: { kleur: "red", icoon: <IconPhoneOff size={34} />, label: "Ophangen", actie: hangOp } }[toestand];

  return (
    <Stack gap="md">
      <Card withBorder radius="md" padding="lg">
        <Stack align="center" gap="xs" ta="center">
          <Title order={3} fz="lg" c="campaiNavy.7">{kop}</Title>
          <Text size="sm" c="dimmed" mih={20}>{status}</Text>
          <ActionIcon
            size={92} radius={92} variant="filled" color={knop.kleur} onClick={knop.actie}
            disabled={toestand === "wachten" || !aanbod} aria-label={knop.label} loading={!aanbod}
          >
            {knop.icoon}
          </ActionIcon>
          <Text size="sm" ff="monospace" c="dimmed" mih={18}>{toestand === "gesprek" ? mmss(tijd) : ""}</Text>
          {toonTranscript && transcript.length > 0 && (
            <Box w="100%" ta="left" mah={240} style={{ overflow: "auto" }}>
              {transcript.map((r, i) => <Text key={i} size="sm"><b>{r.wie === "jij" ? "Jij" : "Klant"}:</b> {r.tekst}</Text>)}
            </Box>
          )}
        </Stack>
        <Accordion mt="md" variant="contained" radius="md">
          <Accordion.Item value="instellingen">
            <Accordion.Control><Text size="sm">Instellingen</Text></Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <Select label="Onderwerp" value={onderwerp} onChange={(v) => setOnderwerp(v ?? "")} allowDeselect={false}
                  data={[{ value: "", label: "Alles door elkaar" }, { value: "net", label: "Alleen netwerk, VPN en FortiGate" }]} />
                <Select label="Beller" placeholder="Willekeurig" value={bellerKeuze} onChange={setBellerKeuze} clearable searchable
                  data={scenarios.map((k) => ({ value: k.id, label: `${k.titel} (${k.persona.type})` }))} />
                <Select label="Stem" value={stemKeuze} onChange={(v) => setStemKeuze(v ?? "auto")} allowDeselect={false} data={STEM_KEUZES} />
                <Select label="Verloop" value={verloopKeuze} onChange={(v) => setVerloopKeuze(v ?? "")} allowDeselect={false}
                  data={[{ value: "", label: "Willekeurig (meestal soepel, soms lastig)" }, { value: "soepel", label: "Soepel" }, { value: "gewoon", label: "Gewoon" }, { value: "lastig", label: "Lastig" }]} />
                <Checkbox label="Transcript tijdens het gesprek tonen" checked={toonTranscript} onChange={(e) => setToonTranscript(e.currentTarget.checked)} />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <Text size="xs" c="dimmed" mt="sm">
          Je spreekt met een AI-beller (verzonnen klant). Je stem wordt niet opgeslagen. Transcript en terugblik bewaart alleen
          deze browser, 30 dagen; je kunt ze zelf wissen.
        </Text>
      </Card>

      {sessie && <TerugblikKaart s={sessie} onVolgende={() => wachten()} onOpnieuw={() => { const k = scenarios.find((x) => x.id === sessie.scenarioId); if (k) wachten(k); }} />}

      <Card withBorder radius="md" padding="md">
        <Accordion variant="default">
          <Accordion.Item value="historie">
            <Accordion.Control><Text size="sm" fw={700} c="campaiNavy.7">Mijn gesprekken {historie.length ? `(${historie.length})` : ""}</Text></Accordion.Control>
            <Accordion.Panel>
              {!historie.length ? <Text size="sm" c="dimmed">Nog geen gesprekken. Na het ophangen verschijnt je gesprek hier.</Text> : (
                <Stack gap={4}>
                  {historie.map((s) => {
                    const tb = s.terugblik;
                    const vink = tb ? `${tb.afvinkpunten.filter((x) => x.status === "ja").length}/${tb.afvinkpunten.filter((x) => x.status !== "niet van toepassing").length}` : "–";
                    return (
                      <Group key={s.id} justify="space-between" wrap="nowrap" p={6} style={{ borderBottom: "1px solid var(--mantine-color-gray-2)", cursor: "pointer" }}
                        onClick={() => setSessie(s)}>
                        <Box miw={0}>
                          <Text size="sm" fw={600}>{s.titel}</Text>
                          <Text size="xs" c="dimmed">
                            {new Date(s.datum).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {s.beller?.naam} · {s.verloop} · {mmss(s.duur)} · ☑ {vink}
                          </Text>
                        </Box>
                        <ActionIcon variant="subtle" color="gray" aria-label="Gesprek verwijderen"
                          onClick={(e) => { e.stopPropagation(); const n = lees().filter((x) => x.id !== s.id); schrijf(n); setHistorie(n); }}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    );
                  })}
                  {wisBevestig ? (
                    <Group mt="xs" gap="xs">
                      <Text size="sm">Alle oefengesprekken uit deze browser wissen?</Text>
                      <Button size="xs" color="red" onClick={() => { schrijf([]); setHistorie([]); setWisBevestig(false); }}>Wissen</Button>
                      <Button size="xs" variant="default" onClick={() => setWisBevestig(false)}>Annuleren</Button>
                    </Group>
                  ) : <Button size="xs" variant="subtle" color="gray" mt="xs" w="fit-content" onClick={() => setWisBevestig(true)}>Alles wissen</Button>}
                </Stack>
              )}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </Stack>
  );
}

function TerugblikKaart({ s, onVolgende, onOpnieuw }: { s: Sessie; onVolgende: () => void; onOpnieuw: () => void }) {
  const d = s.terugblik;
  const gesprek = s.transcript.map((r, i) => <Text key={i} size="sm"><b>{r.wie === "jij" ? "Jij" : "Klant"}:</b> {r.tekst}</Text>);
  const datum = new Date(s.datum);
  return (
    <Card withBorder radius="md" padding="lg">
      <Text size="xs" tt="uppercase" c="dimmed" fw={700} lts={0.5}>Terugblik</Text>
      <Text size="sm" mt={4}>
        Je sprak met <b>{s.beller?.naam || "een klant"}</b>{s.beller?.bedrijf ? ` van ${s.beller.bedrijf}` : ""}: {s.titel}
      </Text>
      <Text size="xs" c="dimmed" mb="sm">
        {datum.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })} {datum.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} · {mmss(s.duur)} · {s.verloop} gesprek · {s.persona?.type} · {s.onderwerp}
      </Text>
      {!d ? (
        <>
          {s.melding && <Text size="sm" c="dimmed" mb="sm">{s.melding}</Text>}
          {gesprek.length > 0 && <Stack gap={2}>{gesprek}</Stack>}
        </>
      ) : (
        <>
          <Box p="sm" mb="sm" style={{ background: "var(--mantine-color-yellow-0)", borderRadius: "var(--mantine-radius-md)" }}>
            <Text size="xs" tt="uppercase" fw={700} c="yellow.9">Om te onthouden</Text>
            <Text size="sm">{d.kern}</Text>
          </Box>
          <Tabs defaultValue="tips">
            <Tabs.List>
              <Tabs.Tab value="tips">Tips ({d.aandacht.length})</Tabs.Tab>
              <Tabs.Tab value="goed">Ging goed ({d.goed.length})</Tabs.Tab>
              <Tabs.Tab value="check">Checklist ({d.afvinkpunten.filter((x) => x.status === "ja").length}/{d.afvinkpunten.filter((x) => x.status !== "niet van toepassing").length})</Tabs.Tab>
              <Tabs.Tab value="gesprek">Gesprek</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="tips" pt="sm">
              <Stack gap="xs">
                {d.aandacht.map((x, i) => (
                  <Box key={i}><Text size="sm" fw={600}>{x.punt}</Text><Text size="xs" c="dimmed">“{x.citaat}”</Text><Text size="sm">→ {x.beter}</Text></Box>
                ))}
                <Box><Text size="sm" fw={600}>Zo kun je het zeggen</Text><Text size="sm">“{d.voorbeeldzin}”</Text></Box>
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="goed" pt="sm">
              <Stack gap="xs">{d.goed.map((x, i) => <Box key={i}><Text size="sm" fw={600}>✓ {x.punt}</Text><Text size="xs" c="dimmed">“{x.citaat}”</Text></Box>)}</Stack>
            </Tabs.Panel>
            <Tabs.Panel value="check" pt="sm">
              <List size="sm" spacing={4}>
                {d.afvinkpunten.map((x, i) => (
                  <List.Item key={i} icon={<ThemeIcon size={18} radius="xl" variant="light" color={x.status === "ja" ? "green" : "gray"}>{x.status === "ja" ? "✓" : x.status === "nee" ? "·" : "–"}</ThemeIcon>}>
                    {x.punt} <Badge size="xs" variant="light" color="gray">{x.status}</Badge>
                  </List.Item>
                ))}
              </List>
            </Tabs.Panel>
            <Tabs.Panel value="gesprek" pt="sm"><Stack gap={2}>{gesprek}</Stack></Tabs.Panel>
          </Tabs>
          <Text size="xs" c="dimmed" mt="sm">AI-observatie op basis van wat er gezegd is, alleen voor jou. Geen beoordeling: klopt iets niet, dan klopt het niet.</Text>
        </>
      )}
      <Group mt="md" gap="xs">
        <Button color="campaiNavy" onClick={onVolgende}>Volgende beller</Button>
        <Button variant="default" onClick={onOpnieuw}>Deze klant nog een keer</Button>
      </Group>
    </Card>
  );
}
