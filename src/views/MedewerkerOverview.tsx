import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Box, Button, Card, Grid, Group, Progress, RingProgress, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconArrowRight, IconBook2, IconCircleCheck, IconInfoCircle, IconRobot, IconTargetArrow, IconUserCircle } from "@tabler/icons-react";

import {
  getLearningProgress,
  getMe,
  getPracticeResults,
  getPolicyAcks,
  type MeProfile,
  type PracticeResult,
} from "../lib/api";
import { roles, trainingModules } from "../lib/data";
import { learnerLevel } from "../lib/learning";
import { ViewHead } from "./_shared";

// Beleidsonderdelen die meetellen (mirror van Beleid.tsx).
const POLICY_IDS = ["ai-geletterdheid", "gouden-regels", "ai-beleid", "personeelsbeleid"];
const AI_PRACTICE_DOMAIN = "AI / Copilot";
const AI_LITERACY_THRESHOLD = 70;

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
  const [practice, setPractice] = useState<PracticeResult[]>([]);
  const [acks, setAcks] = useState<Record<string, string>>({});

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe({ authenticated: false }));
  }, []);

  useEffect(() => {
    if (me?.authenticated) {
      getLearningProgress()
        .then((progress) => setCompletedModules(progress.completedModules))
        .catch(() => setCompletedModules([]));
      getPracticeResults()
        .then((p) => setPractice(p.results))
        .catch(() => setPractice([]));
      getPolicyAcks()
        .then((p) => setAcks(p.acks || {}))
        .catch(() => setAcks({}));
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

  // Beste oefenscore (%) per domein.
  const bestByDomain = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of practice) {
      const pct = Math.round((r.score / r.total) * 100);
      m.set(r.domain, Math.max(m.get(r.domain) ?? 0, pct));
    }
    return m;
  }, [practice]);
  const practiceAvg = bestByDomain.size
    ? Math.round([...bestByDomain.values()].reduce((a, b) => a + b, 0) / bestByDomain.size)
    : 0;
  const ackedCount = POLICY_IDS.filter((id) => acks[id]).length;
  const policyPct = Math.round((ackedCount / POLICY_IDS.length) * 100);

  // #1 Ontwikkelscore: oefenen 40% + modules 40% + beleid 20%.
  const devScore = Math.round(practiceAvg * 0.4 + progress * 0.4 + policyPct * 0.2);
  const devColor = devScore >= 75 ? "campaiLime" : devScore >= 50 ? "campaiCyan" : "campaiRed";

  // #3 AI-geletterdheid (ISO 42001): beleid gelezen + AI-oefening op niveau.
  const aiBest = bestByDomain.get(AI_PRACTICE_DOMAIN) ?? null;
  const aiPolicyOk = Boolean(acks["ai-geletterdheid"] && acks["gouden-regels"]);
  const aiPracticeOk = aiBest !== null && aiBest >= AI_LITERACY_THRESHOLD;
  const aiLiterate = aiPolicyOk && aiPracticeOk;
  const aiMissing: string[] = [];
  if (!acks["ai-geletterdheid"]) aiMissing.push("bevestig 'Wat is AI'");
  if (!acks["gouden-regels"]) aiMissing.push("bevestig de 10 gouden regels");
  if (!aiPracticeOk) aiMissing.push(`oefen AI / Copilot tot ≥${AI_LITERACY_THRESHOLD}%${aiBest !== null ? ` (nu ${aiBest}%)` : ""}`);

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

        {/* Ontwikkelscore (#1) + AI-geletterdheid (#3, ISO 42001) */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Mijn ontwikkelscore
              </Text>
              <Group align="center" gap="lg" mt="sm" wrap="nowrap">
                <RingProgress
                  size={104}
                  thickness={11}
                  roundCaps
                  sections={[{ value: devScore, color: devColor }]}
                  label={
                    <Text ta="center" fw={800} fz={22} c="campaiNavy.7">
                      {devScore}
                    </Text>
                  }
                />
                <Stack gap={6} style={{ flex: 1 }}>
                  <ScoreBar label="Oefenen (gem.)" value={practiceAvg} />
                  <ScoreBar label="Modules" value={progress} />
                  <ScoreBar label="Beleid gelezen" value={policyPct} />
                </Stack>
              </Group>
              <Text size="xs" c="dimmed" mt="sm">
                Combinatie van oefenresultaten, voltooide modules en beleidsbevestigingen. Voor
                ontwikkeling — geen automatische beoordeling.
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              withBorder
              padding="lg"
              radius="md"
              h="100%"
              style={{ borderColor: aiLiterate ? "var(--mantine-color-campaiLime-4)" : undefined }}
            >
              <Group justify="space-between" align="flex-start">
                <Group gap="sm">
                  <ThemeIcon variant="light" color={aiLiterate ? "campaiLime" : "campaiCyan"} radius="md" size={32}>
                    <IconRobot size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                      ISO 42001
                    </Text>
                    <Title order={3} fz="md" c="campaiNavy.7">
                      AI-geletterdheid
                    </Title>
                  </Box>
                </Group>
                <Badge color={aiLiterate ? "campaiLime" : "yellow"} variant="filled" radius="sm">
                  {aiLiterate ? "Op niveau" : "Nog niet compleet"}
                </Badge>
              </Group>
              {aiLiterate ? (
                <Group gap={6} mt="md">
                  <ThemeIcon variant="light" color="campaiLime" radius="xl" size={20}>
                    <IconCircleCheck size={13} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">
                    Beleid gelezen én AI / Copilot-oefening op niveau. Aantoonbaar AI-geletterd.
                  </Text>
                </Group>
              ) : (
                <Stack gap={4} mt="md">
                  <Text size="sm" fw={600} c="campaiNavy.8">
                    Nog te doen:
                  </Text>
                  {aiMissing.map((m) => (
                    <Text key={m} size="xs" c="dimmed">
                      • {m}
                    </Text>
                  ))}
                </Stack>
              )}
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

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <Box>
      <Group justify="space-between" mb={2}>
        <Text size="10px" tt="uppercase" c="dimmed" fw={700}>
          {label}
        </Text>
        <Text size="10px" ff="monospace" c="campaiNavy.7" fw={700}>
          {value}%
        </Text>
      </Group>
      <Progress value={value} size="xs" radius="xl" color="campaiCyan" />
    </Box>
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
