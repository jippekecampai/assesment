import { useEffect, useState } from "react";
import { Alert, Badge, Box, Button, Card, Grid, Group, List, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCircleCheck, IconInfoCircle, IconShieldCheck } from "@tabler/icons-react";

import { getPolicyAcks, ackPolicy } from "../lib/api";
import { ViewHead } from "./_shared";

// Beleidsonderdelen die de medewerker moet lezen & begrijpen (ISO 42001:
// AI-geletterdheid + beleidsbesef). Acknowledgement wordt per medewerker bewaard.
type Policy = { id: string; label: string; title: string; intro?: string; items: string[]; ack: boolean };

const POLICIES: Policy[] = [
  {
    id: "ai-geletterdheid",
    label: "AI-geletterdheid · ISO 42001",
    title: "Wat is AI (en wat niet)?",
    intro:
      "Iedereen die met AI werkt, moet snappen wat het wél en niet is. Dit is de basis die we van elke medewerker verwachten.",
    items: [
      "AI is software die patronen leert uit data en de meest waarschijnlijke output voorspelt — het 'begrijpt' niets en heeft geen oordeel.",
      "Generatieve AI (Copilot, ChatGPT) kan overtuigend klinken maar fouten maken ('hallucineren'). Controleer output altijd.",
      "AI ziet alleen wat jij deelt. Deel nooit klantdata, persoonsgegevens of credentials met externe AI-tools.",
      "Jij blijft eindverantwoordelijk voor wat je met AI oplevert — niet de tool.",
      "Gebruik AI om sneller en beter te werken, niet om kritisch nadenken te vervangen.",
    ],
    ack: true,
  },
  {
    id: "gouden-regels",
    label: "Gedragscode",
    title: "10 gouden regels voor verantwoord (AI-)gebruik",
    items: [
      "Deel geen klant-PII, wachtwoorden of vertrouwelijke data met externe AI-tools.",
      "Controleer AI-output altijd; vertrouw niet blind (hallucinaties).",
      "Gebruik alleen goedgekeurde tools en accounts (zie AI-beleid).",
      "Wees transparant: vermeld waar relevant dat output met AI tot stand kwam.",
      "Jij bent eindverantwoordelijk voor wat je oplevert.",
      "Vergrendel je toestel, deel geen accounts, meld incidenten direct.",
      "Respecteer privacy en AVG bij elke verwerking.",
      "Geen besluiten over mensen op basis van AI zonder menselijke review.",
      "Houd je kennis actueel — volg de trainingen in de Skills Academy.",
      "Bij twijfel: vraag het je teamlead of de security officer.",
    ],
    ack: true,
  },
  {
    id: "ai-beleid",
    label: "Beleid",
    title: "AI-beleid",
    intro:
      "Het volledige AI-beleid wordt hier toegevoegd. Kernpunten die elke medewerker moet kennen:",
    items: [
      "Welke AI-tools zijn toegestaan en voor welk soort data.",
      "Dataclassificatie: wat mag wel/niet in een AI-prompt.",
      "Goedkeurings- en toezichtsproces voor nieuwe AI-toepassingen (ISO 42001).",
      "Wat te doen bij een (vermoed) AI-incident.",
    ],
    ack: true,
  },
  {
    id: "personeelsbeleid",
    label: "Beleid",
    title: "Personeelsbeleid",
    intro: "De kern van het personeelsbeleid die iedereen gelezen moet hebben (volledige tekst volgt).",
    items: [
      "Omgangsvormen, integriteit en vertrouwelijkheid.",
      "Verzuim, verlof en bereikbaarheid.",
      "Gebruik van bedrijfsmiddelen en thuiswerken.",
      "Ontwikkeling: rolpad, reviews en de Skills Academy.",
    ],
    ack: true,
  },
];

const governance: { label: string; title: string; items: string[] }[] = [
  {
    label: "Assessment",
    title: "Assessmentbeleid",
    items: [
      "Kandidaten, rubrics, brondata en exports blijven binnen Campai recruitment.",
      "Reviewerrechten zijn gescheiden van vraagbeheer en assessmentbeheer.",
      "Rolthresholds worden versiebeheerd, goedgekeurd en vastgezet zodra een assessment start.",
      "Geen automatische afwijzing zonder menselijke review.",
    ],
  },
  {
    label: "Data",
    title: "Dataregels",
    items: [
      "Geen klantnamen, gebruikersnamen, domeinen, IP-adressen of credentials in kandidaatvragen.",
      "Originele ticketreferenties blijven afgeschermd.",
      "Broningestie loopt via app-based authenticatie waar mogelijk.",
      "Log elke gegenereerde vraag, reviewwijziging, score-overrule en rapportexport.",
    ],
  },
];

