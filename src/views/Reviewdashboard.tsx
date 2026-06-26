import { useMemo, useState } from "react";
import {
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Progress,
  RingProgress,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconChartRadar,
  IconClipboardCheck,
  IconLayoutGrid,
  IconRefresh,
  IconShieldCheck,
  IconTimeline,
} from "@tabler/icons-react";

import {
  candidates,
  competencies,
  domainDetails,
  domains,
  evidence,
  learners,
  roles,
  trainingModules,
  type Candidate,
} from "../lib/data";
import { fitEncoding, roleScore, scoreState } from "../lib/scoring";
import { loadCompleted } from "../lib/learning";
import { ViewHead } from "./_shared";

const shortLabels: Record<string, string> = {
  "Microsoft 365": "M365",
  "Kaseya Stack": "Kaseya",
  Fortigate: "FGT",
  Servers: "Srv",
  "SharePoint / Teams": "SPT",
  "SharePoint / Azure Migrations": "Mig",
  Inforcer: "Inf",
  "Basic IT & Troubleshooting": "Basic",
  "Werkhouding & Communicatie": "Werk",
  "AI / Copilot": "AI",
};

function shortDomain(domain: string): string {
  return domain
    .replace("SharePoint / Azure Migrations", "SP/Azure Mig.")
    .replace("Basic IT & Troubleshooting", "Basic IT")
    .replace("SharePoint / Teams", "SP/Teams")
    .replace("Kaseya Stack", "Kaseya stack")
    .replace("Werkhouding & Communicatie", "Werkhouding");
}

function scoreColor(score: number): string {
  if (score >= 75) return "campaiLime";
  if (score >= 60) return "campaiCyan";
  return "campaiRed";
}

// 5-staps sequentiële heatmap-encoding → achtergrond + tekstkleur.
function heatStyle(score: number): { background: string; color: string } {
  if (score >= 80) return { background: "var(--mantine-color-campaiLime-5)", color: "var(--mantine-color-campaiNavy-9)" };
  if (score >= 70) return { background: "var(--mantine-color-campaiLime-2)", color: "var(--mantine-color-campaiNavy-8)" };
  if (score >= 60) return { background: "var(--mantine-color-campaiCyan-1)", color: "var(--mantine-color-campaiNavy-8)" };
  if (score >= 50) return { background: "var(--mantine-color-campaiRed-1)", color: "var(--mantine-color-campaiNavy-8)" };
  return { background: "var(--mantine-color-campaiRed-4)", color: "white" };
}

