// src/toets/illustraties/_gedeeld.tsx
// Kleine bouwstenen die meerdere illustraties delen.
import type { CSSProperties, ReactNode } from "react";
import { Button, Group, Text } from "@mantine/core";

/** Groep keuzeknoppen: echte <button>s met aria-pressed, zoals de .seg-knoppen van het origineel. */
export function Keuzes<T extends string | number>({
  label,
  opties,
  waarde,
  onKies,
}: {
  label: string;
  opties: Array<{ waarde: T; label: string }>;
  waarde: T;
  onKies: (w: T) => void;
}) {
  return (
    <Group gap={8} role="group" aria-label={label}>
      {opties.map((o) => {
        const aan = o.waarde === waarde;
        return (
          <Button
            key={String(o.waarde)}
            size="xs"
            color="campaiNavy"
            variant={aan ? "filled" : "default"}
            aria-pressed={aan}
            onClick={() => onKies(o.waarde)}
          >
            {o.label}
          </Button>
        );
      })}
    </Group>
  );
}

export function Kop({ titel, children }: { titel: string; children?: ReactNode }) {
  return (
    <div>
      <Text fw={700} fz="md" c="campaiNavy.7">{titel}</Text>
      {children && <Text size="sm" c="dimmed" mt={2}>{children}</Text>}
    </div>
  );
}

export function Klein({ children, id }: { children: ReactNode; id?: string }) {
  return <Text size="sm" c="dimmed" id={id}>{children}</Text>;
}

export function Legenda({ items }: { items: Array<{ label: string; stijl: CSSProperties }> }) {
  return (
    <div className="ill-legend">
      {items.map((i) => (
        <span key={i.label}><i style={i.stijl} aria-hidden="true" />{i.label}</span>
      ))}
    </div>
  );
}