export function Beleid() {
  const [acks, setAcks] = useState<Record<string, string>>({});
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    getPolicyAcks()
      .then((p) => { setAcks(p.acks || {}); setAuthed(true); })
      .catch(() => setAuthed(false));
  }, []);

  async function acknowledge(id: string) {
    try {
      const p = await ackPolicy(id);
      setAcks(p.acks || {});
      notifications.show({ message: "Bevestigd: gelezen & begrepen.", color: "campaiLime" });
    } catch {
      notifications.show({ message: "Bevestigen lukt alleen als je via SSO bent ingelogd.", color: "red" });
    }
  }

  const total = POLICIES.length;
  const done = POLICIES.filter((p) => acks[p.id]).length;

  return (
    <>
      <ViewHead mode="governance" banner="ISO 42001 · AI-geletterdheid & beleid" title="Beleid">
        AI-geletterdheid en beleid die iedere medewerker moet kennen — met bevestiging "gelezen &
        begrepen" als bewijs. Daarnaast de harde governance-regels van het assessment.
      </ViewHead>

      <Stack gap="xl">
        {authed && (
          <Alert variant="light" color={done === total ? "campaiLime" : "campaiCyan"} icon={<IconShieldCheck size={16} />} radius="md">
            Jouw beleidsbevestigingen: <strong>{done}/{total}</strong> afgerond.
            {done < total ? " Lees de openstaande onderdelen en bevestig onderaan elk blok." : " Alles bevestigd — dank je wel."}
          </Alert>
        )}
        {!authed && (
          <Alert variant="light" color="gray" icon={<IconInfoCircle size={16} />} radius="md">
            Log in via SSO (live omgeving) om je beleidsbevestigingen vast te leggen. Je kunt de
            inhoud nu wel lezen.
          </Alert>
        )}

        <Grid>
          {POLICIES.map((p) => {
            const ackedAt = acks[p.id];
            return (
              <Grid.Col key={p.id} span={{ base: 12, md: 6 }}>
                <Card withBorder padding="lg" radius="md" h="100%">
                  <Box mb="md">
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                        {p.label}
                      </Text>
                      {ackedAt && (
                        <Badge variant="light" color="campaiLime" radius="sm" size="sm">
                          Bevestigd
                        </Badge>
                      )}
                    </Group>
                    <Title order={3} fz="lg" c="campaiNavy.7">
                      {p.title}
                    </Title>
                    {p.intro && (
                      <Text size="sm" c="dimmed" mt={4}>
                        {p.intro}
                      </Text>
                    )}
                  </Box>
                  <List
                    spacing="sm"
                    size="sm"
                    icon={
                      <ThemeIcon color="campaiLime" variant="light" size={22} radius="xl">
                        <IconCircleCheck size={14} />
                      </ThemeIcon>
                    }
                  >
                    {p.items.map((item) => (
                      <List.Item key={item}>{item}</List.Item>
                    ))}
                  </List>
                  {p.ack && (
                    <Group mt="md" justify="space-between">
                      {ackedAt ? (
                        <Text size="xs" c="dimmed">
                          Gelezen &amp; begrepen op {new Date(ackedAt).toLocaleDateString("nl-NL")}
                        </Text>
                      ) : (
                        <Button
                          size="xs"
                          radius="md"
                          color="campaiNavy"
                          variant="light"
                          disabled={!authed}
                          onClick={() => acknowledge(p.id)}
                        >
                          Gelezen &amp; begrepen
                        </Button>
                      )}
                    </Group>
                  )}
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>

        <Box>
          <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700} mb="sm">
            Governance (intern)
          </Text>
          <Grid>
            {governance.map((g) => (
              <Grid.Col key={g.title} span={{ base: 12, md: 6 }}>
                <Card withBorder padding="lg" radius="md" h="100%">
                  <Box mb="md">
                    <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
                      {g.label}
                    </Text>
                    <Title order={3} fz="lg" c="campaiNavy.7">
                      {g.title}
                    </Title>
                  </Box>
                  <List
                    spacing="sm"
                    size="sm"
                    icon={
                      <ThemeIcon color="campaiCyan" variant="light" size={22} radius="xl">
                        <IconCircleCheck size={14} />
                      </ThemeIcon>
                    }
                  >
                    {g.items.map((item) => (
                      <List.Item key={item}>{item}</List.Item>
                    ))}
                  </List>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Box>
      </Stack>
    </>
  );
}