export function Reviewdashboard({
  search,
  onOpenLearner,
}: {
  search: string;
  onOpenLearner: (id: string) => void;
}) {
  const [candidateId, setCandidateId] = useState(candidates[0].id);
  const [roleId, setRoleId] = useState(roles[1].id);
  const [domainFilter, setDomainFilter] = useState("Alle domeinen");

  const selectedCandidate = candidates.find((c) => c.id === candidateId)!;
  const selectedRole = roles.find((r) => r.id === roleId)!;

  const score = roleScore(selectedCandidate, selectedRole);
  const state = scoreState(score, selectedRole.threshold);
  const encoding = fitEncoding(state);

  const bestRole = useMemo(
    () =>
      [...roles]
        .map((role) => ({ role, score: roleScore(selectedCandidate, role) }))
        .sort((a, b) => b.score - a.score)[0],
    [selectedCandidate],
  );

  const sortedDomains = useMemo(
    () =>
      domains
        .map((domain) => ({ domain, score: selectedCandidate.scores[domain] }))
        .sort((a, b) => b.score - a.score),
    [selectedCandidate],
  );
  const topStrength = sortedDomains[0];
  const topGap = sortedDomains[sortedDomains.length - 1];

  const rankedRoles = useMemo(
    () =>
      roles
        .map((role) => ({ ...role, score: roleScore(selectedCandidate, role) }))
        .sort((a, b) => b.score - a.score),
    [selectedCandidate],
  );

  // Zoekbalk → effectief domeinfilter (zelfde gedrag als globalSearch).
  const effectiveDomain = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) return domains.find((d) => d.toLowerCase().includes(q)) ?? domainFilter;
    return domainFilter;
  }, [search, domainFilter]);

  const filteredEvidence = evidence.filter(
    (row) => effectiveDomain === "Alle domeinen" || row[1] === effectiveDomain,
  );

  return (
    <>
      <ViewHead mode="recruitment" banner="kandidaatbeoordeling" title="Reviewdashboard">
        Eén conclusie per kandidaat — rol-fit, risico en advies bovenaan. Domeindekking en bewijs
        staan klaar, detail op aanvraag.
      </ViewHead>

      <Stack gap="xl">
        {/* KPI-strip */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          {[
            ["Kandidaten", candidates.length],
            ["Medewerkers", learners.length],
            ["Domeinen", domains.length],
            ["Trainingsmodules", trainingModules.length],
          ].map(([label, value]) => (
            <Card key={label} withBorder padding="md" radius="md">
              <Text fw={800} ff="heading" fz={30} c="campaiNavy.7">
                {value}
              </Text>
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={600}>
                {label}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        {/* People grid */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Group justify="space-between" mb="md">
                <Box>
                  <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                    Recruitment pipeline
                  </Text>
                  <Title order={3} fz="lg" c="campaiNavy.7">
                    Kandidaten
                  </Title>
                </Box>
                <Badge variant="light" color="campaiNavy" radius="sm">
                  {candidates.length} actief
                </Badge>
              </Group>
              <Stack gap="xs">
                {candidates.map((candidate) => (
                  <PersonCard
                    key={candidate.id}
                    candidate={candidate}
                    active={candidate.id === candidateId}
                    onSelect={() => setCandidateId(candidate.id)}
                  />
                ))}
              </Stack>
            </Card>
          </Grid.Col>
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

        {/* Domeindekking heatmap */}
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Box>
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Alle personen × domeinen — dekking
              </Text>
              <Title order={3} fz="lg" c="campaiNavy.7">
                Domeindekking
              </Title>
            </Box>
            <Group gap={6} align="center">
              <Text size="xs" c="dimmed">
                risico
              </Text>
              {[40, 55, 65, 75, 85].map((s) => (
                <Box key={s} w={16} h={10} style={{ borderRadius: 2, background: heatStyle(s).background }} />
              ))}
              <Text size="xs" c="dimmed">
                sterk
              </Text>
            </Group>
          </Group>
          <Heatmap />
        </Card>

        {/* Cockpit */}
        <Card withBorder padding="lg" radius="md">
          <Stack gap="xs" mb="md">
            <Breadcrumbs separator="/" styles={{ separator: { color: "var(--mantine-color-gray-5)" } }}>
              <Anchor size="xs" c="dimmed">
                Kandidaten
              </Anchor>
              <Anchor size="xs" c="dimmed">
                {bestRole.role.name}
              </Anchor>
              <Text size="xs" c="campaiNavy.6" fw={600}>
                {selectedCandidate.name}
              </Text>
            </Breadcrumbs>
          </Stack>

          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Group gap="md" align="flex-start" wrap="nowrap">
                <ThemeIcon variant="light" color="campaiNavy" radius="md" size={56}>
                  <Text fw={800} ff="heading">
                    {selectedCandidate.id}
                  </Text>
                </ThemeIcon>
                <Stack gap={4}>
                  <Title order={1} fz={28} c="campaiNavy.7">
                    {selectedCandidate.name}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {selectedCandidate.meta}
                  </Text>
                  <Text size="sm" lh={1.6} c="gray.8" mt="xs">
                    Beste rol-fit: <strong>{bestRole.role.name}</strong> ·{" "}
                    <Text span ff="monospace" c="campaiNavy.6">
                      {bestRole.score}
                    </Text>
                    /100. Geselecteerde rol {selectedRole.name}:{" "}
                    <Text span ff="monospace" c="campaiNavy.6">
                      {score}
                    </Text>
                    /100 — advies <strong>{state.toLowerCase()}</strong> (drempel{" "}
                    {selectedRole.threshold}).
                  </Text>
                  <Group gap="xs" mt="xs">
                    <Badge color="campaiLime" variant="light" radius="sm">
                      Sterkste: {shortDomain(topStrength.domain)} {topStrength.score}
                    </Badge>
                    <Badge color="campaiRed" variant="light" radius="sm">
                      Aandacht: {shortDomain(topGap.domain)} {topGap.score}
                    </Badge>
                  </Group>
                </Stack>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack align="center" gap="sm">
                <RingProgress
                  size={150}
                  thickness={12}
                  roundCaps
                  sections={[{ value: score, color: encoding.color }]}
                  label={
                    <Stack gap={0} align="center">
                      <Text ta="center" fw={800} fz={28} ff="heading" c="campaiNavy.7">
                        {score}
                      </Text>
                      <Text size="10px" tt="uppercase" c="dimmed" lts={1}>
                        fit
                      </Text>
                    </Stack>
                  }
                />
                <Badge color={encoding.color} variant="light" radius="sm" size="lg">
                  {encoding.risk}
                </Badge>
              </Stack>
            </Grid.Col>
          </Grid>

          <Divider my="lg" />

          {/* Cockpit controls */}
          <Group gap="md" wrap="wrap">
            <Select
              label="Kandidaat beoordelen"
              data={candidates.map((c) => ({ value: c.id, label: c.name }))}
              value={candidateId}
              onChange={(v) => v && setCandidateId(v)}
              radius="md"
              size="sm"
              w={220}
              allowDeselect={false}
            />
            <Select
              label="Doelrol"
              data={roles.map((r) => ({ value: r.id, label: r.name }))}
              value={roleId}
              onChange={(v) => v && setRoleId(v)}
              radius="md"
              size="sm"
              w={220}
              allowDeselect={false}
            />
            <Select
              label="Domeinfilter"
              data={["Alle domeinen", ...domains]}
              value={domainFilter}
              onChange={(v) => v && setDomainFilter(v)}
              radius="md"
              size="sm"
              w={240}
              allowDeselect={false}
            />
          </Group>

          <Text size="xs" c="dimmed" mt="md" maw={720}>
            Best-fit is een advies voor een mens — geen automatisch oordeel. Valideer praktische
            gaten en werkhouding in een gesprek met een senior wanneer de kandidaat rond de drempel
            zit.
          </Text>
        </Card>

        {/* Ondersteuning: rol-fit ranking + inspector */}
        <Grid>
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Group justify="space-between" mb="md">
                <Box>
                  <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                    Beslisondersteuning
                  </Text>
                  <Title order={3} fz="lg" c="campaiNavy.7">
                    Rol-fit ranking
                  </Title>
                </Box>
                <Badge variant="light" color={encoding.color} radius="sm">
                  {state}
                </Badge>
              </Group>
              <Stack gap="md">
                {rankedRoles.map((role) => (
                  <Box key={role.id}>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={600} c="gray.8">
                        {role.name}
                      </Text>
                      <Group gap="sm">
                        <Text size="xs" c="dimmed">
                          {scoreState(role.score, role.threshold)}
                        </Text>
                        <Text size="sm" fw={700} ff="monospace" c="campaiNavy.7">
                          {role.score}
                        </Text>
                      </Group>
                    </Group>
                    <Progress
                      value={role.score}
                      size="sm"
                      radius="xl"
                      color={
                        role.score >= role.threshold
                          ? "campaiCyan"
                          : role.score >= role.threshold - 8
                            ? "yellow"
                            : "campaiRed"
                      }
                    />
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Box mb="md">
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  Profielsignaal
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  Sterktes &amp; aandacht
                </Title>
              </Box>
              <Text size="xs" tt="uppercase" c="dimmed" fw={700} mb={6}>
                Sterke punten
              </Text>
              <Stack gap={6} mb="md">
                {sortedDomains.slice(0, 3).map((item) => (
                  <Group key={item.domain} justify="space-between">
                    <Text size="sm">{shortDomain(item.domain)}</Text>
                    <Text size="sm" ff="monospace" fw={700} c="campaiLime.7">
                      {item.score}
                    </Text>
                  </Group>
                ))}
              </Stack>
              <Text size="xs" tt="uppercase" c="dimmed" fw={700} mb={6}>
                Aandachtspunten
              </Text>
              <Stack gap={6}>
                {sortedDomains
                  .slice(-3)
                  .reverse()
                  .map((item) => (
                    <Group key={item.domain} justify="space-between">
                      <Text size="sm">{shortDomain(item.domain)}</Text>
                      <Text size="sm" ff="monospace" fw={700} c="campaiRed.6">
                        {item.score}
                      </Text>
                    </Group>
                  ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Detail-tabs */}
        <Card withBorder padding={0} radius="md">
          <Group justify="space-between" px="lg" pt="lg">
            <Box>
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Detail op aanvraag — engineer-laag
              </Text>
              <Title order={3} fz="lg" c="campaiNavy.7">
                Bewijs &amp; competentieprofiel
              </Title>
            </Box>
            <Button
              variant="subtle"
              color="campaiNavy"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={() => {
                setRoleId(roles[1].id);
                setDomainFilter("Alle domeinen");
              }}
            >
              Reset weergave
            </Button>
          </Group>

          <Tabs defaultValue="competentie" color="campaiNavy" mt="md">
            <Tabs.List px="lg">
              <Tabs.Tab value="competentie" leftSection={<IconChartRadar size={14} />}>
                Competentieprofiel
              </Tabs.Tab>
              <Tabs.Tab value="scenario" leftSection={<IconTimeline size={14} />}>
                Scenario's
              </Tabs.Tab>
              <Tabs.Tab value="bewijs" leftSection={<IconClipboardCheck size={14} />}>
                Vraagbewijs
              </Tabs.Tab>
              <Tabs.Tab value="topic" leftSection={<IconLayoutGrid size={14} />}>
                Topicmatrix
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="competentie" p="xl">
              <Grid align="center">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <RadarChart candidate={selectedCandidate} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <BenchmarkTable candidate={selectedCandidate} roleThreshold={selectedRole.threshold} roleWeights={selectedRole.weights} />
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="scenario" p="xl">
              <Stack gap="sm">
                {selectedCandidate.scenarioScores.map((s, index) => (
                  <Group key={index} justify="space-between" wrap="nowrap" gap="md">
                    <Text size="sm" fw={600} w={200} truncate>
                      {selectedCandidate.scenarioLabels[index]}
                    </Text>
                    <Progress
                      flex={1}
                      value={s}
                      size="sm"
                      radius="xl"
                      color={
                        s >= selectedRole.threshold
                          ? "campaiCyan"
                          : s >= selectedRole.threshold - 8
                            ? "yellow"
                            : "campaiRed"
                      }
                    />
                    <Text size="sm" ff="monospace" fw={700} w={32} ta="right">
                      {s}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="bewijs" p="xl">
              <Group justify="space-between" mb="md">
                <Text size="xs" tt="uppercase" c="dimmed" fw={700} lts={0.5}>
                  Audit trail · vraagbewijs
                  {effectiveDomain !== "Alle domeinen" && ` · ${shortDomain(effectiveDomain)}`}
                </Text>
                <Button variant="default" size="xs" onClick={() => setDomainFilter("Alle domeinen")}>
                  Alle domeinen
                </Button>
              </Group>
              <ScrollArea>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Vraag</Table.Th>
                      <Table.Th>Domein</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Score</Table.Th>
                      <Table.Th>Bewijs</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredEvidence.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
                          <Text size="sm" c="dimmed">
                            Geen bewijs gevonden voor dit filter.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredEvidence.map(([question, domain, type, evScore, response]) => (
                        <Table.Tr key={question}>
                          <Table.Td>
                            <Text size="sm" fw={600}>
                              {question}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed">
                              {shortDomain(domain)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light" color="gray" radius="sm" size="sm">
                              {type}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={6} wrap="nowrap">
                              <Progress
                                w={60}
                                value={evScore}
                                size="sm"
                                radius="xl"
                                color={evScore >= selectedRole.threshold ? "campaiCyan" : "yellow"}
                              />
                              <Text size="xs" ff="monospace">
                                {evScore}%
                              </Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="gray.7">
                              {response}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Tabs.Panel>

            <Tabs.Panel value="topic" p="xl">
              <TopicMatrix candidate={selectedCandidate} />
            </Tabs.Panel>
          </Tabs>
        </Card>

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

function PersonCard({
  candidate,
  active,
  onSelect,
}: {
  candidate: Candidate;
  active: boolean;
  onSelect: () => void;
}) {
  const bestRole = [...roles].sort((a, b) => roleScore(candidate, b) - roleScore(candidate, a))[0];
  const score = roleScore(candidate, bestRole);
  return (
    <UnstyledButton onClick={onSelect}>
      <Card
        withBorder
        padding="sm"
        radius="md"
        style={{
          borderColor: active ? "var(--mantine-color-campaiNavy-6)" : undefined,
          background: active ? "var(--mantine-color-campaiNavy-0)" : undefined,
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
              <Text fw={700} size="xs">
                {candidate.id}
              </Text>
            </ThemeIcon>
            <Box>
              <Text fw={active ? 700 : 600} size="sm">
                {candidate.name}
              </Text>
              <Text size="xs" c="dimmed">
                {bestRole.name} · {scoreState(score, bestRole.threshold)}
              </Text>
            </Box>
          </Group>
          <Stack gap={0} align="center">
            <Badge color={scoreColor(score)} variant="light" radius="sm">
              {score}
            </Badge>
            <Text size="10px" c="dimmed">
              fit
            </Text>
          </Stack>
        </Group>
      </Card>
    </UnstyledButton>
  );
}

function Heatmap() {
  const candidatesList = candidates;
  const learnersList = learners;

  const headerCells = domains.map((domain) => (
    <Table.Th key={domain} title={domain} style={{ textAlign: "center", fontSize: 11 }}>
      {shortLabels[domain] ?? domain}
    </Table.Th>
  ));

  const row = (person: { id: string; name: string; scores: Record<string, number> }) => (
    <Table.Tr key={person.id}>
      <Table.Td style={{ position: "sticky", left: 0, background: "white", minWidth: 150 }}>
        <Text size="sm" fw={600}>
          {person.name}
        </Text>
      </Table.Td>
      {domains.map((domain) => {
        const s = person.scores[domain] ?? 0;
        const style = heatStyle(s);
        return (
          <Table.Td
            key={domain}
            title={`${person.name} · ${domain}: ${s}`}
            style={{
              textAlign: "center",
              fontFamily: "var(--mantine-font-family-monospace)",
              fontSize: 12,
              fontWeight: 600,
              background: style.background,
              color: style.color,
            }}
          >
            {s}
          </Table.Td>
        );
      })}
    </Table.Tr>
  );

  return (
    <ScrollArea>
      <Table withColumnBorders verticalSpacing={6} style={{ minWidth: 760 }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ position: "sticky", left: 0, background: "white" }}>Persoon</Table.Th>
            {headerCells}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td colSpan={domains.length + 1}>
              <Text size="10px" tt="uppercase" fw={700} c="dimmed" lts={1}>
                Kandidaten
              </Text>
            </Table.Td>
          </Table.Tr>
          {candidatesList.map(row)}
          <Table.Tr>
            <Table.Td colSpan={domains.length + 1}>
              <Text size="10px" tt="uppercase" fw={700} c="dimmed" lts={1}>
                Medewerkers
              </Text>
            </Table.Td>
          </Table.Tr>
          {learnersList.map(row)}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

function RadarChart({ candidate }: { candidate: Candidate }) {
  const cx = 220;
  const cy = 180;
  const radius = 124;
  const points = domains.map((domain, index) => {
    const angle = (Math.PI * 2 * index) / domains.length - Math.PI / 2;
    const s = candidate.scores[domain];
    return {
      domain,
      x: cx + Math.cos(angle) * radius * (s / 100),
      y: cy + Math.sin(angle) * radius * (s / 100),
      lx: cx + Math.cos(angle) * (radius + 34),
      ly: cy + Math.sin(angle) * (radius + 34),
      gx: cx + Math.cos(angle) * radius,
      gy: cy + Math.sin(angle) * radius,
      score: s,
    };
  });
  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Box maw={440} mx="auto">
      <svg viewBox="0 0 440 360" width="100%" role="img" aria-label="Radar voor competenties">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={domains
              .map((_, index) => {
                const angle = (Math.PI * 2 * index) / domains.length - Math.PI / 2;
                return `${cx + Math.cos(angle) * radius * scale},${cy + Math.sin(angle) * radius * scale}`;
              })
              .join(" ")}
            fill="none"
            stroke="#d9e1ea"
            strokeWidth={1}
          />
        ))}
        {points.map((p) => (
          <line key={`a-${p.domain}`} x1={cx} y1={cy} x2={p.gx} y2={p.gy} stroke="#e4e9ef" />
        ))}
        <polygon
          points={polygon}
          fill="var(--mantine-color-campaiCyan-1)"
          stroke="var(--mantine-color-campaiCyan-5)"
          strokeWidth={3}
        />
        {points.map((p) => (
          <circle key={`c-${p.domain}`} cx={p.x} cy={p.y} r={4} fill="var(--mantine-color-campaiCyan-5)" />
        ))}
        {points.map((p) => (
          <text
            key={`t-${p.domain}`}
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            fontSize={9}
            fill="var(--mantine-color-gray-6)"
          >
            {shortDomain(p.domain)} {p.score}
          </text>
        ))}
      </svg>
    </Box>
  );
}

function BenchmarkTable({
  candidate,
  roleThreshold,
  roleWeights,
}: {
  candidate: Candidate;
  roleThreshold: number;
  roleWeights: Record<string, number>;
}) {
  return (
    <Stack gap="xs">
      <Title order={4} fz="md" c="campaiNavy.7">
        Domein-uitsplitsing
      </Title>
      {domains.map((domain) => {
        const s = candidate.scores[domain];
        const weight = roleWeights[domain] || 0;
        const norm = Math.round(roleThreshold - 6 + weight * 60);
        const status = s >= norm + 8 ? "Sterk" : s >= norm ? "Voldoende" : "Aandacht";
        return (
          <Group key={domain} justify="space-between" wrap="nowrap" gap="sm">
            <Box style={{ minWidth: 110 }}>
              <Text size="sm" fw={600}>
                {shortDomain(domain)}
              </Text>
            </Box>
            <Group gap="sm" wrap="nowrap">
              <Text size="xs" ff="monospace" c="dimmed">
                {s} / norm {norm}
              </Text>
              <Badge
                variant="light"
                radius="sm"
                size="sm"
                color={s >= norm ? "campaiLime" : "campaiRed"}
              >
                {status}
              </Badge>
            </Group>
          </Group>
        );
      })}
    </Stack>
  );
}

function TopicMatrix({ candidate }: { candidate: Candidate }) {
  return (
    <ScrollArea>
      <Box style={{ minWidth: 760 }}>
        <Table withColumnBorders verticalSpacing={6}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Vaardigheid</Table.Th>
              {domains.map((domain) => (
                <Table.Th key={domain} style={{ textAlign: "center", fontSize: 10 }}>
                  {shortLabels[domain] ?? shortDomain(domain)}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {competencies.map((competency, rowIndex) => (
              <Table.Tr key={competency}>
                <Table.Td>
                  <Text size="sm" fw={600}>
                    {competency}
                  </Text>
                </Table.Td>
                {domains.map((domain, domainIndex) => {
                  const base = candidate.scores[domain];
                  const modifier = ((rowIndex + domainIndex) % 4) * 3 - 4;
                  const value = Math.max(35, Math.min(96, base + modifier));
                  const style = heatStyle(value);
                  return (
                    <Table.Td
                      key={domain}
                      style={{
                        textAlign: "center",
                        fontFamily: "var(--mantine-font-family-monospace)",
                        fontSize: 12,
                        background: style.background,
                        color: style.color,
                      }}
                    >
                      {value}
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </ScrollArea>
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
