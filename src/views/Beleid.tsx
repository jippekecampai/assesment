import { Box, Card, Grid, List, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";

import { ViewHead } from "./_shared";

const assessmentRules = [
  "Kandidaten, rubrics, brondata en exports blijven binnen Campai recruitment.",
  "Reviewerrechten zijn gescheiden van vraagbeheer en assessmentbeheer.",
  "Rolthresholds worden versiebeheerd, goedgekeurd en vastgezet zodra een assessment start.",
  "Geen automatische afwijzing zonder menselijke review.",
];

const dataRules = [
  "Geen klantnamen, gebruikersnamen, domeinen, IP-adressen of credentials in kandidaatvragen.",
  "Originele ticketreferenties blijven afgeschermd.",
  "Broningestie loopt via app-based authenticatie waar mogelijk.",
  "Log elke gegenereerde vraag, reviewwijziging, score-overrule en rapportexport.",
];

function PolicyCard({ label, title, rules }: { label: string; title: string; rules: string[] }) {
  return (
    <Card withBorder padding="lg" radius="md" h="100%">
      <Box mb="md">
        <Text size="xs" tt="uppercase" c="dimmed" lts={0.5} fw={700}>
          {label}
        </Text>
        <Title order={3} fz="lg" c="campaiNavy.7">
          {title}
        </Title>
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
        {rules.map((rule) => (
          <List.Item key={rule}>{rule}</List.Item>
        ))}
      </List>
    </Card>
  );
}

export function Beleid() {
  return (
    <>
      <ViewHead mode="governance" banner="auditability" title="Beleid">
        De harde regels die scheiding van data, rechten en menselijke review borgen.
      </ViewHead>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PolicyCard label="Assessment" title="Assessmentbeleid" rules={assessmentRules} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PolicyCard label="Data" title="Dataregels" rules={dataRules} />
        </Grid.Col>
      </Grid>
    </>
  );
}
