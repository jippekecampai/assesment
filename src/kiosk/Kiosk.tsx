// src/kiosk/Kiosk.tsx
import { useState } from "react";
import { StartScreen } from "./StartScreen";
import { AssessmentRunner } from "./AssessmentRunner";
import { ResultScreen } from "./ResultScreen";
import type { StartResponse, SubmitResponse } from "../lib/api";

export default function Kiosk() {
  const [phase, setPhase] = useState<'start' | 'running' | 'done'>('start');
  const [code, setCode] = useState<string>("");
  const [startData, setStartData] = useState<StartResponse | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);

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

  if (phase === 'running' && startData) {
    return (
      <AssessmentRunner
        code={code}
        data={startData}
        onDone={(r) => { setResult(r); setPhase('done'); }}
      />
    );
  }

  if (phase === 'done' && result) {
    return <ResultScreen result={result} />;
  }

  return null;
}
