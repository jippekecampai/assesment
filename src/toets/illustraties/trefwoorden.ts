// src/toets/illustraties/trefwoorden.ts
// Pure koppeling vraag → illustratie (geen React, geen CSS), zodat hij los te testen is.
// Volgorde telt: de specifiekste onderwerpen eerst. Trefwoorden zijn bewust smal gehouden;
// algemene woorden als "cloud", "poort" of "regio" alleen matchen met kwalificatie ernaast.

export const ILLUSTRATIE_KEYS = ["cloud", "osi", "subnet", "scale", "lb", "rto", "pad", "ansible", "ai"] as const;
export type IllustratieKey = (typeof ILLUSTRATIE_KEYS)[number];

export function isIllustratieKey(x: unknown): x is IllustratieKey {
  return typeof x === "string" && (ILLUSTRATIE_KEYS as readonly string[]).includes(x);
}

const REGELS: Array<[IllustratieKey, RegExp]> = [
  ["ai", /taalmodel|Copilot|ChatGPT|generatieve AI|hallucin|AI-tool|chatbot/i],
  ["ansible", /\bansible\b|playbook|inventory\.ini|\binventory\b|idempoten|changed=\d/i],
  ["subnet", /subnetmasker|subnet ?mask|\/(?:2[4-9]|30)\b|broadcast|netwerkadres|bruikbare host|hostadressen|hetzelfde[^.?]{0,30}subnet|subnetten (?:rekenen|indelen)/i],
  ["rto", /\bRTO\b|\bRPO\b|back-?up|replicatie|herstelpunt|point-in-time/i],
  ["lb", /load ?balancer|health ?probe|availability zones?|beschikbaarheidszone|single point of failure/i],
  ["scale", /scale[ -]?(?:up|out|down|in)\b|instanties|autoscal|verticaal schal|horizontaal schal|verticale schaling|horizontale schaling|meer (?:RAM|CPU)/i],
  // OSI vóór pad: "Op welke OSI-laag werkt IP-routering?" hoort bij het OSI-model.
  ["osi", /\bOSI\b|\blaag [1-7]\b|\bswitch\b|MAC-adres|\bTCP\b|\bUDP\b|standaardpoort/i],
  // Hoofdlettergevoelig, zodat "nat" of "dns" midden in een woord niet meetelt.
  ["pad", /\bDNS\b|\bDHCP\b|\b[Gg]ateway\b|\bNAT\b|\bVPN\b|\b[Rr]outering\b|ander subnet|domeinnaam/],
  ["cloud", /\b(?:IaaS|PaaS|SaaS)\b|cloudmodel|\bcontainers?\b|hybride cloud|public cloud|private cloud|gedeelde verantwoordelijkheid/i],
];

export function illustratieVoor(vraag: { domain?: string; prompt: string; illustratie?: string }): IllustratieKey | null {
  if (isIllustratieKey(vraag.illustratie)) return vraag.illustratie;
  const tekst = vraag.prompt.replace(/<[^>]+>/g, "");
  for (const [k, re] of REGELS) if (re.test(tekst)) return k;
  return null;
}
