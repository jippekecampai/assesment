// src/toets/illustraties/SubnetRekenaar.tsx
// Subnetten rekenen: IP-adres + prefix → bits, masker, netwerk/broadcast en de blokkenmethode.
import { useState } from "react";
import { Group, Slider, Text, TextInput } from "@mantine/core";
import { Klein, Kop } from "./_gedeeld";

const naarGetal = (s: string): number | null => {
  const p = s.trim().split(".").map(Number);
  if (p.length !== 4 || p.some((x) => !Number.isInteger(x) || x < 0 || x > 255)) return null;
  return (p[0] * 16777216 + (p[1] << 16) + (p[2] << 8) + p[3]) >>> 0;
};
const naarIp = (n: number) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

export function SubnetRekenaar() {
  const [tekst, setTekst] = useState("192.168.1.130");
  const [prefix, setPrefix] = useState(26);
  const ip = naarGetal(tekst);

  return (
    <div className="ill">
      <Kop titel="Subnet-rekenaar">Typ een IP-adres en schuif met het prefix. Donkerblauw = netwerkdeel, lichtblauw = hostdeel.</Kop>
      <Group gap="md" align="flex-end">
        <TextInput
          label="IP-adres"
          value={tekst}
          onChange={(e) => setTekst(e.currentTarget.value)}
          w={190}
          styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)" } }}
          error={ip === null ? "Geen geldig IPv4-adres" : undefined}
          spellCheck={false}
          inputMode="decimal"
        />
        <Text size="sm" c="dimmed" pb={ip === null ? 26 : 8}>
          Prefix <b className="ill-mono" style={{ color: "var(--mantine-color-text)" }}>/{prefix}</b>
        </Text>
      </Group>
      <Slider
        min={8}
        max={30}
        value={prefix}
        onChange={setPrefix}
        thumbLabel="Prefix"
        label={(v) => `/${v}`}
        color="campaiNavy"
      />
      {ip === null ? (
        <dl className="ill-kv">
          <dt>Fout</dt>
          <dd>Geen geldig IPv4-adres (4 getallen van 0 tot 255).</dd>
        </dl>
      ) : (
        <Uitkomst ip={ip} p={prefix} />
      )}
    </div>
  );
}

function Uitkomst({ ip, p }: { ip: number; p: number }) {
  const masker = (0xffffffff << (32 - p)) >>> 0;
  const net = (ip & masker) >>> 0;
  const bc = (net | (~masker >>> 0)) >>> 0;
  const grootte = 2 ** (32 - p);

  const blokkenmethode = p >= 24 && p <= 30;
  const bs = grootte;
  const laatste = ip & 255;
  const aantal = 256 / bs;
  const blok = Math.floor(laatste / bs);

  return (
    <>
      <div className="ill-bits" aria-label={`Bits van het adres; de eerste ${p} zijn netwerkdeel`}>
        {[0, 1, 2, 3].map((o) => (
          <span className="ill-oct" key={o}>
            {Array.from({ length: 8 }, (_, j) => {
              const i = o * 8 + j;
              return (
                <b key={j} className={i < p ? "is-net" : "is-host"}>{(ip >>> (31 - i)) & 1}</b>
              );
            })}
          </span>
        ))}
      </div>
      <dl className="ill-kv">
        <dt>Subnetmasker</dt><dd>{naarIp(masker)}</dd>
        <dt>Netwerkadres</dt><dd>{naarIp(net)}</dd>
        <dt>Eerste host</dt><dd>{naarIp(net + 1)}</dd>
        <dt>Laatste host</dt><dd>{naarIp(bc - 1)}</dd>
        <dt>Broadcast</dt><dd>{naarIp(bc)}</dd>
        <dt>Bruikbare hosts</dt><dd>2^{32 - p} − 2 = {(grootte - 2).toLocaleString("nl-NL")}</dd>
      </dl>
      {blokkenmethode ? (
        <>
          <Klein>Laatste octet in blokken van {bs}: het adres valt in het gemarkeerde blok.</Klein>
          <div className="ill-ruler">
            {Array.from({ length: aantal }, (_, k) => (
              <span key={k} className={blok === k ? "is-cur" : undefined} title={`${k * bs}–${k * bs + bs - 1}`}>
                {aantal <= 8 ? `${k * bs}–${k * bs + bs - 1}` : aantal <= 16 ? k * bs : ""}
              </span>
            ))}
          </div>
          <Klein>
            Snelle methode: blokgrootte = 256 − {256 - bs} = {bs}. Het getal {laatste} valt in het blok {blok * bs}–{blok * bs + bs - 1}: eerste getal =
            netwerkadres, laatste = broadcast.
          </Klein>
        </>
      ) : (
        <Klein>Elk volle octet van enen is 255: /8 = 255.0.0.0, /16 = 255.255.0.0, /24 = 255.255.255.0.</Klein>
      )}
    </>
  );
}
