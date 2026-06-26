import { useState } from "react";
import {
  AppShell,
  Badge,
  Box,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconClipboardCheck,
  IconDashboard,
  IconDownload,
  IconFileText,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";

import { Reviewdashboard } from "./views/Reviewdashboard";
import { Kandidaattest } from "./views/Kandidaattest";
import { Vragenfabriek } from "./views/Vragenfabriek";
import { SkillsAcademy } from "./views/SkillsAcademy";
import { Beleid } from "./views/Beleid";
import { Beheer } from "./views/Beheer";

export type ViewId = "overview" | "test" | "questions" | "academy" | "governance" | "admin";

interface NavEntry {
  id: ViewId;
  label: string;
  icon: Icon;
  group: string;
}

const navEntries: NavEntry[] = [
  { id: "overview", label: "Reviewdashboard", icon: IconDashboard, group: "Dashboard" },
  { id: "test", label: "Kandidaattest", icon: IconClipboardCheck, group: "Recruitment" },
  { id: "questions", label: "Vragenfabriek", icon: IconFileText, group: "Recruitment" },
  { id: "academy", label: "Skills Academy", icon: IconUsers, group: "Ontwikkeling" },
  { id: "governance", label: "Beleid", icon: IconShieldCheck, group: "Governance" },
  { id: "admin", label: "Beheer", icon: IconSettings, group: "Governance" },
];

const viewTitles: Record<ViewId, string> = {
  overview: "Reviewdashboard",
  test: "Kandidaattest",
  questions: "Vragenfabriek",
  academy: "Skills Academy",
  governance: "Beleid",
  admin: "Beheer",
};

const groupOrder = ["Dashboard", "Recruitment", "Ontwikkeling", "Governance"];

export function App() {
  const [view, setView] = useState<ViewId>("overview");
  const [search, setSearch] = useState("");
  // Gedeelde learner-selectie: het dashboard kan naar de Academy springen.
  const [learnerId, setLearnerId] = useState<string>("LV");

  const openLearner = (id: string) => {
    setLearnerId(id);
    setView("academy");
  };

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 280, breakpoint: "sm" }}
      padding="lg"
      styles={{
        main: { background: "var(--mantine-color-gray-0)" },
        navbar: { background: "white", borderRight: "1px solid var(--mantine-color-gray-2)" },
        header: { background: "white", borderBottom: "1px solid var(--mantine-color-gray-2)" },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap" gap="md">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon variant="filled" color="campaiNavy" radius="md" size={32}>
              <Text fw={800} ff="heading" size="sm" c="white">
                C
              </Text>
            </ThemeIcon>
            <Stack gap={0}>
              <Text fw={800} ff="heading" size="sm" c="campaiNavy.6">
                Campai
              </Text>
              <Text size="10px" tt="uppercase" c="dimmed" lts={1}>
                Assessment &amp; Skills Academy
              </Text>
            </Stack>
          </Group>
          <TextInput
            placeholder="Zoeken op domein — bv. Azure, Fortigate, Engels"
            leftSection={<IconSearch size={16} />}
            radius="md"
            size="sm"
            w={380}
            visibleFrom="md"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <Button
            variant="default"
            leftSection={<IconDownload size={16} />}
            radius="md"
            size="sm"
          >
            Rapport exporteren
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <ScrollArea h="100%">
          <Stack gap="lg" px={4} py="xs">
            {groupOrder.map((group) => (
              <Stack key={group} gap={2}>
                <Text size="10px" tt="uppercase" fw={700} c="dimmed" lts={1} px="sm" mb={2}>
                  {group}
                </Text>
                {navEntries
                  .filter((entry) => entry.group === group)
                  .map((entry) => (
                    <NavLink
                      key={entry.id}
                      active={view === entry.id}
                      label={entry.label}
                      leftSection={<entry.icon size={18} stroke={1.6} />}
                      color="campaiNavy"
                      variant="filled"
                      styles={{ root: { borderRadius: 10 } }}
                      onClick={() => setView(entry.id)}
                    />
                  ))}
              </Stack>
            ))}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box key={view}>
          {view === "overview" && <Reviewdashboard search={search} onOpenLearner={openLearner} />}
          {view === "test" && <Kandidaattest />}
          {view === "questions" && <Vragenfabriek />}
          {view === "academy" && <SkillsAcademy learnerId={learnerId} setLearnerId={setLearnerId} />}
          {view === "governance" && <Beleid />}
          {view === "admin" && <Beheer />}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

export { viewTitles };
