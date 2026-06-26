import type { ReactNode } from "react";
import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";

type Mode = "recruitment" | "academy" | "governance";

const modeLabel: Record<Mode, string> = {
  recruitment: "Recruitment",
  academy: "Interne training",
  governance: "Governance",
};

const modeColor: Record<Mode, string> = {
  recruitment: "campaiNavy",
  academy: "campaiCyan",
  governance: "campaiLime",
};

export function ViewHead({
  mode,
  banner,
  title,
  children,
}: {
  mode: Mode;
  banner: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Stack gap="xs" mb="xl">
      <Badge color={modeColor[mode]} variant="light" radius="sm" w="fit-content">
        {modeLabel[mode]} · {banner}
      </Badge>
      <Title order={1} fz={28} c="campaiNavy.7">
        {title}
      </Title>
      {children && (
        <Text size="sm" c="dimmed" maw={760}>
          {children}
        </Text>
      )}
    </Stack>
  );
}

// Tijdelijke placeholder voor schermen die nog gemigreerd worden.
export function MigrationStub({ scherm }: { scherm: string }) {
  return (
    <Card withBorder padding="xl" radius="md">
      <Group gap="sm">
        <Badge color="yellow" variant="light" radius="sm">
          In migratie
        </Badge>
        <Text size="sm" c="dimmed">
          {scherm} wordt gemigreerd naar Mantine. De vanilla-versie staat veilig onder
          git-tag <Text span ff="monospace">stable-vanilla-20260626</Text>.
        </Text>
      </Group>
    </Card>
  );
}
