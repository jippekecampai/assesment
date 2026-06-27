import { useEffect, useState } from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconChevronDown, IconPlus } from "@tabler/icons-react";

import { domains, draftQuestions as seedDrafts, roles, type DraftQuestion } from "../lib/data";
import { recordAudit } from "../lib/learning";
import { addQuestion, ApiError, generateQuestions, getCoverage, listQuestions, listFlags, resolveFlag, type ApprovedQuestion, type DomainCoverage, type QuestionFlag } from "../lib/api";
import { ViewHead } from "./_shared";

interface Draft extends DraftQuestion {
  type?: string;
  options?: string[];
  answer?: number;
}

const questionTypes = [
  "Scenario",
  "Kennischeck",
  "Troubleshooting",
  "Klantreactie",
  "Werkhouding",
  "Engelse taalvaardigheid",
  "Sales discovery",
];

function defaultDraftOptions(): string[] {
  return [
    "Alleen een losse technische actie uitvoeren zonder impact of communicatie.",
    "Impact bepalen, relevante logs of brondata controleren, herstelstap kiezen en opvolging vastleggen.",
    "De vraag direct escaleren zonder eigen analyse of context.",
    "Wachten tot de klant of collega opnieuw contact opneemt.",
  ];
}

export function Vragenfabriek() {
  const [drafts, setDrafts] = useState<Draft[]>(() => seedDrafts.map((d) => ({ ...d })));
  const [activeIndex, setActiveIndex] = useState(0);
  const [approvedQuestions, setApprovedQuestions] = useState<ApprovedQuestion[]>([]);
  const [coverage, setCoverage] = useState<DomainCoverage>({});
  const [flags, setFlags] = useState<QuestionFlag[]>([]);

  async function refreshApproved() {
    try {
      const qs = await listQuestions();
      setApprovedQuestions(qs);
    } catch {
      // silently ignore — server may not be running in dev
    }
  }

  async function refreshCoverage() {
    try {
      const cov = await getCoverage();
      setCoverage(cov);
    } catch {
      // silently ignore — server may not be running in dev
    }
  }

  async function refreshFlags() {
    try {
      setFlags(await listFlags());
    } catch {
      // silently ignore — server may not be running in dev
    }
  }

  async function markResolved(id: string) {
    try {
      await resolveFlag(id);
      notifications.show({ message: "Markering verwijderd.", color: "campaiNavy" });
      refreshFlags();
    } catch {
      notifications.show({ message: "Verwijderen mislukt.", color: "red" });
    }
  }

  useEffect(() => {
    refreshApproved();
    refreshCoverage();
    refreshFlags();
  }, []);

  // Nieuw-concept formulier
  const [fDomain, setFDomain] = useState(domains[0]);
  const [fRole, setFRole] = useState(roles[0].name);
  const [fType, setFType] = useState(questionTypes[0]);
  const [fSource, setFSource] = useState("");
  const [fPrompt, setFPrompt] = useState("");

  // Genereer of importeer
  const [genDomain, setGenDomain] = useState(domains[0]);
  const [genCount, setGenCount] = useState<number>(5);
  const [genLoading, setGenLoading] = useState(false);
  const [importJson, setImportJson] = useState("");

  function addDraft() {
    const next: Draft = {
      domain: fDomain,
      role: fRole,
      type: fType,
      source: fSource || "Handmatige Campai-bron",
      prompt: fPrompt || "Conceptvraag wacht op senior review.",
      options: defaultDraftOptions(),
      answer: 1,
    };
    setDrafts((prev) => [next, ...prev]);
    setActiveIndex(0);
    recordAudit("Conceptvraag toegevoegd", `${fDomain} / ${fRole}`);
    setFSource("");
    setFPrompt("");
    notifications.show({ message: "Conceptvraag toegevoegd voor review.", color: "campaiNavy" });
  }

  function updateDraft(index: number, patch: Partial<Draft>) {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function saveDraft(index: number) {
    const d = drafts[index];
    recordAudit("Conceptvraag bijgewerkt", `${d.domain} / ${d.role}`);
    notifications.show({ message: "Conceptvraag bijgewerkt.", color: "campaiNavy" });
  }

  async function promote(index: number) {
    const d = drafts[index];
    try {
      await addQuestion({
        domain: d.domain,
        type: d.type || "Conceptvraag",
        prompt: d.prompt,
        options: d.options || defaultDraftOptions(),
        answer: Number.isInteger(d.answer) ? d.answer! : 1,
        source: "Handmatig",
      });
      recordAudit("Conceptvraag goedgekeurd naar server-bank", `${d.domain} / ${d.role}`);
      notifications.show({ message: "Vraag toegevoegd aan goedgekeurde bank.", color: "campaiLime" });
      await refreshApproved();
      await refreshCoverage();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      notifications.show({ message: `Opslaan mislukt: ${msg}`, color: "red" });
    }
  }

  async function handleGenerate() {
    setGenLoading(true);
    try {
      const results = await generateQuestions(genDomain, genCount);
      const newDrafts: Draft[] = results.map((r) => ({
        domain: r.domain,
        role: roles[0].name,
        type: r.type,
        source: r.source || "AI",
        prompt: r.prompt,
        options: r.options,
        answer: r.answer,
      }));
      setDrafts((prev) => [...newDrafts, ...prev]);
      setActiveIndex(0);
      recordAudit("AI-vragen gegenereerd", `${results.length} concepten / domein ${genDomain}`);
      notifications.show({ message: `${results.length} conceptvraag(en) toegevoegd voor review.`, color: "campaiNavy" });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === "ai_not_configured") {
        notifications.show({ message: "AI-endpoint niet ingesteld — gebruik import of stel AI_* in", color: "red" });
      } else {
        const msg = err instanceof Error ? err.message : "Onbekende fout";
        notifications.show({ message: `Genereren mislukt: ${msg}`, color: "red" });
      }
    } finally {
      setGenLoading(false);
    }
  }

  function handleImport() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(importJson);
    } catch {
      notifications.show({ message: "Ongeldige JSON — controleer de invoer.", color: "red" });
      return;
    }
    if (!Array.isArray(parsed)) {
      notifications.show({ message: "JSON moet een array zijn.", color: "red" });
      return;
    }
    const valid: Draft[] = [];
    let skipped = 0;
    for (const item of parsed) {
      if (
        item &&
        typeof item === "object" &&
        domains.includes(item.domain) &&
        Array.isArray(item.options) &&
        item.options.length === 4 &&
        item.options.every((o: unknown) => typeof o === "string" && o.trim().length > 0) &&
        Number.isInteger(item.answer) &&
        item.answer >= 0 &&
        item.answer <= 3 &&
        typeof item.prompt === "string" &&
        item.prompt.trim().length >= 30
      ) {
        valid.push({
          domain: item.domain,
          role: roles[0].name,
          type: item.type || "Conceptvraag",
          source: item.source || "Import",
          prompt: item.prompt,
          options: item.options,
          answer: item.answer,
        });
      } else {
        skipped++;
      }
    }
    if (valid.length > 0) {
      setDrafts((prev) => [...valid, ...prev]);
      setActiveIndex(0);
      recordAudit("JSON-vragen geïmporteerd", `${valid.length} toegevoegd, ${skipped} overgeslagen`);
    }
    notifications.show({
      message: `${valid.length} vraag/vragen toegevoegd, ${skipped} overgeslagen.`,
      color: valid.length > 0 ? "campaiNavy" : "red",
    });
    if (valid.length > 0) setImportJson("");
  }

  return (
    <>
      <ViewHead mode="recruitment" banner="senior-review verplicht" title="Vragenbank">
        Concepten landen in de vragenbank en gaan pas na menselijke review naar het assessment. Geen
        klantnamen, IP's of credentials richting kandidaten.
      </ViewHead>

      <Grid>
        {/* Nieuw concept + hub-bron */}
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Card withBorder padding="lg" radius="md" mb="lg">
            <Box mb="md">
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Nieuw
              </Text>
              <Title order={3} fz="lg" c="campaiNavy.7">
                Conceptvraag
              </Title>
            </Box>
            <Stack gap="sm">
              <Select label="Domein" data={domains} value={fDomain} onChange={(v) => v && setFDomain(v)} radius="md" allowDeselect={false} />
              <Select label="Rolfocus" data={roles.map((r) => r.name)} value={fRole} onChange={(v) => v && setFRole(v)} radius="md" allowDeselect={false} />
              <Select label="Vraagtype" data={questionTypes} value={fType} onChange={(v) => v && setFType(v)} radius="md" allowDeselect={false} />
              <TextInput
                label="Campai-bron"
                placeholder="Ticketthema, SOP, project, incident, vendor objective"
                value={fSource}
                onChange={(e) => setFSource(e.currentTarget.value)}
                radius="md"
              />
              <Textarea
                label="Conceptvraag"
                placeholder="Beschrijf de opdracht voor de kandidaat"
                rows={4}
                value={fPrompt}
                onChange={(e) => setFPrompt(e.currentTarget.value)}
                radius="md"
              />
              <Button color="campaiNavy" radius="md" leftSection={<IconPlus size={16} />} onClick={addDraft}>
                Conceptvraag toevoegen
              </Button>
            </Stack>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Box mb="md">
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Genereer of importeer
              </Text>
              <Title order={3} fz="lg" c="campaiNavy.7">
                Genereer of importeer vragen
              </Title>
            </Box>
            <Stack gap="sm">
              <Select
                label="Domein"
                data={domains}
                value={genDomain}
                onChange={(v) => v && setGenDomain(v)}
                radius="md"
                allowDeselect={false}
              />
              <NumberInput
                label="Aantal"
                value={genCount}
                onChange={(v) => setGenCount(typeof v === "number" ? v : 5)}
                min={1}
                max={10}
                radius="md"
              />
              <Button
                color="campaiNavy"
                radius="md"
                leftSection={<IconPlus size={16} />}
                onClick={handleGenerate}
                loading={genLoading}
              >
                Genereer
              </Button>
              <Textarea
                label="Plak JSON-vragen"
                placeholder='[{"domain":"...","type":"...","prompt":"...","options":["A","B","C","D"],"answer":0}]'
                rows={4}
                value={importJson}
                onChange={(e) => setImportJson(e.currentTarget.value)}
                radius="md"
              />
              <Button color="campaiNavy" radius="md" onClick={handleImport}>
                Importeer
              </Button>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Goedgekeurde bank */}
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card withBorder padding="lg" radius="md" mb="lg">
            <Box mb="md">
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Dekking per domein
              </Text>
              <Title order={3} fz="lg" c="campaiNavy.7">
                Seed + goedgekeurd
              </Title>
            </Box>
            <Stack gap="xs">
              {domains.map((domain) => {
                const cov = coverage[domain];
                const total = cov ? cov.total : approvedQuestions.filter((q) => q.domain === domain).length;
                const low = total < 5;
                return (
                  <Group key={domain} justify="space-between" align="center">
                    <Text size="sm">{domain}</Text>
                    <Badge color={low ? "red" : "campaiLime"} variant="filled" radius="sm">
                      {total}
                    </Badge>
                  </Group>
                );
              })}
            </Stack>
          </Card>

          {/* Gemarkeerde vragen (vanuit het Reviewdashboard) */}
          {flags.length > 0 && (
            <Card withBorder padding="lg" radius="md" mt="lg" style={{ borderColor: "var(--mantine-color-campaiRed-3)" }}>
              <Box mb="md">
                <Text size="xs" tt="uppercase" c="campaiRed.7" lts={0.5} fw={700}>
                  Aandacht
                </Text>
                <Title order={3} fz="lg" c="campaiNavy.7">
                  Gemarkeerde vragen ({flags.length})
                </Title>
                <Text size="xs" c="dimmed" mt={4}>
                  Door reviewers gemarkeerd als onjuist of twijfelachtig. Pas de vraag aan (of laat
                  Campai het aanpassen) en vink dan af.
                </Text>
              </Box>
              <Stack gap="sm">
                {flags.map((f) => (
                  <Card key={f.id} withBorder padding="sm" radius="md">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Box flex={1}>
                        <Badge variant="light" color="gray" radius="sm" size="sm" mb={4}>
                          {f.domain || "—"}
                        </Badge>
                        <Text size="sm" fw={600} c="campaiNavy.8">
                          {f.prompt}
                        </Text>
                        {f.note && (
                          <Text size="xs" c="campaiRed.7" mt={4}>
                            Opmerking: {f.note}
                          </Text>
                        )}
                        <Text size="10px" c="dimmed" mt={2}>
                          {f.flaggedBy || "onbekend"} ·{" "}
                          {new Date(f.flaggedAt).toLocaleDateString("nl-NL")}
                        </Text>
                      </Box>
                      <Button size="compact-xs" variant="light" color="campaiLime" onClick={() => markResolved(f.id)}>
                        Afgehandeld
                      </Button>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Card>
          )}
        </Grid.Col>

        {/* Vragenbank */}
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card withBorder padding="lg" radius="md">
            <Box mb="md">
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Vragenbank
              </Text>
              <Title order={3} fz="lg" c="campaiNavy.7">
                Concepten en reviewstatus
              </Title>
            </Box>
            <Stack gap="sm">
              {drafts.map((draft, index) => {
                const isActive = index === activeIndex;
                const options = draft.options || defaultDraftOptions();
                const answer = Number.isInteger(draft.answer) ? draft.answer! : 1;
                return (
                  <Card key={index} withBorder padding="md" radius="md" style={isActive ? { borderColor: "var(--mantine-color-campaiNavy-4)" } : undefined}>
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Box flex={1}>
                        <Badge variant="light" color="gray" radius="sm" size="sm" mb={6}>
                          {draft.domain} / {draft.role}
                          {draft.type ? ` / ${draft.type}` : ""}
                        </Badge>
                        <Anchor
                          component="button"
                          fw={600}
                          size="sm"
                          c="campaiNavy.7"
                          display="block"
                          ta="left"
                          onClick={() => setActiveIndex(index)}
                        >
                          {draft.prompt}
                        </Anchor>
                        <Text size="xs" c="dimmed" mt={2}>
                          {draft.source}
                        </Text>
                      </Box>
                      <Button
                        variant={isActive ? "light" : "subtle"}
                        color="campaiNavy"
                        size="xs"
                        rightSection={<IconChevronDown size={14} />}
                        onClick={() => setActiveIndex(isActive ? -1 : index)}
                      >
                        {isActive ? "Open" : "Openen"}
                      </Button>
                    </Group>

                    {isActive && (
                      <Stack gap="sm" mt="md">
                        <TextInput
                          label="Bron"
                          value={draft.source}
                          onChange={(e) => updateDraft(index, { source: e.currentTarget.value })}
                          radius="md"
                          size="sm"
                        />
                        <Textarea
                          label="Conceptvraag"
                          rows={4}
                          value={draft.prompt}
                          onChange={(e) => updateDraft(index, { prompt: e.currentTarget.value })}
                          radius="md"
                          size="sm"
                        />
                        {options.map((option, optionIndex) => (
                          <TextInput
                            key={optionIndex}
                            label={`Optie ${String.fromCharCode(65 + optionIndex)}`}
                            value={option}
                            onChange={(e) => {
                              const nextOptions = [...options];
                              nextOptions[optionIndex] = e.currentTarget.value;
                              updateDraft(index, { options: nextOptions });
                            }}
                            radius="md"
                            size="sm"
                          />
                        ))}
                        <Select
                          label="Correct antwoord"
                          data={options.map((_, i) => ({ value: String(i), label: String.fromCharCode(65 + i) }))}
                          value={String(answer)}
                          onChange={(v) => v && updateDraft(index, { answer: Number(v) })}
                          radius="md"
                          size="sm"
                          w={120}
                          allowDeselect={false}
                        />
                        <Group gap="sm">
                          <Button variant="default" size="xs" onClick={() => saveDraft(index)}>
                            Wijziging opslaan
                          </Button>
                          <Button color="campaiNavy" size="xs" onClick={() => promote(index)}>
                            Toevoegen aan assessment
                          </Button>
                        </Group>
                      </Stack>
                    )}
                  </Card>
                );
              })}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
}
