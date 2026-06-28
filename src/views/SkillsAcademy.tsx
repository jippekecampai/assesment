import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Progress,
  Radio,
  ScrollArea,
  Select,
  SimpleGrid,
  Tabs,
  Stack,
  Table,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBook2,
  IconCircleCheck,
  IconExternalLink,
  IconFlag,
  IconInfoCircle,
  IconPlus,
  IconTargetArrow,
  IconUserCircle,
} from "@tabler/icons-react";

import { getMe, getLearningProgress, saveLearningProgress, listAllQuestions, type MeProfile, type BankQuestion } from "../lib/api";
import {
  coachingMoments,
  developmentGoals,
  domains,
  performanceLoopModules,
  reviewTemplates,
  roles,
  surveyThemes,
  teamChallenge,
  trainingModules,
  type Learner,
  type TrainingModule,
} from "../lib/data";
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

export function SkillsAcademy() {
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

  // Effective learner: SSO-profiel is leidend. Geen demo-medewerkers in de medewerkerflow.
  const fallbackLearner: Learner = {
    id: "ME",
    name: "Mijn profiel",
    role: "-",
    targetRole: "Cloud Engineer",
    meta: "SSO-profiel niet beschikbaar",
    scores: {},
    type: "learner",
  };
  const ssoLearner = isSso
    ? {
        id: (me as Extract<MeProfile, { authenticated: true }>).entraOid || "ME",
        name:
          (me as Extract<MeProfile, { authenticated: true }>).name ||
          (me as Extract<MeProfile, { authenticated: true }>).email ||
          "Campai gebruiker",
        role: (me as Extract<MeProfile, { authenticated: true }>).jobTitle || "-",
        targetRole: "Cloud Engineer",
        meta: (me as Extract<MeProfile, { authenticated: true }>).department || "Interne medewerker",
        scores: {} as Record<string, number>,
        type: "learner" as const,
      }
    : null;
  const learner = isSso ? ssoLearner! : fallbackLearner;

  const [learningRoleId, setLearningRoleId] = useState(learningRoleFor(fallbackLearner).id);
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

  // Performance-loop seed (per medewerker). Voor een via SSO ingelogd profiel zonder
  // gekoppelde data tonen we nette lege staten.
  const myGoals = developmentGoals.filter((g) => g.learnerId === learner.id);
  const myCoaching = coachingMoments.filter((c) => c.learnerId === learner.id);
  const surveyStateColor = (state: string) =>
    state === "good" ? "campaiLime" : state === "warn" ? "yellow" : "campaiRed";

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

        {/* Profiel + Academy substructuur */}
        <Accordion variant="contained" radius="md" defaultValue="profile">
          <Accordion.Item value="profile">
            <Accordion.Control icon={<IconUserCircle size={18} />}>
              Mijn profiel en leercontext
            </Accordion.Control>
            <Accordion.Panel>
              {!isSso && (
                <Alert color="yellow" icon={<IconInfoCircle size={16} />} radius="md" mb="md">
                  SSO-profiel is niet beschikbaar in deze sessie. De live Azure-omgeving vult dit via Entra ID.
                </Alert>
              )}
              <Tabs defaultValue="profile" radius="md">
                <Tabs.List mb="md">
                  <Tabs.Tab value="profile">Profiel</Tabs.Tab>
                  <Tabs.Tab value="career">Career path</Tabs.Tab>
                  <Tabs.Tab value="progress">Voortgang</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="profile">
                  <Card withBorder padding="lg" radius="md">
                    <Group gap="md" wrap="nowrap">
                      <ThemeIcon variant="light" color="campaiCyan" radius="md" size={48}>
                        <Text fw={800} ff="heading">
                          {learner.name
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase())
                            .join("") || "CG"}
                        </Text>
                      </ThemeIcon>
                      <Box>
                        <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                          User profiel
                        </Text>
                        <Title order={2} fz="xl" c="campaiNavy.7">
                          {learner.name}
                        </Title>
                        <Text size="sm" c="dimmed">
                          {learner.role} · {learner.meta}
                        </Text>
                      </Box>
                    </Group>
                  </Card>
                </Tabs.Panel>

                <Tabs.Panel value="career">
                  <Card withBorder padding="lg" radius="md">
                    <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                      <Box>
                        <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                          Career plan
                        </Text>
                        <Title order={3} fz="md" c="campaiNavy.7">
                          {learner.role} → {learningRole.name}
                        </Title>
                        <Text size="sm" c="dimmed" mt={4}>
                          Groeirol is persoonlijk en staat los van recruitmentbeoordeling.
                        </Text>
                      </Box>
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
                  </Card>
                </Tabs.Panel>

                <Tabs.Panel value="progress">
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
                </Tabs.Panel>
              </Tabs>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="academy">
            <Accordion.Control icon={<IconBook2 size={18} />}>
              Skills Academy onderdelen
            </Accordion.Control>
            <Accordion.Panel>
              <Tabs defaultValue="learn" radius="md">
                <Tabs.List mb="md">
                  <Tabs.Tab value="learn">Leren</Tabs.Tab>
                  <Tabs.Tab value="test">Toetsen</Tabs.Tab>
                  <Tabs.Tab value="coaching">Coaching</Tabs.Tab>
                  <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
                  <Tabs.Tab value="team">Team</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="learn">
                  <Text size="sm" c="dimmed">Modules, badges en praktijkbewijs voor MSP-domeinen.</Text>
                </Tabs.Panel>
                <Tabs.Panel value="test">
                  <Text size="sm" c="dimmed" mb="md">
                    Oefen vrijblijvend per domein met dezelfde kennisbank als de assessments.
                    Dit meet leerprogressie — het is géén HR-beoordeling of sollicitantselectie.
                  </Text>
                  <PracticeQuiz />
                </Tabs.Panel>
                <Tabs.Panel value="coaching">
                  <Text size="sm" c="dimmed">1:1s, blockers en ontwikkeldoelen worden hier voorbereid.</Text>
                </Tabs.Panel>
                <Tabs.Panel value="reviews">
                  <Text size="sm" c="dimmed">Reviewtemplates ondersteunen gesprekken; geen automatische HR-besluiten.</Text>
                </Tabs.Panel>
                <Tabs.Panel value="team">
                  <Text size="sm" c="dimmed">Team-signalen zijn alleen geaggregeerd zichtbaar.</Text>
                </Tabs.Panel>
              </Tabs>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

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

        {/* Ontwikkeldoelen + coaching (per medewerker) */}
        <Grid>
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Box mb="md">
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  Goals
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  Ontwikkeldoelen
                </Title>
              </Box>
              {myGoals.length === 0 ? (
                <Text size="sm" c="dimmed">
                  Nog geen ontwikkeldoelen gekoppeld aan dit profiel.
                </Text>
              ) : (
                <Stack gap="md">
                  {myGoals.map((goal) => (
                    <Box key={goal.id}>
                      <Group justify="space-between" mb={4} wrap="nowrap" align="flex-start">
                        <Box>
                          <Text size="sm" fw={600} c="campaiNavy.8">
                            {goal.title}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {goal.metric}
                          </Text>
                        </Box>
                        <Group gap={6} wrap="nowrap">
                          <Badge variant="light" color="gray" radius="sm" size="sm">
                            {shortDomain(goal.linkedDomain)}
                          </Badge>
                          <Badge variant="light" color={statusColor(goal.status)} radius="sm" size="sm">
                            {statusLabel(goal.status)}
                          </Badge>
                        </Group>
                      </Group>
                      <Group gap="sm" wrap="nowrap">
                        <Progress flex={1} value={goal.progress} size="sm" radius="xl" color="campaiCyan" />
                        <Text size="xs" ff="monospace" w={36} ta="right">
                          {goal.progress}%
                        </Text>
                        <Badge variant="outline" color="campaiNavy" radius="sm" size="sm">
                          {goal.due}
                        </Badge>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Box mb="md">
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  1:1s &amp; reviews
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  Coachmomenten
                </Title>
              </Box>
              {myCoaching.length === 0 ? (
                <Text size="sm" c="dimmed">
                  Geen coachmomenten gepland voor dit profiel.
                </Text>
              ) : (
                <Stack gap="sm">
                  {myCoaching.map((moment, index) => (
                    <Card key={index} withBorder padding="sm" radius="md">
                      <Group justify="space-between" wrap="nowrap" mb={2}>
                        <Badge
                          variant="light"
                          color={moment.type === "Review" ? "campaiNavy" : "campaiCyan"}
                          radius="sm"
                          size="sm"
                        >
                          {moment.type}
                        </Badge>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {moment.date}
                        </Text>
                      </Group>
                      <Text size="sm" fw={600} c="campaiNavy.8">
                        {moment.title}
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        Focus: {moment.focus}
                      </Text>
                      <Text size="xs" c="gray.7" mt={2}>
                        Actie: {moment.action}
                      </Text>
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid.Col>
        </Grid>

        {/* Review-templates + survey-thema's */}
        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Box mb="md">
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  Reviews
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  Review-templates
                </Title>
              </Box>
              <Stack gap="sm">
                {reviewTemplates.map((tmpl) => (
                  <Card key={tmpl.id} withBorder padding="sm" radius="md">
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={700} c="campaiNavy.7">
                        {tmpl.title}
                      </Text>
                      <Badge variant="light" color="gray" radius="sm" size="sm">
                        {tmpl.cadence}
                      </Badge>
                    </Group>
                    <Stack gap={2}>
                      {tmpl.questions.map((q, i) => (
                        <Text key={i} size="xs" c="gray.7">
                          • {q}
                        </Text>
                      ))}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Box mb="md">
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  Surveys · alleen geaggregeerd
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  Team-signalen
                </Title>
                <Text size="xs" c="dimmed" mt={4}>
                  Pulse-metingen op teamniveau — nooit gekoppeld aan individuele beoordeling of
                  recruitment.
                </Text>
              </Box>
              <Stack gap="md">
                {surveyThemes.map((theme) => (
                  <Box key={theme.title}>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={600}>
                        {theme.title}
                      </Text>
                      <Text size="sm" fw={700} ff="monospace" c={`${surveyStateColor(theme.state)}.7`}>
                        {theme.score}
                      </Text>
                    </Group>
                    <Progress value={theme.score} size="sm" radius="xl" color={surveyStateColor(theme.state)} mb={2} />
                    <Text size="xs" c="dimmed">
                      {theme.signal}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Performance-loop overzicht */}
        <Card withBorder padding="lg" radius="md">
          <Box mb="md">
            <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
              Hoe het werkt
            </Text>
            <Title order={3} fz="lg" c="campaiNavy.7">
              Performance loop
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              De onderdelen van de Skills Academy en hoe Campai ze inzet — ontwikkeling, nooit als
              automatische HR-beoordeling.
            </Text>
          </Box>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
            {performanceLoopModules.map((mod) => (
              <Card key={mod.id} withBorder padding="sm" radius="md" bg="gray.0">
                <Group justify="space-between" mb={4} wrap="nowrap">
                  <Text size="sm" fw={700} c="campaiNavy.7">
                    {mod.title}
                  </Text>
                  <Badge variant="light" color="campaiNavy" radius="sm" size="xs">
                    {mod.status}
                  </Badge>
                </Group>
                <Text size="xs" c="gray.7">
                  {mod.purpose}
                </Text>
                <Text size="10px" c="dimmed" mt={4}>
                  Campai: {mod.campaiUse}
                </Text>
                <Text size="10px" c="dimmed" mt={4}>
                  Eigenaar: {mod.owner}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Card>

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

// Oefen-modus voor medewerkers: kies een domein, oefen met de gedeelde kennisbank.
// Puur leren (geen score-registratie/HR-beoordeling). Antwoorden client-side gecheckt.
function PracticeQuiz() {
  const [domain, setDomain] = useState<string>(domains[0]);
  const [questions, setQuestions] = useState<BankQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    try {
      const all = await listAllQuestions();
      const pool = all.filter((q) => q.domain === domain);
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(shuffled);
    } catch {
      notifications.show({ message: "Vragen laden mislukt — draait de server?", color: "red" });
    } finally {
      setLoading(false);
    }
  }

  const total = questions?.length ?? 0;
  const score = questions ? questions.filter((q) => answers[q.id] === q.answer).length : 0;
  const allAnswered = questions ? questions.every((q) => answers[q.id] != null) : false;

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="md" wrap="wrap">
        <Select
          label="Domein"
          data={domains}
          value={domain}
          onChange={(v) => v && setDomain(v)}
          radius="md"
          size="sm"
          w={260}
          allowDeselect={false}
          searchable
        />
        <Button color="campaiNavy" radius="md" size="sm" onClick={start} loading={loading}>
          {questions ? "Nieuwe oefenronde" : "Start oefening"}
        </Button>
      </Group>

      {questions && questions.length === 0 && (
        <Text size="sm" c="dimmed">
          Nog geen vragen in dit domein.
        </Text>
      )}

      {questions && questions.length > 0 && (
        <>
          {submitted && (
            <Card withBorder radius="md" padding="md" bg="campaiNavy.0">
              <Group justify="space-between" align="center">
                <Text fw={700} c="campaiNavy.8">
                  Resultaat: {score} / {total} goed
                </Text>
                <Badge
                  variant="filled"
                  radius="sm"
                  color={score / total >= 0.7 ? "campaiLime" : score / total >= 0.5 ? "campaiCyan" : "campaiRed"}
                >
                  {Math.round((score / total) * 100)}%
                </Badge>
              </Group>
              <Text size="xs" c="dimmed" mt={4}>
                Alleen voor jouw eigen ontwikkeling — dit wordt nergens als beoordeling vastgelegd.
              </Text>
            </Card>
          )}

          <Stack gap="sm">
            {questions.map((q, qi) => (
              <Card key={q.id} withBorder radius="md" padding="md">
                <Text size="sm" fw={600} c="campaiNavy.8" mb="xs">
                  {qi + 1}. {q.prompt}
                </Text>
                <Radio.Group
                  value={answers[q.id] != null ? String(answers[q.id]) : null}
                  onChange={(v) => !submitted && setAnswers((a) => ({ ...a, [q.id]: Number(v) }))}
                >
                  <Stack gap={6}>
                    {q.options.map((opt, i) => {
                      const chosen = answers[q.id] === i;
                      const correct = i === q.answer;
                      const bg = submitted
                        ? correct
                          ? "var(--mantine-color-campaiLime-0, #f4f7d9)"
                          : chosen
                            ? "var(--mantine-color-campaiRed-0, #fbe6e6)"
                            : "transparent"
                        : "transparent";
                      const border = submitted
                        ? correct
                          ? "var(--mantine-color-campaiLime-5, #b6c200)"
                          : chosen
                            ? "var(--mantine-color-campaiRed-5, #e03131)"
                            : "var(--mantine-color-gray-3, #dee2e6)"
                        : "var(--mantine-color-gray-3, #dee2e6)";
                      return (
                        <Box
                          key={i}
                          style={{
                            background: bg,
                            borderLeft: `3px solid ${border}`,
                            borderRadius: 6,
                            padding: "6px 10px",
                          }}
                        >
                          <Radio
                            value={String(i)}
                            disabled={submitted}
                            label={
                              <Group gap={6} wrap="nowrap">
                                <Text size="sm">{opt}</Text>
                                {submitted && correct && (
                                  <Badge variant="filled" color="campaiLime" radius="sm" size="xs">
                                    Juist
                                  </Badge>
                                )}
                              </Group>
                            }
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </Radio.Group>
              </Card>
            ))}
          </Stack>

          {!submitted && (
            <Group>
              <Button
                color="campaiNavy"
                radius="md"
                disabled={!allAnswered}
                onClick={() => setSubmitted(true)}
              >
                Nakijken
              </Button>
              {!allAnswered && (
                <Text size="xs" c="dimmed">
                  Beantwoord eerst alle vragen.
                </Text>
              )}
            </Group>
          )}
        </>
      )}
    </Stack>
  );
}


