// src/views/Oefentoetsen.tsx
// Training → Oefenen → Toetsen: drie duidelijke blokken. Examens (voor een rol, met uitslag voor de beoordelaar),
// Verplicht (AI-geletterdheid, ISO 42001) en Oefenen per onderwerp. Elke kaart toont wat het is en hoe ver je bent.
import { useEffect, useState, type ComponentType } from "react";
import { Badge, Box, Card, Group, Loader, Progress, SimpleGrid, Stack, Text, ThemeIcon, Title, UnstyledButton } from "@mantine/core";
import {
  IconAdjustmentsHorizontal, IconArrowsExchange, IconCertificate, IconCloud, IconDeviceDesktopAnalytics, IconLanguage,
  IconMessages, IconPhone, IconServer, IconShare, IconShieldLock, IconSparkles, IconTool, IconWall, IconChevronRight,
} from "@tabler/icons-react";
import { getOefenSet, listExamens, listOefenSets, type ExamenMeta, type ExamenPoging, type OefenSet, type OefenSetMeta } from "../lib/api";
import { OefenToets } from "../toets/OefenToets";
import { Examen } from "../toets/Examen";

type Icoon = ComponentType<{ size?: number; stroke?: number }>;
const ICOON: Record<string, Icoon> = {
  "Microsoft 365": IconShieldLock, Azure: IconCloud, "Kaseya Stack": IconDeviceDesktopAnalytics, Fortigate: IconWall,
  "AI / Copilot": IconSparkles, VoIP: IconPhone, Servers: IconServer, "SharePoint / Teams": IconShare,
  "SharePoint / Azure Migrations": IconArrowsExchange, Inforcer: IconAdjustmentsHorizontal, "Basic IT & Troubleshooting": IconTool,
  "Werkhouding & Communicatie": IconMessages, Engels: IconLanguage,
};

// Voortgang van een oefenset uit deze browser (OefenToets bewaart die per set).
function voortgang(id: string): { beantwoord: number } | null {
  try {
    const s = JSON.parse(localStorage.getItem(`oefen.${id}`) || "null");
    if (!s || !s.antwoorden) return null;
    return { beantwoord: Object.keys(s.antwoorden).length };
  } catch { return null; }
}

function Blok({ titel, uitleg, children }: { titel: string; uitleg: string; children: React.ReactNode }) {
  return (
    <Stack gap="sm">
      <Box>
        <Title order={2} fz={18} c="campaiNavy.8">{titel}</Title>
        <Text size="sm" c="dimmed">{uitleg}</Text>
      </Box>
      {children}
    </Stack>
  );
}

function Kaart({ icoon: I, kleur, titel, sub, rechts, onder, onOpen, laden }: {
  icoon: Icoon; kleur: string; titel: string; sub: string; rechts?: React.ReactNode; onder?: React.ReactNode; onOpen: () => void; laden?: boolean;
}) {
  return (
    <UnstyledButton onClick={onOpen} className="toets-kaart" aria-label={`${titel} openen`}>
      <Group gap="md" wrap="nowrap" align="flex-start">
        <ThemeIcon size={44} radius="md" variant="light" color={kleur}><I size={24} stroke={1.7} /></ThemeIcon>
        <Box flex={1} miw={0}>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text fw={700} c="campaiNavy.8" truncate>{titel}</Text>
            {laden ? <Loader size="xs" /> : rechts}
          </Group>
          <Text size="sm" c="dimmed" lineClamp={2}>{sub}</Text>
          {onder}
        </Box>
        <IconChevronRight size={18} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0, marginTop: 12 }} />
      </Group>
    </UnstyledButton>
  );
}

export function Oefentoetsen() {
  const [sets, setSets] = useState<OefenSetMeta[] | null>(null);
  const [examens, setExamens] = useState<{ examens: ExamenMeta[]; mijnPogingen: ExamenPoging[] } | null>(null);
  const [open, setOpen] = useState<{ soort: "set"; set: OefenSet } | { soort: "examen"; meta: ExamenMeta } | null>(null);
  const [laden, setLaden] = useState<string | null>(null);

  const laadAlles = () => {
    listOefenSets().then(setSets).catch(() => setSets([]));
    listExamens().then(setExamens).catch(() => setExamens({ examens: [], mijnPogingen: [] }));
  };
  useEffect(laadAlles, []);

  async function openSet(id: string) {
    setLaden(id);
    try { setOpen({ soort: "set", set: await getOefenSet(id) }); } finally { setLaden(null); }
  }
  const sluit = () => { setOpen(null); laadAlles(); window.scrollTo({ top: 0 }); };

  if (open?.soort === "set") return <OefenToets set={open.set} onTerug={sluit} />;
  if (open?.soort === "examen") return <Examen meta={open.meta} onTerug={sluit} />;
  if (!sets || !examens) return <Loader size="sm" />;

  const verplicht = sets.filter((s) => s.soort === "vast");
  const domein = sets.filter((s) => s.soort === "domein");
  const laatste = (id: string) => examens.mijnPogingen.find((p) => p.examenId === id);

  return (
    <Stack gap={36}>
      {examens.examens.length > 0 && (
        <Blok titel="Examens" uitleg="Toon aan dat je klaar bent voor een rol. Je slaagt met hooguit één vraag fout; uitleg vragen mag.">
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {examens.examens.map((e) => {
              const p = laatste(e.id);
              return (
                <Kaart key={e.id} icoon={IconCertificate} kleur="campaiNavy" titel={e.titel} sub={e.omschrijving}
                  rechts={<Badge variant="light" color="gray" radius="sm">{e.aantal} vragen</Badge>}
                  onder={p ? (
                    <Badge mt="xs" variant="light" color={p.geslaagd ? "green" : "campaiRed"} radius="sm">
                      {p.geslaagd ? "Geslaagd" : `Niet geslaagd · ${p.fout} fout`} · {new Date(p.ingeleverd).toLocaleDateString("nl-NL")}
                    </Badge>
                  ) : <Text size="xs" c="campaiCyan.8" fw={600} mt="xs">Nog niet gemaakt</Text>}
                  onOpen={() => setOpen({ soort: "examen", meta: e })} />
              );
            })}
          </SimpleGrid>
        </Blok>
      )}

      {verplicht.length > 0 && (
        <Blok titel="Verplicht" uitleg="Voor iedereen bij Campai. Telt als bewijs voor ISO 42001.">
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {verplicht.map((s) => (
              <Kaart key={s.id} icoon={IconSparkles} kleur="campaiLime" titel={s.titel} sub={s.omschrijving} laden={laden === s.id}
                rechts={<Badge variant="light" color="gray" radius="sm">{s.aantal} vragen</Badge>}
                onOpen={() => openSet(s.id)} />
            ))}
          </SimpleGrid>
        </Blok>
      )}

      <Blok titel="Oefenen per onderwerp" uitleg="Oefen zo vaak je wilt. Je ziet direct of je antwoord klopt, met uitleg en een illustratie.">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {domein.map((s) => {
            const v = voortgang(s.id);
            return (
              <Kaart key={s.id} icoon={ICOON[s.titel] || IconTool} kleur="campaiCyan" titel={s.titel} laden={laden === s.id}
                sub={`${s.aantal} vragen`}
                onder={v ? <Progress mt={8} size="sm" radius="xl" color="campaiCyan" value={(v.beantwoord / s.aantal) * 100} aria-label={`${v.beantwoord} van ${s.aantal} beantwoord`} /> : null}
                onOpen={() => openSet(s.id)} />
            );
          })}
        </SimpleGrid>
      </Blok>
    </Stack>
  );
}
