// src/voice/gesprek.ts
// Het telefoongesprek met de AI-beller, overgenomen uit VoiceAI/pipeline/oefenlijn_test.html.
// Verschil: de browser verbindt met /api/voice/live op deze site; de server geeft het gesprek door aan Azure
// Voice Live met de sleutel, zodat die nooit in de browser komt. Geluid en transcript blijven in de browser.

export type Regel = { wie: "jij" | "beller"; tekst: string };

export const STEMMEN: Record<string, string[]> = {
  vrouw: ["nl-NL-Harper:MAI-Voice-2.1-Flash", "nl-NL-Fleur:MAI-Voice-2-Flash"],
  man: ["nl-NL-Sander:MAI-Voice-2.1-Flash"],
};

// Eén AudioWorklet neemt op én speelt af; het afgespeelde geluid gaat als 2e kanaal mee, zodat Azure de echo
// van de klantstem exact uit je microfoon haalt (Live-Reference AEC).
const WERKER = `class D extends AudioWorkletProcessor{
  constructor(){super();this.q=[];this.cur=null;this.pos=0;this.uit=new Int16Array(4800);this.n=0;
    this.port.onmessage=e=>{if(e.data==='stop'){this.q=[];this.cur=null;}else this.q.push(new Float32Array(e.data));};}
  process(inputs,outputs){
    const mic=(inputs[0]&&inputs[0][0])||null, out=outputs[0][0], len=out.length;
    for(let i=0;i<len;i++){
      if(!this.cur||this.pos>=this.cur.length){this.cur=this.q.shift()||null;this.pos=0;}
      out[i]=this.cur?this.cur[this.pos++]:0;
      const m=mic?Math.max(-1,Math.min(1,mic[i])):0, r=Math.max(-1,Math.min(1,out[i]));
      this.uit[this.n++]=m<0?m*0x8000:m*0x7fff; this.uit[this.n++]=r<0?r*0x8000:r*0x7fff;
      if(this.n>=this.uit.length){this.port.postMessage(this.uit.buffer,[this.uit.buffer]);this.uit=new Int16Array(4800);this.n=0;}
    }
    return true;}}
registerProcessor('duplex',D);`;

function b64(buf: ArrayBuffer) {
  let s = "";
  const u = new Uint8Array(buf);
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, Array.from(u.subarray(i, i + 0x8000)));
  return btoa(s);
}

export type GesprekEvents = {
  onRegel: (r: Regel) => void;
  onFout: (melding: string) => void;
};

export class Gesprek {
  private ws: WebSocket | null = null;
  private ctx: AudioContext | null = null;
  private mic: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private rinkelStop: (() => void) | null = null;
  private stilte: number | undefined;
  private gesproken = false;
  private aiTekst = "";
  private actief = true;

  constructor(private ev: GesprekEvents) {}

