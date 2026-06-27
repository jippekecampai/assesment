import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Card,
  Center,
  Divider,
  Grid,
  Group,
  Loader,
  Progress,
  RingProgress,
  ScrollArea,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconShieldCheck } from "@tabler/icons-react";

import { roles } from "../lib/data";
import {
  type Candidate,
  type CandidateResult,
  getCandidateResult,
  listCandidates,
} from "../lib/api";
import { ViewHead } from "./_shared";
import { learners, trainingModules } from "../lib/data";
import { roleScore, scoreState } from "../lib/scoring";
import { loadCompleted } from "../lib/learning";

function scoreColor(score: number): string {
  if (score >= 75) return "campaiLime";
  if (score >= 60) return "campaiCyan";
  return "campaiRed";
}

function roleFitColor(state: string): string {
  const s = state.toLowerCase();
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

export function Reviewdashboard({
  search,
  onOpenLearner,
}: {
  search: string;
  onOpenLearner: (id: string) => void;
}) {
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
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card withBorder padding="md" radius="md">
              <Text fw={800} ff="heading" fz={30} c="campaiNavy.7">
                {learners.length}
              </Text>
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={600}>
                Medewerkers
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Card withBorder padding="md" radius="md">
              <Text fw={800} ff="heading" fz={30} c="campaiNavy.7">
                {trainingModules.length}
              </Text>
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={600}>
                Trainingsmodules
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* People grid */}
        <Grid>
          {/* Kandidaten list */}
          <Grid.Col span={{ base: 12, md: 6 }}>
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

          {/* Medewerkers list */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Group justify="space-between" mb="md">
                <Box>
                  <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                    Interne ontwikkeling
                  </Text>
                  <Title order={3} fz="lg" c="campaiNavy.7">
                    Medewerkers
                  </Title>
                </Box>
                <Badge variant="light" color="campaiCyan" radius="sm">
                  {learners.length} actief
                </Badge>
              </Group>
              <Stack gap="xs">
                {learners.map((learner) => {
                  const targetRole = roles.find((r) => r.name === learner.targetRole) ?? roles[0];
                  const lScore = roleScore(learner, targetRole);
                  const completed = (loadCompleted()[learner.id] || []).length;
                  return (
                    <UnstyledButton key={learner.id} onClick={() => onOpenLearner(learner.id)}>
                      <Card withBorder padding="sm" radius="md">
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="sm" wrap="nowrap">
                            <ThemeIcon variant="light" color="campaiCyan" radius="xl" size={36}>
                              <Text fw={700} size="xs">
                                {learner.id}
                              </Text>
                            </ThemeIcon>
                            <Box>
                              <Text fw={600} size="sm">
                                {learner.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {learner.role} → {learner.targetRole}
                              </Text>
                            </Box>
                          </Group>
                          <Stack gap={0} align="center">
                            <Badge color={scoreColor(lScore)} variant="light" radius="sm">
                              {lScore}
                            </Badge>
                            <Text size="10px" c="dimmed">
                              {completed}/{trainingModules.length}
                            </Text>
                          </Stack>
                        </Group>
                      </Card>
                    </UnstyledButton>
                  );
                })}
              </Stack>
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
              <Badge variant="light" color="campaiLime" radius="sm">
                Afgerond
              </Badge>
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

                {/* Per-question evidence table */}
                <Box>
                  <Text size="xs" tt="uppercase" c="dimmed" fw={700} lts={0.5} mb="md">
                    Bewijs per vraag
                  </Text>
                  <ScrollArea>
                    <Table verticalSpacing="sm" highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Vraag</Table.Th>
                          <Table.Th>Domein</Table.Th>
                          <Table.Th>Gekozen antwoord</Table.Th>
                          <Table.Th>Goed/fout</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {result.details.length === 0 ? (
                          <Table.Tr>
                            <Table.Td colSpan={4}>
                              <Text size="sm" c="dimmed">
                                Geen bewijs beschikbaar.
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ) : (
                          result.details.map((detail) => {
                            const chosenAnswer =
                              detail.chosenIndex >= 0 && detail.options[detail.chosenIndex]
                                ? detail.options[detail.chosenIndex]
                                : "—";
                            return (
                              <Table.Tr key={detail.questionId}>
                                <Table.Td>
                                  <Text size="sm" fw={600} style={{ maxWidth: 320 }} truncate>
                                    {detail.prompt}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs" c="dimmed">
                                    {detail.domain}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs" c="gray.7" style={{ maxWidth: 200 }} truncate>
                                    {chosenAnswer}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Badge
                                    variant="light"
                                    color={detail.correct ? "campaiLime" : "campaiRed"}
                                    radius="sm"
                                    size="sm"
                                  >
                                    {detail.correct ? "Goed" : "Fout"}
                                  </Badge>
                                </Table.Td>
                              </Table.Tr>
                            );
                          })
                        )}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
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
