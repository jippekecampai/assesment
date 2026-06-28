import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Grid,
  Group,
  Loader,
  Progress,
  RingProgress,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShieldCheck, IconFlag, IconDownload } from "@tabler/icons-react";

import { roles } from "../lib/data";
import {
  type Candidate,
  type CandidateResult,
  getCandidateResult,
  listCandidates,
  flagQuestion,
} from "../lib/api";
import { ViewHead } from "./_shared";

function scoreColor(score: number): string {
  if (score >= 75) return "campaiLime";
  if (score >= 60) return "campaiCyan";
  return "campaiRed";
}

function roleFitColor(state: string): string {
  const s = state.toLowerCase();
  if (s.includes("niet")) return "campaiRed";
  if (s.includes("geschikt") || s.includes("sterk")) return "campaiLime";
  if (s.includes("borderline") || s.includes("twijfel")) return "yellow";
  return "campaiRed";
}

const STATUS_LABELS: Record<string, string> = {
  uitgenodigd: "Uitgenodigd",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

const STATUS_COLORS: Record<string, string> = {
  uitgenodigd: "gray",
  bezig: "campaiCyan",
  afgerond: "campaiLime",
};

function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

// Bouwt een printbaar (PDF) assessmentrapport en opent het in een nieuw venster.
function exportReport(candidate: Candidate, result: CandidateResult, roleName: string) {
  const goed = result.details.filter((d) => d.correct).length;
  const datum = new Date(result.ingediendOp).toLocaleDateString("nl-NL", { day: "2-digit", month: "long", year: "numeric" });
  const domeinRows = Object.entries(result.domeinScores)
    .sort((a, b) => b[1] - a[1])
    .map(([d, s]) => `<tr><td>${esc(d)}</td><td class="num">${s}</td></tr>`)
    .join("");
  const vragen = result.details
    .map((d, i) => {
      const opts = d.options
        .map((o, idx) => {
          const correct = idx === d.correctIndex;
          const chosen = idx === d.chosenIndex;
          const tag = correct ? ' <b style="color:#5b6b00">✓ juist</b>' : chosen ? ' <b style="color:#c92a2a">gekozen</b>' : "";
          const bg = correct ? "background:#f4f7d9" : chosen ? "background:#fbe6e6" : "";
          return `<li style="${bg}">${String.fromCharCode(65 + idx)}. ${esc(o)}${tag}</li>`;
        })
        .join("");
      const uitleg = d.uitleg ? `<p class="uitleg"><b>Uitleg:</b> ${esc(d.uitleg)}</p>` : "";
      return `<div class="q"><p class="qp"><span class="dom">${esc(d.domain)}</span> ${i + 1}. ${esc(d.prompt)} ${d.correct ? '<span class="ok">goed</span>' : '<span class="fout">fout</span>'}</p><ol>${opts}</ol>${uitleg}</div>`;
    })
    .join("");
  const html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Assessmentrapport ${esc(candidate.naam)}</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;color:#1a2b42;margin:32px;max-width:820px}
    h1{color:#003d6b;margin:0 0 4px} .sub{color:#667;margin:0 0 20px}
    .kpis{display:flex;gap:24px;margin:16px 0}
    .kpi{border:1px solid #dde;border-radius:10px;padding:12px 16px}
    .kpi .v{font-size:26px;font-weight:800;color:#003d6b} .kpi .l{font-size:11px;text-transform:uppercase;color:#778}
    table{border-collapse:collapse;width:100%;margin:8px 0 24px} td{border-bottom:1px solid #eee;padding:6px 8px} .num{text-align:right;font-variant-numeric:tabular-nums;font-weight:700}
    h2{color:#003d6b;font-size:16px;margin:20px 0 8px}
    .q{margin:0 0 14px;page-break-inside:avoid} .qp{font-weight:600;margin:0 0 4px} .dom{font-size:11px;color:#667;background:#eef;padding:1px 6px;border-radius:4px;margin-right:6px}
    ol{margin:4px 0 0 18px} li{padding:3px 6px;border-radius:4px;margin:2px 0;list-style:upper-alpha}
    .ok{color:#5b6b00;font-size:12px} .fout{color:#c92a2a;font-size:12px}
    .uitleg{font-size:12px;color:#556;margin:4px 0 0;padding:6px 8px;background:#f5f7fa;border-radius:6px}
    .foot{margin-top:28px;color:#99a;font-size:11px;border-top:1px solid #eee;padding-top:8px}
    @media print{body{margin:12mm}}
  </style></head><body>
    <h1>Assessmentrapport</h1>
    <p class="sub">${esc(candidate.naam)} — ${esc(roleName)} · ingeleverd ${esc(datum)}</p>
    <div class="kpis">
      <div class="kpi"><div class="v">${result.totaalScore}</div><div class="l">Totaalscore</div></div>
      <div class="kpi"><div class="v">${result.roleFit.score}</div><div class="l">Rol-fit</div></div>
      <div class="kpi"><div class="v">${esc(result.roleFit.state)}</div><div class="l">Oordeel</div></div>
      <div class="kpi"><div class="v">${goed}/${result.details.length}</div><div class="l">Goed</div></div>
    </div>
    <h2>Score per domein</h2>
    <table>${domeinRows}</table>
    <h2>Antwoorden per vraag</h2>
    ${vragen}
    <p class="foot">Campai Assessment · vertrouwelijk · gegenereerd ${esc(new Date().toLocaleString("nl-NL"))}. Rol-fit is een hulpmiddel, geen automatisch besluit.</p>
    <script>window.onload=function(){window.print();}</script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}

export function Reviewdashboard({ search }: { search: string }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<CandidateResult | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);

  // Load candidate list on mount
  useEffect(() => {
    listCandidates()
      .then((list) => {
        setCandidates(list);
        setLoading(false);
        // Auto-select first afgeronde candidate
        const first = list.find((c) => c.status === "afgerond");
        if (first) setSelectedId(first.id);
      })
      .catch((e) => {
        setError(e.message || "Fout bij ophalen kandidaten");
        setLoading(false);
      });
  }, []);

  // Load result when a candidate is selected and is afgerond
  useEffect(() => {
    const candidate = candidates.find((c) => c.id === selectedId);
    if (!candidate || candidate.status !== "afgerond") {
      setResult(null);
      return;
    }
    setResultLoading(true);
    setResultError(null);
    getCandidateResult(candidate.id)
      .then((r) => {
        setResult(r);
        setResultLoading(false);
      })
      .catch((e) => {
        setResultError(e.message || "Fout bij ophalen uitslag");
        setResultLoading(false);
      });
  }, [selectedId, candidates]);

  // Filter candidates by search
  const filteredCandidates = candidates.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.naam.toLowerCase().includes(q) || c.functie.toLowerCase().includes(q);
  });

  const afgerond = candidates.filter((c) => c.status === "afgerond");
  const selectedCandidate = candidates.find((c) => c.id === selectedId) ?? null;

  async function flagDetail(prompt: string, domain: string) {
    const note = window.prompt(
      "Wat klopt er niet aan deze vraag of het juiste antwoord? (optioneel)\nDe vraag wordt gemarkeerd voor controle in de Vragenbank.",
    );
    if (note === null) return; // geannuleerd
    try {
      await flagQuestion({ prompt, domain, note });
      notifications.show({ message: "Vraag gemarkeerd voor controle (zie Vragenbank).", color: "campaiNavy" });
    } catch {
      notifications.show({ message: "Markeren mislukt.", color: "red" });
    }
  }

  return (
    <>
      <ViewHead mode="recruitment" banner="kandidaatbeoordeling" title="Reviewdashboard">
        Eén conclusie per kandidaat — rol-fit, domein-uitslag en bewijs per vraag. Selecteer een
        afgeronde sollicitant om de uitslag te bekijken.
      </ViewHead>

      <Stack gap="xl">
        {/* KPI-strip */}
        <Grid>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card withBorder padding="md" radius="md">
              {loading ? (
                <Loader size="xs" />
              ) : (
                <Text fw={800} ff="heading" fz={30} c="campaiNavy.7">
                  {candidates.length}
                </Text>
              )}
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={600}>
                Sollicitanten
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card withBorder padding="md" radius="md">
              {loading ? (
                <Loader size="xs" />
              ) : (
                <Text fw={800} ff="heading" fz={30} c="campaiNavy.7">
                  {afgerond.length}
                </Text>
              )}
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={600}>
                Afgerond
              </Text>
            </Card>
          </Grid.Col>
          
        </Grid>

        {/* People grid */}
        <Grid>
          {/* Kandidaten list */}
          <Grid.Col span={12}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Group justify="space-between" mb="md">
                <Box>
                  <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                    Recruitment pipeline
                  </Text>
                  <Title order={3} fz="lg" c="campaiNavy.7">
                    Sollicitanten
                  </Title>
                </Box>
                {!loading && (
                  <Badge variant="light" color="campaiNavy" radius="sm">
                    {candidates.length} actief
                  </Badge>
                )}
              </Group>

              {loading && (
                <Center py="xl">
                  <Stack align="center" gap="xs">
                    <Loader size="sm" color="campaiNavy" />
                    <Text size="xs" c="dimmed">
                      Sollicitanten laden…
                    </Text>
                  </Stack>
                </Center>
              )}

              {error && (
                <Text size="sm" c="red">
                  {error}
                </Text>
              )}

              {!loading && !error && filteredCandidates.length === 0 && (
                <Center py="xl">
                  <Stack align="center" gap="xs">
                    <Text size="sm" c="dimmed" ta="center">
                      Geen sollicitanten gevonden.
                    </Text>
                  </Stack>
                </Center>
              )}

              {!loading && !error && filteredCandidates.length > 0 && (
                <Stack gap="xs">
                  {filteredCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      active={candidate.id === selectedId}
                      onSelect={() => {
                        if (candidate.status === "afgerond") {
                          setSelectedId(candidate.id);
                        }
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Card>
          </Grid.Col>
        </Grid>

        {/* Candidate result cockpit */}
        {selectedCandidate && selectedCandidate.status === "afgerond" && (
          <Card withBorder padding="lg" radius="md">
            <Group justify="space-between" mb="md">
              <Box>
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  Kandidaatuitslag
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  {selectedCandidate.naam}
                </Title>
                <Text size="xs" c="dimmed">
                  {roles.find((r) => r.id === selectedCandidate.functie)?.name ??
                    selectedCandidate.functie}
                </Text>
              </Box>
              <Group gap="sm">
                {result && (
                  <Button
                    size="xs"
                    radius="md"
                    variant="light"
                    color="campaiNavy"
                    leftSection={<IconDownload size={14} />}
                    onClick={() =>
                      exportReport(
                        selectedCandidate,
                        result,
                        roles.find((r) => r.id === selectedCandidate.functie)?.name ?? selectedCandidate.functie,
                      )
                    }
                  >
                    Exporteer rapport
                  </Button>
                )}
                <Badge variant="light" color="campaiLime" radius="sm">
                  Afgerond
                </Badge>
              </Group>
            </Group>

            {resultLoading && (
              <Center py="xl">
                <Stack align="center" gap="xs">
                  <Loader size="sm" color="campaiNavy" />
                  <Text size="xs" c="dimmed">
                    Uitslag laden…
                  </Text>
                </Stack>
              </Center>
            )}

            {resultError && (
              <Text size="sm" c="red">
                {resultError}
              </Text>
            )}

            {result && !resultLoading && (
              <Stack gap="xl">
                {/* Score + rol-fit */}
                <Grid align="center">
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack align="center" gap="sm">
                      <RingProgress
                        size={150}
                        thickness={12}
                        roundCaps
                        sections={[
                          { value: result.totaalScore, color: scoreColor(result.totaalScore) },
                        ]}
                        label={
                          <Stack gap={0} align="center">
                            <Text ta="center" fw={800} fz={28} ff="heading" c="campaiNavy.7">
                              {result.totaalScore}
                            </Text>
                            <Text size="10px" tt="uppercase" c="dimmed" lts={1}>
                              totaal
                            </Text>
                          </Stack>
                        }
                      />
                      <Badge
                        color={roleFitColor(result.roleFit.state)}
                        variant="light"
                        radius="sm"
                        size="lg"
                      >
                        Rol-fit: {result.roleFit.state}
                      </Badge>
                    </Stack>
                  </Grid.Col>

                  {/* Domain scores */}
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="sm">
                      <Text size="xs" tt="uppercase" c="dimmed" fw={700} lts={0.5}>
                        Domeinscores
                      </Text>
                      {Object.entries(result.domeinScores).map(([domain, score]) => (
                        <Box key={domain}>
                          <Group justify="space-between" mb={4}>
                            <Text size="sm" fw={600} c="gray.8">
                              {domain}
                            </Text>
                            <Text size="sm" fw={700} ff="monospace" c="campaiNavy.7">
                              {score}
                            </Text>
                          </Group>
                          <Progress
                            value={score}
                            size="sm"
                            radius="xl"
                            color={scoreColor(score)}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Grid.Col>
                </Grid>

                <Divider />

                {/* Per-question evidence: volledige vraag + alle opties, juist + gekozen gemarkeerd */}
                <Box>
                  <Group justify="space-between" align="center" mb="md">
                    <Text size="xs" tt="uppercase" c="dimmed" fw={700} lts={0.5}>
                      Antwoorden per vraag
                    </Text>
                    <Text size="xs" c="dimmed">
                      {result.details.filter((d) => d.correct).length}/{result.details.length} goed
                    </Text>
                  </Group>
                  {result.details.length === 0 ? (
                    <Text size="sm" c="dimmed">
                      Geen antwoorden beschikbaar.
                    </Text>
                  ) : (
                    <Stack gap="sm">
                      {result.details.map((detail, i) => (
                        <Card key={detail.questionId} withBorder radius="md" padding="md">
                          <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                            <Box style={{ flex: 1 }}>
                              <Badge variant="light" color="gray" radius="sm" size="xs" mb={4}>
                                {detail.domain}
                              </Badge>
                              <Text size="sm" fw={600} c="campaiNavy.8">
                                {i + 1}. {detail.prompt}
                              </Text>
                            </Box>
                            <Stack gap={6} align="flex-end">
                              <Badge
                                variant="light"
                                color={detail.correct ? "campaiLime" : "campaiRed"}
                                radius="sm"
                                size="sm"
                              >
                                {detail.correct ? "Goed" : "Fout"}
                              </Badge>
                              <Button
                                size="compact-xs"
                                variant="subtle"
                                color="campaiNavy"
                                leftSection={<IconFlag size={13} />}
                                onClick={() => flagDetail(detail.prompt, detail.domain)}
                              >
                                Markeer
                              </Button>
                            </Stack>
                          </Group>
                          <Stack gap={4}>
                            {detail.options.map((opt, idx) => {
                              const isChosen = idx === detail.chosenIndex;
                              const isCorrect = idx === detail.correctIndex;
                              const bg = isCorrect
                                ? "var(--mantine-color-campaiLime-0, #f4f7d9)"
                                : isChosen
                                  ? "var(--mantine-color-campaiRed-0, #fbe6e6)"
                                  : "transparent";
                              const border = isCorrect
                                ? "var(--mantine-color-campaiLime-5, #b6c200)"
                                : isChosen
                                  ? "var(--mantine-color-campaiRed-5, #e03131)"
                                  : "var(--mantine-color-gray-3, #dee2e6)";
                              return (
                                <Group
                                  key={idx}
                                  gap="xs"
                                  wrap="nowrap"
                                  align="center"
                                  style={{
                                    background: bg,
                                    borderLeft: `3px solid ${border}`,
                                    borderRadius: 6,
                                    padding: "6px 10px",
                                  }}
                                >
                                  <Text size="xs" fw={700} c="dimmed" w={16}>
                                    {String.fromCharCode(65 + idx)}
                                  </Text>
                                  <Text size="sm" style={{ flex: 1 }}>
                                    {opt}
                                  </Text>
                                  {isCorrect && (
                                    <Badge variant="filled" color="campaiLime" radius="sm" size="xs">
                                      Juist
                                    </Badge>
                                  )}
                                  {isChosen && (
                                    <Badge
                                      variant={isCorrect ? "light" : "filled"}
                                      color={isCorrect ? "campaiLime" : "campaiRed"}
                                      radius="sm"
                                      size="xs"
                                    >
                                      Gekozen
                                    </Badge>
                                  )}
                                </Group>
                              );
                            })}
                            {detail.chosenIndex < 0 && (
                              <Text size="xs" c="campaiRed.7" fw={600}>
                                Niet beantwoord
                              </Text>
                            )}
                            {detail.uitleg && (
                              <Box
                                mt={4}
                                p="xs"
                                style={{ background: "var(--mantine-color-gray-0)", borderRadius: 6 }}
                              >
                                <Text size="xs" c="dimmed">
                                  <strong>Uitleg:</strong> {detail.uitleg}
                                </Text>
                              </Box>
                            )}
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            )}
          </Card>
        )}

        {/* Empty state: no candidates or none afgerond */}
        {!loading && !error && afgerond.length === 0 && (
          <Card withBorder padding="xl" radius="md">
            <Center py="xl">
              <Stack align="center" gap="md">
                <Text fz={40}>📋</Text>
                <Title order={3} c="campaiNavy.7" ta="center">
                  Nog geen ingeleverde assessments
                </Title>
                <Text size="sm" c="dimmed" ta="center" maw={400}>
                  Zodra een sollicitant een assessment heeft afgerond, verschijnt de uitslag hier.
                  Nodig sollicitanten uit via het tabblad Sollicitanten.
                </Text>
              </Stack>
            </Center>
          </Card>
        )}

        {/* No afgerond selected but there are afgerond candidates */}
        {!loading && !error && afgerond.length > 0 && !selectedCandidate && (
          <Card withBorder padding="xl" radius="md">
            <Center py="lg">
              <Text size="sm" c="dimmed">
                Selecteer een afgeronde sollicitant om de uitslag te bekijken.
              </Text>
            </Center>
          </Card>
        )}

        {/* Governance strip */}
        <Card withBorder padding="md" radius="md">
          <Group justify="space-between" gap="xl" wrap="wrap">
            <Group gap="xl">
              <GovItem label="Rubric" value="v2.4.1-stable" />
              <GovItem label="Bron" value="campai-core-2024" />
            </Group>
            <Group gap="xl">
              <GovItem label="Reviewer" value="J. van den Bosch" />
              <Group gap={6}>
                <ThemeIcon variant="light" color="campaiNavy" radius="sm" size={20}>
                  <IconShieldCheck size={12} />
                </ThemeIcon>
                <Text size="xs" ff="monospace" c="campaiNavy.7" fw={600}>
                  human-review verplicht
                </Text>
              </Group>
            </Group>
          </Group>
        </Card>
      </Stack>
    </>
  );
}

function CandidateCard({
  candidate,
  active,
  onSelect,
}: {
  candidate: Candidate;
  active: boolean;
  onSelect: () => void;
}) {
  const isAfgerond = candidate.status === "afgerond";
  return (
    <UnstyledButton onClick={onSelect} style={{ cursor: isAfgerond ? "pointer" : "default" }}>
      <Card
        withBorder
        padding="sm"
        radius="md"
        style={{
          borderColor: active ? "var(--mantine-color-campaiNavy-6)" : undefined,
          background: active ? "var(--mantine-color-campaiNavy-0)" : undefined,
          opacity: isAfgerond ? 1 : 0.7,
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon
              variant={active ? "filled" : "light"}
              color="campaiNavy"
              radius="xl"
              size={36}
            >
              <Text fw={700} size="xs" c={active ? "white" : undefined}>
                {candidate.naam.charAt(0)}
              </Text>
            </ThemeIcon>
            <Box>
              <Text fw={active ? 700 : 600} size="sm">
                {candidate.naam}
              </Text>
              <Text size="xs" c="dimmed">
                {candidate.email ?? candidate.functie}
              </Text>
            </Box>
          </Group>
          <Badge
            color={STATUS_COLORS[candidate.status] ?? "gray"}
            variant="light"
            radius="sm"
            size="sm"
          >
            {STATUS_LABELS[candidate.status] ?? candidate.status}
          </Badge>
        </Group>
      </Card>
    </UnstyledButton>
  );
}

function GovItem({ label, value }: { label: string; value: string }) {
  return (
    <Group gap={6}>
      <Text size="xs" ff="monospace" c="dimmed" tt="uppercase" lts={0.5}>
        {label}:
      </Text>
      <Text size="xs" ff="monospace" c="campaiNavy.7" fw={600}>
        {value}
      </Text>
    </Group>
  );
}

