// src/toets/illustraties/Ansible.tsx
// Ansible en idempotentie: een playbook herhaald draaien; alleen afwijkingen geven "changed".
import { useState, type ReactNode } from "react";
import { Button, Group, Text } from "@mantine/core";
import { Klein, Kop } from "./_gedeeld";

type Toestand = { pkg: boolean; svc: boolean; idx: boolean };
const LEEG: Toestand = { pkg: false, svc: false, idx: false };
const TAKEN: Array<[string, keyof Toestand]> = [
  ["Installeer Nginx", "pkg"],
  ["Zorg dat Nginx gestart is", "svc"],
  ["Plaats de welkomstpagina", "idx"],
];

const CODE = `[webservers]            # inventory.ini: wáár
localhost ansible_connection=local

- hosts: webservers      # webserver.yml: wát
  become: true
  tasks:
    - apt: name=nginx state=present
    - service: name=nginx state=started
    - copy: dest=/var/www/html/index.html`;

const NOG_NIET = <span className="is-dim">Nog niet gedraaid.</span>;

export function Ansible() {
  const [st, setSt] = useState<Toestand>(LEEG);
  const [run, setRun] = useState(0);
  const [uitvoer, setUitvoer] = useState<ReactNode>(NOG_NIET);
  const [uitleg, setUitleg] = useState("");

  const draai = () => {
    const nr = run + 1;
    const nieuw = { ...st };
    let changed = 0;
    const regels: ReactNode[] = [
      <span key="play" className="is-dim">PLAY [Configureer webserver voor de webwinkel] — run {nr}</span>,
      "\n\nTASK [Gathering Facts]\n",
      <span key="facts" className="is-ok">ok: [localhost]</span>,
      "\n",
    ];
    TAKEN.forEach(([naam, sleutel]) => {
      regels.push(`\nTASK [${naam}]\n`);
      if (nieuw[sleutel]) {
        regels.push(<span key={sleutel} className="is-ok">ok: [localhost]</span>);
      } else {
        nieuw[sleutel] = true;
        changed++;
        regels.push(<span key={sleutel} className="is-chg">changed: [localhost]</span>);
      }
      regels.push("\n");
    });
    regels.push(
      "\nPLAY RECAP\nlocalhost : ",
      <span key="rok" className="is-ok">ok={1 + TAKEN.length}</span>,
      "  ",
      <span key="rch" className="is-chg">changed={changed}</span>,
      "  unreachable=0  failed=0",
    );
    setSt(nieuw);
    setRun(nr);
    setUitvoer(regels);
    setUitleg(
      changed === 0
        ? "changed=0: alles stond al goed, dus Ansible deed niets. Dat heet idempotent: je kunt het playbook veilig zo vaak draaien als je wilt."
        : `changed=${changed}: Ansible heeft ${changed} afwijking${changed > 1 ? "en" : ""} hersteld. Draai het nog een keer en kijk wat er gebeurt.`,
    );
  };

  const handmatig = () => {
    setSt((s) => ({ ...s, idx: false }));
    setUitleg("De pagina wijkt nu af van wat in het playbook staat. Draai het playbook opnieuw.");
  };
  const gestopt = () => {
    setSt((s) => ({ ...s, svc: false }));
    setUitleg("Nginx draait niet meer. Draai het playbook opnieuw.");
  };
  const opnieuw = () => {
    setSt(LEEG);
    setRun(0);
    setUitvoer(NOG_NIET);
    setUitleg("");
  };

  return (
    <div className="ill">
      <Kop titel="Een playbook twee keer draaien">Ansible beschrijft de gewenste toestand. Alleen wat afwijkt, wordt veranderd.</Kop>
      <pre className="ill-code">{CODE}</pre>
      <div>
        <Button color="campaiNavy" onClick={draai} styles={{ label: { fontFamily: "var(--mantine-font-family-monospace)", whiteSpace: "normal" } }} h="auto" py={8}>
          ansible-playbook -i inventory.ini webserver.yml
        </Button>
      </div>
      <Group gap={8}>
        <Button size="xs" variant="default" onClick={handmatig}>Iemand wijzigt index.html met de hand</Button>
        <Button size="xs" variant="default" onClick={gestopt}>Nginx wordt gestopt</Button>
        <Button size="xs" variant="default" onClick={opnieuw}>Opnieuw beginnen</Button>
      </Group>
      <pre className="ill-console" aria-live="polite">{uitvoer}</pre>
      {uitleg ? <Text size="sm">{uitleg}</Text> : <Klein>{" "}</Klein>}
    </div>
  );
}
