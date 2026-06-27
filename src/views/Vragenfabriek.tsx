import { useEffect, useState } from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconChevronDown, IconCloudDownload, IconPlus } from "@tabler/icons-react";

import { domains, draftQuestions as seedDrafts, roles, type DraftQuestion } from "../lib/data";
import { recordAudit } from "../lib/learning";
import { addQuestion, listQuestions, type ApprovedQuestion } from "../lib/api";
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

  async function refreshApproved() {
    try {
      const qs = await listQuestions();
      setApprovedQuestions(qs);
    } catch {
      // silently ignore — server may not be running in dev
    }
  }

  useEffect(() => {
    refreshApproved();
  }, []);

  // Nieuw-concept formulier
  const [fDomain, setFDomain] = useState(domains[0]);
  const [fRole, setFRole] = useState(roles[0].name);
  const [fType, setFType] = useState(questionTypes[0]);
  const [fSource, setFSource] = useState("");
  const [fPrompt, setFPrompt] = useState("");

  // Hub-bron
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [hubHint, setHubHint] = useState("Haalt geanonimiseerde casuïstiek op voor senior-review.");

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      notifications.show({ message: `Opslaan mislukt: ${msg}`, color: "red" });
    }
  }

  async function loadCompanies() {
    try {
      const res = await fetch("/api/hub/companies");
      if (res.status === 503) {
        setHubHint("Hub niet geconfigureerd (HUB_BASE_URL/HUB_APP_TOKEN ontbreekt).");
        return;
      }
      if (!res.ok) {
        setHubHint("Kon klanten niet laden.");
        return;
      }
      const data = (await res.json()) as Array<{ id: string; name: string }>;
      setCompanies(data);
      setHubHint(`${data.length} klant(en) geladen.`);
    } catch {
      setHubHint("Kon klanten niet laden.");
    }
  }

  async function loadSourceMaterial() {
    if (!companyId) {
      setHubHint("Kies eerst een klant.");
      return;
    }
    setHubHint("Bezig met ophalen…");
    try {
      const res = await fetch(`/api/hub/source-material?companyId=${encodeURIComponent(companyId)}`);
      if (res.status === 503) {
        setHubHint("Hub niet geconfigureerd.");
        return;
      }
      if (!res.ok) {
        setHubHint("Ophalen mislukt.");
        return;
      }
      const { items } = (await res.json()) as { items: Draft[] };
      if (!items?.length) {
        setHubHint("Geen bronmateriaal gevonden.");
        return;
      }
      const newDrafts = items.map((item) => ({
        ...item,
        type: "Scenario",
        options: defaultDraftOptions(),
        answer: 1,
      }));
      setDrafts((prev) => [...newDrafts.reverse(), ...prev]);
      setActiveIndex(0);
      recordAudit("Hub-bronmateriaal opgehaald", `${items.length} concepten / klant ${companyId}`);
      setHubHint(`${items.length} conceptvraag(en) toegevoegd voor review.`);
      notifications.show({ message: "Hub-bronmateriaal toegevoegd aan de Vragenbank.", color: "campaiNavy" });
    } catch {
      setHubHint("Ophalen mislukt.");
    }
  }

  return (
    <>
      <ViewHead mode="recruitment" banner="senior-review verplicht" title="Vragenfabriek">
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
            <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700} mb="sm">
              Hub-bronmateriaal
            </Text>
            <Stack gap="sm">
              <Select
                label="Klant"
                placeholder="— kies klant —"
                data={companies.map((c) => ({ value: c.id, label: c.name }))}
                value={companyId}
                onChange={setCompanyId}
                radius="md"
                searchable
              />
              <Group gap="sm">
                <Button variant="default" radius="md" size="sm" onClick={loadCompanies}>
                  Klanten laden
                </Button>
                <Button color="campaiNavy" radius="md" size="sm" leftSection={<IconCloudDownload size={16} />} onClick={loadSourceMaterial}>
                  Bronmateriaal uit hub
                </Button>
              </Group>
              <Text size="xs" c="dimmed">
                {hubHint}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Goedgekeurde bank */}
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card withBorder padding="lg" radius="md" mb="lg">
            <Box mb="md">
              <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                Goedgekeurde bank
              </Text>
              <Title order={3} fz="lg" c="campaiNavy.7">
                Aantal per domein
              </Title>
            </Box>
            <Stack gap="xs">
              {domains.map((domain) => {
                const count = approvedQuestions.filter((q) => q.domain === domain).length;
                const low = count < 5;
                return (
                  <Group key={domain} justify="space-between" align="center">
                    <Text size="sm">{domain}</Text>
                    <Badge color={low ? "red" : "campaiLime"} variant="filled" radius="sm">
                      {count}
                    </Badge>
                  </Group>
                );
              })}
            </Stack>
          </Card>
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
