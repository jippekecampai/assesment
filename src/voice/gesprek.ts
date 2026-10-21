// src/voice/gesprek.ts
// Het telefoongesprek met de AI-beller, overgenomen uit VoiceAI/pipeline/oefenlijn_test.html.
// Verschil: de browser verbindt met /api/voice/live op deze site; de server geeft het gesprek door aan Azure
// Voice Live met de sleutel, zodat die nooit in de browser komt. Geluid en transcript blijven in de browser.

export type Regel = { wie: "jij" | "beller"; tekst: string };

// Stemmen. "natuurlijk" = de eigen stem van het spraakmodel (spreekt zelf, met natuurlijke haperingen en adem;
// licht accent in het Nederlands). "hd" = Nederlandse MAI-Voice-2.1 (de volle kwaliteit, niet de snellere Flash).
export type StemSoort = "natuurlijk" | "hd";
export type Stem = { type: "openai"; name: string } | { type: "azure-standard"; name: string; temperature?: number; style?: string };

const NATUURLIJK: Record<string, string[]> = { vrouw: ["marin", "coral", "shimmer"], man: ["cedar", "ash", "verse"] };
const HD: Record<string, string[]> = { vrouw: ["nl-NL-Harper:MAI-Voice-2.1"], man: ["nl-NL-Sander:MAI-Voice-2.1", "nl-NL-Grant:MAI-Voice-2.1"] };
// Sander kent spreekstijlen; die passen we aan op hoe de beller zich voelt.
const SANDER_STIJL: Record<string, string> = { boos: "serious", ongeduldig: "serious", gehaast: "serious", vriendelijk: "friendlycheerful", onzeker: "reflective", vaag: "reflective" };

export function kiesStem(soort: StemSoort, geslacht: string, persona: string, vast?: string): Stem {
  const kies = (a: string[]) => a[Math.floor(Math.random() * a.length)];
  if (soort === "natuurlijk") return { type: "openai", name: vast || kies(NATUURLIJK[geslacht] || NATUURLIJK.vrouw) };
  const name = vast || kies(HD[geslacht] || HD.vrouw);
  const style = name.startsWith("nl-NL-Sander") ? SANDER_STIJL[persona] : undefined;
  return { type: "azure-standard", name, temperature: 0.8, ...(style ? { style } : {}) };
}

// Eén AudioWorklet neemt op én speelt af; het afgespeelde geluid gaat als 2e kanaal mee, zodat Azure de echo
// van de klantstem exact uit je microfoon haalt (Live-Reference AEC). Afspelen start pas als er ~150 ms klaarstaat
// (of het antwoord compleet is), zodat netwerkschommelingen geen gaatjes in de stem geven.
const WERKER = `class D extends AudioWorkletProcessor{
  constructor(){super();this.q=[];this.cur=null;this.pos=0;this.uit=new Int16Array(4800);this.n=0;this.klaar=0;this.speelt=false;this.slot=false;
    this.port.onmessage=e=>{if(e.data==='stop'){this.q=[];this.cur=null;this.klaar=0;this.speelt=false;this.slot=false;}
      else if(e.data==='slot'){this.slot=true;this.speelt=true;}
      else{const f=new Float32Array(e.data);this.q.push(f);this.klaar+=f.length;this.slot=false;if(this.klaar>=3600)this.speelt=true;}};}
  process(inputs,outputs){
    const mic=(inputs[0]&&inputs[0][0])||null, out=outputs[0][0], len=out.length;
    for(let i=0;i<len;i++){
      if(this.speelt&&(!this.cur||this.pos>=this.cur.length)){this.cur=this.q.shift()||null;this.pos=0;
        if(!this.cur){this.speelt=false;this.slot=false;}}
      if(this.speelt&&this.cur){out[i]=this.cur[this.pos++];this.klaar--;}else out[i]=0;
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
  async verbind(instructie: string, stem: Stem) {
    this.ctx = new AudioContext({ sampleRate: 24000 });
    this.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
    await this.ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WERKER], { type: "application/javascript" })));
    // Liefst rechtstreeks naar Voice Live (kortlevend token van de server); anders via de doorgifte op deze site.
    const v = await fetch("/api/voice/verbinding", { credentials: "same-origin" }).then((r) => r.json()).catch(() => ({ proxy: true }));
    const proxy = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/api/voice/live`;
    const open = (url: string) => new Promise<WebSocket>((ok, nee) => {
      const w = new WebSocket(url);
      w.onopen = () => ok(w);
      w.onerror = () => nee(new Error("geen verbinding met de oefenlijn"));
    });
    const ws = v.url ? await open(v.url).catch(() => open(proxy)) : await open(proxy);
    this.ws = ws;
    ws.send(JSON.stringify({ type: "session.update", session: {
      instructions: instructie, modalities: ["text", "audio"], voice: stem,
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
      case "response.audio.done": case "response.output_audio.done": case "response.done": this.node?.port.postMessage("slot"); break; // rest afspelen
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
