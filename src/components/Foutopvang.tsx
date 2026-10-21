// src/components/Foutopvang.tsx
// Vangt een fout in één scherm op, zodat de rest van de app blijft werken (geen witte pagina), en meldt de fout
// aan de server (/api/clientfout) zodat hij in de serverlog terug te vinden is.
import { Component, type ReactNode } from "react";
import { Alert, Button, Group, Text } from "@mantine/core";

type State = { fout: Error | null };

export class Foutopvang extends Component<{ scherm: string; children: ReactNode }, State> {
  state: State = { fout: null };

  static getDerivedStateFromError(fout: Error): State { return { fout }; }

  componentDidCatch(fout: Error, info: { componentStack?: string | null }) {
    fetch("/api/clientfout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scherm: this.props.scherm, melding: String(fout?.message || fout), stack: String(fout?.stack || "").slice(0, 2000), component: String(info?.componentStack || "").slice(0, 2000), pad: location.pathname }),
    }).catch(() => {});
  }

  render() {
    if (!this.state.fout) return this.props.children;
    return (
      <Alert color="red" radius="md" title="Dit scherm kon niet worden geladen">
        <Text size="sm">Er ging iets mis bij "{this.props.scherm}". De fout is doorgegeven. Probeer het opnieuw; lukt het niet, geef dan deze melding door:</Text>
        <Text size="xs" ff="monospace" mt="xs" c="dimmed">{this.state.fout.message}</Text>
        <Group mt="sm">
          <Button size="xs" color="campaiNavy" onClick={() => location.reload()}>Opnieuw laden</Button>
          <Button size="xs" variant="default" onClick={() => this.setState({ fout: null })}>Nog een keer proberen</Button>
        </Group>
      </Alert>
    );
  }
}
