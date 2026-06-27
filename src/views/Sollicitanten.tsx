import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CopyButton,
  Grid,
  Group,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { listCandidates, createCandidate, type Candidate } from "../lib/api";
import { roles } from "../lib/data";
import { ViewHead } from "./_shared";

const statusColor: Record<string, string> = {
  uitgenodigd: "gray",
  bezig: "campaiCyan",
  afgerond: "campaiLime",
};

const statusLabel: Record<string, string> = {
  uitgenodigd: "Uitgenodigd",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

function roleName(functieId: string): string {
  return roles.find((r) => r.id === functieId)?.name ?? functieId;
}

export function Sollicitanten() {
  const [list, setList] = useState<Candidate[]>([]);
  const [naam, setNaam] = useState("");
  const [functie, setFunctie] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => listCandidates().then(setList).catch(() => {});

  useEffect(() => {
    refresh();
  }, []);

  async function add() {
    if (!naam || !functie) return;
    setLoading(true);
    try {
      const result = await createCandidate({ naam, email: email || undefined, functie });
      setCode(result.code);
      setNaam("");
      setEmail("");
      notifications.show({ message: "Sollicitant aangemaakt.", color: "campaiNavy" });
      refresh();
    } catch {
      notifications.show({ message: "Aanmaken mislukt.", color: "red" });
    } finally {
      setLoading(false);
    }
  }

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  const rows = list.map((c) => (
    <Table.Tr key={c.id}>
      <Table.Td>{c.naam}</Table.Td>
      <Table.Td>{roleName(c.functie)}</Table.Td>
      <Table.Td>
        <Badge color={statusColor[c.status] ?? "gray"} variant="light" radius="sm">
          {statusLabel[c.status] ?? c.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        {new Date(c.aangemaaktOp).toLocaleDateString("nl-NL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="lg">
      <ViewHead mode="recruitment" banner="Kandidaatbeheer" title="Sollicitanten">
        Maak een sollicitant aan en stuur hem of haar de persoonlijke testcode. De kandidaat start de
        assessment via die code.
      </ViewHead>

      <Grid>
        {/* Formulier */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md" padding="lg">
            <Stack gap="sm">
              <Title order={3} fz={16} c="campaiNavy.7">
                Nieuwe sollicitant aanmaken
              </Title>

              <TextInput
                label="Naam"
                placeholder="Voor- en achternaam"
                value={naam}
                onChange={(e) => setNaam(e.currentTarget.value)}
                required
              />
              <Select
                label="Functie"
                placeholder="Kies een rol"
                data={roleOptions}
                value={functie}
                onChange={setFunctie}
                required
              />
              <TextInput
                label="E-mailadres (optioneel)"
                placeholder="sollicitant@voorbeeld.nl"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />

              <Button
                color="campaiNavy"
                radius="md"
                onClick={add}
                disabled={!naam || !functie}
                loading={loading}
                mt="xs"
              >
                Sollicitant aanmaken
              </Button>
            </Stack>

            {/* Code weergave na aanmaken */}
            {code && (
              <Box
                mt="lg"
                p="md"
                style={{
                  background: "var(--mantine-color-campaiNavy-0, #e6f0f7)",
                  borderRadius: "var(--mantine-radius-md)",
                  border: "1px solid var(--mantine-color-campaiNavy-2, #b3cce0)",
                }}
              >
                <Text size="sm" fw={600} c="campaiNavy.7" mb={4}>
                  Testcode voor de kandidaat
                </Text>
                <Group gap="sm" align="center">
                  <Text
                    ff="monospace"
                    fz={22}
                    fw={800}
                    c="campaiNavy.8"
                    style={{ letterSpacing: 2 }}
                  >
                    {code}
                  </Text>
                  <CopyButton value={code} timeout={2000}>
                    {({ copied, copy }) => (
                      <Button
                        size="xs"
                        radius="md"
                        color={copied ? "campaiLime" : "campaiNavy"}
                        variant={copied ? "filled" : "light"}
                        leftSection={
                          copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                        }
                        onClick={copy}
                      >
                        {copied ? "Gekopieerd!" : "Kopieer"}
                      </Button>
                    )}
                  </CopyButton>
                </Group>
                <Text size="xs" c="dimmed" mt={6}>
                  Stuur deze code naar de sollicitant. Hij of zij kan er direct de test mee starten.
                </Text>
              </Box>
            )}
          </Card>
        </Grid.Col>

        {/* Lijst */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder radius="md" padding="lg">
            <Title order={3} fz={16} c="campaiNavy.7" mb="md">
              Sollicitanten ({list.length})
            </Title>

            {list.length === 0 ? (
              <Text size="sm" c="dimmed">
                Nog geen sollicitanten aangemaakt.
              </Text>
            ) : (
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Naam</Table.Th>
                    <Table.Th>Functie</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Aangemaakt</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
