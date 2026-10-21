// src/kiosk/ToezichtIntro.tsx
// Spelregels vóór de start. Volledig scherm vraagt de browser alleen na een klik, dus dat gebeurt hier.
import { useState } from "react";
import { Button, Card, Center, List, Stack, Text, Title } from "@mantine/core";
import { kanVolledigScherm, vraagVolledigScherm } from "./useToezicht";

export function ToezichtIntro({ naam, uitlegAan, onStart }: { naam: string; uitlegAan: boolean; onStart: () => void }) {
  const [busy, setBusy] = useState(false);
  const fs = kanVolledigScherm();

  async function start() {
    setBusy(true);
    await vraagVolledigScherm();
    onStart();
  }

  return (
    <Center mih="100vh" bg="campaiNavy.0" p="md">
      <Card withBorder radius="md" p="xl" w={560} maw="100%">
        <Stack gap="md">
          <Title order={2} fz="xl" c="campaiNavy.7">Welkom {naam}, voordat je begint</Title>
          <List spacing="xs" size="sm">
            <List.Item>
              De test draait in <b>volledig scherm</b>. Ga je naar een ander venster of tabblad, of uit volledig
              scherm, dan wordt dat vastgelegd en zie je een melding.
            </List.Item>
            {uitlegAan && (
              <List.Item>
                Je mag bij een vraag om <b>uitleg</b> vragen. Je krijgt dan uitleg over de begrippen, maar nooit het
                antwoord.
              </List.Item>
            )}
            <List.Item>
              <b>Plakken</b> werkt niet en de vragen zijn niet te kopiëren. Typ je vraag om uitleg zelf.
            </List.Item>
            <List.Item>
              Gebruik geen andere hulpmiddelen. Wat je laat zien, is wat je zelf weet; daar gaat het om in het gesprek
              daarna.
            </List.Item>
          </List>
          <Text size="xs" c="dimmed">
            Wat wordt vastgelegd: wanneer en hoe lang je weg was, plakpogingen en hoe vaak je om uitleg vroeg. Dit telt
            niet mee in je score. Alleen de beoordelaars bij Campai zien het.
          </Text>
          {!fs && (
            <Text size="xs" c="campaiRed.7">
              Volledig scherm werkt niet op dit apparaat. Weggaan wordt wel vastgelegd.
            </Text>
          )}
          <Button size="md" color="campaiNavy" loading={busy} onClick={start}>
            {fs ? "Start in volledig scherm" : "Start"}
          </Button>
        </Stack>
      </Card>
    </Center>
  );
}
