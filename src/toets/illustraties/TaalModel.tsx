// src/toets/illustraties/TaalModel.tsx
// Hoe een taalmodel antwoordt (AI-geletterdheid, ISO 42001): woord voor woord voorspellen, waarom het
// overtuigend fout kan zijn, en waar je prompt naartoe gaat. Interactief, zonder netwerk of echte AI.
import { useState } from "react";
import { Badge, Box, Button, Group, Slider, Stack, Text } from "@mantine/core";
import { Keuzes } from "./_gedeeld";

// Een kleine, vaste "kansentabel" per stap. Verzonnen getallen ter illustratie, geen echt model.
const STAPPEN: Array<{ woorden: Array<[string, number]> }> = [
  { woorden: [["is", 0.62], ["was", 0.21], ["werd", 0.11], ["blijft", 0.06]] },
  { woorden: [["vannacht", 0.48], ["gisteren", 0.27], ["opnieuw", 0.17], ["nooit", 0.08]] },
  { woorden: [["mislukt", 0.46], ["gelukt", 0.31], ["gestopt", 0.15], ["verplaatst", 0.08]] },
  { woorden: [["door", 0.39], [".", 0.33], ["omdat", 0.2], ["maar", 0.08]] },
];
const BEGIN = "De back-up van de fileserver";

function kies(woorden: Array<[string, number]>, temperatuur: number) {
  // Lage temperatuur: bijna altijd het waarschijnlijkste woord. Hoog: meer variatie.
  const t = Math.max(0.05, temperatuur);
  const gewichten = woorden.map(([, p]) => Math.pow(p, 1 / t));
  const som = gewichten.reduce((a, b) => a + b, 0);
  let r = Math.random() * som;
  for (let i = 0; i < woorden.length; i++) { r -= gewichten[i]; if (r <= 0) return i; }
  return 0;
}

