import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Campai Design System v2 — tokens afgeleid van central.campai.nl/proto.
// Navy is de primary, lime/cyan/red zijn accent/status. 1-op-1 overgenomen uit
// skill-forge (de referentie-cockpit). Houd dit in sync met skill-forge.
const navy: MantineColorsTuple = [
  "#e6eef5",
  "#cdddeb",
  "#9bbbd6",
  "#6699c2",
  "#3377ad",
  "#0d5a96",
  "#003d6a",
  "#003158",
  "#002645",
  "#001a33",
];

const lime: MantineColorsTuple = [
  "#fafde6",
  "#f3f8c2",
  "#e9f297",
  "#dbe968",
  "#cfdf3f",
  "#c8d300",
  "#b3bd00",
  "#8e9700",
  "#6b7200",
  "#494e00",
];

const cyan: MantineColorsTuple = [
  "#e3f8ff",
  "#bdecff",
  "#86dcff",
  "#4ecdff",
  "#26c1f5",
  "#0bbbef",
  "#0099c4",
  "#007a9c",
  "#005c75",
  "#003e4f",
];

const danger: MantineColorsTuple = [
  "#fde8ec",
  "#fac3cc",
  "#f4889e",
  "#ee5274",
  "#e92652",
  "#e62243",
  "#c81a37",
  "#9d142b",
  "#720e1f",
  "#480814",
];

export const campaiTheme = createTheme({
  primaryColor: "campaiNavy",
  primaryShade: 6,
  colors: {
    campaiNavy: navy,
    campaiLime: lime,
    campaiCyan: cyan,
    campaiRed: danger,
  },
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  headings: {
    fontFamily: "Sora, Inter, ui-sans-serif, system-ui, sans-serif",
    fontWeight: "800",
  },
  defaultRadius: "md",
  radius: { md: "12px" },
  cursorType: "pointer",
});
