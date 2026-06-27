import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import {
  adminRoles,
  appSettingsMap,
  assessmentSchemaVersion,
  candidates,
  dashboardModules,
  documentationMap,
  domains,
  draftQuestions,
  roles,
  testQuestions,
  trainingModules,
  currentUserProfile,
} from "../lib/data";
import { initials } from "../lib/scoring";
import { clearAudit, formatAuditTime, loadAudit, recordAudit, type AuditEntry } from "../lib/learning";
import { getMe, type MeProfile } from "../lib/api";
import { ViewHead } from "./_shared";

function readCount(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
  } catch {
    return 0;
  }
}

function InfoGrid({ items }: { items: Array<[string, string, string]> }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
      {items.map(([key, value, description]) => (
        <Card key={key} withBorder padding="sm" radius="md" bg="gray.0">
          <Text size="xs" ff="monospace" c="campaiCyan.7" fw={700}>
            {key}
          </Text>
          <Text size="sm" fw={700} c="campaiNavy.7">
            {value}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {description}
          </Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}

export function Beheer() {
  const [audit, setAudit] = useState<AuditEntry[]>(() => loadAudit());
  const [me, setMe] = useState<MeProfile | null>(null);

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe({ authenticated: false }));
  }, []);

  const profile = me?.authenticated
    ? {
        name: me.name || me.email || "Campai gebruiker",
        email: me.email || "",
        role: "Medewerker",
        source: "Microsoft Entra ID / App Service Authentication",
        permissions: ["profile:read", "learning:read", "learning:update"],
      }
    : currentUserProfile;

  const dataStructureItems: Array<[string, string, string]> = [
    ["/api/me", me?.authenticated ? "SSO actief" : "fallback", "Medewerkerprofiel komt uit Microsoft Entra ID; geen Lotte/Daan/Noa in de medewerkerflow."],
    ["candidates[]", `${candidates.length} kandidaten`, "Recruitmentprofielen met scores, assessmentstatus en rol-fit."],
    ["learning/me", "per SSO-profiel", "Modulevoortgang wordt aan de ingelogde gebruiker gekoppeld; lokale opslag is alleen fallback/prototype."],
    ["domains[]", `${domains.length} domeinen`, "MSP-domeinen voor scoring, heatmap, competentiekaart en vragen."],
    ["roles[]", `${roles.length} rollen`, "Doelrollen met domeingewichten, thresholds en advieslogica."],
    ["trainingModules[]", `${trainingModules.length} modules`, "Skills Academy registry voor artikel, course, path en practice."],
    ["testQuestions[]", `${testQuestions.length} vragen`, "Gebalanceerde assessmentvragen met antwoordindex en domeinkoppeling."],
    ["draftQuestions[]", `${draftQuestions.length} concepten`, "Vragenbankconcepten die bewerkt en gepromoveerd kunnen worden."],
    ["dashboardModules[]", `${dashboardModules.length} views`, "Dashboardregistry die navigatie, panels en databronnen bij elkaar houdt."],
    ["DATASTRUCTURE.md", "Canoniek protocol", "Toevoegen van kandidaat, medewerker, domein, rol of module volgt dit document."],
  ];

  const memoryItems: Array<[string, string, string]> = [
    ["camaiAnswers", `${readCount("camaiAnswers")} antwoorden`, "Autosave voor kandidaatantwoorden in de browser."],
    ["camaiQuestionIndex", `Vraag ${Number(localStorage.getItem("camaiQuestionIndex") || 0) + 1}`, "Laatste positie in de adaptieve kandidaatflow."],
    ["camaiCustomQuestions", `${readCount("camaiCustomQuestions")} concepten`, "Naar het assessment gepromoveerde conceptvragen."],
    ["camaiCompletedModules", `${readCount("camaiCompletedModules")} learners`, "Lokale voortgang voor Skills Academy modules."],
    ["camaiModuleUpdates", `${readCount("camaiModuleUpdates")} learners`, "Comments/statusupdates per trainingsmodule."],
    ["camaiAuditLog", `${audit.length} events`, "Laatste 100 beheer- en dashboardacties."],
  ];

  const settingsItems = appSettingsMap.map(
    ([k, v, d]) => [k, k === "Vraagstructuur" ? assessmentSchemaVersion : v, d] as [string, string, string],
  );

  function handleClear() {
    clearAudit();
    recordAudit("Auditlog gereset", "Lokale dashboardlog opnieuw gestart");
    setAudit(loadAudit());
    notifications.show({ message: "Auditlog gereset.", color: "campaiNavy" });
  }

  return (
    <>
      <ViewHead mode="governance" banner="app-rollen & documentatie" title="Beheer">
        Approllen, registraties en het lokale wijzigingslog. Productie vereist server-side
        autorisatie via Entra ID.
      </ViewHead>

      <Stack gap="lg">
        <Grid>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Group justify="space-between" mb="md">
                <Box>
                  <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                    Gebruiker
                  </Text>
                  <Title order={3} fz="lg" c="campaiNavy.7">
                    Profiel
                  </Title>
                </Box>
                <Badge variant="light" color="campaiNavy" radius="sm">
                  {profile.role}
                </Badge>
              </Group>
              <Group gap="md" mb="md">
                <ThemeIcon variant="light" color="campaiNavy" radius="md" size={48}>
                  <Text fw={800} ff="heading">
                    {initials(profile.name || profile.email)}
                  </Text>
                </ThemeIcon>
                <Box>
                  <Text fw={700}>{profile.name}</Text>
                  <Text size="sm" c="dimmed">
                    {profile.email || "Geen e-mail beschikbaar"}
                  </Text>
                </Box>
              </Group>
              <Stack gap={6}>
                <InfoRow label="Identity" value={profile.source} />
                <InfoRow label="Approl" value={profile.role} />
                <InfoRow label="Rechten" value={profile.permissions.join(", ")} />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Box mb="md">
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  Rollen
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  Rechten
                </Title>
              </Box>
              <Stack gap="sm">
                {adminRoles.map((role) => (
                  <Card
                    key={role.name}
                    withBorder
                    padding="sm"
                    radius="md"
                    style={
                      role.name === profile.role
                        ? { borderColor: "var(--mantine-color-campaiNavy-6)", background: "var(--mantine-color-campaiNavy-0)" }
                        : undefined
                    }
                  >
                    <Group justify="space-between" wrap="nowrap" align="flex-start">
                      <Box>
                        <Text fw={700} size="sm" c="campaiNavy.7">
                          {role.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {role.scope}
                        </Text>
                      </Box>
                      <Text size="xs" c="gray.7" ta="right" maw={280}>
                        {role.permissions.join(" / ")}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Card withBorder padding="lg" radius="md">
          <Box mb="md">
            <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
              Documentatie
            </Text>
            <Title order={3} fz="lg" c="campaiNavy.7">
              Registraties
            </Title>
          </Box>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
            {documentationMap.map(([subject, location, rule]) => (
              <Card key={subject} withBorder padding="sm" radius="md" bg="gray.0">
                <Text size="sm" fw={700} c="campaiNavy.7">
                  {subject}
                </Text>
                <Badge size="xs" variant="light" color="campaiCyan" radius="sm" my={4}>
                  {location}
                </Badge>
                <Text size="xs" c="dimmed">
                  {rule}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Card>

        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Title order={3} fz="lg" c="campaiNavy.7" mb="md">
                App-model
              </Title>
              <InfoGrid items={dataStructureItems} />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Stack gap="lg">
              <Card withBorder padding="lg" radius="md">
                <Title order={3} fz="lg" c="campaiNavy.7" mb="md">
                  Lokale state
                </Title>
                <InfoGrid items={memoryItems} />
              </Card>
              <Card withBorder padding="lg" radius="md">
                <Title order={3} fz="lg" c="campaiNavy.7" mb="md">
                  Actieve regels
                </Title>
                <InfoGrid items={settingsItems} />
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Box>
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Wijzigingslog
              </Text>
              <Title order={3} fz="lg" c="campaiNavy.7">
                Dashboardacties
              </Title>
            </Box>
            <Button variant="default" size="xs" onClick={handleClear}>
              Log resetten
            </Button>
          </Group>
          {audit.length === 0 ? (
            <Text size="sm" c="dimmed">
              Nog geen dashboardwijzigingen vastgelegd.
            </Text>
          ) : (
            <Stack gap="xs">
              {audit.slice(0, 30).map((entry, index) => (
                <Group key={index} gap="md" wrap="nowrap" align="flex-start">
                  <Text size="xs" ff="monospace" c="dimmed" w={110} style={{ flexShrink: 0 }}>
                    {formatAuditTime(entry.at)}
                  </Text>
                  <Box>
                    <Text size="sm" fw={600}>
                      {entry.action}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {entry.detail} · {entry.actor}
                    </Text>
                  </Box>
                </Group>
              ))}
            </Stack>
          )}
        </Card>
      </Stack>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start">
      <Text size="xs" tt="uppercase" c="dimmed" fw={700}>
        {label}
      </Text>
      <Text size="sm" ta="right" maw={280}>
        {value}
      </Text>
    </Group>
  );
}
