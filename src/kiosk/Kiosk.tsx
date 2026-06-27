// src/kiosk/Kiosk.tsx
import { useState } from "react";
import { Text } from "@mantine/core";
import { StartScreen } from "./StartScreen";
import type { StartResponse } from "../lib/api";

export default function Kiosk() {
  const [phase, setPhase] = useState<'start' | 'running' | 'done'>('start');
  const [code, setCode] = useState<string>("");
  const [startData, setStartData] = useState<StartResponse | null>(null);
  const [result, setResult] = useState<unknown>(null);

  if (phase === 'start') {
    return (
      <StartScreen
        onStarted={(c, d) => {
          setCode(c);
          setStartData(d);
          setPhase('running');
        }}
      />
    );
  }

  if (phase === 'running') {
    return <Text>Assessment wordt geladen… (Task 4)</Text>;
  }

  return <Text>Assessment afgerond. (Task 4)</Text>;
}
