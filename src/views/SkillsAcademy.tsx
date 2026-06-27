import { useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Progress,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCircleCheck,
  IconExternalLink,
  IconFlag,
  IconPlus,
  IconTargetArrow,
} from "@tabler/icons-react";

import { getMe, getLearningProgress, saveLearningProgress, type MeProfile } from "../lib/api";
import { domains, learners, roles, teamChallenge, trainingModules, type TrainingModule } from "../lib/data";
import { roleScore } from "../lib/scoring";
import {
  formatAuditTime,
  learnerLevel,
  learningRoleFor,
  loadCompleted,
  loadUpdates,
  moduleSourceLink,
  moduleType,
  recommendedDomains,
  recommendedModules,
  recordAudit,
  saveCompleted,
  saveUpdates,
  statusColor,
  statusLabel,
  type ModuleUpdate,
} from "../lib/learning";
import { ViewHead } from "./_shared";

function shortDomain(domain: string): string {
  return domain
    .replace("SharePoint / Azure Migrations", "SP/Azure Mig.")
    .replace("Basic IT & Troubleshooting", "Basic IT")
    .replace("SharePoint / Teams", "SP/Teams")
    .replace("Kaseya Stack", "Kaseya stack")
    .replace("Werkhouding & Communicatie", "Werkhouding");
}

