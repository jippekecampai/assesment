import { useState } from "react";
import {
  AppShell,
  Box,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconBook2,
  IconBriefcase,
  IconClipboardList,
  IconDownload,
  IconFileText,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconUserCircle,
  IconUserPlus,
  type Icon,
} from "@tabler/icons-react";

import { Reviewdashboard } from "./views/Reviewdashboard";
import { Vragenfabriek } from "./views/Vragenfabriek";
import { SkillsAcademy } from "./views/SkillsAcademy";
import { MedewerkerOverview } from "./views/MedewerkerOverview";
import { Beleid } from "./views/Beleid";
import { Beheer } from "./views/Beheer";
import { Sollicitanten } from "./views/Sollicitanten";
import campaiLogo from "./assets/campai-logo.svg";

export type ViewId =
  | "employeeOverview"
  | "academy"
  | "sollicitanten"
  | "candidateReviews"
  | "questions"
  | "governance"
  | "admin";

interface NavEntry {
  id: ViewId;
  label: string;
  icon: Icon;
  group: string;
}

const navEntries: NavEntry[] = [
  { id: "employeeOverview", label: "Mijn overview", icon: IconUserCircle, group: "Medewerker" },
  { id: "academy", label: "Skills Academy", icon: IconBook2, group: "Medewerker" },
  { id: "sollicitanten", label: "Sollicitanten", icon: IconUserPlus, group: "Recruitment" },
  { id: "candidateReviews", label: "Kandidaat reviews", icon: IconClipboardList, group: "Recruitment" },
  { id: "questions", label: "Vragenbank", icon: IconFileText, group: "Recruitment" },
  { id: "governance", label: "Beleid", icon: IconShieldCheck, group: "Governance" },
  { id: "admin", label: "Beheer", icon: IconSettings, group: "Governance" },
];

const viewTitles: Record<ViewId, string> = {
  employeeOverview: "Mijn overview",
  academy: "Skills Academy",
  sollicitanten: "Sollicitanten",
  candidateReviews: "Kandidaat reviews",
  questions: "Vragenbank",
  governance: "Beleid",
  admin: "Beheer",
};

const groupOrder = ["Medewerker", "Recruitment", "Governance"];

export function App() {
  const [view, setView] = useState<ViewId>("employeeOverview");
  const [search, setSearch] = useState("");

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
            <Box component="img" src={campaiLogo} alt="Campai" h={46} style={{ display: "block" }} />
          </Group>
          <TextInput
            placeholder="Zoeken op domein, module of kandidaat"
            leftSection={<IconSearch size={16} />}
            radius="md"
            size="sm"
            w={380}
            visibleFrom="md"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <Button variant="default" leftSection={<IconDownload size={16} />} radius="md" size="sm">
            Rapport exporteren
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <ScrollArea h="100%">
          <Stack gap="lg" px={4} py="xs">
            {groupOrder.map((group) => (
              <Stack key={group} gap={2}>
                <Group gap={6} px="sm" mb={2}>
                  {group === "Medewerker" && <IconBriefcase size={13} stroke={1.7} />}
                  <Text size="10px" tt="uppercase" fw={700} c="dimmed" lts={1}>
                    {group}
                  </Text>
                </Group>
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
          {view === "employeeOverview" && <MedewerkerOverview onOpenAcademy={() => setView("academy")} />}
          {view === "academy" && <SkillsAcademy />}
          {view === "sollicitanten" && <Sollicitanten />}
          {view === "candidateReviews" && <Reviewdashboard search={search} />}
          {view === "questions" && <Vragenfabriek />}
          {view === "governance" && <Beleid />}
          {view === "admin" && <Beheer />}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

export { viewTitles };
