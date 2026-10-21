import { useState } from "react";
import { AppShell, Box, Burger, Divider, Group, NavLink, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconClipboardList,
  IconFileText,
  IconHeadset,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconTrendingUp,
  IconUserPlus,
  type Icon,
} from "@tabler/icons-react";

import { Reviewdashboard } from "./views/Reviewdashboard";
import { Vragenfabriek } from "./views/Vragenfabriek";
import { Performanceloop } from "./views/Performanceloop";
import { Sollicitanten } from "./views/Sollicitanten";
import { Oefenen } from "./views/Oefenen";
import { MijnVoortgang } from "./views/MijnVoortgang";
import { Instellingen } from "./views/Instellingen";
import campaiLogo from "./assets/campai-logo.svg";

// Twee werkplekken: Recruitment (sollicitanten beoordelen) en Training (zelf oefenen). Beheer staat los onderaan.
export type ViewId = "sollicitanten" | "candidateReviews" | "questions" | "oefenen" | "voortgang" | "performance" | "beheer";

interface NavEntry {
  id: ViewId;
  label: string;
  icon: Icon;
  group: string;
}

const navEntries: NavEntry[] = [
  { id: "sollicitanten", label: "Sollicitanten", icon: IconUserPlus, group: "Recruitment" },
  { id: "candidateReviews", label: "Beoordelen", icon: IconClipboardList, group: "Recruitment" },
  { id: "questions", label: "Vragenbank", icon: IconFileText, group: "Recruitment" },
  { id: "oefenen", label: "Oefenen", icon: IconHeadset, group: "Training" },
  { id: "voortgang", label: "Mijn voortgang", icon: IconTrendingUp, group: "Training" },
  { id: "performance", label: "Performance loop", icon: IconTargetArrow, group: "Management" },
];

const groupOrder = ["Recruitment", "Training", "Management"];

// Zoeken staat alleen boven de schermen die er iets mee doen.
const zoekPlaceholder: Partial<Record<ViewId, string>> = {
  candidateReviews: "Zoek een kandidaat of functie",
  questions: "Zoek in de vragen",
};

export function App() {
  const [view, setView] = useState<ViewId>("sollicitanten");
  const [search, setSearch] = useState("");
  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] = useDisclosure(false);

  const openView = (next: ViewId) => {
    setView(next);
    setSearch("");
    closeMobileNav();
  };
  const placeholder = zoekPlaceholder[view];

  const navLink = (entry: { id: ViewId; label: string; icon: Icon }) => (
    <NavLink
      key={entry.id}
      active={view === entry.id}
      label={entry.label}
      leftSection={<entry.icon size={18} stroke={1.6} />}
      color="campaiNavy"
      variant="filled"
      styles={{ root: { borderRadius: 10 } }}
      onClick={() => openView(entry.id)}
    />
  );

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: !mobileNavOpened } }}
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
            <Burger opened={mobileNavOpened} onClick={toggleMobileNav} hiddenFrom="sm" size="sm" aria-label="Menu openen" />
            <Box component="img" src={campaiLogo} alt="Campai" h={64} style={{ display: "block" }} />
          </Group>
          {placeholder && (
            <TextInput
              placeholder={placeholder}
              leftSection={<IconSearch size={16} />}
              radius="md"
              size="sm"
              w={340}
              visibleFrom="md"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea}>
          <Stack gap="lg" px={4} py="xs">
            {groupOrder.map((group) => (
              <Stack key={group} gap={2}>
                <Text size="10px" tt="uppercase" fw={700} c="dimmed" lts={1} px="sm" mb={2}>
                  {group}
                </Text>
                {navEntries.filter((entry) => entry.group === group).map(navLink)}
              </Stack>
            ))}
          </Stack>
        </AppShell.Section>
        <AppShell.Section>
          <Divider my="xs" />
          <Box px={4} pb="xs">{navLink({ id: "beheer", label: "Beheer", icon: IconSettings })}</Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box key={view}>
          {view === "sollicitanten" && <Sollicitanten />}
          {view === "candidateReviews" && <Reviewdashboard search={search} />}
          {view === "questions" && <Vragenfabriek search={search} />}
          {view === "oefenen" && <Oefenen />}
          {view === "voortgang" && <MijnVoortgang />}
          {view === "performance" && <Performanceloop />}
          {view === "beheer" && <Instellingen />}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