export function SkillsAcademy({
  learnerId,
  setLearnerId,
}: {
  learnerId: string;
  setLearnerId: (id: string) => void;
}) {
  // SSO state
  const [me, setMe] = useState<MeProfile | null>(null);
  const [serverCompleted, setServerCompleted] = useState<string[] | null>(null);

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe({ authenticated: false }));
  }, []);

  useEffect(() => {
    if (me?.authenticated === true) {
      getLearningProgress()
        .then((p) => setServerCompleted(p.completedModules))
        .catch(() => setServerCompleted([]));
    }
  }, [me]);

  const isSso = me?.authenticated === true;

  // Effective learner: SSO-synthetic or mock
  const mockLearner = learners.find((l) => l.id === learnerId) ?? learners[0];
  const ssoLearner = isSso
    ? {
        id: (me as Extract<MeProfile, { authenticated: true }>).entraOid || "sso",
        name:
          (me as Extract<MeProfile, { authenticated: true }>).name ||
          (me as Extract<MeProfile, { authenticated: true }>).email ||
          "Ingelogde medewerker",
        role: (me as Extract<MeProfile, { authenticated: true }>).jobTitle || "—",
        targetRole: "",
        meta: (me as Extract<MeProfile, { authenticated: true }>).department || "Interne medewerker",
        scores: {} as Record<string, number>,
        type: "learner" as const,
      }
    : null;
  const learner = isSso ? ssoLearner! : mockLearner;

  const [learningRoleId, setLearningRoleId] = useState(learningRoleFor(mockLearner).id);
  const learningRole = roles.find((r) => r.id === learningRoleId) ?? roles[1];

  // Leerstate (localStorage for demo, server for SSO). Bump om re-render te forceren na opslaan.
  const [tick, setTick] = useState(0);
  const completedIds = useMemo(
    () => (isSso ? serverCompleted ?? [] : loadCompleted()[learner.id] || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSso, serverCompleted, learner.id, tick],
  );
  const updates = useMemo<Record<string, ModuleUpdate>>(
    () => loadUpdates()[learner.id] || {},
    [learner.id, tick],
  );

  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  const isCompleted = (id: string) => completedIds.includes(id);
  const moduleStatus = (id: string) =>
    isCompleted(id) ? "completed" : updates[id]?.status || "todo";
  const moduleProgress = (id: string) => {
    const s = moduleStatus(id);
    return s === "completed" ? 100 : s === "progress" ? 50 : 0;
  };

  function persist(nextCompleted: string[], nextUpdates: Record<string, ModuleUpdate>) {
    if (!isSso) {
      const allCompleted = loadCompleted();
      allCompleted[learner.id] = nextCompleted;
      saveCompleted(allCompleted);
    }
    const allUpdates = loadUpdates();
    allUpdates[learner.id] = nextUpdates;
    saveUpdates(allUpdates);
    setTick((t) => t + 1);
  }

  function saveModuleUpdate(moduleId: string, status: string, comment: string) {
    const nextUpdates = {
      ...updates,
      [moduleId]: { ...updates[moduleId], status, comment, updatedAt: new Date().toISOString() },
    };
    const set = new Set(completedIds);
    if (status === "completed") set.add(moduleId);
    else set.delete(moduleId);
    const nextCompleted = Array.from(set);
    const module = trainingModules.find((m) => m.id === moduleId);
    recordAudit(
      "Learning update opgeslagen",
      `${learner.name} / ${module?.title || moduleId} / ${statusLabel(status)}`,
    );
    if (isSso) {
      setServerCompleted(nextCompleted);
      saveLearningProgress(nextCompleted).catch(() => {
        notifications.show({ message: "Opslaan mislukt", color: "red" });
      });
    }
    persist(nextCompleted, nextUpdates);
    notifications.show({ message: "Learning update opgeslagen.", color: "campaiNavy" });
  }

  const xp = useMemo(
    () =>
      trainingModules
        .filter((m) => isCompleted(m.id))
        .reduce((total, m) => total + m.xp, 0),
    [completedIds],
  );
  const level = learnerLevel(xp);
  // Zonder gekoppelde assessmentscores (SSO-profiel zonder meting) is rolfit niet te
  // berekenen → toon "—" i.p.v. NaN.
  const hasScores = Object.keys(learner.scores).length > 0;
  const roleFitValue = hasScores ? roleScore(learner, learningRole) : null;
  const roleFit = roleFitValue ?? "—";
  const domainsWithGap = useMemo(
    () => recommendedDomains(learner, learningRole, domains),
    [learner, learningRole],
  );
  const criticalGaps = domainsWithGap.filter((item) => item.gap >= 10).length;
  const completedBadges = trainingModules.filter((m) => isCompleted(m.id)).length;
  const modules = useMemo(
    () => recommendedModules(learner, learningRole, domains, completedIds),
    [learner, learningRole, completedIds],
  );

  const todoCount = trainingModules.length - completedIds.length;
  const quickCards: Array<[string, string, string]> = [
    ["Inbox", `${criticalGaps} skill alerts`, "Insights waiting for review"],
    ["Next review", criticalGaps > 2 ? "Plan senior review" : "Geen review gepland", "Coachmoment voor doelrol"],
    ["Next 1:1", "30 min growth check", "Bespreek blockers en bewijs"],
    ["Next steps", `${todoCount} modules`, "Assigned to you"],
  ];

  const tasks = (() => {
    const open = modules.filter((m) => !m.completed).slice(0, 4);
    const gap = domainsWithGap.find((item) => item.gap > 0);
    return [
      gap ? `Bespreek ${gap.domain} gap in de volgende 1:1` : "Houd het huidige rolpad actueel",
      "Koppel minimaal een module aan een leerdoel",
      ...open.map((m) => `Rond af: ${m.title}`),
    ].slice(0, 5);
  })();

  const activeModule = trainingModules.find((m) => m.id === openModuleId) ?? null;

  return (
    <>
      <ViewHead
        mode="academy"
        banner="ontwikkeldata (gescheiden van recruitment)"
        title="Skills Academy"
      >
        <strong>{learner.name}</strong> → {learningRole.name}: rolfit{" "}
        <Text span ff="monospace">
          {roleFit}
        </Text>
        {hasScores ? "/100" : ""}, {criticalGaps} kritieke {criticalGaps === 1 ? "gap" : "gaten"}, level{" "}
        <Text span ff="monospace">
          {level}
        </Text>
        .
      </ViewHead>

      <Stack gap="xl">
        {/* Hero + acties */}
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
            <Box>
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Doel van deze view
              </Text>
              <Title order={2} fz="xl" c="campaiNavy.7">
                Ontwikkeling richting doelrol
              </Title>
              <Text size="sm" c="dimmed" maw={620} mt={4}>
                Zelfde MSP-domeinen en rolwegingen als recruitment, maar gericht op leerpaden,
                praktijkbewijs, XP en coaching — nooit als automatische HR-beoordeling.
              </Text>
            </Box>
            <Group gap="md" wrap="wrap" align="flex-end">
              {!isSso && (
                <Select
                  label="Medewerker"
                  data={learners.map((l) => ({ value: l.id, label: l.name }))}
                  value={learnerId}
                  onChange={(v) => {
                    if (!v) return;
                    setLearnerId(v);
                    const next = learners.find((l) => l.id === v);
                    if (next) setLearningRoleId(learningRoleFor(next).id);
                  }}
                  radius="md"
                  size="sm"
                  w={200}
                  allowDeselect={false}
                />
              )}
              <Select
                label="Groei richting"
                data={roles.map((r) => ({ value: r.id, label: r.name }))}
                value={learningRoleId}
                onChange={(v) => v && setLearningRoleId(v)}
                radius="md"
                size="sm"
                w={220}
                allowDeselect={false}
              />
            </Group>
          </Group>
        </Card>

        {/* Profiel + quick cards / career plan */}
        <Grid>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Group gap="md" mb="lg">
                <ThemeIcon variant="light" color="campaiCyan" radius="md" size={48}>
                  <Text fw={800} ff="heading">
                    {learner.id}
                  </Text>
                </ThemeIcon>
                <Box>
                  <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                    Welkom
                  </Text>
                  <Title order={2} fz="xl" c="campaiNavy.7">
                    {learner.name}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {learner.meta}
                  </Text>
                </Box>
              </Group>
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                {quickCards.map(([title, value, copy]) => (
                  <Card key={title} withBorder padding="sm" radius="md" bg="gray.0">
                    <Text size="xs" fw={700} c="campaiNavy.7">
                      {title}
                    </Text>
                    <Text size="sm" fw={700} c="campaiCyan.7" my={2}>
                      {value}
                    </Text>
                    <Text size="10px" c="dimmed">
                      {copy}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Group justify="space-between" mb="sm">
                <Box>
                  <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                    Career plan
                  </Text>
                  <Title order={3} fz="md" c="campaiNavy.7">
                    {learner.role} → {learningRole.name}
                  </Title>
                </Box>
                <Badge color="campaiNavy" variant="light" radius="sm">
                  Level {level}
                </Badge>
              </Group>
              <Group justify="space-between" mb={4}>
                <Text size="xs" c="dimmed">
                  Performance / XP
                </Text>
                <Text size="sm" fw={700} ff="monospace" c="campaiNavy.7">
                  {xp} XP
                </Text>
              </Group>
              <Progress value={Math.min(100, (xp % 250) / 2.5)} size="md" radius="xl" color="campaiLime" mb="md" />
              <SimpleGrid cols={2} spacing="xs">
                {[
                  ["Rolfit", hasScores ? `${roleFit}/100` : "—"],
                  ["Modules klaar", `${completedIds.length}/${trainingModules.length}`],
                  ["Badges", `${completedBadges}`],
                  ["Achterstanden", `${criticalGaps}`],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Text size="10px" tt="uppercase" c="dimmed" fw={700}>
                      {label}
                    </Text>
                    <Text size="sm" fw={700} c="campaiNavy.7">
                      {value}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Skill gap + tasks */}
        <Grid>
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Box mb="md">
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  Doelrol
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  Skill gap naar doelrol
                </Title>
              </Box>
              {isSso && Object.keys(learner.scores).length === 0 ? (
                <Text size="sm" c="dimmed">
                  Nog geen assessmentscores gekoppeld aan dit profiel.
                </Text>
              ) : (
              <Stack gap="md">
                {domainsWithGap.slice(0, 7).map((item) => {
                  const status = item.gap >= 12 ? "Achterstand" : item.gap > 0 ? "Oefenen" : "Op niveau";
                  const color = item.gap >= 12 ? "campaiRed" : item.gap > 0 ? "yellow" : "campaiCyan";
                  return (
                    <Box key={item.domain}>
                      <Group justify="space-between" mb={4}>
                        <Text size="sm" fw={600}>
                          {shortDomain(item.domain)}
                        </Text>
                        <Group gap="sm">
                          <Text size="xs" c="dimmed">
                            {item.current}/100 naar norm {item.target}
                          </Text>
                          <Badge size="sm" radius="sm" variant="light" color={color}>
                            {status}
                          </Badge>
                        </Group>
                      </Group>
                      <Progress value={Math.min(100, item.current)} size="sm" radius="xl" color={color} />
                    </Box>
                  );
                })}
              </Stack>
              )}
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Box mb="md">
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  Next steps
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  Taken en coaching
                </Title>
              </Box>
              <Stack gap="sm">
                {tasks.map((task, index) => (
                  <Group key={index} gap="sm" wrap="nowrap" align="flex-start">
                    <ThemeIcon variant="light" color="campaiNavy" radius="xl" size={24}>
                      <Text size="xs" fw={700}>
                        {index + 1}
                      </Text>
                    </ThemeIcon>
                    <Text size="sm">{task}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Badges */}
        <Card withBorder padding="lg" radius="md">
          <Box mb="md">
            <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
              Goals
            </Text>
            <Title order={3} fz="lg" c="campaiNavy.7">
              Badges en leerdoelen
            </Title>
          </Box>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
            {trainingModules.map((module) => {
              const earned = isCompleted(module.id);
              return (
                <Card
                  key={module.id}
                  withBorder
                  padding="sm"
                  radius="md"
                  style={{
                    borderColor: earned ? "var(--mantine-color-campaiLime-5)" : undefined,
                    background: earned ? "var(--mantine-color-campaiLime-0)" : undefined,
                  }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon
                      variant={earned ? "filled" : "light"}
                      color={earned ? "campaiLime" : "gray"}
                      radius="xl"
                      size={32}
                    >
                      {earned ? <IconCircleCheck size={18} /> : <IconPlus size={16} />}
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={700} c="campaiNavy.7">
                        {module.badge}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {shortDomain(module.domain)} / {module.level}
                      </Text>
                    </Box>
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>
        </Card>

        {/* Learning plan board */}
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Box>
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Onboard &amp; Learn
              </Text>
              <Title order={3} fz="lg" c="campaiNavy.7">
                Campai learning plan
              </Title>
            </Box>
          </Group>
          <ScrollArea>
            <Table verticalSpacing="sm" highlightOnHover miw={720}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Naam</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Domein</Table.Th>
                  <Table.Th>Progress</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {modules.map((module) => {
                  const status = moduleStatus(module.id);
                  const progress = moduleProgress(module.id);
                  const risk = !module.completed && module.gap >= 12;
                  return (
                    <Table.Tr
                      key={module.id}
                      style={risk ? { background: "var(--mantine-color-campaiRed-0)" } : undefined}
                    >
                      <Table.Td>
                        <Anchor fw={600} size="sm" c="campaiNavy.7" onClick={() => setOpenModuleId(module.id)}>
                          {module.title}
                        </Anchor>
                        <Text size="xs" c="dimmed">
                          {module.proof}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="gray" radius="sm" size="sm">
                          {moduleType(module)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">{shortDomain(module.domain)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6} wrap="nowrap">
                          <Text size="xs" ff="monospace" w={32}>
                            {progress}%
                          </Text>
                          <Progress w={70} value={progress} size="sm" radius="xl" color="campaiCyan" />
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" radius="sm" size="sm" color={statusColor(status)}>
                          {statusLabel(status)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Button variant="default" size="xs" onClick={() => setOpenModuleId(module.id)}>
                          Open
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>

        {/* Team challenge */}
        <Card withBorder padding="lg" radius="md" bg="campaiNavy.0">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            <Box maw={620}>
              <Group gap="sm" mb={4}>
                <ThemeIcon variant="light" color="campaiNavy" radius="md" size={28}>
                  <IconFlag size={16} />
                </ThemeIcon>
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  Teamchallenge · samenwerking boven leaderboard
                </Text>
              </Group>
              <Title order={3} fz="lg" c="campaiNavy.7">
                {teamChallenge.title}
              </Title>
              <Text size="sm" c="gray.8" mt={4}>
                {teamChallenge.goal}
              </Text>
              <Group gap="xs" mt="sm">
                {teamChallenge.rules.map((rule) => (
                  <Badge key={rule} variant="outline" color="campaiNavy" radius="sm" size="sm">
                    {rule}
                  </Badge>
                ))}
              </Group>
            </Box>
            <Badge color="campaiLime" variant="light" radius="sm" size="lg">
              {teamChallenge.reward}
            </Badge>
          </Group>
        </Card>
      </Stack>

      {/* Module-modal */}
      <ModuleModal
        key={openModuleId ?? "none"}
        module={activeModule}
        update={activeModule ? updates[activeModule.id] : undefined}
        status={activeModule ? moduleStatus(activeModule.id) : "todo"}
        learnerName={learner.name}
        onClose={() => setOpenModuleId(null)}
        onSave={(status, comment) => activeModule && saveModuleUpdate(activeModule.id, status, comment)}
      />
    </>
  );
}

function ModuleModal({
  module,
  update,
  status,
  learnerName,
  onClose,
  onSave,
}: {
  module: TrainingModule | null;
  update: ModuleUpdate | undefined;
  status: string;
  learnerName: string;
  onClose: () => void;
  onSave: (status: string, comment: string) => void;
}) {
  const [draftStatus, setDraftStatus] = useState(status);
  const [comment, setComment] = useState(update?.comment ?? "");

  const timeline: Array<[string, string, string]> = [
    ["Aangemaakt", "Campai Skills Academy", "Seedmodule uit MSP-skillmatrix"],
    ...(update?.updatedAt
      ? ([["Laatste update", formatAuditTime(update.updatedAt), statusLabel(update.status || "todo")]] as Array<
          [string, string, string]
        >)
      : []),
    ...(update?.comment ? ([["Comment", learnerName, update.comment]] as Array<[string, string, string]>) : []),
  ];

  return (
    <Modal opened={module !== null} onClose={onClose} title={module?.title} size="lg" radius="md" centered>
      {module && (
        <Grid>
          <Grid.Col span={{ base: 12, sm: 8 }}>
            <Badge variant="light" color="campaiNavy" radius="sm" mb="sm">
              {module.domain} / {module.level} / {module.xp} XP
            </Badge>
            <Text size="sm" c="gray.8" mb="md">
              Bewijs: {module.proof}. Gebruik deze module om praktijkervaring vast te leggen, niet
              alleen om kennis af te vinken.
            </Text>
            <Select
              label="Status"
              data={[
                { value: "todo", label: "To do" },
                { value: "progress", label: "In progress" },
                { value: "completed", label: "Completed" },
              ]}
              value={draftStatus}
              onChange={(v) => v && setDraftStatus(v)}
              radius="md"
              size="sm"
              mb="sm"
              allowDeselect={false}
            />
            <Textarea
              label="Comment"
              placeholder="Schrijf je update"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.currentTarget.value)}
              radius="md"
              mb="md"
            />
            <Button color="campaiNavy" radius="md" onClick={() => onSave(draftStatus, comment.trim())}>
              Update opslaan
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Stack gap="sm">
              <Box>
                <Text size="10px" tt="uppercase" c="dimmed" fw={700}>
                  Content type
                </Text>
                <Text size="sm" fw={600}>
                  {moduleType(module)}
                </Text>
              </Box>
              <Anchor href={moduleSourceLink(module)} target="_blank" size="sm">
                <Group gap={4}>
                  <IconExternalLink size={14} />
                  Open IT Glue / bron
                </Group>
              </Anchor>
              <Box>
                <Text size="10px" tt="uppercase" c="dimmed" fw={700} mb={4}>
                  Timeline
                </Text>
                <Stack gap="xs">
                  {timeline.map(([title, meta, copy], i) => (
                    <Box key={i}>
                      <Group gap={6}>
                        <ThemeIcon variant="light" color="campaiCyan" radius="xl" size={16}>
                          <IconTargetArrow size={10} />
                        </ThemeIcon>
                        <Text size="xs" fw={700}>
                          {title}
                        </Text>
                      </Group>
                      <Text size="10px" c="dimmed" ml={22}>
                        {meta}
                      </Text>
                      <Text size="xs" c="gray.7" ml={22}>
                        {copy}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Modal>
  );
}
