import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Grid,
  Group,
  Progress,
  Radio,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";

import { domains, knownSystemOptions, roles, unknownOptionLabel } from "../lib/data";
import { recordAudit } from "../lib/learning";
import {
  buildActiveQuestions,
  getFallbackQuestion,
  loadAnswers,
  loadQuestionIndex,
  saveAnswers,
  saveQuestionIndex,
  type StoredAnswer,
} from "../lib/assessment";
import { ViewHead } from "./_shared";

function shortDomain(domain: string): string {
  return domain
    .replace("SharePoint / Azure Migrations", "SP/Azure Mig.")
    .replace("Basic IT & Troubleshooting", "Basic IT")
    .replace("SharePoint / Teams", "SP/Teams")
    .replace("Kaseya Stack", "Kaseya stack")
    .replace("Werkhouding & Communicatie", "Werkhouding");
}

// Rolweging-context voor de test (default Cloud Engineer, zoals de vanilla-app).
const compositionRole = roles[1];

export function Kandidaattest() {
  const [answers, setAnswers] = useState<Record<string, StoredAnswer>>(() => loadAnswers());
  const [tick, setTick] = useState(0);
  const activeQuestions = useMemo(() => buildActiveQuestions(answers), [tick]);
  const [current, setCurrent] = useState(() =>
    Math.min(loadQuestionIndex(), Math.max(0, buildActiveQuestions(loadAnswers()).length - 1)),
  );

  const question = activeQuestions[Math.min(current, activeQuestions.length - 1)];
  const questionId = question.id!;
  const stored = answers[questionId];
  const selectedValue = typeof stored === "object" ? stored.choice : stored;
  const unknownIndex = question.options.length;
  const isUnknown = selectedValue === unknownIndex;

  function persist(next: Record<string, StoredAnswer>) {
    setAnswers(next);
    saveAnswers(next);
  }

  function choose(index: number) {
    if (index === unknownIndex) {
      const next: Record<string, StoredAnswer> = {
        ...answers,
        [questionId]: {
          choice: index,
          status: "unknown",
          knownSystems: typeof stored === "object" ? stored.knownSystems : [],
          note: typeof stored === "object" ? stored.note : "",
        },
      };
      persist(next);
      recordAudit("Kandidaatantwoord opgeslagen", `${question.domain} / onbekend onderwerp`);
      setTick((t) => t + 1); // forceer fallback-insertie
    } else {
      persist({ ...answers, [questionId]: index });
      recordAudit("Kandidaatantwoord opgeslagen", `${question.domain} / vraag ${current + 1}`);
    }
  }

  function toggleSystem(system: string) {
    if (typeof stored !== "object") return;
    const set = new Set(stored.knownSystems);
    if (set.has(system)) set.delete(system);
    else set.add(system);
    persist({ ...answers, [questionId]: { ...stored, knownSystems: Array.from(set) } });
  }

  function setNote(note: string) {
    if (typeof stored !== "object") return;
    persist({ ...answers, [questionId]: { ...stored, note } });
  }

  function goto(index: number) {
    const clamped = Math.max(0, Math.min(activeQuestions.length - 1, index));
    setCurrent(clamped);
    saveQuestionIndex(clamped);
  }

  const allOptions = [...question.options, unknownOptionLabel];
  const systems = knownSystemOptions[question.domain] || [];
  const fallback = getFallbackQuestion(question.domain);
  const selectedSystems = typeof stored === "object" ? stored.knownSystems : [];

  const composition = domains.map((domain) => ({
    domain,
    value: Math.max(4, Math.round((compositionRole.weights[domain] || 0.04) * 100)),
  }));

  return (
    <>
      <ViewHead mode="recruitment" banner="kandidaattest" title="Kandidaattest">
        Adaptief Campai-assessment met lokale autosave. Eén vraag per keer; rolweging staat rechts.
      </ViewHead>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder padding="lg" radius="md">
            <Group justify="space-between" mb="md">
              <Box>
                <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                  Voortgang
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  Vraag {current + 1} / {activeQuestions.length}
                </Title>
              </Box>
              <Badge variant="light" color="campaiCyan" radius="sm">
                Autosave
              </Badge>
            </Group>
            <Progress
              value={((current + 1) / activeQuestions.length) * 100}
              size="sm"
              radius="xl"
              color="campaiNavy"
              mb="lg"
            />

            <Badge variant="light" color="gray" radius="sm" mb="sm">
              {question.domain} / {question.type}
            </Badge>
            <Title order={2} fz="xl" c="campaiNavy.8" mb="lg" lh={1.3}>
              {question.prompt}
            </Title>

            <Radio.Group value={selectedValue != null ? String(selectedValue) : null} onChange={(v) => choose(Number(v))}>
              <Stack gap="sm">
                {allOptions.map((option, index) => {
                  const isUnknownOption = index === unknownIndex;
                  const checked = selectedValue === index;
                  return (
                    <Card
                      key={index}
                      withBorder
                      padding="sm"
                      radius="md"
                      style={{
                        cursor: "pointer",
                        borderColor: checked ? "var(--mantine-color-campaiNavy-6)" : undefined,
                        background: checked
                          ? "var(--mantine-color-campaiNavy-0)"
                          : isUnknownOption
                            ? "var(--mantine-color-gray-0)"
                            : undefined,
                      }}
                      onClick={() => choose(index)}
                    >
                      <Radio
                        value={String(index)}
                        label={
                          <Text size="sm" c={isUnknownOption ? "dimmed" : undefined} fs={isUnknownOption ? "italic" : undefined}>
                            {option}
                          </Text>
                        }
                      />
                    </Card>
                  );
                })}
              </Stack>
            </Radio.Group>

            {isUnknown && (
              <Card withBorder padding="md" radius="md" mt="md" bg="campaiCyan.0">
                <Text fw={700} size="sm" c="campaiNavy.7">
                  Prima, dan meten we dit niet als gok.
                </Text>
                <Text size="xs" c="gray.7" mt={4}>
                  Deze keuze wordt vastgelegd als onbekend onderwerp. De volgende vraag wordt
                  algemener binnen hetzelfde domein: <em>{fallback.type}</em>.
                </Text>
                {systems.length > 0 && (
                  <Box mt="sm">
                    <Text size="xs" tt="uppercase" c="dimmed" fw={700} mb={6}>
                      Welke vergelijkbare systemen ken je wel?
                    </Text>
                    <Group gap="xs">
                      {systems.map((system) => (
                        <Checkbox
                          key={system}
                          label={system}
                          size="xs"
                          checked={selectedSystems.includes(system)}
                          onChange={() => toggleSystem(system)}
                        />
                      ))}
                    </Group>
                  </Box>
                )}
                <Textarea
                  label="Toelichting of vergelijkbare ervaring"
                  placeholder="Bijvoorbeeld: ik ken TOPdesk en NinjaOne, maar niet Autotask/Datto RMM."
                  rows={3}
                  mt="sm"
                  radius="md"
                  value={typeof stored === "object" ? stored.note : ""}
                  onChange={(e) => setNote(e.currentTarget.value)}
                />
              </Card>
            )}

            <Group justify="space-between" mt="lg">
              <Button variant="default" radius="md" disabled={current === 0} onClick={() => goto(current - 1)}>
                Vorige
              </Button>
              <Button
                color="campaiNavy"
                radius="md"
                onClick={() => goto(current + 1)}
                disabled={current === activeQuestions.length - 1}
              >
                {current === activeQuestions.length - 1 ? "Review afronden" : "Opslaan en verder"}
              </Button>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Box mb="md">
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Context · {compositionRole.name}
              </Text>
              <Title order={3} fz="lg" c="campaiNavy.7">
                Rolweging
              </Title>
            </Box>
            <Stack gap="sm">
              {composition.map((item) => (
                <Box key={item.domain}>
                  <Group justify="space-between" mb={2}>
                    <Text size="xs" fw={600}>
                      {shortDomain(item.domain)}
                    </Text>
                    <Text size="xs" ff="monospace" c="campaiNavy.7" fw={700}>
                      {item.value}%
                    </Text>
                  </Group>
                  <Progress value={Math.min(100, item.value * 4)} size="xs" radius="xl" color="campaiCyan" />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
}
