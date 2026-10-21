// src/kiosk/useToezicht.ts
// Toezicht tijdens de assessment: volledig scherm, weggaan uit het scherm vastleggen en melden,
// plakken en kopiëren tegenhouden. Alles gaat in batches naar /api/assessment/event (lib/toezicht.mjs), of bij een
// examen naar het eigen endpoint van de poging (verstuur).
import { useCallback, useEffect, useRef, useState } from "react";
import { sendToezicht, type ToezichtEvent, type WegReden } from "../lib/api";

const MIN_WEG_SEC = 2; // korter telt niet (een systeemmelding die even focus pakt)
const FLUSH_MS = 4000;

export type WegMelding = { sec: number; reden: WegReden; vraag: number | null; totaal: number; totaalSec: number };

const fsElement = () =>
  document.fullscreenElement ?? (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ?? null;
export const kanVolledigScherm = () => {
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  return Boolean(el.requestFullscreen || el.webkitRequestFullscreen);
};
// el: welk deel van de pagina volledig scherm wordt (standaard de hele pagina; bij een examen alleen het examen).
export async function vraagVolledigScherm(doel?: HTMLElement | null): Promise<boolean> {
  const el = (doel ?? document.documentElement) as HTMLElement & { webkitRequestFullscreen?: () => void };
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" });
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else return false;
    return true;
  } catch {
    return false;
  }
}

export function useToezicht(code: string, vraag: number, verstuur?: (events: ToezichtEvent[]) => Promise<unknown>) {
  const queue = useRef<ToezichtEvent[]>([]);
  const verstuurRef = useRef(verstuur);
  verstuurRef.current = verstuur;
  const vraagRef = useRef(vraag);
  vraagRef.current = vraag;
  const weg = useRef<{ van: number; reden: WegReden; vraag: number } | null>(null);
  const metVolledigScherm = useRef(false);
  const telling = useRef({ weg: 0, sec: 0 });
  const [melding, setMelding] = useState<WegMelding | null>(null);
  const [buitenVolledigScherm, setBuitenVolledigScherm] = useState(false);
  const [plakMelding, setPlakMelding] = useState(0);

  const flush = useCallback(async () => {
    if (!queue.current.length) return;
    const batch = queue.current.splice(0, queue.current.length);
    try { await (verstuurRef.current ? verstuurRef.current(batch) : sendToezicht(code, batch)); } catch { queue.current.unshift(...batch); }
  }, [code]);

  const log = useCallback((e: ToezichtEvent) => {
    queue.current.push({ at: new Date().toISOString(), vraag: vraagRef.current, ...e });
  }, []);

  useEffect(() => {
    const key = `camai-kiosk-toezicht-${code}`;
    let herladen = false;
    try { herladen = sessionStorage.getItem(key) === "1"; sessionStorage.setItem(key, "1"); } catch { /* geen opslag */ }
    metVolledigScherm.current = Boolean(fsElement());
    log({ type: herladen ? "herladen" : "start" });
    if (!metVolledigScherm.current) log({ type: "geen-volledig-scherm" });
    flush();

    const gaWeg = (reden: WegReden) => {
      if (!weg.current) weg.current = { van: Date.now(), reden, vraag: vraagRef.current };
    };
    const komTerug = (force = false) => {
      const w = weg.current;
      if (!w) return;
      // wie in volledig scherm begon, is pas terug als volledig scherm weer aan staat
      if (!force && metVolledigScherm.current && !fsElement()) return;
      weg.current = null;
      const sec = Math.round((Date.now() - w.van) / 1000);
      if (sec < MIN_WEG_SEC && w.reden !== "volledig-scherm-verlaten") return;
      telling.current = { weg: telling.current.weg + 1, sec: telling.current.sec + sec };
      log({ type: "weg", sec, reden: w.reden, vraag: w.vraag });
      flush();
      setMelding({ sec, reden: w.reden, vraag: w.vraag, totaal: telling.current.weg, totaalSec: telling.current.sec });
    };
    const onVisibility = () => (document.hidden ? gaWeg("ander-tabblad") : komTerug());
    const onBlur = () => gaWeg("ander-venster");
    const onFocus = () => { if (!document.hidden) komTerug(); };
    const onFs = () => {
      if (!metVolledigScherm.current) return;
      if (fsElement()) { setBuitenVolledigScherm(false); komTerug(true); }
      else { gaWeg("volledig-scherm-verlaten"); setBuitenVolledigScherm(true); }
    };
    const inVeld = (t: EventTarget | null) => t instanceof Element && Boolean(t.closest("input,textarea"));
    const onCopy = (e: ClipboardEvent) => { if (inVeld(e.target)) return; e.preventDefault(); log({ type: "kopieer" }); };
    const geenPlak = (e: Event) => { e.preventDefault(); log({ type: "plak" }); setPlakMelding(Date.now()); };
    const onBeforeInput = (e: InputEvent) => { if (/^insertFrom(Paste|Drop|Yank)/.test(e.inputType || "")) geenPlak(e); };
    const onContext = (e: MouseEvent) => { if (!inVeld(e.target)) e.preventDefault(); };
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onHide = () => flush();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("cut", onCopy, true);
    document.addEventListener("paste", geenPlak, true);
    document.addEventListener("drop", geenPlak, true);
    document.addEventListener("beforeinput", onBeforeInput, true);
    document.addEventListener("contextmenu", onContext, true);
    document.addEventListener("dragstart", onDragStart, true);
    window.addEventListener("pagehide", onHide);
    const timer = window.setInterval(flush, FLUSH_MS);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("cut", onCopy, true);
      document.removeEventListener("paste", geenPlak, true);
      document.removeEventListener("drop", geenPlak, true);
      document.removeEventListener("beforeinput", onBeforeInput, true);
      document.removeEventListener("contextmenu", onContext, true);
      document.removeEventListener("dragstart", onDragStart, true);
      window.removeEventListener("pagehide", onHide);
      window.clearInterval(timer);
      flush();
    };
  }, [code, flush, log]);

  // Vóór inleveren: na submit weigert de server nieuwe events, dus eerst alles versturen.
  const afronden = useCallback(async () => {
    await flush();
    try { sessionStorage.removeItem(`camai-kiosk-toezicht-${code}`); } catch { /* geen opslag */ }
  }, [code, flush]);

  return {
    melding,
    sluitMelding: () => setMelding(null),
    buitenVolledigScherm,
    plakMelding,
    telling: telling.current,
    afronden,
  };
}
