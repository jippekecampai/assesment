// src/toets/illustraties/index.ts
// Register van de toets-illustraties (omgezet uit artifacts/cloud-oefentoets.html) en de
// koppeling van een vraag aan een illustratie.
import type { ComponentType } from "react";
import "./illustraties.css";
import { Ansible } from "./Ansible";
import { CloudModellen } from "./CloudModellen";
import { LoadBalancer } from "./LoadBalancer";
import { OsiModel } from "./OsiModel";
import { RtoRpo } from "./RtoRpo";
import { Schalen } from "./Schalen";
import { SubnetRekenaar } from "./SubnetRekenaar";
import { Webverzoek } from "./Webverzoek";
import { TaalModel } from "./TaalModel";
import { ConditionalAccess } from "./ConditionalAccess";
import { SharePointDelen } from "./SharePointDelen";
import { BaselineDrift } from "./BaselineDrift";
import { Migratie } from "./Migratie";
import { RmmAlert } from "./RmmAlert";
import { VoipGesprek } from "./VoipGesprek";
import { Klantupdate } from "./Klantupdate";
import type { IllustratieKey } from "./trefwoorden";

export type { IllustratieKey } from "./trefwoorden";
export { ILLUSTRATIE_KEYS, illustratieVoor, isIllustratieKey } from "./trefwoorden";

export const ILLUSTRATIES: Record<IllustratieKey, { titel: string; Component: ComponentType }> = {
  cloud: { titel: "Wie beheert wat?", Component: CloudModellen },
  osi: { titel: "Het OSI-model", Component: OsiModel },
  subnet: { titel: "Subnetten rekenen", Component: SubnetRekenaar },
  scale: { titel: "Scale up versus scale out", Component: Schalen },
  lb: { titel: "Load balancer en health probe", Component: LoadBalancer },
  rto: { titel: "RTO en RPO op een tijdlijn", Component: RtoRpo },
  pad: { titel: "De weg van een webverzoek", Component: Webverzoek },
  ansible: { titel: "Ansible en idempotentie", Component: Ansible },
  ai: { titel: "Hoe een taalmodel antwoordt", Component: TaalModel },
  ca: { titel: "Conditional Access: wie mag erin?", Component: ConditionalAccess },
  delen: { titel: "Delen in SharePoint en Teams", Component: SharePointDelen },
  baseline: { titel: "Baseline en drift", Component: BaselineDrift },
  migratie: { titel: "Een migratie met cutover", Component: Migratie },
  rmm: { titel: "Van monitoring-alert naar klantupdate", Component: RmmAlert },
  voip: { titel: "Hoe een VoIP-gesprek loopt", Component: VoipGesprek },
  klantupdate: { titel: "Een goede klantupdate", Component: Klantupdate },
};
