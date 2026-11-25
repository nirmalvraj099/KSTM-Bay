/**
 * Built-in sample renders for demo mode. A render is stored as `preset:<style>:<body>`, and
 * `RenderImage` draws it as an SVG, so the demo needs no image files or AI calls. Real renders
 * (uploaded images now, AI renders later) are plain image URLs.
 */
import type { Job } from "./types";

export type Body = "hatch" | "sedan" | "suv";

export type RenderStyle = {
  id: string;
  label: string;
  paint: string;
  /** second paint stop for the body gradient */
  paint2: string;
  rims: string;
  accent: string;
  lowered?: boolean;
  offroad?: boolean;
};

export const RENDER_STYLES: RenderStyle[] = [
  { id: "satin-black", label: "Satin black", paint: "#2a2a31", paint2: "#141418", rims: "#0c0c0f", accent: "#ff3b2f", lowered: true },
  { id: "gloss-black-rims", label: "Stock paint, black rims", paint: "#c9ccd3", paint2: "#8d929c", rims: "#111114", accent: "#ffb300" },
  { id: "nardo-grey", label: "Nardo grey", paint: "#8a8d91", paint2: "#5e6166", rims: "#1a1a1f", accent: "#19e3c8", lowered: true },
  { id: "signal-red", label: "Signal red", paint: "#ff3b2f", paint2: "#a3160e", rims: "#1a1a1f", accent: "#ffb300", lowered: true },
  { id: "pearl-white-interior", label: "Pearl white, tan interior", paint: "#eceae4", paint2: "#b8b5ad", rims: "#5b5e66", accent: "#ffb300" },
  { id: "army-green-offroad", label: "Army green, lifted", paint: "#4b5a3a", paint2: "#2e3824", rims: "#131316", accent: "#ffb300", offroad: true },
  { id: "sand-offroad", label: "Desert sand, lifted", paint: "#b89a6a", paint2: "#7d6541", rims: "#1a1a1f", accent: "#ffb300", offroad: true },
  { id: "stealth-grey", label: "Stealth grey", paint: "#3d4047", paint2: "#22242a", rims: "#0c0c0f", accent: "#19e3c8", offroad: true },
  { id: "amber-pop", label: "Amber pop", paint: "#ffb300", paint2: "#c27c00", rims: "#111114", accent: "#ff3b2f", lowered: true },
];

const SUVS = /thar|scorpio|fortuner|creta|seltos|xuv|nexon|brezza|jimny|gurkha|hector|safari|harrier|venue|sonet|endeavour|innova|bolero|sierra|kushaq|taigun/i;
const HATCHES = /swift|i10|i20|baleno|polo|alto|wagon|celerio|kwid|tiago|altroz|glanza|jazz|punch|ignis|santro|grand/i;

export function bodyFor(model: string): Body {
  if (SUVS.test(model)) return "suv";
  if (HATCHES.test(model)) return "hatch";
  return "sedan";
}

export const presetSrc = (style: string, body: Body) => `preset:${style}:${body}`;

export function parsePreset(src: string): { style: RenderStyle; body: Body } | null {
  if (!src.startsWith("preset:")) return null;
  const [, styleId, body] = src.split(":");
  const style = RENDER_STYLES.find((s) => s.id === styleId);
  if (!style) return null;
  return { style, body: (["hatch", "sedan", "suv"].includes(body) ? body : "sedan") as Body };
}

/** Sample renders that suit a job: off-road looks for SUVs with suspension work, street looks otherwise. */
export function renderPresetsFor(job: Pick<Job, "model" | "modTypes">) {
  const body = bodyFor(job.model);
  const offroadFirst = body === "suv" && job.modTypes.some((m) => m === "suspension" || m === "bodykit");
  const ordered = [...RENDER_STYLES].sort((a, b) => Number(!!b.offroad === offroadFirst) - Number(!!a.offroad === offroadFirst));
  return ordered.map((s) => ({ ...s, src: presetSrc(s.id, body) }));
}
