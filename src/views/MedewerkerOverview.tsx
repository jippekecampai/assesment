import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Box, Button, Card, Grid, Group, Progress, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconArrowRight, IconBook2, IconInfoCircle, IconTargetArrow, IconUserCircle } from "@tabler/icons-react";

import { getLearningProgress, getMe, type MeProfile } from "../lib/api";
import { roles, trainingModules } from "../lib/data";
import { learnerLevel } from "../lib/learning";
import { ViewHead } from "./_shared";

function initials(name?: string | null, email?: string | null) {
  const source = name || email || "Campai gebruiker";
  return source
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CG";
}

export function MedewerkerOverview({ onOpenAcademy }: { onOpenAcademy: () => void }) {
  const [me, setMe] = useState<MeProfile | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe({ authenticated: false }));
  }, []);

  useEffect(() => {
    if (me?.authenticated) {
      getLearningProgress()
        .then((progress) => setCompletedModules(progress.completedModules))
        .catch(() => setCompletedModules([]));
    }
  }, [me]);

  const profile = me?.authenticated
    ? me
    : { name: "Mijn profiel", email: null, jobTitle: null, department: "SSO-profiel niet beschikbaar" };
  const xp = useMemo(
    () => trainingModules.filter((module) => completedModules.includes(module.id)).reduce((total, module) => total + module.xp, 0),
    [completedModules],
  );
  const level = learnerLevel(xp);
  const targetRole = roles.find((role) => role.id === "cloud") ?? roles[0];
  const progress = Math.round((completedModules.length / trainingModules.length) * 100);

  return (
    <>
      <ViewHead mode="academy" banner="medewerkerontwikkeling" title="Mijn overview">
        Profiel, ontwikkeling en career path voor de ingelogde medewerker. Sollicitanten en recruitmentdata blijven gescheiden.
      </ViewHead>

      <Stack gap="xl">
        {!me?.authenticated && (
          <Alert color="yellow" icon={<IconInfoCircle size={16} />} radius="md">
            SSO-profiel is in deze sessie niet beschikbaar. De live Azure-omgeving vult dit via Entra ID.
          </Alert>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                <Group gap="md" align="flex-start">
                  <ThemeIcon variant="light" color="campaiCyan" radius="md" size={56}>
                    <Text fw={800} ff="heading">
                      {initials(profile.name, profile.email)}
                    </Text>
                  </ThemeIcon>
                  <Box>
                    <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                      User profiel
                    </Text>
                    <Title order={2} fz="xl" c="campaiNavy.7">
                      {profile.name || profile.email || "Campai gebruiker"}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {profile.jobTitle || "Functie nog niet gevuld"} · {profile.department || "Afdeling onbekend"}
                    </Text>
                    {profile.email && (
                      <Text size="xs" c="dimmed" mt={4}>
                        {profile.email}
                      </Text>
                    )}
                  </Box>
                </Group>
                <Button color="campaiNavy" radius="md" rightSection={<IconArrowRight size={16} />} onClick={onOpenAcademy}>
                  Naar Skills Academy
                </Button>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Career path
              </Text>
              <Title order={3} fz="md" c="campaiNavy.7" mt={4}>
                {profile.jobTitle || "Huidige rol"} → {targetRole.name}
              </Title>
              <Group justify="space-between" mt="md" mb={4}>
                <Text size="xs" c="dimmed">
                  Academy voortgang
                </Text>
                <Text size="sm" fw={700} ff="monospace" c="campaiNavy.7">
                  {progress}%
                </Text>
              </Group>
              <Progress value={progress} color="campaiCyan" radius="xl" />
              <SimpleGrid cols={3} spacing="sm" mt="md">
                <Metric label="Level" value={String(level)} />
                <Metric label="XP" value={String(xp)} />
                <Metric label="Modules" value={`${completedModules.length}/${trainingModules.length}`} />
              </SimpleGrid>
            </Card>
          </Grid.Col>
        </Grid>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <OverviewCard icon={<IconTargetArrow size={18} />} title="Ontwikkeling" text="Doelen, blockers en voortgang horen bij medewerkerontwikkeling, niet bij recruitment." />
          <OverviewCard icon={<IconBook2 size={18} />} title="Skills Academy" text="Leren, oefenen en toetsen op MSP-domeinen. Hier bouwt de medewerker bewijs en XP op." />
          <OverviewCard icon={<IconUserCircle size={18} />} title="Profiel" text="Naam, rol en afdeling komen uit SSO. Geen Lotte/Daan/Noa als medewerkerbron." />
        </SimpleGrid>
      </Stack>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text size="10px" tt="uppercase" c="dimmed" fw={700}>
        {label}
      </Text>
      <Text size="sm" fw={700} c="campaiNavy.7">
        {value}
      </Text>
    </Box>
  );
}

function OverviewCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group gap="sm" mb="sm">
        <ThemeIcon variant="light" color="campaiNavy" radius="md" size={32}>
          {icon}
        </ThemeIcon>
        <Text fw={700} c="campaiNavy.7">
          {title}
        </Text>
      </Group>
      <Text size="sm" c="dimmed">
        {text}
      </Text>
    </Card>
  );
}
