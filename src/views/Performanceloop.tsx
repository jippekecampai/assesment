import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Card,
  Grid,
  Group,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconTargetArrow } from "@tabler/icons-react";

import {
  coachingMoments,
  developmentGoals,
  domains,
  learners,
  performanceLoopModules,
  reviewTemplates,
  roles,
  surveyThemes,
} from "../lib/data";
import { roleScore } from "../lib/scoring";
import { learningRoleFor, recommendedDomains, statusColor, statusLabel } from "../lib/learning";
import { ViewHead } from "./_shared";

function shortDomain(domain: string): string {
  return domain
    .replace("SharePoint / Azure Migrations", "SP/Azure Mig.")
    .replace("Basic IT & Troubleshooting", "Basic IT")
    .replace("SharePoint / Teams", "SP/Teams")
    .replace("Kaseya Stack", "Kaseya stack")
    .replace("Werkhouding & Communicatie", "Werkhouding");
}

function surveyStateColor(state: string): string {
  return state === "good" ? "campaiLime" : state === "warn" ? "yellow" : "campaiRed";
}

export function Performanceloop() {
  const [learnerId, setLearnerId] = useState<string>(learners[0]?.id ?? "");
  const learner = learners.find((l) => l.id === learnerId) ?? learners[0];

  const learningRole = learner ? learningRoleFor(learner) : roles[1];
  const roleFit = learner ? roleScore(learner, learningRole) : 0;
  const gaps = useMemo(
    () => (learner ? recommendedDomains(learner, learningRole, domains) : []),
    [learner, learningRole],
  );
  const myGoals = developmentGoals.filter((g) => g.learnerId === learner?.id);
  const myCoaching = coachingMoments.filter((c) => c.learnerId === learner?.id);

  return (
    <Stack gap="xl">
      <ViewHead mode="academy" banner="management · ontwikkeling (gescheiden van recruitment)" title="Performance loop">
        Manager-inzage per medewerker: career path, ontwikkeldoelen, 1:1's en coaching. Ondersteunt
        het gesprek — nooit een automatische HR-beoordeling.
      </ViewHead>

      {/* Medewerkerkeuze + career path */}
      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md" mb="md">
          <Box>
            <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
              Career path
            </Text>
            <Title order={2} fz="xl" c="campaiNavy.7">
              {learner?.name ?? "—"}
            </Title>
            <Text size="sm" c="dimmed">
              {learner?.role} → {learningRole.name}
              {learner?.meta ? ` · ${learner.meta}` : ""}
            </Text>
          </Box>
          <Group gap="md" align="flex-end">
            <Select
              label="Medewerker"
              data={learners.map((l) => ({ value: l.id, label: l.name }))}
              value={learnerId}
              onChange={(v) => v && setLearnerId(v)}
              radius="md"
              size="sm"
              w={240}
              allowDeselect={false}
              searchable
            />
            <Box ta="right">
              <Text size="10px" tt="uppercase" c="dimmed" fw={700}>
                Rolfit (indicatief)
              </Text>
              <Text fw={800} ff="heading" fz={26} c="campaiNavy.7">
                {Object.keys(learner?.scores ?? {}).length ? `${roleFit}/100` : "—"}
              </Text>
            </Box>
          </Group>
        </Group>

        {Object.keys(learner?.scores ?? {}).length === 0 ? (
          <Text size="sm" c="dimmed">
            Nog geen assessmentscores gekoppeld aan dit profiel.
          </Text>
        ) : (
          <Stack gap="sm">
            {gaps.slice(0, 6).map((item) => {
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

      {/* Ontwikkeldoelen + coaching */}
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
                Nog geen ontwikkeldoelen gekoppeld aan deze medewerker.
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
                Geen coachmomenten gepland voor deze medewerker.
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
        <Group gap="sm" mb="md">
          <ThemeIcon variant="light" color="campaiNavy" radius="md" size={32}>
            <IconTargetArrow size={18} />
          </ThemeIcon>
          <Box>
            <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
              Hoe het werkt
            </Text>
            <Title order={3} fz="lg" c="campaiNavy.7">
              Onderdelen van de performance loop
            </Title>
          </Box>
        </Group>
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
    </Stack>
  );
}