  // Verbinding en microfoon alvast klaarzetten, zodat opnemen direct werkt.
  async verbind(instructie: string, stem: string) {
    this.ctx = new AudioContext({ sampleRate: 24000 });
    this.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
    await this.ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WERKER], { type: "application/javascript" })));
    const ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/api/voice/live`);
    this.ws = ws;
    await new Promise<void>((ok, nee) => { ws.onopen = () => ok(); ws.onerror = () => nee(new Error("geen verbinding met de oefenlijn")); });
    ws.send(JSON.stringify({ type: "session.update", session: {
      instructions: instructie, modalities: ["text", "audio"], voice: { name: stem, type: "azure-standard" },
      input_audio_format: "pcm16", input_audio_sampling_rate: 24000,
      input_audio_noise_reduction: { type: "azure_deep_noise_suppression" },
      input_audio_echo_cancellation: { type: "server_echo_cancellation", reference_source: "client", channels: 2 },
      input_audio_transcription: { model: "mai-transcribe-2" },
      turn_detection: { type: "azure_semantic_vad_multilingual", threshold: 0.6, speech_duration_ms: 250, silence_duration_ms: 700, interrupt_response: true, auto_truncate: true },
    } }));
    ws.onmessage = (e) => this.verwerk(JSON.parse(e.data));
    ws.onclose = (e) => { if (this.actief) this.ev.onFout("De verbinding is verbroken" + (e.reason ? `: ${e.reason}` : ".")); };
  }

  // Nederlandse kiestoon-achtige bel: 425 Hz, 1 s aan, 1,5 s uit.
  rinkel() {
    const ctx = this.ctx!;
    const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
    const o = ctx.createOscillator(); o.frequency.value = 425; o.connect(g); o.start();
    const t0 = ctx.currentTime;
    for (let i = 0; i < 12; i++) { g.gain.setValueAtTime(0.12, t0 + i * 2.5); g.gain.setValueAtTime(0, t0 + i * 2.5 + 1); }
    this.rinkelStop = () => { try { o.stop(); g.disconnect(); } catch { /* al gestopt */ } };
  }

  neemOp() {
    this.rinkelStop?.(); this.rinkelStop = null;
    const ctx = this.ctx!;
    this.node = new AudioWorkletNode(ctx, "duplex", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
    this.node.port.onmessage = (e) => { if (this.ws?.readyState === 1) this.ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: b64(e.data) })); };
    ctx.createMediaStreamSource(this.mic!).connect(this.node); this.node.connect(ctx.destination);
    // Inkomend gesprek: jij meldt je eerst. Zeg je niets, dan zegt de klant na een paar seconden 'hallo?'.
    this.gesproken = false;
    this.stilte = window.setTimeout(() => {
      if (!this.gesproken && this.ws?.readyState === 1) this.ws.send(JSON.stringify({ type: "response.create", response: { instructions: "Er wordt opgenomen maar je hoort niets. Zeg alleen kort en een beetje aarzelend: 'Hallo? Is dit Campai?' en wacht dan." } }));
    }, 5000);
  }

  private verwerk(m: { type: string; delta?: string; transcript?: string; error?: { message?: string } }) {
    switch (m.type) {
      case "response.audio.delta": case "response.output_audio.delta": this.speel(m.delta || ""); break;
      case "input_audio_buffer.speech_started": this.gesproken = true; this.node?.port.postMessage("stop"); break; // jij praat erdoorheen: klant stopt
      case "conversation.item.input_audio_transcription.completed": this.regel("jij", m.transcript); break;
      case "response.audio_transcript.delta": case "response.output_audio_transcript.delta": this.aiTekst += m.delta || ""; break;
      case "response.audio_transcript.done": case "response.output_audio_transcript.done": this.regel("beller", m.transcript || this.aiTekst); this.aiTekst = ""; break;
      case "error": if (!/cancel|no active response/i.test(m.error?.message || "")) this.ev.onFout(m.error?.message || "Onbekende fout van de oefenlijn."); break;
    }
  }

  private regel(wie: Regel["wie"], tekst?: string) {
    const t = (tekst || "").trim();
    if (t) this.ev.onRegel({ wie, tekst: t });
  }

  private speel(b: string) {
    const bin = atob(b), n = bin.length / 2, f = new Float32Array(n);
    for (let i = 0; i < n; i++) { let s = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8); if (s >= 0x8000) s -= 0x10000; f[i] = s / 0x8000; }
    this.node?.port.postMessage(f.buffer, [f.buffer]);
  }

  stop() {
    this.actief = false;
    window.clearTimeout(this.stilte); this.rinkelStop?.(); this.rinkelStop = null;
    try { this.ws?.close(); } catch { /* al dicht */ }
    this.ws = null;
    this.node?.port.postMessage("stop"); this.node?.disconnect(); this.node = null;
    this.mic?.getTracks().forEach((t) => t.stop()); this.mic = null;
    this.ctx?.close().catch(() => {}); this.ctx = null;
  }
}