function Voorspellen() {
  const [gekozen, setGekozen] = useState<number[]>([]);
  const [temp, setTemp] = useState(0.7);
  const stap = STAPPEN[gekozen.length];
  const zin = [BEGIN, ...gekozen.map((k, i) => STAPPEN[i].woorden[k][0])].join(" ").replace(" .", ".");
  return (
    <Stack gap="xs">
      <Text size="sm">
        Een taalmodel schrijft geen antwoord dat het "weet". Het kiest steeds het volgende woord op basis van kansen uit
        zijn trainingsdata. Klik op <b>Volgend woord</b>.
      </Text>
      <Box className="ill-tm-zin" aria-live="polite">{zin}<span className="ill-tm-cursor">▍</span></Box>
      {stap ? (
        <Stack gap={4}>
          {stap.woorden.map(([w, p]) => (
            <Group key={w} gap="xs" wrap="nowrap">
              <Text size="sm" w={90} ff="monospace">{w}</Text>
              <Box className="ill-tm-balk"><Box className="ill-tm-vul" style={{ width: `${p * 100}%` }} /></Box>
              <Text size="xs" c="dimmed" w={40} ta="right" ff="monospace">{Math.round(p * 100)}%</Text>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed">De zin is af. Klinkt logisch, maar het model heeft niets gecontroleerd: of de back-up écht mislukt is, weet het niet.</Text>
      )}
      <Group gap="xs">
        <Button size="xs" color="campaiNavy" disabled={!stap} onClick={() => stap && setGekozen([...gekozen, kies(stap.woorden, temp)])}>Volgend woord</Button>
        <Button size="xs" variant="default" onClick={() => setGekozen([])}>Opnieuw</Button>
      </Group>
      <Box maw={320}>
        <Text size="xs" c="dimmed" mb={4}>Creativiteit (temperatuur): {temp.toFixed(1)}</Text>
        <Slider min={0.1} max={1.5} step={0.1} value={temp} onChange={setTemp} label={null} aria-label="Temperatuur" color="campaiNavy" />
      </Box>
    </Stack>
  );
}

function Hallucinatie() {
  const [vraag, setVraag] = useState<"bekend" | "onbekend">("bekend");
  return (
    <Stack gap="xs">
      <Keuzes label="Soort vraag" waarde={vraag} onKies={setVraag}
        opties={[{ waarde: "bekend", label: "Vraag over iets bekends" }, { waarde: "onbekend", label: "Vraag over iets wat het model niet kent" }]} />
      <Box className="ill-tm-chat">
        <Text size="sm" fw={600}>{vraag === "bekend" ? "Wat doet DHCP?" : "Welke patch bracht Campai-tool X versie 7.4.2 uit?"}</Text>
        <Text size="sm" mt={4}>
          {vraag === "bekend"
            ? "DHCP deelt automatisch IP-adressen, gateway en DNS-server uit aan apparaten in het netwerk."
            : "Versie 7.4.2 bevat patch KB-55120 die de synchronisatiefout oplost (zie de release notes van maart)."}
        </Text>
      </Box>
      <Group gap="xs">
        <Badge color="campaiNavy" variant="light">klinkt zeker</Badge>
        {vraag === "bekend"
          ? <Badge color="campaiLime" variant="light">klopt hier</Badge>
          : <Badge color="campaiRed" variant="light">verzonnen: patch en bron bestaan niet</Badge>}
      </Group>
      <Text size="sm" c="dimmed">
        Het model klinkt in beide gevallen even zeker. Het heeft geen "weet ik niet"-gevoel: ook zonder kennis maakt het een
        vloeiend antwoord. Daarom controleer je AI-output altijd.
      </Text>
    </Stack>
  );
}

function WaarHeen() {
  const [tool, setTool] = useState<"copilot" | "extern">("copilot");
  const copilot = tool === "copilot";
  return (
    <Stack gap="xs">
      <Keuzes label="AI-tool" waarde={tool} onKies={setTool}
        opties={[{ waarde: "copilot", label: "Microsoft 365 Copilot (goedgekeurd)" }, { waarde: "extern", label: "Openbare chatbot" }]} />
      <Group gap={6} justify="center" wrap="wrap" className="ill-tm-pad">
        <Box className="ill-tm-node">Jij<small>prompt</small></Box>
        <span className="ill-tm-pijl">→</span>
        <Box className={`ill-tm-node ${copilot ? "ok" : "let"}`}>{copilot ? "Copilot" : "Chatbot"}<small>{copilot ? "binnen je organisatie" : "buiten je organisatie"}</small></Box>
        <span className="ill-tm-pijl">→</span>
        <Box className={`ill-tm-node ${copilot ? "ok" : "let"}`}>
          {copilot ? "Bestanden en mail" : "Server van de aanbieder"}
          <small>{copilot ? "alleen wat jij al mag openen" : "opslag en gebruik buiten jouw afspraken"}</small>
        </Box>
      </Group>
      <Text size="sm">
        {copilot
          ? "Copilot werkt binnen de afspraken van je organisatie en toont alleen wat jij al mag openen. Staan rechten te ruim, dan wordt te veel vindbaar: ruim dus de rechten op."
          : "Wat je in een openbare chatbot plakt, verlaat je organisatie. Deel daar nooit klantdata, persoonsgegevens of wachtwoorden, en gebruik alleen goedgekeurde tools."}
      </Text>
    </Stack>
  );
}

export function TaalModel() {
  const [deel, setDeel] = useState<"voorspellen" | "hallucinatie" | "waarheen">("voorspellen");
  return (
    <Stack gap="md" className="ill">
      <Keuzes label="Onderdeel" waarde={deel} onKies={setDeel}
        opties={[{ waarde: "voorspellen", label: "1. Woord voor woord" }, { waarde: "hallucinatie", label: "2. Overtuigend fout" }, { waarde: "waarheen", label: "3. Waar gaat je prompt heen?" }]} />
      {deel === "voorspellen" && <Voorspellen />}
      {deel === "hallucinatie" && <Hallucinatie />}
      {deel === "waarheen" && <WaarHeen />}
    </Stack>
  );
}
